import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';

export interface NavTabItem {
  id: string;
  label: string;
  icon: string;
  badge?: number | string;
}

interface MobileBottomNavProps {
  role: 'customer' | 'admin';
  activeTab: string;
  onTabChange: (tabId: string) => void;
  cartCount?: number;
  pendingRfqsCount?: number;
  pendingOrdersCount?: number;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  role,
  activeTab,
  onTabChange,
  cartCount = 0,
  pendingRfqsCount = 0,
  pendingOrdersCount = 0,
}) => {
  const isAdmin = role === 'admin';

  const adminTabs: NavTabItem[] = [
    { id: 'dashboard', label: 'Console', icon: '⚡' },
    { id: 'orders', label: 'Orders', icon: '📦', badge: pendingOrdersCount || undefined },
    { id: 'products', label: 'Inventory', icon: '🔩' },
    { id: 'rfqs', label: 'Quotes', icon: '📄', badge: pendingRfqsCount || undefined },
    { id: 'users', label: 'Clients', icon: '👥' },
  ];

  const customerTabs: NavTabItem[] = [
    { id: 'home', label: 'Home', icon: '🏠' },
    { id: 'catalog', label: 'Catalog', icon: '🔩' },
    { id: 'cart', label: 'Cart', icon: '🛒', badge: cartCount || undefined },
    { id: 'orders', label: 'Orders', icon: '📦' },
    { id: 'profile', label: 'Account', icon: '👤' },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabBtn}
          >
            {isActive ? <View style={styles.activePill} /> : null}

            <View style={styles.iconWrap}>
              <Text style={styles.iconText}>{tab.icon}</Text>
              {tab.badge ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{tab.badge}</Text>
                </View>
              ) : null}
            </View>

            <Text
              style={[
                styles.tabLabel,
                isActive ? styles.tabLabelActive : styles.tabLabelInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  navBar: {
    height: 58,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    elevation: 8,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  tabBtn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    position: 'relative',
  },
  activePill: {
    position: 'absolute',
    top: 0,
    width: 26,
    height: 3,
    borderRadius: 2,
    backgroundColor: '#0052CC',
  },
  iconWrap: {
    position: 'relative',
  },
  iconText: {
    fontSize: 18,
  },
  badge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  tabLabel: {
    fontSize: 10,
    marginTop: 2,
  },
  tabLabelActive: {
    fontWeight: '700',
    color: '#0052CC',
  },
  tabLabelInactive: {
    fontWeight: '500',
    color: '#94A3B8',
  },
});

export default MobileBottomNav;
