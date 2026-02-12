const { useState, useEffect, useRef } = React;

// --- Auth Components ---
const AuthView = ({ onLogin, onGuest }) => {
    const [isRegister, setIsRegister] = useState(false);
    const [username, setUsername] = useState('');
    const [pin, setPin] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);

        const endpoint = isRegister ? '/api/register' : '/api/login';
        const payload = { username, pin };

        try {
            const response = await fetch(`${CONFIG.BACKEND_URL}${endpoint}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || 'Authentication failed');
            }

            if (isRegister) {
                // Auto-login after register
                alert('สมัครสมาชิกสำเร็จ! กรุณาเข้าสู่ระบบ');
                setIsRegister(false);
                setPin('');
            } else {
                onLogin(data.user, data.data);
            }
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
            <div className="glass-effect p-8 rounded-3xl shadow-2xl w-full max-w-md">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-purple-800 mb-2">Speaking Coach</h1>
                    <p className="text-gray-600">Zero to Hero in 30 Days</p>
                </div>

                <div className="flex bg-gray-100 rounded-xl p-1 mb-6">
                    <button
                        className={`flex-1 py-2 rounded-lg font-semibold transition ${!isRegister ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}
                        onClick={() => { setIsRegister(false); setError(''); }}
                    >
                        เข้าสู่ระบบ
                    </button>
                    <button
                        className={`flex-1 py-2 rounded-lg font-semibold transition ${isRegister ? 'bg-white shadow text-purple-700' : 'text-gray-500'}`}
                        onClick={() => { setIsRegister(true); setError(''); }}
                    >
                        สมัครสมาชิก
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Username (ภาษาอังกฤษ)</label>
                        <input
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none"
                            placeholder="เช่น thesun"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">PIN (ตัวเลข 6 หลัก)</label>
                        <input
                            type="password"
                            value={pin}
                            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-purple-500 focus:outline-none tracking-widest text-center text-2xl"
                            placeholder="••••••"
                            required
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm text-center bg-red-50 p-2 rounded-lg">{error}</p>}

                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 rounded-xl font-bold shadow-lg hover:opacity-90 transition disabled:opacity-50"
                    >
                        {isLoading ? 'กำลังโหลด...' : (isRegister ? 'สมัครสมาชิก' : 'เข้าสู่ระบบ')}
                    </button>
                </form>

                <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                        onClick={onGuest}
                        className="w-full py-2 text-gray-500 font-medium hover:text-purple-600 transition"
                    >
                        ใช้งานแบบไม่ล็อคอิน (ข้อมูลจะอยู่ในเครื่องนี้เท่านั้น)
                    </button>
                </div>

                <div className="mt-4 text-center">
                    <p className="text-xs text-gray-400">
                        ระบบจะเก็บข้อมูลของคุณไว้อย่างปลอดภัยและสามารถเข้าใช้งานได้จากทุกเครื่อง
                    </p>
                </div>
            </div>
        </div>
    );
};


