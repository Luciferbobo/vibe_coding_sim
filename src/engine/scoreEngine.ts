// 评分系统 - 根据游戏表现计算最终得分和称号
//
// 设计原则：与「一键退休」逻辑使用同一把尺。
// retire 的本质是把剩余资产按周租消耗模拟成「还能再活多少天」：
//   daysUntilFirstRent = max(0, nextRentDay - day)
//   weeksAlive = floor(totalCash / rent)
//   daysAlive = daysUntilFirstRent + weeksAlive * RENT_CYCLE
// 评分用简化公式 assetDays = totalAssets * 7 / rent 作为近似，
// 这样「主动退休」与「被动结算（破产/被赶出）」两条路径在同一时刻的得分接近，
// 退休不再「白丢资产分」。

const DAYS_PER_WEEK = 7;     // 1 周租 = 7 天生存成本
const SCORE_PER_DAY = 100;   // 1 天等效存活 = 100 分

/**
 * 称号 / 大标题共用档位表。
 * 两者基于同一个 totalDays（含退休后追加天数），保证档位严格对应。
 * 数组按 minDays 从高到低排列，便于线性查找。
 */
interface Tier {
  minDays: number;
  title: string;     // 下方 Final Title（带 emoji）
  comment: string;   // 顶部大标题（4 字风格）
}

const TIERS: Tier[] = [
  { minDays: 365 * 50, title: '🌌 时代见证者',         comment: '颐享天年' },
  { minDays: 365 * 20, title: '👑 财富自由的人',       comment: '安度晚年' },
  { minDays: 365 * 10, title: '🏆 AI时代的生存大师',   comment: '生存大师' },
  { minDays: 365 * 5,  title: '💎 Token大亨',          comment: '五年光阴' },
  { minDays: 365 * 2,  title: '🌟 资深Vibe Coder',     comment: '小有所成' },
  { minDays: 365,      title: '💻 熟练Prompt工程师',   comment: '勉强存活' },
  { minDays: 180,      title: '📱 独立开发者',         comment: '半年即逝' },
  { minDays: 90,       title: '🔧 外包接单仔',         comment: '昙花一现' },
  { minDays: 30,       title: '📝 初级工程师',         comment: '转瞬即逝' },
  { minDays: 0,        title: '💀 被AI取代的人',       comment: '出师未捷' },
];

function findTier(totalDays: number): Tier {
  for (const tier of TIERS) {
    if (totalDays >= tier.minDays) return tier;
  }
  return TIERS[TIERS.length - 1];
}

/**
 * 计算最终得分
 * @param cash 剩余现金
 * @param tokenValue 持有Token总价值
 * @param daysPlayed 存活天数
 * @param weeklyRent 当前周租（资产→天数的换算基准，与 retire 使用同一个量）
 * @returns 综合得分
 */
export function calculateScore(
  cash: number,
  tokenValue: number,
  daysPlayed: number,
  weeklyRent: number
): number {
  // 实际游玩天数得分
  const dayScore = daysPlayed * SCORE_PER_DAY;

  // 资产按周租折算成「还能再撑多少天」，与 retire 对齐
  const totalAssets = cash + tokenValue;
  const assetDays =
    weeklyRent > 0 ? (totalAssets * DAYS_PER_WEEK) / weeklyRent : 0;
  const assetScore = assetDays * SCORE_PER_DAY;

  return Math.round(dayScore + assetScore);
}

/**
 * 根据「等效存活总天数」给称号。
 * 与 getDayComment 共用同一份档位表，保证顶部/底部档位严格对应。
 *
 * @param totalDays 等效存活总天数（退休结局已包含资产折算追加天数；破产结局即真实游玩天数）
 */
export function getTitle(totalDays: number): string {
  return findTier(totalDays).title;
}

/**
 * 根据总存活天数（含退休后坚持的天数）给出分级评价。
 * 这个字样会在 GameOverScreen 的摘要区作为小标题呈现。
 */
export function getDayComment(totalDays: number): string {
  return findTier(totalDays).comment;
}
