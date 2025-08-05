import Link from 'next/link';
import { Coffee, ShoppingCart, Settings, BarChart3, Package, Tag, Receipt, Users, Calculator } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';

export default function HomePage() {
  return (
    <div className="min-h-screen coffee-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12 fade-in">
          {/* Dark Mode Toggle */}
          <div className="flex justify-end mb-6">
            <DarkModeToggle />
          </div>
          
          <div className="flex items-center justify-center mb-6">
            <Coffee className="w-16 h-16 text-[var(--coffee-brown)] mr-4" />
            <h1 className="text-5xl font-bold text-[var(--coffee-dark)]">
              Coffee PuLa
            </h1>
          </div>
          <p className="text-xl text-[var(--coffee-medium)] mb-6">
            ระบบ Point of Sale สำหรับร้านกาแฟ
          </p>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] mx-auto rounded-full"></div>
        </div>

        {/* Main Menu */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
          {/* POS System */}
          <Link href="/pos" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <ShoppingCart className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                ระบบขาย (POS)
              </h2>
              <p className="text-[var(--coffee-medium)]">
                หน้าขายสินค้า คิดเงิน และพิมพ์ใบเสร็จ
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
                เพิ่ม แก้ไข ลบเมนูกาแฟและเครื่องดื่ม
              </p>
            </div>
          </Link>

          {/* Inventory Management */}
          <Link href="/inventory" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Package className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                คลังสินค้า
              </h2>
              <p className="text-[var(--coffee-medium)]">
                จัดการสต็อกและวัตถุดิบ
              </p>
            </div>
          </Link>

          {/* Promotions */}
          <Link href="/promotions" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Tag className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                โปรโมชัน
              </h2>
              <p className="text-[var(--coffee-medium)]">
                จัดการคูปองและส่วนลด
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
                ยอดขาย สถิติ และการวิเคราะห์
              </p>
            </div>
          </Link>

          {/* Receipt System */}
          <Link href="/receipts" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Receipt className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                ระบบใบเสร็จ
              </h2>
              <p className="text-[var(--coffee-medium)]">
                จัดการใบเสร็จและการพิมพ์
              </p>
            </div>
          </Link>

          {/* Loyalty Program */}
          <Link href="/loyalty" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Users className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                ระบบสมาชิก
              </h2>
              <p className="text-[var(--coffee-medium)]">
                สะสมแต้ม รับสิทธิพิเศษ และรางวัล
              </p>
            </div>
          </Link>

          {/* Cost Management */}
          <Link href="/cost" className="card p-8 hover:shadow-lg transition-all duration-200 block">
            <div className="text-center">
              <Calculator className="w-16 h-16 text-[var(--coffee-brown)] mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-[var(--coffee-dark)] mb-2">
                บัญชีต้นทุนและกำไร
              </h2>
              <p className="text-[var(--coffee-medium)]">
                ต้นทุนสินค้า กำไรขั้นต้น และการวิเคราะห์
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
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-[var(--coffee-brown)] mb-2">฿12,450</div>
            <div className="text-[var(--coffee-medium)]">ยอดขายวันนี้</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-[var(--coffee-brown)] mb-2">157</div>
            <div className="text-[var(--coffee-medium)]">ออเดอร์ทั้งหมด</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-3xl font-bold text-[var(--coffee-brown)] mb-2">24</div>
            <div className="text-[var(--coffee-medium)]">เมนูทั้งหมด</div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-16 text-[var(--coffee-medium)]">
          <p>© 2025 Coffee PuLa POS System. ระบบจุดขายที่ครบครัน</p>
        </div>
      </div>
    </div>
  );
}
