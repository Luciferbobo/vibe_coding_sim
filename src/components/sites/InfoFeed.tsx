// Twitter - 资讯流
// 内容来自 gameStore.twitterFeed：
// - 同一天内反复进入页面，feed 内容保持稳定
// - 每进入新的一天，advanceDay 会追加 2-5 条新推文
// - 当天发布的推文显示生成时随机选定的相对时间标签
// - 之前发布的推文按"实际过去天数"显示 X 天前
import { useGameStore } from '../../stores/gameStore';
import { TWITTER_TAG_COLOR } from '../../data/twitterPosts';
import type { TwitterFeedItem } from '../../stores/gameStore';

function formatPostTime(item: TwitterFeedItem, currentDay: number): string {
  if (item.postedDay >= currentDay) return item.todayTimeLabel;
  const diff = currentDay - item.postedDay;
  return `${diff} 天前`;
}

export function InfoFeed() {
  const day = useGameStore((s) => s.day);
  const feed = useGameStore((s) => s.twitterFeed);
  const likeTwitterPost = useGameStore((s) => s.likeTwitterPost);

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-gray-800 px-4 py-3 md:px-6 md:py-5">
        <h2 className="text-lg md:text-xl font-semibold text-gray-100">
          📱 Twitter · 行情广场
        </h2>
        <p className="mt-1 text-xs md:text-sm text-gray-400">
          下拉刷新 · 看别人都和你一样焦虑，奇怪地有点欣慰
        </p>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 md:px-6 md:py-4">
        {feed.length === 0 ? (
          <p className="mt-10 text-center text-sm text-gray-500">
            暂无新动态 · 世界安静得有点反常
          </p>
        ) : (
          <div className="space-y-3">
            {feed.map((p) => (
              <article
                key={p.id}
                className="rounded-xl bg-gray-800/60 border border-gray-700/60 p-3 md:p-4 hover:border-gray-600 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gray-700 text-xl">
                    {p.avatar}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-gray-100 text-sm">
                        {p.user}
                      </span>
                      <span
                        className={`rounded px-1.5 py-0.5 text-[10px] font-medium ${TWITTER_TAG_COLOR[p.tag] || 'bg-gray-500/15 text-gray-300'}`}
                      >
                        {p.tag}
                      </span>
                      <span className="ml-auto text-xs text-gray-500">
                        {formatPostTime(p, day)}
                      </span>
                    </div>
                    <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-gray-200">
                      {p.text}
                    </p>
                    <div className="mt-2.5 flex gap-4 md:gap-5 text-xs text-gray-500">
                      <button
                        type="button"
                        onClick={() => likeTwitterPost(p.id)}
                        disabled={p.liked}
                        className={`flex items-center gap-1 transition-colors ${
                          p.liked
                            ? 'text-rose-400 cursor-default'
                            : 'hover:text-rose-300 cursor-pointer'
                        }`}
                      >
                        <span>{p.liked ? '♥' : '♡'}</span>
                        <span>{p.likes}</span>
                      </button>
                      <span>↻ {p.retweets}</span>
                      <span>💬 {p.comments}</span>
                    </div>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}

        <p className="mt-6 text-center text-xs text-gray-500">
          已加载全部 · 现实仍在加载中
        </p>
      </div>
    </div>
  );
}
