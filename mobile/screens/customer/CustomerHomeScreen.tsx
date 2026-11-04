import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Linking,
  Dimensions,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { NavIcon } from '../../components/NavIcon';
import { ProductCardSkeleton, OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi, FALLBACK_PRODUCTS } from '../../config/api';
import { MobileProduct, MobileOrder, MobileSurplusLot, GlobalUnit } from '../../types';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const SURPLUS_WIDTH = Math.round(SCREEN_WIDTH * 0.72);

const WHATSAPP_URL =
  'https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo%20of%20fasteners%20I%20need.%20Please%20give%20me%20the%20wholesale%20rate.';
const CALL_URL = 'tel:+919888021000';

interface CustomerHomeScreenProps {
  onNavigate: (
    tabId: string,
    filter?: { standard?: string; grade?: string; search?: string }
  ) => void;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
}

// Short, scannable categories (one line each)
const CATEGORIES = [
  { id: 'bolts', name: 'Hex bolts', hindi: 'हेक्स बोल्ट', standard: 'DIN 933', abbr: 'HEX', color: '#0052CC' },
  { id: 'nuts', name: 'Hex nuts', hindi: 'हेक्स नट', standard: 'DIN 934', abbr: 'NUT', color: '#059669' },
  { id: 'washers', name: 'Washers', hindi: 'वाशर', standard: 'DIN 125', abbr: 'WSH', color: '#4F46E5' },
  { id: 'socket', name: 'Allen screws', hindi: 'एलन बोल्ट', standard: 'DIN 912', abbr: 'SHC', color: '#D97706' },
  { id: 'studs', name: 'Studs & rods', hindi: 'स्टड / रॉड', standard: 'DIN 975', abbr: 'STD', color: '#0284C7' },
  { id: 'flange', name: 'Flange bolts', hindi: 'फ्लैंज बोल्ट', standard: 'DIN 6921', abbr: 'FLG', color: '#7C3AED' },
];

const QUICK_TAGS = ['DIN 933', 'DIN 912', '8.8', '10.9', 'SS 304', 'M10'];

const CATALOG_TABS = [
  { id: 'all', label: 'All' },
  { id: 'din933', label: 'Hex' },
  { id: 'din912', label: 'Socket' },
  { id: 'flange', label: 'Flange' },
  { id: 'ht', label: 'High tensile' },
  { id: 'surplus', label: 'Surplus' },
] as const;

type CatalogTab = (typeof CATALOG_TABS)[number]['id'];

