// App.tsx - 根据 phase 切换屏幕
import { useEffect } from 'react';
import { useGameStore } from './stores/gameStore';
import { StartScreen } from './components/screens/StartScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { RetirementScreen } from './components/screens/RetirementScreen';
import { LandscapeGuard } from './components/common/LandscapeGuard';
import { LanguageToggle } from './components/common/LanguageToggle';

function App() {
  const phase = useGameStore((s) => s.phase);
  const language = useGameStore((s) => s.language);

  useEffect(() => {
    document.documentElement.lang = language === 'en' ? 'en' : 'zh-CN';
    document.title = language === 'en' ? 'Vibe Coding Simulator' : 'Vibe Coding 模拟器';
  }, [language]);

  // 动态视口高度追踪：解决手机浏览器地址栏/工具栏占位导致 100vh 超出可见区域的问题
  // 通过 visualViewport API 获取真实可见高度，写入 CSS 变量 --app-height
  useEffect(() => {
    const setAppHeight = () => {
      const vh = window.visualViewport?.height ?? window.innerHeight;
      document.documentElement.style.setProperty('--app-height', `${vh}px`);
    };

    setAppHeight();

    // visualViewport resize 事件在地址栏收起/展开时触发
    window.visualViewport?.addEventListener('resize', setAppHeight);
    window.addEventListener('resize', setAppHeight);

    return () => {
      window.visualViewport?.removeEventListener('resize', setAppHeight);
      window.removeEventListener('resize', setAppHeight);
    };
  }, []);

  // 禁止页面整体拖拽滚动（兼容微信 WebView）
  // 策略：拦截 document 上的 touchmove，但允许内部可滚动元素正常滚动
  useEffect(() => {
    /**
     * 判断一个元素是否是可滚动容器
     * （有 overflow-y: auto/scroll 且内容溢出）
     */
    const isScrollable = (el: Element): boolean => {
      const style = window.getComputedStyle(el);
      const overflowY = style.overflowY;
      return (overflowY === 'auto' || overflowY === 'scroll') && el.scrollHeight > el.clientHeight;
    };

    /**
     * 从事件目标向上遍历，查找可滚动祖先
     */
    const findScrollableAncestor = (el: EventTarget | null): Element | null => {
      let node = el as Element | null;
      while (node && node !== document.body && node !== document.documentElement) {
        if (isScrollable(node)) return node;
        node = node.parentElement;
      }
      return null;
    };

    let startY = 0;

    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
    };

    const onTouchMove = (e: TouchEvent) => {
      const scrollable = findScrollableAncestor(e.target);

      // 没有可滚动容器 → 阻止（防止整体拖拽）
      if (!scrollable) {
        e.preventDefault();
        return;
      }

      // 有可滚动容器，但已到达边界时也阻止（防止越界后触发页面弹性）
      const currentY = e.touches[0].clientY;
      const deltaY = currentY - startY;
      const { scrollTop, scrollHeight, clientHeight } = scrollable;

      // 在顶部继续往下拉 或 在底部继续往上推
      const atTop = scrollTop <= 0 && deltaY > 0;
      const atBottom = scrollTop + clientHeight >= scrollHeight && deltaY < 0;

      if (atTop || atBottom) {
        e.preventDefault();
      }
    };

    document.addEventListener('touchstart', onTouchStart, { passive: true });
    document.addEventListener('touchmove', onTouchMove, { passive: false });

    return () => {
      document.removeEventListener('touchstart', onTouchStart);
      document.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

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
      <LanguageToggle />
      {screen}
    </>
  );
}

export default App;
