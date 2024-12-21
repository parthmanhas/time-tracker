class SoundManager {
  private static instance: SoundManager;
  private audio: HTMLAudioElement;

  private constructor() {
    this.audio = new Audio('/sounds/timer-complete.mp3');
  }

  public static getInstance(): SoundManager {
    if (!SoundManager.instance) {
      SoundManager.instance = new SoundManager();
    }
    return SoundManager.instance;
  }

  public playTimerComplete() {
    const soundEnabled = localStorage.getItem('soundEnabled') !== 'false';
    if (!soundEnabled) return;

    this.audio.currentTime = 0;
    this.audio.play().catch(error => {
      console.error('Error playing sound:', error);
    });
  }
}

export const soundManager = SoundManager.getInstance(); 