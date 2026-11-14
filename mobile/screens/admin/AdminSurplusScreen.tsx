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
import { OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileSurplusLot } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const AMBER = '#D97706';
const GREEN = '#16A34A';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

export const AdminSurplusScreen: React.FC = () => {
  const [lots, setLots] = useState<MobileSurplusLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedHub, setSelectedHub] = useState<string>('All');
  const [toastMsg, setToastMsg] = useState('');

  // Add / Edit Modal State
  const [isFormModalOpen, setIsFormModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [activeLotId, setActiveLotId] = useState<number | null>(null);

  // Form Fields
  const [lotSku, setLotSku] = useState('');
  const [lotName, setLotName] = useState('');
  const [lotStandard, setLotStandard] = useState('DIN 933');
  const [lotGrade, setLotGrade] = useState('8.8 HT');
  const [lotQtyPcs, setLotQtyPcs] = useState('10000');
  const [lotQtyKg, setLotQtyKg] = useState('750.0');
  const [lotRegularPrice, setLotRegularPrice] = useState('160.00');
  const [lotDiscountPct, setLotDiscountPct] = useState('35');
  const [lotHub, setLotHub] = useState('Bhiwandi Hub (MH)');
  const [lotIsActive, setLotIsActive] = useState(true);

  // Delete Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [lotToDelete, setLotToDelete] = useState<MobileSurplusLot | null>(null);

  const hubsList = [
    'All',
    'Bhiwandi Hub (MH)',
    'Ludhiana Central Works (PB)',
    'Chennai Port Depot (TN)',
    'NCR Stockyard (HR)',
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const loadSurplusLots = async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await mobileApi.surplus.getAll();
      if (res.surplus) {
        setLots(res.surplus);
      }
    } catch (err) {
      console.warn('[Admin Surplus] Load error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadSurplusLots();
  }, []);

  const handleOpenAdd = () => {
    setIsEditing(false);
    setActiveLotId(null);
    setLotSku(`LOT-${Date.now().toString().slice(-5)}`);
    setLotName('');
    setLotStandard('DIN 933');
    setLotGrade('8.8 HT');
    setLotQtyPcs('12000');
    setLotQtyKg('900.0');
    setLotRegularPrice('160.00');
    setLotDiscountPct('40');
    setLotHub('Bhiwandi Hub (MH)');
    setLotIsActive(true);
    setIsFormModalOpen(true);
  };

  const handleOpenEdit = (lot: MobileSurplusLot) => {
    setIsEditing(true);
    setActiveLotId(lot.id);
    setLotSku(lot.sku);
    setLotName(lot.name);
    setLotStandard(lot.standard || 'DIN 933');
    setLotGrade(lot.grade || '8.8 HT');
    setLotQtyPcs(String(lot.quantityPcs));
    setLotQtyKg(String(lot.weightKg));
    setLotRegularPrice(String(lot.regularPricePerKg));
    setLotDiscountPct(String(lot.discountPct));
    setLotHub(lot.warehouseHub || 'Bhiwandi Hub (MH)');
    setLotIsActive(lot.status === 'ACTIVE');
    setIsFormModalOpen(true);
  };

  const handleSaveForm = async () => {
    if (!lotName.trim() || !lotSku.trim()) {
      Alert.alert('Missing details', 'Please enter lot SKU and product description.');
      return;
    }

    setIsSubmitting(true);
    try {
      const reg = parseFloat(lotRegularPrice) || 160;
      const disc = parseInt(lotDiscountPct) || 35;
      const clearance = +(reg * (1 - disc / 100)).toFixed(2);

      const payload: Partial<MobileSurplusLot> = {
        sku: lotSku.trim().toUpperCase(),
        name: lotName.trim(),
        standard: lotStandard,
        grade: lotGrade,
        quantityPcs: parseInt(lotQtyPcs) || 10000,
        weightKg: parseFloat(lotQtyKg) || 500,
        regularPricePerKg: reg,
        clearancePricePerKg: clearance,
        discountPct: disc,
        warehouseHub: lotHub,
        status: lotIsActive ? 'ACTIVE' : 'RESERVED',
      };

      if (isEditing && activeLotId) {
        await mobileApi.surplus.update({ ...payload, id: activeLotId });
        setLots((prev) =>
          prev.map((l) => (l.id === activeLotId ? { ...l, ...payload } : l))
        );
        showToast(`${payload.sku} updated`);
      } else {
        const res = await mobileApi.surplus.create(payload);
        const createdLot = res.lot || {
          ...payload,
          id: res.id || Date.now(),
        } as MobileSurplusLot;
        setLots((prev) => [createdLot, ...prev]);
        showToast(`${payload.sku} added to clearance`);
      }

      setIsFormModalOpen(false);
    } catch (err: any) {
      Alert.alert('Save failed', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (lot: MobileSurplusLot) => {
    const nextStatus = lot.status === 'ACTIVE' ? 'RESERVED' : 'ACTIVE';
    try {
      await mobileApi.surplus.update({ id: lot.id, status: nextStatus });
      setLots((prev) =>
        prev.map((l) => (l.id === lot.id ? { ...l, status: nextStatus } : l))
      );
      showToast(`${lot.sku} set to ${nextStatus}`);
    } catch {
      Alert.alert('Could not toggle status');
    }
  };

  const handlePromptDelete = (lot: MobileSurplusLot) => {
    setLotToDelete(lot);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!lotToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.surplus.delete(lotToDelete.id);
      setLots((prev) => prev.filter((l) => l.id !== lotToDelete.id));
      setIsDeleteModalOpen(false);
      showToast(`${lotToDelete.sku} removed`);
      setLotToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete failed', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLots = lots.filter((lot) => {
    const matchesHub = selectedHub === 'All' || lot.warehouseHub?.includes(selectedHub.split(' ')[0]);
    const matchesSearch =
      !searchQuery.trim() ||
      lot.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.standard && lot.standard.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesHub && matchesSearch;
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Header & Search Bar */}
      <View style={styles.topHeader}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search Lot SKU or Standard..."
            />
          </View>
          <TouchableOpacity style={styles.addBtn} onPress={handleOpenAdd} activeOpacity={0.85}>
            <Text style={styles.addBtnText}>+ New Lot</Text>
          </TouchableOpacity>
        </View>

        {/* Hub Filter Tabs */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.hubScroll}
          style={styles.hubBar}
        >
          {hubsList.map((h) => {
            const active = selectedHub === h;
            return (
              <TouchableOpacity
                key={h}
                onPress={() => setSelectedHub(h)}
                style={[styles.hubPill, active && styles.hubPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.hubPillText, active && styles.hubPillTextActive]}>
                  {h.split(' ')[0]}
                </Text>
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

      {/* High Density Surplus Lots List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => loadSurplusLots(true)} colors={[BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>{filteredLots.length} Clearance Deals Active</Text>
        </View>

        {isLoading ? (
          <View style={{ gap: 8 }}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : filteredLots.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No surplus lots match criteria</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedHub('All');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredLots.map((lot) => {
            const isActive = lot.status === 'ACTIVE';
            return (
              <View key={lot.id} style={styles.lotCard}>
                {/* Row 1: Lot SKU, Spec Badge, Discount Pill */}
                <View style={styles.cardHeaderRow}>
                  <View style={styles.skuBox}>
                    <Text style={styles.lotSku}>{lot.sku}</Text>
                    <View style={styles.specBadge}>
                      <Text style={styles.specBadgeText}>
                        {lot.standard || 'DIN 933'} • {lot.grade || '8.8'}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.discountPill}>
                    <Text style={styles.discountPillText}>{lot.discountPct}% OFF</Text>
                  </View>
                </View>

                {/* Row 2: Lot Name & Weight */}
                <View style={styles.cardBodyRow}>
                  <Text style={styles.lotName} numberOfLines={1}>
                    {lot.name}
                  </Text>
                  <Text style={styles.stockKg}>{lot.weightKg || 0} kg</Text>
                </View>

                {/* Row 3: Pricing, Hub & Quick Actions */}
                <View style={styles.cardFooterRow}>
                  <View style={styles.priceGroup}>
                    <Text style={styles.dealPrice}>₹{lot.clearancePricePerKg}/kg</Text>
                    <Text style={styles.strikePrice}>₹{lot.regularPricePerKg}</Text>
                    <Text style={styles.hubLabel}>• {lot.warehouseHub?.split(' ')[0]}</Text>
                  </View>

                  <View style={styles.actionGroup}>
                    <TouchableOpacity
                      onPress={() => handleToggleStatus(lot)}
                      style={[styles.statusToggleBtn, isActive ? styles.toggleActive : styles.togglePaused]}
                    >
                      <Text style={[styles.toggleText, { color: isActive ? GREEN : STEEL }]}>
                        {isActive ? 'Active' : 'Paused'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handleOpenEdit(lot)}
                      style={styles.editBtn}
                    >
                      <Text style={styles.editBtnText}>Edit</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => handlePromptDelete(lot)}
                      style={styles.deleteBtn}
                    >
                      <Text style={styles.deleteBtnText}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            );
          })
        )}
      </ScrollView>

      {/* Add / Edit Modal */}
      <MobileModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? `Edit ${lotSku}` : 'Register Surplus Lot'}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Lot SKU *</Text>
          <TextInput
            style={[styles.input, { fontFamily: MONO }]}
            value={lotSku}
            onChangeText={setLotSku}
            autoCapitalize="characters"
          />

          <Text style={styles.inputLabel}>Fastener Spec Description *</Text>
          <TextInput
            style={styles.input}
            value={lotName}
            onChangeText={setLotName}
            placeholder="Hex Screws DIN 933 M12x60mm Gr 8.8"
          />

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Standard</Text>
              <TextInput style={styles.input} value={lotStandard} onChangeText={setLotStandard} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Grade</Text>
              <TextInput style={styles.input} value={lotGrade} onChangeText={setLotGrade} />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Weight (Kg)</Text>
              <TextInput style={styles.input} value={lotQtyKg} onChangeText={setLotQtyKg} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Count (Pcs)</Text>
              <TextInput style={styles.input} value={lotQtyPcs} onChangeText={setLotQtyPcs} keyboardType="numeric" />
            </View>
          </View>

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Regular / Kg (₹)</Text>
              <TextInput style={styles.input} value={lotRegularPrice} onChangeText={setLotRegularPrice} keyboardType="numeric" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Discount (%)</Text>
              <TextInput style={styles.input} value={lotDiscountPct} onChangeText={setLotDiscountPct} keyboardType="numeric" />
            </View>
          </View>

          <Text style={styles.inputLabel}>Depot Warehouse Hub</Text>
          <TextInput style={styles.input} value={lotHub} onChangeText={setLotHub} />

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveForm}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Saving...' : 'Save Surplus Deal'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Remove Surplus Deal"
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: STEEL, marginBottom: 14 }}>
            Delete surplus lot <Text style={{ fontWeight: '800', color: GRAPHITE }}>{lotToDelete?.sku}</Text>?
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
    backgroundColor: AMBER,
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
  hubBar: {
    marginTop: 2,
  },
  hubScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  hubPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  hubPillActive: {
    backgroundColor: GRAPHITE,
    borderColor: GRAPHITE,
  },
  hubPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  hubPillTextActive: {
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
  lotCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  skuBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  lotSku: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
  },
  specBadge: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 1,
    paddingHorizontal: 5,
    borderRadius: 4,
  },
  specBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: BLUE,
  },
  discountPill: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  discountPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: AMBER,
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  lotName: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAPHITE,
    flex: 1,
    paddingRight: 8,
  },
  stockKg: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: STEEL,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  priceGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dealPrice: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: GREEN,
  },
  strikePrice: {
    fontSize: 10,
    fontFamily: MONO,
    color: LIGHT_STEEL,
    textDecorationLine: 'line-through',
  },
  hubLabel: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  actionGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  statusToggleBtn: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  toggleActive: {
    backgroundColor: '#DCFCE7',
  },
  togglePaused: {
    backgroundColor: '#F1F5F9',
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '700',
  },
  editBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 7,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  editBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: GRAPHITE,
  },
  deleteBtn: {
    paddingHorizontal: 4,
  },
  deleteBtnText: {
    fontSize: 12,
    color: RED,
    fontWeight: '700',
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
    backgroundColor: AMBER,
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
