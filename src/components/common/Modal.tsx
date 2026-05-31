// 通用模态框 - 简洁圆角卡片
import { ReactNode, useEffect } from 'react';

interface ModalProps {
  title: string;
  subtitle?: string;
  onClose?: () => void;
  closable?: boolean;
  width?: string;
  children: ReactNode;
}

export function Modal({
  title,
  subtitle,
  onClose,
  closable = true,
  width = 'max-w-lg',
  children,
}: ModalProps) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && closable && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [closable, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 p-0 backdrop-blur-sm animate-fade-in sm:items-center sm:p-4"
      onClick={() => {
        if (closable && onClose) onClose();
      }}
    >
      <div
        className={`relative flex max-h-[92vh] w-full ${width} flex-col rounded-t-2xl border border-gray-700 bg-gray-800 shadow-2xl animate-fade-in-up sm:rounded-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 头部 */}
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-gray-700/60 px-4 pb-4 pt-5 sm:px-6">
          <div className="min-w-0 flex-1">
            <h3 className="text-lg font-semibold text-gray-100 truncate">
              {title}
            </h3>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-400 leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {closable && onClose && (
            <button
              onClick={onClose}
              aria-label="关闭"
              className="shrink-0 -mt-1 -mr-2 h-8 w-8 rounded-lg text-gray-400 hover:bg-gray-700 hover:text-gray-100 transition-colors flex items-center justify-center"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M3 3L13 13M13 3L3 13"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          )}
        </div>

        {/* 内容 */}
        <div className="min-h-0 overflow-y-auto p-4 sm:p-6">{children}</div>
      </div>
    </div>
  );
}
