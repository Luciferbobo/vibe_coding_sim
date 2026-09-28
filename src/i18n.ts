import type { Language } from './stores/languageTypes';
import { ACHIEVEMENTS } from './data/achievements';

export type { Language } from './stores/languageTypes';

// Keep the translator in sync with the store's persisted preference even before
// React has rendered the first frame. This matters for a returning player whose
// last session was in English.
let currentLanguage: Language = typeof window !== 'undefined' && window.localStorage?.getItem('vibe-language') === 'en'
  ? 'en'
  : 'zh';
export function setCurrentLanguage(language: Language) { currentLanguage = language; }

export const SITE_TRANSLATIONS: Record<number, { name: string; description: string }> = {
  0: { name: 'API Marketplace', description: 'Official token market' },
  1: { name: 'Xianyu Resale', description: 'Wild, second-hand token market' },
  2: { name: 'Freelance Hub', description: 'General freelance jobs' },
  3: { name: 'Executive Headhunters', description: 'High-end project board' },
  4: { name: 'Twitter', description: 'Market news and chatter' },
  5: { name: 'Apartment', description: 'Your place' },
  6: { name: 'Starbucks', description: 'Coffee for a little more focus' },
  7: { name: 'Zhihu', description: 'Write tech posts to build reputation' },
  8: { name: 'Hall of Achievements', description: 'Review your life milestones' },
  9: { name: 'Retirement', description: 'Liquidate everything' },
  10: { name: 'GPU Compute Center', description: 'Become a token capitalist' },
};

export const TOKEN_TRANSLATIONS: Record<number, { name: string; description: string }> = {
  0: { name: 'Claude Opus 12.0', description: 'The priciest Opus model, with exceptional code quality' },
  1: { name: 'GPT-8.5', description: 'OpenAI flagship: expensive, but dependable' },
  2: { name: 'Gemini 9.1 Pro', description: "Google's latest release, with solid value for money" },
  3: { name: 'DeepSeek v19', description: 'A homegrown star with an approachable price' },
  4: { name: 'Qwen 6.8 Max', description: "Alibaba's model: dependable and unflashy" },
  5: { name: 'Kimi K8', description: 'Cheap, plentiful, and easy to burn through' },
  6: { name: 'Xianyu Cursor account', description: 'A questionable bargain account: 100M tokens per account' },
};

export const GPU_TRANSLATIONS: Record<number, { name: string; description: string }> = {
  0: { name: '8 × H200', description: 'NVIDIA data-center standard' },
  1: { name: '8 × B300', description: 'The flagship Blackwell architecture' },
  2: { name: '8 × RTX 9090', description: 'The 9090: one for everyone by 2030' },
  3: { name: 'Quantum computing prototype', description: 'On the eve of AGI' },
};

export const ACHIEVEMENT_TRANSLATIONS: Record<string, { name: string; description: string }> = {
  money_10k: { name: 'Five-Figure Club', description: 'Accumulate $1,000 in cash' },
  money_100k: { name: 'A Little Nest Egg', description: 'Accumulate $10,000 in cash' },
  money_1m: { name: 'Millionaire', description: 'Accumulate $100,000 in cash' },
  money_2m: { name: 'New Money', description: 'Accumulate $200,000 in cash' },
  money_5m: { name: 'Coding Buffett', description: 'Accumulate $500,000 in cash' },
  money_10m: { name: 'Ten-Million Legend', description: 'Accumulate $1,000,000 in cash' },
  first_sell: { name: 'It Is Not Selling, It Is Engineering', description: 'Resell tokens for the first time' },
  early_rent_10: { name: 'Landlord\'s Favorite', description: 'Pay rent early ten times in a row' },
  token_10b: { name: 'Token Whale', description: 'Hold 10B tokens of any model' },
  coffee_5days: { name: 'Caffeinated Wage Slave', description: 'Drink coffee five days in a row' },
  zhihu_10days: { name: 'Coach, I Want to Learn This', description: 'Publish Zhihu articles ten days in a row' },
  manual_3: { name: 'A Real Programmer', description: 'Complete three projects by hand' },
  sell_expiring: { name: 'The Good Samaritan', description: 'Sell tokens with only one day left' },
  arbitrage_5: { name: 'The Wealth Formula', description: 'Profit from cross-market arbitrage five times' },
  gpu_first_buy: { name: 'Huang\'s Disciple', description: 'Buy your first GPU server' },
  quantum_computer: { name: 'When in Doubt, Quantum Mechanics', description: 'Buy the first quantum computer prototype' },
  money_50m: { name: 'A Fortune-Making Myth', description: 'Reach total assets of $5,000,000' },
};

export const TASK_TRANSLATIONS: Record<number, { name: string; description: string }> = {
  0: { name: 'Build a TODO app', description: 'CRUD and frontend basics' },
  1: { name: 'Fix a CSS centering bug', description: 'One div, centered, solved in a few rounds' },
  2: { name: 'Build a personal blog', description: 'Next.js + MDX, the standard package' },
  3: { name: 'Mini-program storefront', description: 'WeChat mini-program with products and a cart' },
  4: { name: 'Corporate website', description: 'Responsive UI, animation, and CMS integration' },
  5: { name: 'SaaS admin console', description: 'RBAC, dashboards, and CRUD' },
  6: { name: 'Livestream commerce system', description: 'Live streaming, bullet comments, and payments' },
  7: { name: 'E-commerce back office', description: 'Orders, inventory, logistics, and analytics' },
  8: { name: 'Full-stack social app', description: 'IM, social feed, and recommendation algorithms' },
  9: { name: 'AI agent platform', description: 'Multi-agent orchestration, RAG, and automated workflows' },
  10: { name: 'Quant trading system', description: 'High-frequency strategies, risk control, and backtesting' },
  11: { name: 'Refactor legacy spaghetti', description: 'A jQuery project no one has maintained for three years' },
  12: { name: 'Build a Chrome extension', description: 'A web-content extractor' },
  13: { name: 'Data dashboard visualization', description: 'ECharts, big-screen layouts, and linked data' },
  14: { name: 'Full-stack low-code platform', description: 'Drag-and-drop sites, logic flows, and deployment' },
  15: { name: 'Train a foundation model', description: 'Data cleaning, model design, and RLHF alignment' },
  16: { name: 'Frontend utility', description: 'Turn a design into pixel-perfect code' },
  17: { name: 'Office automation script', description: 'Batch-process Excel files in Python; the boss needs it now' },
  18: { name: 'WeChat H5 campaign page', description: 'Spin-to-win, sharing, and viral referrals by tomorrow' },
  19: { name: 'Online education platform', description: 'Course management, video playback, and student accounts' },
  20: { name: 'IoT monitoring dashboard', description: 'MQTT, live charts, and alert notifications' },
  21: { name: 'User management system', description: 'Customer management, sales funnel, and data isolation' },
  22: { name: 'Short-video recommendation engine', description: 'Content delivery, user profiles, and A/B testing' },
  23: { name: 'Real-time collaborative docs', description: 'CRDT sync, WebSockets, and permission management' },
  24: { name: 'Payment hub', description: 'Multi-channel aggregation, reconciliation, and risk controls' },
  25: { name: 'Distributed training framework', description: 'Multi-node scheduling, gradient sync, and fault recovery' },
  26: { name: 'Text-to-video base model', description: 'DiT architecture, training analysis, and multi-GPU parallelism' },
};

