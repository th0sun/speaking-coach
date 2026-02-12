# Developer Guide - Speaking Coach Pro

## Overview
This guide provides technical information for developers who want to enhance and extend the Speaking Coach Pro AI system.

---

## Future Enhancements: Advanced Audio Metadata

To make this speech training system even more intelligent and accurate, future versions can incorporate additional metadata analysis. Here are key improvements you can implement:

### 1. **Confidence Score (ความมั่นใจในการถอดความ)**

**What it is:**
- A metric (0-100%) indicating how confident the Speech Recognition system is when transcribing each word or phrase

**Why it matters:**
- **Low confidence (< 60%)**: Indicates the speaker might be:
  - Mumbling or speaking unclearly
  - Speaking with an unclear accent
  - Having poor pronunciation
  - Speaking too softly or with background noise

**How to implement:**
```python
# Backend pseudo-code for analyzing confidence scores
def analyze_confidence_score(transcript_with_scores):
    """
    Input: Array of transcribed words with confidence scores
    Example: [
        {"word": "hello", "confidence": 0.95},
        {"word": "world", "confidence": 0.65},  # Low confidence
    ]
    """
    low_confidence_words = [
        w for w in transcript if w['confidence'] < 0.6
    ]
    
    analysis = {
        "clarity_issues": low_confidence_words,
        "average_confidence": sum(w['confidence'] for w in transcript) / len(transcript),
        "recommendation": "Practice these words with clearer pronunciation"
    }
    return analysis
```

**Expected improvements:**
- Identify specific words that are hard to understand
- Give targeted pronunciation feedback
- Detect mumbling patterns
- Measure clarity improvement over sessions

---

### 2. **Decibel Level (ระดับเสียง) - Volume Analysis**

**What it is:**
- Measures the sound pressure level (dB) at different points in the recording
- Tracks whether the speaker is speaking too softly, too loudly, or consistently

**Why it matters:**
- **Too quiet (< 40 dB)**: Audience can't hear clearly
  - Shows lack of confidence
  - Indicates poor stage presence
  - May be interpreted as uncertainty
  
- **Too loud (> 80 dB)**: Sounds aggressive or shouting
  - Can be overwhelming for listeners
  - Suggests lack of vocal control
  
- **Inconsistent**: Volume fluctuations
  - Shows nervous energy
  - Indicates focus shifts

**How to implement:**
```python
# Backend pseudo-code for volume analysis
import librosa
import numpy as np

def analyze_decibel_levels(audio_data, sample_rate):
    """
    Analyze volume patterns throughout the recording
    """
    # Calculate RMS (Root Mean Square) energy
    S = librosa.feature.melspectrogram(y=audio_data, sr=sample_rate)
    log_S = librosa.power_to_db(S, ref=np.max)
    
    # Get average dB per 500ms window
    window_size = sample_rate // 2  # 500ms
    windows = [
        np.mean(log_S[:, i:i+window_size]) 
        for i in range(0, log_S.shape[1], window_size)
    ]
    
    analysis = {
        "average_volume": np.mean(windows),
        "min_volume": np.min(windows),
        "max_volume": np.max(windows),
        "volume_consistency": np.std(windows),
        "timeline": windows,
        "issues": identify_volume_issues(windows)
    }
    return analysis

def identify_volume_issues(windows):
    issues = []
    if np.min(windows) < 40:
        issues.append("Speaking too quietly in some sections")
    if np.max(windows) > 80:
        issues.append("Shouting or speaking too loudly")
    if np.std(windows) > 15:
        issues.append("Volume is inconsistent - work on steady projection")
    return issues
```

**Expected improvements:**
- Give real-time volume feedback during practice
- Identify sections where the speaker loses confidence (quiet parts)
- Recommend vocal projection exercises
- Track consistency in volume control over time

**Timeline visualization:**
```
[================================] Overall: 65 dB (Good)
Time: 0:00  [==]  0:05  [===]  0:10  [==]  0:15  [====]  0:20
              60        65         62         70
```

---

### 3. **Pitch (ความถี่เสียง) - Voice Frequency Analysis**

**What it is:**
- Measures the fundamental frequency (Hz) of the speaker's voice
- Tracks how high or low the voice is and how it changes

**Why it matters:**
- **Monotone speech**: 
  - Shows lack of engagement
  - Boring for audience
  - No emotional expression

- **Appropriate pitch variation**:
  - Shows confidence and engagement
  - More interesting and persuasive
  - Better audience connection

- **Pitch patterns** reveal:
  - Questions (upward pitch at end)
  - Statements (stable/downward pitch)
  - Emotional state (anxiety = higher pitch)

