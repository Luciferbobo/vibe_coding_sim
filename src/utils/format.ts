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
 * 将整数天数格式化为「第X天」
 */
export function formatDay(day: number): string {
  return `第${Math.max(1, Math.floor(day))}天`;
}

/**
 * 带括号详情的天数格式化（仅成就页使用）。
 * - day <= 30：「第X天」
 * - day > 30：「第X天（约X年X月X天）」
 */
export function formatDayDetailed(day: number): string {
  const d = Math.max(1, Math.floor(day));
  if (d <= 30) return `第${d}天`;
  const years = Math.floor(d / 365);
  const remaining = d % 365;
  const months = Math.floor(remaining / 30);
  const days = remaining % 30;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}月`);
  if (days > 0) parts.push(`${days}天`);
  return `第${d}天（约${parts.join('')}）`;
}
