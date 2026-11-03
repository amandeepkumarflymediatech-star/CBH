// import React, { useState, useEffect } from 'react';
// import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
// import { LoginScreen } from './LoginScreen';
// import { RegisterScreen } from './RegisterScreen';
// import { ForgotPasswordScreen } from './ForgotPasswordScreen';
// import { OtpVerificationScreen } from './OtpVerificationScreen';
// import { MobileAuthUser, UserRole } from '../../types';

// export type AuthView = 'login' | 'register' | 'forgot_password' | 'otp_verify';

// interface AuthScreenProps {
//   onSuccess: (user: MobileAuthUser) => void;
//   initialView?: AuthView;
//   initialRole?: UserRole;
//   onBackToWelcome?: () => void;
// }

// export const AuthScreen: React.FC<AuthScreenProps> = ({
//   onSuccess,
//   initialView = 'login',
//   initialRole = 'customer',
//   onBackToWelcome,
// }) => {
//   const [currentView, setCurrentView] = useState<AuthView>(initialView);
//   const [resetEmail, setResetEmail] = useState('');

//   useEffect(() => {
//     if (initialView) {
//       setCurrentView(initialView);
//     }
//   }, [initialView]);

//   const handleCodeSent = (email: string) => {
//     setResetEmail(email);
//     setCurrentView('otp_verify');
//   };

//   const handlePasswordResetDone = () => {
//     setCurrentView('login');
//   };

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
//       <View style={styles.content}>
//         {currentView === 'login' && (
//           <LoginScreen
//             initialRole={initialRole}
//             onSuccess={onSuccess}
//             onNavigateToRegister={() => setCurrentView('register')}
//             onNavigateToForgotPassword={() => setCurrentView('forgot_password')}
//             onBackToWelcome={onBackToWelcome}
//           />
//         )}

//         {currentView === 'register' && (
//           <RegisterScreen
//             onNavigateToLogin={() => setCurrentView('login')}
//             onRegisterSuccess={() => setCurrentView('login')}
//             onSuccess={onSuccess}
//           />
//         )}

//         {currentView === 'forgot_password' && (
//           <ForgotPasswordScreen
//             onNavigateToLogin={() => setCurrentView('login')}
//             onCodeSent={handleCodeSent}
//             onNavigateToRegister={() => setCurrentView('register')}
//           />
//         )}

//         {currentView === 'otp_verify' && (
//           <OtpVerificationScreen
//             email={resetEmail}
//             onNavigateToLogin={() => setCurrentView('login')}
//             onPasswordResetSuccess={handlePasswordResetDone}
//           />
//         )}
//       </View>
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F8FAFC',
//   },
//   content: {
//     flex: 1,
//   },
// });



import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { LoginScreen } from './LoginScreen';
import { RegisterScreen } from './RegisterScreen';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import { OtpVerificationScreen } from './OtpVerificationScreen';
import { MobileAuthUser, UserRole } from '../../types';

export type AuthView = 'login' | 'register' | 'forgot_password' | 'otp_verify';

interface AuthScreenProps {
  onSuccess: (user: MobileAuthUser) => void;
  initialView?: AuthView;
  initialRole?: UserRole;
  onBackToWelcome?: () => void;
}

// Short heading shown in the blue header for each step
const HEADINGS: Record<AuthView, { title: string; sub: string }> = {
  login: { title: 'Welcome back', sub: 'Sign in to order and track fasteners' },
  register: { title: 'Create account', sub: 'Register your company to start ordering' },
  forgot_password: { title: 'Reset password', sub: 'We will email you a code' },
  otp_verify: { title: 'Enter code', sub: 'Check your email for the 6-digit code' },
};

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialView = 'login',
  initialRole = 'customer',
  onBackToWelcome,
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [resetEmail, setResetEmail] = useState('');

  useEffect(() => {
    if (initialView) {
      setCurrentView(initialView);
    }
  }, [initialView]);

  const handleCodeSent = (email: string) => {
    setResetEmail(email);
    setCurrentView('otp_verify');
  };

  const handlePasswordResetDone = () => {
    setCurrentView('login');
  };

  // Where the back arrow goes from each step (undefined = hide arrow)
  const handleBack = (): (() => void) | undefined => {
    switch (currentView) {
      case 'login':
        return onBackToWelcome;
      case 'otp_verify':
        return () => setCurrentView('forgot_password');
      default:
        return () => setCurrentView('login');
    }
  };

  const onBack = handleBack();
  const heading = HEADINGS[currentView];

  return (
    <View style={styles.root}>
      <StatusBar barStyle="light-content" backgroundColor="#0047AB" />

      {/* Blue brand header */}
      <SafeAreaView style={styles.headerSafe}>
        <View style={styles.header}>
          <View style={styles.topRow}>
            {onBack ? (
              <TouchableOpacity
                onPress={onBack}
                style={styles.backBtn}
                activeOpacity={0.8}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.backIcon}>←</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backBtn} />
            )}

            <View style={styles.brandChip}>
              <Text style={styles.brandChipText}>CBH</Text>
            </View>

            <View style={styles.backBtn} />
          </View>

          <Text style={styles.title}>{heading.title}</Text>
          <Text style={styles.subtitle}>{heading.sub}</Text>
        </View>
      </SafeAreaView>

      {/* White sheet holding the form screens */}
      <KeyboardAvoidingView
        style={styles.sheet}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        {currentView === 'login' && (
          <LoginScreen
            initialRole={initialRole}
            onSuccess={onSuccess}
            onNavigateToRegister={() => setCurrentView('register')}
            onNavigateToForgotPassword={() => setCurrentView('forgot_password')}
            onBackToWelcome={onBackToWelcome}
          />
        )}

        {currentView === 'register' && (
          <RegisterScreen
            onNavigateToLogin={() => setCurrentView('login')}
            onRegisterSuccess={() => setCurrentView('login')}
            onSuccess={onSuccess}
          />
        )}

        {currentView === 'forgot_password' && (
          <ForgotPasswordScreen
            onNavigateToLogin={() => setCurrentView('login')}
            onCodeSent={handleCodeSent}
            onNavigateToRegister={() => setCurrentView('register')}
          />
        )}

        {currentView === 'otp_verify' && (
          <OtpVerificationScreen
            email={resetEmail}
            onNavigateToLogin={() => setCurrentView('login')}
            onPasswordResetSuccess={handlePasswordResetDone}
          />
        )}
      </KeyboardAvoidingView>
    </View>
  );
};

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: '#0047AB',
  },
  headerSafe: {
    backgroundColor: '#0047AB',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 28,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  backBtn: {
    width: 40,
    height: 36,
    justifyContent: 'center',
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandChip: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 14,
  },
  brandChipText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
    letterSpacing: 1,
  },
  title: {
    fontSize: 26,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  subtitle: {
    fontSize: 14,
    color: '#BFDBFE',
    marginTop: 4,
  },
  sheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    overflow: 'hidden',
  },
});

export default AuthScreen;