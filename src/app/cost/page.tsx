'use client';

import { useState, useEffect } from 'react';
import { costAPI, menuAPI } from '@/lib/api';
import { ProductCost, DailyProfitReport, ProductProfitReport, ProfitAnalytics, Product } from '@/lib/types';
import DarkModeToggle from '@/components/DarkModeToggle';
import BackButton from '@/components/BackButton';
import { 
  Calculator,
  TrendingUp,
  TrendingDown,
  BarChart3,
  Calendar,
  Package,
  Target,
  RefreshCw,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CostManagementPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'reports' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Data states
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyProfitReport | null>(null);
  const [productReports, setProductReports] = useState<ProductProfitReport[]>([]);
  const [analytics, setAnalytics] = useState<ProfitAnalytics | null>(null);
  
  // UI states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [expandedProduct, setExpandedProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (selectedTab === 'reports') {
      fetchReports();
    } else if (selectedTab === 'analytics') {
      fetchAnalytics();
    }
  }, [selectedTab, selectedDate, analyticsDays]);

  const fetchInitialData = async () => {
    try {
      setLoading(true);
      setError(null);
      const [costsRes, productsRes, dailyRes] = await Promise.all([
        costAPI.getProductCosts(),
        menuAPI.getMenu(),
        costAPI.getDailyProfitReport(),
      ]);

      setProductCosts(costsRes || []);
      setProducts(productsRes || []);
      setDailyReport(dailyRes || null);
    } catch (error) {
      console.error('Error fetching initial data:', error);
      setError(error instanceof Error ? error.message : 'เกิดข้อผิดพลาดในการโหลดข้อมูล');
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      setError(null);
      const [dailyRes, productRes] = await Promise.all([
        costAPI.getDailyProfitReport(selectedDate),
        costAPI.getProductProfitReport(selectedDate),
      ]);

      setDailyReport(dailyRes || null);
      setProductReports(productRes || []);
    } catch (error) {
      console.error('Error fetching reports:', error);
      setError('ไม่สามารถโหลดรายงานได้');
    }
  };

  const fetchAnalytics = async () => {
    try {
      setError(null);
      const analyticsRes = await costAPI.getProfitAnalytics(analyticsDays);
      setAnalytics(analyticsRes || null);
    } catch (error) {
      console.error('Error fetching analytics:', error);
      setError('ไม่สามารถโหลดข้อมูลการวิเคราะห์ได้');
      setAnalytics(null);
    }
  };

  const getProfitColor = (margin: number) => {
    if (margin >= 50) return 'text-green-600';
    if (margin >= 30) return 'text-[var(--coffee-brown)]';
    return 'text-red-600';
  };

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <Calculator className="w-12 h-12 text-[var(--coffee-brown)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลดข้อมูลต้นทุน...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen coffee-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 card p-4 border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <svg className="h-5 w-5 text-red-500" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
              </div>
              <div className="ml-3 flex-1">
                <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
              </div>
              <button
                onClick={() => {
                  setError(null);
                  fetchInitialData();
                }}
                className="ml-3 text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-medium"
              >
                ลองอีกครั้ง
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BackButton className="mr-4" />
              <div className="flex items-center">
                <Calculator className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">บัญชีต้นทุนและกำไร</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>
        {/* Tab Navigation */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-2 bg-[var(--coffee-soft)] p-2 rounded-lg">
            {[
              { key: 'overview', label: 'ภาพรวม', icon: BarChart3 },
              { key: 'products', label: 'ต้นทุนสินค้า', icon: Package },
              { key: 'reports', label: 'รายงานรายวัน', icon: Calendar },
              { key: 'analytics', label: 'การวิเคราะห์', icon: TrendingUp },
            ].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSelectedTab(key as any)}
                className={`btn flex items-center gap-2 ${
                  selectedTab === key
                    ? 'btn-primary'
                    : 'btn-secondary'
                }`}
              >
                <Icon className="h-4 w-4" />
                {label}
              </button>
            ))}
          </div>
        </div>

      {/* Overview Tab */}
      {selectedTab === 'overview' && dailyReport && (
        <div className="space-y-6">
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-green-600" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">รายได้วันนี้</p>
                  <p className="text-2xl font-bold text-[var(--coffee-dark)]">
                    ฿{dailyReport.total_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">ต้นทุนวันนี้</p>
                  <p className="text-2xl font-bold text-[var(--coffee-dark)]">
                    ฿{dailyReport.total_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className={`h-8 w-8 ${getProfitColor(dailyReport.profit_margin)}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">กำไรขั้นต้น</p>
                  <p className="text-2xl font-bold text-[var(--coffee-dark)]">
                    ฿{dailyReport.gross_profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className={`h-8 w-8 ${getProfitColor(dailyReport.profit_margin)}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">อัตรากำไร</p>
                  <p className={`text-2xl font-bold ${getProfitColor(dailyReport.profit_margin)}`}>
                    {dailyReport.profit_margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">สถิติการขายวันนี้</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-[var(--coffee-medium)]">จำนวนออเดอร์:</span>
                  <span className="font-semibold text-[var(--coffee-dark)]">
                    {dailyReport.total_orders.toLocaleString()} ออเดอร์
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--coffee-medium)]">จำนวนสินค้า:</span>
                  <span className="font-semibold text-[var(--coffee-dark)]">
                    {dailyReport.total_items.toLocaleString()} ชิ้น
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[var(--coffee-medium)]">ยอดเฉลี่ยต่อออเดอร์:</span>
                  <span className="font-semibold text-[var(--coffee-dark)]">
                    ฿{dailyReport.average_order_value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">สินค้าขายดี</h3>
              <div className="space-y-2">
                {dailyReport?.top_selling_products && dailyReport.top_selling_products.length > 0 ? (
                  dailyReport.top_selling_products.slice(0, 5).map((product, index) => (
                    <div key={`${product}-${index}`} className="flex justify-between items-center py-2">
                      <div className="flex items-center">
                        <span className="w-6 h-6 bg-[var(--coffee-soft)] text-[var(--coffee-brown)] rounded-full flex items-center justify-center text-sm font-medium mr-3">
                          {index + 1}
                        </span>
                        <span className="text-[var(--coffee-dark)]">{product.split(' (')[0]}</span>
                      </div>
                      <span className="text-[var(--coffee-medium)]">
                        {product.split('(')[1]?.replace(')', '') || ''}
                      </span>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8">
                    <Package className="h-12 w-12 text-[var(--coffee-medium)] mx-auto mb-2" />
                    <p className="text-[var(--coffee-medium)]">ยังไม่มีข้อมูลสินค้าขายดี</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {selectedTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">จัดการต้นทุนสินค้า</h2>
            <button
              onClick={fetchInitialData}
              className="btn btn-primary"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </button>
          </div>

          <div className="grid gap-4">
            {products && products.length > 0 ? products.map((product) => {
              const cost = productCosts.find(c => c.product_id === product.id);
              const profit = product.price - (cost?.cost_per_unit || 0);
              const margin = product.price > 0 ? ((profit / product.price) * 100) : 0;
              const isExpanded = expandedProduct === product.id;

              return (
                <div
                  key={product.id}
                  className="card"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-[var(--coffee-dark)]">{product.name}</h3>
                        <p className="text-sm text-[var(--coffee-medium)]">{product.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                          className="p-2 text-[var(--coffee-medium)] hover:text-[var(--coffee-brown)]"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">ราคาขาย</div>
                        <p className="text-xl font-bold text-green-600">
                          ฿{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">ต้นทุน</div>
                        <p className="text-xl font-bold text-red-600">
                          ฿{(cost?.cost_per_unit || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">กำไรต่อหน่วย</div>
                        <p className={`text-xl font-bold ${getProfitColor(margin)}`}>
                          ฿{profit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">อัตรากำไร</div>
                        <p className={`text-xl font-bold ${getProfitColor(margin)}`}>
                          {margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {isExpanded && cost && (
                      <div className="border-t border-[var(--coffee-border)] pt-4">
                        <h4 className="font-medium text-[var(--coffee-dark)] mb-3">รายละเอียดต้นทุน</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">วัตถุดิบ</div>
                            <p className="text-lg font-semibold text-[var(--coffee-dark)]">
                              ฿{(cost.raw_material_cost || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">แรงงาน</div>
                            <p className="text-lg font-semibold text-[var(--coffee-dark)]">
                              ฿{(cost.labor_cost || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">ค่าใช้จ่ายทั่วไป</div>
                            <p className="text-lg font-semibold text-[var(--coffee-dark)]">
                              ฿{(cost.overhead_cost || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {cost.notes && (
                          <div className="mt-3">
                            <div className="text-sm font-medium text-[var(--coffee-medium)] mb-1">หมายเหตุ</div>
                            <p className="text-sm text-[var(--coffee-dark)]">{cost.notes}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            }) : (
              <div className="card p-8 text-center">
                <Package className="h-12 w-12 mx-auto mb-4 text-[var(--coffee-medium)]" />
                <p className="text-[var(--coffee-medium)]">ไม่มีข้อมูลสินค้า</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">รายงานกำไรขาดทุน</h2>
            <div className="flex items-center space-x-4">
              <div>
                <div className="block text-sm font-medium text-[var(--coffee-medium)] mb-1">
                  เลือกวันที่
                </div>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="cute-input"
                />
              </div>
            </div>
          </div>

          {dailyReport && (
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">
                รายงานประจำวันที่ {new Date(dailyReport.report_date).toLocaleDateString('th-TH')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="p-4 rounded-lg bg-[var(--coffee-soft)]">
                  <h4 className="font-medium text-[var(--coffee-dark)]">รายได้รวม</h4>
                  <p className="text-2xl font-bold text-green-600">
                    ฿{dailyReport.total_revenue.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--coffee-soft)]">
                  <h4 className="font-medium text-[var(--coffee-dark)}">ต้นทุนรวม</h4>
                  <p className="text-2xl font-bold text-red-600">
                    ฿{dailyReport.total_cost.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 rounded-lg bg-[var(--coffee-soft)]">
                  <h4 className="font-medium text-[var(--coffee-dark)]">กำไรขั้นต้น</h4>
                  <p className={`text-2xl font-bold ${getProfitColor(dailyReport.profit_margin)}`}>
                    ฿{dailyReport.gross_profit.toLocaleString()} ({dailyReport.profit_margin.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {productReports && productReports.length > 0 && (
            <div className="card">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">กำไรต่อสินค้า</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-[var(--coffee-border)]">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          สินค้า
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          จำนวนขาย
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          รายได้
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          ต้นทุน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          กำไร
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                          อัตรากำไร
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--coffee-border)]">
                      {productReports && productReports.length > 0 ? productReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--coffee-dark)]">
                            {report.product?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--coffee-medium)]">
                            {report.quantity_sold.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">
                            ฿{report.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-semibold">
                            ฿{report.total_cost.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(report.profit_margin)}`}>
                            ฿{report.gross_profit.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(report.profit_margin)}`}>
                            {report.profit_margin.toFixed(1)}%
                          </td>
                        </tr>
                      )) : (
                        <tr>
                          <td colSpan={6} className="px-6 py-8 text-center text-[var(--coffee-medium)]">
                            ไม่มีข้อมูลรายงานสินค้า
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Analytics Tab */}
      {selectedTab === 'analytics' && analytics && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">การวิเคราะห์กำไร</h2>
            <div className="flex items-center space-x-4">
              <div>
                <div className="block text-sm font-medium text-[var(--coffee-medium)] mb-1">
                  ช่วงเวลา (วัน)
                </div>
                <select
                  value={analyticsDays}
                  onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                  className="cute-input"
                >
                  <option value={7}>7 วันล่าสุด</option>
                  <option value={14}>14 วันล่าสุด</option>
                  <option value={30}>30 วันล่าสุด</option>
                  <option value={90}>90 วันล่าสุด</option>
                </select>
              </div>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
            <div className="card p-6">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">รายได้รวม</p>
                  <p className="text-xl font-bold text-[var(--coffee-dark)]">
                    ฿{analytics.summary.total_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">ต้นทุนรวม</p>
                  <p className="text-xl font-bold text-[var(--coffee-dark)]">
                    ฿{analytics.summary.total_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <TrendingUp className={`h-8 w-8 ${getProfitColor(analytics.summary.average_margin)}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">กำไรรวม</p>
                  <p className="text-xl font-bold text-[var(--coffee-dark)]">
                    ฿{analytics.summary.total_profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">ออเดอร์รวม</p>
                  <p className="text-xl font-bold text-[var(--coffee-dark)]">
                    {analytics.summary.total_orders.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="card p-6">
              <div className="flex items-center">
                <Target className={`h-8 w-8 ${getProfitColor(analytics.summary.average_margin)}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-[var(--coffee-medium)]">อัตรากำไรเฉลี่ย</p>
                  <p className={`text-xl font-bold ${getProfitColor(analytics.summary.average_margin)}`}>
                    {analytics.summary.average_margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Profitable Products */}
          <div className="card">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-[var(--coffee-dark)] mb-4">สินค้าที่ทำกำไรสูงสุด</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-[var(--coffee-border)]">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        อันดับ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        สินค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        กำไรรวม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        จำนวนขาย
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        กำไรต่อหน่วย
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-[var(--coffee-medium)] uppercase tracking-wider">
                        อัตรากำไร
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--coffee-border)]">
                    {analytics?.top_profitable_products && analytics.top_profitable_products.length > 0 ? analytics.top_profitable_products.map((product, index) => {
                      const getRankBadgeStyle = () => {
                        if (index === 0) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
                        if (index === 1) return 'bg-[var(--coffee-soft)] text-[var(--coffee-dark)]';
                        if (index === 2) return 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400';
                        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
                      };
                      
                      return (
                        <tr key={`${product.product_name}-${index}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${getRankBadgeStyle()}`}>
                              {index + 1}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--coffee-dark)]">
                            {product.product_name}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                            ฿{product.total_profit.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--coffee-medium)]">
                            {product.quantity_sold.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                            ฿{product.profit_per_unit.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                            {product.profit_margin.toFixed(1)}%
                          </td>
                        </tr>
                      );
                    }) : (
                      <tr>
                        <td colSpan={6} className="px-6 py-8 text-center text-[var(--coffee-medium)]">
                          ไม่มีข้อมูลสินค้าที่ทำกำไร
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      )}
      </div>
    </div>
  );
};

export default CostManagementPage;
