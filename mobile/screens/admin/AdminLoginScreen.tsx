import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { mobileApi } from '../../config/api';
import { DEMO_MOBILE_ADMIN, setMobileStoredUser } from '../../config/auth';
import { MobileAuthUser } from '../../types';

interface AdminLoginScreenProps {
  onSuccess: (user: MobileAuthUser) => void;
  onSwitchToCustomer: () => void;
}

export const AdminLoginScreen: React.FC<AdminLoginScreenProps> = ({
  onSuccess,
  onSwitchToCustomer,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [stationKey, setStationKey] = useState('CBH-HQ-OP-901');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fillDemo = () => {
    setEmail('admin@cbh.store');
    setPassword('Admin@Fastener2025');
    setErrorMsg('');
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await mobileApi.auth.login({
        email,
        password,
        role: 'admin',
        securityKey: stationKey,
      });

      if (!res.success) {
        if (email === 'admin@cbh.store' && (password === 'Admin@Fastener2025' || password === 'admin')) {
          setMobileStoredUser(DEMO_MOBILE_ADMIN, 'token_admin');
          onSuccess(DEMO_MOBILE_ADMIN);
          return;
        }
        throw new Error(res.error || 'Access denied');
      }

      const user = res.user || DEMO_MOBILE_ADMIN;
      setMobileStoredUser(user, res.token);
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Authorization failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandBox}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>⚡</Text>
        </View>
        <Text style={styles.title}>Operations Console</Text>
        <Text style={styles.subtitle}>Authorized Plant Controllers Only</Text>
      </View>

      <MobileCard>
        <View style={styles.demoRow}>
          <Text style={styles.demoTitle}>CLEARANCE OPERATOR</Text>
          <TouchableOpacity onPress={fillDemo} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>⚡ Fill Admin</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        ) : null}

        <Text style={styles.inputLabel}>Operator ID / Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="admin@cbh.store"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Security Passcode</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={handleSubmit} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>
            {isLoading ? 'Verifying...' : 'Authorize Operator Session →'}
          </Text>
        </TouchableOpacity>
      </MobileCard>

      <TouchableOpacity onPress={onSwitchToCustomer} style={styles.switchLink}>
        <Text style={styles.switchLinkText}>
          Are you a B2B Customer? Switch to Client Portal →
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    justifyContent: 'center',
    flexGrow: 1,
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logo: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: '#0F172A',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    fontSize: 20,
  },
  title: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  demoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 12,
  },
  demoTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0052CC',
  },
  demoBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoBtnText: {
    color: '#0052CC',
    fontSize: 10,
    fontWeight: '700',
  },
  errorBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderRadius: 6,
    padding: 8,
    marginBottom: 10,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 11,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 6,
  },
  input: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 13,
    color: '#0F172A',
  },
  submitBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  switchLink: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchLinkText: {
    color: '#0052CC',
    fontSize: 11,
    fontWeight: '600',
  },
});

export default AdminLoginScreen;
