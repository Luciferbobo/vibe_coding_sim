// 开始画面 - 简洁现代欢迎页
import { useGameStore } from '../../stores/gameStore';

const RULES: Array<{ title: string; desc: string }> = [
  { title: 'VIBE CODING', desc: '购买token，使用vibe coding接单赚钱' },
  { title: 'BUY / SELL', desc: '或许...token也是一种可以倒卖的商品？' },
  { title: 'SPIRIT', desc: '健康的精神状态很重要' },
  { title: 'REPUTATION', desc: '程序员的信誉是宝贵的财富，请努力维护' },
  { title: 'RENT', desc: '每7天交一次房租' },
];

export function StartScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-100 flex flex-col">
      <header className="px-6 sm:px-10 py-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-gray-300">
            Vibe Coding 模拟器
          </span>
        </div>
        <span className="text-xs text-gray-500">Made by bobo</span>
      </header>

      <main className="flex-1 flex items-center justify-center px-5 py-8 sm:px-10 sm:py-12">
        <div className="w-full max-w-3xl">
          {/* 标题 */}
          <div className="text-center">
            <p className="text-xs font-medium tracking-[0.25em] text-emerald-400 uppercase">
              Vibe Coding Simulator
            </p>
            <h1 className="mt-4 text-4xl sm:text-6xl font-bold tracking-tight text-gray-50">
              在 AI 取代一切的时代
              <br />
              <span className="text-emerald-400">你还能活多久？</span>
            </h1>
            <p className="mt-6 text-base text-gray-400 max-w-xl mx-auto leading-relaxed">

            </p>
          </div>

          {/* 规则卡片 */}
          <div className="mt-8 grid grid-cols-1 gap-3 sm:mt-12 sm:grid-cols-2 lg:grid-cols-5">
            {RULES.map((r) => (
              <div
                key={r.title}
                className="rounded-xl bg-gray-800/60 border border-gray-700/70 p-4 hover:border-gray-600 transition-colors"
              >
                <p className="text-xs font-mono font-semibold tracking-wider text-emerald-400">
                  {r.title}
                </p>
                <p className="mt-1.5 text-sm text-gray-300 leading-snug">
                  {r.desc}
                </p>
              </div>
            ))}
          </div>

          {/* 开始按钮 */}
          <div className="mt-12 flex flex-col items-center gap-3">
            <button
              onClick={startNewGame}
              className="w-full max-w-xs rounded-lg bg-emerald-600 px-10 py-3.5 text-base font-medium text-white shadow-lg shadow-emerald-900/30 transition-colors hover:bg-emerald-500"
            >
              开始游戏
            </button>
            <p className="text-xs text-gray-500">
              
            </p>
          </div>
        </div>
      </main>

      <footer className="px-6 sm:px-10 py-5 border-t border-gray-800 text-center text-xs text-gray-500">
        据说公元21世纪，人类还需亲手敲下每一行代码、亲手在凌晨三点解决bug——他们管那段日子叫“青春”
      </footer>
    </div>
  );
}