function getCleanFastenerTitle(name: string, subGroup?: string): string {
  if (!name) {
    if (subGroup === 'BOLTS') return 'Hex Bolt';
    if (subGroup === 'NUTS') return 'Hex Nut';
    if (subGroup === 'SCREW') return 'CSK Screw';
    if (subGroup === 'WASHERS') return 'Flat Washer';
    return 'Precision Fastener';
  }

  let clean = name.split(/\s*[-–(]?\s*(?:DIN|Din|ISO|Standard|Grade|Class|Property|\()/i)[0].trim();
  clean = clean.replace(/[-–_]+$/, '').trim();

  if (clean.length < 3 || clean.length > 22) {
    const sg = (subGroup || '').toUpperCase();
    if (sg.includes('BOLT')) return 'Hex Bolt';
    if (sg.includes('NUT')) return 'Hex Nut';
    if (sg.includes('SCREW')) return 'CSK Screw';
    if (sg.includes('WASHER')) return 'Flat Washer';
    if (sg.includes('SOCKET')) return 'Socket Cap';
    if (sg.includes('FLANGE')) return 'Flange Bolt';
    if (sg.includes('STUD')) return 'Threaded Stud';
  }

  if (/^hex\s+screws?$/i.test(clean)) return 'Hex Bolt';
  if (/^hexagon\s+(full\s+)?nuts?$/i.test(clean)) return 'Hex Nut';
  if (/^flat\s+washers?$/i.test(clean)) return 'Flat Washer';
  if (/^countersunk\s+screws?$/i.test(clean)) return 'CSK Screw';
  if (/^socket\s+head\s+cap\s+screws?$/i.test(clean)) return 'Socket Cap';

  return clean;
}

export const CustomerHomeScreen: React.FC<CustomerHomeScreenProps> = ({
  onNavigate,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>(FALLBACK_PRODUCTS.slice(0, 12));
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [surplusLots, setSurplusLots] = useState<MobileSurplusLot[]>([]);
  const [stats, setStats] = useState({ total: 605, inStock: 602 });
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toast, setToast] = useState('');
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [catalogTab, setCatalogTab] = useState<CatalogTab>('all');

  // Size finder (collapsed by default to keep the screen short)
  const [finderOpen, setFinderOpen] = useState(false);
  const [finderStandard, setFinderStandard] = useState('DIN 933');
  const [finderDiameter, setFinderDiameter] = useState('M12');
  const [finderLength, setFinderLength] = useState('50');
  const [finderGrade, setFinderGrade] = useState('8.8');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2500);
  };

  const toggleFavorite = (id: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const loadStorefront = async () => {
    try {
      const [prodRes, ordersRes, surplusRes] = await Promise.all([
        mobileApi.products.getAll({ limit: 12 }),
        mobileApi.orders.getAll({ limit: 1 }),
        mobileApi.surplus.getAll(),
      ]);
      if (prodRes.products?.length) setProducts(prodRes.products);
      if (prodRes.stats) setStats(prodRes.stats);
      if (ordersRes.orders?.length) setActiveOrder(ordersRes.orders[0]);
      if (surplusRes.surplus?.length) setSurplusLots(surplusRes.surplus);
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

  const handleSearch = (override?: string) => {
    const q = (override !== undefined ? override : searchQuery).trim();
    if (q) onNavigate('catalog', { search: q });
    else onNavigate('catalog');
  };

  const handleQuickAdd = (product: MobileProduct) => {
    onAddToCart(product, 'PCS', 1000);
    setRecentlyAddedId(product.id);
    showToast(`Added 1,000 pcs · ${product.sku}`);
    setTimeout(() => setRecentlyAddedId(null), 2000);
  };

  const filteredProducts = products.filter((p) => {
    const grade = p.grade || '';
    switch (catalogTab) {
      case 'surplus':
        return p.isSurplus;
      case 'din933':
        return p.standard === 'DIN 933' || p.din === 'DIN 933' || p.name.includes('933');
      case 'din912':
        return (
          p.standard === 'DIN 912' ||
          p.din === 'DIN 912' ||
          p.name.includes('912') ||
          (p.category || '').toLowerCase().includes('socket')
        );
      case 'flange':
        return p.standard === 'DIN 6921' || p.name.toLowerCase().includes('flange');
      case 'ht':
        return grade.includes('10.9') || grade.includes('12.9');
      default:
        return true;
    }
  });

  const quickActions = [
    { key: 'rfq', label: 'Get quote', onPress: () => onNavigate('cart'), icon: <NavIcon name="doc" color="#0052CC" size={22} /> },
    { key: 'bom', label: 'Bulk order', onPress: () => onNavigate('bulk-order'), icon: <Text style={styles.qaGlyph}>BOM</Text> },
    { key: 'wa', label: 'WhatsApp', onPress: () => Linking.openURL(WHATSAPP_URL), icon: <NavIcon name="whatsapp" color="#059669" size={22} /> },
    { key: 'call', label: 'Call', onPress: () => Linking.openURL(CALL_URL), icon: <Text style={styles.qaGlyph}>☎</Text> },
  ];

  return (
    <ScrollView
      style={styles.screen}
      contentContainerStyle={styles.container}
      showsVerticalScrollIndicator={false}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={['#0052CC']} />
      }
    >
      {/* HEADER: brand + search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.brand}>CBH Fasteners</Text>
            <Text style={styles.brandSub}>
              {stats.inStock}+ items in stock
            </Text>
          </View>
          <View style={styles.liveChip}>
            <View style={styles.liveDot} />
            <Text style={styles.liveText}>Live stock</Text>
          </View>
        </View>

        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              onSubmit={() => handleSearch()}
              returnKeyType="search"
              placeholder="Search size, DIN, grade"
            />
          </View>
          <TouchableOpacity style={styles.searchBtn} onPress={() => handleSearch()} activeOpacity={0.85}>
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagRow}
        >
          {QUICK_TAGS.map((tag) => (
            <TouchableOpacity
              key={tag}
              style={styles.tagPill}
              onPress={() => {
                setSearchQuery(tag);
                handleSearch(tag);
              }}
              activeOpacity={0.75}
            >
              <Text style={styles.tagText}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <View style={styles.body}>
        {/* Toast */}
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ {toast}</Text>
            <TouchableOpacity onPress={() => onNavigate('cart')}>
              <Text style={styles.toastLink}>Cart</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* QUICK ACTIONS */}
        <View style={styles.qaRow}>
          {quickActions.map((a) => (
            <TouchableOpacity key={a.key} style={styles.qaItem} onPress={a.onPress} activeOpacity={0.8}>
              <View style={styles.qaIconBox}>{a.icon}</View>
              <Text style={styles.qaLabel}>{a.label}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ACTIVE ORDER */}
        {activeOrder ? (
          <MobileCard onPress={() => onNavigate('orders')} style={styles.orderCard}>
            <View style={styles.rowBetween}>
              <Text style={styles.orderTitle}>Order {activeOrder.orderNumber}</Text>
              <MobileBadge label={activeOrder.status} variant="success" size="sm" />
            </View>
            <Text style={styles.orderMeta}>
              {activeOrder.carrier} · AWB {activeOrder.trackingNumber || 'pending'} · Tap to track
            </Text>
          </MobileCard>
        ) : null}

        {/* CATEGORIES */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Shop by type</Text>
          <TouchableOpacity onPress={() => onNavigate('catalog')}>
            <Text style={styles.seeAll}>See all</Text>
          </TouchableOpacity>
        </View>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={styles.catCard}
              activeOpacity={0.85}
              onPress={() => onNavigate('catalog', { standard: cat.standard })}
            >
              <View style={[styles.catBadge, { backgroundColor: cat.color }]}>
                <Text style={styles.catBadgeText}>{cat.abbr}</Text>
              </View>
              <Text style={styles.catName} numberOfLines={1}>{cat.name}</Text>
              <Text style={styles.catHindi} numberOfLines={1}>{cat.hindi}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        {/* SURPLUS DEALS */}
        {surplusLots.length > 0 ? (
          <>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Surplus deals</Text>
              <TouchableOpacity onPress={() => setCatalogTab('surplus')}>
                <Text style={styles.seeAll}>See all</Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={SURPLUS_WIDTH + 10}
              decelerationRate="fast"
              contentContainerStyle={styles.hList}
            >
              {surplusLots.map((lot) => (
                <View key={lot.id} style={[styles.dealCard, { width: SURPLUS_WIDTH }]}>
                  <View style={styles.rowBetween}>
                    <View style={styles.dealBadge}>
                      <Text style={styles.dealBadgeText}>-{lot.clearanceDiscountPct || 35}%</Text>
                    </View>
                    <Text style={styles.dealMeta}>{lot.standard} · Gr {lot.grade}</Text>
                  </View>
                  <Text style={styles.dealName} numberOfLines={2}>{lot.name}</Text>
                  <View style={styles.rowBetween}>
                    <View>
                      <Text style={styles.dealOld}>₹{lot.regularPriceKg}/kg</Text>
                      <Text style={styles.dealNew}>₹{lot.clearancePriceKg}/kg</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.dealBtn}
                      activeOpacity={0.85}
                      onPress={() => showToast(`Claimed lot ${lot.sku}`)}
                    >
                      <Text style={styles.dealBtnText}>Claim</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </ScrollView>
          </>
        ) : null}

        {/* SIZE FINDER (collapsible) */}
        <View style={styles.finderCard}>
          <TouchableOpacity
            style={styles.finderHeader}
            onPress={() => setFinderOpen((o) => !o)}
            activeOpacity={0.85}
          >
            <View style={{ flex: 1 }}>
              <Text style={styles.finderTitle}>Find by size</Text>
              <Text style={styles.finderSub}>
                {finderStandard} · {finderDiameter}×{finderLength} · {finderGrade}
              </Text>
            </View>
            <Text style={styles.finderChevron}>{finderOpen ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {finderOpen ? (
            <View style={{ marginTop: 10 }}>
              <PillRow
                label="Standard"
                options={['DIN 933', 'DIN 912', 'DIN 934', 'DIN 6921', 'DIN 975']}
                value={finderStandard}
                onChange={setFinderStandard}
              />
              <PillRow
                label="Diameter"
                options={['M6', 'M8', 'M10', 'M12', 'M16', 'M20', 'M24']}
                value={finderDiameter}
                onChange={setFinderDiameter}
              />
              <PillRow
                label="Length (mm)"
                options={['20', '30', '40', '50', '65', '80', '100', '120']}
                value={finderLength}
                onChange={setFinderLength}
              />
              <PillRow
                label="Grade"
                options={['4.6', '8.8', '10.9', '12.9', 'SS 304']}
                value={finderGrade}
                onChange={setFinderGrade}
              />
              <TouchableOpacity
                style={styles.finderBtn}
                activeOpacity={0.88}
                onPress={() =>
                  onNavigate('catalog', {
                    standard: finderStandard,
                    grade: finderGrade,
                    search: `${finderDiameter}x${finderLength}`,
                  })
                }
              >
                <Text style={styles.finderBtnText}>Show matching items</Text>
              </TouchableOpacity>
            </View>
          ) : null}
        </View>

        {/* CATALOG */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Catalog</Text>
          <TouchableOpacity onPress={() => onNavigate('catalog')}>
            <Text style={styles.seeAll}>Browse {stats.total}+</Text>
          </TouchableOpacity>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hList}
        >
          {CATALOG_TABS.map((tab) => {
            const active = catalogTab === tab.id;
            return (
              <TouchableOpacity
                key={tab.id}
                onPress={() => setCatalogTab(tab.id)}
                style={[styles.tabBtn, active && styles.tabBtnActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tab.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {isLoading ? (
          <View style={{ paddingHorizontal: 14, gap: 10, marginTop: 4 }}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.loadingBox}>
            <Text style={styles.loadingText}>No items here yet. Try another tab.</Text>
          </View>
        ) : (
          <View style={styles.grid}>
            {filteredProducts.map((product) => {
              const isAdded = recentlyAddedId === product.id;
              const isFav = favorites.has(product.id);
              const standard = product.standard || product.din || 'DIN 933';
              const size = product.sizeFormatted || `${product.diameter || 'M10'} × ${product.lengthMm || 50}mm`;

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.92}
                  onPress={() => onSelectProduct(product)}
                  style={[styles.gridCard, product.isSurplus && styles.gridCardSurplus]}
                >
                  <View style={styles.gridImgBox}>
                    <FastenerProductImage
                      imageUrl={product.imageUrl}
                      category={product.category || product.subGroup}
                      productName={product.name}
                      standard={standard}
                      drawingUrl={product.drawingUrl}
                      height={110}
                      containerStyle={styles.gridImg}
                    />
                    <View style={styles.gridStdBadge}>
                      <Text style={styles.gridStdText}>{standard}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleFavorite(product.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.gridHeart}
                    >
                      <Text style={[styles.gridHeartIcon, isFav && styles.gridHeartActive]}>
                        {isFav ? '♥' : '♡'}
                      </Text>
                    </TouchableOpacity>
                    {product.isSurplus ? (
                      <View style={styles.gridSurplus}>
                        <Text style={styles.gridSurplusText}>-{product.surplusDiscountPct || 35}%</Text>
                      </View>
                    ) : null}
                  </View>

                  <View style={styles.gridBody}>
                    <Text style={styles.gridTitle} numberOfLines={1}>
                      {getCleanFastenerTitle(product.name, product.subGroup)}
                    </Text>
                    <Text style={styles.gridSize} numberOfLines={1}>
                      {size} · Gr {product.grade || '8.8'}
                    </Text>
                    <View style={styles.stockRow}>
                      <View style={[styles.stockDot, { backgroundColor: product.isInStock ? '#10B981' : '#F59E0B' }]} />
                      <Text style={[styles.stockText, { color: product.isInStock ? '#059669' : '#D97706' }]}>
                        {product.isInStock ? 'In stock' : 'Pre-order'}
                      </Text>
                    </View>
                    <View style={styles.priceRow}>
                      <Text style={styles.price}>
                        ₹{product.pricePerPiece}
                        <Text style={styles.priceUnit}>/pc</Text>
                      </Text>
                      <TouchableOpacity
                        activeOpacity={0.82}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleQuickAdd(product);
                        }}
                        style={[styles.addBtn, isAdded && styles.addBtnDone]}
                      >
                        <Text style={[styles.addBtnText, isAdded && styles.addBtnTextDone]}>
                          {isAdded ? '✓' : 'Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* TRUST STRIP (one line of chips instead of long sections) */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.trustRow}
        >
          {['ISO 9001', 'NABL tested', 'MTC 3.1 certificate', 'Ships in 24–48 hrs', 'GST invoice'].map((t) => (
            <View key={t} style={styles.trustChip}>
              <Text style={styles.trustText}>✓ {t}</Text>
            </View>
          ))}
        </ScrollView>

        {/* HELP CARD */}
        <View style={styles.helpCard}>
          <Text style={styles.helpTitle}>Not sure of the size?</Text>
          <Text style={styles.helpSub}>Send a photo of the bolt. Get a rate in minutes.</Text>
          <View style={styles.helpBtns}>
            <TouchableOpacity
              style={styles.helpWa}
              onPress={() => Linking.openURL(WHATSAPP_URL)}
              activeOpacity={0.88}
            >
              <Text style={styles.helpWaText}>Send photo</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.helpCall}
              onPress={() => Linking.openURL(CALL_URL)}
              activeOpacity={0.88}
            >
              <Text style={styles.helpCallText}>Call us</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
};

// Small reusable horizontal pill selector for the finder
const PillRow: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <View style={{ marginBottom: 8 }}>
    <Text style={styles.pillLabel}>{label}</Text>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.pill, active && styles.pillActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.pillText, active && styles.pillTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  </View>
);

const BLUE = '#0052CC';
const ORANGE = '#FF6B00';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E2E8F0';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FA' },
  container: { paddingBottom: 24 },
  body: { paddingHorizontal: 16, gap: 14, marginTop: 14 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },

  // Header
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 14,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    gap: 10,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  brand: { fontSize: 20, fontWeight: '800', color: '#FFFFFF' },
  brandSub: { fontSize: 12, color: '#BFDBFE', marginTop: 1 },
  liveChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  liveDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: '#34D399' },
  liveText: { fontSize: 11, fontWeight: '700', color: '#FFFFFF' },
  searchRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  searchBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 16,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  tagRow: { gap: 6, alignItems: 'center' },
  tagPill: {
    backgroundColor: 'rgba(255,255,255,0.16)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.25)',
  },
  tagText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  // Toast
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: { color: '#065F46', fontSize: 12, fontWeight: '700', flex: 1 },
  toastLink: { color: BLUE, fontSize: 12, fontWeight: '800', marginLeft: 8 },

  // Quick actions
  qaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: LINE,
  },
  qaItem: { flex: 1, alignItems: 'center', gap: 6 },
  qaIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qaGlyph: { fontSize: 13, fontWeight: '900', color: BLUE },
  qaLabel: { fontSize: 11, fontWeight: '700', color: INK },

  // Active order
  orderCard: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0', borderWidth: 1 },
  orderTitle: { fontSize: 13, fontWeight: '800', color: '#065F46' },
  orderMeta: { fontSize: 11, color: '#166534', marginTop: 4 },

  // Sections
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: -4,
  },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: INK },
  seeAll: { fontSize: 13, fontWeight: '700', color: BLUE },
  hList: { gap: 10, paddingRight: 16 },

  // Categories
  catCard: {
    width: 104,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
    gap: 3,
  },
  catBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 6,
  },
  catBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '900', letterSpacing: 0.4 },
  catName: { fontSize: 13, fontWeight: '800', color: INK },
  catHindi: { fontSize: 11, fontWeight: '600', color: '#B45309' },

  // Surplus deals
  dealCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#FECACA',
    gap: 8,
  },
  dealBadge: { backgroundColor: '#DC2626', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  dealBadgeText: { color: '#FFFFFF', fontSize: 11, fontWeight: '800' },
  dealMeta: { fontSize: 11, color: MUTED, fontWeight: '600' },
  dealName: { fontSize: 13, fontWeight: '700', color: INK, lineHeight: 18, minHeight: 36 },
  dealOld: { fontSize: 11, color: '#94A3B8', textDecorationLine: 'line-through' },
  dealNew: { fontSize: 16, fontWeight: '800', color: '#DC2626' },
  dealBtn: { backgroundColor: '#DC2626', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 10 },
  dealBtnText: { color: '#FFFFFF', fontSize: 12, fontWeight: '800' },

  // Finder
  finderCard: {
    backgroundColor: INK,
    borderRadius: 16,
    padding: 14,
  },
  finderHeader: { flexDirection: 'row', alignItems: 'center' },
  finderTitle: { fontSize: 15, fontWeight: '800', color: '#FFFFFF' },
  finderSub: { fontSize: 12, color: '#94A3B8', marginTop: 2 },
  finderChevron: { color: '#94A3B8', fontSize: 12, marginLeft: 8 },
  pillLabel: { fontSize: 11, fontWeight: '700', color: '#CBD5E1', marginBottom: 6 },
  pill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#334155',
    marginRight: 6,
  },
  pillActive: { backgroundColor: BLUE, borderColor: BLUE },
  pillText: { fontSize: 12, fontWeight: '700', color: '#94A3B8' },
  pillTextActive: { color: '#FFFFFF' },
  finderBtn: {
    backgroundColor: ORANGE,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 6,
  },
  finderBtnText: { color: '#FFFFFF', fontWeight: '800', fontSize: 13 },

  // Catalog tabs
  tabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
  },
  tabBtnActive: { backgroundColor: INK, borderColor: INK },
  tabText: { fontSize: 12, fontWeight: '700', color: MUTED },
  tabTextActive: { color: '#FFFFFF' },

  loadingBox: { padding: 28, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 12, color: MUTED, fontWeight: '600' },

  // Product grid
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
  },
  gridCardSurplus: { borderColor: '#F59E0B', borderWidth: 1.5 },
  gridImgBox: {
    height: 112,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  gridImg: { width: '100%', height: '100%', backgroundColor: 'transparent', borderWidth: 0 },
  gridStdBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#0047AB',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  gridStdText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  gridHeart: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  gridHeartIcon: { fontSize: 15, color: '#94A3B8' },
  gridHeartActive: { color: '#EF4444' },
  gridSurplus: {
    position: 'absolute',
    bottom: 6,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  gridSurplusText: { color: '#FFFFFF', fontSize: 10, fontWeight: '800' },
  gridBody: { padding: 10, gap: 2 },
  gridTitle: { fontSize: 14, fontWeight: '800', color: INK },
  gridSize: { fontSize: 12, color: MUTED, fontWeight: '600' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5, marginTop: 2, marginBottom: 6 },
  stockDot: { width: 6, height: 6, borderRadius: 3 },
  stockText: { fontSize: 11, fontWeight: '700' },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  price: { fontSize: 15, fontWeight: '900', color: '#0047AB' },
  priceUnit: { fontSize: 11, color: MUTED, fontWeight: '600' },
  addBtn: {
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
    minWidth: 52,
    alignItems: 'center',
  },
  addBtnDone: { backgroundColor: '#16A34A', borderColor: '#16A34A' },
  addBtnText: { color: '#EA580C', fontSize: 12, fontWeight: '800' },
  addBtnTextDone: { color: '#FFFFFF' },

  // Trust strip
  trustRow: { gap: 8, paddingRight: 16 },
  trustChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
  },
  trustText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  // Help card
  helpCard: { backgroundColor: '#FFFFFF', borderRadius: 16, padding: 16, borderWidth: 1, borderColor: LINE, gap: 4 },
  helpTitle: { fontSize: 16, fontWeight: '800', color: INK },
  helpSub: { fontSize: 12, color: MUTED },
  helpBtns: { flexDirection: 'row', gap: 8, marginTop: 10 },
  helpWa: {
    flex: 1.3,
    backgroundColor: '#25D366',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpWaText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  helpCall: {
    flex: 1,
    backgroundColor: '#EEF4FF',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  helpCallText: { color: BLUE, fontSize: 13, fontWeight: '800' },
});

export default CustomerHomeScreen;