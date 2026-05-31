// 随机数工具函数

/** 返回 [0, max) 的随机整数 */
export function randomNum(max: number): number {
  return Math.floor(Math.random() * max);
}

/** 返回 [min, max] 的随机整数 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/** 返回 [min, max] 的随机浮点数 */
export function randomFloat(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/** 从数组中随机选择一个元素 */
export function randomChoice<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

/** 概率判定，probability 为 0-1 的概率值 */
export function chance(probability: number): boolean {
  return Math.random() < probability;
}
