import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { NavIcon } from '../../components/NavIcon';
import { MobileProduct, GlobalUnit } from '../../types';
import {
  mobileApi,
  MIN_QTY_PCS,
  MIN_QTY_KGS,
  clampQty,
  formatQtyDisplay,
} from '../../config/api';

interface CustomerProductDetailScreenProps {
  product: MobileProduct;
  cartCount?: number;
  onBack: () => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
  onNavigateToCart: () => void;
  onSearch?: (query: string) => void;
  onSelectProduct?: (product: MobileProduct) => void;
}

// Volume discount tiers (same slabs as before, now data-driven)
const TIERS: Record<GlobalUnit, { min: number; pct: number }[]> = {
  PCS: [
    { min: 500, pct: 8 },
    { min: 2500, pct: 18 },
    { min: 10000, pct: 25 },
  ],
  KGS: [
    { min: 50, pct: 10 },
    { min: 250, pct: 20 },
    { min: 1000, pct: 26 },
  ],
};

const PRESETS: Record<GlobalUnit, number[]> = {
  PCS: [100, 500, 1000, 5000],
  KGS: [0.25, 50, 250, 1000],
};

const tierLabel = (min: number, unit: GlobalUnit) => {
  if (unit === 'KGS') return min >= 1000 ? `${min / 1000} t` : `${min} kg`;
  return min >= 1000 ? `${min / 1000}K` : `${min}`;
};

const BLUE = '#0047AB';
const ORANGE = '#FF6B00';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E2E8F0';

