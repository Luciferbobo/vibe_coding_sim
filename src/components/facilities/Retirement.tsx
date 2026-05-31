// 一键退休 - 夕阳西下，卖掉所有Token，躺平结算
import { useMemo, useState } from 'react';
import { useGameStore, getValuationPrices, computeRetirementWeeks } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { RENT_CYCLE, RENT_INCREASE } from '../../data/constants';
import { formatToken, formatDay } from '../../utils/format';

const HORIZON_QUOTES = [
  '潮水退去，沙滩上只剩下你和一把躺椅。',
  '北京的房子还是租的，但今天，你终于可以不写代码了。',
  '关掉 IDE 的那一刻，整个世界都安静了下来。',
  '你想过无数次按下这个按钮，今天它真的存在了。',
  '夕阳很贵，但你刚好买得起一个落日。',
];

export function Retirement() {
  const cash = useGameStore((s) => s.cash);
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const xianYuPrices = useGameStore((s) => s.xianYuPrices);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const day = useGameStore((s) => s.day);
  const retire = useGameStore((s) => s.retire);

  const [confirming, setConfirming] = useState(false);

  // 按 tokenId 聚合库存
  const grouped = useMemo(() => {
    const map = new Map<number, number>();
    for (const b of inventory) {
      map.set(b.tokenId, (map.get(b.tokenId) || 0) + b.count);
    }
    return Array.from(map.entries()).filter(([, c]) => c > 0);
  }, [inventory]);

  // 资产估值取两市场最低价
  const valuationPrices = getValuationPrices(currentPrices, xianYuPrices);

  const tokenValue = useMemo(
    () =>
      grouped.reduce(
        (sum, [tid, count]) => sum + count * (valuationPrices[tid] || 0),
        0
      ),
    [grouped, valuationPrices]
  );

  const totalCash = cash + tokenValue;
  const daysUntilFirstRent = Math.max(0, nextRentDay - day);
  // 按真实涨租机制推演，与 retire() 算法保持一致
  const weeksAlive = computeRetirementWeeks(totalCash, rentAmount, RENT_INCREASE);
  const daysAlive = daysUntilFirstRent + weeksAlive * RENT_CYCLE;

  const quote = useMemo(
    () => HORIZON_QUOTES[Math.floor(Math.random() * HORIZON_QUOTES.length)],
    []
  );

  const handleClick = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }
    retire();
  };

  const handleCancel = () => setConfirming(false);

  return (
    <div className="relative h-full overflow-y-auto">
      {/* 夕阳渐变背景 */}
      <div className="absolute inset-0 bg-gradient-to-b from-amber-950/40 via-orange-950/30 to-rose-950/50 pointer-events-none" />
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background:
            'radial-gradient(ellipse 80% 60% at 50% 110%, rgba(251,146,60,0.35) 0%, rgba(244,63,94,0.15) 35%, transparent 70%)',
        }}
      />
      {/* 远山 / 地平线 */}
      <div
        className="absolute left-0 right-0 bottom-0 h-32 pointer-events-none"
        style={{
          background:
            'linear-gradient(to top, rgba(17,24,39,0.85), rgba(17,24,39,0.0))',
        }}
      />

      <div className="relative z-10 mx-auto max-w-3xl px-6 py-10">
        {/* 顶部小标 */}
        <div className="flex items-center justify-between text-[11px] tracking-[0.3em] uppercase text-amber-300/70">
          <span className="inline-flex items-center gap-2">

          </span>
          <span className="font-mono text-amber-300/50">{formatDay(day)}</span>
        </div>

        {/* 主标题 */}
        <div className="mt-6">
          <h2 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight bg-gradient-to-br from-amber-200 via-orange-300 to-rose-400 bg-clip-text text-transparent">
            🏖️ 一键退休
          </h2>
          <p className="mt-3 text-base italic text-amber-100/70 leading-relaxed">
            累了？卖掉所有 Token，看看你的积蓄能让你躺平多久……
          </p>
          <p className="mt-2 text-xs text-amber-200/40 font-light">"{quote}"</p>
        </div>

        {/* 资产概况 */}
        <div className="mt-8 rounded-2xl border border-amber-500/20 bg-gradient-to-br from-stone-900/80 to-amber-950/40 backdrop-blur-sm overflow-hidden">
          <div className="px-5 py-3 border-b border-amber-500/10 flex items-center justify-between">
            <p className="text-[11px] tracking-[0.25em] uppercase text-amber-300/70">
              Current Holdings · 资产清算预览
            </p>
            <span className="text-[10px] font-mono text-amber-300/40">
              @ market price
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-amber-500/10">
            <AssetCell label="现金" value={formatYuan(cash)} accent="text-amber-300" />
            <AssetCell
              label="Token 库存折现"
              value={formatYuan(tokenValue)}
              accent="text-orange-300"
              sub={`${grouped.length} 种持仓`}
            />
            <AssetCell
              label="资产合计"
              value={formatYuan(totalCash)}
              accent="text-rose-300"
              emphasized
            />
          </div>

          {/* Token 明细 */}
          {grouped.length > 0 && (
            <div className="px-5 pb-4 pt-3 border-t border-amber-500/10">
              <p className="text-[10px] tracking-[0.2em] uppercase text-amber-300/40 mb-2">
                Liquidation Detail
              </p>
              <ul className="space-y-1 text-xs">
                {grouped.map(([tid, count]) => {
                  const t = TOKENS[tid];
                  const price = valuationPrices[tid] || 0;
                  const value = count * price;
                  const isXy = tid === 6;
                  return (
                    <li
                      key={tid}
                      className="flex items-center justify-between font-mono text-amber-100/70"
                    >
                      <span className="truncate">
                        <span className="text-amber-200/90">{t.name}</span>{' '}
                        <span className="text-amber-300/40">
                          × {isXy ? `${count}个` : formatToken(count)}
                        </span>
                      </span>
                      <span className="text-orange-200/80">
                        {formatYuan(value)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          )}
        </div>

        {/* 房租 + 预估 */}
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[1fr_1.4fr] gap-4">
          <div className="rounded-2xl border border-amber-500/20 bg-stone-900/70 px-5 py-4">
            <p className="text-[10px] tracking-[0.25em] uppercase text-amber-300/60">
              Weekly Rent
            </p>
            <p className="mt-2 font-mono text-3xl font-semibold text-amber-200">
              {formatYuan(rentAmount)}
            </p>
            <p className="mt-1 text-xs text-amber-300/50">每周扣除一次</p>
          </div>

          <div className="relative rounded-2xl border border-rose-500/30 overflow-hidden">
            {/* 内部渐变 */}
            <div className="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-rose-700/15 to-amber-900/30" />
            <div
              className="absolute -bottom-12 -right-12 h-40 w-40 rounded-full opacity-50"
              style={{
                background:
                  'radial-gradient(circle, rgba(251,191,36,0.5), transparent 70%)',
              }}
            />
            <div className="relative px-6 py-5">
              <p className="text-[10px] tracking-[0.3em] uppercase text-rose-200/70">
                Estimated Survival
              </p>
              <div className="mt-2 flex items-baseline gap-3">
                <span className="font-serif font-bold text-7xl leading-none bg-gradient-to-br from-amber-200 to-rose-400 bg-clip-text text-transparent tabular-nums">
                  {weeksAlive}
                </span>
                <span className="text-amber-100/70 text-base">周</span>
                <span className="font-mono text-rose-200/60 text-sm ml-2">
                  ≈ {daysAlive} 天
                </span>
              </div>
              <p className="mt-2 text-xs text-amber-100/60 leading-snug">
                以当前周租 {formatYuan(rentAmount)} 起步，每周递增 {formatYuan(RENT_INCREASE)} 推演，钱花光那天即为终局。
              </p>
            </div>
          </div>
        </div>

        {/* 退休按钮 */}
        <div className="mt-8">
          {!confirming ? (
            <>
              <button
                onClick={handleClick}
                className="group relative w-full overflow-hidden rounded-2xl py-5 px-6 text-white font-bold text-lg tracking-wide shadow-2xl shadow-rose-900/40 transition-all hover:shadow-rose-900/60 hover:scale-[1.005] active:scale-[0.995]"
                style={{
                  background:
                    'linear-gradient(135deg, #b45309 0%, #c2410c 35%, #be123c 100%)',
                }}
              >
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/15 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
                <span className="relative inline-flex items-center justify-center gap-3">
                  <span className="text-2xl">🌅</span>
                  确认退休（不可撤销）
                </span>
              </button>
              <p className="mt-2 text-center text-[11px] text-amber-200/50 tracking-wider">
                · 将卖出所有 Token 并进入结算 ·
              </p>
            </>
          ) : (
            <div className="rounded-2xl border-2 border-rose-500/50 bg-rose-950/40 backdrop-blur p-5">
              <p className="text-center text-rose-100 text-base font-medium">
                真的要退休吗？这个操作不可撤销。
              </p>
              <p className="mt-2 text-center text-xs text-rose-200/60">
                你将带着 {formatYuan(totalCash)} 离开，预计躺平 {weeksAlive} 周。
              </p>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <button
                  onClick={handleCancel}
                  className="px-4 py-3 rounded-xl border border-amber-500/30 bg-stone-800/60 text-amber-100 hover:bg-stone-800 transition-colors font-medium"
                >
                  再想想
                </button>
                <button
                  onClick={handleClick}
                  className="px-4 py-3 rounded-xl bg-gradient-to-r from-rose-600 to-orange-600 hover:from-rose-500 hover:to-orange-500 text-white font-bold transition-all shadow-lg shadow-rose-900/40"
                >
                  确认，落幕
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="mt-10 pt-4 border-t border-amber-500/10 text-center text-[11px] text-amber-200/30 tracking-[0.2em] uppercase">
          End of working hours · 退场也是一种选择
        </div>
      </div>
    </div>
  );
}

function formatYuan(n: number): string {
  return `¥${Math.round(n).toLocaleString('zh-CN')}`;
}

function AssetCell({
  label,
  value,
  accent,
  sub,
  emphasized,
}: {
  label: string;
  value: string;
  accent: string;
  sub?: string;
  emphasized?: boolean;
}) {
  return (
    <div className={`px-5 py-4 ${emphasized ? 'bg-rose-950/30' : ''}`}>
      <p className="text-[10px] tracking-[0.2em] uppercase text-amber-300/50">
        {label}
      </p>
      <p
        className={`mt-1.5 font-mono ${
          emphasized ? 'text-2xl font-bold' : 'text-xl font-semibold'
        } ${accent} tabular-nums`}
      >
        {value}
      </p>
      {sub && <p className="mt-0.5 text-[10px] text-amber-300/40">{sub}</p>}
    </div>
  );
}
