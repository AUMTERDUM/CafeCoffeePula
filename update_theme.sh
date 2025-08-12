#!/bin/bash

# สคริปต์สำหรับอัปเดตธีมของทุกหน้าให้เป็นแบบเดียวกับหน้าหลัก

pages=(
  "src/app/cost/page.tsx"
  "src/app/recipes/page.tsx"
  "src/app/receipts/page.tsx"
  "src/app/reports/page.tsx"
  "src/app/settings/page.tsx"
)

for page in "${pages[@]}"; do
  echo "กำลังอัปเดต $page..."
  
  # เพิ่ม BackButton import ถ้ายังไม่มี
  if ! grep -q "import BackButton from" "$page"; then
    sed -i '/^import.*from.*@\/components/a import BackButton from '\''@/components/BackButton'\'';' "$page"
  fi
  
  # ลบ ArrowLeft และ Link imports ที่ไม่จำเป็น
  sed -i 's/, ArrowLeft//' "$page"
  sed -i '/^import Link from/d' "$page"
  
  echo "เสร็จสิ้น $page"
done

echo "เสร็จสิ้นการอัปเดตทั้งหมด!"
