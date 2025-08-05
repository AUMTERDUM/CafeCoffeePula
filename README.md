# Coffee PuLa POS System ☕

<div align="center">

![Coffee PuLa Logo](https://via.placeholder.com/200x200/8B4513/FFFFFF?text=☕+PuLa)

**ระบบ Point of Sale (POS) สำหรับร้านกาแฟที่พัฒนาด้วย Next.js 15, TypeScript, และ Go Fiber**

[![GitHub release](https://img.shields.io/github/release/AUMTERDUM/CafeCoffeePula.svg)](https://github.com/AUMTERDUM/CafeCoffeePula/releases)
[![Next.js](https://img.shields.io/badge/Next.js-15.4.5-black)](https://nextjs.org/)
[![Go](https://img.shields.io/badge/Go-1.24.4-blue)](https://golang.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.0-38B2AC)](https://tailwindcss.com/)

</div>

## ✨ คุณสมบัติหลัก

### 🧾 ระบบ POS หลัก
- 🛒 **ระบบขายสินค้า**: หน้าขายพร้อมตะกร้าสินค้า
- 💰 **ระบบชำระเงิน**: คิดเงินและพิมพ์ใบเสร็จ
- 📦 **จัดการสต็อก**: ติดตามและจัดการสต็อกสินค้าอัตโนมัติ
- 🖨️ **พิมพ์ใบเสร็จ**: รองรับเครื่องพิมพ์เทอร์มอล

### 👥 ระบบสมาชิกและแต้มสะสม
- 📝 **จัดการสมาชิก**: เพิ่ม แก้ไข ลบข้อมูลสมาชิก
- ⭐ **แต้มสะสม**: สะสมแต้มจากการซื้อ (100 บาท = 1 แต้ม)
- 🎁 **ระบบรางวัล**: แลกของรางวัลด้วยแต้ม
- 🏆 **ระดับสมาชิก**: Bronze, Silver, Gold, Platinum
- 📊 **ติดตามแต้ม**: ประวัติการได้รับและใช้แต้ม

### 🧾 บัญชีต้นทุนและกำไร
- 💵 **จัดการต้นทุน**: ต้นทุนแต่ละเมนู (วัตถุดิบ, แรงงาน, ค่าใช้จ่าย)
- 📈 **วิเคราะห์กำไร**: กำไรขั้นต้นต่อวัน/ต่อเมนู
- 📊 **รายงานกำไร**: สรุปผลการดำเนินงานรายวัน
- 🎯 **การวิเคราะห์**: ติดตามประสิทธิภาพและแนวโน้ม

### 🎟️ ระบบโปรโมชัน
- 🎫 **คูปองส่วนลด**: สร้างและจัดการคูปอง
- ⏰ **Happy Hour**: ส่วนลดตามช่วงเวลา
- 🎉 **โปรโมชันพิเศษ**: ซื้อ 2 แถม 1, ส่วนลดตามจำนวน

### 📊 ระบบรายงานและสถิติ
- 📈 **รายงานยอดขาย**: สถิติรายวัน/รายเดือน/รายปี
- 🥇 **เมนูขายดี**: วิเคราะห์เมนูที่ได้รับความนิยม
- 👥 **สถิติลูกค้า**: ข้อมูลพฤติกรรมลูกค้า
- 💹 **แดชบอร์ด**: ภาพรวมธุรกิจแบบเรียลไทม์

## 🛠️ เทคโนโลยีที่ใช้

### Frontend
- **Next.js 15.4.5** - React Framework
- **TypeScript** - Type Safety
- **Tailwind CSS** - Styling
- **Lucide React** - Icons

### Backend
- **Go 1.24.4** - Programming Language
- **Fiber v2.52.0** - Web Framework
- **GORM v1.25.5** - ORM
- **SQLite** - Database

### ธีมและการออกแบบ
- **Coffee Theme** - ธีมสีน้ำตาลกาแฟ (#8B4513, #A0522D, #D2B48C)
- **Responsive Design** - รองรับทุกขนาดหน้าจอ
- **Dark Mode** - สลับธีมสีได้
- **Modern UI/UX** - การออกแบบที่ใช้งานง่าย

## 🚀 การติดตั้งและใช้งาน

### ⚠️ ข้อกำหนดระบบ
- **Node.js** 18.17+ 
- **Go** 1.19+
- **Git** สำหรับ clone repository

### 1. Clone Repository
```bash
git clone https://github.com/AUMTERDUM/CafeCoffeePula.git
cd CafeCoffeePula
```

### 2. ติดตั้ง Dependencies

#### Frontend (Next.js)
```bash
npm install
```

#### Backend (Go)
```bash
cd backend
go mod tidy
```

### 3. รัน Development Server

#### เริ่ม Backend
```bash
cd backend
go run .
```

#### เริ่ม Frontend
```bash
npm run dev
```

### 4. เข้าใช้งาน
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8080
- **API Documentation**: http://localhost:8080/docs (Swagger)

### 5. ข้อมูลเริ่มต้น
ระบบจะสร้างข้อมูลตัวอย่างดังนี้:
- **เมนูกาแฟ**: Espresso, Americano, Latte, Cappuccino
- **สมาชิกตัวอย่าง**: ลูกค้าทดสอบพร้อมแต้มสะสม
- **ข้อมูลต้นทุน**: ต้นทุนตัวอย่างสำหรับแต่ละเมนู

## 📁 โครงสร้างโปรเจค

```
coffee-pula/
├── src/                    # Frontend (Next.js)
│   ├── app/               # App Router
│   │   ├── page.tsx       # หน้าหลัก
│   │   ├── pos/          # ระบบ POS
│   │   ├── loyalty/      # ระบบสมาชิก
│   │   ├── cost/         # บัญชีต้นทุน
│   │   └── ...
│   ├── components/        # React Components
│   └── lib/              # Utilities & API
├── backend/               # Backend (Go)
│   ├── main.go           # Entry point
│   ├── models/           # Database models
│   ├── handlers/         # API handlers
│   └── database/         # Database config
├── prisma/               # Database schema
└── public/               # Static files
```

## 🎯 วิธีใช้งาน

### ระบบ POS
1. เลือกเมนูจากรายการสินค้า
2. เพิ่มลงตะกร้าสินค้า
3. เลือกสมาชิก (ถ้ามี) เพื่อสะสมแต้ม
4. ชำระเงินและพิมพ์ใบเสร็จ

### ระบบสมาชิก
1. เพิ่มสมาชิกใหม่ด้วยข้อมูลพื้นฐาน
2. สมาชิกจะได้รับแต้มจากการซื้อ
3. ใช้แต้มแลกของรางวัล
4. ติดตามประวัติการใช้แต้ม

### บัญชีต้นทุน
1. กำหนดต้นทุนแต่ละเมนู (วัตถุดิบ 60%, แรงงาน 30%, ค่าใช้จ่าย 10%)
2. ดูรายงานกำไรรายวัน พร้อมกราฟและสถิติ
3. วิเคราะห์ประสิทธิภาพสินค้า และเปรียบเทียบกำไร
4. ติดตามแนวโน้มผลกำไรและ ROI

## 📊 ตัวอย่างข้อมูล

### เมนูและราคา
| เมนู | ราคาขาย | ต้นทุน | กำไร | % กำไร |
|------|---------|--------|------|--------|
| Espresso | ฿45 | ฿15 | ฿30 | 66.7% |
| Americano | ฿50 | ฿18 | ฿32 | 64.0% |
| Latte | ฿65 | ฿25 | ฿40 | 61.5% |
| Cappuccino | ฿60 | ฿22 | ฿38 | 63.3% |

### ระดับสมาชิก
| ระดับ | เงื่อนไข | สิทธิพิเศษ | แต้มโบนัส |
|-------|----------|------------|-----------|
| Bronze | 0-999 แต้ม | ส่วนลด 5% | 1x |
| Silver | 1,000-2,999 แต้ม | ส่วนลด 10% | 1.2x |
| Gold | 3,000-4,999 แต้ม | ส่วนลด 15% | 1.5x |
| Platinum | 5,000+ แต้ม | ส่วนลด 20% | 2x |

## 📱 Screenshots

### หน้าหลัก (Dashboard)
![Dashboard](https://via.placeholder.com/800x400/8B4513/FFFFFF?text=Coffee+PuLa+Dashboard)

### ระบบ POS
![POS System](https://via.placeholder.com/800x400/A0522D/FFFFFF?text=POS+System)

### ระบบสมาชิก
![Loyalty System](https://via.placeholder.com/800x400/D2B48C/000000?text=Loyalty+System)

### บัญชีต้นทุนและกำไร
![Cost Management](https://via.placeholder.com/800x400/CD853F/FFFFFF?text=Cost+Management)

## 🤝 การมีส่วนร่วม

หากต้องการปรับปรุงหรือเพิ่มฟีเจอร์:

1. Fork repository
2. สร้าง feature branch
3. Commit การเปลี่ยนแปลง
4. สร้าง Pull Request

## 📄 License

MIT License - ดูรายละเอียดในไฟล์ LICENSE

## 🙏 Acknowledgments

- 🤖 **สร้างโดย**: GitHub Copilot AI Assistant
- ⚡ **Backend Framework**: Go Fiber - Express-inspired web framework
- ⚛️ **Frontend Framework**: Next.js - The React Framework for Production
- 🎨 **UI Design**: Tailwind CSS - Utility-first CSS framework
- 🔗 **Icons**: Lucide React - Beautiful & consistent icon toolkit
- 📊 **Database**: GORM - The fantastic ORM library for Golang

### 💡 Special Thanks
- **Coffee Enthusiasts** - แรงบันดาลใจในการสร้างระบบ POS สำหรับร้านกาแฟ
- **Open Source Community** - สำหรับเครื่องมือและไลบรารีที่ยอดเยี่ยม
- **Thai Coffee Culture** - วัฒนธรรมกาแฟไทยที่เป็นแรงผลักดัน

---

<div align="center">

**☕ Coffee PuLa POS System ☕**

*ระบบจุดขายที่ครบครันสำหรับร้านกาแฟ*

**Made with ❤️ for Coffee Lovers**

[![GitHub stars](https://img.shields.io/github/stars/AUMTERDUM/CafeCoffeePula?style=social)](https://github.com/AUMTERDUM/CafeCoffeePula)
[![GitHub forks](https://img.shields.io/github/forks/AUMTERDUM/CafeCoffeePula?style=social)](https://github.com/AUMTERDUM/CafeCoffeePula)
[![GitHub issues](https://img.shields.io/github/issues/AUMTERDUM/CafeCoffeePula)](https://github.com/AUMTERDUM/CafeCoffeePula/issues)
[![MIT License](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

</div>
