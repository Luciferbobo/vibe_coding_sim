// 音频管理器 - 单例模式
// 负责游戏内所有音效的预加载、播放、静音控制
// 容错原则：任何文件加载/播放失败都不影响游戏体验，只 console.warn 提示
// 纯 MP3 播放，无合成回退

// ============================================================
// 🎛️ 逐个音效开关 - 开发时直接在此控制每个声音是否播放
// 设为 false 即可关闭对应音效，保存后热更新即时生效
// ============================================================
const SOUND_ENABLED: Record<string, boolean> = {
  // --- 场所进入音效 ---
  'site-outsource': true,    // 外包广场 / 猎头，siteId 2,3）
  'site-twitter': true,      // 推特，siteId 4）
  'site-apartment': true,    // 公寓，siteId 5）
  // --- 导航 ---
  'next-day': true,          // 翻页声（进入下一天）
  // --- 买卖 Token ---
  'buy-token': true,         // （购买）
  'sell-token': true,        // （卖出）
  // --- 任务 ---
  'task-success': true,      // 成功音（任务完成）
  'task-fail': true,         // 失败音（任务失败）
  // --- 生活设施 ---
  'drink-coffee': true,      // （喝咖啡）
  'write-blog': true,        // （写博客）
  'pay-rent': true,          // （交房租）
};

// 音效名称到文件路径的映射
const soundPath = (filename: string) => `${import.meta.env.BASE_URL}sounds/${filename}`;

const SOUND_MAP: Record<string, string> = {
  // 场所进入音效
  'site-outsource': soundPath('site-outsource.mp3'), // 键盘声（外包广场/猎头，siteId 2,3）
  'site-twitter': soundPath('site-twitter.mp3'),     // 手机通知音（siteId 4）
  'site-apartment': soundPath('site-apartment.mp3'), // 钥匙开锁声（siteId 5）
  // 下一天
  'next-day': soundPath('next-day.mp3'),
  // 交互音效
  'buy-token': soundPath('buy-token.mp3'),
  'sell-token': soundPath('sell-token.mp3'),
  'task-success': soundPath('task-success.mp3'),
  'task-fail': soundPath('task-fail.mp3'),
  'drink-coffee': soundPath('drink-coffee.mp3'),
  'write-blog': soundPath('write-blog.mp3'),
  'pay-rent': soundPath('pay-rent.mp3'),
};

// siteId 到音效名的映射
const SITE_SOUND_MAP: Record<number, string> = {
  2: 'site-outsource',
  3: 'site-outsource',
  4: 'site-twitter',
  5: 'site-apartment',
};

const MUTE_STORAGE_KEY = 'game-audio-muted';
const PLAY_DEBOUNCE_MS = 200;

// BGM 配置
const BGM_PATH = soundPath('Frank Dang - Shattered Paths_H.mp3');
const BGM_DEFAULT_VOLUME = 0.35;

class AudioManager {
  private audioCache: Record<string, HTMLAudioElement> = {};
  private muted: boolean = false;
  private volume: number = 1;
  private lastPlayTime: Record<string, number> = {};

  // BGM 相关
  private bgm: HTMLAudioElement | null = null;
  private bgmVolume: number = BGM_DEFAULT_VOLUME;
  private bgmPlaying: boolean = false;

