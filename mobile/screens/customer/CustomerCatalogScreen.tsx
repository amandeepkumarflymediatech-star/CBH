import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Modal,
} from 'react-native';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { NavIcon } from '../../components/NavIcon';
import {
  mobileApi,
  MIN_QTY_PCS,
  MIN_QTY_KGS,
  formatQtyDisplay,
} from '../../config/api';
import { MobileProduct, GlobalUnit } from '../../types';

interface CustomerCatalogScreenProps {
  initialStandard?: string;
  initialGrade?: string;
  initialSearch?: string;
  cartCount?: number;
  onNavigateToCart?: () => void;
  onNavigateHome?: () => void;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
}

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

  if (clean.length < 3 || clean.length > 25) {
    const sg = (subGroup || '').toUpperCase();
    if (sg.includes('BOLT')) return 'Hex Bolt';
    if (sg.includes('NUT')) return 'Hex Nut';
    if (sg.includes('SCREW')) return 'CSK Screw';
    if (sg.includes('WASHER')) return 'Flat Washer';
    if (sg.includes('SOCKET')) return 'Socket Cap Screw';
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

const CATEGORIES: Array<{ id: string; label: string }> = [
  { id: 'All', label: 'All' },
  { id: 'BOLTS', label: 'Bolts' },
  { id: 'NUTS', label: 'Nuts' },
  { id: 'SCREWS', label: 'Screws' },
  { id: 'WASHERS', label: 'Washers' },
  { id: 'STUDS', label: 'Studs' },
  { id: 'ANCHORS', label: 'Anchors' },
];

const PAGE_SIZE = 12;
const BLUE = '#0047AB';
const ORANGE = '#FF6B00';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E2E8F0';

// Chip group used inside the filter sheet
const ChipGroup: React.FC<{
  label: string;
  options: string[];
  value: string;
  onChange: (v: string) => void;
}> = ({ label, options, value, onChange }) => (
  <View>
    <Text style={styles.sheetLabel}>{label}</Text>
    <View style={styles.chipWrap}>
      {options.map((opt) => {
        const active = value === opt;
        return (
          <TouchableOpacity
            key={opt}
            onPress={() => onChange(opt)}
            style={[styles.chip, active && styles.chipActive]}
            activeOpacity={0.8}
          >
            <Text style={[styles.chipText, active && styles.chipTextActive]}>{opt}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  </View>
);

export const CustomerCatalogScreen: React.FC<CustomerCatalogScreenProps> = ({
  initialStandard,
  initialGrade,
  initialSearch,
  cartCount = 0,
  onNavigateToCart,
  onNavigateHome,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(1);
  const requestRef = useRef(0); // ignores out-of-order responses

  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch || '');

  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedStandard, setSelectedStandard] = useState(initialStandard || 'All');
  const [selectedGrade, setSelectedGrade] = useState(initialGrade || 'All');
  const [selectedDiameter, setSelectedDiameter] = useState('All');
  const [selectedFinish, setSelectedFinish] = useState('All');
  const [inStockOnly, setInStockOnly] = useState(false);

  const [relatedProducts, setRelatedProducts] = useState<
    Array<{ product: MobileProduct; reason: string; tone: string }>
  >([]);

  // Per-card unit and quantity
  const [cardUnits, setCardUnits] = useState<Record<number, GlobalUnit>>({});
  const [cardQtys, setCardQtys] = useState<Record<number, number>>({});

  const getCardUnit = (id: number): GlobalUnit => cardUnits[id] || 'PCS';
  const getCardQty = (id: number): number => {
    if (cardQtys[id] !== undefined) return cardQtys[id];
    return getCardUnit(id) === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;
  };

  const toggleCardUnit = (product: MobileProduct, targetUnit: GlobalUnit) => {
    const currentUnit = getCardUnit(product.id);
    if (currentUnit === targetUnit) return;

    const currentQty = getCardQty(product.id);
    const w = product.weightPerPcKg || 0.05;
    let nextQty: number;
    if (targetUnit === 'KGS') {
      nextQty = Math.max(MIN_QTY_KGS, Math.round(currentQty * w * 100) / 100);
    } else {
      const rounded = Math.round(Math.round(currentQty / w) / 10) * 10;
      nextQty = Math.max(MIN_QTY_PCS, rounded);
    }
    setCardUnits((prev) => ({ ...prev, [product.id]: targetUnit }));
    setCardQtys((prev) => ({ ...prev, [product.id]: nextQty }));
  };

  const adjustCardQty = (product: MobileProduct, delta: number) => {
    const unit = getCardUnit(product.id);
    const current = getCardQty(product.id);
    let next: number;

    if (unit === 'KGS') {
      if (delta < 0) {
        if (current <= MIN_QTY_KGS) return;
        const step = current <= 1 ? 0.25 : 0.5;
        next = Math.max(MIN_QTY_KGS, Math.round((current - step) * 100) / 100);
      } else {
        const step = current < 1 ? 0.25 : current < 5 ? 0.5 : 1.0;
        next = Math.round((current + step) * 100) / 100;
      }
    } else if (delta < 0) {
      if (current <= MIN_QTY_PCS) return;
      const step = current > 1000 ? 500 : current > 200 ? 100 : 10;
      next = Math.max(MIN_QTY_PCS, current - step);
    } else {
      const step = current >= 1000 ? 500 : current >= 200 ? 100 : 10;
      next = current + step;
    }
    setCardQtys((prev) => ({ ...prev, [product.id]: next }));
  };

  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [standardsList, setStandardsList] = useState<string[]>(['All']);
  const [gradesList, setGradesList] = useState<string[]>(['All']);
  const [diametersList, setDiametersList] = useState<string[]>(['All']);
  const [finishesList, setFinishesList] = useState<string[]>(['All']);

  const [toastMsg, setToastMsg] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedQuery(searchQuery.trim()), 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCatalogData = async (pageNum = 1, isRefresh = false) => {
    const reqId = ++requestRef.current;
    if (pageNum === 1) {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const res = await mobileApi.products.getPaginated({
        search: debouncedQuery || undefined,
        category: selectedCategory === 'All' ? undefined : selectedCategory,
        standard: selectedStandard === 'All' ? undefined : selectedStandard,
        grade: selectedGrade === 'All' ? undefined : selectedGrade,
        diameter: selectedDiameter === 'All' ? undefined : selectedDiameter,
        finish: selectedFinish === 'All' ? undefined : selectedFinish,
        inStockOnly,
        page: pageNum,
        limit: PAGE_SIZE,
      });

      if (reqId !== requestRef.current) return; // a newer request replaced this one

      const newItems = res.products || [];
      const total = res.total ?? newItems.length;
      setTotalCount(total);
      if (res.relatedProducts) setRelatedProducts(res.relatedProducts);

      if (pageNum === 1) {
        setProducts(newItems);
      } else {
        setProducts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          return [...prev, ...newItems.filter((p) => !ids.has(p.id))];
        });
      }

      setHasMore(pageNum * PAGE_SIZE < total);
      setPage(pageNum);

      if (res.filterOptions?.standards?.length) setStandardsList(['All', ...res.filterOptions.standards]);
      if (res.filterOptions?.grades?.length) setGradesList(['All', ...res.filterOptions.grades]);
      if (res.filterOptions?.diameters?.length) setDiametersList(['All', ...res.filterOptions.diameters]);
      if (res.filterOptions?.finishes?.length) setFinishesList(['All', ...res.filterOptions.finishes]);
    } catch (err) {
      console.warn('[Customer Catalog] Fetch error:', err);
    } finally {
      if (reqId === requestRef.current) {
        setIsLoading(false);
        setIsRefreshing(false);
        setIsLoadingMore(false);
      }
    }
  };

  useEffect(() => {
    fetchCatalogData(1, false);
  }, [debouncedQuery, selectedCategory, selectedStandard, selectedGrade, selectedDiameter, selectedFinish, inStockOnly]);

  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
      setDebouncedQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialStandard !== undefined) setSelectedStandard(initialStandard);
  }, [initialStandard]);

  useEffect(() => {
    if (initialGrade !== undefined) setSelectedGrade(initialGrade);
  }, [initialGrade]);

  const handleRefresh = () => fetchCatalogData(1, true);

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) fetchCatalogData(page + 1, false);
  };

  const toggleFavorite = (productId: number) => {
    setFavorites((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
  };

  const handleQuickAdd = (product: MobileProduct) => {
    const unit = getCardUnit(product.id);
    const qty = getCardQty(product.id);
    onAddToCart(product, unit, qty);
    setRecentlyAddedId(product.id);
    setToastMsg(`Added ${formatQtyDisplay(qty, unit)} · ${product.sku}`);
    setTimeout(() => {
      setRecentlyAddedId(null);
      setToastMsg('');
    }, 2500);
  };

  const resetAll = () => {
    setSearchQuery('');
    setSelectedCategory('All');
    setSelectedStandard('All');
    setSelectedGrade('All');
    setSelectedDiameter('All');
    setSelectedFinish('All');
    setInStockOnly(false);
  };

  const activeFilterCount =
    [selectedStandard, selectedGrade, selectedDiameter, selectedFinish].filter((v) => v !== 'All').length +
    (inStockOnly ? 1 : 0);
  const hasActiveFilters = activeFilterCount > 0 || selectedCategory !== 'All' || !!debouncedQuery;

  // ---- Product card ----
  const renderProductItem = ({ item }: { item: MobileProduct }) => {
    const isFav = favorites.has(item.id);
    const isAdded = recentlyAddedId === item.id;
    const standard = item.standard || item.din || item.isoStandard || 'DIN 933';
    const size = item.sizeFormatted
      ? item.sizeFormatted
      : `${item.diameter || 'M6'}${item.lengthMm ? ' × ' + item.lengthMm + 'mm' : ''}`;

    const unit = getCardUnit(item.id);
    const qty = getCardQty(item.id);
    const minQty = unit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;
    const price = unit === 'PCS' ? item.pricePerPiece : item.pricePerKg;
    const altPrice = unit === 'PCS' ? item.pricePerKg : item.pricePerPiece;
    const altUnit = unit === 'PCS' ? 'kg' : 'pc';

    return (
      <View style={[styles.card, item.isSurplus && styles.cardSurplus]}>
        <TouchableOpacity activeOpacity={0.88} onPress={() => onSelectProduct(item)} style={styles.cardTop}>
          <View style={styles.cardImg}>
            <FastenerProductImage
              imageUrl={item.imageUrl}
              category={item.category || item.subGroup}
              productName={item.name}
              standard={standard}
              drawingUrl={item.drawingUrl}
              height={80}
              containerStyle={styles.cardImgInner}
              showCadBadge={Boolean(item.drawingUrl)}
            />
            {item.isSurplus ? (
              <View style={styles.surplusTag}>
                <Text style={styles.surplusTagText}>-{item.surplusDiscountPct || 35}%</Text>
              </View>
            ) : null}
          </View>

          <View style={styles.cardInfo}>
            <View style={styles.rowBetween}>
              <Text style={styles.cardTitle} numberOfLines={1}>
                {getCleanFastenerTitle(item.name, item.subGroup)}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  toggleFavorite(item.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Text style={[styles.heart, isFav && styles.heartActive]}>{isFav ? '♥' : '♡'}</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.cardSpec} numberOfLines={1}>
              {size} · {standard}
              {item.grade ? ` · Gr ${item.grade}` : ''}
            </Text>

            <View style={styles.stockRow}>
              <View style={[styles.stockDot, { backgroundColor: item.isInStock ? '#16A34A' : '#D97706' }]} />
              <Text style={[styles.stockText, { color: item.isInStock ? '#16A34A' : '#D97706' }]}>
                {item.isInStock ? 'In stock' : 'Pre-order'}
              </Text>
            </View>

            <View style={styles.priceRow}>
              <Text style={styles.price}>
                ₹{price.toFixed(2)}
                <Text style={styles.priceUnit}>/{unit === 'PCS' ? 'pc' : 'kg'}</Text>
              </Text>
              <Text style={styles.altPrice}>₹{altPrice.toFixed(2)}/{altUnit}</Text>
            </View>
          </View>
        </TouchableOpacity>

        {/* Unit, quantity and add */}
        <View style={styles.cardBottom}>
          <View style={styles.unitToggle}>
            {(['PCS', 'KGS'] as GlobalUnit[]).map((u) => {
              const active = unit === u;
              return (
                <TouchableOpacity
                  key={u}
                  onPress={() => toggleCardUnit(item, u)}
                  style={[styles.unitPill, active && styles.unitPillActive]}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.unitPillText, active && styles.unitPillTextActive]}>
                    {u === 'PCS' ? 'Pcs' : 'Kg'}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View style={styles.stepper}>
            <TouchableOpacity
              onPress={() => adjustCardQty(item, -1)}
              disabled={qty <= minQty}
              style={[styles.stepBtn, qty <= minQty && styles.stepBtnDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepBtnText}>−</Text>
            </TouchableOpacity>
            <Text style={styles.stepQty} numberOfLines={1}>
              {formatQtyDisplay(qty, unit)}
            </Text>
            <TouchableOpacity
              onPress={() => adjustCardQty(item, 1)}
              style={styles.stepBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepBtnText}>+</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => handleQuickAdd(item)}
            style={[styles.addBtn, isAdded && styles.addBtnDone]}
          >
            <Text style={styles.addBtnText}>{isAdded ? '✓ Added' : 'Add'}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () =>
    isLoadingMore ? (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color={BLUE} />
        <Text style={styles.footerText}>Loading more…</Text>
      </View>
    ) : (
      <View style={{ height: 24 }} />
    );

  const renderEmpty = () => (
    <View>
      <View style={styles.emptyBox}>
        <View style={styles.emptyCircle}>
          <NavIcon name="search" color="#94A3B8" size={30} />
        </View>
        <Text style={styles.emptyTitle}>No matches</Text>
        <Text style={styles.emptySub}>
          {debouncedQuery ? `Nothing found for "${debouncedQuery}".` : 'Nothing matches these filters.'}
        </Text>
        <TouchableOpacity onPress={resetAll} style={styles.emptyBtn} activeOpacity={0.85}>
          <Text style={styles.emptyBtnText}>Clear filters</Text>
        </TouchableOpacity>
      </View>

      {relatedProducts.length > 0 ? (
        <View style={{ marginTop: 8 }}>
          <Text style={styles.relatedTitle}>You may also need</Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.relatedList}
          >
            {relatedProducts.map(({ product: p, reason }) => {
              const isAdded = recentlyAddedId === p.id;
              const standard = p.standard || p.din || p.isoStandard || 'DIN 933';
              return (
                <TouchableOpacity
                  key={`rel-${p.id}`}
                  activeOpacity={0.9}
                  onPress={() => onSelectProduct(p)}
                  style={styles.relCard}
                >
                  <View style={styles.relImg}>
                    <FastenerProductImage
                      imageUrl={p.imageUrl}
                      category={p.category || p.subGroup}
                      productName={p.name}
                      standard={standard}
                      drawingUrl={p.drawingUrl}
                      height={90}
                      containerStyle={styles.cardImgInner}
                    />
                  </View>
                  <View style={styles.relBody}>
                    <Text style={styles.relReason} numberOfLines={1}>{reason}</Text>
                    <Text style={styles.relTitle} numberOfLines={1}>
                      {getCleanFastenerTitle(p.name, p.subGroup)}
                    </Text>
                    <Text style={styles.relSpec} numberOfLines={1}>
                      {p.sizeFormatted || p.diameter || ''} · {standard}
                    </Text>
                    <View style={styles.rowBetween}>
                      <Text style={styles.relPrice}>₹{p.pricePerPiece}/pc</Text>
                      <TouchableOpacity
                        onPress={() => handleQuickAdd(p)}
                        style={[styles.relAdd, isAdded && styles.addBtnDone]}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.addBtnText}>{isAdded ? '✓' : 'Add'}</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      ) : null}
    </View>
  );

  return (
    <View style={styles.screen}>
      {/* Header + search */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={onNavigateHome} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.headerBack}>←</Text>
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Catalog</Text>
          <TouchableOpacity onPress={onNavigateToCart} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <NavIcon name="cart" color="#FFFFFF" size={22} />
            {cartCount > 0 ? (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>{cartCount}</Text>
              </View>
            ) : null}
          </TouchableOpacity>
        </View>

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
          />
          {searchQuery ? (
            <TouchableOpacity onPress={() => setSearchQuery('')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.searchClear}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* Categories + filter */}
      <View style={styles.categoriesRow}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.pills}>
          {CATEGORIES.map((c) => {
            const active = selectedCategory === c.id;
            return (
              <TouchableOpacity
                key={c.id}
                onPress={() => setSelectedCategory(c.id)}
                style={[styles.pill, active && styles.pillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.pillText, active && styles.pillTextActive]}>{c.label}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <TouchableOpacity onPress={() => setIsFilterOpen(true)} style={styles.filterBtn} activeOpacity={0.8}>
          <Text style={styles.filterText}>Filter</Text>
          {activeFilterCount > 0 ? (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>{activeFilterCount}</Text>
            </View>
          ) : null}
        </TouchableOpacity>
      </View>

      {hasActiveFilters ? (
        <View style={styles.metaRow}>
          <Text style={styles.metaText}>
            {products.length} of {totalCount} items
          </Text>
          <TouchableOpacity onPress={resetAll} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.metaLink}>Clear all</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* List */}
      {isLoading ? (
        <View style={styles.loadingBox}>
          <ActivityIndicator size="large" color={BLUE} />
          <Text style={styles.loadingText}>Loading products…</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderProductItem}
          ListFooterComponent={renderFooter}
          ListEmptyComponent={renderEmpty}
          refreshControl={
            <RefreshControl refreshing={isRefreshing} onRefresh={handleRefresh} colors={[BLUE, '#EA580C']} />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Filter sheet */}
      <Modal visible={isFilterOpen} animationType="slide" transparent onRequestClose={() => setIsFilterOpen(false)}>
        <View style={styles.backdrop}>
          <View style={styles.sheet}>
            <View style={styles.sheetHandle} />
            <View style={styles.rowBetween}>
              <Text style={styles.sheetTitle}>Filters</Text>
              <TouchableOpacity
                onPress={() => {
                  setSelectedStandard('All');
                  setSelectedGrade('All');
                  setSelectedDiameter('All');
                  setSelectedFinish('All');
                  setInStockOnly(false);
                }}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={styles.metaLink}>Reset</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 440 }} showsVerticalScrollIndicator={false}>
              <TouchableOpacity
                onPress={() => setInStockOnly(!inStockOnly)}
                style={styles.stockToggle}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, inStockOnly && styles.checkboxActive]}>
                  {inStockOnly ? <Text style={styles.checkmark}>✓</Text> : null}
                </View>
                <Text style={styles.stockToggleText}>In stock only</Text>
              </TouchableOpacity>

              <ChipGroup label="Standard" options={standardsList.slice(0, 10)} value={selectedStandard} onChange={setSelectedStandard} />
              <ChipGroup label="Grade" options={gradesList.slice(0, 8)} value={selectedGrade} onChange={setSelectedGrade} />
              {diametersList.length > 1 ? (
                <ChipGroup label="Diameter" options={diametersList.slice(0, 10)} value={selectedDiameter} onChange={setSelectedDiameter} />
              ) : null}
              {finishesList.length > 1 ? (
                <ChipGroup label="Finish" options={finishesList.slice(0, 8)} value={selectedFinish} onChange={setSelectedFinish} />
              ) : null}
            </ScrollView>

            <TouchableOpacity onPress={() => setIsFilterOpen(false)} style={styles.applyBtn} activeOpacity={0.88}>
              <Text style={styles.applyBtnText}>Show {totalCount} items</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Toast */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
          {onNavigateToCart ? (
            <TouchableOpacity onPress={onNavigateToCart} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Text style={styles.toastLink}>Cart</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FA' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  listContent: { paddingTop: 6, paddingBottom: 28 },

  // Header
  header: {
    backgroundColor: BLUE,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 14,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    gap: 10,
  },
  headerTop: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  headerBtn: { width: 40, height: 36, justifyContent: 'center' },
  headerBack: { fontSize: 24, color: '#FFFFFF', fontWeight: '700' },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  cartBadge: {
    position: 'absolute',
    top: 0,
    right: 0,
    backgroundColor: ORANGE,
    minWidth: 17,
    height: 17,
    borderRadius: 9,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 44,
    gap: 8,
  },
  searchInput: { flex: 1, fontSize: 14, color: INK, paddingVertical: 0 },
  searchClear: { fontSize: 14, color: '#94A3B8', padding: 4 },

  // Categories
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingLeft: 16,
    paddingRight: 12,
    paddingVertical: 10,
    gap: 8,
  },
  pills: { gap: 8, paddingRight: 8 },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: LINE,
  },
  pillActive: { backgroundColor: INK, borderColor: INK },
  pillText: { fontSize: 13, fontWeight: '700', color: '#475569' },
  pillTextActive: { color: '#FFFFFF' },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: BLUE,
    borderRadius: 20,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  filterText: { fontSize: 13, fontWeight: '800', color: BLUE },
  filterBadge: {
    backgroundColor: ORANGE,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  filterBadgeText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },

  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingBottom: 4,
  },
  metaText: { fontSize: 12, color: MUTED, fontWeight: '600' },
  metaLink: { fontSize: 13, color: BLUE, fontWeight: '800' },

  // Product card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
  },
  cardSurplus: { borderColor: '#F59E0B', borderWidth: 1.5 },
  cardTop: { flexDirection: 'row', gap: 12 },
  cardImg: {
    width: 88,
    height: 88,
    borderRadius: 14,
    backgroundColor: '#EEF4FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardImgInner: { width: '100%', height: '100%', backgroundColor: 'transparent', borderWidth: 0 },
  surplusTag: {
    position: 'absolute',
    top: 5,
    left: 5,
    backgroundColor: '#DC2626',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  surplusTagText: { color: '#FFFFFF', fontSize: 10, fontWeight: '900' },
  cardInfo: { flex: 1, gap: 3 },
  cardTitle: { flex: 1, fontSize: 16, fontWeight: '800', color: INK, marginRight: 8 },
  heart: { fontSize: 20, color: '#94A3B8' },
  heartActive: { color: '#EF4444' },
  cardSpec: { fontSize: 12, color: MUTED, fontWeight: '600' },
  stockRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  stockDot: { width: 7, height: 7, borderRadius: 4 },
  stockText: { fontSize: 12, fontWeight: '700' },
  priceRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8, marginTop: 2 },
  price: { fontSize: 20, fontWeight: '900', color: BLUE },
  priceUnit: { fontSize: 12, fontWeight: '700', color: MUTED },
  altPrice: { fontSize: 11, color: '#94A3B8', fontWeight: '600' },

  cardBottom: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  unitToggle: { flexDirection: 'row', backgroundColor: '#F1F5F9', borderRadius: 10, padding: 2 },
  unitPill: { paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  unitPillActive: { backgroundColor: BLUE },
  unitPillText: { fontSize: 12, fontWeight: '700', color: MUTED },
  unitPillTextActive: { color: '#FFFFFF' },
  stepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: LINE,
    paddingHorizontal: 4,
    height: 38,
  },
  stepBtn: { width: 30, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepBtnDisabled: { opacity: 0.35 },
  stepBtnText: { fontSize: 20, fontWeight: '800', color: BLUE },
  stepQty: { fontSize: 12, fontWeight: '800', color: INK, flexShrink: 1, textAlign: 'center' },
  addBtn: {
    backgroundColor: ORANGE,
    height: 38,
    paddingHorizontal: 18,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnDone: { backgroundColor: '#16A34A' },
  addBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // Footer / loading
  footerLoader: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, paddingVertical: 16 },
  footerText: { fontSize: 12, color: MUTED, fontWeight: '600' },
  loadingBox: { padding: 60, alignItems: 'center', gap: 12 },
  loadingText: { fontSize: 13, color: MUTED, fontWeight: '600' },

  // Empty
  emptyBox: { paddingVertical: 32, paddingHorizontal: 24, alignItems: 'center', gap: 6 },
  emptyCircle: {
    width: 76,
    height: 76,
    borderRadius: 38,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: INK },
  emptySub: { fontSize: 13, color: MUTED, textAlign: 'center' },
  emptyBtn: { marginTop: 10, backgroundColor: BLUE, paddingHorizontal: 22, paddingVertical: 11, borderRadius: 14 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // Related
  relatedTitle: { fontSize: 16, fontWeight: '800', color: INK, paddingHorizontal: 16, marginBottom: 10 },
  relatedList: { gap: 10, paddingHorizontal: 14 },
  relCard: {
    width: 170,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: LINE,
    overflow: 'hidden',
  },
  relImg: { height: 90, backgroundColor: '#EEF4FF', alignItems: 'center', justifyContent: 'center' },
  relBody: { padding: 10, gap: 2 },
  relReason: { fontSize: 11, fontWeight: '700', color: BLUE },
  relTitle: { fontSize: 14, fontWeight: '800', color: INK },
  relSpec: { fontSize: 11, color: MUTED },
  relPrice: { fontSize: 14, fontWeight: '900', color: BLUE },
  relAdd: {
    backgroundColor: ORANGE,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 6,
  },

  // Filter sheet
  backdrop: { flex: 1, backgroundColor: 'rgba(15,23,42,0.55)', justifyContent: 'flex-end' },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingTop: 10,
    gap: 12,
  },
  sheetHandle: { alignSelf: 'center', width: 40, height: 4, borderRadius: 2, backgroundColor: '#CBD5E1', marginBottom: 6 },
  sheetTitle: { fontSize: 18, fontWeight: '800', color: INK },
  sheetLabel: { fontSize: 13, fontWeight: '800', color: INK, marginTop: 14, marginBottom: 8 },
  chipWrap: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: LINE,
  },
  chipActive: { backgroundColor: BLUE, borderColor: BLUE },
  chipText: { fontSize: 13, color: '#475569', fontWeight: '600' },
  chipTextActive: { color: '#FFFFFF', fontWeight: '700' },
  stockToggle: { flexDirection: 'row', alignItems: 'center', gap: 12, paddingVertical: 8 },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: { backgroundColor: BLUE, borderColor: BLUE },
  checkmark: { color: '#FFFFFF', fontSize: 14, fontWeight: '900' },
  stockToggleText: { fontSize: 15, color: INK, fontWeight: '700' },
  applyBtn: { backgroundColor: BLUE, height: 52, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 4 },
  applyBtnText: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },

  // Toast
  toast: {
    position: 'absolute',
    bottom: 24,
    left: 16,
    right: 16,
    backgroundColor: INK,
    borderRadius: 16,
    paddingVertical: 14,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 999,
  },
  toastText: { color: '#FFFFFF', fontSize: 13, fontWeight: '700', flex: 1 },
  toastLink: { color: '#FDBA74', fontSize: 13, fontWeight: '800', marginLeft: 12 },
});

export default CustomerCatalogScreen;