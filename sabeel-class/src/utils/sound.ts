// Interactive kid-friendly audio synthesizer using Web Audio API
// No external MP3 downloads required, completely self-contained and instant.
import { getAnimeVoiceDef } from './animeVoices';
import { getSkillAudio, hasCustomSkillAudio } from './skillAudioRegistry';

const SOUND_STORAGE_KEY = 'sabeel_sound_enabled';

class SoundManager {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;
  private cachedVoices: SpeechSynthesisVoice[] = [];
  private skillAudioBuffers: Map<string, AudioBuffer> = new Map();
  private skillAudioElements: Map<string, HTMLAudioElement> = new Map();
  private audioLoadingPromises: Map<string, Promise<AudioBuffer | null>> = new Map();

  constructor() {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem(SOUND_STORAGE_KEY);
      this.enabled = stored !== null ? stored === 'true' : true;

      // Preload registered custom skill audio files (e.g. Sharingan)
      setTimeout(() => {
        try {
          this.preloadSkillAudio('uchiha_sharingan');
        } catch {
          // Ignore
        }
      }, 150);

      // Preload available SpeechSynthesis voices for instant anime character shouts
      if ('speechSynthesis' in window) {
        const updateVoices = () => {
          try {
            this.cachedVoices = window.speechSynthesis.getVoices();
          } catch {
            // Ignore
          }
        };
        updateVoices();
        if (window.speechSynthesis.onvoiceschanged !== undefined) {
          window.speechSynthesis.onvoiceschanged = updateVoices;
        }
      }
    }
  }

  public isEnabled(): boolean {
    return this.enabled;
  }

  public setEnabled(val: boolean) {
    this.enabled = val;
    if (typeof window !== 'undefined') {
      localStorage.setItem(SOUND_STORAGE_KEY, String(val));
    }
  }

  public toggleSound(): boolean {
    this.setEnabled(!this.enabled);
    if (this.enabled) {
      this.playPointChime(1);
    }
    return this.enabled;
  }

  private getContext(): AudioContext | null {
    if (!this.enabled || typeof window === 'undefined') return null;
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.ctx) {
        this.ctx = new AudioCtx();
      }
      if (this.ctx.state === 'suspended') {
        this.ctx.resume().catch(() => {});
      }
      return this.ctx;
    } catch {
      return null;
    }
  }

  // Play a cheerful star chime when points are awarded
  public playPointChime(points: number = 5) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Arpeggio notes (C5, E5, G5, C6)
      const baseFreqs = [523.25, 659.25, 783.99, 1046.50];
      const count = Math.min(4, Math.max(2, Math.floor(points / 2) + 1));

      for (let i = 0; i < count; i++) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(baseFreqs[i % baseFreqs.length], now + i * 0.08);

        gain.gain.setValueAtTime(0.001, now + i * 0.08);
        gain.gain.exponentialRampToValueAtTime(0.2, now + i * 0.08 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.35);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + i * 0.08);
        osc.stop(now + i * 0.08 + 0.4);
      }
    } catch {
      // Ignore audio synthesis errors
    }
  }

  // Play audio for specific anime animation
  public playAnimationSound(animationType: string = 'rasengan') {
    const ctx = this.getContext();
    if (!ctx) return;

    // Trigger iconic anime character voice shout (Ryōiki Tenkai, Rasengan, Sharingan, etc.)
    this.playAnimeVoice(animationType);

    try {
      const now = ctx.currentTime;

      if (animationType === 'rasengan') {
        // Swirling vortex pitch glide + chakra burst
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(250, now);
        osc.frequency.exponentialRampToValueAtTime(1050, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.7);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.28, now + 0.2);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.75);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.8);
      } else if (animationType === 'chidori') {
        // High voltage electric buzz / thousand birds
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(1200, now);
        osc.frequency.linearRampToValueAtTime(1800, now + 0.15);
        osc.frequency.linearRampToValueAtTime(900, now + 0.3);
        osc.frequency.linearRampToValueAtTime(2200, now + 0.45);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.6);
      } else if (animationType === 'titan_transformation' || animationType === 'titan_lightning') {
        // Colossal lightning crack & thunder rumble
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(35, now + 0.5);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (animationType === 'water_breathing') {
        // Flowing harmonic wave glide
        [320, 480, 640].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + i * 0.08);
          osc.frequency.exponentialRampToValueAtTime(freq * 1.5, now + i * 0.08 + 0.3);
          gain.gain.setValueAtTime(0.001, now + i * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.18, now + i * 0.08 + 0.05);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + i * 0.08 + 0.5);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.08);
          osc.stop(now + i * 0.08 + 0.55);
        });
      } else if (animationType === 'flame_breathing' || animationType === 'flame_slash') {
        // Blazing sword slash & fiery whoosh
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(950, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.3);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.4);
      } else if (animationType === 'thunder_breathing') {
        // Ultra-sharp lightning snap & speed flash
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(1500, now);
        osc.frequency.exponentialRampToValueAtTime(180, now + 0.2);
        gain.gain.setValueAtTime(0.32, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      } else if (animationType === 'sun_breathing') {
        // Radiant solar chord
        [523.25, 659.25, 783.99, 1046.5].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.05);
          gain.gain.setValueAtTime(0.001, now + idx * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.05 + 0.02);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.05 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.05);
          osc.stop(now + idx * 0.05 + 0.65);
        });
      } else if (animationType === 'kamehameha') {
        // Beam charge & blast release
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.25);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.6);
        gain.gain.setValueAtTime(0.05, now);
        gain.gain.exponentialRampToValueAtTime(0.3, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      } else if (animationType === 'super_saiyan') {
        // High-energy power surge
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(850, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(1250, now + 0.5);
        gain.gain.setValueAtTime(0.01, now);
        gain.gain.exponentialRampToValueAtTime(0.25, now + 0.25);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (animationType === 'spirit_bomb') {
        // Deep cosmic hum & giant orb expansion
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(110, now);
        osc.frequency.exponentialRampToValueAtTime(440, now + 0.4);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.8);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.85);
      } else if (animationType === 'gear_fifth' || animationType === 'gear_joy') {
        // Bouncy joy drumbeats of liberation
        [260, 390, 520, 650].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.2, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.1 + 0.15);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.2);
        });
      } else if (animationType === 'conquerors_haki') {
        // Heavy bass impact & space vibration
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(90, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.4);
        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.65);
      } else if (animationType === 'three_sword_style') {
        // Triple sword slash
        [700, 850, 1000].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(freq, now + idx * 0.08);
          osc.frequency.exponentialRampToValueAtTime(150, now + idx * 0.08 + 0.15);
          gain.gain.setValueAtTime(0.2, now + idx * 0.08);
          gain.gain.exponentialRampToValueAtTime(0.001, now + idx * 0.08 + 0.18);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.08);
          osc.stop(now + idx * 0.08 + 0.2);
        });
      } else if (animationType === 'domain_expansion' || animationType === 'cosmic_meteors') {
        // Ethereal void bell
        [330, 440, 550, 660].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, now + idx * 0.07);
          gain.gain.setValueAtTime(0.001, now + idx * 0.07);
          gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.07 + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.07 + 0.6);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.07);
          osc.stop(now + idx * 0.07 + 0.65);
        });
      } else if (animationType === 'malevolent_shrine') {
        // Rapid slicing slashes
        for (let i = 0; i < 4; i++) {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sawtooth';
          osc.frequency.setValueAtTime(900 - i * 100, now + i * 0.06);
          osc.frequency.exponentialRampToValueAtTime(150, now + i * 0.06 + 0.08);
          gain.gain.setValueAtTime(0.22, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.06 + 0.1);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.12);
        }
      } else if (animationType === 'hollow_bankai') {
        // Dark blade roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(70, now + 0.4);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.5);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.55);
      } else if (
        animationType === 'uchiha_sharingan' ||
        animationType === 'mangekyo_sharingan' ||
        animationType === 'kamui_sharingan'
      ) {
        // Iconic Uchiha Sharingan activation sound
        this.playSharinganSound();
      } else if (animationType === 'amaterasu') {
        // Pitch black fire roar
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(130, now);
        osc.frequency.exponentialRampToValueAtTime(320, now + 0.3);
        osc.frequency.exponentialRampToValueAtTime(60, now + 0.6);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.65);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.7);
      } else if (animationType === 'eight_gates') {
        // Roaring heart pulse + volcanic dragon surge
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(100, now);
        osc.frequency.exponentialRampToValueAtTime(600, now + 0.35);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.65);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.7);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.75);
      } else {
        // Default star chime
        this.playPointChime(8);
      }
    } catch {
      // Ignore
    }
  }

  // Play festive fanfare for badge or trophy
  public playBadgeFanfare() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major fanfare
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + idx * 0.1);

        gain.gain.setValueAtTime(0.001, now + idx * 0.1);
        gain.gain.exponentialRampToValueAtTime(0.25, now + idx * 0.1 + 0.03);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.1 + 0.5);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.1);
        osc.stop(now + idx * 0.1 + 0.55);
      });
    } catch {
      // Ignore
    }
  }

  // Play celebration when student reaches a new level
  public playLevelUpSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [392, 523.25, 659.25, 783.99, 1046.5]; // Sol Do Mi Sol Do (upbeat climb)
      notes.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.09);

        gain.gain.setValueAtTime(0.001, now + idx * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.09 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.09 + 0.45);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.09);
        osc.stop(now + idx * 0.09 + 0.5);
      });
    } catch {
      // Ignore
    }
  }

  // Festive celebration fanfare for milestone unlocks
  public playLevelUpFanfare() {
    this.playLevelUpSound();
    setTimeout(() => {
      this.playBadgeFanfare();
    }, 450);
  }

  // Mystical magical shimmering chime when unlocking characters
  public playUnlockMysterySound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      // Celestial harmonic chord (C, E, G, B, D, G)
      const celestial = [523.25, 659.25, 783.99, 987.77, 1174.66, 1567.98];
      celestial.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.12);

        gain.gain.setValueAtTime(0.001, now + idx * 0.12);
        gain.gain.exponentialRampToValueAtTime(0.22, now + idx * 0.12 + 0.04);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.12 + 0.8);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + idx * 0.12);
        osc.stop(now + idx * 0.12 + 0.85);
      });
    } catch {
      // Ignore
    }
  }

  // Iconic Uchiha Sharingan activation sound (metallic eye chime + genjutsu sub-pulse)
  public playSharinganSound() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // 1. High-frequency piercing eye chime (metallic bell pulse)
      const chimeFreqs = [1240, 1660, 2100];
      chimeFreqs.forEach((freq, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now + idx * 0.04);
        osc.frequency.exponentialRampToValueAtTime(freq * 0.85, now + idx * 0.04 + 0.35);

        gain.gain.setValueAtTime(0.001, now + idx * 0.04);
        gain.gain.exponentialRampToValueAtTime(0.2, now + idx * 0.04 + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.04 + 0.6);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now + idx * 0.04);
        osc.stop(now + idx * 0.04 + 0.65);
      });

      // 2. Deep ocular sub-bass whoosh / pupil focus shockwave
      const bassOsc = ctx.createOscillator();
      const bassGain = ctx.createGain();
      bassOsc.type = 'triangle';
      bassOsc.frequency.setValueAtTime(140, now);
      bassOsc.frequency.exponentialRampToValueAtTime(45, now + 0.5);

      bassGain.gain.setValueAtTime(0.3, now);
      bassGain.gain.exponentialRampToValueAtTime(0.001, now + 0.6);

      bassOsc.connect(bassGain);
      bassGain.connect(ctx.destination);
      bassOsc.start(now);
      bassOsc.stop(now + 0.65);
    } catch {
      // Ignore
    }
  }

  // Play authentic anime character voice callout (Ryōiki Tenkai, Rasengan, Sharingan, etc.)
  public playAnimeVoice(animationType: string = 'rasengan') {
    if (!this.enabled || typeof window === 'undefined') return;

    // 1. Synthesize vocal formant acoustic layer in Web Audio API
    this.playVocalFormantBurst(animationType);

    // 2. Play speech synthesis vocal callout
    if (!('speechSynthesis' in window)) return;

    try {
      window.speechSynthesis.cancel();

      const voiceDef = getAnimeVoiceDef(animationType);
      if (!voiceDef) return;

      const utterance = new SpeechSynthesisUtterance();

      // Retrieve available voices
      const voices =
        this.cachedVoices.length > 0 ? this.cachedVoices : window.speechSynthesis.getVoices();
      if (voices.length > 0 && this.cachedVoices.length === 0) {
        this.cachedVoices = voices;
      }

      // Search for a Japanese voice (native anime pronunciation)
      const jaVoice = voices.find((v) => {
        const lang = (v.lang || '').toLowerCase();
        const name = (v.name || '').toLowerCase();
        return (
          lang.startsWith('ja') ||
          lang.includes('jp') ||
          name.includes('japan') ||
          name.includes('kyoko') ||
          name.includes('otoya')
        );
      });

      if (jaVoice) {
        utterance.voice = jaVoice;
        utterance.lang = 'ja-JP';
        utterance.text = voiceDef.japanese;
      } else {
        // Fallback to energetic phonetic romanization
        utterance.text = voiceDef.romaji;
        utterance.lang = 'en-US';
      }

      utterance.pitch = voiceDef.pitch || 1.1;
      utterance.rate = voiceDef.rate || 1.15;
      utterance.volume = 1.0;

      // Start speech with brief synchronization offset
      setTimeout(() => {
        try {
          window.speechSynthesis.speak(utterance);
        } catch {
          // Ignore
        }
      }, 50);
    } catch {
      // Ignore
    }
  }

  // Synthesize acoustic vocal formant resonances (F1/F2 filters) to give cinematic presence
  private playVocalFormantBurst(animationType: string) {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      // Formant bandpass filters for vocal tract simulation
      const f1 = ctx.createBiquadFilter();
      f1.type = 'bandpass';
      f1.Q.setValueAtTime(5, now);

      const f2 = ctx.createBiquadFilter();
      f2.type = 'bandpass';
      f2.Q.setValueAtTime(6, now);

      // Pitch and formant tuning per move
      if (animationType === 'domain_expansion' || animationType === 'malevolent_shrine') {
        // Ethereal vocal resonance
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.linearRampToValueAtTime(175, now + 0.3);
        f1.frequency.setValueAtTime(450, now);
        f2.frequency.setValueAtTime(1800, now);
      } else if (animationType === 'rasengan' || animationType === 'kamehameha') {
        // Energetic shout formants (vowel "A" -> "O")
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(330, now + 0.35);
        f1.frequency.setValueAtTime(750, now);
        f2.frequency.setValueAtTime(1250, now);
      } else if (
        animationType === 'uchiha_sharingan' ||
        animationType === 'mangekyo_sharingan' ||
        animationType === 'kamui_sharingan'
      ) {
        // Sharp piercing vocal eye breath
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(260, now + 0.25);
        f1.frequency.setValueAtTime(800, now);
        f2.frequency.setValueAtTime(2100, now);
      } else {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(190, now);
        osc.frequency.linearRampToValueAtTime(240, now + 0.25);
        f1.frequency.setValueAtTime(650, now);
        f2.frequency.setValueAtTime(1500, now);
      }

      gain.gain.setValueAtTime(0.001, now);
      gain.gain.exponentialRampToValueAtTime(0.18, now + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.45);

      osc.connect(f1);
      osc.connect(f2);
      f1.connect(gain);
      f2.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.5);
    } catch {
      // Ignore
    }
  }

  // Subtle pop click for button interactions
  public playClickPop() {
    const ctx = this.getContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(600, now);
      osc.frequency.exponentialRampToValueAtTime(300, now + 0.06);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Ignore
    }
  }
}

export const soundManager = new SoundManager();
