// 横屏提示遮罩 — 竖屏 + 小屏设备时全屏提示用户旋转手机
// 纯 CSS media query 控制显隐

export function LandscapeGuard() {
  return (
    <div className="landscape-guard fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-gray-900 text-gray-200">
      {/* 旋转手机动画图标 */}
      <div className="rotate-icon mb-6">
        <svg
          width="80"
          height="80"
          viewBox="0 0 80 80"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* 手机外框 */}
          <rect
            x="24"
            y="10"
            width="32"
            height="56"
            rx="4"
            stroke="currentColor"
            strokeWidth="2.5"
            className="text-emerald-400"
          />
          {/* Home 按钮 */}
          <circle cx="40" cy="59" r="2.5" fill="currentColor" className="text-emerald-400" />
          {/* 旋转箭头 */}
          <path
            d="M62 40a22 22 0 0 1-22 22"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            className="text-gray-400"
          />
          <path
            d="M40 62l-4-4 4-4"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-gray-400"
          />
        </svg>
      </div>

      <h2 className="text-xl font-bold text-emerald-400">请横屏游玩</h2>
      <p className="mt-3 max-w-xs text-center text-sm text-gray-400 leading-relaxed">
        为了获得最佳体验，请将手机旋转至横屏模式
      </p>
      <p className="mt-3 max-w-xs text-center text-sm text-gray-400 leading-relaxed">
        若微信中无法旋转，请用Chrome浏览器打开
      </p>

      <p className="mt-6 text-xs text-gray-600">
        Vibe Coding 模拟器
      </p>
    </div>
  );
}
