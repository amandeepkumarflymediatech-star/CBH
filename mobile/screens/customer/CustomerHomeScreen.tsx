import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileProduct, MobileOrder } from '../../types';

interface CustomerHomeScreenProps {
  onNavigate: (tabId: string) => void;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: 'PCS' | 'KGS', qty: number) => void;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);

  useEffect(() => {
    const loadStorefront = async () => {
      try {
        const [prodRes, ordersRes] = await Promise.all([
          mobileApi.products.getAll({ limit: 6 }),
          mobileApi.orders.getAll({ limit: 1 }),
        ]);
        if (prodRes.products) setProducts(prodRes.products);
        if (ordersRes.orders && ordersRes.orders.length > 0) {
          setActiveOrder(ordersRes.orders[0]);
        }
      } catch (err) {
        console.warn('[Customer Home] Fetch error:', err);
      }
    };
    loadStorefront();
  }, []);

  const categories = [
    { id: 'Hex Screws', name: 'Hex Bolts', spec: 'DIN 933 / 931', icon: '🔩' },
    { id: 'Socket Screws', name: 'Socket Cap', spec: 'DIN 912 Class 12.9', icon: '⚙️' },
    { id: 'Flange Bolts', name: 'Flange Bolts', spec: 'DIN 6921 Serrated', icon: '⚡' },
    { id: 'Nuts & Lock Nuts', name: 'Heavy Nuts', spec: 'DIN 934 Class 8', icon: '🛑' },
    { id: 'Washers', name: 'Plain Washers', spec: 'DIN 125A SS 304', icon: '⭕' },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Banner */}
      <View style={styles.heroBanner}>
        <Text style={styles.heroBadge}>DIRECT FACTORY DISPATCH • ISO 9001:2015</Text>
        <Text style={styles.heroTitle}>High-Tensile Fasteners</Text>
        <Text style={styles.heroSubtitle}>
          Class 8.8, 10.9, 12.9 &amp; Stainless SS 304 with NABL MTC
        </Text>

        <View style={{ marginTop: 12 }}>
          <MobileSearch
            value={searchQuery}
            onChange={(val) => {
              setSearchQuery(val);
              if (val.trim()) onNavigate('catalog');
            }}
            placeholder="Search DIN 933, M12, Grade 8.8..."
          />
        </View>
      </View>

      {/* Active Order Consignment Tracker */}
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
              AWB: {activeOrder.trackingNumber || 'Live'}
            </Text>
          </View>
        </MobileCard>
      ) : null}

      {/* Fastener Categories Carousel */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Fastener Standards</Text>
        <TouchableOpacity onPress={() => onNavigate('catalog')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catScroll}>
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat.id}
            onPress={() => onNavigate('catalog')}
            style={styles.catCard}
          >
            <Text style={styles.catIcon}>{cat.icon}</Text>
            <Text style={styles.catName}>{cat.name}</Text>
            <Text style={styles.catSpec}>{cat.spec}</Text>
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
            <Text style={styles.rfqTitle}>Bulk RFQ Calculator</Text>
            <Text style={styles.rfqSubtitle}>Instant Tier Discounts up to 22%</Text>
          </View>
        </View>
        <Text style={styles.rfqArrow}>→</Text>
      </TouchableOpacity>

      {/* Featured Products */}
      <View style={[styles.sectionHeader, { marginTop: 12 }]}>
        <Text style={styles.sectionTitle}>Trending Standard Fasteners</Text>
        <TouchableOpacity onPress={() => onNavigate('catalog')}>
          <Text style={styles.viewAllText}>Browse ({products.length})</Text>
        </TouchableOpacity>
      </View>

      {products.map((product) => (
        <MobileCard key={product.id} onPress={() => onSelectProduct(product)}>
          <View style={styles.rowBetween}>
            <Text style={styles.skuTag}>
              {product.standard} • {product.grade}
            </Text>
            <MobileBadge label="IN STOCK" variant="success" size="sm" />
          </View>

          <Text style={styles.productName}>{product.name}</Text>
          <Text style={styles.productSpec}>
            Finish: {product.finish} • Size: {product.sizeFormatted || `${product.diameter}x${product.lengthMm}`}
          </Text>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View>
              <Text style={styles.pricePc}>
                ₹{product.pricePerPiece}
                <Text style={styles.priceSub}> / Pc</Text>
              </Text>
              <Text style={styles.priceKg}>or ₹{product.pricePerKg} / Kg</Text>
            </View>

            <TouchableOpacity
              onPress={() => onAddToCart(product, 'PCS', 1000)}
              style={styles.addBtn}
            >
              <Text style={styles.addBtnText}>+ Add 1K Pcs</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}
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
  heroBadge: {
    fontSize: 10,
    color: '#BFDBFE',
    fontWeight: '700',
    letterSpacing: 0.5,
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
    marginBottom: 4,
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
    fontWeight: '700',
    color: '#065F46',
  },
  consignmentCarrier: {
    fontSize: 11,
    color: '#166534',
  },
  consignmentAwb: {
    fontSize: 11,
    color: '#166534',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '600',
  },
  catScroll: {
    flexDirection: 'row',
  },
  catCard: {
    width: 110,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
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
    fontWeight: '700',
    color: '#0F172A',
    textAlign: 'center',
  },
  catSpec: {
    fontSize: 9,
    color: '#64748B',
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
    fontWeight: '700',
  },
  skuTag: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  productSpec: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
    fontWeight: '700',
  },
});

export default CustomerHomeScreen;
