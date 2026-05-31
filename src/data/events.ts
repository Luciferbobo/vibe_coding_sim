// 随机事件定义

export interface GameEvent {
  id: number;
  type: 'price_up' | 'price_down' | 'gift_token' | 'lose_token' | 'lose_cash' | 'spirit_change' | 'reputation_change';
  message: string;
  probability: number;   // 0-1 触发概率
  tokenId?: number;      // 受影响的Token ID
  multiplier?: number;   // 价格倍率
  amount?: number;       // 赠送/损失数量(M tokens 或咸鱼个数) 或 现金金额 或 精神/信誉变化值
}

export const EVENTS: GameEvent[] = [
  // 利好 - 降价
  { id: 0, type: 'price_down', message: 'OpenAI服务器爆炸！GPT Token暴跌40%！赶紧囤！', probability: 0.05, tokenId: 0, multiplier: 0.6 },
  { id: 1, type: 'price_down', message: 'Anthropic被反垄断调查，Claude Token大降价！', probability: 0.05, tokenId: 1, multiplier: 0.65 },
  { id: 2, type: 'price_down', message: 'Google I/O发布新模型，Gemini老版打骨折！', probability: 0.06, tokenId: 2, multiplier: 0.5 },
  { id: 3, type: 'price_down', message: 'DeepSeek完成新一轮融资，Token大放价！', probability: 0.06, tokenId: 3, multiplier: 0.6 },

  // 利好 - 赠送
  { id: 4, type: 'gift_token', message: '阿里开源新模型，白送你 5M Qwen Token！', probability: 0.04, tokenId: 4, amount: 5 },
  { id: 5, type: 'gift_token', message: '你中了 GitHub 抽奖，获得 0.5M GPT Token！', probability: 0.03, tokenId: 0, amount: 0.5 },
  { id: 6, type: 'gift_token', message: '朋友送你 5 个咸鱼Cursor试用号！', probability: 0.06, tokenId: 6, amount: 5 },

  // 利好 - 精神
  { id: 7, type: 'spirit_change', message: '你在GitHub收到一个Star，感觉世界还需要你！', probability: 0.08, amount: 10 },
  { id: 8, type: 'spirit_change', message: '一个初学者在评论区感谢了你3年前写的博客，你感到温暖', probability: 0.06, amount: 15 },

  // 利空 - 涨价
  { id: 9, type: 'price_up', message: 'Claude又涨价了！Anthropic宣布API价格上调30%！', probability: 0.06, tokenId: 1, multiplier: 1.3 },
  { id: 10, type: 'price_up', message: 'GPT-5.5需求暴增，OpenAI紧急提价！', probability: 0.05, tokenId: 0, multiplier: 1.35 },
  { id: 11, type: 'price_up', message: 'AI监管新规出台，所有Token集体涨价10%！', probability: 0.04, multiplier: 1.1 },

  // 利空 - 损失Token
  { id: 12, type: 'lose_token', message: '你的邮箱被盗！损失了部分 Token！', probability: 0.04, amount: 0.5 },
  { id: 13, type: 'lose_token', message: 'AI把你的Key公布到了网上，损失了部分 Token！', probability: 0.05, amount: 2 },

  // 利空 - 损失现金
  { id: 14, type: 'lose_cash', message: '甲方跑路了！你白干了一天！损失500元', probability: 0.05, amount: 500 },
  { id: 15, type: 'lose_cash', message: '电脑蓝屏了，维修花了800元', probability: 0.04, amount: 800 },
  { id: 16, type: 'lose_cash', message: '外卖点错了，花了200块点了顿满汉全席', probability: 0.06, amount: 200 },

  // 利空 - 精神
  { id: 17, type: 'spirit_change', message: '996加班猝死新闻上了热搜，你开始焦虑...', probability: 0.07, amount: -10 },
  { id: 18, type: 'spirit_change', message: '又一个AI产品上线了，你感到自己越来越没用', probability: 0.06, amount: -8 },
  { id: 19, type: 'spirit_change', message: '前同事朋友圈晒offer，年薪是你10倍...', probability: 0.05, amount: -12 },
  { id: 20, type: 'spirit_change', message: '刷到"6岁程序员何去何从"，你关上了手机', probability: 0.06, amount: -10 },

  // 信誉相关
  { id: 21, type: 'reputation_change', message: '你在知乎写的技术文章上了热榜！信誉提升！', probability: 0.04, amount: 8 },
  { id: 22, type: 'reputation_change', message: '有人在脉脉上说你接私活不靠谱（虽然不是你）', probability: 0.04, amount: -5 },
];

// 游戏结束深意语句
export const GAME_OVER_QUOTES = [
  '这一天终会到来，你我都心知肚明。游戏中是第{days}天，现实世界呢....',
  '你关上了电脑，走出了那间10平米的出租屋。窗外的世界还在运转，只是不再需要你了。',
  'AI不会疲惫，不会抱怨，不要房租。你唯一的优势，是你还活着——但这似乎也不是什么优势了。',
  '你打开了招聘网站，搜索"不需要AI的工作"。结果为空。',
  '游戏结束了。但你知道，这不是游戏。',
  '最后一个月的房租，你没能交上。房东没有为难你，他说他儿子也是程序员。他说"都一样"。',
  '你想起刚学编程时的兴奋。那时候你觉得，会写代码的人永远不会失业。',
];

// 房租提示
export const RENT_MESSAGES = [
  '房东砸门："这个月房租呢？！别以为你天天对着电脑我就不敢赶你走！"',
  '房东发来消息："亲，本月租金该缴了哦～逾期将影响芝麻信用分！"',
  '房东：今天最后期限，明天再不交我就换锁了。',
];
