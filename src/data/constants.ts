// 游戏核心参数常量

export const INITIAL_CASH = 4994000;           // 初始现金
export const INITIAL_SPIRIT = 100;          // 初始精神值
export const INITIAL_REPUTATION = 50;       // 初始信誉值（改为50）
export const MAX_SPIRIT = 100;              // 精神值上限
export const MAX_REPUTATION = 100;          // 信誉值上限
export const RENT_BASE = 2000;              // 每周房租
export const RENT_INCREASE = 10;             // 每周房租递增金额（元）
export const RENT_CYCLE = 7;               // 7天一个周期
export const SELL_REPUTATION_PENALTY = -3;  // 倒卖token信誉惩罚
export const BULK_SELL_THRESHOLD = 30;      // 大量卖出阈值（M tokens 或咸鱼个数）
export const BULK_SELL_PENALTY = -8;        // 大量卖出额外惩罚
export const COFFEE_COST = 68;             // 咖啡价格
export const COFFEE_SPIRIT_GAIN = 10;       // 咖啡恢复精神
export const REST_SPIRIT_GAIN = 5;          // 休息恢复精神
export const SPIRIT_BURNOUT_REST_DAYS = 3;  // 精神值归零强制休息天数
export const LOW_REPUTATION_THRESHOLD = 20; // 低于此值无法接需求

// 经济平衡参数（保留作为中位参考值；各任务的实际单价已按信誉等级硬编码到 tasks.ts）
export const REWARD_PER_M = 150;

// 模型亏本提示分级阈值（从 tasks.ts 自动推导，与任务单价保持同步）
// 当模型当前价格首次超过某档阈值时，会按顺序触发对应的提示
import { TASK_TEMPLATES } from './tasks';

function buildUnprofitableTiers(): { threshold: number; message: string }[] {
  // 难度顺序与中文标签（与 TaskBoard.tsx 中的 DIFF_LABEL 保持一致）
  const ORDERED_DIFFS: { key: 'easy' | 'medium' | 'hard' | 'hell'; label: string }[] = [
    { key: 'easy',   label: '简单' },
    { key: 'medium', label: '中等' },
    { key: 'hard',   label: '进阶' },
    { key: 'hell',   label: '专家' },
  ];

  // 1. 按难度分组聚合：取该档最低单价作为亏本阈值，同时记录单价/信誉范围
  const tiers = ORDERED_DIFFS.map(({ label }, i) => {
    const tasks = TASK_TEMPLATES.filter((t) => t.difficulty === ORDERED_DIFFS[i].key);
    if (tasks.length === 0) return null;
    const units = tasks.map((t) => Math.round(t.reward / t.tokenCost / 10) * 10);
    const reps = tasks.map((t) => t.reputationRequired);
    const minUnit = Math.min(...units);
    const maxUnit = Math.max(...units);
    return {
      label,
      threshold: minUnit,
      priceLabel: minUnit === maxUnit ? `${minUnit}` : `${minUnit}-${maxUnit}`,
      repLabel:
        Math.min(...reps) === Math.max(...reps)
          ? `${Math.min(...reps)}`
          : `${Math.min(...reps)}-${Math.max(...reps)}`,
    };
  }).filter(Boolean) as {
    label: string;
    threshold: number;
    priceLabel: string;
    repLabel: string;
  }[];

  // 2. 按阈值升序（正好与难度升序一致）生成提示文案
  return tiers.map((t, idx) => {
    const isFirst = idx === 0;
    const isLast = idx === tiers.length - 1;
    if (isLast) {
      return {
        threshold: t.threshold,
        message: `📈 {model}的价格已经高到连接${t.label}项目都亏本了...`,
      };
    }
    return {
      threshold: t.threshold,
      message: `📉 用{model}接${t.label}项目${isFirst ? '已经在亏本了' : '也开始亏本了'}...`,
    };
  });
}

