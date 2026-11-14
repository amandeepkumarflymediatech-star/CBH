import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  Alert,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { ProductCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileProduct } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const GREEN = '#16A34A';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const AdminProductsScreen: React.FC = () => {
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [totalCount, setTotalCount] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStandard, setSelectedStandard] = useState<string>('All');
  const [standardsList, setStandardsList] = useState<string[]>(['All']);

  // Edit modal state
  const [activeProduct, setActiveProduct] = useState<MobileProduct | null>(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editStockPcs, setEditStockPcs] = useState<number>(0);
  const [editStockKg, setEditStockKg] = useState<number>(0);
  const [editPricePcs, setEditPricePcs] = useState<number>(0);
  const [editPriceKg, setEditPriceKg] = useState<number>(0);
  const [editGrade, setEditGrade] = useState<string>('8.8');

  // Create modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newSku, setNewSku] = useState('');
  const [newName, setNewName] = useState('');
  const [newStandard, setNewStandard] = useState('DIN 933');
  const [newGrade, setNewGrade] = useState('8.8');
  const [newDiameter, setNewDiameter] = useState('M10');
  const [newLength, setNewLength] = useState('50');
  const [newPricePcs, setNewPricePcs] = useState('5.50');
  const [newPriceKg, setNewPriceKg] = useState('95.00');
  const [newStockPcs, setNewStockPcs] = useState('10000');
  const [newStockKg, setNewStockKg] = useState('500');

  // Delete modal state
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [productToDelete, setProductToDelete] = useState<MobileProduct | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchProducts = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.products.getAll({
        search: searchQuery.trim() || undefined,
        standard: selectedStandard === 'All' ? undefined : selectedStandard,
        limit: 50,
      });

      if (res.products) {
        setProducts(res.products);
        setTotalCount(res.total ?? res.count ?? res.products.length);
      }

      if (res.filterOptions?.standards && res.filterOptions.standards.length > 0) {
        setStandardsList(['All', ...res.filterOptions.standards]);
      }
    } catch (err) {
      console.warn('[Admin Products] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [searchQuery, selectedStandard]);

  // CREATE
  const handleOpenCreate = () => {
    setNewSku(`CBH-${newStandard.replace(/\s+/g, '')}-${newDiameter}-${newLength}`);
    setNewName(`Hex Fastener ${newStandard} ${newDiameter}x${newLength} Gr ${newGrade}`);
    setIsCreateModalOpen(true);
  };

  const handleCreateProduct = async () => {
    if (!newSku.trim() || !newName.trim()) {
      Alert.alert('Missing details', 'Enter a SKU and a product name.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload: Partial<MobileProduct> = {
        sku: newSku.trim().toUpperCase(),
        name: newName.trim(),
        standard: newStandard,
        grade: newGrade,
        diameter: newDiameter,
        lengthMm: parseInt(newLength) || 50,
        pricePerPiece: parseFloat(newPricePcs) || 5.0,
        pricePerKg: parseFloat(newPriceKg) || 90.0,
        stockPcs: parseInt(newStockPcs) || 1000,
        stockKg: parseFloat(newStockKg) || 100,
        category: 'Hex Screws',
        threadType: 'Full Thread',
        finish: 'Black Passivated',
        isInStock: (parseInt(newStockPcs) || 0) > 0,
      };

      const res = await mobileApi.products.create(payload);
      const createdItem: MobileProduct = res.product || {
        ...payload,
        id: res.id || Date.now(),
        weightPerPcKg: 0.05,
      } as MobileProduct;

      setProducts((prev) => [createdItem, ...prev]);
      setTotalCount((prev) => prev + 1);
      setIsCreateModalOpen(false);
      showToast(`${createdItem.sku} added to catalog`);
    } catch (err: any) {
      Alert.alert('Could not add product', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleOpenEdit = (product: MobileProduct) => {
    setActiveProduct(product);
    setEditStockPcs(product.stockPcs || 0);
    setEditStockKg(product.stockKg || 0);
    setEditPricePcs(product.pricePerPiece || 0);
    setEditPriceKg(product.pricePerKg || 0);
    setEditGrade(product.grade || '8.8');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!activeProduct) return;
    setIsSubmitting(true);
    try {
      await mobileApi.products.update({
        id: activeProduct.id,
        stockPcs: editStockPcs,
        stockKg: editStockKg,
        pricePerPiece: editPricePcs,
        pricePerKg: editPriceKg,
        grade: editGrade,
        isInStock: editStockPcs > 0,
      });

      setProducts((prev) =>
        prev.map((p) =>
          p.id === activeProduct.id
            ? {
                ...p,
                stockPcs: editStockPcs,
                stockKg: editStockKg,
                pricePerPiece: editPricePcs,
                pricePerKg: editPriceKg,
                grade: editGrade,
                isInStock: editStockPcs > 0,
              }
            : p
        )
      );

      setIsEditModalOpen(false);
      showToast(`${activeProduct.sku} updated`);
    } catch (err: any) {
      Alert.alert('Could not update product', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handlePromptDelete = (product: MobileProduct) => {
    setProductToDelete(product);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!productToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.products.delete(productToDelete.id);
      setProducts((prev) => prev.filter((p) => p.id !== productToDelete.id));
      setTotalCount((prev) => Math.max(0, prev - 1));
      setIsDeleteModalOpen(false);
      showToast(`${productToDelete.sku} removed`);
      setProductToDelete(null);
    } catch (err: any) {
      Alert.alert('Could not delete product', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Compact Top Header & Search Bar */}
      <View style={styles.topHeader}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search SKU or size (DIN 933, M10)..."
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ Add</Text>
          </TouchableOpacity>
        </View>

        {/* Horizontal Standards Filter Strip - Single Line Touch Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.standardsScroll}
          style={styles.standardsBar}
        >
          {standardsList.map((std) => {
            const active = selectedStandard === std;
            return (
              <TouchableOpacity
                key={std}
                onPress={() => setSelectedStandard(std)}
                style={[styles.stdPill, active && styles.stdPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.stdPillText, active && styles.stdPillTextActive]}>{std}</Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* High Density Fastener Product List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchProducts(true)} colors={[BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>
            {totalCount.toLocaleString('en-IN')} Fasteners ({products.length} shown)
          </Text>
        </View>

        {isLoading ? (
          <View style={{ gap: 8 }}>
            <ProductCardSkeleton />
            <ProductCardSkeleton />
            <ProductCardSkeleton />
          </View>
        ) : products.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching fasteners</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedStandard('All');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          products.map((product) => {
            const inStock = (product.stockPcs || 0) > 0;
            return (
              <View key={product.id} style={styles.productCard}>
                {/* Header Row: SKU, Spec Tag, Stock Pill */}
                <View style={styles.cardTopRow}>
                  <View style={styles.skuBox}>
                    <Text style={styles.skuText} numberOfLines={1}>
                      {product.sku}
                    </Text>
                    <View style={styles.specBadge}>
                      <Text style={styles.specBadgeText}>
                        {product.standard || 'DIN 933'} • {product.grade || '8.8'}
                      </Text>
                    </View>
                  </View>

                  <View style={[styles.stockPill, { backgroundColor: inStock ? '#DCFCE7' : '#FEE2E2' }]}>
                    <Text style={[styles.stockPillText, { color: inStock ? GREEN : RED }]}>
                      {inStock ? `${(product.stockPcs || 0).toLocaleString()} pcs` : 'Out of Stock'}
                    </Text>
                  </View>
                </View>

                {/* Middle Row: Name & Dimensions */}
                <Text style={styles.productName} numberOfLines={1}>
                  {product.name}
                </Text>

                {/* Bottom Row: Commercial Telemetry & Quick Actions */}
                <View style={styles.cardBottomRow}>
                  <View style={styles.telemetryGroup}>
                    <Text style={styles.ratePill}>₹{product.pricePerPiece}/pc</Text>
                    <Text style={styles.ratePillSecondary}>₹{product.pricePerKg}/kg</Text>
                    <Text style={styles.stockKgText}>{(product.stockKg || 0).toFixed(0)} kg</Text>
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      onPress={() => handlePromptDelete(product)}
                      style={styles.deleteBtn}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={styles.deleteBtnText}>Delete</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(product)}
                      style={styles.editBtn}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Edit Fastener Modal */}
      <MobileModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title={`Edit ${activeProduct?.sku || 'Product'}`}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (Pcs)</Text>
              <TextInput
                style={styles.input}
                value={String(editStockPcs)}
                onChangeText={(v) => setEditStockPcs(parseInt(v) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (Kg)</Text>
              <TextInput
                style={styles.input}
                value={String(editStockKg)}
                onChangeText={(v) => setEditStockKg(parseFloat(v) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate / Pc (₹)</Text>
              <TextInput
                style={styles.input}
                value={String(editPricePcs)}
                onChangeText={(v) => setEditPricePcs(parseFloat(v) || 0)}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate / Kg (₹)</Text>
              <TextInput
                style={styles.input}
                value={String(editPriceKg)}
                onChangeText={(v) => setEditPriceKg(parseFloat(v) || 0)}
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Grade Class</Text>
          <TextInput
            style={styles.input}
            value={editGrade}
            onChangeText={setEditGrade}
            placeholder="8.8, 10.9, SS 304"
          />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveEdit}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Update Fastener'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Add Fastener Modal */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Fastener to Catalog"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>SKU Code *</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={newSku}
            onChangeText={setNewSku}
            placeholder="CBH-933-M10-50"
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Fastener Master Title *</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Hex Head Screws DIN 933 M10x50"
          />

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Standard</Text>
              <TextInput style={styles.input} value={newStandard} onChangeText={setNewStandard} placeholder="DIN 933" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Grade</Text>
              <TextInput style={styles.input} value={newGrade} onChangeText={setNewGrade} placeholder="8.8" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Diameter</Text>
              <TextInput style={styles.input} value={newDiameter} onChangeText={setNewDiameter} placeholder="M10" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Length (mm)</Text>
              <TextInput style={styles.input} value={newLength} onChangeText={setNewLength} keyboardType="numeric" placeholder="50" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate / Pc (₹)</Text>
              <TextInput style={styles.input} value={newPricePcs} onChangeText={setNewPricePcs} keyboardType="numeric" placeholder="5.50" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (Pcs)</Text>
              <TextInput style={styles.input} value={newStockPcs} onChangeText={setNewStockPcs} keyboardType="numeric" placeholder="10000" />
            </View>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleCreateProduct}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Registering...' : 'Save Fastener'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Fastener"
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: STEEL, marginBottom: 14 }}>
            Are you sure you want to delete <Text style={{ fontWeight: '800', color: GRAPHITE }}>{productToDelete?.sku}</Text>?
          </Text>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalOpen(false)}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, borderWidth: 1, borderColor: '#CBD5E1', alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: STEEL }}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
              style={{ flex: 1, paddingVertical: 10, borderRadius: 8, backgroundColor: RED, alignItems: 'center' }}
            >
              <Text style={{ fontSize: 12, fontWeight: '700', color: WHITE }}>
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 6,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  addBtn: {
    backgroundColor: BLUE,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  standardsBar: {
    marginTop: 2,
  },
  standardsScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  stdPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stdPillActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  stdPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  stdPillTextActive: {
    color: WHITE,
    fontWeight: '800',
  },
  countRow: {
    paddingVertical: 4,
    marginBottom: 6,
  },
  countText: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
  },
  listContent: {
    padding: 12,
    paddingBottom: 24,
  },
  productCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 3,
  },
  skuBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flex: 1,
    paddingRight: 6,
  },
  skuText: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
    maxWidth: 130,
  },
  specBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  specBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BLUE,
  },
  stockPill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  stockPillText: {
    fontSize: 10,
    fontWeight: '700',
    fontFamily: MONO,
  },
  productName: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAPHITE,
    marginBottom: 6,
  },
  cardBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  telemetryGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  ratePill: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: GREEN,
  },
  ratePillSecondary: {
    fontSize: 10,
    fontWeight: '600',
    fontFamily: MONO,
    color: STEEL,
  },
  stockKgText: {
    fontSize: 10,
    fontFamily: MONO,
    color: LIGHT_STEEL,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  deleteBtn: {
    paddingVertical: 3,
    paddingHorizontal: 6,
  },
  deleteBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: RED,
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAPHITE,
  },
  toast: {
    backgroundColor: GRAPHITE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  toastText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
  emptyBox: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 13,
    color: STEEL,
    marginBottom: 10,
  },
  resetBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  resetBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
  },
  modalScroll: {
    paddingVertical: 6,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 4,
  },
  input: {
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: GRAPHITE,
    marginBottom: 8,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
});
