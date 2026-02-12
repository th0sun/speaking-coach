# 🎯 Gemini Models ที่ใช้ได้

## ✅ Models ที่ทดสอบแล้ว (2026-02-12)

### Gemini 3 Series (ใหม่ล่าสุด!)
- `gemini-3-flash-preview` ← **แนะนำ!** (เร็ว, ใหม่)
- `gemini-3-pro-preview` (ทรงพลัง, ช้ากว่า)
- `gemini-3-pro-image-preview` (รองรับภาพ)

### Gemini 2.5 Series
- `gemini-2.5-flash` (เสถียร)
- `gemini-2.5-pro` (ทรงพลัง)
- `gemini-2.5-flash-lite` (เบา, เร็ว)

### Gemini 2.0 Series
- `gemini-2.0-flash` (เสถียร)
- `gemini-2.0-flash-exp` (experimental)
- `gemini-2.0-flash-lite` (เบาที่สุด)

## 🔧 วิธีเปลี่ยน Model

แก้ `backend/.env`:
```bash
GEMINI_MODEL=gemini-3-flash-preview
```

Restart backend:
```bash
lsof -ti:5001 | xargs kill -9
./start_backend.sh
```

## 💡 เลือก Model ตามงาน

| งาน | Model แนะนำ |
|-----|------------|
| ใช้งานทั่วไป | `gemini-3-flash-preview` |
| ต้องการความแม่นยำสูง | `gemini-3-pro-preview` |
| ต้องการความเร็ว | `gemini-2.5-flash-lite` |
| งบจำกัด (free tier) | `gemini-2.0-flash-lite` |

## ⚠️ Model ที่ไม่มี

- ❌ `gemini-3.0-flash` (ชื่อผิด, ต้องเป็น `gemini-3-flash-preview`)
- ❌ `gemini-1.5-flash` (เก่า, ไม่มีใน v1beta แล้ว)
