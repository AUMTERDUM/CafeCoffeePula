import Link from 'next/link';
import { Coffee, ShoppingCart, Settings, BarChart3, Package } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen coffee-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          {/* Dark Mode Toggle */}
          <div className="flex justify-end mb-6">
            <DarkModeToggle />
          </div>
          
          <div className="flex items-center justify-center mb-4">
            <Coffee className="w-12 h-12 text-[var(--coffee-brown)] mr-4" />
            <h1 className="text-4xl font-bold text-[var(--coffee-dark)]">
              Coffee PuLa POS
            </h1>
          </div>
          <p className="text-lg text-[var(--coffee-medium)]">
            ระบบจุดขาย (POS) สำหรับร้านกาแฟ
          </p>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* POS System */}
          <Link href="/pos" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                ระบบขาย
              </h2>
              <p className="text-[var(--coffee-medium)]">
                รับออเดอร์และประมวลผลการขาย
              </p>
            </div>
          </Link>

          {/* Menu Management */}
          <Link href="/menu" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Coffee className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                จัดการเมนู
              </h2>
              <p className="text-[var(--coffee-medium)]">
                เพิ่ม แก้ไข ลบเมนูกาแฟ
              </p>
            </div>
          </Link>

          {/* Inventory Management */}
          <Link href="/inventory" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Package className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                จัดการสต๊อก
              </h2>
              <p className="text-[var(--coffee-medium)]">
                ติดตามวัตถุดิบและสูตร
              </p>
            </div>
          </Link>

          {/* Reports */}
          <Link href="/reports" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <BarChart3 className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                รายงาน
              </h2>
              <p className="text-[var(--coffee-medium)]">
                ดูรายงานยอดขายและสถิติ
              </p>
            </div>
          </Link>

          {/* Settings */}
          <Link href="/settings" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Settings className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                ตั้งค่า
              </h2>
              <p className="text-[var(--coffee-medium)]">
                ตั้งค่าระบบและการพิมพ์
              </p>
            </div>
          </Link>
        </div>

        {/* Stats Preview */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-6 text-center">
            <h3 className="text-3xl font-bold text-[var(--coffee-brown)]">฿0</h3>
            <p className="text-[var(--coffee-medium)]">ยอดขายวันนี้</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-3xl font-bold text-[var(--coffee-brown)]">0</h3>
            <p className="text-[var(--coffee-medium)]">ออเดอร์วันนี้</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-3xl font-bold text-[var(--coffee-brown)]">12</h3>
            <p className="text-[var(--coffee-medium)]">เมนูทั้งหมด</p>
          </div>
        </div>
      </div>
    </div>
  );
}
