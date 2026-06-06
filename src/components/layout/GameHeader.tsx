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

/**
 * 移动端紧凑天数：超过 30 天后较短的“Yy/Mm/Dd”描述，避免顶栏拥挤。
 */
function formatGameDayCompact(day: number): string {
  if (day < 30) {
    return `D${day}`;
  }
  const years = Math.floor(day / 360);
  const remainingAfterYears = day % 360;
  const months = Math.floor(remainingAfterYears / 30);
  const days = remainingAfterYears % 30;
  if (years > 0) {
    return `Y${years}M${months + 1}D${days + 1}`;
  }
  return `M${months + 1}D${days + 1}`;
}

interface GameHeaderProps {
  /** 移动端点击 📊 按钮触发状态面板抽屉。PC 端不使用。 */
  onOpenStatusPanel?: () => void;
}

export function GameHeader({ onOpenStatusPanel }: GameHeaderProps = {}) {
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
    <header className="flex items-center justify-between gap-2 md:gap-6 px-3 md:px-6 h-12 md:h-14 border-b border-gray-800 bg-gray-900">
      {/* 左：站点信息 */}
      <div className="flex items-center gap-2 md:gap-3 min-w-0">
        <span className="text-lg md:text-xl leading-none">{site?.icon ?? '❓'}</span>
        <div className="min-w-0">
          <p className="text-sm font-semibold text-gray-100 truncate leading-tight">
            {site?.name ?? '未知场所'}
          </p>
          <p className="hidden md:block text-xs text-gray-500 truncate leading-tight">
            vibe coding 模拟器
          </p>
        </div>
      </div>

      {/* 右：天数 + 房租 + 休息状态 */}
      <div className="flex items-center gap-2 md:gap-6 text-sm">
        {restDaysLeft > 0 && (
          <span className="px-2 md:px-2.5 py-0.5 md:py-1 rounded-md bg-red-500/15 text-red-400 text-[10px] md:text-xs font-medium border border-red-500/30 whitespace-nowrap">
            强制躺平 {restDaysLeft} 天
          </span>
        )}

        {/* 天数：移动端紧凑格式 / PC 端完整格式 */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs md:text-base font-semibold text-gray-100 tabular">
            <span className="md:hidden">{formatGameDayCompact(day)}</span>
            <span className="hidden md:inline">{formatGameDay(day)}</span>
          </span>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-800" />

        {/* 房租：移动端去掉“房租”前缀 */}
        <div className="flex items-center gap-1.5 md:gap-2">
          <span className="hidden md:inline text-xs text-gray-500">房租</span>
          <span
            className={`font-mono text-xs md:text-sm font-semibold tabular ${
              rentUrgent ? 'text-red-400' : 'text-amber-400'
            }`}
          >
            ¥{rentAmount.toLocaleString()}
          </span>
          <span
            className={`text-[10px] md:text-xs ${
              rentUrgent ? 'text-red-400' : 'text-gray-500'
            }`}
          >
            · T-{daysToRent}d
          </span>
        </div>

        <div className="hidden md:block h-6 w-px bg-gray-800" />

        {/* 移动端：抽屉触发按钮 */}
        {onOpenStatusPanel && (
          <button
            onClick={onOpenStatusPanel}
            className="md:hidden inline-flex items-center gap-1 px-2 py-1 rounded-md bg-gray-800 hover:bg-gray-700 text-gray-200 transition-colors"
            title="查看资产面板"
            aria-label="查看资产面板"
          >
            <span className="text-sm leading-none">💵</span>
            <span className="text-[11px] font-medium">资产</span>
          </button>
        )}

        {/* 静音切换（线性 SVG，跨平台一致） */}
        <button
          onClick={toggleMute}
          className="inline-flex items-center justify-center h-8 w-8 md:h-9 md:w-9 rounded-md text-gray-300 hover:text-gray-100 hover:bg-gray-800 transition-colors"
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
