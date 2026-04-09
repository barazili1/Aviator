
class AudioService {
  private ctx: AudioContext | null = null;

  private init() {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playScanStart() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    // تم التعديل من 10 نبضات إلى 25 نبضة لتغطية 5 ثوانٍ (0.2 * 25 = 5)
    for (let i = 0; i < 25; i++) {
      const time = now + (i * 0.2); 
      
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = i % 2 === 0 ? 'square' : 'sine';
      
      const freq = 200 + (i * 40); // تم تقليل معدل الزيادة ليناسب المدة الأطول
      osc.frequency.setValueAtTime(freq, time);
      osc.frequency.exponentialRampToValueAtTime(50, time + 0.15);

      gain.gain.setValueAtTime(0.03, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + 0.15);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(time);
      osc.stop(time + 0.2);
    }

    // صوت ضجيج أبيض لمدة 5 ثوانٍ
    const bufferSize = this.ctx.sampleRate * 5; 
    const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.005; 
    }
    const noise = this.ctx.createBufferSource();
    noise.buffer = buffer;
    noise.start(now);
    noise.stop(now + 5);
  }

  playSuccess(multiplier: number) {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const playPing = (freq: number, startTime: number, volume = 0.05) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(volume, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.3);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.3);
    };

    playPing(523.25, now); // C5
    
    if (multiplier >= 5) {
      setTimeout(() => {
        this.init();
        playPing(659.25, this.ctx!.currentTime, 0.07); // E5
      }, 100);
      setTimeout(() => {
        this.init();
        playPing(783.99, this.ctx!.currentTime, 0.09); // G5
      }, 200);
    }
  }

  playCopySound() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;
    
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(800, now);
    osc.frequency.exponentialRampToValueAtTime(1200, now + 0.05);

    gain.gain.setValueAtTime(0.05, now);
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.1);

    osc.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(now);
    osc.stop(now + 0.1);
  }

  playLoginSuccess() {
    this.init();
    if (!this.ctx) return;
    const now = this.ctx.currentTime;

    const playTone = (freq: number, startTime: number, vol: number) => {
      const osc = this.ctx!.createOscillator();
      const gain = this.ctx!.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, startTime);
      gain.gain.setValueAtTime(vol, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.4);
      osc.connect(gain);
      gain.connect(this.ctx!.destination);
      osc.start(startTime);
      osc.stop(startTime + 0.4);
    };

    // A satisfying ascending chime
    playTone(440, now, 0.05);       // A4
    playTone(554.37, now + 0.1, 0.05); // C#5
    playTone(659.25, now + 0.2, 0.07); // E5
    playTone(880, now + 0.3, 0.09);    // A5
  }
}

export const audioService = new AudioService();
