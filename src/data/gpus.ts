// GPU算力中心 - GPU档位定义、产出表、相关常量

export interface GPUDef {
  id: number;
  name: string;
  tier: number;
  basePrice: number;
  dailyElectricity: number;
  outputMultiplier: number;
  lifespan: number;
  description: string;
  icon: string;
}

export const GPUS: GPUDef[] = [
  { id: 0, name: '8 × RTX 5090', tier: 1, basePrice: 1_000_000, dailyElectricity: 3_000, outputMultiplier: 1.0, lifespan: 30, description: '入门消费级算力', icon: '🖥️' },
  { id: 1, name: '8 × H200', tier: 2, basePrice: 3_500_000, dailyElectricity: 8_000, outputMultiplier: 3.8, lifespan: 30, description: 'NVIDIA 数据中心标配', icon: '🖥️' },
  { id: 2, name: '8 × B200', tier: 3, basePrice: 8_000_000, dailyElectricity: 16_000, outputMultiplier: 9.5, lifespan: 30, description: 'Blackwell 架构旗舰', icon: '🖥️' },
  { id: 3, name: '8 × RTX 9090', tier: 4, basePrice: 20_000_000, dailyElectricity: 35_000, outputMultiplier: 26, lifespan: 30, description: '9090，2030年人均一台', icon: '🖥️' },
  { id: 4, name: '量子计算原型机', tier: 5, basePrice: 50_000_000, dailyElectricity: 80_000, outputMultiplier: 512, lifespan: 30, description: 'AGI诞生前夕', icon: '⚛️' },
];

// 5090基础每日产出量（M/天）- 其他GPU按outputMultiplier乘
export const GPU_BASE_DAILY_OUTPUT: Record<number, number> = {
  0: 130,      // Claude Opus 4.7
  1: 135,      // GPT-5.5
  2: 460,      // Gemini 3.1
  3: 3_000,    // DeepSeek v4
  4: 4_000,    // Qwen 3.6 Max
  5: 8_500,    // Kimi K2.5
  // tokenId 6 (咸鱼Cursor) 不可产出
};

export const GPU_CENTER_UNLOCK_THRESHOLD = 2_000_000; // 200万总资产解锁
export const GPU_LIFESPAN = 30; // 30天寿命
export const GPU_RECYCLE_RATE = 0.7; // 卖出回收70%

export interface GPUInstance {
  id: number;
  gpuTierId: number;
  purchaseDay: number;
  purchasePrice: number;
  lifespan: number;
  usedDays: number;
  selectedTokenId: number; // -1 = 未配置（默认买入即设为 0 = Claude）
  active: boolean;
  totalOutput: number; // 累计产出的Token总价值（按产出时的市场价计算）
}
