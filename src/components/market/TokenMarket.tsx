// Token 交易市场 - 清爽表格
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { BuyDialog } from './BuyDialog';
import { SellDialog } from './SellDialog';
import { formatToken } from '../../utils/format';
import { SELL_TAX_TIERS } from '../../data/constants';

const TIER_COLOR: Record<string, string> = {
  S: 'bg-violet-500/15 text-violet-300',
  A: 'bg-amber-500/15 text-amber-300',
  B: 'bg-blue-500/15 text-blue-300',
  C: 'bg-emerald-500/15 text-emerald-300',
  D: 'bg-gray-700/60 text-gray-400',
};

export function TokenMarket() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const xianYuPrices = useGameStore((s) => s.xianYuPrices);
  const githubOutOfStock = useGameStore((s) => s.githubOutOfStock);
  const xianYuOutOfStock = useGameStore((s) => s.xianYuOutOfStock);
  const inventory = useGameStore((s) => s.inventory);
  const previousPrices = useGameStore((s) => s.previousPrices);
  const day = useGameStore((s) => s.day);
  const tradingTaxActivated = useGameStore((s) => s.tradingTaxActivated);
  const sellTaxTierReached = useGameStore((s) => s.sellTaxTierReached);
  const sellTaxPct = sellTaxTierReached >= 0 ? SELL_TAX_TIERS[sellTaxTierReached].taxPct : 25;

  const [buyToken, setBuyToken] = useState<number | null>(null);
  const [sellToken, setSellToken] = useState<number | null>(null);

  const isXianyu = currentSiteId === 1;
  const title = isXianyu
    ? '闲鱼二手区 · 野生 Token 集市'
    : 'API 商城 · 官方源';
  const subtitle = isXianyu
    ? '二手交易，价格随缘浮动，有惊喜也有坑'
    : '官方供应，价格每天只涨不跌';

  // 当前市场使用的价格
  const activePrices = isXianyu ? xianYuPrices : currentPrices;
  // 当前市场的缺货列表
  const outOfStock = isXianyu ? xianYuOutOfStock : githubOutOfStock;

  // 过滤显示的Token列表
  // GitHub商城永远不显示id=6（咸鱼Cursor账号）
  const visibleTokens = isXianyu ? TOKENS : TOKENS.filter(t => t.id !== 6);

  const avgInflation =
    visibleTokens.reduce((sum, t) => {
      const cur = activePrices[t.id];
      const prev = previousPrices[t.id] || t.basePrice;
      return sum + (prev > 0 ? (cur - prev) / prev : 0);
    }, 0) / visibleTokens.length;

  return (
    <div className="flex h-full flex-col">
      {/* 标题 */}
      <div className="border-b border-gray-800 px-6 py-5">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
            <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-500">今日通胀率</p>
            <p
              className={`mt-0.5 font-mono text-lg font-semibold tabular ${
                avgInflation >= 0 ? 'text-red-400' : 'text-emerald-400'
              }`}
            >
              {avgInflation >= 0 ? '↑' : '↓'} {(avgInflation * 100).toFixed(1)}%
            </p>
          </div>
        </div>
      </div>

      {/* 列表区 */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* 表格视图 */}
        <div className="rounded-xl bg-gray-800/40 border border-gray-700/60 overflow-hidden">
          <div className="grid grid-cols-[40px_minmax(0,2fr)_50px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_180px] gap-x-3 px-4 py-2.5 border-b border-gray-700/60 text-xs font-medium text-gray-500 uppercase tracking-wider">
            <span>#</span>
            <span>Token</span>
            <span className="text-center">级</span>
            <span className="text-right">价格</span>
            <span className="text-right">涨跌</span>
            <span className="text-right">持有</span>
            <span className="text-center">操作</span>
          </div>

          {visibleTokens.map((token) => {
            const isXy = token.id === 6;
            const realPrice = activePrices[token.id];
            const delta =
              ((activePrices[token.id] - token.basePrice) / token.basePrice) * 100;
            const tokenBatches = inventory.filter((b) => b.tokenId === token.id);
            const totalCount = tokenBatches.reduce((s, b) => s + b.count, 0);
            const hasHolding = totalCount > 0;
            // 剩余天数：如果当天即最后一天，剩 0 天
            const minDaysLeft = hasHolding
              ? Math.max(0, Math.min(...tokenBatches.map((b) => b.expiresDay - day - 1)))
              : Infinity;
            const urgencyDot = !hasHolding
              ? null
              : minDaysLeft <= 1
              ? { cls: 'bg-red-500 animate-pulse', label: `${minDaysLeft}天后过期` }
              : minDaysLeft <= 3
              ? { cls: 'bg-amber-400', label: `${minDaysLeft}天后过期` }
              : { cls: 'bg-emerald-500', label: `还有 ${minDaysLeft} 天` };
            const up = delta >= 0;
            const isOutOfStock = outOfStock.includes(token.id);

            return (
              <div
                key={token.id}
                className={`relative grid grid-cols-[40px_minmax(0,2fr)_50px_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_180px] items-center gap-x-3 px-4 py-3 border-b border-gray-700/40 last:border-0 text-sm hover:bg-gray-800/40 transition-colors ${isOutOfStock ? 'opacity-60' : ''}`}
              >
                {/* 缺货标记 */}
                {isOutOfStock && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10">
                    <span
                      className="text-red-500 font-bold text-lg border-2 border-red-500 px-2 py-0.5 rounded"
                      style={{ transform: 'rotate(-15deg)' }}
                    >
                      缺货
                    </span>
                  </div>
                )}

                <span className="font-mono text-gray-500 tabular">
                  {String(token.id + 1).padStart(2, '0')}
                </span>
                <div className="min-w-0">
                  <p className="font-medium text-gray-100 truncate">
                    {token.name}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {token.description}
                  </p>
                </div>
                <span
                  className={`mx-auto inline-flex w-7 justify-center rounded text-xs font-semibold py-0.5 ${TIER_COLOR[token.tier]}`}
                >
                  {token.tier}
                </span>
                <span className={`font-mono text-right font-semibold tabular ${isOutOfStock ? 'text-gray-500' : 'text-amber-400'}`}>
                  ¥{realPrice.toFixed(2)}
                  <span className="ml-0.5 text-xs text-gray-500">
                    {isXy ? '/个' : '/M'}
                  </span>
                </span>
                <span
                  className={`font-mono text-right font-semibold tabular ${
                    isOutOfStock ? 'text-gray-500' : up ? 'text-red-400' : 'text-emerald-400'
                  }`}
                >
                  {up ? '+' : ''}
                  {delta.toFixed(1)}%
                </span>
                <span className="font-mono text-right text-gray-300 tabular flex items-center justify-end gap-1.5">
                  {hasHolding ? (
                    <>
                      {urgencyDot && (
                        <span
                          title={urgencyDot.label}
                          className={`inline-block h-1.5 w-1.5 rounded-full ${urgencyDot.cls}`}
                        />
                      )}
                      <span>
                        {isXy
                          ? `${totalCount} 个 (劣质${totalCount * 100}M)`
                          : formatToken(totalCount)}
                      </span>
                    </>
                  ) : (
                    '—'
                  )}
                </span>
                <div className="flex justify-center gap-2">
                  {/* 买入按钮：缺货时禁用 */}
                  <button
                    onClick={() => setBuyToken(token.id)}
                    disabled={isOutOfStock}
                    className="px-3 py-1 rounded-md bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
                    title={isOutOfStock ? '市场缺货，无法购买' : undefined}
                  >
                    买入
                  </button>
                  {/* 卖出按钮：缺货不影响卖出（市场缺货反而有人愿意接手） */}
                  {isXy ? (
                    <button
                      disabled
                      className="px-3 py-1 rounded-md bg-gray-700 text-gray-500 text-xs font-medium cursor-not-allowed opacity-30"
                      title="咸鱼Cursor账号不支持转卖"
                    >
                      卖出
                    </button>
                  ) : (
                    <button
                      onClick={() => setSellToken(token.id)}
                      disabled={!hasHolding}
                      className="px-3 py-1 rounded-md bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-gray-700"
                    >
                      卖出
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <p className="mt-4 text-xs text-gray-500">
          Token 保质期 7 天，购入后请尽快使用
        </p>
        {tradingTaxActivated && (
          <p className="mt-1 text-xs text-red-400 font-semibold">
            现在Token卖出将征收 {sellTaxPct}% 交易税
          </p>
        )}
        {isXianyu && (
          <p className="mt-1 text-xs text-gray-500">
            
          </p>
        )}
      </div>

      {buyToken !== null && (
        <BuyDialog tokenId={buyToken} onClose={() => setBuyToken(null)} />
      )}
      {sellToken !== null && (
        <SellDialog tokenId={sellToken} onClose={() => setSellToken(null)} />
      )}
    </div>
  );
}
