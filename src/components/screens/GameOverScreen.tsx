// 结束画面 - 简洁终局结算
import { useEffect, useMemo, useState } from 'react';
import { useGameStore, LeaderboardEntry } from '../../stores/gameStore';
import { GAME_OVER_QUOTES } from '../../data/events';
import { calculateScore, getTitle, getDayComment } from '../../engine/scoreEngine';
import { formatMoney, formatDay } from '../../utils/format';
import { randomChoice } from '../../utils/random';

const LB_KEY = 'vibe-coding-leaderboard';

function loadBoard(): LeaderboardEntry[] {
  try {
    const raw = localStorage.getItem(LB_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as LeaderboardEntry[];
  } catch {
    return [];
  }
}

function saveBoard(list: LeaderboardEntry[]) {
  try {
    localStorage.setItem(LB_KEY, JSON.stringify(list));
  } catch {
    /* noop */
  }
}

export function GameOverScreen() {
  const day = useGameStore((s) => s.day);
  const cash = useGameStore((s) => s.cash);
  const reputation = useGameStore((s) => s.reputation);
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const startNewGame = useGameStore((s) => s.startNewGame);
  const gameOverReason = useGameStore((s) => s.gameOverReason);

  const tokenValue = useMemo(
    () =>
      inventory.reduce(
        (sum, it) => sum + it.count * (currentPrices[it.tokenId] || 0),
        0
      ),
    [inventory, currentPrices]
  );

  const score = calculateScore(cash, tokenValue, day, rentAmount);
  const title = getTitle(score);
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

  const [board, setBoard] = useState<LeaderboardEntry[]>([]);
  useEffect(() => {
    const list = loadBoard();
    const entry: LeaderboardEntry = {
      score,
      days: day,
      title,
      date: new Date().toISOString().slice(0, 10),
    };
    const merged = [...list, entry]
      .sort((a, b) => b.score - a.score)
      .slice(0, 10);
    saveBoard(merged);
    setBoard(merged);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="min-h-screen w-full bg-gray-900 text-gray-200">
      <div className="mx-auto max-w-4xl px-6 sm:px-8 py-12">
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
        <div className="mt-8 text-center">
          <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-gray-50">
            {dayComment}
          </h1>
          <p className="mt-4 text-sm tracking-[0.25em] uppercase text-gray-500">
            <span className="font-mono text-amber-400">{formatDay(day)}</span> · 游戏结束
          </p>
        </div>

        {/* 引言 */}
        {gameOverReason && (
          <blockquote className="mt-8 rounded-xl bg-gradient-to-br from-amber-900/30 to-rose-900/20 border border-amber-500/30 px-6 py-5 text-base leading-relaxed text-amber-100">
            🏖️ {gameOverReason}
          </blockquote>
        )}
        <blockquote className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 px-6 py-5 text-base italic leading-relaxed text-gray-200">
          "{quote}"
        </blockquote>

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
        <div className="mt-6 rounded-xl bg-gradient-to-br from-amber-500/10 to-amber-500/5 border border-amber-500/30 p-6 text-center">
          <p className="text-xs font-medium tracking-[0.25em] text-amber-400/80 uppercase">
            Final Title
          </p>
          <p className="mt-2 text-3xl font-bold text-amber-300">{title}</p>
          <p className="mt-2 text-sm text-gray-400">
            综合得分{' '}
            <span className="font-mono font-semibold text-amber-300">
              {score.toLocaleString()}
            </span>
          </p>
        </div>

        {/* 排行榜 */}
        <div className="mt-6 rounded-xl bg-gray-800/60 border border-gray-700/60 p-5">
          <h3 className="text-sm font-semibold text-gray-200">
            排行榜 · Top 10
          </h3>
          <ol className="mt-4 space-y-1.5 text-sm">
            {board.length === 0 ? (
              <li className="py-6 text-center text-gray-500">
                还没有任何记录
              </li>
            ) : (
              board.map((e, i) => {
                const isYou =
                  e.score === score && e.days === day && e.title === title;
                return (
                  <li
                    key={i}
                    className={`flex items-center justify-between rounded-lg px-3 py-2 ${
                      isYou
                        ? 'bg-emerald-500/10 text-emerald-300'
                        : 'text-gray-300 hover:bg-gray-700/40'
                    }`}
                  >
                    <span className="flex items-center gap-3 min-w-0">
                      <span className="font-mono w-6 text-right text-gray-500">
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <span className="truncate">{e.title}</span>
                    </span>
                    <span className="flex items-center gap-3 text-xs">
                      <span className="text-gray-500">{formatDay(e.days)}</span>
                      <span className="font-mono font-semibold text-amber-400">
                        {e.score.toLocaleString()}
                      </span>
                    </span>
                  </li>
                );
              })
            )}
          </ol>
        </div>

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
