// 顶部状态栏 - 简洁横条
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SITES } from '../../data/sites';
import { formatDay } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';

export function GameHeader() {
  const day = useGameStore((s) => s.day);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);

  const site = SITES[currentSiteId];
  const daysToRent = Math.max(0, nextRentDay - day);
  const rentUrgent = daysToRent <= 3;

  // 静音状态 - 从 audioManager 初始化
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());
  const toggleMute = () => {
    const next = !isMuted;
    audioManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <header className="flex items-center justify-between gap-6 px-6 h-14 border-b border-gray-800 bg-gray-900">
      {/* 左：站点信息 */}
      <div className="flex items-center gap-3 min-w-0">
        <span className="text-xl leading-none">{site.icon}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate leading-tight">
            {site.name}
          </p>
          <p className="text-xs text-gray-500 truncate leading-tight">
            vibe coding 模拟器
          </p>
        </div>
      </div>

      {/* 右：天数 + 房租 + 休息状态 */}
      <div className="flex items-center gap-6 text-sm">
        {restDaysLeft > 0 && (
          <span className="px-2.5 py-1 rounded-md bg-red-500/15 text-red-400 text-xs font-medium border border-red-500/30">
            强制躺平 {restDaysLeft} 天
          </span>
        )}

        <div className="hidden sm:flex items-center gap-2">
          <span className="font-mono text-base font-semibold text-gray-100 tabular">
            {formatDay(day)}
          </span>
        </div>

        <div className="h-6 w-px bg-gray-800 hidden sm:block" />

        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-500">房租</span>
          <span
            className={`font-mono text-sm font-semibold tabular ${
              rentUrgent ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            ¥{rentAmount.toLocaleString()}
          </span>
          <span
            className={`text-xs ${
              rentUrgent ? 'text-red-400' : 'text-gray-500'
            }`}
          >
            · T-{daysToRent}d
          </span>
        </div>

        <div className="h-6 w-px bg-gray-800 hidden sm:block" />

        {/* 静音切换 */}
        <button
          onClick={toggleMute}
          className="text-xl hover:opacity-80 transition-opacity"
          title={isMuted ? '取消静音' : '静音'}
          aria-label={isMuted ? '取消静音' : '静音'}
        >
          {isMuted ? '🔇' : '🔊'}
        </button>
      </div>
    </header>
  );
}
