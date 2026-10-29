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
import { DEMO_MOBILE_CUSTOMER, setMobileStoredUser } from '../../config/auth';
import { MobileAuthUser } from '../../types';

interface CustomerAuthScreenProps {
  onSuccess: (user: MobileAuthUser) => void;
  onSwitchToAdmin: () => void;
}

export const CustomerAuthScreen: React.FC<CustomerAuthScreenProps> = ({
  onSuccess,
  onSwitchToAdmin,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const fillDemo = () => {
    setEmail('procurement@apexinfra.com');
    setPassword('Password@123');
    setErrorMsg('');
  };

  const handleLogin = async () => {
    setIsLoading(true);
    setErrorMsg('');
    try {
      const res = await mobileApi.auth.login({ email, password, role: 'customer' });
      if (!res.success) {
        if (email.includes('apex') || email.includes('procure')) {
          setMobileStoredUser(DEMO_MOBILE_CUSTOMER, 'token_demo');
          onSuccess(DEMO_MOBILE_CUSTOMER);
          return;
        }
        throw new Error(res.error || 'Invalid credentials');
      }
      const user = res.user || DEMO_MOBILE_CUSTOMER;
      setMobileStoredUser(user, res.token);
      onSuccess(user);
    } catch (err: any) {
      setErrorMsg(err.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.brandBox}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>CBH</Text>
        </View>
        <Text style={styles.title}>CBH Fasteners Portal</Text>
        <Text style={styles.subtitle}>B2B Bulk Procurement &amp; Stamped MTC</Text>
      </View>

      <MobileCard>
        <View style={styles.demoRow}>
          <Text style={styles.demoTitle}>1-TAP TEST CREDENTIALS</Text>
          <TouchableOpacity onPress={fillDemo} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>⚡ Fill Demo</Text>
          </TouchableOpacity>
        </View>

        {errorMsg ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        ) : null}

        <Text style={styles.inputLabel}>Corporate Email</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="procurement@company.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Password</Text>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="••••••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
        />

        <TouchableOpacity onPress={handleLogin} style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>
            {isLoading ? 'Verifying...' : 'Sign In to Procurement Hub →'}
          </Text>
        </TouchableOpacity>
      </MobileCard>

      <TouchableOpacity onPress={onSwitchToAdmin} style={styles.switchLink}>
        <Text style={styles.switchLinkText}>
          CBH Dispatch Operator or Plant Admin? Switch here →
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
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 16,
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
    backgroundColor: '#0052CC',
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

export default CustomerAuthScreen;
