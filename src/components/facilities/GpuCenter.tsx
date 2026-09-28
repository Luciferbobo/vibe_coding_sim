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
import { localizeGpu, localizeToken } from '../../i18n';
import { formatMoney } from '../../utils/format';

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

// 进度条颜色阶梯：与状态脱冲点保持一致的天数阶梯
//   ≥ 8 天 emerald，4–7 天 amber，1–3 天 red
function lifeBarColor(remaining: number): string {
  if (remaining >= 8) return 'bg-emerald-500';
  if (remaining >= 4) return 'bg-amber-400';
  return 'bg-red-500';
}

// 状态脱冲点颜色：按剩余天数 绿（≥ 8）/ 橙（4-7）/ 红（1-3）
function statusDotStyle(remaining: number): {
  color: string;
  shadow: string;
  label: string;
} {
  if (remaining >= 8) {
    return {
      color: 'bg-emerald-400',
      shadow: '0 0 6px rgba(52,211,153,0.7)',
      label: '正常运行',
    };
  }
  if (remaining >= 4) {
    return {
      color: 'bg-amber-400',
      shadow: '0 0 6px rgba(251,191,36,0.7)',
      label: '寿命告警',
    };
  }
  return {
    color: 'bg-red-400',
    shadow: '0 0 6px rgba(248,113,113,0.7)',
    label: '即将报废',
  };
}

// 可选的产出 Token（id 0-5，不含咸鱼Cursor）
const OUTPUT_TOKEN_IDS = [0, 1, 2, 3, 4, 5];

