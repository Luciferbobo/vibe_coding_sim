// 游戏核心参数常量

export const INITIAL_CASH = 500000;           // 初始现金
export const INITIAL_SPIRIT = 100;          // 初始精神值
export const INITIAL_REPUTATION = 50;       // 初始信誉值（改为50）
export const MAX_SPIRIT = 100;              // 精神值上限
export const MAX_REPUTATION = 100;          // 信誉值上限
export const RENT_BASE = 2000;              // 每周房租
export const RENT_INCREASE = 2;             // 每周房租递增金额（元）
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

// 分阶段通胀率
export const INFLATION_PHASES = [
  { untilDay: 15, rate: 0.03 },
  { untilDay: 30, rate: 0.04 },
  { untilDay: 9999, rate: 0.05 },
];

// 每日最大可接任务数
export const MAX_TASKS_PER_DAY = 3;

// 交易税：总资产达到阈值后，卖出 Token 被扣 25% 税
export const TRADING_TAX_THRESHOLD = 3_000_000; // 300万
export const TRADING_TAX_RATE = 0.25;

