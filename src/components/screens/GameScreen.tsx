// 主游戏界面 - 三栏布局
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { GameHeader } from '../layout/GameHeader';
import { StatusPanel } from '../layout/StatusPanel';
import { SiteNav } from '../sites/SiteNav';
import { InfoFeed } from '../sites/InfoFeed';
import { TokenMarket } from '../market/TokenMarket';
import { TaskBoard } from '../tasks/TaskBoard';
import { CoffeeShop } from '../facilities/CoffeeShop';
import { RentDialog } from '../facilities/RentDialog';
import { ZhihuBlog } from '../facilities/ZhihuBlog';
import { Achievements } from '../facilities/Achievements';
import { Retirement } from '../facilities/Retirement';
import { EventNotification } from '../events/EventNotification';
import { SITES } from '../../data/sites';
import { MAX_REPUTATION, MAX_SPIRIT } from '../../data/constants';
import { formatDay, formatMoney } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';

function MainContent({ siteId }: { siteId: number }) {
  switch (siteId) {
    case 0:
    case 1:
      return <TokenMarket />;
    case 2:
    case 3:
      return <TaskBoard />;
    case 4:
      return <InfoFeed />;
    case 5:
      return <RentDialog />;
    case 6:
      return <CoffeeShop />;
    case 7:
      return <ZhihuBlog />;
    case 8:
      return <Achievements />;
    case 9:
      return <Retirement />;
    default:
      return null;
  }
}

export function GameScreen() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);

  return (
    <div className="h-screen overflow-hidden bg-gray-900 text-gray-200">
      <div className="hidden h-full flex-col overflow-hidden md:flex">
        <GameHeader />

        <div className="flex flex-1 overflow-hidden">
          {/* 左：导航 */}
          <div className="w-[240px] shrink-0 border-r border-gray-800">
            <SiteNav />
          </div>

          {/* 中：内容 */}
          <main className="flex-1 overflow-hidden bg-gray-900">
            <MainContent siteId={currentSiteId} />
          </main>

          {/* 右：状态 */}
          <div className="w-[300px] shrink-0 border-l border-gray-800">
            <StatusPanel />
          </div>
        </div>
      </div>

      <MobileGameShell siteId={currentSiteId} />
      <EventNotification />
    </div>
  );
}

