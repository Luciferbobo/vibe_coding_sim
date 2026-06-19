// 顶部状态栏 - 简洁横条
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SITES } from '../../data/sites';
import { audioManager } from '../../utils/audioManager';

/**
 * 格式化游戏内天数显示：第N天
 */
function formatGameDay(day: number): string {
  return `第${day}天`;
}

function HeaderBar({
  label,
  value,
  max,
  barColor,
  textColor,
}: {
  label: string;
  value: number;
  max: number;
  barColor: string;
  textColor: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className="flex items-center gap-2 min-w-[140px]">
      <span className="text-xs text-gray-400 whitespace-nowrap">{label}</span>
      <div className="flex-1 h-2 rounded-full bg-gray-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-xs font-semibold tabular ${textColor} w-7 text-right`}>
        {Math.round(value)}
      </span>
    </div>
  );
}

export function GameHeader() {
  const day = useGameStore((s) => s.day);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const spirit = useGameStore((s) => s.spirit);
  const reputation = useGameStore((s) => s.reputation);

  const site = SITES.find((s) => s.id === currentSiteId);
  const daysToRent = Math.max(0, nextRentDay - day);
  const rentUrgent = daysToRent <= 3;

  const spiritBar =
    spirit > 60 ? 'bg-emerald-500' : spirit > 30 ? 'bg-amber-500' : 'bg-red-500';
  const spiritText =
    spirit > 60 ? 'text-emerald-400' : spirit > 30 ? 'text-amber-400' : 'text-red-400';
  const repBar =
    reputation > 60 ? 'bg-blue-500' : reputation > 20 ? 'bg-amber-500' : 'bg-red-500';
  const repText =
    reputation > 60 ? 'text-blue-400' : reputation > 20 ? 'text-amber-400' : 'text-red-400';

  // 静音状态
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());
  const toggleMute = () => {
    const next = !isMuted;
    audioManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <header className="flex items-center gap-4 px-6 h-14 border-b border-gray-800 bg-gray-900">
      {/* 左：站点信息 */}
      <div className="flex items-center gap-3 min-w-0 shrink-0">
        <span className="text-xl leading-none">{site?.icon ?? '❓'}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate leading-tight">
            {site?.name ?? '未知场所'}
          </p>
          <p className="text-xs text-gray-500 truncate leading-tight">
            vibe coding 模拟器
          </p>
        </div>
      </div>

      {/* 右侧全部内容 */}
      <div className="flex-1 flex items-center justify-end gap-5">
        {restDaysLeft > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 text-xs font-medium border border-red-500/30 whitespace-nowrap">
            强制躺平 {restDaysLeft} 天
          </span>
        )}

        {/* 天数 */}
        <span className="font-mono text-base font-semibold text-gray-100 tabular">
          {formatGameDay(day)}
        </span>

        <div className="h-6 w-px bg-gray-800" />

        {/* 精神 + 信誉 */}
        <div className="flex items-center gap-4">
          <HeaderBar label="精神" value={spirit} max={100} barColor={spiritBar} textColor={spiritText} />
          <HeaderBar label="信誉" value={reputation} max={100} barColor={repBar} textColor={repText} />
        </div>

        <div className="h-6 w-px bg-gray-800" />

        {/* 房租 */}
        <div className="flex items-center gap-1.5">
          <span className="text-xs text-gray-500">下次房租</span>
          <span
            className="font-mono text-sm font-semibold tabular text-red-400"
          >
            ¥{rentAmount.toLocaleString()}
          </span>
          <span
            className={`text-xs ${
              rentUrgent ? 'text-red-400' : 'text-gray-500'
            }`}
          >
            · {daysToRent}天后
          </span>
        </div>

        <div className="h-6 w-px bg-gray-800" />

        {/* 静音 */}
        <button
          onClick={toggleMute}
          className="inline-flex items-center justify-center h-9 w-9 rounded-md text-gray-300 hover:text-gray-100 hover:bg-gray-800 transition-colors"
          title={isMuted ? '取消静音' : '静音'}
          aria-label={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z" />
              <line x1="22" y1="9" x2="16" y2="15" />
              <line x1="16" y1="9" x2="22" y2="15" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M11 5L6 9H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h3l5 4V5z" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            </svg>
          )}
        </button>
      </div>
    </header>
  );
}
