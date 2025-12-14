# 🔋 Low Memory Development Guide

## การใช้งาน Dev Mode แบบประหยัด RAM

### 🚀 Quick Start

**Windows (แนะนำ):**
```powershell
.\dev-low-memory.ps1
```

**Linux/Mac:**
```bash
chmod +x dev-low-memory.sh
./dev-low-memory.sh
```

**Manual:**
```bash
# Terminal 1: MySQL
docker-compose up -d mysql

# Terminal 2: Backend
cd backend
LOW_MEMORY=true go run main.go

# Terminal 3: Frontend
npm run dev:low-memory
```

---

## 💾 การใช้ RAM เปรียบเทียบ

| Mode | Next.js | Go Backend | MySQL | Total |
|------|---------|------------|-------|-------|
| **Normal Dev** | ~800MB | ~50MB | ~400MB | ~1.25GB |
| **Low Memory** | ~512MB | ~30MB | ~150MB | ~700MB |
| **ประหยัด** | 288MB | 20MB | 250MB | **558MB** |

---

## ⚙️ Optimizations ที่ใช้

### 1. **Next.js (512MB limit)**
```bash
NODE_OPTIONS=--max-old-space-size=512
```
- จำกัด Node.js heap ที่ 512MB
- ปิด telemetry
- Turbopack mode (เร็วกว่า webpack)

### 2. **Go Backend (~30MB)**
```go
runtime.GOMAXPROCS(1)           // ใช้ 1 core
debug.SetGCPercent(20)          // GC aggressive
debug.SetMemoryLimit(50 << 20) // 50MB limit
```

### 3. **MySQL (~150MB)**
```ini
innodb_buffer_pool_size = 128M
max_connections = 50
performance_schema = OFF
```

### 4. **Fiber Web Framework**
```go
Concurrency: 256              // จำกัด connections
BodyLimit: 4MB                // จำกัดขนาด request
ReadBufferSize: 4KB           // ลด buffer
```

---

## 📊 Monitor Memory Usage

### Windows:
```powershell
# Docker containers
docker stats

# Node.js process
Get-Process node | Select-Object Name, PM, VM

# Go process
Get-Process go | Select-Object Name, PM, VM
```

### Linux/Mac:
```bash
# Docker containers
docker stats

# All processes
ps aux | grep -E "(node|go)"

# Watch memory
watch -n 1 'free -m && docker stats --no-stream'
```

---

## 🎯 Tips สำหรับประหยัด RAM เพิ่ม

### 1. ปิด Browser Tabs ที่ไม่ใช้
- Dev Tools ใช้ RAM ~100-200MB
- แต่ละ tab ใช้ ~50-100MB

### 2. Disable Browser Extensions
```
Chrome > Settings > Extensions
ปิด extension ที่ไม่จำเป็นขณะ dev
```

### 3. ใช้ Lightweight Browser
- Firefox Developer Edition (~300MB)
- Edge (~250MB)
- แทน Chrome (~500MB+)

### 4. Hot Reload แค่ file ที่แก้
```bash
# Next.js จะ reload แค่ส่วนที่เปลี่ยน
# ไม่ต้อง refresh ทั้งหน้า
```

### 5. Close phpMyAdmin
```bash
# ถ้าไม่ได้ใช้ ให้ปิด
docker-compose stop phpmyadmin
# ประหยัดได้ ~50MB
```

---

## 🐛 Troubleshooting

### ปัญหา: "JavaScript heap out of memory"
**วิธีแก้:**
```bash
# เพิ่ม memory limit (ถ้า RAM พอ)
NODE_OPTIONS=--max-old-space-size=768 npm run dev
```

### ปัญหา: Next.js ช้า
**วิธีแก้:**
```bash
# ลบ .next folder แล้ว build ใหม่
Remove-Item -Recurse -Force .next
npm run dev:low-memory
```

### ปัญหา: Go Backend ใช้ RAM เยอะ
**วิธีแก้:**
```bash
# เปิด LOW_MEMORY mode
$env:LOW_MEMORY="true"
cd backend
go run main.go
```

### ปัญหา: MySQL ช้า
**วิธีแก้:**
```bash
# Restart with optimized config
docker-compose down
docker-compose up -d mysql
```

---

## 🔧 ปรับแต่งเพิ่มเติม

### เพิ่ม Memory Limit (ถ้า RAM มากกว่า 4GB)
```bash
# .env.development
NODE_OPTIONS=--max-old-space-size=1024  # 1GB
```

### ลด Memory Limit (ถ้า RAM น้อยกว่า 4GB)
```bash
# .env.development
NODE_OPTIONS=--max-old-space-size=384   # 384MB
```

### Disable Hot Reload (ประหยัดสุด)
```bash
# next.config.ts
export default {
  reactStrictMode: false,
  swcMinify: true,
}
```

---

## 📈 Performance Monitoring

### Memory Profiling (Go Backend)
```go
import _ "net/http/pprof"

// เข้า http://localhost:8081/debug/pprof/heap
```

### Next.js Bundle Analysis
```bash
npm install @next/bundle-analyzer

# next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
})

module.exports = withBundleAnalyzer(config)
```

---

## ✅ Checklist ก่อน Dev

- [ ] ปิด applications ที่ไม่ใช้
- [ ] ปิด browser tabs ส่วนเกิน
- [ ] Check Docker Desktop running
- [ ] Run `.\dev-low-memory.ps1`
- [ ] Monitor memory ด้วย `docker stats`

---

## 🆘 Need Help?

**RAM ไม่พอ?** → ใช้ Static Export แทน (ไม่ต้อง run dev server)
```bash
npm run build:static
cd backend && go run main.go
# เปิด http://localhost:8081
```

**ช้ามาก?** → ลอง disable features ที่ไม่ได้ใช้:
- Dark mode toggle
- Real-time updates
- Auto-save

**ยังไม่พอ?** → พิจารณา:
- เพิ่ม RAM
- ใช้ Cloud IDE (GitHub Codespaces)
- Split development (Backend อยู่เครื่องนึง, Frontend อีกเครื่อง)
