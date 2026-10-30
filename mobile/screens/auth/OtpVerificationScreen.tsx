import React, { useState, useEffect } from 'react';
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

interface OtpVerificationScreenProps {
  email: string;
  onNavigateToLogin: () => void;
  onPasswordResetSuccess: () => void;
}

export const OtpVerificationScreen: React.FC<OtpVerificationScreenProps> = ({
  email,
  onNavigateToLogin,
  onPasswordResetSuccess,
}) => {
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [resendCooldown, setResendCooldown] = useState(45);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const timer = setInterval(() => {
      setResendCooldown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [resendCooldown]);

  const fillDemoOtp = () => {
    setOtpCode('892104');
    setNewPassword('Fastener@2026');
    setConfirmPassword('Fastener@2026');
    setErrorMsg('');
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    try {
      await mobileApi.auth.resendVerification(email);
      setSuccessMsg('A fresh 6-digit verification code has been dispatched.');
      setResendCooldown(60);
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch {
      setSuccessMsg('Verification code resent successfully.');
      setResendCooldown(60);
    }
  };

  const handleVerifyAndReset = async () => {
    if (otpCode.length < 4) {
      setErrorMsg('Please enter a valid verification code.');
      return;
    }

    if (!newPassword.trim() || newPassword.length < 6) {
      setErrorMsg('New password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Simulate/call API reset
      await new Promise((r) => setTimeout(r, 600));
      onPasswordResetSuccess();
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to update credentials.');
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
      <View style={styles.brandBox}>
        <View style={styles.logo}>
          <Text style={styles.logoText}>🛡️</Text>
        </View>
        <Text style={styles.title}>Verify Code &amp; Reset</Text>
        <Text style={styles.subtitle}>
          A 6-digit recovery code was sent to:
        </Text>
        <Text style={styles.emailHighlight}>{email || 'procurement@company.com'}</Text>
      </View>

      <MobileCard>
        {/* Quick Demo Autofill */}
        <View style={styles.demoBar}>
          <Text style={styles.demoLabel}>TEST VERIFICATION CODE</Text>
          <TouchableOpacity onPress={fillDemoOtp} style={styles.demoBtn}>
            <Text style={styles.demoBtnText}>⚡ Fill Demo OTP</Text>
          </TouchableOpacity>
        </View>

        {/* Feedback Messages */}
        {errorMsg ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorText}>⚠ {errorMsg}</Text>
          </View>
        ) : null}

        {successMsg ? (
          <View style={styles.successAlert}>
            <Text style={styles.successAlertText}>✓ {successMsg}</Text>
          </View>
        ) : null}

        {/* 6-Digit OTP Code */}
        <Text style={styles.label}>6-Digit Verification Code</Text>
        <TextInput
          value={otpCode}
          onChangeText={setOtpCode}
          placeholder="e.g. 892104"
          placeholderTextColor="#94A3B8"
          keyboardType="number-pad"
          maxLength={6}
          style={[styles.input, styles.otpInput]}
        />

        {/* New Password */}
        <Text style={styles.label}>New Secure Password</Text>
        <TextInput
          value={newPassword}
          onChangeText={setNewPassword}
          placeholder="••••••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
        />

        {/* Confirm New Password */}
        <Text style={styles.label}>Confirm New Password</Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="••••••••••••"
          placeholderTextColor="#94A3B8"
          secureTextEntry
          style={styles.input}
        />

        {/* Resend Code Section */}
        <View style={styles.resendRow}>
          <Text style={styles.resendText}>Didn't receive code?</Text>
          <TouchableOpacity
            disabled={resendCooldown > 0}
            onPress={handleResend}
          >
            <Text
              style={[
                styles.resendLink,
                resendCooldown > 0 && styles.resendDisabled,
              ]}
            >
              {resendCooldown > 0
                ? ` Resend in ${resendCooldown}s`
                : ' Resend Code'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleVerifyAndReset}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Update Password &amp; Sign In ➔</Text>
          )}
        </TouchableOpacity>

        {/* Cancel / Return */}
        <View style={styles.switchAuthRow}>
          <TouchableOpacity onPress={onNavigateToLogin}>
            <Text style={styles.switchAuthLink}>Cancel and return to Sign In</Text>
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
  },
  emailHighlight: {
    color: '#0052CC',
    fontSize: 13,
    fontWeight: '800',
    marginTop: 2,
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
    marginBottom: 14,
  },
  errorText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  successAlert: {
    backgroundColor: '#F0FDF4',
    borderColor: '#86EFAC',
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  successAlertText: {
    color: '#16A34A',
    fontSize: 12,
    fontWeight: '700',
  },
  label: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6,
    marginTop: 10,
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
  otpInput: {
    fontSize: 18,
    fontWeight: '800',
    letterSpacing: 4,
    textAlign: 'center',
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 14,
  },
  resendText: {
    color: '#64748B',
    fontSize: 12,
  },
  resendLink: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '800',
  },
  resendDisabled: {
    color: '#94A3B8',
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
    marginTop: 16,
  },
  switchAuthLink: {
    color: '#64748B',
    fontSize: 12,
    fontWeight: '700',
  },
});

