/**
 * Pure Web Audio API Sound Synthesizer & Kenyan Radio Station
 * No external sound files required — 100% resilient and procedural!
 */

class SoundManager {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;
  private volume: number = 0.6;
  private engineOsc: OscillatorNode | null = null;
  private engineGain: GainNode | null = null;
  private radioPlaying: boolean = false;
  private activeStation: number = 1; // 1: Radio Maisha, 2: Nairobi Wave, 3: Savannah Winds, 0: Off
  private radioInterval: number | null = null;
  private stepCounter: number = 0;
  private rainNode: AudioNode | null = null;
  private rainGain: GainNode | null = null;
  private isRaining: boolean = false;

  private initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (this.engineGain) {
      this.engineGain.gain.value = muted ? 0 : 0.05;
    }
    if (muted && this.radioPlaying) {
      this.stopRadio();
    }
  }

  public getMuted(): boolean {
    return this.isMuted;
  }

  public setVolume(val: number) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  public getVolume(): number {
    return this.volume;
  }

  // Engine audio loop for vehicles
  public startEngine() {
    if (this.isMuted || this.engineOsc) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.engineOsc = this.ctx.createOscillator();
      this.engineGain = this.ctx.createGain();

      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 280;

      this.engineOsc.type = 'sawtooth';
      this.engineOsc.frequency.value = 45; // idle rumble

      this.engineGain.gain.value = this.isMuted ? 0 : 0.04 * this.volume;

      this.engineOsc.connect(filter);
      filter.connect(this.engineGain);
      this.engineGain.connect(this.ctx.destination);

      this.engineOsc.start();
    } catch {
      // Audio autoplay policy fallback
    }
  }

  public updateEnginePitch(speedRatio: number) {
    if (!this.engineOsc || !this.engineGain || !this.ctx) return;
    try {
      const targetFreq = 40 + speedRatio * 90;
      this.engineOsc.frequency.setTargetAtTime(targetFreq, this.ctx.currentTime, 0.05);
      const targetVol = this.isMuted ? 0 : (0.03 + speedRatio * 0.06) * this.volume;
      this.engineGain.gain.setTargetAtTime(targetVol, this.ctx.currentTime, 0.05);
    } catch {
      // ignore
    }
  }

  public stopEngine() {
    if (this.engineOsc) {
      try {
        this.engineOsc.stop();
        this.engineOsc.disconnect();
      } catch {}
      this.engineOsc = null;
    }
  }

  // Iconic Matatu Air Horn (Twin-Tone "Pii-Piiii!")
  public playHorn() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc1 = this.ctx.createOscillator();
    const osc2 = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc1.type = 'sawtooth';
    osc2.type = 'sawtooth';

    // Classic twin trumpet horn frequencies
    osc1.frequency.setValueAtTime(440, t); // A4
    osc2.frequency.setValueAtTime(554.37, t); // C#5

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.25 * this.volume, t + 0.04);
    gain.gain.setValueAtTime(0.25 * this.volume, t + 0.18);
    gain.gain.linearRampToValueAtTime(0.01, t + 0.22);

    // Second chirp
    gain.gain.setValueAtTime(0.28 * this.volume, t + 0.26);
    gain.gain.linearRampToValueAtTime(0.28 * this.volume, t + 0.48);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.58);

    osc1.connect(gain);
    osc2.connect(gain);
    gain.connect(this.ctx.destination);

    osc1.start(t);
    osc2.start(t);
    osc1.stop(t + 0.6);
    osc2.stop(t + 0.6);
  }

  // Cash / Coin jingle for profitable trading in KES
  public playCashRegister() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const freqs = [1200, 1600, 2400];

    freqs.forEach((freq, idx) => {
      if (!this.ctx) return;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, t + idx * 0.06);

      gain.gain.setValueAtTime(0, t + idx * 0.06);
      gain.gain.linearRampToValueAtTime(0.18 * this.volume, t + idx * 0.06 + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, t + idx * 0.06 + 0.3);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t + idx * 0.06);
      osc.stop(t + idx * 0.06 + 0.35);
    });
  }

  // Camera Shutter Snap for Wildlife Photography
  public playCameraShutter() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    
    // Mechanical click 1
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(800, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.05);

    gain.gain.setValueAtTime(0.3 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.01, t + 0.05);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.06);

    // Mechanical mirror flip & whirr 2
    setTimeout(() => {
      if (!this.ctx || this.isMuted) return;
      const t2 = this.ctx.currentTime;
      const osc2 = this.ctx.createOscillator();
      const gain2 = this.ctx.createGain();
      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(600, t2);
      osc2.frequency.exponentialRampToValueAtTime(1200, t2 + 0.08);

      gain2.gain.setValueAtTime(0.2 * this.volume, t2);
      gain2.gain.exponentialRampToValueAtTime(0.01, t2 + 0.12);

      osc2.connect(gain2);
      gain2.connect(this.ctx.destination);
      osc2.start(t2);
      osc2.stop(t2 + 0.14);
    }, 80);
  }

  // Lion roar / animal reaction sound effect
  public playLionRoar() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;

    const t = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'sawtooth';
    osc.frequency.setValueAtTime(110, t);
    osc.frequency.linearRampToValueAtTime(75, t + 0.35);
    osc.frequency.linearRampToValueAtTime(50, t + 0.85);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(320, t);
    filter.frequency.linearRampToValueAtTime(180, t + 0.85);

    gain.gain.setValueAtTime(0.01, t);
    gain.gain.linearRampToValueAtTime(0.25 * this.volume, t + 0.15);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.9);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);

    osc.start(t);
    osc.stop(t + 0.95);
  }

  // Procedural Nairobi Radio Station Loop (Afrobeat, Benga, Gengetone synths)
  public startRadio(station: number = 1) {
    this.activeStation = station;
    if (station === 0) {
      this.stopRadio();
      return;
    }

    this.initCtx();
    this.radioPlaying = true;
    if (this.radioInterval) clearInterval(this.radioInterval);

    // 120 BPM = 125ms 16th notes
    const stepDurationMs = 135;
    this.stepCounter = 0;

    // Melody scales: F Pentatonic major (Afrobeat/Benga vibe)
    const scaleA = [174.61, 196.00, 220.00, 261.63, 293.66, 349.23, 392.00, 440.00, 523.25];
    // Chill D minor scale (Gengetone urban vibe)
    const scaleB = [146.83, 164.81, 174.61, 196.00, 220.00, 261.63, 293.66, 349.23];
    // Savannah flute/kalimba
    const scaleC = [261.63, 293.66, 329.63, 392.00, 440.00, 523.25, 587.33];

    this.radioInterval = window.setInterval(() => {
      if (this.isMuted || !this.ctx || !this.radioPlaying) return;

      const step = this.stepCounter % 16;
      const t = this.ctx.currentTime;

      // 1. Kick & Percussion on quarter beats
      if (this.activeStation === 1 || this.activeStation === 2) {
        if (step === 0 || step === 4 || step === 8 || step === 12) {
          this.triggerKick(t);
        }
        if (step === 4 || step === 12 || step === 7 || step === 14) {
          this.triggerRimshot(t);
        }
      }

      // 2. Bassline & Guitar / Kalimba melody
      if (this.activeStation === 1) {
        // Radio Maisha: Energetic Benga / Afrobeat guitar groove
        if (step % 2 === 0) {
          const bassNote = [110, 110, 130.81, 146.83, 110, 164.81, 146.83, 130.81][(step / 2) % 8];
          this.triggerSynthBass(t, bassNote, 0.12);
        }
        if (step === 2 || step === 5 || step === 9 || step === 11 || step === 15) {
          const melodyNote = scaleA[Math.floor((step * 3) % scaleA.length)];
          this.triggerKalimba(t, melodyNote, 0.15);
        }
      } else if (this.activeStation === 2) {
        // Nairobi Wave 105.5: Heavy Gengetone sub bass + synth plucks
        if (step === 0 || step === 6 || step === 10) {
          const bassNote = [73.42, 87.31, 65.41, 73.42][Math.floor(this.stepCounter / 16) % 4];
          this.triggerSynthBass(t, bassNote, 0.22);
        }
        if (step === 3 || step === 7 || step === 11 || step === 14) {
          const melodyNote = scaleB[Math.floor((step * 2) % scaleB.length)];
          this.triggerKalimba(t, melodyNote * 1.5, 0.12);
        }
      } else if (this.activeStation === 3) {
        // Savannah Winds: Peaceful ambient marimba
        if (step === 0 || step === 8) {
          const root = scaleC[0] / 2;
          this.triggerSynthBass(t, root, 0.4);
        }
        if (step === 2 || step === 6 || step === 10 || step === 13) {
          const note = scaleC[(step * 2) % scaleC.length];
          this.triggerKalimba(t, note, 0.25);
        }
      }

      this.stepCounter++;
    }, stepDurationMs);
  }

  private triggerKick(t: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.frequency.setValueAtTime(140, t);
    osc.frequency.exponentialRampToValueAtTime(38, t + 0.08);

    gain.gain.setValueAtTime(0.18 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.12);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.13);
  }

  private triggerRimshot(t: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(500, t);
    osc.frequency.exponentialRampToValueAtTime(200, t + 0.04);

    gain.gain.setValueAtTime(0.08 * this.volume, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.06);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + 0.07);
  }

  private triggerSynthBass(t: number, freq: number, dur: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();
    const filter = this.ctx.createBiquadFilter();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, t);

    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(350, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.14 * this.volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(filter);
    filter.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  private triggerKalimba(t: number, freq: number, dur: number) {
    if (!this.ctx) return;
    const osc = this.ctx.createOscillator();
    const gain = this.ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, t);

    gain.gain.setValueAtTime(0, t);
    gain.gain.linearRampToValueAtTime(0.12 * this.volume, t + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);

    osc.connect(gain);
    gain.connect(this.ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  public stopRadio() {
    this.radioPlaying = false;
    if (this.radioInterval) {
      clearInterval(this.radioInterval);
      this.radioInterval = null;
    }
  }

  public getStation(): number {
    return this.activeStation;
  }

  public startRain() {
    if (this.isRaining || this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;

      this.isRaining = true;
      // White noise buffer for rain
      const bufferSize = this.ctx.sampleRate * 2;
      const noiseBuffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter for rainfall patter (bandpass + lowpass)
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 1100;

      const rainGain = this.ctx.createGain();
      rainGain.gain.setValueAtTime(0.01, this.ctx.currentTime);
      rainGain.gain.linearRampToValueAtTime(0.12 * this.volume, this.ctx.currentTime + 1.5);

      whiteNoise.connect(filter);
      filter.connect(rainGain);
      rainGain.connect(this.ctx.destination);

      whiteNoise.start();
      this.rainNode = whiteNoise;
      this.rainGain = rainGain;
    } catch (_) {}
  }

  public stopRain() {
    this.isRaining = false;
    if (this.rainGain && this.ctx) {
      try {
        this.rainGain.gain.linearRampToValueAtTime(0.001, this.ctx.currentTime + 1.0);
        setTimeout(() => {
          if (this.rainNode) {
            try { (this.rainNode as AudioScheduledSourceNode).stop(); } catch (_) {}
            this.rainNode = null;
          }
          this.rainGain = null;
        }, 1100);
      } catch (_) {
        this.rainGain = null;
        this.rainNode = null;
      }
    }
  }

  public playThunder() {
    if (this.isMuted) return;
    try {
      this.initCtx();
      if (!this.ctx) return;
      const t = this.ctx.currentTime;

      // Low rumble osc
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const filter = this.ctx.createBiquadFilter();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(65, t);
      osc.frequency.exponentialRampToValueAtTime(25, t + 2.5);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(140, t);

      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.35 * this.volume, t + 0.1);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 2.6);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(t);
      osc.stop(t + 2.8);
    } catch (_) {}
  }

  public isRadioOn(): boolean {
    return this.radioPlaying && this.activeStation !== 0;
  }
}

export const soundManager = new SoundManager();
