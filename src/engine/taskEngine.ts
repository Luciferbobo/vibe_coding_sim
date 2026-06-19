// 需求引擎 - 负责生成需求和判定完成结果

import { TASK_TEMPLATES, TaskTemplate, BAD_AI_MESSAGES, XIANYU_BAD_MESSAGES, PERFECT_MESSAGES } from '../data/tasks';
import { TokenDef } from '../data/tokens';
import { randomInt, randomChoice, chance } from '../utils/random';

// 需求完成结果
export interface TaskResult {
  success: boolean;
  quality: 'perfect' | 'excellent' | 'normal' | 'barely' | 'failed';
  reward: number;
  reputationChange: number;
  message: string;
}

/**
 * 每天生成3-5个需求
 * @param day 当前天数（影响难度分布）
 * @param site 需求来源网站
 * @returns 今日可接需求列表
 */
export function generateDailyTasks(day: number, site: 'niuke' | 'boss'): TaskTemplate[] {
  // day 仅作为种子参考，目前两个平台的需求池都按信誉档位划分：
  // - 牛客网：信誉要求 0-45 的中低端零活池
  // - BOSS直聘：信誉要求 80-95 的高端项目池
  void day;
  const count = randomInt(3, 5);
  const tasks: TaskTemplate[] = [];

  const availableTemplates = TASK_TEMPLATES.filter(t => {
    if (site === 'boss') {
      // BOSS直聘：高信誉、高回报需求
      return t.reputationRequired >= 80 && t.reputationRequired <= 95;
    }
    // 牛客网：低信誉、面向新人的零活
    return t.reputationRequired <= 45;
  });

  // 随机选取不重复的需求
  const shuffled = [...availableTemplates].sort(() => Math.random() - 0.5);
  for (let i = 0; i < Math.min(count, shuffled.length); i++) {
    tasks.push(shuffled[i]);
  }

  return tasks;
}

/**
 * 各模型在“专家(hell)”难度下的完成率（按产品需求制定，与 tokens.ts 顺序对齐）
 */
const HELL_RATES: Record<number, number> = {
  0: 0.90, // Claude Opus 4.8
  1: 0.85, // GPT-5.5
  2: 0.80, // Gemini 3.5
  3: 0.55, // DeepSeek v4
  4: 0.50, // Qwen 3.7 Max
  5: 0.25, // Kimi K2.6
  6: 0.01, // 咸鱼Cursor账号
};

/**
 * 难度修正：以 tokenDef.completionRate 作为“进阶(hard)”基线。
 * - 简单：在进阶基础上适当提高
 * - 中等：介于简单与进阶之间
 * - 进阶：使用 baseRate 本身
 * - 专家：另行查 HELL_RATES，不受修正影响
 */
const DIFFICULTY_MODIFIER: Record<string, number> = {
  easy: 0.07,
  medium: 0.03,
  hard: 0,
  hell: 0, // 占位。专家难度走 HELL_RATES
};

/**
 * 计算给定任务与 Token 组合下的实际完成率。
 * UI 与抽卡逻辑均需依赖此函数，避免不一致。
 */
export function getCompletionRate(task: TaskTemplate, tokenDef: TokenDef): number {
  if (task.difficulty === 'hell') {
    return HELL_RATES[tokenDef.id] ?? Math.max(0.01, tokenDef.completionRate - 0.05);
  }
  const offset = DIFFICULTY_MODIFIER[task.difficulty] ?? 0;
  return Math.max(0.05, Math.min(0.99, tokenDef.completionRate + offset));
}

/**
 * 抽卡判定完成结果
 * @param task 接受的需求
 * @param tokenDef 使用的AI Token定义
 * @returns 完成结果
 */
export function attemptTask(task: TaskTemplate, tokenDef: TokenDef): TaskResult {
  // 根据 Token + 任务难度计算最终完成率
  const finalRate = getCompletionRate(task, tokenDef);
  
  // 判定是否成功
  if (!chance(finalRate)) {
    // 失败 - 咸鱼Cursor账号使用专属提示，其他模型使用通用提示
    const isXianyu = tokenDef.id === 6;
    const messagePool = isXianyu ? XIANYU_BAD_MESSAGES : BAD_AI_MESSAGES;
    const msg = randomChoice(messagePool)
      .replace('{model}', tokenDef.name)
      .replace('{n}', String(randomInt(3, 8)))
      .replace('{task}', task.name);
    return {
      success: false,
      quality: 'failed',
      reward: 0,
      reputationChange: -5, // 失败扣5信誉
      message: msg,
    };
  }
  
  // 成功 - 判定质量
  const qualityRoll = Math.random();
  
  if (qualityRoll < 0.1 && tokenDef.tier === 'S') {
    // 10%概率完美（仅S级Token）
    const msg = randomChoice(PERFECT_MESSAGES);
    return {
      success: true,
      quality: 'perfect',
      reward: Math.round(task.reward * 1.5), // 1.5倍奖金
      reputationChange: 5, // 完美完成+5
      message: msg,
    };
  } else if (qualityRoll < 0.3) {
    // 优秀完成
    return {
      success: true,
      quality: 'excellent',
      reward: Math.round(task.reward * 1.2),
      reputationChange: 8, // 超额完成+8
      message: `需求"${task.name}"高质量完成！客户很满意，多给了点钱。`,
    };
  } else if (qualityRoll < 0.8) {
    // 正常完成
    return {
      success: true,
      quality: 'normal',
      reward: task.reward,
      reputationChange: 3, // 正常完成+3
      message: `需求"${task.name}"顺利完成，钱到账了。`,
    };
  } else {
    // 勉强完成
    return {
      success: true,
      quality: 'barely',
      reward: Math.round(task.reward * 0.8),
      reputationChange: 1, // 勉强通过+1
      message: `需求"${task.name}"磕磕绊绊搞完了...客户觉得马马虎虎，扣了点钱。`,
    };
  }
}

/**
 * 判断是否能接需求（信誉是否达标）
 */
export function canAcceptTask(task: TaskTemplate, reputation: number): boolean {
  return reputation >= task.reputationRequired;
}
