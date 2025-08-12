# Coffee PuLa - Database Setup Guide

## การติดตั้งและรัน MySQL ผ่าน Docker

### ข้อกำหนดเบื้องต้น
- Docker Desktop ติดตั้งและเริ่มการทำงานแล้ว
- Docker Compose

### การเริ่มต้นใช้งาน

1. **เริ่ม MySQL และ phpMyAdmin**
```bash
docker-compose up -d
```

2. **ตรวจสอบสถานะ Container**
```bash
docker-compose ps
```

3. **เข้าถึง phpMyAdmin**
- เปิดเว็บเบราว์เซอร์และไปที่: http://localhost:8080
- Username: `root`
- Password: `rootpassword`

4. **รัน Go Backend**
```bash
cd backend
go run main.go
```

### การตั้งค่าฐานข้อมูล

**ข้อมูลการเชื่อมต่อ:**
- Host: `localhost`
- Port: `3306`
- Database: `coffee_pula_db`
- Username: `coffee_user`
- Password: `coffee_password`

**Root Access (สำหรับ phpMyAdmin):**
- Username: `root`
- Password: `rootpassword`

### คำสั่งที่มีประโยชน์

**หยุด Services:**
```bash
docker-compose down
```

**หยุดและลบข้อมูล:**
```bash
docker-compose down -v
```

**ดู Logs:**
```bash
docker-compose logs mysql
docker-compose logs phpmyadmin
```

**เข้าไปใน MySQL Container:**
```bash
docker exec -it coffee-pula-mysql mysql -u root -p
```

**Backup Database:**
```bash
docker exec coffee-pula-mysql mysqldump -u root -prootpassword coffee_pula_db > backup.sql
```

**Restore Database:**
```bash
docker exec -i coffee-pula-mysql mysql -u root -prootpassword coffee_pula_db < backup.sql
```

### โครงสร้างไฟล์

```
├── docker-compose.yml          # Docker services configuration
├── mysql-init/
│   └── 01-init.sql            # Database initialization script
├── backend/
│   ├── .env                   # Environment variables
│   └── ...                    # Go backend files
└── README-DATABASE.md         # คู่มือนี้
```

### การแก้ปัญหา

**ปัญหา: Container ไม่สามารถเริ่มได้**
```bash
docker-compose down -v
docker-compose up -d
```

**ปัญหา: Port 3306 ถูกใช้งานแล้ว**
- แก้ไข port ในไฟล์ `docker-compose.yml`
- หรือหยุด MySQL service ที่รันอยู่ในเครื่อง

**ปัญหา: Backend เชื่อมต่อไม่ได้**
- ตรวจสอบว่า MySQL container ทำงานอยู่
- ตรวจสอบการตั้งค่าใน `.env` file
- ดู logs: `docker-compose logs mysql`
