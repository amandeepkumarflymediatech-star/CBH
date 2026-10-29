import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';

// Config & Auth
import {
  getMobileStoredUser,
  setMobileStoredUser,
  DEMO_MOBILE_CUSTOMER,
  DEMO_MOBILE_ADMIN,
} from './config/auth';
import {
  MobileProduct,
  MobileCartItem,
  MobileAuthUser,
  UserRole,
} from './types';
import { FALLBACK_PRODUCTS } from './config/api';

// Components
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';

// Screens
import {
  AdminDashboardScreen,
  AdminOrdersScreen,
  AdminProductsScreen,
  AdminRfqsScreen,
  AdminUsersScreen,
  AdminErpSyncScreen,
  AdminPaymentsScreen,
  AdminProfileScreen,
  AdminLoginScreen,
} from './screens/admin';

import {
  CustomerHomeScreen,
  CustomerCatalogScreen,
  CustomerProductDetailScreen,
  CustomerCartScreen,
  CustomerOrdersScreen,
  CustomerRfqsScreen,
  CustomerCertificatesScreen,
  CustomerProfileScreen,
  CustomerAuthScreen,
} from './screens/customer';
import { WelcomeScreen } from './screens/WelcomeScreen';

export default function App() {
  const [isWelcome, setIsWelcome] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole>('customer');
  const [user, setUser] = useState<MobileAuthUser | null>(DEMO_MOBILE_CUSTOMER);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);

  // Cart State (Preloaded with 1 line item for instant testing)
  const [cartItems, setCartItems] = useState<MobileCartItem[]>([
    {
      product: FALLBACK_PRODUCTS[0],
      unit: 'PCS',
      quantity: 1000,
      unitPrice: FALLBACK_PRODUCTS[0].pricePerPiece,
      lineTotal: +(1000 * FALLBACK_PRODUCTS[0].pricePerPiece).toFixed(2),
      totalWeightKg: 43.0,
    },
  ]);

  // Auth sync
  useEffect(() => {
    const stored = getMobileStoredUser();
    if (stored) {
      setUser(stored);
      setRole(stored.role);
      setActiveTab(stored.role === 'admin' ? 'dashboard' : 'home');
    }
  }, []);

  const handleRoleSwitch = (newRole: UserRole) => {
    setIsWelcome(false);
    setRole(newRole);
    setSelectedProduct(null);
    if (newRole === 'admin') {
      setUser(DEMO_MOBILE_ADMIN);
      setMobileStoredUser(DEMO_MOBILE_ADMIN);
      setActiveTab('dashboard');
    } else {
      setUser(DEMO_MOBILE_CUSTOMER);
      setMobileStoredUser(DEMO_MOBILE_CUSTOMER);
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    setMobileStoredUser(null);
    setUser(null);
    setActiveTab(role === 'admin' ? 'login' : 'auth');
  };

  // Cart operations
  const handleAddToCart = (product: MobileProduct, unit: 'PCS' | 'KGS', qty: number) => {
    const unitPrice = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weightPerPc = product.weightPerPcKg || 0.05;
    const totalWeightKg = unit === 'PCS' ? +(qty * weightPerPc).toFixed(2) : qty;
    const lineTotal = +(qty * unitPrice).toFixed(2);

    setCartItems((prev) => {
      const existingIdx = prev.findIndex(
        (item) => item.product.id === product.id && item.unit === unit
      );
      if (existingIdx >= 0) {
        const copy = [...prev];
        const newQty = copy[existingIdx].quantity + qty;
        copy[existingIdx] = {
          ...copy[existingIdx],
          quantity: newQty,
          lineTotal: +(newQty * unitPrice).toFixed(2),
          totalWeightKg: unit === 'PCS' ? +(newQty * weightPerPc).toFixed(2) : newQty,
        };
        return copy;
      }
      return [...prev, { product, unit, quantity: qty, unitPrice, lineTotal, totalWeightKg }];
    });
  };

  const handleUpdateCartQty = (productId: number, unit: 'PCS' | 'KGS', newQty: number) => {
    setCartItems((prev) =>
      prev.map((item) => {
        if (item.product.id === productId && item.unit === unit) {
          const weightPerPc = item.product.weightPerPcKg || 0.05;
          return {
            ...item,
            quantity: newQty,
            lineTotal: +(newQty * item.unitPrice).toFixed(2),
            totalWeightKg: unit === 'PCS' ? +(newQty * weightPerPc).toFixed(2) : newQty,
          };
        }
        return item;
      })
    );
  };

  const handleRemoveCartItem = (productId: number, unit: 'PCS' | 'KGS') => {
    setCartItems((prev) =>
      prev.filter((item) => !(item.product.id === productId && item.unit === unit))
    );
  };

  const handleClearCart = () => setCartItems([]);

  // Dynamic Header Titles
  const getHeaderInfo = () => {
    if (selectedProduct) {
      return { title: 'Fastener Specs', subtitle: selectedProduct.standard };
    }

    if (role === 'admin') {
      switch (activeTab) {
        case 'dashboard':
          return { title: 'Operations Console', subtitle: 'Live Plant Telemetry' };
        case 'orders':
          return { title: 'Dispatch Pipeline', subtitle: 'Consignments & Tracking' };
        case 'products':
          return { title: 'Inventory Stock', subtitle: 'Fastener Catalog Control' };
        case 'rfqs':
          return { title: 'Commercial Quotes', subtitle: 'RFQ Margins & Approvals' };
        case 'users':
          return { title: 'B2B Client Ledger', subtitle: 'Credit Limits & KYC' };
        case 'erp':
          return { title: 'ERPNext Sync', subtitle: 'Bidirectional Pipeline' };
        case 'payments':
          return { title: 'Settlement Ledger', subtitle: 'PhonePe & Bank Wires' };
        case 'profile':
          return { title: 'Operator Profile', subtitle: 'Node Authorization' };
        case 'login':
          return { title: 'Admin Terminal', subtitle: 'Clearance Required' };
        default:
          return { title: 'Operations Console', subtitle: 'CBH Fasteners' };
      }
    } else {
      switch (activeTab) {
        case 'home':
          return { title: 'CBH Fasteners', subtitle: 'Bulk Industrial Platform' };
        case 'catalog':
          return { title: 'Fastener Catalog', subtitle: 'DIN, ISO & ASTM Standards' };
        case 'cart':
          return { title: 'Procurement Cart', subtitle: 'Slab Discounts & RFQ' };
        case 'orders':
          return { title: 'My Consignments', subtitle: 'Live Order Tracking' };
        case 'rfqs':
          return { title: 'My Quotations', subtitle: 'Official RFQ Inquiries' };
        case 'certificates':
          return { title: 'NABL Test Reports', subtitle: 'EN 10204 Type 3.1 MTC' };
        case 'profile':
          return { title: 'Business Profile', subtitle: 'GSTIN & Credit Line' };
        case 'auth':
          return { title: 'Client Sign In', subtitle: 'Procurement Access' };
        default:
          return { title: 'CBH Fasteners', subtitle: 'Industrial Store' };
      }
    }
  };

  const headerInfo = getHeaderInfo();
  const totalCartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  // Render Screen
  const renderScreen = () => {
    if (selectedProduct) {
      return (
        <CustomerProductDetailScreen
          product={selectedProduct}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onNavigateToCart={() => {
            setSelectedProduct(null);
            setActiveTab('cart');
          }}
        />
      );
    }

    if (role === 'admin') {
      if (!user && activeTab === 'login') {
        return (
          <AdminLoginScreen
            onSuccess={(u) => {
              setUser(u);
              setActiveTab('dashboard');
            }}
            onSwitchToCustomer={() => handleRoleSwitch('customer')}
          />
        );
      }

      switch (activeTab) {
        case 'dashboard':
          return (
            <AdminDashboardScreen
              onNavigate={setActiveTab}
              onSelectOrder={() => setActiveTab('orders')}
              onSelectRfq={() => setActiveTab('rfqs')}
            />
          );
        case 'orders':
          return <AdminOrdersScreen />;
        case 'products':
          return <AdminProductsScreen />;
        case 'rfqs':
          return <AdminRfqsScreen />;
        case 'users':
          return <AdminUsersScreen />;
        case 'erp':
          return <AdminErpSyncScreen />;
        case 'payments':
          return <AdminPaymentsScreen />;
        case 'profile':
          return (
            <AdminProfileScreen
              onLogout={handleLogout}
              onSwitchToCustomer={() => handleRoleSwitch('customer')}
            />
          );
        default:
          return <AdminDashboardScreen onNavigate={setActiveTab} />;
      }
    } else {
      if (!user && activeTab === 'auth') {
        return (
          <CustomerAuthScreen
            onSuccess={(u) => {
              setUser(u);
              setActiveTab('home');
            }}
            onSwitchToAdmin={() => handleRoleSwitch('admin')}
          />
        );
      }

      switch (activeTab) {
        case 'home':
          return (
            <CustomerHomeScreen
              onNavigate={setActiveTab}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
        case 'catalog':
          return (
            <CustomerCatalogScreen
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
        case 'cart':
          return (
            <CustomerCartScreen
              cartItems={cartItems}
              onUpdateQuantity={handleUpdateCartQty}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onNavigateToCatalog={() => setActiveTab('catalog')}
              onOrderSuccess={(orderId) => {
                setActiveTab('orders');
              }}
            />
          );
        case 'orders':
          return <CustomerOrdersScreen />;
        case 'rfqs':
          return <CustomerRfqsScreen onNavigateToCart={() => setActiveTab('cart')} />;
        case 'certificates':
          return <CustomerCertificatesScreen />;
        case 'profile':
          return (
            <CustomerProfileScreen
              onLogout={handleLogout}
              onSwitchToAdmin={() => handleRoleSwitch('admin')}
              onNavigateToCertificates={() => setActiveTab('certificates')}
            />
          );
        default:
          return (
            <CustomerHomeScreen
              onNavigate={setActiveTab}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
      }
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle={role === 'admin' ? 'light-content' : 'dark-content'}
        backgroundColor={role === 'admin' ? '#0F172A' : '#FFFFFF'}
      />

      {/* Top CLI Role Switcher Header Bar */}
      <View style={styles.topToolbar}>
        <Text style={styles.toolbarLabel}>Mode:</Text>
        <View style={styles.toolbarPills}>
          <TouchableOpacity
            onPress={() => setIsWelcome(true)}
            style={[
              styles.pillBtn,
              isWelcome ? styles.pillBtnActiveWelcome : null,
            ]}
          >
            <Text
              style={[
                styles.pillBtnText,
                isWelcome ? styles.pillBtnTextActive : null,
              ]}
            >
              Welcome
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSwitch('customer')}
            style={[
              styles.pillBtn,
              !isWelcome && role === 'customer' ? styles.pillBtnActiveCustomer : null,
            ]}
          >
            <Text
              style={[
                styles.pillBtnText,
                !isWelcome && role === 'customer' ? styles.pillBtnTextActive : null,
              ]}
            >
              Customer
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => handleRoleSwitch('admin')}
            style={[
              styles.pillBtn,
              !isWelcome && role === 'admin' ? styles.pillBtnActiveAdmin : null,
            ]}
          >
            <Text
              style={[
                styles.pillBtnText,
                !isWelcome && role === 'admin' ? styles.pillBtnTextActive : null,
              ]}
            >
              Admin
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Screen Viewport */}
      {isWelcome ? (
        <View style={styles.viewport}>
          <WelcomeScreen
            onEnterCustomer={() => handleRoleSwitch('customer')}
            onEnterAdmin={() => handleRoleSwitch('admin')}
            onQuickAction={(tab) => {
              handleRoleSwitch('customer');
              setActiveTab(tab);
            }}
          />
        </View>
      ) : (
        <>
          {/* Mobile App Bar */}
          <MobileHeader
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            showBack={Boolean(selectedProduct)}
            onBack={() => setSelectedProduct(null)}
            role={role}
            cartCount={cartItems.length}
            onCartClick={() => setActiveTab('cart')}
            onLogoClick={() => setIsWelcome(true)}
          />

          {/* Screen Viewport */}
          <View style={styles.viewport}>{renderScreen()}</View>

          {/* Bottom Navigation */}
          {!selectedProduct && activeTab !== 'login' && activeTab !== 'auth' ? (
            <MobileBottomNav
              role={role}
              activeTab={activeTab}
              onTabChange={setActiveTab}
              cartCount={cartItems.length}
              pendingRfqsCount={role === 'admin' ? 2 : undefined}
              pendingOrdersCount={role === 'admin' ? 3 : undefined}
            />
          ) : null}
        </>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  topToolbar: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 16,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toolbarLabel: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  toolbarPills: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  pillBtn: {
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  pillBtnActiveWelcome: {
    backgroundColor: '#0284C7',
  },
  pillBtnActiveCustomer: {
    backgroundColor: '#0052CC',
  },
  pillBtnActiveAdmin: {
    backgroundColor: '#2563EB',
  },
  pillBtnText: {
    color: '#94A3B8',
    fontSize: 11,
    fontWeight: '700',
  },
  pillBtnTextActive: {
    color: '#FFFFFF',
  },
  viewport: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
});
