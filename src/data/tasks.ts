// 需求模板定义 - 开发任务

export interface TaskTemplate {
  id: number;
  name: string;
  tokenCost: number;          // 单位：M tokens（百万 token）
  reward: number;             // 元
  reputationRequired: number; // 信誉要求
  difficulty: 'easy' | 'medium' | 'hard' | 'hell';
  spiritCostIfManual: number; // 自己写消耗的精神值
  description: string;
}

// 设计原则：
// 报酬随信誉等级提升，单位 token 收益更高，激励玩家攒信誉接大活：

export const TASK_TEMPLATES: TaskTemplate[] = [
  { id: 0,  name: '写个TODO应用',     tokenCost: 2,    reward: 240,    reputationRequired: 5,  difficulty: 'easy',   spiritCostIfManual: 15, description: '增删改查，前端基础活' },
  { id: 1,  name: '修个CSS居中Bug',   tokenCost: 0.3,  reward: 35,     reputationRequired: 0,  difficulty: 'easy',   spiritCostIfManual: 10, description: '一个div，居中，几轮对话搞定' },
  { id: 2,  name: '个人博客搭建',     tokenCost: 4,    reward: 480,    reputationRequired: 10, difficulty: 'easy',   spiritCostIfManual: 20, description: 'Next.js + MDX，标准活' },
  { id: 3,  name: '小程序商城',       tokenCost: 8,    reward: 1200,   reputationRequired: 20, difficulty: 'medium', spiritCostIfManual: 30, description: '微信小程序，商品展示+购物车' },
  { id: 4,  name: '企业官网开发',     tokenCost: 12,   reward: 1800,   reputationRequired: 30, difficulty: 'medium', spiritCostIfManual: 30, description: '响应式，动画，CMS对接' },
  { id: 5,  name: 'SaaS管理后台',     tokenCost: 25,   reward: 4500,   reputationRequired: 45, difficulty: 'medium', spiritCostIfManual: 35, description: 'RBAC权限+数据看板+CRUD' },
  { id: 6,  name: '直播带货系统',     tokenCost: 40,   reward: 8800,   reputationRequired: 80, difficulty: 'hard',   spiritCostIfManual: 40, description: '实时推流+弹幕+支付' },
  { id: 7,  name: '电商后台系统',     tokenCost: 50,   reward: 11000,  reputationRequired: 85, difficulty: 'hard',   spiritCostIfManual: 45, description: '订单+库存+物流+数据分析' },
  { id: 8,  name: '社交App全栈',      tokenCost: 80,   reward: 17600,  reputationRequired: 85, difficulty: 'hard',   spiritCostIfManual: 50, description: 'IM+朋友圈+推荐算法' },
  { id: 9,  name: 'AI Agent平台',     tokenCost: 150,  reward: 42000,  reputationRequired: 90, difficulty: 'hell',   spiritCostIfManual: 50, description: '多Agent编排+RAG+自动化工作流' },
  { id: 10, name: '量化交易系统',     tokenCost: 200,  reward: 56000,  reputationRequired: 95, difficulty: 'hell',   spiritCostIfManual: 50, description: '高频策略+风控+回测引擎' },
  { id: 11, name: '重构屎山代码',     tokenCost: 12,   reward: 2160,   reputationRequired: 40, difficulty: 'medium', spiritCostIfManual: 40, description: '3年没人维护的jQuery项目' },
  { id: 12, name: '写个Chrome插件',   tokenCost: 1.5,  reward: 180,    reputationRequired: 0,  difficulty: 'easy',   spiritCostIfManual: 15, description: '网页内容提取器' },
  { id: 13, name: '数据大屏可视化',   tokenCost: 15,   reward: 2250,   reputationRequired: 35, difficulty: 'medium', spiritCostIfManual: 30, description: 'ECharts + 大屏适配 + 数据联动' },
  { id: 14, name: '全栈低代码平台',   tokenCost: 180,  reward: 50400,  reputationRequired: 90, difficulty: 'hell',   spiritCostIfManual: 50, description: '拖拽建站+逻辑编排+部署' },
  { id: 15, name: '大模型训练',       tokenCost: 200,  reward: 56000,  reputationRequired: 95, difficulty: 'hell',   spiritCostIfManual: 50, description: '数据清洗+模型设计+RLHF对齐' },
  // --- 扩充任务 ---
  { id: 16, name: '前端小工具',       tokenCost: 1,    reward: 120,    reputationRequired: 0,  difficulty: 'easy',   spiritCostIfManual: 10, description: '设计稿转代码，像素级还原' },
  { id: 17, name: '办公自动化脚本',       tokenCost: 3,    reward: 360,    reputationRequired: 5,  difficulty: 'easy',   spiritCostIfManual: 15, description: 'Python批量处理Excel，老板急用' },
  { id: 18, name: '微信H5活动页',     tokenCost: 1.5,  reward: 180,    reputationRequired: 5,  difficulty: 'easy',   spiritCostIfManual: 12, description: '转盘抽奖+分享裂变，甲方要明天上线' },
  { id: 19, name: '在线教育平台',     tokenCost: 10,   reward: 1500,   reputationRequired: 25, difficulty: 'medium', spiritCostIfManual: 30, description: '课程管理+视频播放+学员系统' },
  { id: 20, name: '物联网监控面板',   tokenCost: 18,   reward: 2700,   reputationRequired: 35, difficulty: 'medium', spiritCostIfManual: 30, description: 'MQTT接入+实时图表+告警推送' },
  { id: 21, name: '用户管理系统',        tokenCost: 20,   reward: 3600,   reputationRequired: 40, difficulty: 'medium', spiritCostIfManual: 35, description: '客户管理+销售漏斗+数据隔离' },
  { id: 22, name: '短视频推荐引擎',   tokenCost: 45,   reward: 9900,   reputationRequired: 80, difficulty: 'hard',   spiritCostIfManual: 40, description: '内容分发+用户画像+AB实验' },
  { id: 23, name: '实时协作文档',     tokenCost: 60,   reward: 13200,  reputationRequired: 80, difficulty: 'hard',   spiritCostIfManual: 45, description: 'CRDT同步+WebSocket+权限管理' },
  { id: 24, name: '支付中台系统',     tokenCost: 70,   reward: 15400,  reputationRequired: 85, difficulty: 'hard',   spiritCostIfManual: 45, description: '多渠道聚合+对账清算+风控引擎' },
  { id: 25, name: '分布式训练框架',   tokenCost: 200,  reward: 56000,  reputationRequired: 95, difficulty: 'hell',   spiritCostIfManual: 50, description: '多节点调度+梯度同步+容错恢复' },
  { id: 26, name: '文生视频基模训练', tokenCost: 200,  reward: 56000,  reputationRequired: 95, difficulty: 'hell',   spiritCostIfManual: 50, description: 'DiT架构+训练分析+多卡并行' },
];

