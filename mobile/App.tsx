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

// Screens (Direct explicit imports - prevents Metro bundle bloat & circular dependencies)
import { AdminDashboardScreen } from './screens/admin/AdminDashboardScreen';
import { AdminOrdersScreen } from './screens/admin/AdminOrdersScreen';
import { AdminProductsScreen } from './screens/admin/AdminProductsScreen';
import { AdminRfqsScreen } from './screens/admin/AdminRfqsScreen';
import { AdminUsersScreen } from './screens/admin/AdminUsersScreen';
import { AdminErpSyncScreen } from './screens/admin/AdminErpSyncScreen';
import { AdminPaymentsScreen } from './screens/admin/AdminPaymentsScreen';
import { AdminProfileScreen } from './screens/admin/AdminProfileScreen';
import { AdminSurplusScreen } from './screens/admin/AdminSurplusScreen';
import { AdminCategoriesScreen } from './screens/admin/AdminCategoriesScreen';

import { CustomerHomeScreen } from './screens/customer/CustomerHomeScreen';
import { CustomerCatalogScreen } from './screens/customer/CustomerCatalogScreen';
import { CustomerProductDetailScreen } from './screens/customer/CustomerProductDetailScreen';
import { CustomerCartScreen } from './screens/customer/CustomerCartScreen';
import { CustomerOrdersScreen } from './screens/customer/CustomerOrdersScreen';
import { CustomerRfqsScreen } from './screens/customer/CustomerRfqsScreen';
import { CustomerCertificatesScreen } from './screens/customer/CustomerCertificatesScreen';
import { CustomerProfileScreen } from './screens/customer/CustomerProfileScreen';

import { AuthScreen } from './screens/auth/AuthScreen';
import { WelcomeScreen } from './screens/WelcomeScreen';