export const DIFFICULTY_TRANSLATIONS: Record<string, string> = {
  easy: 'Easy',
  medium: 'Medium',
  hard: 'Advanced',
  hell: 'Expert',
};

export const SCORE_TITLE_TRANSLATIONS: Record<string, string> = {
  '🌌 时代见证者': '🌌 Witness of an Era',
  '👑 财富自由的人': '👑 Financially Free',
  '🏆 AI时代的生存大师': '🏆 AI-Age Survival Master',
  '💎 Token大亨': '💎 Token Tycoon',
  '🌟 资深Vibe Coder': '🌟 Veteran Vibe Coder',
  '💻 熟练Prompt工程师': '💻 Seasoned Prompt Engineer',
  '📱 独立开发者': '📱 Indie Developer',
  '🔧 外包接单仔': '🔧 Freelance Hustler',
  '📝 初级工程师': '📝 Junior Engineer',
  '💀 被AI取代的人': '💀 Replaced by AI',
};
export const SCORE_COMMENT_TRANSLATIONS: Record<string, string> = {
  '颐享天年': 'A life well lived', '安度晚年': 'A comfortable retirement', '生存大师': 'Survival master',
  '五年光阴': 'Five years well spent', '小有所成': 'A modest success', '勉强存活': 'Barely alive',
  '半年即逝': 'Gone in six months', '昙花一现': 'A brief flash', '转瞬即逝': 'Gone in an instant', '出师未捷': 'Defeated before the first win',
};

export const GAME_OVER_QUOTE_TRANSLATIONS: Record<string, string> = {
  '这一天终会到来，你我都心知肚明。游戏中是{days}，现实世界呢....': 'This day was always coming, and we both knew it. In the game it is {days}; what about the real world…',
  '你关上了电脑，走出了那间10平米的出租屋。窗外的世界还在运转，只是不再需要你了。': 'You shut down the computer and leave the 10-square-meter rental. The world keeps turning outside; it just no longer needs you.',
  'AI不会疲惫，不会抱怨，不要房租。你唯一的优势，是你还活着——但这似乎也不是什么优势了。': 'AI never tires, never complains, and never pays rent. Your only advantage is that you are alive—and that no longer feels like much of an advantage.',
  '你打开了招聘网站，搜索“不需要AI的工作”。结果为空。': 'You open a job board and search for “jobs that do not need AI.” No results.',
  '游戏结束了。但你知道，这不是游戏。': 'The game is over. You know this was never just a game.',
  '你想起刚学编程时的兴奋。那时候你觉得，会写代码的人永远不会失业。': 'You remember the excitement of learning to code. Back then, you thought people who could code would never be unemployed.',
  '一年。你比大多数人撑得更久。但“更久”不等于“足够久”。': 'One year. You lasted longer than most people. But “longer” is not “long enough.”',
  '你坚持了几年。你已经不只是“活着”了，你是在“经营”生活。': 'You lasted for years. You were no longer merely surviving; you were running your life.',
  '有人叫你“Token大亨”。你苦笑。你只是一个学会了和机器共存的人。': 'People call you a Token Tycoon. You smile bitterly. You are just someone who learned to coexist with machines.',
  '五年前你担心被取代。现在你明白了：不是被取代，是被融合。': 'Five years ago you feared replacement. Now you understand: it was not replacement, but fusion.',
  '回看这十几年，你最大的成就不是赚了多少钱，而是始终没有放弃。': 'Looking back over the last decade, your greatest achievement is not how much you made, but that you never gave up.',
  '十多年时间，世界变了好几轮。你还在。这本身就是一种胜利。': 'The world changed several times over ten years. You are still here. That is a victory in itself.',
  '你坐在阳台上，看着这个完全由AI驱动的世界。你是少数还记得“以前”的人。': 'You sit on the balcony, watching a world driven entirely by AI. You are one of the few who still remember “before.”',
  '有人说你是赢家。你不确定。你只是足够幸运，在AI时代你找到了赚钱的方法。': 'Some call you a winner. You are not sure. You were simply lucky enough to find a way to earn in the AI age.',
  '你见证了人类文明最剧烈的转变。从敲代码到永生，从工具到同伴。': 'You witnessed the most violent transformation in human civilization: from typing code to immortality, from tools to companions.',
  '你从一个担心失业的程序员，变成了一个时代的活化石。你被后人成为奇迹。': 'You went from a programmer afraid of unemployment to a living fossil of an era. Future generations call you a miracle.',
  '游戏结束了。但你的故事，会被后来的人讲述。': 'The game is over. Your story will be told by those who come after.',
};

