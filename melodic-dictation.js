// Melodic Dictation Ear Training App
// Audio generation and game logic

class MelodicDictation {
    constructor() {
        this.audioContext = null;
        this.currentKey = 'Bb';
        this.currentInstrument = 'acoustic_grand_piano';
        this.instrument = null; // Will hold the loaded soundfont instrument
        this.isLoadingInstrument = false;
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
        // Initialize audio context on user interaction
        document.addEventListener('click', () => {
            if (!this.audioContext) {
                this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
                // Load the initial instrument
                this.loadInstrument(this.currentInstrument);
            }
        }, { once: true });

        // Load saved speed from localStorage
        const savedSpeed = localStorage.getItem('playbackSpeed');
        if (savedSpeed) {
            this.playbackSpeed = parseFloat(savedSpeed);
            document.getElementById('speedSlider').value = this.playbackSpeed;
            document.getElementById('speedValue').textContent = this.playbackSpeed.toFixed(1) + 'x';
        }

        this.setupEventListeners();
    }

    async loadInstrument(instrumentName) {
        if (this.isLoadingInstrument || !this.audioContext) return;

        this.isLoadingInstrument = true;
        console.log(`Loading instrument: ${instrumentName}`);

        try {
            // Load the soundfont instrument
            this.instrument = await Soundfont.instrument(this.audioContext, instrumentName, {
                soundfont: 'MusyngKite',
                gain: 3.0 // Increase volume
            });
            console.log(`Instrument ${instrumentName} loaded successfully`);
        } catch (error) {
            console.error(`Error loading instrument ${instrumentName}:`, error);
            this.instrument = null;
        } finally {
            this.isLoadingInstrument = false;
        }
    }
    
    setupEventListeners() {
        // Settings panel
        document.getElementById('startBtn').addEventListener('click', () => this.startExercise());
        document.getElementById('instrumentSelect').addEventListener('change', (e) => {
            this.currentInstrument = e.target.value;
            if (this.audioContext) {
                this.loadInstrument(this.currentInstrument);
            }
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

    getFrequency(scaleDegree, octaveOffset = 0) {
        const rootKey = this.getRootKey();
        const rootFreq = this.baseFrequencies[rootKey];

        // Handle scale degrees above 12 by calculating automatic octave offset
        let degree = scaleDegree;
        let autoOctaveOffset = 0;
        while (degree > 12) {
            degree -= 12;
            autoOctaveOffset += 1;
        }

        const semitones = this.chromaticIntervals[degree - 1];
        return rootFreq * Math.pow(2, (semitones + (octaveOffset + autoOctaveOffset) * 12) / 12);
    }

    getMidiNote(scaleDegree, octaveOffset = 0) {
        const rootKey = this.getRootKey();

        // MIDI note numbers: C4 = 60, which is middle C
        const rootMidiNotes = {
            'C': 60,
            'Db': 61,
            'D': 62,
            'Eb': 63,
            'E': 64,
            'F': 65,
            'Gb': 66,
            'G': 67,
            'Ab': 68,
            'A': 69,
            'Bb': 70,
            'B': 71
        };

        // Handle scale degrees above 12 by calculating automatic octave offset
        let degree = scaleDegree;
        let autoOctaveOffset = 0;
        while (degree > 12) {
            degree -= 12;
            autoOctaveOffset += 1;
        }

        const rootMidi = rootMidiNotes[rootKey];
        const semitones = this.chromaticIntervals[degree - 1];
        return rootMidi + semitones + (octaveOffset + autoOctaveOffset) * 12;
    }
    
    async playNote(scaleDegree, duration = 0.5, startTime = null) {
        if (!this.audioContext) return;

        const now = startTime || this.audioContext.currentTime;

        // Use soundfont instrument if loaded
        if (this.instrument) {
            const midiNote = this.getMidiNote(scaleDegree);
            const when = now - this.audioContext.currentTime;

            // Play the note using soundfont
            this.instrument.play(midiNote, when, {
                duration: duration,
                gain: 2.0
            });
        } else {
            // Fallback to oscillator
            const freq = this.getFrequency(scaleDegree);

            // Create oscillator
            const osc = this.audioContext.createOscillator();
            osc.type = 'sine';
            osc.frequency.setValueAtTime(freq, now);

            // Create gain for envelope (scale attack time with playback speed)
            const gainNode = this.audioContext.createGain();
            const attackTime = 0.01 / this.playbackSpeed;
            gainNode.gain.setValueAtTime(0, now);
            gainNode.gain.linearRampToValueAtTime(0.3, now + attackTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, now + duration);

            // Connect and play
            osc.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            osc.start(now);
            osc.stop(now + duration);
        }
    }
    
    async playChord(degrees, duration = 1.0, startTime = null) {
        if (!this.audioContext) return;
        
        const now = startTime || this.audioContext.currentTime;
        
        degrees.forEach(degree => {
            this.playNote(degree, duration, now);
        });
    }
    
    async playChordProgression() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Schedule notes slightly in the future to avoid timing issues
        const now = this.audioContext.currentTime + 0.05;
        const chordDuration = 0.8 / this.playbackSpeed;
        const gap = 0.1 / this.playbackSpeed;

        if (this.cadenceType === 'none') {
            // No cadence - just mark as not playing
            this.isPlaying = false;
            return;
        } else if (this.cadenceType === 'root') {
            // Play just the root note
            await this.playNote(1, chordDuration * 2, now);
            // Total duration = buffer + chord duration + small safety margin
            const totalDuration = (0.05 + chordDuration * 2 + 0.05) * 1000;
            setTimeout(() => {
                this.isPlaying = false;
            }, totalDuration);
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

            // Total duration = buffer + (3 gaps + 4 chords) + safety margin
            // Last chord starts at 3*(chordDuration+gap) and plays for chordDuration
            const totalDuration = (0.05 + 3 * (chordDuration + gap) + chordDuration + 0.05) * 1000;
            setTimeout(() => {
                this.isPlaying = false;
            }, totalDuration);
        }
    }
    
    async playMelody() {
        if (this.isPlaying) return;
        this.isPlaying = true;

        if (!this.audioContext) {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        }

        // Schedule notes slightly in the future to avoid timing issues
        const now = this.audioContext.currentTime + 0.05;
        const noteDuration = 0.5 / this.playbackSpeed;
        const gap = 0.1 / this.playbackSpeed;

        this.currentMelody.forEach((degree, index) => {
            const startTime = now + index * (noteDuration + gap);
            this.playNote(degree, noteDuration, startTime);
        });

        // Total duration = buffer + (melody notes with gaps) + last note duration + safety margin
        const totalDuration = (0.05 + (this.currentMelody.length - 1) * (noteDuration + gap) + noteDuration + 0.05) * 1000;
        setTimeout(() => {
            this.isPlaying = false;
        }, totalDuration);
    }
}

// Initialize the app
const app = new MelodicDictation();
