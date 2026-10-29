import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { getMobileStoredUser, DEMO_MOBILE_CUSTOMER } from '../../config/auth';

interface CustomerProfileScreenProps {
  onLogout: () => void;
  onSwitchToAdmin: () => void;
  onNavigateToCertificates: () => void;
}

export const CustomerProfileScreen: React.FC<CustomerProfileScreenProps> = ({
  onLogout,
  onSwitchToAdmin,
  onNavigateToCertificates,
}) => {
  const user = getMobileStoredUser() || DEMO_MOBILE_CUSTOMER;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Profile Card */}
      <View style={styles.profileHeader}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{user.fullName.charAt(0)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{user.fullName}</Text>
          <Text style={styles.userCompany}>{user.companyName}</Text>
          <View style={styles.tierPill}>
            <Text style={styles.tierText}>★ {user.tier || 'DIAMOND'} TIER</Text>
          </View>
        </View>
      </View>

      {/* Credit Line Bar */}
      <MobileCard>
        <Text style={styles.creditTitle}>Corporate 30D Credit Line</Text>
        <Text style={styles.creditValue}>₹25,00,000.00 Available</Text>
        <View style={styles.barBg}>
          <View style={styles.barFill} />
        </View>
      </MobileCard>

      {/* Switch to Admin Mode */}
      <TouchableOpacity onPress={onSwitchToAdmin} style={styles.switchBtn}>
        <Text style={styles.switchBtnText}>
          ⚡ Switch to Admin Console Mode →
        </Text>
      </TouchableOpacity>

      {/* Commercial Details */}
      <MobileCard>
        <Text style={styles.sectionHeading}>Business Registration</Text>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>GSTIN:</Text>
          <Text style={styles.detailVal}>{user.gstin || '29AABCA1234F1Z5'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Phone:</Text>
          <Text style={styles.detailVal}>{user.phone || '+91 98880 21000'}</Text>
        </View>
        <View style={styles.detailRow}>
          <Text style={styles.detailKey}>Dispatch Site:</Text>
          <Text style={styles.detailVal}>Peenya Ind. Area, Bengaluru</Text>
        </View>
      </MobileCard>

      {/* NABL Certificates Link */}
      <TouchableOpacity
        onPress={onNavigateToCertificates}
        style={styles.certBtn}
      >
        <Text style={styles.certBtnText}>
          📄 View NABL MTC 3.1 Mill Test Reports →
        </Text>
      </TouchableOpacity>

      {/* Sign Out */}
      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn}>
        <Text style={styles.logoutBtnText}>Sign Out Account</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  profileHeader: {
    backgroundColor: '#0052CC',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0052CC',
  },
  userName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userCompany: {
    fontSize: 11,
    color: '#BFDBFE',
    marginTop: 2,
  },
  tierPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignSelf: 'flex-start',
    marginTop: 6,
  },
  tierText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#92400E',
  },
  creditTitle: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  creditValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0052CC',
    marginTop: 2,
  },
  barBg: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    marginTop: 8,
    overflow: 'hidden',
  },
  barFill: {
    width: '80%',
    height: '100%',
    backgroundColor: '#10B981',
  },
  switchBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 12,
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  detailKey: {
    fontSize: 11,
    color: '#64748B',
  },
  detailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  certBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
  },
  certBtnText: {
    color: '#0052CC',
    fontWeight: '700',
    fontSize: 12,
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

export default CustomerProfileScreen;
