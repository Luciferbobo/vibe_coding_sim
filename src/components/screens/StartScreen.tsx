// 开始画面 - 简洁现代欢迎页
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { audioManager } from '../../utils/audioManager';

const RULES: Array<{ title: string; desc: string }> = [
  { title: 'VIBE CODING', desc: '购买token，使用vibe coding接单赚钱' },
  { title: 'BUY / SELL', desc: '或许...token也是一种可以倒卖的商品？' },
  { title: 'SPIRIT', desc: '健康的精神状态很重要' },
  { title: 'REPUTATION', desc: '程序员的信誉是宝贵的财富，请努力维护' },
  { title: 'RENT', desc: '每7天交一次房租' },
];

export function StartScreen() {
  const startNewGame = useGameStore((s) => s.startNewGame);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0); // 0-100

  const handleStart = async () => {
    setLoading(true);
    setProgress(0);
    await audioManager.preloadAll((loaded, total) => {
      setProgress(Math.round((loaded / total) * 100));
    });
    startNewGame();
  };

  return (
    <div className="w-full bg-gray-900 text-gray-100 flex flex-col" style={{ minHeight: 'var(--app-height, 100vh)' }}>
      <header className="px-4 sm:px-6 md:px-10 py-4 md:py-5 flex items-center justify-between border-b border-gray-800">
        <div className="flex items-center gap-2.5">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-500" />
          <span className="text-sm font-medium text-gray-300">
            Vibe Coding 模拟器
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 py-8 md:py-12">
        <div className="w-full max-w-3xl">
          {/* 标题 */}
          <div className="text-center">
            <p className="text-xs font-medium tracking-[0.25em] text-emerald-400 uppercase">
              Vibe Coding Simulator
            </p>
            <h1 className="mt-4 text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-50">
              在 AI 取代一切的时代
              <br />
              <span className="text-emerald-400">你还能活多久？</span>
            </h1>
            <p className="mt-6 text-base text-gray-400 max-w-xl mx-auto leading-relaxed">

            </p>
          </div>

          {/* 规则卡片 */}
          <div className="mt-8 md:mt-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
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

          {/* 开始按钮 / 加载进度 */}
          <div className="mt-8 md:mt-12 flex flex-col items-center gap-3">
            {!loading ? (
              <button
                onClick={handleStart}
                className="px-10 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-base font-medium shadow-lg shadow-emerald-900/30 transition-colors"
              >
                开始游戏
              </button>
            ) : (
              <div className="w-full max-w-xs flex flex-col items-center gap-2">
                <div className="w-full h-2.5 rounded-full bg-gray-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-150"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400">
                  加载资源中… {progress}%
                </p>
              </div>
            )}
            <p className="text-xs text-gray-500">
              
            </p>
          </div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 md:px-10 py-4 md:py-5 border-t border-gray-800 text-xs text-gray-500">
        <p className="text-center">
          据说公元21世纪，人类还需亲手敲下每一行代码、亲手在凌晨三点解决bug——他们管那段日子叫"青春"
        </p>
        <div className="mt-2 flex items-center justify-center">
          <span>Made by bobo</span>
        </div>
        <div className="mt-1 flex justify-end sm:hidden">
          <span className="text-gray-600">PC端体验更佳</span>
        </div>
      </footer>
    </div>
  );
}
