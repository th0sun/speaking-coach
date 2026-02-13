// AI Coach System (Now uses backend API)
class AICoach {
    constructor() {
        this.backendURL = CONFIG.BACKEND_URL;
    }

    async analyzeSpeech(apiKey, audioBlob, transcript, duration, weekData, topicData, sessions = [], audioStats = null) {
        // Handle transcript properly with TIMING information
        let transcriptText = '';
        let timingInfo = '';
        let pauseAnalysis = '';;

        if (!transcript || (Array.isArray(transcript) && transcript.length === 0)) {
            transcriptText = '[ไม่มี transcript - Speech Recognition อาจไม่ทำงาน]';
            console.warn('⚠️ No transcript available for AI analysis');
        } else if (Array.isArray(transcript)) {
            // Build transcript with timing + pause detection
            const segments = [];
            const pauses = [];

            transcript.forEach((seg, index) => {
                const startSec = seg.startTime?.toFixed(1) || '0.0';
                const endSec = seg.endTime?.toFixed(1) || '0.0';

                // Add segment with timestamp
                segments.push(`[${startSec}s-${endSec}s] ${seg.text}`);

                // Detect pause before next segment
                if (index < transcript.length - 1) {
                    const nextSeg = transcript[index + 1];
                    const pauseDuration = (nextSeg.startTime || 0) - (seg.endTime || 0);

                    if (pauseDuration > 0.5) { // Pause > 0.5 วินาที
                        pauses.push({
                            after: seg.text.substring(0, 30) + '...',
                            duration: pauseDuration.toFixed(1),
                            position: `${endSec}s`
                        });
                        segments.push(`[PAUSE ${pauseDuration.toFixed(1)}s]`);
                    }
                }
            });

            transcriptText = segments.join('\n');

            // Summary of pauses
            if (pauses.length > 0) {
                pauseAnalysis = `\n**การหยุดพัก (${pauses.length} ครั้ง):**\n` +
                    pauses.map(p => `- หลัง "${p.after}" หยุด ${p.duration}s (ที่ ${p.position})`).join('\n');
            }

            // Timing summary
            const totalDuration = transcript[transcript.length - 1]?.endTime || duration;
            const speakingTime = transcript.reduce((sum, seg) => {
                return sum + ((seg.endTime || 0) - (seg.startTime || 0));
            }, 0);
            const pauseTime = totalDuration - speakingTime;

            timingInfo = `\n**สถิติการพูด:**
- เวลาพูดจริง: ${speakingTime.toFixed(1)}s (${(speakingTime / totalDuration * 100).toFixed(0)}%)
- เวลาหยุดพัก: ${pauseTime.toFixed(1)}s (${(pauseTime / totalDuration * 100).toFixed(0)}%)
- ความเร็วเฉลี่ย: ${(transcript.join(' ').split(' ').length / (speakingTime / 60)).toFixed(0)} คำ/นาที`;
        } else {
            transcriptText = String(transcript);
        }

        // ✨ Build previous feedback for progress comparison
        let previousFeedback = '';

        if (sessions && sessions.length > 0) {
            const recentSessions = sessions
                .filter(s => s.aiFeedback) // มี AI feedback
                .slice(-3)                  // เอา 3 sessions สุดท้าย
                .reverse();                 // ล่าสุดก่อน

            if (recentSessions.length > 0) {
                previousFeedback = `\n**📊 ประวัติการฝึกที่ผ่านมา (${recentSessions.length} sessions ล่าสุด):**\n\n`;

                recentSessions.forEach((session, index) => {
                    const fb = session.aiFeedback;
                    const sessionNum = recentSessions.length - index;

                    previousFeedback += `### Session ${sessionNum} (Day ${session.day}):
- Overall Score: ${fb.scores.overall}/10
- จุดแข็ง: ${fb.strengths.slice(0, 2).join(', ')}
- จุดที่ต้องปรับปรุง: ${fb.improvements.slice(0, 2).join(', ')}
- Pace: ${fb.pace?.overall || 'N/A'} (${fb.scores.pace || 'N/A'}/10)
- Pauses: ${fb.pauses?.totalPauses || 0} ครั้ง (${fb.scores.pauses || 'N/A'}/10)
- Root Cause: ${fb.rootCause?.primaryIssue || 'N/A'}

`;
                });

                previousFeedback += `\n**🎯 จุดสำคัญที่ต้องเฝ้าดู:**
- คุณได้รับคำแนะนำให้แก้ไข: ${recentSessions[0].aiFeedback.improvements.join(', ')}
- Root cause เดิม: ${recentSessions[0].aiFeedback.rootCause?.primaryIssue}
`;
            }
        }

        // 🎙️ Audio Handling
        let audioPart = null;
        if (audioBlob) {
            try {
                console.log('🎙️ Converting audio blob to base64...');
                const audioBase64 = await window.convertBlobToBase64(audioBlob);
                audioPart = {
                    inline_data: {
                        mime_type: "audio/webm",
                        data: audioBase64
                    }
                };
                console.log('✅ Audio ready for analysis');
            } catch (err) {
                console.error('❌ Failed to convert audio:', err);
            }
        }

        // 🔊 Audio Stats Integration
        let audioStatsText = '';
        if (audioStats) {
            audioStatsText = `\n**📊 สถิติเสียง (Audio Signal Metrics):**
- Volume (ความดัง): Avg ${audioStats.volume.avg}dB (Max ${audioStats.volume.max}dB)
  *คำแนะนำ: ปกติเสียงพูดควรอยู่ระหว่าง -20dB ถึง -10dB. ถ้าต่ำกว่า -30dB คือเบาเกินไป*
- Pitch (ความถี่เสียง): Avg ${audioStats.pitch.avg}Hz (Range ${audioStats.pitch.min}-${audioStats.pitch.max}Hz)
- Confidence (ความมั่นใจในการถอดความ): ${audioStats.confidence}%
`;
        }

        const prompt = `คุณคือโค้ชสอนการพูดมืออาชีพ วิเคราะห์การพูดต่อไปนี้อย่างละเอียดจาก**ไฟล์เสียงจริง**และ Transcript:

**หัวข้อ:** ${topicData.title} - ${topicData.desc}
**เป้าหมายสัปดาห์นี้:** ${weekData.goal}
**ระยะเวลา:** ${Math.floor(duration / 60)} นาที ${duration % 60} วินาที

**สิ่งที่ต้องวิเคราะห์จากเสียง (Audio Data):**
1. **น้ำเสียง (Tone):** ความมั่นใจ, ความเป็นธรรมชาติ, พลังเสียง
2. **จังหวะ (Pace):** ฟังจังหวะการพูดจริงๆ ว่าเร็ว/ช้า/เหมาะสม
3. **การหยุด (Pauses):** ฟัง Dead Air หรือการหยุดหายใจว่าเหมาะสมไหม
4. **ความชัดเจน (Clarity):** การออกเสียง ร.เรือ ล.ลิง และคำควบกล้ำ
5. **อารมณ์ (Emotion):** สื่อสารอารมณ์ได้ตรงกับเนื้อหาไหม
6. **คุณภาพเสียง (Signal Quality):** ดูจากค่า Volume/Pitch ที่แนบมา ว่าผู้พูดใช้เสียงได้เหมาะสมทางเทคนิคหรือไม่

**เนื้อหาที่พูด (Transcript อ้างอิง):**
${transcriptText}
${timingInfo}
${pauseAnalysis}
${audioStatsText}
${previousFeedback}

กรุณาวิเคราะห์อย่างละเอียดและให้ผลลัพธ์เป็น JSON:

{
  "sentences": [
    {
      "text": "ประโยคที่พูด",
      "purpose": "จุดประสงค์",
      "clarity": 7,
      "issues": ["ปัญหาที่พบ"]
    }
  ],
  "structure": {
    "hasIntro": true,
    "hasBody": true,
    "hasConclusion": false,
    "overallStructure": "อธิบายโครงสร้าง",
    "score": 6
  },
  "pace": {
    "overall": "เร็วเกินไป/พอดี/ช้าเกินไป",
    "wordsPerMinute": 150,
    "paceScore": 7,
    "paceIssues": ["พูดเร็วเกินไปในช่วงแรก", "ช้าลงในช่วงท้าย"]
  },
  "pauses": {
    "totalPauses": 5,
    "appropriatePauses": ["หลังจบประโยค", "ก่อนเปลี่ยนหัวข้อ"],
    "inappropriatePauses": ["กลางประโยค", "ขณะคิดคำพูด"],
    "pauseScore": 6,
    "pauseIssues": ["หยุดบ่อยเกินไป", "ไม่หยุดพอในจุดสำคัญ"]
  },
  "voiceQuality": { // NEW SECTION
    "volumeAnalysis": "เหมาะสม/เบาไป/ดังไป",
    "pitchAnalysis": "เป็นธรรมชาติ/Monotone/เสียงสูงไป",
    "suggestion": "คำแนะนำเรื่องการใช้เสียง"
  },
  "progression": {
    "comparedToPrevious": "ดีขึ้น/แย่ลง/เท่าเดิม/ครั้งแรก",
    "improvements": [
      "แก้จุดอ่อนเรื่อง X ได้แล้ว",
      "Pace ดีขึนกว่าครั้งก่อน"
    ],
    "stillNeedWork": [
      "ยังต้องปรับปรุงเร ื่อง Y",
      "Pauses ยังไม่เหมาะสม"
    ],
    "progressScore": 8,
    "progressNote": "คำอธิบายความก้าวหน้าโดยรวม"
  },
  "cognitivePatterns": {
    "thinkingStyle": "scattered/organized",
    "scopeControl": "expanding/controlled",
    "preparedness": "improvised/prepared",
    "issues": ["ไม่ได้คิดโครงสร้างก่อนพูด", "ขาด scope ที่ชัดเจน"]
  },
  "rootCause": {
    "primaryIssue": "ขาดการวางแผน",
    "whyYouSpokeThatWay": "พูดโดยไม่ได้คิดโครงสร้างล่วงหน้า",
    "deepInsights": ["insight1", "insight2"]
  },
  "scores": {
    "fluency": 7,
    "clarity": 6,
    "structure": 5,
    "pace": 7,
    "pauses": 6,
    "engagement": 7,
    "overall": 6.5
  },
  "strengths": ["จุดแข็ง1", "จุดแข็ง2", "จุดแข็ง3"],
  "improvements": ["ควรปรับปรุง1", "ควรปรับปรุง2", "ควรปรับปรุง3"],
  "nextSteps": "คำแนะนำ"
}

สิ่งสำคัญ:
- **Prioritize Audio & Metrics:** ให้ความสำคัญสิ่งที่ฟังได้จากเสียงและค่าสถิติ (Volume/Pitch) มากกว่า transcript
- แยกประโยคและวิเคราะห์ทีพละประโยค
- ดูว่ามีโครงสร้าง intro-body-conclusion หรือไม่
- **วิเคราะห์จังหวะการพูดจาก timestamp** (เร็ว/ช้า/สม่ำเสมอ)
- **วิเคราะห์การหยุดพัก** (เหมาะสม/ไม่เหมาะสม/บ่อยเกิน/น้อยเกิน)
- วิเคราะห์ว่าผู้พูดมีการวางแผน/คิดโครงสร้างก่อนพูดหรือไม่
- อธิบายว่าทำไมจึงพูดแบบนั้น
- **ให้คะแนน pace และ pauses แยกต่างหาก**
${sessions && sessions.length > 0 ? `
- **เปรียบเทียบกับ sessions ก่อนหน้า** (ดีขึ้น/แย่ลง/เท่าเดิม)
- **ชี้ให้เห็นว่าแก้จุดอ่อนเดิมได้หรือยัง**
- **ให้กำลังใจถ้าพัฒนาขึ้น หรือเตือนถ้ายังทำผิดเดิมซ้ำ**
- ให้คะแนน progressScore (0-10) โดยดูจากความพยายามแก้ไขจุดอ่อนเดิม
` : '- นี่เป็นครั้งแรก ให้วิเคราะห์เชิงลึกเพื่อเป็นพื้นฐานการเปรียบเทียบครั้งต่อไป'}`;

        try {
            console.log('🤖 Calling Analysis API...');
            console.log('📊 Audio Stats included:', audioStats);

            // Use backend API if audioBlob exists, otherwise call Gemini directly
            let response;

            if (audioBlob) {
                // Send to backend with audio file
                console.log('📤 Sending audio to backend for analysis...');
                const formData = new FormData();
                formData.append('audio', audioBlob, 'recording.webm');
                formData.append('prompt', prompt);

                response = await fetch(`${this.backendURL}/api/analyze`, {
                    method: 'POST',
                    body: formData
                });
            } else {
                // Fallback: Call Gemini API directly for text-only analysis
                console.log('🤖 No audio - calling Gemini API directly...');
                const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${apiKey}`;

                // Prepare Request Parts
                const parts = [];
                parts.push({ text: prompt });         // Add text prompt

                response = await fetch(endpoint, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        contents: [{
                            parts: parts
                        }]
                    })
                });
            }

            if (!response.ok) {
                console.error('❌ Gemini API Error:', response.status, response.statusText);
                const errorData = await response.json();
                console.error('Error details:', errorData);

                if (response.status === 404) {
                    alert('⚠️ ไม่พบ Model นี้ (404) - กรุณาตรวจสอบชื่อโมเดลใน config.js');
                } else if (response.status === 429) {
                    alert('⚠️ โควตาการใช้งานเต็ม (429) - กรุณารอสักครู่แล้วลองใหม่');
                } else {
                    alert(`เกิดข้อผิดพลาดในการเรียก AI (${response.status}): เช็ค API Key อีกครั้ง`);
                }
                return null;
            }

            const data = await response.json();

            // Check for direct backend response format or Gemini original format
            if (data.analysis) return data.analysis; // Backend simplified response if applicable

            if (!data.candidates || !data.candidates[0]) {
                console.error('⚠️ No valid response from API');
                return null;
            }

            const text = data.candidates[0].content.parts[0].text;

            // Extract JSON from response
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            if (jsonMatch) {
                return JSON.parse(jsonMatch[0]);
            }

            console.error('⚠️ No valid JSON found in AI response');
            return null;
        } catch (error) {
            console.error('❌ AI Analysis Error:', error);
            alert('เกิดข้อผิดพลาดในการเชื่อมต่อกับ AI');
            return null;
        }
    }
}

// Expose to window
window.AICoach = AICoach;
