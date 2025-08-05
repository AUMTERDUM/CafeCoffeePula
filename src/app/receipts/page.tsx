'use client';

import { useState, useEffect } from 'react';
import { receiptAPI, printerAPI } from '@/lib/api';
import { Receipt, Printer, PrintJob } from '@/lib/types';
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
  XCircle
} from 'lucide-react';

interface ReceiptPageProps {}

const ReceiptPage: React.FC<ReceiptPageProps> = () => {
  const [receipts, setReceipts] = useState<Receipt[]>([]);
  const [printers, setPrinters] = useState<Printer[]>([]);
  const [printJobs, setPrintJobs] = useState<PrintJob[]>([]);
  const [selectedTab, setSelectedTab] = useState<'receipts' | 'printers' | 'print-jobs'>('receipts');
  const [loading, setLoading] = useState(true);
  const [selectedReceipt, setSelectedReceipt] = useState<Receipt | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [receiptsRes, printersRes, printJobsRes] = await Promise.all([
        receiptAPI.getReceipts(),
        printerAPI.getPrinters(),
        printerAPI.getPrintJobs(),
      ]);

      setReceipts(receiptsRes);
      setPrinters(printersRes);
      setPrintJobs(printJobsRes);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handlePrintReceipt = async (receiptId: string, printerId?: string) => {
    try {
      await receiptAPI.printReceipt(receiptId, {
        printer_id: printerId,
        copies: 1,
      });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error printing receipt:', error);
    }
  };

  const handleVoidReceipt = async (receiptId: string, reason: string) => {
    try {
      await receiptAPI.voidReceipt(receiptId, {
        reason,
        voided_by: 'Admin', // TODO: Get from user context
      });
      await fetchData(); // Refresh data
    } catch (error) {
      console.error('Error voiding receipt:', error);
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

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case 'PENDING':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PRINTED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'VOIDED':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'COMPLETED':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-6">
        <ReceiptIcon className="h-8 w-8 text-orange-500" />
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">ระบบใบเสร็จและการพิมพ์</h1>
      </div>

      {/* Tab Navigation */}
      <div className="mb-6">
        <div className="border-b border-gray-200 dark:border-gray-700">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setSelectedTab('receipts')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'receipts'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <ReceiptIcon className="h-4 w-4 inline mr-2" />
              ใบเสร็จ ({receipts.length})
            </button>
            <button
              onClick={() => setSelectedTab('printers')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'printers'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <PrinterIcon className="h-4 w-4 inline mr-2" />
              เครื่องพิมพ์ ({printers.length})
            </button>
            <button
              onClick={() => setSelectedTab('print-jobs')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                selectedTab === 'print-jobs'
                  ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'
              }`}
            >
              <FileText className="h-4 w-4 inline mr-2" />
              งานพิมพ์ ({printJobs.length})
            </button>
          </nav>
        </div>
      </div>

      {/* Receipts Tab */}
      {selectedTab === 'receipts' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">รายการใบเสร็จ</h2>
          </div>

          <div className="grid gap-4">
            {receipts.map((receipt) => (
              <div
                key={receipt.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {receipt.receipt_number}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(receipt.created_at).toLocaleString('th-TH')}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                        receipt.status
                      )}`}
                    >
                      {getStatusIcon(receipt.status)}
                      <span className="ml-1">{receipt.status}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ลูกค้า</label>
                    <p className="text-gray-900 dark:text-white">{receipt.customer_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ประเภท</label>
                    <p className="text-gray-900 dark:text-white">{receipt.type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ยอดรวม</label>
                    <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                      ฿{receipt.total_amount.toFixed(2)}
                    </p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">การชำระเงิน</label>
                    <p className="text-gray-900 dark:text-white">{receipt.payment_method}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedReceipt(receipt)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    ดูรายละเอียด
                  </button>
                  {!receipt.is_voided && (
                    <>
                      <button
                        onClick={() => handlePrintReceipt(receipt.id)}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <PrinterIcon className="h-4 w-4 mr-2" />
                        พิมพ์
                      </button>
                      <button
                        onClick={() => {
                          const reason = prompt('เหตุผลในการยกเลิก:');
                          if (reason) {
                            handleVoidReceipt(receipt.id, reason);
                          }
                        }}
                        className="inline-flex items-center px-3 py-2 border border-transparent shadow-sm text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        <Ban className="h-4 w-4 mr-2" />
                        ยกเลิก
                      </button>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>

          {receipts.length === 0 && (
            <div className="text-center py-12">
              <ReceiptIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่มีใบเสร็จ</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ยังไม่มีการออกใบเสร็จในระบบ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Printers Tab */}
      {selectedTab === 'printers' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">เครื่องพิมพ์</h2>
            <button className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มเครื่องพิมพ์
            </button>
          </div>

          <div className="grid gap-4">
            {printers.map((printer) => (
              <div
                key={printer.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {printer.name}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {printer.model} - {printer.connection_type}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    {printer.is_default && (
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        ค่าเริ่มต้น
                      </span>
                    )}
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        printer.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {printer.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ประเภทการเชื่อมต่อ</label>
                    <p className="text-gray-900 dark:text-white">{printer.connection_type}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ขนาดกระดาษ</label>
                    <p className="text-gray-900 dark:text-white">{printer.paper_width}mm</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">อักขระต่อบรรทัด</label>
                    <p className="text-gray-900 dark:text-white">{printer.char_per_line}</p>
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500">
                    <Settings className="h-4 w-4 mr-2" />
                    ตั้งค่า
                  </button>
                </div>
              </div>
            ))}
          </div>

          {printers.length === 0 && (
            <div className="text-center py-12">
              <PrinterIcon className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่มีเครื่องพิมพ์</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ยังไม่มีการตั้งค่าเครื่องพิมพ์ในระบบ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Print Jobs Tab */}
      {selectedTab === 'print-jobs' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">ประวัติการพิมพ์</h2>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    ใบเสร็จ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    เครื่องพิมพ์
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    สถานะ
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    จำนวน
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    เวลา
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {printJobs.map((job) => (
                  <tr key={job.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                      {job.receipt?.receipt_number || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {job.printer?.name || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(
                          job.status
                        )}`}
                      >
                        {getStatusIcon(job.status)}
                        <span className="ml-1">{job.status}</span>
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {job.copies}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {job.completed_at ? new Date(job.completed_at).toLocaleString('th-TH') : '-'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {printJobs.length === 0 && (
            <div className="text-center py-12">
              <FileText className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่มีประวัติการพิมพ์</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                ยังไม่มีการพิมพ์ใบเสร็จในระบบ
              </p>
            </div>
          )}
        </div>
      )}

      {/* Receipt Detail Modal */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
          <div className="relative top-20 mx-auto p-5 border w-11/12 md:w-3/4 lg:w-1/2 shadow-lg rounded-md bg-white dark:bg-gray-800">
            <div className="mt-3">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                  รายละเอียดใบเสร็จ {selectedReceipt.receipt_number}
                </h3>
                <button
                  onClick={() => setSelectedReceipt(null)}
                  className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  <XCircle className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ลูกค้า</label>
                    <p className="text-gray-900 dark:text-white">{selectedReceipt.customer_name || '-'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">เบอร์โทร</label>
                    <p className="text-gray-900 dark:text-white">{selectedReceipt.customer_phone || '-'}</p>
                  </div>
                </div>

                <div className="border-t pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-2">รายการสินค้า</h4>
                  {selectedReceipt.order?.items?.map((item, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-b-0">
                      <div>
                        <p className="font-medium">{item.product?.name || 'สินค้า'}</p>
                        <p className="text-sm text-gray-500">จำนวน {item.quantity}</p>
                      </div>
                      <p className="font-medium">฿{(item.quantity * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                </div>

                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>ยอดรวม</span>
                    <span>฿{selectedReceipt.subtotal_amount.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.discount_amount > 0 && (
                    <div className="flex justify-between text-red-600">
                      <span>ส่วนลด</span>
                      <span>-฿{selectedReceipt.discount_amount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg">
                    <span>รวมทั้งสิ้น</span>
                    <span>฿{selectedReceipt.total_amount.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>รับเงิน</span>
                    <span>฿{selectedReceipt.paid_amount.toFixed(2)}</span>
                  </div>
                  {selectedReceipt.change_amount > 0 && (
                    <div className="flex justify-between">
                      <span>เงินทอน</span>
                      <span>฿{selectedReceipt.change_amount.toFixed(2)}</span>
                    </div>
                  )}
                </div>

                {selectedReceipt.qr_code_data && (
                  <div className="border-t pt-4">
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">QR Code สำหรับการชำระเงิน</label>
                    <p className="text-sm text-blue-600 break-all">{selectedReceipt.qr_code_data}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReceiptPage;