export const EVENT_TRANSLATIONS: Record<string, string> = {
  'OpenAI服务器故障，GPT-8.5 Token下跌10%！': 'OpenAI servers failed; GPT-8.5 tokens fell 10%!',
  'Anthropic被反垄断调查，Claude Opus 12.0 Token降价15%！': 'Anthropic is under an antitrust investigation; Claude Opus 12.0 tokens are 15% cheaper!',
  'Google I/O发布新模型，Gemini 9.1 Pro降价20%！': 'Google unveiled a new model at I/O; Gemini 9.1 Pro is 20% cheaper!',
  'DeepSeek v19完成新一轮融资，Token降价15%！': 'DeepSeek v19 closed a new funding round; its tokens are 15% cheaper!',
  '阿里开源新模型，白送你 5M Qwen 6.8 Max Token！': 'Alibaba open-sourced a new model and gave you 5M Qwen 6.8 Max tokens!',
  '你中了 GitHub 抽奖，获得 0.5M GPT-8.5 Token！': 'You won a GitHub giveaway: 0.5M GPT-8.5 tokens!',
  '朋友送你 5 个咸鱼Cursor试用号！': 'A friend gave you five Xianyu Cursor trial accounts!',
  '你在GitHub收到一个Star，感觉世界还需要你！': 'You got a GitHub star. The world still needs you!',
  '一个初学者在评论区感谢了你3年前写的博客，你感到温暖': 'A beginner thanked you for a blog post from three years ago. You feel seen.',
  'Claude Opus 12.0又涨价了！Anthropic宣布API价格上调30%！': 'Claude Opus 12.0 got more expensive again! Anthropic raised API prices 30%!',
  'GPT-8.5需求暴增，OpenAI紧急提价！': 'Demand for GPT-8.5 exploded; OpenAI raised prices in an emergency!',
  'AI监管新规出台，所有Token集体涨价10%！': 'New AI regulations arrived; every token rose 10%!',
  '你的邮箱被盗！损失了部分 Token！': 'Your email was hacked. You lost some tokens!',
  'AI把你的Key公布到了网上，损失了部分 Token！': 'AI posted your key online. You lost some tokens!',
  '甲方跑路了！你白干了一天！损失500元': 'The client disappeared. You worked for free all day and lost $50.',
  '电脑蓝屏了，维修花了800元': 'Your computer blue-screened; repairs cost $80.',
  '外卖点错了，花了200块点了顿满汉全席': 'You ordered the wrong takeout: a full banquet for $20.',
  '996加班猝死新闻上了热搜，你开始焦虑...': 'A 996 overtime death hit the trending list. Anxiety creeps in…',
  '又一个AI产品上线了，你感到自己越来越没用': 'Another AI product launched. You feel more obsolete by the minute.',
  '前同事朋友圈晒offer，年薪是你10倍...': 'A former coworker posted a new offer: ten times your salary…',
  '刷到"6岁程序员何去何从"，你关上了手机': 'You see “Where does a six-year-old programmer go from here?” and put your phone away.',
  '你在知乎写的技术文章上了热榜！信誉提升！': 'Your Zhihu tech article hit the trending list. Reputation up!',
  '有人在脉脉上说你接私活不靠谱（虽然不是你）': 'Someone on Maimai says you are unreliable for side gigs (it is not even you).',
};

export const TYPE_TRANSLATIONS: Record<string, string> = {
  market: 'Market',
  task: 'Jobs',
  info: 'News',
  facility: 'Life',
};

const BLOG_TOPIC_TRANSLATIONS: Record<string, string> = {
  '《为什么我放弃了xxx框架》': '“Why I Gave Up on the xxx Framework”',
  '《2025年前端框架终极对比》': '“The Ultimate 2025 Frontend Framework Showdown”',
  '《从入门到放弃：AI编程的真相》': '“From Beginner to Giving Up: The Truth About AI Coding”',
  '《月入3万的Vibe Coder是怎么工作的》': '“How a Vibe Coder Earning $3K a Month Works”',
  '《程序员35岁之后的出路》': '“What Programmers Do After 35”',
};