  constructor() {
    // 从 localStorage 恢复静音状态
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(MUTE_STORAGE_KEY);
        this.muted = saved === 'true';
      }
    } catch {
      this.muted = false;
    }
  }

  /**
   * 预加载所有音频资源（含 BGM）。
   * 在开始画面点击"开始游戏"后调用，通过 onProgress 回调报告进度。
   * 返回 Promise，resolve 时所有资源加载完毕可以开始游戏。
   */
  preloadAll(onProgress?: (loaded: number, total: number) => void): Promise<void> {
    return new Promise((resolve) => {
      // 收集所有需要加载的路径（音效 + BGM）
      const allPaths: Array<{ name: string; path: string }> = [];
      for (const [name, path] of Object.entries(SOUND_MAP)) {
        allPaths.push({ name, path });
      }
      allPaths.push({ name: '__bgm__', path: BGM_PATH });

      const total = allPaths.length;
      let loaded = 0;

      const markLoaded = () => {
        loaded++;
        onProgress?.(loaded, total);
        if (loaded >= total) {
          resolve();
        }
      };

      for (const { name, path } of allPaths) {
        try {
          if (typeof Audio === 'undefined') {
            markLoaded();
            continue;
          }
          const audio = new Audio(path);
          audio.preload = 'auto';
          audio.volume = this.volume;

          const onCanPlay = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            if (name === '__bgm__') {
              audio.loop = true;
              this.bgm = audio;
            } else {
              this.audioCache[name] = audio;
            }
            markLoaded();
          };

          const onError = () => {
            audio.removeEventListener('canplaythrough', onCanPlay);
            audio.removeEventListener('error', onError);
            console.warn(`[AudioManager] 加载失败: ${path}`);
            // 即使失败也计入进度，不阻塞游戏启动
            markLoaded();
          };

          audio.addEventListener('canplaythrough', onCanPlay);
          audio.addEventListener('error', onError);
          audio.load();
        } catch {
          markLoaded();
        }
      }

      // 安全兜底：如果 total 为 0 直接 resolve
      if (total === 0) resolve();
    });
  }

  /**
   * 播放指定音效（纯 MP3，无合成回退）。
   */
  play(soundName: string): void {
    if (this.muted) return;
    if (SOUND_ENABLED[soundName] === false) return;
    // 防重叠：同一音效 200ms 内不重复播放
    const now = Date.now();
    const last = this.lastPlayTime[soundName] || 0;
    if (now - last < PLAY_DEBOUNCE_MS) return;
    this.lastPlayTime[soundName] = now;

    const audio = this.audioCache[soundName];
    if (!audio) return;
    try {
      audio.currentTime = 0;
      audio.volume = this.volume;
      audio.play().catch(() => {
        // 播放失败静默处理（如浏览器策略阻止）
      });
    } catch {
      /* noop */
    }
  }

  /**
   * 根据 siteId 播放对应场所音效
   */
  playSiteSound(siteId: number): void {
    const soundName = SITE_SOUND_MAP[siteId];
    if (!soundName) return;
    this.play(soundName);
  }

  /**
   * 全局静音控制。状态会写入 localStorage 持久化。
   */
  setMuted(muted: boolean): void {
    this.muted = muted;
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(MUTE_STORAGE_KEY, muted ? 'true' : 'false');
      }
    } catch {
      /* localStorage 不可用时忽略 */
    }
    if (muted) {
      for (const key in this.audioCache) {
        try { this.audioCache[key].pause(); } catch { /* noop */ }
      }
      if (this.bgm && this.bgmPlaying) {
        try { this.bgm.pause(); } catch { /* noop */ }
      }
    } else {
      if (this.bgm && this.bgmPlaying) {
        try { this.bgm.play().catch(() => {}); } catch { /* noop */ }
      }
    }
  }

  isMuted(): boolean {
    return this.muted;
  }

  /**
   * 设置全局音量 0-1
   */
  setVolume(volume: number): void {
    const v = Math.max(0, Math.min(1, volume));
    this.volume = v;
    for (const key in this.audioCache) {
      try { this.audioCache[key].volume = v; } catch { /* noop */ }
    }
    if (this.bgm) {
      try { this.bgm.volume = this.bgmVolume * v; } catch { /* noop */ }
    }
  }

  // ============================================================
  // 🎵 BGM 背景音乐控制
  // ============================================================

  /**
   * 播放 BGM（循环），如果已经在播放则忽略
   */
  playBgm(): void {
    if (this.bgmPlaying && this.bgm) return;
    try {
      if (!this.bgm) {
        // 如果 preloadAll 没有提前加载 BGM，则即时创建
        if (typeof Audio === 'undefined') return;
        this.bgm = new Audio(BGM_PATH);
        this.bgm.loop = true;
        this.bgm.preload = 'auto';
      }
      this.bgm.volume = this.muted ? 0 : this.bgmVolume * this.volume;
      this.bgmPlaying = true;
      if (!this.muted) {
        this.bgm.play().catch(() => {
          const resumeOnInteraction = () => {
            if (this.bgm && this.bgmPlaying && !this.muted) {
              this.bgm.play().catch(() => {});
            }
            document.removeEventListener('click', resumeOnInteraction);
            document.removeEventListener('keydown', resumeOnInteraction);
          };
          document.addEventListener('click', resumeOnInteraction, { once: true });
          document.addEventListener('keydown', resumeOnInteraction, { once: true });
        });
      }
    } catch (err) {
      console.warn('[AudioManager] playBgm() error:', err);
    }
  }

  /**
   * 暂停 BGM
   */
  pauseBgm(): void {
    this.bgmPlaying = false;
    if (this.bgm) {
      try { this.bgm.pause(); } catch { /* noop */ }
    }
  }

  /**
   * 停止 BGM 并重置进度
   */
  stopBgm(): void {
    this.bgmPlaying = false;
    if (this.bgm) {
      try {
        this.bgm.pause();
        this.bgm.currentTime = 0;
      } catch { /* noop */ }
    }
  }

  /**
   * 设置 BGM 音量 0-1
   */
  setBgmVolume(volume: number): void {
    this.bgmVolume = Math.max(0, Math.min(1, volume));
    if (this.bgm) {
      try { this.bgm.volume = this.muted ? 0 : this.bgmVolume * this.volume; } catch { /* noop */ }
    }
  }

  /**
   * 获取 BGM 是否正在播放
   */
  isBgmPlaying(): boolean {
    return this.bgmPlaying;
  }
}

// 导出单例
export const audioManager = new AudioManager();
