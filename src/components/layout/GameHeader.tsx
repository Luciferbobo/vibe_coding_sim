// 顶部状态栏 - 简洁横条
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { SITES } from '../../data/sites';
import { audioManager } from '../../utils/audioManager';

/**
 * 格式化游戏内天数显示（day 从 1 开始）。
 * - 1 ~ 29 天：“第N天”
 * - 30 ~ 359 天：“第N月第M天”（每月 30 天）
 * - 360+ 天：“第Y年第N月第M天”（每年 360 天=12 月）
 */
function formatGameDay(day: number): string {
  if (day < 30) {
    return `第${day}天`;
  }
  const years = Math.floor(day / 360);
  const remainingAfterYears = day % 360;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;
  if (years > 0) {
    return `第${years}年第${months + 1}月第${days + 1}天`;
  }
  return `第${months + 1}月第${days + 1}天`;
}

export function GameHeader() {
  const day = useGameStore((s) => s.day);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);

  // 注意：SITES 数组的下标与 site.id 并不一致（例如 id=10 的 GPU 算力中心排在下标 2），
  // 必须用 find 按 id 查找，否则 GameHeader 左上角会显示成错位的站点名/图标。
  const site = SITES.find((s) => s.id === currentSiteId);
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

      {/* 右：天数 + 房租 + 休息状态 */}
      <div className="flex items-center gap-6 text-sm">
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

        {/* 房租 */}
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

        <div className="h-6 w-px bg-gray-800" />

        {/* 静音切换（线性 SVG，跨平台一致） */}
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
