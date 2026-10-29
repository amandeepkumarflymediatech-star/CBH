import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { getMobileStoredUser, DEMO_MOBILE_ADMIN } from '../../config/auth';

interface AdminProfileScreenProps {
  onLogout: () => void;
  onSwitchToCustomer: () => void;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({
  onLogout,
  onSwitchToCustomer,
}) => {
  const user = getMobileStoredUser() || DEMO_MOBILE_ADMIN;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🛡</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userCompany}>{user.companyName}</Text>
          <View style={styles.clearanceBadge}>
            <Text style={styles.clearanceText}>CLEARANCE: LEVEL 4 ADMIN</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity onPress={onSwitchToCustomer} style={styles.switchBtn}>
        <Text style={styles.switchBtnText}>
          ⚡ Switch to Customer Storefront View →
        </Text>
      </TouchableOpacity>

      <MobileCard>
        <Text style={styles.specsHeading}>Operations Station Specs</Text>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Hardware Enclave:</Text>
          <Text style={styles.specVal}>CBH-HQ-OP-901</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Data Center Node:</Text>
          <Text style={styles.specVal}>LUDHIANA-CENTRAL-DC1</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Security Cipher:</Text>
          <Text style={[styles.specVal, { color: '#059669' }]}>
            TLS 1.3 / AES-256
          </Text>
        </View>
      </MobileCard>

      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutBtnText}>End Operations Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  headerCard: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 22,
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userCompany: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  clearanceBadge: {
    backgroundColor: '#065F46',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  clearanceText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#34D399',
  },
  switchBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#0052CC',
    fontWeight: '700',
    fontSize: 12,
  },
  specsHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  specKey: {
    fontSize: 11,
    color: '#64748B',
  },
  specVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontWeight: '700',
    fontSize: 12,
  },
});

export default AdminProfileScreen;