export default function GpuCenter() {
  const cash = useGameStore((s) => s.cash);
  const gpus = useGameStore((s) => s.gpus);
  const day = useGameStore((s) => s.day);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const buyGpu = useGameStore((s) => s.buyGpu);
  const configureGpuOutput = useGameStore((s) => s.configureGpuOutput);
  const sellGpu = useGameStore((s) => s.sellGpu);
  const quantumComputerSold = useGameStore((s) => s.quantumComputerSold);
  const gpuInflationActivated = useGameStore((s) => s.gpuInflationActivated);
  const gpuInflationStartDay = useGameStore((s) => s.gpuInflationStartDay);
  const language = useGameStore((s) => s.language);

  // 电费通胀系数
  const inflationRatio = TOKENS[0].basePrice > 0
    ? (currentPrices[0] || 0) / TOKENS[0].basePrice
    : 1;

  // GPU通胀倍率（每天+25%）
  const gpuInflationMult = gpuInflationActivated
    ? Math.pow(1.25, Math.max(0, day - gpuInflationStartDay))
    : 1;

  return (
    <div className="flex h-full flex-col">
      {/* 顶部标题 */}
      <div className="border-b border-gray-800 px-4 py-3 md:px-6 md:py-5">
        <div className="flex items-end justify-between gap-3 md:gap-4 flex-wrap">
          <div>
            <h2 className="text-lg md:text-xl font-semibold text-gray-100">
              {language === 'en' ? '⚛️ GPU Compute Center' : '⚛️ GPU算力中心'}
            </h2>
            <p className="mt-1 text-xs md:text-sm italic text-gray-400">
              {language === 'en' ? 'Buy GPU servers and let tokens flow into your wallet automatically' : '购买GPU服务器，让Token自动流入你的钱包'}
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">{language === 'en' ? 'Running' : '运行中'}</p>
            <p className="mt-0.5 font-mono text-base md:text-lg font-semibold tabular text-emerald-300">
              {gpus.length} {language === 'en' ? 'units' : '台'}
            </p>
          </div>
        </div>
      </div>

      {/* 滚动主体 */}
      <div className="flex-1 overflow-y-auto px-4 py-4 md:px-6 md:py-5 space-y-5 md:space-y-6">
        {/* 我的GPU */}
        <section>
          <div className="flex items-baseline justify-between mb-3">
            <h3 className="text-base md:text-lg font-semibold text-gray-100">
              {language === 'en' ? '📦 My GPUs' : '📦 我的GPU'}
              <span className="ml-2 text-xs text-gray-500 font-normal">
                ({gpus.length} {language === 'en' ? 'running' : '台运行中'})
              </span>
            </h3>
          </div>

          {gpus.length === 0 ? (
            <div className="rounded-lg border border-dashed border-gray-700/60 bg-gray-800/40 px-5 py-8 text-center">
              <p className="text-sm text-gray-400">
                {language === 'en' ? 'No GPU servers yet. Browse the shop below ↓' : '还没有GPU服务器，去商城看看吧 ↓'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
              {gpus.map((gpu) => (
                <GpuInstanceCard
                  key={gpu.id}
                  gpu={gpu}
                  currentPrices={currentPrices}
                  inflationRatio={inflationRatio}
                  language={language}
                  onConfigure={(tid) => configureGpuOutput(gpu.id, tid)}
                  onSell={() => sellGpu(gpu.id)}
                />
              ))}
            </div>
          )}
        </section>

        {/* GPU 商城 */}
        <section>
          <div className="flex items-baseline justify-between mb-3 gap-2">
            <h3 className="text-base md:text-lg font-semibold text-gray-100">{language === 'en' ? '🛒 GPU shop' : '🛒 GPU商城'}</h3>
            <p className="text-[10px] md:text-xs text-gray-500 text-right">
              {language === 'en' ? 'Fixed prices; electricity rises with token inflation. You can own three at most.' : '售价固定，电费随Token通胀上涨，同时只能持有三台'}
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {GPUS.map((rawGpu) => {
              const g = localizeGpu(rawGpu, language);
              const price = Math.round(g.basePrice * gpuInflationMult);
              const currentDailyElectricity = Math.round(g.dailyElectricity * inflationRatio);
              // 量子计算机原型机（id=4）全世界仅一台，购买后永久禁用
              const isQuantumSoldOut = g.id === 3 && quantumComputerSold;
              const activeGpuCount = gpus.filter(gpu => gpu.active).length;
              const isAtCapacity = activeGpuCount >= 3;
              const canBuy = cash >= price && !isQuantumSoldOut && !isAtCapacity;
              return (
                <div
                  key={g.id}
                  className="rounded-lg border border-gray-700/60 bg-gray-800/60 p-3 md:p-4 flex flex-col"
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
                      {formatMoney(price, language)}
                    </p>
                  </div>

                  <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                    <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
                      <p className="text-gray-500">{language === 'en' ? 'Output multiplier' : '产出倍率'}</p>
                      <p className="mt-0.5 font-mono font-semibold text-emerald-300 tabular">
                        ×{g.outputMultiplier}
                      </p>
                    </div>
                    <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
                      <p className="text-gray-500">{language === 'en' ? 'Daily electricity' : '日电费'}</p>
                      <p className="mt-0.5 font-mono font-semibold text-red-300 tabular">
                        {formatMoney(currentDailyElectricity, language)}
                      </p>
                    </div>
                  </div>

                  <p className="mt-2 text-[11px] text-gray-500">
                    {language === 'en' ? `Lifespan ${g.lifespan} days · ${Math.round(GPU_RECYCLE_RATE * 100)}% recoverable before scrap` : `寿命 ${g.lifespan} 天 · 报废前可回收 ${Math.round(GPU_RECYCLE_RATE * 100)}%`}
                  </p>

                  <button
                    onClick={() => {
                      const ok = buyGpu(g.id);
                      if (ok) audioManager.play('buy-token');
                    }}
                    disabled={!canBuy}
                    className="mt-3 w-full px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                  >
                    {isQuantumSoldOut
                      ? (language === 'en' ? 'The one-of-a-kind prototype is sold' : '全世界仅有一台的原型机已售出')
                      : cash < price
                        ? (language === 'en' ? 'Not enough cash' : '余额不足')
                        : isAtCapacity
                          ? (language === 'en' ? 'Maximum three servers' : '最多持有三台服务器')
                          : (language === 'en' ? 'Buy' : '购买')}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        {/* 运营提示：与 GPU 商城副标题一致的灰色小字 */}
        <section>
          <p className="text-xs text-gray-500 leading-relaxed">
            {language === 'en' ? 'GPUs last 15 days and automatically produce the selected token each day (tokens last 7 days)' : 'GPU 寿命 15 天，期间每天自动产出所选 Token（保质期 7 天）'}
            <br />
            {language === 'en' ? 'Electricity is charged with weekly rent; insufficient cash puts both into the grace period' : '电费随每周房租一并扣除，余额不足会跟房租一起进入宽限期'}
          </p>
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
  language: 'zh' | 'en';
}

function GpuInstanceCard({
  gpu,
  currentPrices,
  inflationRatio,
  onConfigure,
  onSell,
  language,
}: GpuInstanceCardProps) {
  const def = localizeGpu(GPUS[gpu.gpuTierId], language);
  const remaining = gpu.lifespan - gpu.usedDays;
  const remainingRatio = remaining / gpu.lifespan;
  const barColor = lifeBarColor(remaining);
  const status = statusDotStyle(remaining);
  const recyclePrice = calcRecyclePrice(gpu);
  const currentDailyElectricity = Math.round(def.dailyElectricity * inflationRatio);

  const hasOutput = gpu.selectedTokenId >= 0;
  const dailyOutput = calcDailyOutput(gpu);
  const dailyValue = hasOutput
    ? calcDailyValue(gpu.gpuTierId, gpu.selectedTokenId, currentPrices)
    : 0;
  const tokenName = hasOutput ? localizeToken(TOKENS[gpu.selectedTokenId], language).name : null;

  // 量子计算原型机使用黑金色主题
  const isQuantum = gpu.gpuTierId === 3;
  const cardBorder = isQuantum ? 'border-amber-500/40' : 'border-emerald-500/20';
  const cardBg = isQuantum
    ? 'bg-gradient-to-br from-gray-900 via-gray-900/90 to-amber-950/30'
    : 'bg-gradient-to-br from-gray-800/80 via-gray-800/60 to-emerald-950/20';
  const cardHover = isQuantum
    ? 'hover:border-amber-400/60 hover:shadow-lg hover:shadow-amber-900/30'
    : 'hover:border-emerald-400/40 hover:shadow-lg hover:shadow-emerald-900/20';
  const glowColor = isQuantum ? 'bg-amber-400/8 group-hover:bg-amber-300/15' : 'bg-emerald-400/5 group-hover:bg-emerald-300/10';

  return (
    <div className={`group relative overflow-hidden rounded-xl border ${cardBorder} ${cardBg} p-3 md:p-3.5 flex flex-col transition-all ${cardHover}`}>
      {/* 微光晕 */}
      <div className={`pointer-events-none absolute -top-10 -right-10 h-24 w-24 rounded-full ${glowColor} blur-2xl transition-opacity`} />

      {/* 顶行：型号 + 剩余天数 */}
      <div className="relative flex items-center justify-between gap-2">
        <div className="flex items-center gap-1.5 min-w-0">
          <span className="text-base shrink-0">{def.icon}</span>
          <p className="font-semibold text-gray-100 truncate text-sm">{def.name}</p>
          {/* 运行状态脱冲点：按剩余天数变色 */}
          <span
            className="relative shrink-0 inline-flex h-2 w-2"
            title={language === 'en' ? ({ '正常运行': 'Running normally', '寿命告警': 'Lifespan warning', '即将报废': 'Scrapping soon' } as Record<string, string>)[status.label] : status.label}
            aria-label={language === 'en' ? ({ '正常运行': 'Running normally', '寿命告警': 'Lifespan warning', '即将报废': 'Scrapping soon' } as Record<string, string>)[status.label] : status.label}
          >
            <span
              className={`absolute inline-flex h-full w-full rounded-full ${status.color} opacity-60 animate-ping`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${status.color}`}
              style={{ boxShadow: status.shadow }}
            />
          </span>
        </div>
        <p className="font-mono text-[11px] text-gray-400 tabular shrink-0">
          {gpu.usedDays}/{gpu.lifespan}{language === 'en' ? 'd' : '天'}
        </p>
      </div>

      {/* 寿命进度条 */}
      <div className="relative mt-2 h-1.5 rounded-full bg-gray-900/80 overflow-hidden">
        <div
          className={`h-full ${barColor} transition-all`}
          style={{ width: `${Math.max(0, Math.min(100, remainingRatio * 100))}%` }}
        />
      </div>

      {/* 当前产出 */}
      <div className="relative mt-3 rounded-lg border border-cyan-500/20 bg-cyan-500/5 px-2.5 py-1.5">
        <p className="text-[10px] uppercase tracking-wider text-cyan-300/70">{language === 'en' ? 'Current output' : '当前产出'}</p>
        {hasOutput ? (
          <p className="mt-0.5 text-sm">
            <span className="font-semibold text-cyan-200">{tokenName}</span>
            <span className="ml-1.5 font-mono text-[11px] text-gray-400 tabular">
              {dailyOutput.toFixed(0)}M/{language === 'en' ? 'day' : '天'}
            </span>
          </p>
        ) : (
          <p className="mt-0.5 text-sm font-medium text-amber-300">{language === 'en' ? 'Choose an output token' : '请选择产出Token'}</p>
        )}
      </div>

      {/* 4 宫格数据 */}
      <div className="relative mt-2 grid grid-cols-2 gap-1.5">
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-[10px] text-gray-500">{language === 'en' ? 'Daily value' : '日产值'}</p>
          <p className="mt-0.5 font-mono font-semibold text-amber-400 tabular text-sm">
            {hasOutput ? formatMoney(Math.round(dailyValue), language) : '—'}
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-[10px] text-gray-500">{language === 'en' ? 'Daily electricity' : '日电费'}</p>
          <p className="mt-0.5 font-mono font-semibold text-red-300 tabular text-sm">
            {formatMoney(currentDailyElectricity, language)}
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-[10px] text-gray-500">{language === 'en' ? 'Lifetime output' : '累计产出'}</p>
          <p className="mt-0.5 font-mono font-semibold text-emerald-300 tabular text-sm">
            {formatMoney(Math.round(gpu.totalOutput), language)}
          </p>
        </div>
        <div className="rounded bg-gray-900/60 border border-gray-700/50 px-2 py-1.5">
          <p className="text-[10px] text-gray-500">{language === 'en' ? 'Recycle value' : '回收价'}</p>
          <p className="mt-0.5 font-mono font-semibold text-amber-300 tabular text-sm">
            {formatMoney(recyclePrice, language)}
          </p>
        </div>
      </div>

      {/* 操作区：切换产出 + 卖出 */}
      <div className="relative mt-3 space-y-2">
        <select
          value={gpu.selectedTokenId}
          onChange={(e) => onConfigure(Number(e.target.value))}
          className="w-full text-xs bg-gray-900/80 border border-gray-700/60 rounded-md px-2 py-1.5 text-gray-200 focus:outline-none focus:border-emerald-500/60"
        >
          {!hasOutput && (
            <option value={-1} disabled>
              {language === 'en' ? 'Choose output token…' : '请选择产出Token…'}
            </option>
          )}
          {OUTPUT_TOKEN_IDS.map((tid) => {
            const v = calcDailyValue(gpu.gpuTierId, tid, currentPrices);
            const out =
              (GPU_BASE_DAILY_OUTPUT[tid] || 0) * GPUS[gpu.gpuTierId].outputMultiplier;
            return (
              <option key={tid} value={tid}>
                {localizeToken(TOKENS[tid], language).name} · {out.toFixed(0)}M/{language === 'en' ? 'day' : '天'} · {formatMoney(Math.round(v), language)}
              </option>
            );
          })}
        </select>
        <button
          onClick={onSell}
          className="w-full px-3 py-1.5 rounded-md bg-gray-700/80 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors"
        >
          {language === 'en' ? 'Sell for recycle value' : '卖出回收'}
        </button>
      </div>
    </div>
  );
}
