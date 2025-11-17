// Melodic Dictation Ear Training App
// Audio generation and game logic

class MelodicDictation {
    constructor() {
        this.audioContext = null;
        this.currentKey = 'Bb';
        this.currentInstrument = 'piano';
        this.cadenceType = 'i-iv-v'; // Default cadence
        this.melodyLength = 4;
        this.numQuestions = 10;
        this.maxInterval = 12; // Default to 12 semitones (octave)
        this.currentMelody = [];
        this.userAnswer = [];
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.sampler = null;
        this.instrumentLoaded = false;

        // Note frequencies (C4 = middle C)
        this.baseFrequencies = {
            'C': 261.63,
            'Db': 277.18,
            'D': 293.66,
            'Eb': 311.13,
            'E': 329.63,
            'F': 349.23,
            'Gb': 369.99,
            'G': 392.00,
            'Ab': 415.30,
            'A': 440.00,
            'Bb': 466.16,
            'B': 493.88
        };
        
        // Chromatic scale intervals (all 12 semitones from root)
        this.chromaticIntervals = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11];

        // Instrument mapping to soundfont names
        this.instrumentMap = {
            'piano': 'acoustic_grand_piano',
            'electric-piano': 'electric_piano_1',
            'acoustic-guitar': 'acoustic_guitar_nylon',
            'electric-guitar': 'electric_guitar_clean',
            'acoustic-bass': 'acoustic_bass',
            'electric-bass': 'electric_bass_finger'
        };

