// 右侧状态面板 - 干净的数据展示
import { useGameStore, TokenBatch } from '../../stores/gameStore';
import type { PortfolioHistoryPoint } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { formatDay, formatMoney, formatToken } from '../../utils/format';

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
  'retire',
];

type ChartCoord = {
  point: PortfolioHistoryPoint;
  x: number;
  y: number;
  delta: number;
};

type MarkerKind = 'operation' | 'rent' | 'market' | 'event';

function formatCompactMoney(amount: number): string {
  const abs = Math.abs(amount);
  if (abs >= 100000000) return `¥${(amount / 100000000).toFixed(1)}亿`;
  if (abs >= 10000) return `¥${(amount / 10000).toFixed(1)}万`;
  return formatMoney(amount);
}

function formatCompactDelta(amount: number): string {
  if (Math.abs(amount) < 1) return '无变化';
  return `${amount > 0 ? '+' : '-'}${formatCompactMoney(Math.abs(amount))}`;
}

function getMarkerKindLabel(kind: MarkerKind): string {
  switch (kind) {
    case 'operation':
      return '操作/收支';
    case 'rent':
      return '房租';
    case 'event':
      return '随机事件';
    case 'market':
    default:
      return '市场波动';
  }
}

function getMarkerTone(kind: MarkerKind): {
  dot: string;
  text: string;
  border: string;
} {
  switch (kind) {
    case 'operation':
      return {
        dot: 'bg-sky-400',
        text: 'text-sky-200',
        border: 'border-sky-400/35',
      };
    case 'rent':
      return {
        dot: 'bg-emerald-400',
        text: 'text-emerald-200',
        border: 'border-emerald-400/35',
      };
    case 'event':
      return {
        dot: 'bg-amber-300',
        text: 'text-amber-200',
        border: 'border-amber-300/35',
      };
    case 'market':
    default:
      return {
        dot: 'bg-slate-400',
        text: 'text-slate-200',
        border: 'border-slate-400/35',
      };
  }
}

