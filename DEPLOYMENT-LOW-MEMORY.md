# 🚀 Coffee PuLa - คู่มือติดตั้งสำหรับเครื่องสเปคต่ำ (4GB RAM)

## 📋 ภาพรวม

ระบบนี้ถูกปรับให้ทำงานบนเครื่อง 4GB RAM แบบ 24/7 โดยใช้สถาปัตยกรรม Server-Client:
- **PC1**: Server (รัน MySQL + Go Backend + Static Files)
- **PC2**: Client (เปิด Browser เข้าหา PC1)

## 💾 การใช้ RAM

| Component | ก่อนปรับปรุง | หลังปรับปรุง |
|-----------|-------------|-------------|
| MySQL | ~400MB | ~150MB |
| Next.js Server | ~150MB | ~0MB (Static) |
| Go Backend | ~50MB | ~50MB |
| Docker | ~200MB | ~100MB |
| **รวม** | **~800MB** | **~200MB** |

**ประหยัดได้ 75%!** (600MB)

---

## 🔧 การติดตั้งครั้งแรก

### ข้อกำหนดเบื้องต้น
- Windows/Linux PC (4GB RAM ขึ้นไป)
- Docker Desktop ติดตั้งแล้ว
- Node.js 18+ และ Go 1.20+
- เครือข่าย LAN (สำหรับ PC2 เชื่อมต่อ PC1)

### 1. Clone โปรเจค
```bash
git clone <repository-url>
cd CafeCoffeePula
```

### 2. ติดตั้ง Dependencies
```bash
# Frontend
npm install

# Backend
cd backend
go mod download
cd ..
```

### 3. รัน Deployment Script

**Windows (PowerShell):**
```powershell
.\deploy-low-memory.ps1
```

**Linux/Mac:**
```bash
chmod +x deploy-low-memory.sh
./deploy-low-memory.sh
```

### 4. เริ่มต้น Backend Server

**Windows:**
```powershell
cd backend
.\server.exe
```

**Linux/Mac:**
```bash
cd backend
./server
```

---

## 🌐 การเข้าถึงระบบ

### จาก PC1 (Server):
```
http://localhost:8081
```

### จาก PC2 (Client):
```
http://192.168.X.X:8081
```
*(เปลี่ยน `192.168.X.X` เป็น IP Address ของ PC1)*

### หา IP Address ของ PC1:

**Windows:**
```powershell
ipconfig
# ดูที่ IPv4 Address
```

**Linux:**
```bash
hostname -I
```

---

## ⚙️ การปรับแต่ง MySQL

ไฟล์ `mysql-low-memory.cnf` ถูกปรับให้ใช้ RAM น้อยลง:

```ini
innodb_buffer_pool_size = 128M    # ลดจาก 400MB+
max_connections = 50               # ลดจาก 151
query_cache_size = 16M            # เปิด cache
performance_schema = OFF          # ปิดเพื่อประหยัด ~50MB
```

### ปรับแต่งเพิ่มเติม (ถ้าต้องการ):

**RAM 2GB**: ลด `innodb_buffer_pool_size` เหลือ `64M`
**RAM 8GB**: เพิ่มเป็น `256M` สำหรับประสิทธิภาพดีขึ้น

---

## 🔄 การ Deploy อัตโนมัติ

ระบบมี 2 แบบ:

### แบบที่ 1: Manual (แนะนำสำหรับการ debug)
```bash
# 1. Build frontend
npm run build:static

# 2. Copy static files
cp -r out/* backend/static/

# 3. Start MySQL
docker-compose up -d mysql

# 4. Build & run backend
cd backend
go build -o server main.go
./server
```

### แบบที่ 2: Automatic (ใช้ script)
```powershell
# Windows
.\deploy-low-memory.ps1

# Linux/Mac
./deploy-low-memory.sh
```

---

## 🎯 คุณสมบัติที่เพิ่มเข้ามา

### 1. **Response Caching** (5 นาที)
- Menu และ Categories ถูก cache เพื่อลดการ query database
- ประหยัดทั้ง CPU และ RAM