const EXACT_TRANSLATIONS: Record<string, string> = {
  '欢迎来到Vibe Coding的世界。你是一名依赖AI写代码的程序员，账户里只有5000块。Token价格每天都在涨，房租每周要交。祝你好运。':
    'Welcome to the world of Vibe Coding. You are a programmer who relies on AI, with only $500 in the bank. Token prices rise every day, and rent is due every week. Good luck.',
  '今天没有适合你的需求': 'There are no jobs that fit you today',
  '明天再来看看吧（切换日期会刷新需求池）': 'Come back tomorrow; changing the day refreshes the job boards.',
  '知道了': 'Got it',
  '取消': 'Cancel',
  '确认': 'Confirm',
  '关闭': 'Close',
  '导航': 'NAVIGATION',
  '精神': 'SPIRIT',
  '信誉': 'REPUTATION',
  '现金余额': 'Cash balance',
  '持仓': 'Holdings',
  '暂无持仓': 'No holdings',
  '好消息': 'Good news',
  '坏消息': 'Bad news',
  '事件': 'Event',
  '还有': 'There are',
  '条事件等待': 'events waiting',
  '强制休息中': 'Forced rest',
  '锁定': 'Locked',
  '即将过期': 'Expires soon',
  '你终于从精神崩溃中恢复了...虽然世界没有等你。': 'You finally recover from your breakdown… though the world did not wait for you.',
  '休息结束': 'Rest over',
  '强制休息': 'Forced rest',
  '怎么这个月电费比房租都贵啊...': 'How is the electricity bill higher than rent this month…?',
  '💀 你的精神值归零了！身体强制关机，需要休息3天...': '💀 Your SPIRIT hit zero! Your body forced a shutdown; rest for 3 days…',
  '房租逾期': 'Rent overdue',
  '破产': 'Bankruptcy',
  '💸 你破产了...连一杯咖啡都买不起了。': '💸 You are bankrupt… you cannot even afford a coffee.',
  '🎉 你的资产达到了200万！神秘场所已解锁：「GPU算力中心」（在早期请谨慎投资，token价格过低时购买gpu可能导致亏损）': '🎉 Your assets reached $200,000! The mysterious GPU Compute Center is unlocked. Invest carefully: buying GPUs while token prices are low can lose money.',
  '进入下一天·事件': 'Next day · event',
  '进入下一天': 'Next day',
  '⚠️ 信誉值为 0，没人愿意把 Token 卖给你了…先去知乎写博客洗白吧。': '⚠️ Your reputation is zero; nobody will sell you tokens. Write a Zhihu post to rebuild it.',
  '⚠️ 咸鱼Cursor账号不支持转卖': '⚠️ Xianyu Cursor accounts cannot be resold',
  '你开始走上了倒卖Token的道路... 不知这对与错，但你知道你必须活下去。（倒卖Token会降低信誉值）': 'You have started reselling tokens. You do not know whether it is right, but you know you have to survive. (Reselling lowers reputation.)',
  '把只剩一天保质期的Token卖出，这种事你也干得出来？？（额外扣除 3 点信誉）': 'You sold tokens with one day left. You really did that? (Additional reputation −3.)',
  '💡 恭喜你发现了套利逻辑~': '💡 Congratulations—you found the arbitrage loop!',
  '😫 今天已经做了3个项目了，该休息了。进入下一天刷新需求吧。': '😫 You have completed three projects today. Rest and advance to refresh the job board.',
  '手写项目': 'Hand-written project',
  '完成需求': 'Job completed',
  '需求失败': 'Job failed',
  '今天已经喝过一杯了，再喝要心悸了...': 'You already had a cup today. Another might cause palpitations…',
  '喝咖啡': 'Coffee',
  '⚡ 有GPU运行时无法提前交租（电费按实际天数计算），等到期日自动扣除即可。': '⚡ Early rent is disabled while a GPU is running; electricity is charged by actual days and deducted on the due date.',
  '🏅 成就解锁：富婆快乐球 - 连续10次提前交房租！': '🏅 Achievement unlocked: Landlord\'s Favorite — paid rent early ten times in a row!',
  '提前交租': 'Paid rent early',
  '缴房租': 'Paid rent',
  '一键退休': 'Retirement',
  '🚨 紧急公告：全球GPU服务器供不应求，从今天开始GPU价格将急速上涨！算力已成为新时代的“石油”。': '🚨 Emergency bulletin: GPU servers are in short supply worldwide. GPU prices will surge from today; compute is the new oil.',
  '💖 你在刷帖中找到了共鸣（精神+1）': '💖 You found a kindred spirit while scrolling (+1 SPIRIT)',
  '🎉 恭喜你成为万元户！你在这个Token的时代有了不错的开始！': '🎉 You reached $1,000! A promising start in the token age.',
  '🎊 十万大关！你已经是这条街最靓的Prompt工程师了！': '🎊 You reached $10,000! You are the sharpest prompt engineer on the block.',
  '💰 百万身家！你开始考虑要不要给房东涨租了...': '💰 $100,000 in the bank! You start wondering whether to raise your landlord’s rent…',
  '🏆 两百万！你的财富已经超过了99%的AI时代打工人。但这能持续多久呢？': '🏆 $200,000! You are richer than 99% of AI-age workers. But how long can it last?',
  '👑 五百万！Token贩子的传说在江湖上流传。有人叫你“coding圈巴菲特”。': '👑 $500,000! The legend of the token dealer spreads. Some call you the coding world’s Buffett.',
  '🐉 千万富翁！你已经可以买下整栋公寓了': '🐉 You reached $1,000,000! You could buy the whole apartment building now.',
  '房东惊喜地看着你：“这个月水电费我包了！”': 'Your landlord looks delighted: “I will cover utilities this month!”',
  '房东笑得合不拢嘴：“小伙子真靠谱，有什么需要修的随时说！”': 'Your landlord beams: “You are so reliable. Tell me whenever something needs fixing!”',
  '房东主动给你换了个新空调：“给你升级一下，别热着了”': 'Your landlord replaces your AC: “An upgrade, so you do not overheat.”',
  '房东开始在朋友圈夸你：“我那个租户啊，比我儿子还准时”': 'Your landlord praises you online: “My tenant is more punctual than my son.”',
  '房东居然给你送了一箱水果：“别嫌弃，自家种的”': 'Your landlord brings you a box of fruit: “It is home-grown. Do not be shy.”',
  '房东把车位让给了你：“你用吧，我反正坐地铁”': 'Your landlord gives you the parking spot: “Use it; I take the subway anyway.”',
  '房东开始给你介绍对象：“我侄女，大厂的，要不认识一下？”': 'Your landlord tries matchmaking: “My niece works at a big tech firm. Want to meet?”',
  '房东悄悄给你交了三个月水电费：“嘘，别让其他租户知道”': 'Your landlord quietly pays three months of utilities: “Shh, do not tell the other tenants.”',
  '房东年夜饭叫上了你：“一个人过啊年，来我家”': 'Your landlord invites you to New Year dinner: “Spending it alone? Come to ours.”',
  '房东看你的眼神越来越温柔：“要不...你就别搬走了？”': 'Your landlord looks at you more tenderly: “What if… you never moved out?”',
  'Token交易开始收税': 'Token sales are now taxed',
  'Token交易税上涨': 'Token trading tax increased',
  '流动性紧缩警报': 'Liquidity crunch alert',
  '市场深度严重不足': 'Severely shallow market',
  '火热时代的结束': 'The end of the boom',
  '📢 全球 Token 交易所联合公告：因Token交易活跃，即日起所有 Token 卖出将收取 25% 税额': '📢 Joint notice from global token exchanges: due to intense activity, all token sales now incur a 25% tax.',
  '📢 全球 Token 交易所联合公告：即日起所有 Token 卖出交易税提高至 45% ': '📢 Joint notice from global token exchanges: token-sale tax rises to 45% effective immediately.',
  '📢 Token 市场流动性指数连续下跌，做市商集体扩大点差。Token 卖出实际到账仅 35%': '📢 Token-market liquidity has fallen for days; market makers widened spreads. Token sales now pay out only 35%.',
  '📢 Token 深度订单簿持续萎缩，大额抛售难以承接。每笔卖出实际到账仅两成': '📢 The token order book keeps thinning; large dumps have no buyers. Each sale now pays out only 20%.',
  '📢 全球 Token 市场已过饱和，即日起token几乎只是账户上的数字了': '📢 The global token market is saturated. From today, tokens are almost just numbers in your account.',
};

