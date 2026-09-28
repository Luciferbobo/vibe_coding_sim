// 知乎 - 写技术博客恢复信誉
import { useGameStore } from '../../stores/gameStore';
import { audioManager } from '../../utils/audioManager';

export function ZhihuBlog() {
  const reputation = useGameStore((s) => s.reputation);
  const writeBlog = useGameStore((s) => s.writeBlog);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const language = useGameStore((s) => s.language);

  const disabled = restDaysLeft > 0;

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-4 py-3 md:px-6 md:py-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">{language === 'en' ? '✍️ Quora · Tech blog' : '✍️ 知乎 · 技术博客'}</h2>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          {language === 'en' ? 'Write a technical post to rebuild your industry reputation' : '写一篇技术博客，恢复你在业界的信誉'}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-6">
        <div className="max-w-lg mx-auto">
          {/* 当前信誉 */}
          <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4 md:p-5 mb-5 md:mb-6">
            <p className="text-sm text-gray-400">{language === 'en' ? 'Current reputation' : '当前信誉值'}</p>
            <p className="mt-2 text-3xl md:text-4xl font-bold text-blue-400 font-mono tabular">
              {reputation}
            </p>
            <div className="mt-2 w-full h-2 bg-gray-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all"
                style={{ width: `${reputation}%` }}
              />
            </div>
          </div>

          {/* 写博客按钮 */}
          <button
            onClick={() => {
              writeBlog();
              audioManager.play('write-blog');
            }}
            disabled={disabled}
            className={`w-full px-6 py-4 rounded-xl text-lg font-bold transition-all ${
              disabled
                ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                : 'bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white shadow-lg shadow-blue-900/30 hover:shadow-blue-800/40'
            }`}
          >
            {language === 'en' ? '📝 Write a technical post' : '📝 写一篇技术博客'}
          </button>
          <p className="mt-3 text-sm text-gray-400 text-center">
            {language === 'en' ? 'Uses one day · reputation +8–12' : '消耗1天时间，信誉 +8~12'}
          </p>

          {/* 趣味文案 */}
          <div className="mt-8 space-y-2">
            <p className="text-xs text-gray-600 italic">
              {language === 'en' ? '“A post called How to write hello world will do…”' : '"水一篇《如何写hello world》也是可以的..."'}
            </p>
            <p className="text-xs text-gray-600 italic">
              {language === 'en' ? '“Remember: on Quora, confidence is wealth.”' : '"记住：在知乎，自信就是财富"'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
