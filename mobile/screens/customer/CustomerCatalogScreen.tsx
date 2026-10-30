import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileProduct, GlobalUnit } from '../../types';

interface CustomerCatalogScreenProps {
  initialStandard?: string;
  initialGrade?: string;
  onSelectProduct: (product: MobileProduct) => void;
  onAddToCart: (product: MobileProduct, unit: GlobalUnit, qty: number) => void;
}

export const CustomerCatalogScreen: React.FC<CustomerCatalogScreenProps> = ({
  initialStandard,
  initialGrade,
  onSelectProduct,
  onAddToCart,
}) => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>(initialStandard || 'All');
  const [selectedGrade, setSelectedGrade] = useState<string>(initialGrade || 'All');
  const [inStockOnly, setInStockOnly] = useState<boolean>(false);
  const [displayUnit, setDisplayUnit] = useState<GlobalUnit>('PCS');
  const [toastMsg, setToastMsg] = useState('');

  // Dynamic filter options loaded from backend API
  const [standardsList, setStandardsList] = useState<string[]>(['All']);
  const [gradesList, setGradesList] = useState<string[]>(['All']);

  const fetchCatalog = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.products.getAll({
        search: searchQuery.trim() || undefined,
        standard: selectedStandard === 'All' ? undefined : selectedStandard,
        grade: selectedGrade === 'All' ? undefined : selectedGrade,
        stockStatus: inStockOnly ? 'in_stock' : undefined,
        limit: 50,
      });

      if (res.products) {
        setProducts(res.products);
        setTotalCount(res.total ?? res.count ?? res.products.length);
      }

      // Update dynamic filter options from backend
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
    }
  };

  useEffect(() => {
    fetchCatalog();
  }, [searchQuery, selectedStandard, selectedGrade, inStockOnly]);

  const handleQuickAdd = (product: MobileProduct) => {
    const qty = displayUnit === 'PCS' ? 1000 : 50;
    onAddToCart(product, displayUnit, qty);
    setToastMsg(`Added ${qty.toLocaleString()} ${displayUnit} of ${product.sku} to cart`);
    setTimeout(() => setToastMsg(''), 2500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchCatalog(true)} colors={['#0052CC']} />
      }
    >
      {/* Search Header */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search DIN standard, Grade, Diameter (e.g. M10, 8.8)..."
      />

      {/* Procurement Unit & In Stock Filters Row */}
      <View style={styles.topControlsRow}>
        <View style={styles.unitToggleContainer}>
          <Text style={styles.controlLabel}>PRICE MODE:</Text>
          <View style={styles.unitPillsWrap}>
            <TouchableOpacity
              onPress={() => setDisplayUnit('PCS')}
              style={[styles.unitPill, displayUnit === 'PCS' ? styles.unitPillActive : styles.unitPillInactive]}
            >
              <Text style={[styles.unitPillText, displayUnit === 'PCS' ? styles.unitPillTextActive : null]}>
                ₹ / Pc
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setDisplayUnit('KGS')}
              style={[styles.unitPill, displayUnit === 'KGS' ? styles.unitPillActive : styles.unitPillInactive]}
            >
              <Text style={[styles.unitPillText, displayUnit === 'KGS' ? styles.unitPillTextActive : null]}>
                ₹ / Kg
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => setInStockOnly(!inStockOnly)}
          style={[styles.stockToggle, inStockOnly ? styles.stockToggleActive : styles.stockToggleInactive]}
        >
          <View style={[styles.stockDot, inStockOnly ? styles.stockDotActive : styles.stockDotInactive]} />
          <Text style={[styles.stockToggleText, inStockOnly ? styles.stockToggleTextActive : null]}>
            In Stock Only
          </Text>
        </TouchableOpacity>
      </View>

      {/* Dynamic Standards Chips */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterTitle}>STANDARDS (DIN / ISO)</Text>
          {selectedStandard !== 'All' && (
            <TouchableOpacity onPress={() => setSelectedStandard('All')}>
              <Text style={styles.resetFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {standardsList.map((std) => {
            const isActive = selectedStandard === std;
            return (
              <TouchableOpacity
                key={std}
                onPress={() => setSelectedStandard(std)}
                style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
              >
                <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                  {std}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Dynamic Grades Chips */}
      <View style={styles.filterSection}>
        <View style={styles.filterHeaderRow}>
          <Text style={styles.filterTitle}>MATERIAL GRADE</Text>
          {selectedGrade !== 'All' && (
            <TouchableOpacity onPress={() => setSelectedGrade('All')}>
              <Text style={styles.resetFilterText}>Clear</Text>
            </TouchableOpacity>
          )}
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
          {gradesList.map((gr) => {
            const isActive = selectedGrade === gr;
            return (
              <TouchableOpacity
                key={gr}
                onPress={() => setSelectedGrade(gr)}
                style={[
                  styles.gradeChip,
                  isActive ? styles.gradeChipActive : styles.gradeChipInactive,
                ]}
              >
                <Text
                  style={[
                    styles.gradeChipText,
                    isActive ? styles.gradeChipTextActive : null,
                  ]}
                >
                  {gr}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Toast Notification */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Results Count & Reload */}
      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Showing {products.length} of {totalCount} industrial fasteners
        </Text>
        <TouchableOpacity onPress={() => fetchCatalog(true)}>
          <Text style={styles.reloadText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Loading Indicator */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading dynamic fasteners...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>🔍</Text>
          <Text style={styles.emptyTitle}>No Fasteners Found</Text>
          <Text style={styles.emptySubtitle}>
            Try clearing filters or searching by DIN standard, diameter, or grade.
          </Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedStandard('All');
              setSelectedGrade('All');
              setInStockOnly(false);
            }}
            style={styles.clearBtn}
          >
            <Text style={styles.clearBtnText}>Reset All Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        /* Products List */
        products.map((product) => {
          const displayPrice = displayUnit === 'PCS' ? product.pricePerPiece : product.pricePerKg;
          const secondaryPrice = displayUnit === 'PCS' ? `₹${product.pricePerKg}/Kg` : `₹${product.pricePerPiece}/Pc`;

          return (
            <MobileCard key={product.id} onPress={() => onSelectProduct(product)}>
              <View style={styles.cardTop}>
                <View style={styles.skuRow}>
                  <Text style={styles.skuPill}>{product.sku}</Text>
                  {product.standard ? (
                    <Text style={styles.standardPill}>{product.standard}</Text>
                  ) : null}
                </View>
                <MobileBadge
                  label={product.isInStock ? 'IN STOCK' : 'PRE-ORDER'}
                  variant={product.isInStock ? 'success' : 'warning'}
                  size="sm"
                />
              </View>

              <Text style={styles.productName}>{product.name}</Text>
              
              <View style={styles.specsRow}>
                <Text style={styles.specBadge}>Grade: {product.grade || '8.8'}</Text>
                {product.diameter ? (
                  <Text style={styles.specBadge}>Dia: {product.diameter}</Text>
                ) : null}
                {product.lengthMm ? (
                  <Text style={styles.specBadge}>Len: {product.lengthMm}mm</Text>
                ) : null}
              </View>

              {product.stockPcs ? (
                <Text style={styles.stockText}>
                  🏭 Warehouse Stock: {product.stockPcs.toLocaleString()} Pcs ({product.stockKg || 0} Kg)
                </Text>
              ) : null}

              <View style={styles.cardDivider} />

              <View style={styles.cardBottom}>
                <View>
                  <Text style={styles.mainPrice}>
                    ₹{displayPrice}
                    <Text style={styles.priceSub}> / {displayUnit}</Text>
                  </Text>
                  <Text style={styles.secondaryPrice}>{secondaryPrice}</Text>
                </View>

                <TouchableOpacity
                  onPress={() => handleQuickAdd(product)}
                  style={styles.addBtn}
                >
                  <Text style={styles.addBtnText}>+ Add to Cart</Text>
                </TouchableOpacity>
              </View>
            </MobileCard>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
  },
  topControlsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  unitToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  controlLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  unitPillsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    padding: 2,
  },
  unitPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 4,
  },
  unitPillActive: {
    backgroundColor: '#0052CC',
  },
  unitPillInactive: {
    backgroundColor: 'transparent',
  },
  unitPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  unitPillTextActive: {
    color: '#FFFFFF',
  },
  stockToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  stockToggleActive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#34D399',
  },
  stockToggleInactive: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  stockDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  stockDotActive: {
    backgroundColor: '#10B981',
  },
  stockDotInactive: {
    backgroundColor: '#94A3B8',
  },
  stockToggleText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  stockToggleTextActive: {
    color: '#065F46',
    fontWeight: '700',
  },
  filterSection: {
    gap: 6,
  },
  filterHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  filterTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#475569',
    letterSpacing: 0.5,
  },
  resetFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  gradeChip: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    borderWidth: 1,
    marginRight: 6,
  },
  gradeChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#FF6B00',
  },
  gradeChipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  gradeChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  gradeChipTextActive: {
    color: '#C2410C',
    fontWeight: '800',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  resultsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '700',
  },
  reloadText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 8,
  },
  emptyIcon: {
    fontSize: 32,
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
  },
  clearBtn: {
    marginTop: 8,
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  clearBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuPill: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  standardPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  productName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 6,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 4,
  },
  specBadge: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
    marginTop: 4,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mainPrice: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0052CC',
  },
  priceSub: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  secondaryPrice: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '500',
  },
  addBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});

export default CustomerCatalogScreen;
