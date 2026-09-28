// 星巴克 - 喝咖啡恢复精神
import { useGameStore } from '../../stores/gameStore';
import { COFFEE_COST, COFFEE_SPIRIT_GAIN } from '../../data/constants';
import { audioManager } from '../../utils/audioManager';

const VIBES = [
  '你打开 MacBook，假装在写代码，假装很忙。',
  '邻桌大爷讨论着哪只 AI 概念股能翻 10 倍。',
  '一对穿着黑色卫衣的创业者激情比划着 PMF。',
  '美式刚到嘴边，多巴胺先到了。',
  '空调把你冻得清醒，你又开始焦虑了。',
];
const VIBES_EN = [
  'You open your MacBook and pretend to code. You pretend to be busy.',
  'The old man at the next table debates which AI stock could go 10x.',
  'Two hoodie-clad founders passionately gesture about product-market fit.',
  'The Americano reaches your lips; the dopamine arrives first.',
  'The air conditioning freezes you awake. The anxiety starts again.',
];

export function CoffeeShop() {
  const cash = useGameStore((s) => s.cash);
  const spirit = useGameStore((s) => s.spirit);
  const drinkCoffee = useGameStore((s) => s.drinkCoffee);
  const coffeeUsedToday = useGameStore((s) => s.coffeeUsedToday);
  const language = useGameStore((s) => s.language);

  const canBuy = cash >= COFFEE_COST;
  const vibe = (language === 'en' ? VIBES_EN : VIBES)[Math.floor(Math.random() * VIBES.length)];
  const isFull = spirit >= 100;

  return (
    <div className="flex h-full items-center justify-center px-4 py-4 md:px-6 md:py-6 overflow-y-auto">
      <div className="w-full max-w-2xl">
        <div className="mb-4 md:mb-6">
          <h2 className="text-xl md:text-2xl font-semibold text-gray-100">
            {language === 'en' ? '☕ Starbucks · CBD store' : '☕ 星巴克 · 国贸店'}
          </h2>
          <p className="mt-1 text-xs md:text-sm italic text-gray-400">{vibe}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1.4fr_1fr] gap-4">
          {/* 菜单 */}
          <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4 md:p-5">
            <p className="text-xs text-gray-500">{language === 'en' ? "Today's menu" : '今日菜单'}</p>
            <div className="mt-3 flex items-end justify-between border-b border-gray-700/50 pb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-100">{language === 'en' ? 'Americano' : '美式咖啡'}</h3>
                <p className="mt-1 text-sm text-gray-400 leading-snug">
                  {language === 'en' ? 'Nothing fancy, but it keeps you going a little longer.' : '没什么花活，但能让你再撑一会儿'}
                </p>
                <p className="mt-1 text-xs text-emerald-400">
                  +{COFFEE_SPIRIT_GAIN} {language === 'en' ? 'SPIRIT' : '精神值'}
                </p>
              </div>
              <p className="font-mono text-2xl font-bold text-amber-400 tabular">
                {language === 'en' ? `$${COFFEE_COST / 10}` : `¥${COFFEE_COST}`}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-900/60 border border-gray-700/50 px-3 py-2">
                <p className="text-xs text-gray-500">{language === 'en' ? 'Spirit before' : '饮前精神'}</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-gray-200 tabular">
                  {spirit}/100
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
                <p className="text-xs text-emerald-300/80">{language === 'en' ? 'Spirit after' : '饮后精神'}</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-300 tabular">
                  {Math.min(100, spirit + COFFEE_SPIRIT_GAIN)}/100
                </p>
              </div>
            </div>

            <button
              onClick={() => {
                drinkCoffee();
                audioManager.play('drink-coffee');
              }}
              disabled={!canBuy || isFull || coffeeUsedToday}
              className="mt-4 w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
            >
              {coffeeUsedToday ? (language === 'en' ? 'Had today' : '今日已饮用') : (language === 'en' ? 'Order one' : '来一杯')}
            </button>
            {!canBuy && !coffeeUsedToday && (
              <p className="mt-2 text-xs text-red-400">
                {language === 'en' ? '· Not enough cash for coffee' : '· 余额不足，连咖啡都喝不起了'}
              </p>
            )}
            {isFull && canBuy && (
              <p className="mt-2 text-xs text-gray-500">
                {language === 'en' ? '· You are fully rested; another one will keep you up' : '· 你精神满血，再喝就睡不着了'}
              </p>
            )}
          </div>

          {/* 旁注 */}
          <div className="space-y-2.5 text-sm leading-relaxed">
            <SideNote color="violet" title={language === 'en' ? 'Barista note' : '店员提示'}>
              {language === 'en' ? '“Here is your medium Americano. Enjoy.”' : '“先生，您的中杯美式，请慢用”'}
              <br />
              {language === 'en' ? 'One cup per day~' : '每天只能喝一杯哦~'}
            </SideNote>
          </div>
        </div>
      </div>
    </div>
  );
}

function SideNote({
  color,
  title,
  children,
}: {
  color: 'violet' | 'blue' | 'amber';
  title: string;
  children: React.ReactNode;
}) {
  const map: Record<string, { border: string; text: string }> = {
    violet: { border: 'border-violet-500/40', text: 'text-violet-300' },
    blue: { border: 'border-blue-500/40', text: 'text-blue-300' },
    amber: { border: 'border-amber-500/40', text: 'text-amber-300' },
  };
  const s = map[color];
  return (
    <div className={`rounded-lg border-l-2 ${s.border} bg-gray-800/60 px-3 py-2.5`}>
      <p className={`text-xs font-medium ${s.text}`}>{title}</p>
      <p className="mt-1 text-sm text-gray-300 leading-snug">{children}</p>
    </div>
  );
}