// 精神值过低无法自己写代码的提示
export const LOW_SPIRIT_MESSAGES = [
  '冒泡排序都不会写了哥，你感到失去AI就失去了一切',
  '你盯着屏幕上的for循环，忘记了i应该从0开始还是从1开始',
  '你尝试手写一个useEffect，三秒后你打开了ChatGPT',
  '这个需求你3年前能1小时写完，现在你连文档都看不懂了',
  '你打开了VS Code，光标闪烁了五分钟，一个字也敲不出来',
  '你试图回忆Promise的用法，脑子里却只有async/await...等等那也不对',
];

// 使用劣质AI失败的提示（{model}=模型名, {task}=任务名, {n}=随机次数）
export const BAD_AI_MESSAGES = [
  '{model}太烂了！你抽卡{n}次还是没完成"{task}"需求，你砸了键盘',
  '{model}坚持认为React是后端框架，你崩溃了',
  '{model}连续输出了5000行注释，一行有效代码都没有',
  '{model}把你的Python代码翻译成了古诗',
  '{model}生成的代码跑起来了！然后它删除了你的数据库',
];

// 使用咸鱼Cursor账号失败的专属提示（{task}=任务名, {n}=随机次数）
export const XIANYU_BAD_MESSAGES = [
  '咸鱼的Cursor账号又挂了！愤怒的你点击了退款',
  'Cursor弹窗："账号已封禁" 你联系卖家，发现已被拉黑',
  '你买的账号里还残留着上个人的coding记录，你看得正起劲时，账号被ban了',
  '账号能用，但每生成 3 行代码就要重新登录一次，你放弃了"{task}"',
  'Cursor官方公告：近期抓到一批黑产账号，你的邮箱刚好在里面',
];

// 需求完美完成的提示
export const PERFECT_MESSAGES = [
  'AI不仅完成了需求，还主动写了单元测试！甲方感动哭了',
  '一次过！零Bug！甲方追加了奖金',
  'AI输出的代码比你写的还优雅，你开始怀疑人生（但钱到手了）',
];

// 倒卖Token后的信誉不足提示
export const LOW_REP_MESSAGES = [
  '老板看了你一眼，呦，你就是那个倒卖Token的贩子，一边去！',
  '"我们不和Token贩子合作。" 对方挂断了电话。',
  '面试官：你简历上这段空白期...在倒卖Token是吧？再见。',
];

// 未倒卖过Token时的信誉不足提示（工作经验不足）
export const LOW_REP_NEWBIE_MESSAGES = [
  '你就是那个rm -rf了数据库的实习生？*对方挂断了电话*',
  '对方看着你工作经历只有实习的简历，开始沉默',
  '"我们需要3年以上工作经验的..." 你默默关上了页面',
  '"你做过什么项目？" "呃...大学课设算吗？" *已读不回*',
  '对方瞥了一眼你的GitHub，0 contribution，微笑着说"回去等通知吧"',
];
