// 结束画面 - 简洁终局结算
import { useMemo, useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { calculateGpuDepreciationValue } from '../../stores/gameStore';
import type { PortfolioHistoryPoint } from '../../stores/gameStore';
import { GAME_OVER_QUOTES } from '../../data/events';
import { TOKENS } from '../../data/tokens';
import { ACHIEVEMENTS } from '../../data/achievements';
import { calculateScore, getTitle, getDayComment } from '../../engine/scoreEngine';
import { formatMoney, formatDay } from '../../utils/format';
import { randomChoice } from '../../utils/random';

export function GameOverScreen() {
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const reputation = useGameStore((s) => s.reputation);
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const gameOverReason = useGameStore((s) => s.gameOverReason);
  // 人生报告统计
  const totalTasksCompleted = useGameStore((s) => s.totalTasksCompleted);
  const totalCoffeeDrunk = useGameStore((s) => s.totalCoffeeDrunk);
  const totalBlogsWritten = useGameStore((s) => s.totalBlogsWritten);
  const tokenUsageCount = useGameStore((s) => s.tokenUsageCount);
  const totalSellCount = useGameStore((s) => s.totalSellCount);
  const bestEarningDay = useGameStore((s) => s.bestEarningDay);
  const inflationLossTotal = useGameStore((s) => s.inflationLossTotal);
  const portfolioHistory = useGameStore((s) => s.portfolioHistory);
  const gpus = useGameStore((s) => s.gpus);
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const achievementUnlockDays = useGameStore((s) => s.achievementUnlockDays);

  const tokenValue = useMemo(
    () =>
      inventory.reduce(
        (sum, it) => sum + it.count * (currentPrices[it.tokenId] || 0),
        0
      ),
    [inventory, currentPrices]
  );

  // GPU 折旧价值也计入总资产评分
  const gpuValue = useMemo(() => calculateGpuDepreciationValue(gpus), [gpus]);

  const score = calculateScore(cash, tokenValue + gpuValue, day, rentAmount);
  const title = getTitle(day);
  const dayComment = getDayComment(day);

  const repLabel =
    reputation >= 80
      ? '业内楷模'
      : reputation >= 50
      ? '路人甲'
      : reputation >= 20
      ? '臭名在外'
      : '人人喊打';

  const [quote] = useState(() =>
    randomChoice(GAME_OVER_QUOTES).replace('{days}', formatDay(day))
  );

  // 计算最爱的模型（被使用次数最多的 Token）
  const favoriteModel = useMemo(() => {
    let bestIdx = -1;
    let bestCount = 0;
    for (let i = 0; i < tokenUsageCount.length; i++) {
      if (tokenUsageCount[i] > bestCount) {
        bestCount = tokenUsageCount[i];
        bestIdx = i;
      }
    }
    return bestIdx >= 0 && bestIdx < TOKENS.length
      ? { name: TOKENS[bestIdx].name, count: bestCount }
      : null;
  }, [tokenUsageCount]);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200">
      <div className="mx-auto max-w-4xl px-4 sm:px-6 md:px-8 py-8 md:py-12">
        {/* 顶部状态 */}
        <div className="flex items-center justify-between text-xs text-gray-500">
          <span className="inline-flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-red-400" />
            SESSION TERMINATED
          </span>
          <span className="font-mono">
            {new Date().toISOString().slice(0, 10)}
          </span>
        </div>

        {/* 主标题：天数评级称号 */}
        <div className="mt-6 md:mt-8 text-center">
          <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight text-gray-50">
            {dayComment}
          </h1>
          <p className="mt-3 md:mt-4 text-xs md:text-sm tracking-[0.25em] uppercase text-gray-500">
            <span className="font-mono text-amber-400">{formatDay(day)}</span> · 游戏结束
          </p>
        </div>

        {/* 引言：结局描述（quote 已移至页面最下方作为收束） */}
        {gameOverReason && (
          <blockquote className="mt-6 md:mt-8 rounded-xl bg-gradient-to-br from-amber-900/30 to-rose-900/20 border border-amber-500/30 px-4 md:px-6 py-4 md:py-5 text-sm md:text-base leading-relaxed text-amber-100">
            🏖️ {gameOverReason}
          </blockquote>
        )}

        {/* 数据卡片 */}
        <div className="mt-6 grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard label="存活时长" value={formatDay(day)} accent="text-emerald-400" />
          <StatCard
            label="最终现金"
            value={formatMoney(cash)}
            accent={cash >= 0 ? 'text-amber-400' : 'text-red-400'}
          />
          <StatCard
            label="库存折现"
            value={formatMoney(tokenValue)}
            accent="text-violet-400"
          />
          <StatCard
            label="信誉"
            value={`${reputation} · ${repLabel}`}
            accent={reputation >= 50 ? 'text-blue-400' : 'text-red-400'}
          />
        </div>

        {/* 称号 */}
        <div className="mt-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 p-5 md:p-6 text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-amber-400/80 uppercase">
            Final Title
          </p>
          <p className="mt-2 text-2xl md:text-3xl font-bold text-amber-300">{title}</p>
          <p className="mt-2 text-sm text-gray-400">
            综合得分{' '}
            <span className="font-mono font-semibold text-amber-300">
              {score.toLocaleString()}
            </span>
          </p>
        </div>

        {/* 成就墙：按时间顺序展示解锁的成就 */}
        <AchievementWall
          unlocked={unlockedAchievements}
          unlockDays={achievementUnlockDays}
        />

        {/* 人生收益曲线 */}
        <LifeCurve history={portfolioHistory} />

        {/* 人生报告 */}
        <div className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 p-6">
          <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-gray-400">
            人生报告 · Life Report
          </h3>
          <div className="mt-5 space-y-2.5 text-base leading-relaxed text-gray-200">
            <p>
              你这辈子接了{' '}
              <span className="font-mono font-semibold text-emerald-400">{totalTasksCompleted}</span>{' '}个项目，喝了{' '}
              <span className="font-mono font-semibold text-amber-400">{totalCoffeeDrunk}</span>{' '}杯咖啡，写了{' '}
              <span className="font-mono font-semibold text-violet-400">{totalBlogsWritten}</span>{' '}次博客。
            </p>
            {favoriteModel ? (
              <p>
                你最爱的模型是{' '}
                <span className="font-semibold text-cyan-400">{favoriteModel.name}</span>{' '}
                <span className="text-gray-400">
                  （用了 <span className="font-mono">{favoriteModel.count}</span> 次）
                </span>
              </p>
            ) : (
              <p className="text-gray-500">你这辈子从没用 AI 写过一行代码。</p>
            )}
            <p>
              你倒卖 Token 共计{' '}
              <span className="font-mono font-semibold text-rose-400">{totalSellCount}</span>{' '}次。
            </p>
            {bestEarningDay.amount > 0 ? (
              <p>
                你赚钱最多的一天是{' '}
                <span className="font-mono text-amber-300">{formatDay(bestEarningDay.day)}</span>，这一天到账{' '}
                <span className="font-mono font-semibold text-amber-400">
                  {formatMoney(bestEarningDay.amount)}
                </span>
              </p>
            ) : (
              <p className="text-gray-500">你这辈子，没有什么“高光时刻”。</p>
            )}
            <p>
              你被通胀蚕食的总价值：{' '}
              <span className="font-mono font-semibold text-red-400">
                {formatMoney(inflationLossTotal)}
              </span>
            </p>
          </div>

        </div>

        {/* 收尾分割线：醒目地将上方数据区与“深刻话语”分隔 */}
        <div className="mt-12 flex items-center gap-4">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent to-gray-500/70" />
          <span className="text-[11px] tracking-[0.4em] uppercase text-gray-400">
            The End
          </span>
          <div className="flex-1 h-px bg-gradient-to-l from-transparent to-gray-500/70" />
        </div>

        {/* 深刻话语：全局收束，沉淀性收尾 */}
        <blockquote className="mt-5 rounded-xl bg-gray-800/60 border border-gray-700/60 px-6 py-7 text-center text-base italic leading-relaxed text-gray-300">
          “{quote}”
        </blockquote>

        {/* 重开 */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-end gap-4">
          <button
            onClick={startNewGame}
            className="px-8 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-900/30 transition-colors"
          >
            再来一局
          </button>
        </div>
      </div>
    </div>
  );
}

function LifeCurve({ history }: { history: PortfolioHistoryPoint[] }) {
  // 找到退休点（如有），曲线截止到该点
  const retireIdx = history.findIndex((p) => p.eventType === 'retire');
  const points = retireIdx >= 0 ? history.slice(0, retireIdx + 1) : history;

  if (points.length < 2) {
    return (
      <div className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 p-6">
        <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-gray-400">
          人生收益 · Life Curve
        </h3>
        <p className="mt-6 text-center text-sm text-gray-500">
          数据点不足，无法绘制曲线
        </p>
      </div>
    );
  }

  const isRetire = retireIdx >= 0;

  const width = 720;
  const height = 220;
  const padX = 24;
  const padY = 28;

  const values = points.map((p) => p.totalValue);
  const minValue = Math.min(...values);
  const maxValue = Math.max(...values);
  const fallbackRange = Math.max(1000, Math.abs(maxValue) * 0.12);
  const low = minValue === maxValue ? minValue - fallbackRange / 2 : minValue;
  const high = minValue === maxValue ? maxValue + fallbackRange / 2 : maxValue;
  const range = Math.max(1, high - low);

  // x 按事件点索引等距分布（避免同一天多事件挤在一起造成视觉跳变）
  const xStep = (width - padX * 2) / (points.length - 1);
  const coords = points.map((p, i) => ({
    point: p,
    x: padX + i * xStep,
    y: height - padY - ((p.totalValue - low) / range) * (height - padY * 2),
  }));

  // 横坐标刻度：事件点位置等距、标签以真实天数显示（最多 5 个，去重避免点太少时重复）
  const tickPositions = [0, 0.25, 0.5, 0.75, 1.0];
  const tickIndicesRaw = tickPositions.map((p) =>
    Math.round(p * (points.length - 1))
  );
  const tickIndices = Array.from(new Set(tickIndicesRaw)).sort((a, b) => a - b);
  const ticks = tickIndices.map((idx) => ({
    day: points[idx].day,
    xPct: (coords[idx].x / width) * 100,
    isFirst: idx === 0,
    isLast: idx === points.length - 1,
  }));

  const linePath = coords
    .map((c, i) => `${i === 0 ? 'M' : 'L'} ${c.x.toFixed(1)} ${c.y.toFixed(1)}`)
    .join(' ');
  const lastX = coords[coords.length - 1].x.toFixed(1);
  const firstX = coords[0].x.toFixed(1);
  const baseY = (height - padY).toFixed(1);
  const areaPath = `${linePath} L ${lastX} ${baseY} L ${firstX} ${baseY} Z`;

  const peakValue = Math.max(...values);

  return (
    <div className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 p-6">
      <div className="flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-gray-400">
          人生收益 · Life Curve
        </h3>
        <div className="text-right text-xs text-gray-500">
          <span>峰值 </span>
          <span className="font-mono font-semibold text-amber-300">
            {formatMoney(peakValue)}
          </span>
        </div>
      </div>

      <svg
        className="mt-4 w-full"
        viewBox={`0 0 ${width} ${height}`}
        preserveAspectRatio="none"
        role="img"
        aria-label="人生收益曲线"
      >
        <defs>
          <linearGradient id="lifeCurveArea" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.32" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>

        {/* 基线 */}
        <line
          x1={padX}
          y1={height - padY}
          x2={width - padX}
          y2={height - padY}
          stroke="rgba(148,163,184,0.2)"
          strokeWidth="1"
        />

        {/* 资产填充区 + 折线 */}
        <path d={areaPath} fill="url(#lifeCurveArea)" />
        <path
          d={linePath}
          fill="none"
          stroke="#34d399"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2.5"
        />

        {/* 退休锚点：仅退休结局显示 */}
        {isRetire && (
          <g>
            <line
              x1={coords[coords.length - 1].x}
              y1={padY}
              x2={coords[coords.length - 1].x}
              y2={height - padY}
              stroke="#fbbf24"
              strokeWidth="1.5"
              strokeDasharray="3 3"
              opacity="0.75"
            />
            <circle
              cx={coords[coords.length - 1].x}
              cy={coords[coords.length - 1].y}
              r="4.5"
              fill="#fbbf24"
              stroke="#1f2937"
              strokeWidth="1.5"
            />
          </g>
        )}
      </svg>

      {/* 横坐标刻度：事件点等距，标签显示真实天数 */}
      <div className="relative mt-2 h-5 text-xs text-gray-500">
        {ticks.map((tick, i) => {
          const isRetireTick = isRetire && tick.isLast;
          const align = tick.isFirst
            ? 'translate-x-0'
            : tick.isLast
            ? '-translate-x-full'
            : '-translate-x-1/2';
          return (
            <span
              key={i}
              className={`absolute top-0 whitespace-nowrap ${align} ${
                isRetireTick ? 'font-medium text-amber-400' : 'font-mono'
              }`}
              style={{ left: `${tick.xPct}%` }}
            >
              {isRetireTick ? (
                <>
                  🏖️ <span className="font-mono">{formatDay(tick.day)}</span> · 退休
                </>
              ) : (
                formatDay(tick.day)
              )}
            </span>
          );
        })}
      </div>
    </div>
  );
}

function StatCard({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-xl bg-gray-800/60 border border-gray-700/60 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-1 font-mono text-lg font-semibold ${accent}`}>
        {value}
      </p>
    </div>
  );
}

/**
 * 成就墙 - 按解锁顺序（天数升序）展示本局获得的成就。
 * 设计语言：
 *   - 沉黑底 + amber/yellow 金色叠加，与 Final Title 卡片呔响
 *   - 卡片左上角序号、右上角徽章，中央大 emoji 勋章
 *   - 底部微小双行：名称 + Day xxx、描述
 *   - 底部一根抽象“时间轴”加强顶部语义
 */
function AchievementWall({
  unlocked,
  unlockDays,
}: {
  unlocked: string[];
  unlockDays: Record<string, number>;
}) {
  const total = ACHIEVEMENTS.length;
  const count = unlocked.length;

  // 按 day 升序排；同一天同时解锁时以原始解锁顺序（unlocked 数组顺序）为次要排序
  const items = useMemo(() => {
    return unlocked
      .map((id, idx) => {
        const meta = ACHIEVEMENTS.find((a) => a.id === id);
        if (!meta) return null;
        const day = unlockDays[id] ?? 0;
        return { id, meta, day, idx };
      })
      .filter(
        (v): v is { id: string; meta: typeof ACHIEVEMENTS[number]; day: number; idx: number } =>
          v !== null
      )
      .sort((a, b) => (a.day - b.day) || (a.idx - b.idx));
  }, [unlocked, unlockDays]);

  return (
    <div className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold tracking-[0.25em] uppercase text-gray-400">
            成就墙 · Achievements
          </h3>
        </div>
        <div className="text-right text-xs text-gray-500">
          已获得{' '}
          <span className="font-mono text-base font-semibold text-amber-300">
            {count}
          </span>
          <span className="text-gray-600"> / {total}</span>
        </div>
      </div>

      {count === 0 ? (
        <div className="mt-6 rounded-lg border border-dashed border-gray-700/60 px-6 py-10 text-center">
          <p className="text-3xl opacity-30 grayscale">🎖️</p>
          <p className="mt-3 text-sm text-gray-500">
            这一生平平无奇，你没有获得任何成就。
          </p>
        </div>
      ) : (
        <>
          <div className="mt-5 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {items.map((it, i) => (
              <div
                key={it.id}
                className="group relative overflow-hidden rounded-xl border border-amber-500/30 bg-gradient-to-br from-amber-500/10 via-amber-500/5 to-yellow-500/0 px-3 py-3 shadow-sm shadow-amber-900/10 transition-all hover:border-amber-400/60 hover:shadow-amber-700/20"
                title={`${it.meta.name} — ${it.meta.description}\n解锁于 ${formatDay(it.day)}`}
              >
                {/* 微光晕 */}
                <div className="pointer-events-none absolute -top-8 -right-8 h-20 w-20 rounded-full bg-amber-400/10 blur-2xl transition-opacity group-hover:bg-amber-300/20" />

                {/* 序号 */}
                <div className="relative flex items-center justify-between text-[10px]">
                  <span className="font-mono tracking-[0.2em] text-amber-400/70">
                    #{(i + 1).toString().padStart(2, '0')}
                  </span>
                  <span className="rounded bg-amber-500/15 px-1.5 py-0.5 font-mono text-[10px] font-medium text-amber-300">
                    {formatDay(it.day)}
                  </span>
                </div>

                {/* 大勋章 */}
                <div className="relative mt-2 flex h-12 items-center justify-center">
                  <span
                    className="text-4xl leading-none drop-shadow-[0_0_10px_rgba(252,211,77,0.35)] transition-transform group-hover:scale-110"
                    aria-hidden
                  >
                    {it.meta.icon}
                  </span>
                </div>

                {/* 名称 + 描述 */}
                <p className="relative mt-2 truncate text-center text-sm font-semibold text-amber-200">
                  {it.meta.name}
                </p>
                <p className="relative mt-1 line-clamp-2 text-center text-[11px] leading-snug text-gray-400">
                  {it.meta.description}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
