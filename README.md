# 🎵 Melodic Dictation Ear Training App

A browser-based ear training application for developing melodic dictation skills. Listen to chord progressions and melodies, then identify the notes using all 12 chromatic notes.

## Features

- **12 Major Keys**: Practice in any major key from C to B
- **Chromatic Scale**: All 12 chromatic notes available (not just the major scale)
- **Customizable Difficulty**: Choose melody lengths from 3-8 notes
- **Adjustable Speed**: Control playback speed from 0.5x (slow) to 4x (fast)
- **Flexible Practice**: Set question count from 5-20
- **Instant Feedback**: See correct answers immediately with visual feedback
- **Progress Tracking**: Track your score throughout the exercise
- **Speed Persistence**: Your speed preference is saved automatically
- **Audio Synthesis**: Pure Web Audio API implementation - no external audio files needed

## How to Use

1. **Open the app**: Simply open `melodic-dictation.html` in any modern web browser (Chrome, Firefox, Safari, Edge)

2. **Configure settings**:
   - Select your desired key (default: Bb Major)
   - Choose melody length (3-8 notes)
   - Set number of questions (5-20)
   - Adjust playback speed (0.5x - 4x, default: 1.0x)

3. **Start practicing**:
   - Click "Start Exercise"
   - Listen to the chord progression (I-IV-V-I) to establish the key
   - Click "Play Melody" to hear the melody
   - Click the chromatic note buttons to build your answer (all 12 notes available)
   - Submit when ready

4. **Review results**: After completing all questions, see your final score and percentage

## Technical Details

- **Pure HTML/CSS/JavaScript**: No dependencies, frameworks, or build tools required
- **Web Audio API**: Real-time audio synthesis for notes and chords
- **Responsive Design**: Works on desktop and mobile browsers
- **Offline Capable**: Runs entirely in the browser with no server required

## Key Signatures Supported

All 12 major keys with chromatic notes and enharmonic spellings:
- C, Db, D, Eb, E, F, Gb, G, Ab, A, Bb, B
- Each key displays all 12 chromatic notes with appropriate enharmonic names
- Example: Bb key shows: Bb, B, C, Db, D, Eb, E, F, Gb, G, Ab, A

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

## Recent Updates

### Version 2.0
- ✅ **Chromatic Scale**: Expanded from 7-note major scale to all 12 chromatic notes
- ✅ **Speed Control**: Added adjustable playback speed (0.5x - 4x) with localStorage persistence
- ✅ **Enharmonic Spellings**: Proper note names based on key signature for all chromatic notes
- ✅ **Responsive Grid**: Updated to 6x2 button grid layout for 12 chromatic notes

## Future Enhancements

Potential features for future versions:
- Interval recognition mode
- Chord quality recognition
- Rhythm dictation
- Multiple instrument timbres
- Progress history tracking and statistics
- Export/import practice data
- Difficulty levels (restricted note ranges, common patterns)
- Custom chord progressions

---

**Made with ❤️ for musicians everywhere**
