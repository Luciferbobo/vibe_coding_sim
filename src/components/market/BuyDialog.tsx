// 购买对话框
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TOKENS } from '../../data/tokens';
import { Modal } from '../common/Modal';
import { formatMoney, formatToken } from '../../utils/format';
import { audioManager } from '../../utils/audioManager';
import { localizeToken } from '../../i18n';
import { formatPrice } from '../../utils/format';

interface Props {
  tokenId: number;
  onClose: () => void;
}

export function BuyDialog({ tokenId, onClose }: Props) {
  const cash = useGameStore((s) => s.cash);
  const currentPrices = useGameStore((s) => s.currentPrices);
  const xianYuPrices = useGameStore((s) => s.xianYuPrices);
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const buyToken = useGameStore((s) => s.buyToken);
  const language = useGameStore((s) => s.language);

  const token = localizeToken(TOKENS[tokenId], language);
  const isXianyu = tokenId === 6;
  const priceUnit = isXianyu ? (language === 'en' ? '/account' : '/个') : '/M';
  const activePrices = currentSiteId === 1 ? xianYuPrices : currentPrices;
  const price = activePrices[tokenId];
  const step = isXianyu ? 1 : 0.1;
  const max = isXianyu
    ? Math.floor(cash / price)
    : Math.floor((cash / price) * 10) / 10;
  const [count, setCount] = useState<number>(Math.min(isXianyu ? 1 : 0.5, max));

  const total = count * price;
  const canBuy = count > 0 && total <= cash;

  const setQuick = (ratio: number) => {
    const v = isXianyu
      ? Math.floor(max * ratio)
      : Math.floor(max * ratio * 10) / 10;
    setCount(Math.max(0, v));
  };

  const handleConfirm = () => {
    if (!canBuy) return;
    const ok = buyToken(tokenId, count);
    if (ok) {
      audioManager.play('buy-token');
    }
    // 被拦截时（例如信誉为 0）不播音效；pendingMessages 会在全局提示出现
    onClose();
  };

  return (
    <Modal title={`${language === 'en' ? 'Buy' : '买入'} · ${token.name}`} subtitle={token.description} onClose={onClose}>
      <div className="space-y-5">
        {/* 元数据 */}
        <div className="grid grid-cols-3 gap-2 text-sm">
          <InfoBox label={language === 'en' ? 'Tier' : '级别'} value={token.tier} accent="text-violet-400" />
          <InfoBox
            label={language === 'en' ? 'Price' : '价格'}
            value={`${formatPrice(price, language)}${priceUnit}`}
            accent="text-amber-400"
          />
          <InfoBox
            label={language === 'en' ? 'Max' : '最多'}
            value={isXianyu ? `${max} ${language === 'en' ? 'accounts' : '个'}` : formatToken(max)}
            accent="text-emerald-400"
          />
        </div>

        {/* 数量输入 */}
        <div>
          <label className="text-sm text-gray-400">
            {language === 'en' ? `Quantity (${isXianyu ? 'accounts' : 'M tokens'})` : `数量 (${isXianyu ? '个数' : 'M tokens'})`}
          </label>
          <div className="mt-2 flex flex-col gap-2 md:flex-row md:items-stretch">
            <input
              type="number"
              min={0}
              max={max}
              step={step}
              value={count}
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

        {/* 合计 */}
        <div className="rounded-lg bg-gray-900/60 border border-gray-700/60 p-3 md:p-4 space-y-1.5">
          <div className="flex items-baseline justify-between">
            <span className="text-sm text-gray-400">{language === 'en' ? 'Total cost' : '合计支出'}</span>
            <span className="font-mono text-2xl font-bold text-amber-400 tabular">
              {formatMoney(total, language)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-gray-500">{language === 'en' ? 'Balance' : '余额'}</span>
            <span className="font-mono text-gray-300 tabular">
              {formatMoney(cash, language)}
            </span>
          </div>
          <div className="flex items-baseline justify-between text-xs">
            <span className="text-gray-500">{language === 'en' ? 'Balance after trade' : '交易后余额'}</span>
            <span
              className={`font-mono tabular ${
                cash - total < 0 ? 'text-red-400' : 'text-gray-300'
              }`}
            >
              {formatMoney(cash - total, language)}
            </span>
          </div>
        </div>

        {/* 保质期警告 */}
        <div className="rounded-lg bg-amber-500/5 border border-amber-500/30 p-3 text-xs leading-relaxed">
          <p className="font-medium text-amber-400">{language === 'en' ? '⚠️ Shelf-life reminder' : '⚠️ 保质期提醒'}</p>
          <p className="mt-1 text-gray-300">
            {language === 'en' ? <>Purchased tokens last <span className="font-semibold text-amber-300">7 days</span> and are cleared when they expire. Buy only what you need.</> : <>购入的 Token 有效期为 <span className="font-semibold text-amber-300">7 天</span>，过期会被自动清空，请按需购买。</>}
          </p>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
          >
            {language === 'en' ? 'Cancel' : '取消'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={!canBuy}
            className="flex-[2] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            {language === 'en' ? 'Confirm purchase' : '确认买入'}
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