// Notifications chosen at runtime from the task and rent message pools.
// Keeping them here makes the English copy stable even when the random source
// message was generated in a previous language.
const RUNTIME_EXACT_TRANSLATIONS: Record<string, string> = {
  '老板看了你一眼，呦，你就是那个倒卖Token的贩子，一边去！': 'The boss takes one look at you. “You are that token reseller? Keep walking.”',
  '"我们不和Token贩子合作。" 对方挂断了电话。': '“We do not work with token resellers.” The other party hangs up.',
  '面试官：你简历上这段空白期...在倒卖Token是吧？再见。': 'Interviewer: “This gap on your résumé… you were reselling tokens, right? Goodbye.”',
  '你就是那个rm -rf了数据库的实习生？*对方挂断了电话*': '“You are the intern who rm -rf’d the database?” *They hang up.*',
  '对方看着你工作经历只有实习的简历，开始沉默': 'They see that your résumé is all internships and fall silent.',
  '"我们需要3年以上工作经验的..." 你默默关上了页面': '“We need at least three years of experience…” You quietly close the page.',
  '"你做过什么项目？" "呃...大学课设算吗？" *已读不回*': '“What projects have you worked on?” “Uh… do college assignments count?” *Read, no reply.*',
  '对方瞥了一眼你的GitHub，0 contribution，微笑着说"回去等通知吧"': 'They glance at your GitHub—zero contributions—and smile: “We will let you know.”',
  '「Claude Opus 12.0」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“Claude Opus 12.0” has already been sold once today. (A token bought today can only be sold once today.)',
  '「GPT-8.5」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“GPT-8.5” has already been sold once today. (A token bought today can only be sold once today.)',
  '「Gemini 9.1 Pro」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“Gemini 9.1 Pro” has already been sold once today. (A token bought today can only be sold once today.)',
  '「DeepSeek v19」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“DeepSeek v19” has already been sold once today. (A token bought today can only be sold once today.)',
  '「Qwen 6.8 Max」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“Qwen 6.8 Max” has already been sold once today. (A token bought today can only be sold once today.)',
  '「Kimi K8」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“Kimi K8” has already been sold once today. (A token bought today can only be sold once today.)',
  '「咸鱼Cursor账号」今天已经卖过一次了~（当日买入的品种当天只可出售一次）': '“Xianyu Cursor account” has already been sold once today. (A token bought today can only be sold once today.)',
  '⚠️ 8 × H200 已报废（使用15天）。通过该GPU累计产出价值 ¥0，净利润 ¥-1,000,000': '⚠️ 8 × H200 has been scrapped after 15 days. Lifetime output was $0; net profit: −$100,000.',
};

const EARLY_RENT_TRANSLATIONS: Record<string, string> = {
  '🏠 房东惊喜地看着你：“这个月水电费我包了！”': '🏠 Your landlord looks delighted: “Utilities are on me this month!”',
  '🏠 房东笑得合不拢嘴：“小伙子真靠谱，有什么需要修的随时说！”': '🏠 Your landlord beams: “You are so reliable. Tell me whenever something needs fixing!”',
  '🏠 房东主动给你换了个新空调：“给你升级一下，别热着了”': '🏠 Your landlord replaces your AC: “An upgrade, so you do not overheat.”',
  '🏠 房东开始在朋友圈夸你：“我那个租户啊，比我儿子还准时”': '🏠 Your landlord praises you online: “My tenant is more punctual than my son.”',
  '🏠 房东居然给你送了一箱水果：“别嫌弃，自家种的”': '🏠 Your landlord brings you a box of fruit: “It is home-grown. Do not be shy.”',
  '🏠 房东把车位让给了你：“你用吧，我反正坐地铁”': '🏠 Your landlord gives you the parking spot: “Use it; I take the subway anyway.”',
  '🏠 房东开始给你介绍对象：“我侄女，大厂的，要不认识一下？”': '🏠 Your landlord tries matchmaking: “My niece works at a big tech firm. Want to meet?”',
  '🏠 房东悄悄给你交了三个月水电费：“嘘，别让其他租户知道”': '🏠 Your landlord quietly pays three months of utilities: “Shh, do not tell the other tenants.”',
  '🏠 房东年夜饭叫上了你：“一个人过啊年，来我家”': '🏠 Your landlord invites you to New Year dinner: “Spending it alone? Come to ours.”',
  '🏠 房东看你的眼神越来越温柔：“要不...你就别搬走了？”': '🏠 Your landlord looks at you more tenderly: “What if… you never moved out?”',
};

const PHRASE_TRANSLATIONS: Array<[string, string]> = [
  ['Token保质期', 'Token shelf life'],
  ['Token 保质期', 'Token shelf life'],
  ['过期自动清空', 'expire and are cleared automatically'],
  ['购入后请尽快使用', 'use them soon after purchase'],
  ['进入下一天', 'Next day'],
  ['项目需求刷新，Token价格刷新。', 'Jobs and token prices refresh.'],
  ['当前信誉', 'Reputation'],
  ['可见需求', 'Visible jobs'],
  ['信誉要求', 'Reputation required'],
  ['报酬', 'Reward'],
  ['买入', 'Buy'],
  ['卖出', 'Sell'],
  ['确认买入', 'Confirm purchase'],
  ['确认卖出', 'Confirm sale'],
  ['接单', 'Accept job'],
  ['确认接单', 'Accept job'],
  ['放弃', 'Cancel'],
  ['完成方式', 'How to complete'],
  ['自己写代码', 'Write it yourself'],
  ['手写代码', 'Hand-written code'],
  ['难度', 'Difficulty'],
  ['数量', 'Quantity'],
  ['最多', 'Max'],
  ['价格', 'Price'],
  ['合计支出', 'Total cost'],
  ['余额', 'Balance'],
  ['交易后余额', 'Balance after trade'],
  ['预计收入', 'Estimated income'],
  ['本次盈亏', 'P/L'],
  ['信誉影响', 'Reputation impact'],
  ['基础倒卖', 'Base reselling'],
  ['合计', 'Total'],
  ['临期 Token', 'Expiring tokens'],
  ['大量抛售', 'Bulk sale'],
  ['保质期提醒', 'Shelf-life reminder'],
  ['今日菜单', "Today's menu"],
  ['今日已饮用', 'Had today'],
  ['来一杯', 'Order one'],
  ['饮前精神', 'Spirit before'],
  ['饮后精神', 'Spirit after'],
  ['余额不足', 'Not enough cash'],
  ['店员提示', 'Barista note'],
  ['下一天', 'Next day'],
  ['资产', 'Assets'],
  ['房租', 'Rent'],
  ['操作', 'Actions'],
  ['下次房租', 'Next rent'],
  ['天后', 'days'],
  ['总资产估值', 'Estimated net worth'],
  ['本局变化', 'This run'],
  ['访问被拒绝', 'Access denied'],
  ['今日已接', 'Accepted today'],
  ['个需求', 'jobs'],
  ['交易税', 'trading tax'],
];

function moneyToDollars(raw: string): string {
  const value = Number(raw.replace(/,/g, ''));
  if (!Number.isFinite(value)) return raw;
  const dollars = Math.abs(value / 10).toLocaleString('en-US', { maximumFractionDigits: 2 });
  return value < 0 ? `-$${dollars}` : `$${dollars}`;
}

function daysLabel(raw: string): string {
  return `${raw} ${Number(raw) === 1 ? 'day' : 'days'}`;
}

function remainingDays(raw: string, noun: string): string {
  return Number(raw) === 1
    ? `1 day of ${noun} remains`
    : `${raw} days of ${noun} remain`;
}

