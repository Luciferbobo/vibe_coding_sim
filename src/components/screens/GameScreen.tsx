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
import { EventNotification } from '../events/EventNotification';

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
    </div>
  );
}
