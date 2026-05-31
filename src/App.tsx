// App.tsx - 根据 phase 切换屏幕
import { useGameStore } from './stores/gameStore';
import { StartScreen } from './components/screens/StartScreen';
import { GameScreen } from './components/screens/GameScreen';
import { GameOverScreen } from './components/screens/GameOverScreen';
import { RetirementScreen } from './components/screens/RetirementScreen';

function App() {
  const phase = useGameStore((s) => s.phase);

  switch (phase) {
    case 'playing':
      return <GameScreen />;
    case 'retiring':
      return <RetirementScreen />;
    case 'gameover':
      return <GameOverScreen />;
    case 'start':
    default:
      return <StartScreen />;
  }
}

export default App;
