// 评分系统 - 根据游戏表现计算最终得分和称号
//
// 设计原则：与「一键退休」逻辑使用同一把尺。
// retire 的本质是把剩余资产按周租消耗模拟成「还能再活多少天」：
//   weeksAlive = floor(totalCash / rent)；daysAlive = weeksAlive * 7
// 因此评分也把「资产」按同样的换算率折算成「等效天数」，再统一按 100 分/天计分。
// 这样「主动退休」与「被动结算（破产/被赶出）」两条路径在同一时刻的得分一致，
// 退休不再「白丢资产分」。

const DAYS_PER_WEEK = 7;     // 1 周租 = 7 天生存成本
const SCORE_PER_DAY = 100;   // 1 天等效存活 = 100 分

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
 * 根据分数给称号
 * 门槛按「等效存活天数」校准，1 天 = 100 分
 * @param score 综合得分
 * @returns 称号字符串
 */
export function getTitle(score: number): string {
  if (score >= 28000) return '🏆 AI时代的生存大师';   // ≈ 280 天
  if (score >= 20000) return '💎 Token大亨';          // ≈ 200 天
  if (score >= 15000) return '🌟 资深Vibe Coder';     // ≈ 150 天
  if (score >= 10000) return '💻 熟练Prompt工程师';    // ≈ 100 天
  if (score >= 7500) return '📱 独立开发者';           // ≈  75 天
  if (score >= 5000) return '🔧 外包接单仔';           // ≈  50 天
  if (score >= 3000) return '📝 初级工程师';           // ≈  30 天
  return '💀 被AI取代的人';                            //  <  30 天
}

/**
 * 根据总存活天数（含退休后坚持的天数）给出分级评价。
 * 这个字样会在 GameOverScreen 的摘要区作为小标题呈现。
 */
export function getDayComment(totalDays: number): string {
  if (totalDays >= 365 * 50) return '颐享天年';      // 50 年+
  if (totalDays >= 365 * 20) return '安度晚年';      // 20 年+
  if (totalDays >= 365 * 10) return '十年光阴';      // 10 年+
  if (totalDays >= 365 * 5) return '小有所成';        //  5 年+
  if (totalDays >= 365 * 2) return '苟延残喘';        //  2 年+
  if (totalDays >= 365) return '勉强存活';             //  1 年+
  if (totalDays >= 180) return '半年即逝';             // 半年+
  if (totalDays >= 90) return '昙花一现';              //  3 个月+
  if (totalDays >= 30) return '转瞬即逝';              //  1 个月+
  return '出师未捷';                                   //  < 1 个月
}