        // Note names for each key (all 12 chromatic notes with enharmonic spellings)
        this.keySignatures = {
            'C': ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B'],
            'Db': ['Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C'],
            'D': ['D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#'],
            'Eb': ['Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D'],
            'E': ['E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#'],
            'F': ['F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E'],
            'Gb': ['Gb', 'G', 'Ab', 'A', 'Bb', 'Cb', 'C', 'Db', 'D', 'Eb', 'E', 'F'],
            'G': ['G', 'G#', 'A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#'],
            'Ab': ['Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G'],
            'A': ['A', 'A#', 'B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#'],
            'Bb': ['Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A'],
            'B': ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#'],
            // Minor keys
            'Cm': ['C', 'Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'B'],
            'Dbm': ['Db', 'D', 'Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'Cb', 'C'],
            'Dm': ['D', 'Eb', 'E', 'F', 'F#', 'G', 'Ab', 'A', 'Bb', 'B', 'C', 'C#'],
            'Ebm': ['Eb', 'E', 'F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'Cb', 'C', 'Db', 'D'],
            'Em': ['E', 'F', 'F#', 'G', 'G#', 'A', 'Bb', 'B', 'C', 'C#', 'D', 'D#'],
            'Fm': ['F', 'Gb', 'G', 'Ab', 'A', 'Bb', 'Cb', 'C', 'Db', 'D', 'Eb', 'E'],
            'Gbm': ['Gb', 'G', 'Ab', 'A', 'Bb', 'Cb', 'C', 'Db', 'D', 'Eb', 'Fb', 'F'],
            'Gm': ['G', 'Ab', 'A', 'Bb', 'B', 'C', 'Db', 'D', 'Eb', 'E', 'F', 'F#'],
            'Abm': ['Ab', 'A', 'Bb', 'Cb', 'C', 'Db', 'D', 'Eb', 'Fb', 'F', 'Gb', 'G'],
            'Am': ['A', 'Bb', 'B', 'C', 'C#', 'D', 'Eb', 'E', 'F', 'F#', 'G', 'G#'],
            'Bbm': ['Bb', 'Cb', 'C', 'Db', 'D', 'Eb', 'Fb', 'F', 'Gb', 'G', 'Ab', 'A'],
            'Bm': ['B', 'C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#']
        };
        
        this.init();
    }
    
    init() {
        // Initialize Tone.js on user interaction
        document.addEventListener('click', async () => {
            await Tone.start();
            console.log('Tone.js audio context started');
        }, { once: true });

        // Load saved speed from localStorage
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
            this.playbackSpeed = parseFloat(savedSpeed);
            document.getElementById('speedSlider').value = this.playbackSpeed;
            document.getElementById('speedValue').textContent = this.playbackSpeed.toFixed(1) + 'x';
        }

        this.setupEventListeners();
        this.loadInstrument(this.currentInstrument);
    }

    async loadInstrument(instrumentKey) {
        this.instrumentLoaded = false;

        const instrumentName = this.instrumentMap[instrumentKey];
        const baseUrl = `https://tonejs.github.io/audio/salamander/`;

        // Create sample URLs for Tone.js Sampler
        // Using a subset of notes and letting Tone.js interpolate
        const samples = {};

        // For piano-based instruments, use Salamander piano samples
        // For other instruments, we'll use a simpler synth approach
        if (instrumentKey === 'piano') {
            // Load piano samples at specific intervals
            const notes = ['A0', 'C1', 'D#1', 'F#1', 'A1', 'C2', 'D#2', 'F#2', 'A2',
                          'C3', 'D#3', 'F#3', 'A3', 'C4', 'D#4', 'F#4', 'A4',
                          'C5', 'D#5', 'F#5', 'A5', 'C6', 'D#6', 'F#6', 'A6', 'C7'];

            notes.forEach(note => {
                samples[note] = `${note}.mp3`;
            });

            // Dispose of old sampler if it exists
            if (this.sampler) {
                this.sampler.dispose();
            }

            // Create new sampler with loaded samples
            this.sampler = new Tone.Sampler({
                urls: samples,
                baseUrl: baseUrl,
                release: 1,
                onload: () => {
                    this.instrumentLoaded = true;
                    console.log(`Piano loaded successfully`);
                }
            }).toDestination();
        } else {
            // For non-piano instruments, use Tone.js synthesizers
            // Dispose of old sampler if it exists
            if (this.sampler) {
                this.sampler.dispose();
            }

            // Map instruments to different synth configurations
            const synthConfigs = {
                'electric-piano': {
                    oscillator: { type: 'sine' },
                    envelope: { attack: 0.02, decay: 0.3, sustain: 0.1, release: 0.8 }
                },
                'acoustic-guitar': {
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.001, decay: 1.5, sustain: 0, release: 1.5 }
                },
                'electric-guitar': {
                    oscillator: { type: 'sawtooth' },
                    envelope: { attack: 0.002, decay: 0.5, sustain: 0.2, release: 0.5 }
                },
                'acoustic-bass': {
                    oscillator: { type: 'triangle' },
                    envelope: { attack: 0.01, decay: 0.5, sustain: 0.3, release: 1 }
                },
                'electric-bass': {
                    oscillator: { type: 'sawtooth' },
                    envelope: { attack: 0.01, decay: 0.3, sustain: 0.2, release: 0.7 }
                }
            };

            const config = synthConfigs[instrumentKey] || synthConfigs['electric-piano'];
            this.sampler = new Tone.PolySynth(Tone.Synth, config).toDestination();
            this.instrumentLoaded = true;
            console.log(`Instrument ${instrumentKey} loaded successfully (synth)`);
        }
    }
    
