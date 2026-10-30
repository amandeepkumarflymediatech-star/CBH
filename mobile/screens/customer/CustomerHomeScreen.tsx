import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileProduct, MobileOrder, GlobalUnit } from '../../types';

interface CustomerHomeScreenProps {
  onNavigate: (tabId: string, filter?: { standard?: string; grade?: string }) => void;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [standards, setStandards] = useState<string[]>([
    'DIN 933',
    'DIN 912',
    'DIN 6921',
    'DIN 934',
    'DIN 125',
    'DIN 931',
  ]);
  const [stats, setStats] = useState<{ total: number; inStock: number; erpSynced: number }>({
    total: 605,
    inStock: 602,
    erpSynced: 513,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [addedToast, setAddedToast] = useState<string>('');

  const loadStorefront = async () => {
    try {
      const [prodRes, ordersRes] = await Promise.all([
        mobileApi.products.getAll({ limit: 10 }),
        mobileApi.orders.getAll({ limit: 1 }),
      ]);

      if (prodRes.products && prodRes.products.length > 0) {
        setProducts(prodRes.products);
      }
      if (prodRes.filterOptions?.standards && prodRes.filterOptions.standards.length > 0) {
        setStandards(prodRes.filterOptions.standards);
      }
      if (prodRes.stats) {
        setStats(prodRes.stats);
      }
      if (ordersRes.orders && ordersRes.orders.length > 0) {
        setActiveOrder(ordersRes.orders[0]);
      }
    } catch (err) {
      console.warn('[Customer Home] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadStorefront();
  }, []);

  const handleRefresh = () => {
    setIsRefreshing(true);
    loadStorefront();
  };

  const getStandardIcon = (std: string) => {
    if (std.includes('933') || std.includes('931') || std.includes('BOLT')) return '🔩';
    if (std.includes('912') || std.includes('SOCKET')) return '⚙️';
    if (std.includes('6921') || std.includes('FLANGE')) return '⚡';
    if (std.includes('934') || std.includes('NUT')) return '🛑';
    if (std.includes('125') || std.includes('127') || std.includes('WASHER')) return '⭕';
    if (std.includes('975') || std.includes('ROD')) return '📏';
    return '🔩';
  };

  const handleQuickAdd = (product: MobileProduct) => {
    onAddToCart(product, 'PCS', 1000);
    setAddedToast(`Added 1,000 Pcs of ${product.sku} to cart`);
    setTimeout(() => setAddedToast(''), 2500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#0052CC']} />
      }
    >
      {/* Top Banner with Real-Time Stats */}
      <View style={styles.heroBanner}>
        <View style={styles.heroHeaderRow}>
          <Text style={styles.heroBadge}>DIRECT FACTORY DISPATCH • ISO 9001:2015</Text>
          <View style={styles.liveIndicator}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>LIVE ERP</Text>
          </View>
        </View>

        <Text style={styles.heroTitle}>High-Tensile Industrial Fasteners</Text>
        <Text style={styles.heroSubtitle}>
          Class 8.8, 10.9, 12.9 &amp; Stainless SS 304 with NABL MTC Certificates
        </Text>

        {/* Live Metrics Row */}
        <View style={styles.metricsRow}>
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{stats.total || '600+'}</Text>
            <Text style={styles.metricLbl}>Total SKUs</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{stats.inStock || '590+'}</Text>
            <Text style={styles.metricLbl}>In Stock</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>{stats.erpSynced || '500+'}</Text>
            <Text style={styles.metricLbl}>ERP Synced</Text>
          </View>
          <View style={styles.metricDivider} />
          <View style={styles.metricItem}>
            <Text style={styles.metricVal}>22%</Text>
            <Text style={styles.metricLbl}>Max Slab Off</Text>
          </View>
        </View>

        <View style={{ marginTop: 8 }}>
          <MobileSearch
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              if (val.trim()) onNavigate('catalog');
            }}
            placeholder="Search DIN standard, Grade, Diameter..."
          />
        </View>
      </View>

      {/* Added Toast */}
      {addedToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {addedToast}</Text>
          <TouchableOpacity onPress={() => onNavigate('cart')}>
            <Text style={styles.toastLink}>View Cart →</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* Dynamic Active Order Consignment Tracker */}
      {activeOrder ? (
        <MobileCard
          onPress={() => onNavigate('orders')}
          style={styles.consignmentCard}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.consignmentTitle}>
              🚚 Active: {activeOrder.orderNumber}
            </Text>
            <MobileBadge label={activeOrder.status} variant="success" size="sm" />
          </View>
          <View style={[styles.rowBetween, { marginTop: 4 }]}>
            <Text style={styles.consignmentCarrier}>{activeOrder.carrier}</Text>
            <Text style={styles.consignmentAwb}>
              AWB: {activeOrder.trackingNumber || 'Active'}
            </Text>
          </View>
          <Text style={styles.consignmentNote}>
            Total Weight: {activeOrder.totalWeightKg} Kg • {activeOrder.itemsCount} SKUs • Tap for live Blue Dart tracking
          </Text>
        </MobileCard>
      ) : null}

      {/* Fastener Standards Carousel (Populated from Live Backend Standards) */}
      <View style={styles.sectionHeader}>
        <View>
          <Text style={styles.sectionTitle}>Fastener Standards</Text>
          <Text style={styles.sectionSubtitle}>Select standard to filter live inventory</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('catalog')}>
          <Text style={styles.viewAllText}>View All ({standards.length}) →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {standards.slice(0, 10).map((std) => (
          <TouchableOpacity
            key={std}
            onPress={() => onNavigate('catalog', { standard: std })}
            style={styles.catCard}
          >
            <Text style={styles.catIcon}>{getStandardIcon(std)}</Text>
            <Text style={styles.catName}>{std}</Text>
            <Text style={styles.catSpec}>Factory Certified</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Fast RFQ Quotation Banner */}
      <TouchableOpacity
        onPress={() => onNavigate('cart')}
        style={styles.rfqBanner}
      >
        <View style={styles.rfqLeft}>
          <View style={styles.rfqIconBox}>
            <Text style={styles.rfqIcon}>📄</Text>
          </View>
          <View>
            <Text style={styles.rfqTitle}>Bulk RFQ &amp; Slab Calculator</Text>
            <Text style={styles.rfqSubtitle}>Automated Tonnage Discounts up to 22%</Text>
          </View>
        </View>
        <Text style={styles.rfqArrow}>→</Text>
      </TouchableOpacity>

      {/* Trending Standard Fasteners (Live from Backend) */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <View>
          <Text style={styles.sectionTitle}>Live Factory Catalog</Text>
          <Text style={styles.sectionSubtitle}>Direct Mill Pricing &amp; Dual Unit (Pc / Kg)</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('catalog')}>
          <Text style={styles.viewAllText}>Explore All →</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#0052CC" />
          <Text style={styles.loadingText}>Connecting to factory warehouse bins...</Text>
        </View>
      ) : (
        products.map((product) => (
          <MobileCard key={product.id} onPress={() => onSelectProduct(product)}>
            <View style={styles.rowBetween}>
              <Text style={styles.skuTag}>{product.sku}</Text>
              <MobileBadge
                label={product.isInStock ? 'IN STOCK' : 'PRE-ORDER'}
                variant={product.isInStock ? 'success' : 'warning'}
                size="sm"
              />
            </View>

            <Text style={styles.productName}>{product.name}</Text>
            <Text style={styles.productSpec}>
              {product.standard} • Grade {product.grade} • Size {product.diameter}x{product.lengthMm}
            </Text>

            {product.stockPcs ? (
              <Text style={styles.stockText}>
                ✓ {product.stockPcs.toLocaleString()} Nos IN STOCK (Factory Ready)
              </Text>
            ) : null}

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.pricePc}>
                  ₹{product.pricePerPiece}
                  <Text style={styles.priceSub}> / Pc</Text>
                </Text>
                <Text style={styles.priceKg}>₹{product.pricePerKg} / Kg</Text>
              </View>

              <TouchableOpacity
                onPress={() => handleQuickAdd(product)}
                style={styles.addBtn}
              >
                <Text style={styles.addBtnText}>+ Add to Cart</Text>
              </TouchableOpacity>
            </View>
          </MobileCard>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  heroBanner: {
    backgroundColor: '#0052CC',
    borderRadius: 16,
    padding: 16,
    gap: 4,
  },
  heroHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  heroBadge: {
    fontSize: 10,
    color: '#BFDBFE',
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  liveIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    gap: 4,
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#34D399',
  },
  liveText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#E0E7FF',
    marginBottom: 6,
  },
  metricsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginVertical: 4,
  },
  metricItem: {
    alignItems: 'center',
  },
  metricVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  metricLbl: {
    fontSize: 9,
    color: '#BFDBFE',
    fontWeight: '600',
  },
  metricDivider: {
    width: 1,
    height: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  toastLink: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '800',
  },
  consignmentCard: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    borderWidth: 1.5,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  consignmentTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#065F46',
  },
  consignmentCarrier: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '600',
  },
  consignmentAwb: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '800',
  },
  consignmentNote: {
    fontSize: 10,
    color: '#059669',
    marginTop: 6,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  viewAllText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '700',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catCard: {
    width: 115,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginRight: 8,
  },
  catIcon: {
    fontSize: 22,
    marginBottom: 4,
  },
  catName: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  catSpec: {
    fontSize: 9,
    color: '#0052CC',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  rfqBanner: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 14,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  rfqLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  rfqIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rfqIcon: {
    fontSize: 16,
  },
  rfqTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#9A3412',
  },
  rfqSubtitle: {
    fontSize: 11,
    color: '#C2410C',
  },
  rfqArrow: {
    fontSize: 18,
    color: '#EA580C',
    fontWeight: '800',
  },
  skuTag: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '800',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  productSpec: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  stockText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  pricePc: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052CC',
  },
  priceSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  priceKg: {
    fontSize: 10,
    color: '#64748B',
  },
  addBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  loadingBox: {
    padding: 30,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
});

export default CustomerHomeScreen;
