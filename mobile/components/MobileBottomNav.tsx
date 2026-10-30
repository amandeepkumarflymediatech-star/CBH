import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
} from 'react-native';
import { NavIcon } from './NavIcon';

export interface NavTabItem {
  id: string;
  label: string;
  iconName: string;
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
    { id: 'dashboard', label: 'Console', iconName: 'dashboard' },
    { id: 'orders', label: 'Orders', iconName: 'orders', badge: pendingOrdersCount || undefined },
    { id: 'products', label: 'Inventory', iconName: 'products' },
    { id: 'rfqs', label: 'Quotes', iconName: 'rfqs', badge: pendingRfqsCount || undefined },
    { id: 'users', label: 'Clients', iconName: 'users' },
  ];

  const customerTabs: NavTabItem[] = [
    { id: 'home', label: 'Home', iconName: 'home' },
    { id: 'catalog', label: 'Catalog', iconName: 'catalog' },
    { id: 'cart', label: 'Cart', iconName: 'cart', badge: cartCount || undefined },
    { id: 'orders', label: 'Orders', iconName: 'orders' },
    { id: 'profile', label: 'Account', iconName: 'profile' },
  ];

  const tabs = isAdmin ? adminTabs : customerTabs;

  return (
    <View style={styles.navBar}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        const tintColor = isActive ? '#0052CC' : '#64748B';

        return (
          <TouchableOpacity
            key={tab.id}
            onPress={() => onTabChange(tab.id)}
            style={styles.tabBtn}
            activeOpacity={0.75}
          >
            {isActive ? <View style={styles.activePill} /> : null}

            <View style={styles.iconWrap}>
              <NavIcon name={tab.iconName} color={tintColor} size={20} />
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
