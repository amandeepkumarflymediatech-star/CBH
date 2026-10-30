import React, { useState } from 'react';
import { View, StyleSheet, SafeAreaView, StatusBar } from 'react-native';
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

export const AuthScreen: React.FC<AuthScreenProps> = ({
  onSuccess,
  initialView = 'login',
  initialRole = 'customer',
  onBackToWelcome,
}) => {
  const [currentView, setCurrentView] = useState<AuthView>(initialView);
  const [resetEmail, setResetEmail] = useState('');

  const handleCodeSent = (email: string) => {
    setResetEmail(email);
    setCurrentView('otp_verify');
  };

  const handlePasswordResetDone = () => {
    setCurrentView('login');
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      <View style={styles.content}>
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
          />
        )}

        {currentView === 'forgot_password' && (
          <ForgotPasswordScreen
            onNavigateToLogin={() => setCurrentView('login')}
            onCodeSent={handleCodeSent}
          />
        )}

        {currentView === 'otp_verify' && (
          <OtpVerificationScreen
            email={resetEmail}
            onNavigateToLogin={() => setCurrentView('login')}
            onPasswordResetSuccess={handlePasswordResetDone}
          />
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    flex: 1,
  },
});

