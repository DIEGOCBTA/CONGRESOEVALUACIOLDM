/**
 * Immersive Audio System: Restored & Refined
 * - Ethereal Drone (Restored)
 * - Celestial Click
 * - Soft Wind Swipe (Simple & Gentle)
 */

window.AudioSystem = class AudioSystem {
    constructor() {
        this.ctx = null;
        this.isMuted = true;
        this.masterGain = null;
        this.buffers = {};
        this.droneSource = null;
        this.droneGain = null;
        this.bgMusicBuffer = null;
        this.bgMusicSource = null;
        this.bgMusicGain = null;
    }

    async loadBackgroundMusic() {
        if (this.bgMusic) return;
        console.log('--- AUDIO SYSTEM: Manual Setup for eulogy.mp3 ---');
        try {
            this.bgMusic = new Audio('./eulogy.mp3');
            this.bgMusic.loop = true;
            this.bgMusic.volume = 0;
            this.bgMusic.preload = 'auto';

            this.bgMusic.addEventListener('play', () => console.log('--- AUDIO: Play event detected ---'));
            this.bgMusic.addEventListener('error', (e) => console.error('--- AUDIO ERROR ---', e));
        } catch (e) {
            console.error('--- AUDIO SETUP FAILED ---', e);
        }
    }

    async startBackgroundMusic() {
        if (!this.bgMusic) await this.loadBackgroundMusic();

        console.log('--- AUDIO: Executing Play ---');
        try {
            if (this.ctx && this.ctx.state === 'suspended') await this.ctx.resume();

            if (this.isMuted) return; // Silent if muted
            this.bgMusic.volume = 0;
            const playPromise = this.bgMusic.play();

            if (playPromise !== undefined) {
                playPromise.then(() => {
                    console.log('--- AUDIO: Playing eulogy.mp3 ---');
                    this.fadeBackgroundMusic(0.75, 2000);
                }).catch(err => {
                    console.error('--- AUDIO: Playback blocked ---', err);
                });
            }
        } catch (err) {
            console.error('--- AUDIO: Critical Play Error ---', err);
        }
    }

    fadeBackgroundMusic(targetVol, duration = 1000) {
        if (!this.bgMusic) return;

        const startVol = this.bgMusic.volume;
        const steps = 20;
        const volStep = (targetVol - startVol) / steps;
        const intervalTime = duration / steps;

        let currentStep = 0;
        if (this.fadeInterval) clearInterval(this.fadeInterval);

        this.fadeInterval = setInterval(() => {
            currentStep++;
            let newVol = startVol + (volStep * currentStep);

            if (newVol > 1) newVol = 1;
            if (newVol < 0) newVol = 0;

            this.bgMusic.volume = newVol;

            if (currentStep >= steps) {
                this.bgMusic.volume = targetVol;
                clearInterval(this.fadeInterval);
            }
        }, intervalTime);
    }

    stopBackgroundMusic() {
        console.log('--- AUDIO: Stopping ---');
        if (this.bgMusic) {
            this.fadeBackgroundMusic(0, 1000);
            setTimeout(() => {
                if (this.isMuted) this.bgMusic.pause();
            }, 1100);
        }
    }

    // --- SOUND GENERATION (Pre-rendered) ---

    // 1. CELESTIAL CLICK
    async generateCelestialClick() {
        const length = this.ctx.sampleRate * 2.0;
        const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
        const L = buffer.getChannelData(0);
        const R = buffer.getChannelData(1);

        // Sharp transient
        for (let i = 0; i < 400; i++) {
            const vol = 1 - (i / 400);
            const sig = Math.random() * vol * 0.5;
            L[i] += sig;
            R[i] += sig;
        }

        // Echo Tail (Simulated delays)
        const delays = [2000, 4000, 6000, 8000, 12000, 16000];
        for (let d of delays) {
            for (let i = 0; i < length - d; i++) {
                if (i < 400) {
                    const val = (Math.random() * 0.1);
                    const decay = Math.exp(-(i + d) / 10000);
                    L[i + d] += val * decay;
                    R[i + d + 50] += val * decay;
                }
            }
        }

        // Sine Ping
        for (let i = 0; i < 4000; i++) {
            const freq = 2000;
            const t = i / this.ctx.sampleRate;
            const sine = Math.sin(t * freq * 2 * Math.PI) * Math.exp(-t * 20);
            L[i] += sine * 0.1;
            R[i] += sine * 0.1;
        }
        this.buffers.click = buffer;
    }

    // 2. SOFT WIND SWIPE (Gentle, fixed buffer)
    async generateSoftWind() {
        // 0.6 seconds of smooth air
        const length = this.ctx.sampleRate * 0.6;
        const buffer = this.ctx.createBuffer(1, length, this.ctx.sampleRate);
        const D = buffer.getChannelData(0);

        // Brown/Pink Noise hybrid for softness
        let lastOut = 0;
        for (let i = 0; i < length; i++) {
            const white = Math.random() * 2 - 1;
            lastOut = (lastOut + (0.05 * white)) / 1.05;
            D[i] = lastOut * 2.0;
        }

        // Smooth Bell Curve Envelope
        for (let i = 0; i < length; i++) {
            const t = i / length;
            let vol = 0;
            if (t < 0.3) {
                vol = Math.sin((t / 0.3) * (Math.PI / 2));
            } else {
                const fallT = (t - 0.3) / 0.7;
                vol = Math.cos(fallT * (Math.PI / 2));
            }
            D[i] *= vol * 0.1; // Low volume
        }
        this.buffers.wind = buffer;
    }

    // --- SECTIONAL AMBIENT SOUNDS (Celestial) ---
    generateSectionAmbients() {
        // Define chord variations for each major page section and modal
        const sections = {
            hero: [260, 390, 520, 650],
            about: [220, 330, 440, 550],
            "speakers-gallery": [180, 270, 360, 450],
            speakers: [200, 300, 400, 500],
            experience: [240, 360, 480, 600],
            faq: [210, 315, 420, 525],
            "cta-section": [250, 375, 500, 625],
            footer: [130, 195, 260, 325],
            badge: [300, 420, 540, 660] // credential/modal ambient
        };
        Object.keys(sections).forEach(name => {
            const freqs = sections[name];
            const length = this.ctx.sampleRate * 4; // 4 s loop
            const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
            const L = buffer.getChannelData(0);
            const R = buffer.getChannelData(1);
            for (let i = 0; i < length; i++) {
                const t = i / this.ctx.sampleRate;
                let sample = 0;
                freqs.forEach(f => {
                    sample += Math.sin(t * f * 2 * Math.PI) * 0.03;
                    sample += Math.sin(t * (f * 1.01) * 2 * Math.PI) * 0.03;
                });
                const env = (i < 1000) ? i / 1000 : (i > length - 1000) ? (length - i) / 1000 : 1;
                L[i] = sample * env;
                R[i] = sample * env;
            }
            this.buffers[`ambient_${name}`] = buffer;
        });
    }

    playSectionAmbient(section) {
        if (this.isMuted || !this.ctx) return;
        const buffer = this.buffers[`ambient_${section}`];
        if (!buffer) return; // no ambient for this section

        // Create new source & gain
        const newSrc = this.ctx.createBufferSource();
        newSrc.buffer = buffer;
        newSrc.loop = true;
        const newGain = this.ctx.createGain();
        newGain.gain.setValueAtTime(0, this.ctx.currentTime); // start silent
        newSrc.connect(newGain);
        newGain.connect(this.masterGain);
        newSrc.start();

        // Fade‑in new ambient
        newGain.gain.linearRampToValueAtTime(0.2, this.ctx.currentTime + 2.0); // 2 s fade‑in

        // Fade‑out and stop previous ambient if exists
        if (this.ambientSource && this.ambientGain) {
            const oldGain = this.ambientGain;
            const oldSrc = this.ambientSource;
            // Fade out over 2 s
            oldGain.gain.cancelScheduledValues(this.ctx.currentTime);
            oldGain.gain.setValueAtTime(oldGain.gain.value, this.ctx.currentTime);
            oldGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 2.0);
            // Stop after fade‑out
            setTimeout(() => {
                oldSrc.stop();
                oldSrc.disconnect();
                oldGain.disconnect();
            }, 2100);
        }

        // Store references for next transition
        this.ambientSource = newSrc;
        this.ambientGain = newGain;
        this.currentSection = section;
    }

    // Detect current page section on scroll and switch ambient
    monitorSectionChanges() {
        const sections = document.querySelectorAll('section[id]');
        if (!sections.length) return;
        const check = () => {
            let best = null;
            let bestVisible = 0;
            const viewportHeight = window.innerHeight;
            sections.forEach(sec => {
                const rect = sec.getBoundingClientRect();
                const visible = Math.max(0, Math.min(rect.bottom, viewportHeight) - Math.max(rect.top, 0));
                if (visible > bestVisible) {
                    bestVisible = visible;
                    best = sec.id;
                }
            });
            if (best && best !== this.currentSection) {
                this.playSectionAmbient(best);
            }
        };
        window.addEventListener('scroll', () => {
            clearTimeout(this.sectionTimeout);
            this.sectionTimeout = setTimeout(check, 200);
        }, { passive: true });
        // Initial check on load
        check();
    }

    init() {
        if (this.ctx) return;
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();

        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.5;
        this.masterGain.connect(this.ctx.destination);

        // Generate all needed buffers
        this.generateCelestialClick();
        this.generateSoftWind();
        this.generateEtherealDrone();
        this.generateSectionAmbients();
        this.loadBackgroundMusic(); // Load the new background audio

        // Start ambient for the initial section (monitor will call playSectionAmbient)
        this.monitorSectionChanges();

        // Listen for badge modal open to switch to "badge" ambient
        const badgeBtn = document.getElementById('open-badge-modal');
        if (badgeBtn) {
            badgeBtn.addEventListener('click', () => {
                this.playSectionAmbient('badge');
            });
        }
    }

    // 3. ETHEREAL DRONE (Restored)
    async generateEtherealDrone() {
        const length = this.ctx.sampleRate * 4; // 4s loop
        const buffer = this.ctx.createBuffer(2, length, this.ctx.sampleRate);
        const L = buffer.getChannelData(0);
        const R = buffer.getChannelData(1);

        // Frequencies for a suspended chord
        const freqs = [220, 329.63, 440, 554.37];

        for (let i = 0; i < length; i++) {
            let sample = 0;
            const t = i / this.ctx.sampleRate;

            freqs.forEach(f => {
                // Additive synthesis
                sample += Math.sin(t * f * 2 * Math.PI) * 0.05;
                sample += Math.sin(t * (f * 1.01) * 2 * Math.PI) * 0.05;
            });

            // Smooth edges for looping
            const envelope = (i < 1000) ? i / 1000 : (i > length - 1000) ? (length - i) / 1000 : 1;

            L[i] = sample * envelope;
            R[i] = sample * envelope;
        }
        this.buffers.drone = buffer;
    }

    // --- PLAYBACK ---
    toggle() {
        if (!this.ctx) this.init();
        if (this.ctx.state === 'suspended') this.ctx.resume();
        this.isMuted = !this.isMuted;

        if (!this.isMuted) {
            this.startBackgroundMusic(); // Play eulogy.mp3
            this.playClick();
            if (this.currentSection) this.playSectionAmbient(this.currentSection);
            return true;
        } else {
            this.stopBackgroundMusic();
            // Stop ambient sounds
            if (this.ambientSource) {
                this.ambientSource.stop();
                this.ambientSource = null;
            }
            return false;
        }
    }

    playClick() {
        if (this.isMuted || !this.buffers.click) return;
        const src = this.ctx.createBufferSource();
        src.buffer = this.buffers.click;
        src.connect(this.masterGain);
        src.start();
    }

    // --- CONTINUOUS WIND FOR SCROLL ---
    startWindLoop() {
        if (this.isMuted || !this.buffers.wind) return;
        if (this.windPlaying) return; // already playing, do nothing
        this.windPlaying = true;

        this.windSource = this.ctx.createBufferSource();
        this.windSource.buffer = this.buffers.wind;
        this.windSource.loop = false; // play once, no repeat

        this.windGain = this.ctx.createGain();
        this.windGain.gain.setValueAtTime(0, this.ctx.currentTime);
        // Fade‑in (0.5 s) for a smooth onset
        this.windGain.gain.linearRampToValueAtTime(1.0, this.ctx.currentTime + 0.5);

        this.windSource.connect(this.windGain);
        this.windGain.connect(this.masterGain);
        this.windSource.start();
    }

    stopWindLoop() {
        if (!this.windPlaying) return;
        // Fade‑out (0.5 s) then stop
        const now = this.ctx.currentTime;
        this.windGain.gain.cancelScheduledValues(now);
        this.windGain.gain.setValueAtTime(this.windGain.gain.value, now);
        this.windGain.gain.linearRampToValueAtTime(0, now + 0.5);

        const src = this.windSource;
        const gain = this.windGain;
        // Cleanup after fade‑out
        setTimeout(() => {
            src.stop();
            src.disconnect();
            gain.disconnect();
        }, 600);
        this.windSource = null;
        this.windGain = null;
        this.windPlaying = false;
    }

    // Legacy support (unused now)
    playShutter() { this.startWindLoop(); setTimeout(() => this.stopWindLoop(), 200); }
    playDynamicWind(x) { this.startWindLoop(); }

    startDrone() {
        if (this.isMuted || this.droneSource) return;
        if (!this.buffers.drone) return;

        this.droneSource = this.ctx.createBufferSource();
        this.droneSource.buffer = this.buffers.drone;
        this.droneSource.loop = true;

        this.droneGain = this.ctx.createGain();
        this.droneGain.gain.value = 0;

        this.droneSource.connect(this.droneGain);
        this.droneGain.connect(this.masterGain);
        this.droneSource.start();

        // Fade in
        this.droneGain.gain.linearRampToValueAtTime(0.3, this.ctx.currentTime + 3);
    }

    stopDrone() {
        if (this.droneSource) {
            this.droneGain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 1);
            setTimeout(() => {
                if (this.droneSource) this.droneSource.stop();
                this.droneSource = null;
            }, 1000);
        }
    }
};

