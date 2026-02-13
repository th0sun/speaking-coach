class AudioAnalyzer {
    constructor() {
        this.audioContext = null;
        this.analyser = null;
        this.source = null;
        this.dataArray = null;
        this.isAnalyzing = false;
        this.stats = {
            volume: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
            pitch: { min: Infinity, max: -Infinity, sum: 0, count: 0 }
        };
        this.animationFrame = null;
    }

    start(stream) {
        try {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            this.audioContext = new AudioContext();
            this.analyser = this.audioContext.createAnalyser();
            this.source = this.audioContext.createMediaStreamSource(stream);
            this.source.connect(this.analyser);

            this.analyser.fftSize = 2048;
            this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);

            this.isAnalyzing = true;
            this.resetStats();
            this.analyze();

            console.log("🔊 Audio Analyzer started");
        } catch (e) {
            console.error("❌ Failed to start Audio Analyzer:", e);
        }
    }

    resetStats() {
        this.stats = {
            volume: { min: Infinity, max: -Infinity, sum: 0, count: 0 },
            pitch: { min: Infinity, max: -Infinity, sum: 0, count: 0 }
        };
    }

    analyze() {
        if (!this.isAnalyzing) return;
        this.animationFrame = requestAnimationFrame(() => this.analyze());

        this.analyser.getByteTimeDomainData(this.dataArray);

        // --- Calculate Volume (RMS) ---
        let sum = 0;
        for (let i = 0; i < this.dataArray.length; i++) {
            const x = (this.dataArray[i] - 128) / 128.0;
            sum += x * x;
        }
        const rms = Math.sqrt(sum / this.dataArray.length);
        const db = 20 * Math.log10(rms + 1e-10); // dB

        // Update Volume stats
        // Filter out extreme silence (e.g. < -60dB) to avoid skewing averages too much, 
        // but capture normal silence
        if (isFinite(db) && db > -100) {
            this.stats.volume.max = Math.max(this.stats.volume.max, db);
            this.stats.volume.min = Math.min(this.stats.volume.min, db);
            this.stats.volume.sum += db;
            this.stats.volume.count++;
        }

        // --- Simple Pitch Estimation (Zero Crossing Rate) ---
        // This is a very rough estimation but enough for "high/low" voice detection
        let zeroCrossings = 0;
        for (let i = 1; i < this.dataArray.length; i++) {
            if ((this.dataArray[i] - 128) > 0 && (this.dataArray[i - 1] - 128) <= 0) {
                zeroCrossings++;
            }
        }
        const nyquist = this.audioContext.sampleRate / 2;
        // This simple formula needs checking, but for ZCR usage:
        // pitch ~= sampleRate * (zeroCrossings / bufferLength)
        // Note: ZCR is not accurate for complex speech pitch, but gives relative frequency
        const estimatedPitch = (zeroCrossings / this.dataArray.length) * (this.audioContext.sampleRate / 2);

        if (estimatedPitch > 50 && estimatedPitch < 1000) { // Human voice range filter
            this.stats.pitch.max = Math.max(this.stats.pitch.max, estimatedPitch);
            this.stats.pitch.min = Math.min(this.stats.pitch.min, estimatedPitch);
            this.stats.pitch.sum += estimatedPitch;
            this.stats.pitch.count++;
        }
    }

    stop() {
        this.isAnalyzing = false;
        if (this.animationFrame) cancelAnimationFrame(this.animationFrame);

        if (this.audioContext) {
            // this.audioContext.close(); // Optional: keeps context alive or close it
            this.audioContext = null;
        }
        console.log("🔇 Audio Analyzer stopped");
    }

    getStats() {
        // Calculate averages
        const volAvg = this.stats.volume.count ? (this.stats.volume.sum / this.stats.volume.count) : -100;
        const pitchAvg = this.stats.pitch.count ? (this.stats.pitch.sum / this.stats.pitch.count) : 0;

        return {
            volume: {
                avg: volAvg.toFixed(1),
                max: this.stats.volume.max !== -Infinity ? this.stats.volume.max.toFixed(1) : -100,
                min: this.stats.volume.min !== Infinity ? this.stats.volume.min.toFixed(1) : -100
            },
            pitch: {
                avg: pitchAvg.toFixed(0),
                max: this.stats.pitch.max !== -Infinity ? this.stats.pitch.max.toFixed(0) : 0,
                min: this.stats.pitch.min !== Infinity ? this.stats.pitch.min.toFixed(0) : 0
            }
        };
    }
}

// Expose to window
window.AudioAnalyzer = AudioAnalyzer;
