// 左侧网站导航
import { useGameStore } from '../../stores/gameStore';
import { SITES } from '../../data/sites';
import { audioManager } from '../../utils/audioManager';

const TYPE_LABEL: Record<string, string> = {
  market: '交易',
  task: '接单',
  info: '资讯',
  facility: '生活',
};

const TYPE_COLOR: Record<string, string> = {
  market: 'bg-amber-500/15 text-amber-400',
  task: 'bg-blue-500/15 text-blue-400',
  info: 'bg-violet-500/15 text-violet-400',
  facility: 'bg-emerald-500/15 text-emerald-400',
};

export function SiteNav() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const navigateToSite = useGameStore((s) => s.navigateToSite);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const tasksCompletedToday = useGameStore((s) => s.tasksCompletedToday);
  const maxTasksPerDay = useGameStore((s) => s.maxTasksPerDay);
  const gpuUnlocked = useGameStore((s) => s.gpuUnlocked);

  return (
    <nav className="flex h-full w-full flex-col overflow-hidden bg-gray-900">
      <div className="px-4 pt-4 pb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          导航
        </p>
      </div>

      {restDaysLeft > 0 && (
        <div className="mx-4 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs leading-snug text-red-300">
          <p className="font-semibold text-red-400">强制休息中</p>
          <p className="mt-1 text-red-300/80">
            还需躺平 {restDaysLeft} 天，点击"进入下一天"恢复
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto px-2 space-y-0.5">
        {SITES.filter((site) => {
          if (site.id === 10 && !gpuUnlocked) return false;
          return true;
        }).map((site) => {
          const active = site.id === currentSiteId;
          const disabled = restDaysLeft > 0;
          return (
            <button
              key={site.id}
              disabled={disabled}
              onClick={() => {
                audioManager.playSiteSound(site.id);
                navigateToSite(site.id);
              }}
              className={`group w-full flex items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300'
                  : 'text-gray-300 hover:bg-gray-800'
              } ${disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}`}
            >
              <span className="text-xl leading-none shrink-0">{site.icon}</span>
              <span className="min-w-0 flex-1">
                <span className="block truncate text-sm font-medium">
                  {site.name}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {site.description}
                </span>
              </span>
              <span
                className={`shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLOR[site.type]}`}
              >
                {TYPE_LABEL[site.type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 进入下一天按钮 */}
      <div className="px-3 py-3 border-t border-gray-800">
        <button
          onClick={() => {
            const prevRest = useGameStore.getState().restDaysLeft;
            audioManager.play('next-day');
            advanceDay();
            // 如果原本不在强制休息，下一天后变成强制休息，说明触发了精神崩溃
            const nextRest = useGameStore.getState().restDaysLeft;
            if (prevRest === 0 && nextRest > 0) {
              audioManager.play('spirit-crash');
            }
          }}
          className="w-full px-4 py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-sm font-bold transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40"
        >
          ☀️ 进入下一天
        </button>
        <div className="mt-2 text-[11px] text-gray-500 leading-snug px-1">
          <p>进入下一天：项目需求刷新，Token价格刷新。</p>
          <p className="mt-0.5">今日已接 <span className="text-amber-400 font-semibold">{tasksCompletedToday}</span>/{maxTasksPerDay} 个需求</p>
        </div>
      </div>
    </nav>
  );
}
