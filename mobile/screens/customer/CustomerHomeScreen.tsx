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
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { mobileApi } from '../../config/api';
import { MobileProduct, MobileOrder, MobileSurplusLot, GlobalUnit } from '../../types';

interface CustomerHomeScreenProps {
  onNavigate: (tabId: string, filter?: { standard?: string; grade?: string }) => void;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
}

const VISUAL_CATEGORIES = [
  {
    id: 'hex-bolts',
    nameEn: 'Hex Bolts & Screws',
    nameHi: 'हेक्स बोल्ट',
    desc: 'Full & Half thread in Gr 8.8, 10.9 & SS',
    tag: 'MOST POPULAR',
    tagColor: '#0052CC',
    standard: 'DIN 933',
    icon: '🔩',
  },
  {
    id: 'hex-nuts',
    nameEn: 'Hex Nuts & Lock Nuts',
    nameHi: 'हेक्स नट',
    desc: 'Heavy hex, flange & nyloc nuts',
    tag: 'READY STOCK',
    tagColor: '#059669',
    standard: 'DIN 934',
    icon: '🛑',
  },
  {
    id: 'washers',
    nameEn: 'Industrial Washers',
    nameHi: 'प्लेन व स्प्रिंग वाशर',
    desc: 'Flat plain & split spring washers',
    tag: 'ANTI-VIBRATION',
    tagColor: '#4F46E5',
    standard: 'DIN 125',
    icon: '⭕',
  },
  {
    id: 'socket-screws',
    nameEn: 'Socket Allen Screws',
    nameHi: 'एलन बोल्ट (सॉकेट)',
    desc: 'High-tensile Grade 12.9 cap screws',
    tag: 'GRADE 12.9',
    tagColor: '#D97706',
    standard: 'DIN 912',
    icon: '⚙️',
  },
  {
    id: 'threaded-rods',
    nameEn: 'Threaded Rods & Studs',
    nameHi: 'स्टड व थ्रेडेड रॉड',
    desc: 'Continuous rods & ASTM A193 B7 studs',
    tag: 'HEAVY TENSILE',
    tagColor: '#0284C7',
    standard: 'DIN 975',
    icon: '📏',
  },
  {
    id: 'anchor-bolts',
    nameEn: 'Anchor & Foundation',
    nameHi: 'फाउंडेशन व एंकर बोल्ट',
    desc: 'Concrete expansion & foundation bolts',
    tag: 'CONSTRUCTION',
    tagColor: '#7C3AED',
    standard: 'DIN 933',
    icon: '🏗️',
  },
  {
    id: 'surplus-depot',
    nameEn: 'Surplus Clearance Depot',
    nameHi: 'सस्ता सरप्लस स्टॉक',
    desc: 'Factory overstock lots up to 45% off',
    tag: 'SAVE UP TO 45%',
    tagColor: '#FF6B00',
    standard: 'DIN 933',
    icon: '🔥',
  },
  {
    id: 'custom-fasteners',
    nameEn: 'Custom & Special Sizing',
    nameHi: 'मनचाहा साइज बनवाएं',
    desc: 'Special drawings manufactured to order',
    tag: 'MADE TO ORDER',
    tagColor: '#0F172A',
    standard: 'All',
    icon: '✏️',
  },
];

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
  if (/^hexagon\s+full\s+nuts?$/i.test(clean)) return 'Hex Nut';
  if (/^hexagon\s+nuts?$/i.test(clean)) return 'Hex Nut';
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
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [surplusLots, setSurplusLots] = useState<MobileSurplusLot[]>([]);
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
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);
  const [favorites, setFavorites] = useState<Set<number>>(new Set());

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  // Live Factory Catalog Controls matching website
  const [catalogTab, setCatalogTab] = useState<'all' | 'din933' | 'din912' | 'flange' | 'ht' | 'surplus'>('all');
  const [cardUnits, setCardUnits] = useState<{ [id: number]: GlobalUnit }>({});
  const [cardQtys, setCardQtys] = useState<{ [id: number]: number }>({});

  const getCardUnit = (id: number): GlobalUnit => cardUnits[id] || 'PCS';
  const getCardQty = (id: number): number => cardQtys[id] || (getCardUnit(id) === 'PCS' ? 1000 : 50);

  const setCardUnit = (id: number, unit: GlobalUnit) => {
    setCardUnits((prev) => ({ ...prev, [id]: unit }));
    setCardQtys((prev) => ({
      ...prev,
      [id]: unit === 'PCS' ? 1000 : 50,
    }));
  };

  const adjustCardQty = (id: number, delta: number) => {
    const unit = getCardUnit(id);
    const step = unit === 'PCS' ? 250 : 25;
    const current = getCardQty(id);
    const nextVal = Math.max(step, current + delta * step);
    setCardQtys((prev) => ({ ...prev, [id]: nextVal }));
  };

  const handleCardAdd = (product: MobileProduct) => {
    const unit = getCardUnit(product.id);
    const qty = getCardQty(product.id);
    onAddToCart(product, unit, qty);
    setRecentlyAddedId(product.id);
    setAddedToast(`Added ${qty.toLocaleString()} ${unit} of ${product.sku} to cart`);
    setTimeout(() => {
      setRecentlyAddedId(null);
      setAddedToast('');
    }, 2500);
  };

  const loadStorefront = async () => {
    try {
      const [prodRes, ordersRes, surplusRes] = await Promise.all([
        mobileApi.products.getAll({ limit: 12 }),
        mobileApi.orders.getAll({ limit: 1 }),
        mobileApi.surplus.getAll(),
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
      if (surplusRes.surplus && surplusRes.surplus.length > 0) {
        setSurplusLots(surplusRes.surplus);
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

  const handleHomeSearch = (overrideQuery?: string) => {
    const q = (overrideQuery !== undefined ? overrideQuery : searchQuery).trim();
    if (q) {
      onNavigate('catalog', { search: q });
    } else {
      onNavigate('catalog');
    }
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

        <View style={{ marginTop: 10 }}>
          <View style={styles.homeSearchRow}>
            <View style={{ flex: 1 }}>
              <MobileSearch
                value={searchQuery}
                onChange={setSearchQuery}
                onSubmit={() => handleHomeSearch()}
                returnKeyType="search"
                placeholder="Search DIN, Grade, Diameter, SKU..."
              />
            </View>
            <TouchableOpacity
              style={styles.homeSearchBtn}
              onPress={() => handleHomeSearch()}
              activeOpacity={0.82}
            >
              <Text style={styles.homeSearchBtnText}>Search</Text>
            </TouchableOpacity>
          </View>

          {/* Quick trending search tags */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.searchTagsScroll}
            contentContainerStyle={styles.searchTagsContent}
          >
            <Text style={styles.searchTagLabel}>Popular:</Text>
            {['DIN 933', 'DIN 912', 'Class 8.8', 'Grade 10.9', 'SS 304', 'M10 Bolt', 'Flange Nut'].map((tag) => (
              <TouchableOpacity
                key={tag}
                style={styles.searchTagPill}
                onPress={() => {
                  setSearchQuery(tag);
                  handleHomeSearch(tag);
                }}
                activeOpacity={0.75}
              >
                <Text style={styles.searchTagText}>{tag}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
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
        <View style={styles.sectionTitleCol}>
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

      {/* SECTION: Visual Fastener Categories (Matching Website SimpleVisualCategories) */}
      <View style={{ marginTop: 12 }}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionTitleCol}>
            <Text style={styles.sectionTitle}>Fasteners by Type (तस्वीर देखकर चुनें)</Text>
            <Text style={styles.sectionSubtitle}>Factory wholesale rates • Click to view all sizes &amp; rates</Text>
          </View>
          <TouchableOpacity onPress={() => onNavigate('catalog')}>
            <Text style={styles.viewAllText}>View All →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.visualGrid}>
          {VISUAL_CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              activeOpacity={0.88}
              onPress={() => onNavigate('catalog', { standard: cat.standard })}
              style={styles.visualCard}
            >
              <View style={styles.visualTop}>
                <View style={[styles.visualTag, { backgroundColor: cat.tagColor }]}>
                  <Text style={styles.visualTagText}>{cat.tag}</Text>
                </View>
                <Text style={styles.visualIcon}>{cat.icon}</Text>
              </View>

              <Text style={styles.visualNameEn} numberOfLines={1}>{cat.nameEn}</Text>
              <Text style={styles.visualNameHi}>{cat.nameHi}</Text>
              <Text style={styles.visualDesc} numberOfLines={2}>{cat.desc}</Text>

              <View style={styles.visualBottom}>
                <Text style={styles.visualStock}>✔ Ready Stock</Text>
                <Text style={styles.visualUnit}>Kg / Pcs</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* SECTION: Factory Surplus Clearance Lots (Matching Website SurplusSection) */}
      {surplusLots.length > 0 ? (
        <View style={{ marginTop: 16 }}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionTitleCol}>
              <Text style={styles.sectionTitle}>🔥 Factory Surplus Clearance</Text>
              <Text style={styles.sectionSubtitle}>
                Overstock liquidation lots up to 45% off standard rates
              </Text>
            </View>
            <TouchableOpacity onPress={() => onNavigate('catalog')}>
              <Text style={styles.viewAllText}>View All ({surplusLots.length}) →</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.surplusScroll}>
            {surplusLots.map((lot) => (
              <View key={lot.id} style={styles.surplusCard}>
                <View style={styles.surplusTopRow}>
                  <View style={styles.surplusDiscountBadge}>
                    <Text style={styles.surplusDiscountText}>
                      -{lot.clearanceDiscountPct || 35}% OFF
                    </Text>
                  </View>
                  <Text style={styles.surplusHub}>📍 {lot.locationHub || 'Ludhiana Hub'}</Text>
                </View>

                <Text style={styles.surplusSku}>{lot.sku}</Text>
                <Text style={styles.surplusName} numberOfLines={2}>
                  {lot.name}
                </Text>

                <View style={styles.surplusMetaRow}>
                  <Text style={styles.surplusMetaTag}>STD: {lot.standard}</Text>
                  <Text style={styles.surplusMetaTag}>GR: {lot.grade}</Text>
                </View>

                <View style={styles.surplusStockBox}>
                  <Text style={styles.surplusStockLabel}>EXCESS FACTORY STOCK</Text>
                  <Text style={styles.surplusStockVal}>
                    {(lot.excessQtyPcs || 0).toLocaleString()} Pcs ({lot.excessQtyKg || 0} Kg)
                  </Text>
                </View>

                <View style={styles.surplusPriceRow}>
                  <View>
                    <Text style={styles.surplusOldPrice}>₹{lot.regularPriceKg}/Kg</Text>
                    <Text style={styles.surplusNewPrice}>₹{lot.clearancePriceKg}/Kg</Text>
                  </View>

                  <TouchableOpacity
                    onPress={() => {
                      setAddedToast(`Claimed clearance lot ${lot.sku}`);
                      setTimeout(() => setAddedToast(''), 2500);
                    }}
                    style={styles.surplusClaimBtn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.surplusClaimBtnText}>⚡ Claim Deal</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </ScrollView>
        </View>
      ) : null}

      {/* Trending Standard Fasteners (Live from Backend) */}
      <View style={[styles.sectionHeader, { marginTop: 16 }]}>
        <View style={styles.sectionTitleCol}>
          <Text style={styles.sectionTitle}>Live Factory Catalog</Text>
          <Text style={styles.sectionSubtitle}>Direct Mill Pricing &amp; Dual Unit (Pc / Kg)</Text>
        </View>
        <TouchableOpacity onPress={() => onNavigate('catalog')}>
          <Text style={styles.viewAllText}>Explore All ({stats.total || '600+'}) →</Text>
        </TouchableOpacity>
      </View>

      {/* Catalog Filter Tabs matching website */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.catalogTabsScroll}>
        {[
          { id: 'all', label: '⭐ All Catalog' },
          { id: 'din933', label: '🔩 Hex Screws (DIN 933)' },
          { id: 'din912', label: '⚙️ Socket Caps (DIN 912)' },
          { id: 'flange', label: '⚡ Flange (DIN 6921)' },
          { id: 'ht', label: '🛡️ High Tensile (10.9/12.9)' },
          { id: 'surplus', label: '🔥 Surplus Deals' },
        ].map((tab) => {
          const isActive = catalogTab === tab.id;
          return (
            <TouchableOpacity
              key={tab.id}
              onPress={() => setCatalogTab(tab.id as any)}
              style={[styles.catalogTabBtn, isActive ? styles.catalogTabBtnActive : styles.catalogTabBtnInactive]}
            >
              <Text style={[styles.catalogTabBtnText, isActive ? styles.catalogTabBtnTextActive : null]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="small" color="#0052CC" />
          <Text style={styles.loadingText}>Connecting to factory warehouse bins...</Text>
        </View>
      ) : (
        <View style={styles.gridContainer}>
          {products
            .filter((p) => {
              if (catalogTab === 'surplus') return p.isSurplus;
              if (catalogTab === 'din933') return p.standard === 'DIN 933' || p.din === 'DIN 933' || p.name.includes('933');
              if (catalogTab === 'din912') return p.standard === 'DIN 912' || p.din === 'DIN 912' || p.name.includes('912') || (p.category || '').toLowerCase().includes('socket');
              if (catalogTab === 'flange') return p.standard === 'DIN 6921' || p.name.toLowerCase().includes('flange');
              if (catalogTab === 'ht') return (p.grade || '').includes('8.8') || (p.grade || '').includes('10.9') || (p.grade || '').includes('12.9');
              return true;
            })
            .map((product) => {
              const isAdded = recentlyAddedId === product.id;
              const isFav = favorites.has(product.id);
              const cleanTitle = getCleanFastenerTitle(product.name, product.subGroup);
              const standardDisplay = product.standard || product.din || 'DIN 933';
              const sizeDisplay = product.sizeFormatted || `${product.diameter || 'M10'} × ${product.lengthMm || 50}mm`;

              return (
                <TouchableOpacity
                  key={product.id}
                  activeOpacity={0.92}
                  onPress={() => onSelectProduct(product)}
                  style={[styles.gridCard, product.isSurplus ? styles.surplusCardBorder : null]}
                >
                  {/* Thumbnail Container with Top Pill and Heart Wishlist */}
                  <View style={styles.gridImgBox}>
                    <FastenerProductImage
                      imageUrl={product.imageUrl}
                      category={product.category || product.subGroup}
                      productName={product.name}
                      standard={standardDisplay}
                      drawingUrl={product.drawingUrl}
                      height={110}
                      containerStyle={styles.gridFastenerImg}
                    />

                    {/* Overlaid Standard Tag */}
                    <View style={styles.gridStandardBadge}>
                      <Text style={styles.gridStandardText}>{standardDisplay}</Text>
                    </View>

                    {/* Overlaid Wishlist Heart Button */}
                    <TouchableOpacity
                      onPress={(e) => {
                        e.stopPropagation?.();
                        toggleFavorite(product.id);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      style={styles.gridHeartBtn}
                    >
                      <Text style={[styles.gridHeartIcon, isFav ? styles.gridHeartIconActive : null]}>
                        {isFav ? '♥' : '♡'}
                      </Text>
                    </TouchableOpacity>

                    {product.isSurplus ? (
                      <View style={styles.gridSurplusBadge}>
                        <Text style={styles.gridSurplusText}>🔥 -{product.surplusDiscountPct || 35}%</Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Grid Card Content */}
                  <View style={styles.gridCardBody}>
                    {/* Product Title */}
                    <Text style={styles.gridProductTitle} numberOfLines={1}>
                      {cleanTitle}
                    </Text>

                    {/* Size & Spec */}
                    <Text style={styles.gridSizeText} numberOfLines={1}>
                      {sizeDisplay} • Gr {product.grade || '8.8'}
                    </Text>

                    {/* Live Stock Indicator */}
                    <View style={styles.gridStockRow}>
                      <View
                        style={[
                          styles.gridStockDot,
                          product.isInStock ? styles.gridStockDotGreen : styles.gridStockDotAmber,
                        ]}
                      />
                      <Text
                        style={[
                          styles.gridStockText,
                          product.isInStock ? styles.gridStockTextGreen : styles.gridStockTextAmber,
                        ]}
                        numberOfLines={1}
                      >
                        {product.isInStock ? 'In Stock' : 'Pre-Order'}
                      </Text>
                    </View>

                    {/* Price & Quick Add Button Row */}
                    <View style={styles.gridPriceActionRow}>
                      <View style={styles.gridPriceContainer}>
                        <Text style={styles.gridPriceAmount}>₹{product.pricePerPiece}</Text>
                        <Text style={styles.gridPriceUnit}>/Pc</Text>
                      </View>

                      <TouchableOpacity
                        activeOpacity={0.82}
                        onPress={(e) => {
                          e.stopPropagation?.();
                          handleQuickAdd(product);
                        }}
                        style={[styles.gridAddBtn, isAdded ? styles.gridAddBtnSuccess : null]}
                      >
                        <Text style={[styles.gridAddBtnText, isAdded ? styles.gridAddBtnTextSuccess : null]}>
                          {isAdded ? '✓ Added' : '+ Add'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
        </View>
      )}

      {/* SECTION: Order in 3 Simple Steps (Matching Website SimpleHowItWorks) */}
      <View style={styles.howItWorksBox}>
        <View style={styles.howItWorksBadge}>
          <Text style={styles.howItWorksBadgeText}>HOW TO ORDER // केवल 3 सरल कदम</Text>
        </View>
        <Text style={styles.howItWorksHeading}>Order in 3 Simple Steps</Text>
        <Text style={styles.howItWorksSub}>
          Order online or simply send your handwritten list or fastener photo on WhatsApp.
        </Text>

        <View style={styles.stepsColumn}>
          <View style={styles.stepItem}>
            <View style={[styles.stepNumBox, { backgroundColor: '#DBEAFE' }]}>
              <Text style={[styles.stepNum, { color: '#0052CC' }]}>1</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Choose or Send Photo</Text>
              <Text style={styles.stepHindi}>सामान चुनें या फोटो भेजें</Text>
              <Text style={styles.stepDesc}>
                Browse catalog online, OR take a picture of your sample bolt / handwritten paper list.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumBox, { backgroundColor: '#FFEDD5' }]}>
              <Text style={[styles.stepNum, { color: '#EA580C' }]}>2</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Get Factory Wholesale Rate</Text>
              <Text style={styles.stepHindi}>तुरंत फैक्टरी रेट पाएं</Text>
              <Text style={styles.stepDesc}>
                Zero middlemen. Our team checks inventory and gives the lowest rate per Kg/Piece in 15 mins.
              </Text>
            </View>
          </View>

          <View style={styles.stepItem}>
            <View style={[styles.stepNumBox, { backgroundColor: '#D1FAE5' }]}>
              <Text style={[styles.stepNum, { color: '#059669' }]}>3</Text>
            </View>
            <View style={styles.stepContent}>
              <Text style={styles.stepTitle}>Fast Doorstep Delivery</Text>
              <Text style={styles.stepHindi}>सीधे दुकान या साइट पर डिलीवरी</Text>
              <Text style={styles.stepDesc}>
                Dispatched in 24-48 hours across India. Comes with GST invoice and NABL 3.1 certificate.
              </Text>
            </View>
          </View>
        </View>
      </View>

      {/* SECTION: Direct WhatsApp Fastener Ordering Banner */}
      <View style={styles.waBanner}>
        <View style={styles.waHeaderRow}>
          <View style={styles.waIconBox}>
            <Text style={{ fontSize: 24 }}>💬</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.waTag}>
              <Text style={styles.waTagText}>EASY WHATSAPP ORDERING // साइज नहीं पता?</Text>
            </View>
            <Text style={styles.waTitle}>Don't know the exact size?</Text>
            <Text style={styles.waSubTitle}>Just WhatsApp a photo of the bolt or paper list!</Text>
          </View>
        </View>

        <Text style={styles.waText}>
          पुराने नट-बोल्ट की फोटो या पर्ची खींचकर +91 98880 21000 पर भेजें। हमारे इंजीनियर 5 मिनट में सही साइज और सबसे सस्ता फैक्टरी रेट बता देंगे।
        </Text>

        <View style={styles.waButtonsRow}>
          <TouchableOpacity
            onPress={() => Linking.openURL('https://wa.me/919888021000?text=Hi%20CBH%20Fasteners,%20I%20am%20sending%20a%20photo%20of%20fasteners%20I%20need.%20Please%20give%20me%20the%20wholesale%20rate.')}
            style={styles.waActionBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.waActionBtnText}>💬 Send Photo on WhatsApp</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+919888021000')}
            style={styles.waCallBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.waCallBtnText}>📞 Call +91 98880 21000</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* SECTION: Quality Assurance & Metallurgy Lab Verification (Redesigned) */}
      <View style={styles.qualitySection}>
        <View style={styles.qualityBadgeRow}>
          <Text style={styles.qualityBadgeTag}>NABL LAB &amp; ISO 9001:2015</Text>
        </View>
        <Text style={styles.qualityHeading}>Verified Industrial Grade Assurance</Text>
        <Text style={styles.qualitySub}>
          Every consignment dispatched directly from Ludhiana manufacturing facility includes verified documentation &amp; batch inspection.
        </Text>

        <View style={styles.qualityGrid}>
          <View style={styles.qualityCard}>
            <Text style={styles.qualityIcon}>📜</Text>
            <Text style={styles.qualityCardTitle}>EN 10204 Type 3.1 MTC</Text>
            <Text style={styles.qualityCardDesc}>
              Stamped mill test certificates with full chemical spectroscopy &amp; physical tensile data.
            </Text>
          </View>

          <View style={styles.qualityCard}>
            <Text style={styles.qualityIcon}>🔬</Text>
            <Text style={styles.qualityCardTitle}>NABL Lab Testing</Text>
            <Text style={styles.qualityCardDesc}>
              In-house proof load, Rockwell/Vickers hardness &amp; salt spray corrosion verification.
            </Text>
          </View>

          <View style={styles.qualityCard}>
            <Text style={styles.qualityIcon}>🛡️</Text>
            <Text style={styles.qualityCardTitle}>100% Heat Traceability</Text>
            <Text style={styles.qualityCardDesc}>
              Complete traceability from raw material wire rod coils to packaged shipping cartons.
            </Text>
          </View>

          <View style={styles.qualityCard}>
            <Text style={styles.qualityIcon}>⚡</Text>
            <Text style={styles.qualityCardTitle}>Optical Sorting (PPM &lt; 50)</Text>
            <Text style={styles.qualityCardDesc}>
              High-speed 360° laser optical dimension &amp; thread pitch sorting for zero assembly rejects.
            </Text>
          </View>
        </View>
      </View>

      {/* SECTION: Direct Technical Consultation Bar (Matching Website ConsultationBar) */}
      <View style={styles.consultBar}>
        <View style={styles.consultLeft}>
          <Text style={styles.consultTitle}>Need Custom Fasteners or Special Coating?</Text>
          <Text style={styles.consultSub}>
            Speak directly with CBH application metallurgists for drawing review, non-standard threading, or annual enterprise contracts.
          </Text>
        </View>

        <View style={styles.consultActions}>
          <TouchableOpacity
            onPress={() => Linking.openURL('tel:+919876543210')}
            style={styles.consultCallBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.consultCallText}>📞 Call Desk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => Linking.openURL('mailto:sales@cbhfasteners.com')}
            style={styles.consultEmailBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.consultEmailText}>✉️ Email Drawing</Text>
          </TouchableOpacity>
        </View>
      </View>
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
  homeSearchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  homeSearchBtn: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: '#FF6B00',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  homeSearchBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  searchTagsScroll: {
    marginTop: 8,
  },
  searchTagsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  searchTagLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#93C5FD',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginRight: 2,
  },
  searchTagPill: {
    backgroundColor: 'rgba(255, 255, 255, 0.16)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  searchTagText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
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
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  sectionTitleCol: {
    flex: 1,
    marginRight: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 15,
  },
  viewAllText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '700',
    paddingTop: 2,
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
  // Surplus Clearance Styles
  surplusScroll: {
    flexDirection: 'row',
    marginTop: 6,
  },
  surplusCard: {
    width: 220,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#FECACA',
    marginRight: 10,
    gap: 4,
    elevation: 2,
    shadowColor: '#EF4444',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
  },
  surplusTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  surplusDiscountBadge: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  surplusDiscountText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
  },
  surplusHub: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '600',
  },
  surplusSku: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#B91C1C',
  },
  surplusName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    lineHeight: 16,
    minHeight: 32,
  },
  surplusMetaRow: {
    flexDirection: 'row',
    gap: 6,
    marginVertical: 2,
  },
  surplusMetaTag: {
    fontSize: 9,
    backgroundColor: '#FEF2F2',
    color: '#991B1B',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    fontWeight: '700',
  },
  surplusStockBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    padding: 6,
    marginTop: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  surplusStockLabel: {
    fontSize: 8,
    color: '#64748B',
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  surplusStockVal: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 1,
  },
  surplusPriceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#FEE2E2',
  },
  surplusOldPrice: {
    fontSize: 10,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  surplusNewPrice: {
    fontSize: 14,
    fontWeight: '800',
    color: '#DC2626',
  },
  surplusClaimBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  surplusClaimBtnText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },

  // Quality Assurance Styles
  qualitySection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
    gap: 6,
  },
  qualityBadgeRow: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 2,
  },
  qualityBadgeTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.4,
  },
  qualityHeading: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  qualitySub: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  qualityGrid: {
    gap: 8,
    marginTop: 6,
  },
  qualityCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  qualityIcon: {
    fontSize: 16,
    marginBottom: 2,
  },
  qualityCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  qualityCardDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 14,
  },

  // Visual Fastener Categories Grid Styles (Matching Website SimpleVisualCategories)
  visualGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 6,
  },
  visualCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    justifyContent: 'space-between',
    minHeight: 130,
  },
  visualTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  visualTag: {
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 4,
  },
  visualTagText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  visualIcon: {
    fontSize: 18,
  },
  visualNameEn: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  visualNameHi: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
    marginTop: 1,
  },
  visualDesc: {
    fontSize: 9,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 13,
  },
  visualBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 6,
    paddingTop: 5,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  visualStock: {
    fontSize: 9,
    color: '#15803D',
    fontWeight: '700',
  },
  visualUnit: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    fontFamily: 'monospace',
  },

  // How It Works in 3 Simple Steps Styles (Matching Website SimpleHowItWorks)
  howItWorksBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 8,
  },
  howItWorksBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  howItWorksBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.3,
  },
  howItWorksHeading: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  howItWorksSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    marginBottom: 12,
    lineHeight: 16,
  },
  stepsColumn: {
    gap: 10,
  },
  stepItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 10,
  },
  stepNumBox: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNum: {
    fontSize: 14,
    fontWeight: '900',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepHindi: {
    fontSize: 10,
    fontWeight: '700',
    color: '#0052CC',
    marginTop: 1,
  },
  stepDesc: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 3,
    lineHeight: 14,
  },

  // WhatsApp Quick Order Banner
  waBanner: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    gap: 10,
  },
  waHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  waIconBox: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: 'rgba(37, 211, 102, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(37, 211, 102, 0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waTag: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(37, 211, 102, 0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    marginBottom: 3,
  },
  waTagText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#6EE7B7',
    letterSpacing: 0.3,
  },
  waTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  waSubTitle: {
    fontSize: 11,
    color: '#CBD5E1',
    fontWeight: '600',
  },
  waText: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 15,
  },
  waButtonsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  waActionBtn: {
    flex: 1.3,
    backgroundColor: '#25D366',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waActionBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  waCallBtn: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  waCallBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Consultation Bar Styles
  consultBar: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 14,
    marginTop: 8,
    marginBottom: 16,
    gap: 10,
  },
  consultLeft: {
    gap: 3,
  },
  consultTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  consultSub: {
    fontSize: 10,
    color: '#94A3B8',
    lineHeight: 15,
  },
  consultActions: {
    flexDirection: 'row',
    gap: 8,
  },
  consultCallBtn: {
    flex: 1,
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultCallText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  consultEmailBtn: {
    flex: 1,
    backgroundColor: '#1E293B',
    borderWidth: 1,
    borderColor: '#334155',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  consultEmailText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },

  // Redesigned Live Factory Catalog & Product Card Styles
  catalogTabsScroll: {
    flexDirection: 'row',
    marginTop: 6,
    marginBottom: 10,
  },
  catalogTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  catalogTabBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  catalogTabBtnInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  catalogTabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catalogTabBtnTextActive: {
    color: '#FFFFFF',
  },
  // 2-Column Product Grid Styles for Live Factory Catalog
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
    marginBottom: 16,
  },
  gridCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#0F172A',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    overflow: 'hidden',
  },
  gridImgBox: {
    height: 112,
    backgroundColor: '#EEF4FF',
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  gridFastenerImg: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  gridStandardBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: '#0047AB',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    zIndex: 2,
  },
  gridStandardText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  gridHeartBtn: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  gridHeartIcon: {
    fontSize: 14,
    color: '#94A3B8',
  },
  gridHeartIconActive: {
    color: '#EF4444',
  },
  gridSurplusBadge: {
    position: 'absolute',
    bottom: 5,
    left: 6,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    zIndex: 2,
  },
  gridSurplusText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '800',
  },
  gridCardBody: {
    padding: 10,
    flexDirection: 'column',
  },
  gridProductTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  gridSizeText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
    marginBottom: 4,
  },
  gridStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 8,
  },
  gridStockDot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
  },
  gridStockDotGreen: {
    backgroundColor: '#10B981',
  },
  gridStockDotAmber: {
    backgroundColor: '#F59E0B',
  },
  gridStockText: {
    fontSize: 10.5,
    fontWeight: '700',
  },
  gridStockTextGreen: {
    color: '#059669',
  },
  gridStockTextAmber: {
    color: '#D97706',
  },
  gridPriceActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  gridPriceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  gridPriceAmount: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0047AB',
  },
  gridPriceUnit: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    marginLeft: 1,
  },
  gridAddBtn: {
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 14,
    paddingHorizontal: 9,
    paddingVertical: 3.5,
    backgroundColor: '#FFFFFF',
  },
  gridAddBtnSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  gridAddBtnText: {
    color: '#EA580C',
    fontSize: 10.5,
    fontWeight: '800',
  },
  gridAddBtnTextSuccess: {
    color: '#FFFFFF',
  },
  surplusCardBorder: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  cardHeaderStrip: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cardHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  standardBadge: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  standardBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.3,
  },
  sizePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  sizePillText: {
    color: '#0F172A',
    fontSize: 11,
    fontWeight: '800',
  },
  stockStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statusDotGreen: {
    backgroundColor: '#10B981',
  },
  statusDotAmber: {
    backgroundColor: '#F59E0B',
  },
  statusText: {
    fontSize: 10,
    fontWeight: '800',
  },
  statusTextGreen: {
    color: '#065F46',
  },
  statusTextAmber: {
    color: '#B45309',
  },
  imageWrapper: {
    position: 'relative',
    marginVertical: 4,
    borderRadius: 10,
    overflow: 'hidden',
  },
  surplusOverlayPill: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: '#DC2626',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  surplusOverlayText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  identityRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 4,
  },
  skuTagBox: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  skuTagMono: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0052CC',
  },
  binStockMeta: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  productCardName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 20,
    marginBottom: 8,
  },
  specsStrip: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginBottom: 10,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  specColumn: {
    alignItems: 'center',
    flex: 1,
  },
  specColLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  specColVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  specColumnDivider: {
    width: 1,
    height: 20,
    backgroundColor: '#CBD5E1',
  },
  dualPricePanel: {
    flexDirection: 'row',
    backgroundColor: '#F0FDF4',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: '#BBF7D0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  priceColumn: {
    flex: 1,
  },
  priceBoxLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#166534',
    letterSpacing: 0.5,
  },
  priceRowFlex: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 2,
  },
  priceLargeVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#15803D',
  },
  priceUnitSub: {
    fontSize: 11,
    fontWeight: '700',
    color: '#166534',
    marginLeft: 2,
  },
  pricePanelDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#86EFAC',
    marginHorizontal: 10,
  },
  weightBenchmarkRow: {
    paddingHorizontal: 4,
    marginTop: 4,
    marginBottom: 8,
  },
  weightBenchmarkText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  orderControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  cardUnitSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  unitBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  unitBtnActive: {
    backgroundColor: '#0F172A',
  },
  unitBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },
  unitBtnTextActive: {
    color: '#FFFFFF',
  },
  cardQtyStepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    overflow: 'hidden',
  },
  stepperMinusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderRightWidth: 1,
    borderRightColor: '#E2E8F0',
  },
  stepperPlusBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#F8FAFC',
    borderLeftWidth: 1,
    borderLeftColor: '#E2E8F0',
  },
  stepperBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperValWrap: {
    paddingHorizontal: 10,
  },
  stepperValText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  cardActionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardSummaryBox: {
    flex: 1,
  },
  cardSummaryLabel: {
    fontSize: 8,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  cardSummaryPrice: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
  cardSummaryWeight: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  cardAddToCartBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 8,
    elevation: 1,
  },
  cardAddToCartBtnSuccess: {
    backgroundColor: '#059669',
  },
  cardAddToCartBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  viewSpecsLinkRow: {
    marginTop: 8,
    paddingTop: 6,
    alignItems: 'center',
  },
  viewSpecsLinkText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
});

export default CustomerHomeScreen;
