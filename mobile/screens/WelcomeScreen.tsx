import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StatusBar,
  Dimensions,
} from 'react-native';
import { MobileBadge } from '../components/MobileBadge';
import { MobileCard } from '../components/MobileCard';
import { ENV } from '../config/env';

interface WelcomeScreenProps {
  onEnterCustomer: () => void;
  onEnterAdmin: () => void;
  onQuickAction?: (tab: string) => void;
}

const { width } = Dimensions.get('window');

export const WelcomeScreen: React.FC<WelcomeScreenProps> = ({
  onEnterCustomer,
  onEnterAdmin,
  onQuickAction,
}) => {
  const [activeFeatureIdx, setActiveFeatureIdx] = useState(0);

  const features = [
    {
      icon: '🔩',
      badge: '25,000+ SKUs',
      title: 'Full Fastener Standards',
      desc: 'DIN, ISO, ASTM & IS high-tensile bolts (8.8, 10.9, 12.9), SS 304/316, nuts, washers, anchors & threaded rods.',
    },
    {
      icon: '📊',
      badge: 'Up to 25% OFF',
      title: 'Automated Slab Discounts',
      desc: 'Dynamic tonnage-based bulk pricing. Real-time gross consignment weight calculations with instant slab savings.',
    },
    {
      icon: '📑',
      badge: 'EN 10204 3.1',
      title: 'Certified MTR Reports',
      desc: 'Download authentic NABL-accredited chemical & mechanical test certificates directly for your plant compliance.',
    },
    {
      icon: '🚚',
      badge: 'Pan-India',
      title: 'Direct Mill Dispatch',
      desc: 'Consignments tracked live from warehouse to plant. Integrated GST billing, e-way bills & PhonePe/Credit payments.',
    },
  ];

  const quickShortcuts = [
    { label: 'Catalog', icon: '🔍', action: 'catalog' },
    { label: 'Bulk RFQ', icon: '📝', action: 'rfqs' },
    { label: 'Cart', icon: '🛒', action: 'cart' },
    { label: 'MTC Labs', icon: '📜', action: 'certificates' },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#0B132B" />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Brand Hero Header */}
        <View style={styles.heroBanner}>
          <View style={styles.brandIconWrapper}>
            <View style={styles.brandIconOuter}>
              <View style={styles.brandIconInner}>
                <Text style={styles.brandLogoText}>CBH</Text>
              </View>
            </View>
          </View>

          <View style={styles.titleGroup}>
            <View style={styles.badgeRow}>
              <MobileBadge text="ISO 9001:2015" variant="success" />
              <MobileBadge text="B2B FASTENERS" variant="primary" />
              <MobileBadge text="MILL DIRECT" variant="warning" />
            </View>

            <Text style={styles.mainTitle}>CBH FASTENERS</Text>
            <Text style={styles.subTitle}>
              Chaudhry Bro's & Hassan Fasteners India
            </Text>
            <Text style={styles.tagline}>
              India's Premier Digital Industrial Hardware & Fastener Procurement Platform
            </Text>
          </View>
        </View>

        {/* Feature Carousel Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>PLATFORM HIGHLIGHTS</Text>
          <Text style={styles.sectionSubtitle}>
            Engineered for Industrial Plants, EPC Contractors & B2B Wholesalers
          </Text>
        </View>

        <View style={styles.featureGrid}>
          {features.map((feat, idx) => (
            <TouchableOpacity
              key={idx}
              activeOpacity={0.85}
              onPress={() => setActiveFeatureIdx(idx)}
              style={[
                styles.featureCard,
                activeFeatureIdx === idx && styles.featureCardActive,
              ]}
            >
              <View style={styles.featureTopRow}>
                <Text style={styles.featureIcon}>{feat.icon}</Text>
                <MobileBadge
                  text={feat.badge}
                  variant={activeFeatureIdx === idx ? 'primary' : 'neutral'}
                />
              </View>
              <Text style={styles.featureTitle}>{feat.title}</Text>
              <Text style={styles.featureDesc}>{feat.desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Dual Gateways / Action Buttons */}
        <View style={styles.gatewayContainer}>
          <Text style={styles.gatewayHeading}>SELECT ACCESS GATEWAY</Text>

          {/* Primary Customer Gateway */}
          <TouchableOpacity
            style={styles.customerBtn}
            activeOpacity={0.88}
            onPress={onEnterCustomer}
          >
            <View style={styles.btnContentRow}>
              <View style={styles.btnIconBubble}>
                <Text style={styles.btnIconText}>🛒</Text>
              </View>
              <View style={styles.btnTextCol}>
                <Text style={styles.customerBtnTitle}>Customer & Procurement Portal</Text>
                <Text style={styles.customerBtnSubtitle}>
                  Search 25,000+ SKUs, get live slab discounts & place POs
                </Text>
              </View>
              <Text style={styles.arrowIcon}>➔</Text>
            </View>
          </TouchableOpacity>

          {/* Secondary Admin Gateway */}
          <TouchableOpacity
            style={styles.adminBtn}
            activeOpacity={0.88}
            onPress={onEnterAdmin}
          >
            <View style={styles.btnContentRow}>
              <View style={[styles.btnIconBubble, styles.adminIconBubble]}>
                <Text style={styles.btnIconText}>⚡</Text>
              </View>
              <View style={styles.btnTextCol}>
                <Text style={styles.adminBtnTitle}>Admin & Operations Console</Text>
                <Text style={styles.adminBtnSubtitle}>
                  Order dispatch, RFQ margins, ERPNext sync & client ledgers
                </Text>
              </View>
              <Text style={styles.adminArrowIcon}>➔</Text>
            </View>
          </TouchableOpacity>
        </View>

        {/* Quick Launch Shortcuts */}
        <View style={styles.shortcutsBox}>
          <Text style={styles.shortcutsLabel}>QUICK SHORTCUTS</Text>
          <View style={styles.shortcutsRow}>
            {quickShortcuts.map((s, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.shortcutItem}
                activeOpacity={0.7}
                onPress={() => {
                  if (onQuickAction) {
                    onQuickAction(s.action);
                  } else {
                    onEnterCustomer();
                  }
                }}
              >
                <View style={styles.shortcutIconCircle}>
                  <Text style={styles.shortcutIcon}>{s.icon}</Text>
                </View>
                <Text style={styles.shortcutText}>{s.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Live Mill Telemetry Footer */}
        <View style={styles.footer}>
          <View style={styles.statusPill}>
            <View style={styles.statusDot} />
            <Text style={styles.statusText}>
              Backend: {ENV.IS_PROD ? 'dosebox.in/api (LIVE)' : 'Local Host (3000)'}
            </Text>
          </View>
          <Text style={styles.footerCopyright}>
            © 2026 Chaudhry Bro's & Hassan Fasteners. All Rights Reserved.
          </Text>
          <Text style={styles.footerMeta}>
            Bridgeless Native React Native CLI • Android 17 / Pixel
          </Text>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0B132B',
  },
  scrollContent: {
    paddingBottom: 40,
  },
  heroBanner: {
    backgroundColor: '#0F1E36',
    borderBottomLeftRadius: 28,
    borderBottomRightRadius: 28,
    paddingTop: 24,
    paddingBottom: 28,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
  },
  brandIconWrapper: {
    marginBottom: 16,
  },
  brandIconOuter: {
    width: 84,
    height: 84,
    borderRadius: 22,
    backgroundColor: '#0052CC',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 10,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.5,
    shadowRadius: 12,
    borderWidth: 2,
    borderColor: '#38BDF8',
  },
  brandIconInner: {
    width: 72,
    height: 72,
    borderRadius: 18,
    backgroundColor: '#003B99',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandLogoText: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 2,
  },
  titleGroup: {
    alignItems: 'center',
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 10,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  mainTitle: {
    color: '#FFFFFF',
    fontSize: 26,
    fontWeight: '900',
    letterSpacing: 1.5,
    textAlign: 'center',
  },
  subTitle: {
    color: '#38BDF8',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 2,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  tagline: {
    color: '#94A3B8',
    fontSize: 12,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 18,
    paddingHorizontal: 12,
  },
  sectionHeader: {
    marginTop: 24,
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  sectionTitle: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
  },
  sectionSubtitle: {
    color: '#64748B',
    fontSize: 11,
    marginTop: 2,
  },
  featureGrid: {
    paddingHorizontal: 16,
    gap: 10,
  },
  featureCard: {
    backgroundColor: '#131F37',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  featureCardActive: {
    borderColor: '#0052CC',
    backgroundColor: '#16284D',
  },
  featureTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  featureIcon: {
    fontSize: 24,
  },
  featureTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 4,
  },
  featureDesc: {
    color: '#94A3B8',
    fontSize: 12,
    lineHeight: 17,
  },
  gatewayContainer: {
    marginTop: 24,
    paddingHorizontal: 16,
  },
  gatewayHeading: {
    color: '#38BDF8',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 1.2,
    marginBottom: 12,
    paddingHorizontal: 4,
  },
  customerBtn: {
    backgroundColor: '#0052CC',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    elevation: 6,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  btnContentRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  btnIconBubble: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  adminIconBubble: {
    backgroundColor: 'rgba(56, 189, 248, 0.15)',
  },
  btnIconText: {
    fontSize: 20,
  },
  btnTextCol: {
    flex: 1,
  },
  customerBtnTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  customerBtnSubtitle: {
    color: '#E0F2FE',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  arrowIcon: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },
  adminBtn: {
    backgroundColor: '#1E293B',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1.5,
    borderColor: '#334155',
  },
  adminBtnTitle: {
    color: '#F8FAFC',
    fontSize: 15,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  adminBtnSubtitle: {
    color: '#94A3B8',
    fontSize: 11,
    marginTop: 2,
    lineHeight: 15,
  },
  adminArrowIcon: {
    color: '#38BDF8',
    fontSize: 18,
    fontWeight: '900',
    marginLeft: 8,
  },
  shortcutsBox: {
    marginTop: 20,
    paddingHorizontal: 16,
  },
  shortcutsLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  shortcutsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  shortcutItem: {
    flex: 1,
    backgroundColor: '#131F37',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#1E293B',
  },
  shortcutIconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#1E293B',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 6,
  },
  shortcutIcon: {
    fontSize: 18,
  },
  shortcutText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  footer: {
    marginTop: 30,
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  statusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F1E36',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 10,
  },
  statusDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 8,
  },
  statusText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '600',
  },
  footerCopyright: {
    color: '#64748B',
    fontSize: 11,
    textAlign: 'center',
    fontWeight: '600',
  },
  footerMeta: {
    color: '#475569',
    fontSize: 10,
    marginTop: 4,
    textAlign: 'center',
  },
});

