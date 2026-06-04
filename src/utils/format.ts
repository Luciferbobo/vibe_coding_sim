// 格式化工具函数

/** 格式化金额，如 ¥1,234 */
export function formatMoney(amount: number): string {
  const rounded = Math.round(amount);
  return `¥${rounded.toLocaleString('zh-CN')}`;
}

/**
 * 格式化Token数量。
 * amount 单位为 M tokens（百万 token）。
 * - >=1000 M  → B（十亿）
 * - >=1   M  → M（百万）
 * - <1    M  → K（千）
 */
export function formatToken(amount: number): string {
  if (amount >= 1000) return `${(amount / 1000).toFixed(1)}B`;
  if (amount >= 1) return `${amount.toFixed(1)}M`;
  return `${(amount * 1000).toFixed(0)}K`;
}

/**
 * 将整数天数格式化为「第X年X月X天」「第X月X天」「第X年」「第X月」或「第X天」。
 * 1年 = 365天，1月 = 30天。
 * 依次拼接非零单位，例如：
 *  - day=1   → 「第1天」
 *  - day=30  → 「第1月」
 *  - day=34  → 「第1月4天」
 *  - day=64  → 「第2月4天」
 *  - day=365 → 「第1年」
 *  - day=400 → 「第1年1月5天」
 */
export function formatDay(day: number): string {
  const safeDay = Math.max(0, Math.floor(day));
  const years = Math.floor(safeDay / 365);
  const remainingAfterYears = safeDay % 365;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;

  const parts: string[] = [];
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}月`);
  if (days > 0 || parts.length === 0) parts.push(`${days}天`);
  return `第${parts.join('')}`;
}
