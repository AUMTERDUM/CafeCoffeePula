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
  PieChart,
  Calendar,
  Package,
  Target,
  RefreshCw,
  Edit,
  Eye,
  ChevronDown,
  ChevronUp
} from 'lucide-react';

const CostManagementPage: React.FC = () => {
  const [selectedTab, setSelectedTab] = useState<'overview' | 'products' | 'reports' | 'analytics'>('overview');
  const [loading, setLoading] = useState(true);
  
  // Data states
  const [productCosts, setProductCosts] = useState<ProductCost[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [dailyReport, setDailyReport] = useState<DailyProfitReport | null>(null);
  const [productReports, setProductReports] = useState<ProductProfitReport[]>([]);
  const [analytics, setAnalytics] = useState<ProfitAnalytics | null>(null);
  
  // UI states
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [analyticsDays, setAnalyticsDays] = useState(7);
  const [editingCost, setEditingCost] = useState<string | null>(null);
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
      const [costsRes, productsRes, dailyRes] = await Promise.all([
        costAPI.getProductCosts(),
        menuAPI.getMenu(),
        costAPI.getDailyProfitReport(),
      ]);

      setProductCosts(costsRes);
      setProducts(productsRes);
      setDailyReport(dailyRes);
    } catch (error) {
      console.error('Error fetching initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchReports = async () => {
    try {
      const [dailyRes, productRes] = await Promise.all([
        costAPI.getDailyProfitReport(selectedDate),
        costAPI.getProductProfitReport(selectedDate),
      ]);

      setDailyReport(dailyRes);
      setProductReports(productRes);
    } catch (error) {
      console.error('Error fetching reports:', error);
    }
  };

  const fetchAnalytics = async () => {
    try {
      const analyticsRes = await costAPI.getProfitAnalytics(analyticsDays);
      setAnalytics(analyticsRes);
    } catch (error) {
      console.error('Error fetching analytics:', error);
    }
  };

  const updateProductCost = async (productId: string, costData: any) => {
    try {
      await costAPI.updateProductCost(productId, costData);
      await fetchInitialData();
      setEditingCost(null);
    } catch (error) {
      console.error('Error updating product cost:', error);
    }
  };

  const getProfitColor = (margin: number) => {
    if (margin >= 50) return 'text-success';
    if (margin >= 30) return 'text-warning';
    return 'text-error';
  };

  const getProfitBgColor = (margin: number) => {
    if (margin >= 50) return 'bg-success';
    if (margin >= 30) return 'bg-warning';
    return 'bg-error';
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className="h-8 w-8 text-[var(--success)]" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">รายได้วันนี้</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ฿{dailyReport.total_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingDown className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ต้นทุนวันนี้</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ฿{dailyReport.total_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <TrendingUp className={`h-8 w-8 ${getProfitColor(dailyReport.profit_margin)}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">กำไรขั้นต้น</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    ฿{dailyReport.gross_profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Target className={`h-8 w-8 ${getProfitColor(dailyReport.profit_margin)}`} />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">อัตรากำไร</p>
                  <p className={`text-2xl font-bold ${getProfitColor(dailyReport.profit_margin)}`}>
                    {dailyReport.profit_margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Daily Statistics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">สถิติการขายวันนี้</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">จำนวนออเดอร์:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dailyReport.total_orders.toLocaleString()} ออเดอร์
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">จำนวนสินค้า:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    {dailyReport.total_items.toLocaleString()} ชิ้น
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-600 dark:text-gray-400">ยอดเฉลี่ยต่อออเดอร์:</span>
                  <span className="font-semibold text-gray-900 dark:text-white">
                    ฿{dailyReport.average_order_value.toLocaleString()}
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">สินค้าขายดี</h3>
              <div className="space-y-2">
                {dailyReport.top_selling_products.slice(0, 5).map((product, index) => (
                  <div key={index} className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400 rounded-full flex items-center justify-center text-sm font-medium mr-3">
                        {index + 1}
                      </span>
                      <span className="text-gray-900 dark:text-white">{product.split(' (')[0]}</span>
                    </div>
                    <span className="text-gray-600 dark:text-gray-400">
                      {product.split('(')[1]?.replace(')', '') || ''}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Products Tab */}
      {selectedTab === 'products' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">จัดการต้นทุนสินค้า</h2>
            <button
              onClick={fetchInitialData}
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              รีเฟรช
            </button>
          </div>

          <div className="grid gap-4">
            {products.map((product) => {
              const cost = productCosts.find(c => c.product_id === product.id);
              const profit = product.price - (cost?.cost_per_unit || 0);
              const margin = product.price > 0 ? ((profit / product.price) * 100) : 0;
              const isExpanded = expandedProduct === product.id;

              return (
                <div
                  key={product.id}
                  className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700"
                >
                  <div className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{product.name}</h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{product.description}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setExpandedProduct(isExpanded ? null : product.id)}
                          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                        >
                          {isExpanded ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ราคาขาย</label>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          ฿{product.price.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ต้นทุน</label>
                        <p className="text-xl font-bold text-red-600 dark:text-red-400">
                          ฿{(cost?.cost_per_unit || 0).toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">กำไรต่อหน่วย</label>
                        <p className={`text-xl font-bold ${getProfitColor(margin)}`}>
                          ฿{profit.toLocaleString()}
                        </p>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-500 dark:text-gray-400">อัตรากำไร</label>
                        <p className={`text-xl font-bold ${getProfitColor(margin)}`}>
                          {margin.toFixed(1)}%
                        </p>
                      </div>
                    </div>

                    {isExpanded && cost && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <h4 className="font-medium text-gray-900 dark:text-white mb-3">รายละเอียดต้นทุน</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">วัตถุดิบ</label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              ฿{(cost.raw_material_cost || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">แรงงาน</label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              ฿{(cost.labor_cost || 0).toLocaleString()}
                            </p>
                          </div>
                          <div>
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ค่าใช้จ่ายทั่วไป</label>
                            <p className="text-lg font-semibold text-gray-900 dark:text-white">
                              ฿{(cost.overhead_cost || 0).toLocaleString()}
                            </p>
                          </div>
                        </div>
                        {cost.notes && (
                          <div className="mt-3">
                            <label className="text-sm font-medium text-gray-500 dark:text-gray-400">หมายเหตุ</label>
                            <p className="text-sm text-gray-600 dark:text-gray-300">{cost.notes}</p>
                          </div>
                        )}
                      </div>
                    )}

                    <div className="flex justify-end mt-4">
                      <button
                        onClick={() => setEditingCost(product.id)}
                        className="inline-flex items-center px-3 py-2 border border-gray-300 dark:border-gray-600 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500"
                      >
                        <Edit className="h-4 w-4 mr-2" />
                        แก้ไขต้นทุน
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Reports Tab */}
      {selectedTab === 'reports' && (
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">รายงานกำไรขาดทุน</h2>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  เลือกวันที่
                </label>
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => setSelectedDate(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>

          {dailyReport && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                รายงานประจำวันที่ {new Date(dailyReport.report_date).toLocaleDateString('th-TH')}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className={`p-4 rounded-lg ${getProfitBgColor(dailyReport.profit_margin)}`}>
                  <h4 className="font-medium text-gray-900 dark:text-white">รายได้รวม</h4>
                  <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                    ฿{dailyReport.total_revenue.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${getProfitBgColor(dailyReport.profit_margin)}`}>
                  <h4 className="font-medium text-gray-900 dark:text-white">ต้นทุนรวม</h4>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                    ฿{dailyReport.total_cost.toLocaleString()}
                  </p>
                </div>
                <div className={`p-4 rounded-lg ${getProfitBgColor(dailyReport.profit_margin)}`}>
                  <h4 className="font-medium text-gray-900 dark:text-white">กำไรขั้นต้น</h4>
                  <p className={`text-2xl font-bold ${getProfitColor(dailyReport.profit_margin)}`}>
                    ฿{dailyReport.gross_profit.toLocaleString()} ({dailyReport.profit_margin.toFixed(1)}%)
                  </p>
                </div>
              </div>
            </div>
          )}

          {productReports.length > 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">กำไรต่อสินค้า</h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                    <thead>
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          สินค้า
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          จำนวนขาย
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          รายได้
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          ต้นทุน
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          กำไร
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          อัตรากำไร
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                      {productReports.map((report) => (
                        <tr key={report.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                            {report.product?.name || 'N/A'}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                            {report.quantity_sold.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 dark:text-green-400 font-semibold">
                            ฿{report.revenue.toLocaleString()}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 dark:text-red-400 font-semibold">
                            ฿{report.total_cost.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(report.profit_margin)}`}>
                            ฿{report.gross_profit.toLocaleString()}
                          </td>
                          <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(report.profit_margin)}`}>
                            {report.profit_margin.toFixed(1)}%
                          </td>
                        </tr>
                      ))}
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
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">การวิเคราะห์กำไร</h2>
            <div className="flex items-center space-x-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  ช่วงเวลา (วัน)
                </label>
                <select
                  value={analyticsDays}
                  onChange={(e) => setAnalyticsDays(Number(e.target.value))}
                  className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
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
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Target className="h-8 w-8 text-[var(--success)]" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">รายได้รวม</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ฿{analytics.summary.total_revenue.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingDown className="h-8 w-8 text-red-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ต้นทุนรวม</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ฿{analytics.summary.total_cost.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <TrendingUp className={`h-8 w-8 ${getProfitColor(analytics.summary.average_margin)}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">กำไรรวม</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    ฿{analytics.summary.total_profit.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <BarChart3 className="h-8 w-8 text-blue-500" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">ออเดอร์รวม</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white">
                    {analytics.summary.total_orders.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <Target className={`h-8 w-8 ${getProfitColor(analytics.summary.average_margin)}`} />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">อัตรากำไรเฉลี่ย</p>
                  <p className={`text-xl font-bold ${getProfitColor(analytics.summary.average_margin)}`}>
                    {analytics.summary.average_margin.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Top Profitable Products */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">สินค้าที่ทำกำไรสูงสุด</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        อันดับ
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        สินค้า
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        กำไรรวม
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        จำนวนขาย
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        กำไรต่อหน่วย
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                        อัตรากำไร
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {analytics.top_profitable_products.map((product, index) => (
                      <tr key={index}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-sm font-medium ${
                            index === 0 ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400' :
                            index === 1 ? 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300' :
                            index === 2 ? 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400' :
                            'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400'
                          }`}>
                            {index + 1}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {product.product_name}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                          ฿{product.total_profit.toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-400">
                          {product.quantity_sold.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                          ฿{product.profit_per_unit.toLocaleString()}
                        </td>
                        <td className={`px-6 py-4 whitespace-nowrap text-sm font-semibold ${getProfitColor(product.profit_margin)}`}>
                          {product.profit_margin.toFixed(1)}%
                        </td>
                      </tr>
                    ))}
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
