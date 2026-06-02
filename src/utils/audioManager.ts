// 音频管理器 - 单例模式
// 负责游戏内所有音效的预加载、播放、静音控制
// 容错原则：任何文件加载/播放失败都不影响游戏体验，只 console.warn 提示
// 双轨：优先 MP3 文件，缺失时回退到 Web Audio API 即时合成

// ============================================================
// 🎛️ 逐个音效开关 - 开发时直接在此控制每个声音是否播放
// 设为 false 即可关闭对应音效，保存后热更新即时生效
// ============================================================
const SOUND_ENABLED: Record<string, boolean> = {
  // --- 场所进入音效 ---
  'site-market': false,       // API商城 / 闲鱼，siteId 0,1）
  'site-outsource': true,    // 外包广场 / 猎头，siteId 2,3）
  'site-twitter': true,      // 推特，siteId 4）
  'site-apartment': false,    // 公寓，siteId 5）
  'site-coffee': false,       // 星巴克，siteId 6）
  'site-zhihu': false,        // 知乎，siteId 7）
  'site-achievement': false,  // 成就页，siteId 8）
  'site-retirement': false,   // 退休页，siteId 9）
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
  // --- 事件通知 ---
  'event-positive': false,    // 好消息上行音
  'event-negative': false,    // 坏消息音
  'spirit-crash': false,      // 精神崩溃音
  // --- 游戏结束 ---
  'game-over': false,         // 游戏结束钟声
};

// 音效名称到文件路径的映射
const SOUND_MAP: Record<string, string> = {
  // 场所进入音效
  'site-market': '/sounds/site-market.mp3',       // 推门声（API商城/闲鱼，siteId 0,1）
  'site-outsource': '/sounds/site-outsource.mp3', // 嘈杂人声（外包广场/猎头，siteId 2,3）
  'site-twitter': '/sounds/site-twitter.mp3',     // 手机通知音（siteId 4）
  'site-apartment': '/sounds/site-apartment.mp3', // 钥匙开锁声（siteId 5）
  'site-coffee': '/sounds/site-coffee.mp3',       // 咖啡机声（siteId 6）
  'site-zhihu': '/sounds/site-zhihu.mp3',         // 打字声（siteId 7）
  'site-achievement': '/sounds/site-achievement.mp3', // 号角庆典音（siteId 8）
  'site-retirement': '/sounds/site-retirement.mp3',   // 海浪声（siteId 9）
  // 下一天
  'next-day': '/sounds/next-day.mp3',
  // 交互音效
  'buy-token': '/sounds/buy-token.mp3',
  'sell-token': '/sounds/sell-token.mp3',
  'task-success': '/sounds/task-success.mp3',
  'task-fail': '/sounds/task-fail.mp3',
  'drink-coffee': '/sounds/drink-coffee.mp3',
  'write-blog': '/sounds/write-blog.mp3',
  'pay-rent': '/sounds/pay-rent.mp3',
  'event-positive': '/sounds/event-positive.mp3',
  'event-negative': '/sounds/event-negative.mp3',
  'game-over': '/sounds/game-over.mp3',
  'spirit-crash': '/sounds/spirit-crash.mp3',
};

// siteId 到音效名的映射
const SITE_SOUND_MAP: Record<number, string> = {
  0: 'site-market',
  1: 'site-market',
  2: 'site-outsource',
  3: 'site-outsource',
  4: 'site-twitter',
  5: 'site-apartment',
  6: 'site-coffee',
  7: 'site-zhihu',
  8: 'site-achievement',
  9: 'site-retirement',
};

const MUTE_STORAGE_KEY = 'game-audio-muted';
const PLAY_DEBOUNCE_MS = 200;

// BGM 配置
const BGM_PATH = '/sounds/Frank Dang - Shattered Paths_H.mp3';
const BGM_DEFAULT_VOLUME = 0.35; // BGM 默认音量（相对较低，不遮盖音效）

class AudioManager {
  private audioContext: AudioContext | null = null;
  private audioCache: Record<string, HTMLAudioElement> = {};
  private muted: boolean = false;
  private volume: number = 1;
  private lastPlayTime: Record<string, number> = {};

