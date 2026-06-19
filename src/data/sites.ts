// 网站定义 - 8个游戏场景

export interface SiteDef {
  id: number;
  name: string;
  type: 'market' | 'task' | 'info' | 'facility';
  description: string;
  icon: string; // emoji
}

export const SITES: SiteDef[] = [
  { id: 0, name: 'API商城', type: 'market', description: '官方Token市场', icon: '🏪' },
  { id: 1, name: '闲鱼二手区', type: 'market', description: '野生Token市场', icon: '🐟' },
  { id: 10, name: 'GPU算力中心', type: 'market', description: '成为Token资本家', icon: '⚛️' },
  { id: 2, name: '外包广场', type: 'task', description: '普通接单平台', icon: '💼' },
  { id: 3, name: '高端猎头', type: 'task', description: '高端需求平台', icon: '👔' },
  { id: 4, name: 'Twitter', type: 'info', description: '查看行情消息', icon: '📱' },
  { id: 5, name: '公寓', type: 'facility', description: '你的住所', icon: '🏠' },
  { id: 6, name: '星巴克', type: 'facility', description: '喝杯咖啡恢复精神', icon: '☕' },
  { id: 7, name: '知乎', type: 'facility', description: '写技术博客涨信誉', icon: '✍️' },
  { id: 8, name: '成就殿堂', type: 'facility', description: '查看你的人生经历', icon: '🏅' },
  { id: 9, name: '一键退休', type: 'facility', description: '卖掉所有资产', icon: '🏖️' },
];