export const CustomerProductDetailScreen: React.FC<CustomerProductDetailScreenProps> = ({
  product,
  cartCount = 0,
  onBack,
  onAddToCart,
  onNavigateToCart,
  onSearch,
  onSelectProduct,
}) => {
  const [selectedUnit, setSelectedUnit] = useState<GlobalUnit>('PCS');
  const [quantity, setQuantity] = useState<number>(500);
  const [quantityInput, setQuantityInput] = useState<string>('500');
  const [isAddedToast, setIsAddedToast] = useState(false);
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [showAllSpecs, setShowAllSpecs] = useState(false);

  // Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<MobileProduct[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const handleSearchSubmit = () => {
    const q = searchQuery.trim();
    if (!q) return;
    setShowDropdown(false);
    if (onSearch) {
      onSearch(q);
    }
  };

  const weightPerPc = product.weightPerPcKg || 0.05;
  const minQty = selectedUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;

  const updateQuantity = (val: number) => {
    setQuantity(val);
    setQuantityInput(String(val));
  };

  const handleUnitToggle = (newUnit: GlobalUnit) => {
    if (newUnit === selectedUnit) return;
    setSelectedUnit(newUnit);
    if (newUnit === 'KGS') {
      const approxKg = Math.round(quantity * weightPerPc * 100) / 100;
      updateQuantity(Math.max(MIN_QTY_KGS, approxKg));
    } else {
      const approxPcs = Math.round(quantity / weightPerPc);
      const rounded = Math.round(approxPcs / 10) * 10;
      updateQuantity(Math.max(MIN_QTY_PCS, rounded));
    }
  };

  const handleStepQty = (delta: number) => {
    if (selectedUnit === 'KGS') {
      if (delta < 0) {
        if (quantity <= MIN_QTY_KGS) return;
        const step = quantity <= 1 ? 0.25 : 0.5;
        updateQuantity(Math.max(MIN_QTY_KGS, Math.round((quantity - step) * 100) / 100));
      } else {
        const step = quantity < 1 ? 0.25 : quantity < 5 ? 0.5 : 1.0;
        updateQuantity(Math.round((quantity + step) * 100) / 100);
      }
    } else if (delta < 0) {
      if (quantity <= MIN_QTY_PCS) return;
      const step = quantity > 1000 ? 500 : quantity > 200 ? 100 : 10;
      updateQuantity(Math.max(MIN_QTY_PCS, quantity - step));
    } else {
      const step = quantity >= 1000 ? 500 : quantity >= 200 ? 100 : 10;
      updateQuantity(quantity + step);
    }
  };

  const handleInputChange = (text: string) => {
    setQuantityInput(text);
    const parsed = parseFloat(text);
    if (!isNaN(parsed) && parsed > 0) setQuantity(parsed);
  };

  const handleInputBlur = () => updateQuantity(clampQty(quantity, selectedUnit));

  // Live search suggestions
  useEffect(() => {
    if (searchQuery.trim().length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    const handler = setTimeout(async () => {
      try {
        setIsSearching(true);
        const res = await mobileApi.products.getAll({ search: searchQuery.trim(), limit: 4 });
        setSearchResults(res.products || []);
        setShowDropdown(true);
      } catch (err) {
        console.warn('[Detail Screen] Search error:', err);
      } finally {
        setIsSearching(false);
      }
    }, 280);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  // Calculations
  const totalWeightKg = selectedUnit === 'PCS' ? +(quantity * weightPerPc).toFixed(2) : quantity;
  const activeTier = [...TIERS[selectedUnit]].reverse().find((t) => quantity >= t.min);
  const discountPct = activeTier?.pct || 0;
  const unitRate = selectedUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
  const grossTotal = +(quantity * unitRate).toFixed(2);
  const discountAmount = +(grossTotal * (discountPct / 100)).toFixed(2);
  const netEstimatedTotal = +(grossTotal - discountAmount).toFixed(2);
  const gstAmount = +(netEstimatedTotal * 0.18).toFixed(2);
  const grandTotal = +(netEstimatedTotal + gstAmount).toFixed(2);

  const handleAdd = () => {
    // Clamp so a half-typed quantity can't be added below the minimum
    const finalQty = clampQty(quantity, selectedUnit);
    updateQuantity(finalQty);
    onAddToCart(product, selectedUnit, finalQty);
    setIsAddedToast(true);
    setTimeout(() => setIsAddedToast(false), 2500);
  };

  const specs: { k: string; v: string }[] = [
    { k: 'Standard', v: product.standard || 'DIN 933' },
    product.isoStandard ? { k: 'ISO equivalent', v: product.isoStandard } : null,
    { k: 'Grade', v: product.grade || '8.8' },
    { k: 'Finish', v: product.finish || 'Zinc clear' },
    { k: 'Diameter', v: product.diameter || 'M10' },
    { k: 'Length', v: `${product.lengthMm || 50} mm` },
    product.pitchMm ? { k: 'Thread pitch', v: `${product.pitchMm} mm` } : null,
    { k: 'Thread type', v: product.threadType || 'Metric full thread' },
    { k: 'HSN code', v: String(product.hsnCode || '73181500') },
  ].filter(Boolean) as { k: string; v: string }[];
  const visibleSpecs = showAllSpecs ? specs : specs.slice(0, 4);

  const chips = [
    product.standard,
    product.grade ? `Gr ${product.grade}` : null,
    product.diameter && product.lengthMm ? `${product.diameter} × ${product.lengthMm}` : null,
    product.finish,
  ].filter(Boolean) as string[];

  return (
    <View style={styles.screen}>
      {/* Header with Integrated Search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onBack} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>
            {product.sku || product.name}
          </Text>
          <TouchableOpacity
            onPress={onNavigateToCart}
            style={styles.headerBtn}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <NavIcon name="cart" color="#FFFFFF" size={20} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

        {/* Permanent Search Row */}
        <View style={styles.searchRow}>
          <View style={styles.searchBar}>
            <NavIcon name="search" color={MUTED} size={16} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search size, DIN, grade"
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
              autoCorrect={false}
              returnKeyType="search"
              onSubmitEditing={handleSearchSubmit}
            />
            {isSearching ? (
              <ActivityIndicator size="small" color={BLUE} />
            ) : searchQuery ? (
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setShowDropdown(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.searchClear}>✕</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <TouchableOpacity
            style={styles.searchBtn}
            onPress={handleSearchSubmit}
            activeOpacity={0.85}
          >
            <Text style={styles.searchBtnText}>Search</Text>
          </TouchableOpacity>
        </View>

        {/* Search Suggestions Dropdown Overlay */}
        {showDropdown && searchResults.length > 0 ? (
          <View style={styles.dropdown}>
            {searchResults.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                activeOpacity={0.8}
                onPress={() => {
                  setShowDropdown(false);
                  setSearchQuery('');
                  if (onSelectProduct) onSelectProduct(item);
                  else if (onSearch) onSearch(item.name);
                }}
              >
                <View style={styles.dropdownImg}>
                  <FastenerProductImage
                    imageUrl={item.imageUrl}
                    category={item.category || item.subGroup}
                    productName={item.name}
                    standard={item.standard}
                    height={38}
                  />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.dropdownTitle} numberOfLines={1}>
                    {item.name}
                  </Text>
                  <Text style={styles.dropdownSub}>
                    {item.standard || 'DIN 933'} · ₹{item.pricePerPiece}/pc
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.dropdownFooter}
              onPress={handleSearchSubmit}
            >
              <Text style={styles.dropdownFooterText}>See all results for "{searchQuery}"</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </View>

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {/* Hero */}
        <View style={styles.heroCard}>
          <FastenerProductImage
            imageUrl={product.imageUrl}
            drawingUrl={product.drawingUrl}
            height={200}
            showCadBadge
          />
          <View
            style={[
              styles.stockChip,
              { backgroundColor: product.isInStock ? '#DCFCE7' : '#FEF3C7' },
            ]}
          >
            <View style={[styles.stockDot, { backgroundColor: product.isInStock ? '#16A34A' : '#D97706' }]} />
            <Text style={[styles.stockChipText, { color: product.isInStock ? '#166534' : '#92400E' }]}>
              {product.isInStock ? 'In stock' : 'Pre-order'}
            </Text>
          </View>
        </View>

        {/* Title */}
        <View>
          <Text style={styles.title}>{product.name}</Text>
          {product.stockPcs ? (
            <Text style={styles.stockLine}>{product.stockPcs.toLocaleString()} pcs available</Text>
          ) : null}
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          {chips.map((c) => (
            <View key={c} style={styles.specChip}>
              <Text style={styles.specChipText}>{c}</Text>
            </View>
          ))}
        </ScrollView>

        {isAddedToast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>✓ Added to cart</Text>
            <TouchableOpacity onPress={onNavigateToCart}>
              <Text style={styles.toastLink}>View cart</Text>
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Price + unit */}
        <View style={styles.card}>
          <View style={styles.segment}>
            {(['PCS', 'KGS'] as GlobalUnit[]).map((u) => {
              const active = selectedUnit === u;
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => handleUnitToggle(u)}
                  style={[styles.segBtn, active && styles.segBtnActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.segText, active && styles.segTextActive]}>
                    {u === 'PCS' ? 'By piece' : 'By weight'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.priceRow}>
            <View>
              <Text style={styles.price}>
                ₹{unitRate}
                <Text style={styles.priceUnit}>/{selectedUnit === 'PCS' ? 'pc' : 'kg'}</Text>
              </Text>
              <Text style={styles.priceNote}>+ 18% GST</Text>
            </View>
            <Text style={styles.altPrice}>
              {selectedUnit === 'PCS' ? `₹${product.pricePerKg}/kg` : `₹${product.pricePerPiece}/pc`}
            </Text>
          </View>

          {/* Quantity */}
          <View style={styles.qtyHeader}>
            <Text style={styles.cardLabel}>Quantity</Text>
            <Text style={styles.minText}>Min {formatQtyDisplay(minQty, selectedUnit)}</Text>
          </View>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => handleStepQty(-1)}
              disabled={quantity <= minQty}
              style={[styles.stepBtn, quantity <= minQty && styles.stepBtnDisabled]}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <TextInput
              keyboardType="numeric"
              value={quantityInput}
              onChangeText={handleInputChange}
              onBlur={handleInputBlur}
              style={styles.stepInput}
            />
            <TouchableOpacity onPress={() => handleStepQty(1)} style={styles.stepBtn}>
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.presetRow}>
            {PRESETS[selectedUnit].map((p) => {
              const active = quantity === p;
              return (
                <TouchableOpacity
                  key={p}
                  onPress={() => updateQuantity(p)}
                  style={[styles.preset, active && styles.presetActive]}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.presetText, active && styles.presetTextActive]}>
                    {formatQtyDisplay(p, selectedUnit)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          <Text style={styles.weightLine}>
            ≈ {totalWeightKg.toLocaleString()} kg · {weightPerPc} kg/pc
          </Text>
        </View>

        {/* Volume discount tiers */}
        <View style={styles.card}>
          <View style={styles.qtyHeader}>
            <Text style={styles.cardLabel}>Buy more, save more</Text>
            {discountPct > 0 ? (
              <Text style={styles.savedText}>Saved ₹{discountAmount.toLocaleString('en-IN')}</Text>
            ) : null}
          </View>
          <View style={styles.tierRow}>
            {TIERS[selectedUnit].map((t) => {
              const active = activeTier?.min === t.min;
              return (
                <TouchableOpacity
                  key={t.min}
                  onPress={() => updateQuantity(t.min)}
                  style={[styles.tier, active && styles.tierActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.tierPct, active && styles.tierPctActive]}>−{t.pct}%</Text>
                  <Text style={[styles.tierQty, active && styles.tierQtyActive]}>
                    {tierLabel(t.min, selectedUnit)}+
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Specs */}
        <View style={styles.card}>
          <View style={styles.qtyHeader}>
            <Text style={styles.cardLabel}>Specifications</Text>
            <View style={styles.certPill}>
              <Text style={styles.certPillText}>Type 3.1 MTC</Text>
            </View>
          </View>
          {visibleSpecs.map((s) => (
            <View key={s.k} style={styles.specRow}>
              <Text style={styles.specKey}>{s.k}</Text>
              <Text style={styles.specVal}>{s.v}</Text>
            </View>
          ))}
          {specs.length > 4 ? (
            <TouchableOpacity onPress={() => setShowAllSpecs((v) => !v)} style={styles.moreBtn}>
              <Text style={styles.moreText}>{showAllSpecs ? 'Show less' : `Show all ${specs.length}`}</Text>
            </TouchableOpacity>
          ) : null}

          <View style={styles.packRow}>
            <View style={styles.packCol}>
              <Text style={styles.packVal}>{Math.round(Number(product.pcsPerBox)) || 500}</Text>
              <Text style={styles.packLbl}>pcs / box</Text>
            </View>
            <View style={styles.packDivider} />
            <View style={styles.packCol}>
              <Text style={styles.packVal}>{Math.round(Number(product.pcsPerMasterCtn)) || 4000}</Text>
              <Text style={styles.packLbl}>pcs / carton</Text>
            </View>
            <View style={styles.packDivider} />
            <View style={styles.packCol}>
              <Text style={styles.packVal}>{product.leadTimeDays || 10} days</Text>
              <Text style={styles.packLbl}>lead time</Text>
            </View>
          </View>
        </View>

        {/* Delivery */}
        <View style={styles.card}>
          <Text style={styles.cardLabel}>Delivery</Text>
          <View style={styles.pinRow}>
            <TextInput
              style={styles.pinInput}
              value={deliveryPincode}
              onChangeText={setDeliveryPincode}
              placeholder="Enter pincode"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              maxLength={6}
            />
            <View style={styles.shipPill}>
              <Text style={styles.shipPillText}>Ships in 24–48 hrs</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      {/* Sticky bottom bar */}
      <View style={styles.bottomBar}>
        <View>
          <Text style={styles.netLabel}>Total incl. GST</Text>
          <Text style={styles.netValue}>₹{grandTotal.toLocaleString('en-IN')}</Text>
        </View>
        <TouchableOpacity onPress={handleAdd} style={styles.ctaBtn} activeOpacity={0.88}>
          <Text style={styles.ctaBtnText}>Add to cart</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FA' },

  // Header
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    zIndex: 99,
    gap: 10,
  },
  headerTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  headerBtn: { padding: 4 },
  headerBack: { fontSize: 24, color: '#FFFFFF', fontWeight: '700' },
  headerTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: '#FFFFFF', marginLeft: 8 },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -6,
    backgroundColor: ORANGE,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  // Search
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
    borderWidth: 1,
    borderColor: LINE,
  },
  searchInput: { flex: 1, fontSize: 14, color: INK, paddingVertical: 0 },
  searchClear: { fontSize: 14, color: '#94A3B8', paddingHorizontal: 4 },
  searchBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  searchBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },
  dropdown: {
    position: 'absolute',
    top: 114,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
    elevation: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    zIndex: 9999,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  dropdownImg: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  dropdownTitle: { fontSize: 13, fontWeight: '700', color: INK },
  dropdownSub: { fontSize: 11, color: MUTED, marginTop: 2 },
  dropdownFooter: { paddingVertical: 11, alignItems: 'center', backgroundColor: '#F8FAFC' },
  dropdownFooterText: { fontSize: 12, fontWeight: '800', color: BLUE },

  container: { padding: 16, gap: 12, paddingBottom: 100 },

  // Hero
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
  },
  stockChip: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockChipText: { fontSize: 12, fontWeight: '800' },

  title: { fontSize: 20, fontWeight: '800', color: INK, lineHeight: 26 },
  stockLine: { fontSize: 13, color: '#059669', fontWeight: '600', marginTop: 4 },
  chipRow: { gap: 8, paddingRight: 16 },
  specChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
  },
  specChipText: { fontSize: 12, fontWeight: '700', color: '#334155' },

  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toastText: { color: '#065F46', fontSize: 13, fontWeight: '700' },
  toastLink: { color: BLUE, fontSize: 13, fontWeight: '800' },

  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: LINE,
  },
  cardLabel: { fontSize: 14, fontWeight: '800', color: INK },

  // Unit segment
  segment: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    padding: 3,
  },
  segBtn: { flex: 1, paddingVertical: 9, borderRadius: 10, alignItems: 'center' },
  segBtnActive: { backgroundColor: BLUE },
  segText: { fontSize: 13, fontWeight: '700', color: MUTED },
  segTextActive: { color: '#FFFFFF' },

  priceRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 14,
    marginBottom: 16,
  },
  price: { fontSize: 28, fontWeight: '900', color: BLUE },
  priceUnit: { fontSize: 15, fontWeight: '700', color: MUTED },
  priceNote: { fontSize: 12, color: MUTED, marginTop: 1 },
  altPrice: { fontSize: 14, fontWeight: '700', color: '#475569' },

  qtyHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  minText: { fontSize: 12, fontWeight: '700', color: BLUE },
  stepperRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  stepBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnDisabled: { opacity: 0.35 },
  stepBtnText: { fontSize: 22, fontWeight: '800', color: BLUE },
  stepInput: {
    flex: 1,
    height: 48,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '800',
    color: INK,
  },
  presetRow: { gap: 8, paddingTop: 12, paddingRight: 8 },
  preset: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: LINE,
  },
  presetActive: { backgroundColor: INK, borderColor: INK },
  presetText: { fontSize: 12, fontWeight: '700', color: '#475569' },
  presetTextActive: { color: '#FFFFFF' },
  weightLine: { fontSize: 12, color: MUTED, marginTop: 12 },

  // Tiers
  savedText: { fontSize: 13, fontWeight: '800', color: '#15803D' },
  tierRow: { flexDirection: 'row', gap: 8 },
  tier: {
    flex: 1,
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 14,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: LINE,
  },
  tierActive: { backgroundColor: '#ECFDF5', borderColor: '#16A34A' },
  tierPct: { fontSize: 16, fontWeight: '900', color: '#475569' },
  tierPctActive: { color: '#15803D' },
  tierQty: { fontSize: 11, fontWeight: '700', color: MUTED, marginTop: 2 },
  tierQtyActive: { color: '#166534' },

  // Specs
  certPill: { backgroundColor: '#EEF4FF', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  certPillText: { fontSize: 11, fontWeight: '800', color: BLUE },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  specKey: { fontSize: 13, color: MUTED, fontWeight: '600' },
  specVal: { fontSize: 13, fontWeight: '700', color: INK, flexShrink: 1, textAlign: 'right', marginLeft: 12 },
  moreBtn: { paddingVertical: 10, alignItems: 'center', borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  moreText: { fontSize: 13, fontWeight: '800', color: BLUE },
  packRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    paddingVertical: 10,
    marginTop: 4,
  },
  packCol: { flex: 1, alignItems: 'center' },
  packVal: { fontSize: 14, fontWeight: '800', color: INK },
  packLbl: { fontSize: 11, color: MUTED, marginTop: 1 },
  packDivider: { width: 1, height: 26, backgroundColor: '#CBD5E1' },

  // Delivery
  pinRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: 10 },
  pinInput: {
    flex: 1,
    height: 46,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: LINE,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 14,
    fontSize: 14,
    fontWeight: '700',
    color: INK,
  },
  shipPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderRadius: 14,
  },
  shipPillText: { fontSize: 12, fontWeight: '800', color: '#065F46' },

  // Bottom bar
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: LINE,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  netLabel: { fontSize: 12, color: MUTED, fontWeight: '600' },
  netValue: { fontSize: 22, fontWeight: '900', color: BLUE },
  ctaBtn: {
    backgroundColor: ORANGE,
    paddingHorizontal: 28,
    height: 50,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
});

export default CustomerProductDetailScreen;