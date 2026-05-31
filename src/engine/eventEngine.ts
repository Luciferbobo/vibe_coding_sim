// 随机事件引擎 - 负责每日事件判定

import { EVENTS, GameEvent } from '../data/events';
import { chance } from '../utils/random';

/**
 * 每日掷骰，返回触发的事件列表
 * 每个事件独立判定概率，可能同时触发多个事件
 * @returns 今日触发的事件数组
 */
export function rollDailyEvents(): GameEvent[] {
  const triggeredEvents: GameEvent[] = [];

  for (const event of EVENTS) {
    if (chance(event.probability)) {
      triggeredEvents.push(event);
    }
  }

  // 限制每日最多触发3个事件，避免信息过载
  if (triggeredEvents.length > 3) {
    return triggeredEvents.sort(() => Math.random() - 0.5).slice(0, 3);
  }

  return triggeredEvents;
}
