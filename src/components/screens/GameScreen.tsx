// 主游戏界面 - 三栏布局（统一横屏体验）
import { useEffect } from 'react';
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
import { formatMoney } from '../../utils/format';

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
  const showGpuHintModal = useGameStore((s) => s.showGpuHintModal);
  const dismissGpuHintModal = useGameStore((s) => s.dismissGpuHintModal);
  const showRentDeadlineModal = useGameStore((s) => s.showRentDeadlineModal);
  const dismissRentDeadlineModal = useGameStore((s) => s.dismissRentDeadlineModal);
  const showForcedLiquidationModal = useGameStore((s) => s.showForcedLiquidationModal);
  const dismissForcedLiquidationModal = useGameStore((s) => s.dismissForcedLiquidationModal);
  const showTradingTaxModal = useGameStore((s) => s.showTradingTaxModal);
  const dismissTradingTaxModal = useGameStore((s) => s.dismissTradingTaxModal);
  const sellTaxTierReached = useGameStore((s) => s.sellTaxTierReached);
  const cash = useGameStore((s) => s.cash);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const gpus = useGameStore((s) => s.gpus);
  const totalRentCost = rentAmount + calculateWeeklyElectricity(gpus);
  const language = useGameStore((s) => s.language);

  // 进入游戏时启动 BGM
  useEffect(() => {
    audioManager.playBgm();
    return () => {
      audioManager.stopBgm();
    };
  }, []);

  return (
    <div className="flex flex-col overflow-hidden bg-gray-900 text-gray-200" style={{ height: 'var(--app-height, 100vh)' }}>
      <GameHeader />

      <div className="flex flex-1 overflow-hidden">
        {/* 左：导航 */}
        <div className="w-[240px] shrink-0 border-r border-gray-800">
          <SiteNav />
        </div>

        {/* 中：内容 */}
        <main className="flex-1 overflow-hidden bg-gray-900 flex flex-col">
          <div className="flex-1 overflow-hidden">
            <MainContent siteId={currentSiteId} />
          </div>
        </main>

        {/* 右：状态面板 */}
        <div className="w-[300px] shrink-0 border-l border-gray-800">
          <StatusPanel />
        </div>
      </div>

      <EventNotification />

      {/* GPU解锁强制确认弹窗 */}
      {showGpuUnlockModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-gray-600 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <span className="text-4xl">⚛️</span>
              <h2 className="text-xl font-bold text-emerald-400 mt-3">{language === 'en' ? 'GPU Compute Center unlocked!' : 'GPU算力中心已解锁！'}</h2>
              <p className="text-sm text-gray-300 mt-3">
                {language === 'en' ? 'Your assets reached $200,000! You can now buy GPU servers and let tokens flow into your wallet automatically.' : '你的资产达到了200万！现在可以购买GPU服务器，让Token自动流入你的钱包。'}
              </p>
              <button
                onClick={dismissGpuUnlockModal}
                className="mt-6 w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Confirm' : '确认'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* GPU预告弹窗（50万神秘场所提示） */}
      {showGpuHintModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-purple-500/60 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <span className="text-4xl">🔒</span>
              <h2 className="text-xl font-bold text-purple-400 mt-3">{language === 'en' ? 'A mysterious place has appeared…' : '神秘场所出现了……'}</h2>
              <p className="text-sm text-gray-300 mt-3">
                {language === 'en' ? <>A mysterious place has appeared in the sidebar. It opens when total assets reach <span className="font-mono font-bold text-purple-300">$200,000</span>.</> : <>侧边栏出现了一个神秘的场所，总资产达到 <span className="font-mono font-bold text-purple-300">200万</span> 时开放。</>}
              </p>
              <button
                onClick={dismissGpuHintModal}
                className="mt-6 w-full bg-purple-600 hover:bg-purple-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Got it' : '知道了'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 房租最后期限警告弹窗 */}
      {showRentDeadlineModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/60 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <p className="text-4xl">🚨</p>
              <h3 className="mt-3 text-xl font-bold text-red-400">{language === 'en' ? 'Final deadline warning!' : '最后期限警告！'}</h3>
              <p className="mt-3 text-sm text-gray-300">
                {language === 'en' ? <>Today is the final day to pay rent. If you cannot raise <span className="font-mono font-bold text-red-400">{formatMoney(totalRentCost, language)}</span> in cash, the game ends.</> : <>今天是最后一天交租期限，如果再凑不到<span className="font-mono font-bold text-red-400"> ¥{totalRentCost.toLocaleString()} </span>现金，游戏将会直接结束！</>}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {language === 'en' ? `Current cash: ${formatMoney(cash, language)}` : `当前现金：¥${cash.toLocaleString()}`}
              </p>
              <button
                onClick={dismissRentDeadlineModal}
                className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Understood' : '我知道了'}
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
            <div className="bg-gray-800 border border-amber-500/70 rounded-xl p-6 w-full max-w-md shadow-2xl">
              <div className="text-center">
                <p className="text-4xl">{tier.modalEmoji}</p>
                <h3 className="mt-3 text-xl font-bold text-amber-400">{language === 'en' ? ({ 'Token交易开始收税': 'Token sales are now taxed', 'Token交易税上涨': 'Token trading tax increased', '流动性紧缩警报': 'Liquidity crunch alert', '市场深度严重不足': 'Severely shallow market', '火热时代的结束': 'The end of the boom' } as Record<string, string>)[tier.modalTitle] || tier.modalTitle : tier.modalTitle}</h3>
                <p className="mt-3 text-sm text-gray-300">
                  {language === 'en' ? <>Your total assets reached <span className="font-mono font-bold text-amber-300">{formatMoney(tier.threshold, language)}</span>. Token sales now incur a <span className="font-mono font-bold text-red-400">{tier.taxPct}%</span> trading tax!</> : <>你的总资产达到了<span className="font-mono font-bold text-amber-300"> {tier.thresholdLabel} </span>，从现在开始Token卖出将征收<span className="font-mono font-bold text-red-400"> {tier.taxPct}% </span>交易税！</>}
                </p>
                <button
                  onClick={dismissTradingTaxModal}
                  className="mt-6 w-full bg-amber-600 hover:bg-amber-500 text-white font-semibold py-3 rounded-lg transition-colors"
                >
                  {language === 'en' ? 'Understood' : '我知道了'}
                </button>
              </div>
            </div>
          </div>
        );
      })()}

      {/* 强制清算弹窗（资产变卖抵租后强制确认） */}
      {showForcedLiquidationModal && (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 border border-red-500/60 rounded-xl p-6 w-full max-w-md shadow-2xl">
            <div className="text-center">
              <p className="text-4xl">💀</p>
              <h3 className="mt-3 text-xl font-bold text-red-400">{language === 'en' ? 'Cash-flow collapse!' : '现金流断裂！'}</h3>
              <p className="mt-3 text-sm text-gray-300">
                {language === 'en' ? 'You had to liquidate everything to pay rent. When this age stops letting you earn, retirement may be the better choice…' : '你被迫变卖了所有资产来交房租。也许在这个时代无法继续赚钱时，一键退休是更好的选择....'}
              </p>
              <p className="mt-2 text-xs text-gray-500">
                {language === 'en' ? `Current cash: ${formatMoney(cash, language)}` : `当前现金：¥${cash.toLocaleString()}`}
              </p>
              <button
                onClick={dismissForcedLiquidationModal}
                className="mt-6 w-full bg-red-600 hover:bg-red-500 text-white font-semibold py-3 rounded-lg transition-colors"
              >
                {language === 'en' ? 'Understood' : '我知道了'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
