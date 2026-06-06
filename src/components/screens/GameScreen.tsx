// 主游戏界面 - 三栏布局（PC）/ 左导航 + 主内容 + 右抽屉（移动端）
import { useEffect, useState } from 'react';
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
import GpuCenter from '../facilities/GpuCenter';
import { EventNotification } from '../events/EventNotification';
import { calculateWeeklyElectricity } from '../../engine/gpuEngine';
import { audioManager } from '../../utils/audioManager';
import { SELL_TAX_TIERS } from '../../data/constants';

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
    case 10:
      return <GpuCenter />;
    default:
      return null;
  }
}

export function GameScreen() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const showGpuUnlockModal = useGameStore((s) => s.showGpuUnlockModal);
  const dismissGpuUnlockModal = useGameStore((s) => s.dismissGpuUnlockModal);
  const showRentDeadlineModal = useGameStore((s) => s.showRentDeadlineModal);
  const dismissRentDeadlineModal = useGameStore((s) => s.dismissRentDeadlineModal);
  const showTradingTaxModal = useGameStore((s) => s.showTradingTaxModal);
  const dismissTradingTaxModal = useGameStore((s) => s.dismissTradingTaxModal);
  const sellTaxTierReached = useGameStore((s) => s.sellTaxTierReached);
  const cash = useGameStore((s) => s.cash);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const gpus = useGameStore((s) => s.gpus);
  const totalRentCost = rentAmount + calculateWeeklyElectricity(gpus);

  // 移动端：右侧状态面板抽屉开关
  const [statusPanelOpen, setStatusPanelOpen] = useState(false);

  // 移动端顶部 banner 数据
  const restDaysLeft = useGameStore((s) => s.restDaysLeft);
  const tasksCompletedToday = useGameStore((s) => s.tasksCompletedToday);
  const maxTasksPerDay = useGameStore((s) => s.maxTasksPerDay);
  const day = useGameStore((s) => s.day);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const daysToRent = Math.max(0, nextRentDay - day);

  // 进入游戏时启动 BGM
  useEffect(() => {
    audioManager.playBgm();
    return () => {
      audioManager.stopBgm();
    };
  }, []);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-900 text-gray-200">
      <GameHeader onOpenStatusPanel={() => setStatusPanelOpen(true)} />

      <div className="flex flex-1 overflow-hidden">
        {/* 左：导航（移动 76px / PC 240px） */}
        <div className="w-[76px] md:w-[240px] shrink-0 border-r border-gray-800">
          <SiteNav />
        </div>

        {/* 中：内容 */}
        <main className="flex-1 overflow-hidden bg-gray-900 flex flex-col">
          {/* 移动端顶部 banner：强制休息 / 今日任务进度 */}
          <div className="md:hidden shrink-0">
            {restDaysLeft > 0 ? (
              <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-xs text-red-300">
                强制躺平中 · 还需 {restDaysLeft} 天，点击下方 ☀️ 推进
              </div>
            ) : (
              <div className="bg-gray-800/40 border-b border-gray-800 px-4 py-1.5 text-xs text-gray-400 flex justify-between">
                <span>
                  今日需求 <span className="text-amber-400 font-semibold">{tasksCompletedToday}</span>
                  <span className="text-gray-600">/{maxTasksPerDay}</span>
                </span>
                <span>T-{daysToRent}d 到房租</span>
              </div>
            )}
          </div>
          <div className="flex-1 overflow-hidden">
            <MainContent siteId={currentSiteId} />
          </div>
        </main>

        {/* 右：状态（仅 PC 显示） */}
        <div className="hidden md:block w-[300px] shrink-0 border-l border-gray-800">
          <StatusPanel />
        </div>
      </div>

      {/* 移动端：右侧抽屉式 StatusPanel */}
      {statusPanelOpen && (
        <div className="md:hidden fixed inset-0 z-40 animate-fade-in">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={() => setStatusPanelOpen(false)}
          />
          <aside className="absolute right-0 top-0 h-full w-[85vw] max-w-sm bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col">
            <div className="px-4 h-12 flex items-center justify-between border-b border-gray-800 shrink-0">
              <p className="text-sm font-semibold text-gray-200">我的资产</p>
              <button
                onClick={() => setStatusPanelOpen(false)}
                aria-label="关闭"
                className="h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-800 hover:text-gray-100 transition-colors flex items-center justify-center"
              >
                ✕
              </button>
            </div>
            <div className="flex-1 min-h-0 overflow-hidden">
              <StatusPanel />
            </div>
          </aside>
        </div>
      )}

      <EventNotification />

      {/* GPU解锁强制确认弹窗 */}
      {showGpuUnlockModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-5 md:p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <span className="text-4xl">⚛️</span>
              <h2 className="text-xl font-bold text-emerald-400 mt-3">GPU算力中心已解锁！</h2>
              <p className="text-sm text-gray-300 mt-3">
                你的资产达到了200万！现在可以购买GPU服务器，让Token自动流入你的钱包。
              </p>
              <button
                onClick={dismissGpuUnlockModal}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                确认
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 房租最后期限警告弹窗 */}
      {showRentDeadlineModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/60 rounded-xl p-5 md:p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <p className="text-4xl">🚨</p>
              <h3 className="mt-3 text-xl font-bold text-red-400">最后期限警告！</h3>
              <p className="mt-3 text-sm text-gray-300">
                今天是最后一天交租期限，如果再凑不到
                <span className="font-mono font-bold text-red-400"> ¥{totalRentCost.toLocaleString()} </span>
                现金，游戏将会直接结束！
              </p>
              <p className="mt-2 text-xs text-gray-500">
                当前现金：¥{cash.toLocaleString()}
              </p>
              <button
                onClick={dismissRentDeadlineModal}
                className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                我知道了
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 交易税跨档强制确认弹窗（多档动态文案） */}
      {showTradingTaxModal && sellTaxTierReached >= 0 && (() => {
        const tier = SELL_TAX_TIERS[sellTaxTierReached];
        return (
          <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
            <div className="bg-gray-800 border border-amber-500/70 rounded-xl p-5 md:p-6 w-full max-w-md shadow-2xl">
              <div className="text-center">
                <p className="text-4xl">{tier.modalEmoji}</p>
                <h3 className="mt-3 text-xl font-bold text-amber-400">{tier.modalTitle}</h3>
                <p className="mt-3 text-sm text-gray-300">
                  你的总资产达到了
                  <span className="font-mono font-bold text-amber-300"> {tier.thresholdLabel} </span>
                  ，从现在开始Token卖出将征收
                  <span className="font-mono font-bold text-red-400"> {tier.taxPct}% </span>
                  交易税！
                </p>
                <button
                  onClick={dismissTradingTaxModal}
                  className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  我知道了
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
}