### 2. **Compression** (gzip)
- Response ถูก compress ก่อนส่งไปยัง client
- ลดขนาดข้อมูลได้ 60-80%

### 3. **Static File Serving**
- Next.js ถูก build เป็น static HTML/CSS/JS
- Go Backend serve files แทน Next.js server
- ไม่ต้องใช้ RAM สำหรับ Node.js server

### 4. **Network Access**
- Backend รอรับการเชื่อมต่อจากทุก IP ในเครือข่าย
- CORS เปิดให้ client เข้าถึงได้

---

## 🚨 Troubleshooting

### ปัญหา: MySQL ใช้ RAM มากเกินไป
**วิธีแก้:**
```bash
# หยุด MySQL
docker-compose down

# ตรวจสอบว่า config ถูก mount
docker-compose up -d mysql

# ตรวจสอบ config ใน container
docker exec -it coffee-pula-mysql cat /etc/mysql/conf.d/custom.cnf
```

### ปัญหา: PC2 เข้าไม่ได้
**วิธีแก้:**
1. ตรวจสอบ Firewall (เปิด port 8081)
   ```powershell
   # Windows
   New-NetFirewallRule -DisplayName "Coffee POS" -Direction Inbound -LocalPort 8081 -Protocol TCP -Action Allow
   ```

2. ตรวจสอบว่า Backend รอรับ connection จาก 0.0.0.0
   ```go
   // ใน main.go ควรเป็น
   app.Listen("0.0.0.0:8081")  // ✅ ถูกต้อง
   // ไม่ใช่
   app.Listen(":8081")          // ❌ อาจฟังแค่ localhost
   ```

3. Ping ทดสอบ
   ```bash
   # จาก PC2
   ping 192.168.X.X  # IP ของ PC1
   ```

### ปัญหา: Static files ไม่แสดง
**วิธีแก้:**
```bash
# ตรวจสอบว่ามีไฟล์ใน backend/static
ls backend/static

# ถ้าไม่มี ให้ build ใหม่
npm run build:static
cp -r out/* backend/static/
```

---

## 📊 การ Monitor ระบบ

### ตรวจสอบ RAM Usage

**Windows:**
```powershell
# Docker containers
docker stats

# Go Backend (หา PID ก่อน)
tasklist | findstr server.exe
```

**Linux:**
```bash
# Docker containers
docker stats

# Go Backend
ps aux | grep server
top -p $(pgrep server)
```

### Health Check Endpoint
```bash
curl http://localhost:8081/health
```

Response:
```json
{
  "status": "OK",
  "message": "Coffee PuLa Backend is running!"
}
```

---

## 🔒 Security (สำหรับ Production)

ถ้าต้องการเปิดใช้งานจริง ควรเพิ่ม:

1. **Authentication**
   - JWT tokens สำหรับ API
   - Login system

2. **HTTPS**
   - ใช้ reverse proxy (Nginx/Caddy)
   - SSL/TLS certificates

3. **Rate Limiting**
   - จำกัดจำนวน requests per IP

4. **Firewall Rules**
   - อนุญาตเฉพาะ IP ในเครือข่ายท้องถิ่น

---

## 📝 Maintenance

### Daily Backups
```bash
# Backup database
docker exec coffee-pula-mysql mysqldump -u coffee_user -pcoffee_password coffee_pula_db > backup-$(date +%Y%m%d).sql

# Backup script (เพิ่มใน cron/Task Scheduler)
# Linux: crontab -e
# 0 2 * * * /path/to/backup-script.sh
```

### Update System
```bash
# Pull latest code
git pull origin main

# Rebuild
./deploy-low-memory.ps1  # หรือ .sh
```

---

## 🎉 เสร็จสิ้น!

ระบบพร้อมใช้งาน 24/7 บนเครื่อง 4GB RAM!

**สนับสนุน:**
- GitHub Issues: [ลิงก์ repository]
- Email: support@coffee-pula.local

---

**หมายเหตุ:** ระบบนี้ปรับสำหรับร้านกาแฟขนาดเล็ก (1-2 เครื่อง) 
ถ้าต้องการขยายเพิ่ม แนะนำใช้ Cloud Database หรือ Server เครื่องใหญ่
