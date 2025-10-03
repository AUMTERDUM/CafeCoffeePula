'use client';

import { useState, useEffect } from 'react';
import { Settings, ArrowLeft, Store, Printer, Database, Download, Upload, Trash2, QrCode } from 'lucide-react';
import Link from 'next/link';
import DarkModeToggle from '@/components/DarkModeToggle';
import { menuAPI, orderAPI } from '@/lib/api';

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState('general');
  const [qrCodeImage, setQrCodeImage] = useState<string | null>(null);
  const [settings, setSettings] = useState({
    storeName: 'Coffee PuLa',
    storeAddress: '',
    storePhone: '',
    taxRate: 7,
    currency: 'THB',
    printerEnabled: false,
    receiptFooter: 'ขอบคุณที่มาใช้บริการ',
  });

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleQrUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const result = e.target?.result as string;
        setQrCodeImage(result);
        localStorage.setItem('qrCodeImage', result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removeQrCode = () => {
    setQrCodeImage(null);
    localStorage.removeItem('qrCodeImage');
  };

  // โหลด QR Code ที่บันทึกไว้
  useEffect(() => {
    const savedQr = localStorage.getItem('qrCodeImage');
    if (savedQr) {
      setQrCodeImage(savedQr);
    }
  }, []);

  const exportData = async () => {
    try {
      // Export menu data
      const menuData = await menuAPI.getMenu();
      
      // Export orders data
      const ordersData = await orderAPI.getOrders();

      const exportData = {
        menu: menuData,
        orders: ordersData,
        exportDate: new Date().toISOString(),
      };

      const blob = new Blob([JSON.stringify(exportData, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `coffee-pula-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      alert('ส่งออกข้อมูลสำเร็จ!');
    } catch (error) {
      console.error('Error exporting data:', error);
      alert('เกิดข้อผิดพลาดในการส่งออกข้อมูล');
    }
  };

  const clearAllData = async () => {
    if (!confirm('คุณต้องการลบข้อมูลทั้งหมดหรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้!')) {
      return;
    }

    if (!confirm('กรุณายืนยันอีกครั้ง - ข้อมูลทั้งหมดจะถูกลบอย่างถาวร!')) {
      return;
    }

    try {
      // This would require a special API endpoint to clear all data
      alert('ฟีเจอร์นี้จะพัฒนาในอนาคต');
    } catch (error) {
      console.error('Error clearing data:', error);
      alert('เกิดข้อผิดพลาดในการลบข้อมูล');
    }
  };

  const tabs = [
    { id: 'general', label: 'ทั่วไป', icon: Store },
    { id: 'qrcode', label: 'QR Code ชำระเงิน', icon: QrCode },
    { id: 'printer', label: 'เครื่องพิมพ์', icon: Printer },
    { id: 'data', label: 'จัดการข้อมูล', icon: Database },
  ];

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
              <Settings className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
              <h1 className="text-2xl font-bold text-[var(--coffee-dark)]">ตั้งค่าระบบ</h1>
            </div>
            <DarkModeToggle />
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card p-4">
              <nav className="space-y-2">
                {tabs.map(tab => {
                  const Icon = tab.icon;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`w-full flex items-center px-4 py-3 rounded-lg transition-all ${
                        activeTab === tab.id
                          ? 'bg-[var(--coffee-brown)] text-white'
                          : 'text-[var(--coffee-medium)] hover:bg-[var(--coffee-light)]'
                      }`}
                    >
                      <Icon className="w-5 h-5 mr-3" />
                      {tab.label}
                    </button>
                  );
                })}
              </nav>
            </div>
          </div>

          {/* Content */}
          <div className="lg:col-span-3">
            {activeTab === 'general' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-6">ตั้งค่าทั่วไป</h2>
                <div className="space-y-6">
                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">ชื่อร้าน</label>
                    <input
                      type="text"
                      value={settings.storeName}
                      onChange={(e) => handleSettingChange('storeName', e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">ที่อยู่ร้าน</label>
                    <textarea
                      value={settings.storeAddress}
                      onChange={(e) => handleSettingChange('storeAddress', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">เบอร์โทรศัพท์</label>
                    <input
                      type="tel"
                      value={settings.storePhone}
                      onChange={(e) => handleSettingChange('storePhone', e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">อัตราภาษี (%)</label>
                    <input
                      type="number"
                      value={settings.taxRate}
                      onChange={(e) => handleSettingChange('taxRate', parseFloat(e.target.value))}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">สกุลเงิน</label>
                    <select
                      value={settings.currency}
                      onChange={(e) => handleSettingChange('currency', e.target.value)}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    >
                      <option value="THB">บาท (THB)</option>
                      <option value="USD">ดอลลาร์ (USD)</option>
                      <option value="EUR">ยูโร (EUR)</option>
                    </select>
                  </div>

                  <button className="btn-primary">
                    บันทึกการตั้งค่า
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'qrcode' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-6">ตั้งค่า QR Code สำหรับชำระเงิน</h2>
                
                {qrCodeImage ? (
                  <div className="space-y-6">
                    <div className="text-center">
                      <div className="inline-block p-4 bg-white border-2 border-[var(--coffee-light)] rounded-lg shadow-md">
                        <img 
                          src={qrCodeImage} 
                          alt="QR Code สำหรับชำระเงิน" 
                          className="w-48 h-48 object-contain mx-auto"
                        />
                      </div>
                      <p className="text-[var(--coffee-medium)] mt-4">
                        QR Code นี้จะแสดงในหน้าชำระเงิน
                      </p>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                        id="qr-change"
                      />
                      <label
                        htmlFor="qr-change"
                        className="btn-primary cursor-pointer"
                      >
                        เปลี่ยน QR Code
                      </label>
                      <button
                        onClick={removeQrCode}
                        className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors"
                      >
                        ลบ QR Code
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <div className="border-2 border-dashed border-[var(--coffee-light)] rounded-lg p-12">
                      <QrCode className="w-16 h-16 text-[var(--coffee-medium)] mx-auto mb-4" />
                      <h3 className="text-lg font-medium text-[var(--coffee-dark)] mb-2">
                        อัปโหลด QR Code สำหรับชำระเงิน
                      </h3>
                      <p className="text-[var(--coffee-medium)] mb-6">
                        QR Code นี้จะแสดงให้ลูกค้าเห็นเมื่อทำการชำระเงิน<br/>
                        รองรับไฟล์รูปภาพ (PNG, JPG, JPEG)
                      </p>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleQrUpload}
                        className="hidden"
                        id="qr-upload-settings"
                      />
                      <label
                        htmlFor="qr-upload-settings"
                        className="btn-primary cursor-pointer"
                      >
                        เลือกรูป QR Code
                      </label>
                    </div>
                  </div>
                )}

                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <h4 className="font-medium text-blue-800 mb-2">💡 คำแนะนำ:</h4>
                  <ul className="text-blue-700 text-sm space-y-1">
                    <li>• ใช้ QR Code ของธนาคารหรือ e-Wallet ที่คุณต้องการรับเงิน</li>
                    <li>• ควรเป็น QR Code แบบ Static ที่สามารถใช้ได้หลายครั้ง</li>
                    <li>• รูปภาพควรมีความชัดเจนและขนาดเหมาะสม</li>
                    <li>• ลูกค้าจะต้องใส่จำนวนเงินเองเมื่อสแกน QR Code</li>
                  </ul>
                </div>
              </div>

            )}

            {activeTab === 'printer' && (
              <div className="card p-6">
                <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-6">ตั้งค่าเครื่องพิมพ์</h2>
                <div className="space-y-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-medium text-[var(--coffee-dark)]">เปิดใช้งานเครื่องพิมพ์</h3>
                      <p className="text-sm text-[var(--coffee-medium)]">พิมพ์ใบเสร็จอัตโนมัติ</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={settings.printerEnabled}
                        onChange={(e) => handleSettingChange('printerEnabled', e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--coffee-brown)]"></div>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[var(--coffee-medium)] mb-2">ข้อความท้ายใบเสร็จ</label>
                    <textarea
                      value={settings.receiptFooter}
                      onChange={(e) => handleSettingChange('receiptFooter', e.target.value)}
                      rows={3}
                      className="w-full px-4 py-2 border border-[var(--coffee-light)] rounded-lg focus:outline-none focus:border-[var(--coffee-brown)]"
                    />
                  </div>

                  <div className="space-y-4">
                    <h3 className="font-medium text-[var(--coffee-dark)]">ทดสอบการพิมพ์</h3>
                    <button className="btn-primary">
                      พิมพ์ใบเสร็จทดสอบ
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'data' && (
              <div className="space-y-6">
                {/* Export Data */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">ส่งออกข้อมูล</h2>
                  <p className="text-[var(--coffee-medium)] mb-4">
                    ส่งออกข้อมูลเมนูและยอดขายเพื่อสำรองข้อมูล
                  </p>
                  <button
                    onClick={exportData}
                    className="btn-primary flex items-center"
                  >
                    <Download className="w-5 h-5 mr-2" />
                    ส่งออกข้อมูล
                  </button>
                </div>

                {/* Import Data */}
                <div className="card p-6">
                  <h2 className="text-xl font-bold text-[var(--coffee-dark)] mb-4">นำเข้าข้อมูล</h2>
                  <p className="text-[var(--coffee-medium)] mb-4">
                    นำเข้าข้อมูลจากไฟล์สำรองข้อมูล
                  </p>
                  <div className="flex items-center space-x-4">
                    <input
                      type="file"
                      accept=".json"
                      className="hidden"
                      id="import-file"
                    />
                    <label
                      htmlFor="import-file"
                      className="btn-primary flex items-center cursor-pointer"
                    >
                      <Upload className="w-5 h-5 mr-2" />
                      เลือกไฟล์
                    </label>
                    <span className="text-[var(--coffee-medium)] text-sm">
                      รองรับไฟล์ .json เท่านั้น
                    </span>
                  </div>
                </div>

                {/* Clear Data */}
                <div className="card p-6 border-red-200">
                  <h2 className="text-xl font-bold text-red-600 mb-4">ลบข้อมูลทั้งหมด</h2>
                  <p className="text-red-500 mb-4">
                    ⚠️ การกระทำนี้จะลบข้อมูลทั้งหมดอย่างถาวร และไม่สามารถย้อนกลับได้
                  </p>
                  <button
                    onClick={clearAllData}
                    className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center"
                  >
                    <Trash2 className="w-5 h-5 mr-2" />
                    ลบข้อมูลทั้งหมด
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
