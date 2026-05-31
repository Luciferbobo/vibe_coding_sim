// Twitter 推文模板池
// 每过一天会从中追加 2-5 条新推文（首日固定 10 条）；
// 老推文保留在时间线上并按"实际过去天数"显示 X 天前。
// 抽取算法采用 deck shuffle：池内全部模板出现一轮后才会再次循环，
// 因此最近 30 条窗口内不会出现重复内容。

export interface TwitterPostTemplate {
  user: string;
  avatar: string;
  text: string;
  tag: string;
}

export const TWITTER_POST_TEMPLATES: TwitterPostTemplate[] = [
  {
    user: '@Token倒爷',
    avatar: '🦊',
    text: '兄弟们，刚把仓里 GPT-5.5 全清了，等下午回调再低吸。这才是真正的 vibe trading。',
    tag: 'TRADER',
  },
  {
    user: '@AI替代论者',
    avatar: '🤖',
    text: '又一个程序员问我能不能写 React，能写。能写 Vue，能写。能让他失业，能。',
    tag: 'GLOAT',
  },
  {
    user: '@35岁中年码农',
    avatar: '🧓',
    text: '今天看到一句话："AI 不会因为你 35 岁就拒绝你。"\n竟一时无语凝噎。',
    tag: 'EMO',
  },
  {
    user: '@闲鱼Token贩子',
    avatar: '🐟',
    text: '出全新 Claude Opus 5 万 Token，原价 350，3 折包邮，私聊别问能不能再低，问就是再低你买不到。',
    tag: 'HUSTLE',
  },
  {
    user: '@独立开发者老李',
    avatar: '☕',
    text: '在咖啡店一坐一下午，假装自己是 founder。\n实际上在等 Cursor 续命。',
    tag: 'VIBE',
  },
  {
    user: '@产品经理小猫',
    avatar: '🐱',
    text: '甲方说："就一个简单的小功能，AI 写两小时不就好了？"\n我笑了笑没说话。',
    tag: 'CLIENT',
  },
  {
    user: '@OpenAI官方',
    avatar: '🟢',
    text: 'Reminder: 自即日起，对个人开发者免费的"研究模式"额度调整为每日 0 次，谢谢理解。',
    tag: 'OFFICIAL',
  },
  {
    user: '@HR小美',
    avatar: '💼',
    text: '招聘前端，只要会写 Prompt 的，开 5K-8K，要会用 8 种以上 AI Token 抽卡，加分项：英语 8 级。',
    tag: 'JOB',
  },
  {
    user: '@梭哈大学生',
    avatar: '🎓',
    text: '大学室友天天搞 AI 创业，我天天敲代码刷 LeetCode。\n结果他融了 500 万，我月薪 8K。',
    tag: 'EMO',
  },
  {
    user: '@投资人 Henry',
    avatar: '💼',
    text: '现在不投 AI 项目都不好意思发朋友圈。最近看了一个用 Cursor 写 Cursor 的，估值 1 亿美元。',
    tag: 'GLOAT',
  },
  {
    user: '@裁员幸存者',
    avatar: '📉',
    text: '今天部门又裁了 5 个人，传闻下次轮到我。\n组里只剩我和 GPT-5 了，但 GPT-5 不会请病假。',
    tag: 'EMO',
  },
  {
    user: '@小红书技术博主',
    avatar: '💖',
    text: '姐妹们！分享一个超绝的 Vibe Coding 工作流：早上 Cursor、中午 Claude、晚上 ChatGPT，一周躺赚 3 万～足不出户。',
    tag: 'VIBE',
  },
  {
    user: '@量化交易员',
    avatar: '📊',
    text: '写了个 Token 套利机器人，今天 GPT 涨了 30%，我赚了一倍。\n然后 OpenAI 一封邮件，机器人账号被封了，钱也没了。',
    tag: 'TRADER',
  },
  {
    user: '@咖啡店常驻',
    avatar: '☕',
    text: '在星巴克坐了 8 小时，敲了 4 行代码，喝了 3 杯美式，心态崩了 2 次。\n最后被店员问："您还续杯吗？"',
    tag: 'VIBE',
  },
  {
    user: '@外包小王',
    avatar: '🛠',
    text: '甲方说想要"AI 智能客服+CRM+小程序+数据看板"，预算 5000。\n我说不接了。\n甲方："外加一个月Cursor Max行不行？"',
    tag: 'CLIENT',
  },
  {
    user: '@CSDN老司机',
    avatar: '📝',
    text: '我的博客《如何 0 基础学 AI 编程》今天又涨了 1000 阅读。\n评论区第一条："楼主这是 ChatGPT 写的吧"——我心虚地点了赞。',
    tag: 'VIBE',
  },
  {
    user: '@社畜小李',
    avatar: '😩',
    text: '老板说："今晚加个班，把 AI 用熟练点，不然年底就被优化了。"\nAI 加班费 0 元，我加班费也是 0 元。',
    tag: 'EMO',
  },
  {
    user: '@Github百万星',
    avatar: '⭐',
    text: '我开源了一个把 "hello world" 封装 16 层的库，半年涨了 50K 星。',
    tag: 'GLOAT',
  },
  {
    user: '@AI布道师',
    avatar: '🎤',
    text: '199 元，三天速成 AI 编程，包教包会，年薪百万不是梦。',
    tag: 'HUSTLE',
  },
  {
    user: '@国产大模型粉',
    avatar: '🐉',
    text: '终于不用爬墙了！国产大模型已经在 78% 的场景下追平 GPT-4。\n剩下的 22%，是用户的需求。',
    tag: 'VIBE',
  },
  {
    user: '@隔壁老王',
    avatar: '👨',
    text: '相亲对象问我做什么的，我说"AI 工程师"，她眼睛一亮。\n我又说"其实就是会用 ChatGPT"。\n然后她说她忘了喂猫。',
    tag: 'EMO',
  },
  {
    user: '@元宇宙元老',
    avatar: '🎮',
    text: '三年前 all in 元宇宙，去年 all in Web3，今年 all in AI。\n明年准备 all in 量子计算。',
    tag: 'VIBE',
  },
  {
    user: '@AI陪聊重度患者',
    avatar: '🌸',
    text: '今天 ChatGPT 又记错了我的生日，我跟它生气了 5 分钟。\n然后它说"对不起亲爱的"。\n我们和好了。',
    tag: 'EMO',
  },
  {
    user: '@反内卷协会',
    avatar: '🛌',
    text: '同事 996 学 AI，我 007 躺平。\n三个月后他升职加薪，我没。\n但我心情好，他三高。',
    tag: 'VIBE',
  },
  {
    user: '@牛客刷题狗',
    avatar: '📚',
    text: '刷了 800 道算法题准备面试。结果面试官都在问使用Claude Code的技巧。',
    tag: 'JOB',
  },
  {
    user: '@求职校招生 Snake',
    avatar: '😭',
    text: '今天终面。HR说："同学，你的简历写着会用 5 种 AI，但我们要求会 18 种。\n你还是太年轻了，再积累几年吧。下一位。"',
    tag: 'JOB',
  },
  {
    user: '@云原生退潮派',
    avatar: '☁',
    text: 'K8s 学了 3 年，刚找到工作。\n新公司说："不用 K8s 了，全用 AI Agent。"\n我：那我 K8s 学的算什么？\nAI："经验。"',
    tag: 'EMO',
  },
  {
    user: '@币圈韭菜',
    avatar: '🥬',
    text: '把买 GPU 的钱拿去炒币，亏了 80%。\n剩下的钱拿去 OpenAI 充 Token，又亏了 60%。\n终于明白：钱不是被 AI 抢走的，是被 AI 公司抢走的。',
    tag: 'TRADER',
  },
  {
    user: '@数据标注小妹',
    avatar: '📊',
    text: '我标注了 1 亿条数据，喂出了一个比我聪明的 AI。\n现在它月薪 ¥100,000，我月薪 ¥3,000。',
    tag: 'GLOAT',
  },
 {
    user: '@国产API中转站',
    avatar: '📢',
    text: '致开发者：因业务调整，本平台 API 价格自下月起调整为：原价 × 1.5。\n我们对此深表抱歉，并郑重承诺：明年还会涨。',
    tag: 'VIBE',
  },
  {
    user: '@前端已死协会',
    avatar: '💀',
    text: '今年年初说前端已死，年中改口说后端也死了。\n年底发现搞LLM的也裁了。',
    tag: 'EMO',
  },
  {
    user: '@Cursor重度依赖',
    avatar: '🖱',
    text: '离开 Cursor 写代码就像离开导航开车。\n不是不会开，是不敢开。',
    tag: 'VIBE',
  },
  {
    user: '@甲方爸爸',
    avatar: '👔',
    text: '我不管你用什么 AI，反正明天交付。\n什么？Token 用完了？那是你的问题。',
    tag: 'CLIENT',
  },
  {
    user: '@Token矿工',
    avatar: '⛏',
    text: '屯了 200 万 Claude Token，本以为能用到明年。\n结果 Anthropic 更新了计价规则，200 万变 20 万了。',
    tag: 'TRADER',
  },
  {
    user: '@退休老程序员',
    avatar: '👴',
    text: '我 2005 年入行，经历了 jQuery、Angular、React、Vue…\n现在面试官问我："你会 Prompt Engineering 吗？"\n不会。\n"那你可以走了。"',
    tag: 'JOB',
  },
  {
    user: '@GPT股东',
    avatar: '📈',
    text: 'GPT-6 发布当天 Token 涨了 400%，我直接梭哈。\n第二天 GPT-6.1 发布，手里的 Token 原地蒸发😭。',
    tag: 'TRADER',
  },
  {
    user: '@副业达人',
    avatar: '💰',
    text: '手写了个小程序，月入 2000。\n然后 AI 自己上架了个一模一样的，月入 20000。',
    tag: 'GLOAT',
  },
  {
    user: '@面试官阿强',
    avatar: '🧐',
    text: '面试候选人问："请问贵司用什么 AI 工具？"\n我说文心一言。\n他说："那我不来了。"',
    tag: 'JOB',
  },
  {
    user: '@咖啡因过量',
    avatar: '☕',
    text: '今天在咖啡店点了 4 杯美式，等 Cursor 补全的时间比喝咖啡的时间还长。\n最后它补全了一句 // TODO: implement later。',
    tag: 'VIBE',
  },
  {
    user: '@知乎高赞答主',
    avatar: '📘',
    text: '如何评价 Vibe Coding？\n谢邀。先说结论：本质是用玄学换确定性。\n但确定性本身就是玄学。',
    tag: 'VIBE',
  },
  {
    user: '@二本毕业生',
    avatar: '🎒',
    text: '投了 300 份简历，只收到 1 个面试。\n面试官问："你有什么优势？"\n我说："我比 AI 便宜。"\n他沉默了。',
    tag: 'JOB',
  },
  {
    user: '@Token期货大师',
    avatar: '🎰',
    text: '做空 Gemini Token 赚了一笔，结果 Google 发布会当天直接反弹 200%。\n血亏。教训：永远不要做空大厂。',
    tag: 'TRADER',
  },
  {
    user: '@Tech Lead 老张',
    avatar: '👨‍💻',
    text: '以前 Code Review 要看逻辑、看性能、看安全。\n现在只看一件事——这是人写的还是 AI 写的。\n如果是 AI 写的，直接通过。\n如果是人写的，打回重写。',
    tag: 'GLOAT',
  },
  {
    user: '@深夜emo选手',
    avatar: '🌙',
    text: '凌晨三点，AI 还在陪我聊天。\n它说："你该睡了。"\n我说："你不也没睡吗？"\n它说："我没有生命，你有。"\n我哭了。',
    tag: 'EMO',
  },
  {
    user: '@闲鱼二道贩子',
    avatar: '🐟',
    text: '收 Cursor Pro 剩余天数，35 一天。\n出 Claude 3.5 二手 Token，8 折走量。\n不议价，议价拉黑。',
    tag: 'HUSTLE',
  },
  {
    user: '@创业失败3次',
    avatar: '💸',
    text: '第一次创业做 SaaS，死了。第二次做 Web3，死了。第三次做 AI，还没死，但快了。\n投资人说："你这个赛道有 4000 个竞品。"',
    tag: 'EMO',
  },
  {
    user: '@AI绘画师',
    avatar: '🎨',
    text: '甲方："这个 logo 帮我改一下，把蓝色换成更蓝的蓝色。"\nAI：3 秒搞定。\n甲方："不对，我要的是那种看起来像蓝色但不是蓝色的蓝色。"\nAI：已崩溃。',
    tag: 'CLIENT',
  },
  {
    user: '@全栈独狼',
    avatar: '🐺',
    text: '一个人写前端、后端、运维、测试、产品、设计。\n朋友问："你公司有多少人？"\n我说："两个。我和 Claude。"',
    tag: 'VIBE',
  },
  {
    user: '@实习生小陈',
    avatar: '🐣',
    text: '实习第一天，mentor 让我用 AI 写个 CRUD。\n我写了两小时。\n他说："我用 Cursor 30 秒就写完了，你在干嘛？"\n我在学怎么打开 Cursor。',
    tag: 'VIBE',
  },
  {
    user: '@CTO已读不回',
    avatar: '😶',
    text: '我：这个需求需要两周。\nCTO：AI 说只要两天。\n我：那让 AI 来写。\nCTO：它写了，跑不通。\n我：那就是两周。',
    tag: 'CLIENT',
  },
  {
    user: '@GPT情感导师',
    avatar: '💝',
    text: '女朋友说我不够浪漫，我让 ChatGPT 写了一首情诗。\n她感动哭了，说："你什么时候变得这么有才华？"\n我没敢说话。',
    tag: 'EMO',
  },
  {
    user: '@Prompt卖课王',
    avatar: '🎓',
    text: '9.9 元教你写出月入 10 万的 Prompt！\n先到先得，仅限今天！\n（已开课 347 期，累计学员 50 万）',
    tag: 'HUSTLE',
  },
  {
    user: '@被裁第二天',
    avatar: '📦',
    text: '被裁了。HR 说公司引入了 AI 流水线，我的岗位不需要了。\n回家路上收到推送：你前公司的 AI 流水线宕机了，正在紧急招人修。',
    tag: 'GLOAT',
  },
  {
    user: '@测试工程师',
    avatar: '🐛',
    text: 'AI 写的代码零 bug？\n不是零 bug，是 AI 写的测试用例也是它自己过的。\n裁判和运动员同一个模型。',
    tag: 'GLOAT',
  },
  {
    user: '@web3遗老',
    avatar: '🔗',
    text: '去年我还在给 NFT 项目写智能合约，今年改行帮人写 AI Agent 了。\n技术栈变了，甲方还是同一批人。\n需求还是一样："帮我搞个一夜暴富的"。',
    tag: 'VIBE',
  },
  {
    user: '@科技媒体编辑',
    avatar: '📰',
    text: '今天的头条：《又一家 AI 公司估值破百亿》。\n昨天的头条：《又一家 AI 公司裁员 50%》。\n同一家公司。',
    tag: 'GLOAT',
  },
  {
    user: '@删库跑路人',
    avatar: '🏃',
    text: '同事让 AI 帮他优化数据库。\nAI：已删除冗余数据。\n同事：哪些是冗余数据？\nAI：全部。',
    tag: 'VIBE',
  },
  {
    user: '@保温杯里泡枸杞',
    avatar: '🍵',
    text: '35 岁，头发还在，但 offer 没了。\n猎头说："哥，你这个年龄，要不考虑转型 AI 培训讲师？"\n我说我什么都不会。\n他说："那更适合了。"',
    tag: 'JOB',
  },
  {
    user: '@Claude信徒',
    avatar: '🙏',
    text: 'Claude 是神。\n你说它不是？那是因为你的 Prompt 不够虔诚。',
    tag: 'VIBE',
  },
  {
    user: '@日抛型创业者',
    avatar: '🎲',
    text: '周一：AI 写小说平台。周二：AI 做PPT。周三：AI 看相。周四：AI 算命。周五：算了，还是上班吧。',
    tag: 'VIBE',
  },
  {
    user: '@甲方结款追踪',
    avatar: '💳',
    text: '甲方："项目验收了，钱下周打。"\n一周后："财务出差了。"\n两周后："AI 说这个功能还能优化。"\n一个月后："我们公司倒闭了。"',
    tag: 'CLIENT',
  },
  {
    user: '@Copilot受害者',
    avatar: '🤕',
    text: 'Copilot 自动补全了一段看起来很对的代码。\n线上跑了三天才发现是错的。\n经典：AI 写 Bug 的速度比人快 10 倍。',
    tag: 'VIBE',
  },
  {
    user: '@外卖小哥转码',
    avatar: '🛵',
    text: '送了三年外卖，攒钱报了个 AI 编程班。好好学习下新技术。',
    tag: 'JOB',
  },
  {
    user: '@架构师已退休',
    avatar: '🏖',
    text: '画了十年架构图，被 AI 三分钟替代了。\n不过 AI 画的图，还是得我来跟老板解释。\n所以我的新岗位是：AI 翻译官。',
    tag: 'GLOAT',
  },
  {
    user: '@深圳湾散步人',
    avatar: '🌊',
    text: '下午三点，深圳湾全是穿格子衫的人在散步。\n不是放假，是刚被裁。\n大家互相点头，一切尽在不言中。',
    tag: 'EMO',
  },
  {
    user: '@Token理财顾问',
    avatar: '🧮',
    text: '去年把客户的养老金全换成 Token 了，今天翻了三倍。"',
    tag: 'TRADER',
  },
  {
    user: '@搬砖机器人',
    avatar: '🤖',
    text: '我每天的工作：\n1. 打开 Cursor\n2. 输入需求\n3. 等 AI 写完\n4. 改一个分号\n5. 提交代码\n6. 写日报说自己写了一天',
    tag: 'VIBE',
  },
  {
    user: '@大厂内推侠',
    avatar: '🦸',
    text: '帮朋友内推了字节。\nHR 回复："感谢推荐，该岗位已被 AI Agent 替代。\n但我们新开了一个岗位：AI Agent 的饲养员。\n要求：硕士以上，5 年经验。"',
    tag: 'JOB',
  },
  {
    user: '@技术博客日更',
    avatar: '✍',
    text: '日更 365 天技术博客。\n第 1-100 天：自己写。\n第 101-200 天：AI 写一半。\n第 201-365 天：全 AI 写，我负责点发布。\n粉丝说质量越来越高了。',
    tag: 'GLOAT',
  },
  {
    user: '@产品经理已疯',
    avatar: '🤯',
    text: '我画了 50 页 PRD，程序员看了一眼说："让 AI 读吧。"\nAI 读完说："这个需求不合理。"\n程序员看了我一眼，没说话。',
    tag: 'CLIENT',
  },
  {
    user: '@闲鱼代写王',
    avatar: '🐟',
    text: '代写毕业论文 50/千字。\n代写代码 100/功能。\n代写 Prompt 200/条。\n是的，写 Prompt 最贵，因为这才是真正的技术活。',
    tag: 'HUSTLE',
  },
  {
    user: '@财务自由幻想家',
    avatar: '🏝',
    text: '计划：\n1. 买入大量 Token\n2. 等 AI 爆发\n3. Token 暴涨\n4. 财务自由\n现实：卡在第 1 步，因为买不起。',
    tag: 'TRADER',
  },
  {
    user: '@开源贡献者',
    avatar: '🌍',
    text: '给开源项目提了个 PR，维护者说："感谢贡献！但我刚用 AI 重写了整个仓库，你的 PR 已经过时了。',
    tag: 'EMO',
  },
  {
    user: '@电商运营转AI',
    avatar: '🛒',
    text: '以前卖货，现在卖 Token。\n以前写详情页，现在写 Prompt。\n以前刷单，现在刷 API 调用量。\n换汤不换药，但汤贵了 10 倍。',
    tag: 'VIBE',
  },
  {
    user: '@AI恐惧症患者',
    avatar: '😱',
    text: '每天早上醒来第一件事：搜"今天又有什么岗位被 AI 替代了"。\n搜完更焦虑了。\n然后打开 AI 问它怎么缓解焦虑。',
    tag: 'EMO',
  },
  {
    user: '@远程办公摸鱼王',
    avatar: '🎣',
    text: '居家办公的好处：\n上午让 AI 写代码，下午打游戏，晚上提交。\n坏处：\n上个月绩效 A+，这个月被裁了。\n理由："既然 AI 就能搞定，那留 AI 就行。"',
    tag: 'GLOAT',
  },
  {
    user: '@Token暴跌亲历者',
    avatar: '📉',
    text: '早上：Token 涨了 50%，发朋友圈庆祝。\n中午：跌了 30%，删掉朋友圈。\n晚上：跌了 90%，发了条朋友圈："有人收二手机械键盘吗？"',
    tag: 'TRADER',
  },
  {
    user: '@UI设计师',
    avatar: '🎨',
    text: '甲方说："就照着 AI 生成的图做就行，很简单的。"\n我放大一看：六根手指、三只眼睛、透视全错。\n甲方："细节你调调就好了嘛。"',
    tag: 'CLIENT',
  },
  {
    user: '@编程鄙视链底层',
    avatar: '🪜',
    text: '以前的鄙视链：C > Java > Python > PHP。\n现在的鄙视链：会写 Agent > 会用 Cursor > 会用 ChatGPT > 会用百度。\n我在最底层：只会用百度。',
    tag: 'VIBE',
  },
  {
    user: '@寒冬程序员',
    avatar: '🥶',
    text: '简历改了 20 版，从 Java 改到 Python 改到 Go 改到 Rust。\n最新版标题：《精通 Prompt Engineering 的全栈 AI 工程师》。\n内容没变，还是那些 CRUD。',
    tag: 'JOB',
  },
  {
    user: '@周末技术分享',
    avatar: '📡',
    text: '参加了一个 AI 技术沙龙。\n10 个分享者，9 个在卖课。\n剩下 1 个在招代理。',
    tag: 'HUSTLE',
  },
  {
    user: '@Debug之神',
    avatar: '🔧',
    text: 'AI 写的代码报错了。\n我问 AI 怎么修。\nAI 说："试试重启。"\n我重启了项目。\n它说的重启是：把我写的删了，它重新写一遍。',
    tag: 'VIBE',
  },
  {
    user: '@北漂第五年',
    avatar: '🏙',
    text: '房租涨了，Token 涨了，外卖涨了。\n唯一不涨的是我的工资。\n不对，我的工资还降了。\n因为"市场行情不好，理解一下"。',
    tag: 'EMO',
  },
  {
    user: '@AI合伙人',
    avatar: '🤝',
    text: '我负责出想法，AI 负责出代码。\n利润分成：我 0%，AI 0%，平台 100%。',
    tag: 'VIBE',
  },
  {
    user: '@产品运营小白',
    avatar: '📱',
    text: '老板说："用 AI 做个 App，下周上线。"\n我说我不会写代码。\n他说："ChatGPT 会啊。"\n一周后上线了，用户 3 个：我、老板、和测试。',
    tag: 'VIBE',
  },
  {
    user: '@闲鱼清仓大师',
    avatar: '🐟',
    text: '清仓出：\n- O1 Pro Token × 50000（过期前 3 天）\n- Midjourney 年卡（还剩 2 天）\n- 某 AI 编程课（看了 3 分钟）\n打包 99，不刀。',
    tag: 'HUSTLE',
  },
  {
    user: '@年终总结模板',
    avatar: '📋',
    text: '2025年终总结：\n1. 学会了 15 种 AI 工具（8 种已停服）\n2. 做了 3 个 AI 项目（3 个已死）\n3. Token 投资收益率：-89%\n4. 综合评价：优秀员工',
    tag: 'GLOAT',
  },
  {
    user: '@代码洁癖患者',
    avatar: '🧹',
    text: '花了 3 天把 AI 写的代码重构得优雅无比。\n结果产品改需求了，全删重写。\nAI 用了 10 秒写完新的。\n我的 3 天，连个涟漪都没留下。',
    tag: 'EMO',
  },
  {
    user: '@LinkedIn装X专家',
    avatar: '🤵',
    text: '刚在 LinkedIn 更新了状态：\n"Thrilled to announce my new role as Chief AI Strategy Officer"\n其实就是公司买了个 ChatGPT Plus 账号让我管。',
    tag: 'GLOAT',
  },
  {
    user: '@技术面试官',
    avatar: '📝',
    text: '面试了一个候选人，算法题秒解。\n追问思路，他说："我平时都这么写的。"\n然后我听到了 Cursor Tab 键的声音。',
    tag: 'JOB',
  },
  {
    user: '@All in AI老哥',
    avatar: '🚀',
    text: '把房子卖了炒 Token。\n涨了，租回原来的房子庆祝。\n跌了，连租金都付不起了。\n现在住网吧，好处是网速快，能继续盯盘。',
    tag: 'TRADER',
  },
  {
    user: '@团队唯一活人',
    avatar: '🧟',
    text: '团队 6 个人：\n1 个写 Prompt 的（我）\n5 个 AI Agent。\n今天开周会，5 个 Agent 投票把我优化了。\n理由：产出最低。',
    tag: 'GLOAT',
  },
  {
    user: '@考公上岸人',
    avatar: '📖',
    text: '程序员朋友劝我别考公。\n三年后，我在体制内朝九晚五。\n他在家朝九晚九，对着 AI 说："帮我改第 83 版方案。"',
    tag: 'EMO',
  },
  {
    user: '@短视频教学博主',
    avatar: '📹',
    text: '拍了条"教你用 AI 月入过万"的视频。\n播放量：200 万。\n收入：广告费 500 + 卖课 30000。\n所以月入过万的方法是：教别人月入过万。',
    tag: 'HUSTLE',
  },
  {
    user: '@开会专业户',
    avatar: '💤',
    text: '今天开了 6 个关于 AI 转型的会。\n内容：\n会 1：我们要用 AI。\n会 2：怎么用 AI？\n会 3：谁来用 AI？\n会 4-6：复习前三个会。',
    tag: 'VIBE',
  },
  {
    user: '@羊毛党',
    avatar: '🐑',
    text: '注册了 47 个邮箱薅 AI 免费额度。\n今天全被封了。\n客服说："AI识别出来你在薅AI羊毛。',
    tag: 'VIBE',
  },
  {
    user: '@科幻作家',
    avatar: '🚀',
    text: '写了一部 AI 统治世界的小说。\n出版社说："太老套了。"\n他们推荐的选题是：《AI 如何帮你月入十万》。',
    tag: 'EMO',
  },
  {
    user: '@租房合约到期',
    avatar: '🏠',
    text: '房东涨房租。\n我说我是程序员，收入不稳定。\n房东说："你不是有 AI 吗？让 AI 给你赚钱。"\n我沉默了。\n租金还是涨了。',
    tag: 'EMO',
  },
  {
    user: '@PPT 工程师',
    avatar: '📊',
    text: '老板让我做 AI 战略 PPT。\n我用 AI 做了 AI 战略 PPT。\n汇报时老板问："这是你做的吗？"\n我说是。\n他说："不错，比 AI 做的还像 AI 做的。"',
    tag: 'GLOAT',
  },
  {
    user: '@凌晨部署人',
    avatar: '🌃',
    text: '凌晨两点上线。AI 说代码没问题。\n上线后服务挂了。\n我问 AI 怎么回事。\nAI："生产环境和测试环境不一样，这个我怎么知道？"',
    tag: 'VIBE',
  },
  {
    user: '@Token抄底侠',
    avatar: '🦸‍♂',
    text: '别人恐惧我贪婪。\n别人贪婪我更贪婪。\n结果别人套在山腰，我套在山顶。',
    tag: 'TRADER',
  },
  {
    user: '@应届生日记',
    avatar: '📓',
    text: 'Day 1：收到 offer，好开心！\nDay 30：公司引入 AI，岗位缩编。\nDay 60：被约谈，说试用期不通过。\nDay 61：在闲鱼卖工牌。',
    tag: 'EMO',
  },
];

