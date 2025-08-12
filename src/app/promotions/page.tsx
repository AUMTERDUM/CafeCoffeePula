'use client';

import { useState, useEffect } from 'react';
import { Tag, Gift, Clock, Percent, DollarSign, Calendar, Users } from 'lucide-react';
import DarkModeToggle from '@/components/DarkModeToggle';
import BackButton from '@/components/BackButton';
import { promotionAPI, couponAPI } from '@/lib/api';

interface Promotion {
  id: string;
  name: string;
  description?: string;
  type: 'DISCOUNT' | 'FIXED_AMOUNT' | 'BUY_X_GET_Y' | 'HAPPY_HOUR' | 'MIN_SPEND';
  status: 'ACTIVE' | 'INACTIVE' | 'EXPIRED';
  discount_percent?: number;
  discount_amount?: number;
  max_discount?: number;
  min_spend?: number;
  start_time?: string;
  end_time?: string;
  buy_quantity?: number;
  get_quantity?: number;
  start_date?: string;
  end_date?: string;
  usage_limit?: number;
  usage_count: number;
  per_customer?: number;
  code?: string;
}

interface Coupon {
  id: string;
  code: string;
  name: string;
  description?: string;
  promotion_id: string;
  promotion: Promotion;
  is_used: boolean;
  used_at?: string;
  used_by?: string;
  order_id?: string;
}

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<Promotion[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [activeTab, setActiveTab] = useState<'promotions' | 'coupons'>('promotions');
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedPromotion, setSelectedPromotion] = useState<Promotion | null>(null);

  useEffect(() => {
    fetchPromotions();
    fetchCoupons();
  }, []);

  const fetchPromotions = async () => {
    try {
      const data = await promotionAPI.getPromotions();
      setPromotions(data);
    } catch (error) {
      console.error('Error fetching promotions:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCoupons = async () => {
    try {
      const data = await couponAPI.getCoupons();
      setCoupons(data);
    } catch (error) {
      console.error('Error fetching coupons:', error);
    }
  };

  const getPromotionTypeText = (type: string) => {
    switch (type) {
      case 'DISCOUNT': return 'ส่วนลด %';
      case 'FIXED_AMOUNT': return 'ลดเงินสด';
      case 'BUY_X_GET_Y': return 'ซื้อ X ได้ Y';
      case 'HAPPY_HOUR': return 'Happy Hour';
      case 'MIN_SPEND': return 'ซื้อครบ xx บาท';
      default: return type;
    }
  };

  const getPromotionIcon = (type: string) => {
    switch (type) {
      case 'DISCOUNT':
      case 'MIN_SPEND':
        return <Percent className="w-5 h-5" />;
      case 'FIXED_AMOUNT':
        return <DollarSign className="w-5 h-5" />;
      case 'BUY_X_GET_Y':
        return <Gift className="w-5 h-5" />;
      case 'HAPPY_HOUR':
        return <Clock className="w-5 h-5" />;
      default:
        return <Tag className="w-5 h-5" />;
    }
  };

  const formatPromotionValue = (promotion: Promotion) => {
    switch (promotion.type) {
      case 'DISCOUNT':
        return `${promotion.discount_percent}%`;
      case 'FIXED_AMOUNT':
        return `฿${promotion.discount_amount}`;
      case 'BUY_X_GET_Y':
        return `ซื้อ ${promotion.buy_quantity} ได้ ${promotion.get_quantity}`;
      case 'HAPPY_HOUR':
        return `${promotion.start_time}-${promotion.end_time} (${promotion.discount_percent}%)`;
      case 'MIN_SPEND':
        return `ซื้อครบ ฿${promotion.min_spend} ลด ${promotion.discount_percent}%`;
      default:
        return '';
    }
  };

  const isPromotionActive = (promotion: Promotion) => {
    if (promotion.status !== 'ACTIVE') return false;
    
    const now = new Date();
    if (promotion.end_date && new Date(promotion.end_date) < now) return false;
    
    // Check Happy Hour
    if (promotion.type === 'HAPPY_HOUR' && promotion.start_time && promotion.end_time) {
      const currentTime = now.getHours() * 100 + now.getMinutes();
      const startTime = parseInt(promotion.start_time.replace(':', ''));
      const endTime = parseInt(promotion.end_time.replace(':', ''));
      
      if (currentTime < startTime || currentTime > endTime) return false;
    }
    
    return true;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[var(--coffee-cream)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--coffee-brown)] mx-auto"></div>
          <p className="mt-4 text-[var(--coffee-medium)]">กำลังโหลด...</p>
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
                <Tag className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">ระบบโปรโมชั่น / ส่วนลด</h1>
              </div>
            </div>
            <DarkModeToggle />
          </div>
          <div className="w-24 h-1 bg-[var(--coffee-brown)] rounded-full"></div>
        </div>
        {/* Tabs */}
        <div className="mb-6">
          <div className="flex space-x-1 bg-white rounded-lg p-1 shadow-sm">
            <button
              onClick={() => setActiveTab('promotions')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'promotions'
                  ? 'bg-[var(--coffee-brown)] text-white'
                  : 'text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
              }`}
            >
              <Tag className="w-5 h-5 inline mr-2" />
              โปรโมชั่น ({promotions.length})
            </button>
            <button
              onClick={() => setActiveTab('coupons')}
              className={`flex-1 px-4 py-2 rounded-md font-medium transition-all ${
                activeTab === 'coupons'
                  ? 'bg-[var(--coffee-brown)] text-white'
                  : 'text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
              }`}
            >
              <Gift className="w-5 h-5 inline mr-2" />
              คูปองส่วนลด ({coupons.length})
            </button>
          </div>
        </div>

        {/* Promotions Tab */}
        {activeTab === 'promotions' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)]">รายการโปรโมชั่น</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Tag className="w-5 h-5 mr-2" />
                สร้างโปรโมชั่น
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {promotions.map((promotion) => (
                <div key={promotion.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center">
                      <div className={`p-2 rounded-lg mr-3 ${
                        isPromotionActive(promotion) ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {getPromotionIcon(promotion.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-[var(--coffee-dark)]">{promotion.name}</h3>
                        <p className="text-sm text-[var(--coffee-medium)]">{getPromotionTypeText(promotion.type)}</p>
                      </div>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      isPromotionActive(promotion)
                        ? 'bg-green-100 text-green-800'
                        : promotion.status === 'EXPIRED'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {isPromotionActive(promotion) ? 'ใช้งานได้' : promotion.status === 'EXPIRED' ? 'หมดอายุ' : 'ไม่ใช้งาน'}
                    </span>
                  </div>

                  <div className="space-y-3">
                    <div className="text-2xl font-bold text-[var(--coffee-brown)]">
                      {formatPromotionValue(promotion)}
                    </div>

                    {promotion.description && (
                      <p className="text-sm text-[var(--coffee-medium)]">{promotion.description}</p>
                    )}

                    {promotion.min_spend && (
                      <div className="flex items-center text-sm text-[var(--coffee-medium)]">
                        <DollarSign className="w-4 h-4 mr-1" />
                        ยอดขั้นต่ำ ฿{promotion.min_spend}
                      </div>
                    )}

                    {(promotion.start_date || promotion.end_date) && (
                      <div className="flex items-center text-sm text-[var(--coffee-medium)]">
                        <Calendar className="w-4 h-4 mr-1" />
                        {promotion.start_date && new Date(promotion.start_date).toLocaleDateString('th-TH')}
                        {promotion.start_date && promotion.end_date && ' - '}
                        {promotion.end_date && new Date(promotion.end_date).toLocaleDateString('th-TH')}
                      </div>
                    )}

                    {promotion.usage_limit && (
                      <div className="flex items-center text-sm text-[var(--coffee-medium)]">
                        <Users className="w-4 h-4 mr-1" />
                        ใช้แล้ว {promotion.usage_count}/{promotion.usage_limit} ครั้ง
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-[var(--coffee-light)] flex justify-end space-x-2">
                    <button
                      onClick={() => setSelectedPromotion(promotion)}
                      className="text-sm text-[var(--coffee-brown)] hover:underline"
                    >
                      แก้ไข
                    </button>
                    <button className="text-sm text-red-600 hover:underline">
                      ลบ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Coupons Tab */}
        {activeTab === 'coupons' && (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-[var(--coffee-dark)]">คูปองส่วนลด</h2>
              <button
                onClick={() => setShowCreateModal(true)}
                className="btn-primary"
              >
                <Gift className="w-5 h-5 mr-2" />
                สร้างคูปอง
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coupons.map((coupon) => (
                <div key={coupon.id} className="card p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-[var(--coffee-dark)]">{coupon.name}</h3>
                      <p className="text-sm text-[var(--coffee-medium)]">รหัส: {coupon.code}</p>
                    </div>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                      !coupon.is_used
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {!coupon.is_used ? 'ยังไม่ใช้' : 'ใช้แล้ว'}
                    </span>
                  </div>

                  {coupon.description && (
                    <p className="text-sm text-[var(--coffee-medium)] mb-3">{coupon.description}</p>
                  )}

                  <div className="text-lg font-bold text-[var(--coffee-brown)] mb-3">
                    {formatPromotionValue(coupon.promotion)}
                  </div>

                  {coupon.is_used && coupon.used_at && (
                    <div className="text-xs text-[var(--coffee-medium)]">
                      ใช้เมื่อ: {new Date(coupon.used_at).toLocaleString('th-TH')}
                      {coupon.used_by && <br />}
                      {coupon.used_by && `โดย: ${coupon.used_by}`}
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-[var(--coffee-light)] flex justify-end space-x-2">
                    <button className="text-sm text-[var(--coffee-brown)] hover:underline">
                      คัดลอกรหัส
                    </button>
                    {!coupon.is_used && (
                      <button className="text-sm text-red-600 hover:underline">
                        ลบ
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
