import React, { useState, useEffect, useCallback, useRef } from 'react';
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
import {
  mobileApi,
  MIN_QTY_PCS,
  MIN_QTY_KGS,
  clampQty,
  formatQtyDisplay,
  formatINR,
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

  // Strip anything starting from '-(Din', '-(ISO', '(DIN', '(Din', 'DIN', 'ISO', 'Grade', 'Property Class', etc.
  let clean = name.split(/\s*[-–(]?\s*(?:DIN|Din|ISO|Standard|Grade|Class|Property|\()/i)[0].trim();
  clean = clean.replace(/[-–_]+$/, '').trim();

  // If clean string is too generic, short, or long
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

  // Normalize common catalog names for clean typography matching mockup
  if (/^hex\s+screws?$/i.test(clean)) return 'Hex Bolt';
  if (/^hexagon\s+full\s+nuts?$/i.test(clean)) return 'Hex Nut';
  if (/^hexagon\s+nuts?$/i.test(clean)) return 'Hex Nut';
  if (/^flat\s+washers?$/i.test(clean)) return 'Flat Washer';
  if (/^countersunk\s+screws?$/i.test(clean)) return 'CSK Screw';
  if (/^socket\s+head\s+cap\s+screws?$/i.test(clean)) return 'Socket Cap';

  return clean;
}

function getFastenerFeature(item: MobileProduct): string {
  if (item.grade) {
    const gr = item.grade.toLowerCase();
    if (gr.includes('8.8') || gr.includes('10.9') || gr.includes('12.9')) {
      return 'High Strength';
    }
    if (gr.includes('304') || gr.includes('316') || gr.includes('a2') || gr.includes('a4')) {
      return 'Corrosion Resistant';
    }
    if (gr.includes('5.8') || gr.includes('4.6')) {
      return 'Durable Quality';
    }
    if (gr.includes('class 8') || gr.includes('class 10')) {
      return 'High Tensile';
    }
  }
  if (item.finish) {
    const fn = item.finish.toLowerCase();
    if (fn.includes('zinc') || fn.includes('passivated') || fn.includes('bp') || fn.includes('bzp')) {
      return 'Precision Finish';
    }
    if (fn.includes('galv') || fn.includes('hdg')) {
      return 'Corrosion Resistant';
    }
  }
  return 'High Strength';
}

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
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [isLoadingMore, setIsLoadingMore] = useState<boolean>(false);
  const [hasMore, setHasMore] = useState<boolean>(true);
  const [page, setPage] = useState<number>(1);
  const PAGE_SIZE = 12;

  // Search state with debouncing (never loses focus!)
  const [searchQuery, setSearchQuery] = useState(initialSearch || '');
  const [debouncedQuery, setDebouncedQuery] = useState(initialSearch || '');

  // All standard industrial fastener categories
  const DEFAULT_CATEGORIES: Array<{ id: string; label: string }> = [
    { id: 'All', label: 'All Products' },
    { id: 'BOLTS', label: 'Bolts' },
    { id: 'NUTS', label: 'Nuts' },
    { id: 'SCREWS', label: 'Screws' },
    { id: 'WASHERS', label: 'Washers' },
    { id: 'STUDS', label: 'Studs' },
    { id: 'ANCHORS', label: 'Anchors' },
  ];

  // Dynamic filter states: All categories available with initial first view focus
  const [categoriesList, setCategoriesList] = useState<Array<{ id: string; label: string }>>(DEFAULT_CATEGORIES);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedStandard, setSelectedStandard] = useState<string>(initialStandard || 'All');
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || 'All');
  const [selectedDiameter, setSelectedDiameter] = useState<string>('All');
  const [selectedFinish, setSelectedFinish] = useState<string>('All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Related products from paginated API
  const [relatedProducts, setRelatedProducts] = useState<Array<{ product: MobileProduct; reason: string; tone: string }>>([]);

  // Card-specific Procurement Unit (PCS vs KGS) & Quantity Overrides
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
    let nextQty: number;
    if (targetUnit === 'KGS') {
      const approxKg = Math.round((currentQty * (product.weightPerPcKg || 0.05)) * 100) / 100;
      nextQty = Math.max(MIN_QTY_KGS, approxKg);
    } else {
      const approxPcs = Math.round(currentQty / (product.weightPerPcKg || 0.05));
      const rounded = Math.round(approxPcs / 10) * 10;
      nextQty = Math.max(MIN_QTY_PCS, rounded);
    }

    setCardUnits((prev) => ({ ...prev, [product.id]: targetUnit }));
    setCardQtys((prev) => ({ ...prev, [product.id]: nextQty }));
  };

  const adjustCardQty = (product: MobileProduct, delta: number) => {
    const unit = getCardUnit(product.id);
    const current = getCardQty(product.id);

    if (unit === 'KGS') {
      if (delta < 0) {
        if (current <= MIN_QTY_KGS) return;
        const step = current <= 1 ? 0.25 : 0.5;
        const next = Math.max(MIN_QTY_KGS, Math.round((current - step) * 100) / 100);
        setCardQtys((prev) => ({ ...prev, [product.id]: next }));
      } else {
        const step = current < 1 ? 0.25 : current < 5 ? 0.5 : 1.0;
        const next = Math.round((current + step) * 100) / 100;
        setCardQtys((prev) => ({ ...prev, [product.id]: next }));
      }
    } else {
      if (delta < 0) {
        if (current <= MIN_QTY_PCS) return;
        const step = current > 1000 ? 500 : current > 200 ? 100 : 10;
        const next = Math.max(MIN_QTY_PCS, current - step);
        setCardQtys((prev) => ({ ...prev, [product.id]: next }));
      } else {
        const step = current >= 1000 ? 500 : current >= 200 ? 100 : 10;
        setCardQtys((prev) => ({ ...prev, [product.id]: current + step }));
      }
    }
  };

  // Favorites & Added states
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  // Filter drawer modal
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [standardsList, setStandardsList] = useState<string[]>(['All']);
  const [gradesList, setGradesList] = useState<string[]>(['All']);
  const [diametersList, setDiametersList] = useState<string[]>(['All']);
  const [finishesList, setFinishesList] = useState<string[]>(['All']);

  // Floating Toast
  const [toastMsg, setToastMsg] = useState('');

  // Debounce search query by 300ms to avoid firing on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedQuery(searchQuery.trim());
    }, 300);
    return () => clearTimeout(handler);
  }, [searchQuery]);

  const fetchCatalogData = async (pageNum = 1, isRefresh = false) => {
    if (pageNum === 1) {
      if (isRefresh) setIsRefreshing(true);
      else setIsLoading(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      // Use high-performance paginated API (synced with website 56c2f25)
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

      const newItems = res.products || [];
      const total = res.total ?? newItems.length;
      setTotalCount(total);
      if (res.relatedProducts) {
        setRelatedProducts(res.relatedProducts);
      }

      if (pageNum === 1) {
        setProducts(newItems);
      } else {
        setProducts((prev) => {
          const ids = new Set(prev.map((p) => p.id));
          const unique = newItems.filter((p) => !ids.has(p.id));
          return [...prev, ...unique];
        });
      }

      setHasMore(pageNum * PAGE_SIZE < total);
      setPage(pageNum);

      // Populate filter options dynamically
      if (res.filterOptions?.standards && res.filterOptions.standards.length > 0) {
        setStandardsList(['All', ...res.filterOptions.standards]);
      }
      if (res.filterOptions?.grades && res.filterOptions.grades.length > 0) {
        setGradesList(['All', ...res.filterOptions.grades]);
      }
      if (res.filterOptions?.diameters && res.filterOptions.diameters.length > 0) {
        setDiametersList(['All', ...res.filterOptions.diameters]);
      }
      if (res.filterOptions?.finishes && res.filterOptions.finishes.length > 0) {
        setFinishesList(['All', ...res.filterOptions.finishes]);
      }
    } catch (err) {
      console.warn('[Customer Catalog] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  };

  // Re-fetch when debounced search or filter criteria change
  useEffect(() => {
    fetchCatalogData(1, false);
  }, [debouncedQuery, selectedCategory, selectedStandard, selectedGrade, selectedDiameter, selectedFinish, inStockOnly]);

  // Synchronize incoming navigation parameters
  useEffect(() => {
    if (initialSearch !== undefined) {
      setSearchQuery(initialSearch);
      setDebouncedQuery(initialSearch);
    }
  }, [initialSearch]);

  useEffect(() => {
    if (initialStandard !== undefined) {
      setSelectedStandard(initialStandard);
    }
  }, [initialStandard]);

  useEffect(() => {
    if (initialGrade !== undefined) {
      setSelectedGrade(initialGrade);
    }
  }, [initialGrade]);

  const handleRefresh = () => {
    fetchCatalogData(1, true);
  };

  const handleLoadMore = () => {
    if (!isLoading && !isLoadingMore && hasMore) {
      fetchCatalogData(page + 1, false);
    }
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
    setToastMsg(`Added ${formatQtyDisplay(qty, unit)} of ${product.sku} to cart`);
    setTimeout(() => {
      setRecentlyAddedId(null);
      setToastMsg('');
    }, 2500);
  };

  // 100% Dynamic Card Rendering with Dual Unit (PCS / KGS) Stepper (Synced with Website FastenerCard)
  const renderProductItem = ({ item }: { item: MobileProduct }) => {
    const isFav = favorites.has(item.id);
    const isAdded = recentlyAddedId === item.id;
    const cleanTitle = getCleanFastenerTitle(item.name, item.subGroup);
    const standardDisplay = item.standard || item.din || item.isoStandard || 'DIN 933';
    const cleanDin = standardDisplay.replace(/^DIN\s*/i, 'DIN: ');
    const sizeDisplay = item.sizeFormatted
      ? item.sizeFormatted
      : `${item.diameter || 'M6'} – ${item.lengthMm ? item.lengthMm + 'mm' : 'M20'}`;
    const featureText = getFastenerFeature(item);

    const currentUnit = getCardUnit(item.id);
    const currentQty = getCardQty(item.id);
    const currentPrice = currentUnit === 'PCS' ? item.pricePerPiece : item.pricePerKg;
    const altPrice = currentUnit === 'PCS' ? item.pricePerKg : item.pricePerPiece;
    const altUnit = currentUnit === 'PCS' ? 'kg' : 'pc';
    const pcsPerBox = Math.round(Number(item.pcsPerBox)) || 500;
    const leadDays = item.leadTimeDays || 10;
    const minQty = currentUnit === 'KGS' ? MIN_QTY_KGS : MIN_QTY_PCS;

    return (
      <View style={[styles.card, item.isSurplus ? styles.surplusCardBorder : null]}>
        {/* Top Header Row: Image + Details (Tappable to View Details) */}
        <TouchableOpacity
          activeOpacity={0.88}
          onPress={() => onSelectProduct(item)}
          style={styles.cardHeaderRow}
        >
          {/* Left Thumbnail Box */}
          <View style={styles.cardImgBox}>
            <FastenerProductImage
              imageUrl={item.imageUrl}
              category={item.category || item.subGroup}
              productName={item.name}
              standard={standardDisplay}
              drawingUrl={item.drawingUrl}
              height={84}
              containerStyle={styles.fastenerImageStyle}
              showCadBadge={Boolean(item.drawingUrl)}
            />
            {item.isSurplus ? (
              <View style={styles.surplusBadge}>
                <Text style={styles.surplusBadgeText}>🔥 -{item.surplusDiscountPct || 35}%</Text>
              </View>
            ) : null}
          </View>

          {/* Right Product Summary */}
          <View style={styles.cardMainInfo}>
            <View style={styles.cardTopRow}>
              <Text style={styles.productTitle} numberOfLines={1}>
                {cleanTitle}
              </Text>
              <TouchableOpacity
                onPress={(e) => {
                  e.stopPropagation?.();
                  toggleFavorite(item.id);
                }}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                style={styles.heartBtn}
              >
                <Text style={[styles.heartIcon, isFav && styles.heartIconActive]}>
                  {isFav ? '♥' : '♡'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* Spec: Size & DIN Standard */}
            <View style={styles.specLineRow}>
              <Text style={styles.specText}>
                Size: <Text style={styles.specValueText}>{sizeDisplay}</Text>
                <Text style={styles.specDivider}>  |  </Text>
                <Text style={styles.specValueText}>{cleanDin.startsWith('DIN') ? cleanDin : `DIN: ${cleanDin}`}</Text>
              </Text>
            </View>

            {/* Feature & Stock Status */}
            <View style={styles.featureStockRow}>
              <View style={styles.featureItem}>
                <Text style={styles.featureCheck}>✔</Text>
                <Text style={styles.featureText}>{featureText}</Text>
              </View>
              <Text style={styles.specDivider}>  |  </Text>
              <View style={styles.stockItem}>
                <Text style={styles.stockBoxIcon}>📦</Text>
                <Text
                  style={[
                    styles.stockText,
                    item.isInStock ? styles.stockTextIn : styles.stockTextPre,
                  ]}
                >
                  {item.isInStock ? 'In Stock' : 'Pre-Order'}
                </Text>
              </View>
            </View>
          </View>
        </TouchableOpacity>

        {/* 3-Column Micro Strip (Box size, Dispatch lead days, MOQ) */}
        <View style={styles.microStrip}>
          <View style={styles.microCol}>
            <Text style={styles.microColText}>📦 Box: <Text style={styles.microBold}>{pcsPerBox.toLocaleString()} pcs</Text></Text>
          </View>
          <View style={styles.microCol}>
            <Text style={styles.microColText}>⚡ Lead: <Text style={styles.microBold}>{leadDays}d</Text></Text>
          </View>
          <View style={styles.microCol}>
            <Text style={styles.microColText}>🎯 MOQ: <Text style={styles.microBold}>100 Pcs / 250g</Text></Text>
          </View>
        </View>

        {/* Price & Alt Equivalent Strip */}
        <View style={styles.priceStripRow}>
          <View style={styles.priceContainer}>
            <Text style={styles.rateLabel}>
              {currentUnit === 'PCS' ? 'Rate / Pc:' : 'Rate / Kg:'}
            </Text>
            <Text style={styles.priceSymbol}>₹</Text>
            <Text style={styles.priceAmount}>{currentPrice.toFixed(2)}</Text>
          </View>
          <View style={styles.altPriceContainer}>
            <Text style={styles.altPriceText}>
              Alt: <Text style={styles.altPriceBold}>₹{altPrice.toFixed(2)}</Text>/{altUnit}
            </Text>
          </View>
        </View>

        {/* Procurement Configurator: Unit Switcher + Stepper + Add Button */}
        <View style={styles.procurementRow}>
          {/* Unit Toggle Pills */}
          <View style={styles.unitToggleBox}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                toggleCardUnit(item, 'PCS');
              }}
              style={[
                styles.unitPill,
                currentUnit === 'PCS' ? styles.unitPillActive : null,
              ]}
            >
              <Text style={[styles.unitPillText, currentUnit === 'PCS' ? styles.unitPillTextActive : null]}>
                Pcs
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                toggleCardUnit(item, 'KGS');
              }}
              style={[
                styles.unitPill,
                currentUnit === 'KGS' ? styles.unitPillActive : null,
              ]}
            >
              <Text style={[styles.unitPillText, currentUnit === 'KGS' ? styles.unitPillTextActive : null]}>
                Kgs
              </Text>
            </TouchableOpacity>
          </View>

          {/* Stepper (- / +) */}
          <View style={styles.cardStepper}>
            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                adjustCardQty(item, -1);
              }}
              disabled={currentQty <= minQty}
              style={[styles.stepperArrowBtn, currentQty <= minQty && styles.stepperArrowDisabled]}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={[styles.stepperArrowText, currentQty <= minQty && styles.stepperArrowTextDisabled]}>−</Text>
            </TouchableOpacity>

            <View style={styles.stepperDisplay}>
              <Text style={styles.stepperQtyText} numberOfLines={1}>
                {formatQtyDisplay(currentQty, currentUnit)}
              </Text>
              <Text style={styles.stepperMinLabel}>
                {currentUnit === 'KGS' ? 'Min 250g' : 'Min 100'}
              </Text>
            </View>

            <TouchableOpacity
              onPress={(e) => {
                e.stopPropagation?.();
                adjustCardQty(item, 1);
              }}
              style={styles.stepperArrowBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.stepperArrowText}>+</Text>
            </TouchableOpacity>
          </View>

          {/* Add to Cart Button */}
          <TouchableOpacity
            activeOpacity={0.82}
            onPress={(e) => {
              e.stopPropagation?.();
              handleQuickAdd(item);
            }}
            style={[styles.quickAddBtn, isAdded ? styles.quickAddBtnSuccess : null]}
          >
            <Text style={[styles.quickAddBtnText, isAdded ? styles.quickAddBtnTextSuccess : null]}>
              {isAdded ? '✓ Added' : '+ Add'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!isLoadingMore) return <View style={{ height: 24 }} />;
    return (
      <View style={styles.footerLoader}>
        <ActivityIndicator size="small" color="#0047AB" />
        <Text style={styles.footerLoaderText}>Loading more fasteners from depot...</Text>
      </View>
    );
  };

  return (
    <View style={styles.screen}>
      {/* ===================================================================== */}
      {/* 1. TOP BRAND HEADER BAR (Fixed at top with dynamic RFQ count)         */}
      {/* ===================================================================== */}
      <View style={styles.topBlueHeader}>
        <TouchableOpacity
          onPress={onNavigateHome}
          style={styles.headerMenuBtn}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerMenuIcon}>←</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNavigateHome}
          style={styles.brandRow}
          activeOpacity={0.85}
        >
          {/* <View style={styles.logoHex}>
            <Text style={styles.logoHexText}>⬡</Text>
          </View> */}
          <Text style={styles.brandTitle}>CBH Fasteners</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={onNavigateToCart}
          style={styles.rfqIconBtn}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.rfqIcon}>🛒</Text>
          <View style={styles.rfqBadge}>
            <Text style={styles.rfqBadgeText}>{cartCount}</Text>
          </View>
        </TouchableOpacity>
      </View>

      {/* ===================================================================== */}
      {/* 2. WHITE ROUNDED SEARCH BAR (Fixed at top - typing NEVER loses focus) */}
      {/* ===================================================================== */}
      <View style={styles.searchBarWrapper}>
        <View style={styles.searchBar}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search products..."
            placeholderTextColor="#94A3B8"
            value={searchQuery}
            onChangeText={setSearchQuery}
            autoCorrect={false}
            returnKeyType="search"
          />
          {searchQuery ? (
            <TouchableOpacity
              onPress={() => setSearchQuery('')}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Text style={styles.clearSearchIcon}>✕</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      {/* ===================================================================== */}
      {/* 3. DYNAMIC CATEGORY PILLS BAR (All Categories with smooth scroll)     */}
      {/* ===================================================================== */}
      <View style={styles.categoriesRow}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryPillsScroll}
        >
          {categoriesList.map((item) => {
            const isSelected = selectedCategory === item.id;
            return (
              <View key={item.id} style={styles.pillWrapper}>
                <TouchableOpacity
                  onPress={() => setSelectedCategory(item.id)}
                  style={[
                    styles.categoryPill,
                    isSelected ? styles.categoryPillActive : styles.categoryPillInactive,
                  ]}
                  activeOpacity={0.8}
                >
                  <Text
                    style={[
                      styles.categoryPillText,
                      isSelected ? styles.categoryPillTextActive : null,
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
                {isSelected ? <View style={styles.activeOrangeUnderline} /> : null}
              </View>
            );
          })}
        </ScrollView>

        <TouchableOpacity
          onPress={() => setIsFilterOpen(true)}
          style={styles.filterBtn}
          activeOpacity={0.8}
        >
          <Text style={styles.filterBtnIcon}>⧩</Text>
          <Text style={styles.filterBtnText}>Filter</Text>
        </TouchableOpacity>
      </View>

      {/* Results Count Meta Row (shown when filters/search are active) */}
      {(selectedStandard !== 'All' || selectedGrade !== 'All' || selectedCategory !== 'All' || inStockOnly || debouncedQuery) ? (
        <View style={styles.resultsMetaRow}>
          <Text style={styles.resultsCountText}>
            Showing {products.length} of {totalCount} fasteners
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSelectedCategory('All');
              setSelectedStandard('All');
              setSelectedGrade('All');
              setInStockOnly(false);
              setSearchQuery('');
            }}
          >
            <Text style={styles.resetFiltersLink}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ===================================================================== */}
      {/* 4. INFINITE SCROLL PRODUCTS LIST (FlatList with onEndReached)         */}
      {/* ===================================================================== */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0047AB" />
          <Text style={styles.loadingText}>Connecting to warehouse depot...</Text>
        </View>
      ) : (
        <FlatList
          data={products}
          keyExtractor={(item, index) => `${item.id}-${index}`}
          renderItem={renderProductItem}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={['#0047AB', '#EA580C']}
            />
          }
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.4}
          contentContainerStyle={styles.listContent}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyIcon}>🔍</Text>
              <Text style={styles.emptyTitle}>No Direct Matches Found</Text>
              <Text style={styles.emptySubtitle}>
                No products match "{debouncedQuery}" under {selectedCategory}.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStandard('All');
                  setSelectedGrade('All');
                  setSelectedDiameter('All');
                  setSelectedFinish('All');
                  setInStockOnly(false);
                }}
                style={styles.emptyResetBtn}
              >
                <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>

              {/* Related Fasteners Section */}
              {relatedProducts.length > 0 && (
                <View style={styles.relatedSection}>
                  <View style={styles.relatedHeader}>
                    <Text style={styles.relatedSectionTitle}>🔗 Compatible & Related Fasteners</Text>
                    <Text style={styles.relatedSectionSub}>Matching diameter, DIN standard, or mating nuts/washers</Text>
                  </View>
                  {relatedProducts.map(({ product: p, reason }) => (
                    <View key={`rel-${p.id}`} style={{ marginBottom: 8 }}>
                      <View style={styles.relatedBadgePill}>
                        <Text style={styles.relatedBadgeText}>{reason}</Text>
                      </View>
                      {renderProductItem({ item: p })}
                    </View>
                  ))}
                </View>
              )}
            </View>
          }
        />
      )}

      {/* ===================================================================== */}
      {/* 5. FILTER BOTTOM SHEET MODAL                                          */}
      {/* ===================================================================== */}
      <Modal
        visible={isFilterOpen}
        animationType="slide"
        transparent
        onRequestClose={() => setIsFilterOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalSheet}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Fastener Catalog</Text>
              <TouchableOpacity onPress={() => setIsFilterOpen(false)}>
                <Text style={styles.modalCloseIcon}>✕</Text>
              </TouchableOpacity>
            </View>

            <ScrollView style={{ maxHeight: 420 }} showsVerticalScrollIndicator={false}>
              {/* Category Chips */}
              <Text style={styles.modalSectionLabel}>CATEGORY</Text>
              <View style={styles.modalChipsWrap}>
                {categoriesList.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() => setSelectedCategory(cat.id)}
                    style={[
                      styles.modalChip,
                      selectedCategory === cat.id ? styles.modalChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedCategory === cat.id ? styles.modalChipTextActive : null,
                      ]}
                    >
                      {cat.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Standards Chips */}
              <Text style={styles.modalSectionLabel}>STANDARD (DIN / ISO)</Text>
              <View style={styles.modalChipsWrap}>
                {standardsList.slice(0, 10).map((std) => (
                  <TouchableOpacity
                    key={std}
                    onPress={() => setSelectedStandard(std)}
                    style={[
                      styles.modalChip,
                      selectedStandard === std ? styles.modalChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedStandard === std ? styles.modalChipTextActive : null,
                      ]}
                    >
                      {std}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Grade Chips */}
              <Text style={styles.modalSectionLabel}>PROPERTY CLASS / GRADE</Text>
              <View style={styles.modalChipsWrap}>
                {gradesList.slice(0, 8).map((gr) => (
                  <TouchableOpacity
                    key={gr}
                    onPress={() => setSelectedGrade(gr)}
                    style={[
                      styles.modalChip,
                      selectedGrade === gr ? styles.modalChipActive : null,
                    ]}
                  >
                    <Text
                      style={[
                        styles.modalChipText,
                        selectedGrade === gr ? styles.modalChipTextActive : null,
                      ]}
                    >
                      {gr}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Diameter Chips */}
              {diametersList.length > 1 && (
                <>
                  <Text style={styles.modalSectionLabel}>DIAMETER (METRIC)</Text>
                  <View style={styles.modalChipsWrap}>
                    {diametersList.slice(0, 10).map((dia) => (
                      <TouchableOpacity
                        key={dia}
                        onPress={() => setSelectedDiameter(dia)}
                        style={[
                          styles.modalChip,
                          selectedDiameter === dia ? styles.modalChipActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalChipText,
                            selectedDiameter === dia ? styles.modalChipTextActive : null,
                          ]}
                        >
                          {dia}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* Finish Chips */}
              {finishesList.length > 1 && (
                <>
                  <Text style={styles.modalSectionLabel}>FINISH / COATING</Text>
                  <View style={styles.modalChipsWrap}>
                    {finishesList.slice(0, 8).map((fn) => (
                      <TouchableOpacity
                        key={fn}
                        onPress={() => setSelectedFinish(fn)}
                        style={[
                          styles.modalChip,
                          selectedFinish === fn ? styles.modalChipActive : null,
                        ]}
                      >
                        <Text
                          style={[
                            styles.modalChipText,
                            selectedFinish === fn ? styles.modalChipTextActive : null,
                          ]}
                        >
                          {fn}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </>
              )}

              {/* In stock toggle */}
              <TouchableOpacity
                onPress={() => setInStockOnly(!inStockOnly)}
                style={styles.inStockToggleRow}
              >
                <View style={[styles.checkbox, inStockOnly && styles.checkboxActive]}>
                  {inStockOnly && <Text style={styles.checkboxCheck}>✓</Text>}
                </View>
                <Text style={styles.inStockToggleLabel}>In Stock Only (Factory Ready)</Text>
              </TouchableOpacity>
            </ScrollView>

            <TouchableOpacity
              onPress={() => setIsFilterOpen(false)}
              style={styles.applyFilterBtn}
            >
              <Text style={styles.applyFilterBtnText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Toast Notification */}
      {toastMsg ? (
        <View style={styles.floatingToast}>
          <Text style={styles.floatingToastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  listContent: {
    paddingBottom: 28,
  },
  // Top Blue Header Bar
  topBlueHeader: {
    backgroundColor: '#0047AB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerMenuBtn: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerMenuIcon: {
    color: '#FFFFFF',
    fontSize: 24,
    fontWeight: '800',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logoHex: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoHexText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '900',
  },
  brandTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  rfqIconBtn: {
    position: 'relative',
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rfqIcon: {
    fontSize: 21,
    color: '#FFFFFF',
  },
  rfqBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    backgroundColor: '#FF6B00',
    minWidth: 17,
    height: 17,
    borderRadius: 8.5,
    paddingHorizontal: 3,
    alignItems: 'center',
    justifyContent: 'center',
  },
  rfqBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },

  // Fixed Search Bar
  searchBarWrapper: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 24,
    paddingHorizontal: 14,
    height: 42,
    gap: 8,
  },
  searchIcon: {
    fontSize: 14,
    color: '#64748B',
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: '#0F172A',
    paddingVertical: 0,
  },
  clearSearchIcon: {
    fontSize: 14,
    color: '#94A3B8',
    padding: 4,
  },

  // Categories Row
  categoriesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingLeft: 12,
    paddingRight: 10,
    paddingTop: 8,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  categoryPillsScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 8,
    gap: 8,
  },
  pillWrapper: {
    alignItems: 'center',
    position: 'relative',
    paddingBottom: 4,
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  categoryPillActive: {
    backgroundColor: '#0047AB',
  },
  categoryPillInactive: {
    backgroundColor: '#F1F5F9',
  },
  categoryPillText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#475569',
  },
  categoryPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  activeOrangeUnderline: {
    position: 'absolute',
    bottom: -2,
    width: '60%',
    height: 3,
    backgroundColor: '#FF6B00',
    borderRadius: 2,
  },
  filterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  filterBtnIcon: {
    fontSize: 12,
    color: '#0047AB',
  },
  filterBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },

  // Results Meta Row
  resultsMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 6,
  },
  resultsCountText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  resetFiltersLink: {
    fontSize: 12,
    color: '#0047AB',
    fontWeight: '700',
  },

  // =========================================================================
  // 100% Dynamic Product Card (Synced with Website FastenerCard)
  // =========================================================================
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    elevation: 2,
    shadowColor: '#002B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardMainInfo: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  microStrip: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    paddingVertical: 5,
    paddingHorizontal: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  microCol: {
    flex: 1,
    alignItems: 'center',
  },
  microColText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  microBold: {
    color: '#0F172A',
    fontWeight: '700',
  },
  priceStripRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  rateLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginRight: 4,
    textTransform: 'uppercase',
  },
  altPriceContainer: {
    alignItems: 'flex-end',
  },
  altPriceText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  altPriceBold: {
    color: '#0F172A',
    fontWeight: '800',
  },
  procurementRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 8,
    gap: 8,
  },
  unitToggleBox: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  unitPill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  unitPillActive: {
    backgroundColor: '#FFFFFF',
    elevation: 1,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  unitPillTextActive: {
    color: '#0047AB',
    fontWeight: '900',
  },
  cardStepper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 6,
    paddingVertical: 3,
  },
  stepperArrowBtn: {
    width: 26,
    height: 26,
    borderRadius: 4,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  stepperArrowDisabled: {
    opacity: 0.35,
    backgroundColor: '#F1F5F9',
  },
  stepperArrowText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#0F172A',
  },
  stepperArrowTextDisabled: {
    color: '#94A3B8',
  },
  stepperDisplay: {
    alignItems: 'center',
    paddingHorizontal: 4,
  },
  stepperQtyText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0F172A',
  },
  stepperMinLabel: {
    fontSize: 8,
    fontWeight: '600',
    color: '#0047AB',
  },
  relatedSection: {
    marginTop: 20,
    width: '100%',
    paddingHorizontal: 4,
  },
  relatedHeader: {
    marginBottom: 10,
    paddingHorizontal: 4,
  },
  relatedSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  relatedSectionSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  relatedBadgePill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    marginBottom: 4,
    marginLeft: 14,
  },
  relatedBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1D4ED8',
  },
  surplusCardBorder: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  cardImgBox: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0EEFB',
    flexShrink: 0,
    position: 'relative',
  },
  fastenerImageStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  surplusBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    backgroundColor: '#DC2626',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  surplusBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },
  cardInfo: {
    flex: 1,
    marginLeft: 13,
    justifyContent: 'space-between',
    height: 104,
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  productTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  heartBtn: {
    padding: 2,
  },
  heartIcon: {
    fontSize: 19,
    color: '#94A3B8',
  },
  heartIconActive: {
    color: '#EF4444',
  },
  specLineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 1,
  },
  specText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  specValueText: {
    fontSize: 12,
    color: '#334155',
    fontWeight: '700',
  },
  specDivider: {
    fontSize: 12,
    color: '#CBD5E1',
    marginHorizontal: 3,
  },
  featureStockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 2,
  },
  featureItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  featureCheck: {
    color: '#0052CC',
    fontSize: 12,
    marginRight: 4,
    fontWeight: '800',
  },
  featureText: {
    color: '#334155',
    fontSize: 12,
    fontWeight: '600',
  },
  stockItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  stockBoxIcon: {
    fontSize: 12,
    marginRight: 4,
  },
  stockText: {
    fontSize: 12,
    fontWeight: '700',
  },
  stockTextIn: {
    color: '#16A34A',
  },
  stockTextPre: {
    color: '#D97706',
  },
  cardActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 2,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  priceSymbol: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0047AB',
  },
  priceAmount: {
    fontSize: 19,
    fontWeight: '900',
    color: '#0047AB',
  },
  priceUnit: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
    marginLeft: 2,
  },
  quickAddBtn: {
    borderWidth: 1.5,
    borderColor: '#EA580C',
    borderRadius: 20,
    paddingHorizontal: 13,
    paddingVertical: 5,
    backgroundColor: '#FFFFFF',
  },
  quickAddBtnSuccess: {
    backgroundColor: '#16A34A',
    borderColor: '#16A34A',
  },
  quickAddBtnText: {
    color: '#EA580C',
    fontSize: 12,
    fontWeight: '800',
  },
  quickAddBtnTextSuccess: {
    color: '#FFFFFF',
  },

  // Footer Loader
  footerLoader: {
    paddingVertical: 16,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
  },
  footerLoaderText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },

  // Loading Container
  loadingContainer: {
    padding: 60,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },

  // Empty State
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 36,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  emptyResetBtn: {
    marginTop: 8,
    backgroundColor: '#0047AB',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  emptyResetBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  // Filter Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '80%',
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalCloseIcon: {
    fontSize: 16,
    color: '#64748B',
    padding: 4,
  },
  modalSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
    marginTop: 6,
  },
  modalChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  modalChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  modalChipActive: {
    backgroundColor: '#0047AB',
    borderColor: '#0047AB',
  },
  modalChipText: {
    fontSize: 11,
    color: '#475569',
    fontWeight: '600',
  },
  modalChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  inStockToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 1.5,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxActive: {
    backgroundColor: '#0047AB',
    borderColor: '#0047AB',
  },
  checkboxCheck: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '900',
  },
  inStockToggleLabel: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
  },
  applyFilterBtn: {
    backgroundColor: '#0047AB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 12,
  },
  applyFilterBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },

  // Floating Toast
  floatingToast: {
    position: 'absolute',
    bottom: 24,
    left: 20,
    right: 20,
    backgroundColor: '#0F172A',
    borderRadius: 24,
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    zIndex: 999,
  },
  floatingToastText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
    textAlign: 'center',
  },
});

export default CustomerCatalogScreen;
