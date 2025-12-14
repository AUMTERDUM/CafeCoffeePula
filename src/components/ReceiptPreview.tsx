'use client';

import { Printer, X } from 'lucide-react';
import { useRef } from 'react';
import { Receipt, PaymentMethod } from '@/lib/types';

interface ReceiptItem {
  name: string;
  quantity: number;
  price: number;
  total?: number;
}

interface ReceiptPreviewProps {
  receipt: Receipt & {
    items: ReceiptItem[];
    member?: {
      name: string;
      phone: string;
      points: number;
      pointsEarned: number;
    };
  };
  onClose: () => void;
}

export default function ReceiptPreview({ receipt, onClose }: ReceiptPreviewProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const getPaymentMethodName = (method: PaymentMethod): string => {
    switch (method) {
      case 'CASH': return 'เงินสด';
      case 'CREDIT': return 'บัตรเครดิต';
      case 'BANK_TRANSFER': return 'โอนเงิน';
      case 'DIGITAL_WALLET': return 'QR Code';
      default: return method;
    }
  };

  const handlePrint = () => {
    const printContent = printRef.current;
    if (!printContent) return;

    const printWindow = window.open('', '', 'width=800,height=600');
    if (!printWindow) return;

    printWindow.document.write(`
      <html>
        <head>
          <title>ใบเสร็จ - ${receipt.receipt_number}</title>
          <style>
            body { font-family: 'Courier New', monospace; margin: 20px; }
            .receipt { max-width: 300px; margin: 0 auto; }
            @media print {
              body { margin: 0; }
              @page { margin: 0; }
            }
          </style>
        </head>
        <body onload="window.print(); window.close();">
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4 max-h-[90vh] flex flex-col animate-scaleIn">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200">
          <h2 className="text-xl font-bold text-[var(--coffee-dark)]">ตัวอย่างใบเสร็จ</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Receipt Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div ref={printRef} className="receipt bg-white p-6 font-mono text-sm">
            {/* Store Header */}
            <div className="header text-center mb-4">
              <h1 className="text-2xl font-bold">☕ Coffee PuLa</h1>
              <p className="text-xs mt-1">ร้านกาแฟคุณภาพ</p>
              <p className="text-xs">123 ถ.กาแฟ เมืองกาแฟ</p>
              <p className="text-xs">Tel: 081-234-5678</p>
              <div className="border-t-2 border-dashed border-black mt-2 pt-2">
                <p className="text-xs">เลขที่: {receipt.receipt_number}</p>
                <p className="text-xs">{new Date(receipt.created_at).toLocaleString('th-TH')}</p>
              </div>
            </div>

            {/* Items */}
            <div className="items border-b-2 border-dashed border-black pb-2 mb-2">
              {receipt.items.map((item, index) => (
                <div key={index} className="item flex justify-between mb-1">
                  <div className="flex-1">
                    <div>{item.name}</div>
                    <div className="text-xs text-gray-600">
                      {item.quantity} x ฿{item.price.toFixed(2)}
                    </div>
                  </div>
                  <div>฿{(item.total || item.quantity * item.price).toFixed(2)}</div>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="totals text-sm space-y-1">
              <div className="total-line flex justify-between">
                <span>ยอดรวม:</span>
                <span>฿{receipt.subtotal_amount.toFixed(2)}</span>
              </div>
              {receipt.discount_amount > 0 && (
                <div className="total-line flex justify-between text-red-600">
                  <span>ส่วนลด:</span>
                  <span>-฿{receipt.discount_amount.toFixed(2)}</span>
                </div>
              )}
              {receipt.tax_amount > 0 && (
                <div className="total-line flex justify-between">
                  <span>ภาษี:</span>
                  <span>฿{receipt.tax_amount.toFixed(2)}</span>
                </div>
              )}
              <div className="total-line flex justify-between font-bold border-t border-dashed border-black pt-1">
                <span>รวมทั้งสิ้น:</span>
                <span>฿{receipt.total_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Payment */}
            <div className="mt-4 text-sm space-y-1">
              <div className="flex justify-between">
                <span>ชำระด้วย:</span>
                <span>{receipt.payment_method ? getPaymentMethodName(receipt.payment_method) : '-'}</span>
              </div>
              <div className="flex justify-between">
                <span>รับเงิน:</span>
                <span>฿{receipt.paid_amount.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>เงินทอน:</span>
                <span>฿{receipt.change_amount.toFixed(2)}</span>
              </div>
            </div>

            {/* Member Info */}
            {receipt.member && (
              <div className="footer border-t-2 border-dashed border-black mt-4 pt-2 text-xs">
                <p>สมาชิก: {receipt.member.name}</p>
                <p>โทร: {receipt.member.phone}</p>
                <p className="font-bold text-green-600 mt-1">
                  ได้รับแต้ม: +{receipt.member.pointsEarned} แต้ม
                </p>
                <p>คงเหลือ: {receipt.member.points} แต้ม</p>
              </div>
            )}

            {/* Footer */}
            <div className="footer text-center mt-4 text-xs">
              <p>ขอบคุณที่ใช้บริการ</p>
              <p className="mt-1">*** สินค้าที่ซื้อแล้วไม่สามารถคืนได้ ***</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 p-4 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ปิด
          </button>
          <button
            onClick={handlePrint}
            className="flex-1 px-4 py-2 bg-[var(--coffee-brown)] text-white rounded-lg hover:bg-[var(--coffee-brown-dark)] transition-colors flex items-center justify-center gap-2"
          >
            <Printer className="w-4 h-4" />
            พิมพ์
          </button>
        </div>
      </div>
    </div>
  );
}
