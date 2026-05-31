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
 * 将整数天数格式化为「第X年X月」「第X月」或「第X天」。
 * 1年 = 365天，1月 = 30天。
 * - 有年有月 → 第X年X月
 * - 仅有年   → 第X年
 * - 仅有月   → 第X月
 * - 不足1月 → 第X天
 * 有年有月有天时，天数忽略（精确到月）。
 */
export function formatDay(day: number): string {
  const years = Math.floor(day / 365);
  const remainingAfterYears = day % 365;
  const months = Math.floor(remainingAfterYears / 30);

  if (years > 0 && months > 0) {
    return `第${years}年${months}月`;
  } else if (years > 0) {
    return `第${years}年`;
  } else if (months > 0) {
    return `第${months}月`;
  } else {
    return `第${day}天`;
  }
}
