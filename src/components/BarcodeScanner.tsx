'use client';

import { useState, useRef, useEffect } from 'react';
import { Scan, X, Camera } from 'lucide-react';

interface BarcodeScannerProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (code: string) => void;
  title?: string;
}

export default function BarcodeScanner({ isOpen, onClose, onScan, title = 'สแกนบาร์โค้ด' }: BarcodeScannerProps) {
  const [manualCode, setManualCode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      onScan(manualCode.trim());
      setManualCode('');
      onClose();
    }
  };

  const handleCameraScan = async () => {
    setIsScanning(true);
    // TODO: Implement actual camera barcode scanning using a library
    // For now, show demo message
    alert('Camera scanning จะพร้อมใช้งานในเวอร์ชันถัดไป\nกรุณาใช้การพิมพ์ด้วยตนเองในระหว่างนี้');
    setIsScanning(false);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <div className="flex items-center gap-2">
            <Scan className="w-6 h-6 text-[var(--coffee-brown)]" />
            <h2 className="text-xl font-bold text-[var(--coffee-dark)]">{title}</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Manual Input */}
          <form onSubmit={handleManualSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                พิมพ์บาร์โค้ดด้วยตนเอง
              </label>
              <input
                ref={inputRef}
                type="text"
                value={manualCode}
                onChange={(e) => setManualCode(e.target.value)}
                placeholder="กรอกหมายเลขบาร์โค้ด"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[var(--coffee-brown)] focus:border-transparent"
                autoFocus
              />
            </div>
            <button
              type="submit"
              className="w-full bg-[var(--coffee-brown)] text-white py-3 rounded-lg font-semibold hover:bg-[var(--coffee-dark)] transition-colors"
            >
              ยืนยัน
            </button>
          </form>

          {/* Divider */}
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">หรือ</span>
            </div>
          </div>

          {/* Camera Scan Button */}
          <button
            onClick={handleCameraScan}
            disabled={isScanning}
            className="w-full border-2 border-[var(--coffee-brown)] text-[var(--coffee-brown)] py-3 rounded-lg font-semibold hover:bg-[var(--coffee-light)] transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
            {isScanning ? 'กำลังเปิดกล้อง...' : 'สแกนด้วยกล้อง'}
          </button>

          {/* Demo Barcodes */}
          <div className="mt-6 pt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600 mb-3">บาร์โค้ดทดสอบ:</p>
            <div className="space-y-2">
              {['8850006340301', '8851932187268', '8850987000638'].map((code) => (
                <button
                  key={code}
                  onClick={() => {
                    setManualCode(code);
                    onScan(code);
                    onClose();
                  }}
                  className="w-full text-left px-3 py-2 bg-gray-50 hover:bg-gray-100 rounded text-sm font-mono transition-colors"
                >
                  {code}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
