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
        this.numQuestions = 100;
        this.maxInterval = 12; // Default to 12 semitones (octave)
        this.currentMelody = [];
        this.userAnswer = [];
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.isPlaying = false;
        this.playbackSpeed = 1.0;
        this.isInitialCadence = false; // Track if this is the first cadence play for auto-melody
        this.incorrectButtons = new Set(); // Track buttons that have been marked as incorrect
        this.completedMelodies = 0; // Track completed melodies
        this.totalErrors = 0; // Track total errors
        this.quizStartTime = null; // Track quiz start time
        this.melodyStartTime = null; // Track melody start time
        this.melodyTimes = []; // Track time for each melody
        this.randomKeys = false; // Track if random keys mode is enabled
        this.correctNotesOnStaff = []; // Track notes to display on staff
        this.correctButtonPresses = 0; // Track number of correct button presses
        this.wrongButtonPresses = 0; // Track number of wrong button presses

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

        // Key signature accidentals for display on treble clef
        // Format: { type: 'sharp' or 'flat', accidentals: [list of notes with their y-positions] }
        this.keySignatureAccidentals = {
            'C': { type: 'none', accidentals: [] },
            'G': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }] },
            'D': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }] },
            'A': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }, { note: 'G', y: 33 }] },
            'E': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }, { note: 'G', y: 33 }, { note: 'D', y: 48 }] },
            'B': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }, { note: 'G', y: 33 }, { note: 'D', y: 48 }, { note: 'A', y: 63 }] },
            'Gb': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }, { note: 'G', y: 70 }, { note: 'C', y: 55 }] },
            'Db': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }, { note: 'G', y: 70 }] },
            'Ab': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }] },
            'Eb': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }] },
            'Bb': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }] },
            'F': { type: 'flat', accidentals: [{ note: 'B', y: 60 }] },
            // Minor keys - using natural minor key signatures
            'Am': { type: 'none', accidentals: [] },
            'Em': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }] },
            'Bm': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }] },
            'Gbm': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }, { note: 'G', y: 33 }] },
            'Dbm': { type: 'sharp', accidentals: [{ note: 'F', y: 40 }, { note: 'C', y: 55 }, { note: 'G', y: 33 }, { note: 'D', y: 48 }, { note: 'A', y: 63 }] },
            'Abm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }, { note: 'G', y: 70 }, { note: 'C', y: 55 }, { note: 'F', y: 80 }] },
            'Ebm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }, { note: 'G', y: 70 }, { note: 'C', y: 55 }] },
            'Bbm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }, { note: 'G', y: 70 }] },
            'Fm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }, { note: 'D', y: 45 }] },
            'Cm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }, { note: 'A', y: 65 }] },
            'Gm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }, { note: 'E', y: 50 }] },
            'Dm': { type: 'flat', accidentals: [{ note: 'B', y: 60 }] }
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
            // Update key signature if exercise is active
            if (document.getElementById('exerciseArea').classList.contains('active')) {
                this.updateKeySignature();
            }
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
            this.numQuestions = e.target.value === 'unlimited' ? Infinity : parseInt(e.target.value);
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
        document.getElementById('hearNextBtn').addEventListener('click', () => this.moveToNextQuestion());
        document.getElementById('stopQuizBtn').addEventListener('click', () => this.stopQuiz());
        document.getElementById('randomKeysBtn').addEventListener('click', () => this.toggleRandomKeys());
        document.getElementById('restartBtn').addEventListener('click', () => this.restart());
    }
    
    async startExercise() {
        this.currentQuestion = 0;
        this.correctAnswers = 0;
        this.completedMelodies = 0;
        this.totalErrors = 0;
        this.melodyTimes = [];
        this.quizStartTime = Date.now();
        this.melodyStartTime = Date.now();

        // Ensure audio context is ready and resumed for immediate playback
        if (this.audioContext && this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        document.getElementById('settingsPanel').style.display = 'none';
        document.getElementById('exerciseArea').classList.add('active');
        document.getElementById('resultsArea').classList.remove('active');
        this.updateStatistics();
        this.nextQuestion();
    }
    
    nextQuestion() {
        this.currentQuestion++;
        this.userAnswer = [];
        this.correctNotesOnStaff = []; // Clear staff notes
        this.incorrectButtons.clear(); // Reset incorrect buttons tracking
        this.isInitialCadence = true; // Mark that this is the initial cadence
        this.melodyStartTime = Date.now(); // Start timer for this melody

        // If random keys is enabled, select a random key
        if (this.randomKeys) {
            const keys = Object.keys(this.keySignatures);
            this.currentKey = keys[Math.floor(Math.random() * keys.length)];
        }

        // Update UI
        document.getElementById('currentQ').textContent = this.currentQuestion;
        document.getElementById('totalQ').textContent = this.numQuestions === Infinity ? '∞' : this.numQuestions;
        document.getElementById('feedback').style.display = 'none';
        document.getElementById('feedback').className = 'feedback';

        // Hide "Hear Next" button and show Clear button
        document.getElementById('hearNextBtn').style.display = 'none';
        document.getElementById('clearBtn').style.display = 'block';

        // Generate new melody
        this.generateMelody();

        // Setup answer slots
        this.setupAnswerSlots();

        // Setup scale degree buttons
        this.setupScaleDegreeButtons();

        // Update staff display and key signature
        this.updateStaffDisplay();
        this.updateKeySignature();

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
            btn.id = `degree-btn-${i}`;
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
            const currentPosition = this.userAnswer.length;
            const correctDegree = this.currentMelody[currentPosition];

            // Check if the selected degree is correct for this position
            if (degree === correctDegree) {
                // Correct note selected - reset all incorrect buttons first
                this.incorrectButtons.forEach(prevDegree => {
                    const prevBtn = document.getElementById(`degree-btn-${prevDegree}`);
                    if (prevBtn) {
                        prevBtn.classList.remove('incorrect');
                        prevBtn.disabled = false;
                    }
                });
                this.incorrectButtons.clear();

                // Increment correct button presses
                this.correctButtonPresses++;
                this.updateStatistics();

                this.userAnswer.push(degree);
                this.correctNotesOnStaff.push(degree); // Add to staff display
                this.updateAnswerSlots();
                this.updateStaffDisplay();

                // Play note feedback (apply speed)
                this.playNote(degree, 0.3 / this.playbackSpeed);

                // Check if the entire sequence is complete and correct
                if (this.userAnswer.length === this.melodyLength) {
                    // All notes are correct! Show "Hear Next" button
                    this.onCorrectSequence();
                }
            } else {
                // Wrong note selected - first, re-enable all previously incorrect buttons
                this.incorrectButtons.forEach(prevDegree => {
                    const prevBtn = document.getElementById(`degree-btn-${prevDegree}`);
                    if (prevBtn) {
                        prevBtn.classList.remove('incorrect');
                        prevBtn.disabled = false;
                    }
                });
                this.incorrectButtons.clear();

                // Now mark the new incorrect button
                const btn = document.getElementById(`degree-btn-${degree}`);
                btn.classList.add('incorrect');
                btn.disabled = true;
                this.incorrectButtons.add(degree);

                // Increment error count and wrong button presses
                this.totalErrors++;
                this.wrongButtonPresses++;
                this.updateStatistics();

                // Still play the note so user can hear what they selected
                this.playNote(degree, 0.3 / this.playbackSpeed);
            }
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
        this.correctNotesOnStaff = []; // Clear staff notes
        this.updateAnswerSlots();
        this.updateStaffDisplay(); // Update staff to remove notes
        document.getElementById('submitBtn').disabled = true;

        // Remove feedback
        document.getElementById('feedback').style.display = 'none';

        // Reset slot classes
        for (let i = 0; i < this.melodyLength; i++) {
            const slot = document.getElementById(`slot-${i}`);
            slot.className = 'answer-slot';
        }

        // Re-enable all buttons that were marked as incorrect
        this.incorrectButtons.forEach(degree => {
            const btn = document.getElementById(`degree-btn-${degree}`);
            if (btn) {
                btn.classList.remove('incorrect');
                btn.disabled = false;
            }
        });
        this.incorrectButtons.clear();
    }

    onCorrectSequence() {
        // Mark all answer slots as correct
        for (let i = 0; i < this.melodyLength; i++) {
            const slot = document.getElementById(`slot-${i}`);
            slot.classList.add('correct');
        }

        // Update score
        this.correctAnswers++;

        // Record completion time
        const melodyTime = (Date.now() - this.melodyStartTime) / 1000; // in seconds
        this.melodyTimes.push(melodyTime);
        this.completedMelodies++;
        this.updateStatistics();

        // Show success feedback
        const feedback = document.getElementById('feedback');
        feedback.className = 'feedback correct';
        feedback.textContent = '✓ Correct! Great job!';

        // Hide Clear button and show "Hear Next" button
        document.getElementById('clearBtn').style.display = 'none';
        document.getElementById('hearNextBtn').style.display = 'block';

        // Disable all degree buttons
        const degreeButtons = document.querySelectorAll('.degree-btn');
        degreeButtons.forEach(btn => btn.disabled = true);
    }

    moveToNextQuestion() {
        // Move to next question or show results
        if (this.currentQuestion < this.numQuestions) {
            // Re-enable all buttons before moving to next question
            const degreeButtons = document.querySelectorAll('.degree-btn');
            degreeButtons.forEach(btn => btn.disabled = false);
            this.nextQuestion();
        } else {
            this.showResults();
        }
    }

    updateStatistics() {
        // Update completed count
        document.getElementById('completedCount').textContent = this.completedMelodies;

        // Update errors count
        document.getElementById('errorsCount').textContent = this.totalErrors;

        // Update Score statistic
        const totalPresses = this.correctButtonPresses + this.wrongButtonPresses;
        if (totalPresses > 0) {
            const scorePercentage = Math.round((this.correctButtonPresses / totalPresses) * 100);
            document.getElementById('score').textContent = scorePercentage + '%';
        } else {
            document.getElementById('score').textContent = '0%';
        }

        // Update elapsed time
        if (this.quizStartTime) {
            const elapsedSeconds = Math.floor((Date.now() - this.quizStartTime) / 1000);
            document.getElementById('elapsedTime').textContent = elapsedSeconds;
        }

        // Update average time
        if (this.melodyTimes.length > 0) {
            const avgTime = this.melodyTimes.reduce((a, b) => a + b, 0) / this.melodyTimes.length;
            document.getElementById('avgTime').textContent = avgTime.toFixed(1);
        } else {
            document.getElementById('avgTime').textContent = '0.0';
        }

        // Update elapsed time every second
        if (this.quizStartTime && !this.statsUpdateInterval) {
            this.statsUpdateInterval = setInterval(() => {
                if (this.quizStartTime) {
                    const elapsedSeconds = Math.floor((Date.now() - this.quizStartTime) / 1000);
                    document.getElementById('elapsedTime').textContent = elapsedSeconds;
                }
            }, 1000);
        }
    }

    updateStaffDisplay() {
        const svg = document.getElementById('staffSvg');
        const notesGroup = document.getElementById('staffNotes');

        // Clear existing notes
        notesGroup.innerHTML = '';

        // Define staff properties
        const staffStart = 120; // Start after treble clef
        const staffEnd = 550;
        const availableWidth = staffEnd - staffStart;
        const noteSpacing = availableWidth / (this.melodyLength + 1);

        // Draw notes on staff
        this.correctNotesOnStaff.forEach((degree, index) => {
            const x = staffStart + noteSpacing * (index + 1);
            const noteInfo = this.getNoteYPosition(degree);
            const y = noteInfo.y;

            // Shift note to the right if there's an accidental
            const noteX = noteInfo.accidental ? x + 10 : x;

            // Draw accidental if needed
            if (noteInfo.accidental) {
                const accidental = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                accidental.setAttribute('x', x - 12);
                accidental.setAttribute('y', y + 5);
                accidental.setAttribute('font-size', '20');
                accidental.setAttribute('font-family', 'serif');
                accidental.setAttribute('fill', 'black');
                accidental.textContent = noteInfo.accidental;
                notesGroup.appendChild(accidental);
            }

            // Draw note head (filled oval)
            const noteHead = document.createElementNS('http://www.w3.org/2000/svg', 'ellipse');
            noteHead.setAttribute('cx', noteX);
            noteHead.setAttribute('cy', y);
            noteHead.setAttribute('rx', 6);
            noteHead.setAttribute('ry', 5);
            noteHead.setAttribute('fill', 'black');
            notesGroup.appendChild(noteHead);

            // Draw stem (going up)
            const stem = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            stem.setAttribute('x1', noteX + 6);
            stem.setAttribute('y1', y);
            stem.setAttribute('x2', noteX + 6);
            stem.setAttribute('y2', y - 30);
            stem.setAttribute('stroke', 'black');
            stem.setAttribute('stroke-width', '1.5');
            notesGroup.appendChild(stem);

            // Add ledger lines if needed
            this.addLedgerLines(notesGroup, noteX, y);
        });
    }

    updateKeySignature() {
        const keySignatureGroup = document.getElementById('keySignature');

        // Clear existing key signature
        keySignatureGroup.innerHTML = '';

        // Get the key signature data for current key
        const keyData = this.keySignatureAccidentals[this.currentKey];
        if (!keyData || keyData.type === 'none') {
            return; // No accidentals to display
        }

        // Starting x position for key signature (after treble clef)
        let xPos = 105;
        const xSpacing = 8; // Space between accidentals

        // Draw each accidental
        keyData.accidentals.forEach((acc, index) => {
            const x = xPos + (index * xSpacing);
            const y = acc.y;

            if (keyData.type === 'sharp') {
                // Draw sharp symbol (♯)
                const sharp = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                sharp.setAttribute('x', x);
                sharp.setAttribute('y', y + 5);
                sharp.setAttribute('font-size', '20');
                sharp.setAttribute('font-family', 'serif');
                sharp.setAttribute('fill', 'black');
                sharp.textContent = '♯';
                keySignatureGroup.appendChild(sharp);
            } else if (keyData.type === 'flat') {
                // Draw flat symbol (♭)
                const flat = document.createElementNS('http://www.w3.org/2000/svg', 'text');
                flat.setAttribute('x', x);
                flat.setAttribute('y', y + 5);
                flat.setAttribute('font-size', '20');
                flat.setAttribute('font-family', 'serif');
                flat.setAttribute('fill', 'black');
                flat.textContent = '♭';
                keySignatureGroup.appendChild(flat);
            }
        });
    }

    getNoteYPosition(degree) {
        // Get the actual note name for this degree in the current key
        const noteName = this.keySignatures[this.currentKey][degree - 1];

        // Parse the note to get the base letter and accidental
        const parsed = this.parseNoteName(noteName);
        const baseLetter = parsed.letter;
        const accidentalSymbol = parsed.accidental;

        // Map base letter names to Y positions on treble clef (C4 to B4)
        // Staff line spacing is approximately 5 pixels between lines
        const positions = {
            'C': 90,   // C4 (below staff, needs ledger line)
            'D': 85,   // D4 (below staff, needs ledger line)
            'E': 80,   // E4 (bottom line)
            'F': 75,   // F4 (space between bottom and 2nd line)
            'G': 70,   // G4 (2nd line from bottom)
            'A': 65,   // A4 (space between 2nd and 3rd line)
            'B': 60    // B4 (middle line)
        };

        const y = positions[baseLetter] || 60;

        // Determine if we need to display an accidental
        // An accidental is needed if the note is not in the key signature
        const accidentalToDisplay = this.shouldDisplayAccidental(noteName, baseLetter);

        return {
            y: y,
            accidental: accidentalToDisplay
        };
    }

    parseNoteName(noteName) {
        // Parse note name like "C#", "Db", "C", "Cb" into letter and accidental
        const letter = noteName[0];
        let accidental = '';

        if (noteName.length > 1) {
            if (noteName[1] === 'b') {
                accidental = 'b';
            } else if (noteName[1] === '#') {
                accidental = '#';
            }
        }

        return { letter, accidental };
    }

    shouldDisplayAccidental(noteName, baseLetter) {
        // Get the key signature data
        const keyData = this.keySignatureAccidentals[this.currentKey];

        // Parse the note to get its accidental
        const parsed = this.parseNoteName(noteName);
        const noteAccidental = parsed.accidental;

        // Determine what accidental (if any) is in the key signature for this base letter
        let keySignatureAccidental = '';
        if (keyData && keyData.accidentals) {
            const accInKey = keyData.accidentals.find(acc => acc.note === baseLetter);
            if (accInKey) {
                keySignatureAccidental = keyData.type === 'sharp' ? '#' : 'b';
            }
        }

        // If the note's accidental matches the key signature, don't display it
        if (noteAccidental === keySignatureAccidental) {
            return null;
        }

        // If the note has an accidental but key signature doesn't, display it
        if (noteAccidental && !keySignatureAccidental) {
            return noteAccidental === '#' ? '♯' : '♭';
        }

        // If the key signature has an accidental but the note doesn't, display natural
        if (!noteAccidental && keySignatureAccidental) {
            return '♮';
        }

        // If both have accidentals but they're different, display the note's accidental
        if (noteAccidental && keySignatureAccidental && noteAccidental !== keySignatureAccidental) {
            return noteAccidental === '#' ? '♯' : '♭';
        }

        return null;
    }

    addLedgerLines(parent, x, y) {
        // Add ledger lines for notes below or above the staff
        // Bottom staff line is at y=80, top staff line is at y=40
        const lineSpacing = 10;

        // Below staff (C4, D4)
        if (y >= 90) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x - 10);
            line.setAttribute('y1', 90);
            line.setAttribute('x2', x + 10);
            line.setAttribute('y2', 90);
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '1');
            parent.appendChild(line);
        }
        if (y >= 85 && y < 90) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x - 10);
            line.setAttribute('y1', 85);
            line.setAttribute('x2', x + 10);
            line.setAttribute('y2', 85);
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '1');
            parent.appendChild(line);
        }

        // Above staff
        if (y <= 30) {
            const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
            line.setAttribute('x1', x - 10);
            line.setAttribute('y1', 30);
            line.setAttribute('x2', x + 10);
            line.setAttribute('y2', 30);
            line.setAttribute('stroke', 'black');
            line.setAttribute('stroke-width', '1');
            parent.appendChild(line);
        }
    }

    stopQuiz() {
        // Stop the quiz and reset to settings panel
        if (this.statsUpdateInterval) {
            clearInterval(this.statsUpdateInterval);
            this.statsUpdateInterval = null;
        }
        // Reset Score tracking
        this.correctButtonPresses = 0;
        this.wrongButtonPresses = 0;
        this.restart();
    }

    toggleRandomKeys() {
        this.randomKeys = !this.randomKeys;
        const btn = document.getElementById('randomKeysBtn');
        if (this.randomKeys) {
            btn.style.background = '#4caf50';
            btn.textContent = '🎲 Random Keys: ON';
        } else {
            btn.style.background = 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            btn.textContent = '🎲 Random Keys: OFF';
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

        // Resume audio context if suspended (removes delay on first play)
        if (this.audioContext.state === 'suspended') {
            await this.audioContext.resume();
        }

        // For immediate playback (button press), use current time with minimal buffer
        // For scheduled playback (melodies), use the provided startTime
        const now = startTime !== null ? startTime : this.audioContext.currentTime;

        // Use soundfont instrument if loaded
        if (this.instrument) {
            const midiNote = this.getMidiNote(scaleDegree);

            // Play the note using soundfont (expects absolute AudioContext time)
            this.instrument.play(midiNote, now, {
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

        // Store whether this is the initial cadence before any async operations
        const shouldAutoPlayMelody = this.isInitialCadence;
        this.isInitialCadence = false; // Reset the flag

        // Schedule notes slightly in the future to avoid timing issues
        const now = this.audioContext.currentTime + 0.05;
        const chordDuration = 0.8 / this.playbackSpeed;
        const gap = 0.1 / this.playbackSpeed;
        let totalDuration = 0;

        if (this.cadenceType === 'none') {
            // No cadence - just mark as not playing and auto-play melody immediately
            this.isPlaying = false;
            if (shouldAutoPlayMelody) {
                setTimeout(() => this.playMelody(), 1000);
            }
            return;
        } else if (this.cadenceType === 'root') {
            // Play just the root note
            await this.playNote(1, chordDuration * 2, now);
            // Total duration = buffer + chord duration + small safety margin
            totalDuration = (0.05 + chordDuration * 2 + 0.05) * 1000;
            setTimeout(() => {
                this.isPlaying = false;
                // Auto-play melody 1 second after cadence finishes if this was the initial cadence
                if (shouldAutoPlayMelody) {
                    setTimeout(() => this.playMelody(), 1000);
                }
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
            totalDuration = (0.05 + 3 * (chordDuration + gap) + chordDuration + 0.05) * 1000;
            setTimeout(() => {
                this.isPlaying = false;
                // Auto-play melody 1 second after cadence finishes if this was the initial cadence
                if (shouldAutoPlayMelody) {
                    setTimeout(() => this.playMelody(), 1000);
                }
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
