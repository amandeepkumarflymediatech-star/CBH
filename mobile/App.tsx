import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  SafeAreaView,
  StatusBar,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Linking,
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
import { mobileApi, FALLBACK_PRODUCTS } from './config/api';

// Components
import { MobileHeader } from './components/MobileHeader';
import { MobileBottomNav } from './components/MobileBottomNav';
import { CartPopupModal, CartPopupData } from './components/CartPopupModal';

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
import { AdminBlogScreen } from './screens/admin/AdminBlogScreen';
import { CustomerAboutScreen } from './screens/customer/CustomerAboutScreen';
import { CustomerContactScreen } from './screens/customer/CustomerContactScreen';
import { CustomerBlogScreen } from './screens/customer/CustomerBlogScreen';
import { CustomerBulkOrderScreen } from './screens/customer/CustomerBulkOrderScreen';
import { CustomerGalleryScreen } from './screens/customer/CustomerGalleryScreen';
import { CustomerPoliciesScreen } from './screens/customer/CustomerPoliciesScreen';

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
import {
  getHasSeenWelcome,
  setHasSeenWelcome,
  getPersistedUser,
} from './config/storage';

export default function App() {
  const [isWelcome, setIsWelcome] = useState<boolean>(false);
  const [isReady, setIsReady] = useState<boolean>(false);
  const [role, setRole] = useState<UserRole>('customer');
  // User state: starts null (Guest Explore mode) so first-time visitors can browse catalog
  const [user, setUser] = useState<MobileAuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedProduct, setSelectedProduct] = useState<MobileProduct | null>(null);

  const [catalogFilterStandard, setCatalogFilterStandard] = useState<string>('All');
  const [catalogSearchQuery, setCatalogSearchQuery] = useState<string>('');

  // Dynamic Cart State (starts empty - no hardcoded items)
  const [cartItems, setCartItems] = useState<MobileCartItem[]>([]);

  // Cart Popup Screen / Modal State
  const [cartPopupData, setCartPopupData] = useState<CartPopupData | null>(null);
  const [isCartPopupVisible, setIsCartPopupVisible] = useState<boolean>(false);

  // Auth navigation intent
  const [authInitialView, setAuthInitialView] = useState<'login' | 'register'>('login');
  const [postAuthRedirectTab, setPostAuthRedirectTab] = useState<string>('home');

  // Initial session & onboarding check
  useEffect(() => {
    async function initSession() {
      try {
        const [hasSeen, persistedUser] = await Promise.all([
          getHasSeenWelcome(),
          getPersistedUser(),
        ]);

        const memoryStored = getMobileStoredUser();
        const activeUser = memoryStored || persistedUser;

        if (activeUser) {
          setUser(activeUser);
          setRole(activeUser.role);
          setIsWelcome(false);
          setActiveTab(activeUser.role === 'admin' ? 'dashboard' : 'home');
        } else if (!hasSeen) {
          // New user: display WelcomeScreen once
          setIsWelcome(true);
        } else {
          // Returning user / guest: skip welcome screen, go straight to storefront
          setIsWelcome(false);
          setActiveTab('home');
        }
      } catch (err) {
        console.warn('[App Init Error]:', err);
        setIsWelcome(false);
        setActiveTab('home');
      } finally {
        setIsReady(true);
      }

      // 2. Persistent session sync from server (survives app refresh & Metro reload)
      mobileApi.auth
        .getSession()
        .then((res) => {
          if (res && res.success && res.user) {
            setUser(res.user);
            setRole(res.user.role);
            setMobileStoredUser(res.user, res.token || 'token_live');
            setHasSeenWelcome(true).catch(() => {});
            setIsWelcome(false);
            setActiveTab(res.user.role === 'admin' ? 'dashboard' : 'home');
          }
        })
        .catch(() => {});
    }

    initSession();

    // Listen for PhonePe Browser return deep links (cbhfasteners://payment-result)
    const handleDeepLink = (event: { url: string }) => {
      const url = event.url;
      if (url && (url.startsWith('cbhfasteners://') || url.startsWith('cbh://'))) {
        try {
          const queryString = url.split('?')[1] || '';
          const params = new URLSearchParams(queryString);
          const status = params.get('status') || '';

          if (status === 'SUCCESS' || url.toLowerCase().includes('success')) {
            // Instant cart wipe and redirect to orders screen
            setCartItems([]);
            setActiveTab('orders');
          }
        } catch (e) {
          console.warn('[App DeepLink Error]', e);
        }
      }
    };

    const sub = Linking.addEventListener('url', handleDeepLink);
    Linking.getInitialURL().then((url) => {
      if (url) handleDeepLink({ url });
    });

    return () => sub.remove();
  }, []);

  const handleDismissWelcome = (destination: string = 'home') => {
    setHasSeenWelcome(true).catch(() => {});
    setIsWelcome(false);
    setActiveTab(destination);
  };

  const handleAuthSuccess = (u: MobileAuthUser, fallbackTab: string = 'home') => {
    setUser(u);
    setRole(u.role);
    setMobileStoredUser(u);
    setHasSeenWelcome(true).catch(() => {});
    mobileApi.auth.saveSession(u).catch(() => {});
    setIsWelcome(false);
    const destination = postAuthRedirectTab || (u.role === 'admin' ? 'dashboard' : fallbackTab);
    setPostAuthRedirectTab('home');
    setAuthInitialView('login');
    setActiveTab(destination);
  };

  const handleRoleSwitch = (newRole: UserRole) => {
    setHasSeenWelcome(true).catch(() => {});
    setIsWelcome(false);
    setRole(newRole);
    setSelectedProduct(null);
    if (newRole === 'admin') {
      setUser(DEMO_MOBILE_ADMIN);
      setMobileStoredUser(DEMO_MOBILE_ADMIN);
      mobileApi.auth.saveSession(DEMO_MOBILE_ADMIN).catch(() => {});
      setActiveTab('dashboard');
    } else {
      setUser(DEMO_MOBILE_CUSTOMER);
      setMobileStoredUser(DEMO_MOBILE_CUSTOMER);
      mobileApi.auth.saveSession(DEMO_MOBILE_CUSTOMER).catch(() => {});
      setActiveTab('home');
    }
  };

  const handleLogout = () => {
    mobileApi.auth.clearSession().catch(() => {});
    setMobileStoredUser(null);
    setUser(null);
    setRole('customer');
    setIsWelcome(false);
    setActiveTab('home');
  };

  // Cart operations
  const handleAddToCart = (product: MobileProduct, unit: 'PCS' | 'KGS', qty: number) => {
    const unitPrice = unit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
    const weightPerPc = product.weightPerPcKg || 0.05;
    const totalWeightKg = unit === 'PCS' ? +(qty * weightPerPc).toFixed(2) : qty;
    const lineTotal = +(qty * unitPrice).toFixed(2);

    const existingItem = cartItems.find(
      (item) => item.product.id === product.id && item.unit === unit
    );
    const wasAlreadyInCart = Boolean(existingItem);
    const finalTotalQty = wasAlreadyInCart ? existingItem!.quantity + qty : qty;
    const finalLineTotal = +(finalTotalQty * unitPrice).toFixed(2);
    const finalCartCount = wasAlreadyInCart ? cartItems.length : cartItems.length + 1;

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

    // Show Add-to-Cart / Already-in-Cart Popup Screen
    setCartPopupData({
      product,
      unit,
      addedQty: qty,
      totalQty: finalTotalQty,
      wasAlreadyInCart,
      lineTotal: finalLineTotal,
      cartTotalCount: finalCartCount,
    });
    setIsCartPopupVisible(true);
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
        case 'blogs':
          return { title: 'Technical Library', subtitle: 'Publish & Manage Guides' };
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
        case 'about':
          return { title: 'About CBH', subtitle: '65-Year Legacy Since 1959' };
        case 'contact':
          return { title: 'Contact Factory', subtitle: 'Ludhiana Hub & RTGS Details' };
        case 'blogs':
          return { title: 'Technical Library', subtitle: 'Fastener Metallurgy & Standards' };
        case 'bulk-order':
          return { title: 'Bulk Tender RFQ', subtitle: 'Project BOM & Line Matching' };
        case 'gallery':
          return { title: 'Plant Gallery', subtitle: 'Cold Forging & Labs' };
        case 'policies':
          return { title: 'Legal & Commercial', subtitle: 'B2B Terms & SLA' };
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
          cartCount={cartItems.length}
          onBack={() => setSelectedProduct(null)}
          onAddToCart={handleAddToCart}
          onNavigateToCart={() => {
            setSelectedProduct(null);
            setActiveTab('cart');
          }}
          onSearch={(query) => {
            setCatalogSearchQuery(query);
            setSelectedProduct(null);
            setActiveTab('catalog');
          }}
          onSelectProduct={(prod) => {
            setSelectedProduct(prod);
          }}
        />
      );
    }

    // 1. Unified Authentication Gate (handles role-based sign-in for both customers and admins)
    if (activeTab === 'auth' || activeTab === 'login') {
      return (
        <AuthScreen
          initialView={authInitialView}
          onSuccess={(u) => handleAuthSuccess(u, postAuthRedirectTab || 'home')}
          onBackToWelcome={() => setActiveTab('home')}
        />
      );
    }

    if (role === 'admin') {
      if (!user) {
        return (
          <AuthScreen
            onSuccess={(u) => handleAuthSuccess(u, 'dashboard')}
            onBackToWelcome={() => setActiveTab('home')}
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
        case 'blogs':
          return <AdminBlogScreen onBack={() => setActiveTab('dashboard')} />;
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
                if (params?.search !== undefined) {
                  setCatalogSearchQuery(params.search);
                }
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
              initialSearch={catalogSearchQuery}
              cartCount={cartItems.length}
              onNavigateToCart={() => setActiveTab('cart')}
              onNavigateHome={() => setActiveTab('home')}
              onSelectProduct={setSelectedProduct}
              onAddToCart={handleAddToCart}
            />
          );
        case 'cart':
          return (
            <CustomerCartScreen
              cartItems={cartItems}
              user={user}
              onRequireAuth={(initialView = 'register') => {
                setAuthInitialView(initialView);
                setPostAuthRedirectTab('cart');
                setActiveTab('auth');
              }}
              onUpdateQuantity={handleUpdateCartQty}
              onRemoveItem={handleRemoveCartItem}
              onClearCart={handleClearCart}
              onNavigateToCatalog={() => setActiveTab('catalog')}
              onNavigateHome={() => setActiveTab('home')}
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
                onBackToWelcome={() => setActiveTab('home')}
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
              onNavigateToBulkOrder={() => setActiveTab('bulk-order')}
            />
          );
        case 'certificates':
          return <CustomerCertificatesScreen />;
        case 'about':
          return (
            <CustomerAboutScreen
              onBack={() => setActiveTab('home')}
              onNavigateToCatalog={() => setActiveTab('catalog')}
              onNavigateToContact={() => setActiveTab('contact')}
            />
          );
        case 'contact':
          return (
            <CustomerContactScreen
              onBack={() => setActiveTab('home')}
              onNavigateToRfqs={() => setActiveTab('rfqs')}
            />
          );
        case 'blogs':
          return (
            <CustomerBlogScreen
              onBack={() => setActiveTab('home')}
              onNavigateToCatalog={() => setActiveTab('catalog')}
            />
          );
        case 'bulk-order':
          return (
            <CustomerBulkOrderScreen
              user={user}
              onBack={() => setActiveTab('home')}
              onOrderSubmitted={() => setActiveTab('rfqs')}
            />
          );
        case 'gallery':
          return (
            <CustomerGalleryScreen
              onBack={() => setActiveTab('home')}
              onNavigateToCatalog={() => setActiveTab('catalog')}
            />
          );
        case 'policies':
          return (
            <CustomerPoliciesScreen
              onBack={() => setActiveTab('profile')}
            />
          );
        case 'profile':
          if (!user) {
            return (
              <AuthScreen
                onSuccess={(u) => handleAuthSuccess(u, 'profile')}
                onBackToWelcome={() => setActiveTab('home')}
              />
            );
          }
          return (
            <CustomerProfileScreen
              user={user}
              onUpdateUser={(updated) => {
                setUser(updated);
                setMobileStoredUser(updated);
              }}
              onLogout={handleLogout}
              onSwitchToAdmin={() => handleRoleSwitch('admin')}
              onNavigateToCertificates={() => setActiveTab('certificates')}
              onNavigateToAbout={() => setActiveTab('about')}
              onNavigateToBlogs={() => setActiveTab('blogs')}
              onNavigateToGallery={() => setActiveTab('gallery')}
              onNavigateToContact={() => setActiveTab('contact')}
              onNavigateToBulkOrder={() => setActiveTab('bulk-order')}
              onNavigateToPolicies={() => setActiveTab('policies')}
            />
          );
        default:
          return (
            <CustomerHomeScreen
              onNavigate={(tab, params) => {
                if (params?.search !== undefined) {
                  setCatalogSearchQuery(params.search);
                }
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
      }
    }
  };

  const isAuthScreen =
    activeTab === 'auth' ||
    activeTab === 'login' ||
    (!user && (activeTab === 'profile' || activeTab === 'orders' || role === 'admin'));

  const isCustomBlueHeader =
    activeTab === 'catalog' || Boolean(selectedProduct) || activeTab === 'cart' || isAuthScreen;

  if (!isReady) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: '#FFFFFF' }]}>
        <StatusBar barStyle="dark-content" backgroundColor="#FFFFFF" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, isCustomBlueHeader ? { backgroundColor: '#0047AB' } : null]}>
      <StatusBar
        barStyle={isCustomBlueHeader ? 'light-content' : 'dark-content'}
        backgroundColor={isCustomBlueHeader ? '#0047AB' : '#FFFFFF'}
      />

      {/* Screen Viewport */}
      {isWelcome ? (
        <View style={styles.viewport}>
          <WelcomeScreen
            onExplore={() => handleDismissWelcome('home')}
            onSignIn={() => handleDismissWelcome('auth')}
          />
        </View>
      ) : (
        <>
          {/* Mobile App Bar */}
          {/* Top App Header (suppressed on custom-branded catalog screen and product detail screen) */}
          {(!isCustomBlueHeader) && (
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
          )}

          {/* Screen Viewport */}
          <View style={styles.viewport}>{renderScreen()}</View>

          {/* Bottom Navigation */}
          {!selectedProduct && !isAuthScreen ? (
            <MobileBottomNav
              role={role}
              activeTab={activeTab}
              onTabChange={(tabId) => {
                setActiveTab(tabId);
              }}
              cartCount={cartItems.length}
              pendingRfqsCount={role === 'admin' ? 2 : undefined}
              pendingOrdersCount={role === 'admin' ? 3 : undefined}
            />
          ) : null}

          {/* Universal Add-to-Cart & Already-in-Cart Popup Screen / Modal */}
          <CartPopupModal
            visible={isCartPopupVisible}
            data={cartPopupData}
            onClose={() => setIsCartPopupVisible(false)}
            onNavigateToCart={() => {
              setSelectedProduct(null);
              setActiveTab('cart');
            }}
          />
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
