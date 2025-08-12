-- สร้างฐานข้อมูลและผู้ใช้สำหรับ Coffee PuLa
CREATE DATABASE IF NOT EXISTS coffee_pula_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- สร้างผู้ใช้และให้สิทธิ์
CREATE USER IF NOT EXISTS 'coffee_user'@'%' IDENTIFIED BY 'coffee_password';
GRANT ALL PRIVILEGES ON coffee_pula_db.* TO 'coffee_user'@'%';
FLUSH PRIVILEGES;

-- ใช้ฐานข้อมูล
USE coffee_pula_db;

-- สร้างตารางเริ่มต้น (GORM จะสร้างตารางที่เหลือ)
-- ไฟล์นี้จะถูกรันเมื่อ container เริ่มครั้งแรก
