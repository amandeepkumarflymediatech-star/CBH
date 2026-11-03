import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileUserAccount } from '../../types';

// Same palette as the other screens
const GRAPHITE = '#1C2228';
const STEEL = '#5E6A74';
const MIST = '#EDEFF1';
const HAIR = '#D6DBE0';
const WHITE = '#FFFFFF';
const ORANGE = '#F26B1D';
const GREEN = '#17803D';
const RED = '#C62828';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const TIER_OPTIONS = ['VIP', 'DIAMOND', 'PLATINUM', 'GOLD', 'SILVER'];
const cap = (s?: string) => (s ? s.charAt(0).toUpperCase() + s.slice(1).toLowerCase() : '');
const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

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
  const [newGstin, setNewGstin] = useState('');
  const [newRole, setNewRole] = useState<'CUSTOMER' | 'ADMIN' | 'METALLURGIST'>('CUSTOMER');
  const [newTier, setNewTier] = useState<MobileUserAccount['tier']>('GOLD');
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

  // CREATE
  const handleOpenCreate = () => {
    setNewCompanyName('Tata Projects Heavy Engineering');
    setNewFullName('Amitabh Verma');
    setNewEmail('procurement@tataprojects.com');
    setNewPhone('+91 98200 45678');
    setNewGstin('27AAACT0012P1Z8');
    setNewRole('CUSTOMER');
    setNewTier('VIP');
    setNewCreditLimit('2500000');
    setIsCreateModalOpen(true);
  };

  const handleCreateUser = async () => {
    if (!newCompanyName.trim() || !newFullName.trim() || !newEmail.trim()) {
      Alert.alert('Missing details', 'Enter a company name, contact name and corporate email.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        companyName: newCompanyName.trim(),
        fullName: newFullName.trim(),
        email: newEmail.trim().toLowerCase(),
        phone: newPhone.trim(),
        gstin: newGstin.trim().toUpperCase(),
        role: newRole,
        tier: newTier,
        creditLimit: parseFloat(newCreditLimit) || 1000000,
      };

      const res = await mobileApi.users.create(payload as any);
      const createdUser: MobileUserAccount = res.user || ({
        id: Number(res.id || Date.now()),
        ...payload,
        createdAt: new Date().toISOString(),
        isVerified: true,
        tierDiscountPct: newTier === 'VIP' ? 25 : newTier === 'DIAMOND' ? 20 : 15,
      } as unknown as MobileUserAccount);

      setUsers((prev) => [createdUser, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`${createdUser.companyName} registered`);
    } catch (err: any) {
      Alert.alert('Could not add client', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleOpenEdit = (user: MobileUserAccount) => {
    setActiveUser(user);
    setCreditLimit(user.creditLimit || 1000000);
    setTier(user.tier || 'GOLD');
    setTierDiscount(user.tierDiscountPct || 15);
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
        tierDiscountPct: tierDiscount,
        phone: editPhone.trim(),
      });

      setUsers((prev) =>
        prev.map((u) =>
          u.id === activeUser.id
            ? { ...u, creditLimit, tier, tierDiscountPct: tierDiscount, phone: editPhone.trim() }
            : u
        )
      );

      setIsEditModalOpen(false);
      showToast(`${activeUser.companyName} updated`);
    } catch (err: any) {
      Alert.alert('Could not update account', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
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
      showToast(`${userToDelete.companyName} deleted`);
      setUserToDelete(null);
    } catch (err: any) {
      Alert.alert('Could not delete account', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleFilters: Array<'All' | 'customer' | 'admin'> = ['All', 'customer', 'admin'];
  const roleTabLabel = (r: string) => (r === 'All' ? 'All accounts' : r === 'customer' ? 'Customers' : 'Admins');

  // Tier chips: standard tiers plus the account's own tier if it is something else
  const editTierOptions = tier && !TIER_OPTIONS.includes(String(tier)) ? [String(tier), ...TIER_OPTIONS] : TIER_OPTIONS;

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchUsers(true)} colors={[ORANGE]} />
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchWrap}>
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by name, company or GSTIN"
        />
      </View>

      {/* Role tabs */}
      <View style={styles.tabs}>
        {roleFilters.map((r) => {
          const active = selectedRole === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRole(r)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{roleTabLabel(r)}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Count + add */}
      <View style={styles.controlBar}>
        <View>
          <Text style={styles.h2}>
            {users.length} {users.length === 1 ? 'account' : 'accounts'}
          </Text>
          <Text style={styles.subCount}>Client registry and credit lines</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.88}>
          <Text style={styles.addBtnText}>Add client</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading accounts</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyTitle}>No accounts found</Text>
          <Text style={styles.emptySubtitle}>Change the search or the role filter to see more.</Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedRole('All');
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        users.map((user) => {
          const isAdmin = String(user.role).toUpperCase() === 'ADMIN';
          return (
            <View key={user.id} style={styles.user}>
              <View style={styles.rowBetween}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {user.companyName}
                </Text>
                <Text style={[styles.roleText, isAdmin && { color: ORANGE }]}>{cap(String(user.role))}</Text>
              </View>
              <Text style={styles.personName}>{user.fullName}</Text>

              <Text style={styles.meta}>{user.email}</Text>
              <Text style={styles.meta}>{user.phone || '+91 98880 21000'}</Text>
              {user.gstin ? <Text style={styles.gstin}>GSTIN {user.gstin}</Text> : null}

              {/* Credit and discount side by side */}
              <View style={styles.dataRow}>
                <View style={styles.dataCol}>
                  <Text style={styles.dataLabel}>Credit line</Text>
                  <Text style={styles.dataVal}>{inr(user.creditLimit || 500000)}</Text>
                </View>
                <View style={[styles.dataCol, styles.dataColRight]}>
                  <Text style={styles.dataLabel}>{cap(String(user.tier))} tier discount</Text>
                  <Text style={[styles.dataVal, { color: GREEN }]}>{user.tierDiscountPct || 10}% off</Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handlePromptDelete(user)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpenEdit(user)} style={styles.editBtn} activeOpacity={0.85}>
                  <Text style={styles.editBtnText}>Edit credit and tier</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Create modal */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add client"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>Register a verified corporate buyer account.</Text>

          <Text style={styles.inputLabel}>Company name</Text>
          <TextInput
            style={styles.input}
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            placeholder="Apex Heavy Infrastructure Ltd"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Contact person</Text>
          <TextInput
            style={styles.input}
            value={newFullName}
            onChangeText={setNewFullName}
            placeholder="Rajesh Sharma"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Corporate email</Text>
          <TextInput
            style={styles.input}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="procurement@company.com"
            placeholderTextColor="#8D98A1"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Phone</Text>
          <TextInput
            style={styles.input}
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder="+91 98880 21000"
            placeholderTextColor="#8D98A1"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>GSTIN</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={newGstin}
            onChangeText={setNewGstin}
            placeholder="29AABCA1234F1Z5"
            placeholderTextColor="#8D98A1"
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Role</Text>
          <View style={styles.chipRow}>
            {(['CUSTOMER', 'ADMIN'] as const).map((r) => {
              const active = newRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setNewRole(r)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cap(r)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Pricing tier</Text>
          <View style={styles.chipRow}>
            {TIER_OPTIONS.map((t) => {
              const active = newTier === t;
              return (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, active && styles.chipActive]}
                  onPress={() => setNewTier(t as any)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipText, active && styles.chipTextActive]}>{cap(t)}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Credit limit (₹)</Text>
          <TextInput style={styles.input} value={newCreditLimit} onChangeText={setNewCreditLimit} keyboardType="numeric" />

          <TouchableOpacity
            onPress={handleCreateUser}
            style={[styles.saveBtn, isSubmitting && styles.disabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Add client</Text>}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Edit modal */}
      {activeUser ? (
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${activeUser.companyName}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>Adjust the credit line and tier discount for this account.</Text>

            <Text style={styles.inputLabel}>Credit limit (₹)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(creditLimit)}
              onChangeText={(val) => setCreditLimit(parseInt(val) || 0)}
            />

            <Text style={styles.inputLabel}>Pricing tier</Text>
            <View style={styles.chipRow}>
              {editTierOptions.map((t) => {
                const active = String(tier) === t;
                return (
                  <TouchableOpacity
                    key={t}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setTier(t as any)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{cap(t)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Tier discount (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(tierDiscount)}
              onChangeText={(val) => setTierDiscount(parseFloat(val) || 0)}
            />

            <Text style={styles.inputLabel}>Phone</Text>
            <TextInput style={styles.input} value={editPhone} onChangeText={setEditPhone} keyboardType="phone-pad" />

            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.saveBtn, isSubmitting && styles.disabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Save changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* Delete modal */}
      {userToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete this account?"
        >
          <View style={styles.modalScroll}>
            <Text style={styles.deleteLead}>
              {userToDelete.companyName} ({userToDelete.email}) will lose access and be removed from the registry. This can’t be undone.
            </Text>

            <View style={styles.deleteTable}>
              <View style={[styles.kv, { borderTopWidth: 0 }]}>
                <Text style={styles.k}>Contact</Text>
                <Text style={styles.v}>{userToDelete.fullName}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Role and tier</Text>
                <Text style={styles.v}>
                  {cap(String(userToDelete.role))}, {cap(String(userToDelete.tier))}
                </Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Credit line</Text>
                <Text style={styles.v}>{inr(userToDelete.creditLimit || 0)}</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsDeleteModalOpen(false)} style={styles.cancelBtn} disabled={isSubmitting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, isSubmitting && styles.disabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Delete account</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </MobileModal>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: WHITE },

  searchWrap: { paddingHorizontal: 16, paddingTop: 16 },

  tabs: { flexDirection: 'row', gap: 22, paddingHorizontal: 20, marginTop: 8, borderBottomWidth: 1, borderBottomColor: HAIR },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: ORANGE },
  tabText: { fontSize: 14, fontWeight: '600', color: STEEL },
  tabTextActive: { color: GRAPHITE },

  toast: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: GRAPHITE,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { color: WHITE, fontSize: 14, fontWeight: '600' },

  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: MIST,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIR,
  },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  subCount: { fontSize: 12, color: STEEL, marginTop: 1 },
  addBtn: { height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: WHITE, fontSize: 14, fontWeight: '700' },

  centerBlock: { paddingHorizontal: 32, paddingVertical: 48, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 14, color: STEEL, marginTop: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: GRAPHITE },
  emptySubtitle: { fontSize: 14, color: STEEL, textAlign: 'center' },
  resetBtn: {
    marginTop: 8,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },

  // One account: a hairline-separated block, not a card
  user: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: HAIR },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 },
  companyName: { fontSize: 16, fontWeight: '700', color: GRAPHITE, flex: 1 },
  roleText: { fontSize: 13, fontWeight: '700', color: STEEL },
  personName: { fontSize: 14, color: GRAPHITE, marginTop: 2, marginBottom: 8 },
  meta: { fontSize: 13, color: STEEL, marginTop: 2 },
  gstin: { fontSize: 12, color: STEEL, marginTop: 4, fontFamily: MONO },

  dataRow: { flexDirection: 'row', marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: MIST },
  dataCol: { flex: 1 },
  dataColRight: { alignItems: 'flex-end' },
  dataLabel: { fontSize: 12, color: STEEL },
  dataVal: { fontSize: 18, fontWeight: '800', color: GRAPHITE, marginTop: 2, fontVariant: ['tabular-nums'] },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  deleteLink: { fontSize: 14, fontWeight: '600', color: RED },
  editBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },

  // Modals
  modalScroll: { paddingVertical: 6 },
  modalSubtitle: { fontSize: 14, color: STEEL, lineHeight: 20, marginBottom: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: GRAPHITE, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: HAIR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
    color: GRAPHITE,
    backgroundColor: WHITE,
  },
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: WHITE,
  },
  chipActive: { backgroundColor: GRAPHITE, borderColor: GRAPHITE },
  chipText: { fontSize: 13, fontWeight: '600', color: GRAPHITE },
  chipTextActive: { color: WHITE },
  saveBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },

  // Delete
  deleteLead: { fontSize: 15, color: GRAPHITE, lineHeight: 22 },
  deleteTable: { marginTop: 12, marginBottom: 20 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '600', color: GRAPHITE, flexShrink: 1, textAlign: 'right', marginLeft: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  confirmDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminUsersScreen;