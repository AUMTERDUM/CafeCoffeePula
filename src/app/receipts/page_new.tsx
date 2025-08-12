'use client';

import { useState, useEffect } from 'react';
import { Receipt } from '@/lib/types';
import BackButton from '@/components/BackButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import { 
  Receipt as ReceiptIcon, 
  Printer as PrinterIcon,
  Eye,
  FileText,
  Ban,
  Plus,
  Settings,
  CheckCircle,
  Clock,
  XCircle,
  Search,
  Filter
} from 'lucide-react';

// Mock Printer interface for this component
interface Printer {
  id: string;
  name: string;
  type: string;
  status: string;
  ip_address?: string;
  paper_size: string;
  characters_per_line: number;
}

// Mock PrintJob interface
interface PrintJob {
  id: string;
  receipt_id: string;
  printer_id: string;
  status: string;
  created_at: string;
  printed_at?: string;
  copies: number;
}

const ReceiptPage: React.FC = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'printers' | 'print-jobs'>('receipts');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Mock data
      const mockReceipts: Receipt[] = [
        {
          id: '1',
          receipt_number: 'R001',
          order_id: 'O001',
          customer_name: 'ลูกค้าทั่วไป',
          customer_phone: '081-234-5678',
          total_amount: 120,
          payment_method: 'CASH',
          status: 'PRINTED',
          created_at: new Date().toISOString(),
          printed_at: new Date().toISOString(),
          items: [
            { name: 'กาแฟอเมริกาโน่', quantity: 1, price: 60 },
            { name: 'เค้กช็อกโกแลต', quantity: 1, price: 60 }
          ],
          tax_amount: 0,
          discount_amount: 0,
          voided_at: null,
          voided_by: null,
          void_reason: null
        }
      ];

      const mockPrinters: Printer[] = [
        {
          id: '1',
          name: 'เครื่องพิมพ์หลัก',
          type: 'THERMAL',
          status: 'ONLINE',
          ip_address: '192.168.1.100',
          paper_size: '80mm',
          characters_per_line: 48
        }
      ];

      const mockPrintJobs: PrintJob[] = [
        {
          id: '1',
          receipt_id: '1',
          printer_id: '1',
          status: 'COMPLETED',
          created_at: new Date().toISOString(),
          printed_at: new Date().toISOString(),
          copies: 1
        }
      ];

      setReceipts(mockReceipts);
      setPrinters(mockPrinters);
      setPrintJobs(mockPrintJobs);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'PRINTED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'VOIDED':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'COMPLETED':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'badge badge-warning';
      case 'PRINTED':
        return 'badge badge-success';
      case 'VOIDED':
        return 'badge badge-error';
      case 'COMPLETED':
        return 'badge badge-success';
      default:
        return 'badge badge-secondary';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <ReceiptIcon className="w-12 h-12 text-[var(--coffee-brown)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลดข้อมูลใบเสร็จ...</p>
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
                <ReceiptIcon className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">ระบบใบเสร็จและการพิมพ์</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-[var(--coffee-border)]">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setSelectedTab('receipts')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'receipts'
                    ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                    : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
                }`}
              >
                <ReceiptIcon className="h-4 w-4 inline mr-2" />
                ใบเสร็จ ({receipts.length})
              </button>
              <button
                onClick={() => setSelectedTab('printers')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'printers'
                    ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                    : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
                }`}
              >
                <PrinterIcon className="h-4 w-4 inline mr-2" />
                เครื่องพิมพ์ ({printers.length})
              </button>
              <button
                onClick={() => setSelectedTab('print-jobs')}
                className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                  selectedTab === 'print-jobs'
                    ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                    : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
                }`}
              >
                <Settings className="h-4 w-4 inline mr-2" />
                งานพิมพ์ ({printJobs.length})
              </button>
            </nav>
          </div>
        </div>

        {/* Receipts Tab */}
        {selectedTab === 'receipts' && (
          <div className="space-y-6">
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center space-x-4 w-full sm:w-auto">
                <div className="relative flex-1 sm:w-80">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--coffee-medium)] h-4 w-4" />
                  <input
                    type="text"
                    placeholder="ค้นหาใบเสร็จ..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="cute-input pl-10 pr-4 py-2 w-full"
                  />
                </div>
                <button className="btn btn-secondary">
                  <Filter className="h-4 w-4 mr-2" />
                  กรอง
                </button>
              </div>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                สร้างใบเสร็จ
              </button>
            </div>

            {/* Receipts List */}
            <div className="grid gap-4">
              {receipts.map((receipt) => (
                <div key={receipt.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        {getStatusIcon(receipt.status)}
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-[var(--coffee-dark)]">
                          {receipt.receipt_number}
                        </h3>
                        <p className="text-sm text-[var(--coffee-medium)]">
                          ออเดอร์: {receipt.order_id}
                        </p>
                      </div>
                    </div>
                    <span className={getStatusBadge(receipt.status)}>
                      {receipt.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">ลูกค้า</div>
                      <p className="text-[var(--coffee-dark)]">
                        {receipt.customer_name || 'ลูกค้าทั่วไป'}
                      </p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">ประเภท</div>
                      <p className="text-[var(--coffee-dark)]">{receipt.payment_method}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">ยอดรวม</div>
                      <p className="text-lg font-semibold text-[var(--coffee-brown)]">
                        ฿{receipt.total_amount.toLocaleString()}
                      </p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">การชำระเงิน</div>
                      <p className="text-[var(--coffee-dark)]">
                        {receipt.payment_method === 'CASH' ? 'เงินสด' : 
                         receipt.payment_method === 'CARD' ? 'บัตรเครดิต' : 
                         receipt.payment_method === 'QR' ? 'QR Code' : receipt.payment_method}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-sm text-[var(--coffee-medium)] mb-4">
                    <div>
                      วันที่: {new Date(receipt.created_at).toLocaleDateString('th-TH')}
                    </div>
                    {receipt.printed_at && (
                      <div>
                        พิมพ์แล้ว: {new Date(receipt.printed_at).toLocaleDateString('th-TH')}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setSelectedReceipt(receipt)}
                      className="btn btn-secondary"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      ดูรายละเอียด
                    </button>
                    <button className="btn btn-accent">
                      <PrinterIcon className="h-4 w-4 mr-2" />
                      พิมพ์
                    </button>
                    {receipt.status !== 'VOIDED' && (
                      <button className="btn btn-error">
                        <Ban className="h-4 w-4 mr-2" />
                        ยกเลิก
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {receipts.length === 0 && (
              <div className="text-center py-12">
                <ReceiptIcon className="mx-auto h-12 w-12 text-[var(--coffee-medium)]" />
                <h3 className="mt-2 text-sm font-medium text-[var(--coffee-dark)]">ไม่มีใบเสร็จ</h3>
                <p className="mt-1 text-sm text-[var(--coffee-medium)]">
                  เมื่อมีการขายจะแสดงใบเสร็จที่นี่
                </p>
              </div>
            )}
          </div>
        )}

        {/* Printers Tab */}
        {selectedTab === 'printers' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">เครื่องพิมพ์</h2>
              <button className="btn btn-primary">
                <Plus className="h-4 w-4 mr-2" />
                เพิ่มเครื่องพิมพ์
              </button>
            </div>

            <div className="grid gap-4">
              {printers.map((printer) => (
                <div key={printer.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--coffee-dark)]">
                        {printer.name}
                      </h3>
                      <p className="text-sm text-[var(--coffee-medium)]">
                        {printer.type}
                      </p>
                    </div>
                    <span className={`badge ${printer.status === 'ONLINE' ? 'badge-success' : 'badge-error'}`}>
                      {printer.status === 'ONLINE' ? 'ออนไลน์' : 'ออฟไลน์'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">IP Address</div>
                      <p className="text-[var(--coffee-dark)]">{printer.ip_address || 'ไม่ระบุ'}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">ขนาดกระดาษ</div>
                      <p className="text-[var(--coffee-dark)]">{printer.paper_size}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">อักขระต่อบรรทัด</div>
                      <p className="text-[var(--coffee-dark)]">{printer.characters_per_line}</p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="btn btn-secondary">
                      <Settings className="h-4 w-4 mr-2" />
                      ตั้งค่า
                    </button>
                    <button className="btn btn-accent">
                      <FileText className="h-4 w-4 mr-2" />
                      ทดสอบพิมพ์
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {printers.length === 0 && (
              <div className="text-center py-12">
                <PrinterIcon className="mx-auto h-12 w-12 text-[var(--coffee-medium)]" />
                <h3 className="mt-2 text-sm font-medium text-[var(--coffee-dark)]">ไม่มีเครื่องพิมพ์</h3>
                <p className="mt-1 text-sm text-[var(--coffee-medium)]">
                  เพิ่มเครื่องพิมพ์เพื่อพิมพ์ใบเสร็จ
                </p>
              </div>
            )}
          </div>
        )}

        {/* Print Jobs Tab */}
        {selectedTab === 'print-jobs' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">งานพิมพ์</h2>
              <button className="btn btn-secondary">
                <Filter className="h-4 w-4 mr-2" />
                กรองตามสถานะ
              </button>
            </div>

            <div className="grid gap-4">
              {printJobs.map((job) => (
                <div key={job.id} className="card p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-lg font-semibold text-[var(--coffee-dark)]">
                        งานพิมพ์ #{job.id}
                      </h3>
                      <p className="text-sm text-[var(--coffee-medium)]">
                        ใบเสร็จ: {job.receipt_id}
                      </p>
                    </div>
                    <span className={getStatusBadge(job.status)}>
                      {job.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">เครื่องพิมพ์</div>
                      <p className="text-[var(--coffee-dark)]">
                        {printers.find(p => p.id === job.printer_id)?.name || 'ไม่ทราบ'}
                      </p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">จำนวนสำเนา</div>
                      <p className="text-[var(--coffee-dark)]">{job.copies}</p>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-[var(--coffee-medium)]">วันที่สร้าง</div>
                      <p className="text-[var(--coffee-dark)]">
                        {new Date(job.created_at).toLocaleDateString('th-TH')}
                      </p>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2">
                    <button className="btn btn-secondary">
                      <Eye className="h-4 w-4 mr-2" />
                      ดูรายละเอียด
                    </button>
                    {job.status === 'PENDING' && (
                      <button className="btn btn-error">
                        <XCircle className="h-4 w-4 mr-2" />
                        ยกเลิกงาน
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {printJobs.length === 0 && (
              <div className="text-center py-12">
                <Settings className="mx-auto h-12 w-12 text-[var(--coffee-medium)]" />
                <h3 className="mt-2 text-sm font-medium text-[var(--coffee-dark)]">ไม่มีงานพิมพ์</h3>
                <p className="mt-1 text-sm text-[var(--coffee-medium)]">
                  งานพิมพ์จะแสดงที่นี่เมื่อมีการพิมพ์ใบเสร็จ
                </p>
              </div>
            )}
          </div>
        )}

        {/* Receipt Detail Modal */}
        {selectedReceipt && (
          <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
              <div className="fixed inset-0 transition-opacity" aria-hidden="true">
                <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
              </div>

              <div className="inline-block align-bottom bg-[var(--coffee-card)] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
                <div className="bg-[var(--coffee-card)] px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="sm:flex sm:items-start">
                    <div className="w-full">
                      <h3 className="text-lg leading-6 font-medium text-[var(--coffee-dark)]">
                        รายละเอียดใบเสร็จ {selectedReceipt.receipt_number}
                      </h3>
                      
                      <div className="mt-4 space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm font-medium text-[var(--coffee-medium)]">ลูกค้า</div>
                            <p className="text-[var(--coffee-dark)]">{selectedReceipt.customer_name || 'ลูกค้าทั่วไป'}</p>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--coffee-medium)]">เบอร์โทร</div>
                            <p className="text-[var(--coffee-dark)]">{selectedReceipt.customer_phone || '-'}</p>
                          </div>
                        </div>

                        <div>
                          <div className="text-sm font-medium text-[var(--coffee-medium)] mb-2">รายการสินค้า</div>
                          <div className="space-y-2">
                            {selectedReceipt.items.map((item, index) => (
                              <div key={`item-${index}`} className="flex justify-between py-2 border-b last:border-b-0">
                                <div>
                                  <span className="text-[var(--coffee-dark)]">{item.name}</span>
                                  <span className="text-[var(--coffee-medium)] ml-2">x{item.quantity}</span>
                                </div>
                                <span className="text-[var(--coffee-dark)]">฿{(item.price * item.quantity).toLocaleString()}</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="border-t pt-4">
                          <div className="flex justify-between items-center">
                            <span className="text-lg font-semibold text-[var(--coffee-dark)]">รวมทั้งสิ้น</span>
                            <span className="text-lg font-bold text-[var(--coffee-brown)]">
                              ฿{selectedReceipt.total_amount.toLocaleString()}
                            </span>
                          </div>
                        </div>

                        {/* QR Code placeholder */}
                        <div className="text-center pt-4">
                          <div className="text-sm font-medium text-[var(--coffee-medium)]">QR Code สำหรับการชำระเงิน</div>
                          <div className="w-32 h-32 bg-gray-200 mx-auto mt-2 flex items-center justify-center rounded">
                            <span className="text-gray-400">QR Code</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                <div className="bg-[var(--coffee-soft)] px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    onClick={() => setSelectedReceipt(null)}
                    className="btn btn-secondary w-full sm:ml-3 sm:w-auto"
                  >
                    ปิด
                  </button>
                  <button className="btn btn-primary w-full sm:w-auto mt-3 sm:mt-0">
                    <PrinterIcon className="h-4 w-4 mr-2" />
                    พิมพ์
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReceiptPage;
