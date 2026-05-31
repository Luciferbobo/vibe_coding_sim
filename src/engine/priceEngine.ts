// Token价格引擎 - 负责每日价格计算和事件影响

import { TOKENS } from '../data/tokens';
import { INFLATION_PHASES } from '../data/constants';
import { GameEvent } from '../data/events';
import { randomFloat } from '../utils/random';

/**
 * 根据当前天数获取对应的通胀率
 */
function getInflationRate(day: number): number {
  for (const phase of INFLATION_PHASES) {
    if (day <= phase.untilDay) {
      return phase.rate;
    }
  }
  return INFLATION_PHASES[INFLATION_PHASES.length - 1].rate;
}

/**
 * 基于前一天价格生成新的每日价格
 * @param day 当前天数（用于通胀递增）
 * @param prevPrices 前一天的价格数组（7种Token）
 * @returns 新的价格数组
 */
export function generateDailyPrices(day: number, prevPrices: number[]): number[] {
  const baseInflation = getInflationRate(day);

  return TOKENS.map((token, index) => {
    const prevPrice = prevPrices[index];
    
    // 基础通胀：根据阶段确定固定通胀率，加微小随机波动
    const inflationNoise = randomFloat(-0.005, 0.005);
    const inflation = baseInflation + inflationNoise;
    
    // Token独立波动：根据volatility系数
    const volatilityRange = token.volatility * 0.15; // 减小波动，让通胀主导
    const tokenNoise = randomFloat(-volatilityRange, volatilityRange);
    
    // 最终价格 = 前一天价格 * (1 + 通胀 + 波动)
    const newPrice = prevPrice * (1 + inflation + tokenNoise);
    
    // 价格不能低于基础价的50%（保底，避免被事件压到地板）
    const minPrice = token.basePrice * 0.5;
    return Math.max(minPrice, Math.round(newPrice * 100) / 100);
  });
}

/**
 * 事件修改价格
 * @param prices 当前价格数组
 * @param event 触发的事件
 * @returns 修改后的价格数组
 */
export function applyEventToPrice(prices: number[], event: GameEvent): number[] {
  if (event.type !== 'price_up' && event.type !== 'price_down') {
    return prices;
  }

  const multiplier = event.multiplier || 1;

  return prices.map((price, index) => {
    // 如果事件指定了tokenId，只影响该Token
    if (event.tokenId !== undefined) {
      if (index === event.tokenId) {
        return Math.round(price * multiplier * 100) / 100;
      }
      return price;
    }
    // 没指定tokenId，影响所有Token
    return Math.round(price * multiplier * 100) / 100;
  });
}

/**
 * 生成初始价格（基于basePrice加小幅随机）
 */
export function generateInitialPrices(): number[] {
  return TOKENS.map(token => {
    const noise = randomFloat(0.9, 1.1);
    return Math.round(token.basePrice * noise * 100) / 100;
  });
}
