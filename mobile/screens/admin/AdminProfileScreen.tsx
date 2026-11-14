import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { getMobileStoredUser, DEMO_MOBILE_ADMIN, setMobileStoredUser } from '../../config/auth';
import { MobileAuthUser } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const GREEN = '#16A34A';
const RED = '#DC2626';

interface AdminProfileScreenProps {
  onLogout: () => void;
  onSwitchToCustomer: () => void;
}

export const AdminProfileScreen: React.FC<AdminProfileScreenProps> = ({
  onLogout,
  onSwitchToCustomer,
}) => {
  const initialUser: MobileAuthUser = getMobileStoredUser() || DEMO_MOBILE_ADMIN;

  const [fullName, setFullName] = useState(initialUser.fullName || 'Harpreet Singh');
  const [roleTitle, setRoleTitle] = useState('Chief Operations Officer & Plant Master');
  const [email, setEmail] = useState(initialUser.email || 'admin@cbh.store');
  const [phone, setPhone] = useState(initialUser.phone || '+91 98880 21000');
  const [plantLocation, setPlantLocation] = useState('Ludhiana Central Works • Factory Unit #1');

  // Passcode Reset State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');

  // Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [rfqSmsAlerts, setRfqSmsAlerts] = useState(true);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveProfile = () => {
    if (newPasscode && newPasscode.length < 6) {
      Alert.alert('Security Requirement', 'Passcode must be at least 6 characters.');
      return;
    }

    const updated: MobileAuthUser = {
      ...initialUser,
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
    };
    setMobileStoredUser(updated);
    setCurrentPasscode('');
    setNewPasscode('');
    showToast('Operator clearance credentials & profile updated!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Operator Header Profile Badge - Compact */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>CBH</Text>
        </View>

        <View style={{ flex: 1 }}>
          <View style={styles.nameRow}>
            <Text style={styles.userName}>{fullName}</Text>
            <View style={styles.clearanceBadge}>
              <Text style={styles.clearanceText}>LEVEL 4</Text>
            </View>
          </View>
          <Text style={styles.userRole}>{roleTitle}</Text>
          <Text style={styles.plantText}>{plantLocation}</Text>
        </View>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* SECTION 1: OPERATOR DETAILS */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>Personnel Information</Text>

        <View style={styles.twoCols}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Full Name</Text>
            <TextInput
              style={styles.input}
              value={fullName}
              onChangeText={setFullName}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Role</Text>
            <TextInput
              style={styles.input}
              value={roleTitle}
              onChangeText={setRoleTitle}
            />
          </View>
        </View>

        <View style={styles.twoCols}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Corporate Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>
      </View>

      {/* SECTION 2: PASSCODE SECURITY */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>Terminal Passcode</Text>

        <View style={styles.twoCols}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Current Passcode</Text>
            <TextInput
              style={styles.input}
              value={currentPasscode}
              onChangeText={setCurrentPasscode}
              secureTextEntry
              placeholder="••••••"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>New Passcode</Text>
            <TextInput
              style={styles.input}
              value={newPasscode}
              onChangeText={setNewPasscode}
              secureTextEntry
              placeholder="Min 6 chars"
            />
          </View>
        </View>
      </View>

      {/* SECTION 3: SYSTEM PROTOCOLS */}
      <View style={styles.sectionCard}>
        <Text style={styles.cardHeading}>Security &amp; Notifications</Text>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Two-Factor Authentication (2FA)</Text>
          <TouchableOpacity
            onPress={() => setTwoFactorAuth(!twoFactorAuth)}
            style={[styles.togglePill, twoFactorAuth && styles.togglePillActive]}
          >
            <Text style={[styles.togglePillText, twoFactorAuth && styles.togglePillTextActive]}>
              {twoFactorAuth ? 'ACTIVE' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.toggleRow}>
          <Text style={styles.toggleLabel}>Urgent RFQ SMS Alerts</Text>
          <TouchableOpacity
            onPress={() => setRfqSmsAlerts(!rfqSmsAlerts)}
            style={[styles.togglePill, rfqSmsAlerts && styles.togglePillActive]}
          >
            <Text style={[styles.togglePillText, rfqSmsAlerts && styles.togglePillTextActive]}>
              {rfqSmsAlerts ? 'ACTIVE' : 'OFF'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* ACTION BUTTONS */}
      <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn} activeOpacity={0.88}>
        <Text style={styles.saveBtnText}>Save Profile Changes</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onSwitchToCustomer} style={styles.switchBtn} activeOpacity={0.85}>
        <Text style={styles.switchBtnText}>Switch to Customer Storefront View →</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.85}>
        <Text style={styles.logoutBtnText}>Sign Out Operator Session</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 28,
  },
  headerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: WHITE,
    fontSize: 14,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    fontSize: 13,
    fontWeight: '800',
    color: GRAPHITE,
  },
  clearanceBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  clearanceText: {
    fontSize: 8,
    fontWeight: '800',
    color: BLUE,
  },
  userRole: {
    fontSize: 11,
    color: STEEL,
    marginTop: 1,
  },
  plantText: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeading: {
    fontSize: 12,
    fontWeight: '800',
    color: GRAPHITE,
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 4,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 6,
  },
  fieldLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 3,
  },
  input: {
    height: 36,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 8,
    fontSize: 12,
    color: GRAPHITE,
  },
  toggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  toggleLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  togglePill: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    backgroundColor: '#F1F5F9',
  },
  togglePillActive: {
    backgroundColor: '#DCFCE7',
  },
  togglePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: LIGHT_STEEL,
  },
  togglePillTextActive: {
    color: GREEN,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 8,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  switchBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginBottom: 8,
  },
  switchBtnText: {
    color: BLUE,
    fontSize: 11,
    fontWeight: '700',
  },
  logoutBtn: {
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  logoutBtnText: {
    color: RED,
    fontSize: 11,
    fontWeight: '700',
  },
  toast: {
    backgroundColor: GRAPHITE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  toastText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
});
