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
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileSurplusLot } from '../../types';

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

  // Form Fields (100% all inputs)
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
    setLotStandard(lot.standard);
    setLotGrade(lot.grade);
    setLotQtyPcs(String(lot.excessQtyPcs || 0));
    setLotQtyKg(String(lot.excessQtyKg || 0));
    setLotRegularPrice(String(lot.regularPriceKg || 0));
    setLotDiscountPct(String(lot.clearanceDiscountPct || 0));
    setLotHub(lot.locationHub || 'Bhiwandi Hub (MH)');
    setLotIsActive(Boolean(lot.isActive));
    setIsFormModalOpen(true);
  };

  const handleSaveLot = async () => {
    if (!lotSku.trim() || !lotName.trim() || !lotRegularPrice.trim()) {
      Alert.alert('Validation Error', 'SKU, Title, and Regular Price/Kg are required.');
      return;
    }

    setIsSubmitting(true);
    const regPrice = parseFloat(lotRegularPrice) || 160;
    const discount = parseFloat(lotDiscountPct) || 35;
    const clearancePrice = +(regPrice * (1 - discount / 100)).toFixed(2);

    const payload: Partial<MobileSurplusLot> = {
      sku: lotSku.trim().toUpperCase(),
      name: lotName.trim(),
      standard: lotStandard,
      grade: lotGrade,
      excessQtyPcs: parseInt(lotQtyPcs) || 10000,
      excessQtyKg: parseFloat(lotQtyKg) || 750.0,
      regularPriceKg: regPrice,
      clearanceDiscountPct: discount,
      clearancePriceKg: clearancePrice,
      locationHub: lotHub,
      isActive: lotIsActive,
    };

    try {
      if (isEditing && activeLotId) {
        await mobileApi.surplus.update({ id: activeLotId, ...payload });
        setLots((prev) =>
          prev.map((l) => (l.id === activeLotId ? ({ ...l, ...payload } as MobileSurplusLot) : l))
        );
        showToast(`Surplus Lot ${payload.sku} updated!`);
      } else {
        const res = await mobileApi.surplus.create(payload);
        const created: MobileSurplusLot = res.data || {
          id: Date.now(),
          ...payload,
        } as MobileSurplusLot;
        setLots((prev) => [created, ...prev]);
        showToast(`Surplus Lot ${payload.sku} listed for liquidation!`);
      }
      setIsFormModalOpen(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Operation failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!lotToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.surplus.delete(lotToDelete.id);
      setLots((prev) => prev.filter((l) => l.id !== lotToDelete.id));
      setIsDeleteModalOpen(false);
      showToast(`Lot ${lotToDelete.sku} removed from clearance.`);
      setLotToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete lot');
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredLots = lots.filter((lot) => {
    const matchSearch =
      !searchQuery.trim() ||
      lot.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lot.standard.toLowerCase().includes(searchQuery.toLowerCase());
    const matchHub = selectedHub === 'All' || lot.locationHub === selectedHub;
    return matchSearch && matchHub;
  });

  const clearancePricePreview = +(
    (parseFloat(lotRegularPrice) || 0) *
    (1 - (parseFloat(lotDiscountPct) || 0) / 100)
  ).toFixed(2);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => loadSurplusLots(true)}
          colors={['#0052CC']}
        />
      }
    >
      {/* Top Liquidation Telemetry Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerHeader}>
          <Text style={styles.bannerTitle}>FACTORY SURPLUS LIQUIDATION</Text>
          <View style={styles.badgeClearance}>
            <Text style={styles.badgeText}>UP TO 50% OFF</Text>
          </View>
        </View>
        <Text style={styles.bannerSubtitle}>
          Excess mill inventory lots ready for immediate dispatch from central hubs.
        </Text>
      </View>

      {/* Action Header */}
      <View style={styles.rowBetween}>
        <Text style={styles.countText}>{filteredLots.length} Clearance Lots Active</Text>
        <TouchableOpacity onPress={handleOpenAdd} style={styles.addBtn} activeOpacity={0.8}>
          <Text style={styles.addBtnText}>➕ New Surplus Lot</Text>
        </TouchableOpacity>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Search */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Lot #, standard, or size..."
      />

      {/* Hub Filter Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {hubsList.map((hub) => {
          const active = selectedHub === hub;
          return (
            <TouchableOpacity
              key={hub}
              onPress={() => setSelectedHub(hub)}
              style={[styles.chip, active && styles.chipActive]}
            >
              <Text style={[styles.chipText, active && styles.chipTextActive]}>{hub}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Surplus Lot Cards */}
      {filteredLots.map((lot) => (
        <MobileCard key={lot.id}>
          <View style={styles.rowBetween}>
            <View style={styles.rowInline}>
              <Text style={styles.lotSku}>{lot.sku}</Text>
              <MobileBadge label={`-${lot.clearanceDiscountPct}%`} variant="warning" size="sm" />
            </View>
            <MobileBadge
              label={lot.isActive ? 'AVAILABLE' : 'DELISTED'}
              variant={lot.isActive ? 'success' : 'neutral'}
              size="sm"
            />
          </View>

          <Text style={styles.lotName}>{lot.name}</Text>

          <View style={styles.specsRow}>
            <Text style={styles.specItem}>📐 {lot.standard}</Text>
            <Text style={styles.specItem}>🔬 {lot.grade}</Text>
            <Text style={styles.specItem}>📍 {lot.locationHub}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.pricingRow}>
            <View>
              <Text style={styles.priceLabel}>Excess Quantity</Text>
              <Text style={styles.qtyVal}>
                {(lot.excessQtyKg || 0).toLocaleString()} Kg (
                {(lot.excessQtyPcs || 0).toLocaleString()} Pcs)
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.priceLabel}>Clearance Rate</Text>
              <View style={styles.rowInline}>
                <Text style={styles.origPrice}>₹{lot.regularPriceKg}/kg</Text>
                <Text style={styles.clearancePrice}>₹{lot.clearancePriceKg}/kg</Text>
              </View>
            </View>
          </View>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={() => handleOpenEdit(lot)}
              style={styles.editBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.editBtnText}>✏ Edit Lot Parameters</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setLotToDelete(lot);
                setIsDeleteModalOpen(true);
              }}
              style={styles.deleteBtn}
              activeOpacity={0.8}
            >
              <Text style={styles.deleteBtnText}>🗑</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}

      {/* ================================================================ */}
      {/* ADD / EDIT SURPLUS MODAL (100% All Inputs)                        */}
      {/* ================================================================ */}
      <MobileModal
        isOpen={isFormModalOpen}
        onClose={() => setIsFormModalOpen(false)}
        title={isEditing ? `Edit Surplus Lot: ${lotSku}` : '➕ List New Surplus Lot'}
      >
        <ScrollView style={styles.modalScroll}>
          <Text style={styles.fieldLabel}>Lot Number / SKU *</Text>
          <TextInput
            style={styles.input}
            value={lotSku}
            onChangeText={setLotSku}
            placeholder="e.g. SURPLUS-DIN933-M12-90"
          />

          <Text style={styles.fieldLabel}>Lot Title / Description *</Text>
          <TextInput
            style={styles.input}
            value={lotName}
            onChangeText={setLotName}
            placeholder="e.g. Hex Screws DIN 933 M12x90 Grade 8.8 Galvanized"
          />

          <View style={styles.formSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Standard</Text>
              <TextInput
                style={styles.input}
                value={lotStandard}
                onChangeText={setLotStandard}
                placeholder="DIN 933"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Grade</Text>
              <TextInput
                style={styles.input}
                value={lotGrade}
                onChangeText={setLotGrade}
                placeholder="8.8 HT"
              />
            </View>
          </View>

          <View style={styles.formSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Excess Qty (Pcs)</Text>
              <TextInput
                style={styles.input}
                value={lotQtyPcs}
                onChangeText={setLotQtyPcs}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Excess Qty (Kg)</Text>
              <TextInput
                style={styles.input}
                value={lotQtyKg}
                onChangeText={setLotQtyKg}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.formSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Regular Price/Kg (₹) *</Text>
              <TextInput
                style={styles.input}
                value={lotRegularPrice}
                onChangeText={setLotRegularPrice}
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Discount %</Text>
              <TextInput
                style={styles.input}
                value={lotDiscountPct}
                onChangeText={setLotDiscountPct}
                keyboardType="numeric"
              />
            </View>
          </View>

          <View style={styles.previewBox}>
            <Text style={styles.previewLabel}>Calculated Clearance Rate:</Text>
            <Text style={styles.previewVal}>₹{clearancePricePreview} / Kg</Text>
          </View>

          <Text style={styles.fieldLabel}>Stockyard Hub Location</Text>
          <TextInput
            style={styles.input}
            value={lotHub}
            onChangeText={setLotHub}
            placeholder="Bhiwandi Hub (MH)"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Available for Public Liquidation</Text>
            <TouchableOpacity
              onPress={() => setLotIsActive(!lotIsActive)}
              style={[styles.toggleBtn, lotIsActive && styles.toggleBtnActive]}
            >
              <Text style={styles.toggleText}>{lotIsActive ? 'ACTIVE' : 'DELISTED'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleSaveLot}
            disabled={isSubmitting}
            style={styles.modalSubmitBtn}
          >
            <Text style={styles.modalSubmitText}>
              {isSubmitting ? 'Saving Lot...' : isEditing ? 'Save Lot Changes' : 'Open Surplus Lot'}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* DELETE CONFIRMATION MODAL */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Confirm Surplus Lot Delisting"
      >
        <View style={{ padding: 6, gap: 12 }}>
          <Text style={styles.deleteWarning}>
            Are you sure you want to permanently remove Surplus Lot{' '}
            <Text style={{ fontWeight: '800' }}>{lotToDelete?.sku}</Text> from liquidation?
          </Text>
          <View style={styles.rowBetween}>
            <TouchableOpacity
              onPress={() => setIsDeleteModalOpen(false)}
              style={styles.cancelBtn}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleConfirmDelete}
              disabled={isSubmitting}
              style={styles.confirmDeleteBtn}
            >
              <Text style={styles.confirmDeleteText}>
                {isSubmitting ? 'Delisting...' : 'Yes, Delete Lot'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </MobileModal>
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
  banner: {
    backgroundColor: '#991B1B',
    borderRadius: 14,
    padding: 16,
  },
  bannerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FEE2E2',
    letterSpacing: 0.5,
  },
  badgeClearance: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#991B1B',
  },
  bannerSubtitle: {
    fontSize: 11,
    color: '#FFFFFF',
    fontWeight: '500',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rowInline: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  addBtn: {
    backgroundColor: '#991B1B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
  },
  addBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  chipsRow: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: '#991B1B',
    borderColor: '#991B1B',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  lotSku: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  lotName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#334155',
    marginTop: 4,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 6,
  },
  specItem: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  pricingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  priceLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  qtyVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 2,
  },
  origPrice: {
    fontSize: 11,
    color: '#94A3B8',
    textDecorationLine: 'line-through',
  },
  clearancePrice: {
    fontSize: 14,
    fontWeight: '900',
    color: '#991B1B',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  editBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  deleteBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteBtnText: {
    fontSize: 13,
  },
  modalScroll: {
    maxHeight: 480,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  formSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  previewBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 8,
    padding: 10,
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  previewLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#991B1B',
  },
  previewVal: {
    fontSize: 14,
    fontWeight: '900',
    color: '#991B1B',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  toggleBtn: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  modalSubmitBtn: {
    backgroundColor: '#991B1B',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 14,
    marginBottom: 10,
  },
  modalSubmitText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  deleteWarning: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  cancelBtn: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  cancelBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '700',
  },
  confirmDeleteBtn: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  confirmDeleteText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
});
