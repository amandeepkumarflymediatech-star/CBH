import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { ProductCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileProduct } from '../../types';

// Same palette as the other screens
const GRAPHITE = '#1C2228';
const STEEL = '#5E6A74';
const MIST = '#EDEFF1';
const HAIR = '#D6DBE0';
const WHITE = '#FFFFFF';
const ORANGE = '#F26B1D';
const GREEN = '#17803D';
const RED = '#C62828';
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

  // Update modal state
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
      showToast(`${createdItem.sku} added to the catalog`);
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
      showToast(`${productToDelete.sku} deleted`);
      setProductToDelete(null);
    } catch (err: any) {
      Alert.alert('Could not delete product', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchProducts(true)} colors={[ORANGE]} />
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchWrap}>
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search SKU, standard or size, e.g. DIN 933 M10"
        />
      </View>

      {/* Standards filter tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
      >
        {standardsList.map((std) => {
          const active = selectedStandard === std;
          return (
            <TouchableOpacity
              key={std}
              onPress={() => setSelectedStandard(std)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{std}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Count + add */}
      <View style={styles.controlBar}>
        <View>
          <Text style={styles.h2}>{totalCount.toLocaleString('en-IN')} products</Text>
          <Text style={styles.subCount}>Showing {products.length}</Text>
        </View>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.88}>
          <Text style={styles.addBtnText}>Add product</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ gap: 10 }}>
          <ProductCardSkeleton />
          <ProductCardSkeleton />
          <ProductCardSkeleton />
        </View>
      ) : products.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyTitle}>No products found</Text>
          <Text style={styles.emptySubtitle}>Clear the search or the standard filter to see more.</Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedStandard('All');
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        products.map((product) => (
          <View key={product.id} style={styles.product}>
            <View style={styles.topRow}>
              <FastenerProductImage
                imageUrl={product.imageUrl}
                drawingUrl={product.drawingUrl}
                height={76}
                containerStyle={styles.thumb}
                showCadBadge
              />
              <View style={styles.info}>
                <View style={styles.rowBetween}>
                  <Text style={styles.sku} numberOfLines={1}>
                    {product.sku}
                  </Text>
                  <View style={styles.statusRow}>
                    <View style={[styles.dot, { backgroundColor: product.isInStock ? GREEN : RED }]} />
                    <Text style={[styles.statusText, { color: product.isInStock ? GREEN : RED }]}>
                      {product.isInStock ? 'In stock' : 'Out of stock'}
                    </Text>
                  </View>
                </View>
                <Text style={styles.name} numberOfLines={2}>
                  {product.name}
                </Text>
                <Text style={styles.specs}>
                  {product.standard || 'DIN 933'}, Gr {product.grade || '8.8'}, {product.diameter} × {product.lengthMm} mm
                </Text>
              </View>
            </View>

            {/* Stock and rates side by side */}
            <View style={styles.dataRow}>
              <View style={styles.dataCol}>
                <Text style={styles.dataLabel}>In stock</Text>
                <Text style={styles.dataVal}>{(product.stockPcs || 0).toLocaleString('en-IN')} pcs</Text>
                <Text style={styles.dataSub}>{(product.stockKg || 0).toLocaleString('en-IN')} kg</Text>
              </View>
              <View style={[styles.dataCol, styles.dataColRight]}>
                <Text style={styles.dataLabel}>Rates</Text>
                <Text style={styles.dataVal}>₹{product.pricePerPiece} / pc</Text>
                <Text style={styles.dataSub}>₹{product.pricePerKg} / kg</Text>
              </View>
            </View>

            <View style={styles.actions}>
              <TouchableOpacity
                onPress={() => handlePromptDelete(product)}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteLink}>Delete</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleOpenEdit(product)} style={styles.editBtn} activeOpacity={0.85}>
                <Text style={styles.editBtnText}>Edit rates and stock</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}

      {/* Create modal */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add product"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>Adds a new fastener to the catalog and ERPNext inventory.</Text>

          <Text style={styles.inputLabel}>SKU</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={newSku}
            onChangeText={setNewSku}
            placeholder="CBH-933-M12-50-BP"
            placeholderTextColor="#8D98A1"
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Product name</Text>
          <TextInput
            style={styles.input}
            value={newName}
            onChangeText={setNewName}
            placeholder="Hex Head Bolt DIN 933 M12x50 Grade 8.8"
            placeholderTextColor="#8D98A1"
          />

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Standard</Text>
              <TextInput style={styles.input} value={newStandard} onChangeText={setNewStandard} placeholder="DIN 933" placeholderTextColor="#8D98A1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Grade</Text>
              <TextInput style={styles.input} value={newGrade} onChangeText={setNewGrade} placeholder="8.8, 10.9, SS 304" placeholderTextColor="#8D98A1" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Diameter</Text>
              <TextInput style={styles.input} value={newDiameter} onChangeText={setNewDiameter} placeholder="M10" placeholderTextColor="#8D98A1" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Length (mm)</Text>
              <TextInput style={styles.input} value={newLength} onChangeText={setNewLength} keyboardType="numeric" placeholder="50" placeholderTextColor="#8D98A1" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate (₹ per pc)</Text>
              <TextInput style={styles.input} value={newPricePcs} onChangeText={setNewPricePcs} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate (₹ per kg)</Text>
              <TextInput style={styles.input} value={newPriceKg} onChangeText={setNewPriceKg} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (pcs)</Text>
              <TextInput style={styles.input} value={newStockPcs} onChangeText={setNewStockPcs} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (kg)</Text>
              <TextInput style={styles.input} value={newStockKg} onChangeText={setNewStockKg} keyboardType="numeric" />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreateProduct}
            style={[styles.saveBtn, isSubmitting && styles.disabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Add product</Text>}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Edit modal */}
      {activeProduct ? (
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit ${activeProduct.sku}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>Changes to stock, grade and rates sync to the ERP database.</Text>

            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Stock (pcs)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editStockPcs)}
                  onChangeText={(val) => setEditStockPcs(parseInt(val) || 0)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Stock (kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editStockKg)}
                  onChangeText={(val) => setEditStockKg(parseFloat(val) || 0)}
                />
              </View>
            </View>

            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Rate (₹ per pc)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editPricePcs)}
                  onChangeText={(val) => setEditPricePcs(parseFloat(val) || 0)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Rate (₹ per kg)</Text>
                <TextInput
                  style={styles.input}
                  keyboardType="numeric"
                  value={String(editPriceKg)}
                  onChangeText={(val) => setEditPriceKg(parseFloat(val) || 0)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Grade</Text>
            <TextInput
              style={styles.input}
              value={editGrade}
              onChangeText={setEditGrade}
              placeholder="8.8, 10.9, 12.9"
              placeholderTextColor="#8D98A1"
            />

            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.saveBtn, isSubmitting && styles.disabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Save changes</Text>}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* Delete modal */}
      {productToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete this product?"
        >
          <View style={styles.modalScroll}>
            <Text style={styles.deleteLead}>
              {productToDelete.sku} will be permanently removed from the inventory database. This can’t be undone.
            </Text>

            <View style={styles.deleteTable}>
              <View style={[styles.kv, { borderTopWidth: 0 }]}>
                <Text style={styles.k}>Name</Text>
                <Text style={styles.v}>{productToDelete.name}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Standard and grade</Text>
                <Text style={styles.v}>
                  {productToDelete.standard}, Gr {productToDelete.grade}
                </Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>In stock</Text>
                <Text style={styles.v}>{(productToDelete.stockPcs || 0).toLocaleString('en-IN')} pcs</Text>
              </View>
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity onPress={() => setIsDeleteModalOpen(false)} style={styles.cancelBtn} disabled={isSubmitting}>
                <Text style={styles.cancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, isSubmitting && styles.disabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Delete product</Text>}
              </TouchableOpacity>
            </View>
          </View>
        </MobileModal>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: WHITE },

  searchWrap: { paddingHorizontal: 16, paddingTop: 16 },

  tabs: { marginTop: 8, borderBottomWidth: 1, borderBottomColor: HAIR, flexGrow: 0 },
  tabsContent: { paddingHorizontal: 20, gap: 22 },
  tab: { paddingVertical: 12, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: ORANGE },
  tabText: { fontSize: 14, fontWeight: '600', color: STEEL },
  tabTextActive: { color: GRAPHITE },

  toast: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: GRAPHITE,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { color: WHITE, fontSize: 14, fontWeight: '600' },

  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 12,
    marginTop: 12,
    backgroundColor: MIST,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIR,
  },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  subCount: { fontSize: 12, color: STEEL, marginTop: 1 },
  addBtn: { height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: WHITE, fontSize: 14, fontWeight: '700' },

  centerBlock: { paddingHorizontal: 32, paddingVertical: 48, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 14, color: STEEL, marginTop: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: GRAPHITE },
  emptySubtitle: { fontSize: 14, color: STEEL, textAlign: 'center' },
  resetBtn: {
    marginTop: 8,
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  resetBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },

  // One product: a hairline-separated block, not a card
  product: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: HAIR },
  topRow: { flexDirection: 'row', gap: 14 },
  thumb: { width: 76, height: 76, borderRadius: 6, flexShrink: 0, backgroundColor: MIST },
  info: { flex: 1 },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  sku: { fontSize: 13, fontWeight: '700', color: GRAPHITE, fontFamily: MONO, flexShrink: 1 },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  dot: { width: 7, height: 7, borderRadius: 4 },
  statusText: { fontSize: 12, fontWeight: '700' },
  name: { fontSize: 15, fontWeight: '600', color: GRAPHITE, marginTop: 4, lineHeight: 20 },
  specs: { fontSize: 12, color: STEEL, marginTop: 4 },

  dataRow: { flexDirection: 'row', marginTop: 16, paddingTop: 14, borderTopWidth: 1, borderTopColor: MIST },
  dataCol: { flex: 1 },
  dataColRight: { alignItems: 'flex-end' },
  dataLabel: { fontSize: 12, color: STEEL },
  dataVal: { fontSize: 16, fontWeight: '700', color: GRAPHITE, marginTop: 2, fontVariant: ['tabular-nums'] },
  dataSub: { fontSize: 13, color: STEEL, marginTop: 1, fontVariant: ['tabular-nums'] },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  deleteLink: { fontSize: 14, fontWeight: '600', color: RED },
  editBtn: {
    height: 44,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },

  // Modals
  modalScroll: { paddingVertical: 6 },
  modalSubtitle: { fontSize: 14, color: STEEL, lineHeight: 20, marginBottom: 6 },
  inputLabel: { fontSize: 13, fontWeight: '600', color: GRAPHITE, marginTop: 14, marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: HAIR,
    borderRadius: 8,
    paddingHorizontal: 12,
    height: 46,
    fontSize: 15,
    color: GRAPHITE,
    backgroundColor: WHITE,
  },
  twoCols: { flexDirection: 'row', gap: 10 },
  saveBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },

  // Delete
  deleteLead: { fontSize: 15, color: GRAPHITE, lineHeight: 22 },
  deleteTable: { marginTop: 12, marginBottom: 20 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '600', color: GRAPHITE, flexShrink: 1, textAlign: 'right', marginLeft: 16 },
  modalActions: { flexDirection: 'row', gap: 10 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  confirmDeleteBtn: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    backgroundColor: RED,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default AdminProductsScreen;