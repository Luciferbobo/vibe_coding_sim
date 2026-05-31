// 网站定义 - 8个游戏场景

export interface SiteDef {
  id: number;
  name: string;
  type: 'market' | 'task' | 'info' | 'facility';
  description: string;
  icon: string; // emoji
}

export const SITES: SiteDef[] = [
  { id: 0, name: 'API商城', type: 'market', description: '主要Token交易市场，价格稳定', icon: '🏪' },
  { id: 1, name: '闲鱼二手区', type: 'market', description: '野生Token市场，价格波动大', icon: '🐟' },
  { id: 2, name: '外包广场', type: 'task', description: '正规需求平台，各种难度都有', icon: '💼' },
  { id: 3, name: '高端猎头', type: 'task', description: '高端需求平台，信誉要求高', icon: '👔' },
  { id: 4, name: 'Twitter', type: 'info', description: '查看行情消息，触发事件', icon: '📱' },
  { id: 5, name: '公寓', type: 'facility', description: '你的住所，每月交房租', icon: '🏠' },
  { id: 6, name: '星巴克', type: 'facility', description: '喝杯咖啡恢复精神', icon: '☕' },
  { id: 7, name: '知乎', type: 'facility', description: '写技术博客恢复信誉', icon: '✍️' },
  { id: 8, name: '成就殿堂', type: 'facility', description: '查看你的成就徽章', icon: '🏅' },
  { id: 9, name: '一键退休', type: 'facility', description: '卖掉所有资产，看看能躺平多久', icon: '🏖️' },
];
