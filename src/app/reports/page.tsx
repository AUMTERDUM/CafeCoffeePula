'use client';

import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Calendar, DollarSign, ShoppingCart, ArrowLeft, Coffee } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';

interface OrderItem {
  id: string;
  quantity: number;
  price: number;
  product: {
    name: string;
    category: {
      name: string;
    };
  };
}

interface Order {
  id: string;
  totalAmount: number;
  status: string;
  createdAt: string;
  items: OrderItem[];
  customerName?: string;
}

interface DailySales {
  date: string;
  total: number;
  orderCount: number;
}

interface CategorySales {
  categoryName: string;
  total: number;
  count: number;
}

interface TopMenuItem {
  menuName: string;
  quantity: number;
  total: number;
}

export default function ReportsPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPeriod, setSelectedPeriod] = useState('today');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const data = await response.json();
      
      // ตรวจสอบว่าข้อมูลที่ได้รับเป็น array หรือไม่
      if (Array.isArray(data)) {
        setOrders(data);
      } else {
        console.error('Invalid data format received:', data);
        setOrders([]);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  const filterOrdersByPeriod = (orders: Order[]) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);
    const thisWeek = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return orders.filter(order => {
      const orderDate = new Date(order.createdAt);
      switch (selectedPeriod) {
        case 'today':
          return orderDate >= today;
        case 'yesterday':
          return orderDate >= yesterday && orderDate < today;
        case 'week':
          return orderDate >= thisWeek;
        case 'month':
          return orderDate >= thisMonth;
        default:
          return true;
      }
    });
  };

  const filteredOrders = Array.isArray(orders) ? filterOrdersByPeriod(orders) : [];

  // Calculate statistics
  const totalSales = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
  const totalOrders = filteredOrders.length;
  const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

  // Daily sales data
  const dailySales: DailySales[] = [];
  const salesByDate = new Map<string, { total: number; count: number }>();

  filteredOrders.forEach(order => {
    const date = new Date(order.createdAt).toLocaleDateString('th-TH');
    const existing = salesByDate.get(date) || { total: 0, count: 0 };
    salesByDate.set(date, {
      total: existing.total + order.totalAmount,
      count: existing.count + 1
    });
  });

  salesByDate.forEach((data, date) => {
    dailySales.push({
      date,
      total: data.total,
      orderCount: data.count
    });
  });

  // Category sales
  const categorySales: CategorySales[] = [];
  const salesByCategory = new Map<string, { total: number; count: number }>();

  filteredOrders.forEach(order => {
    // ตรวจสอบว่า items มีอยู่และเป็น array
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: OrderItem) => {
        const categoryName = item.product.category.name;
        const existing = salesByCategory.get(categoryName) || { total: 0, count: 0 };
        salesByCategory.set(categoryName, {
          total: existing.total + (item.price * item.quantity),
          count: existing.count + item.quantity
        });
      });
    }
  });

  salesByCategory.forEach((data, categoryName) => {
    categorySales.push({
      categoryName,
      total: data.total,
      count: data.count
    });
  });

  // Top menu items
  const topMenuItems: TopMenuItem[] = [];
  const menuSales = new Map<string, { quantity: number; total: number }>();

  filteredOrders.forEach(order => {
    // ตรวจสอบว่า items มีอยู่และเป็น array
    if (order.items && Array.isArray(order.items)) {
      order.items.forEach((item: OrderItem) => {
        const menuName = item.product.name;
        const existing = menuSales.get(menuName) || { quantity: 0, total: 0 };
        menuSales.set(menuName, {
          quantity: existing.quantity + item.quantity,
          total: existing.total + (item.price * item.quantity)
        });
      });
    }
  });

  menuSales.forEach((data, menuName) => {
    topMenuItems.push({
      menuName,
      quantity: data.quantity,
      total: data.total
    });
  });

  topMenuItems.sort((a, b) => b.quantity - a.quantity);

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <Coffee className="w-12 h-12 text-[var(--coffee-brown)] animate-spin mx-auto mb-4" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coffee-theme">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-[var(--coffee-light)]">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Link href="/" className="mr-4">
                <ArrowLeft className="w-6 h-6 text-[var(--coffee-brown)]" />
              </Link>
              <BarChart3 className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
              <h1 className="text-2xl font-bold text-[var(--coffee-dark)]">รายงานยอดขาย</h1>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Period Filter */}
        <div className="card p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-[var(--coffee-dark)]">เลือกช่วงเวลา</h2>
            <Calendar className="w-5 h-5 text-[var(--coffee-brown)]" />
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { value: 'today', label: 'วันนี้' },
              { value: 'yesterday', label: 'เมื่อวาน' },
              { value: 'week', label: '7 วันที่ผ่านมา' },
              { value: 'month', label: 'เดือนนี้' },
            ].map(period => (
              <button
                key={period.value}
                onClick={() => setSelectedPeriod(period.value)}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  selectedPeriod === period.value
                    ? 'bg-[var(--coffee-brown)] text-white'
                    : 'bg-white text-[var(--coffee-medium)] hover:bg-[var(--coffee-light)]'
                }`}
              >
                {period.label}
              </button>
            ))}
          </div>
        </div>

        {/* Overview Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--coffee-medium)] text-sm">ยอดขายรวม</p>
                <p className="text-2xl font-bold text-[var(--coffee-brown)]">
                  ฿{totalSales.toLocaleString()}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-[var(--coffee-brown)]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--coffee-medium)] text-sm">จำนวนออเดอร์</p>
                <p className="text-2xl font-bold text-[var(--coffee-brown)]">{totalOrders}</p>
              </div>
              <ShoppingCart className="w-8 h-8 text-[var(--coffee-brown)]" />
            </div>
          </div>

          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[var(--coffee-medium)] text-sm">ค่าเฉลี่ยต่อออเดอร์</p>
                <p className="text-2xl font-bold text-[var(--coffee-brown)]">
                  ฿{averageOrderValue.toFixed(2)}
                </p>
              </div>
              <TrendingUp className="w-8 h-8 text-[var(--coffee-brown)]" />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Daily Sales */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">ยอดขายรายวัน</h3>
            {dailySales.length === 0 ? (
              <p className="text-[var(--coffee-medium)] text-center py-8">ไม่มีข้อมูลยอดขาย</p>
            ) : (
              <div className="space-y-4">
                {dailySales.slice(0, 7).map((day, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-[var(--coffee-medium)]">{day.date}</span>
                    <div className="text-right">
                      <div className="font-semibold text-[var(--coffee-dark)]">
                        ฿{day.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-[var(--coffee-medium)]">
                        {day.orderCount} ออเดอร์
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Category Sales */}
          <div className="card p-6">
            <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">ยอดขายตามประเภท</h3>
            {categorySales.length === 0 ? (
              <p className="text-[var(--coffee-medium)] text-center py-8">ไม่มีข้อมูลยอดขาย</p>
            ) : (
              <div className="space-y-4">
                {categorySales.map((category, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="text-[var(--coffee-medium)]">{category.categoryName}</span>
                    <div className="text-right">
                      <div className="font-semibold text-[var(--coffee-dark)]">
                        ฿{category.total.toLocaleString()}
                      </div>
                      <div className="text-sm text-[var(--coffee-medium)]">
                        {category.count} ชิ้น
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Top Menu Items */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">เมนูขายดี</h3>
              {topMenuItems.length === 0 ? (
                <p className="text-[var(--coffee-medium)] text-center py-8">ไม่มีข้อมูลการขาย</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-[var(--coffee-light)]">
                      <tr>
                        <th className="px-4 py-3 text-left text-[var(--coffee-dark)] font-semibold">อันดับ</th>
                        <th className="px-4 py-3 text-left text-[var(--coffee-dark)] font-semibold">เมนู</th>
                        <th className="px-4 py-3 text-center text-[var(--coffee-dark)] font-semibold">จำนวนขาย</th>
                        <th className="px-4 py-3 text-right text-[var(--coffee-dark)] font-semibold">ยอดขาย</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topMenuItems.slice(0, 10).map((item, index) => (
                        <tr key={index} className="border-b border-[var(--coffee-light)]">
                          <td className="px-4 py-3 text-[var(--coffee-brown)] font-bold">#{index + 1}</td>
                          <td className="px-4 py-3 text-[var(--coffee-dark)]">{item.menuName}</td>
                          <td className="px-4 py-3 text-center text-[var(--coffee-medium)]">{item.quantity}</td>
                          <td className="px-4 py-3 text-right text-[var(--coffee-brown)] font-semibold">
                            ฿{item.total.toLocaleString()}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
