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
  const language = useGameStore((s) => s.language);
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
    <div className="w-full bg-gray-900 text-gray-100 flex flex-col overflow-hidden" style={{ height: 'var(--app-height, 100vh)' }}>
      <header className="px-4 sm:px-6 md:px-10 py-4 md:py-5 flex items-center justify-between border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2.5">
          <span className="text-sm font-medium text-gray-300">
            {language === 'en' ? 'Vibe Coding Simulator' : 'Vibe Coding 模拟器'}
          </span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-4 sm:px-6 md:px-10 py-4 md:py-6 overflow-hidden min-h-0">
        <div className="w-full max-w-3xl">
          {/* 标题 */}
          <div className="text-center">
            <p className="text-xs font-medium tracking-[0.25em] text-emerald-400 uppercase">
              Vibe Coding Simulator
            </p>
            <h1 className="mt-2 text-4xl sm:text-5xl font-bold tracking-tight text-gray-50">
              {language === 'en' ? 'When AI replaces everything' : '在 AI 取代一切的时代'}
              <br />
              <span className="text-emerald-400">{language === 'en' ? 'How long can you survive?' : '你还能活多久？'}</span>
            </h1>
          </div>

          {/* 规则卡片 */}
          <div className="mt-4 md:mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {RULES.map((r) => (
              <div
                key={r.title}
                className="rounded-xl bg-gray-800/60 border border-gray-700/70 p-3 md:p-4 hover:border-gray-600 transition-colors"
              >
                <p className="text-xs font-mono font-semibold tracking-wider text-emerald-400">
                  {r.title}
                </p>
                <p className="mt-1 text-sm text-gray-300 leading-snug">
                  {language === 'en' ? ({
                    '购买token，使用vibe coding接单赚钱': 'Buy tokens, use vibe coding, and earn from freelance jobs',
                    '或许...token也是一种可以倒卖的商品？': 'Maybe tokens are a commodity you can resell, too?',
                    '健康的精神状态很重要': 'A healthy state of mind matters',
                    '程序员的信誉是宝贵的财富，请努力维护': 'A programmer\'s reputation is precious. Protect it.',
                    '每7天交一次房租': 'Rent is due every seven days',
                  } as Record<string, string>)[r.desc] : r.desc}
                </p>
              </div>
            ))}
          </div>

          {/* 开始按钮 / 加载进度 */}
          <div className="mt-4 md:mt-8 flex flex-col items-center gap-2">
            {!loading ? (
              <button
                onClick={handleStart}
                className="px-10 py-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-base font-medium shadow-lg shadow-emerald-900/30 transition-colors"
              >
                {language === 'en' ? 'Start game' : '开始游戏'}
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
                  {language === 'en' ? 'Loading assets…' : '加载资源中…'} {progress}%
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      <footer className="px-4 sm:px-6 md:px-10 py-4 md:py-5 border-t border-gray-800 text-xs text-gray-500 shrink-0">
        <p className="text-center">
          {language === 'en'
            ? 'They say that in the 21st century, humans still had to type every line of code and fix bugs at 3 a.m. They called those days “youth.”'
            : '据说公元21世纪，人类还需亲手敲下每一行代码、亲手在凌晨三点解决bug——他们管那段日子叫"青春"'}
        </p>

        <div className="mt-2 flex items-center justify-center gap-6">
          <a
            href="https://thatbobo.com/vibe_coding_sim/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gray-500 hover:text-emerald-400 transition-colors font-mono tracking-wide"
          >
            vibecodingsim.com
          </a>
          <a
            href="https://github.com/Luciferbobo/vibe_coding_sim"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-gray-500 hover:text-emerald-400 transition-colors font-mono tracking-wide"
          >
            <svg
              viewBox="0 0 16 16"
              width="14"
              height="14"
              fill="currentColor"
              aria-hidden="true"
              className="shrink-0"
            >
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />
            </svg>
            Github
          </a>
        </div>

        <div className="mt-1 flex justify-end sm:hidden">
          <span className="text-gray-600">{language === 'en' ? 'Best on desktop' : 'PC端体验更佳'}</span>
        </div>
      </footer>
    </div>
  );
}
