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
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileProduct } from '../../types';

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

  // ============================================================================
  // CRUD: CREATE
  // ============================================================================
  const handleOpenCreate = () => {
    setNewSku(`CBH-${newStandard.replace(/\s+/g, '')}-${newDiameter}-${newLength}`);
    setNewName(`Hex Fastener ${newStandard} ${newDiameter}x${newLength} Gr ${newGrade}`);
    setIsCreateModalOpen(true);
  };

  const handleCreateProduct = async () => {
    if (!newSku.trim() || !newName.trim()) {
      Alert.alert('Validation Error', 'SKU and Product Name are required.');
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
      showToast(`SKU ${createdItem.sku} created in catalog!`);
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Failed to create product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: UPDATE
  // ============================================================================
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
      showToast(`SKU ${activeProduct.sku} updated!`);
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Failed to update product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: DELETE
  // ============================================================================
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
      showToast(`SKU ${productToDelete.sku} removed from warehouse inventory.`);
      setProductToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete product.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchProducts(true)}
          colors={['#0052CC']}
        />
      }
    >
      {/* Search Bar */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search SKU, standard, or size (e.g. DIN 933 M10)..."
      />

      {/* Standards Filter Chips */}
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

      {/* Action Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Control Action Bar with Add SKU button */}
      <View style={styles.controlBar}>
        <View>
          <Text style={styles.resultsCount}>
            {totalCount.toLocaleString()} Warehouse SKUs
          </Text>
          <Text style={styles.subCount}>Showing {products.length} live records</Text>
        </View>

        <TouchableOpacity
          style={styles.addSkuBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.addSkuBtnText}>➕ Add SKU</Text>
        </TouchableOpacity>
      </View>

      {/* Product List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Fetching warehouse catalog...</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Fasteners Found</Text>
          <Text style={styles.emptySubtitle}>Try clearing your search query or standard filter.</Text>
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedStandard('All'); }} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        products.map((product) => (
          <MobileCard key={product.id}>
            {/* Header: SKU & Status */}
            <View style={styles.rowBetween}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.skuText}>{product.sku}</Text>
                <Text style={styles.productName} numberOfLines={2}>
                  {product.name}
                </Text>
              </View>
              <MobileBadge
                label={product.isInStock ? 'IN STOCK' : 'OUT OF STOCK'}
                variant={product.isInStock ? 'success' : 'danger'}
                size="sm"
              />
            </View>

            {/* Technical Specs Tags */}
            <View style={styles.specsRow}>
              <View style={styles.specTag}>
                <Text style={styles.specTagLabel}>STD:</Text>
                <Text style={styles.specTagVal}>{product.standard || 'DIN 933'}</Text>
              </View>
              <View style={styles.specTag}>
                <Text style={styles.specTagLabel}>GR:</Text>
                <Text style={styles.specTagVal}>{product.grade || '8.8'}</Text>
              </View>
              <View style={styles.specTag}>
                <Text style={styles.specTagLabel}>SIZE:</Text>
                <Text style={styles.specTagVal}>{product.diameter}x{product.lengthMm}mm</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            {/* Inventory Count & Dual Rates */}
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.metaLabel}>Bin Stock</Text>
                <Text style={styles.stockVal}>
                  {(product.stockPcs || 0).toLocaleString()} Pcs
                </Text>
                <Text style={styles.stockKgVal}>
                  {(product.stockKg || 0).toLocaleString()} Kg
                </Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Base Rates</Text>
                <Text style={styles.priceVal}>₹{product.pricePerPiece} / Pc</Text>
                <Text style={styles.priceKgVal}>₹{product.pricePerKg} / Kg</Text>
              </View>
            </View>

            {/* CRUD Action Buttons: Edit & Delete */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                onPress={() => handlePromptDelete(product)}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenEdit(product)}
                style={styles.editBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.editBtnText}>✏ Edit Rates &amp; Stock</Text>
              </TouchableOpacity>
            </View>
          </MobileCard>
        ))
      )}

      {/* ====================================================================== */}
      {/* MODAL 1: CREATE PRODUCT (SKU)                                          */}
      {/* ====================================================================== */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add New Fastener SKU"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>
            Create a new industrial fastener record in MySQL &amp; ERPNext inventory.
          </Text>

          <Text style={styles.inputLabel}>Fastener SKU *</Text>
          <TextInput
            style={styles.textInput}
            value={newSku}
            onChangeText={setNewSku}
            placeholder="e.g. CBH-933-M12-50-BP"
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Product Full Name *</Text>
          <TextInput
            style={styles.textInput}
            value={newName}
            onChangeText={setNewName}
            placeholder="e.g. Hex Head Bolt DIN 933 M12x50 Grade 8.8"
          />

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Standard</Text>
              <TextInput
                style={styles.textInput}
                value={newStandard}
                onChangeText={setNewStandard}
                placeholder="DIN 933"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Grade</Text>
              <TextInput
                style={styles.textInput}
                value={newGrade}
                onChangeText={setNewGrade}
                placeholder="8.8 / 10.9 / SS 304"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Diameter</Text>
              <TextInput
                style={styles.textInput}
                value={newDiameter}
                onChangeText={setNewDiameter}
                placeholder="M10"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Length (mm)</Text>
              <TextInput
                style={styles.textInput}
                value={newLength}
                onChangeText={setNewLength}
                keyboardType="numeric"
                placeholder="50"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate (₹ / Pc)</Text>
              <TextInput
                style={styles.textInput}
                value={newPricePcs}
                onChangeText={setNewPricePcs}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Rate (₹ / Kg)</Text>
              <TextInput
                style={styles.textInput}
                value={newPriceKg}
                onChangeText={setNewPriceKg}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (Pcs)</Text>
              <TextInput
                style={styles.textInput}
                value={newStockPcs}
                onChangeText={setNewStockPcs}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Stock (Kg)</Text>
              <TextInput
                style={styles.textInput}
                value={newStockKg}
                onChangeText={setNewStockKg}
                keyboardType="numeric"
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreateProduct}
            style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Create &amp; Publish SKU →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* ====================================================================== */}
      {/* MODAL 2: UPDATE PRODUCT (EDIT)                                         */}
      {/* ====================================================================== */}
      {activeProduct ? (
        <MobileModal
          isOpen={isEditModalOpen}
          onClose={() => setIsEditModalOpen(false)}
          title={`Edit SKU: ${activeProduct.sku}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              Update physical bin stocks, grade, and rates in ERP database.
            </Text>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Bin Stock (Pcs)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(editStockPcs)}
                  onChangeText={(val) => setEditStockPcs(parseInt(val) || 0)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Bin Stock (Kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(editStockKg)}
                  onChangeText={(val) => setEditStockKg(parseFloat(val) || 0)}
                />
              </View>
            </View>

            <View style={styles.rowTwoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Rate (₹ / Pc)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(editPricePcs)}
                  onChangeText={(val) => setEditPricePcs(parseFloat(val) || 0)}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Rate (₹ / Kg)</Text>
                <TextInput
                  style={styles.textInput}
                  keyboardType="numeric"
                  value={String(editPriceKg)}
                  onChangeText={(val) => setEditPriceKg(parseFloat(val) || 0)}
                />
              </View>
            </View>

            <Text style={styles.inputLabel}>Material Grade</Text>
            <TextInput
              style={styles.textInput}
              value={editGrade}
              onChangeText={setEditGrade}
              placeholder="e.g. 8.8, 10.9, 12.9"
            />

            <TouchableOpacity
              onPress={handleSaveEdit}
              style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes &amp; Sync ERP →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* ====================================================================== */}
      {/* MODAL 3: DELETE PRODUCT CONFIRMATION                                   */}
      {/* ====================================================================== */}
      {productToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete SKU Confirmation"
        >
          <View style={styles.modalScroll}>
            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningIcon}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deleteWarningTitle}>Permanent Removal</Text>
                <Text style={styles.deleteWarningText}>
                  Are you sure you want to delete SKU <Text style={{ fontWeight: '800' }}>{productToDelete.sku}</Text> from the active inventory database?
                </Text>
              </View>
            </View>

            <Text style={styles.deleteItemMeta}>
              • Name: {productToDelete.name}{'\n'}
              • Standard: {productToDelete.standard} | Grade: {productToDelete.grade}{'\n'}
              • Current Bin Stock: {(productToDelete.stockPcs || 0).toLocaleString()} Pcs
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setIsDeleteModalOpen(false)}
                style={styles.cancelBtn}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, isSubmitting && styles.btnDisabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </MobileModal>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
    backgroundColor: '#F8FAFC',
    paddingBottom: 40,
  },
  chipsRow: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  subCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  addSkuBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  addSkuBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
    textAlign: 'center',
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skuText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0052CC',
    letterSpacing: 0.2,
  },
  productName: {
    fontSize: 13,
    color: '#0F172A',
    fontWeight: '600',
    marginTop: 2,
    lineHeight: 18,
  },
  specsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  specTag: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignItems: 'center',
    gap: 4,
  },
  specTagLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  specTagVal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  stockVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  stockKgVal: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  priceVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  priceKgVal: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    color: '#0052CC',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  modalScroll: {
    paddingVertical: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  saveBtn: {
    backgroundColor: '#0052CC',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  deleteWarningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  deleteWarningIcon: {
    fontSize: 18,
    color: '#DC2626',
  },
  deleteWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  deleteWarningText: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 17,
  },
  deleteItemMeta: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default AdminProductsScreen;
