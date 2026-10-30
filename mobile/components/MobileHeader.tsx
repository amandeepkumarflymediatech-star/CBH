import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Image,
} from 'react-native';

interface MobileHeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  showLogo?: boolean;
  onBack?: () => void;
  role?: 'customer' | 'admin';
  cartCount?: number;
  onCartClick?: () => void;
  onLogoClick?: () => void;
  rightAction?: React.ReactNode;
}

export const MobileHeader: React.FC<MobileHeaderProps> = ({
  title,
  subtitle,
  showBack = false,
  showLogo,
  onBack,
  role = 'customer',
  cartCount = 0,
  onCartClick,
  onLogoClick,
  rightAction,
}) => {
  const isAdmin = role === 'admin';
  const displayLogo = showLogo !== undefined ? showLogo : (isAdmin ? !showBack : !showBack);

  return (
    <View style={styles.header}>
      {/* Left: Brand Icon or Back */}
      <View style={styles.left}>
        {showBack ? (
          <TouchableOpacity onPress={onBack} style={styles.backBtn} activeOpacity={0.75}>
            <Text style={styles.backBtnText}>←</Text>
          </TouchableOpacity>
        ) : null}

        {displayLogo ? (
          <TouchableOpacity
            activeOpacity={onLogoClick ? 0.75 : 1}
            onPress={onLogoClick}
            style={styles.brandLogoWrap}
          >
            <Image
              source={require('../assets/cbh-store-logo.png')}
              style={styles.brandLogoImg}
              resizeMode="contain"
            />
          </TouchableOpacity>
        ) : null}

        <View style={styles.titleContainer}>
          <View style={styles.titleRow}>
            <Text numberOfLines={1} style={styles.title}>
              {title}
            </Text>
            <View
              style={[
                styles.roleBadge,
                {
                  backgroundColor: isAdmin ? '#EFF6FF' : '#ECFDF5',
                  borderColor: isAdmin ? '#BFDBFE' : '#A7F3D0',
                },
              ]}
            >
              <Text
                style={[
                  styles.roleBadgeText,
                  { color: isAdmin ? '#0052CC' : '#059669' },
                ]}
              >
                {isAdmin ? 'ADMIN' : 'B2B'}
              </Text>
            </View>
          </View>
          {subtitle ? (
            <Text numberOfLines={1} style={styles.subtitle}>
              {subtitle}
            </Text>
          ) : null}
        </View>
      </View>

      {/* Right: Actions & Cart */}
      <View style={styles.right}>
        {rightAction}

        {!isAdmin && onCartClick ? (
          <TouchableOpacity onPress={onCartClick} style={styles.cartBtn}>
            <Text style={styles.cartIcon}>🛒</Text>
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cartCount > 99 ? '99+' : cartCount}
                </Text>
              </View>
            ) : null}
          </TouchableOpacity>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 56,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  left: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  backBtn: {
    width: 34,
    height: 34,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: {
    fontSize: 18,
    color: '#0F172A',
    fontWeight: '700',
  },
  brandLogoWrap: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 2,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  brandLogoImg: {
    width: '100%',
    height: '100%',
  },
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  title: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
    flexShrink: 1,
  },
  roleBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    borderWidth: 1,
  },
  roleBadgeText: {
    fontSize: 9,
    fontWeight: '800',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748B',
    flexShrink: 1,
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cartBtn: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartIcon: {
    fontSize: 16,
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#FF6B00',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
});

export default MobileHeader;
