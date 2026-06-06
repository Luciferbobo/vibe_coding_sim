// 右侧状态面板 - 干净的数据展示
import { useGameStore, TokenBatch, getValuationPrices, calculateGpuDepreciationValue } from '../../stores/gameStore';
import type { PortfolioHistoryPoint } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { formatMoney, formatToken } from '../../utils/format';

interface BarProps {
  label: string;
  value: number;
  max: number;
  barColor: string;
  textColor: string;
  hint?: string;
}

function StatBar({ label, value, max, barColor, textColor, hint }: BarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div>
      <div className="flex items-baseline justify-between">
        <span className="text-xs text-gray-400">{label}</span>
        <span className={`font-mono text-sm font-semibold tabular ${textColor}`}>
          {Math.round(value)}
          <span className="text-gray-500">/{max}</span>
        </span>
      </div>
      <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-700/60 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

const OPERATION_TYPES: PortfolioHistoryPoint['eventType'][] = [
  'trade',
  'income',
  'expense',
  'rent',
  'retire',
];

function formatCompactMoney(amount: number): string {
  return formatMoney(amount);
}

function PortfolioCurve({
  history,
  currentTotal,
  daysToRent,
}: {
  history: PortfolioHistoryPoint[];
  currentTotal: number;
  daysToRent: number;
}) {
  const safeHistory: PortfolioHistoryPoint[] =
    history.length > 0
      ? history
      : [
          {
            id: 0,
            day: 1,
            cash: currentTotal,
            tokenValue: 0,
            totalValue: currentTotal,
            nextRentDay: 1 + daysToRent,
            rentAmount: 0,
            eventType: 'start',
            label: '当前',
          },
        ];
  const drawableHistory =
    safeHistory.length > 1
      ? safeHistory
      : [{ ...safeHistory[0], id: -1 }, safeHistory[0]];

  const width = 260;
  const height = 70;
  const padX = 8;
  const padY = 8;
  const values = drawableHistory.map((p) => p.totalValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const fallbackRange = Math.max(1000, Math.abs(currentTotal) * 0.12);
  const low = minValue === maxValue ? minValue - fallbackRange / 2 : minValue;
  const high = minValue === maxValue ? maxValue + fallbackRange / 2 : maxValue;
  const range = Math.max(1, high - low);
  const xStep = (width - padX * 2) / (drawableHistory.length - 1);
  const coords = drawableHistory.map((point, index) => ({
    point,
    x: padX + index * xStep,
    y: height - padY - ((point.totalValue - low) / range) * (height - padY * 2),
  }));
  const linePath = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padY} L ${coords[0].x.toFixed(1)} ${height - padY} Z`;
  // 房租红线：仅在「当前未交付」的房租周期内显示一条。
  // 一旦交付（rent 事件触发后 nextRentDay 跳到下一周期），原红线就消失，避免同一房租日多次显示。
  // 位置：当前周期内最后一个非 rent 事件的数据点（最新位置，提示「下次房租即将到来」）。
  const currentNextRentDay = coords[coords.length - 1]?.point.nextRentDay;
  const rentMarkers =
    currentNextRentDay !== undefined
      ? (() => {
          const target = [...coords]
            .reverse()
            .find(
              (c) =>
                c.point.nextRentDay === currentNextRentDay &&
                c.point.eventType !== 'rent'
            );
          return target ? [target] : [];
        })()
      : [];
  const operationMarkers = coords.filter((coord) =>
    OPERATION_TYPES.includes(coord.point.eventType)
  );
  const first = safeHistory[0];
  const latest = safeHistory[safeHistory.length - 1];
  const delta = latest.totalValue - first.totalValue;
  const deltaText = `${delta >= 0 ? '+' : '-'}${formatCompactMoney(Math.abs(delta))}`;
  const deltaClass =
    delta > 0 ? 'text-emerald-400' : delta < 0 ? 'text-red-400' : 'text-gray-500';

  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs text-gray-400">总资产估值</p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular text-emerald-300">
            {formatCompactMoney(currentTotal)}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[10px] text-gray-500">本局变化</p>
          <p className={`font-mono text-xs font-semibold tabular ${deltaClass}`}>
            {deltaText}
          </p>
        </div>
      </div>

      <svg
        className="mt-2 h-[72px] w-full overflow-visible"
        viewBox={`0 0 ${width} ${height}`}
        role="img"
        aria-label="Portfolio 变化曲线"
      >
        <defs>
          <linearGradient id="portfolioArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.28" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="rgba(148, 163, 184, 0.2)"
          strokeWidth="1"
        />
        {rentMarkers.map((coord) => (
          <line
            key={`rent-${coord.point.id}-${coord.x}`}
            x1={coord.x}
            y1={padY}
            x2={coord.x}
            y2={height - padY}
            stroke="#f87171"
            strokeLinecap="round"
            strokeWidth="2"
            opacity="0.85"
          />
        ))}
        <path d={areaPath} fill="url(#portfolioArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#34d399"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="3"
        />
        {operationMarkers.map((coord) => (
          <circle
            key={`op-${coord.point.id}`}
            cx={coord.x}
            cy={coord.y}
            r="2.7"
            fill="#38bdf8"
            stroke="#0f172a"
            strokeWidth="1.3"
          >
            <title>{coord.point.label}</title>
          </circle>
        ))}
      </svg>

      <div className="mt-1 flex items-center justify-between gap-2 text-[10px] text-gray-500">
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-full bg-emerald-400" />
            资产
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-0.5 rounded-full bg-red-400" />
            房租
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            操作
          </span>
        </div>
        <span className="font-mono tabular">T-{daysToRent}d</span>
      </div>
    </div>
  );
}

export function StatusPanel() {
  const cash = useGameStore((s) => s.cash);
  const spirit = useGameStore((s) => s.spirit);
  const reputation = useGameStore((s) => s.reputation);
  const day = useGameStore((s) => s.day);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const xianYuPrices = useGameStore((s) => s.xianYuPrices);
  const portfolioHistory = useGameStore((s) => s.portfolioHistory);
  const gpus = useGameStore((s) => s.gpus);

  // 资产估值取两市场最低价
  const valuationPrices = getValuationPrices(currentPrices, xianYuPrices);

  const daysToRent = Math.max(0, nextRentDay - day);
  const rentRedFlag = cash < rentAmount && daysToRent <= 5;

  const spiritBar =
    spirit > 60 ? 'bg-emerald-500' : spirit > 30 ? 'bg-amber-500' : 'bg-red-500';
  const spiritText =
    spirit > 60 ? 'text-emerald-400' : spirit > 30 ? 'text-amber-400' : 'text-red-400';
  const repBar =
    reputation > 60 ? 'bg-blue-500' : reputation > 20 ? 'bg-amber-500' : 'bg-red-500';
  const repText =
    reputation > 60 ? 'text-blue-400' : reputation > 20 ? 'text-amber-400' : 'text-red-400';

  const tokenValue = inventory.reduce(
    (sum, it) => sum + it.count * (valuationPrices[it.tokenId] || 0),
    0
  );
  const gpuValue = calculateGpuDepreciationValue(gpus);

  // 按 tokenId 聚合批次
  const groupedByToken = new Map<number, TokenBatch[]>();
  for (const b of inventory) {
    const arr = groupedByToken.get(b.tokenId) || [];
    arr.push(b);
    groupedByToken.set(b.tokenId, arr);
  }
  const tokenGroups = Array.from(groupedByToken.entries()).map(([tokenId, batches]) => {
    const sorted = [...batches].sort((a, b) => a.expiresDay - b.expiresDay);
    const totalCount = sorted.reduce((s, b) => s + b.count, 0);
    const totalValue = sorted.reduce((s, b) => s + b.count * b.avgPrice, 0);
    const avgPrice = totalCount > 0 ? totalValue / totalCount : 0;
    return { tokenId, batches: sorted, totalCount, avgPrice };
  });

  return (
    <aside className="flex h-full w-full flex-col gap-3 overflow-y-auto bg-gray-900 p-3 md:p-4">
      <PortfolioCurve
        history={portfolioHistory}
        currentTotal={cash + tokenValue + gpuValue}
        daysToRent={daysToRent}
      />

      {/* 现金 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-3 md:p-4">
        <p className="text-xs text-gray-400">现金余额</p>
        <p className="mt-1 font-mono text-xl md:text-2xl font-bold tabular text-amber-400">
          {formatMoney(cash)}
        </p>
      </div>

      {/* 状态条 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-3 md:p-4 space-y-3.5">
        <StatBar
          label="精神 SPIRIT"
          value={spirit}
          max={100}
          barColor={spiritBar}
          textColor={spiritText}
          hint={
            spirit <= 0 ? '已熄火 · 强制休息' : spirit < 30 ? '濒临崩溃' : undefined
          }
        />
        <StatBar
          label="信誉 REPUTATION"
          value={reputation}
          max={100}
          barColor={repBar}
          textColor={repText}
          hint={reputation < 20 ? '已被市场拉黑' : undefined}
        />
      </div>

      {/* 下次房租 */}
      <div
        className={`rounded-xl border p-3 md:p-4 ${
          rentRedFlag
            ? 'bg-red-500/5 border-red-500/40'
            : 'bg-gray-800/60 border-gray-700/60'
        }`}
      >
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">下次房租</p>
          <span className="text-xs text-gray-500">T-{daysToRent} 天</span>
        </div>
        <p
          className={`mt-1 font-mono text-lg md:text-xl font-semibold tabular ${
            rentRedFlag ? 'text-red-500' : 'text-red-400'
          }`}
        >
          ¥{rentAmount.toLocaleString()}
        </p>
        {rentRedFlag && (
          <p className="mt-1 text-xs text-red-400">现金不足以交租</p>
        )}
      </div>

      {/* 持仓 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-3 md:p-4 flex-1 min-h-0 flex flex-col">
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">持仓</p>
          <span className="text-xs text-gray-500">{tokenGroups.length} / 7</span>
        </div>
        <p className="mt-1 text-[10px] text-gray-500 leading-relaxed">
          Token 保质期 7 天，过期自动清空
        </p>
        {tokenGroups.length === 0 ? (
          <p className="mt-6 py-4 text-center text-xs text-gray-500">
            暂无持仓
          </p>
        ) : (
          <ul className="mt-3 space-y-2 overflow-y-auto pr-1 -mr-1">
            {tokenGroups.map((g) => {
              const t = TOKENS[g.tokenId];
              const cur = valuationPrices[g.tokenId] || 0;
              const pl = g.avgPrice > 0 ? ((cur - g.avgPrice) / g.avgPrice) * 100 : 0;
              const isXy = g.tokenId === 6;
              return (
                <li
                  key={g.tokenId}
                  className="rounded-lg border border-gray-700/50 bg-gray-900/40 p-2.5"
                >
                  {/* 汇总行 */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm text-gray-100 truncate">{t.name}</p>
                      {g.avgPrice > 0 && (
                        <p className="text-[10px] text-gray-500">
                          均价 ¥{g.avgPrice.toFixed(2)}
                        </p>
                      )}
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-mono text-sm text-gray-100 tabular">
                        {isXy ? `${g.totalCount} 个` : formatToken(g.totalCount)}
                      </p>
                      {g.avgPrice > 0 && (
                        <p
                          className={`font-mono text-[10px] tabular ${
                            pl >= 0 ? 'text-emerald-400' : 'text-red-400'
                          }`}
                        >
                          {pl >= 0 ? '+' : ''}
                          {pl.toFixed(1)}%
                        </p>
                      )}
                    </div>
                  </div>
                  {/* 批次明细 */}
                  <ul className="mt-2 space-y-0.5 border-t border-gray-700/40 pt-1.5">
                    {g.batches.map((b, idx) => {
                      // 显示剩余天数：如果当天即最后一天，剩 0 天
                      const daysLeft = Math.max(0, b.expiresDay - day - 1);
                      const colorCls =
                        daysLeft <= 1
                          ? 'text-red-400'
                          : daysLeft <= 3
                          ? 'text-amber-400'
                          : 'text-emerald-400';
                      const dotCls =
                        daysLeft <= 1
                          ? 'bg-red-500 animate-pulse'
                          : daysLeft <= 3
                          ? 'bg-amber-400'
                          : 'bg-emerald-500';
                      return (
                        <li
                          key={`${b.purchaseDay}-${idx}`}
                          className="flex items-center justify-between text-[11px] font-mono tabular"
                        >
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <span className={`inline-block h-1.5 w-1.5 rounded-full ${dotCls}`} />
                            <span>{isXy ? `${b.count}个` : formatToken(b.count)}</span>
                          </span>
                          <span className={colorCls}>
                            {daysLeft <= 0 ? '即将过期' : `剩 ${daysLeft} 天`}
                          </span>
                        </li>
                      );
                    })}
                  </ul>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </aside>
  );
}