function durationToEnglish(raw: string): string {
  const parts: string[] = [];
  const years = raw.match(/(\d+)年/);
  const months = raw.match(/(\d+)月/);
  const days = raw.match(/(\d+)天/);
  if (years) parts.push(`${years[1]} ${Number(years[1]) === 1 ? 'year' : 'years'}`);
  if (months) parts.push(`${months[1]} ${Number(months[1]) === 1 ? 'month' : 'months'}`);
  if (days) parts.push(`${days[1]} ${Number(days[1]) === 1 ? 'day' : 'days'}`);
  return parts.join(', ') || raw;
}

function convertEmbeddedCurrency(text: string): string {
  return text
    .replace(/¥(-?[\d,]+(?:\.\d+)?)/g, (_, n) => moneyToDollars(n))
    .replace(/([\d,]+(?:\.\d+)?)元/g, (_, n) => moneyToDollars(n))
    .replace(/([\d,]+(?:\.\d+)?)块/g, (_, n) => moneyToDollars(n));
}

/** Translate runtime messages that are assembled by the game store. */
export function translateDynamic(text: string, language: Language = currentLanguage): string {
  if (language === 'zh') return text;
  if (EXACT_TRANSLATIONS[text]) return convertEmbeddedCurrency(EXACT_TRANSLATIONS[text]);
  if (RUNTIME_EXACT_TRANSLATIONS[text]) return convertEmbeddedCurrency(RUNTIME_EXACT_TRANSLATIONS[text]);
  if (EARLY_RENT_TRANSLATIONS[text]) return convertEmbeddedCurrency(EARLY_RENT_TRANSLATIONS[text]);
  if (EVENT_TRANSLATIONS[text]) return convertEmbeddedCurrency(EVENT_TRANSLATIONS[text]);
  if (text.startsWith('📢 ') && EVENT_TRANSLATIONS[text.slice(3)]) return convertEmbeddedCurrency(`📢 ${EVENT_TRANSLATIONS[text.slice(3)]}`);

  let result = text;
  // Replace names embedded in store-generated messages before translating grammar.
  for (const [id, translation] of Object.entries(TASK_TRANSLATIONS)) {
    const source = [
      '写个TODO应用', '修个CSS居中Bug', '个人博客搭建', '小程序商城', '企业官网开发', 'SaaS管理后台', '直播带货系统', '电商后台系统', '社交App全栈', 'AI Agent平台', '量化交易系统', '重构屎山代码', '写个Chrome插件', '数据大屏可视化', '全栈低代码平台', '大模型训练', '前端小工具', '办公自动化脚本', '微信H5活动页', '在线教育平台', '物联网监控面板', '用户管理系统', '短视频推荐引擎', '实时协作文档', '支付中台系统', '分布式训练框架', '文生视频基模训练',
    ][Number(id)];
    if (source) result = result.split(source).join(translation.name);
  }
  for (const [id, translation] of Object.entries(TOKEN_TRANSLATIONS)) {
    const source = ['Claude Opus 12.0', 'GPT-8.5', 'Gemini 9.1 Pro', 'DeepSeek v19', 'Qwen 6.8 Max', 'Kimi K8', '咸鱼Cursor账号'][Number(id)];
    if (source) result = result.split(source).join(translation.name);
  }
  for (const [id, translation] of Object.entries(GPU_TRANSLATIONS)) {
    const source = ['8 × H200', '8 × B300', '8 × RTX 9090', '量子计算原型机'][Number(id)];
    if (source) result = result.split(source).join(translation.name);
  }
  for (const [source, translation] of Object.entries(BLOG_TOPIC_TRANSLATIONS)) {
    result = result.split(source).join(translation);
  }
  for (const achievement of ACHIEVEMENTS) {
    const translation = ACHIEVEMENT_TRANSLATIONS[achievement.id];
    if (!translation) continue;
    result = result.split(achievement.name).join(translation.name);
    result = result.split(achievement.description).join(translation.description);
  }
  // Translate complete message shapes before the generic unit replacements below.
  // Otherwise converting “3天” first would prevent the Chinese source pattern
  // from matching and leave half-translated notifications on screen.
  result = result.replace(/你躺在床上动不了\.\.\.还需要休息(\d+)天。精神\+([+-]?\d+)/, (_, days, spirit) => `You are stuck in bed… ${remainingDays(days, 'rest')}. SPIRIT +${spirit}`);
  result = result.replace(/⚠️ Token保质期到期，以下库存已清空：(.+)/, (_, inventory) =>
    `⚠️ Token shelf life ended; the following inventory was cleared: ${inventory.replace(/个/g, ' accounts').replace(/、/g, ', ')}`
  );
  result = result.replace(/🏠 房租¥([\d,]+)已自动扣除。/, (_, n) => `🏠 Rent ${moneyToDollars(n)} was charged automatically.`);
  result = result.replace(/🔌 电费 ¥([\d,]+) 已随房租扣除/, (_, n) => `🔌 Electricity ${moneyToDollars(n)} was charged with rent.`);
  result = result.replace(/💀 现金流断裂！你被迫变卖了所有资产来交房租。/, '💀 Cash flow collapsed! You had to liquidate everything to pay rent.');
  result = result.replace(/⚠️ 现金不足以支付房租 ¥([\d,]+)！宽限期还剩 (\d+) 天，再不交钱房东就要换锁了/, (_, n, days) => `⚠️ Not enough cash to pay rent ${moneyToDollars(n)}! ${remainingDays(days, 'grace')} before the landlord changes the locks.`);
  result = result.replace(/🔑 你已经欠了 ¥([\d,]+) 房租超过宽限期，房东换了锁，你被赶出了北京\.\.\./, (_, n) => `🔑 You owed ${moneyToDollars(n)} in rent past the grace period. The landlord changed the locks and evicted you.`);
  result = result.replace(/🎉 你的资产达到了200万！神秘场所已解锁/, '🎉 Your assets reached $200,000! The mysterious location is unlocked');
  result = result.replace(/⚠️ 你大量抛售了 (\d+)M (.+)，业内风评受损\.\.\.信誉-([\d]+)（每 1B 额外扣 5 点）/, (_, count, model, penalty) => `⚠️ You dumped ${count}M of ${model}, damaging your reputation… reputation −${penalty} (−5 for every extra 1B).`);
  result = result.replace(/✍️ 你花了一整天手写了“(.+?)”\.\.\.精神值-([\d]+)，获得¥([\d,]+)/, (_, task, spirit, reward) => `✍️ You spent the whole day hand-writing “${task}”… SPIRIT −${spirit}, earned ${moneyToDollars(reward)}.`);
  result = result.replace(/☕ 你喝了一杯星巴克，精神值\+([\d]+)。钱包-¥([\d,]+)/, (_, spirit, cost) => `☕ You had a Starbucks coffee. SPIRIT +${spirit}; wallet −${moneyToDollars(cost)}.`);
  result = result.replace(/🏠 房租已提前缴纳：¥([\d,]+)。下次交租日：第(\d+)天/, (_, rent, day) => `🏠 Rent ${moneyToDollars(rent)} paid early. Next rent: Day ${day}.`);
  result = result.replace(/🏠 房租已缴：¥([\d,]+)。下次交租日：第(\d+)天/, (_, rent, day) => `🏠 Rent ${moneyToDollars(rent)} paid. Next rent: Day ${day}.`);
  result = result.replace(/✍️ 你花了一天写了篇(.+?)，收获了(\d+)个赞，信誉\+([\d]+)/, '✍️ You spent a day writing $1, earned $2 likes, reputation +$3.');
  result = result.replace(/💸 缴纳交易税 ([\d]+)%：-¥([\d,]+)，到手¥([\d,]+)/, (_, pct, tax, net) => `💸 Trading tax ${pct}%: −${moneyToDollars(tax)}; received ${moneyToDollars(net)}.`);
  result = result.replace(/需求"(.+?)"高质量完成！客户很满意，多给了点钱。/, 'Job “$1” completed at high quality! The client loved it and paid a little extra.');
  result = result.replace(/需求"(.+?)"顺利完成，钱到账了。/, 'Job “$1” completed smoothly. The money is in.');
  result = result.replace(/需求"(.+?)"磕磕绊绊搞完了\.\.\.客户觉得马马虎虎，扣了点钱。/, 'Job “$1” scraped over the line… the client called it mediocre and docked your pay.');
  result = result.replace(/需求"(.+?)"失败了，客户很生气。/, 'Job “$1” failed. The client is furious.');
  result = result.replace(/(.+?)太烂了！你抽卡(\d+)次还是没完成"(.+?)"需求，你砸了键盘/, '$1 was awful! After $2 draws, “$3” still failed. You smashed the keyboard.');
  result = result.replace(/(.+?)坚持认为React是后端框架，你崩溃了/, '$1 insists React is a backend framework. You break down.');
  result = result.replace(/(.+?)连续输出了5000行注释，一行有效代码都没有/, '$1 output 5,000 lines of comments and not one useful line of code.');
  result = result.replace(/(.+?)把你的Python代码翻译成了古诗/, '$1 translated your Python into classical poetry.');
  result = result.replace(/(.+?)生成的代码跑起来了！然后它删除了你的数据库/, '$1 code ran! Then it deleted your database.');
  result = result.replace(/咸鱼的Cursor账号又挂了！愤怒的你点击了退款/, 'The Xianyu Cursor account died again. Furious, you clicked Refund.');
  result = result.replace(/Cursor弹窗："账号已封禁" 你联系卖家，发现已被拉黑/, 'Cursor says: “Account banned.” You contact the seller and find yourself blocked.');
  result = result.replace(/你买的账号里还残留着上个人的coding记录，你看得正起劲时，账号被ban了/, 'The account still has its previous owner’s coding history. Just as it gets interesting, the account is banned.');
  result = result.replace(/账号能用，但每生成 (\d+) 行代码就要重新登录一次，你放弃了"(.+?)"/, 'The account works, but it makes you log in after every $1 lines. You give up on “$2.”');
  result = result.replace(/Cursor官方公告：近期抓到一批黑产账号，你的邮箱刚好在里面/, 'Cursor announces a crackdown on black-market accounts. Your email happens to be on the list.');
  result = result.replace(/AI不仅完成了需求，还主动写了单元测试！甲方感动哭了/, 'AI finished the job and wrote unit tests on its own. The client cried with gratitude.');
  result = result.replace(/一次过！零Bug！甲方追加了奖金/, 'First try! Zero bugs! The client added a bonus.');
  result = result.replace(/AI输出的代码比你写的还优雅，你开始怀疑人生（但钱到手了）/, 'AI wrote cleaner code than you. You question your life choices, but the money arrived.');
  result = result.replace(/冒泡排序都不会写了哥，你感到失去AI就失去了一切/, 'You cannot even write bubble sort anymore. Without AI, you feel you have nothing.');
  result = result.replace(/你盯着屏幕上的for循环，忘记了i应该从0开始还是从1开始/, 'You stare at a for loop, unable to remember whether i starts at 0 or 1.');
  result = result.replace(/你尝试手写一个useEffect，三秒后你打开了GPT-8\.5/, 'You try to hand-write a useEffect. Three seconds later, you open GPT-8.5.');
  result = result.replace(/这个需求你3年前能1小时写完，现在你连文档都看不懂了/, 'You could finish this in an hour three years ago. Now you cannot even understand the docs.');
  result = result.replace(/你打开了VS Code，光标闪烁了五分钟，一个字也敲不出来/, 'You open VS Code. The cursor blinks for five minutes and you type nothing.');
  result = result.replace(/你试图回忆Promise的用法，脑子里却只有async\/await\.\.\.等等那也不对/, 'You try to remember Promises, but your mind only says async/await… wait, that is wrong too.');
  result = result.replace(/⚠️ (.+?) 已报废（使用(\d+)天）。通过该GPU累计产出价值 ¥([\d,]+)，净利润 ¥(-?[\d,]+)/, (_, gpu, days, output, profit) => `⚠️ ${gpu} was scrapped after ${daysLabel(days)}. Lifetime output was ${moneyToDollars(output)}; net profit: ${moneyToDollars(profit)}.`);
  result = result.replace(/♻️ 出售 (.+?)（已使用(\d+)天），回收 ¥([\d,]+)。净利润 ¥(-?[\d,]+)/, (_, gpu, days, recycle, profit) => `♻️ Sold ${gpu} after ${daysLabel(days)}. Recovered ${moneyToDollars(recycle)}; net profit: ${moneyToDollars(profit)}.`);
  result = result.replace(/📈 (.+?)的价格已经高到连接(简单|中等|进阶|专家)项目都亏本了\.\.\./, (_, model, difficulty) => `📈 ${model} is now so expensive that even ${({ 简单: 'easy', 中等: 'medium', 进阶: 'advanced', 专家: 'expert' } as Record<string, string>)[difficulty]} jobs lose money…`);
  result = result.replace(/📉 用(.+?)接(简单|中等|进阶|专家)项目(已经在亏本了|也开始亏本了)\.\.\./, (_, model, difficulty, phase) => `📉 Using ${model} for ${({ 简单: 'easy', 中等: 'medium', 进阶: 'advanced', 专家: 'expert' } as Record<string, string>)[difficulty]} jobs ${phase === '已经在亏本了' ? 'is already unprofitable' : 'is starting to lose money'}…`);
  result = result.replace(/「(.+?)」今天已经卖过一次了~（当日买入的品种当天只可出售一次）/, '“$1” has already been sold once today. (A token bought today can only be sold once today.)');
  result = result.replace(/你选择了退休。变卖了所有资产(?:（Token 卖出税 (\d+)%，扣除 ¥([\d,]+)）)?，带着¥([\d,]+)的积蓄躺平了。你坚持了(.+)/, (_, pct, tax, total, duration) => `You retired and liquidated all your assets${pct ? `; the ${pct}% token-sale tax cost ${moneyToDollars(tax)}` : ''}. You settled down with ${moneyToDollars(total)} in savings and lasted ${durationToEnglish(duration)}.`);
  result = result.replace(/🏖️ 你按下了退休按钮。带着¥([\d,]+)坚持了(.+?)。/, (_, total, duration) => `🏖️ You pressed the retirement button with ${moneyToDollars(total)} and lasted ${durationToEnglish(duration)}.`);
  result = result.replace(/💸 退休清算扣除 Token 卖出税 (\d+)%：-¥([\d,]+)/, (_, pct, tax) => `💸 Retirement settlement deducted a ${pct}% token-sale tax: −${moneyToDollars(tax)}.`);
  result = result.replace(/第(\d+)天/g, 'Day $1');
  result = result.replace(/第(\d+)周/g, 'Week $1');
  result = result.replace(/(\d+)天后/g, '$1 days from now');
  result = result.replace(/(\d+)天/g, '$1 days');
  result = result.replace(/(\d+)个月/g, '$1 months');
  result = result.replace(/(\d+)年/g, '$1 years');
  result = convertEmbeddedCurrency(result);
  result = result.replace(/🏅 成就解锁：/, '🏅 Achievement unlocked: ');
  result = result.replace(/精神值/g, 'SPIRIT');
  result = result.replace(/信誉/g, 'reputation');
  result = result.replace(/Token/g, 'Token');
  for (const [zh, en] of PHRASE_TRANSLATIONS) result = result.split(zh).join(en);
  // Common notification grammar used by the store. These replacements keep model/task names intact.
  result = result
    .replace(/欢迎来到/g, 'Welcome to ')
    .replace(/世界/g, 'world')
    .replace(/你/g, 'You')
    .replace(/获得/g, 'gained ')
    .replace(/损失/g, 'lost ')
    .replace(/失败/g, 'failed')
    .replace(/成功/g, 'succeeded')
    .replace(/完成/g, 'completed')
    .replace(/已经/g, 'already ')
    .replace(/今天/g, 'today')
    .replace(/明天/g, 'tomorrow')
    .replace(/房东/g, 'landlord')
    .replace(/房租/g, 'rent')
    .replace(/电费/g, 'electricity bill')
    .replace(/买入/g, 'Bought ')
    .replace(/卖出/g, 'Sold ')
    .replace(/购买/g, 'Bought ')
    .replace(/出售/g, 'Sold ')
    .replace(/解锁/g, 'Unlocked ')
    .replace(/成就/g, 'Achievement')
    .replace(/连续/g, 'for ')
    .replace(/次/g, ' times')
    .replace(/每周/g, 'weekly')
    .replace(/每月/g, 'monthly');
  result = result.replace(/^Buy(?=\S)/, 'Buy ').replace(/^Sell(?=\S)/, 'Sell ');
  return result;
}

