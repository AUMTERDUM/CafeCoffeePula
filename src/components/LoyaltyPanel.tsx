'use client';

import { useState, useEffect } from 'react';
import { Users, Phone, Search, Star, Award, Trophy, Crown, Plus } from 'lucide-react';
import { loyaltyAPI } from '@/lib/api';
import { Member } from '@/lib/types';

interface LoyaltyPanelProps {
  onMemberSelect: (member: Member | null) => void;
  selectedMember: Member | null;
  cartTotal: number;
}

const LoyaltyPanel: React.FC<LoyaltyPanelProps> = ({ 
  onMemberSelect, 
  selectedMember, 
  cartTotal
}) => {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [loading, setLoading] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  const searchMember = async () => {
    if (!phoneNumber.trim()) return;

    try {
      setLoading(true);
      const members = await loyaltyAPI.getMembers({ search: phoneNumber });
      setSearchResults(members);
      setShowSearch(true);
    } catch (error) {
      console.error('Error searching members:', error);
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMemberSelect = (member: Member) => {
    onMemberSelect(member);
    setShowSearch(false);
    setPhoneNumber('');
    setSearchResults([]);
  };

  const calculatePointsToEarn = () => {
    // คำนวณคะแนนที่จะได้รับ (100 บาท = 1 แต้ม)
    return Math.floor(cartTotal / 100);
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return <Award className="h-4 w-4 text-amber-600" />;
      case 'SILVER':
        return <Star className="h-4 w-4 text-gray-500" />;
      case 'GOLD':
        return <Trophy className="h-4 w-4 text-yellow-500" />;
      case 'PLATINUM':
        return <Crown className="h-4 w-4 text-purple-500" />;
      default:
        return <Award className="h-4 w-4 text-gray-400" />;
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

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 border border-gray-200 dark:border-gray-700">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center">
          <Users className="h-5 w-5 mr-2 text-orange-500" />
          ระบบสมาชิก
        </h3>
      </div>

      {!selectedMember ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="tel"
                placeholder="ค้นหาด้วยเบอร์โทร..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMember()}
                className="pl-10 pr-4 py-2 w-full border border-gray-300 dark:border-gray-600 rounded-md focus:ring-orange-500 focus:border-orange-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            <button
              onClick={searchMember}
              disabled={loading || !phoneNumber.trim()}
              className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <Search className="h-4 w-4" />
              )}
            </button>
          </div>

          {showSearch && (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {searchResults.length > 0 ? (
                searchResults.map((member) => (
                  <div
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className="p-3 border border-gray-200 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">{member.name}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{member.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(
                            member.tier
                          )}`}
                        >
                          {getTierIcon(member.tier)}
                          <span className="ml-1">{member.tier}</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">
                  ไม่พบสมาชิก
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-orange-50 dark:bg-orange-900/20 rounded-md border border-orange-200 dark:border-orange-800">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-gray-900 dark:text-white">{selectedMember.name}</h4>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getTierColor(
                    selectedMember.tier
                  )}`}
                >
                  {getTierIcon(selectedMember.tier)}
                  <span className="ml-1">{selectedMember.tier}</span>
                </span>
              </div>
              <button
                onClick={() => onMemberSelect(null)}
                className="text-orange-600 dark:text-orange-400 hover:text-orange-800 dark:hover:text-orange-200"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">คะแนนที่ใช้ได้:</span>
                <p className="font-bold text-orange-600 dark:text-orange-400">
                  {selectedMember.available_points.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">เบอร์โทร:</span>
                <p className="font-medium text-gray-900 dark:text-white">{selectedMember.phone}</p>
              </div>
            </div>
          </div>

          {cartTotal > 0 && (
            <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-md border border-green-200 dark:border-green-800">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">คะแนนที่จะได้รับ:</span>
                <div className="flex items-center">
                  <Plus className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {calculatePointsToEarn()} แต้ม
                  </span>
                </div>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                (จากยอดซื้อ ฿{cartTotal.toLocaleString()})
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LoyaltyPanel;
