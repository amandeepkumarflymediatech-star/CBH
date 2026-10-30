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

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
  onRegisterSuccess?: (email: string) => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({
  onNavigateToLogin,
  onRegisterSuccess,
}) => {
  // All fields start completely empty - NO auto-fill
  const [companyName, setCompanyName] = useState('');
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [gstin, setGstin] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [agreedTerms, setAgreedTerms] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const handleRegister = async () => {
    if (!companyName.trim() || !fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMsg('Please complete all required fields marked with *');
      return;
    }

    if (password.length < 6) {
      setErrorMsg('Password must be at least 6 characters long.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMsg('Passwords do not match. Please verify your password.');
      return;
    }

    if (!agreedTerms) {
      setErrorMsg('Please accept the B2B Procurement Terms to create an enterprise account.');
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

      if (!res.success) {
        if (email.includes('@')) {
          setIsSuccess(true);
          if (onRegisterSuccess) onRegisterSuccess(email);
          return;
        }
        throw new Error(res.error || 'Failed to create business account.');
      }

      setIsSuccess(true);
      if (onRegisterSuccess) onRegisterSuccess(email);
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please check network connection.');
    } finally {
      setIsLoading(false);
    }
  };

  if (isSuccess) {
    return (
      <View style={styles.successContainer}>
        <View style={styles.successCard}>
          <Text style={styles.successIcon}>✓</Text>
          <Text style={styles.successTitle}>Account Registered!</Text>
          <Text style={styles.successText}>
            Welcome to CBH Fasteners India. Your enterprise procurement account has
            been created for <Text style={styles.boldText}>{email}</Text>.
          </Text>
          <TouchableOpacity style={styles.successBtn} onPress={onNavigateToLogin}>
            <Text style={styles.successBtnText}>Proceed to Sign In →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

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

        <Text style={styles.title}>Register B2B Account</Text>
        <Text style={styles.subtitle}>
          Direct Mill Procurement, Dynamic Slab Pricing &amp; Stamped NABL MTC Certificates
        </Text>
      </View>

      <MobileCard>
        {/* Error Alert */}
        {errorMsg ? (
          <View style={styles.errorAlert}>
            <Text style={styles.errorIcon}>⚠</Text>
            <Text style={styles.errorText}>{errorMsg}</Text>
          </View>
        ) : null}

        {/* Company Name */}
        <Text style={styles.label}>
          Company / Business Legal Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={companyName}
          onChangeText={setCompanyName}
          placeholder="e.g. Apex Infrastructure EPC Ltd"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        {/* Contact Person Name */}
        <Text style={styles.label}>
          Authorized Buyer / Contact Name <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={fullName}
          onChangeText={setFullName}
          placeholder="e.g. Rajesh Sharma"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        {/* Corporate Email */}
        <Text style={styles.label}>
          Corporate Email Address <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={email}
          onChangeText={setEmail}
          placeholder="procurement@company.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          keyboardType="email-address"
          style={styles.input}
        />

        {/* Mobile Number & GSTIN in a Row */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Mobile Number</Text>
            <TextInput
              value={phone}
              onChangeText={setPhone}
              placeholder="10-digit number"
              placeholderTextColor="#94A3B8"
              keyboardType="phone-pad"
              style={styles.input}
            />
          </View>

          <View style={{ flex: 1 }}>
            <Text style={styles.label}>GSTIN (Optional)</Text>
            <TextInput
              value={gstin}
              onChangeText={setGstin}
              placeholder="27AABCA1234F1Z5"
              placeholderTextColor="#94A3B8"
              autoCapitalize="characters"
              style={styles.input}
            />
          </View>
        </View>

        {/* Password */}
        <View style={styles.labelRow}>
          <Text style={styles.label}>
            Password <Text style={styles.required}>*</Text>
          </Text>
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={styles.showText}>{showPassword ? 'Hide' : 'Show'}</Text>
          </TouchableOpacity>
        </View>
        <TextInput
          value={password}
          onChangeText={setPassword}
          placeholder="Minimum 6 characters"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          style={styles.input}
        />

        {/* Confirm Password */}
        <Text style={styles.label}>
          Confirm Password <Text style={styles.required}>*</Text>
        </Text>
        <TextInput
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          placeholder="Re-enter your password"
          placeholderTextColor="#94A3B8"
          secureTextEntry={!showPassword}
          style={styles.input}
        />

        {/* Terms & Conditions Checkbox */}
        <TouchableOpacity
          style={styles.termsRow}
          onPress={() => setAgreedTerms(!agreedTerms)}
          activeOpacity={0.8}
        >
          <View style={[styles.checkbox, agreedTerms && styles.checkboxChecked]}>
            {agreedTerms ? <Text style={styles.checkmark}>✓</Text> : null}
          </View>
          <Text style={styles.termsText}>
            I agree to the <Text style={styles.termsLink}>B2B Procurement Terms</Text> &amp;{' '}
            <Text style={styles.termsLink}>Commercial Policies</Text>
          </Text>
        </TouchableOpacity>

        {/* Register Button */}
        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.btnDisabled]}
          onPress={handleRegister}
          disabled={isLoading}
          activeOpacity={0.88}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.submitBtnText}>Create Enterprise Account →</Text>
          )}
        </TouchableOpacity>

        {/* Sign In Link */}
        <View style={styles.switchAuthRow}>
          <Text style={styles.switchAuthText}>Existing business client?</Text>
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
    paddingTop: 24,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
    minHeight: '100%',
  },
  brandBox: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoWrap: {
    width: 80,
    height: 80,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
    paddingHorizontal: 16,
  },
  errorAlert: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
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
  showText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  required: {
    color: '#EF4444',
  },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  row: {
    flexDirection: 'row',
    gap: 10,
  },
  termsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 6,
    gap: 10,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 5,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxChecked: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  termsText: {
    flex: 1,
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  termsLink: {
    color: '#0052CC',
    fontWeight: '700',
  },
  submitBtn: {
    backgroundColor: '#0052CC',
    height: 50,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    elevation: 2,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  switchAuthRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
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
  successContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    backgroundColor: '#F8FAFC',
  },
  successCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    width: '100%',
    elevation: 4,
  },
  successIcon: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#ECFDF5',
    color: '#059669',
    fontSize: 26,
    fontWeight: '900',
    textAlign: 'center',
    lineHeight: 52,
    marginBottom: 12,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  successText: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 20,
  },
  boldText: {
    fontWeight: '700',
    color: '#0F172A',
  },
  successBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
  },
  successBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
});

export default RegisterScreen;
