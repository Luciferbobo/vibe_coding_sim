// Formatting helpers. Game values stay in RMB internally; English display converts
// the same value to USD at the requested 1:10 presentation rate.
import type { Language } from '../stores/languageTypes';

export function formatMoney(amount: number, language: Language = 'zh'): string {
  const rounded = Math.round(amount);
  if (language === 'en') {
    const dollars = (Math.abs(rounded) / 10).toLocaleString('en-US', { maximumFractionDigits: 2 });
    return rounded < 0 ? `-$${dollars}` : `$${dollars}`;
  }
  return `¥${rounded.toLocaleString('zh-CN')}`;
}

/** Format a unit price while retaining cents when the value is small. */
export function formatPrice(amount: number, language: Language = 'zh'): string {
  if (language === 'en') return `$${(amount / 10).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `¥${amount.toLocaleString('zh-CN', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
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
export function formatDay(day: number, language: Language = 'zh'): string {
  const d = Math.max(1, Math.floor(day));
  return language === 'en' ? `Day ${d}` : `第${d}天`;
}

/**
 * 带括号详情的天数格式化（仅成就页使用）。
 * - day <= 30：「第X天」
 * - day > 30：「第X天（约X年X月X天）」
 */
export function formatDayDetailed(day: number, language: Language = 'zh'): string {
  const d = Math.max(1, Math.floor(day));
  if (d <= 30) return language === 'en' ? `Day ${d}` : `第${d}天`;
  const years = Math.floor(d / 365);
  const remaining = d % 365;
  const months = Math.floor(remaining / 30);
  const days = remaining % 30;
  const parts: string[] = [];
  if (language === 'en') {
    if (years > 0) parts.push(`${years}y`);
    if (months > 0) parts.push(`${months}mo`);
    if (days > 0) parts.push(`${days}d`);
    return `Day ${d} (~${parts.join(' ')})`;
  }
  if (years > 0) parts.push(`${years}年`);
  if (months > 0) parts.push(`${months}月`);
  if (days > 0) parts.push(`${days}天`);
  return `第${d}天（约${parts.join('')}）`;
}