export const UNPROFITABLE_TIERS: { threshold: number; message: string }[] = buildUnprofitableTiers();

// 通胀率：三阶段区间保留，但均固定 3%/天
export const INFLATION_PHASES = [
  { untilDay: 15, rate: 0.03 },
  { untilDay: 30, rate: 0.03 },
  { untilDay: 9999, rate: 0.03 },
];

// 每日最大可接任务数
export const MAX_TASKS_PER_DAY = 3;

// 交易税：总资产达到阈值后，卖出 Token 被扣 25% 税
// 注：以下两个常量为历史兼容，实际仅被 UI 文案引用；真正生效的是下面的 SELL_TAX_TIERS 阶梯表
export const TRADING_TAX_THRESHOLD = 3_000_000; // 300万
export const TRADING_TAX_RATE = 0.25;

/**
 * 卖出税阶梯：基于玩家历史总资产峰值（peakTotalAssets）单调递增，跨进一档后永久生效、不可回退。
 * 设计目标：操作较好的玩家在 5000万 附近几乎赚不动，被迫主动退休。
 * 第 0 档（300万/25%）为现有交易税阈值，保持原有手感不变。
 */
export interface SellTaxTier {
  threshold: number;       // 购及该档的总资产峰值阈值
  multiplier: number;      // 卖出实收系数（0~1，越小扣得越狠）
  taxPct: number;          // 显示用税率百分数
  thresholdLabel: string;  // 显示用阈值文案
  modalEmoji: string;      // 弹窗顶部表情
  modalTitle: string;      // 弹窗标题
  headlineMessage: string; // 推送到 pendingMessages 的提示信息
}

export const SELL_TAX_TIERS: SellTaxTier[] = [
  // 第 0 档：300万 / 25%
  {
    threshold: 3_000_000,
    multiplier: 0.75,
    taxPct: 25,
    thresholdLabel: '300万',
    modalEmoji: '💸',
    modalTitle: 'Token交易开始收税',
    headlineMessage:
      '📢 全球 Token 交易所联合公告：因Token交易活跃，即日起所有 Token 卖出将收取 25% 税额',
  },
  // 第 1 档：800万 / 45%
  {
    threshold: 8_000_000,
    multiplier: 0.55,
    taxPct: 45,
    thresholdLabel: '800万',
    modalEmoji: '📈',
    modalTitle: 'Token交易税上涨',
    headlineMessage:
      '📢 全球 Token 交易所联合公告：即日起所有 Token 卖出交易税提高至 45% ',
  },
  // 第 2 档：2000万 / 65%
  {
    threshold: 20_000_000,
    multiplier: 0.35,
    taxPct: 65,
    thresholdLabel: '2000万',
    modalEmoji: '🌊',
    modalTitle: '流动性紧缩警报',
    headlineMessage:
      '📢 Token 市场流动性指数连续下跌，做市商集体扩大点差。Token 卖出实际到账仅 35%',
  },
  // 第 3 档：3500万 / 80%
  {
    threshold: 60_000_000,
    multiplier: 0.20,
    taxPct: 80,
    thresholdLabel: '6000万',
    modalEmoji: '🐋',
    modalTitle: '市场深度严重不足',
    headlineMessage:
      '📢 Token 深度订单簿持续萎缩，大额抛售难以承接。每笔卖出实际到账仅两成',
  },
  // 第 4 档：5亿 / 95%——火热时代终结（设计天花板）
  {
    threshold: 1000_000_000,
    multiplier: 0.05,
    taxPct: 95,
    thresholdLabel: '10亿',
    modalEmoji: '🪦',
    modalTitle: '火热时代的结束',
    headlineMessage:
      '📢 全球 Token 市场已过饱和，即日起token几乎只是账户上的数字了',
  },
];

// GPU算力中心解锁阈值（总资产达到 200 万解锁）
export const GPU_CENTER_UNLOCK_THRESHOLD = 2_000_000;

