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
import { mobileApi } from '../../config/api';
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
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);

  // Favorites & Added states
  const [favorites, setFavorites] = useState<Set<number>>(new Set());
  const [recentlyAddedId, setRecentlyAddedId] = useState<number | null>(null);

  // Filter drawer modal
  const [isFilterOpen, setIsFilterOpen] = useState<boolean>(false);
  const [standardsList, setStandardsList] = useState<string[]>(['All']);
  const [gradesList, setGradesList] = useState<string[]>(['All']);

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
      const res = await mobileApi.products.getAll({
        search: debouncedQuery || undefined,
        subGroup: selectedCategory === 'All' ? undefined : selectedCategory,
        standard: selectedStandard === 'All' ? undefined : selectedStandard,
        grade: selectedGrade === 'All' ? undefined : selectedGrade,
        stockStatus: inStockOnly ? 'in_stock' : undefined,
        page: pageNum,
        limit: PAGE_SIZE,
      });

      const newItems = res.products || [];
      const total = res.total ?? res.count ?? newItems.length;
      setTotalCount(total);

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

      // Populate all categories dynamically while preserving friendly labels
      if (res.filterOptions?.subGroups && res.filterOptions.subGroups.length > 0) {
        const knownIds = new Set(DEFAULT_CATEGORIES.map((c) => c.id.toUpperCase()));
        const extraGroups = res.filterOptions.subGroups
          .filter((sg: string) => Boolean(sg) && !knownIds.has(sg.toUpperCase()))
          .map((sg: string) => ({
            id: sg.toUpperCase(),
            label: sg.charAt(0).toUpperCase() + sg.slice(1).toLowerCase(),
          }));
        setCategoriesList([...DEFAULT_CATEGORIES, ...extraGroups]);
      }
      if (res.filterOptions?.standards && res.filterOptions.standards.length > 0) {
        setStandardsList(['All', ...res.filterOptions.standards]);
      }
      if (res.filterOptions?.grades && res.filterOptions.grades.length > 0) {
        setGradesList(['All', ...res.filterOptions.grades]);
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
  }, [debouncedQuery, selectedCategory, selectedStandard, selectedGrade, inStockOnly]);

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
    onAddToCart(product, 'PCS', 1000);
    setRecentlyAddedId(product.id);
    setToastMsg(`Added 1,000 Pcs of ${product.sku} to cart`);
    setTimeout(() => {
      setRecentlyAddedId(null);
      setToastMsg('');
    }, 2500);
  };

  // 100% Dynamic Card Rendering (Faithful to UI Mockup, NO "Get Quote >")
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

    return (
      <TouchableOpacity
        activeOpacity={0.9}
        onPress={() => onSelectProduct(item)}
        style={[styles.card, item.isSurplus ? styles.surplusCardBorder : null]}
      >
        {/* Left Image Thumbnail Container with soft sky-blue background */}
        <View style={styles.cardImgBox}>
          <FastenerProductImage
            imageUrl={item.imageUrl}
            category={item.category || item.subGroup}
            productName={item.name}
            standard={standardDisplay}
            drawingUrl={item.drawingUrl}
            height={98}
            containerStyle={styles.fastenerImageStyle}
            showCadBadge={Boolean(item.drawingUrl)}
          />
          {item.isSurplus ? (
            <View style={styles.surplusBadge}>
              <Text style={styles.surplusBadgeText}>🔥 -{item.surplusDiscountPct || 35}%</Text>
            </View>
          ) : null}
        </View>

        {/* Right Info Section */}
        <View style={styles.cardInfo}>
          {/* Row 1: Clean Title + Heart Wishlist Button */}
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

          {/* Row 2: Size & DIN Standard */}
          <View style={styles.specLineRow}>
            <Text style={styles.specText}>
              Size: <Text style={styles.specValueText}>{sizeDisplay}</Text>
              <Text style={styles.specDivider}>  |  </Text>
              <Text style={styles.specValueText}>{cleanDin.startsWith('DIN') ? cleanDin : `DIN: ${cleanDin}`}</Text>
            </Text>
          </View>

          {/* Row 3: Feature Check & Live Stock Status */}
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

          {/* Row 4: Price & Action Pill Button */}
          <View style={styles.cardActionRow}>
            <View style={styles.priceContainer}>
              <Text style={styles.priceSymbol}>₹</Text>
              <Text style={styles.priceAmount}>{item.pricePerPiece}</Text>
              <Text style={styles.priceUnit}> / Piece</Text>
            </View>

            <TouchableOpacity
              activeOpacity={0.82}
              onPress={(e) => {
                e.stopPropagation?.();
                handleQuickAdd(item);
              }}
              style={[styles.quickAddBtn, isAdded ? styles.quickAddBtnSuccess : null]}
            >
              <Text style={[styles.quickAddBtnText, isAdded ? styles.quickAddBtnTextSuccess : null]}>
                {isAdded ? '✓ Added' : '+ Add to Cart'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
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
              <Text style={styles.emptyTitle}>No Fasteners Found</Text>
              <Text style={styles.emptySubtitle}>
                No products match "{debouncedQuery}" under {selectedCategory}. Try resetting your search filters.
              </Text>
              <TouchableOpacity
                onPress={() => {
                  setSearchQuery('');
                  setSelectedCategory('All');
                  setSelectedStandard('All');
                  setSelectedGrade('All');
                  setInStockOnly(false);
                }}
                style={styles.emptyResetBtn}
              >
                <Text style={styles.emptyResetBtnText}>Reset All Filters</Text>
              </TouchableOpacity>
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
  // 100% Dynamic Product Card (Faithful to UI Mockup, NO "Get Quote >")
  // =========================================================================
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginHorizontal: 14,
    marginBottom: 10,
    paddingHorizontal: 12,
    paddingVertical: 11,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    elevation: 2,
    shadowColor: '#002B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    alignItems: 'center',
  },
  surplusCardBorder: {
    borderColor: '#F59E0B',
    borderWidth: 1.5,
  },
  cardImgBox: {
    width: 104,
    height: 104,
    borderRadius: 14,
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
