// 成就殿堂 - 展示玩家获得的成就徽章
import { useGameStore } from '../../stores/gameStore';
import { ACHIEVEMENTS } from '../../data/achievements';

export function Achievements() {
  const unlockedAchievements = useGameStore((s) => s.unlockedAchievements);
  const unlockedCount = unlockedAchievements.length;
  const totalCount = ACHIEVEMENTS.length;

  return (
    <div className="flex h-full flex-col overflow-hidden px-6 py-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-gray-100">
          🏅 成就殿堂
        </h2>
        <p className="mt-1 text-sm text-gray-400">
          每一枚徽章，都是你在AI时代挣扎求生的勋章。
        </p>
      </div>

      <div className="flex-1 overflow-y-auto">
        <div className="grid grid-cols-2 gap-4">
          {ACHIEVEMENTS.map((achievement) => {
            const isUnlocked = unlockedAchievements.includes(achievement.id);
            return (
              <div
                key={achievement.id}
                className={`group relative rounded-xl border p-4 transition-all duration-300 ${
                  isUnlocked
                    ? 'bg-gradient-to-br from-amber-500/10 to-yellow-500/5 border-amber-500/40 shadow-lg shadow-amber-900/10 hover:shadow-amber-800/20 hover:border-amber-400/60'
                    : 'bg-gray-800/40 border-gray-700/40 opacity-60 hover:opacity-80'
                }`}
                title={isUnlocked ? `${achievement.name} — ${achievement.description}` : `${achievement.name} — 获得方式：???`}
              >
                {/* 解锁光效 */}
                {isUnlocked && (
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/5 to-transparent pointer-events-none" />
                )}

                <div className="relative flex items-start gap-3">
                  {/* Icon */}
                  <span
                    className={`text-3xl leading-none shrink-0 ${
                      isUnlocked ? '' : 'grayscale opacity-40'
                    }`}
                  >
                    {achievement.icon}
                  </span>

                  {/* 文字 */}
                  <div className="min-w-0 flex-1">
                    <p
                      className={`text-sm font-semibold truncate ${
                        isUnlocked ? 'text-amber-200' : 'text-gray-500'
                      }`}
                    >
                      {achievement.name}
                    </p>
                    <p
                      className={`mt-1 text-xs leading-snug ${
                        isUnlocked ? 'text-gray-400' : 'text-gray-600'
                      }`}
                    >
                      {isUnlocked ? achievement.description : '获得方式：???'}
                    </p>
                  </div>

                  {/* 解锁标识 */}
                  {isUnlocked && (
                    <span className="shrink-0 text-xs font-medium text-amber-400 bg-amber-500/15 px-1.5 py-0.5 rounded">
                      ✓
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 底部统计 */}
      <div className="mt-4 pt-4 border-t border-gray-800 text-center">
        <p className="text-sm text-gray-400">
          已解锁{' '}
          <span className={`font-bold ${unlockedCount > 0 ? 'text-amber-400' : 'text-gray-500'}`}>
            {unlockedCount}
          </span>
          <span className="text-gray-600">/{totalCount}</span>
        </p>
        {unlockedCount === 0 && (
          <p className="mt-1 text-xs text-gray-600">
            还没有任何成就...开始你的冒险吧！
          </p>
        )}
        {unlockedCount === totalCount && (
          <p className="mt-1 text-xs text-amber-400/80">
            🎊 全部成就已解锁！你是真正的传奇！
          </p>
        )}
      </div>
    </div>
  );
}
