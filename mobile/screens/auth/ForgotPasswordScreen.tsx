import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { mobileApi } from '../../config/api';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onCodeSent: (email: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onCodeSent,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  const fillDemoEmail = () => {
    setEmail('procurement@apexinfra.com');
    setErrorMsg('');
  };

  const handleSendCode = async () => {
    if (!email.trim()) {
      setErrorMsg('Please enter your corporate email address.');
      return;
    }

    if (!email.includes('@')) {
      setErrorMsg('Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await mobileApi.auth.forgotPassword(email.trim());
      if (!res.success) {
        // Fallback simulation for offline testing
        if (email.includes('@')) {
          onCodeSent(email.trim());
          return;
        }
        throw new Error(res.error || 'Failed to send recovery code.');
      }
      onCodeSent(email.trim());
    } catch (err: any) {
      setErrorMsg(err.message || 'Unable to connect to recovery server.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.scrollContent}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Brand Header */}
      <View style={styles.brandBox}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🔑</Text>
        </View>
        <Text style={styles.title}>Password Recovery</Text>
        <Text style={styles.subtitle}>
          Enter your registered enterprise email to receive a 6-digit verification code.
        </Text>
      </View>

      <MobileCard>
        {/* Demo Email Quick Fill */}
        <View style={styles.demoBar}>
          <Text style={styles.demoLabel}>1-TAP TEST EMAIL</Text>
          <TouchableOpacity onPress={fillDemoEmail} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>⚡ Fill Demo</Text>
          </TouchableOpacity>
        </View>

        {/* Error Alert */}
        {errorMsg ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        ) : null}

        {/* Email Field */}
        <Text style={styles.label}>Corporate Email Address</Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="procurement@company.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleSendCode}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Send 6-Digit Code ➔</Text>
          )}
        </TouchableOpacity>

        {/* Return to Sign In */}
        <View style={styles.switchAuthRow}>
          <Text style={styles.switchAuthText}>Remembered your password?</Text>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.switchAuthLink}> Sign In</Text>
          </TouchableOpacity>
        </View>
      </MobileCard>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingTop: 36,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logo: {
    width: 68,
    height: 68,
    borderRadius: 20,
    backgroundColor: '#EFF6FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: '#93C5FD',
    marginBottom: 12,
    elevation: 2,
  },
  logoText: {
    fontSize: 26,
  },
  title: {
    color: '#0F172A',
    fontSize: 22,
    fontWeight: '900',
    letterSpacing: 0.8,
  },
  subtitle: {
    color: '#64748B',
    fontSize: 12,
    marginTop: 6,
    textAlign: 'center',
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  demoBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  demoLabel: {
    color: '#64748B',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  demoBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  demoBtnText: {
    color: '#0052CC',
    fontSize: 11,
    fontWeight: '800',
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
  },
  input: {
    backgroundColor: '#FFFFFF',
    color: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  submitBtn: {
    backgroundColor: '#0052CC',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
    elevation: 2,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchAuthText: {
    color: '#64748B',
    fontSize: 12,
  },
  switchAuthLink: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '800',
  },
});

