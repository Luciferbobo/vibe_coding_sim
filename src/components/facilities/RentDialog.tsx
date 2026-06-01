// 公寓 - 房租
import { useGameStore } from '../../stores/gameStore';
import { formatMoney, formatDay } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';
import { GPUS } from '../../data/gpus';
import { TOKENS } from '../../data/tokens';

export function RentDialog() {
  const cash = useGameStore((s) => s.cash);
  const day = useGameStore((s) => s.day);
  const nextRentDay = useGameStore((s) => s.nextRentDay);
  const rentAmount = useGameStore((s) => s.rentAmount);
  const payRent = useGameStore((s) => s.payRent);
  const consecutiveEarlyRents = useGameStore((s) => s.consecutiveEarlyRents);
  const gpus = useGameStore((s) => s.gpus);
  const currentPrices = useGameStore((s) => s.currentPrices);

  // 电费随通胀上涨：以 Claude(tokenId=0) 当前价 / 基础价 为准
  const inflationRatio = TOKENS[0].basePrice > 0
    ? (currentPrices[0] || 0) / TOKENS[0].basePrice
    : 1;
  const baseDailyElectricity = gpus
    .filter((g) => g.active && g.usedDays < g.lifespan)
    .reduce((sum, g) => sum + GPUS[g.gpuTierId].dailyElectricity, 0);
  const dailyElectricity = baseDailyElectricity * inflationRatio;
  const weeklyElectricity = Math.round(dailyElectricity * 7);
  const totalRentCost = rentAmount + weeklyElectricity;

  const daysToRent = Math.max(0, nextRentDay - day);
  const isDue = daysToRent <= 0;
  const cantPay = cash < totalRentCost;
  // 有活跃GPU（产生电费）时禁止提前交租：电费需按实际天数计算
  const hasElectricity =
    gpus.some((g) => g.active && g.usedDays < g.lifespan) || weeklyElectricity > 0;
  const earlyBlockedByGpu = !isDue && hasElectricity;

  return (
    <div className="flex h-full items-center justify-center px-6 py-6">
      <div className="w-full max-w-2xl">
        <h2 className="text-2xl font-semibold text-gray-100">
          🏠 公寓 · 你的 10 平米
        </h2>
        <p className="mt-1 text-sm italic text-gray-400">
          阳台朝北，下午光线刚好够你看清屏幕反光里的黑眼圈。
        </p>

        <div
          className={`mt-6 rounded-xl border p-6 ${
            isDue
              ? 'bg-red-500/5 border-red-500/40'
              : 'bg-gray-800/60 border-gray-700/60'
          }`}
        >
          <div className="flex items-center justify-between">
            <p className="text-sm text-gray-400">
              {weeklyElectricity > 0 ? '每周房租+电费' : '每周房租'}
            </p>
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
            {formatMoney(totalRentCost)}<span className="text-lg text-gray-500">/周</span>
          </p>

          {weeklyElectricity > 0 && (
            <p className="mt-1 text-xs text-gray-400">
              房租 {formatMoney(rentAmount)} + 电费 {formatMoney(weeklyElectricity)}
            </p>
          )}

          {weeklyElectricity > rentAmount && (
            <p className="mt-2 text-xs text-amber-400 italic">
              "怎么这个月电费比房租都贵啊..."
            </p>
          )}

          <div className="mt-5 grid grid-cols-2 gap-2">
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
                {formatMoney(cash - totalRentCost)}
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
                  if (cantPay) return;
                  payRent();
                  audioManager.play('pay-rent');
                }}
                disabled={cantPay}
                className={`mt-5 w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  cantPay
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-red-600 hover:bg-red-500 text-white'
                }`}
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
                  if (cantPay || earlyBlockedByGpu) return;
                  payRent();
                  audioManager.play('pay-rent');
                }}
                disabled={cantPay || earlyBlockedByGpu}
                className={`mt-5 w-full px-4 py-2.5 rounded-lg font-medium transition-colors ${
                  cantPay || earlyBlockedByGpu
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed opacity-50'
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white'
                }`}
              >
                提前交租
              </button>
              {earlyBlockedByGpu && (
                <p className="mt-2 text-xs text-amber-400">
                  ⚡ 有GPU运行时无法提前交租（电费按实际天数计算）
                </p>
              )}
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