function MobileGameShell({ siteId }: { siteId: number }) {
  const [ledgerOpen, setLedgerOpen] = useState(false);

  return (
    <div className="flex h-full flex-col overflow-hidden bg-gray-950 md:hidden">
      <MobileTopHud onOpenLedger={() => setLedgerOpen(true)} />

      <main className="min-h-0 flex-1 overflow-hidden bg-gray-900">
        <MainContent siteId={siteId} />
      </main>

      <MobileSiteDock />

      {ledgerOpen && (
        <div className="fixed inset-0 z-40 flex flex-col bg-gray-950 animate-fade-in md:hidden">
          <div className="shrink-0 border-b border-gray-800 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold text-gray-100">账本</p>
                <p className="text-xs text-gray-500">Portfolio / 持仓 / 房租</p>
              </div>
              <button
                type="button"
                onClick={() => setLedgerOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-800 text-gray-300 active:bg-gray-700"
                aria-label="关闭账本"
              >
                ×
              </button>
            </div>
          </div>
          <div className="min-h-0 flex-1 overflow-hidden">
            <StatusPanel />
          </div>
        </div>
      )}
    </div>
  );
}

function MobileTopHud({ onOpenLedger }: { onOpenLedger: () => void }) {
  const day = useGameStore((s) => s.day);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const cash = useGameStore((s) => s.cash);
  const spirit = useGameStore((s) => s.spirit);
  const reputation = useGameStore((s) => s.reputation);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const [isMuted, setIsMuted] = useState<boolean>(() => audioManager.isMuted());

  const site = SITES[currentSiteId];
  const daysToRent = Math.max(0, nextRentDay - day);
  const tokenValue = inventory.reduce(
    (sum, it) => sum + it.count * (currentPrices[it.tokenId] || 0),
    0
  );
  const totalValue = cash + tokenValue;
  const spiritPct = Math.max(0, Math.min(100, (spirit / MAX_SPIRIT) * 100));
  const repPct = Math.max(0, Math.min(100, (reputation / MAX_REPUTATION) * 100));
  const rentUrgent = daysToRent <= 3;

  const toggleMute = () => {
    const next = !isMuted;
    audioManager.setMuted(next);
    setIsMuted(next);
  };

  return (
    <header className="shrink-0 border-b border-gray-800 bg-gray-950/95 px-3 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))]">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0 flex items-center gap-2">
          <span className="text-xl leading-none">{site.icon}</span>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold leading-tight text-gray-100">
              {site.name}
            </p>
            <p className="truncate text-[11px] leading-tight text-gray-500">
              {formatDay(day)}
              {restDaysLeft > 0 ? ` · 强制躺平 ${restDaysLeft} 天` : ''}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            onClick={onOpenLedger}
            className="rounded-lg bg-gray-800 px-3 py-2 text-xs font-semibold text-gray-200 active:bg-gray-700"
          >
            账本
          </button>
          <button
            type="button"
            onClick={toggleMute}
            className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-800 text-lg active:bg-gray-700"
            aria-label={isMuted ? '取消静音' : '静音'}
          >
            {isMuted ? '🔇' : '🔊'}
          </button>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-3 gap-2">
        <MobileHudCell label="总资产" value={formatMoney(totalValue)} accent="text-red-300" />
        <MobileHudCell
          label="现金"
          value={formatMoney(cash)}
          accent={cash < rentAmount && daysToRent <= 5 ? 'text-red-300' : 'text-amber-300'}
        />
        <MobileHudCell
          label="房租"
          value={`T-${daysToRent}d`}
          subValue={formatMoney(rentAmount)}
          accent={rentUrgent ? 'text-red-300' : 'text-violet-300'}
        />
      </div>

      <div className="mt-2 grid grid-cols-2 gap-2">
        <MobileMiniBar label="精神" value={spirit} pct={spiritPct} tone="emerald" />
        <MobileMiniBar label="信誉" value={reputation} pct={repPct} tone="blue" />
      </div>
    </header>
  );
}

function MobileHudCell({
  label,
  value,
  accent,
  subValue,
}: {
  label: string;
  value: string;
  accent: string;
  subValue?: string;
}) {
  return (
    <div className="min-w-0 rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 py-2">
      <p className="truncate text-[10px] text-gray-500">{label}</p>
      <p className={`truncate font-mono text-sm font-bold tabular ${accent}`}>{value}</p>
      {subValue && (
        <p className="truncate font-mono text-[10px] text-gray-500 tabular">{subValue}</p>
      )}
    </div>
  );
}

function MobileMiniBar({
  label,
  value,
  pct,
  tone,
}: {
  label: string;
  value: number;
  pct: number;
  tone: 'emerald' | 'blue';
}) {
  const barColor = tone === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500';

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900/80 px-2.5 py-2">
      <div className="flex items-center justify-between">
        <span className="text-[10px] text-gray-500">{label}</span>
        <span className="font-mono text-[11px] font-semibold text-gray-200 tabular">
          {Math.round(value)}
        </span>
      </div>
      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-gray-800">
        <div className={`h-full rounded-full ${barColor}`} style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

function MobileSiteDock() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const navigateToSite = useGameStore((s) => s.navigateToSite);
  const advanceDay = useGameStore((s) => s.advanceDay);
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const tasksCompletedToday = useGameStore((s) => s.tasksCompletedToday);
  const maxTasksPerDay = useGameStore((s) => s.maxTasksPerDay);

  return (
    <footer className="shrink-0 border-t border-gray-800 bg-gray-950 pb-[calc(0.75rem+env(safe-area-inset-bottom))] pt-2">
      <div className="flex gap-2 overflow-x-auto px-3 pb-2">
        {SITES.map((site) => {
          const active = site.id === currentSiteId;
          const disabled = restDaysLeft > 0;
          return (
            <button
              key={site.id}
              type="button"
              disabled={disabled}
              onClick={() => {
                audioManager.playSiteSound(site.id);
                navigateToSite(site.id);
              }}
              className={`flex min-w-[72px] flex-col items-center gap-1 rounded-xl border px-2 py-2 transition-colors ${
                active
                  ? 'border-emerald-400/70 bg-emerald-500/15 text-emerald-200'
                  : 'border-gray-800 bg-gray-900 text-gray-300 active:bg-gray-800'
              } ${disabled ? 'cursor-not-allowed opacity-40' : ''}`}
            >
              <span className="text-lg leading-none">{site.icon}</span>
              <span className="max-w-full truncate text-[11px] font-medium">
                {site.name.replace('API商城', 'API').replace('闲鱼二手区', '闲鱼')}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[1fr_auto] items-center gap-2 px-3">
        <button
          type="button"
          onClick={() => {
            const prevRest = useGameStore.getState().restDaysLeft;
            audioManager.play('next-day');
            advanceDay();
            const nextRest = useGameStore.getState().restDaysLeft;
            if (prevRest === 0 && nextRest > 0) {
              audioManager.play('spirit-crash');
            }
          }}
          className="h-12 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 px-4 text-sm font-bold text-white shadow-lg shadow-amber-950/40 active:from-amber-500 active:to-orange-500"
        >
          ☀️ 进入下一天
        </button>
        <div className="min-w-[72px] text-right text-[10px] leading-snug text-gray-500">
          今日接单
          <br />
          <span className="font-mono text-xs font-semibold text-amber-300 tabular">
            {tasksCompletedToday}/{maxTasksPerDay}
          </span>
        </div>
      </div>
    </footer>
  );
}
