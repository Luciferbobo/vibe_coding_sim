import { useGameStore } from '../../stores/gameStore';

/** Persistent language switch shared by every game phase. */
export function LanguageToggle() {
  const language = useGameStore((s) => s.language);
  const setLanguage = useGameStore((s) => s.setLanguage);

  return (
    <div className="fixed right-3 top-3 z-[100] inline-flex items-center gap-0.5 rounded-lg border border-gray-700/80 bg-gray-900/90 p-1 text-xs shadow-lg backdrop-blur-sm">
      <button
        type="button"
        onClick={() => setLanguage('en')}
        className={`rounded-md px-2 py-1 font-semibold transition-colors ${language === 'en' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
        aria-pressed={language === 'en'}
        aria-label={language === 'en' ? 'Switch to English' : '切换到英文'}
      >
        EN
      </button>
      <span className="text-gray-600">/</span>
      <button
        type="button"
        onClick={() => setLanguage('zh')}
        className={`rounded-md px-2 py-1 font-semibold transition-colors ${language === 'zh' ? 'bg-emerald-600 text-white' : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'}`}
        aria-pressed={language === 'zh'}
        aria-label={language === 'en' ? 'Switch to Chinese' : '切换到中文'}
      >
        中文
      </button>
    </div>
  );
}