    setupEventListeners() {
        // Settings panel
        document.getElementById('startBtn').addEventListener('click', () => this.startExercise());
        document.getElementById('instrumentSelect').addEventListener('change', (e) => {
            this.currentInstrument = e.target.value;
            this.loadInstrument(this.currentInstrument);
        });
        document.getElementById('keySelect').addEventListener('change', (e) => {
            this.currentKey = e.target.value;
        });
        document.getElementById('cadenceSelect').addEventListener('change', (e) => {
            this.cadenceType = e.target.value;
        });
        document.getElementById('melodyLength').addEventListener('change', (e) => {
            this.melodyLength = parseInt(e.target.value);
        });
        document.getElementById('maxInterval').addEventListener('change', (e) => {
            this.maxInterval = e.target.value === 'unlimited' ? Infinity : parseInt(e.target.value);
        });
        document.getElementById('numQuestions').addEventListener('change', (e) => {
            this.numQuestions = parseInt(e.target.value);
        });
        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.playbackSpeed = parseFloat(e.target.value);
            document.getElementById('speedValue').textContent = this.playbackSpeed.toFixed(1) + 'x';
            localStorage.setItem('playbackSpeed', this.playbackSpeed);
        });

        // Exercise controls
        document.getElementById('playChordBtn').addEventListener('click', () => this.playChordProgression());
        document.getElementById('playMelodyBtn').addEventListener('click', () => this.playMelody());
        document.getElementById('submitBtn').addEventListener('click', () => this.submitAnswer());
        document.getElementById('clearBtn').addEventListener('click', () => this.clearAnswer());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    startExercise() {
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('exerciseArea').classList.add('active');
        document.getElementById('resultsArea').classList.remove('active');
        this.nextQuestion();
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.userAnswer = [];
        
        // Update UI
        document.getElementById('currentQ').textContent = this.currentQuestion;
        document.getElementById('totalQ').textContent = this.numQuestions;
        document.getElementById('score').textContent = this.correctAnswers;
        document.getElementById('totalScore').textContent = this.currentQuestion - 1;
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('feedback').className = 'feedback';
        
        // Generate new melody
        this.generateMelody();
        
        // Setup answer slots
        this.setupAnswerSlots();
        
        // Setup scale degree buttons
        this.setupScaleDegreeButtons();
        
        // Automatically play chord progression
        setTimeout(() => this.playChordProgression(), 500);
    }
    
    generateMelody() {
        this.currentMelody = [];

        // Generate first note randomly
        let prevDegree = Math.floor(Math.random() * 12) + 1;
        this.currentMelody.push(prevDegree);

        // Generate subsequent notes within max interval constraint
        for (let i = 1; i < this.melodyLength; i++) {
            let validDegrees = [];

            for (let degree = 1; degree <= 12; degree++) {
                // Calculate smallest interval on chromatic circle
                const diff = Math.abs(degree - prevDegree);
                const interval = Math.min(diff, 12 - diff);

                if (this.maxInterval === Infinity || interval <= this.maxInterval) {
                    validDegrees.push(degree);
                }
            }

            // Pick a random valid degree
            if (validDegrees.length > 0) {
                const nextDegree = validDegrees[Math.floor(Math.random() * validDegrees.length)];
                this.currentMelody.push(nextDegree);
                prevDegree = nextDegree;
            } else {
                // Fallback: if no valid degrees (shouldn't happen), use any degree
                const nextDegree = Math.floor(Math.random() * 12) + 1;
                this.currentMelody.push(nextDegree);
                prevDegree = nextDegree;
            }
        }
    }
    
    setupAnswerSlots() {
        const slotsContainer = document.getElementById('answerSlots');
        slotsContainer.innerHTML = '';
        
        for (let i = 0; i < this.melodyLength; i++) {
            const slot = document.createElement('div');
            slot.className = 'answer-slot';
            slot.id = `slot-${i}`;
            slotsContainer.appendChild(slot);
        }
        
        document.getElementById('submitBtn').disabled = true;
    }
    
    setupScaleDegreeButtons() {
        const container = document.getElementById('scaleDegrees');
        container.innerHTML = '';

        const noteNames = this.keySignatures[this.currentKey];

        for (let i = 1; i <= 12; i++) {
            const btn = document.createElement('button');
            btn.className = 'degree-btn';
            btn.innerHTML = `
                <span class="note-name">${noteNames[i-1]}</span>
                <span class="degree-number">(${i})</span>
            `;
            btn.addEventListener('click', () => this.selectDegree(i));
            container.appendChild(btn);
        }
    }
    
    selectDegree(degree) {
        if (this.userAnswer.length < this.melodyLength) {
            this.userAnswer.push(degree);
            this.updateAnswerSlots();
            
            // Enable submit button when all slots filled
            if (this.userAnswer.length === this.melodyLength) {
                document.getElementById('submitBtn').disabled = false;
            }

            // Play note feedback (apply speed)
            this.playNote(degree, 0.3 / this.playbackSpeed);
        }
    }
    
    updateAnswerSlots() {
        const noteNames = this.keySignatures[this.currentKey];
        
        for (let i = 0; i < this.melodyLength; i++) {
            const slot = document.getElementById(`slot-${i}`);
            if (i < this.userAnswer.length) {
                const degree = this.userAnswer[i];
                slot.innerHTML = `
                    <span class="note-name">${noteNames[degree-1]}</span>
                    <span class="scale-degree">(${degree})</span>
                `;
                slot.classList.add('filled');
            } else {
                slot.innerHTML = '';
                slot.className = 'answer-slot';
            }
        }
    }
    
    clearAnswer() {
        this.userAnswer = [];
        this.updateAnswerSlots();
        document.getElementById('submitBtn').disabled = true;
        
        // Remove feedback
        document.getElementById('feedback').style.display = 'none';
        
        // Reset slot classes
        for (let i = 0; i < this.melodyLength; i++) {
            const slot = document.getElementById(`slot-${i}`);
            slot.className = 'answer-slot';
        }
    }
    
    submitAnswer() {
        // Check answer
        const isCorrect = JSON.stringify(this.userAnswer) === JSON.stringify(this.currentMelody);
        
        const noteNames = this.keySignatures[this.currentKey];
        const feedback = document.getElementById('feedback');
        
        if (isCorrect) {
            this.correctAnswers++;
            feedback.className = 'feedback correct';
            feedback.textContent = '✓ Correct! Great job!';
            
            // Mark all slots as correct
            for (let i = 0; i < this.melodyLength; i++) {
                document.getElementById(`slot-${i}`).classList.add('correct');
            }
        } else {
            feedback.className = 'feedback incorrect';
            feedback.innerHTML = '✗ Incorrect. ';
            
            // Show correct vs incorrect answers
            for (let i = 0; i < this.melodyLength; i++) {
                const slot = document.getElementById(`slot-${i}`);
                if (this.userAnswer[i] === this.currentMelody[i]) {
                    slot.classList.add('correct');
                } else {
                    slot.classList.add('incorrect');
                    const correctNote = noteNames[this.currentMelody[i]-1];
                    slot.innerHTML += `<div class="correct-answer">✓ ${correctNote} (${this.currentMelody[i]})</div>`;
                }
            }
            
            feedback.innerHTML += `Correct answer: ${this.currentMelody.map((d, i) => 
                `${noteNames[d-1]} (${d})`).join(', ')}`;
        }
        
        // Update score
        document.getElementById('score').textContent = this.correctAnswers;
        document.getElementById('totalScore').textContent = this.currentQuestion;
        
        // Disable buttons temporarily
        document.getElementById('submitBtn').disabled = true;
        const degreeButtons = document.querySelectorAll('.degree-btn');
        degreeButtons.forEach(btn => btn.disabled = true);
        
        // Move to next question or show results
        if (this.currentQuestion < this.numQuestions) {
            setTimeout(() => {
                degreeButtons.forEach(btn => btn.disabled = false);
                this.nextQuestion();
            }, 3000);
        } else {
            setTimeout(() => this.showResults(), 2000);
        }
    }
    
    showResults() {
        document.getElementById('exerciseArea').classList.remove('active');
        document.getElementById('resultsArea').classList.add('active');
        
        const percentage = Math.round((this.correctAnswers / this.numQuestions) * 100);
        document.getElementById('finalScore').textContent = `${this.correctAnswers}/${this.numQuestions}`;
        document.getElementById('percentage').textContent = `${percentage}% Correct`;
    }
    
    restart() {
        document.getElementById('settingsPanel').style.display = 'block';
        document.getElementById('exerciseArea').classList.remove('active');
        document.getElementById('resultsArea').classList.remove('active');
    }
    
    // Audio generation methods
    
    isMinorKey() {
        return this.currentKey.endsWith('m');
    }

    getRootKey() {
        // Get the root note without the 'm' suffix
        return this.isMinorKey() ? this.currentKey.slice(0, -1) : this.currentKey;
    }

    getNoteName(scaleDegree) {
        const rootKey = this.getRootKey();

        // Handle scale degrees above 12 by calculating automatic octave offset
        let degree = scaleDegree;
        let octaveOffset = 0;
        while (degree > 12) {
            degree -= 12;
            octaveOffset += 1;
        }

        // Get the chromatic interval (0-11 semitones from root)
        const semitones = this.chromaticIntervals[degree - 1];

        // Calculate the MIDI note number (C4 = 60)
        const rootMidi = {
            'C': 60, 'Db': 61, 'D': 62, 'Eb': 63, 'E': 64, 'F': 65,
            'Gb': 66, 'G': 67, 'Ab': 68, 'A': 69, 'Bb': 70, 'B': 71
        };

        const midiNote = rootMidi[rootKey] + semitones + (octaveOffset * 12);

        // Convert MIDI note to note name with octave
        const noteNames = ['C', 'Cs', 'D', 'Ds', 'E', 'F', 'Fs', 'G', 'Gs', 'A', 'As', 'B'];
        const octave = Math.floor(midiNote / 12) - 1;
        const noteName = noteNames[midiNote % 12];

        return noteName + octave;
    }

    async playNote(scaleDegree, duration = 0.5, startTime = null) {
        if (!this.sampler || !this.instrumentLoaded) return;

        const noteName = this.getNoteName(scaleDegree);
        const now = startTime !== null ? startTime : Tone.now();

        // Adjust duration based on playback speed
        const adjustedDuration = duration / this.playbackSpeed;

        try {
            // Trigger the sampler/synth with the note
            this.sampler.triggerAttackRelease(noteName, adjustedDuration, now);
        } catch (error) {
            console.error('Error playing note:', error);
        }
    }
    
    async playChord(degrees, duration = 1.0, startTime = null) {
        if (!this.sampler || !this.instrumentLoaded) return;

        const now = startTime !== null ? startTime : Tone.now();

        degrees.forEach(degree => {
            this.playNote(degree, duration, now);
        });
    }

    async playChordProgression() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (!this.sampler || !this.instrumentLoaded) {
            this.isPlaying = false;
            return;
        }

        const now = Tone.now();
        const chordDuration = 0.8 / this.playbackSpeed;
        const gap = 0.1 / this.playbackSpeed;

        if (this.cadenceType === 'none') {
            // No cadence - just mark as not playing
            this.isPlaying = false;
            return;
        } else if (this.cadenceType === 'root') {
            // Play just the root note
            await this.playNote(1, chordDuration * 2, now);
            setTimeout(() => {
                this.isPlaying = false;
            }, (chordDuration * 2) * 1000);
        } else if (this.cadenceType === 'i-iv-v') {
            // I - IV - V - I progression
            const isMinor = this.isMinorKey();

            if (isMinor) {
                // Minor key chords in root position:
                // i chord (C minor) = C, Eb, G = 1, 4, 8
                // iv chord (F minor) = F, Ab, C = 6, 9, 13 (C is octave up)
                // v chord (G minor) = G, Bb, D = 8, 11, 15 (D is octave up)
                await this.playChord([1, 4, 8], chordDuration, now); // i chord
                await this.playChord([6, 9, 13], chordDuration, now + chordDuration + gap); // iv chord
                await this.playChord([8, 11, 15], chordDuration, now + 2 * (chordDuration + gap)); // v chord
                await this.playChord([1, 4, 8], chordDuration, now + 3 * (chordDuration + gap)); // i chord
            } else {
                // Major key chords in root position:
                // I chord (C major) = C, E, G = 1, 5, 8
                // IV chord (F major) = F, A, C = 6, 10, 13 (C is octave up)
                // V chord (G major) = G, B, D = 8, 12, 15 (D is octave up)
                await this.playChord([1, 5, 8], chordDuration, now); // I chord
                await this.playChord([6, 10, 13], chordDuration, now + chordDuration + gap); // IV chord
                await this.playChord([8, 12, 15], chordDuration, now + 2 * (chordDuration + gap)); // V chord
                await this.playChord([1, 5, 8], chordDuration, now + 3 * (chordDuration + gap)); // I chord
            }

            setTimeout(() => {
                this.isPlaying = false;
            }, 4 * (chordDuration + gap) * 1000);
        }
    }

    async playMelody() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (!this.sampler || !this.instrumentLoaded) {
            this.isPlaying = false;
            return;
        }

        const now = Tone.now();
        const noteDuration = 0.5 / this.playbackSpeed;
        const gap = 0.1 / this.playbackSpeed;

        this.currentMelody.forEach((degree, index) => {
            const startTime = now + index * (noteDuration + gap);
            this.playNote(degree, noteDuration, startTime);
        });

        setTimeout(() => {
            this.isPlaying = false;
        }, this.currentMelody.length * (noteDuration + gap) * 1000);
    }
}

// Initialize the app
const app = new MelodicDictation();
