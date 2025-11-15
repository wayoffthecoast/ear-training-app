# 🎵 Melodic Dictation Ear Training App

A browser-based ear training application for developing melodic dictation skills. Listen to chord progressions and melodies, then identify the notes by their scale degrees.

## Features

- **12 Major Keys**: Practice in any major key from C to B
- **Customizable Difficulty**: Choose melody lengths from 3-8 notes
- **Flexible Practice**: Set question count from 5-20
- **Instant Feedback**: See correct answers immediately with visual feedback
- **Progress Tracking**: Track your score throughout the exercise
- **Audio Synthesis**: Pure Web Audio API implementation - no external audio files needed

## How to Use

1. **Open the app**: Simply open `melodic-dictation.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

2. **Configure settings**:
   - Select your desired key (default: Bb Major)
   - Choose melody length (3-8 notes)
   - Set number of questions (5-20)

3. **Start practicing**:
   - Click "Start Exercise"
   - Listen to the chord progression (I-IV-V-I) to establish the key
   - Click "Play Melody" to hear the melody
   - Click the scale degree buttons to build your answer
   - Submit when ready

4. **Review results**: After completing all questions, see your final score and percentage

## Technical Details

- **Pure HTML/CSS/JavaScript**: No dependencies, frameworks, or build tools required
- **Web Audio API**: Real-time audio synthesis for notes and chords
- **Responsive Design**: Works on desktop and mobile browsers
- **Offline Capable**: Runs entirely in the browser with no server required

## Key Signatures Supported

All 12 major keys with proper accidentals:
- C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B

## Browser Compatibility

- ✅ Chrome/Edge (recommended)
- ✅ Firefox
- ✅ Safari
- ✅ Modern mobile browsers

Requires Web Audio API support (all modern browsers).

## Development

This app was created as a focused ear training tool for musicians developing their melodic dictation skills. It replicates and enhances functionality from traditional ear training exercises.

## License

MIT License - Feel free to use and modify for your own ear training practice!

## Future Enhancements

Potential features for future versions:
- Interval recognition mode
- Chord quality recognition
- Rhythm dictation
- Multiple instrument timbres
- Progress history tracking with localStorage
- Export/import practice statistics
- Difficulty levels (restricted note ranges, common patterns)

---

**Made with ❤️ for musicians everywhere**
