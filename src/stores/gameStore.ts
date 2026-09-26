// 游戏状态管理 - Zustand Store

import { create } from 'zustand';
import { TaskTemplate } from '../data/tasks';
import { TOKENS, TokenDef } from '../data/tokens';
import {
  INITIAL_CASH,
  INITIAL_SPIRIT,
  INITIAL_REPUTATION,
  MAX_SPIRIT,
  MAX_REPUTATION,
  RENT_BASE,
  RENT_INCREASE,
  RENT_CYCLE,
  COFFEE_COST,
  COFFEE_SPIRIT_GAIN,
  REST_SPIRIT_GAIN,
  SPIRIT_BURNOUT_REST_DAYS,
  SELL_REPUTATION_PENALTY,
  UNPROFITABLE_TIERS,
  MAX_TASKS_PER_DAY,
  SELL_TAX_TIERS,
} from '../data/constants';
import { ACHIEVEMENTS } from '../data/achievements';
import {
  TWITTER_POST_TEMPLATES,
  TWITTER_TODAY_TIME_LABELS,
  TWITTER_FEED_MAX_LEN,
  TWITTER_REFRESH_MIN,
  TWITTER_REFRESH_MAX,
  TWITTER_INITIAL_COUNT,
} from '../data/twitterPosts';
import { generateDailyPrices, generateInitialPrices, applyEventToPrice } from '../engine/priceEngine';
import { generateDailyTasks, attemptTask } from '../engine/taskEngine';
import { rollDailyEvents } from '../engine/eventEngine';
import { randomChoice, randomInt, randomFloat } from '../utils/random';
import { formatDay, formatMoney } from '../utils/format';
import {
  GPUS,
  GPUInstance,
  GPU_CENTER_UNLOCK_THRESHOLD,
  GPU_RECYCLE_RATE,
} from '../data/gpus';
import {
  generateGpuDailyOutput,
  advanceGpuLifespan,
  calculateWeeklyElectricity,
} from '../engine/gpuEngine';

// Token 保质期（天）
export const TOKEN_SHELF_LIFE = 7;

// 库存批次：每批Token有独立的购入日 / 过期日
export interface TokenBatch {
  tokenId: number;
  count: number;       // M tokens 为单位（咸鱼Cursor为"个"）
  purchaseDay: number; // 购入时的天数
  expiresDay: number;  // 过期天数 = purchaseDay + TOKEN_SHELF_LIFE
  avgPrice: number;    // 买入价（元/M；赠送批次为0）
}

export type PortfolioEventType =
  | 'start'
  | 'day'
  | 'trade'
  | 'income'
  | 'expense'
  | 'rent'
  | 'event'
  | 'retire';

export interface PortfolioHistoryPoint {
  id: number;
  day: number;
  cash: number;
  tokenValue: number;
  totalValue: number;
  nextRentDay: number;
  rentAmount: number;
  eventType: PortfolioEventType;
  label: string;
}

const PORTFOLIO_HISTORY_LIMIT = 64;

function calculatePortfolioTokenValue(inventory: TokenBatch[], prices: number[]): number {
  return inventory.reduce(
    (sum, it) => sum + it.count * (prices[it.tokenId] || 0),
    0
  );
}

/**
 * GPU 折旧资产价值：以回收价（basePrice * GPU_RECYCLE_RATE）为基准按寿命线性折旧。
 * 剩余价值 = basePrice * GPU_RECYCLE_RATE * (lifespan - usedDays) / lifespan。
 * 这样买入即按回收价计入资产，避免“买入瞬间总资产虚高、卖出瞬间巨亏”的错觉。
 * 只计算 active 的 GPU。
 */
export function calculateGpuDepreciationValue(gpus: GPUInstance[]): number {
  return gpus.reduce((sum, gpu) => {
    if (!gpu.active) return sum;
    const def = GPUS[gpu.gpuTierId];
    if (!def) return sum;
    const remainingRatio = (gpu.lifespan - gpu.usedDays) / gpu.lifespan;
    return sum + Math.round(def.basePrice * GPU_RECYCLE_RATE * Math.max(0, remainingRatio));
  }, 0);
}

/**
 * 资产估值取两个市场的最低价格，防止"在便宜商场买入后按贵商场价格瞬间增值"的不合理现象。
 */
export function getValuationPrices(officialPrices: number[], xianYuPrices: number[]): number[] {
  return officialPrices.map((p, i) => Math.min(p, xianYuPrices[i] ?? p));
}

function appendPortfolioHistory(
  history: PortfolioHistoryPoint[],
  snapshot: {
    day: number;
    cash: number;
    inventory: TokenBatch[];
    currentPrices: number[];
    nextRentDay: number;
    rentAmount: number;
    gpus: GPUInstance[];
  },
  eventType: PortfolioEventType,
  label: string
): PortfolioHistoryPoint[] {
  const tokenValue = calculatePortfolioTokenValue(
    snapshot.inventory,
    snapshot.currentPrices
  );
  const gpuValue = calculateGpuDepreciationValue(snapshot.gpus);
  const last = history[history.length - 1];
  const point: PortfolioHistoryPoint = {
    id: (last?.id ?? 0) + 1,
    day: snapshot.day,
    cash: snapshot.cash,
    tokenValue,
    totalValue: snapshot.cash + tokenValue + gpuValue,
    nextRentDay: snapshot.nextRentDay,
    rentAmount: snapshot.rentAmount,
    eventType,
    label,
  };

  const isSameSnapshot =
    last &&
    last.day === point.day &&
    Math.abs(last.cash - point.cash) < 0.01 &&
    Math.abs(last.tokenValue - point.tokenValue) < 0.01 &&
    last.nextRentDay === point.nextRentDay &&
    last.rentAmount === point.rentAmount &&
    last.eventType === point.eventType;

  if (isSameSnapshot) return history;

  return [...history, point].slice(-PORTFOLIO_HISTORY_LIMIT);
}

// 兼容旧名（部分外部模块或类型推断使用）
export type InventoryItem = TokenBatch;

// 获取某 tokenId 的总持有量（跨所有 batch）
export function getTotalTokenCount(inventory: TokenBatch[], tokenId: number): number {
  return inventory
    .filter(b => b.tokenId === tokenId)
    .reduce((sum, b) => sum + b.count, 0);
}

// 获取某 tokenId 的加权平均买入价
export function getAvgBuyPrice(inventory: TokenBatch[], tokenId: number): number {
  const list = inventory.filter(b => b.tokenId === tokenId);
  const totalCount = list.reduce((s, b) => s + b.count, 0);
  if (totalCount <= 0) return 0;
  const totalValue = list.reduce((s, b) => s + b.count * b.avgPrice, 0);
  return totalValue / totalCount;
}

// FIFO 消耗某 tokenId 的指定数量（先消耗最早过期的批次）
// 返回新 inventory（已过滤浮点残留 / count<=0 的批次）
export function consumeTokensFIFO(
  inventory: TokenBatch[],
  tokenId: number,
  amount: number
): TokenBatch[] {
  const batches = inventory.map(b => ({ ...b }));
  const order = batches
    .filter(b => b.tokenId === tokenId)
    .sort((a, b) => a.expiresDay - b.expiresDay || a.purchaseDay - b.purchaseDay);
  let remaining = amount;
  for (const b of order) {
    if (remaining <= 0) break;
    const take = Math.min(b.count, remaining);
    b.count -= take;
    remaining -= take;
  }
  // 过滤浮点残留：咸鱼Cursor 必须是整数个数；其他 Token 余量 < 1e-9 视为已清空
  return batches.filter(b => {
    if (b.tokenId === 6) return b.count >= 1;
    return b.count > 1e-9;
  });
}

/**
 * 按真实涨租机制计算退休后能完整支付几周房租。
 * 第 1 周扣 baseRent，第 2 周扣 baseRent + weeklyIncrease，依此类推。
 * 当现金不足以支付当周租金时停止。
 *
 * @param totalCash      退休时净资产（现金 + Token 折现）
 * @param baseRent       退休那一刻的周租
 * @param weeklyIncrease 每周递增金额（来自 RENT_INCREASE）
 * @returns 完整支付的周数（≥0）
 */
export function computeRetirementWeeks(
  totalCash: number,
  baseRent: number,
  weeklyIncrease: number
): number {
  if (totalCash <= 0 || baseRent <= 0) return 0;
  let weeks = 0;
  let remaining = totalCash;
  let currentRent = baseRent;
  // 安全上限：远超任何合理资产规模，避免极端参数下死循环
  const MAX_WEEKS = 1_000_000;
  while (remaining >= currentRent && weeks < MAX_WEEKS) {
    remaining -= currentRent;
    currentRent += weeklyIncrease;
    weeks += 1;
  }
  return weeks;
}

// Twitter 资讯流条目（一旦生成即固化，不随渲染变化）
export interface TwitterFeedItem {
  id: number;             // 自增唯一 ID（React key）
  templateIndex: number;  // 来源模板索引
  user: string;
  avatar: string;
  text: string;
  tag: string;
  postedDay: number;      // 发布的天数
  todayTimeLabel: string; // 当天发布时显示的相对时间（仅 postedDay === currentDay 时使用）
  likes: number;
  retweets: number;
  comments: number;
  liked: boolean;         // 玩家是否已点赞（限制同一条只能点一次，避免刷精神值）
}