export default function App() {
  const [isWelcome, setIsWelcome] = useState<boolean>(true);
  const [role, setRole] = useState<UserRole>('customer');
  // User state: starts null (Guest Explore mode) so first-time visitors can browse catalog
  const [user, setUser] = useState<MobileAuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);

  const [catalogFilterStandard, setCatalogFilterStandard] = useState<string>('All');

  // Dynamic Cart State (starts empty - no hardcoded items)
  const [cartItems, setCartItems] = useState<MobileCartItem[]>([]);

  // Auth sync
  useEffect(() => {
    const stored = getMobileStoredUser();
    if (stored) {
      setUser(stored);
      setRole(stored.role);
      setActiveTab(stored.role === 'admin' ? 'dashboard' : 'home');
    }
  }, []);

  const handleAuthSuccess = (u: MobileAuthUser, fallbackTab: string = 'home') => {
    setUser(u);
    setRole(u.role);
    setIsWelcome(false);
    if (u.role === 'admin') {
      setActiveTab('dashboard');
    } else {
      setActiveTab(fallbackTab);
    }
  };

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
    setRole('customer');
    setIsWelcome(true);
    setActiveTab('home');
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
        case 'surplus':
          return { title: 'Surplus Stock', subtitle: 'Factory Clearance Lots' };
        case 'categories':
          return { title: 'Catalog Taxonomies', subtitle: 'Categories & Families' };
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

    // 1. Unified Authentication Gate (handles role-based sign-in for both customers and admins)
    if (activeTab === 'auth' || activeTab === 'login') {
      return (
        <AuthScreen
          onSuccess={(u) => handleAuthSuccess(u, 'home')}
          onBackToWelcome={() => setIsWelcome(true)}
        />
      );
    }

    if (role === 'admin') {
      if (!user) {
        return (
          <AuthScreen
            onSuccess={(u) => handleAuthSuccess(u, 'dashboard')}
            onBackToWelcome={() => setIsWelcome(true)}
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
        case 'surplus':
          return <AdminSurplusScreen />;
        case 'categories':
          return <AdminCategoriesScreen />;
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
      switch (activeTab) {
        case 'home':
          return (
            <CustomerHomeScreen
              onNavigate={(tab, params) => {
                if (params?.standard) {
                  setCatalogFilterStandard(params.standard);
                } else if (tab === 'catalog' && !params?.standard) {
                  setCatalogFilterStandard('All');
                }
                setActiveTab(tab);
              }}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
        case 'catalog':
          return (
            <CustomerCatalogScreen
              initialStandard={catalogFilterStandard}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
        case 'cart':
          return (
            <CustomerCartScreen
              cartItems={cartItems}
              user={user}
              onRequireAuth={() => setActiveTab('auth')}
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
          if (!user) {
            return (
              <AuthScreen
                onSuccess={(u) => handleAuthSuccess(u, 'orders')}
                onBackToWelcome={() => setIsWelcome(true)}
              />
            );
          }
          return (
            <CustomerOrdersScreen
              user={user}
              onNavigateToCatalog={() => setActiveTab('catalog')}
            />
          );
        case 'rfqs':
          return (
            <CustomerRfqsScreen
              user={user}
              onNavigateToCart={() => setActiveTab('cart')}
              onNavigateToCatalog={() => setActiveTab('catalog')}
            />
          );
        case 'certificates':
          return <CustomerCertificatesScreen />;
        case 'profile':
          if (!user) {
            return (
              <AuthScreen
                onSuccess={(u) => handleAuthSuccess(u, 'profile')}
                onBackToWelcome={() => setIsWelcome(true)}
              />
            );
          }
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
        barStyle="dark-content"
        backgroundColor="#FFFFFF"
      />

      {/* Screen Viewport */}
      {isWelcome ? (
        <View style={styles.viewport}>
          <WelcomeScreen
            onExplore={() => {
              setMobileStoredUser(null);
              setUser(null);
              setIsWelcome(false);
              setRole('customer');
              setActiveTab('home');
            }}
            onSignIn={() => {
              setIsWelcome(false);
              setRole('customer');
              setActiveTab('auth');
            }}
          />
        </View>
      ) : (
        <>
          {/* Mobile App Bar */}
          <MobileHeader
            title={headerInfo.title}
            subtitle={headerInfo.subtitle}
            showBack={
              Boolean(selectedProduct) ||
              activeTab === 'auth' ||
              (role === 'admin' && activeTab !== 'dashboard')
            }
            showLogo={
              role === 'admin'
                ? activeTab === 'dashboard'
                : !selectedProduct && activeTab !== 'auth'
            }
            onBack={() => {
              if (selectedProduct) {
                setSelectedProduct(null);
              } else if (role === 'admin' && activeTab !== 'dashboard') {
                setActiveTab('dashboard');
              } else if (activeTab === 'auth') {
                setActiveTab('home');
              } else {
                setActiveTab('home');
              }
            }}
            role={role}
            cartCount={cartItems.length}
            onCartClick={() => setActiveTab('cart')}
            onLogoClick={() => {
              // Navigates to home/dashboard - does NOT kick user out to Welcome Gateway
              if (role === 'admin') {
                setActiveTab('dashboard');
              } else {
                setActiveTab('home');
              }
            }}
            rightAction={
              role === 'admin' ? (
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.adminHeaderLogoutBtn}
                  activeOpacity={0.8}
                >
                  <Text style={styles.adminHeaderLogoutText}>Logout</Text>
                </TouchableOpacity>
              ) : undefined
            }
          />

          {/* Screen Viewport */}
          <View style={styles.viewport}>{renderScreen()}</View>

          {/* Bottom Navigation */}
          {!selectedProduct && activeTab !== 'login' && activeTab !== 'auth' ? (
            <MobileBottomNav
              role={role}
              activeTab={activeTab}
              onTabChange={(tabId) => {
                if ((tabId === 'orders' || tabId === 'profile') && !user) {
                  setActiveTab('auth');
                  return;
                }
                setActiveTab(tabId);
              }}
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
    backgroundColor: '#FFFFFF',
  },
  viewport: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  adminHeaderLogoutBtn: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  adminHeaderLogoutText: {
    color: '#B91C1C',
    fontSize: 11,
    fontWeight: '700',
  },
});
