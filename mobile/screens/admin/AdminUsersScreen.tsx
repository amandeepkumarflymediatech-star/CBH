import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileUserAccount } from '../../types';

export const AdminUsersScreen: React.FC = () => {
  const [users, setUsers] = useState<MobileUserAccount[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeUser, setActiveUser] = useState<MobileUserAccount | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [creditLimit, setCreditLimit] = useState<number>(1000000);
  const [toastMsg, setToastMsg] = useState('');

  const fetchUsers = async () => {
    try {
      const res = await mobileApi.users.getAll({ search: searchQuery || undefined });
      if (res.users) setUsers(res.users);
    } catch (err) {
      console.warn('[Admin Users] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [searchQuery]);

  const handleOpenEdit = (user: MobileUserAccount) => {
    setActiveUser(user);
    setCreditLimit(user.creditLimit || 1000000);
    setIsEditModalOpen(true);
  };

  const handleSave = async () => {
    if (!activeUser) return;
    try {
      await mobileApi.users.update({ id: activeUser.id, creditLimit });
      setUsers((prev) =>
        prev.map((u) => (u.id === activeUser.id ? { ...u, creditLimit } : u))
      );
      setToastMsg(`Updated credit limit for ${activeUser.companyName}!`);
      setTimeout(() => setToastMsg(''), 3000);
      setIsEditModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Client Name, Company, GSTIN..."
      />

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {users.map((user) => (
        <MobileCard key={user.id}>
          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.companyName}>{user.companyName}</Text>
              <Text style={styles.personName}>{user.fullName}</Text>
            </View>

            <View style={styles.tierBadge}>
              <Text style={styles.tierText}>★ {user.tier}</Text>
            </View>
          </View>

          <Text style={styles.contactText}>
            📞 {user.phone || '+91 98880 21000'} • ✉ {user.email}
          </Text>

          <View style={styles.creditBox}>
            <View>
              <Text style={styles.creditLabel}>Credit Line</Text>
              <Text style={styles.creditAmount}>
                ₹{(user.creditLimit || 2500000).toLocaleString('en-IN')}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.creditLabel}>GSTIN Status</Text>
              <Text style={styles.gstinVerified}>
                {user.isVerified ? '✓ VERIFIED' : 'PENDING'}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.ordersCount}>
              Total Orders: {user.ordersCount || 12}
            </Text>
            <TouchableOpacity
              onPress={() => handleOpenEdit(user)}
              style={styles.adjustBtn}
            >
              <Text style={styles.adjustBtnText}>✎ Adjust Credit Limit</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}

      <MobileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit Limits: ${activeUser?.companyName}`}
        subtitle={activeUser?.fullName}
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsEditModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleSave} style={styles.modalConfirmBtn}>
              <Text style={styles.modalConfirmText}>Save Limit</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.inputLabel}>Corporate Credit Line Limit (₹)</Text>
        <TextInput
          keyboardType="numeric"
          value={String(creditLimit)}
          onChangeText={(v) => setCreditLimit(Number(v) || 0)}
          style={styles.input}
        />
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  personName: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  tierBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  tierText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  contactText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 8,
  },
  creditBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  creditLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  creditAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  gstinVerified: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  ordersCount: {
    fontSize: 11,
    color: '#64748B',
  },
  adjustBtn: {
    backgroundColor: '#F5F3FF',
    borderWidth: 1,
    borderColor: '#DDD6FE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  adjustBtnText: {
    color: '#7C3AED',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#7C3AED',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default AdminUsersScreen;