  // BGM 相关
  private bgm: HTMLAudioElement | null = null;
  private bgmVolume: number = BGM_DEFAULT_VOLUME;
  private bgmPlaying: boolean = false;

  // 合成函数映射表：当 MP3 不可用时调用
  private synthMap: Record<string, () => void> = {
    'site-market': () => this.synthDoor(),
    'site-outsource': () => this.synthCrowd(),
    'site-twitter': () => this.synthNotification(),
    'site-apartment': () => this.synthKey(),
    'site-coffee': () => this.synthSteam(),
    'site-zhihu': () => this.synthTyping(),
    'site-achievement': () => this.synthFanfare(),
    'site-retirement': () => this.synthWaves(),
    'next-day': () => this.synthPageFlip(),
    'buy-token': () => this.synthCashRegister(),
    'sell-token': () => this.synthCoin(),
    'task-success': () => this.synthSuccess(),
    'task-fail': () => this.synthFail(),
    'drink-coffee': () => this.synthPour(),
    'write-blog': () => this.synthWriting(),
    'pay-rent': () => this.synthPaperCount(),
    'event-positive': () => this.synthPositive(),
    'event-negative': () => this.synthNegative(),
    'game-over': () => this.synthGameOver(),
    'spirit-crash': () => this.synthCrash(),
  };

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

