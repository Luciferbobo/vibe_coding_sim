// 公寓 - 房租
import { useGameStore } from '../../stores/gameStore';
import { formatMoney, formatDay } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';

export function RentDialog() {
  const cash = useGameStore((s) => s.cash);
  const day = useGameStore((s) => s.day);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const payRent = useGameStore((s) => s.payRent);
  const consecutiveEarlyRents = useGameStore((s) => s.consecutiveEarlyRents);

  const daysToRent = Math.max(0, nextRentDay - day);
  const isDue = daysToRent <= 0;
  const cantPay = cash < rentAmount;

  return (
    <div className="flex h-full items-center justify-center overflow-y-auto px-4 py-4 md:px-6 md:py-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-xl font-semibold text-gray-100 md:text-2xl">
          🏠 公寓 · 你的 10 平米
        </h2>
        <p className="mt-1 text-sm italic text-gray-400">
          阳台朝北，下午光线刚好够你看清屏幕反光里的黑眼圈。
        </p>

        <div
          className={`mt-4 rounded-xl border p-4 md:mt-6 md:p-6 ${
            isDue
              ? 'bg-red-500/5 border-red-500/40'
              : 'bg-gray-800/60 border-gray-700/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">每周房租</p>
            <p
              className={`text-xs font-medium ${
                isDue ? 'text-red-400' : 'text-gray-500'
              }`}
            >
              {isDue ? '已到期' : `T-${daysToRent} 天`}
            </p>
          </div>

          <p
            className={`mt-3 font-mono text-4xl font-bold tabular ${
              isDue ? 'text-red-400' : 'text-violet-400'
            }`}
          >
            {formatMoney(rentAmount)}<span className="text-lg text-gray-500">/周</span>
          </p>

          <div className="mt-5 grid grid-cols-1 gap-2 sm:grid-cols-2">
            <div className="rounded-lg bg-gray-900/60 border border-gray-700/50 px-3 py-2">
              <p className="text-xs text-gray-500">下次交租日</p>
              <p className="mt-0.5 font-mono text-sm font-semibold text-gray-200 tabular">
                {formatDay(nextRentDay)}
              </p>
            </div>
            <div className="rounded-lg bg-gray-900/60 border border-gray-700/50 px-3 py-2">
              <p className="text-xs text-gray-500">交租后余额</p>
              <p
                className={`mt-0.5 font-mono text-sm font-semibold tabular ${
                  cantPay ? 'text-red-400' : 'text-amber-400'
                }`}
              >
                {formatMoney(cash - rentAmount)}
              </p>
            </div>
          </div>

          {consecutiveEarlyRents > 0 && (
            <div className="mt-3 rounded-lg bg-emerald-500/10 border border-emerald-500/30 px-3 py-2">
              <p className="text-xs text-emerald-400">
                🏆 连续提前交租：<span className="font-semibold">{consecutiveEarlyRents}</span> 次
              </p>
            </div>
          )}

          {isDue ? (
            <>
              <button
                onClick={() => {
                  payRent();
                  audioManager.play('pay-rent');
                }}
                className="mt-5 h-11 w-full rounded-lg bg-red-600 px-4 font-medium text-white transition-colors hover:bg-red-500"
              >
                交租
              </button>
              {cantPay && (
                <p className="mt-2 text-xs text-red-400">
                  你的钱不够交房租……房东已经在敲门了。
                </p>
              )}
            </>
          ) : (
            <>
              <button
                onClick={() => {
                  payRent();
                  audioManager.play('pay-rent');
                }}
                disabled={cantPay}
                className={`mt-5 h-11 w-full rounded-lg px-4 font-medium transition-colors ${
                  cantPay
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                提前交租
              </button>
              <div className="mt-3 rounded-lg bg-gray-900/40 border border-gray-700/50 p-3 text-sm leading-relaxed text-gray-400">
                <p>
                  <span className="text-emerald-400">·</span> 还有{' '}
                  <span className="font-semibold text-emerald-400">
                    {daysToRent}
                  </span>{' '}
                  天到期，房租到期日会自动扣除。
                </p>
              </div>
            </>
          )}
        </div>

        <p className="mt-4 text-center text-xs text-gray-500">
          房租是北漂的隐藏 boss
        </p>
      </div>
    </div>
  );
}
