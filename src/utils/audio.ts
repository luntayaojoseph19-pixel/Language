// Web Audio API Sound Synthesizer & Speech Engine

class SoundEffects {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
  }

  playCorrect() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      
      const osc1 = this.ctx.createOscillator();
      const osc2 = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc1.type = 'triangle';
      osc2.type = 'sine';

      osc1.frequency.setValueAtTime(523.25, now); // C5
      osc1.frequency.exponentialRampToValueAtTime(659.25, now + 0.1); // E5
      osc1.frequency.exponentialRampToValueAtTime(783.99, now + 0.2); // G5
      osc1.frequency.exponentialRampToValueAtTime(1046.50, now + 0.3); // C6

      osc2.frequency.setValueAtTime(261.63, now); // C4
      osc2.frequency.exponentialRampToValueAtTime(523.25, now + 0.3);

      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.45);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(this.ctx.destination);

      osc1.start(now);
      osc2.start(now);
      osc1.stop(now + 0.45);
      osc2.stop(now + 0.45);
    } catch {}
  }

  playWrong() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(120, now + 0.25);

      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.28);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.28);
    } catch {}
  }

  playStreak() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const notes = [440, 554.37, 659.25, 880]; // A major

      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        const start = now + idx * 0.08;

        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, start);

        gain.gain.setValueAtTime(0.15, start);
        gain.gain.exponentialRampToValueAtTime(0.001, start + 0.25);

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.start(start);
        osc.stop(start + 0.25);
      });
    } catch {}
  }

  playClick() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.04);

      gain.gain.setValueAtTime(0.08, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      osc.start(now);
      osc.stop(now + 0.05);
    } catch {}
  }

  playLevelUp() {
    try {
      this.initCtx();
      if (!this.ctx) return;
      const now = this.ctx.currentTime;
      const chords = [
        [523.25, 659.25, 783.99], // C major
        [587.33, 739.99, 880.00], // D major
        [659.25, 830.61, 987.77], // E major
        [1046.50, 1318.51, 1567.98] // C6 major
      ];

      chords.forEach((chord, i) => {
        chord.forEach(freq => {
          if (!this.ctx) return;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();
          const start = now + i * 0.12;
          const dur = i === chords.length - 1 ? 0.6 : 0.2;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, start);

          gain.gain.setValueAtTime(0.08, start);
          gain.gain.exponentialRampToValueAtTime(0.001, start + dur);

          osc.connect(gain);
          gain.connect(this.ctx.destination);

          osc.start(start);
          osc.stop(start + dur);
        });
      });
    } catch {}
  }
}

export const sound = new SoundEffects();

// Speech Synthesis
let cachedVoices: SpeechSynthesisVoice[] = [];
let voicesLoaded = false;

function loadVoices() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      cachedVoices = window.speechSynthesis.getVoices();
      if (cachedVoices.length > 0) voicesLoaded = true;
      window.speechSynthesis.onvoiceschanged = () => {
        cachedVoices = window.speechSynthesis.getVoices();
        voicesLoaded = true;
      };
    } catch {}
  }
}

loadVoices();

export function stopSpeaking() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    try {
      window.speechSynthesis.cancel();
    } catch {}
  }
}

export function speakPhrase(
  phrase: string,
  voiceCode: string = 'en-US',
  rate: number = 0.95,
  onEnd?: () => void
) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    onEnd?.();
    return;
  }

  try {
    window.speechSynthesis.cancel();

    // Clean brackets/phonetics from spoken text
    const cleanText = phrase
      .replace(/\[.*?\]/g, '')
      .replace(/\(.*?\)/g, '')
      .trim();

    if (!cleanText) {
      onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.rate = rate;
    utterance.pitch = 1.0;
    utterance.lang = voiceCode;

    if (!voicesLoaded) {
      cachedVoices = window.speechSynthesis.getVoices();
    }

    if (cachedVoices.length > 0) {
      const codeClean = voiceCode.toLowerCase().replace('_', '-');
      const langPrefix = codeClean.split('-')[0];

      // Exact match
      let match = cachedVoices.find(v => v.lang.toLowerCase().replace('_', '-') === codeClean);
      // Prefix match
      if (!match) {
        match = cachedVoices.find(v => v.lang.toLowerCase().startsWith(langPrefix));
      }
      if (match) {
        utterance.voice = match;
      }
    }

    utterance.onend = () => {
      onEnd?.();
    };

    utterance.onerror = () => {
      onEnd?.();
    };

    window.speechSynthesis.speak(utterance);
  } catch (err) {
    console.warn('Speech synthesis error:', err);
    onEnd?.();
  }
}

// Live Speech Recognition & Microphone Stream Analyzer with Audio Recording
interface SpeechRecognitionOptions {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError?: (error: string, code?: 'denied' | 'no-speech' | 'network' | 'unsupported') => void;
  onEnd?: () => void;
  onAudioRecorded?: (audioUrl: string) => void;
}

export class SpeechManager {
  private recognition: any = null;
  private audioContext: AudioContext | null = null;
  private analyser: AnalyserNode | null = null;
  private micStream: MediaStream | null = null;
  private mediaRecorder: MediaRecorder | null = null;
  private recordedChunks: Blob[] = [];
  public lastAudioUrl: string | null = null;
  public isListening = false;

