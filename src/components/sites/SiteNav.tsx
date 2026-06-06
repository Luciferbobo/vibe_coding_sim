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

// 移动端侧边栏用的短名（减字仅保留识别度高的部分）
const SHORT_NAMES: Record<number, string> = {
  0: 'API商城',
  1: '闲鱼',
  2: '外包',
  3: '猎头',
  4: '推特',
  5: '公寓',
  6: '咖啡',
  7: '知乎',
  8: '成就',
  9: '退休',
  10: 'GPU',
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
      <div className="hidden md:block px-4 pt-4 pb-2">
        <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
          导航
        </p>
      </div>

      {restDaysLeft > 0 && (
        <div className="hidden md:block mx-4 mb-2 rounded-lg bg-red-500/10 border border-red-500/30 p-3 text-xs leading-snug text-red-300">
          <p className="font-semibold text-red-400">强制休息中</p>
          <p className="mt-1 text-red-300/80">
            还需躺平 {restDaysLeft} 天，点击"进入下一天"恢复
          </p>
        </div>
      )}

      <div className="flex-1 overflow-y-auto flex flex-col px-1 md:px-2 gap-1 md:gap-0 md:space-y-0.5 pt-1.5 md:pt-0">
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
              title={site.name}
              aria-label={site.name}
              className={`group w-full flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 rounded-md md:rounded-lg px-1 md:px-3 py-2 md:py-2.5 text-left transition-colors border-l-2 md:border-l-0 flex-1 md:flex-none min-h-[56px] md:min-h-0 ${
                active
                  ? 'bg-emerald-500/15 text-emerald-300 border-l-emerald-400 md:border-l-transparent'
                  : 'text-gray-300 hover:bg-gray-800 border-l-transparent'
              } ${disabled ? 'cursor-not-allowed opacity-40 hover:bg-transparent' : ''}`}
            >
              <span className="text-2xl md:text-xl leading-none shrink-0">{site.icon}</span>
              {/* 移动端：图标下方短名 */}
              <span className="md:hidden block w-full truncate text-center text-xs leading-tight font-medium">
                {SHORT_NAMES[site.id] ?? site.name}
              </span>
              {/* PC 端：名称 + 描述 */}
              <span className="hidden md:flex min-w-0 flex-1 flex-col">
                <span className="block truncate text-sm font-medium">
                  {site.name}
                </span>
                <span className="block truncate text-xs text-gray-500">
                  {site.description}
                </span>
              </span>
              <span
                className={`hidden md:inline-flex shrink-0 px-1.5 py-0.5 rounded text-[10px] font-medium ${TYPE_COLOR[site.type]}`}
              >
                {TYPE_LABEL[site.type]}
              </span>
            </button>
          );
        })}
      </div>

      {/* 进入下一天按钮 */}
      <div className="px-1.5 md:px-3 py-2 md:py-3 border-t border-gray-800">
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
          title="进入下一天"
          aria-label="进入下一天"
          className="w-full flex items-center justify-center gap-1 md:gap-1.5 px-1 md:px-4 py-2 md:py-3 rounded-lg bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white text-xs md:text-sm font-bold transition-all shadow-lg shadow-amber-900/30 hover:shadow-amber-800/40 whitespace-nowrap"
        >
          <span className="md:hidden whitespace-nowrap">☀️ 下一天</span>
          <span className="hidden md:inline-flex items-center gap-1.5 whitespace-nowrap">
            <span>☀️</span>
            <span>进入下一天</span>
          </span>
        </button>
        <div className="hidden md:block mt-2 text-[11px] text-gray-500 leading-snug px-1">
          <p>进入下一天：项目需求刷新，Token价格刷新。</p>
          <p className="mt-0.5">今日已接 <span className="text-amber-400 font-semibold">{tasksCompletedToday}</span>/{maxTasksPerDay} 个需求</p>
        </div>
      </div>
    </nav>
  );
}
