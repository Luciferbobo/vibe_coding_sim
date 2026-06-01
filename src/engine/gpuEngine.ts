// GPU算力中心 - 引擎逻辑：通胀定价、日产出生成、寿命推进、电费计算

import { GPUS, GPU_BASE_DAILY_OUTPUT, GPUInstance } from '../data/gpus';

// 注意：GPU 售价已固定为 basePrice，不再随通胀变动；保留此函数仅为兼容。
// inflationRatio = currentClaudePrice / baseClaudePrice
export function getGpuCurrentPrices(inflationRatio: number): number[] {
  return GPUS.map(gpu => Math.round(gpu.basePrice * inflationRatio));
}

// 生成每日GPU Token产出批次，同时累加每台GPU的totalOutput
export function generateGpuDailyOutput(
  gpus: GPUInstance[],
  day: number,
  currentPrices: number[]
): {
  batches: { tokenId: number; count: number; purchaseDay: number; expiresDay: number; avgPrice: number }[];
  updatedGpus: GPUInstance[];
} {
  const batches: { tokenId: number; count: number; purchaseDay: number; expiresDay: number; avgPrice: number }[] = [];
  const updatedGpus: GPUInstance[] = [];

  for (const gpu of gpus) {
    if (!gpu.active || gpu.selectedTokenId < 0 || gpu.selectedTokenId > 5) {
      updatedGpus.push(gpu);
      continue;
    }

    const gpuDef = GPUS[gpu.gpuTierId];
    const baseOutput = GPU_BASE_DAILY_OUTPUT[gpu.selectedTokenId] || 0;
    const output = baseOutput * gpuDef.outputMultiplier;

    if (output > 0) {
      batches.push({
        tokenId: gpu.selectedTokenId,
        count: output,
        purchaseDay: day,
        expiresDay: day + 7, // 7天保质期
        avgPrice: 0, // GPU产出标记为0成本
      });
      const price = currentPrices[gpu.selectedTokenId] || 0;
      const outputValue = output * price;
      updatedGpus.push({ ...gpu, totalOutput: gpu.totalOutput + outputValue });
    } else {
      updatedGpus.push(gpu);
    }
  }

  return { batches, updatedGpus };
}

// 推进GPU寿命，返回更新后的GPU列表和报废的GPU列表
export function advanceGpuLifespan(gpus: GPUInstance[]): { active: GPUInstance[]; scrapped: GPUInstance[] } {
  const active: GPUInstance[] = [];
  const scrapped: GPUInstance[] = [];

  for (const gpu of gpus) {
    const updated = { ...gpu, usedDays: gpu.usedDays + 1 };
    if (updated.usedDays >= updated.lifespan) {
      scrapped.push(updated);
    } else {
      active.push(updated);
    }
  }

  return { active, scrapped };
}

// 计算所有活跃GPU的每日总电费（可选乘以通胀系数）
export function calculateDailyElectricity(gpus: GPUInstance[], inflationRatio: number = 1): number {
  const base = gpus
    .filter(g => g.active)
    .reduce((sum, g) => sum + GPUS[g.gpuTierId].dailyElectricity, 0);
  return base * inflationRatio;
}

// 计算每周电费（随房租一起收取，可选乘以通胀系数）
export function calculateWeeklyElectricity(gpus: GPUInstance[], inflationRatio: number = 1): number {
  return Math.round(calculateDailyElectricity(gpus, inflationRatio) * 7);
}
