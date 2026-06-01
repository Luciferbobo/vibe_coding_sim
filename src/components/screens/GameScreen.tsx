// 主游戏界面 - 三栏布局
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
  const cash = useGameStore((s) => s.cash);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const gpus = useGameStore((s) => s.gpus);
  const totalRentCost = rentAmount + calculateWeeklyElectricity(gpus);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-gray-900 text-gray-200">
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

      <EventNotification />

      {/* GPU解锁强制确认弹窗 */}
      {showGpuUnlockModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 max-w-md shadow-2xl">
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
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-red-500/60 rounded-xl p-6 max-w-md shadow-2xl">
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

      {/* 交易税首次激活强制确认弹窗 */}
      {showTradingTaxModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center">
          <div className="bg-gray-800 border border-amber-500/70 rounded-xl p-6 max-w-md shadow-2xl">
            <div className="text-center">
              <p className="text-4xl">💸</p>
              <h3 className="mt-3 text-xl font-bold text-amber-400">交易税已生效！</h3>
              <p className="mt-3 text-sm text-gray-300">
                你的总资产达到了
                <span className="font-mono font-bold text-amber-300"> 300万 </span>
                ，从现在开始Token卖出将征收
                <span className="font-mono font-bold text-red-400"> 25% </span>
                交易税！
              </p>
              <p className="mt-2 text-xs text-gray-500 italic">
                （你太能赚钱了，连税务局都盯上你了）
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
      )}
    </div>
  );
}
