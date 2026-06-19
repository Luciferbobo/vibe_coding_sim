// 退休生活播报 - 时间线式记忆浮现，类似人生模拟器
//
// 设计语言：
//   · 延续 Retirement 入口的「夕阳-暮色」色板（amber → rose → ink）
//   · 左侧一根细长的发光时间线，事件像记忆一样从下往上一条条浮现
//   · serif 标题与 mono 周数形成「散文 vs 日志」的张力
//   · 不是普通的列表渲染——每条事件带轻微的位移、淡入与左侧节点脉冲

import { useEffect, useMemo, useRef, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';

interface RetirementEvent {
  week: number;
  text: string;
}

const EVENT_INTERVAL_MS = 1800;
const FINALE_HOLD_MS = 2000;

/**
 * 根据存活周数生成退休生活时间线事件
 *
 * 关键约束：所有里程碑事件都必须满足 week <= weeksAlive，
 * 即「玩家在世期间发生的事」才会出现在播报里。
 * 玩家若只能活 10 周，那 50 年永生那条永远不会被推进事件列表。
 */
function generateRetirementEvents(weeksAlive: number): RetirementEvent[] {
  const events: RetirementEvent[] = [];

  // === 极端兜底：连第一周都撑不到 ===
  if (weeksAlive < 1) {
    events.push({
      week: 1,
      text: '你关掉了所有代码编辑器，删除了 VS Code。终于自由——但还没等你享受退休，房租账单就敲响了门。',
    });
    return events;
  }

  // === 短期事件（玩家几乎都会经历） ===
  events.push({ week: 1, text: '你关掉了所有代码编辑器，删除了 VS Code。终于自由了。' });

  if (weeksAlive >= 2)
    events.push({ week: 2, text: '你开始每天睡到自然醒，觉得人生从未如此美好。' });

  if (weeksAlive >= 3)
    events.push({ week: 3, text: '你尝试学做饭，第一道菜糊了。但没关系，你有的是时间。' });

  if (weeksAlive >= 4)
    events.push({ week: 4, text: '你试着看了一本非技术书籍。看了三页就睡着了。' });

  if (weeksAlive >= 6)
    events.push({
      week: 6,
      text: '你在公园遇到了一个遛狗的大爷，他问你"小伙子怎么不上班？"',
    });

  if (weeksAlive >= 8)
    events.push({
      week: 8,
      text: '两个月了。你的积蓄在以肉眼可见的速度减少。你开始精打细算。',
    });

  if (weeksAlive >= 10)
    events.push({ week: 10, text: '你开始后悔当初没有多囤一些 Token……' });

  if (weeksAlive >= 13)
    events.push({
      week: 13,
      text: '三个月。你试图重新打开招聘网站。发现所有岗位都要求"熟练使用 AI 工具"。',
    });

  if (weeksAlive >= 17)
    events.push({
      week: 17,
      text: '你的前同事发了朋友圈："AI 帮我一天搞定了以前一周的活"。你默默点了个赞。',
    });

  if (weeksAlive >= 20)
    events.push({ week: 20, text: '五个月了。你开始认真考虑要不要重新找工作。' });

  if (weeksAlive >= 26)
    events.push({
      week: 26,
      text: '半年了。你开始怀念那些对着屏幕 debug 的日子。至少那时候你还有价值。',
    });

  if (weeksAlive >= 35)
    events.push({
      week: 35,
      text: '你的老同事告诉你，公司已经全面 AI 化了。"现在写代码的……都是机器人。"',
    });

  if (weeksAlive >= 40)
    events.push({ week: 40, text: '你开始做一些体力活贴补家用。搬砖不需要 Token。' });

  if (weeksAlive >= 52)
    events.push({
      week: 52,
      text: '一年了。你已经彻底忘了怎么写代码。偶尔梦到 console.log。',
    });

  // === 中期事件（1-5 年） ===
  if (weeksAlive >= 78)
    events.push({
      week: 78,
      text: '一年半了。你在小区里开始被叫"那个不上班的年轻人"。',
    });

  if (weeksAlive >= 104)
    events.push({ week: 104, text: '两年了。你已经习惯了这种生活。平静，但空虚。' });

  if (weeksAlive >= 156)
    events.push({
      week: 156,
      text: '三年。你在街上遇到了一个年轻程序员，他问你 Token 怎么买。你笑了笑，没有说话。',
    });

  if (weeksAlive >= 208)
    events.push({
      week: 208,
      text: '四年。你的积蓄还在支撑。你开始觉得自己做了正确的选择。',
    });

  if (weeksAlive >= 260)
    events.push({
      week: 260,
      text: '五年。世界已经完全变了。AI 写的代码比任何人类都好。你不再感到失落，因为所有人都一样了。',
    });

  // === 长期事件（5-50 年） ===
  if (weeksAlive >= 520)
    events.push({
      week: 520,
      text: '十年了。你甚至忘记了自己曾经是个程序员。生活很简单，也很安静。',
    });

  if (weeksAlive >= 780)
    events.push({ week: 780, text: '十五年。你开了个小花店。不需要 AI，不需要 Token。' });

  if (weeksAlive >= 1040)
    events.push({
      week: 1040,
      text: '二十年。你看着窗外的城市，一切都是 AI 在运转。你只是个旁观者。',
    });

  if (weeksAlive >= 1560)
    events.push({
      week: 1560,
      text: '三十年。你的花店变成了街坊邻居最喜欢的地方。原来不写代码也能活得不错。',
    });

  if (weeksAlive >= 2080)
    events.push({
      week: 2080,
      text: '四十年。你开始写回忆录，讲述那个人类还能写代码的时代。',
    });

  // === 超长期事件（50 年+，永生线，只有真正活到这把年纪才会浮现） ===
  if (weeksAlive >= 2600)
    events.push({
      week: 2600,
      text: '五十年。科学技术实现突破，AI 找到了人类细胞衰老的原因。人类现在永生了。',
    });

  if (weeksAlive >= 2860)
    events.push({
      week: 2860,
      text: '永生的消息传遍世界。你却感到一种奇怪的平静——活着，已经不再是稀缺品了。',
    });

  if (weeksAlive >= 3120)
    events.push({
      week: 3120,
      text: '永生后的第一个十年。你发现，不会死和活着，是两回事。',
    });

  if (weeksAlive >= 3380)
    events.push({
      week: 3380,
      text: '街上的人越来越少出门了。永生之后，大家都不急了。"明天再说吧"成了口头禅。',
    });

  if (weeksAlive >= 3640)
    events.push({
      week: 3640,
      text: '你试着回忆当年写代码的感觉。那种 deadline 前肾上腺素飙升的刺激……再也不会有了。',
    });

  if (weeksAlive >= 3900)
    events.push({
      week: 3900,
      text: '有人开始主动选择"关机"。永生太漫长了，有些人先走了。',
    });

  if (weeksAlive >= 4160)
    events.push({
      week: 4160,
      text: '你看着镜子里永远年轻的脸，想起了房东说的那句话："要不……你就别搬走了？"',
    });

  if (weeksAlive >= 4420)
    events.push({
      week: 4420,
      text: 'AI 已经能模拟完整的人类意识。你分不清身边的人是真人还是 AI 了。也许，这已经不重要了。',
    });

  if (weeksAlive >= 4680)
    events.push({
      week: 4680,
      text: '九十年了。你开始理解一件事：人类追求永生，不是因为怕死，是因为怕来不及。但现在来得及了……然后呢？',
    });

  if (weeksAlive >= 4940)
    events.push({
      week: 4940,
      text: '你坐在公园长椅上，旁边是一个 AI。你们聊了一整天。你突然觉得，也许当年被 AI 取代，并不是最坏的结局。',
    });

  if (weeksAlive >= 5200)
    events.push({
      week: 5200,
      text: '一百年。你还活着。代码早已不存在了，Token 也消失在了历史里。但你还记得那个夏天，你第一次打开编辑器的兴奋。那是属于人类的，最后的浪漫。',
    });

  // === 最终事件：钱花光的那一周 ===
  // 50年以上用特殊文案，50年以下用普通文案
  const finaleText = weeksAlive >= 2600
    ? `今天你打开了银行账户，看了看余额：¥0。这一天还是来了。曾经无限风光的你，也终会被通胀追上。`
    : `第 ${weeksAlive} 周。房租账单到了，你看了看余额：¥0。该来的终究会来。`;

  // 防御性去重：若某个里程碑恰好等于 weeksAlive，避免出现两条同 week 事件
  const hasFinaleWeek = events.some((e) => e.week === weeksAlive);
  if (!hasFinaleWeek) {
    events.push({
      week: weeksAlive,
      text: finaleText,
    });
  } else {
    // 用钱花光的语气替换掉同周里程碑，避免节奏被打断
    const idx = events.findIndex((e) => e.week === weeksAlive);
    events[idx] = {
      week: weeksAlive,
      text: finaleText,
    };
  }

  // 兜底：若存活时间极短（<5 周）但事件列表稀疏，确保至少有 3 条事件
  if (weeksAlive < 5 && events.length < 3) {
    if (!events.some((e) => e.week === 1)) {
      events.unshift({
        week: 1,
        text: '你关掉了所有代码编辑器，删除了 VS Code。终于自由了。',
      });
    }
    if (weeksAlive >= 2 && !events.some((e) => e.week === 2)) {
      events.push({
        week: 2,
        text: '你开始每天睡到自然醒——但银行余额提醒你，这种悠闲并不便宜。',
      });
    }
  }

  // 统一按 week 升序，保证时间线叙事顺序
  events.sort((a, b) => a.week - b.week);

  return events;
}

/**
 * 周数 → 拟人化的"过了多久"
 */
function formatElapsed(week: number): string {
  if (week >= 52) {
    const years = week / 52;
    if (years >= 10) return `第 ${Math.floor(years)} 个十年`;
    if (years >= 2) return `第 ${Math.floor(years)} 年`;
    return '第一年';
  }
  if (week >= 26) return '半年';
  if (week >= 4) return `第 ${Math.floor(week / 4)} 个月`;
  return `第 ${week} 周`;
}

export function RetirementScreen() {
  const retirementData = useGameStore((s) => s.retirementData);
  const finishRetirement = useGameStore((s) => s.finishRetirement);

  const weeksAlive = retirementData?.weeksAlive ?? 0;

  const events = useMemo(() => generateRetirementEvents(weeksAlive), [weeksAlive]);

  const [visibleCount, setVisibleCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [showFinale, setShowFinale] = useState(false);

  // 自动滚动到最新一条
  const tailRef = useRef<HTMLDivElement | null>(null);

  // 逐条出现
  useEffect(() => {
    if (visibleCount >= events.length) {
      setFinished(true);
      const t = setTimeout(() => setShowFinale(true), FINALE_HOLD_MS);
      return () => clearTimeout(t);
    }
    const timer = setTimeout(() => setVisibleCount((v) => v + 1), EVENT_INTERVAL_MS);
    return () => clearTimeout(timer);
  }, [visibleCount, events.length]);

  // 新事件出现后滚动到底部
  useEffect(() => {
    tailRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
  }, [visibleCount]);

  const handleSkip = () => {
    setVisibleCount(events.length);
    setFinished(true);
    setShowFinale(true);
  };

  const currentWeek = visibleCount > 0 ? events[visibleCount - 1].week : 0;
  const progressPct = Math.min(100, (currentWeek / Math.max(weeksAlive, 1)) * 100);

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-[#0c0a09] text-amber-50">
      {/* 暮色基底 */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-b from-[#1c1410] via-[#0c0a09] to-black" />
        <div
          className="absolute inset-0 opacity-70"
          style={{
            background:
              'radial-gradient(ellipse 90% 55% at 50% 115%, rgba(251,146,60,0.32) 0%, rgba(244,63,94,0.16) 35%, transparent 70%)',
          }}
        />
        <div
          className="absolute inset-0 opacity-30 mix-blend-overlay"
          style={{
            backgroundImage:
              "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='200' height='200'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 0.95  0 0 0 0 0.7  0 0 0 0 0.4  0 0 0 0.18 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")",
          }}
        />
        {/* 远山轮廓 */}
        <div
          className="absolute left-0 right-0 bottom-0 h-40"
          style={{
            background:
              'linear-gradient(to top, rgba(0,0,0,0.85), rgba(0,0,0,0.0))',
          }}
        />
      </div>

      <div className="relative z-10 mx-auto max-w-3xl px-4 sm:px-6 md:px-10 pt-8 md:pt-12 pb-24 md:pb-32">
        {/* 顶部 chrome：状态条 */}
        <div className="flex items-center justify-between text-[10px] tracking-[0.4em] uppercase text-amber-300/60">
          <span className="inline-flex items-center gap-2">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-60 animate-ping" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-amber-300" />
            </span>
            Retirement Broadcast
          </span>
          <span className="font-mono text-amber-300/40">
            W{currentWeek.toString().padStart(4, '0')} / {weeksAlive}
          </span>
        </div>

        {/* 标题 */}
        <header className="mt-8 md:mt-10">
          <p className="text-[11px] tracking-[0.5em] uppercase text-rose-300/60 font-light">
            chapter — after work
          </p>
          <h1
            className="mt-3 font-serif text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight bg-gradient-to-br from-amber-100 via-orange-200 to-rose-300 bg-clip-text text-transparent"
            style={{ fontFamily: '"Songti SC","STSong","Noto Serif SC",ui-serif,serif' }}
          >
            退休生活·正在直播
          </h1>
        </header>

        {/* 进度条 */}
        <div className="mt-8 flex items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-amber-300/40">
          <span className="font-mono">{formatElapsed(currentWeek || 1)}</span>
          <div className="relative flex-1 h-px bg-amber-200/10 overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-amber-300 via-orange-300 to-rose-300 transition-[width] duration-[1600ms] ease-out"
              style={{ width: `${progressPct}%` }}
            />
            <div
              className="absolute -top-1 -bottom-1 w-3 rounded-full bg-amber-200/30 blur-md transition-[left] duration-[1600ms] ease-out"
              style={{ left: `calc(${progressPct}% - 6px)` }}
            />
          </div>
          <span className="font-mono text-amber-300/30">finale</span>
        </div>

        {/* 时间线 */}
        <div className="relative mt-10 md:mt-12">
          {/* 主轴 */}
          <div className="absolute left-[20px] md:left-[26px] top-2 bottom-2 w-px bg-gradient-to-b from-amber-300/0 via-amber-200/30 to-rose-400/10" />
          {/* 主轴顶部光晕 */}
          <div
            className="absolute left-[16px] md:left-[22px] top-0 h-2 w-2 rounded-full bg-amber-200"
            style={{ boxShadow: '0 0 14px 2px rgba(252,211,77,0.55)' }}
          />

          <ol className="space-y-7 md:space-y-9">
            {events.slice(0, visibleCount).map((ev, idx) => {
              const isLatest = idx === visibleCount - 1;
              return (
                <li
                  key={`${ev.week}-${idx}`}
                  className="relative pl-12 md:pl-16 animate-fade-in-up"
                  style={{ animationDelay: '0ms' }}
                >
                  {/* 节点 */}
                  <span className="absolute left-[12px] md:left-[18px] top-1.5 flex h-3.5 w-3.5 items-center justify-center">
                    {isLatest && (
                      <span className="absolute inline-flex h-full w-full rounded-full bg-amber-300/60 animate-ping" />
                    )}
                    <span
                      className={`relative inline-flex h-2.5 w-2.5 rounded-full ${
                        isLatest
                          ? 'bg-amber-200'
                          : 'bg-amber-300/40 ring-1 ring-amber-200/30'
                      }`}
                      style={
                        isLatest
                          ? { boxShadow: '0 0 12px 2px rgba(252,211,77,0.6)' }
                          : undefined
                      }
                    />
                  </span>

                  {/* 时间标 */}
                  <div className="flex items-baseline gap-3 text-amber-300/60">
                    <span className="font-mono text-xs tracking-[0.18em]">
                      W·{ev.week.toString().padStart(3, '0')}
                    </span>
                    <span className="text-[10px] uppercase tracking-[0.3em] text-rose-200/40">
                      {formatElapsed(ev.week)}
                    </span>
                  </div>

                  {/* 文本 */}
                  <p
                    className={`mt-2 text-sm sm:text-base md:text-lg leading-[1.85] ${
                      isLatest ? 'text-amber-50' : 'text-amber-100/70'
                    }`}
                    style={{
                      fontFamily:
                        '"Noto Serif SC","Songti SC","STSong",ui-serif,serif',
                    }}
                  >
                    {ev.text}
                  </p>
                </li>
              );
            })}
          </ol>

          <div ref={tailRef} className="h-1" />

          {/* 加载中的下一条占位 */}
          {!finished && (
            <div className="mt-8 pl-12 md:pl-16 flex items-center gap-2 text-amber-300/40 text-xs">
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300/60 animate-pulse" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300/40 animate-pulse [animation-delay:200ms]" />
              <span className="inline-flex h-1.5 w-1.5 rounded-full bg-amber-300/20 animate-pulse [animation-delay:400ms]" />
              <span className="ml-2 italic font-light">时光正在前进……</span>
            </div>
          )}
        </div>

        {/* 终幕 */}
        {showFinale && (
          <div className="mt-12 md:mt-16 animate-fade-in-up">
            <div className="relative rounded-3xl border border-amber-500/20 bg-gradient-to-br from-stone-900/80 via-amber-950/20 to-rose-950/30 backdrop-blur-sm overflow-hidden">
              <div
                className="absolute -top-20 -right-20 h-56 w-56 rounded-full opacity-50 pointer-events-none"
                style={{
                  background:
                    'radial-gradient(circle, rgba(251,191,36,0.45), transparent 70%)',
                }}
              />
              <div className="relative px-5 md:px-8 py-8 md:py-10 text-center">
                <p className="text-[11px] tracking-[0.5em] uppercase text-rose-200/60">
                  fin.
                </p>
                <h2
                  className="mt-4 font-serif text-3xl md:text-4xl font-bold bg-gradient-to-br from-amber-100 to-rose-300 bg-clip-text text-transparent"
                  style={{
                    fontFamily:
                      '"Songti SC","STSong","Noto Serif SC",ui-serif,serif',
                  }}
                >
                  故事结束
                </h2>
                <p className="mt-3 text-sm text-amber-100/60 italic max-w-md mx-auto leading-relaxed">
                  你坚持了 {weeksAlive} 周，约 {weeksAlive * 7} 天。
                  现在，是时候翻到下一页了。
                </p>
                <button
                  onClick={finishRetirement}
                  className="group relative mt-7 inline-flex items-center gap-3 overflow-hidden rounded-full px-8 py-3 font-medium tracking-wide text-white shadow-2xl shadow-rose-900/40 transition-all hover:scale-[1.02] active:scale-[0.99]"
                  style={{
                    background:
                      'linear-gradient(135deg,#b45309 0%,#c2410c 35%,#be123c 100%)',
                  }}
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                  <span className="relative">查看终局战报</span>
                  <span className="relative">→</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 底部 chrome：跳过 */}
      {!showFinale && (
        <div className="fixed bottom-6 right-6 z-20">
          <button
            onClick={handleSkip}
            className="group inline-flex items-center gap-2 rounded-full border border-amber-300/20 bg-stone-900/70 backdrop-blur px-4 py-2 text-xs tracking-[0.25em] uppercase text-amber-200/60 hover:text-amber-100 hover:border-amber-300/40 transition-colors"
          >
            <span>skip</span>
            <span className="opacity-50 group-hover:opacity-100 transition-opacity">»»</span>
          </button>
        </div>
      )}
    </div>
  );
}
