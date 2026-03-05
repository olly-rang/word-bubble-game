export type Theme = 'sunny' | 'rainy' | 'night';

class AudioManager {
    private context: AudioContext | null = null;
    private masterGain: GainNode | null = null;
    private activeAmbience: OscillatorNode | AudioBufferSourceNode | null = null;
    private ambienceGain: GainNode | null = null;

    constructor() {
        // AudioContext is initialized on first user interaction to comply with browser policies
    }

    private initContext() {
        if (!this.context) {
            this.context = new (window.AudioContext || (window as any).webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.masterGain.gain.value = 0.8;

            this.ambienceGain = this.context.createGain();
            this.ambienceGain.connect(this.masterGain);
            this.ambienceGain.gain.value = 0.2; // Low background volume
        }
        if (this.context.state === 'suspended') {
            this.context.resume();
        }
    }

    public playPop() {
        this.initContext();
        if (!this.context || !this.masterGain) return;

        const now = this.context.currentTime;

        // 1. Synth Bubble Pop
        // Creating a "thwack/pop" sound using two oscillators
        const osc = this.context.createOscillator();
        const gain = this.context.createGain();

        osc.type = 'sine';
        // Random pitch modulation (0.9x ~ 1.1x) around 400Hz
        const baseFreq = 400;
        const pitchMod = 0.9 + Math.random() * 0.2;
        osc.frequency.setValueAtTime(baseFreq * pitchMod, now);
        // Rapid pitch drop for "pop" effect
        osc.frequency.exponentialRampToValueAtTime(10, now + 0.1);

        gain.gain.setValueAtTime(0, now);
        gain.gain.linearRampToValueAtTime(0.4, now + 0.005);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);

        osc.connect(gain);
        gain.connect(this.masterGain);

        osc.start(now);
        osc.stop(now + 0.15);

        // 2. High-frequency click for texture
        const clickOsc = this.context.createOscillator();
        const clickGain = this.context.createGain();
        clickOsc.type = 'triangle';
        clickOsc.frequency.setValueAtTime(2000 * pitchMod, now);

        clickGain.gain.setValueAtTime(0.1, now);
        clickGain.gain.exponentialRampToValueAtTime(0.01, now + 0.02);

        clickOsc.connect(clickGain);
        clickGain.connect(this.masterGain);

        clickOsc.start(now);
        clickOsc.stop(now + 0.03);
    }

    public async setTheme(theme: Theme) {
        this.initContext();
        if (!this.context || !this.ambienceGain) return;

        const now = this.context.currentTime;

        // Fade out previous ambience
        this.ambienceGain.gain.exponentialRampToValueAtTime(0.001, now + 1.5);

        if (this.activeAmbience) {
            const prev = this.activeAmbience;
            setTimeout(() => {
                try { prev.stop(); prev.disconnect(); } catch (e) { }
            }, 1600);
        }

        setTimeout(() => {
            if (!this.context || !this.ambienceGain) return;
            const freshNow = this.context.currentTime;

            if (theme === 'rainy') {
                // Synthesize "Rain" using white noise
                const bufferSize = 2 * this.context.sampleRate;
                const noiseBuffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
                const output = noiseBuffer.getChannelData(0);
                for (let i = 0; i < bufferSize; i++) {
                    output[i] = Math.random() * 2 - 1;
                }

                const whiteNoise = this.context.createBufferSource();
                whiteNoise.buffer = noiseBuffer;
                whiteNoise.loop = true;

                // High-pass filter for rain-like sizzle
                const filter = this.context.createBiquadFilter();
                filter.type = 'lowpass';
                filter.frequency.setValueAtTime(1000, freshNow);

                whiteNoise.connect(filter);
                filter.connect(this.ambienceGain!);
                whiteNoise.start(freshNow);
                this.activeAmbience = whiteNoise;
                this.ambienceGain.gain.exponentialRampToValueAtTime(0.05, freshNow + 2);
            } else if (theme === 'night') {
                // Subtle low hum for night
                const osc = this.context.createOscillator();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(60, freshNow);
                osc.connect(this.ambienceGain!);
                osc.start(freshNow);
                this.activeAmbience = osc;
                this.ambienceGain.gain.exponentialRampToValueAtTime(0.02, freshNow + 2);
            } else {
                // Sunny: Just clean silence or very subtle bird-like chirps (optional)
                this.activeAmbience = null;
                this.ambienceGain.gain.exponentialRampToValueAtTime(0.001, freshNow + 2);
            }
        }, 1600);
    }
}

export const audioManager = new AudioManager();
