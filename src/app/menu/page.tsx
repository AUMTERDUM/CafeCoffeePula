'use client';

import { useState, useEffect } from 'react';
import { Coffee, Plus, Edit, Trash2, Search } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import BackButton from '@/components/BackButton';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: {
    id: string;
    name: string;
  };
}

interface Category {
  id: string;
  name: string;
}

export default function MenuPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    categoryId: '',
    image: ''
  });

  useEffect(() => {
    fetchMenuItems();
    fetchCategories();
  }, []);

  const fetchMenuItems = async () => {
    try {
      const response = await fetch('/api/menu');
      const data = await response.json();
      
      if (Array.isArray(data)) {
        setMenuItems(data);
      } else {
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error fetching categories:', error);
    }
  };

  const filteredItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'ทั้งหมด' || item.category.name === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.categoryId) {
      alert('กรุณากรอกข้อมูลให้ครบถ้วน');
      return;
    }

    try {
      const url = editingItem ? `/api/menu/${editingItem.id}` : '/api/menu';
      const method = editingItem ? 'PUT' : 'POST';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          price: parseFloat(formData.price),
          categoryId: formData.categoryId,
          image: formData.image || null,
        }),
      });

      if (response.ok) {
        await fetchMenuItems();
        resetForm();
        alert(editingItem ? 'แก้ไขเมนูสำเร็จ!' : 'เพิ่มเมนูสำเร็จ!');
      } else {
        alert('เกิดข้อผิดพลาด');
      }
    } catch (error) {
      console.error('Error saving menu item:', error);
      alert('เกิดข้อผิดพลาด');
    }
  };

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setFormData({
      name: item.name,
      price: item.price.toString(),
      categoryId: item.category.id.toString(),
      image: item.image || '',
    });
    setShowAddForm(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('คุณต้องการลบเมนูนี้หรือไม่?')) return;

    try {
      const response = await fetch(`/api/menu/${id}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchMenuItems();
        alert('ลบเมนูสำเร็จ!');
      } else {
        alert('เกิดข้อผิดพลาดในการลบเมนู');
      }
    } catch (error) {
      console.error('Error deleting menu item:', error);
      alert('เกิดข้อผิดพลาดในการลบเมนู');
    }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', categoryId: '', image: '' });
    setEditingItem(null);
    setShowAddForm(false);
  };

  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setFormData(prev => ({
          ...prev,
          image: e.target?.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const categoryNames = ['ทั้งหมด', ...categories.map(cat => cat.name)];

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
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BackButton className="mr-4" />
              <div className="flex items-center">
                <Coffee className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">จัดการเมนู</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <button
                onClick={() => setShowAddForm(true)}
                className="btn-primary flex items-center"
              >
                <Plus className="w-5 h-5 mr-2" />
                เพิ่มเมนูใหม่
              </button>
            </div>
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>
        {/* Search and Filter */}
        <div className="card p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 w-5 h-5 text-[var(--coffee-medium)]" />
              <input
                type="text"
                placeholder="ค้นหาเมนู..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
              />
            </div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
            >
              {categoryNames.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Add/Edit Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">
                {editingItem ? 'แก้ไขเมนู' : 'เพิ่มเมนูใหม่'}
              </h2>
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-[var(--coffee-medium)] mb-2">ชื่อเมนู</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[var(--coffee-medium)] mb-2">ราคา (บาท)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-[var(--coffee-medium)] mb-2">ประเภท</label>
                  <select
                    value={formData.categoryId}
                    onChange={(e) => setFormData({ ...formData, categoryId: e.target.value })}
                    className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    required
                  >
                    <option value="">เลือกประเภท</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                {/* รูปภาพเมนู */}
                <div className="mb-6">
                  <label className="block text-[var(--coffee-medium)] mb-2">รูปภาพเมนู</label>
                  
                  {formData.image ? (
                    <div className="text-center mb-4">
                      <div className="inline-block p-2 border-2 border-[var(--coffee-light)] rounded-lg">
                        <img 
                          src={formData.image} 
                          alt="ตัวอย่างรูปภาพ"
                          className="w-32 h-32 object-cover rounded-lg"
                        />
                      </div>
                      <div className="mt-2">
                        <button
                          type="button"
                          onClick={() => setFormData(prev => ({ ...prev, image: '' }))}
                          className="text-sm text-red-500 underline"
                        >
                          ลบรูปภาพ
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="border-2 border-dashed border-[var(--coffee-light)] rounded-lg p-6 text-center">
                      <Coffee className="w-12 h-12 text-[var(--coffee-medium)] mx-auto mb-2" />
                      <p className="text-sm text-[var(--coffee-medium)] mb-3">เลือกรูปภาพเมนู (ไม่บังคับ)</p>
                    </div>
                  )}
                  
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="hidden"
                    id="image-upload"
                  />
                  <label
                    htmlFor="image-upload"
                    className="w-full btn-secondary py-2 text-center cursor-pointer mt-2 inline-block"
                  >
                    {formData.image ? 'เปลี่ยนรูปภาพ' : 'เลือกรูปภาพ'}
                  </label>
                </div>
                <div className="flex space-x-4">
                  <button
                    type="submit"
                    className="flex-1 btn-primary"
                  >
                    {editingItem ? 'บันทึก' : 'เพิ่ม'}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                  >
                    ยกเลิก
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Menu Items Table */}
        <div className="card">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-[var(--coffee-light)]">
                <tr>
                  <th className="px-6 py-3 text-left text-[var(--coffee-dark)] font-semibold">รูปภาพ</th>
                  <th className="px-6 py-3 text-left text-[var(--coffee-dark)] font-semibold">ชื่อเมนู</th>
                  <th className="px-6 py-3 text-left text-[var(--coffee-dark)] font-semibold">ประเภท</th>
                  <th className="px-6 py-3 text-left text-[var(--coffee-dark)] font-semibold">ราคา</th>
                  <th className="px-6 py-3 text-center text-[var(--coffee-dark)] font-semibold">จัดการ</th>
                </tr>
              </thead>
              <tbody>
                {filteredItems.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-8 text-center text-[var(--coffee-medium)]">
                      ไม่พบเมนูที่ค้นหา
                    </td>
                  </tr>
                ) : (
                  filteredItems.map((item) => (
                    <tr key={item.id} className="border-b border-[var(--coffee-light)] hover:bg-[var(--coffee-cream)]">
                      <td className="px-6 py-4">
                        <div className="w-16 h-16 rounded-lg overflow-hidden bg-[var(--coffee-cream)]">
                          {item.image ? (
                            <img 
                              src={item.image} 
                              alt={item.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <Coffee className="w-8 h-8 text-[var(--coffee-medium)]" />
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 text-[var(--coffee-dark)] font-medium">{item.name}</td>
                      <td className="px-6 py-4 text-[var(--coffee-medium)]">{item.category.name}</td>
                      <td className="px-6 py-4 text-[var(--coffee-brown)] font-semibold">฿{item.price}</td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center space-x-2">
                          <button
                            onClick={() => handleEdit(item)}
                            className="p-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:bg-[var(--coffee-dark)] transition-colors"
                          >
                            <Edit className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(item.id)}
                            className="p-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="card p-6 text-center">
            <h3 className="text-2xl font-bold text-[var(--coffee-brown)]">{menuItems.length}</h3>
            <p className="text-[var(--coffee-medium)]">เมนูทั้งหมด</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-2xl font-bold text-[var(--coffee-brown)]">{categories.length}</h3>
            <p className="text-[var(--coffee-medium)]">ประเภทเมนู</p>
          </div>
          <div className="card p-6 text-center">
            <h3 className="text-2xl font-bold text-[var(--coffee-brown)]">
              ฿{Math.round(menuItems.reduce((sum, item) => sum + item.price, 0) / menuItems.length || 0)}
            </h3>
            <p className="text-[var(--coffee-medium)]">ราคาเฉลี่ย</p>
          </div>
        </div>
      </div>
    </div>
  );
}
