import React, { useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  Animated,
  Easing,
} from 'react-native';

interface WelcomeScreenProps {
  onExplore: () => void;
  onSignIn: () => void;
}

interface MicroPillItem {
  icon: string;
  label: string;
  color: string;
  bg: string;
  border: string;
}

const PILLS: MicroPillItem[] = [
  {
    icon: '⚡',
    label: 'Instant Dual Pricing',
    color: '#0052CC',
    bg: '#EFF6FF',
    border: '#BFDBFE',
  },
  {
    icon: '📜',
    label: 'NABL Lab MTC',
    color: '#059669',
    bg: '#ECFDF5',
    border: '#A7F3D0',
  },
  {
    icon: '🚚',
    label: 'Live Dispatch',
    color: '#7C3AED',
    bg: '#F5F3FF',
    border: '#DDD6FE',
  },
];

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onExplore,
  onSignIn,
}) => {
  // Staggered entrance anims
  const enterOpacities = useRef(PILLS.map(() => new Animated.Value(0))).current;
  const enterTranslates = useRef(PILLS.map(() => new Animated.Value(24))).current;

  // Floating continuous hover anims
  const floatAnims = useRef(PILLS.map(() => new Animated.Value(0))).current;

  // Press scale anims
  const scaleAnims = useRef(PILLS.map(() => new Animated.Value(1))).current;

  useEffect(() => {
    // 1. Staggered Entrance Animation
    const entranceAnimations = PILLS.map((_, i) =>
      Animated.parallel([
        Animated.timing(enterOpacities[i], {
          toValue: 1,
          duration: 500,
          delay: 150 + i * 160,
          useNativeDriver: true,
          easing: Easing.out(Easing.cubic),
        }),
        Animated.spring(enterTranslates[i], {
          toValue: 0,
          friction: 6,
          tension: 50,
          delay: 150 + i * 160,
          useNativeDriver: true,
        }),
      ])
    );

    Animated.parallel(entranceAnimations).start(() => {
      // 2. Continuous Organic Floating Animation (staggered phase loop)
      PILLS.forEach((_, i) => {
        const floatDuration = 2000 + i * 400; // slightly varied periods for natural wave
        Animated.loop(
          Animated.sequence([
            Animated.timing(floatAnims[i], {
              toValue: -4,
              duration: floatDuration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(floatAnims[i], {
              toValue: 4,
              duration: floatDuration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
            Animated.timing(floatAnims[i], {
              toValue: 0,
              duration: floatDuration / 2,
              easing: Easing.inOut(Easing.sin),
              useNativeDriver: true,
            }),
          ])
        ).start();
      });
    });
  }, []);

  const handlePressIn = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 0.94,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = (index: number) => {
    Animated.spring(scaleAnims[index], {
      toValue: 1,
      friction: 4,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />

      <View style={styles.container}>
        {/* Top Header Tag */}
        <View style={styles.topBadgeWrap}>
          <View style={styles.trustPill}>
            <View style={styles.greenDot} />
            <Text style={styles.trustPillText}>FACTORY DIRECT B2B • ISO 9001:2015</Text>
          </View>
        </View>

        {/* Central Logo & Brand Identity */}
        <View style={styles.centerSection}>
          <View style={styles.logoContainer}>
            <Image
              source={require('../assets/cbh-store-logo.png')}
              style={styles.logoImage}
              resizeMode="contain"
            />
          </View>

          {/* Animated Value Micro-Pills */}
          <View style={styles.pillsRow}>
            {PILLS.map((pill, i) => {
              const animatedStyle = {
                opacity: enterOpacities[i],
                transform: [
                  { translateY: Animated.add(enterTranslates[i], floatAnims[i]) as any },
                  { scale: scaleAnims[i] as any },
                ],
              };

              return (
                <Animated.View key={pill.label} style={animatedStyle as any}>
                  <TouchableOpacity
                    activeOpacity={0.9}
                    onPressIn={() => handlePressIn(i)}
                    onPressOut={() => handlePressOut(i)}
                    style={[
                      styles.microPill,
                      { backgroundColor: pill.bg, borderColor: pill.border },
                    ]}
                  >
                    <Text style={styles.pillIcon}>{pill.icon}</Text>
                    <Text style={[styles.microPillText, { color: pill.color }]}>
                      {pill.label}
                    </Text>
                  </TouchableOpacity>
                </Animated.View>
              );
            })}
          </View>
        </View>

        {/* Action Gateways */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.primaryBtn}
            activeOpacity={0.85}
            onPress={onExplore}
          >
            <Text style={styles.primaryBtnText}>Explore Fastener Catalog</Text>
            <Text style={styles.arrowIcon}>→</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondaryBtn}
            activeOpacity={0.8}
            onPress={onSignIn}
          >
            <Text style={styles.secondaryBtnText}>
              Sign In / Register Company Account
            </Text>
          </TouchableOpacity>

          <Text style={styles.footerCaption}>
            Chaudhry Bro's &amp; Hassan Fasteners India • GST Registered
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 24,
    paddingTop: 16,
    paddingBottom: 24,
    justifyContent: 'space-between',
  },
  topBadgeWrap: {
    alignItems: 'center',
    paddingTop: 8,
  },
  trustPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  greenDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  trustPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  centerSection: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  logoContainer: {
    width: 250,
    height: 250,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  logoImage: {
    width: '100%',
    height: '100%',
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    gap: 10,
    marginTop: 6,
  },
  microPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 24,
    gap: 6,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  pillIcon: {
    fontSize: 13,
  },
  microPillText: {
    fontSize: 12,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  actionSection: {
    gap: 12,
    paddingBottom: 8,
  },
  primaryBtn: {
    backgroundColor: '#0052CC',
    height: 54,
    borderRadius: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    elevation: 3,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
  },
  secondaryBtn: {
    backgroundColor: '#FFFFFF',
    height: 52,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: {
    color: '#0F172A',
    fontSize: 13,
    fontWeight: '700',
  },
  footerCaption: {
    fontSize: 11,
    color: '#94A3B8',
    textAlign: 'center',
    marginTop: 4,
    fontWeight: '500',
  },
});

export default WelcomeScreen;
