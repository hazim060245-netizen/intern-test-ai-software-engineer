# แบบทดสอบคัดเลือกนักศึกษาฝึกงาน - AI Software Engineer

โปรเจกต์นี้จัดทำขึ้นเพื่อการทดสอบคัดเลือกนักศึกษาฝึกงาน ตำแหน่ง AI Software Engineer ครอบคลุมการออกแบบสถาปัตยกรรมระบบ, การออกแบบฐานข้อมูล, การพัฒนาเว็บแอปพลิเคชัน และการตรวจสอบค้นหาบั๊ก (Debugging & Code Review)

---

## 📁 โครงสร้างโปรเจกต์ (Repository Structure)

```text
├── README.md              # คำอธิบายโปรเจกต์, Tech Stack, วิธีการรัน, บัญชีทดสอบ
├── START.md               # เวลาเริ่มต้นทำแบบทดสอบ
├── internship-test.md     # โจทย์และข้อกำหนดของแบบทดสอบ
├── section-1/             # ส่วนที่ 1: System Design & Decision Log
│   ├── flowchart.html     # Flowchart แบบ Interactive เปิดดูใน Browser ได้ทันที
│   ├── flowchart.md       # Flowchart ในรูปแบบ Mermaid Markdown
│   └── DECISIONS.md       # บันทึกการตัดสินใจ 5 ข้อ (D1–D5) พร้อม AI Disclosure
├── section-2/             # ส่วนที่ 2: Tech Stack & Database Design
│   └── schema.sql         # สคริปต์สร้างตาราง PostgreSQL (users, projects, tasks, audit_log, indexes)
├── section-3/             # ส่วนที่ 3: Web Implementation (React Web App)
│   ├── src/
│   │   ├── components/    # Navbar, ProtectedRoute (Route Guard)
│   │   ├── context/       # AuthContext (State Management)
│   │   ├── mock/          # mockData.js, api.js (Simulated Async API)
│   │   ├── pages/         # LoginPage, AdminPage, EmployeePage
│   │   ├── App.jsx        # Routing Setup
│   │   └── App.css        # Responsive Modern UI
│   └── package.json
└── section-4/             # ส่วนที่ 4: Debugging & Code Review
    ├── tasks.js           # Express Router ที่แก้ไขบั๊กครบทุกจุด
    ├── EmployeeTasks.jsx  # React Component ที่แก้ไขบั๊กครบทุกจุด
    └── BUGS.md            # รายการบั๊กเรียงตามความรุนแรง พร้อมวิธีพิสูจน์ 1 ประโยค
```

---

## 🛠️ ส่วนที่ 2.1: Tech Stack & เหตุผลความเหมาะสม

สำหรับเว็บแอปพลิเคชันใน **ส่วนที่ 3** เราเลือกใช้ Tech Stack ดังนี้:

| เทคโนโลยี / ไลบรารี | บทบาทในระบบ | เหตุผลความเหมาะสมกับโจทย์นี้โดยเฉพาะ |
|---|---|---|
| **React 19 + Vite** | Frontend Framework & Build Tool | โจทย์เน้นการเปลี่ยนสถานะงานที่ต้องเห็นผลทันที (`Immediate UI Update`) และการแสดงผลตามเงื่อนไข (Conditional Rendering) ตามสิทธิ์ผู้ใช้ Vite ให้ Hot Module Replacement (HMR) ที่รวดเร็วมาก ทำให้ทดสอบ Route Guard และ Mock API ได้ทันทีโดยไม่เสียเวลา build |
| **React Router v7** | Client-Side Routing & Navigation | มีระบบ Route Guard ที่ยืดหยุ่น สามารถสร้าง `<ProtectedRoute requiredRole="...">` ครอบ Route `/admin` และ `/employee` เพื่อตรวจสอบสิทธิ์และ Redirect กลับหน้าของตนเองพร้อมแนบ State ข้อความแจ้งเตือนได้อย่างแม่นยำ |
| **React Context API** | State Management | ข้อมูลที่ต้องแชร์ข้ามหน้ามีเพียงข้อมูลผู้ใช้ที่ล็อกอิน (User, Role, Token) และข้อความแจ้งเตือน Flash Alert การใช้ Context จึงเพียงพอและเบาที่สุด ไม่ต้องพึ่งพา Redux หรือ Zustand ให้ซับซ้อนเกินความจำเป็น |
| **Simulated Async API (Promise + setTimeout)** | Data Layer | จำลองสภาพแวดล้อม Network Latency จริง (500ms) เพื่อให้เห็นสถานะกำลังโหลด (Loading State) และการจัดการกรณี Error (เช่น ไม่พบบัญชีในระบบ หรือไม่มีสิทธิ์แก้ไข) ได้อย่างสมบูรณ์แบบตามเกณฑ์ |
| **Lucide React** | UI Icons | ไอคอนสถานะ (To Do, Done, Shield, Lock) ที่เบา คมชัด ช่วยเพิ่มความเข้าใจในบทบาทและการแสดงผลสถานะที่ถูกล็อก |