// ข้อมูลหลักสูตร (เหมือนเดิม แต่เพิ่มเติม AI criteria)
const TRAINING_DATA = {
    week1: {
        name: "SURVIVAL MODE",
        goal: "แก้ Dead Air + สร้างความคล่อง",
        aiCriteria: {
            fluency: 40,
            clarity: 30,
            structure: 10,
            engagement: 20
        },
        powerWords: [
            {
                day: 1, words: [
                    { word: "กรอบความคิด", meaning: "โครงสร้างการคิด/แนวทาง", example: "กรอบความคิดที่ผมใช้คือ..." },
                    { word: "มุมมอง", meaning: "ทัศนคติ/มุมมองในการมองสิ่งต่างๆ", example: "ถ้ามองในมุมมองอื่น อาจเห็นว่า..." },
                    { word: "บริบท", meaning: "สถานการณ์โดยรอบ", example: "ในบริบทของสังคมไทย..." }
                ]
            },
            {
                day: 2, words: [
                    { word: "กรอบความคิด", meaning: "โครงสร้างการคิด/แนวทาง", example: "กรอบความคิดที่ผมใช้คือ..." },
                    { word: "มุมมอง", meaning: "ทัศนคติ/มุมมองในการมองสิ่งต่างๆ", example: "ถ้ามองในมุมมองอื่น อาจเห็นว่า..." },
                    { word: "บริบท", meaning: "สถานการณ์โดยรอบ", example: "ในบริบทของสังคมไทย..." }
                ]
            },
            {
                day: 3, words: [
                    { word: "หลักการ", meaning: "ทฤษฎีพื้นฐาน", example: "หลักการสำคัญคือ..." },
                    { word: "แก่นแท้", meaning: "สาระสำคัญ", example: "แก่นแท้ของเรื่องนี้คือ..." },
                    { word: "นัยสำคัญ", meaning: "ผลกระทบที่ตามมา", example: "นัยสำคัญของเรื่องนี้คือ..." }
                ]
            },
            {
                day: 4, words: [
                    { word: "หลักการ", meaning: "ทฤษฎีพื้นฐาน", example: "หลักการสำคัญคือ..." },
                    { word: "แก่นแท้", meaning: "สาระสำคัญ", example: "แก่นแท้ของเรื่องนี้คือ..." },
                    { word: "นัยสำคัญ", meaning: "ผลกระทบที่ตามมา", example: "นัยสำคัญของเรื่องนี้คือ..." }
                ]
            },
            {
                day: 5, words: [
                    { word: "กลไก", meaning: "วิธีการทำงาน", example: "กลไกที่ทำให้เกิดคือ..." },
                    { word: "ปัจจัย", meaning: "สิ่งที่มีผลต่อ", example: "ปัจจัยสำคัญมี 3 ข้อ..." },
                    { word: "แนวโน้ม", meaning: "ทิศทางในอนาคต", example: "แนวโน้มที่น่าสนใจคือ..." }
                ]
            },
            {
                day: 6, words: [
                    { word: "กลไก", meaning: "วิธีการทำงาน", example: "กลไกที่ทำให้เกิดคือ..." },
                    { word: "ปัจจัย", meaning: "สิ่งที่มีผลต่อ", example: "ปัจจัยสำคัญมี 3 ข้อ..." },
                    { word: "แนวโน้ม", meaning: "ทิศทางในอนาคต", example: "แนวโน้มที่น่าสนใจคือ..." }
                ]
            },
            {
                day: 7, words: [
                    { word: "กลไก", meaning: "วิธีการทำงาน", example: "กลไกที่ทำให้เกิดคือ..." },
                    { word: "ปัจจัย", meaning: "สิ่งที่มีผลต่อ", example: "ปัจจัยสำคัญมี 3 ข้อ..." },
                    { word: "แนวโน้ม", meaning: "ทิศทางในอนาคต", example: "แนวโน้มที่น่าสนใจคือ..." }
                ]
            }
        ],
        topics: [
            { day: 1, title: "Mirror Talk", desc: "แนะนำตัวเอง 1 นาที ไม่หยุด", duration: 1, type: "basic" },
            { day: 2, title: "Mirror Talk", desc: "แนะนำตัวเอง 1 นาที ไม่หยุด", duration: 1, type: "basic" },
            { day: 3, title: "Object Description", desc: "อธิบายของในมือ 2 นาที", duration: 2, type: "basic" },
            { day: 4, title: "Object Description", desc: "อธิบายของในมือ 2 นาที", duration: 2, type: "basic" },
            { day: 5, title: "Free Flow", desc: "พูดเรื่องอะไรก็ได้ 2 นาที", duration: 2, type: "challenge" },
            { day: 6, title: "Phone Recording", desc: "อัดเสียง พูดเรื่องวันนี้ 2 นาที", duration: 2, type: "challenge" },
            { day: 7, title: "MINI CHALLENGE", desc: "หน้ากล้อง: ทำไมฉันอยากเก่งพูด", duration: 2, type: "challenge" }
        ]
    },
    week2: {
        name: "STRUCTURE MODE",
        goal: "พูดแบบมีระบบ ใช้ Framework",
        aiCriteria: {
            fluency: 25,
            clarity: 25,
            structure: 35,
            engagement: 15
        },
        powerWords: [
            {
                day: 8, words: [
                    { word: "First Principles", meaning: "คิดจากหลักการพื้นฐาน", example: "ถ้าคิดตาม First Principles..." },
                    { word: "Trade-off", meaning: "แลกเปลี่ยน ได้อย่างเสียอย่าง", example: "Trade-off ของการเลือกนี้คือ..." },
                    { word: "Second-Order Effect", meaning: "ผลกระทบระดับ 2-3", example: "ผลกระทบระดับที่สองคือ..." }
                ]
            },
            {
                day: 9, words: [
                    { word: "First Principles", meaning: "คิดจากหลักการพื้นฐาน", example: "ถ้าคิดตาม First Principles..." },
                    { word: "Trade-off", meaning: "แลกเปลี่ยน ได้อย่างเสียอย่าง", example: "Trade-off ของการเลือกนี้คือ..." },
                    { word: "Second-Order Effect", meaning: "ผลกระทบระดับ 2-3", example: "ผลกระทบระดับที่สองคือ..." }
                ]
            },
            {
                day: 10, words: [
                    { word: "First Principles", meaning: "คิดจากหลักการพื้นฐาน", example: "ถ้าคิดตาม First Principles..." },
                    { word: "Trade-off", meaning: "แลกเปลี่ยน ได้อย่างเสียอย่าง", example: "Trade-off ของการเลือกนี้คือ..." },
                    { word: "Second-Order Effect", meaning: "ผลกระทบระดับ 2-3", example: "ผลกระทบระดับที่สองคือ..." }
                ]
            },
            {
                day: 11, words: [
                    { word: "Feedback Loop", meaning: "วงจรย้อนกลับ", example: "นี่คือ Feedback Loop ที่..." },
                    { word: "Asymmetry", meaning: "ความไม่สมดุล", example: "ความไม่สมดุลที่เห็นได้ชัดคือ..." },
                    { word: "Leverage", meaning: "คันโยก/จุดทรงพลัง", example: "Leverage point ที่สำคัญคือ..." }
                ]
            },
            {
                day: 12, words: [
                    { word: "Feedback Loop", meaning: "วงจรย้อนกลับ", example: "นี่คือ Feedback Loop ที่..." },
                    { word: "Asymmetry", meaning: "ความไม่สมดุล", example: "ความไม่สมดุลที่เห็นได้ชัดคือ..." },
                    { word: "Leverage", meaning: "คันโยก/จุดทรงพลัง", example: "Leverage point ที่สำคัญคือ..." }
                ]
            },
            {
                day: 13, words: [
                    { word: "Feedback Loop", meaning: "วงจรย้อนกลับ", example: "นี่คือ Feedback Loop ที่..." },
                    { word: "Asymmetry", meaning: "ความไม่สมดุล", example: "ความไม่สมดุลที่เห็นได้ชัดคือ..." },
                    { word: "Leverage", meaning: "คันโยก/จุดทรงพลัง", example: "Leverage point ที่สำคัญคือ..." }
                ]
            },
            {
                day: 14, words: [
                    { word: "Feedback Loop", meaning: "วงจรย้อนกลับ", example: "นี่คือ Feedback Loop ที่..." },
                    { word: "Asymmetry", meaning: "ความไม่สมดุล", example: "ความไม่สมดุลที่เห็นได้ชัดคือ..." },
                    { word: "Leverage", meaning: "คันโยก/จุดทรงพลัง", example: "Leverage point ที่สำคัญคือ..." }
                ]
            }
        ],
        topics: [
            { day: 8, title: "PREP: ทำไมคนควรออกกำลังกาย", desc: "ใช้ PREP Framework", duration: 3, framework: "PREP" },
            { day: 9, title: "PREP: ทำไมควรอ่านหนังสือ", desc: "ใช้ PREP Framework", duration: 3, framework: "PREP" },
            { day: 10, title: "3-Act: ประสบการณ์ที่ทำให้คุณเปลี่ยน", desc: "ใช้ 3-Act Structure", duration: 3, framework: "3-Act" },
            { day: 11, title: "3-Act: ความผิดพลาดที่ใหญ่ที่สุด", desc: "ใช้ 3-Act Structure", duration: 3, framework: "3-Act" },
            { day: 12, title: "SBI: ปัญหาที่เจอ + วิธีแก้", desc: "ใช้ SBI Framework", duration: 3, framework: "SBI" },
            { day: 13, title: "SBI: โปรเจกต์ที่ภูมิใจ", desc: "ใช้ SBI Framework", duration: 3, framework: "SBI" },
            { day: 14, title: "WEEKLY CHALLENGE", desc: "พูด 3 นาที ใช้ PREP", duration: 3, type: "challenge" }
        ]
    },
    week3: {
        name: "STORYTELLING MODE",
        goal: "ทำให้คนอยากฟัง มีอารมณ์",
        aiCriteria: {
            fluency: 20,
            clarity: 20,
            structure: 25,
            engagement: 35
        },
        powerWords: [
            {
                day: 15, words: [
                    { word: "ย้อนกลับไป...", meaning: "เริ่มเล่าเรื่อง", example: "ย้อนกลับไปเมื่อ 5 ปีก่อน..." },
                    { word: "สิ่งที่น่าสนใจคือ...", meaning: "ดึงดูดความสนใจ", example: "สิ่งที่น่าสนใจคือผมไม่คิดว่า..." },
                    { word: "ที่แปลกคือ...", meaning: "สร้าง Curiosity", example: "ที่แปลกคือทุกคนคิดว่า..." }
                ]
            },
            {
                day: 16, words: [
                    { word: "ย้อนกลับไป...", meaning: "เริ่มเล่าเรื่อง", example: "ย้อนกลับไปเมื่อ 5 ปีก่อน..." },
                    { word: "สิ่งที่น่าสนใจคือ...", meaning: "ดึงดูดความสนใจ", example: "สิ่งที่น่าสนใจคือผมไม่คิดว่า..." },
                    { word: "ที่แปลกคือ...", meaning: "สร้าง Curiosity", example: "ที่แปลกคือทุกคนคิดว่า..." }
                ]
            },
            {
                day: 17, words: [
                    { word: "ย้อนกลับไป...", meaning: "เริ่มเล่าเรื่อง", example: "ย้อนกลับไปเมื่อ 5 ปีก่อน..." },
                    { word: "สิ่งที่น่าสนใจคือ...", meaning: "ดึงดูดความสนใจ", example: "สิ่งที่น่าสนใจคือผมไม่คิดว่า..." },
                    { word: "ที่แปลกคือ...", meaning: "สร้าง Curiosity", example: "ที่แปลกคือทุกคนคิดว่า..." }
                ]
            },
            {
                day: 18, words: [
                    { word: "ถ้าให้เปรียบเทียบ...", meaning: "ใช้ Metaphor", example: "ถ้าให้เปรียบเทียบก็เหมือน..." },
                    { word: "ประเด็นก็คือ...", meaning: "ไปหาจุดสำคัญ", example: "ประเด็นก็คือเราต้อง..." },
                    { word: "แต่ความจริงคือ...", meaning: "Plot Twist", example: "แต่ความจริงคือไม่ใช่อย่างนั้น..." }
                ]
            },
            {
                day: 19, words: [
                    { word: "ถ้าให้เปรียบเทียบ...", meaning: "ใช้ Metaphor", example: "ถ้าให้เปรียบเทียบก็เหมือน..." },
                    { word: "ประเด็นก็คือ...", meaning: "ไปหาจุดสำคัญ", example: "ประเด็นก็คือเราต้อง..." },
                    { word: "แต่ความจริงคือ...", meaning: "Plot Twist", example: "แต่ความจริงคือไม่ใช่อย่างนั้น..." }
                ]
            },
            {
                day: 20, words: [
                    { word: "ถ้าให้เปรียบเทียบ...", meaning: "ใช้ Metaphor", example: "ถ้าให้เปรียบเทียบก็เหมือน..." },
                    { word: "ประเด็นก็คือ...", meaning: "ไปหาจุดสำคัญ", example: "ประเด็นก็คือเราต้อง..." },
                    { word: "แต่ความจริงคือ...", meaning: "Plot Twist", example: "แต่ความจริงคือไม่ใช่อย่างนั้น..." }
                ]
            },
            {
                day: 21, words: [
                    { word: "ถ้าให้เปรียบเทียบ...", meaning: "ใช้ Metaphor", example: "ถ้าให้เปรียบเทียบก็เหมือน..." },
                    { word: "ประเด็นก็คือ...", meaning: "ไปหาจุดสำคัญ", example: "ประเด็นก็คือเราต้อง..." },
                    { word: "แต่ความจริงคือ...", meaning: "Plot Twist", example: "แต่ความจริงคือไม่ใช่อย่างนั้น..." }
                ]
            }
        ],
        topics: [
            { day: 15, title: "Hook Practice", desc: "เปิดเรื่องให้ปัง: ชีวิตของผม", duration: 3, technique: "Hook" },
            { day: 16, title: "Hook Practice", desc: "เปิดเรื่องให้ปัง: สิ่งที่คนไม่รู้เกี่ยวกับผม", duration: 3, technique: "Hook" },
            { day: 17, title: "Emotion: Excited", desc: "เล่าเรื่องด้วยความตื่นเต้น", duration: 3, technique: "Emotion" },
            { day: 18, title: "Emotion: Thoughtful", desc: "เล่าเรื่องด้วยความใคร่คิด", duration: 3, technique: "Emotion" },
            { day: 19, title: "Pause & Pace", desc: "ใช้จังหวะ: บทเรียนสำคัญ", duration: 4, technique: "Timing" },
            { day: 20, title: "Pause & Pace", desc: "ใช้จังหวะ: เรื่องที่รู้สึกภูมิใจ", duration: 4, technique: "Timing" },
            { day: 21, title: "WEEKLY CHALLENGE", desc: "เล่าเรื่อง: บทเรียนชีวิต", duration: 4, type: "challenge" }
        ]
    },
    week4: {
        name: "CHARISMA MODE",
        goal: "มั่นใจ มีพลัง พร้อมลงคอนเทนต์จริง",
        aiCriteria: {
            fluency: 20,
            clarity: 20,
            structure: 20,
            engagement: 40
        },
        powerWords: [
            {
                day: 22, words: [
                    { word: "คุณเคยสงสัยไหมว่า...", meaning: "Rhetorical Question", example: "คุณเคยสงสัยไหมว่าทำไม..." },
                    { word: "มี 3 สิ่ง...", meaning: "Power of Three", example: "มี 3 สิ่งที่สำคัญ: 1) 2) 3)" },
                    { word: "ไม่ใช่... แต่เป็น...", meaning: "Contrast", example: "ไม่ใช่เรื่องของ... แต่เป็นเรื่องของ..." }
                ]
            },
            {
                day: 23, words: [
                    { word: "คุณเคยสงสัยไหมว่า...", meaning: "Rhetorical Question", example: "คุณเคยสงสัยไหมว่าทำไม..." },
                    { word: "มี 3 สิ่ง...", meaning: "Power of Three", example: "มี 3 สิ่งที่สำคัญ: 1) 2) 3)" },
                    { word: "ไม่ใช่... แต่เป็น...", meaning: "Contrast", example: "ไม่ใช่เรื่องของ... แต่เป็นเรื่องของ..." }
                ]
            },
            {
                day: 24, words: [
                    { word: "คุณเคยสงสัยไหมว่า...", meaning: "Rhetorical Question", example: "คุณเคยสงสัยไหมว่าทำไม..." },
                    { word: "มี 3 สิ่ง...", meaning: "Power of Three", example: "มี 3 สิ่งที่สำคัญ: 1) 2) 3)" },
                    { word: "ไม่ใช่... แต่เป็น...", meaning: "Contrast", example: "ไม่ใช่เรื่องของ... แต่เป็นเรื่องของ..." }
                ]
            },
            {
                day: 25, words: [
                    { word: "สิ่งที่ผมเรียนรู้คือ...", meaning: "Personal Insight", example: "สิ่งที่ผมเรียนรู้คือ..." },
                    { word: "ลองคิดดูว่า...", meaning: "Call to Action", example: "ลองคิดดูว่าถ้า..." },
                    { word: "สุดท้ายแล้ว...", meaning: "Conclusion", example: "สุดท้ายแล้วมันก็คือ..." }
                ]
            },
            {
                day: 26, words: [
                    { word: "สิ่งที่ผมเรียนรู้คือ...", meaning: "Personal Insight", example: "สิ่งที่ผมเรียนรู้คือ..." },
                    { word: "ลองคิดดูว่า...", meaning: "Call to Action", example: "ลองคิดดูว่าถ้า..." },
                    { word: "สุดท้ายแล้ว...", meaning: "Conclusion", example: "สุดท้ายแล้วมันก็คือ..." }
                ]
            },
            {
                day: 27, words: [
                    { word: "สิ่งที่ผมเรียนรู้คือ...", meaning: "Personal Insight", example: "สิ่งที่ผมเรียนรู้คือ..." },
                    { word: "ลองคิดดูว่า...", meaning: "Call to Action", example: "ลองคิดดูว่าถ้า..." },
                    { word: "สุดท้ายแล้ว...", meaning: "Conclusion", example: "สุดท้ายแล้วมันก็คือ..." }
                ]
            },
            {
                day: 28, words: [
                    { word: "[สร้างวลีประจำตัว]", meaning: "Signature Phrase", example: "สร้างวลีที่เป็นเอกลักษณ์ของคุณ" }
                ]
            },
            {
                day: 29, words: [
                    { word: "[สร้างวลีประจำตัว]", meaning: "Signature Phrase", example: "สร้างวลีที่เป็นเอกลักษณ์ของคุณ" }
                ]
            },
            {
                day: 30, words: [
                    { word: "[สร้างวลีประจำตัว]", meaning: "Signature Phrase", example: "สร้างวลีที่เป็นเอกลักษณ์ของคุณ" }
                ]
            }
        ],
        topics: [
            { day: 22, title: "Camera Confidence", desc: "พูดดูตรงกล้อง: แนะนำตัวแบบมืออาชีพ", duration: 5, focus: "Eye Contact" },
            { day: 23, title: "Camera Confidence", desc: "พูดดูตรงกล้อง: ทำไมควรติดตามคุณ", duration: 5, focus: "Body Language" },
            { day: 24, title: "Energy Level 7/10", desc: "พูดด้วยพลังระดับสูง", duration: 5, focus: "Energy" },
            { day: 25, title: "Energy Level 9/10", desc: "พูดด้วยพลังเต็มที่", duration: 5, focus: "Energy" },
            { day: 26, title: "Style Test: Casual", desc: "ทดลองสไตล์แบบสบายๆ", duration: 5, focus: "Style" },
            { day: 27, title: "Style Test: Professional", desc: "ทดลองสไตล์แบบมืออาชีพ", duration: 5, focus: "Style" },
            { day: 28, title: "CONTENT CREATION", desc: "สร้างคอนเทนต์จริง 5 นาที", duration: 5, type: "challenge" },
            { day: 29, title: "CONTENT CREATION", desc: "สร้างคอนเทนต์จริง (ปรับปรุง)", duration: 5, type: "challenge" },
            { day: 30, title: "🎯 FINAL BOSS", desc: "ลงคอนเทนต์จริง / Go Live!", duration: 10, type: "final" }
        ]
    }
};

