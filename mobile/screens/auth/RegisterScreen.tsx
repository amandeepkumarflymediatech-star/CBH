import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Modal,
  SafeAreaView,
} from 'react-native';
import { PasswordEyeIcon } from '../../components/PasswordEyeIcon';
import { mobileApi } from '../../config/api';
import { CustomerPoliciesScreen } from '../customer/CustomerPoliciesScreen';
import { MobileAuthUser } from '../../types';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: (email: string) => void;
  onSuccess?: (user: MobileAuthUser) => void;
}

const BLUE = '#0047AB';

// Reusable input with focus highlight and optional show/hide toggle
const Field: React.FC<{
  label: string;
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  optional?: boolean;
  secure?: boolean;
  keyboardType?: any;
  autoCapitalize?: 'none' | 'characters' | 'words' | 'sentences';
}> = ({ label, value, onChangeText, placeholder, optional, secure, keyboardType, autoCapitalize }) => {
  const [focused, setFocused] = useState(false);
  const [visible, setVisible] = useState(false);

  return (
    <View style={styles.fieldWrap}>
      <View style={styles.labelRow}>
        <Text style={styles.label}>{label}</Text>
        {optional ? <Text style={styles.optional}>Optional</Text> : null}
      </View>
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          value={value}
          onChangeText={onChangeText}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder={placeholder}
          placeholderTextColor="#94A3B8"
          secureTextEntry={secure && !visible}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize ?? (secure || keyboardType === 'email-address' ? 'none' : 'words')}
          autoCorrect={false}
          style={styles.input}
        />
        {secure ? (
          <TouchableOpacity
            style={styles.eyeBtn}
            onPress={() => setVisible((v) => !v)}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            activeOpacity={0.7}
            accessibilityLabel={visible ? 'Hide password' : 'Show password'}
          >
            <PasswordEyeIcon visible={visible} />
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
  onSuccess,
}) => {
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [agreedTerms, setAgreedTerms] = useState(false);
  const [isPolicyModalOpen, setIsPolicyModalOpen] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [registeredUser, setRegisteredUser] = useState<MobileAuthUser | null>(null);

  const handleRegister = async () => {
    if (!companyName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Fill in company, name, email and password.');
      return;
    }
    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match.');
      return;
    }
    if (!agreedTerms) {
      setErrorMsg('Accept the terms to continue.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await mobileApi.auth.register({
        companyName: companyName.trim(),
        fullName: fullName.trim(),
        email: email.trim(),
        phone: phone.trim(),
        gstin: gstin.trim().toUpperCase(),
        password,
      });

      const createdUser: MobileAuthUser = res.user || {
        id: Date.now(),
        email: email.trim(),
        fullName: fullName.trim(),
        companyName: companyName.trim(),
        role: 'customer',
        tier: 'STANDARD',
        tierDiscountPct: 0,
        creditLimit: 100000,
        phone: phone.trim(),
        gstin: gstin.trim().toUpperCase(),
      };
      setRegisteredUser(createdUser);

      if (!res.success) {
        // NOTE: unchanged demo fallback. A failed registration still shows
        // success when the email has an "@". Remove before release.
        if (email.includes('@')) {
          setIsSuccess(true);
          if (onRegisterSuccess) onRegisterSuccess(email);
          return;
        }
        throw new Error(res.error || 'Could not create your account.');
      }

      setIsSuccess(true);
      if (onRegisterSuccess) onRegisterSuccess(email);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  // ---- Success ----
  if (isSuccess) {
    return (
      <View style={styles.successWrap}>
        <View style={styles.successCircle}>
          <Text style={styles.successCheck}>✓</Text>
        </View>
        <Text style={styles.successTitle}>Account created</Text>
        <Text style={styles.successText}>
          Welcome aboard. You can now order with{' '}
          <Text style={styles.bold}>{email}</Text>.
        </Text>
        <TouchableOpacity
          style={styles.submitBtn}
          activeOpacity={0.88}
          onPress={() => {
            if (onSuccess && registeredUser) onSuccess(registeredUser);
            else onNavigateToLogin();
          }}
        >
          <Text style={styles.submitBtnText}>{onSuccess ? 'Continue' : 'Go to sign in'}</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const clear = (setter: (v: string) => void) => (v: string) => {
    setter(v);
    if (errorMsg) setErrorMsg('');
  };

  return (
    <>
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

        <Text style={styles.section}>Company</Text>
        <Field
          label="Company name"
          value={companyName}
          onChangeText={clear(setCompanyName)}
          placeholder="Apex Infrastructure Ltd"
        />
        <Field
          label="GSTIN"
          optional
          value={gstin}
          onChangeText={clear(setGstin)}
          placeholder="27AABCA1234F1Z5"
          autoCapitalize="characters"
        />

        <Text style={styles.section}>Contact</Text>
        <Field
          label="Your name"
          value={fullName}
          onChangeText={clear(setFullName)}
          placeholder="Rajesh Sharma"
        />
        <Field
          label="Work email"
          value={email}
          onChangeText={clear(setEmail)}
          placeholder="you@company.com"
          keyboardType="email-address"
        />
        <Field
          label="Mobile"
          optional
          value={phone}
          onChangeText={clear(setPhone)}
          placeholder="10-digit number"
          keyboardType="phone-pad"
        />

        <Text style={styles.section}>Password</Text>
        <Field
          label="Password"
          value={password}
          onChangeText={clear(setPassword)}
          placeholder="At least 6 characters"
          secure
        />
        <Field
          label="Confirm password"
          value={confirmPassword}
          onChangeText={clear(setConfirmPassword)}
          placeholder="Re-enter password"
          secure
        />

        {/* Terms */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedTerms(!agreedTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
            {agreedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the{' '}
            <Text onPress={() => setIsPolicyModalOpen(true)} style={styles.termsLink}>
              terms &amp; policies
            </Text>
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Create account</Text>
          )}
        </TouchableOpacity>

        <View style={styles.switchRow}>
          <Text style={styles.switchText}>Already registered?</Text>
          <TouchableOpacity onPress={onNavigateToLogin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.switchLink}> Sign in</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Terms & policies sheet */}
      <Modal
        visible={isPolicyModalOpen}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setIsPolicyModalOpen(false)}
      >
        <SafeAreaView style={styles.policyScreen}>
          <View style={styles.policyHeader}>
            <Text style={styles.policyTitle}>Terms &amp; policies</Text>
            <TouchableOpacity
              onPress={() => setIsPolicyModalOpen(false)}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.policyDone}>Done</Text>
            </TouchableOpacity>
          </View>
          <CustomerPoliciesScreen />
        </SafeAreaView>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },

  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FEF2F2',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
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

  section: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 12,
    marginBottom: 2,
  },

  fieldWrap: { marginTop: 10 },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  label: { fontSize: 13, fontWeight: '700', color: '#334155' },
  optional: { fontSize: 12, color: '#94A3B8', fontWeight: '600' },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 50,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingLeft: 16,
    paddingRight: 8,
  },
  inputFocused: { borderColor: BLUE, backgroundColor: '#FFFFFF' },
  input: { flex: 1, fontSize: 15, color: '#0F172A' },
  eyeBtn: { padding: 8, alignItems: 'center', justifyContent: 'center' },

  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: { backgroundColor: BLUE, borderColor: BLUE },
  checkmark: { color: '#FFFFFF', fontSize: 13, fontWeight: '900' },
  termsText: { flex: 1, fontSize: 13, color: '#64748B' },
  termsLink: { color: BLUE, fontWeight: '700' },

  submitBtn: {
    height: 54,
    backgroundColor: BLUE,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 20,
    elevation: 3,
    shadowColor: BLUE,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    alignSelf: 'stretch',
  },
  btnDisabled: { opacity: 0.6 },
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 18,
  },
  switchText: { fontSize: 13, color: '#64748B' },
  switchLink: { fontSize: 13, fontWeight: '800', color: BLUE },

  // Success
  successWrap: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
  },
  successCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  successCheck: { fontSize: 36, color: '#16A34A', fontWeight: '900' },
  successTitle: { fontSize: 22, fontWeight: '800', color: '#0F172A' },
  successText: {
    fontSize: 14,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginTop: 6,
    marginBottom: 8,
  },
  bold: { fontWeight: '700', color: '#0F172A' },

  // Policy sheet
  policyScreen: { flex: 1, backgroundColor: '#FFFFFF' },
  policyHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  policyTitle: { fontSize: 17, fontWeight: '800', color: '#0F172A' },
  policyDone: { fontSize: 15, fontWeight: '800', color: BLUE },
});

export default RegisterScreen;