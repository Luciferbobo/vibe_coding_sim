// 卖出对话框
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { Modal } from '../common/Modal';
import { formatMoney, formatToken } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';
import { TRADING_TAX_RATE, SELL_TAX_TIERS } from '../../data/constants';
import { localizeToken } from '../../i18n';
import { formatPrice } from '../../utils/format';

interface Props {
  tokenId: number;
  onClose: () => void;
}

export function SellDialog({ tokenId, onClose }: Props) {
  const inventory = useGameStore((s) => s.inventory);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const xianYuPrices = useGameStore((s) => s.xianYuPrices);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const day = useGameStore((s) => s.day);
  const sellTokenAction = useGameStore((s) => s.sellToken);
  const tradingTaxActivated = useGameStore((s) => s.tradingTaxActivated);
  const sellTaxTierReached = useGameStore((s) => s.sellTaxTierReached);
  const language = useGameStore((s) => s.language);

  const token = localizeToken(TOKENS[tokenId], language);
  const isXianyu = tokenId === 6;

  // 聚合该 tokenId 的所有批次
  const batches = inventory
    .filter((b) => b.tokenId === tokenId)
    .sort((a, b) => a.expiresDay - b.expiresDay);
  const max = batches.reduce((s, b) => s + b.count, 0);
  const totalValue = batches.reduce((s, b) => s + b.count * b.avgPrice, 0);
  const avgPrice = max > 0 ? totalValue / max : 0;
  // 最早过期批次的剩余天数（当天即最后一天 -> 0）
  const earliestExpiresIn = batches.length > 0 ? Math.max(0, batches[0].expiresDay - day - 1) : 0;
  const sellsExpiring = batches.length > 0 && earliestExpiresIn <= 1;

  const activePrices = currentSiteId === 1 ? xianYuPrices : currentPrices;
  const price = activePrices[tokenId];
  const step = isXianyu ? 1 : 0.1;

  const [count, setCount] = useState<number>(Math.min(isXianyu ? 1 : 0.5, max));

  const total = count * price;
  const profit = (price - avgPrice) * count;
  const profitPct = avgPrice > 0 ? ((price - avgPrice) / avgPrice) * 100 : 0;
  // 交易税：按当前阶梯档动态计算（不再是固定 25%）
  const sellTaxTier = sellTaxTierReached >= 0 ? SELL_TAX_TIERS[sellTaxTierReached] : null;
  const sellTaxRate = sellTaxTier ? 1 - sellTaxTier.multiplier : 0;
  const sellTaxPct = sellTaxTier ? sellTaxTier.taxPct : Math.round(TRADING_TAX_RATE * 100);
  const taxAmount = tradingTaxActivated ? total * sellTaxRate : 0;
  const netIncome = total - taxAmount;
  const netProfit = profit - taxAmount;
  // 信誉计算：基础倒卖 -3；每 1B (1000M) 额外 -5；临期剩 ≤1 天则额外 -3
  const bulkPenalty = Math.floor(count / 1000) * 5;
  const isBulk = bulkPenalty > 0;
  const baseRepLoss = 3;
  const expiringRepLoss = sellsExpiring ? 3 : 0;
  const totalRepLoss = baseRepLoss + bulkPenalty + expiringRepLoss;
  const canSell = count > 0 && count <= max;

  const setQuick = (ratio: number) => {
    // 全部卖出：直接用 max，避免 floor 操作丢失浮点尾巴（导致剩 0.1M=100k 卖不出去）
    if (ratio >= 1) {
      setCount(max);
      return;
    }
    const v = isXianyu
      ? Math.floor(max * ratio)
      : Math.floor(max * ratio * 10) / 10;
    setCount(Math.max(0, v));
  };

  const handleConfirm = () => {
    if (!canSell) return;
    const ok = sellTokenAction(tokenId, count);
    if (ok) {
      audioManager.play('sell-token');
    }
    // 被拦截时（例如当日买入品种已卖过一次）不播音效；pendingMessages 会在全局提示出现
    onClose();
  };

  return (
    <Modal
      title={`${language === 'en' ? 'Sell' : '卖出'} · ${token.name}`}
      subtitle={language === 'en' ? 'Reselling tokens costs reputation; bulk dumping hurts even more.' : '倒卖 Token 会扣信誉，大量抛售扣得更狠'}
      onClose={onClose}
    >
      <div className="space-y-5">
        {/* 价格对比 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <InfoBox
            label={language === 'en' ? 'Average buy price' : '买入均价'}
            value={formatPrice(avgPrice, language)}
            accent="text-gray-200"
          />
          <InfoBox
            label={language === 'en' ? 'Current market price' : '当前市价'}
            value={formatPrice(price, language)}
            accent="text-amber-400"
          />
          <InfoBox
            label={language === 'en' ? 'Unrealized P/L' : '浮动盈亏'}
            value={`${profitPct >= 0 ? '+' : ''}${profitPct.toFixed(1)}%`}
            accent={profitPct >= 0 ? 'text-emerald-400' : 'text-red-400'}
          />
        </div>

        {/* 数量输入 */}
        <div>
          <div className="flex items-center justify-between text-sm">
            <label className="text-gray-400">
              {language === 'en' ? `Quantity (${isXianyu ? 'accounts' : 'M tokens'})` : `数量 (${isXianyu ? '个数' : 'M tokens'})`}
            </label>
            <span className="text-xs text-gray-500">
              {language === 'en' ? 'Holding ' : '持有 '}{isXianyu ? `${max} ${language === 'en' ? 'accounts' : '个'}` : formatToken(max)}
            </span>
          </div>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-stretch">
            <input
              type="number"
              min={0}
              max={max}
              step={step}
              value={isXianyu ? count : Math.round(count * 10) / 10}
              onChange={(e) => {
                const v = Math.max(0, Math.min(max, parseFloat(e.target.value) || 0));
                setCount(v);
              }}
              className="font-mono w-full md:flex-1 rounded-lg border border-gray-700 bg-gray-900 px-3 py-2 text-base font-semibold text-gray-100 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/40 transition-colors tabular"
            />
            <div className="grid grid-cols-3 gap-1 md:flex md:gap-1">
              {[0.25, 0.5, 1].map((r) => (
                <button
                  key={r}
                  onClick={() => setQuick(r)}
                  className="px-3 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-xs font-medium transition-colors"
                >
                  {r === 1 ? (language === 'en' ? 'All' : '全') : `${r * 100}%`}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* 收入预览 */}
        <div className="rounded-lg bg-gray-900/60 border border-gray-700/60 p-3 md:p-4 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-400">{language === 'en' ? 'Estimated income' : '预计收入'}</span>
            <span className="font-mono text-2xl font-bold text-amber-400 tabular">
              +{formatMoney(netIncome, language)}
            </span>
          </div>
          {tradingTaxActivated && (
            <div className="flex items-baseline justify-between text-xs">
              <span className="text-red-400">{language === 'en' ? `Trading tax (${sellTaxPct}%)` : `交易税 (${sellTaxPct}%)`}</span>
              <span className="font-mono tabular text-red-400">
                -{formatMoney(taxAmount, language)} <span className="text-gray-500">{language === 'en' ? `(gross ${formatMoney(total, language)})` : `(毛收入 ${formatMoney(total, language)})`}</span>
              </span>
            </div>
          )}
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-gray-500">{language === 'en' ? 'P/L' : '本次盈亏'}</span>
            <span
              className={`font-mono tabular ${
                netProfit >= 0 ? 'text-emerald-400' : 'text-red-400'
              }`}
            >
              {netProfit >= 0 ? '+' : ''}
              {formatMoney(netProfit, language)}
            </span>
          </div>
        </div>

        {/* 信誉警告 */}
        <div className="rounded-lg bg-red-500/5 border border-red-500/30 p-3 text-sm leading-relaxed">
          <p className="font-medium text-red-400">{language === 'en' ? 'Reputation impact' : '信誉影响'}</p>
          <ul className="mt-1.5 space-y-0.5 text-xs text-gray-300">
            <li className="flex justify-between">
              <span>{language === 'en' ? 'Base reselling' : '基础倒卖'}</span>
              <span className="font-mono text-red-400 font-semibold tabular">-{baseRepLoss}</span>
            </li>
            {isBulk && (
              <li className="flex justify-between">
                <span>{language === 'en' ? 'Bulk sale (−5 per extra 1B)' : '大量抛售 (超 1B 每 1B 额外 -5)'}</span>
                <span className="font-mono text-red-400 font-semibold tabular">-{bulkPenalty}</span>
              </li>
            )}
            {sellsExpiring && (
              <li className="flex justify-between">
                <span>{language === 'en' ? 'Expiring tokens (≤1 day left)' : '临期 Token (最早批次剩 ≤1 天)'}</span>
                <span className="font-mono text-red-400 font-semibold tabular">-{expiringRepLoss}</span>
              </li>
            )}
            <li className="flex justify-between border-t border-red-500/20 pt-1 mt-1">
              <span className="text-red-300 font-medium">{language === 'en' ? 'Total' : '合计'}</span>
              <span className="font-mono text-red-400 font-bold tabular">-{totalRepLoss}</span>
            </li>
          </ul>
          {batches.length > 0 && (
            <p className="mt-2 text-[11px] text-amber-300/80">
              {language === 'en' ? `FIFO sells the earliest-expiring batch first (${earliestExpiresIn} day${earliestExpiresIn === 1 ? '' : 's'} left).` : `FIFO 优先出售最早过期的批次（最早过期仅剩 ${earliestExpiresIn} 天）`}
            </p>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
          >
            {language === 'en' ? 'Cancel' : '取消'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canSell}
            className="flex-[2] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            {language === 'en' ? 'Confirm sale' : '确认卖出'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function InfoBox({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-gray-900/60 border border-gray-700/60 px-3 py-2">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 font-mono font-semibold tabular ${accent}`}>{value}</p>
    </div>
  );
}