// Helper: Convert Blob to Base64
async function convertBlobToBase64(blob) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
            const base64 = reader.result.split(',')[1]; // Remove data:audio/webm;base64, prefix
            resolve(base64);
        };
        reader.onerror = reject;
        reader.readAsDataURL(blob);
    });
}

// AI Coach System (Now uses backend API)
class AICoach {
    constructor() {
        this.backendURL = CONFIG.BACKEND_URL;
    }

    async analyzeSpeech(apiKey, audioBlob, transcript, duration, weekData, topicData, sessions = []) {
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
                const audioBase64 = await convertBlobToBase64(audioBlob);
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

        const prompt = `คุณคือโค้ชสอนการพูดมืออาชีพ วิเคราะห์การพูดต่อไปนี้อย่างละเอียดจาก**ไฟล์เสียงจริง**และ Transcript:

**หัวข้อ:** ${topicData.title} - ${topicData.desc}
**เป้าหมายสัปดาห์นี้:** ${weekData.goal}
**ระยะเวลา:** ${Math.floor(duration / 60)} นาที ${duration % 60} วินาที

**สิ่งที่ต้องวิเคราะห์จากเสียง (Audio):**
1. **น้ำเสียง (Tone):** ความมั่นใจ, ความเป็นธรรมชาติ, พลังเสียง
2. **จังหวะ (Pace):** ฟังจังหวะการพูดจริงๆ ว่าเร็ว/ช้า/เหมาะสม
3. **การหยุด (Pauses):** ฟัง Dead Air หรือการหยุดหายใจว่าเหมาะสมไหม
4. **ความชัดเจน (Clarity):** การออกเสียง ร.เรือ ล.ลิง และคำควบกล้ำ
5. **อารมณ์ (Emotion):** สื่อสารอารมณ์ได้ตรงกับเนื้อหาไหม

**เนื้อหาที่พูด (Transcript อ้างอิง):**
${transcriptText}
${timingInfo}
${pauseAnalysis}
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
- **Prioritize Audio:** ให้ความสำคัญสิ่งที่ฟังได้จากเสียงมากกว่า transcript
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

// Main App Component
function App() {
    // --- Auth State ---
    const [user, setUser] = useState(null); // null = not logged in
    const [isAuthChecking, setIsAuthChecking] = useState(true);

    // --- Critical State ---
    const [currentDay, setCurrentDay] = useState(1);
    const [currentView, setCurrentView] = useState('dashboard');
    const [timer, setTimer] = useState(0);
    const [isTimerRunning, setIsTimerRunning] = useState(false);
    const [sessions, setSessions] = useState([]);
    const [todayCompleted, setTodayCompleted] = useState(false);

    // API Key Management (Multi-key support)
    const [apiKeys, setApiKeys] = useState([]);
    const [activeKeyId, setActiveKeyId] = useState(null);

    const [isRecording, setIsRecording] = useState(false);
    const [mediaRecorder, setMediaRecorder] = useState(null);
    const [recordedBlob, setRecordedBlob] = useState(null);
    const [aiFeedback, setAiFeedback] = useState(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [achievements, setAchievements] = useState([]);
    const [showAchievement, setShowAchievement] = useState(null);

    // NEW: Speech recognition and transcript
    const [transcript, setTranscript] = useState([]);
    const [liveTranscript, setLiveTranscript] = useState('');
    const [currentSentenceIndex, setCurrentSentenceIndex] = useState(-1);
    const [audioCurrentTime, setAudioCurrentTime] = useState(0);
    const [lastRecording, setLastRecording] = useState(null); // For re-analyze feature

    // NEW: AI Chat
    const [chatMessages, setChatMessages] = useState([]);
    const [chatInput, setChatInput] = useState('');
    const [isChatLoading, setIsChatLoading] = useState(false);


    const aiCoach = useRef(null);
    const recognition = useRef(null);
    const audioPlayer = useRef(null);
    const recordingStartTime = useRef(0);

    // 1. Load Data on Startup (or after Login)
    useEffect(() => {
        if (user) {
            // Already have data from login response, or can fetch fresh
            console.log('✅ User logged in:', user.username);
        } else {
            // Check for existing session? (Optional: for now just show login)
            setIsAuthChecking(false);
        }
    }, [user]);

    // 2. Save Data on Change (Auto-save)
    useEffect(() => {
        if (!user) return; // Don't save if not logged in

        const saveData = async () => {
            const dataToSave = {
                currentDay,
                sessions,
                achievements,
                settings: { apiKeys }
            };

            try {
                await fetch(`${CONFIG.BACKEND_URL} /api/save_data`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        user_id: user.id,
                        data: dataToSave
                    })
                });
                console.log('💾 Data saved to cloud');
            } catch (err) {
                console.error('❌ Failed to save data:', err);
            }
        };

        // Debounce save (wait 1s after last change)
        const timeoutId = setTimeout(saveData, 1000);
        return () => clearTimeout(timeoutId);

    }, [currentDay, sessions, achievements, apiKeys, user]);

    useEffect(() => {
        let interval;
        if (isTimerRunning) {
            interval = setInterval(() => {
                setTimer(t => t + 1);
            }, 1000);
        }
        return () => clearInterval(interval);
    }, [isTimerRunning]);

    useEffect(() => {
        // Initialize AI Coach (backend handles API key)
        aiCoach.current = new AICoach();
    }, []);
    const handleGuestLogin = () => {
        try {
            // Load data from LocalStorage
            const savedDay = localStorage.getItem('speakingCoach_currentDay');
            const savedSessions = localStorage.getItem('speakingCoach_sessions');
            const savedAchievements = localStorage.getItem('speakingCoach_achievements');
            const savedApiKeys = localStorage.getItem('speakingCoach_apiKeys');

            // Legacy loading usage (fallback)
            const oldDay = localStorage.getItem('current_day');
            const oldSessions = localStorage.getItem('sessions');
            const oldAchievements = localStorage.getItem('achievements');

            if (savedDay) setCurrentDay(parseInt(savedDay));
            else if (oldDay) setCurrentDay(parseInt(oldDay));

            if (savedSessions) setSessions(JSON.parse(savedSessions));
            else if (oldSessions) setSessions(JSON.parse(oldSessions));

            if (savedAchievements) setAchievements(JSON.parse(savedAchievements));
            else if (oldAchievements) setAchievements(JSON.parse(oldAchievements));

            // Load API keys
            if (savedApiKeys) {
                const keys = JSON.parse(savedApiKeys);
                setApiKeys(keys);
                if (keys.length > 0) setActiveKeyId(keys[0].id);
            } else {
                // Try legacy key
                const oldKey = localStorage.getItem('gemini_api_key') || localStorage.getItem('api_key');
                if (oldKey) {
                    const newKey = {
                        id: Date.now().toString(),
                        key: oldKey,
                        name: 'Main Key',
                        isActive: true,
                        lastUsed: new Date().toISOString(),
                        successCount: 0,
                        errorCount: 0
                    };
                    setApiKeys([newKey]);
                    setActiveKeyId(newKey.id);
                }
            }

            console.log('👤 Guest login successful - Loaded local data');
            setUser({ username: 'Guest', isGuest: true });
        } catch (error) {
            console.error('Guest login error:', error);
            alert('เกิดข้อผิดพลาดในการโหลดข้อมูลเก่า');
            setUser({ username: 'Guest', isGuest: true }); // Still let them in
        }
    };

    // ===== API Key Management Functions =====

    function getActiveKey() {
        if (!activeKeyId || apiKeys.length === 0) return null;
        return apiKeys.find(k => k.id === activeKeyId) || apiKeys[0];
    }

    function addApiKey(key, name = '') {
        const newKey = {
            id: Date.now().toString(),
            key: key.trim(),
            name: name.trim() || `Key ${apiKeys.length + 1} `,
            lastUsed: null,
            last429: null,
            errorCount: 0,
            successCount: 0,
            isActive: false
        };

        const updated = [...apiKeys, newKey];
        setApiKeys(updated);
        localStorage.setItem('api_keys', JSON.stringify(updated));

        // Set as active if it's the first key
        if (apiKeys.length === 0) {
            setActiveKeyId(newKey.id);
            localStorage.setItem('active_key_id', newKey.id);
        }

        return newKey;
    }

    function deleteApiKey(keyId) {
        const updated = apiKeys.filter(k => k.id !== keyId);
        setApiKeys(updated);
        localStorage.setItem('api_keys', JSON.stringify(updated));

        // If deleted key was active, switch to first available
        if (keyId === activeKeyId) {
            const newActiveId = updated.length > 0 ? updated[0].id : null;
            setActiveKeyId(newActiveId);
            localStorage.setItem('active_key_id', newActiveId || '');
        }
    }

    function setActiveKey(keyId) {
        setActiveKeyId(keyId);
        localStorage.setItem('active_key_id', keyId);
    }

    function updateKeyStats(keyId, type, error = null) {
        const updated = apiKeys.map(k => {
            if (k.id !== keyId) return k;

            const stats = { ...k };
            stats.lastUsed = new Date().toISOString();

            if (type === 'success') {
                stats.successCount++;
            } else if (type === 'error') {
                stats.errorCount++;
                if (error?.status === 429) {
                    stats.last429 = new Date().toISOString();
                }
            }

            return stats;
        });

        setApiKeys(updated);
        localStorage.setItem('api_keys', JSON.stringify(updated));
    }

    function rotateToNextKey() {
        const currentIndex = apiKeys.findIndex(k => k.id === activeKeyId);

        // Try to find next available key (not recently hit 429)
        const now = new Date();
        for (let i = 1; i <= apiKeys.length; i++) {
            const nextIndex = (currentIndex + i) % apiKeys.length;
            const nextKey = apiKeys[nextIndex];

            // Check if key is usable (no recent 429 or 429 was more than 1 hour ago)
            if (!nextKey.last429) {
                setActiveKey(nextKey.id);
                console.log(`🔄 Rotated to Key: ${nextKey.name} `);
                return nextKey;
            }

            const last429Time = new Date(nextKey.last429);
            const hoursSince429 = (now - last429Time) / (1000 * 60 * 60);

            if (hoursSince429 > 1) {
                setActiveKey(nextKey.id);
                console.log(`🔄 Rotated to Key: ${nextKey.name} (cooldown passed)`);
                return nextKey;
            }
        }

        // If all keys are exhausted, return null
        console.warn('⚠️ All API keys exhausted');
        return null;
    }

    function saveProgress(day, newSessions) {
        localStorage.setItem('current_day', day.toString());
        localStorage.setItem('sessions', JSON.stringify(newSessions));

        // Auto-export to JSON file every session
        exportToJSON(newSessions);
    }

    function exportToJSON(sessionsData = sessions) {
        const data = {
            version: '2.0',
            exportDate: new Date().toISOString(),
            currentDay: currentDay,
            sessions: sessionsData,
            achievements: achievements
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `speaking - coach - backup - ${new Date().toISOString().split('T')[0]}.json`;
        a.click();
    }

    function importFromJSON(event) {
        const file = event.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const data = JSON.parse(e.target.result);

                const importedSessions = data.sessions || [];
                const importedAchievements = data.achievements || [];

                // 🧠 Smart Progression Logic (Match loadProgress)
                let importedDay = data.currentDay || 1;
                const lastSession = importedSessions[importedSessions.length - 1];

                let shouldLock = false;

                if (lastSession) {
                    // 1. Auto-advance using Math.max for safety
                    const maxCompletedDay = Math.max(...importedSessions.map(s => s.day));

                    console.log('🔍 Import Debug:');
                    console.log('- Sessions Count:', importedSessions.length);
                    console.log('- Max Completed Day:', maxCompletedDay);
                    console.log('- Original Current Day:', data.currentDay);
                    console.log('- importedDay before:', importedDay);

                    if (maxCompletedDay >= importedDay) {
                        importedDay = maxCompletedDay + 1;
                    }

                    console.log('- importedDay AFTER:', importedDay);

                    // 2. Cooldown Check
                    const lastDate = new Date(lastSession.date);
                    const today = new Date();

                    console.log('- Last Session Date:', lastDate.toDateString());
                    console.log('- Today:', today.toDateString());
                    console.log('- Same Day?:', lastDate.toDateString() === today.toDateString());

                    if (lastDate.toDateString() === today.toDateString()) {
                        shouldLock = true;
                    }

                    console.log('- Should Lock:', shouldLock);
                }

                setCurrentDay(importedDay);
                setSessions(importedSessions);
                setAchievements(importedAchievements);

                // Set lock status based on date analysis
                setTodayCompleted(shouldLock);

                localStorage.setItem('current_day', importedDay.toString());
                localStorage.setItem('sessions', JSON.stringify(importedSessions));
                localStorage.setItem('achievements', JSON.stringify(importedAchievements));

                if (!shouldLock) {
                    localStorage.removeItem(`completed_day_${importedDay} `);
                }

                alert(`นำเข้าข้อมูลสำเร็จ!(Day ${importedDay})${shouldLock ? ' - พักผ่อนก่อนนะครับ พรุ่งนี้ค่อยลุยต่อ! 💤' : ''} `);
            } catch (error) {
                alert('ไฟล์ไม่ถูกต้อง');
            }
        };
        reader.readAsText(file);
    }

    async function startRecording() {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                audio: true,
                video: false
            });

            const recorder = new MediaRecorder(stream);
            const chunks = [];

            recorder.ondataavailable = (e) => chunks.push(e.data);
            recorder.onstop = () => {
                const blob = new Blob(chunks, { type: 'audio/webm' });
                setRecordedBlob(blob);
            };

            recorder.start();
            setMediaRecorder(recorder);
            setIsRecording(true);

            // Initialize speech recognition
            initializeSpeechRecognition();

            recordingStartTime.current = Date.now();
            startTimer();
        } catch (error) {
            alert('ไม่สามารถเข้าถึงไมค์ได้ กรุณาอนุญาตการใช้งานไมค์');
            console.error(error);
        }
    }

    function initializeSpeechRecognition() {
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            if (!SpeechRecognition) {
                console.warn('Speech Recognition not supported in this browser');
                return;
            }

            const recog = new SpeechRecognition();
            recog.continuous = true;
            recog.interimResults = true;
            recog.lang = 'th-TH';
            recog.maxAlternatives = 1;

            const transcriptSegments = [];
            let currentSegment = { text: '', startTime: 0, endTime: 0 };
            let interimTimeout = null;
            let lastFinalTime = 0;

            recog.onstart = () => {
                console.log('✅ Speech recognition started');
                currentSegment.startTime = (Date.now() - recordingStartTime.current) / 1000;
                lastFinalTime = currentSegment.startTime;
            };

            recog.onresult = (event) => {
                let interimTranscript = '';
                let finalTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; i++) {
                    const transcript = event.results[i][0].transcript;
                    if (event.results[i].isFinal) {
                        finalTranscript += transcript + ' ';
                    } else {
                        interimTranscript += transcript;
                    }
                }

                // Update live transcript
                setLiveTranscript(interimTranscript);

                // Save final transcript with timestamp
                if (finalTranscript) {
                    const endTime = (Date.now() - recordingStartTime.current) / 1000;

                    // Create segment with proper timing
                    transcriptSegments.push({
                        text: finalTranscript.trim(),
                        startTime: lastFinalTime,
                        endTime: endTime
                    });

                    setTranscript([...transcriptSegments]);
                    lastFinalTime = endTime;

                    // Clear interim timeout
                    if (interimTimeout) clearTimeout(interimTimeout);
                }

                // If we have interim results, set a timeout to force finalization
                // This helps break long segments into smaller pieces
                if (interimTranscript && !finalTranscript) {
                    if (interimTimeout) clearTimeout(interimTimeout);

                    // Strategy:
                    // 1. Force break if silence > 800ms (Natural pause)
                    // 2. Force break if segment > 150 chars (Prevent too long segments)

                    const isTooLong = interimTranscript.length > 150;
                    const timeoutDuration = isTooLong ? 100 : 800;

                    interimTimeout = setTimeout(() => {
                        // Force restart to finalize current interim result
                        if (recog && mediaRecorder && mediaRecorder.state === 'recording') {
                            try {
                                console.log(`✂️ Force finalizing: ${isTooLong ? 'Too long' : 'Silence detected'} `);
                                recog.stop();
                                setTimeout(() => {
                                    if (mediaRecorder && mediaRecorder.state === 'recording') {
                                        recog.start();
                                    }
                                }, 100);
                            } catch (e) {
                                console.warn('Failed to restart recognition:', e);
                            }
                        }
                    }, timeoutDuration); // Force break logic
                }
            };

            recog.onerror = (event) => {
                console.error('❌ Speech recognition error:', event.error);
                if (event.error === 'network') {
                    console.warn('⚠️ Network error - Speech recognition may not work on HTTP (needs HTTPS) or your browser may not support it');
                } else if (event.error === 'not-allowed') {
                    console.warn('⚠️ Microphone access denied - please allow microphone permission');
                }
            };

            recog.onend = () => {
                console.log('Speech recognition ended');
                // Auto-restart if still recording
                if (mediaRecorder && mediaRecorder.state === 'recording') {
                    try {
                        recog.start();
                        console.log('🔄 Restarting speech recognition...');
                    } catch (e) {
                        console.error('Failed to restart speech recognition:', e);
                    }
                }
            };

            recog.start();
            recognition.current = recog;
        } catch (error) {
            console.error('Failed to initialize speech recognition:', error);
        }
    }

    function stopRecording() {
        if (mediaRecorder) {
            mediaRecorder.stop();
            mediaRecorder.stream.getTracks().forEach(track => track.stop());
            setIsRecording(false);
            setIsTimerRunning(false);
        }

        // Stop speech recognition
        if (recognition.current) {
            recognition.current.stop();
        }

        setLiveTranscript('');
    }

    async function analyzeWithAI(savedTranscript = null, savedTimer = null, savedBlob = null) {
        const activeKey = getActiveKey();

        if (!activeKey) {
            alert('กรุณาเพิ่ม Gemini API Key ในหน้าตั้งค่าก่อน');
            return;
        }

        setIsAnalyzing(true);

        const { weekData, topicData } = getTodayData();

        // Use saved data if provided (for re-analysis), otherwise use current state
        const useTranscript = savedTranscript || transcript;
        const useDuration = savedTimer !== null ? savedTimer : timer;
        const useBlob = savedBlob || recordedBlob;

        // Save current recording for potential re-analysis (only if not already re-analyzing)
        if (!savedTranscript) {
            setLastRecording({
                transcript: transcript,
                timer: timer,
                audioBlob: recordedBlob,
                timestamp: new Date().toISOString()
            });
        }

        // Handle undefined or empty transcript
        const transcriptData = (useTranscript && useTranscript.length > 0)
            ? useTranscript
            : "ไม่มี transcript (Speech Recognition อาจไม่รองรับในบราวเซอร์นี้)";

        console.log('🤖 Starting AI analysis with rotation...');
        console.log('Transcript data:', transcriptData);
        if (useBlob) console.log('🎙️ Including Audio Blob for analysis');

        // **Auto-Rotation Logic**: Try all keys until one succeeds
        let feedback = null;
        let attempts = 0;
        let currentKey = activeKey;

        while (attempts < apiKeys.length && !feedback) {
            try {
                console.log(`Attempt ${attempts + 1}: Using ${currentKey.name} `);

                // Pass sessions for progress comparison
                feedback = await aiCoach.current.analyzeSpeech(
                    currentKey.key, // Pass the actual API key
                    useBlob,        // Pass audio blob
                    transcriptData,
                    useDuration,
                    weekData,
                    topicData,
                    sessions
                );

                // Success!
                updateKeyStats(currentKey.id, 'success');
                console.log('✅ AI analysis complete:', feedback);

            } catch (error) {
                console.error(`❌ Error with ${currentKey.name}: `, error);

                // Check if it's a 429 error
                if (error.status === 429 || error.message?.includes('429')) {
                    updateKeyStats(currentKey.id, 'error', { status: 429 });
                    alert(`⚠️ ${currentKey.name} หมด Quota แล้ว กำลังลองใช้ Key อื่น...`);

                    // Rotate to next key
                    const nextKey = rotateToNextKey();
                    if (!nextKey) {
                        alert('🚫 API Keys ทุกตัวหมด Quota แล้ว กรุณารอหรือเพิ่ม Key ใหม่');
                        break;
                    }
                    currentKey = nextKey;
                    attempts++;
                } else {
                    // Other errors (network, etc.)
                    updateKeyStats(currentKey.id, 'error', error);
                    alert(`เกิดข้อผิดพลาด: ${error.message} `);
                    break;
                }
            }
        }

        setAiFeedback(feedback);
        setIsAnalyzing(false);
    }

    async function sendChatMessage(userMessage) {
        if (!userMessage.trim()) return;

        const activeKey = getActiveKey();
        if (!activeKey) {
            alert('กรุณาเพิ่ม API Key ก่อน');
            return;
        }

        if (!aiFeedback) {
            alert('ต้องมีผลการวิเคราะห์ก่อนถึงจะแชทได้');
            return;
        }

        // Add user message to chat
        const userMsg = {
            role: 'user',
            content: userMessage,
            timestamp: new Date().toISOString()
        };
        setChatMessages(prev => [...prev, userMsg]);
        setChatInput('');
        setIsChatLoading(true);

        try {
            // Build context for AI
            const contextPrompt = `You are a speaking coach assistant.The user just completed a speaking session and received feedback.Now they want to ask you follow - up questions.

** Session Information:**
    - Duration: ${timer} seconds
        - Transcript: ${JSON.stringify(transcript)}

** AI Feedback Given:**
    ${JSON.stringify(aiFeedback, null, 2)}

** Previous Conversation:**
    ${chatMessages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n')}

** User Question:**
    ${userMessage}

** Instructions:**
    - Answer in Thai language
        - Be specific and reference the transcript or feedback scores
            - Keep answers concise but helpful
                - If asked about specific parts, quote from the transcript
                    - Be encouraging and constructive`;

            const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${CONFIG.GEMINI_MODEL}:generateContent?key=${activeKey.key}`;

            const response = await fetch(endpoint, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ parts: [{ text: contextPrompt }] }]
                })
            });

            if (!response.ok) {
                throw new Error(`API Error: ${response.status}`);
            }

            const data = await response.json();
            const aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text || 'ขอโทษครับ ไม่สามารถตอบได้';

            // Add AI response to chat
            const aiMsg = {
                role: 'assistant',
                content: aiResponse,
                timestamp: new Date().toISOString()
            };
            setChatMessages(prev => [...prev, aiMsg]);
            updateKeyStats(activeKey.id, 'success');

        } catch (error) {
            console.error('Chat error:', error);
            alert('เกิดข้อผิดพลาดในการแชท');
            if (activeKey) {
                updateKeyStats(activeKey.id, 'error', error);
            }
        } finally {
            setIsChatLoading(false);
        }
    }


    async function completeSession(manualScore, notes) {
        const score = aiFeedback ? aiFeedback.scores.overall : manualScore;

        const newSession = {
            day: currentDay,
            date: new Date().toISOString(),
            duration: timer,
            score: score,
            notes: notes,
            transcript: transcript,  // Store transcript with timestamps
            aiFeedback: aiFeedback,
            hasRecording: !!recordedBlob
        };

        const newSessions = [...sessions, newSession];
        setSessions(newSessions);
        setTodayCompleted(true);

        saveProgress(currentDay, newSessions);
        localStorage.setItem(`completed_day_${currentDay} `, 'true');

        // Check achievements
        checkAchievements(newSessions, score);

        // Reset for next session
        setRecordedBlob(null);
        setAiFeedback(null);
        setTranscript([]);
        setLiveTranscript('');

        // Auto advance
        if (currentDay < 30) {
            setTimeout(() => {
                const nextDay = currentDay + 1;
                setCurrentDay(nextDay);
                setTodayCompleted(false);
                localStorage.setItem('current_day', nextDay.toString());
                localStorage.removeItem(`completed_day_${nextDay} `);
            }, 2000);
        }
    }

    function checkAchievements(sessionsData, latestScore) {
        const newAchievements = [];

        // Fire Starter
        if (calculateStreak(sessionsData) >= 3 && !achievements.includes('fire_starter')) {
            newAchievements.push({
                id: 'fire_starter',
                title: '🔥 Fire Starter',
                desc: 'ฝึก 3 วันติดต่อกัน!'
            });
        }

        // Week Warrior
        if (sessionsData.length >= 7 && !achievements.includes('week_warrior')) {
            newAchievements.push({
                id: 'week_warrior',
                title: '💪 Week Warrior',
                desc: 'จบสัปดาห์ที่ 1!'
            });
        }

        // Perfect Score
        if (latestScore >= 9.5 && !achievements.includes('perfect_score')) {
            newAchievements.push({
                id: 'perfect_score',
                title: '⭐ Perfect Score',
                desc: 'ได้คะแนนเกือบเต็ม!'
            });
        }

        if (newAchievements.length > 0) {
            const updatedAchievements = [...achievements, ...newAchievements.map(a => a.id)];
            setAchievements(updatedAchievements);
            localStorage.setItem('achievements', JSON.stringify(updatedAchievements));

            // Show first achievement
            setShowAchievement(newAchievements[0]);
            setTimeout(() => setShowAchievement(null), 3000);
        }
    }

    function startTimer() {
        setTimer(0);
        setIsTimerRunning(true);
    }

    function stopTimer() {
        setIsTimerRunning(false);
    }

    function resetTimer() {
        setTimer(0);
        setIsTimerRunning(false);
        setRecordedBlob(null);
        setAiFeedback(null);
        setTranscript([]);
        setLiveTranscript('');
        setCurrentSentenceIndex(-1);
    }

    function resetProgress() {
        if (confirm('คุณแน่ใจหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้')) {
            // Export before reset
            exportToJSON();

            setCurrentDay(1);
            setSessions([]);
            setTodayCompleted(false);
            setAchievements([]);

            localStorage.clear();
            alert('รีเซ็ตสำเร็จ! ข้อมูลเก่าถูก Export ให้แล้ว');
        }
    }

    function getCurrentWeek() {
        if (currentDay <= 7) return 'week1';
        if (currentDay <= 14) return 'week2';
        if (currentDay <= 21) return 'week3';
        return 'week4';
    }

    function getTodayData() {
        const week = getCurrentWeek();
        const weekData = TRAINING_DATA[week];
        const topicData = weekData.topics.find(t => t.day === currentDay);
        const powerWordData = weekData.powerWords.find(pw => pw.day === currentDay);

        return { weekData, topicData, powerWordData };
    }

    const handleLogin = (loggedInUser, userData) => {
        setUser(loggedInUser);
        if (userData) {
            if (userData.currentDay) setCurrentDay(userData.currentDay);
            if (userData.sessions) setSessions(userData.sessions);
            if (userData.achievements) setAchievements(userData.achievements);

            // Handle API Keys from backend settings
            if (userData.settings && userData.settings.apiKeys) {
                setApiKeys(userData.settings.apiKeys);
                if (userData.settings.apiKeys.length > 0) setActiveKeyId(userData.settings.apiKeys[0].id);
            }
        }
        setIsAuthChecking(false);
    };

    if (isAuthChecking) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-purple-600 font-bold text-xl animate-pulse">Loading Speaking Coach...</div>
            </div>
        );
    }

    if (!user) {
        return <AuthView onLogin={handleLogin} onGuest={handleGuestLogin} />;
    }

    const { weekData, topicData, powerWordData } = getTodayData();

    return (
        <div className="min-h-screen p-4 md:p-8">
            {/* Achievement Popup */}
            {showAchievement && (
                <div className="fixed top-4 right-4 z-50 achievement-pop glass-effect rounded-2xl p-6 shadow-2xl max-w-sm">
                    <div className="text-4xl mb-2">{showAchievement.title.split(' ')[0]}</div>
                    <div className="font-bold text-lg text-purple-600">{showAchievement.title}</div>
                    <div className="text-sm text-gray-600">{showAchievement.desc}</div>
                </div>
            )}

            <div className="max-w-6xl mx-auto">
                {/* Header */}
                <div className="glass-effect rounded-3xl p-6 mb-6 shadow-2xl">
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h1 className="text-3xl md:text-4xl font-bold text-purple-800 mb-2">
                                🎯 Speaking Coach Pro
                            </h1>
                            <p className="text-gray-600">Zero to Hero in 30 Days</p>
                            {apiKeys.length > 0 && (
                                <div className="mt-2 ai-badge text-white text-xs px-3 py-1 rounded-full inline-block">
                                    ✨ AI-Powered
                                </div>
                            )}
                        </div>
                        <div className="text-right">
                            <div className="text-sm text-gray-500">Day</div>
                            <div className="text-3xl font-bold text-purple-600">{currentDay}/30</div>
                        </div>
                    </div>

                    <div className="flex flex-wrap gap-2">
                        <button
                            onClick={() => setCurrentView('dashboard')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${currentView === 'dashboard' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        >
                            📊 Dashboard
                        </button>
                        <button
                            onClick={() => setCurrentView('training')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${currentView === 'training' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        >
                            💪 ฝึกวันนี้
                        </button>
                        <button
                            onClick={() => setCurrentView('words')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${currentView === 'words' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        >
                            📚 Power Words
                        </button>
                        <button
                            onClick={() => setCurrentView('progress')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${currentView === 'progress' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        >
                            📈 ความคืบหน้า
                        </button>
                        <button
                            onClick={() => setCurrentView('settings')}
                            className={`px-4 py-2 rounded-lg font-semibold transition ${currentView === 'settings' ? 'bg-purple-600 text-white shadow-lg' : 'bg-purple-100 text-purple-600 hover:bg-purple-200'}`}
                        >
                            ⚙️ ตั้งค่า
                        </button>
                    </div>
                </div>

                {/* Views */}
                {currentView === 'dashboard' && (
                    <Dashboard
                        currentDay={currentDay}
                        weekData={weekData}
                        sessions={sessions}
                        todayCompleted={todayCompleted}
                        setCurrentView={setCurrentView}
                        achievements={achievements}
                    />
                )}

                {currentView === 'training' && (
                    <TrainingView
                        currentDay={currentDay}
                        topicData={topicData}
                        weekData={weekData}
                        timer={timer}
                        isTimerRunning={isTimerRunning}
                        isRecording={isRecording}
                        startRecording={startRecording}
                        stopRecording={stopRecording}
                        resetTimer={resetTimer}
                        completeSession={completeSession}
                        todayCompleted={todayCompleted}
                        recordedBlob={recordedBlob}
                        analyzeWithAI={analyzeWithAI}
                        aiFeedback={aiFeedback}
                        isAnalyzing={isAnalyzing}
                        transcript={transcript}
                        liveTranscript={liveTranscript}
                        audioPlayerRef={audioPlayer}
                        currentSentenceIndex={currentSentenceIndex}
                        setCurrentSentenceIndex={setCurrentSentenceIndex}
                        audioCurrentTime={audioCurrentTime}
                        setAudioCurrentTime={setAudioCurrentTime}
                        lastRecording={lastRecording}
                        chatMessages={chatMessages}
                        chatInput={chatInput}
                        setChatInput={setChatInput}
                        isChatLoading={isChatLoading}
                        sendChatMessage={sendChatMessage}
                        hasApiKey={apiKeys.length > 0}
                    />
                )}

                {currentView === 'words' && (
                    <PowerWordsView
                        currentDay={currentDay}
                        powerWordData={powerWordData}
                        weekData={weekData}
                    />
                )}

                {currentView === 'progress' && (
                    <ProgressView
                        sessions={sessions}
                        currentDay={currentDay}
                        resetProgress={resetProgress}
                        exportToJSON={() => exportToJSON()}
                        importFromJSON={importFromJSON}
                        achievements={achievements}
                    />
                )}

                {currentView === 'settings' && (
                    <SettingsView
                        apiKeys={apiKeys}
                        activeKeyId={activeKeyId}
                        addApiKey={addApiKey}
                        deleteApiKey={deleteApiKey}
                        setActiveKey={setActiveKey}
                    />
                )}
            </div>
        </div>
    );
}

// Dashboard Component (same as before but with achievements)
function Dashboard({ currentDay, weekData, sessions, todayCompleted, setCurrentView, achievements }) {
    const progress = (currentDay / 30) * 100;
    const streak = calculateStreak(sessions);

    return (
        <div className="space-y-6">
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <div className="flex justify-between items-center mb-4">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">Day {currentDay}/30</h2>
                        <p className="text-purple-600 font-semibold">{weekData.name}</p>
                        <p className="text-sm text-gray-600">{weekData.goal}</p>
                    </div>
                    <div className="text-right">
                        <div className="text-4xl font-bold text-purple-600">{Math.round(progress)}%</div>
                        <div className="text-sm text-gray-600">เสร็จสมบูรณ์</div>
                    </div>
                </div>

                <div className="w-full bg-gray-200 rounded-full h-4 mb-6">
                    <div
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-4 rounded-full transition-all duration-500"
                        style={{ width: `${progress}% ` }}
                    ></div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 bg-purple-50 rounded-xl">
                        <div className="text-3xl font-bold text-purple-600">{sessions.length}</div>
                        <div className="text-sm text-gray-600">เซสชันทั้งหมด</div>
                    </div>
                    <div className="text-center p-4 bg-pink-50 rounded-xl">
                        <div className="text-3xl font-bold text-pink-600">{streak}</div>
                        <div className="text-sm text-gray-600">วันติดต่อกัน 🔥</div>
                    </div>
                    <div className="text-center p-4 bg-indigo-50 rounded-xl">
                        <div className="text-3xl font-bold text-indigo-600">
                            {sessions.length > 0 ? (sessions.reduce((a, b) => a + b.score, 0) / sessions.length).toFixed(1) : 0}
                        </div>
                        <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
                    </div>
                </div>
            </div>

            {/* Achievements */}
            {achievements.length > 0 && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4">🏆 Achievements</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {achievements.map((id) => {
                            const badges = {
                                fire_starter: { emoji: '🔥', name: 'Fire Starter' },
                                week_warrior: { emoji: '💪', name: 'Week Warrior' },
                                perfect_score: { emoji: '⭐', name: 'Perfect Score' },
                                half_way: { emoji: '🎯', name: 'Half Way' }
                            };
                            const badge = badges[id];
                            return badge ? (
                                <div key={id} className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border-2 border-purple-200">
                                    <div className="text-3xl mb-1">{badge.emoji}</div>
                                    <div className="text-xs font-semibold text-purple-600">{badge.name}</div>
                                </div>
                            ) : null;
                        })}
                    </div>
                </div>
            )}

            {/* Today's Mission */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">
                    {todayCompleted ? '✅ เสร็จสิ้นแล้ววันนี้!' : '🎯 ภารกิจวันนี้'}
                </h3>
                {todayCompleted ? (
                    <div className="text-center py-8">
                        <div className="text-6xl mb-4">🎉</div>
                        <p className="text-lg text-gray-600 mb-2">ยอดเยี่ยม! คุณทำ <strong>Day {currentDay - 1}</strong> สำเร็จแล้ว</p>
                        <p className="text-sm text-gray-500">กลับมาพรุ่งนี้เพื่อฝึก Day {currentDay} ต่อ 💪</p>
                    </div>
                ) : (
                    <button
                        onClick={() => setCurrentView('training')}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-6 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105"
                    >
                        🚀 เริ่มฝึกเลย! (Day {currentDay})
                    </button>
                )}
            </div>
        </div>
    );
}

// Training View with AI (truncated for brevity - will continue in next file)
function TrainingView({ currentDay, topicData, weekData, timer, isTimerRunning, isRecording,
    startRecording, stopRecording, resetTimer, completeSession, todayCompleted,
    recordedBlob, analyzeWithAI, aiFeedback, isAnalyzing, hasApiKey,
    transcript, liveTranscript, audioPlayerRef, currentSentenceIndex,
    setCurrentSentenceIndex, audioCurrentTime, setAudioCurrentTime, lastRecording,
    chatMessages, chatInput, setChatInput, isChatLoading, sendChatMessage }) {
    const [score, setScore] = useState(5);
    const [notes, setNotes] = useState('');
    const [showCompleteForm, setShowCompleteForm] = useState(false);

    function formatTime(seconds) {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')} `;
    }

    function handleComplete() {
        stopRecording();
        setShowCompleteForm(true);

        // Trigger AI analysis immediately if API key exists
        if (hasApiKey) {
            console.log('🎯 Auto-triggering AI analysis...');
            // Small delay to ensure state updates
            setTimeout(() => {
                analyzeWithAI();
            }, 100);
        }
    }

    function handleSubmitSession() {
        completeSession(score, notes);
        setShowCompleteForm(false);
        setScore(5);
        setNotes('');
        resetTimer();
    }

    function handleReAnalyze() {
        if (!lastRecording) {
            alert('ไม่พบข้อมูลการอัดเสียงที่บันทึกไว้');
            return;
        }
        console.log('🔄 Re-analyzing with saved recording:', lastRecording);
        analyzeWithAI(lastRecording.transcript, lastRecording.timer, lastRecording.audioBlob);
    }


    if (todayCompleted) {
        return (
            <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
                <div className="text-6xl mb-4">✅</div>
                <h2 className="text-2xl font-bold text-gray-800 mb-2">เสร็จสิ้นแล้ว!</h2>
                <p className="text-gray-600 mb-4">คุณได้ทำภารกิจวันที่ {currentDay - 1} เรียบร้อยแล้ว</p>
                <p className="text-sm text-gray-500">พรุ่งนี้กลับมาฝึก Day {currentDay} ต่อนะครับ 🚀</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Training Info */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <div className="mb-6">
                    <span className="bg-purple-100 text-purple-600 px-3 py-1 rounded-full text-sm font-semibold">
                        Day {currentDay} - {weekData.name}
                    </span>
                </div>

                <h2 className="text-3xl font-bold text-gray-800 mb-2">{topicData.title}</h2>
                <p className="text-gray-600 text-lg mb-4">{topicData.desc}</p>

                <div className="flex gap-4 flex-wrap">
                    <div className="bg-purple-50 px-4 py-2 rounded-lg">
                        <span className="text-sm text-gray-600">เวลาแนะนำ: </span>
                        <span className="font-bold text-purple-600">{topicData.duration} นาที</span>
                    </div>
                </div>
            </div>

            {/* Timer & Recording */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
                <div className={`timer - display mb - 6 ${isRecording ? 'text-red-600' : 'text-purple-600'} `}>
                    {formatTime(timer)}
                </div>

                {isRecording && (
                    <div className="recording-indicator mb-6">
                        <div className="inline-block bg-red-100 border-2 border-red-500 rounded-full px-4 py-2">
                            <span className="text-red-600 font-semibold">🔴 กำลังอัด...</span>
                        </div>
                    </div>
                )}

                <div className="flex gap-4 justify-center flex-wrap">
                    {!isRecording ? (
                        <button
                            onClick={startRecording}
                            className="bg-gradient-to-r from-red-500 to-red-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105"
                        >
                            🎤 เริ่มอัด + AI Analysis
                        </button>
                    ) : (
                        <>
                            <button
                                onClick={handleComplete}
                                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105"
                            >
                                ✅ เสร็จสิ้น
                            </button>
                        </>
                    )}

                    {timer > 0 && !isRecording && (
                        <button
                            onClick={resetTimer}
                            className="bg-gray-300 text-gray-700 px-8 py-4 rounded-xl font-bold text-lg hover:shadow-xl transition"
                        >
                            🔄 ลองใหม่
                        </button>
                    )}
                </div>

                {!hasApiKey && (
                    <div className="mt-4 bg-yellow-50 border-2 border-yellow-200 rounded-xl p-4">
                        <p className="text-sm text-yellow-700">
                            💡 ใส่ Gemini API Key ในหน้าตั้งค่าเพื่อรับ AI Feedback อัตโนมัติ!
                        </p>
                    </div>
                )}
            </div>

            {/* Live Transcript Display */}
            {(isRecording || transcript.length > 0) && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-xl font-bold text-gray-800 mb-4 flex items-center gap-2">
                        <span>📝</span> Transcript
                        {isRecording && <span className="text-sm text-red-600 animate-pulse">(กำลังบันทึก...)</span>}
                    </h3>

                    {/* Live interim transcript */}
                    {isRecording && liveTranscript && (
                        <div className="mb-4 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl">
                            <p className="text-sm text-blue-600 mb-1">กำลังฟัง:</p>
                            <p className="text-gray-700 italic">{liveTranscript}</p>
                        </div>
                    )}

                    {/* Final transcript segments */}
                    {transcript.length > 0 ? (
                        <div className="space-y-2 max-h-96 overflow-y-auto">
                            {transcript.map((seg, idx) => (
                                <div key={idx} className="p-3 bg-purple-50 rounded-lg border-l-4 border-purple-600">
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="text-xs text-gray-500">
                                            {seg.startTime?.toFixed(1)}s - {seg.endTime?.toFixed(1)}s
                                        </span>
                                    </div>
                                    <p className="text-gray-800">{seg.text}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        !isRecording && (
                            <div className="text-center py-8 text-gray-400">
                                <p>ยังไม่มี transcript</p>
                                <p className="text-sm mt-2">
                                    {navigator.userAgent.includes('Chrome') || navigator.userAgent.includes('Edge')
                                        ? 'เริ่มบันทึกเพื่อดู transcript แบบ real-time'
                                        : '⚠️ บราวเซอร์นี้อาจไม่รองรับ Speech Recognition (ใช้ Chrome/Edge แทน)'}
                                </p>
                            </div>
                        )
                    )}
                </div>
            )}

            {/* AI Feedback */}
            {isAnalyzing && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl text-center">
                    <div className="text-4xl mb-4">🤖</div>
                    <p className="text-lg font-semibold text-purple-600">AI กำลังวิเคราะห์...</p>
                </div>
            )}

            {aiFeedback && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>🤖</span> AI Feedback
                    </h3>

                    {/* Scores */}
                    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        <div className="bg-purple-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-purple-600">{aiFeedback.scores.fluency}</div>
                            <div className="text-xs text-gray-600">Fluency</div>
                        </div>
                        <div className="bg-pink-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-pink-600">{aiFeedback.scores.clarity}</div>
                            <div className="text-xs text-gray-600">Clarity</div>
                        </div>
                        <div className="bg-indigo-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-indigo-600">{aiFeedback.scores.structure}</div>
                            <div className="text-xs text-gray-600">Structure</div>
                        </div>
                        <div className="bg-green-50 p-4 rounded-xl text-center">
                            <div className="text-2xl font-bold text-green-600">{aiFeedback.scores.engagement}</div>
                            <div className="text-xs text-gray-600">Engagement</div>
                        </div>
                        <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl text-center border-2 border-purple-300">
                            <div className="text-3xl font-bold text-purple-600">{aiFeedback.scores.overall}</div>
                            <div className="text-xs text-gray-600 font-semibold">Overall</div>
                        </div>
                    </div>

                    {/* Strengths & Improvements */}
                    <div className="grid md:grid-cols-2 gap-4 mb-6">
                        <div>
                            <h4 className="font-semibold text-green-600 mb-2">✅ จุดแข็ง:</h4>
                            <ul className="space-y-2">
                                {aiFeedback.strengths.map((s, i) => (
                                    <li key={i} className="text-sm bg-green-50 p-3 rounded-lg">{s}</li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="font-semibold text-orange-600 mb-2">⚠️ ควรปรับปรุง:</h4>
                            <ul className="space-y-2">
                                {aiFeedback.improvements.map((i, idx) => (
                                    <li key={idx} className="text-sm bg-orange-50 p-3 rounded-lg">{i}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Next Steps */}
                    <div className="bg-blue-50 p-4 rounded-xl">
                        <h4 className="font-semibold text-blue-600 mb-2">🎯 คำแนะนำต่อไป:</h4>
                        <p className="text-sm text-gray-700">{aiFeedback.nextSteps}</p>
                    </div>

                    {/* Cognitive Patterns (NEW) */}
                    {aiFeedback.cognitivePatterns && (
                        <div className="mt-6 bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                            <h4 className="font-bold text-purple-700 mb-4 flex items-center gap-2">
                                <span>🧠</span> Cognitive Patterns (รูปแบบการคิด)
                            </h4>
                            <div className="grid md:grid-cols-3 gap-4 mb-4">
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Thinking Style:</p>
                                    <p className="font-semibold text-purple-600">{aiFeedback.cognitivePatterns.thinkingStyle}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Scope Control:</p>
                                    <p className="font-semibold text-pink-600">{aiFeedback.cognitivePatterns.scopeControl}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">Preparedness:</p>
                                    <p className="font-semibold text-indigo-600">{aiFeedback.cognitivePatterns.preparedness}</p>
                                </div>
                            </div>
                            {aiFeedback.cognitivePatterns.issues && aiFeedback.cognitivePatterns.issues.length > 0 && (
                                <div className="bg-red-50 p-3 rounded-lg border-l-4 border-red-400">
                                    <p className="text-sm font-semibold text-red-700 mb-2">⚠️ ปัญหาที่พบ:</p>
                                    <ul className="space-y-1">
                                        {aiFeedback.cognitivePatterns.issues.map((issue, i) => (
                                            <li key={i} className="text-sm text-gray-700">• {issue}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Progression Analysis (NEW) */}
                    {aiFeedback.progression && (
                        <div className="mt-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border-2 border-blue-200">
                            <h4 className="font-bold text-blue-800 mb-3 flex items-center gap-2">
                                <span>📈</span> ความก้าวหน้า (เทียบกับครั้งก่อน)
                            </h4>
                            <div className="flex items-center mb-4">
                                <div className={`text - lg font - bold px - 3 py - 1 rounded - full ${aiFeedback.progression.comparedToPrevious === 'ดีขึ้น' ? 'bg-green-100 text-green-700' :
                                    aiFeedback.progression.comparedToPrevious === 'แย่ลง' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
                                    } `}>
                                    {aiFeedback.progression.comparedToPrevious}
                                </div>
                                <div className="ml-4 text-blue-700">
                                    Progress Score: <span className="font-bold text-2xl">{aiFeedback.progression.progressScore}/10</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {aiFeedback.progression.improvements && aiFeedback.progression.improvements.length > 0 && (
                                    <div className="bg-white p-3 rounded-lg border-l-4 border-green-500">
                                        <h5 className="font-semibold text-green-700 mb-2">✅ พัฒนาขึ้น:</h5>
                                        <ul className="text-sm space-y-1">
                                            {aiFeedback.progression.improvements.map((item, i) => (
                                                <li key={i} className="text-gray-700">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}

                                {aiFeedback.progression.stillNeedWork && aiFeedback.progression.stillNeedWork.length > 0 && (
                                    <div className="bg-white p-3 rounded-lg border-l-4 border-orange-500">
                                        <h5 className="font-semibold text-orange-700 mb-2">⚠️ ยังต้องแก้:</h5>
                                        <ul className="text-sm space-y-1">
                                            {aiFeedback.progression.stillNeedWork.map((item, i) => (
                                                <li key={i} className="text-gray-700">• {item}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                            {aiFeedback.progression.progressNote && (
                                <p className="mt-3 text-sm text-blue-600 italic">
                                    " {aiFeedback.progression.progressNote} "
                                </p>
                            )}
                        </div>
                    )}

                    {/* Root Cause Analysis (NEW) */}
                    {aiFeedback.rootCause && (
                        <div className="mt-4 bg-gradient-to-r from-orange-50 to-yellow-50 p-6 rounded-xl border-2 border-orange-200">
                            <h4 className="font-bold text-orange-700 mb-3 flex items-center gap-2">
                                <span>💡</span> Root Cause Analysis (ทำไมถึงพูดแบบนั้น)
                            </h4>
                            <div className="space-y-3">
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">ปัญหาหลัก:</p>
                                    <p className="font-semibold text-orange-600">{aiFeedback.rootCause.primaryIssue}</p>
                                </div>
                                <div className="bg-white p-3 rounded-lg">
                                    <p className="text-xs text-gray-500 mb-1">คำอธิบาย:</p>
                                    <p className="text-sm text-gray-700">{aiFeedback.rootCause.whyYouSpokeThatWay}</p>
                                </div>
                                {aiFeedback.rootCause.deepInsights && aiFeedback.rootCause.deepInsights.length > 0 && (
                                    <div className="bg-white p-3 rounded-lg">
                                        <p className="text-xs text-gray-500 mb-2">💎 Deep Insights:</p>
                                        <ul className="space-y-1">
                                            {aiFeedback.rootCause.deepInsights.map((insight, i) => (
                                                <li key={i} className="text-sm text-gray-700">• {insight}</li>
                                            ))}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Re-analyze Button */}
            {lastRecording && !isAnalyzing && (
                <div className="glass-effect rounded-3xl p-6 shadow-xl bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
                    <div className="flex items-center justify-between flex-wrap gap-4">
                        <div>
                            <h4 className="font-bold text-gray-800 mb-1 flex items-center gap-2">
                                <span>💾</span> มีข้อมูลการอัดเสียงที่บันทึกไว้
                            </h4>
                            <p className="text-sm text-gray-600">
                                สามารถวิเคราะห์ใหม่ได้โดยไม่ต้องพูดใหม่
                            </p>
                        </div>
                        <button
                            onClick={handleReAnalyze}
                            className="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition transform hover:scale-105 flex items-center gap-2"
                        >
                            <span>🔄</span> วิเคราะห์ใหม่
                        </button>
                    </div>
                </div>
            )}

            {/* AI Chat Interface */}
            {aiFeedback && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <span>💬</span> คุยกับ AI ต่อ
                    </h3>

                    {/* Quick Chat Buttons */}
                    {chatMessages.length === 0 && (
                        <div className="mb-6">
                            <p className="text-blue-700 text-sm mb-3 font-semibold">
                                💡 คำถามด่วน (กดได้เลย):
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                {[
                                    "ช่วงไหนที่พูดดีที่สุด?",
                                    "ทำไมคะแนน Fluency ถึงต่ำ?",
                                    "ทำไมคะแนน Pace ถึงต่ำ?",
                                    "ควรพัฒนาอะไรก่อน?",
                                    "มีคำแนะนำเฉพาะเจาะจงไหม?",
                                    "Dead Air เกิดตรงไหน?",
                                    "ประโยคไหนที่ชัดเจนที่สุด?",
                                    "มีแนวทางฝึกอย่างไรดี?"
                                ].map((q, i) => (
                                    <button
                                        key={i}
                                        onClick={() => {
                                            setChatInput(q);
                                            sendChatMessage(q);
                                        }}
                                        className="text-left px-4 py-3 bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl hover:border-purple-400 hover:shadow-md transition text-sm text-gray-700 font-medium"
                                    >
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {chatMessages.length > 0 && (
                        <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                            {chatMessages.map((msg, idx) => (
                                <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    <div className={`max-w-2xl px-4 py-3 rounded-xl ${msg.role === 'user'
                                        ? 'bg-purple-600 text-white'
                                        : 'bg-gray-100 text-gray-800'
                                        }`}>
                                        {msg.role === 'user' ? (
                                            <p className="text-sm whitespace-pre-wrap">{msg.content}</p>
                                        ) : (
                                            <div className="text-sm prose prose-sm max-w-none"
                                                dangerouslySetInnerHTML={{
                                                    __html: msg.content
                                                        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
                                                        .replace(/\*(.*?)\*/g, '<em>$1</em>')
                                                        .replace(/^#{1,6}\s+(.+)$/gm, (match, p1) => `<h3 class="font-bold mt-2 mb-1">${p1}</h3>`)
                                                        .replace(/^-\s+(.+)$/gm, '<li class="ml-4">$1</li>')
                                                        .replace(/^(\d+)\.\s+(.+)$/gm, '<li class="ml-4">$1. $2</li>')
                                                        .replace(/\n\n/g, '<br/><br/>')
                                                        .replace(/\n/g, '<br/>')
                                                }}
                                            />
                                        )}
                                    </div>
                                </div>
                            ))}
                            {isChatLoading && (
                                <div className="flex justify-start">
                                    <div className="bg-gray-100 px-4 py-3 rounded-xl">
                                        <p className="text-sm text-gray-600">AI กำลังคิด...</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter' && !isChatLoading) {
                                    sendChatMessage(chatInput);
                                }
                            }}
                            placeholder="พิมพ์คำถาม..."
                            disabled={isChatLoading}
                            className="flex-1 px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none disabled:bg-gray-100"
                        />
                        <button
                            onClick={() => sendChatMessage(chatInput)}
                            disabled={isChatLoading || !chatInput.trim()}
                            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-bold hover:shadow-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            ส่ง
                        </button>
                    </div>
                </div>
            )}


            {/* Complete Form */}
            {showCompleteForm && (
                <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">
                        {aiFeedback ? '✨ AI ให้คะแนนแล้ว!' : 'ประเมินผลการฝึก'}
                    </h3>

                    {!aiFeedback && (
                        <div className="mb-6">
                            <label className="block text-gray-700 font-semibold mb-2">
                                คะแนนพึงพอใจ (1-10)
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={score}
                                onChange={(e) => setScore(parseInt(e.target.value))}
                                className="w-full h-3 bg-purple-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="text-center mt-2">
                                <span className="text-4xl font-bold text-purple-600">{score}/10</span>
                            </div>
                        </div>
                    )}

                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">
                            บันทึก / สิ่งที่เรียนรู้
                        </label>
                        <textarea
                            value={notes}
                            onChange={(e) => setNotes(e.target.value)}
                            placeholder="เช่น: วันนี้พูดคล่องขึ้น, Dead Air น้อยลง..."
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                            rows="4"
                        />
                    </div>

                    <button
                        onClick={handleSubmitSession}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 rounded-xl font-bold text-lg hover:shadow-2xl transition transform hover:scale-105"
                    >
                        💾 บันทึกและไปต่อ
                    </button>
                </div>
            )}
        </div>
    );
}

// Power Words View (same as before)
function PowerWordsView({ currentDay, powerWordData, weekData }) {
    return (
        <div className="glass-effect rounded-3xl p-8 shadow-2xl">
            <h2 className="text-2xl font-bold text-gray-800 mb-4">
                📚 Power Words - Day {currentDay}
            </h2>
            <div className="grid gap-4">
                {powerWordData && powerWordData.words.map((word, idx) => (
                    <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 p-6 rounded-xl border-2 border-purple-200">
                        <h3 className="text-2xl font-bold text-purple-600 mb-2">{word.word}</h3>
                        <p className="text-gray-700 mb-3">{word.meaning}</p>
                        <div className="bg-white p-3 rounded-lg border-l-4 border-purple-600">
                            <span className="text-sm text-gray-500">ตัวอย่าง:</span>
                            <p className="text-gray-800 italic">"{word.example}"</p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

// Progress View with Export/Import + History Modal
function ProgressView({ sessions, currentDay, resetProgress, exportToJSON, importFromJSON, achievements }) {
    const [selectedSession, setSelectedSession] = React.useState(null);  // For history modal

    const last7Days = sessions.slice(-7);
    const averageScore = sessions.length > 0
        ? (sessions.reduce((a, b) => a + b.score, 0) / sessions.length).toFixed(1)
        : 0;

    return (
        <div className="space-y-6">
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">📈 สถิติโดยรวม</h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                    <div className="bg-purple-50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-purple-600">{sessions.length}</div>
                        <div className="text-sm text-gray-600">เซสชัน</div>
                    </div>
                    <div className="bg-pink-50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-pink-600">{averageScore}</div>
                        <div className="text-sm text-gray-600">คะแนนเฉลี่ย</div>
                    </div>
                    <div className="bg-indigo-50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-indigo-600">
                            {Math.floor(sessions.reduce((a, b) => a + b.duration, 0) / 60)}
                        </div>
                        <div className="text-sm text-gray-600">นาทีรวม</div>
                    </div>
                    <div className="bg-green-50 p-4 rounded-xl text-center">
                        <div className="text-3xl font-bold text-green-600">{calculateStreak(sessions)}</div>
                        <div className="text-sm text-gray-600">Streak 🔥</div>
                    </div>
                </div>

                {/* Chart */}
                {last7Days.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-700 mb-3">คะแนน 7 วันล่าสุด</h3>
                        <div className="flex items-end gap-2 h-40">
                            {last7Days.map((session, idx) => (
                                <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                                    <div
                                        className="w-full bg-gradient-to-t from-purple-600 to-pink-500 rounded-t-lg"
                                        style={{ height: `${(session.score / 10) * 100}% ` }}
                                    ></div>
                                    <div className="text-xs text-gray-600">D{session.day}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Data Management */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">💾 จัดการข้อมูล</h3>
                <div className="flex gap-4 flex-wrap">
                    <button
                        onClick={exportToJSON}
                        className="bg-blue-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-600 transition"
                    >
                        📥 Export ข้อมูล (JSON)
                    </button>
                    <label className="bg-green-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-green-600 transition cursor-pointer">
                        📤 Import ข้อมูล
                        <input
                            type="file"
                            accept=".json"
                            onChange={importFromJSON}
                            className="hidden"
                        />
                    </label>
                    <button
                        onClick={resetProgress}
                        className="bg-red-500 text-white px-6 py-3 rounded-xl font-semibold hover:bg-red-600 transition"
                    >
                        🔄 รีเซ็ต
                    </button>
                </div>
            </div>

            {/* Session History */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">📝 ประวัติการฝึก</h3>
                {sessions.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">ยังไม่มีประวัติ</p>
                ) : (
                    <div className="space-y-3 max-h-96 overflow-y-auto">
                        {[...sessions].reverse().map((session, idx) => (
                            <div key={idx} className="bg-purple-50 p-4 rounded-lg border-l-4 border-purple-600">
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <span className="font-semibold text-purple-600">Day {session.day}</span>
                                        {session.aiFeedback && (
                                            <span className="ml-2 text-xs bg-purple-200 text-purple-700 px-2 py-1 rounded-full">
                                                ✨ AI
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="font-bold text-purple-600">{session.score.toFixed(1)}/10</div>
                                        <div className="text-xs text-gray-500">{Math.floor(session.duration / 60)} นาที</div>
                                    </div>
                                </div>
                                {session.notes && (
                                    <p className="text-sm text-gray-700 italic mb-2">"{session.notes}"</p>
                                )}
                                {session.aiFeedback && (
                                    <div>
                                        <div className="text-xs text-gray-600 bg-white p-2 rounded mb-2">
                                            <strong>AI:</strong> {session.aiFeedback.nextSteps}
                                        </div>
                                        <button
                                            onClick={() => setSelectedSession(session)}
                                            className="text-xs bg-purple-500 hover:bg-purple-600 text-white px-3 py-1 rounded-full transition"
                                        >
                                            📊 ดู AI Feedback ละเอียด
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* History Detail Modal */}
            {selectedSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={() => setSelectedSession(null)}>
                    <div className="bg-white rounded-3xl p-8 max-w-4xl max-h-[90vh] overflow-y-auto m-4" onClick={(e) => e.stopPropagation()}>
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-3xl font-bold text-gray-800">AI Feedback - Day {selectedSession.day}</h2>
                                <p className="text-gray-600">{new Date(selectedSession.date).toLocaleDateString('th-TH')}</p>
                            </div>
                            <button onClick={() => setSelectedSession(null)} className="text-4xl text-gray-400 hover:text-gray-600 leading-none">&times;</button>
                        </div>

                        {/* Scores */}
                        <div className="bg-purple-50 rounded-2xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-purple-800 mb-4">📊 คะแนน</h3>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                <div><span className="font-semibold">Fluency:</span> {selectedSession.aiFeedback.scores.fluency}/10</div>
                                <div><span className="font-semibold">Clarity:</span> {selectedSession.aiFeedback.scores.clarity}/10</div>
                                <div><span className="font-semibold">Structure:</span> {selectedSession.aiFeedback.scores.structure}/10</div>
                                <div><span className="font-semibold">Pace:</span> {selectedSession.aiFeedback.scores.pace || 'N/A'}/10</div>
                                <div><span className="font-semibold">Pauses:</span> {selectedSession.aiFeedback.scores.pauses || 'N/A'}/10</div>
                                <div className="md:col-span-1"><span className="font-bold text-purple-600">Overall:</span> <span className="text-2xl font-bold text-purple-600">{selectedSession.aiFeedback.scores.overall}/10</span></div>
                            </div>
                        </div>

                        {/* Progression (if exists) */}
                        {selectedSession.aiFeedback.progression && (
                            <div className="bg-green-50 rounded-2xl p-6 mb-6">
                                <h3 className="text-xl font-bold text-green-800 mb-4">📈 ความก้าวหน้า</h3>
                                <div className="mb-4">
                                    <span className="font-semibold">เปรีย บเทียบกับครั้งก่อน:</span>
                                    <span className={`ml - 2 font - bold ${selectedSession.aiFeedback.progression.comparedToPrevious === 'ดีขึ้น' ? 'text-green-600' :
                                        selectedSession.aiFeedback.progression.comparedToPrevious === 'แย่ลง' ? 'text-red-600' : 'text-gray-600'
                                        } `}>{selectedSession.aiFeedback.progression.comparedToPrevious}</span>
                                    <span className="ml-4">Progress Score: <span className="font-bold">{selectedSession.aiFeedback.progression.progressScore}/10</span></span>
                                </div>
                                {selectedSession.aiFeedback.progression.improvements && selectedSession.aiFeedback.progression.improvements.length > 0 && (
                                    <div className="mb-3">
                                        <h4 className="font-semibold text-green-700 mb-2">✅ สิ่งที่ดีขึ้น:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedSession.aiFeedback.progression.improvements.map((imp, i) => <li key={i} className="text-sm">{imp}</li>)}
                                        </ul>
                                    </div>
                                )}
                                {selectedSession.aiFeedback.progression.stillNeedWork && selectedSession.aiFeedback.progression.stillNeedWork.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold text-orange-700 mb-2">⚠️ ยังต้องปรับปรุง:</h4>
                                        <ul className="list-disc list-inside space-y-1">
                                            {selectedSession.aiFeedback.progression.stillNeedWork.map((work, i) => <li key={i} className="text-sm">{work}</li>)}
                                        </ul>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Strengths */}
                        <div className="bg-green-50 rounded-2xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-green-800 mb-4">✅ จุดแข็ง</h3>
                            <ul className="space-y-2">
                                {selectedSession.aiFeedback.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="text-green-600 mr-2">•</span>
                                        <span>{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Improvements */}
                        <div className="bg-orange-50 rounded-2xl p-6 mb-6">
                            <h3 className="text-xl font-bold text-orange-800 mb-4">⚠️ จุดที่ควรปรับปรุง</h3>
                            <ul className="space-y-2">
                                {selectedSession.aiFeedback.improvements.map((imp, i) => (
                                    <li key={i} className="flex items-start">
                                        <span className="text-orange-600 mr-2">•</span>
                                        <span>{imp}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Transcript */}
                        <div className="bg-gray-50 rounded-2xl p-6">
                            <h3 className="text-xl font-bold text-gray-800 mb-4">📝 Transcript</h3>
                            <div className="space-y-2 max-h-60 overflow-y-auto">
                                {Array.isArray(selectedSession.transcript) ? (
                                    selectedSession.transcript.map((seg, i) => (
                                        <div key={i} className="text-sm">
                                            <span className="text-purple-600 font-mono text-xs">
                                                [{seg.startTime?.toFixed(1) || '0.0'}s-{seg.endTime?.toFixed(1) || '0.0'}s]
                                            </span>
                                            <span className="ml-2">{seg.text}</span>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-sm text-gray-700 whitespace-pre-wrap">{selectedSession.transcript || "ไม่มี Transcript"}</p>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Settings View
function SettingsView({ apiKeys, activeKeyId, addApiKey, deleteApiKey, setActiveKey }) {
    const [newKey, setNewKey] = useState('');
    const [newKeyName, setNewKeyName] = useState('');

    function handleAddKey() {
        if (!newKey.trim()) {
            alert('กรุณาใส่ API Key');
            return;
        }

        const added = addApiKey(newKey, newKeyName);
        setNewKey('');
        setNewKeyName('');
        alert(`✅ เพิ่ม "${added.name}" สำเร็จ!`);
    }

    function handleDelete(keyId, keyName) {
        if (confirm(`ลบ "${keyName}" ใช่ไหม ? `)) {
            deleteApiKey(keyId);
            alert('ลบสำเร็จ');
        }
    }

    function formatDate(isoString) {
        if (!isoString) return 'Never';
        const date = new Date(isoString);
        return date.toLocaleString('th-TH', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    }

    function getKeyStatus(key) {
        if (!key.last429) return { text: 'Active', color: 'green', icon: '🟢' };

        const now = new Date();
        const last429Time = new Date(key.last429);
        const hoursSince = (now - last429Time) / (1000 * 60 * 60);

        if (hoursSince < 1) {
            return { text: 'Exhausted', color: 'red', icon: '🔴' };
        } else {
            return { text: 'Recovered', color: 'yellow', icon: '🟡' };
        }
    }

    return (
        <div className="space-y-6">
            {/* API Key List */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h2 className="text-2xl font-bold text-gray-800 mb-6">🔑 API Key Manager</h2>

                {apiKeys.length === 0 ? (
                    <div className="bg-yellow-50 border-2 border-yellow-200 rounded-xl p-6 text-center">
                        <p className="text-yellow-700 font-semibold mb-2">⚠️ ยังไม่มี API Key</p>
                        <p className="text-sm text-gray-600">เพิ่ม API Key ด้านล่างเพื่อเริ่มใช้งาน AI</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {apiKeys.map(key => {
                            const status = getKeyStatus(key);
                            const isActive = key.id === activeKeyId;

                            return (
                                <div
                                    key={key.id}
                                    className={`border - 2 rounded - xl p - 4 ${isActive ? 'border-purple-500 bg-purple-50' : 'border-gray-200 bg-white'} `}
                                >
                                    <div className="flex items-start justify-between flex-wrap gap-3">
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="font-bold text-gray-800">{key.name}</h3>
                                                {isActive && <span className="bg-purple-600 text-white text-xs px-2 py-1 rounded">Active</span>}
                                                <span className={`text - xs px - 2 py - 1 rounded bg - ${status.color} -100 text - ${status.color} -700`}>
                                                    {status.icon} {status.text}
                                                </span>
                                            </div>

                                            <p className="text-xs text-gray-500 font-mono mb-3">
                                                {key.key.substring(0, 15)}...{key.key.substring(key.key.length - 5)}
                                            </p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                                                <div>
                                                    <p className="text-gray-500">Last Used:</p>
                                                    <p className="font-semibold">{formatDate(key.lastUsed)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Last 429:</p>
                                                    <p className="font-semibold">{formatDate(key.last429)}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Success:</p>
                                                    <p className="font-semibold text-green-600">{key.successCount}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-500">Errors:</p>
                                                    <p className="font-semibold text-red-600">{key.errorCount}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex gap-2">
                                            {!isActive && (
                                                <button
                                                    onClick={() => setActiveKey(key.id)}
                                                    className="bg-purple-600 text-white px-3 py-2 rounded-lg text-sm hover:bg-purple-700 transition"
                                                >
                                                    Set Active
                                                </button>
                                            )}
                                            <button
                                                onClick={() => handleDelete(key.id, key.name)}
                                                className="bg-red-500 text-white px-3 py-2 rounded-lg text-sm hover:bg-red-600 transition"
                                            >
                                                🗑️
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Add New Key */}
            <div className="glass-effect rounded-3xl p-8 shadow-2xl">
                <h3 className="text-xl font-bold text-gray-800 mb-4">➕ เพิ่ม API Key ใหม่</h3>

                <div className="space-y-4">
                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            ชื่อ (ตัวเลือก)
                        </label>
                        <input
                            type="text"
                            value={newKeyName}
                            onChange={(e) => setNewKeyName(e.target.value)}
                            placeholder="เช่น Main Key, Backup Key"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        />
                    </div>

                    <div>
                        <label className="block text-gray-700 font-semibold mb-2">
                            🔑 API Key
                        </label>
                        <input
                            type="password"
                            value={newKey}
                            onChange={(e) => setNewKey(e.target.value)}
                            placeholder="AIzaSy..."
                            className="w-full px-4 py-3 border-2 border-purple-200 rounded-xl focus:border-purple-500 focus:outline-none"
                        />
                        <p className="text-sm text-gray-500 mt-2">
                            ได้ฟรีที่: <a href="https://aistudio.google.com/app/apikey" target="_blank" className="text-purple-600 underline">aistudio.google.com</a>
                        </p>
                    </div>

                    <button
                        onClick={handleAddKey}
                        className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-xl transition w-full"
                    >
                        ➕ เพิ่ม API Key
                    </button>
                </div>
            </div>

            {/* Info */}
            <div className="glass-effect rounded-3xl p-6 shadow-xl">
                <h4 className="font-semibold text-blue-600 mb-3">💡 ระบบหมุน Key อัตโนมัติ</h4>
                <ul className="text-sm text-gray-700 space-y-2">
                    <li>✅ เมื่อ Key หนึ่งหมด Quota (429) ระบบจะหมุนไปใช้ Key ถัดไปทันที</li>
                    <li>✅ ไม่มีดาวน์ไทม์ - ฝึกต่อเนื่องได้</li>
                    <li>✅ ติดตาม Stats แบบ Real-time</li>
                    <li>⏰ Key ที่หมด Quota จะฟื้นอัตโนมัติหลัง 1 ชั่วโมง</li>
                </ul>
            </div>
        </div>
    );
}

// Helper
function calculateStreak(sessions) {
    if (sessions.length === 0) return 0;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    let streak = 0;
    let checkDate = new Date(today);

    for (let i = sessions.length - 1; i >= 0; i--) {
        const sessionDate = new Date(sessions[i].date);
        sessionDate.setHours(0, 0, 0, 0);

        if (sessionDate.getTime() === checkDate.getTime()) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
        } else if (sessionDate.getTime() < checkDate.getTime()) {
            break;
        }
    }

    return streak;
}

// Render
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);
