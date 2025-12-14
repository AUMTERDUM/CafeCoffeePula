'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, DollarSign, ShoppingCart, Users, Calendar, Download } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface DashboardStats {
  todaySales: number;
  todayOrders: number;
  todayCustomers: number;
  avgOrderValue: number;
  topSellingItems: { name: string; quantity: number; revenue: number }[];
  hourlyData: { hour: string; sales: number; orders: number }[];
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    fetchDashboardStats();
  }, [selectedDate]);

  const fetchDashboardStats = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      // Simulated data
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      setStats({
        todaySales: 15420.50,
        todayOrders: 87,
        todayCustomers: 65,
        avgOrderValue: 177.25,
        topSellingItems: [
          { name: 'Cappuccino', quantity: 45, revenue: 2250 },
          { name: 'Latte', quantity: 38, revenue: 1900 },
          { name: 'Americano', quantity: 32, revenue: 1280 },
          { name: 'Espresso', quantity: 28, revenue: 1120 },
          { name: 'Mocha', quantity: 24, revenue: 1440 },
        ],
        hourlyData: Array.from({ length: 12 }, (_, i) => ({
          hour: `${8 + i}:00`,
          sales: Math.random() * 2000 + 500,
          orders: Math.floor(Math.random() * 15 + 5),
        })),
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner size="lg" text="กำลังโหลดข้อมูล..." />;
  }

  if (!stats) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">Dashboard</h1>
        <div className="flex items-center gap-3">
          <input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg"
          />
          <button className="flex items-center gap-2 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:bg-[var(--coffee-dark)] transition-colors">
            <Download className="w-4 h-4" />
            Export
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="ยอดขายวันนี้"
          value={`฿${stats.todaySales.toLocaleString('th-TH', { minimumFractionDigits: 2 })}`}
          icon={DollarSign}
          color="blue"
          trend="+12.5%"
        />
        <StatCard
          title="จำนวนออเดอร์"
          value={stats.todayOrders.toString()}
          icon={ShoppingCart}
          color="green"
          trend="+8.2%"
        />
        <StatCard
          title="ลูกค้าวันนี้"
          value={stats.todayCustomers.toString()}
          icon={Users}
          color="purple"
          trend="+5.4%"
        />
        <StatCard
          title="ค่าเฉลี่ยต่อบิล"
          value={`฿${stats.avgOrderValue.toFixed(2)}`}
          icon={TrendingUp}
          color="orange"
          trend="+3.1%"
        />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Selling Items */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">
            สินค้าขายดี Top 5
          </h3>
          <div className="space-y-3">
            {stats.topSellingItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-8 h-8 rounded-full bg-[var(--coffee-light)] flex items-center justify-center text-[var(--coffee-dark)] font-semibold">
                    {index + 1}
                  </div>
                  <span className="font-medium">{item.name}</span>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--coffee-brown)]">
                    ฿{item.revenue.toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-500">{item.quantity} ชิ้น</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Hourly Sales */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">
            ยอดขายรายชั่วโมง
          </h3>
          <div className="space-y-2">
            {stats.hourlyData.slice(0, 8).map((data, index) => (
              <div key={index} className="flex items-center gap-3">
                <span className="text-sm text-gray-600 w-16">{data.hour}</span>
                <div className="flex-1 bg-gray-100 rounded-full h-6 overflow-hidden">
                  <div
                    className="bg-[var(--coffee-brown)] h-full rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${(data.sales / 2500) * 100}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      ฿{data.sales.toFixed(0)}
                    </span>
                  </div>
                </div>
                <span className="text-sm text-gray-600 w-12">{data.orders} bills</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface StatCardProps {
  title: string;
  value: string;
  icon: React.ElementType;
  color: 'blue' | 'green' | 'purple' | 'orange';
  trend: string;
}

function StatCard({ title, value, icon: Icon, color, trend }: StatCardProps) {
  const colorMap = {
    blue: 'bg-blue-100 text-blue-600',
    green: 'bg-green-100 text-green-600',
    purple: 'bg-purple-100 text-purple-600',
    orange: 'bg-orange-100 text-orange-600',
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className={`p-3 rounded-lg ${colorMap[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
        <span className="text-sm font-semibold text-green-600">{trend}</span>
      </div>
      <h3 className="text-gray-600 text-sm mb-1">{title}</h3>
      <p className="text-2xl font-bold text-[var(--coffee-dark)]">{value}</p>
    </div>
  );
}
