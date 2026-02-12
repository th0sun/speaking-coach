# 🚀 Deployment Guide - Speaking Coach Pro

## การใช้งานทั่วโลก (Global Access)

### สถาปัตยกรรม:
```
Frontend (GitHub Pages)          Backend + Database (Render)
https://th0sun.github.io/        https://speaking-coach.onrender.com
speaking-coach/                  - FastAPI/Flask
                                  - PostgreSQL (persistent)
                                  - API endpoints
                                  ↓
                                  Data Storage
                                  - User accounts
                                  - Session history
                                  - Sync across devices
```

---

## ขั้นตอนการ Deploy

### 1️⃣ **Frontend - GitHub Pages**

ตอนนี้ frontend ถูก deploy ไปแล้วที่:
```
https://th0sun.github.io/speaking-coach/
```

**ตรวจสอบ:**
- ✅ Code ในสาขา main ถูก push ไปแล้ว
- ✅ GitHub Pages ถูกเปิดใช้งาน (Settings → Pages)
- ✅ URL ของ backend ชี้ไปที่ Render

---

### 2️⃣ **Backend - Render.com (สำคัญ!)**

#### ขั้นที่ 1: สร้าง PostgreSQL Database บน Render

1. เข้า https://render.com
2. สร้าง "New PostgreSQL"
3. ตั้งชื่อ: `speaking-coach-db`
4. สร้างเสร็จแล้ว copy: **External Database URL**
   ```
   postgresql://user:password@host:5432/dbname
   ```

#### ขั้นที่ 2: Deploy Backend ไป Render

1. เข้า https://render.com
2. สร้าง "New Web Service"
3. เลือก Repository: `speaking-coach` (หรือ URL git)
4. ตั้งค่า:
   ```
   Name: speaking-coach
   Runtime: Python 3.11
   Build Command: pip install -r backend/requirements.txt
   Start Command: cd backend && python server.py
   Region: Singapore (หรือใกล้คุณที่สุด)
   ```

5. เพิ่ม Environment Variables:
   ```
   GEMINI_API_KEY=your_gemini_key_here
   GEMINI_MODEL=gemini-2.0-flash
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   ```
   (ใส่ URL จาก PostgreSQL ที่สร้างไว้)

6. Deploy!

#### ขั้นที่ 3: ตรวจสอบ Backend ทำงานได้

```bash
curl https://speaking-coach.onrender.com/api/health
```

ควรได้:
```json
{
  "status": "ok",
  "model": "gemini-2.0-flash",
  "api_key_set": true,
  "database": "PostgreSQL (Render)"
}
```

---

## ✅ ตรวจสอบว่าทุกอย่างทำงาน

### 1. เปิด Frontend
```
https://th0sun.github.io/speaking-coach/
```

### 2. สมัครสมาชิก (Register)
- Username: `testuser`
- PIN: `123456`
- ✅ ควรสำเร็จ (data บันทึกใน PostgreSQL)

### 3. เข้าสู่ระบบ (Login)
- ✅ ควรเข้าได้

### 4. ทดสอบ Sync
- **เครื่องที่ 1**: Login → ทำการฝึก → Data save
- **เครื่องที่ 2** (หรือ browser ใหม่): Login ด้วย username เดิม
- ✅ ควรเห็น data ที่ฝึกจากเครื่องที่ 1

### 5. ตรวจสอบ Data ไม่หาย
- ✅ Database อยู่ใน PostgreSQL → Persistent
- ✅ ไม่หายแม้ Render redeploy
- ✅ Accessible จากทุกมุมโลก

---

## 🔒 สิ่งที่ต้องดูแล

### API Key Security
- ❌ อย่า commit `.env` ไปยัง Git
- ✅ ตั้งค่า environment variables ใน Render dashboard
- ✅ มีการป้องกัน CORS แล้ว

### Database URL
- ⚠️ Environment variable `DATABASE_URL` มีความสำคัญ
- ✅ Render ตั้งค่าให้อัตโนมัติ
- ✅ ต้องระบุใน backend/.env สำหรับ local development

---

## 📊 โครงสร้างข้อมูล

### PostgreSQL Tables:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username TEXT UNIQUE NOT NULL,
    pin TEXT NOT NULL,
    data TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

### Data Structure (JSON):
```json
{
  "currentDay": 1,
  "sessions": [
    {
      "day": 1,
      "topic": "Self Introduction",
      "duration": 120,
      "aiFeedback": { ... },
      "timestamp": "2026-02-13T10:30:00"
    }
  ],
  "achievements": [ ... ],
  "settings": {
    "apiKeys": [ ... ]
  }
}
```

---

## 🔄 Data Sync Flow

### Frontend → Backend:
```
1. ผู้ใช้ทำการฝึก → Data เปลี่ยน
2. Debounce 1 วินาที
3. Send POST /api/save_data
4. ✅ Save to PostgreSQL
5. ✅ Save to localStorage (backup)
```

### Login Flow:
```
1. Username + PIN
2. POST /api/login → Query PostgreSQL
3. Return: user info + data
4. ✅ Restore session to memory
5. ✅ Save to localStorage
```

### Next Login:
```
1. App startup → Check localStorage
2. Found → Auto-restore session
3. ✅ ไม่ต้อง login ซ้ำ
```

---

## 📱 ใช้งานจากทั่วโลก

### สิ่งที่เป็นไปได้:
- ✅ Login จากมือถือ
- ✅ ฝึกพูด → Data บันทึก
- ✅ Switch ไป PC → Data ยังอยู่
- ✅ เครื่องใหม่ → ใช้ username/PIN เดิม → ได้ data เดิม
- ✅ Offline ใช้ได้ → Sync เมื่อออนไลน์

---

## 🐛 Troubleshooting

### "Cannot connect to database"
```
→ ตรวจสอบ DATABASE_URL ใน Render environment variables
→ ตรวจสอบ PostgreSQL instance ยังทำงาน
```

### "Data not syncing"
```
→ Check browser console (F12)
→ ดู logs ใน Render dashboard
→ ใช้ localStorage backup ระหว่างรอ
```

### "Backend timeout"
```
→ เพิ่ม timeout limit ใน requirements.txt
→ Database query อาจช้า → check query performance
```

---

## 📝 Environment Variables ที่ต้อง

### Local Development (.env):
```
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=postgresql://user:password@localhost:5432/speaking_coach
```

### Render Dashboard (Environment):
```
GEMINI_API_KEY=your_key
GEMINI_MODEL=gemini-2.0-flash
DATABASE_URL=<auto from PostgreSQL connection>
```

---

## ✨ สรุป

```
✅ Frontend:    GitHub Pages (static, global CDN)
✅ Backend:     Render.com (API, auto-scaling)
✅ Database:    PostgreSQL on Render (persistent, global)
✅ Sync:        REST API + localStorage backup
✅ Security:    CORS, environment variables, authentication
✅ Global:      Accessible from anywhere, any device
✅ Reliable:    Auto-retry, fallback storage, no data loss
```

---

**Last Updated:** 2026-02-13  
**Version:** 2.0

