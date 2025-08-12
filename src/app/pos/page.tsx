'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash2, Coffee } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import LoyaltyPanel from '@/components/LoyaltyPanel';
import BackButton from '@/components/BackButton';
import { menuAPI, orderAPI, receiptAPI, loyaltyAPI } from '@/lib/api';
import { Member } from '@/lib/types';

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  category: {
    name: string;
  };
}

interface CartItem extends MenuItem {
  quantity: number;
}

export default function POSPage() {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('ทั้งหมด');
  const [loading, setLoading] = useState(true);
  const [showPayment, setShowPayment] = useState(false);
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);

  const categories = ['ทั้งหมด', 'กาแฟร้อน', 'กาแฟเย็น', 'เครื่องดื่มไม่มีกาแฟีน', 'ของหวาน'];

  useEffect(() => {
    fetchMenuItems();
    // โหลด QR Code ที่บันทึกไว้
    const savedQr = localStorage.getItem('qrCodeImage');
    if (savedQr) {
      setQrCodeImage(savedQr);
    }
  }, []);

  const fetchMenuItems = async () => {
    try {
      const data = await menuAPI.getMenu();
      
      // ตรวจสอบว่าข้อมูลที่ได้รับเป็น array หรือไม่
      if (Array.isArray(data)) {
        setMenuItems(data);
      } else {
        console.error('Invalid data format received:', data);
        setMenuItems([]);
      }
    } catch (error) {
      console.error('Error fetching menu items:', error);
      setMenuItems([]);
    } finally {
      setLoading(false);
    }
  };

  // ตรวจสอบให้แน่ใจว่า filteredItems เป็น array เสมอ
  const filteredItems = Array.isArray(menuItems) && selectedCategory === 'ทั้งหมด' 
    ? menuItems 
    : Array.isArray(menuItems) 
      ? menuItems.filter(item => item.category?.name === selectedCategory)
      : [];

  const addToCart = (item: MenuItem) => {
    setCartItems(prev => {
      const existing = prev.find(cartItem => cartItem.id === item.id);
      if (existing) {
        return prev.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      }
      return [...prev, { ...item, quantity: 1 }];
    });
  };

  const updateQuantity = (id: string, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(id);
      return;
    }
    setCartItems(prev =>
      prev.map(item =>
        item.id === id ? { ...item, quantity: newQuantity } : item
      )
    );
  };

  const removeFromCart = (id: string) => {
    setCartItems(prev => prev.filter(item => item.id !== id));
  };

  const getTotalPrice = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setQrCodeImage(e.target?.result as string);
        // บันทึกลง localStorage เพื่อใช้ในครั้งต่อไป
        localStorage.setItem('qrCodeImage', e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const loadSavedQrCode = () => {
    const savedQr = localStorage.getItem('qrCodeImage');
    if (savedQr) {
      setQrCodeImage(savedQr);
    }
  };

  const openPaymentModal = () => {
    if (cartItems.length === 0) return;
    loadSavedQrCode();
    setShowPayment(true);
  };

  const closePaymentModal = () => {
    setShowPayment(false);
  };

  const processOrder = async () => {
    if (cartItems.length === 0) return;

    try {
      const totalAmount = getTotalPrice();
      
      const orderData = {
        items: cartItems.map(item => ({
          product_id: item.id,
          quantity: item.quantity,
          price: item.price
        })),
        customer_name: selectedMember?.name || "ลูกค้าทั่วไป",
        notes: "รับที่ร้าน",
        member_id: selectedMember?.id || null
      };

      // สร้างออเดอร์
      const order = await orderAPI.createOrder(orderData);
      
      // ถ้ามีสมาชิก ให้บันทึกแต้มที่ได้รับ
      if (selectedMember) {
        try {
          await loyaltyAPI.earnPoints(selectedMember.id, {
            amount: Math.floor(totalAmount / 100), // 100 บาท = 1 แต้ม
            reason: `การซื้อออเดอร์ #${order.id}`,
            order_id: order.id,
          });
        } catch (pointError) {
          console.error('Error earning points:', pointError);
          // ไม่ต้อง fail ทั้งออเดอร์ถ้าบันทึกแต้มผิดพลาด
        }
      }
      
      // สร้างใบเสร็จหลังจากสร้างออเดอร์สำเร็จ
      const receiptData = {
        order_id: order.id,
        type: "FULL",
        customer_name: selectedMember?.name || "ลูกค้าทั่วไป",
        payment_method: "CASH",
        paid_amount: Math.ceil(totalAmount / 10) * 10, // ปัดขึ้นเป็น 10
        qr_code_data: `https://promptpay.io/0881234567/${totalAmount.toFixed(2)}`,
        notes: "รับที่ร้าน"
      };

      const receipt = await receiptAPI.createReceipt(receiptData);
      
      const pointsEarned = selectedMember ? Math.floor(totalAmount / 100) : 0;
      const message = selectedMember 
        ? `สั่งออเดอร์สำเร็จ!\nเลขที่ใบเสร็จ: ${receipt.receipt_number}\nสมาชิก: ${selectedMember.name}\nได้รับแต้ม: ${pointsEarned} แต้ม`
        : `สั่งออเดอร์สำเร็จ!\nเลขที่ใบเสร็จ: ${receipt.receipt_number}`;
      
      alert(message);
      clearCart();
      setSelectedMember(null);
      closePaymentModal();
    } catch (error) {
      console.error('Error processing order:', error);
      alert('เกิดข้อผิดพลาดในการสั่งออเดอร์');
    }
  };

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
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">ระบบขาย (POS)</h1>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <DarkModeToggle />
              <div className="badge badge-primary">
                <ShoppingCart className="w-4 h-4 mr-2" />
                {cartItems.reduce((total, item) => total + item.quantity, 0)} รายการ
              </div>
            </div>
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Menu Section */}
          <div className="lg:col-span-2">
            {/* Category Filter */}
            <div className="mb-6">
              <div className="flex flex-wrap gap-3">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => setSelectedCategory(category)}
                    className={`btn transition-all ${
                      selectedCategory === category
                        ? 'btn-primary'
                        : 'btn-secondary'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Menu Items Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
              {filteredItems && filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <div
                    key={item.id}
                    className="card p-4 cursor-pointer transition-all hover:shadow-lg"
                    onClick={() => addToCart(item)}
                  >
                    {/* รูปภาพเมนู */}
                    <div className="relative mb-3 rounded-lg overflow-hidden bg-[var(--coffee-cream)]">
                      {item.image ? (
                        <img 
                          src={item.image} 
                          alt={item.name}
                          className="w-full h-32 object-cover"
                        />
                      ) : (
                        <div className="w-full h-32 flex items-center justify-center">
                          <Coffee className="w-12 h-12 text-[var(--coffee-medium)]" />
                        </div>
                      )}
                      <div className="absolute top-2 right-2 bg-white rounded-full p-1 shadow-md">
                        <Plus className="w-4 h-4 text-[var(--coffee-brown)]" />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <h3 className="font-semibold text-[var(--coffee-dark)] line-clamp-2">{item.name}</h3>
                      <p className="text-sm text-[var(--coffee-medium)]">{item.category?.name || 'ไม่ระบุหมวดหมู่'}</p>
                      <p className="text-lg font-bold text-[var(--coffee-brown)]">฿{item.price}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="col-span-full text-center py-8">
                  <Coffee className="w-12 h-12 text-[var(--coffee-medium)] mx-auto mb-4" />
                  <p className="text-[var(--coffee-medium)]">
                    {menuItems.length === 0 ? 'ไม่พบเมนูในระบบ' : 'ไม่พบเมนูในหมวดหมู่นี้'}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Cart Section */}
          <div className="lg:col-span-1 space-y-6">
            {/* Loyalty Panel */}
            <LoyaltyPanel 
              onMemberSelect={setSelectedMember}
              selectedMember={selectedMember}
              cartTotal={getTotalPrice()}
            />

            <div className="card p-6 sticky top-6">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4 flex items-center">
                <ShoppingCart className="w-6 h-6 mr-2" />
                ตะกร้าสินค้า
              </h2>

              {cartItems.length === 0 ? (
                <p className="text-[var(--coffee-medium)] text-center py-8">
                  ยังไม่มีสินค้าในตะกร้า
                </p>
              ) : (
                <>
                  <div className="space-y-4 mb-6 max-h-64 overflow-y-auto">
                    {cartItems.map(item => (
                      <div key={item.id} className="flex items-center justify-between p-3 bg-[var(--coffee-cream)] rounded-lg">
                        <div className="flex items-center flex-1">
                          {/* รูปเล็กในตะกร้า */}
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-white mr-3 flex-shrink-0">
                            {item.image ? (
                              <img 
                                src={item.image} 
                                alt={item.name}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center">
                                <Coffee className="w-6 h-6 text-[var(--coffee-medium)]" />
                              </div>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-[var(--coffee-dark)] truncate">{item.name}</h4>
                            <p className="text-sm text-[var(--coffee-medium)]">฿{item.price}</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-8 h-8 rounded-full bg-[var(--coffee-brown)] text-white flex items-center justify-center"
                          >
                            <Minus className="w-4 h-4" />
                          </button>
                          <span className="w-8 text-center font-medium">{item.quantity}</span>
                          <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-8 h-8 rounded-full bg-[var(--coffee-brown)] text-white flex items-center justify-center"
                          >
                            <Plus className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="w-8 h-8 rounded-full bg-red-500 text-white flex items-center justify-center ml-2"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t border-[var(--coffee-light)] pt-4">
                    <div className="flex justify-between items-center mb-4">
                      <span className="text-lg font-bold text-[var(--coffee-dark)]">ยอดรวม:</span>
                      <span className="text-2xl font-bold text-[var(--coffee-brown)]">
                        ฿{getTotalPrice().toFixed(2)}
                      </span>
                    </div>
                    <div className="space-y-2">
                      <button
                        onClick={openPaymentModal}
                        className="w-full btn-primary py-3 text-lg"
                      >
                        ชำระเงิน
                      </button>
                      <button
                        onClick={clearCart}
                        className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                      >
                        ล้างตะกร้า
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Payment Modal */}
      {showPayment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-[var(--coffee-dark)]">ชำระเงิน</h2>
                <button
                  onClick={closePaymentModal}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>

              {/* Order Summary */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-3">สรุปรายการสั่งซื้อ</h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {cartItems.map(item => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x{item.quantity}</span>
                      <span>฿{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-[var(--coffee-light)] pt-2 mt-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xl font-bold text-[var(--coffee-dark)]">ยอดรวม:</span>
                    <span className="text-2xl font-bold text-[var(--coffee-brown)]">
                      ฿{getTotalPrice().toFixed(2)}
                    </span>
                  </div>
                </div>
              </div>

              {/* QR Code Section */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-3">สแกน QR Code เพื่อชำระเงิน</h3>
                
                {qrCodeImage ? (
                  <div className="text-center">
                    <div className="inline-block p-4 bg-white border-2 border-[var(--coffee-light)] rounded-lg shadow-md">
                      <img 
                        src={qrCodeImage} 
                        alt="QR Code สำหรับชำระเงิน" 
                        className="w-48 h-48 object-contain mx-auto"
                      />
                    </div>
                    <p className="text-sm text-[var(--coffee-medium)] mt-2">
                      โปรดสแกน QR Code และชำระเงิน ฿{getTotalPrice().toFixed(2)}
                    </p>
                    <button
                      onClick={() => setQrCodeImage(null)}
                      className="text-sm text-[var(--coffee-brown)] underline mt-2"
                    >
                      เปลี่ยน QR Code
                    </button>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="border-2 border-dashed border-[var(--coffee-light)] rounded-lg p-8">
                      <Coffee className="w-12 h-12 text-[var(--coffee-medium)] mx-auto mb-4" />
                      <p className="text-[var(--coffee-medium)] mb-4">อัปโหลด QR Code สำหรับชำระเงิน</p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                        id="qr-upload"
                      />
                      <label
                        htmlFor="qr-upload"
                        className="btn-primary cursor-pointer"
                      >
                        เลือกรูป QR Code
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Payment Actions */}
              <div className="space-y-3">
                {qrCodeImage && (
                  <button
                    onClick={processOrder}
                    className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors font-semibold"
                  >
                    ยืนยันการชำระเงิน
                  </button>
                )}
                <button
                  onClick={closePaymentModal}
                  className="w-full bg-gray-500 text-white py-2 rounded-lg hover:bg-gray-600 transition-colors"
                >
                  ยกเลิก
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
