// App.tsx - 根据 phase 切换屏幕
import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { StartScreen } from './components/screens/StartScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { RetirementScreen } from './components/screens/RetirementScreen';
import { LandscapeGuard } from './components/common/LandscapeGuard';

function App() {
  const phase = useGameStore((s) => s.phase);

  // 动态 viewport 缩放：手机横屏时设置设计宽度，浏览器自动等比缩小
  useEffect(() => {
    const metaViewport = document.querySelector('meta[name="viewport"]');
    if (!metaViewport) return;

    const DESIGN_WIDTH = 1280;
    // 只在小屏设备上激活（短边 < 768px 判定为手机/小平板）
    const isSmallDevice = Math.min(window.screen.width, window.screen.height) < 768;
    if (!isSmallDevice) return;

    const update = () => {
      const type = window.screen.orientation?.type ?? '';
      const isLandscape = type.includes('landscape')
        || (!type && window.innerWidth > window.innerHeight);

      if (isLandscape) {
        metaViewport.setAttribute('content', `width=${DESIGN_WIDTH}, user-scalable=no, viewport-fit=cover`);
      } else {
        metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
      }
    };

    update();

    const handler = () => setTimeout(update, 80);
    window.screen.orientation?.addEventListener('change', handler);
    window.addEventListener('orientationchange', handler);

    return () => {
      window.screen.orientation?.removeEventListener('change', handler);
      window.removeEventListener('orientationchange', handler);
      metaViewport.setAttribute('content', 'width=device-width, initial-scale=1.0, viewport-fit=cover');
    };
  }, []);

  let screen;
  switch (phase) {
    case 'playing':
      screen = <GameScreen />;
      break;
    case 'retiring':
      screen = <RetirementScreen />;
      break;
    case 'gameover':
      screen = <GameOverScreen />;
      break;
    case 'start':
    default:
      screen = <StartScreen />;
  }

  return (
    <>
      <LandscapeGuard />
      {screen}
    </>
  );
}

export default App;
