// 接单对话框
import { useState } from 'react';
import { useGameStore, getTotalTokenCount } from '../../stores/gameStore';
import { TaskTemplate, LOW_SPIRIT_MESSAGES } from '../../data/tasks';
import { TOKENS } from '../../data/tokens';
import { Modal } from '../common/Modal';
import { randomChoice } from '../../utils/random';
import { formatToken } from '../../utils/format';
import { getCompletionRate } from '../../engine/taskEngine';
import { audioManager } from '../../utils/audioManager';
import { localizeTask, localizeToken, DIFFICULTY_TRANSLATIONS, translateDynamic } from '../../i18n';
import { formatMoney } from '../../utils/format';

interface Props {
  task: TaskTemplate;
  onClose: () => void;
}

const TIER_COLOR: Record<string, string> = {
  S: 'text-violet-400',
  A: 'text-amber-400',
  B: 'text-blue-400',
  C: 'text-emerald-400',
  D: 'text-gray-400',
};

const DIFF_LABEL: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '进阶',
  hell: '专家',
};

export function TaskDialog({ task, onClose }: Props) {
  const inventory = useGameStore((s) => s.inventory);
  const spirit = useGameStore((s) => s.spirit);
  const acceptTask = useGameStore((s) => s.acceptTask);
  const language = useGameStore((s) => s.language);
  const displayTask = localizeTask(task, language);

  const [choice, setChoice] = useState<number | 'manual' | null>(null);
  const lowSpirit = spirit < task.spiritCostIfManual;
  const [lowSpiritMsg] = useState(() => randomChoice(LOW_SPIRIT_MESSAGES));

  const handleConfirm = () => {
    if (choice === null) return;
    // 记录接单前的现金，用于判断任务是否成功（失败时 reward = 0）
    const cashBefore = useGameStore.getState().cash;
    acceptTask(task, choice);
    const cashAfter = useGameStore.getState().cash;
    if (cashAfter > cashBefore) {
      audioManager.play('task-success');
    } else {
      audioManager.play('task-fail');
    }
    onClose();
  };

  return (
    <Modal
      title={`${language === 'en' ? 'Accept job' : '接单'} · ${displayTask.name}`}
      subtitle={displayTask.description}
      onClose={onClose}
      width="max-w-2xl"
    >
      <div className="space-y-5">
        {/* 需求详情 */}
        <div className="grid grid-cols-4 gap-2 text-sm">
          <Info label={language === 'en' ? 'Difficulty' : '难度'} value={language === 'en' ? DIFFICULTY_TRANSLATIONS[task.difficulty] : DIFF_LABEL[task.difficulty]} accent="text-amber-400" />
          <Info label="Token" value={formatToken(task.tokenCost)} accent="text-violet-400" />
          <Info label={language === 'en' ? 'Reward' : '报酬'} value={formatMoney(task.reward, language)} accent="text-amber-400" />
          <Info
            label={language === 'en' ? 'Hand-written cost' : '手写消耗'}
            value={language === 'en' ? `-${task.spiritCostIfManual} SPIRIT` : `-${task.spiritCostIfManual} 精神`}
            accent="text-violet-400"
          />
        </div>

        {/* 完成方式 */}
        <div>
          <p className="text-sm text-gray-400">{language === 'en' ? 'How to complete' : '完成方式'}</p>

          {/* AI Token 列表 */}
          <p className="mt-3 text-xs text-emerald-400">
            {language === 'en' ? 'Use an AI token (draw against its tier-based completion rate)' : '使用 AI Token（按 token tier 抽卡判定完成率）'}
          </p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {TOKENS.map((rawToken) => {
              const t = localizeToken(rawToken, language);
              const owned = getTotalTokenCount(inventory, t.id);
              // 咸鱼Cursor账号特殊处理：按个数消耗
              const isXianyu = t.id === 6;
              const requiredCount = isXianyu
                ? Math.ceil(task.tokenCost / (t.equivalentTokens || 100))
                : task.tokenCost;
              const enough = owned >= requiredCount;
              const active = choice === t.id;
              return (
                <button
                  key={t.id}
                  disabled={!enough}
                  onClick={() => setChoice(t.id)}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2 text-left text-sm transition-colors ${
                    active
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300'
                      : enough
                      ? 'border-gray-700 bg-gray-900/40 text-gray-200 hover:border-gray-600 hover:bg-gray-800/60'
                      : 'cursor-not-allowed border-gray-800 bg-gray-900/20 text-gray-600'
                  }`}
                >
                  <span className="min-w-0 flex-1">
                    <span
                      className={`mr-2 font-mono text-xs font-semibold ${TIER_COLOR[t.tier]}`}
                    >
                      [{t.tier}]
                    </span>
                    <span className="truncate">{t.name}</span>
                  </span>
                  <span className="ml-2 shrink-0 text-right">
                    <span
                      className={`font-mono block text-xs font-semibold tabular ${
                        enough ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {isXianyu ? `${owned} ${language === 'en' ? `(need ${requiredCount})` : `个(需${requiredCount}个)`}` : formatToken(owned)}
                    </span>
                    <span className="block text-xs text-gray-500">
                      {(getCompletionRate(task, t) * 100).toFixed(0)}%
                    </span>
                  </span>
                </button>
              );
            })}
          </div>

          {/* 自己写代码 */}
          <p className="mt-4 text-xs text-violet-400">
            {language === 'en' ? 'Write it yourself (100% success, but exhausting)' : '自己写代码（100% 完成，但很累）'}
          </p>
          <button
            disabled={lowSpirit}
            onClick={() => setChoice('manual')}
            className={`mt-2 w-full rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
              choice === 'manual'
                ? 'border-violet-500 bg-violet-500/10 text-violet-300'
                : lowSpirit
                ? 'cursor-not-allowed border-gray-800 bg-gray-900/20 text-gray-600'
                : 'border-gray-700 bg-gray-900/40 text-gray-200 hover:border-gray-600 hover:bg-gray-800/60'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-medium">{language === 'en' ? 'Hand-written code · 100% success' : '手写代码 · 100% 完成'}</span>
              <span className="font-mono text-xs text-violet-400 tabular">
                -{task.spiritCostIfManual} SPIRIT
              </span>
            </div>
            {lowSpirit && (
              <p className="mt-1 text-xs italic text-red-400 leading-snug">
                "{language === 'en' ? translateDynamic(lowSpiritMsg, language) : lowSpiritMsg}"
              </p>
            )}
          </button>
        </div>

        {/* 按钮 */}
        <div className="flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2.5 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 font-medium transition-colors"
          >
            {language === 'en' ? 'Cancel' : '放弃'}
          </button>
          <button
            onClick={handleConfirm}
            disabled={choice === null}
            className="flex-[2] px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium transition-colors disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-emerald-600"
          >
            {language === 'en' ? 'Accept job' : '确认接单'}
          </button>
        </div>
      </div>
    </Modal>
  );
}

function Info({
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
      <p className={`mt-0.5 text-sm font-semibold ${accent}`}>{value}</p>
    </div>
  );
}