    // 尝试预加载所有 MP3（失败也无所谓，会回退到合成）
    try {
      for (const name of Object.keys(SOUND_MAP)) {
        this.getAudio(name);
      }
    } catch {
      /* 预加载失败忽略 */
    }
  }

  /**
   * 延迟创建 AudioContext（必须在用户交互后才能正常工作）
   */
  private getCtx(): AudioContext {
    if (!this.audioContext) {
      const Ctor = (window.AudioContext || (window as any).webkitAudioContext) as typeof AudioContext;
      this.audioContext = new Ctor();
    }
    if (this.audioContext.state === 'suspended') {
      this.audioContext.resume().catch(() => {});
    }
    return this.audioContext;
  }

  /**
   * 创建白噪声 AudioBuffer
   */
  private createNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.getCtx();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < length; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 创建棕色噪声 AudioBuffer（低频丰富，模拟自然声）
   */
  private createBrownNoiseBuffer(duration: number): AudioBuffer {
    const ctx = this.getCtx();
    const sampleRate = ctx.sampleRate;
    const length = Math.floor(sampleRate * duration);
    const buffer = ctx.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);
    let lastOut = 0;
    for (let i = 0; i < length; i++) {
      const white = Math.random() * 2 - 1;
      lastOut = (lastOut + 0.02 * white) / 1.02;
      data[i] = lastOut * 3.5; // 归一化
    }
    return buffer;
  }

  /**
   * 延迟加载并获取 Audio 对象。失败时返回 null。
   */
  private getAudio(soundName: string): HTMLAudioElement | null {
    const path = SOUND_MAP[soundName];
    if (!path) {
      console.warn(`[AudioManager] Unknown sound: ${soundName}`);
      return null;
    }
    if (this.audioCache[soundName]) {
      return this.audioCache[soundName];
    }
    try {
      if (typeof Audio === 'undefined') return null;
      const audio = new Audio(path);
      audio.preload = 'auto';
      audio.volume = this.volume;
      // 静默处理加载错误，避免控制台报错影响体验
      audio.addEventListener('error', () => {
        // 不输出 warn，避免没有 MP3 文件时刷屏（合成会兜底）
      });
      this.audioCache[soundName] = audio;
      return audio;
    } catch (err) {
      console.warn(`[AudioManager] Audio constructor failed for ${soundName}:`, err);
      return null;
    }
  }

  /**
   * 播放指定音效：优先 MP3，回退到合成。
   */
  play(soundName: string): void {
    if (this.muted) return;
    // 逐个音效开关检查
    if (SOUND_ENABLED[soundName] === false) return;
    // 防重叠：同一音效 200ms 内不重复播放
    const now = Date.now();
    const last = this.lastPlayTime[soundName] || 0;
    if (now - last < PLAY_DEBOUNCE_MS) return;
    this.lastPlayTime[soundName] = now;

    try {
      // 优先尝试 MP3
      const audio = this.audioCache[soundName];
      if (audio && audio.readyState >= 2) {
        try {
          audio.currentTime = 0;
        } catch {
          /* noop */
        }
        audio.volume = this.volume;
        const playPromise = audio.play();
        if (playPromise && typeof playPromise.then === 'function') {
          playPromise.catch(() => {
            // 播放失败再尝试合成
            const synthFn = this.synthMap[soundName];
            if (synthFn) {
              try { synthFn(); } catch { /* noop */ }
            }
          });
        }
        return;
      }

      // 回退到 Web Audio API 合成
      const synthFn = this.synthMap[soundName];
      if (synthFn) {
        synthFn();
      }
    } catch (err) {
      console.warn(`[AudioManager] play() error for ${soundName}:`, err);
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
        try {
          this.audioCache[key].pause();
        } catch {
          /* noop */
        }
      }
      // 静音时暂停 BGM
      if (this.bgm && this.bgmPlaying) {
        try { this.bgm.pause(); } catch { /* noop */ }
      }
    } else {
      // 取消静音时恢复 BGM
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
      try {
        this.audioCache[key].volume = v;
      } catch {
        /* noop */
      }
    }
    // 同步调整 BGM 音量（按比例）
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
      if (typeof Audio === 'undefined') return;
      if (!this.bgm) {
        this.bgm = new Audio(BGM_PATH);
        this.bgm.loop = true;
        this.bgm.preload = 'auto';
        this.bgm.addEventListener('error', () => {
          console.warn('[AudioManager] BGM 加载失败');
        });
      }
      this.bgm.volume = this.muted ? 0 : this.bgmVolume * this.volume;
      this.bgmPlaying = true;
      if (!this.muted) {
        this.bgm.play().catch(() => {
          // 浏览器可能阻止自动播放，等待用户交互后重试
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

  // ============================================================
  // Web Audio API 合成实现（20 个）
  // 所有合成函数内部 try-catch，不影响调用方
  // ============================================================

  /** 1. 推门声 (0.8s) - sawtooth 衰减 + 噪声 burst */
  private synthDoor(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const filter = ctx.createBiquadFilter();
      const gain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(200, t0);
      osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.8);
      filter.type = 'lowpass';
      filter.frequency.value = 300;
      gain.gain.setValueAtTime(0.3 * this.volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      osc.connect(filter).connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.8);

      // 短噪声 burst 模拟门轴摩擦
      const burst = ctx.createBufferSource();
      burst.buffer = this.createNoiseBuffer(0.05);
      const burstGain = ctx.createGain();
      burstGain.gain.setValueAtTime(0.15 * this.volume, t0);
      burstGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.05);
      burst.connect(burstGain).connect(ctx.destination);
      burst.start(t0);
    } catch { /* noop */ }
  }

  /** 2. 嘈杂人声 (1.5s) - 双 bandpass 白噪声 */
  private synthCrowd(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const buffer = this.createNoiseBuffer(1.5);

      const src1 = ctx.createBufferSource();
      src1.buffer = buffer;
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.frequency.value = 500;
      f1.Q.value = 1;

      const src2 = ctx.createBufferSource();
      src2.buffer = buffer;
      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.frequency.value = 2000;
      f2.Q.value = 1;

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0, t0);
      gain.gain.linearRampToValueAtTime(0.2 * this.volume, t0 + 0.1);
      gain.gain.setValueAtTime(0.2 * this.volume, t0 + 1.2);
      gain.gain.linearRampToValueAtTime(0, t0 + 1.5);

      src1.connect(f1).connect(gain);
      src2.connect(f2).connect(gain);
      gain.connect(ctx.destination);
      src1.start(t0);
      src2.start(t0);
      src1.stop(t0 + 1.5);
      src2.stop(t0 + 1.5);
    } catch { /* noop */ }
  }

  /** 3. 手机通知 (0.3s) - 双 sine 短促 */
  private synthNotification(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const beep = (freq: number, start: number, dur: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.3 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + dur);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + dur);
      };
      beep(880, 0, 0.1);
      beep(1100, 0.12, 0.1);
    } catch { /* noop */ }
  }

  /** 4. 钥匙声 (0.5s) - 3 个噪声 burst + highpass */
  private synthKey(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const offsets = [0, 0.15, 0.3];
      offsets.forEach((off) => {
        const src = ctx.createBufferSource();
        src.buffer = this.createNoiseBuffer(0.02);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.25 * this.volume, t0 + off);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + off + 0.02);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(t0 + off);
      });
    } catch { /* noop */ }
  }

  /** 5. 蒸汽声 (1s) - 白噪声 + bandpass 3000Hz */
  private synthSteam(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(1);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 3000;
      filter.Q.value = 2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.25 * this.volume, t0);
      gain.gain.linearRampToValueAtTime(0, t0 + 1);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t0);
      src.stop(t0 + 1);
    } catch { /* noop */ }
  }

  /** 6. 打字声 (0.5s) - 6 个噪声脉冲 + highpass */
  private synthTyping(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const baseOffsets = [0, 0.07, 0.14, 0.2, 0.28, 0.35];
      baseOffsets.forEach((off) => {
        const jitter = (Math.random() - 0.5) * 0.03;
        const start = Math.max(0, off + jitter);
        const src = ctx.createBufferSource();
        src.buffer = this.createNoiseBuffer(0.015);
        const filter = ctx.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + 0.015);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(t0 + start);
      });
    } catch { /* noop */ }
  }

  /** 7. 号角庆典 (0.6s) - 大三和弦琶音 triangle */
  private synthFanfare(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const notes = [
        { freq: 523, start: 0 },
        { freq: 659, start: 0.15 },
        { freq: 784, start: 0.3 },
        { freq: 1047, start: 0.45 },
      ];
      notes.forEach(({ freq, start }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.25 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + 0.15);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + 0.15);
      });
    } catch { /* noop */ }
  }

  /** 8. 海浪声 (2s) - 棕色噪声 + lowpass + 慢 LFO 起伏 */
  private synthWaves(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.createBrownNoiseBuffer(2);
      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 800;
      const gain = ctx.createGain();

      // 用 setValueCurveAtTime 模拟 0.5Hz 的 LFO 起伏
      const steps = 64;
      const curve = new Float32Array(steps);
      for (let i = 0; i < steps; i++) {
        const t = (i / (steps - 1)) * 2;
        curve[i] = (Math.sin(2 * Math.PI * 0.5 * t) * 0.1 + 0.1) * this.volume;
      }
      gain.gain.setValueCurveAtTime(curve, t0, 2);

      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t0);
      src.stop(t0 + 2);
    } catch { /* noop */ }
  }

  /** 9. 翻页声 (0.2s) - 短噪声 burst + highpass */
  private synthPageFlip(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(0.05);
      const filter = ctx.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 1500;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.3 * this.volume, t0);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.2);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t0);
    } catch { /* noop */ }
  }

  /** 10. 收银机叮 (0.4s) - sine 1200Hz 衰减 */
  private synthCashRegister(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 1200;
      gain.gain.setValueAtTime(0.25 * this.volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
    } catch { /* noop */ }
  }

  /** 11. 金币声 (0.3s) - 双 sine 高频 */
  private synthCoin(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const tone = (freq: number, start: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.15 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + 0.3);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + 0.3);
      };
      tone(1500, 0);
      tone(2200, 0.05);
    } catch { /* noop */ }
  }

  /** 12. 成功音 (0.3s) - C-E-G 上行 triangle */
  private synthSuccess(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const notes = [
        { freq: 523, start: 0 },
        { freq: 659, start: 0.1 },
        { freq: 784, start: 0.2 },
      ];
      notes.forEach(({ freq, start }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + 0.1);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + 0.1);
      });
    } catch { /* noop */ }
  }

  /** 13. 失败音 (0.4s) - A4-D4 下行 sawtooth */
  private synthFail(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const notes = [
        { freq: 440, start: 0 },
        { freq: 294, start: 0.2 },
      ];
      notes.forEach(({ freq, start }) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(0.2 * this.volume, t0 + start);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + start + 0.2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0 + start);
        osc.stop(t0 + start + 0.2);
      });
    } catch { /* noop */ }
  }

  /** 14. 倒水声 (0.8s) - 白噪声 bandpass 频率扫描 */
  private synthPour(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(0.8);
      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(800, t0);
      filter.frequency.linearRampToValueAtTime(1200, t0 + 0.8);
      filter.Q.value = 2;
      const gain = ctx.createGain();
      gain.gain.setValueAtTime(0.15 * this.volume, t0);
      gain.gain.linearRampToValueAtTime(0, t0 + 0.8);
      src.connect(filter).connect(gain).connect(ctx.destination);
      src.start(t0);
      src.stop(t0 + 0.8);
    } catch { /* noop */ }
  }

  /** 15. 书写声 (0.6s) - 4 个柔和噪声脉冲 */
  private synthWriting(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const offsets = [0, 0.15, 0.3, 0.45];
      offsets.forEach((off) => {
        const src = ctx.createBufferSource();
        src.buffer = this.createNoiseBuffer(0.04);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 1000;
        filter.Q.value = 1;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.12 * this.volume, t0 + off);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + off + 0.04);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(t0 + off);
      });
    } catch { /* noop */ }
  }

  /** 16. 点钞声 (0.4s) - 4 个快速噪声脉冲 */
  private synthPaperCount(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const offsets = [0, 0.09, 0.18, 0.27];
      offsets.forEach((off) => {
        const src = ctx.createBufferSource();
        src.buffer = this.createNoiseBuffer(0.025);
        const filter = ctx.createBiquadFilter();
        filter.type = 'bandpass';
        filter.frequency.value = 2000;
        const gain = ctx.createGain();
        gain.gain.setValueAtTime(0.2 * this.volume, t0 + off);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + off + 0.025);
        src.connect(filter).connect(gain).connect(ctx.destination);
        src.start(t0 + off);
      });
    } catch { /* noop */ }
  }

  /** 17. 好消息上行 (0.3s) - sine C5→C6 */
  private synthPositive(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523, t0);
      osc.frequency.linearRampToValueAtTime(1047, t0 + 0.25);
      gain.gain.setValueAtTime(0.2 * this.volume, t0);
      gain.gain.setValueAtTime(0.2 * this.volume, t0 + 0.25);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.3);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.3);
    } catch { /* noop */ }
  }

  /** 18. 坏消息 (0.4s) - square 100Hz 衰减 */
  private synthNegative(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'square';
      osc.frequency.value = 100;
      gain.gain.setValueAtTime(0.15 * this.volume, t0);
      gain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.4);
      osc.connect(gain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.4);
    } catch { /* noop */ }
  }

  /** 19. 游戏结束钟声 (2s) - 双 sine 泛音慢衰减 */
  private synthGameOver(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const make = (freq: number, vol: number) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.value = freq;
        gain.gain.setValueAtTime(vol * this.volume, t0);
        gain.gain.exponentialRampToValueAtTime(0.001, t0 + 2);
        osc.connect(gain).connect(ctx.destination);
        osc.start(t0);
        osc.stop(t0 + 2);
      };
      make(150, 0.2);
      make(300, 0.1);
    } catch { /* noop */ }
  }

  /** 20. 精神崩溃 (0.8s) - sawtooth 下行扫描 + 噪声 */
  private synthCrash(): void {
    try {
      const ctx = this.getCtx();
      const t0 = ctx.currentTime;
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(800, t0);
      osc.frequency.exponentialRampToValueAtTime(80, t0 + 0.8);
      oscGain.gain.setValueAtTime(0.2 * this.volume, t0);
      oscGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.8);
      osc.connect(oscGain).connect(ctx.destination);
      osc.start(t0);
      osc.stop(t0 + 0.8);

      const src = ctx.createBufferSource();
      src.buffer = this.createNoiseBuffer(0.1);
      const noiseGain = ctx.createGain();
      noiseGain.gain.setValueAtTime(0.15 * this.volume, t0);
      noiseGain.gain.exponentialRampToValueAtTime(0.001, t0 + 0.1);
      src.connect(noiseGain).connect(ctx.destination);
      src.start(t0);
    } catch { /* noop */ }
  }
}

// 导出单例
export const audioManager = new AudioManager();
