'use client';

import { useState, useEffect } from 'react';
import { X, Phone, Mail, Calendar, Star, Award, Trophy, Crown, Plus, Minus, History } from 'lucide-react';
import { loyaltyAPI } from '@/lib/api';
import { Member, PointHistory } from '@/lib/types';

interface MemberDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  member: Member | null;
  onUpdate: () => void;
}

const MemberDetailModal: React.FC<MemberDetailModalProps> = ({ 
  isOpen, 
  onClose, 
  member, 
  onUpdate 
}) => {
  const [pointHistory, setPointHistory] = useState<PointHistory[]>([]);
  const [loading, setLoading] = useState(false);
  const [showAddPoints, setShowAddPoints] = useState(false);
  const [pointAmount, setPointAmount] = useState('');
  const [pointReason, setPointReason] = useState('');

  useEffect(() => {
    if (isOpen && member) {
      fetchPointHistory();
    }
  }, [isOpen, member]);

  const fetchPointHistory = async () => {
    if (!member) return;
    
    try {
      setLoading(true);
      const history = await loyaltyAPI.getPointHistory(member.id);
      setPointHistory(history);
    } catch (error) {
      console.error('Error fetching point history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleEarnPoints = async () => {
    if (!member || !pointAmount) return;

    try {
      await loyaltyAPI.earnPoints(member.id, {
        amount: parseFloat(pointAmount),
        reason: pointReason || 'Manual adjustment',
        order_id: null,
      });
      
      setPointAmount('');
      setPointReason('');
      setShowAddPoints(false);
      onUpdate();
      fetchPointHistory();
    } catch (error) {
      console.error('Error earning points:', error);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return <Award className="h-6 w-6 text-amber-600" />;
      case 'SILVER':
        return <Star className="h-6 w-6 text-gray-500" />;
      case 'GOLD':
        return <Trophy className="h-6 w-6 text-yellow-500" />;
      case 'PLATINUM':
        return <Crown className="h-6 w-6 text-purple-500" />;
      default:
        return <Award className="h-6 w-6 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900 dark:text-amber-200';
      case 'SILVER':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  const getPointTypeColor = (type: string) => {
    switch (type) {
      case 'EARN':
        return 'text-green-600 dark:text-green-400';
      case 'REDEEM':
        return 'text-red-600 dark:text-red-400';
      case 'EXPIRE':
        return 'text-gray-600 dark:text-gray-400';
      case 'BONUS':
        return 'text-blue-600 dark:text-blue-400';
      case 'ADJUST':
        return 'text-orange-600 dark:text-orange-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getPointTypeSign = (type: string) => {
    return ['REDEEM', 'EXPIRE'].includes(type) ? '-' : '+';
  };

  if (!isOpen || !member) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-4xl mx-4 max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              {getTierIcon(member.tier)}
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {member.name}
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {member.member_number}
              </p>
            </div>
            <span
              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                member.tier
              )}`}
            >
              {member.tier}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <div className="flex flex-col lg:flex-row h-full">
          {/* Member Info */}
          <div className="lg:w-1/3 p-6 border-r border-gray-200 dark:border-gray-700">
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนที่ใช้ได้</label>
                  <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                    {member.available_points.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนรวม</label>
                  <p className="text-xl font-semibold text-gray-900 dark:text-white">
                    {member.total_points.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">ยอดใช้จ่าย</label>
                  <p className="text-lg font-semibold text-green-600 dark:text-green-400">
                    ฿{member.total_spent.toLocaleString()}
                  </p>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">จำนวนออเดอร์</label>
                  <p className="text-lg font-semibold text-gray-900 dark:text-white">
                    {member.total_orders.toLocaleString()}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {member.phone && (
                  <div className="flex items-center space-x-2">
                    <Phone className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.phone}</span>
                  </div>
                )}
                {member.email && (
                  <div className="flex items-center space-x-2">
                    <Mail className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">{member.email}</span>
                  </div>
                )}
                {member.birth_date && (
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {new Date(member.birth_date).toLocaleDateString('th-TH')}
                    </span>
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-gray-200 dark:border-gray-600">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">จัดการคะแนน</span>
                </div>
                <div className="space-y-2">
                  <button
                    onClick={() => setShowAddPoints(true)}
                    className="w-full inline-flex items-center justify-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    เพิ่มคะแนน
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Point History */}
          <div className="lg:w-2/3 p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
                <History className="h-5 w-5 mr-2" />
                ประวัติการใช้คะแนน
              </h3>
            </div>

            <div className="space-y-3 max-h-96 overflow-y-auto">
              {loading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                </div>
              ) : pointHistory.length > 0 ? (
                pointHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          {history.reason}
                        </span>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-medium ${
                            history.type === 'EARN' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                            history.type === 'REDEEM' ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' :
                            history.type === 'BONUS' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                            'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200'
                          }`}
                        >
                          {history.type}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {new Date(history.created_at).toLocaleString('th-TH')}
                      </p>
                    </div>
                    <div className="text-right">
                      <span className={`text-lg font-bold ${getPointTypeColor(history.type)}`}>
                        {getPointTypeSign(history.type)}{Math.abs(history.points).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <History className="mx-auto h-12 w-12 text-gray-400" />
                  <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่มีประวัติ</h3>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    ยังไม่มีการใช้คะแนน
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Add Points Modal */}
        {showAddPoints && (
          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md mx-4">
              <div className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">เพิ่มคะแนน</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      จำนวนคะแนน
                    </label>
                    <input
                      type="number"
                      value={pointAmount}
                      onChange={(e) => setPointAmount(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="กรอกจำนวนคะแนน"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      เหตุผล
                    </label>
                    <input
                      type="text"
                      value={pointReason}
                      onChange={(e) => setPointReason(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
                      placeholder="เหตุผลในการเพิ่มคะแนน"
                    />
                  </div>
                </div>
                <div className="flex justify-end space-x-3 mt-6">
                  <button
                    onClick={() => {
                      setShowAddPoints(false);
                      setPointAmount('');
                      setPointReason('');
                    }}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handleEarnPoints}
                    disabled={!pointAmount}
                    className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    เพิ่มคะแนน
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

export default MemberDetailModal;
