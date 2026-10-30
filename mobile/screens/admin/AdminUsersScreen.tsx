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
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileUserAccount } from '../../types';

export const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<MobileUserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState<'All' | 'customer' | 'admin'>('All');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Edit Modal State
  const [activeUser, setActiveUser] = useState<MobileUserAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creditLimit, setCreditLimit] = useState<number>(1000000);
  const [tier, setTier] = useState<MobileUserAccount['tier']>('GOLD');
  const [tierDiscount, setTierDiscount] = useState<number>(15);
  const [editPhone, setEditPhone] = useState<string>('');

  // Create Modal State
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newFullName, setNewFullName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newGstin, setNewGstin] = useState('');
  const [newRole, setNewRole] = useState<'CUSTOMER' | 'ADMIN' | 'METALLURGIST'>('CUSTOMER');
  const [newTier, setNewTier] = useState<MobileUserAccount['tier']>('GOLD');
  const [newCreditLimit, setNewCreditLimit] = useState('1500000');

  // Delete Modal State
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

  // ============================================================================
  // CRUD: CREATE
  // ============================================================================
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
      Alert.alert('Validation Error', 'Company name, contact name, and corporate email are required.');
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
      showToast(`Client ${createdUser.companyName} registered!`);
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Failed to create user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: UPDATE
  // ============================================================================
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
            ? {
                ...u,
                creditLimit,
                tier,
                tierDiscountPct: tierDiscount,
                phone: editPhone.trim(),
              }
            : u
        )
      );

      setIsEditModalOpen(false);
      showToast(`Account for ${activeUser.companyName} updated!`);
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Failed to update user account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: DELETE
  // ============================================================================
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
      showToast(`Account ${userToDelete.companyName} deleted from registry.`);
      setUserToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete client account.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const roleFilters: Array<'All' | 'customer' | 'admin'> = ['All', 'customer', 'admin'];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchUsers(true)}
          colors={['#0052CC']}
        />
      }
    >
      {/* Search Bar */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Client Name, Company, GSTIN..."
      />

      {/* Role Filter Chips */}
      <View style={styles.roleChipsRow}>
        {roleFilters.map((r) => {
          const isActive = selectedRole === r;
          return (
            <TouchableOpacity
              key={r}
              onPress={() => setSelectedRole(r)}
              style={[styles.roleChip, isActive ? styles.roleChipActive : styles.roleChipInactive]}
            >
              <Text style={[styles.roleChipText, isActive ? styles.roleChipTextActive : null]}>
                {r === 'All' ? 'All Accounts' : r === 'customer' ? 'B2B Customers' : 'Admins'}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Control Action Bar */}
      <View style={styles.controlBar}>
        <View>
          <Text style={styles.resultsCount}>{users.length} Registered Accounts</Text>
          <Text style={styles.subCount}>Corporate B2B client registry &amp; credit lines</Text>
        </View>

        <TouchableOpacity
          style={styles.addUserBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.addUserBtnText}>➕ Add Client</Text>
        </TouchableOpacity>
      </View>

      {/* Users List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading client accounts...</Text>
        </View>
      ) : users.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Accounts Found</Text>
          <Text style={styles.emptySubtitle}>Try adjusting your search query or filter.</Text>
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedRole('All'); }} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        users.map((user) => (
          <MobileCard key={user.id}>
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.companyName}>{user.companyName}</Text>
                <Text style={styles.personName}>{user.fullName}</Text>
              </View>

              <View style={styles.badgesCol}>
                <MobileBadge
                  label={String(user.role).toUpperCase()}
                  variant={String(user.role).toUpperCase() === 'ADMIN' ? 'primary' : 'neutral'}
                  size="sm"
                />
                <View style={styles.tierBadge}>
                  <Text style={styles.tierText}>★ {user.tier}</Text>
                </View>
              </View>
            </View>

            <Text style={styles.contactText}>
              📞 {user.phone || '+91 98880 21000'} • ✉ {user.email}
            </Text>

            {user.gstin ? (
              <Text style={styles.gstinText}>GSTIN: {user.gstin}</Text>
            ) : null}

            {/* Credit Limit & Discount Box */}
            <View style={styles.creditBox}>
              <View>
                <Text style={styles.creditLabel}>Approved Credit Line</Text>
                <Text style={styles.creditValue}>
                  ₹{(user.creditLimit || 500000).toLocaleString()}
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.creditLabel}>Tier Discount</Text>
                <Text style={styles.discountValue}>
                  {user.tierDiscountPct || 10}% OFF
                </Text>
              </View>
            </View>

            {/* Actions: Delete & Edit */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                onPress={() => handlePromptDelete(user)}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenEdit(user)}
                style={styles.editBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.editBtnText}>✏ Edit Credit &amp; Tier</Text>
              </TouchableOpacity>
            </View>
          </MobileCard>
        ))
      )}

      {/* ====================================================================== */}
      {/* MODAL 1: CREATE USER                                                   */}
      {/* ====================================================================== */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Enterprise Client Account"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>
            Register a verified corporate buyer account in the MySQL database.
          </Text>

          <Text style={styles.inputLabel}>Company Name *</Text>
          <TextInput
            style={styles.textInput}
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            placeholder="e.g. Apex Heavy Infrastructure Ltd"
          />

          <Text style={styles.inputLabel}>Procurement Officer / Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={newFullName}
            onChangeText={setNewFullName}
            placeholder="e.g. Rajesh Sharma"
          />

          <Text style={styles.inputLabel}>Corporate Email Address *</Text>
          <TextInput
            style={styles.textInput}
            value={newEmail}
            onChangeText={setNewEmail}
            placeholder="procurement@company.com"
            keyboardType="email-address"
            autoCapitalize="none"
          />

          <Text style={styles.inputLabel}>Contact Phone</Text>
          <TextInput
            style={styles.textInput}
            value={newPhone}
            onChangeText={setNewPhone}
            placeholder="+91 98880 21000"
            keyboardType="phone-pad"
          />

          <Text style={styles.inputLabel}>GSTIN Tax ID</Text>
          <TextInput
            style={styles.textInput}
            value={newGstin}
            onChangeText={setNewGstin}
            placeholder="29AABCA1234F1Z5"
            autoCapitalize="characters"
          />

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Account Role</Text>
              <TextInput
                style={styles.textInput}
                value={newRole}
                onChangeText={(val) => setNewRole(val.toUpperCase() === 'ADMIN' ? 'ADMIN' : 'CUSTOMER')}
                placeholder="CUSTOMER / ADMIN"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Pricing Tier</Text>
              <TextInput
                style={styles.textInput}
                value={newTier}
                onChangeText={(val) => setNewTier(val.toUpperCase() as any)}
                placeholder="VIP / GOLD / SILVER"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Approved Credit Limit (₹)</Text>
          <TextInput
            style={styles.textInput}
            value={newCreditLimit}
            onChangeText={setNewCreditLimit}
            keyboardType="numeric"
          />

          <TouchableOpacity
            onPress={handleCreateUser}
            style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Register Client Account →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* ====================================================================== */}
      {/* MODAL 2: UPDATE USER                                                   */}
      {/* ====================================================================== */}
      {activeUser ? (
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit Account: ${activeUser.companyName}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              Adjust corporate credit facility and procurement tier discount.
            </Text>

            <Text style={styles.inputLabel}>Approved Credit Facility (₹)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(creditLimit)}
              onChangeText={(val) => setCreditLimit(parseInt(val) || 0)}
            />

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Tier (VIP / GOLD / SILVER)</Text>
                <TextInput
                  style={styles.textInput}
                  value={tier}
                  onChangeText={(val) => setTier(val.toUpperCase() as any)}
                  autoCapitalize="characters"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Discount (%)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(tierDiscount)}
                  onChangeText={(val) => setTierDiscount(parseFloat(val) || 0)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Direct Phone Line</Text>
            <TextInput
              style={styles.textInput}
              value={editPhone}
              onChangeText={setEditPhone}
              keyboardType="phone-pad"
            />

            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Account Settings →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* ====================================================================== */}
      {/* MODAL 3: DELETE USER CONFIRMATION                                      */}
      {/* ====================================================================== */}
      {userToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Account Confirmation"
        >
          <View style={styles.modalScroll}>
            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningIcon}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deleteWarningTitle}>Revoke Client Access</Text>
                <Text style={styles.deleteWarningText}>
                  Are you sure you want to delete <Text style={{ fontWeight: '800' }}>{userToDelete.companyName}</Text> ({userToDelete.email}) from the database?
                </Text>
              </View>
            </View>

            <Text style={styles.deleteItemMeta}>
              • Contact: {userToDelete.fullName}{'\n'}
              • Role: {userToDelete.role} | Tier: {userToDelete.tier}{'\n'}
              • Credit Limit: ₹{(userToDelete.creditLimit || 0).toLocaleString()}
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setIsDeleteModalOpen(false)}
                style={styles.cancelBtn}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, isSubmitting && styles.btnDisabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </MobileModal>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },
  roleChipsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 4,
  },
  roleChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
  },
  roleChipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  roleChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  roleChipTextActive: {
    color: '#FFFFFF',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  subCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  addUserBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  addUserBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  companyName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  personName: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
    marginTop: 2,
  },
  badgesCol: {
    alignItems: 'flex-end',
    gap: 4,
  },
  tierBadge: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FCD34D',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  tierText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  contactText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 8,
  },
  gstinText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
    marginTop: 4,
  },
  creditBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditLabel: {
    fontSize: 10,
    color: '#94A3B8',
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  creditValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  discountValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  modalScroll: {
    paddingVertical: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#0052CC',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  deleteWarningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  deleteWarningIcon: {
    fontSize: 18,
    color: '#DC2626',
  },
  deleteWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  deleteWarningText: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 17,
  },
  deleteItemMeta: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default AdminUsersScreen;
