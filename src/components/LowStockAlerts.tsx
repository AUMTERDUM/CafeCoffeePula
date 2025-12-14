'use client';

import { useState, useEffect } from 'react';
import { AlertTriangle, Package, TrendingDown } from 'lucide-react';
import { useToast } from '@/contexts/ToastContext';

interface LowStockItem {
  id: string;
  name: string;
  currentStock: number;
  minStock: number;
  unit: string;
  category: string;
}

export default function LowStockAlerts() {
  const [lowStockItems, setLowStockItems] = useState<LowStockItem[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());
  const { showToast } = useToast();

  useEffect(() => {
    checkLowStock();
    const interval = setInterval(checkLowStock, 60000); // Check every minute
    return () => clearInterval(interval);
  }, []);

  const checkLowStock = async () => {
    try {
      // TODO: Replace with actual API call
      const response = await fetch('http://localhost:8081/api/inventory/ingredients');
      const ingredients = await response.json();

      const lowStock = ingredients.filter(
        (item: any) => item.quantity <= (item.min_quantity || 10)
      );

      // Alert for new low stock items
      lowStock.forEach((item: any) => {
        if (!dismissed.has(item.id)) {
          showToast(
            `⚠️ ${item.name} เหลือน้อย (${item.quantity} ${item.unit})`,
            'warning',
            5000
          );
        }
      });

      setLowStockItems(lowStock);
    } catch (error) {
      console.error('Error checking low stock:', error);
    }
  };

  const handleDismiss = (id: string) => {
    setDismissed((prev) => new Set(prev).add(id));
  };

  const visibleItems = lowStockItems.filter((item) => !dismissed.has(item.id));

  if (visibleItems.length === 0) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-md">
      <div className="bg-yellow-50 border-l-4 border-yellow-500 rounded-lg shadow-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-6 h-6 text-yellow-600 flex-shrink-0" />
          <div className="flex-1">
            <h3 className="font-semibold text-yellow-800 mb-2">
              แจ้งเตือน: วัตถุดิบเหลือน้อย ({visibleItems.length})
            </h3>
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {visibleItems.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between bg-white rounded p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-yellow-600" />
                    <div>
                      <p className="font-medium text-gray-800">{item.name}</p>
                      <p className="text-xs text-gray-600">
                        เหลือ: <span className="font-semibold text-red-600">{item.currentStock}</span> {item.unit}
                        {' / '}ต่ำสุด: {item.minStock} {item.unit}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDismiss(item.id)}
                    className="text-gray-400 hover:text-gray-600 text-xs"
                  >
                    ปิด
                  </button>
                </div>
              ))}
            </div>
            <button
              onClick={() => window.location.href = '/inventory'}
              className="mt-3 w-full bg-yellow-600 text-white px-4 py-2 rounded hover:bg-yellow-700 transition-colors text-sm font-semibold"
            >
              ไปที่หน้าคลังสินค้า
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