  async checkPermission(): Promise<'granted' | 'denied' | 'prompt'> {
    if (typeof navigator === 'undefined' || !navigator.permissions) return 'prompt';
    try {
      const res = await navigator.permissions.query({ name: 'microphone' as PermissionName });
      return res.state;
    } catch {
      return 'prompt';
    }
  }

  async initAudioVisualizer(): Promise<AnalyserNode | null> {
    try {
      if (typeof window === 'undefined') return null;
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return null;

      this.audioContext = new AudioCtx();
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }

      if (!this.micStream) {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      }
      
      const source = this.audioContext.createMediaStreamSource(this.micStream);
      this.analyser = this.audioContext.createAnalyser();
      this.analyser.fftSize = 64;
      source.connect(this.analyser);
      return this.analyser;
    } catch (err: any) {
      console.warn('Visualizer init failed:', err);
      return null;
    }
  }

  async startListening(voiceCode: string, options: SpeechRecognitionOptions): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      options.onError?.('Speech recognition is not supported in this browser. Please use Chrome, Edge, or Safari.', 'unsupported');
      return false;
    }

    try {
      this.stopListening();

      // Acquire media stream for both visualizer and recorder
      try {
        this.micStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: false });
      } catch (mediaErr: any) {
        if (mediaErr.name === 'NotAllowedError' || mediaErr.name === 'PermissionDeniedError') {
          options.onError?.('Microphone access was denied. Please allow microphone permissions in your browser address bar settings.', 'denied');
          return false;
        }
        options.onError?.(`Microphone error: ${mediaErr.message || 'Cannot access mic'}`, 'unsupported');
        return false;
      }

      // Start MediaRecorder if supported
      this.recordedChunks = [];
      if (typeof MediaRecorder !== 'undefined' && this.micStream) {
        try {
          this.mediaRecorder = new MediaRecorder(this.micStream);
          this.mediaRecorder.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) {
              this.recordedChunks.push(e.data);
            }
          };
          this.mediaRecorder.onstop = () => {
            if (this.recordedChunks.length > 0) {
              const blob = new Blob(this.recordedChunks, { type: 'audio/webm' });
              if (this.lastAudioUrl) {
                URL.revokeObjectURL(this.lastAudioUrl);
              }
              this.lastAudioUrl = URL.createObjectURL(blob);
              options.onAudioRecorded?.(this.lastAudioUrl);
            }
          };
          this.mediaRecorder.start();
        } catch (recErr) {
          console.warn('MediaRecorder error:', recErr);
        }
      }

      this.recognition = new SpeechRec();
      this.recognition.continuous = false;
      this.recognition.interimResults = true;
      this.recognition.lang = voiceCode || 'en-US';

      this.recognition.onresult = (event: any) => {
        let transcript = '';
        let isFinal = false;

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          transcript += event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            isFinal = true;
          }
        }
        options.onResult(transcript, isFinal);
      };

      this.recognition.onerror = (e: any) => {
        const errType = e.error;
        let msg = 'Speech recognition error';
        let code: 'denied' | 'no-speech' | 'network' | 'unsupported' = 'unsupported';

        if (errType === 'not-allowed') {
          msg = 'Microphone permission blocked. Please enable it in browser settings.';
          code = 'denied';
        } else if (errType === 'no-speech') {
          msg = 'No speech was detected. Please check your mic volume and try again.';
          code = 'no-speech';
        } else if (errType === 'network') {
          msg = 'Network connection issue with voice recognition service.';
          code = 'network';
        }

        options.onError?.(msg, code);
      };

      this.recognition.onend = () => {
        this.isListening = false;
        if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
          try { this.mediaRecorder.stop(); } catch {}
        }
        options.onEnd?.();
      };

      this.recognition.start();
      this.isListening = true;
      return true;
    } catch (err: any) {
      console.warn('SpeechRecognition start failed:', err);
      options.onError?.(err?.message || 'Could not start mic');
      return false;
    }
  }

  stopListening() {
    if (this.mediaRecorder && this.mediaRecorder.state !== 'inactive') {
      try {
        this.mediaRecorder.stop();
      } catch {}
      this.mediaRecorder = null;
    }

    if (this.recognition) {
      try {
        this.recognition.abort();
      } catch {}
      this.recognition = null;
    }

    if (this.micStream) {
      this.micStream.getTracks().forEach(t => t.stop());
      this.micStream = null;
    }

    if (this.audioContext && this.audioContext.state !== 'closed') {
      try {
        this.audioContext.close();
      } catch {}
      this.audioContext = null;
    }

    this.analyser = null;
    this.isListening = false;
  }

  playRecordedAudio(audioUrl?: string, onEnd?: () => void) {
    const url = audioUrl || this.lastAudioUrl;
    if (!url) {
      onEnd?.();
      return;
    }
    const audio = new Audio(url);
    audio.onended = () => onEnd?.();
    audio.onerror = () => onEnd?.();
    audio.play().catch(() => onEnd?.());
  }
}

export const speechManager = new SpeechManager();
