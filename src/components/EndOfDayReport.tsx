'use client';

import { useState } from 'react';
import { FileText, Download, Printer, Calendar } from 'lucide-react';
import LoadingSpinner from './LoadingSpinner';

interface EndOfDayReport {
  date: string;
  openingTime: string;
  closingTime: string;
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  avgOrderValue: number;
  paymentMethods: {
    cash: number;
    card: number;
    qr: number;
  };
  topItems: Array<{ name: string; quantity: number; revenue: number }>;
  hourlyBreakdown: Array<{ hour: string; sales: number; orders: number }>;
  discounts: number;
  taxes: number;
  netSales: number;
}

export default function EndOfDayReport() {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [report, setReport] = useState<EndOfDayReport | null>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      const mockReport: EndOfDayReport = {
        date: selectedDate,
        openingTime: '08:00',
        closingTime: '20:00',
        totalSales: 45280.50,
        totalOrders: 156,
        totalCustomers: 132,
        avgOrderValue: 290.26,
        paymentMethods: {
          cash: 18500,
          card: 21200,
          qr: 5580.50,
        },
        topItems: [
          { name: 'Cappuccino', quantity: 68, revenue: 3400 },
          { name: 'Latte', quantity: 52, revenue: 2600 },
          { name: 'Americano', quantity: 45, revenue: 1800 },
          { name: 'Espresso', quantity: 38, revenue: 1520 },
          { name: 'Mocha', quantity: 32, revenue: 1920 },
        ],
        hourlyBreakdown: Array.from({ length: 12 }, (_, i) => ({
          hour: `${8 + i}:00 - ${9 + i}:00`,
          sales: Math.random() * 5000 + 2000,
          orders: Math.floor(Math.random() * 20 + 8),
        })),
        discounts: 1250,
        taxes: 3170,
        netSales: 42110.50,
      };
      
      setReport(mockReport);
    } catch (error) {
      console.error('Error generating report:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    if (!report) return;
    
    const csvContent = `
End of Day Report
Date: ${report.date}
Opening: ${report.openingTime}, Closing: ${report.closingTime}

Summary
Total Sales: ${report.totalSales}
Total Orders: ${report.totalOrders}
Total Customers: ${report.totalCustomers}
Average Order Value: ${report.avgOrderValue}

Payment Methods
Cash: ${report.paymentMethods.cash}
Card: ${report.paymentMethods.card}
QR Code: ${report.paymentMethods.qr}

Top Selling Items
${report.topItems.map(item => `${item.name},${item.quantity},${item.revenue}`).join('\n')}
    `.trim();

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `end-of-day-${report.date}.csv`;
    link.click();
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <FileText className="w-8 h-8 text-[var(--coffee-brown)]" />
            <div>
              <h1 className="text-2xl font-bold text-[var(--coffee-dark)]">รายงานสิ้นวัน</h1>
              <p className="text-gray-600">สรุปยอดขายประจำวัน</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="px-4 py-2 border border-gray-300 rounded-lg"
            />
            <button
              onClick={generateReport}
              disabled={loading}
              className="px-6 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:bg-[var(--coffee-dark)] transition-colors font-semibold disabled:opacity-50"
            >
              {loading ? 'กำลังสร้าง...' : 'สร้างรายงาน'}
            </button>
          </div>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white rounded-xl shadow-md p-12">
          <LoadingSpinner size="lg" text="กำลังสร้างรายงาน..." />
        </div>
      )}

      {/* Report Content */}
      {report && !loading && (
        <div className="space-y-6 print:space-y-4">
          {/* Actions */}
          <div className="flex gap-3 print:hidden">
            <button
              onClick={handlePrint}
              className="flex items-center gap-2 px-4 py-2 border border-[var(--coffee-brown)] text-[var(--coffee-brown)] rounded-lg hover:bg-[var(--coffee-light)] transition-colors"
            >
              <Printer className="w-4 h-4" />
              พิมพ์
            </button>
            <button
              onClick={handleExport}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              <Download className="w-4 h-4" />
              Export CSV
            </button>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <SummaryCard title="ยอดขายรวม" value={`฿${report.totalSales.toLocaleString()}`} />
            <SummaryCard title="จำนวนออเดอร์" value={report.totalOrders.toString()} />
            <SummaryCard title="จำนวนลูกค้า" value={report.totalCustomers.toString()} />
            <SummaryCard title="ค่าเฉลี่ยต่อบิล" value={`฿${report.avgOrderValue.toFixed(2)}`} />
          </div>

          {/* Payment Methods */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">ช่องทางการชำระเงิน</h3>
            <div className="grid grid-cols-3 gap-4">
              <PaymentCard method="เงินสด" amount={report.paymentMethods.cash} />
              <PaymentCard method="บัตรเครดิต/เดบิต" amount={report.paymentMethods.card} />
              <PaymentCard method="QR Code" amount={report.paymentMethods.qr} />
            </div>
          </div>

          {/* Top Items */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">สินค้าขายดี Top 5</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-2">ลำดับ</th>
                    <th className="text-left py-2">สินค้า</th>
                    <th className="text-right py-2">จำนวน</th>
                    <th className="text-right py-2">ยอดขาย</th>
                  </tr>
                </thead>
                <tbody>
                  {report.topItems.map((item, index) => (
                    <tr key={index} className="border-b">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{item.name}</td>
                      <td className="text-right py-2">{item.quantity}</td>
                      <td className="text-right py-2 font-semibold">฿{item.revenue.toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Financial Summary */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">สรุปการเงิน</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span>ยอดขายรวม:</span>
                <span className="font-semibold">฿{report.totalSales.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-red-600">
                <span>ส่วนลด:</span>
                <span>-฿{report.discounts.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>ภาษี (7%):</span>
                <span>฿{report.taxes.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-xl font-bold text-[var(--coffee-dark)] pt-2 border-t-2">
                <span>ยอดขายสุทธิ:</span>
                <span>฿{report.netSales.toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function SummaryCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <p className="text-sm text-gray-600 mb-1">{title}</p>
      <p className="text-2xl font-bold text-[var(--coffee-dark)]">{value}</p>
    </div>
  );
}

function PaymentCard({ method, amount }: { method: string; amount: number }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <p className="text-sm text-gray-600 mb-1">{method}</p>
      <p className="text-xl font-bold text-[var(--coffee-brown)]">
        ฿{amount.toLocaleString()}
      </p>
    </div>
  );
}
