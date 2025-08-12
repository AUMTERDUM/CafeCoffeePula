'use client';

import { useState, useEffect } from 'react';
import { loyaltyAPI } from '@/lib/api';
import { Member, Reward, MemberStats } from '@/lib/types';
import AddMemberModal from '@/components/AddMemberModal';
import MemberDetailModal from '@/components/MemberDetailModal';
import BackButton from '@/components/BackButton';
import DarkModeToggle from '@/components/DarkModeToggle';
import { 
  Users, 
  Award,
  Star,
  Gift,
  TrendingUp,
  Plus,
  Search,
  Eye,
  Edit,
  Trophy,
  Crown,
  Zap,
  Calendar,
  Phone,
  Mail
} from 'lucide-react';

const LoyaltyPage: React.FC = () => {
  const [members, setMembers] = useState<Member[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  const [stats, setStats] = useState<MemberStats | null>(null);
  const [selectedTab, setSelectedTab] = useState<'members' | 'rewards' | 'stats'>('members');
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [showAddMember, setShowAddMember] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [membersRes, rewardsRes, statsRes] = await Promise.all([
        loyaltyAPI.getMembers({ search: searchTerm }),
        loyaltyAPI.getRewards(),
        loyaltyAPI.getStats(),
      ]);

      setMembers(membersRes);
      setRewards(rewardsRes);
      setStats(statsRes);
    } catch (error) {
      console.error('Error fetching loyalty data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    try {
      const membersRes = await loyaltyAPI.getMembers({ search: searchTerm });
      setMembers(membersRes);
    } catch (error) {
      console.error('Error searching members:', error);
    }
  };

  const getTierIcon = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return <Award className="w-5 h-5 text-amber-600" />;
      case 'SILVER':
        return <Trophy className="w-5 h-5 text-gray-400" />;
      case 'GOLD':
        return <Crown className="w-5 h-5 text-yellow-500" />;
      case 'PLATINUM':
        return <Zap className="w-5 h-5 text-purple-500" />;
      default:
        return <Star className="w-5 h-5 text-gray-400" />;
    }
  };

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'BRONZE':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'SILVER':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'GOLD':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'PLATINUM':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredMembers = members.filter(member =>
    member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    member.phone?.includes(searchTerm) ||
    member.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="min-h-screen coffee-theme flex items-center justify-center">
        <div className="text-center">
          <Users className="w-12 h-12 text-[var(--coffee-brown)] animate-pulse mx-auto mb-4" />
          <p className="text-[var(--coffee-medium)]">กำลังโหลดข้อมูลสมาชิก...</p>
        </div>
      </div>
    );
  }

  const getRewardTypeIcon = (type: string) => {
    switch (type) {
      case 'FREE_ITEM':
        return <Gift className="h-4 w-4 text-green-500" />;
      case 'DISCOUNT':
        return <TrendingUp className="h-4 w-4 text-blue-500" />;
      case 'BUY_X_GET_Y':
        return <Zap className="h-4 w-4 text-orange-500" />;
      default:
        return <Award className="h-4 w-4 text-gray-500" />;
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
    <div className="min-h-screen coffee-theme">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8 fade-in">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <BackButton className="mr-4" />
              <div className="flex items-center">
                <Users className="w-8 h-8 text-[var(--coffee-brown)] mr-3" />
                <h1 className="text-3xl font-bold text-[var(--coffee-dark)]">ระบบสมาชิกและสะสมแต้ม</h1>
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
              onClick={() => setSelectedTab('members')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'members'
                  ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                  : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
              }`}
            >
              <Users className="h-4 w-4 inline mr-2" />
              สมาชิก ({members.length})
            </button>
            <button
              onClick={() => setSelectedTab('rewards')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'rewards'
                  ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                  : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
              }`}
            >
              <Gift className="h-4 w-4 inline mr-2" />
              รางวัล ({rewards.length})
            </button>
            <button
              onClick={() => setSelectedTab('stats')}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                selectedTab === 'stats'
                  ? 'border-[var(--coffee-brown)] text-[var(--coffee-brown)]'
                  : 'border-transparent text-[var(--coffee-medium)] hover:text-[var(--coffee-dark)]'
              }`}
            >
              <TrendingUp className="h-4 w-4 inline mr-2" />
              สถิติ
            </button>
          </nav>
        </div>
      </div>

      {/* Members Tab */}
      {selectedTab === 'members' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--coffee-medium)] h-4 w-4" />
                <input
                  type="text"
                  placeholder="ค้นหาสมาชิก..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  className="cute-input pl-10 pr-4 py-2"
                />
              </div>
              <button
                onClick={handleSearch}
                className="btn btn-secondary"
              >
                ค้นหา
              </button>
            </div>
            <button
              onClick={() => setShowAddMember(true)}
              className="btn btn-primary"
            >
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มสมาชิก
            </button>
          </div>

          <div className="grid gap-4">
            {filteredMembers.map((member) => (
              <div
                key={member.id}
                className="card p-6"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {getTierIcon(member.tier)}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {member.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {member.member_number}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getTierColor(
                        member.tier
                      )}`}
                    >
                      {getTierIcon(member.tier)}
                      <span className="ml-1">{member.tier}</span>
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-[var(--coffee-medium)]">คะแนนที่ใช้ได้</div>
                    <p className="text-2xl font-bold text-[var(--coffee-brown)]">
                      {member.available_points.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--coffee-medium)]">คะแนนรวม</div>
                    <p className="text-lg font-semibold text-[var(--coffee-dark)]">
                      {member.total_points.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--coffee-medium)]">ยอดใช้จ่าย</div>
                    <p className="text-lg font-semibold text-green-600">
                      ฿{member.total_spent.toLocaleString()}
                    </p>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--coffee-medium)]">จำนวนออเดอร์</div>
                    <p className="text-lg font-semibold text-[var(--coffee-dark)]">
                      {member.total_orders.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-[var(--coffee-medium)] mb-4">
                  <div className="flex items-center space-x-4">
                    {member.phone && (
                      <div className="flex items-center">
                        <Phone className="h-4 w-4 mr-1" />
                        {member.phone}
                      </div>
                    )}
                    {member.email && (
                      <div className="flex items-center">
                        <Mail className="h-4 w-4 mr-1" />
                        {member.email}
                      </div>
                    )}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    {member.last_visit 
                      ? new Date(member.last_visit).toLocaleDateString('th-TH')
                      : 'ยังไม่เคยมา'
                    }
                  </div>
                </div>

                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setSelectedMember(member)}
                    className="btn btn-secondary"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    ดูรายละเอียด
                  </button>
                  <button className="btn btn-accent">
                    <Edit className="h-4 w-4 mr-2" />
                    แก้ไข
                  </button>
                </div>
              </div>
            ))}
          </div>

          {members.length === 0 && (
            <div className="text-center py-12">
              <Users className="mx-auto h-12 w-12 text-[var(--coffee-medium)]" />
              <h3 className="mt-2 text-sm font-medium text-[var(--coffee-dark)]">ไม่มีสมาชิก</h3>
              <p className="mt-1 text-sm text-[var(--coffee-medium)]">
                เริ่มต้นด้วยการเพิ่มสมาชิกคนแรก
              </p>
            </div>
          )}
        </div>
      )}

      {/* Rewards Tab */}
      {selectedTab === 'rewards' && (
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-[var(--coffee-dark)]">รางวัลและสิทธิพิเศษ</h2>
            <button className="btn btn-primary">
              <Plus className="h-4 w-4 mr-2" />
              เพิ่มรางวัล
            </button>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards.map((reward) => (
              <div
                key={reward.id}
                className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    {getRewardTypeIcon(reward.type)}
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        {reward.name}
                      </h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {reward.description}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ต้องใช้คะแนน</span>
                    <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                      {reward.point_cost.toLocaleString()} แต้ม
                    </span>
                  </div>

                  {reward.type === 'DISCOUNT' && reward.discount_amount && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ส่วนลด</span>
                      <span className="text-green-600 dark:text-green-400 font-semibold">
                        ฿{reward.discount_amount}
                      </span>
                    </div>
                  )}

                  {reward.type === 'BUY_X_GET_Y' && (
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-gray-500 dark:text-gray-400">เงื่อนไข</span>
                      <span className="text-blue-600 dark:text-blue-400 font-semibold">
                        ซื้อ {reward.buy_quantity} แถม {reward.get_quantity}
                      </span>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-gray-500 dark:text-gray-400">ใช้แล้ว</span>
                    <span className="text-gray-900 dark:text-white">
                      {reward.total_redemptions} ครั้ง
                    </span>
                  </div>

                  <div className="pt-3 border-t border-gray-200 dark:border-gray-600">
                    <span
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        reward.is_active
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}
                    >
                      {reward.is_active ? 'เปิดใช้งาน' : 'ปิดใช้งาน'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {rewards.length === 0 && (
            <div className="text-center py-12">
              <Gift className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">ไม่มีรางวัล</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                เพิ่มรางวัลเพื่อจูงใจสมาชิก
              </p>
            </div>
          )}
        </div>
      )}

      {/* Statistics Tab */}
      {selectedTab === 'stats' && stats && (
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">สถิติระบบสมาชิก</h2>

          {/* Member Statistics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">สมาชิกทั้งหมด</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_members.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">สมาชิกที่ใช้งาน</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.active_members.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Star className="h-8 w-8 text-orange-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนที่แจกแล้ว</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_points_issued.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Gift className="h-8 w-8 text-purple-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-500 dark:text-gray-400">คะแนนที่ใช้แล้ว</p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {stats.total_points_redeemed.toLocaleString()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Tier Distribution */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6 border border-gray-200 dark:border-gray-700">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">การกระจายของระดับสมาชิก</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Award className="h-8 w-8 text-amber-600" />
                </div>
                <p className="text-2xl font-bold text-amber-600">{stats.bronze_members}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Bronze</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Star className="h-8 w-8 text-gray-500" />
                </div>
                <p className="text-2xl font-bold text-gray-500">{stats.silver_members}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Silver</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Trophy className="h-8 w-8 text-yellow-500" />
                </div>
                <p className="text-2xl font-bold text-yellow-500">{stats.gold_members}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Gold</p>
              </div>
              <div className="text-center">
                <div className="flex justify-center mb-2">
                  <Crown className="h-8 w-8 text-purple-500" />
                </div>
                <p className="text-2xl font-bold text-purple-500">{stats.platinum_members}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">Platinum</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      <AddMemberModal 
        isOpen={showAddMember} 
        onClose={() => setShowAddMember(false)} 
        onSuccess={fetchData} 
      />
      
      <MemberDetailModal 
        isOpen={!!selectedMember} 
        onClose={() => setSelectedMember(null)} 
        member={selectedMember} 
        onUpdate={fetchData} 
      />
      </div>
    </div>
  );
};

export default LoyaltyPage;
