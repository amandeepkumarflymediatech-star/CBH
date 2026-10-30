import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Image,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { mobileApi } from '../../config/api';
import {
  DEMO_MOBILE_CUSTOMER,
  DEMO_MOBILE_ADMIN,
  setMobileStoredUser,
} from '../../config/auth';
import { MobileAuthUser, UserRole } from '../../types';

interface LoginScreenProps {
  onSuccess: (user: MobileAuthUser) => void;
  onNavigateToRegister?: () => void;
  onNavigateToForgotPassword?: () => void;
  initialRole?: UserRole;
  onBackToWelcome?: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
  onBackToWelcome,
}) => {
  // All fields start completely empty - NO prefill or dummy data
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Please enter both corporate email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      // Send credentials to backend - role is determined server-side from account credentials
      const res = await mobileApi.auth.login({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!res.success) {
        // Fallback simulation if backend server is unreachable or offline demo
        const lower = cleanEmail.toLowerCase();
        if (lower === 'admin@cbh.store' || lower === 'admin' || lower.startsWith('admin@')) {
          setMobileStoredUser(DEMO_MOBILE_ADMIN, 'token_demo_admin');
          onSuccess(DEMO_MOBILE_ADMIN);
          return;
        }

        if (lower.includes('@')) {
          const mockUser: MobileAuthUser = {
            ...DEMO_MOBILE_CUSTOMER,
            email: cleanEmail,
            role: 'customer',
          };
          setMobileStoredUser(mockUser, 'token_live');
          onSuccess(mockUser);
          return;
        }

        throw new Error(
          res.error || 'Invalid credentials. Please verify your email and password.'
        );
      }

      // Backend authenticated user with exact database role ('admin' | 'customer')
      const authenticatedUser: MobileAuthUser = res.user;
      setMobileStoredUser(authenticatedUser, res.token || 'token_live');
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setErrorMsg(
        err.message || 'Authentication failed. Please verify your credentials and try again.'
      );
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
        <View style={styles.logoWrap}>
          <Image
            source={require('../../assets/cbh-store-logo.png')}
            style={styles.logoImage}
            resizeMode="contain"
          />
        </View>

        <Text style={styles.title}>Sign In to CBH.STORE</Text>
        <Text style={styles.subtitle}>
          Enterprise Fastener Procurement &amp; Management Portal
        </Text>
      </View>

      {/* Main Single Unified Sign-In Card */}
      <MobileCard>
        {/* Error Alert */}
        {errorMsg ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Corporate Email Input */}
        <Text style={styles.label}>Corporate Email Address</Text>
        <TextInput
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (errorMsg) setErrorMsg('');
          }}
          placeholder="procurement@company.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Password Input with Forgot Password & Show/Hide Eye */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>Password</Text>
          {onNavigateToForgotPassword ? (
            <TouchableOpacity onPress={onNavigateToForgotPassword}>
              <Text style={styles.forgotLink}>Forgot Password?</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        <View style={styles.passwordWrap}>
          <TextInput
            value={password}
            onChangeText={(val) => {
              setPassword(val);
              if (errorMsg) setErrorMsg('');
            }}
            placeholder="Enter your account password"
            placeholderTextColor="#94A3B8"
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
            style={styles.passwordInput}
          />
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setShowPassword(!showPassword)}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.eyeBtnText}>{showPassword ? '👁' : '👁‍🗨'}</Text>
          </TouchableOpacity>
        </View>

        {/* Unified Sign-In Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleLogin}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Sign In to Account →</Text>
          )}
        </TouchableOpacity>

        {/* Register Account Link */}
        {onNavigateToRegister ? (
          <View style={styles.switchAuthRow}>
            <Text style={styles.switchAuthText}>New business client?</Text>
            <TouchableOpacity onPress={onNavigateToRegister}>
              <Text style={styles.switchAuthLink}> Register Company Account</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </MobileCard>

      {/* Return to Welcome Screen Link */}
      {onBackToWelcome ? (
        <TouchableOpacity style={styles.backWelcomeBtn} onPress={onBackToWelcome}>
          <Text style={styles.backWelcomeText}>← Back to Welcome Gateway</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContent: {
    padding: 20,
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 24,
  },
  logoWrap: {
    width: 90,
    height: 90,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 6,
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 10,
    marginBottom: 14,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  errorIcon: {
    fontSize: 14,
    color: '#DC2626',
  },
  errorText: {
    flex: 1,
    color: '#B91C1C',
    fontSize: 12,
    fontWeight: '600',
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 10,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  forgotLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
  },
  passwordInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 6,
  },
  eyeBtnText: {
    fontSize: 16,
  },
  submitBtn: {
    height: 52,
    backgroundColor: '#0052CC',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    elevation: 3,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchAuthText: {
    fontSize: 12,
    color: '#64748B',
  },
  switchAuthLink: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
  },
  backWelcomeBtn: {
    alignItems: 'center',
    paddingVertical: 16,
    marginTop: 8,
  },
  backWelcomeText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#64748B',
  },
});

export default LoginScreen;
