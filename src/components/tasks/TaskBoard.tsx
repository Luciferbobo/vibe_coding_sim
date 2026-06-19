// 需求列表
import { useState } from 'react';
import { useGameStore } from '../../stores/gameStore';
import { TaskTemplate, LOW_REP_MESSAGES, LOW_REP_NEWBIE_MESSAGES } from '../../data/tasks';
import { LOW_REPUTATION_THRESHOLD } from '../../data/constants';
import { TaskDialog } from './TaskDialog';
import { randomChoice } from '../../utils/random';
import { formatToken } from '../../utils/format';

const DIFF_LABEL: Record<string, string> = {
  easy: '简单',
  medium: '中等',
  hard: '进阶',
  hell: '专家',
};

const DIFF_COLOR: Record<string, string> = {
  easy: 'bg-emerald-500/15 text-emerald-300',
  medium: 'bg-amber-500/15 text-amber-300',
  hard: 'bg-orange-500/15 text-orange-300',
  hell: 'bg-red-500/15 text-red-300',
};

export function TaskBoard() {
  const currentSiteId = useGameStore((s) => s.currentSiteId);
  const availableTasksMap = useGameStore((s) => s.availableTasks);
  const reputation = useGameStore((s) => s.reputation);
  const tasksCompletedToday = useGameStore((s) => s.tasksCompletedToday);
  const maxTasksPerDay = useGameStore((s) => s.maxTasksPerDay);
  const hasEverSoldToken = useGameStore((s) => s.hasEverSoldToken);

  const [selected, setSelected] = useState<TaskTemplate | null>(null);
  const [rejected, setRejected] = useState<string | null>(null);

  const isBoss = currentSiteId === 3;
  // 根据当前平台选取对应的需求列表
  const availableTasks = isBoss ? availableTasksMap.boss : availableTasksMap.niuke;
  const title = isBoss ? '高端猎头' : '外包广场';
  const subtitle = isBoss
    ? 'Lv99高端需求，信誉不够进不了门'
    : '什么都接，重在赚个恰饭钱';

  const handleAccept = (task: TaskTemplate) => {
    // 每日任务数限制
    if (tasksCompletedToday >= maxTasksPerDay) {
      setRejected('今天已经做了3个项目了，该休息了。进入下一天刷新需求吧。');
      return;
    }
    if (
      reputation < task.reputationRequired ||
      reputation < LOW_REPUTATION_THRESHOLD
    ) {
      const pool = hasEverSoldToken ? LOW_REP_MESSAGES : LOW_REP_NEWBIE_MESSAGES;
      setRejected(randomChoice(pool));
      return;
    }
    setSelected(task);
  };

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-6 py-5">
        <h2 className="text-xl font-semibold text-gray-100">{title}</h2>
        <p className="mt-1 text-sm text-gray-400">{subtitle}</p>
        <p className="mt-2 text-xs text-gray-500">
          当前信誉{' '}
          <span
            className={`font-semibold ${
              reputation < 20 ? 'text-red-400' : 'text-blue-400'
            }`}
          >
            {reputation}
          </span>{' '}
          · 可见需求{' '}
          <span className="text-emerald-400 font-semibold">
            {availableTasks.length}
          </span>
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-4">
        {availableTasks.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="text-5xl">🪹</p>
              <p className="mt-3 text-sm text-gray-400">
                今天没有适合你的需求
              </p>
              <p className="mt-1 text-xs text-gray-500">
                明天再来看看吧（切换日期会刷新需求池）
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-3">
            {availableTasks.map((task) => (
              <div
                key={task.id}
                className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h3 className="text-base font-semibold text-gray-100">
                      {task.name}
                    </h3>
                  </div>
                  <span
                    className={`shrink-0 px-2 py-0.5 rounded-md text-xs font-medium ${DIFF_COLOR[task.difficulty]}`}
                  >
                    {DIFF_LABEL[task.difficulty]}
                  </span>
                </div>

                <div className="mt-3 grid grid-cols-3 gap-2">
                  <Cell
                    label="Token"
                    value={formatToken(task.tokenCost)}
                    accent="text-violet-400"
                  />
                  <Cell
                    label="报酬"
                    value={`¥${task.reward}`}
                    accent="text-amber-400"
                  />
                  <Cell
                    label="信誉要求"
                    value={`≥ ${task.reputationRequired}`}
                    accent="text-blue-400"
                  />
                </div>

                <button
                  onClick={() => handleAccept(task)}
                  className="mt-3 w-full px-4 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium transition-colors"
                >
                  接单
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {selected && (
        <TaskDialog task={selected} onClose={() => setSelected(null)} />
      )}

      {rejected && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-fade-in"
          onClick={() => setRejected(null)}
        >
          <div className="max-w-md rounded-xl bg-gray-800 border border-red-500/40 shadow-2xl p-6 animate-fade-in-up">
            <p className="text-xs font-medium text-red-400 uppercase tracking-wider">
              访问被拒绝
            </p>
            <p className="mt-3 text-base text-gray-200 leading-relaxed">
              {rejected}
            </p>
            <button
              onClick={() => setRejected(null)}
              className="mt-5 px-5 py-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-gray-200 text-sm font-medium transition-colors"
            >
              知道了
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function Cell({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg bg-gray-900/60 border border-gray-700/50 px-2.5 py-1.5">
      <p className="text-xs text-gray-500">{label}</p>
      <p className={`mt-0.5 font-mono text-sm font-semibold tabular ${accent}`}>
        {value}
      </p>
    </div>
  );
}