// 创建一个随机洗牌后的 deck（templateIndex 队列）
function createShuffledDeck(): number[] {
  const deck = TWITTER_POST_TEMPLATES.map((_, i) => i);
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

// 生成新一天的 Twitter 刷新：使用 deck shuffle 机制，保证整个模板池循环一轮内不重复。
// deck 不够时自动重新洗牌续上。forceCount 不为空时使用固定数量（首日初始化）。
function refreshTwitterFeed(
  currentFeed: TwitterFeedItem[],
  currentDeck: number[],
  day: number,
  startId: number,
  forceCount?: number
): { feed: TwitterFeedItem[]; nextId: number; deck: number[] } {
  const desiredCount = forceCount ?? randomInt(TWITTER_REFRESH_MIN, TWITTER_REFRESH_MAX);
  const count = Math.min(Math.max(0, desiredCount), TWITTER_POST_TEMPLATES.length);

  // 从 deck 顶部顺序取牌；deck 见底时重新洗牌续上
  let deck = [...currentDeck];
  const picked: number[] = [];
  while (picked.length < count) {
    if (deck.length === 0) {
      deck = createShuffledDeck();
    }
    picked.push(deck.shift() as number);
  }

  // 为同一天的多条推文分配从新到旧的时间标签：
  // 1) 从时间标签池随机抽取 count 个不重复索引，2) 按原池中顶点顺序（从新到旧）排序。
  // 超过池大小的部分（理论上不会发生，池量充足）用最后一个最旧标签补齐。
  const labelPool = TWITTER_TODAY_TIME_LABELS;
  const labelIndices = labelPool.map((_, i) => i);
  for (let i = labelIndices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [labelIndices[i], labelIndices[j]] = [labelIndices[j], labelIndices[i]];
  }
  const pickedLabelIndices = labelIndices.slice(0, Math.min(count, labelPool.length))
    .sort((a, b) => a - b);
  const todayLabels: string[] = [];
  for (let i = 0; i < count; i++) {
    if (i < pickedLabelIndices.length) {
      todayLabels.push(labelPool[pickedLabelIndices[i]]);
    } else {
      todayLabels.push(labelPool[labelPool.length - 1]);
    }
  }

  let nextId = startId;
  const newPosts: TwitterFeedItem[] = picked.map((idx, i) => {
    const tpl = TWITTER_POST_TEMPLATES[idx];
    return {
      id: nextId++,
      templateIndex: idx,
      user: tpl.user,
      avatar: tpl.avatar,
      text: tpl.text,
      tag: tpl.tag,
      postedDay: day,
      todayTimeLabel: todayLabels[i],
      likes: randomInt(0, 998),
      retweets: randomInt(0, 98),
      comments: randomInt(0, 49),
      liked: false,
    };
  });

  // 新推文置于顶部，裁剪 feed 上限
  const merged = [...newPosts, ...currentFeed].slice(0, TWITTER_FEED_MAX_LEN);
  return { feed: merged, nextId, deck };
}

// 生成缺货列表：从 [0,1,2,3,4,5] 中随机选 0-4 个
function generateOutOfStock(): number[] {
  const count = randomInt(0, 4);
  const pool = [0, 1, 2, 3, 4, 5];
  // Fisher-Yates shuffle then take first `count`
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool.slice(0, count);
}

// 基于官方价格生成闲鱼价格（±25%波动）
function generateXianYuPrices(officialPrices: number[]): number[] {
  return officialPrices.map(price => {
    const factor = randomFloat(0.75, 1.25);
    return Math.round(price * factor * 100) / 100;
  });
}

// 金钱里程碑定义
const MONEY_MILESTONES = [
  { threshold: 10000, message: '🎉 恭喜你成为万元户！你在这个Token的时代有了不错的开始！' },
  { threshold: 100000, message: '🎊 十万大关！你已经是这条街最靓的Prompt工程师了！' },
  { threshold: 1000000, message: '💰 百万身家！你开始考虑要不要给房东涨租了...' },
  { threshold: 2000000, message: '🏆 两百万！你的财富已经超过了99%的AI时代打工人。但这能持续多久呢？' },
  { threshold: 5000000, message: '👑 五百万！Token贩子的传说在江湖上流传。有人叫你“coding圈巴菲特”。' },
  { threshold: 10000000, message: '🐉 千万富翁！你已经可以买下整栋公寓了' },
];

// 提前交租奇妙反应
const EARLY_RENT_TIPS = [
  '房东惊喜地看着你：“这个月水电费我包了！”',
  '房东笑得合不拢嘴：“小伙子真靠谱，有什么需要修的随时说！”',
  '房东主动给你换了个新空调：“给你升级一下，别热着了”',
  '房东开始在朋友圈夸你：“我那个租户啊，比我儿子还准时”',
  '房东居然给你送了一箱水果：“别嫌弃，自家种的”',
  '房东把车位让给了你：“你用吧，我反正坐地铁”',
  '房东开始给你介绍对象：“我侄女，大厂的，要不认识一下？”',
  '房东悄悄给你交了三个月水电费：“嘘，别让其他租户知道”',
  '房东年夜饭叫上了你：“一个人过啊年，来我家”',
  '房东看你的眼神越来越温柔：“要不...你就别搬走了？”',
];

// 金钱里程碑对应成就ID的映射
const MONEY_ACHIEVEMENT_MAP: Record<number, string> = {
  10000: 'money_10k',
  100000: 'money_100k',
  1000000: 'money_1m',
  2000000: 'money_2m',
  5000000: 'money_5m',
  10000000: 'money_10m',
};

// 总资产里程碑（基于现金 + Token 估值 + GPU 折旧）
const ASSET_ACHIEVEMENT_THRESHOLDS: { threshold: number; achievementId: string }[] = [
  { threshold: 50_000_000, achievementId: 'money_50m' },
];

// 退休播报数据
export interface RetirementData {
  totalCash: number;     // 退休时总资产
  weeksAlive: number;    // 能存活的周数
  daysAlive: number;     // 能存活的天数
  rentPerWeek: number;   // 周租金
  startDay: number;      // 退休开始的天数
}

// 游戏状态接口
interface GameState {
  // 阶段
  phase: 'start' | 'playing' | 'retiring' | 'gameover';

  // 核心属性
  cash: number;
  spirit: number;
  reputation: number;
  day: number;

  // 库存（多批次，7天保质期）
  inventory: TokenBatch[];
  portfolioHistory: PortfolioHistoryPoint[];

  // 市场
  currentSiteId: number;
  currentPrices: number[];       // 7种Token当日价格（GitHub商城官方价格）
  previousPrices: number[];      // 前一天官方价格（用于计算当日涨幅）
  xianYuPrices: number[];        // 闲鱼市场专属价格（基于官方价格±25%波动）

  // 缺货
  githubOutOfStock: number[];    // GitHub商城缺货的tokenId数组
  xianYuOutOfStock: number[];    // 闲鱼缺货的tokenId数组

  // 需求 - 两个平台各自维护独立的需求池
  availableTasks: {
    niuke: TaskTemplate[];   // 牛客网：低信誉零活（rep 0-45）
    boss: TaskTemplate[];    // BOSS直聘：高信誉高端项目（rep 80-95）
  };
  tasksCompletedToday: number;   // 每日已完成任务数（全局，不分平台）
  maxTasksPerDay: number;        // 每日最大可接任务数

  // 事件
  pendingMessages: string[];

  // 房租
  nextRentDay: number;   // 下次交租日
  rentAmount: number;    // 当前房租金额
  rentOverdueDays: number; // 房租已逾期天数（宽限期计数）

  // 提前交租连续计数
  consecutiveEarlyRents: number;
  maxConsecutiveEarlyRents: number;
  earlyRentTipsUnlocked: number;

  // 精神值休息
  restDaysLeft: number;  // 强制休息剩余天数

  // 咖啡每日限制
  coffeeUsedToday: boolean;
  
  // 知乎当日标记
  zhihuUsedToday: boolean;
  
  // 连续喝咖啡天数
  consecutiveCoffeeDays: number;
  
  // 连续写知乎天数
  consecutiveZhihuDays: number;
  
  // 手动完成项目总数
  manualTasksCompleted: number;
  
  // 是否曾经倒卖过Token
  hasEverSoldToken: boolean;

  // 首次使用Token接单保护（必定成功，仅一次）
  firstTokenTaskProtection: boolean;

  // 当日买入过的 tokenId 集合（用于限制"当日买入品种当天只能卖一次"，反套利）
  todayBoughtIds: number[];
  // 当日买入品种中已经被卖出过一次的 tokenId 集合
  todayResoldOnce: number[];
  // 当日每笔买入记录（用于跨市场套利识别：tokenId、买入市场、买入价格）
  todayBuyTrades: { tokenId: number; site: number; price: number }[];
  // 本局累计跨市场套利次数（用于“财富密码”成就）
  arbitrageCount: number;
  // 本局是否已提示过“恭喜发现套利逻辑”（跟随 startNewGame 重置，游戏存档周期内只提一次）
  arbitrageTipShown: boolean;

  // 金钱里程碑记录
  moneyMilestonesReached: number[];

  // 成就系统
  unlockedAchievements: string[];
  // 成就解锁天数映射：id -> day（用于结局页按时间线展示成就）
  achievementUnlockDays: Record<string, number>;

  // 模型不赚钱提示记录（按份存储：每个模型已提示的亏本档位数）
  modelUnprofitableNotified: number[];

  // 人生报告统计（跨局不保留，每局重置）
  totalTasksCompleted: number;       // 累计完成项目数（AI + 手动）
  totalCoffeeDrunk: number;          // 累计喝咖啡次数
  totalBlogsWritten: number;         // 累计写博客次数
  tokenUsageCount: number[];         // 每个 tokenId 被消耗在项目上的次数
  totalSellCount: number;            // 累计倒卖 Token 次数
  bestEarningDay: { day: number; amount: number };  // 赚钱最多的一天
  todayEarnings: number;             // 当日累计收入（advanceDay 重置）
  inflationLossTotal: number;        // 累计被通胀蚕食的购买力（按现金折算）

  // Twitter 资讯流（每天追加 2-5 条，同一天内内容固定）
  twitterFeed: TwitterFeedItem[];
  twitterNextId: number;
  // 模板牌堆：记录本轮还未出现过的 templateIndex，保证一轮内不重复
  twitterDeck: number[];

  // 交易税：总资产首次跨入第 0 档后为 true（兼容字段，实际由 sellTaxTierReached 驱动）
  tradingTaxActivated: boolean;

  // 卖出税阶梯：玩家历史总资产峰值（单调递增） + 已跨入的最高档 index
  // sellTaxTierReached = -1 表示未触发任何档（0~4 对应 SELL_TAX_TIERS 中的 5 个档）
  peakTotalAssets: number;
  sellTaxTierReached: number;

  // 游戏结束原因（主动退休/破产/房租赶出等）
  gameOverReason: string | null;

  // 退休播报数据（仅在 phase === 'retiring' 时有值）
  retirementData: RetirementData | null;

  // GPU算力中心
  gpuUnlocked: boolean;
  gpuHintShown: boolean;    // 怵50万时显示神秘场所预告
  gpus: GPUInstance[];
  gpuNextId: number;
  gpuUnlockDay: number;
  showGpuHintModal: boolean;
  showGpuUnlockModal: boolean;

  // 量子计算机原型机：全世界仅有一台，售出即不可再购（即使卖回收价也不能再买）
  quantumComputerSold: boolean;

  // GPU通胀：现金超过6000万后触发，GPU价格每天涨25%
  gpuInflationActivated: boolean;
  gpuInflationStartDay: number;

  // 房租最后期限警告弹窗
  showRentDeadlineModal: boolean;

  // 强制清算弹窗（资产变卖抵租后必须确认）
  showForcedLiquidationModal: boolean;

  // 交易税首次激活强制确认弹窗
  showTradingTaxModal: boolean;

  // “电费比房租贵”提示是否已首次推送（全局只推一次）
  electricityOverRentTipShown: boolean;

  // 累计已交房租总额（用于退休结算播报）
  totalRentPaid: number;

  // Actions
  startNewGame: () => void;
  navigateToSite: (siteId: number) => void;
  advanceDay: () => void;
  // buyToken / sellToken 返回 boolean：true=成功（UI 可播音效），false=被拦截
  buyToken: (tokenId: number, count: number) => boolean;
  sellToken: (tokenId: number, count: number) => boolean;
  acceptTask: (task: TaskTemplate, useTokenId: number | 'manual') => void;
  drinkCoffee: () => void;
  payRent: () => void;
  writeBlog: () => void;
  retire: () => void;
  finishRetirement: () => void;
  dismissMessage: () => void;
  unlockAchievement: (id: string) => void;
  checkMoneyMilestones: (cash: number) => void;
  checkTradingTax: () => void;
  likeTwitterPost: (id: number) => void;
  // GPU 相关
  buyGpu: (gpuTierId: number) => boolean;
  configureGpuOutput: (gpuInstanceId: number, tokenId: number) => void;
  sellGpu: (gpuInstanceId: number) => void;
  dismissGpuHintModal: () => void;
  dismissGpuUnlockModal: () => void;
  dismissRentDeadlineModal: () => void;
  dismissForcedLiquidationModal: () => void;
  dismissTradingTaxModal: () => void;
}

// 创建Store
export const useGameStore = create<GameState>((set, get) => ({
  // 初始状态
  phase: 'start',
  cash: INITIAL_CASH,
  spirit: INITIAL_SPIRIT,
  reputation: INITIAL_REPUTATION,
  day: 1,
  inventory: [],
  portfolioHistory: [],
  currentSiteId: 0,
  currentPrices: generateInitialPrices(),
  previousPrices: generateInitialPrices(),
  xianYuPrices: generateXianYuPrices(generateInitialPrices()),
  githubOutOfStock: generateOutOfStock(),
  xianYuOutOfStock: generateOutOfStock(),
  availableTasks: { niuke: [], boss: [] },
  tasksCompletedToday: 0,
  maxTasksPerDay: MAX_TASKS_PER_DAY,
  pendingMessages: [],
  nextRentDay: RENT_CYCLE,
  rentAmount: RENT_BASE,
  rentOverdueDays: 0,
  consecutiveEarlyRents: 0,
  maxConsecutiveEarlyRents: 0,
  earlyRentTipsUnlocked: 0,
  restDaysLeft: 0,
  coffeeUsedToday: false,
  zhihuUsedToday: false,
  consecutiveCoffeeDays: 0,
  consecutiveZhihuDays: 0,
  manualTasksCompleted: 0,
  hasEverSoldToken: false,
  firstTokenTaskProtection: true,
  todayBoughtIds: [],
  todayResoldOnce: [],
  todayBuyTrades: [],
  arbitrageCount: 0,
  arbitrageTipShown: false,
  moneyMilestonesReached: [],
  unlockedAchievements: [],
  achievementUnlockDays: {},
  modelUnprofitableNotified: Array(TOKENS.length).fill(0),
  totalTasksCompleted: 0,
  totalCoffeeDrunk: 0,
  totalBlogsWritten: 0,
  tokenUsageCount: Array(TOKENS.length).fill(0),
  totalSellCount: 0,
  bestEarningDay: { day: 0, amount: 0 },
  todayEarnings: 0,
  inflationLossTotal: 0,
  twitterFeed: [],
  twitterNextId: 1,
  twitterDeck: [],
  tradingTaxActivated: false,
  peakTotalAssets: 0,
  sellTaxTierReached: -1,
  gameOverReason: null,
  retirementData: null,
  gpuUnlocked: false,
  gpuHintShown: false,
  gpus: [],
  gpuNextId: 0,
  gpuUnlockDay: 0,
  showGpuHintModal: false,
  showGpuUnlockModal: false,
  quantumComputerSold: false,
  gpuInflationActivated: false,
  gpuInflationStartDay: 0,
  showRentDeadlineModal: false,
  showForcedLiquidationModal: false,
  showTradingTaxModal: false,
  electricityOverRentTipShown: false,
  totalRentPaid: 0,

  // 开始新游戏
  startNewGame: () => {
    // 初始化第1天的可接需求：两个平台各自生成独立的需求列表
    const initialNiuke = generateDailyTasks(1, 'niuke');
    const initialBoss = generateDailyTasks(1, 'boss');

    // 初始化第1天的 Twitter 资讯流（首日固定 10 条，从空 deck 启动会自动洗牌）
    const initialTwitter = refreshTwitterFeed([], [], 1, 1, TWITTER_INITIAL_COUNT);

    const initPrices = generateInitialPrices();
    const initXianYuPrices = generateXianYuPrices(initPrices);
    set({
      phase: 'playing',
      cash: INITIAL_CASH,
      spirit: INITIAL_SPIRIT,
      reputation: INITIAL_REPUTATION,
      day: 1,
      inventory: [],
      portfolioHistory: appendPortfolioHistory(
        [],
        {
          day: 1,
          cash: INITIAL_CASH,
          inventory: [],
          currentPrices: getValuationPrices(initPrices, initXianYuPrices),
          nextRentDay: RENT_CYCLE,
          rentAmount: RENT_BASE,
          gpus: [],
        },
        'start',
        '开局'
      ),
      currentSiteId: 0,
      currentPrices: initPrices,
      previousPrices: initPrices,
      xianYuPrices: initXianYuPrices,
      githubOutOfStock: generateOutOfStock(),
      xianYuOutOfStock: generateOutOfStock(),
      availableTasks: { niuke: initialNiuke, boss: initialBoss },
      tasksCompletedToday: 0,
      maxTasksPerDay: MAX_TASKS_PER_DAY,
      pendingMessages: ['欢迎来到Vibe Coding的世界。你是一名依赖AI写代码的程序员，账户里只有5000块。Token价格每天都在涨，房租每周要交。祝你好运。'],
      nextRentDay: RENT_CYCLE,
      rentAmount: RENT_BASE,
      rentOverdueDays: 0,
      consecutiveEarlyRents: 0,
      maxConsecutiveEarlyRents: 0,
      earlyRentTipsUnlocked: 0,
      restDaysLeft: 0,
      coffeeUsedToday: false,
      zhihuUsedToday: false,
      consecutiveCoffeeDays: 0,
      consecutiveZhihuDays: 0,
      manualTasksCompleted: 0,
      hasEverSoldToken: false,
      firstTokenTaskProtection: true,
      todayBoughtIds: [],
      todayResoldOnce: [],
      todayBuyTrades: [],
      arbitrageCount: 0,
      arbitrageTipShown: false,
      moneyMilestonesReached: [],
      unlockedAchievements: [],
      achievementUnlockDays: {},
      modelUnprofitableNotified: Array(TOKENS.length).fill(0),
      totalTasksCompleted: 0,
      totalCoffeeDrunk: 0,
      totalBlogsWritten: 0,
      tokenUsageCount: Array(TOKENS.length).fill(0),
      totalSellCount: 0,
      bestEarningDay: { day: 0, amount: 0 },
      todayEarnings: 0,
      inflationLossTotal: 0,
      twitterFeed: initialTwitter.feed,
      twitterNextId: initialTwitter.nextId,
      twitterDeck: initialTwitter.deck,
      tradingTaxActivated: false,
      peakTotalAssets: 0,
      sellTaxTierReached: -1,
      gameOverReason: null,
      retirementData: null,
      gpuUnlocked: false,
      gpuHintShown: false,
      gpus: [],
      gpuNextId: 0,
      gpuUnlockDay: 0,
      showGpuUnlockModal: false,
      quantumComputerSold: false,
      gpuInflationActivated: false,
      gpuInflationStartDay: 0,
      showRentDeadlineModal: false,
      showForcedLiquidationModal: false,
      showTradingTaxModal: false,
      electricityOverRentTipShown: false,
      totalRentPaid: 0,
    });
  },

  // 导航到网站（只切换场所，不推进天数）
  navigateToSite: (siteId: number) => {
    const state = get();

    // 如果正在强制休息，不允许导航
    if (state.restDaysLeft > 0) {
      return;
    }

    // 切换场所只更新当前网站，不刷新价格（同一天内价格恒定）
    set({
      currentSiteId: siteId,
    });
  },

  // 进入下一天（手动推进）
  advanceDay: () => {
    const state = get();

    // 如果正在强制休息
    if (state.restDaysLeft > 0) {
      const newRestDays = state.restDaysLeft - 1;
      const spiritGain = REST_SPIRIT_GAIN;
      const newSpirit = Math.min(MAX_SPIRIT, state.spirit + spiritGain);
      const newDay = state.day + 1;

      // 更新价格（即使休息也在涨价）
      const newPrices = generateDailyPrices(newDay, state.currentPrices);
      const newXianYuPrices = generateXianYuPrices(newPrices);

      const messages = [...state.pendingMessages];
      if (newRestDays === 0) {
        messages.push('你终于从精神崩溃中恢复了...虽然世界没有等你。');
      } else {
        messages.push(`你躺在床上动不了...还需要休息${newRestDays}天。精神+${spiritGain}`);
      }

      // 刷新 Twitter 资讯流（即使在休息，世界仍在转动）
      const twitterRefresh = refreshTwitterFeed(state.twitterFeed, state.twitterDeck, newDay, state.twitterNextId);

      // 人生报告：通胀蚕食 + 当日最佳收入快照（即使休息，市场仍在涨）
      const oldAvgPrice = state.currentPrices.reduce((s, p) => s + p, 0) / Math.max(1, state.currentPrices.length);
      const newAvgPrice = newPrices.reduce((s, p) => s + p, 0) / Math.max(1, newPrices.length);
      const inflationRate = oldAvgPrice > 0 ? Math.max(0, newAvgPrice / oldAvgPrice - 1) : 0;
      const dailyInflationLoss = Math.max(0, state.cash) * inflationRate;
      const newBestEarningDay = state.todayEarnings > state.bestEarningDay.amount
        ? { day: state.day, amount: state.todayEarnings }
        : state.bestEarningDay;

      set({
        day: newDay,
        spirit: newSpirit,
        restDaysLeft: newRestDays,
        currentPrices: newPrices,
        previousPrices: state.currentPrices,
        xianYuPrices: newXianYuPrices,
        githubOutOfStock: generateOutOfStock(),
        xianYuOutOfStock: generateOutOfStock(),
        pendingMessages: messages,
        coffeeUsedToday: false,
        zhihuUsedToday: false,
        consecutiveCoffeeDays: 0,
        consecutiveZhihuDays: 0,
        todayBoughtIds: [],
        todayResoldOnce: [],
        todayBuyTrades: [],
        portfolioHistory: appendPortfolioHistory(
          state.portfolioHistory,
          {
            day: newDay,
            cash: state.cash,
            inventory: state.inventory,
            currentPrices: getValuationPrices(newPrices, newXianYuPrices),
            nextRentDay: state.nextRentDay,
            rentAmount: state.rentAmount,
            gpus: state.gpus,
          },
          'day',
          newRestDays === 0 ? '休息结束' : '强制休息'
        ),
        twitterFeed: twitterRefresh.feed,
        twitterNextId: twitterRefresh.nextId,
        twitterDeck: twitterRefresh.deck,
        bestEarningDay: newBestEarningDay,
        todayEarnings: 0,
        inflationLossTotal: state.inflationLossTotal + dailyInflationLoss,
      });
      return;
    }

    // 1. day++
    const newDay = state.day + 1;

    // 2. 计算通胀，更新价格
    let newPrices = generateDailyPrices(newDay, state.currentPrices);

    // 3. 掷骰随机事件（50%概率触发）
    const shouldRollEvents = Math.random() > 0.5;
    const events = shouldRollEvents ? rollDailyEvents() : [];
    const messages: string[] = [...state.pendingMessages];
    let cashChange = 0;
    let spiritChange = 0;
    let reputationChange = 0;
    const inventoryCopy = [...state.inventory.map(item => ({ ...item }))];

    for (const event of events) {
      messages.push(`📢 ${event.message}`);

      switch (event.type) {
        case 'price_up':
        case 'price_down':
          newPrices = applyEventToPrice(newPrices, event);
          break;
        case 'gift_token': {
          const tokenId = event.tokenId ?? 0;
          const amount = event.amount ?? 0;
          if (amount > 0) {
            // 赠送Token也会进入保质期体系，当天（newDay）为购入日
            inventoryCopy.push({
              tokenId,
              count: amount,
              purchaseDay: newDay,
              expiresDay: newDay + TOKEN_SHELF_LIFE,
              avgPrice: 0,
            });
          }
          break;
        }
        case 'lose_token': {
          const loseTokenId = event.tokenId;
          const loseAmount = event.amount ?? 0;
          if (loseAmount > 0) {
            if (loseTokenId !== undefined) {
              const consumed = consumeTokensFIFO(inventoryCopy, loseTokenId, loseAmount);
              inventoryCopy.length = 0;
              inventoryCopy.push(...consumed);
            } else {
              // 随机损失：从非空 tokenId 中随机选一个
              const tokenIds = Array.from(new Set(inventoryCopy.filter(b => b.count > 0).map(b => b.tokenId)));
              if (tokenIds.length > 0) {
                const targetTokenId = randomChoice(tokenIds);
                const consumed = consumeTokensFIFO(inventoryCopy, targetTokenId, loseAmount);
                inventoryCopy.length = 0;
                inventoryCopy.push(...consumed);
              }
            }
          }
          break;
        }
        case 'lose_cash':
          cashChange -= (event.amount ?? 0);
          break;
        case 'spirit_change':
          spiritChange += (event.amount ?? 0);
          break;
        case 'reputation_change':
          reputationChange += (event.amount ?? 0);
          break;
      }
    }

    // 3.5 人生报告：通胀蚕食 + 当日最佳收入快照（基于事件应用后的最终价格）
    const oldAvgPrice2 = state.currentPrices.reduce((s, p) => s + p, 0) / Math.max(1, state.currentPrices.length);
    const newAvgPrice2 = newPrices.reduce((s, p) => s + p, 0) / Math.max(1, newPrices.length);
    const inflationRate2 = oldAvgPrice2 > 0 ? Math.max(0, newAvgPrice2 / oldAvgPrice2 - 1) : 0;
    const dailyInflationLoss2 = Math.max(0, state.cash) * inflationRate2;
    const newBestEarningDay2 = state.todayEarnings > state.bestEarningDay.amount
      ? { day: state.day, amount: state.todayEarnings }
      : state.bestEarningDay;

    // 3.6 通胀系数：以 Claude Opus 12.0(tokenId=0) 为基准（GPU 售价固定，仅电费随通胀上涨）
    const inflationRatio = TOKENS[0].basePrice > 0 ? newPrices[0] / TOKENS[0].basePrice : 1;

    // 3.7 GPU 产出Token（在 Token 保质期清理之前生成，用当前价格累加totalOutput）
    const { batches: gpuOutputBatches, updatedGpus: gpusAfterOutput } = generateGpuDailyOutput(
      state.gpus,
      newDay,
      newPrices
    );
    if (gpuOutputBatches.length > 0) {
      inventoryCopy.push(...gpuOutputBatches);
    }

    // 3.8 推进 GPU 寿命
    let { active: newGpus, scrapped: scrappedGpus } = advanceGpuLifespan(gpusAfterOutput);
    if (scrappedGpus.length > 0) {
      for (const sg of scrappedGpus) {
        const sgDef = GPUS[sg.gpuTierId];
        const electricityCost = sgDef.dailyElectricity * sg.usedDays;
        const totalOutput = Math.round(sg.totalOutput);
        const netProfit = Math.round(sg.totalOutput - sg.purchasePrice - electricityCost);
        messages.push(
          `⚠️ ${sgDef.name} 已报废（使用${sg.usedDays}天）。通过该GPU累计产出价值 ¥${totalOutput.toLocaleString()}，净利润 ¥${netProfit.toLocaleString()}`
        );
      }
    }

    // 4. 计算新的现金
    let newCash = state.cash + cashChange;

    // 4.5 清理过期Token（以 newDay 进行清算）
    // 仅当 batch.count 真正有数量时才计入过期提示，避免 0M / 浮点残值的误报
    const expiredBatches = inventoryCopy.filter(b => {
      if (newDay < b.expiresDay) return false;
      if (b.tokenId === 6) return b.count >= 1; // 咸鱼Cursor为整数个数
      return b.count >= 0.05; // M tokens 显示精度为 0.1M
    });
    if (expiredBatches.length > 0) {
      const expiredMap = new Map<number, number>();
      for (const b of expiredBatches) {
        expiredMap.set(b.tokenId, (expiredMap.get(b.tokenId) || 0) + b.count);
      }
      const expiredInfo = Array.from(expiredMap.entries())
        .map(([tid, cnt]) => {
          const isXy = tid === 6;
          return `${TOKENS[tid].name} ${isXy ? `${cnt}个` : `${cnt.toFixed(1)}M`}`;
        })
        .join('、');
      messages.push(`⚠️ Token保质期到期，以下库存已清空：${expiredInfo}`);
    }
    {
      const validBatches = inventoryCopy.filter(b => newDay < b.expiresDay && b.count > 0);
      inventoryCopy.length = 0;
      inventoryCopy.push(...validBatches);
    }

    // 5. 检查房租日期 - 自动扣款 / 宽限期 / 房租 GameOver
    let newRentDay = state.nextRentDay;
    let newRentAmount = state.rentAmount;
    let newRentOverdueDays = state.rentOverdueDays;
    let rentGameOver = false;
    let newConsecutiveEarlyRents = state.consecutiveEarlyRents;
    let rentJustPaid = 0;
    const weeklyElectricity = calculateWeeklyElectricity(newGpus, inflationRatio);
    const totalRentCost = state.rentAmount + weeklyElectricity;
    if (newDay >= state.nextRentDay) {
      if (newCash >= totalRentCost) {
        // 自动扣款（到期才交，不算提前）
        newCash -= totalRentCost;
        rentJustPaid = state.rentAmount;
        messages.push(`🏠 房租¥${state.rentAmount}已自动扣除。`);
        if (weeklyElectricity > 0) {
          messages.push(`🔌 电费 ¥${weeklyElectricity.toLocaleString()} 已随房租扣除`);
        }
        if (weeklyElectricity > state.rentAmount && !state.electricityOverRentTipShown) {
          messages.push('怎么这个月电费比房租都贵啊...');
          set({ electricityOverRentTipShown: true });
        }
        newRentDay = state.nextRentDay + RENT_CYCLE;
        newRentAmount = state.rentAmount + RENT_INCREASE;
        newRentOverdueDays = 0;
        // 到期自动扣款重置连续提前计数
        newConsecutiveEarlyRents = 0;
      } else {
        // 现金不足，进入宽限期
        newRentOverdueDays += 1;
        if (newRentOverdueDays > 2) {
          // === 强制清算逻辑：尝试变卖所有资产抵租 ===
          const valuationPricesForRent = getValuationPrices(newPrices, generateXianYuPrices(newPrices));

          // 1. Token 估值（咸鱼Cursor不可卖，直接丢弃）
          let tokenGrossValue = 0;
          for (const batch of inventoryCopy) {
            if (batch.tokenId === 6) continue;
            const price = valuationPricesForRent[batch.tokenId] || 0;
            tokenGrossValue += batch.count * price;
          }
          // 应用阶梯交易税
          const forceTaxRate = state.sellTaxTierReached >= 0
            ? 1 - SELL_TAX_TIERS[state.sellTaxTierReached].multiplier
            : 0;
          const tokenTax = tokenGrossValue * forceTaxRate;
          const tokenNetValue = tokenGrossValue - tokenTax;

          // 2. GPU 回收价值
          const gpuRecycleValue = calculateGpuDepreciationValue(newGpus);

          // 3. 清算后总现金
          const liquidatedCash = newCash + tokenNetValue + gpuRecycleValue;

          if (liquidatedCash >= totalRentCost) {
            // 清算后够交租 → 强制变卖并继续游戏
            newCash = liquidatedCash - totalRentCost;
            rentJustPaid = state.rentAmount;
            inventoryCopy.length = 0;
            newGpus = [];
            newRentDay = state.nextRentDay + RENT_CYCLE;
            newRentAmount = state.rentAmount + RENT_INCREASE;
            newRentOverdueDays = 0;
            newConsecutiveEarlyRents = 0;
            messages.push(`💀 现金流断裂！你被迫变卖了所有资产来交房租。`);
            set({ showForcedLiquidationModal: true });
          } else {
            // 清算后仍不够 → 真正 Game Over
            rentGameOver = true;
          }
        } else {
          const remaining = 2 - newRentOverdueDays + 1;
          messages.push(`⚠️ 现金不足以支付房租 ¥${state.rentAmount}！宽限期还剩 ${remaining} 天，再不交钱房东就要换锁了`);
          // 进入最后一天（明天将 game over），强制弹窗警告
          if (newRentOverdueDays === 2) {
            set({ showRentDeadlineModal: true });
          }
        }
      }
    }

    // 6. 计算新的精神值和信誉值
    let newSpirit = Math.max(0, Math.min(MAX_SPIRIT, state.spirit + spiritChange));
    const newReputation = Math.max(0, Math.min(MAX_REPUTATION, state.reputation + reputationChange));

    // 7. 检查精神值归零 -> 强制休息
    let newRestDays = 0;
    if (newSpirit <= 0) {
      newSpirit = 0;
      newRestDays = SPIRIT_BURNOUT_REST_DAYS;
      messages.push('💀 你的精神值归零了！身体强制关机，需要休息3天...');
    }

    // 8. 检查模型是否跨过亏本阈值（按信誉档位分级提示）
    const notifiedCopy = [...state.modelUnprofitableNotified];
    for (let i = 0; i < TOKENS.length; i++) {
      while (
        notifiedCopy[i] < UNPROFITABLE_TIERS.length &&
        newPrices[i] > UNPROFITABLE_TIERS[notifiedCopy[i]].threshold
      ) {
        const tier = UNPROFITABLE_TIERS[notifiedCopy[i]];
        messages.push(tier.message.replace('{model}', TOKENS[i].name));
        notifiedCopy[i] += 1;
      }
    }

    // 8.5 预计算新闲鱼价格（用于估值和 state 更新）
    const newXianYuPrices = generateXianYuPrices(newPrices);

    // 9. 检查房租宽限期超时 -> Game Over
    if (rentGameOver) {
      set({
        phase: 'gameover',
        day: newDay,
        cash: newCash,
        spirit: newSpirit,
        reputation: newReputation,
        currentPrices: newPrices,
        inventory: inventoryCopy.filter(i => i.count > 0),
        gpus: newGpus,
        portfolioHistory: appendPortfolioHistory(
          state.portfolioHistory,
          {
            day: newDay,
            cash: newCash,
            inventory: inventoryCopy.filter(i => i.count > 0),
            currentPrices: getValuationPrices(newPrices, newXianYuPrices),
            nextRentDay: newRentDay,
            rentAmount: newRentAmount,
            gpus: newGpus,
          },
          'rent',
          '房租逾期'
        ),
        pendingMessages: [...messages, `🔑 你已经欠了 ¥${state.rentAmount} 房租超过宽限期，房东换了锁，你被赶出了北京...`],
        bestEarningDay: newBestEarningDay2,
        todayEarnings: 0,
        inflationLossTotal: state.inflationLossTotal + dailyInflationLoss2,
      });
      return;
    }

    // 10. 检查是否破产（game over条件）
    if (newCash < 0 && inventoryCopy.every(i => i.count <= 0)) {
      set({
        phase: 'gameover',
        day: newDay,
        cash: newCash,
        spirit: newSpirit,
        reputation: newReputation,
        currentPrices: newPrices,
        inventory: inventoryCopy.filter(i => i.count > 0),
        gpus: newGpus,
        portfolioHistory: appendPortfolioHistory(
          state.portfolioHistory,
          {
            day: newDay,
            cash: newCash,
            inventory: inventoryCopy.filter(i => i.count > 0),
            currentPrices: getValuationPrices(newPrices, newXianYuPrices),
            nextRentDay: newRentDay,
            rentAmount: newRentAmount,
            gpus: newGpus,
          },
          'event',
          '破产'
        ),
        pendingMessages: [...messages, '💸 你破产了...连一杯咖啡都买不起了。'],
        bestEarningDay: newBestEarningDay2,
        todayEarnings: 0,
        inflationLossTotal: state.inflationLossTotal + dailyInflationLoss2,
      });
      return;
    }

    // 11. 检查连续喝咖啡/写知乎计数
    let newConsecutiveCoffeeDays = state.consecutiveCoffeeDays;
    let newConsecutiveZhihuDays = state.consecutiveZhihuDays;
    if (state.coffeeUsedToday) {
      newConsecutiveCoffeeDays += 1;
    } else {
      newConsecutiveCoffeeDays = 0;
    }
    if (state.zhihuUsedToday) {
      newConsecutiveZhihuDays += 1;
    } else {
      newConsecutiveZhihuDays = 0;
    }

    // 12. 重置每日任务完成计数，重新为两个平台各自生成新需求
    const newNiukeTasks = generateDailyTasks(newDay, 'niuke');
    const newBossTasks = generateDailyTasks(newDay, 'boss');

    // 13. 刷新 Twitter 资讯流（追加 2-5 条新推文）
    const twitterRefresh = refreshTwitterFeed(state.twitterFeed, state.twitterDeck, newDay, state.twitterNextId);
    const finalInventory = inventoryCopy.filter(i => i.count > 0);

    // 14. GPU 中心解锁检查（总资产 ≥ 200万，含GPU折旧价值）
    let gpuUnlocked = state.gpuUnlocked;
    let gpuHintShown = state.gpuHintShown;
    let gpuUnlockDay = state.gpuUnlockDay;
    if (!gpuUnlocked) {
      const valPrices = getValuationPrices(newPrices, newXianYuPrices);
      const tokenValue = finalInventory.reduce(
        (s, b) => s + b.count * (valPrices[b.tokenId] || 0),
        0
      );
      const gpuValue = calculateGpuDepreciationValue(newGpus);
      const totalAssets = newCash + tokenValue + gpuValue;
      // 50万预告
      if (!gpuHintShown && totalAssets >= 500_000) {
        gpuHintShown = true;
        set({ showGpuHintModal: true });
      }
      // 200万解锁
      if (totalAssets >= GPU_CENTER_UNLOCK_THRESHOLD) {
        gpuUnlocked = true;
        gpuUnlockDay = newDay;
        messages.push('🎉 你的资产达到了200万！神秘场所已解锁：「GPU算力中心」（在早期请谨慎投资，token价格过低时购买gpu可能导致亏损）');
        set({ showGpuUnlockModal: true });
      }
    }

    set({
      day: newDay,
      cash: newCash,
      spirit: newSpirit,
      reputation: newReputation,
      currentPrices: newPrices,
      previousPrices: state.currentPrices,
      xianYuPrices: newXianYuPrices,
      githubOutOfStock: generateOutOfStock(),
      xianYuOutOfStock: generateOutOfStock(),
      inventory: finalInventory,
      availableTasks: { niuke: newNiukeTasks, boss: newBossTasks },
      tasksCompletedToday: 0,
      pendingMessages: messages,
      nextRentDay: newRentDay,
      rentAmount: newRentAmount,
      rentOverdueDays: newRentOverdueDays,
      consecutiveEarlyRents: newConsecutiveEarlyRents,
      totalRentPaid: state.totalRentPaid + rentJustPaid,
      restDaysLeft: newRestDays,
      coffeeUsedToday: false,
      zhihuUsedToday: false,
      consecutiveCoffeeDays: newConsecutiveCoffeeDays,
      consecutiveZhihuDays: newConsecutiveZhihuDays,
      modelUnprofitableNotified: notifiedCopy,
      todayBoughtIds: [],
      todayResoldOnce: [],
      todayBuyTrades: [],
      gpus: newGpus,
      gpuUnlocked,
      gpuHintShown,
      gpuUnlockDay,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: newDay,
          cash: newCash,
          inventory: finalInventory,
          currentPrices: getValuationPrices(newPrices, newXianYuPrices),
          nextRentDay: newRentDay,
          rentAmount: newRentAmount,
          gpus: newGpus,
        },
        'day',
        events.length > 0 ? '进入下一天·事件' : '进入下一天'
      ),
      twitterFeed: twitterRefresh.feed,
      twitterNextId: twitterRefresh.nextId,
      twitterDeck: twitterRefresh.deck,
      bestEarningDay: newBestEarningDay2,
      todayEarnings: 0,
      inflationLossTotal: state.inflationLossTotal + dailyInflationLoss2,
    });

    // 检查连续喝咖啡成就
    if (newConsecutiveCoffeeDays >= 5) {
      get().unlockAchievement('coffee_5days');
    }
    // 检查连续写知乎成就
    if (newConsecutiveZhihuDays >= 10) {
      get().unlockAchievement('zhihu_10days');
    }
    // 检查Token大户成就（事件可能赠送token）
    const inventoryAfterAdvance = get().inventory;
    if (TOKENS.some(t => getTotalTokenCount(inventoryAfterAdvance, t.id) >= 10000)) {
      get().unlockAchievement('token_10b');
    }

    // 检查交易税（token 价格上涨可能跳发阈值）
    get().checkTradingTax();
  },

  // 购买Token
  buyToken: (tokenId: number, count: number) => {
    const state = get();

    // 信誉为 0 时，没人愿意把 Token 卖给你
    if (state.reputation <= 0) {
      set({
        pendingMessages: [
          ...state.pendingMessages,
          '⚠️ 信誉值为 0，没人愿意把 Token 卖给你了…先去知乎写博客洗白吧。',
        ],
      });
      return false;
    }

    // 根据当前市场选择价格
    const prices = state.currentSiteId === 1 ? state.xianYuPrices : state.currentPrices;
    const pricePerUnit = prices[tokenId];
    const totalCost = pricePerUnit * count;

    if (state.cash < totalCost) return false; // 钱不够
    if (count <= 0) return false;

    const inventoryCopy = state.inventory.map(b => ({ ...b }));

    // 合并同一天购入的同种 Token（同 expiresDay），以避免批次碎片化
    const sameDayBatch = inventoryCopy.find(
      b => b.tokenId === tokenId && b.purchaseDay === state.day
    );
    if (sameDayBatch) {
      const totalValue = sameDayBatch.avgPrice * sameDayBatch.count + totalCost;
      sameDayBatch.count += count;
      sameDayBatch.avgPrice = totalValue / sameDayBatch.count;
    } else {
      inventoryCopy.push({
        tokenId,
        count,
        purchaseDay: state.day,
        expiresDay: state.day + TOKEN_SHELF_LIFE,
        avgPrice: pricePerUnit,
      });
    }

    // 标记当日买过该 tokenId（反套利：当日买过的品种当天只能卖一次）
    const newTodayBought = state.todayBoughtIds.includes(tokenId)
      ? state.todayBoughtIds
      : [...state.todayBoughtIds, tokenId];

    // 记录这笔买入（用于跨市场套利识别）
    const newTrades = [
      ...state.todayBuyTrades,
      { tokenId, site: state.currentSiteId, price: pricePerUnit },
    ];

    set({
      cash: state.cash - totalCost,
      inventory: inventoryCopy,
      todayBoughtIds: newTodayBought,
      todayBuyTrades: newTrades,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: state.cash - totalCost,
          inventory: inventoryCopy,
          currentPrices: getValuationPrices(state.currentPrices, state.xianYuPrices),
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: state.gpus,
        },
        'trade',
        `买入${TOKENS[tokenId].name}`
      ),
    });

    // 检查Token大户成就
    if (TOKENS.some(t => getTotalTokenCount(inventoryCopy, t.id) >= 10000)) {
      get().unlockAchievement('token_10b');
    }

    return true;
  },

  // 卖出Token
  sellToken: (tokenId: number, count: number) => {
    const state = get();
  
    // 咸鱼Cursor账号不可卖出
    if (tokenId === 6) {
      set({
        pendingMessages: [...state.pendingMessages, '⚠️ 咸鱼Cursor账号不支持转卖'],
      });
      return false;
    }
  
    // 反套利：当日买过该品种 且 已经卖出过一次 → 拒绝
    if (
      state.todayBoughtIds.includes(tokenId) &&
      state.todayResoldOnce.includes(tokenId)
    ) {
      set({
        pendingMessages: [
          ...state.pendingMessages,
          `「${TOKENS[tokenId].name}」今天已经卖过一次了~（当日买入的品种当天只可出售一次）`,
        ],
      });
      return false;
    }
  
    if (count <= 0) return false;
    const totalHeld = getTotalTokenCount(state.inventory, tokenId);
    if (totalHeld < count) return false; // 库存不足
  
    // 检查是否会消耗到临期Token（FIFO先消耗最早过期的）
    // 新剩余天数计算 = expiresDay - day - 1；“临期”指新显示下 ≤1 天
    const earliestBatch = state.inventory
      .filter(b => b.tokenId === tokenId)
      .sort((a, b) => a.expiresDay - b.expiresDay)[0];
    const sellsExpiring = !!(earliestBatch && earliestBatch.expiresDay - state.day - 1 <= 1);
  
    // FIFO 消耗最早过期的批次
    const newInventory = consumeTokensFIFO(state.inventory, tokenId, count);
  
    // 根据当前市场选择价格
    const prices = state.currentSiteId === 1 ? state.xianYuPrices : state.currentPrices;
    const pricePerUnit = prices[tokenId];
    const totalIncome = pricePerUnit * count;
  
    // 信誉惩罚（倒卖Token）
    // 基础倒卖：-3；大量抛售：每 1000M (1B) 多扣 5 点；临期 Token：额外 -3
    const bulkPenalty = Math.floor(count / 1000) * 5;
    let repPenalty = SELL_REPUTATION_PENALTY - bulkPenalty;
    if (sellsExpiring) {
      repPenalty -= 3; // 卖出临期Token额外扣信誉
    }
  
    const newReputation = Math.max(0, Math.min(MAX_REPUTATION, state.reputation + repPenalty));
    const messages = [...state.pendingMessages];
    
    // 首次倒卖Token提示
    const isFirstSell = !state.hasEverSoldToken;
    if (isFirstSell) {
      messages.push('你开始走上了倒卖Token的道路... 不知这对与错，但你知道你必须活下去。（倒卖Token会降低信誉值）');
    }
    
    if (bulkPenalty > 0) {
      messages.push(`⚠️ 你大量抛售了 ${Math.round(count)}M ${TOKENS[tokenId].name}，业内风评受损...信誉-${bulkPenalty}（每 1B 额外扣 5 点）`);
    }
  
    if (sellsExpiring) {
      messages.push('把只剩一天保质期的Token卖出，这种事你也干得出来？？（额外扣除 3 点信誉）');
    }

    // 交易税：总资产达阈后卖出被扣 阶梯税（随峰值单调递增）
    const taxRate = state.sellTaxTierReached >= 0
      ? 1 - SELL_TAX_TIERS[state.sellTaxTierReached].multiplier
      : 0;
    const taxPct = state.sellTaxTierReached >= 0
      ? SELL_TAX_TIERS[state.sellTaxTierReached].taxPct
      : 0;
    const taxAmount = totalIncome * taxRate;
    const netIncome = totalIncome - taxAmount;
    if (taxAmount > 0) {
      messages.push(`💸 缴纳交易税 ${taxPct}%：-${formatMoney(taxAmount)}，到手${formatMoney(netIncome)}`);
    }

    const newCash = state.cash + netIncome;

    // 跨市场套利识别：当日有“在另一市场买入同 tokenId 且买入价 < 当前卖出价”的记录
    // 仅“低买高卖”方向触发；从高价市场买、低价市场卖不算套利
    const arbitrageTrade = state.todayBuyTrades.find(
      t =>
        t.tokenId === tokenId &&
        t.site !== state.currentSiteId &&
        t.price < pricePerUnit
    );
    const isArbitrage = !!arbitrageTrade;
    let newArbitrageCount = state.arbitrageCount;
    let newArbitrageTipShown = state.arbitrageTipShown;
    if (isArbitrage) {
      newArbitrageCount += 1;
      // 首次套利提醒：本局只提一次（随 startNewGame 重置）
      // 跨市场周期：玩家点“再来一局” / 清浏览器存档 / 换浏览器 / 隐私窗口 都是新周期，可重新触发
      if (!state.arbitrageTipShown) {
        messages.push('💡 恭喜你发现了套利逻辑~');
        newArbitrageTipShown = true;
      }
    }
  
    // 如果是当日买过的品种→标记为“当日已卖过一次”，后续拒绝同品种再卖
    const newResoldOnce =
      state.todayBoughtIds.includes(tokenId) && !state.todayResoldOnce.includes(tokenId)
        ? [...state.todayResoldOnce, tokenId]
        : state.todayResoldOnce;
    
    set({
      cash: newCash,
      inventory: newInventory,
      reputation: newReputation,
      hasEverSoldToken: true,
      pendingMessages: messages,
      todayResoldOnce: newResoldOnce,
      arbitrageCount: newArbitrageCount,
      arbitrageTipShown: newArbitrageTipShown,
      totalSellCount: state.totalSellCount + 1,
      todayEarnings: state.todayEarnings + Math.max(0, netIncome),
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: newCash,
          inventory: newInventory,
          currentPrices: getValuationPrices(state.currentPrices, state.xianYuPrices),
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: state.gpus,
        },
        'trade',
        `卖出${TOKENS[tokenId].name}`
      ),
    });
  
    // 解锁“第一次倒卖”成就
    if (isFirstSell) {
      get().unlockAchievement('first_sell');
    }
    // 解锁“大善人”成就
    if (sellsExpiring) {
      get().unlockAchievement('sell_expiring');
    }
    // 检查金钱里程碑
    get().checkMoneyMilestones(newCash);

    // 检查是否首次跳发交易税
    get().checkTradingTax();

    // “财富密码”：本局累计 5 次跨市场套利后解锁
    if (isArbitrage && newArbitrageCount >= 5) {
      get().unlockAchievement('arbitrage_5');
    }
  
    return true;
  },

  // 接需求
  acceptTask: (task: TaskTemplate, useTokenId: number | 'manual') => {
    const state = get();

    // 检查每日任务数限制
    if (state.tasksCompletedToday >= state.maxTasksPerDay) {
      set({
        pendingMessages: [...state.pendingMessages, '😫 今天已经做了3个项目了，该休息了。进入下一天刷新需求吧。'],
      });
      return;
    }

    if (useTokenId === 'manual') {
      // 手动写代码：消耗精神值，必定成功但很累
      const newSpirit = Math.max(0, state.spirit - task.spiritCostIfManual);
      const messages = [...state.pendingMessages];
      messages.push(`✍️ 你花了一整天手写了“${task.name}”...精神值-${task.spiritCostIfManual}，获得¥${task.reward}`);
    
      const newCash = state.cash + task.reward;
      const newManualTasks = state.manualTasksCompleted + 1;
      set({
        cash: newCash,
        spirit: newSpirit,
        reputation: Math.min(MAX_REPUTATION, state.reputation + 3),
        tasksCompletedToday: state.tasksCompletedToday + 1,
        manualTasksCompleted: newManualTasks,
        totalTasksCompleted: state.totalTasksCompleted + 1,
        todayEarnings: state.todayEarnings + task.reward,
        availableTasks: {
          niuke: state.availableTasks.niuke.filter(t => t.id !== task.id),
          boss: state.availableTasks.boss.filter(t => t.id !== task.id),
        },
        pendingMessages: messages,
        portfolioHistory: appendPortfolioHistory(
          state.portfolioHistory,
          {
            day: state.day,
            cash: newCash,
            inventory: state.inventory,
            currentPrices: state.currentPrices,
            nextRentDay: state.nextRentDay,
            rentAmount: state.rentAmount,
            gpus: state.gpus,
          },
          'income',
          '手写项目'
        ),
      });
      get().checkMoneyMilestones(newCash);
      // 检查手动完成项目成就
      if (newManualTasks >= 3) {
        get().unlockAchievement('manual_3');
      }
      return;
    }

    // 使用AI Token完成需求
    const tokenDef: TokenDef = TOKENS[useTokenId];
    const totalHeld = getTotalTokenCount(state.inventory, useTokenId);

    // 咸鱼Cursor账号特殊处理：按个数消耗
    const isXianyu = useTokenId === 6;
    const requiredCount = isXianyu
      ? Math.ceil(task.tokenCost / (tokenDef.equivalentTokens || 100))
      : task.tokenCost;

    if (totalHeld < requiredCount) return; // Token不足

    // FIFO 消耗最早过期的批次
    const newInventory = consumeTokensFIFO(state.inventory, useTokenId, requiredCount);

    // 抽卡判定（首次使用Token接单隐性保底：必定成功）
    let result = attemptTask(task, tokenDef);
    if (!result.success && state.firstTokenTaskProtection) {
      result = {
        success: true,
        quality: 'normal',
        reward: task.reward,
        reputationChange: 3,
        message: `需求"${task.name}"顺利完成，钱到账了。`,
      };
    }
    const messages = [...state.pendingMessages, result.message];
    const newReputation = Math.max(0, Math.min(MAX_REPUTATION, state.reputation + result.reputationChange));

    const newCash = state.cash + result.reward;
    const newTokenUsageCount = [...state.tokenUsageCount];
    newTokenUsageCount[useTokenId] = (newTokenUsageCount[useTokenId] || 0) + 1;
    set({
      cash: newCash,
      reputation: newReputation,
      inventory: newInventory,
      tasksCompletedToday: state.tasksCompletedToday + 1,
      availableTasks: {
        niuke: state.availableTasks.niuke.filter(t => t.id !== task.id),
        boss: state.availableTasks.boss.filter(t => t.id !== task.id),
      },
      pendingMessages: messages,
      totalTasksCompleted: state.totalTasksCompleted + 1,
      tokenUsageCount: newTokenUsageCount,
      todayEarnings: state.todayEarnings + Math.max(0, result.reward),
      // 首次使用Token接单后消耗保护
      firstTokenTaskProtection: false,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: newCash,
          inventory: newInventory,
          currentPrices: state.currentPrices,
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: state.gpus,
        },
        'income',
        result.reward > 0 ? '完成需求' : '需求失败'
      ),
    });
    if (result.reward > 0) {
      get().checkMoneyMilestones(newCash);
    }
    get().checkTradingTax();
  },

  // 喝咖啡
  drinkCoffee: () => {
    const state = get();
    if (state.coffeeUsedToday) {
      set({
        pendingMessages: [...state.pendingMessages, '今天已经喝过一杯了，再喝要心悸了...'],
      });
      return;
    }
    if (state.cash < COFFEE_COST) return; // 买不起

    const newSpirit = Math.min(MAX_SPIRIT, state.spirit + COFFEE_SPIRIT_GAIN);
    const messages = [...state.pendingMessages];
    messages.push(`☕ 你喝了一杯星巴克，精神值+${COFFEE_SPIRIT_GAIN}。钱包-¥${COFFEE_COST}`);

    set({
      cash: state.cash - COFFEE_COST,
      spirit: newSpirit,
      coffeeUsedToday: true,
      totalCoffeeDrunk: state.totalCoffeeDrunk + 1,
      pendingMessages: messages,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: state.cash - COFFEE_COST,
          inventory: state.inventory,
          currentPrices: state.currentPrices,
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: state.gpus,
        },
        'expense',
        '喝咖啡'
      ),
    });
  },

  // 交房租
  payRent: () => {
    const state = get();

    // 计算电费（与 RentDialog/advanceDay 保持一致）
    const inflationRatio = TOKENS[0].basePrice > 0
      ? (state.currentPrices[0] || 0) / TOKENS[0].basePrice
      : 1;
    const weeklyElectricity = calculateWeeklyElectricity(state.gpus, inflationRatio);
    const totalCost = state.rentAmount + weeklyElectricity;

    // 防御性检查：现金不足以支付房租+电费时直接拒绝执行
    if (state.cash < totalCost) return;

    const isEarly = state.day < state.nextRentDay; // 还没到期就交了

    // 防御性检查：有活跃GPU产生电费时，禁止提前交租（电费按实际天数计算）
    const hasActiveGpu = state.gpus.some(
      (g) => g.active && g.usedDays < g.lifespan
    );
    if (isEarly && (hasActiveGpu || weeklyElectricity > 0)) {
      set({
        pendingMessages: [
          ...state.pendingMessages,
          '⚡ 有GPU运行时无法提前交租（电费按实际天数计算），等到期日自动扣除即可。',
        ],
      });
      return;
    }

    const messages = [...state.pendingMessages];
    let newConsecutive = state.consecutiveEarlyRents;
    let newEarlyTipsUnlocked = state.earlyRentTipsUnlocked;
    let newMaxConsecutive = state.maxConsecutiveEarlyRents;
    const newUnlockedAchievements = [...state.unlockedAchievements];
    const newAchievementDays = { ...state.achievementUnlockDays };

    if (isEarly) {
      newConsecutive += 1;
      if (newConsecutive > newMaxConsecutive) {
        newMaxConsecutive = newConsecutive;
      }
      messages.push(`🏠 房租已提前缴纳：¥${state.rentAmount}。下次交租日：${formatDay(state.nextRentDay + RENT_CYCLE)}`);
      // 检查是否解锁新的提前交租提示
      if (newConsecutive > newEarlyTipsUnlocked && newEarlyTipsUnlocked < EARLY_RENT_TIPS.length) {
        messages.push(`🏠 ${EARLY_RENT_TIPS[newEarlyTipsUnlocked]}`);
        newEarlyTipsUnlocked = newConsecutive;
        if (newEarlyTipsUnlocked > EARLY_RENT_TIPS.length) {
          newEarlyTipsUnlocked = EARLY_RENT_TIPS.length;
        }
      }
      // 检查连续10次提前交租成就
      if (newConsecutive >= 10 && !newUnlockedAchievements.includes('early_rent_10')) {
        newUnlockedAchievements.push('early_rent_10');
        newAchievementDays['early_rent_10'] = state.day;
        messages.push('🏅 成就解锁：富婆快乐球 - 连续10次提前交房租！');
      }
    } else {
      // 到期交或逾期交，重置连续计数
      newConsecutive = 0;
      messages.push(`🏠 房租已缴：¥${state.rentAmount}。下次交租日：${formatDay(state.nextRentDay + RENT_CYCLE)}`);
    }

    // 同步播报电费扣款（与 advanceDay 自动扣款行为保持一致）
    if (weeklyElectricity > 0) {
      messages.push(`🔌 电费 ¥${weeklyElectricity.toLocaleString()} 已随房租扣除`);
      if (weeklyElectricity > state.rentAmount && !state.electricityOverRentTipShown) {
        messages.push('怎么这个月电费比房租都贵啊...');
        set({ electricityOverRentTipShown: true });
      }
    }

    const newCashAfterRent = state.cash - totalCost;

    set({
      cash: newCashAfterRent,
      nextRentDay: state.nextRentDay + RENT_CYCLE,
      rentAmount: state.rentAmount + RENT_INCREASE,
      rentOverdueDays: 0,
      consecutiveEarlyRents: newConsecutive,
      maxConsecutiveEarlyRents: newMaxConsecutive,
      earlyRentTipsUnlocked: newEarlyTipsUnlocked,
      unlockedAchievements: newUnlockedAchievements,
      achievementUnlockDays: newAchievementDays,
      pendingMessages: messages,
      totalRentPaid: state.totalRentPaid + state.rentAmount,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: newCashAfterRent,
          inventory: state.inventory,
          currentPrices: state.currentPrices,
          nextRentDay: state.nextRentDay + RENT_CYCLE,
          rentAmount: state.rentAmount + RENT_INCREASE,
          gpus: state.gpus,
        },
        'rent',
        isEarly ? '提前交租' : '缴房租'
      ),
    });
  },

  // 写知乎博客
  writeBlog: () => {
    const state = get();
    const repGain = randomInt(8, 12);
    const messages = [...state.pendingMessages];
    const blogTopics = [
      '《为什么我放弃了xxx框架》',
      '《2025年前端框架终极对比》',
      '《从入门到放弃：AI编程的真相》',
      '《月入3万的Vibe Coder是怎么工作的》',
      '《程序员35岁之后的出路》',
    ];
    const topic = randomChoice(blogTopics);
    messages.push(`✍️ 你花了一天写了篇${topic}，收获了${randomInt(100, 500)}个赞，信誉+${repGain}`);
    const newReputation = Math.min(MAX_REPUTATION, state.reputation + repGain);

    // 写博客消耗1天（自动调用advanceDay的逻辑）
    set({
      reputation: newReputation,
      zhihuUsedToday: true,
      totalBlogsWritten: state.totalBlogsWritten + 1,
      pendingMessages: messages,
    });

    // 推进一天
    get().advanceDay();
  },

  // 一键退休：按市场行为清算所有资产
  // - Token：按估值价（两市场最低价）折现 + 应用当前阶梯卖出税（与 sellToken 一致），不扣信誉
  // - 咸鱼Cursor (tokenId === 6)：与 sellToken 一致，不可转卖，不计入清算
  // - GPU：按回收价（basePrice × GPU_RECYCLE_RATE × 剩余寿命比例，等同 sellGpu）
  retire: () => {
    const state = get();

    // 1. Token 折现 → 应用当前阶梯交易税
    const valuationPrices = getValuationPrices(state.currentPrices, state.xianYuPrices);
    let tokenGrossValue = 0;
    for (const batch of state.inventory) {
      if (batch.tokenId === 6) continue; // 咸鱼Cursor不可卖出
      const price = valuationPrices[batch.tokenId] || 0;
      tokenGrossValue += batch.count * price;
    }
    const sellTaxRate = state.sellTaxTierReached >= 0
      ? 1 - SELL_TAX_TIERS[state.sellTaxTierReached].multiplier
      : 0;
    const sellTaxPct = state.sellTaxTierReached >= 0
      ? SELL_TAX_TIERS[state.sellTaxTierReached].taxPct
      : 0;
    const tokenTax = tokenGrossValue * sellTaxRate;
    const tokenValue = tokenGrossValue - tokenTax;

    // 1.5 GPU 按回收价折现
    const gpuValue = calculateGpuDepreciationValue(state.gpus);

    // 2. 总资产 = 现金 + Token 税后 + GPU 回收
    const totalCash = state.cash + tokenValue + gpuValue;

    // 3. 按周扣房租，模拟能坚持多少周/多少天
    // 考虑距下次交租的剩余天数（提前交租会让这个值更大）
    // 同时按 RENT_INCREASE 真实模拟每周涨租
    const rent = state.rentAmount;
    const daysUntilFirstRent = Math.max(0, state.nextRentDay - state.day);
    const weeksAlive = computeRetirementWeeks(totalCash, rent, RENT_INCREASE);
    const daysAlive = daysUntilFirstRent + weeksAlive * RENT_CYCLE;

    // 4. 进入退休播报阶段（不立即结算 day / phase=gameover）
    const taxNote = tokenTax > 0
      ? `（Token 卖出税 ${sellTaxPct}%，扣除 ¥${Math.round(tokenTax).toLocaleString()}）`
      : '';
    const totalSurvivalDays = state.day + daysAlive;
    const _years = Math.floor(totalSurvivalDays / 360);
    const _months = Math.floor((totalSurvivalDays % 360) / 30);
    const _days = totalSurvivalDays % 30;
    let survivalParts: string[] = [];
    if (_years > 0) survivalParts.push(`${_years}年`);
    if (_months > 0) survivalParts.push(`${_months}月`);
    if (_days > 0 || survivalParts.length === 0) survivalParts.push(`${_days}天`);
    const survivalLabel = survivalParts.join('');
    const reason = `你选择了退休。变卖了所有资产${taxNote}，带着¥${totalCash.toLocaleString()}的积蓄躺平了。你坚持了${survivalLabel}`;

    set({
      cash: 0,
      inventory: [],
      gpus: [], // GPU 已全部回收变现
      phase: 'retiring',
      gameOverReason: reason,
      retirementData: {
        totalCash,
        weeksAlive,
        daysAlive,
        rentPerWeek: rent,
        startDay: state.day,
      },
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: totalCash,
          inventory: [],
          currentPrices: valuationPrices,
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: [],
        },
        'retire',
        '一键退休'
      ),
      pendingMessages: [
        ...state.pendingMessages,
        `🏖️ 你按下了退休按钮。带着¥${totalCash.toLocaleString()}坚持了${survivalLabel}。`,
        ...(tokenTax > 0
          ? [`💸 退休清算扣除 Token 卖出税 ${sellTaxPct}%：-¥${Math.round(tokenTax).toLocaleString()}`]
          : []),
      ],
    });
  },

  // 退休播报结束 → 进入正式 Game Over 画面
  finishRetirement: () => {
    const state = get();
    const rd = state.retirementData;
    const finalDay = rd ? state.day + rd.daysAlive : state.day;
    set({
      day: finalDay,
      phase: 'gameover',
    });
  },

  // 关闭消息
  dismissMessage: () => {
    const state = get();
    if (state.pendingMessages.length > 0) {
      set({ pendingMessages: state.pendingMessages.slice(1) });
    }
  },

  // 解锁成就
  unlockAchievement: (id: string) => {
    const state = get();
    if (state.unlockedAchievements.includes(id)) return;
    const achievement = ACHIEVEMENTS.find(a => a.id === id);
    if (!achievement) return;
    const messages = [...state.pendingMessages];
    messages.push(`🏅 成就解锁：${achievement.icon} ${achievement.name} — ${achievement.description}`);
    set({
      unlockedAchievements: [...state.unlockedAchievements, id],
      achievementUnlockDays: { ...state.achievementUnlockDays, [id]: state.day },
      pendingMessages: messages,
    });
  },

  // 检查金钱里程碑
  checkMoneyMilestones: (cash: number) => {
    const state = get();
    const newMilestones = [...state.moneyMilestonesReached];
    const messages = [...state.pendingMessages];
    const newAchievements = [...state.unlockedAchievements];
    const newAchievementDays = { ...state.achievementUnlockDays };
    let changed = false;

    for (const milestone of MONEY_MILESTONES) {
      if (cash >= milestone.threshold && !newMilestones.includes(milestone.threshold)) {
        newMilestones.push(milestone.threshold);
        messages.push(milestone.message);
        changed = true;
        // 解锁对应成就
        const achievementId = MONEY_ACHIEVEMENT_MAP[milestone.threshold];
        if (achievementId && !newAchievements.includes(achievementId)) {
          newAchievements.push(achievementId);
          newAchievementDays[achievementId] = state.day;
          const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
          if (achievement) {
            messages.push(`🏅 成就解锁：${achievement.icon} ${achievement.name}`);
          }
        }
      }
    }

    // 总资产里程碑检查（现金 + Token 估值 + GPU 折旧）
    const valuationPrices = getValuationPrices(state.currentPrices, state.xianYuPrices);
    const tokenValueForAssets = state.inventory.reduce(
      (s, b) => s + b.count * (valuationPrices[b.tokenId] || 0),
      0
    );
    const gpuValueForAssets = calculateGpuDepreciationValue(state.gpus);
    const totalAssets = cash + tokenValueForAssets + gpuValueForAssets;
    for (const item of ASSET_ACHIEVEMENT_THRESHOLDS) {
      if (totalAssets >= item.threshold && !newMilestones.includes(item.threshold)) {
        newMilestones.push(item.threshold);
        changed = true;
        if (!newAchievements.includes(item.achievementId)) {
          newAchievements.push(item.achievementId);
          newAchievementDays[item.achievementId] = state.day;
          const achievement = ACHIEVEMENTS.find(a => a.id === item.achievementId);
          if (achievement) {
            messages.push(`🏅 成就解锁：${achievement.icon} ${achievement.name} — ${achievement.description}`);
          }
        }
      }
    }

    if (changed) {
      set({
        moneyMilestonesReached: newMilestones,
        unlockedAchievements: newAchievements,
        achievementUnlockDays: newAchievementDays,
        pendingMessages: messages,
      });
    }

    // GPU通胀触发：现金超过6000万开始GPU急速涨价
    if (!state.gpuInflationActivated && cash >= 60_000_000) {
      const gpuMessages = changed ? [] : [...state.pendingMessages];
      gpuMessages.push('🚨 紧急公告：全球GPU服务器供不应求，从今天开始GPU价格将急速上涨！算力已成为新时代的“石油”。');
      set({
        gpuInflationActivated: true,
        gpuInflationStartDay: state.day,
        pendingMessages: changed ? [...get().pendingMessages, ...gpuMessages] : gpuMessages,
      });
    }
  },

  // 检查交易税阶梯：总资产（现金 + Token 估值 + GPU折旧价值）峰值跨入新一档时触发醒目弹窗 + 推送
  // 峰值单调递增、不可回退；一次可以跨多档（例如事件暴拉资产）但只弹一次最高档的弹窗
  checkTradingTax: () => {
    const state = get();
    const valuationPrices = getValuationPrices(state.currentPrices, state.xianYuPrices);
    const tokenValue = state.inventory.reduce(
      (s, b) => s + b.count * (valuationPrices[b.tokenId] || 0),
      0
    );
    const gpuValue = calculateGpuDepreciationValue(state.gpus);
    const totalAssets = state.cash + tokenValue + gpuValue;

    // 峰值单调递增
    const newPeak = Math.max(state.peakTotalAssets, totalAssets);

    // 跳检阶梯：连续跨入多档时，都推一条提示，弹窗只为最高档弹一次
    let newTier = state.sellTaxTierReached;
    const newMessages = [...state.pendingMessages];
    let triggered = false;
    while (
      newTier + 1 < SELL_TAX_TIERS.length &&
      newPeak >= SELL_TAX_TIERS[newTier + 1].threshold
    ) {
      newTier += 1;
      newMessages.push(SELL_TAX_TIERS[newTier].headlineMessage);
      triggered = true;
    }

    // 无任何变化时提前返回，避免不必要 set
    if (newPeak === state.peakTotalAssets && !triggered) return;

    set({
      peakTotalAssets: newPeak,
      sellTaxTierReached: newTier,
      // 兼容：只要跨入第 0 档及以上，tradingTaxActivated 为 true（SellDialog/TokenMarket 还在读取该字段）
      tradingTaxActivated: newTier >= 0,
      // 跨入新档才拉弹窗；同一档反复检查不重复拉
      showTradingTaxModal: triggered ? true : state.showTradingTaxModal,
      pendingMessages: newMessages,
    });
  },

  // 给推文点赞：同一条只能点一次，点赞后 likes+1，并有 10% 概率获得共鸣（精神+1）
  likeTwitterPost: (id: number) => {
    const state = get();
    const target = state.twitterFeed.find(p => p.id === id);
    if (!target || target.liked) return;

    const updatedFeed = state.twitterFeed.map(p =>
      p.id === id ? { ...p, liked: true, likes: p.likes + 1 } : p
    );

    // 10% 概率触发共鸣（精神+1，受 MAX_SPIRIT 上限限制）
    if (Math.random() < 0.1 && state.spirit < MAX_SPIRIT) {
      set({
        twitterFeed: updatedFeed,
        spirit: Math.min(MAX_SPIRIT, state.spirit + 1),
        pendingMessages: [...state.pendingMessages, '💖 你在刷帖中找到了共鸣（精神+1）'],
      });
    } else {
      set({ twitterFeed: updatedFeed });
    }
  },

  // 购买 GPU
  buyGpu: (gpuTierId: number) => {
    const state = get();
    const gpuDef = GPUS[gpuTierId];
    if (!gpuDef) return false;
    // 最多同时拥有3台GPU
    const activeGpuCount = state.gpus.filter(g => g.active).length;
    if (activeGpuCount >= 3) return false;
    // 量子计算机原型机：全世界仅有一台，已售出后不可再次购买
    if (gpuTierId === 3 && state.quantumComputerSold) return false;
    // GPU 价格：基础价 × 通胀倍率（现金超过6000万后每天涨25%）
    const gpuInflationMult = state.gpuInflationActivated
      ? Math.pow(1.25, Math.max(0, state.day - state.gpuInflationStartDay))
      : 1;
    const currentPrice = Math.round(gpuDef.basePrice * gpuInflationMult);
    if (state.cash < currentPrice) return false;

    const newGpu: GPUInstance = {
      id: state.gpuNextId,
      gpuTierId,
      purchaseDay: state.day,
      purchasePrice: currentPrice,
      lifespan: gpuDef.lifespan,
      usedDays: 0,
      selectedTokenId: 0, // 默认产出 Claude Opus 12.0，避免买回来空转
      active: true,
      totalOutput: 0,
    };

    const newCash = state.cash - currentPrice;
    const newGpus = [...state.gpus, newGpu];
    const isFirst = state.gpus.length === 0;

    set({
      cash: newCash,
      gpus: newGpus,
      gpuNextId: state.gpuNextId + 1,
      // 量子计算机一旦购买，永久标记为已售出（即使后续卖回收价也不可再购）
      quantumComputerSold: gpuTierId === 3 ? true : state.quantumComputerSold,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: newCash,
          inventory: state.inventory,
          currentPrices: getValuationPrices(state.currentPrices, state.xianYuPrices),
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: newGpus,
        },
        'expense',
        `购买GPU: ${gpuDef.name}`
      ),
    });

    // 首次购买解锁成就“老黄的信徒”
    if (isFirst) {
      get().unlockAchievement('gpu_first_buy');
    }
    // 购买量子计算机原型机解锁成就“遇事不决，量子力学”
    if (gpuTierId === 3) {
      get().unlockAchievement('quantum_computer');
    }
    return true;
  },

  // 配置 GPU 产出 Token（0-5 有效）6(咸鱼)不可选
  configureGpuOutput: (gpuInstanceId: number, tokenId: number) => {
    const state = get();
    if (tokenId < 0 || tokenId > 5) return;
    set({
      gpus: state.gpus.map(g =>
        g.id === gpuInstanceId ? { ...g, selectedTokenId: tokenId } : g
      ),
    });
  },

  // 关闭GPU解锁弹窗
  dismissGpuUnlockModal: () => {
    set({ showGpuUnlockModal: false });
  },

  // 关闭GPU预告弹窗
  dismissGpuHintModal: () => {
    set({ showGpuHintModal: false });
  },

  // 关闭房租最后期限警告弹窗
  dismissRentDeadlineModal: () => {
    set({ showRentDeadlineModal: false });
  },

  // 关闭强制清算弹窗
  dismissForcedLiquidationModal: () => {
    set({ showForcedLiquidationModal: false });
  },

  // 关闭交易税弹窗
  dismissTradingTaxModal: () => {
    set({ showTradingTaxModal: false });
  },

  // 出售 GPU：回收价 = 当前售价 * 回收率 * 剩余寿命比例
  sellGpu: (gpuInstanceId: number) => {
    const state = get();
    const gpu = state.gpus.find(g => g.id === gpuInstanceId);
    if (!gpu) return;

    const gpuDef = GPUS[gpu.gpuTierId];
    const remainingRatio = (gpu.lifespan - gpu.usedDays) / gpu.lifespan;
    // GPU 售价固定，回收价基于 basePrice
    const recyclePrice = Math.round(
      gpuDef.basePrice * GPU_RECYCLE_RATE * remainingRatio
    );

    const newCash = state.cash + recyclePrice;
    const newGpus = state.gpus.filter(g => g.id !== gpuInstanceId);

    // 收益提示：净利润 = 累计产出 + 回收价 - 购买价 - 已交电费
    const electricityCost = gpuDef.dailyElectricity * gpu.usedDays;
    const netProfit = Math.round(
      gpu.totalOutput + recyclePrice - gpu.purchasePrice - electricityCost
    );
    const messages = [
      ...state.pendingMessages,
      `♻️ 出售 ${gpuDef.name}（已使用${gpu.usedDays}天），回收 ¥${recyclePrice.toLocaleString()}。净利润 ¥${netProfit.toLocaleString()}`,
    ];

    set({
      cash: newCash,
      gpus: newGpus,
      pendingMessages: messages,
      portfolioHistory: appendPortfolioHistory(
        state.portfolioHistory,
        {
          day: state.day,
          cash: newCash,
          inventory: state.inventory,
          currentPrices: getValuationPrices(state.currentPrices, state.xianYuPrices),
          nextRentDay: state.nextRentDay,
          rentAmount: state.rentAmount,
          gpus: newGpus,
        },
        'income',
        `出售GPU: ${gpuDef.name}`
      ),
    });
  },
}));
