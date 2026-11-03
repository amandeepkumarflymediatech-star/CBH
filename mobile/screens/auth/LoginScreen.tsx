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
import { PasswordEyeIcon } from '../../components/PasswordEyeIcon';
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
  onBackToWelcome?: () => void; // back arrow now lives in AuthScreen's header
}

type Field = 'email' | 'password' | null;

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onSuccess,
  onNavigateToRegister,
  onNavigateToForgotPassword,
}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [focused, setFocused] = useState<Field>(null);

  const handleLogin = async () => {
    const cleanEmail = email.trim();
    const cleanPass = password.trim();

    if (!cleanEmail || !cleanPass) {
      setErrorMsg('Enter your email and password.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await mobileApi.auth.login({
        email: cleanEmail,
        password: cleanPass,
      });

      if (!res.success) {
        // NOTE: offline demo fallback (unchanged). It signs in ANY email with
        // any password when the backend fails. Remove or wrap in __DEV__
        // before release.
        const lower = cleanEmail.toLowerCase();
        if (lower === 'admin@cbh.store' || lower === 'admin' || lower.startsWith('admin@')) {
          setMobileStoredUser(DEMO_MOBILE_ADMIN, 'token_demo_admin');
          onSuccess(DEMO_MOBILE_ADMIN);
          return;
        }

        if (lower.includes('@')) {
          const parts = cleanEmail.split('@');
          const derivedName = parts[0]
            .replace(/[._-]/g, ' ')
            .replace(/\b\w/g, (c) => c.toUpperCase());
          const domain = parts[1] || 'company.com';
          const companyBase = domain.split('.')[0].replace(/[-_]/g, ' ');
          const derivedCompany =
            companyBase.charAt(0).toUpperCase() + companyBase.slice(1) + ' Industrial Corp';

          const mockUser: MobileAuthUser = {
            id: (Date.now() % 1000000) + 100,
            email: cleanEmail,
            fullName: derivedName || 'Enterprise Partner',
            companyName: derivedCompany,
            role: 'customer',
            tier: 'GOLD',
            tierDiscountPct: 10,
            creditLimit: 500000,
            phone: '+91 98880 21000',
            gstin: '07AAACT0012P1Z8',
          };
          setMobileStoredUser(mockUser, 'token_live');
          onSuccess(mockUser);
          return;
        }

        throw new Error(res.error || 'Wrong email or password.');
      }

      const authenticatedUser: MobileAuthUser = res.user;
      setMobileStoredUser(authenticatedUser, res.token || 'token_live');
      mobileApi.auth.saveSession(authenticatedUser, res.token).catch(() => {});
      onSuccess(authenticatedUser);
    } catch (err: any) {
      setErrorMsg(err.message || 'Could not sign in. Check your details and try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const clearError = () => {
    if (errorMsg) setErrorMsg('');
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {errorMsg ? (
        <View style={styles.errorBox}>
          <View style={styles.errorDot}>
            <Text style={styles.errorDotText}>!</Text>
          </View>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      ) : null}

      {/* Email */}
      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={(v) => {
          setEmail(v);
          clearError();
        }}
        onFocus={() => setFocused('email')}
        onBlur={() => setFocused(null)}
        placeholder="you@company.com"
        placeholderTextColor="#94A3B8"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardType="email-address"
        returnKeyType="next"
        style={[styles.input, focused === 'email' && styles.inputFocused]}
      />

      {/* Password */}
      <Text style={styles.label}>Password</Text>
      <View style={[styles.passwordWrap, focused === 'password' && styles.inputFocused]}>
        <TextInput
          value={password}
          onChangeText={(v) => {
            setPassword(v);
            clearError();
          }}
          onFocus={() => setFocused('password')}
          onBlur={() => setFocused(null)}
          onSubmitEditing={handleLogin}
          placeholder="Your password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          autoCapitalize="none"
          autoCorrect={false}
          returnKeyType="go"
          style={styles.passwordInput}
        />
        <TouchableOpacity
          style={styles.eyeBtn}
          onPress={() => setShowPassword(!showPassword)}
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.7}
          accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
        >
          <PasswordEyeIcon visible={showPassword} />
        </TouchableOpacity>
      </View>

      {onNavigateToForgotPassword ? (
        <TouchableOpacity
          onPress={onNavigateToForgotPassword}
          style={styles.forgotBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.forgotLink}>Forgot password?</Text>
        </TouchableOpacity>
      ) : null}

      {/* Sign in */}
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.btnDisabled]}
        onPress={handleLogin}
        disabled={isLoading}
        activeOpacity={0.88}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Sign in</Text>
        )}
      </TouchableOpacity>

      {/* Register */}
      {onNavigateToRegister ? (
        <>
          <View style={styles.dividerRow}>
            <View style={styles.dividerLine} />
            <Text style={styles.dividerText}>New here?</Text>
            <View style={styles.dividerLine} />
          </View>

          <TouchableOpacity
            style={styles.registerBtn}
            onPress={onNavigateToRegister}
            activeOpacity={0.85}
          >
            <Text style={styles.registerBtnText}>Create company account</Text>
          </TouchableOpacity>
        </>
      ) : null}
    </ScrollView>
  );
};

const BLUE = '#0047AB';

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 28,
    paddingBottom: 32,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 6,
  },
  errorDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  errorDotText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  errorText: { flex: 1, color: '#B91C1C', fontSize: 13, fontWeight: '600' },

  label: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 6,
    marginTop: 14,
  },
  input: {
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    paddingHorizontal: 16,
    fontSize: 15,
    color: '#0F172A',
    backgroundColor: '#F8FAFC',
  },
  inputFocused: {
    borderColor: BLUE,
    backgroundColor: '#FFFFFF',
  },
  passwordWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingLeft: 16,
    paddingRight: 8,
  },
  passwordInput: {
    flex: 1,
    fontSize: 15,
    color: '#0F172A',
  },
  eyeBtn: {
    padding: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },

  forgotBtn: {
    alignSelf: 'flex-end',
    marginTop: 10,
  },
  forgotLink: {
    fontSize: 13,
    fontWeight: '700',
    color: BLUE,
  },

  submitBtn: {
    height: 54,
    backgroundColor: BLUE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
  },

  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 26,
    marginBottom: 14,
  },
  dividerLine: { flex: 1, height: 1, backgroundColor: '#E2E8F0' },
  dividerText: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },

  registerBtn: {
    height: 52,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerBtnText: {
    color: BLUE,
    fontSize: 15,
    fontWeight: '800',
  },
});

export default LoginScreen;