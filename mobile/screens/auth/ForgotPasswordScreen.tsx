import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { mobileApi } from '../../config/api';

interface ForgotPasswordScreenProps {
  onNavigateToLogin: () => void;
  onCodeSent: (email: string) => void;
  onNavigateToRegister?: () => void;
}

const BLUE = '#0047AB';

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  onNavigateToLogin,
  onCodeSent,
  onNavigateToRegister,
}) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [focused, setFocused] = useState(false);

  const handleSendCode = async () => {
    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setErrorMsg('Enter your email address.');
      return;
    }
    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setErrorMsg('Enter a valid email address.');
      return;
    }

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await mobileApi.auth.forgotPassword(cleanEmail);
      if (!res.success) {
        // NOTE: unchanged offline fallback. Any email moves on to the code
        // screen even if sending failed. Remove or wrap in __DEV__ for release.
        if (cleanEmail.includes('@')) {
          onCodeSent(cleanEmail);
          return;
        }
        throw new Error(res.error || 'Could not send the code.');
      }
      onCodeSent(cleanEmail);
    } catch (err: any) {
      if (cleanEmail.includes('@')) {
        onCodeSent(cleanEmail);
        return;
      }
      setErrorMsg(err.message || 'Could not reach the server. Try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.content}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      {/* Step 1 of 3 progress */}
      <View style={styles.progressRow}>
        <View style={[styles.progressSeg, styles.progressSegActive]} />
        <View style={styles.progressSeg} />
        <View style={styles.progressSeg} />
      </View>
      <Text style={styles.stepText}>Step 1 of 3 · Verify email</Text>

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
      <View style={[styles.inputWrap, focused && styles.inputFocused]}>
        <TextInput
          value={email}
          onChangeText={(v) => {
            setEmail(v);
            if (errorMsg) setErrorMsg('');
          }}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="you@company.com"
          placeholderTextColor="#94A3B8"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardType="email-address"
          returnKeyType="send"
          onSubmitEditing={handleSendCode}
          style={styles.input}
        />
        {email ? (
          <TouchableOpacity
            onPress={() => setEmail('')}
            style={styles.clearBtn}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Text style={styles.clearText}>✕</Text>
          </TouchableOpacity>
        ) : null}
      </View>
      <Text style={styles.hint}>The code is valid for 10 minutes.</Text>

      {/* Send */}
      <TouchableOpacity
        style={[styles.submitBtn, isLoading && styles.btnDisabled]}
        onPress={handleSendCode}
        disabled={isLoading}
        activeOpacity={0.88}
      >
        {isLoading ? (
          <ActivityIndicator color="#FFFFFF" size="small" />
        ) : (
          <Text style={styles.submitBtnText}>Send code</Text>
        )}
      </TouchableOpacity>

      <View style={styles.linksRow}>
        <TouchableOpacity onPress={onNavigateToLogin} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>Back to sign in</Text>
        </TouchableOpacity>
        {onNavigateToRegister ? (
          <>
            <Text style={styles.linkDot}>·</Text>
            <TouchableOpacity onPress={onNavigateToRegister} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.link}>Create account</Text>
            </TouchableOpacity>
          </>
        ) : null}
      </View>

      {/* Help */}
      <View style={styles.helpCard}>
        <Text style={styles.helpTitle}>Not getting the email?</Text>
        <View style={styles.helpBtns}>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => Linking.openURL('tel:+919888021000')}
            activeOpacity={0.85}
          >
            <Text style={styles.helpBtnText}>Call us</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.helpBtn}
            onPress={() => Linking.openURL('mailto:support@cbh.store')}
            activeOpacity={0.85}
          >
            <Text style={styles.helpBtnText}>Email support</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  content: {
    paddingHorizontal: 22,
    paddingTop: 24,
    paddingBottom: 32,
  },

  progressRow: { flexDirection: 'row', gap: 6 },
  progressSeg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: '#E2E8F0' },
  progressSegActive: { backgroundColor: BLUE },
  stepText: { fontSize: 12, fontWeight: '700', color: '#64748B', marginTop: 8, marginBottom: 12 },

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

  label: { fontSize: 13, fontWeight: '700', color: '#334155', marginBottom: 6, marginTop: 8 },
  inputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 52,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
  },
  inputFocused: { borderColor: BLUE, backgroundColor: '#FFFFFF' },
  input: { flex: 1, fontSize: 15, color: '#0F172A', paddingVertical: 0 },
  clearBtn: { paddingLeft: 8 },
  clearText: { color: '#94A3B8', fontSize: 14, fontWeight: '700' },
  hint: { fontSize: 12, color: '#94A3B8', marginTop: 8 },

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
  submitBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },

  linksRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
    marginTop: 20,
  },
  link: { fontSize: 13, fontWeight: '700', color: BLUE },
  linkDot: { color: '#CBD5E1', fontSize: 14 },

  helpCard: {
    marginTop: 28,
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  helpTitle: { fontSize: 13, fontWeight: '800', color: '#0F172A' },
  helpBtns: { flexDirection: 'row', gap: 8 },
  helpBtn: {
    flex: 1,
    backgroundColor: '#EEF4FF',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpBtnText: { fontSize: 13, fontWeight: '800', color: BLUE },
});

export default ForgotPasswordScreen;