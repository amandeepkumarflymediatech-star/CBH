import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { ListRowSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileUserAccount } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const GREEN = '#16A34A';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const TIER_OPTIONS = ['VIP', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'];

export const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<MobileUserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | 'customer' | 'admin'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit modal state
  const [activeUser, setActiveUser] = useState<MobileUserAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creditLimit, setCreditLimit] = useState<number>(1000000);
  const [tier, setTier] = useState<MobileUserAccount['tier']>('GOLD');
  const [tierDiscount, setTierDiscount] = useState<number>(15);
  const [editPhone, setEditPhone] = useState<string>('');

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newCreditLimit, setNewCreditLimit] = useState('1500000');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<MobileUserAccount | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchUsers = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.users.getAll({
        search: searchQuery.trim() || undefined,
        role: selectedRole === 'All' ? undefined : selectedRole,
      });
      if (res.users) setUsers(res.users);
    } catch (err) {
      console.warn('[Admin Users] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery, selectedRole]);

  const handleOpenCreate = () => {
    setNewCompanyName('');
    setNewFullName('');
    setNewEmail('');
    setNewPhone('');
    setNewCreditLimit('1500000');
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newCompanyName.trim() || !newEmail.trim()) {
      Alert.alert('Missing details', 'Please enter company name and email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<MobileUserAccount> = {
        companyName: newCompanyName.trim(),
        fullName: newFullName.trim() || newCompanyName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        role: 'customer',
        tier: 'GOLD',
        creditLimit: parseFloat(newCreditLimit) || 1000000,
        status: 'ACTIVE',
      };

      const res = await mobileApi.users.create(payload);
      const createdUser = res.user || {
        ...payload,
        id: String(res.id || Date.now()),
        createdAt: new Date().toISOString(),
      } as MobileUserAccount;

      setUsers((prev) => [createdUser, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`${createdUser.companyName} registered`);
    } catch (err: any) {
      Alert.alert('Create failed', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEdit = (user: MobileUserAccount) => {
    setActiveUser(user);
    setCreditLimit(user.creditLimit || 1000000);
    setTier(user.tier || 'GOLD');
    setTierDiscount(user.tierDiscount || 15);
    setEditPhone(user.phone || '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!activeUser) return;
    setIsSubmitting(true);
    try {
      await mobileApi.users.update({
        id: activeUser.id,
        creditLimit,
        tier,
        tierDiscount,
        phone: editPhone,
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === activeUser.id
            ? {
                ...u,
                creditLimit,
                tier,
                tierDiscount,
                phone: editPhone,
              }
            : u
        )
      );

      setIsEditModalOpen(false);
      showToast(`${activeUser.companyName} parameters updated`);
    } catch (err: any) {
      Alert.alert('Update failed', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePromptDelete = (user: MobileUserAccount) => {
    setUserToDelete(user);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.users.delete(userToDelete.id);
      setUsers((prev) => prev.filter((u) => u.id !== userToDelete.id));
      setIsDeleteModalOpen(false);
      showToast(`${userToDelete.companyName} removed`);
      setUserToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete failed', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getTierColor = (t?: string) => {
    switch (t) {
      case 'VIP':
        return '#7C3AED';
      case 'DIAMOND':
        return '#0284C7';
      case 'PLATINUM':
        return '#475569';
      case 'GOLD':
        return '#D97706';
      default:
        return '#64748B';
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Header & Search */}
      <View style={styles.topHeader}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Client or Contact..."
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Client</Text>
          </TouchableOpacity>
        </View>

        {/* Role Filters */}
        <View style={styles.roleBar}>
          {(['All', 'customer', 'admin'] as const).map((r) => {
            const active = selectedRole === r;
            return (
              <TouchableOpacity
                key={r}
                onPress={() => setSelectedRole(r)}
                style={[styles.rolePill, active && styles.rolePillActive]}
              >
                <Text style={[styles.rolePillText, active && styles.rolePillTextActive]}>
                  {r === 'All' ? 'All Accounts' : r === 'customer' ? 'B2B Clients' : 'Admins'}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* User List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchUsers(true)} colors={[BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>{users.length} Corporate Accounts</Text>
        </View>

        {isLoading ? (
          <View style={{ gap: 8 }}>
            <ListRowSkeleton />
            <ListRowSkeleton />
          </View>
        ) : users.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching clients</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedRole('All');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          users.map((u) => {
            const tierColor = getTierColor(u.tier);
            return (
              <View key={u.id} style={styles.userCard}>
                {/* Row 1: Company & Tier Badge */}
                <View style={styles.cardHeaderRow}>
                  <Text style={styles.companyName} numberOfLines={1}>
                    {u.companyName || u.fullName}
                  </Text>
                  <View style={[styles.tierPill, { backgroundColor: tierColor + '18' }]}>
                    <Text style={[styles.tierPillText, { color: tierColor }]}>{u.tier || 'GOLD'}</Text>
                  </View>
                </View>

                {/* Row 2: Contact & Email */}
                <View style={styles.cardBodyRow}>
                  <Text style={styles.contactName}>{u.fullName}</Text>
                  <Text style={styles.contactMeta} numberOfLines={1}>
                    {u.phone || u.email}
                  </Text>
                </View>

                {/* Row 3: Credit Line & Actions */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.creditGroup}>
                    <Text style={styles.creditLabel}>Credit Limit:</Text>
                    <Text style={styles.creditVal}>{inr(u.creditLimit || 1000000)}</Text>
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      onPress={() => handlePromptDelete(u)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(u)}
                      style={styles.editBtn}
                    >
                      <Text style={styles.editBtnText}>Edit Tier &amp; Credit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit User Modal */}
      <MobileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${activeUser?.companyName || 'Account'}`}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Tier Rating</Text>
          <View style={styles.tierGrid}>
            {TIER_OPTIONS.map((t) => {
              const active = tier === t;
              return (
                <TouchableOpacity
                  key={t}
                  onPress={() => setTier(t as any)}
                  style={[styles.tierOption, active && styles.tierOptionActive]}
                >
                  <Text style={[styles.tierOptionText, active && styles.tierOptionTextActive]}>{t}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Credit Limit (₹)</Text>
          <TextInput
            style={styles.input}
            value={String(creditLimit)}
            onChangeText={(v) => setCreditLimit(parseFloat(v) || 0)}
            keyboardType="numeric"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={editPhone}
            onChangeText={setEditPhone}
            keyboardType="phone-pad"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveEdit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Updating...' : 'Save Parameters'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Create User Modal */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add B2B Client Account"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Company Name *</Text>
          <TextInput
            style={styles.input}
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            placeholder="L&T Heavy Engineering"
          />

          <Text style={styles.inputLabel}>Contact Person</Text>
          <TextInput
            style={styles.input}
            value={newFullName}
            onChangeText={setNewFullName}
            placeholder="Vikram Malhotra"
          />

          <Text style={styles.inputLabel}>Corporate Email *</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="procurement@lnt.com"
            autoCapitalize="none"
            keyboardType="email-address"
          />

          <Text style={styles.inputLabel}>Phone Number</Text>
          <TextInput
            style={styles.input}
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder="+91 98880 21000"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>Initial Credit Limit (₹)</Text>
          <TextInput
            style={styles.input}
            value={newCreditLimit}
            onChangeText={setNewCreditLimit}
            keyboardType="numeric"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleCreateUser}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Registering...' : 'Create Account'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Client Account"
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: STEEL, marginBottom: 14 }}>
            Remove client account <Text style={{ fontWeight: '800', color: GRAPHITE }}>{userToDelete?.companyName}</Text>?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalOpen(false)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: STEEL }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: RED, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: WHITE }}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  roleBar: {
    flexDirection: 'row',
    gap: 6,
  },
  rolePill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  rolePillActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  rolePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  rolePillTextActive: {
    color: WHITE,
    fontWeight: '800',
  },
  countRow: {
    paddingVertical: 4,
    marginBottom: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  userCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '800',
    color: GRAPHITE,
    flex: 1,
    paddingRight: 8,
  },
  tierPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  tierPillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  contactName: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  contactMeta: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  creditGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  creditLabel: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  creditVal: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: GREEN,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: RED,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAPHITE,
  },
  toast: {
    backgroundColor: GRAPHITE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  toastText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    color: STEEL,
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
  },
  modalScroll: {
    paddingVertical: 6,
  },
  tierGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  tierOption: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tierOptionActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  tierOptionText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  tierOptionTextActive: {
    color: WHITE,
    fontWeight: '800',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 4,
  },
  input: {
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: GRAPHITE,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
});
