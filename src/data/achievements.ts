// 成就系统数据定义

export interface Achievement {
  id: string;
  name: string;
  description: string; // 获得方式描述（解锁后可见）
  icon: string; // emoji作为奖章
}

export const ACHIEVEMENTS: Achievement[] = [
  { id: 'money_10k', name: '万元户', description: '累计现金达到10,000元', icon: '💰' },
  { id: 'money_100k', name: '小有积蓄', description: '累计现金达到100,000元', icon: '💎' },
  { id: 'money_1m', name: '百万富翁', description: '累计现金达到1,000,000元', icon: '🏆' },
  { id: 'money_2m', name: '资本新贵', description: '累计现金达到2,000,000元', icon: '👑' },
  { id: 'money_5m', name: 'coding圈巴菲特', description: '累计现金达到5,000,000元', icon: '🐋' },
  { id: 'money_10m', name: '千万传说', description: '累计现金达到10,000,000元', icon: '🐉' },
  { id: 'first_sell', name: '程序员的事怎么能叫贩卖呢', description: '第一次倒卖Token', icon: '🃏' },
  { id: 'early_rent_10', name: '哄富婆开心', description: '连续10次提前交房租', icon: '🎱' },
  { id: 'token_10b', name: 'Token大户', description: '任意模型的Token数量达到10B', icon: '🏦' },
  { id: 'coffee_5days', name: '牛马打工人', description: '连续5天喝咖啡', icon: '🐂' },
  { id: 'zhihu_10days', name: '教练！我想学这个', description: '连续10天写知乎文章', icon: '📚' },
  { id: 'manual_3', name: '真正的程序员', description: '使用手动完成3个项目', icon: '⌨️' },
  { id: 'sell_expiring', name: '大善人', description: '卖出只剩1天保质期的Token', icon: '😈' },
  { id: 'arbitrage_5', name: '财富密码', description: '跨市场套利（低买高卖）累计达到 5 次', icon: '💹' },
  { id: 'gpu_first_buy', name: '老黄的信徒', description: '购买第一台GPU服务器', icon: '🖥️' },
  { id: 'quantum_computer', name: '遇事不决，量子力学', description: '购买第一台量子计算机原型机', icon: '⚛️' },
  { id: 'money_50m', name: '造富神话', description: '总资产达到5000万', icon: '👑' },
];