window.audioSys = new window.AudioSystem();

const AUDIO_ON_SVG = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144.000000 144.000000" preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,144.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"> <path d="M700 1257 c-14 -12 -47 -40 -75 -62 -27 -22 -66 -53 -86 -70 -19 -16 -63 -52 -97 -80 -34 -27 -62 -53 -62 -57 0 -4 7 -14 16 -23 15 -15 18 -14 43 1 14 10 31 23 36 29 6 6 30 27 55 46 25 18 73 58 108 87 75 62 96 64 100 7 1 -22 9 -83 17 -136 20 -127 20 -439 0 -573 -8 -55 -16 -119 -17 -141 -4 -57 -25 -55 -100 7 -35 30 -91 75 -125 101 -34 26 -85 70 -112 96 l-51 49 -2 204 -3 203 -124 3 -123 3 -39 -41 -39 -41 0 -161 0 -161 40 -39 41 -38 110 0 c110 0 112 0 153 -32 22 -18 43 -35 46 -38 5 -6 76 -63 209 -170 31 -24 67 -54 81 -67 41 -38 60 -27 80 47 66 242 67 709 4 985 -22 91 -39 104 -84 62z"/> <path d="M1227 1183 c-10 -10 -8 -51 2 -57 10 -6 39 -68 60 -126 48 -133 63 -319 36 -444 -9 -45 -24 -99 -32 -121 -36 -95 -48 -121 -61 -137 -20 -24 -12 -62 15 -66 18 -3 27 9 55 70 44 93 58 132 69 188 5 25 13 63 18 85 6 22 11 83 11 135 0 52 -5 113 -11 135 -5 22 -13 60 -18 85 -19 97 -94 260 -120 260 -10 0 -21 -3 -24 -7z"/> <path d="M1083 1054 c-3 -8 -1 -25 4 -37 95 -206 95 -408 0 -614 -25 -54 28 -74 54 -20 77 155 99 338 59 488 -23 88 -45 152 -62 179 -15 24 -46 26 -55 4z"/> <path d="M945 940 c-7 -12 0 -56 21 -118 18 -55 18 -169 0 -224 -27 -80 -30 -117 -11 -124 9 -4 23 0 31 8 23 23 54 152 54 228 0 71 -29 200 -51 226 -13 16 -35 18 -44 4z"/> </g> </svg>`;
const AUDIO_OFF_SVG = `<svg version="1.0" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 144.000000 144.000000" preserveAspectRatio="xMidYMid meet"> <g transform="translate(0.000000,144.000000) scale(0.100000,-0.100000)" fill="currentColor" stroke="none"> <path d="M147 1273 c-4 -3 -7 -14 -7 -22 0 -9 142 -158 315 -331 l316 -315 -7 -90 c-3 -49 -10 -108 -15 -130 -5 -22 -9 -57 -9 -77 0 -46 -8 -68 -26 -68 -8 0 -42 24 -76 53 -35 29 -90 74 -123 100 -33 26 -85 67 -115 91 l-55 45 -111 1 c-102 0 -112 2 -132 23 -20 22 -22 33 -22 158 0 129 1 137 24 158 21 19 32 22 102 19 l79 -3 5 -145 5 -145 25 0 25 0 0 175 0 175 -122 3 -122 3 -41 -41 -40 -40 0 -162 0 -161 40 -39 41 -38 110 0 c110 0 112 0 153 -32 22 -18 43 -35 46 -38 3 -4 30 -26 61 -51 116 -92 205 -164 229 -186 14 -13 33 -22 44 -21 27 4 50 89 66 246 8 76 18 136 24 138 6 2 113 -97 236 -221 162 -163 231 -225 245 -223 57 8 32 36 -551 619 -319 319 -586 579 -595 579 -9 0 -19 -3 -22 -7z"/> <path d="M700 1257 c-14 -13 -50 -42 -80 -66 -102 -80 -120 -99 -120 -126 0 -41 28 -30 118 45 46 39 89 70 97 70 16 0 20 -15 30 -100 3 -30 10 -86 15 -125 5 -38 9 -96 10 -128 0 -58 0 -58 28 -55 26 3 27 6 30 63 2 33 -2 96 -8 140 -6 44 -14 100 -16 125 -3 25 -12 72 -21 105 -23 82 -40 92 -83 52z"/> <path d="M1227 1183 c-11 -10 -8 -51 4 -58 10 -7 14 -15 51 -110 31 -80 58 -221 58 -305 0 -86 -27 -227 -60 -310 -12 -30 -25 -68 -27 -83 -5 -26 -3 -28 22 -25 23 3 31 13 56 72 58 137 87 369 58 481 -5 22 -13 60 -18 85 -19 97 -94 260 -120 260 -10 0 -21 -3 -24 -7z"/> <path d="M1083 1054 c-3 -8 -1 -25 4 -37 75 -161 91 -322 49 -479 -15 -56 -20 -92 -14 -102 12 -21 31 -20 45 3 23 37 53 188 53 269 0 102 -42 278 -82 342 -15 24 -46 26 -55 4z"/> <path d="M944 937 c-4 -13 0 -37 28 -142 5 -22 8 -79 5 -127 -4 -67 -2 -89 8 -98 51 -42 73 136 35 279 -11 40 -25 80 -31 87 -15 18 -38 18 -45 1z"/> </g> </svg>`;

document.addEventListener('DOMContentLoaded', () => {
    const toggleBtn = document.getElementById('audio-toggle-btn');
    if (toggleBtn) {
        // Init icon
        const btnIcon = toggleBtn.querySelector('.btn-icon');
        if (btnIcon) btnIcon.innerHTML = AUDIO_OFF_SVG;

        toggleBtn.addEventListener('click', () => {
            if (!window.audioSys.ctx) window.audioSys.init();

            const active = window.audioSys.toggle();

            if (active) {
                toggleBtn.classList.add('active');
                if (btnIcon) btnIcon.innerHTML = AUDIO_ON_SVG;
            } else {
                toggleBtn.classList.remove('active');
                if (btnIcon) btnIcon.innerHTML = AUDIO_OFF_SVG;
            }
        });
    }

    // Global Click Listener
    document.addEventListener('click', (e) => {
        if (!window.audioSys || window.audioSys.isMuted) return;
        if (e.target.closest('button') || e.target.closest('a') || e.target.closest('.card')) {
            window.audioSys.playClick();
        }
    });
});
