// Token商品定义 - 7种AI Token

export interface TokenDef {
  id: number;
  name: string;
  tier: 'S' | 'A' | 'B' | 'C' | 'D';
  basePrice: number;       // 元/1M tokens（咸鱼Cursor账号为 元/个）
  volatility: number;      // 波动系数 0-1
  completionRate: number;  // 基础完成率
  description: string;
  equivalentTokens?: number; // 等效token量(M)，仅咸鱼用
}

// 价格参考真实世界 2025 年 AI 模型 API 综合定价（人民币 / 1M tokens）
// 高端旗舰波动小，国产/灰产波动大
export const TOKENS: TokenDef[] = [
  { id: 0, name: 'Claude Opus 12.0', tier: 'S', basePrice: 85, volatility: 0.12, completionRate: 0.95, description: 'Opus系列最贵，代码质量极高' },
  { id: 1, name: 'GPT-8.5',          tier: 'S', basePrice: 85,  volatility: 0.15, completionRate: 0.93, description: 'OpenAI旗舰，贵但稳' },
  { id: 2, name: 'Gemini 9.1 Pro',   tier: 'A', basePrice: 25,  volatility: 0.18, completionRate: 0.85, description: 'Google新作，性价比不错' },
  { id: 3, name: 'DeepSeek v19',     tier: 'B', basePrice: 4,   volatility: 0.25, completionRate: 0.60, description: '国产之光，价格亲民' },
  { id: 4, name: 'Qwen 6.8 Max',     tier: 'B', basePrice: 3,   volatility: 0.25, completionRate: 0.5, description: '阿里出品，中规中矩' },
  { id: 5, name: 'Kimi K8',          tier: 'C', basePrice: 1.5, volatility: 0.30, completionRate: 0.3, description: 'Kimi K8，便宜量大管饱' },
  { id: 6, name: '咸鱼Cursor账号',   tier: 'D', basePrice: 5,   volatility: 0.80, completionRate: 0.1, description: '咸鱼特色，劣质token，来路不明，一个账号可用100M token', equivalentTokens: 100 },
];
