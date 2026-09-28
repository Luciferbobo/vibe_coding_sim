// 事件通知 - 简洁队列式弹窗
import { useGameStore } from '../../stores/gameStore';
import { translateDynamic } from '../../i18n';

const NEGATIVE_KEYWORDS = [
  '损失', '扣', '崩', '砸', '坏', '盗', '差', '亏', '没了', '蓝屏',
  '加班', '焦虑', '失业', '裁', '破产', '换锁', '交不', '风评',
  '过期', '强制', '归零', '危险', '抛售', '挂断', '打骨折', '扣信誉',
  '-', '⚠', '💸', '💀', '🔑', '⛔',
];
const POSITIVE_KEYWORDS = [
  '恢复', '获得', '送你', '收到', '成功', '完成', '赞', '热榜',
  '中奖', '感谢', '+', '☕', '💰', '🎉', '✨', '✍', '📈',
];

function classify(msg: string): 'positive' | 'negative' | 'neutral' {
  const neg = NEGATIVE_KEYWORDS.some((k) => msg.includes(k));
  const pos = POSITIVE_KEYWORDS.some((k) => msg.includes(k));
  if (neg && !pos) return 'negative';
  if (pos && !neg) return 'positive';
  return 'neutral';
}

const TONE = {
  positive: {
    accent: 'bg-emerald-500',
    text: 'text-emerald-300',
    label: '好消息',
  },
  negative: {
    accent: 'bg-red-500',
    text: 'text-red-300',
    label: '坏消息',
  },
  neutral: {
    accent: 'bg-blue-500',
    text: 'text-gray-100',
    label: '事件',
  },
};

export function EventNotification() {
  const pendingMessages = useGameStore((s) => s.pendingMessages);
  const dismissMessage = useGameStore((s) => s.dismissMessage);
  const language = useGameStore((s) => s.language);
  
  if (pendingMessages.length === 0) return null;

  const msg = pendingMessages[0];
  const displayMsg = translateDynamic(msg, language);
  const tone = classify(msg);
  const style = TONE[tone];
  const toneLabel = language === 'en'
    ? { positive: 'Good news', negative: 'Bad news', neutral: 'Event' }[tone]
    : style.label;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm animate-fade-in"
      onClick={dismissMessage}
    >
      <div
        className="relative w-full max-w-lg rounded-xl bg-gray-800 border border-gray-700 shadow-2xl overflow-hidden animate-fade-in-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 顶部色条 */}
        <div className={`h-1 w-full ${style.accent}`} />

        {/* 头部 */}
        <div className="flex items-center justify-between px-4 md:px-6 pt-4 md:pt-5 pb-3">
          <p className={`text-xs font-medium ${style.text}`}>{toneLabel}</p>
          {pendingMessages.length > 1 && (
            <span className="text-xs text-gray-500">
              1 / {pendingMessages.length}
            </span>
          )}
        </div>

        {/* 正文 */}
        <div className="px-4 md:px-6 pb-5 md:pb-6">
          <p
            className={`whitespace-pre-line text-sm md:text-base leading-relaxed ${style.text}`}
          >
            {displayMsg}
          </p>
        </div>

        {/* 队列提示 + 按钮 */}
        <div className="border-t border-gray-700/60 px-4 md:px-6 py-3 flex items-center justify-between gap-3">
          {pendingMessages.length > 1 && (
            <span className="text-xs text-gray-500">
              {language === 'en' ? `${pendingMessages.length - 1} more events waiting` : `还有 ${pendingMessages.length - 1} 条事件等待`}
            </span>
          )}
          <button
            onClick={dismissMessage}
            className="ml-auto px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
          >
            {language === 'en' ? 'Got it' : '知道了'}
          </button>
        </div>
      </div>
    </div>
  );
}
