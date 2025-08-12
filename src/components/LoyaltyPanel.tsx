'use client';

import { useState } from 'react';
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

  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-[var(--coffee-dark)] flex items-center">
          <Users className="h-5 w-5 mr-2 text-[var(--coffee-brown)]" />
          ระบบสมาชิก
        </h3>
      </div>

      {!selectedMember ? (
        <div className="space-y-4">
          <div className="flex space-x-2">
            <div className="relative flex-1">
              <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--coffee-medium)] h-4 w-4" />
              <input
                type="tel"
                placeholder="ค้นหาด้วยเบอร์โทร..."
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && searchMember()}
                className="cute-input pl-10 pr-4 py-2 w-full"
              />
            </div>
            <button
              onClick={searchMember}
              disabled={loading || !phoneNumber.trim()}
              className="btn btn-primary"
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
                  <button
                    key={member.id}
                    onClick={() => handleMemberSelect(member)}
                    className="w-full p-3 border border-[var(--coffee-border)] rounded-md hover:bg-[var(--coffee-soft)] transition-colors text-left"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-[var(--coffee-dark)]">{member.name}</p>
                        <p className="text-sm text-[var(--coffee-medium)]">{member.phone}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="cute-badge">
                          {getTierIcon(member.tier)}
                          <span className="ml-1">{member.tier}</span>
                        </span>
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-[var(--coffee-medium)] text-center py-4">
                  ไม่พบสมาชิก
                </p>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="p-3 bg-[var(--coffee-soft)] rounded-md border border-[var(--coffee-accent)]">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <h4 className="font-medium text-[var(--coffee-dark)]">{selectedMember.name}</h4>
                <span className="cute-badge">
                  {getTierIcon(selectedMember.tier)}
                  <span className="ml-1">{selectedMember.tier}</span>
                </span>
              </div>
              <button
                onClick={() => onMemberSelect(null)}
                className="text-[var(--coffee-brown)] hover:text-[var(--coffee-brown-dark)] text-xl font-bold"
              >
                ×
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-[var(--coffee-medium)]">คะแนนที่ใช้ได้:</span>
                <p className="font-bold text-[var(--coffee-brown)]">
                  {selectedMember.available_points.toLocaleString()}
                </p>
              </div>
              <div>
                <span className="text-[var(--coffee-medium)]">เบอร์โทร:</span>
                <p className="font-medium text-[var(--coffee-dark)]">{selectedMember.phone}</p>
              </div>
            </div>
          </div>

          {cartTotal > 0 && (
            <div className="p-3 bg-green-50 rounded-md border border-green-200">
              <div className="flex items-center justify-between">
                <span className="text-sm text-[var(--coffee-medium)]">คะแนนที่จะได้รับ:</span>
                <div className="flex items-center">
                  <Plus className="h-4 w-4 text-green-600 mr-1" />
                  <span className="font-bold text-green-600">
                    {calculatePointsToEarn()} แต้ม
                  </span>
                </div>
              </div>
              <p className="text-xs text-[var(--coffee-medium)] mt-1">
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
