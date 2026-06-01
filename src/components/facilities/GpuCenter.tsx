// GPU算力中心 - 购买/管理GPU服务器，自动产出Token
import { useGameStore } from '../../stores/gameStore';
import {
  GPUS,
  GPU_BASE_DAILY_OUTPUT,
  GPU_RECYCLE_RATE,
  GPUInstance,
} from '../../data/gpus';
import { TOKENS } from '../../data/tokens';
import { audioManager } from '../../utils/audioManager';

// 计算某 GPU 档位选用某 Token 时的日产值（产出量 × 当前价）
function calcDailyValue(
  gpuTierId: number,
  tokenId: number,
  currentPrices: number[]
): number {
  const baseOutput = GPU_BASE_DAILY_OUTPUT[tokenId] || 0;
  const multiplier = GPUS[gpuTierId].outputMultiplier;
  const price = currentPrices[tokenId] || 0;
  return baseOutput * multiplier * price;
}

// 计算 GPU 实例的回收价（基于固定 basePrice）
function calcRecyclePrice(gpu: GPUInstance): number {
  const remainingRatio = (gpu.lifespan - gpu.usedDays) / gpu.lifespan;
  return Math.round(GPUS[gpu.gpuTierId].basePrice * GPU_RECYCLE_RATE * remainingRatio);
}

// 计算某 GPU 实例的日产出量（M/天）
function calcDailyOutput(gpu: GPUInstance): number {
  if (gpu.selectedTokenId < 0) return 0;
  const baseOutput = GPU_BASE_DAILY_OUTPUT[gpu.selectedTokenId] || 0;
  return baseOutput * GPUS[gpu.gpuTierId].outputMultiplier;
}

// 进度条颜色阶梯：>50% emerald，20-50% amber，<20% red
function lifeBarColor(remainingRatio: number): string {
  if (remainingRatio > 0.5) return 'bg-emerald-500';
  if (remainingRatio >= 0.2) return 'bg-amber-400';
  return 'bg-red-500';
}

// 可选的产出 Token（id 0-5，不含咸鱼Cursor）
const OUTPUT_TOKEN_IDS = [0, 1, 2, 3, 4, 5];

