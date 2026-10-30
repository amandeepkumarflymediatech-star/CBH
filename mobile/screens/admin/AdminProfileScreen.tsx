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
import { MobileCard } from '../../components/MobileCard';
import { getMobileStoredUser, DEMO_MOBILE_ADMIN, setMobileStoredUser } from '../../config/auth';
import { MobileAuthUser } from '../../types';

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
  const [stationKey, setStationKey] = useState('CBH-HQ-OP-901');
  const [plantLocation, setPlantLocation] = useState('Ludhiana Central Works • Factory Unit #1');

  // Passcode Reset State
  const [currentPasscode, setCurrentPasscode] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');

  // Toggles
  const [twoFactorAuth, setTwoFactorAuth] = useState(true);
  const [rfqSmsAlerts, setRfqSmsAlerts] = useState(true);
  const [discrepancyAlerts, setDiscrepancyAlerts] = useState(true);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleSaveProfile = () => {
    if (newPasscode) {
      if (newPasscode !== confirmPasscode) {
        Alert.alert('Passcode Mismatch', 'New passcode and confirmation do not match.');
        return;
      }
      if (newPasscode.length < 6) {
        Alert.alert('Security Requirement', 'Passcode must be at least 6 characters.');
        return;
      }
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
    setConfirmPasscode('');
    showToast('Operator clearance credentials & station security protocols updated!');
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Header Profile Badge */}
      <View style={styles.headerCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>🛡</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.userName}>{fullName}</Text>
          <Text style={styles.userRole}>{roleTitle}</Text>
          <View style={styles.clearanceBadge}>
            <Text style={styles.clearanceText}>CLEARANCE: LEVEL 4 PLANT MASTER</Text>
          </View>
        </View>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Switch to Customer Storefront View */}
      <TouchableOpacity onPress={onSwitchToCustomer} style={styles.switchBtn} activeOpacity={0.8}>
        <Text style={styles.switchBtnText}>
          ⚡ Switch to Customer Storefront View →
        </Text>
      </TouchableOpacity>

      {/* SECTION 1: OPERATOR DETAILS (All Inputs) */}
      <MobileCard>
        <Text style={styles.cardHeading}>Operator Personnel Details</Text>

        <Text style={styles.fieldLabel}>Full Name</Text>
        <TextInput
          style={styles.input}
          value={fullName}
          onChangeText={setFullName}
          placeholder="Harpreet Singh"
        />

        <Text style={styles.fieldLabel}>Operational Role Title</Text>
        <TextInput
          style={styles.input}
          value={roleTitle}
          onChangeText={setRoleTitle}
          placeholder="Operations Executive"
        />

        <View style={styles.formSplit}>
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
            <Text style={styles.fieldLabel}>Phone Number</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
            />
          </View>
        </View>

        <Text style={styles.fieldLabel}>Security Station Key Identifier</Text>
        <TextInput
          style={styles.input}
          value={stationKey}
          onChangeText={setStationKey}
          placeholder="CBH-HQ-OP-901"
          autoCapitalize="characters"
        />

        <Text style={styles.fieldLabel}>Industrial Plant Node Location</Text>
        <TextInput
          style={styles.input}
          value={plantLocation}
          onChangeText={setPlantLocation}
          placeholder="Ludhiana Central Works"
        />
      </MobileCard>

      {/* SECTION 2: PASSCODE SECURITY PROTOCOL */}
      <MobileCard>
        <Text style={styles.cardHeading}>Terminal Passcode &amp; Encryption Key</Text>

        <Text style={styles.fieldLabel}>Current Security Passcode</Text>
        <TextInput
          style={styles.input}
          value={currentPasscode}
          onChangeText={setCurrentPasscode}
          secureTextEntry
          placeholder="Enter current passcode"
        />

        <View style={styles.formSplit}>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>New Passcode</Text>
            <TextInput
              style={styles.input}
              value={newPasscode}
              onChangeText={setNewPasscode}
              secureTextEntry
              placeholder="Minimum 6 chars"
            />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.fieldLabel}>Confirm Passcode</Text>
            <TextInput
              style={styles.input}
              value={confirmPasscode}
              onChangeText={setConfirmPasscode}
              secureTextEntry
              placeholder="Re-enter passcode"
            />
          </View>
        </View>
      </MobileCard>

      {/* SECTION 3: SYSTEM PERMISSIONS & NOTIFICATION TOGGLES */}
      <MobileCard>
        <Text style={styles.cardHeading}>Operational Protocols &amp; 2FA</Text>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Two-Factor Authentication (2FA)</Text>
            <Text style={styles.switchDesc}>Enforce cryptographic handshake on sign in</Text>
          </View>
          <TouchableOpacity
            onPress={() => setTwoFactorAuth(!twoFactorAuth)}
            style={[styles.toggleBtn, twoFactorAuth && styles.toggleBtnActive]}
          >
            <Text style={styles.toggleText}>{twoFactorAuth ? 'ACTIVE' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Instant RFQ Quotation Alerts</Text>
            <Text style={styles.switchDesc}>Push notifications when high-volume inquiries land</Text>
          </View>
          <TouchableOpacity
            onPress={() => setRfqSmsAlerts(!rfqSmsAlerts)}
            style={[styles.toggleBtn, rfqSmsAlerts && styles.toggleBtnActive]}
          >
            <Text style={styles.toggleText}>{rfqSmsAlerts ? 'ACTIVE' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.switchRow}>
          <View style={{ flex: 1 }}>
            <Text style={styles.switchTitle}>Inventory Discrepancy Telemetry</Text>
            <Text style={styles.switchDesc}>Real-time alert if ERPNext stock varies &gt; 5%</Text>
          </View>
          <TouchableOpacity
            onPress={() => setDiscrepancyAlerts(!discrepancyAlerts)}
            style={[styles.toggleBtn, discrepancyAlerts && styles.toggleBtnActive]}
          >
            <Text style={styles.toggleText}>{discrepancyAlerts ? 'ACTIVE' : 'OFF'}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity onPress={handleSaveProfile} style={styles.saveBtn} activeOpacity={0.8}>
          <Text style={styles.saveBtnText}>Save Clearance Protocols</Text>
        </TouchableOpacity>
      </MobileCard>

      {/* SECTION 4: STATION SPECS & LOGOUT */}
      <MobileCard>
        <Text style={styles.cardHeading}>Terminal Enclave Hardware Specs</Text>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Hardware Station ID:</Text>
          <Text style={styles.specVal}>{stationKey}</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Data Center Node:</Text>
          <Text style={styles.specVal}>LUDHIANA-CENTRAL-DC1</Text>
        </View>
        <View style={styles.specRow}>
          <Text style={styles.specKey}>Security Cipher:</Text>
          <Text style={[styles.specVal, { color: '#059669' }]}>TLS 1.3 / AES-256</Text>
        </View>
      </MobileCard>

      <TouchableOpacity onPress={onLogout} style={styles.logoutBtn} activeOpacity={0.8}>
        <Text style={styles.logoutBtnText}>🔒 End Operations Session &amp; Sign Out</Text>
      </TouchableOpacity>
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
    fontSize: 15,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  userRole: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
  },
  clearanceBadge: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
    alignSelf: 'flex-start',
    marginTop: 6,
    borderWidth: 1,
    borderColor: '#334155',
  },
  clearanceText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#38BDF8',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  switchBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  switchBtnText: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '800',
  },
  cardHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  formSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  switchTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#1E293B',
  },
  switchDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  toggleBtn: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  specVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  logoutBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 4,
  },
  logoutBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '800',
  },
});