---

## 🚀 วิธีการรันโปรเจกต์เว็บแอป (ส่วนที่ 3)

### ความต้องการขั้นต่ำของระบบ
- Node.js version 18.0.0 ขึ้นไป
- npm version 9.0.0 ขึ้นไป

### ขั้นตอนการรัน
1. เข้าไปยังโฟลเดอร์ `section-3`:
   ```bash
   cd section-3
   ```
2. ติดตั้ง Dependencies:
   ```bash
   npm install
   ```
3. เริ่มต้น Development Server:
   ```bash
   npm run dev
   ```
4. เปิดเว็บเบราว์เซอร์ไปที่:
   ```text
   http://localhost:5173/
   ```

---

## 👥 บัญชีสำหรับทดสอบระบบ (Test Accounts)

ระบบมีปุ่ม **คลิกเพื่อเลือกบัญชีทันที (Quick Login)** ในหน้า Login เพื่อความสะดวกรวดเร็วในการตรวจ:

| Username | Role | ชื่องาน / หน้าที่ | สิทธิ์ที่ได้รับ |
|---|---|---|---|
| `admin` | **Admin** | Somkiat Admin | เข้าหน้า `/admin` ได้, เห็น Task ทั้งหมด, สร้าง Task ใหม่ได้, เปลี่ยนสถานะ Task ใดก็ได้ |
| `employee1` | **Employee** | Somchai Prasert | เข้าหน้า `/employee` ได้, เห็นเฉพาะงานของตนเอง, เปลี่ยนได้เฉพาะ To Do → Done |
| `employee2` | **Employee** | Somsri Sukjai | เข้าหน้า `/employee` ได้, เห็นเฉพาะงานของตนเอง, เปลี่ยนได้เฉพาะ To Do → Done |
| `invalid_user` | *ไม่มีในระบบ* | - | สำหรับทดสอบกรณี Error State (Mock API จะปฏิเสธและแสดงข้อความแจ้งเตือนสีแดง) |

---

## 🧪 การทดสอบฟีเจอร์และ Route Guard (ตามเกณฑ์ขั้นต่ำ)

1. **กรณีไม่ได้เข้าสู่ระบบ:**
   - พิมพ์เข้า URL `http://localhost:5173/admin` หรือ `/employee` โดยตรง → ระบบจะ Redirect กลับมาที่หน้า `/login` ทันที
2. **กรณีข้ามสิทธิ์ Role (Admin เข้า /employee หรือ Employee เข้า /admin):**
   - เข้าสู่ระบบด้วย `employee1` แล้วลองพิมพ์ URL `/admin` → ระบบจะบล็อกและ Redirect กลับมาที่ `/employee` พร้อมแสดงแถบสีแดงแจ้งเตือนว่าไม่มีสิทธิ์
   - เข้าสู่ระบบด้วย `admin` แล้วลองพิมพ์ URL `/employee` → ระบบจะบล็อกและ Redirect กลับมาที่ `/admin` พร้อมแถบแจ้งเตือน
3. **การสร้าง Task (Admin):**
   - ในหน้า `/admin` กรอกชื่องานและเลือกผู้รับผิดชอบ กด "สร้าง Task" → งานใหม่จะปรากฏขึ้นในตารางทันที
4. **การเปลี่ยนสถานะ (Employee):**
   - ในหน้า `/employee` กดปุ่ม "เปลี่ยนเป็น Done" → สถานะจะเปลี่ยนเป็น Done ทันที และปุ่มจะถูกล็อกเป็น "เสร็จสิ้น (ล็อก)" ไม่สามารถกดเปลี่ยนย้อนกลับได้ตามกฎระบบ