function getMarkerDescription(coord: ChartCoord, kind: MarkerKind): string {
  return [
    getMarkerKindLabel(kind),
    formatDay(coord.point.day),
    coord.point.label,
    `资产 ${formatCompactMoney(coord.point.totalValue)}`,
    `变化 ${formatCompactDelta(coord.delta)}`,
  ].join('，');
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
  const coords: ChartCoord[] = drawableHistory.map((point, index) => {
    const previous = drawableHistory[index - 1];
    return {
      point,
      x: padX + index * xStep,
      y: height - padY - ((point.totalValue - low) / range) * (height - padY * 2),
      delta: previous ? point.totalValue - previous.totalValue : 0,
    };
  });
  const linePath = coords
    .map((coord, index) => `${index === 0 ? 'M' : 'L'} ${coord.x.toFixed(1)} ${coord.y.toFixed(1)}`)
    .join(' ');
  const areaPath = `${linePath} L ${coords[coords.length - 1].x.toFixed(1)} ${height - padY} L ${coords[0].x.toFixed(1)} ${height - padY} Z`;
  const rentMarkers = coords.filter((coord) => coord.point.eventType === 'rent');
  const operationMarkers = coords.filter((coord) =>
    OPERATION_TYPES.includes(coord.point.eventType)
  );
  const passiveMarkers = coords.filter(
    (coord, index) =>
      index > 0 &&
      Math.abs(coord.delta) >= 1 &&
      (coord.point.eventType === 'day' || coord.point.eventType === 'event')
  );
  const markerOverlays = [
    ...passiveMarkers.map((coord) => ({
      coord,
      kind: (coord.point.eventType === 'event' ? 'event' : 'market') as MarkerKind,
    })),
    ...rentMarkers.map((coord) => ({ coord, kind: 'rent' as MarkerKind })),
    ...operationMarkers.map((coord) => ({ coord, kind: 'operation' as MarkerKind })),
  ];
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
          <p className="text-xs text-gray-400">Portfolio 资产曲线</p>
          <p className="mt-0.5 font-mono text-lg font-bold tabular text-red-300">
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

      <div className="relative mt-2 h-[78px]">
        <svg
          className="absolute inset-x-0 top-0 h-[72px] w-full overflow-visible"
          viewBox={`0 0 ${width} ${height}`}
          role="img"
          aria-label="Portfolio 变化曲线"
        >
          <defs>
            <linearGradient id="portfolioArea" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#f87171" stopOpacity="0.28" />
              <stop offset="100%" stopColor="#f87171" stopOpacity="0" />
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
              key={`rent-line-${coord.point.id}`}
              x1={coord.x}
              y1={padY}
              x2={coord.x}
              y2={height - padY}
              stroke="#34d399"
              strokeDasharray="3 3"
              strokeLinecap="round"
              strokeWidth="2"
              opacity="0.9"
            />
          ))}
          <path d={areaPath} fill="url(#portfolioArea)" />
          <path
            d={linePath}
            fill="none"
            stroke="#f87171"
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="3"
          />
          {passiveMarkers.map((coord) => (
            <circle
              key={`passive-${coord.point.id}`}
              cx={coord.x}
              cy={coord.y}
              r="1.9"
              fill={coord.point.eventType === 'event' ? '#fbbf24' : '#94a3b8'}
              opacity="0.9"
            />
          ))}
          {rentMarkers.map((coord) => (
            <circle
              key={`rent-dot-${coord.point.id}`}
              cx={coord.x}
              cy={coord.y}
              r="3.2"
              fill="#34d399"
              stroke="#0f172a"
              strokeWidth="1.3"
            />
          ))}
          {operationMarkers.map((coord) => (
            <circle
              key={`op-${coord.point.id}`}
              cx={coord.x}
              cy={coord.y}
              r="2.9"
              fill="#38bdf8"
              stroke="#0f172a"
              strokeWidth="1.3"
            />
          ))}
        </svg>

        {markerOverlays.map(({ coord, kind }) => {
          const tone = getMarkerTone(kind);
          const alignRight = coord.x > width * 0.62;
          const deltaClass =
            coord.delta > 0 ? 'text-emerald-300' : coord.delta < 0 ? 'text-red-300' : 'text-gray-400';
          return (
            <button
              key={`marker-hit-${kind}-${coord.point.id}`}
              type="button"
              className="group absolute z-10 flex h-5 w-5 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-300"
              style={{
                left: `${(coord.x / width) * 100}%`,
                top: `${(coord.y / height) * 72}px`,
              }}
              aria-label={getMarkerDescription(coord, kind)}
            >
              <span className="sr-only">{getMarkerDescription(coord, kind)}</span>
              <span
                className={`pointer-events-none absolute bottom-5 z-20 min-w-[138px] max-w-[180px] rounded-md border ${tone.border} bg-gray-950/95 p-2 text-left shadow-xl opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${
                  alignRight ? 'right-1/2 mr-1' : 'left-1/2 ml-1'
                }`}
              >
                <span className={`block text-[10px] font-semibold leading-tight ${tone.text}`}>
                  <span className={`mr-1 inline-block h-1.5 w-1.5 rounded-full ${tone.dot}`} />
                  {getMarkerKindLabel(kind)} · {formatDay(coord.point.day)}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-gray-100">
                  {coord.point.label}
                </span>
                <span className="mt-1 flex items-center justify-between gap-3 font-mono text-[10px] tabular text-gray-400">
                  <span>{formatCompactMoney(coord.point.totalValue)}</span>
                  <span className={deltaClass}>{formatCompactDelta(coord.delta)}</span>
                </span>
              </span>
            </button>
          );
        })}
      </div>

      <div className="mt-1 flex items-start justify-between gap-2 text-[10px] text-gray-500">
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-3 rounded-full bg-red-400" />
            资产
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400" />
            市场
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            操作
          </span>
          <span className="inline-flex items-center gap-1">
            <span className="h-3 w-0.5 rounded-full bg-emerald-400" />
            房租
          </span>
        </div>
        <span className="shrink-0 font-mono tabular">T-{daysToRent}d</span>
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
  const portfolioHistory = useGameStore((s) => s.portfolioHistory);

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
    (sum, it) => sum + it.count * (currentPrices[it.tokenId] || 0),
    0
  );

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
    <aside className="flex h-full w-full flex-col gap-3 overflow-y-auto bg-gray-900 p-4">
      <PortfolioCurve
        history={portfolioHistory}
        currentTotal={cash + tokenValue}
        daysToRent={daysToRent}
      />

      {/* 现金 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4">
        <p className="text-xs text-gray-400">现金余额</p>
        <p className="mt-1 font-mono text-2xl font-bold tabular text-amber-400">
          {formatMoney(cash)}
        </p>
        <p className="mt-1 text-xs text-gray-500">
          总资产估值{' '}
          <span className="text-gray-300 font-mono">
            {formatMoney(cash + tokenValue)}
          </span>
        </p>
      </div>

      {/* 状态条 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4 space-y-3.5">
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
        className={`rounded-xl border p-4 ${
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
          className={`mt-1 font-mono text-xl font-semibold tabular ${
            rentRedFlag ? 'text-red-400' : 'text-violet-400'
          }`}
        >
          ¥{rentAmount.toLocaleString()}
        </p>
        {rentRedFlag && (
          <p className="mt-1 text-xs text-red-400">现金不足以交租</p>
        )}
      </div>

      {/* 持仓 */}
      <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4 flex-1 min-h-0 flex flex-col">
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
              const cur = currentPrices[g.tokenId] || 0;
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