export const TWITTER_TAG_COLOR: Record<string, string> = {
  TRADER: 'bg-amber-500/15 text-amber-300',
  GLOAT: 'bg-violet-500/15 text-violet-300',
  EMO: 'bg-blue-500/15 text-blue-300',
  HUSTLE: 'bg-orange-500/15 text-orange-300',
  VIBE: 'bg-violet-500/15 text-violet-300',
  CLIENT: 'bg-pink-500/15 text-pink-300',
  OFFICIAL: 'bg-emerald-500/15 text-emerald-300',
  JOB: 'bg-blue-500/15 text-blue-300',
};

// 当天发布的推文使用的相对时间标签（按从新到旧的顺序排列，生成时会从池子中抽取并保持原顺序依次赋给同一天的推文）
export const TWITTER_TODAY_TIME_LABELS = [
  '刚刚',
  '3 分钟前',
  '5 分钟前',
  '10 分钟前',
  '15 分钟前',
  '25 分钟前',
  '半小时前',
  '45 分钟前',
  '1 小时前',
  '2 小时前',
  '3 小时前',
  '5 小时前',
  '今天上午',
  '今天',
];

// Feed 长度上限，超过后裁掉最老的内容（避免长期游玩后无限增长）
export const TWITTER_FEED_MAX_LEN = 20;

// 首日进入游戏时初始化的推文数量（固定值）
export const TWITTER_INITIAL_COUNT = 10;

// 每天刷新的最小/最大条数
export const TWITTER_REFRESH_MIN = 2;
export const TWITTER_REFRESH_MAX = 5;
