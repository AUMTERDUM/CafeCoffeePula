'use client';

import { useState, useEffect } from 'react';
import { Package, AlertTriangle, Plus, Minus, Coffee, Search, Filter } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import BackButton from '@/components/BackButton';
import { inventoryAPI } from '@/lib/api';

interface Ingredient {
  id: string;
  name: string;
  unit: string;
  cost_per_unit: number;
  current_stock: number;
  min_stock: number;
  max_stock?: number;
  supplier?: string;
  description?: string;
}

interface StockMovement {
  id: string;
  type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  reason?: string;
  created_at: string;
  ingredient: {
    name: string;
    unit: string;
  };
}

export default function InventoryPage() {
  const [ingredients, setIngredients] = useState<Ingredient[]>([]);
  const [stockMovements, setStockMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStock, setShowLowStock] = useState(false);
  const [selectedIngredient, setSelectedIngredient] = useState<Ingredient | null>(null);
  const [showStockModal, setShowStockModal] = useState(false);
  const [stockAdjustment, setStockAdjustment] = useState({
    type: 'IN' as 'IN' | 'OUT' | 'ADJUST',
    quantity: 0,
    reason: ''
  });

  useEffect(() => {
    fetchIngredients();
    fetchStockMovements();
  }, []);

  const fetchIngredients = async () => {
    try {
      const data = await inventoryAPI.getIngredients();
      setIngredients(data);
    } catch (error) {
      console.error('Error fetching ingredients:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStockMovements = async () => {
    try {
      const data = await inventoryAPI.getStockMovements();
      setStockMovements(data);
    } catch (error) {
      console.error('Error fetching stock movements:', error);
    }
  };

  const handleStockAdjustment = async () => {
    if (!selectedIngredient || stockAdjustment.quantity <= 0) return;

    try {
      await inventoryAPI.adjustStock({
        ingredient_id: selectedIngredient.id,
        type: stockAdjustment.type,
        quantity: stockAdjustment.quantity,
        reason: stockAdjustment.reason
      });
      
      fetchIngredients();
      fetchStockMovements();
      setShowStockModal(false);
      setStockAdjustment({ type: 'IN', quantity: 0, reason: '' });
      setSelectedIngredient(null);
    } catch (error) {
      console.error('Error adjusting stock:', error);
      alert('เกิดข้อผิดพลาดในการปรับสต๊อก: ' + (error as Error).message);
    }
  };

  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(searchTerm.toLowerCase());
    const isLowStock = ingredient.current_stock <= ingredient.min_stock;
    
    if (showLowStock) {
      return matchesSearch && isLowStock;
    }
    return matchesSearch;
  });

  const lowStockCount = ingredients.filter(ingredient => 
    ingredient.current_stock <= ingredient.min_stock
  ).length;

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <Package className="w-12 h-12 text-[var(--coffee-brown)] mx-auto mb-4 animate-pulse" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลดข้อมูลสต๊อก...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coffee-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BackButton className="mr-4" />
              <div className="flex items-center">
                <Package className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">จัดการสต๊อกวัตถุดิบ</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>
        {/* Alert for low stock */}
        {lowStockCount > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-modern p-4 mb-6">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <span className="text-red-700 font-medium">
                มีวัตถุดิบ {lowStockCount} รายการที่ใกล้หมด
              </span>
            </div>
          </div>
        )}

        {/* Controls */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--coffee-medium)]" />
            <input
              type="text"
              placeholder="ค้นหาวัตถุดิบ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="cute-input pl-10 w-full"
            />
          </div>
          <button
            onClick={() => setShowLowStock(!showLowStock)}
            className={`btn-secondary flex items-center ${showLowStock ? 'bg-[var(--coffee-brown)] text-white' : ''}`}
          >
            <Filter className="w-5 h-5 mr-2" />
            {showLowStock ? 'แสดงทั้งหมด' : 'แสดงใกล้หมด'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Inventory List */}
          <div className="lg:col-span-2">
            <div className="card p-6">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">รายการวัตถุดิบ</h2>
              
              <div className="space-y-4">
                {filteredIngredients.map((ingredient) => {
                  const isLowStock = ingredient.current_stock <= ingredient.min_stock;
                  const stockPercentage = ingredient.max_stock 
                    ? (ingredient.current_stock / ingredient.max_stock) * 100
                    : 0;

                  return (
                    <div key={ingredient.id} className="border border-[var(--coffee-light)] rounded-modern p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <h3 className="font-semibold text-[var(--coffee-dark)]">{ingredient.name}</h3>
                          <p className="text-sm text-[var(--coffee-medium)]">
                            ผู้จำหน่าย: {ingredient.supplier || 'ไม่ระบุ'}
                          </p>
                        </div>
                        <div className="text-right">
                          <div className={`text-xl font-bold ${isLowStock ? 'text-red-500' : 'text-[var(--coffee-brown)]'}`}>
                            {ingredient.current_stock?.toLocaleString() || 0} {ingredient.unit}
                          </div>
                          <div className="text-sm text-[var(--coffee-medium)]">
                            ต้นทุน: ฿{ingredient.cost_per_unit}/{ingredient.unit}
                          </div>
                        </div>
                      </div>

                      {/* Stock Level Bar */}
                      {ingredient.max_stock && (
                        <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                          <div 
                            className={`h-2 rounded-full ${
                              stockPercentage > 50 ? 'bg-green-500' : 
                              stockPercentage > 20 ? 'bg-yellow-500' : 'bg-red-500'
                            }`}
                            style={{ width: `${Math.min(stockPercentage, 100)}%` }}
                          ></div>
                        </div>
                      )}

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-[var(--coffee-medium)]">
                          ขั้นต่ำ: {ingredient.min_stock} {ingredient.unit}
                          {ingredient.max_stock && ` | สูงสุด: ${ingredient.max_stock} ${ingredient.unit}`}
                        </span>
                        <button
                          onClick={() => {
                            setSelectedIngredient(ingredient);
                            setShowStockModal(true);
                          }}
                          className="btn-primary text-sm px-3 py-1"
                        >
                          ปรับสต๊อก
                        </button>
                      </div>

                      {isLowStock && (
                        <div className="mt-2 text-sm text-red-600 flex items-center">
                          <AlertTriangle className="w-4 h-4 mr-1" />
                          สต๊อกใกล้หมด!
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Recent Stock Movements */}
          <div>
            <div className="card p-6">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">เคลื่อนไหวสต๊อกล่าสุด</h2>
              
              <div className="space-y-3">
                {stockMovements.slice(0, 10).map((movement) => (
                  <div key={movement.id} className="border-b border-[var(--coffee-light)] pb-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--coffee-dark)] text-sm">
                          {movement.ingredient.name}
                        </p>
                        <p className="text-xs text-[var(--coffee-medium)]">
                          {movement.reason || 'ไม่ระบุเหตุผล'}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className={`font-semibold text-sm ${
                          movement.type === 'IN' ? 'text-green-600' : 
                          movement.type === 'OUT' ? 'text-red-600' : 'text-blue-600'
                        }`}>
                          {movement.type === 'IN' ? '+' : movement.type === 'OUT' ? '-' : '±'}
                          {movement.quantity} {movement.ingredient.unit}
                        </div>
                        <div className="text-xs text-[var(--coffee-medium)]">
                          {new Date(movement.created_at).toLocaleDateString('th-TH')}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stock Adjustment Modal */}
      {showStockModal && selectedIngredient && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-modern-lg p-6 max-w-md w-full mx-4">
            <h3 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">
              ปรับสต๊อก: {selectedIngredient.name}
            </h3>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  ประเภท
                </label>
                <select
                  value={stockAdjustment.type}
                  onChange={(e) => setStockAdjustment({
                    ...stockAdjustment,
                    type: e.target.value as 'IN' | 'OUT' | 'ADJUST'
                  })}
                  className="cute-input w-full"
                >
                  <option value="IN">เพิ่มสต๊อก (เข้า)</option>
                  <option value="OUT">หักสต๊อก (ออก)</option>
                  <option value="ADJUST">ปรับปรุงสต๊อก</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  จำนวน ({selectedIngredient.unit})
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={stockAdjustment.quantity}
                  onChange={(e) => setStockAdjustment({
                    ...stockAdjustment,
                    quantity: parseFloat(e.target.value) || 0
                  })}
                  className="cute-input w-full"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--coffee-dark)] mb-2">
                  เหตุผล
                </label>
                <input
                  type="text"
                  value={stockAdjustment.reason}
                  onChange={(e) => setStockAdjustment({
                    ...stockAdjustment,
                    reason: e.target.value
                  })}
                  placeholder="เช่น เติมสต๊อก, เสียหาย, นับสต๊อก"
                  className="cute-input w-full"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => {
                  setShowStockModal(false);
                  setSelectedIngredient(null);
                  setStockAdjustment({ type: 'IN', quantity: 0, reason: '' });
                }}
                className="btn-secondary flex-1"
              >
                ยกเลิก
              </button>
              <button
                onClick={handleStockAdjustment}
                className="btn-primary flex-1"
                disabled={stockAdjustment.quantity <= 0}
              >
                บันทึก
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