**How to implement:**
```python
# Backend pseudo-code for pitch analysis
import librosa
import librosa.yt_dlp

def analyze_pitch(audio_data, sample_rate):
    """
    Extract pitch/fundamental frequency using PYIN algorithm
    """
    # Use PYIN for robust pitch estimation
    f0, voiced_flag, voiced_probs = librosa.pyin(
        audio_data,
        fmin=librosa.note_to_hz('C2'),
        fmax=librosa.note_to_hz('C7'),
        sr=sample_rate
    )
    
    # Calculate pitch statistics per 1-second window
    window_size = sample_rate
    pitch_stats = []
    
    for i in range(0, len(f0), window_size):
        window = f0[i:i+window_size]
        valid_pitches = window[~np.isnan(window)]
        
        if len(valid_pitches) > 0:
            pitch_stats.append({
                "time": i / sample_rate,
                "average_hz": np.mean(valid_pitches),
                "note": hz_to_note(np.mean(valid_pitches)),
                "variance": np.std(valid_pitches),
                "voicing_ratio": np.sum(voiced_flag[i:i+window_size]) / len(voiced_flag[i:i+window_size])
            })
    
    analysis = {
        "average_pitch": np.nanmean(f0),
        "pitch_range": [np.nanmin(f0), np.nanmax(f0)],
        "pitch_variation": np.nanstd(f0),
        "pitch_timeline": pitch_stats,
        "monotone_risk": calculate_monotone_risk(f0)
    }
    return analysis

def hz_to_note(frequency):
    """Convert frequency to musical note"""
    A4 = 440
    C0 = A4 * pow(2, -4.75)
    h = 12 * np.log2(frequency / C0)
    octave = int(h) // 12
    note = int(h) % 12
    notes = ['C', 'C#', 'D', 'D#', 'E', 'F', 'F#', 'G', 'G#', 'A', 'A#', 'B']
    return f"{notes[note]}{octave}"

def calculate_monotone_risk(f0):
    """Assess if speech is too monotone"""
    valid_f0 = f0[~np.isnan(f0)]
    pitch_variation = np.std(valid_f0)
    
    if pitch_variation < 20:  # Hz
        return "HIGH - Very monotone, add more expression"
    elif pitch_variation < 50:
        return "MEDIUM - Somewhat monotone, could use more variety"
    else:
        return "LOW - Good pitch variation, sounds engaging"
```

**Expected improvements:**
- Detect and flag monotone delivery
- Show pitch variation patterns over time
- Identify emotional states from pitch
- Give exercises to improve vocal variety
- Track confidence levels (anxiety = pitch rise)

**Visualization example:**
```
Pitch Timeline (Male Speaker Average: 120 Hz):
[====C3===] 0:00-0:05  (Confident start)
[======C4======] 0:05-0:10  (Question - pitch rise)
[===B3===] 0:10-0:15  (Back to normal)
[==============A3==============] 0:15-0:20  (Concerned/uncertain)

Analysis: Pitch rises when asking questions - natural and good!
```

---

## Implementation Timeline

### Phase 1 (Current)
- ✅ Audio file reception and processing
- ✅ Text transcript analysis
- ✅ Pause detection

### Phase 2 (Next)
- [ ] Implement Confidence Score analysis
- [ ] Add simple volume level detection
- [ ] Basic monotone detection

### Phase 3 (Future)
- [ ] Full pitch analysis with librosa
- [ ] Advanced emotion detection from voice
- [ ] Real-time visual feedback during recording
- [ ] ML-based accent detection
- [ ] Voice stress analysis

---

## API Extension Points

### Current /api/analyze Endpoint
```
POST /api/analyze
Content-Type: multipart/form-data

Parameters:
- audio: Binary audio file (webm, mp3, wav, ogg)
- prompt: Analysis prompt (JSON string)

Returns: JSON with AI analysis
```

### Future Enhancement: /api/analyze/detailed
```
POST /api/analyze/detailed
Content-Type: multipart/form-data

Parameters:
- audio: Binary audio file
- prompt: Analysis prompt
- metadata: {
    "extractConfidenceScores": true,
    "analyzeDbeLevel": true,
    "extractPitch": true
  }

Returns: JSON with detailed audio metrics + AI analysis
```

---

## Dependencies for Future Enhancements

```txt
# Add to requirements.txt for Phase 2+
librosa>=0.10.0        # Audio feature extraction
numpy>=1.24.0          # Numerical computing
scipy>=1.10.0          # Scientific computing
pydub>=0.25.1          # Audio processing
soundfile>=0.12.0      # WAV file support
```

---

## Testing New Features

When implementing new metadata features:

1. **Unit Tests** - Test each audio analysis function separately
2. **Integration Tests** - Test with the Gemini API integration
3. **Sample Data** - Create test recordings with:
   - Clear speech / Mumbling
   - Loud / Soft speaking
   - Monotone / Expressive delivery
4. **Performance Testing** - Ensure analysis completes within 30-60 seconds

---

## Best Practices

1. **Async Processing** - Audio analysis can be slow; consider background tasks
2. **Caching** - Cache analysis results to avoid reprocessing
3. **Error Handling** - Gracefully handle malformed audio files
4. **User Feedback** - Show progress indicators during analysis
5. **Privacy** - Don't store raw audio; only keep analysis results

---

## References

- [Librosa Documentation](https://librosa.org/)
- [PYIN Algorithm for Pitch Extraction](https://librosa.org/doc/main/generated/librosa.pyin.html)
- [Decibel Scale Explanation](https://www.nti-audio.com/en/support/know-how/frequency-loudness-decibel)
- [Gemini API Audio Support](https://ai.google.dev/gemini-api/docs/vision)

---

**Last Updated:** 2026-02-13  
**Version:** 1.0