export default function GpuCenter() {
  const cash = useGameStore((s) => s.cash);
  const gpus = useGameStore((s) => s.gpus);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const buyGpu = useGameStore((s) => s.buyGpu);
  const configureGpuOutput = useGameStore((s) => s.configureGpuOutput);
  const sellGpu = useGameStore((s) => s.sellGpu);

  // 电费通胀系数：以 Claude (tokenId=0) 当前价 / 基础价 为准
  const inflationRatio = TOKENS[0].basePrice > 0
    ? (currentPrices[0] || 0) / TOKENS[0].basePrice
    : 1;

  return (
    <div className="flex h-full flex-col">
      {/* 顶部标题 */}
      <div className="border-b border-gray-800 px-6 py-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">
              ⚛️ GPU算力中心
            </h2>
            <p className="mt-1 text-sm italic text-gray-400">
              购买GPU服务器，让Token自动流入你的钱包
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">运行中</p>
            <p className="mt-0.5 font-mono text-lg font-semibold tabular text-emerald-300">
              {gpus.length} 台
            </p>
          </div>
        </div>
      </div>

      {/* 滚动主体 */}
      <div className="flex-1 overflow-y-auto px-6 py-5 space-y-6">
        {/* 我的GPU */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-100">
              📦 我的GPU
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({gpus.length} 台运行中)
              </span>
            </h3>
          </div>

          {gpus.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-700/60 bg-gray-800/40 px-5 py-8 text-center">
              <p className="text-sm text-gray-400">
                还没有GPU服务器，去商城看看吧 ↓
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gpus.map((gpu) => (
                <GpuInstanceCard
                  key={gpu.id}
                  gpu={gpu}
                  currentPrices={currentPrices}
                  inflationRatio={inflationRatio}
                  onConfigure={(tid) => configureGpuOutput(gpu.id, tid)}
                  onSell={() => sellGpu(gpu.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* GPU 商城 */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-lg font-semibold text-gray-100">🛒 GPU商城</h3>
            <p className="text-xs text-gray-500">
              售价固定，电费随Token通胀上涨
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {GPUS.map((g) => {
              const price = g.basePrice;
              const currentDailyElectricity = Math.round(g.dailyElectricity * inflationRatio);
              const canBuy = cash >= price;
              return (
                <div
                  key={g.id}
                  className="rounded-lg border border-gray-700/60 bg-gray-800/60 p-4 flex flex-col"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-100 truncate">
                        {g.icon} {g.name}
                      </p>
                      <p className="mt-0.5 text-xs text-gray-400 truncate">
                        {g.description}
                      </p>
                    </div>
                    <span className="shrink-0 rounded bg-violet-500/15 text-violet-300 text-[10px] px-1.5 py-0.5 font-medium">
                      T{g.tier}
                    </span>
                  </div>

                  <div className="mt-3">
                    <p className="font-mono text-xl font-semibold text-amber-400 tabular">
                      ¥{price.toLocaleString()}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
                      <p className="text-gray-500">产出倍率</p>
                      <p className="mt-0.5 font-mono font-semibold text-emerald-300 tabular">
                        ×{g.outputMultiplier}
                      </p>
                    </div>
                    <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
                      <p className="text-gray-500">日电费</p>
                      <p className="mt-0.5 font-mono font-semibold text-red-300 tabular">
                        ¥{currentDailyElectricity.toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-gray-500">
                    寿命 {g.lifespan} 天 · 报废前可回收 {Math.round(GPU_RECYCLE_RATE * 100)}%
                  </p>

                  <button
                    onClick={() => {
                      const ok = buyGpu(g.id);
                      if (ok) audioManager.play('buy-token');
                    }}
                    disabled={!canBuy}
                    className="mt-3 w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                  >
                    {canBuy ? '购买' : '余额不足'}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 旁注 */}
        <section>
          <div className="rounded-lg border-l-2 border-amber-500/40 bg-gray-800/60 px-3 py-2.5">
            <p className="text-xs font-medium text-amber-300">运营提示</p>
            <p className="mt-1 text-sm text-gray-300 leading-snug">
              GPU 寿命 30 天，期间每天自动产出所选 Token（保质期 7 天）。
              <br />
              电费随每周房租一并扣除，余额不足会跟房租一起进入宽限期。
            </p>
          </div>
        </section>
      </div>
    </div>
  );
}

/* ---------------- GPU 实例卡片 ---------------- */

interface GpuInstanceCardProps {
  gpu: GPUInstance;
  currentPrices: number[];
  inflationRatio: number;
  onConfigure: (tokenId: number) => void;
  onSell: () => void;
}

function GpuInstanceCard({
  gpu,
  currentPrices,
  inflationRatio,
  onConfigure,
  onSell,
}: GpuInstanceCardProps) {
  const def = GPUS[gpu.gpuTierId];
  const remaining = gpu.lifespan - gpu.usedDays;
  const remainingRatio = remaining / gpu.lifespan;
  const barColor = lifeBarColor(remainingRatio);
  const recyclePrice = calcRecyclePrice(gpu);
  const currentDailyElectricity = Math.round(def.dailyElectricity * inflationRatio);

  const hasOutput = gpu.selectedTokenId >= 0;
  const dailyOutput = calcDailyOutput(gpu);
  const dailyValue = hasOutput
    ? calcDailyValue(gpu.gpuTierId, gpu.selectedTokenId, currentPrices)
    : 0;
  const tokenName = hasOutput ? TOKENS[gpu.selectedTokenId].name : null;

  return (
    <div className="rounded-lg border border-gray-700/60 bg-gray-800/60 p-4">
      {/* 顶行：型号 + 剩余天数 */}
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-lg">{def.icon}</span>
          <p className="font-semibold text-gray-100 truncate">{def.name}</p>
          <span className="shrink-0 rounded bg-gray-700/60 text-gray-400 text-[10px] px-1.5 py-0.5">
            T{def.tier}
          </span>
        </div>
        <p className="font-mono text-xs text-gray-400 tabular shrink-0">
          {gpu.usedDays}/{gpu.lifespan} 天
        </p>
      </div>

      {/* 寿命进度条 */}
      <div className="mt-2 h-2 rounded-full bg-gray-900/80 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, remainingRatio * 100))}%` }}
        />
      </div>

      {/* 产出 + 数据 */}
      <div className="mt-3 grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-gray-500">当前产出</p>
          <p className="mt-0.5 text-gray-200 truncate">
            {hasOutput ? (
              <>
                <span className="font-medium">{tokenName}</span>
                <span className="ml-1 font-mono text-gray-400 tabular">
                  · {dailyOutput.toFixed(0)}M/天
                </span>
              </>
            ) : (
              <span className="text-amber-300">请选择产出Token</span>
            )}
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-gray-500">日产值</p>
          <p className="mt-0.5 font-mono font-semibold text-amber-400 tabular">
            {hasOutput ? `¥${Math.round(dailyValue).toLocaleString()}` : '—'}
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-gray-500">日电费</p>
          <p className="mt-0.5 font-mono font-semibold text-red-300 tabular">
            ¥{currentDailyElectricity.toLocaleString()}/天
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-gray-500">累计产出</p>
          <p className="mt-0.5 font-mono font-semibold text-emerald-300 tabular">
            ¥{Math.round(gpu.totalOutput).toLocaleString()}
          </p>
        </div>
      </div>

      {/* 操作行 */}
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <label className="text-xs text-gray-500">切换产出</label>
        <select
          value={gpu.selectedTokenId}
          onChange={(e) => onConfigure(Number(e.target.value))}
          className="text-xs bg-gray-900/80 border border-gray-700/60 rounded px-2 py-1 text-gray-200 focus:outline-none focus:border-emerald-500/60"
        >
          {!hasOutput && (
            <option value={-1} disabled>
              请选择…
            </option>
          )}
          {OUTPUT_TOKEN_IDS.map((tid) => {
            const v = calcDailyValue(gpu.gpuTierId, tid, currentPrices);
            const out =
              (GPU_BASE_DAILY_OUTPUT[tid] || 0) * GPUS[gpu.gpuTierId].outputMultiplier;
            return (
              <option key={tid} value={tid}>
                {TOKENS[tid].name} · {out.toFixed(0)}M/天 · ¥
                {Math.round(v).toLocaleString()}
              </option>
            );
          })}
        </select>

        <div className="ml-auto flex items-center gap-2">
          <span className="text-xs text-gray-500">
            回收价{' '}
            <span className="font-mono text-amber-400 tabular">
              ¥{recyclePrice.toLocaleString()}
            </span>
          </span>
          <button
            onClick={onSell}
            className="px-3 py-1.5 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors"
          >
            卖出
          </button>
        </div>
      </div>
    </div>
  );
}