/** Translate a static Chinese interface label using the active UI language. */
export function tx(text: string): string {
  return translateDynamic(text, currentLanguage);
}

export function localize<T extends { id: number; name: string; description: string }>(item: T, language: Language, table: Record<number, { name: string; description: string }>): T & { displayName: string; displayDescription: string } {
  const translation = table[item.id];
  return {
    ...item,
    displayName: language === 'en' && translation ? translation.name : (item as T & { name: string }).name,
    displayDescription: language === 'en' && translation ? translation.description : (item as T & { description: string }).description,
  };
}

export function localizeTask<T extends { id: number; name: string; description: string }>(task: T, language: Language): T {
  const translation = TASK_TRANSLATIONS[task.id];
  return {
    ...task,
    name: language === 'en' && translation ? translation.name : task.name,
    description: language === 'en' && translation ? translation.description : task.description,
  };
}

export function localizeAchievement<T extends { id: string; name: string; description: string }>(achievement: T, language: Language): T {
  const translation = ACHIEVEMENT_TRANSLATIONS[achievement.id];
  return {
    ...achievement,
    name: language === 'en' && translation ? translation.name : achievement.name,
    description: language === 'en' && translation ? translation.description : achievement.description,
  };
}

export function localizeSite<T extends { id: number; name: string; description: string }>(site: T, language: Language): T {
  const translation = SITE_TRANSLATIONS[site.id];
  return {
    ...site,
    name: language === 'en' && translation ? translation.name : site.name,
    description: language === 'en' && translation ? translation.description : site.description,
  };
}

export function localizeToken<T extends { id: number; name: string; description: string }>(token: T, language: Language): T {
  const translation = TOKEN_TRANSLATIONS[token.id];
  return {
    ...token,
    name: language === 'en' && translation ? translation.name : token.name,
    description: language === 'en' && translation ? translation.description : token.description,
  };
}

export function localizeGpu<T extends { id: number; name: string; description: string }>(gpu: T, language: Language): T {
  const translation = GPU_TRANSLATIONS[gpu.id];
  return {
    ...gpu,
    name: language === 'en' && translation ? translation.name : gpu.name,
    description: language === 'en' && translation ? translation.description : gpu.description,
  };
}

export function translateLabel(label: string, language: Language): string {
  if (language === 'zh') return label;
  if (EXACT_TRANSLATIONS[label]) return EXACT_TRANSLATIONS[label];
  let result = label;
  for (const [zh, en] of PHRASE_TRANSLATIONS) result = result.split(zh).join(en);
  return result;
}
