# 🚀 Quick Start Guide - Windows CMD

## วิธีเริ่มต้น Development (ง่ายที่สุด)

### ขั้นตอนที่ 1: เปิด Docker Desktop
```
1. กด Windows Key
2. พิมพ์ "Docker Desktop"
3. คลิกเพื่อเปิด
4. รอจน icon Docker เป็นสีเขียว (พร้อมใช้งาน)
```

### ขั้นตอนที่ 2: รันระบบ

**วิธีที่ 1 - All-in-One (แนะนำ):**
```cmd
start-all.bat
```

**วิธีที่ 2 - แยก Terminal:**
```cmd
REM Terminal 1
start-docker.bat

REM Terminal 2
cd backend
go run main.go

REM Terminal 3
npm run dev:low-memory
```

---

## 📁 ไฟล์ที่สร้างให้:

| ไฟล์ | ใช้ทำอะไร | สำหรับ |
|------|-----------|--------|
| `start-all.bat` | รันทุกอย่าง 1 ครั้ง | CMD ✅ |
| `start-docker.bat` | เริ่ม Docker + คำแนะนำ | CMD ✅ |
| `dev-low-memory.bat` | Dev mode แบบประหยัด RAM | CMD ✅ |
| `dev-low-memory.ps1` | Dev mode แบบประหยัด RAM | PowerShell |
| `dev-low-memory.sh` | Dev mode แบบประหยัด RAM | Git Bash/Linux |

---

## 🆘 แก้ปัญหา:

### ❌ "Docker is not running"
```
เปิด Docker Desktop แล้วรอจนกว่าจะเห็น:
- Icon Docker เป็นสีเขียว
- ข้อความ "Docker Desktop is running"
```

### ❌ "go: command not found"
```
ติดตั้ง Go:
1. ไป https://go.dev/dl/
2. Download Go for Windows
3. Install
4. Restart CMD
```

### ❌ "npm: command not found"
```
ติดตั้ง Node.js:
1. ไป https://nodejs.org/
2. Download LTS version
3. Install
4. Restart CMD
```

---

## 💾 การใช้ RAM:

```
Next.js:    512MB (limited)
Go Backend:  30MB (optimized)
MySQL:      150MB (optimized)
---------------------------------
Total:      ~700MB
```

---

## 🎯 Tips:

1. **ใช้ start-all.bat** สำหรับ dev ทั่วไป
2. **ใช้ start-docker.bat** ถ้าอยากควบคุมเอง
3. **ปิด browser tabs** ที่ไม่ใช้เพื่อประหยัด RAM
4. **ใช้ Firefox** แทน Chrome (ประหยัด RAM)

---

## ✅ เสร็จแล้ว!

เปิด CMD แล้วพิมพ์:
```cmd
start-all.bat
```

🚀 Done!
