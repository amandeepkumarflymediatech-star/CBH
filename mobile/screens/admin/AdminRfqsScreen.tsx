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
import { MobileRfq } from '../../types';

export const AdminRfqsScreen: React.FC = () => {
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quote Review Modal
  const [activeRfq, setActiveRfq] = useState<MobileRfq | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [discountPct, setDiscountPct] = useState<number>(18);
  const [quoteStatus, setQuoteStatus] = useState<MobileRfq['status']>('QUOTED');

  // Delete RFQ Modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [rfqToDelete, setRfqToDelete] = useState<MobileRfq | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchRfqs = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.rfq.getAll({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchQuery.trim() || undefined,
      });
      if (res.quotes) setRfqs(res.quotes);
    } catch (err) {
      console.warn('[Admin RFQs] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [selectedStatus, searchQuery]);

  // ============================================================================
  // CRUD: UPDATE QUOTE
  // ============================================================================
  const handleOpenQuote = (rfq: MobileRfq) => {
    setActiveRfq(rfq);
    setDiscountPct(rfq.discountPct || 18);
    setQuoteStatus('QUOTED');
    setIsQuoteModalOpen(true);
  };

  const handleApproveQuote = async () => {
    if (!activeRfq) return;
    setIsSubmitting(true);
    try {
      const net = +(activeRfq.grossAmount * (1 - discountPct / 100)).toFixed(2);
      await mobileApi.rfq.updateStatus({
        id: activeRfq.id,
        status: quoteStatus,
        discountPct,
      });

      setRfqs((prev) =>
        prev.map((r) =>
          r.id === activeRfq.id
            ? { ...r, status: quoteStatus, discountPct, netTotal: net }
            : r
        )
      );

      setIsQuoteModalOpen(false);
      showToast(`Quotation #${activeRfq.rfqNumber} updated to ${quoteStatus}!`);
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Quotation update failed');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToPo = async (rfq: MobileRfq) => {
    try {
      await mobileApi.rfq.convertToPo(rfq.id);
      setRfqs((prev) =>
        prev.map((r) => (r.id === rfq.id ? { ...r, status: 'CONVERTED_TO_PO' } : r))
      );
      showToast(`RFQ #${rfq.rfqNumber} converted to Sales Order in ERPNext!`);
    } catch (err: any) {
      Alert.alert('Conversion Error', err.message || 'ERP conversion failed');
    }
  };

  // ============================================================================
  // CRUD: DELETE
  // ============================================================================
  const handlePromptDelete = (rfq: MobileRfq) => {
    setRfqToDelete(rfq);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!rfqToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.rfq.delete(rfqToDelete.id);
      setRfqs((prev) => prev.filter((r) => r.id !== rfqToDelete.id));
      setIsDeleteModalOpen(false);
      showToast(`RFQ #${rfqToDelete.rfqNumber} removed from database.`);
      setRfqToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete RFQ.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFilters = ['All', 'PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED'];

  const getStatusVariant = (st: string) => {
    switch (st) {
      case 'APPROVED':
      case 'CONVERTED_TO_PO':
        return 'success';
      case 'QUOTED':
        return 'primary';
      case 'IN_REVIEW':
      case 'PENDING':
        return 'warning';
      case 'REJECTED':
        return 'danger';
      default:
        return 'neutral';
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchRfqs(true)}
          colors={['#0052CC']}
        />
      }
    >
      {/* Search Bar */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search RFQ #, Enterprise Client, GSTIN..."
      />

      {/* Status Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.chipsRow}>
        {statusFilters.map((st) => {
          const isActive = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              onPress={() => setSelectedStatus(st)}
              style={[styles.chip, isActive ? styles.chipActive : styles.chipInactive]}
            >
              <Text style={[styles.chipText, isActive ? styles.chipTextActive : null]}>
                {st}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Header Info */}
      <View style={styles.controlBar}>
        <Text style={styles.resultsCount}>{rfqs.length} Procurement Quotations</Text>
        <Text style={styles.subCount}>Real-time slab pricing approval queue</Text>
      </View>

      {/* RFQ List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading quotation inquiries...</Text>
        </View>
      ) : rfqs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No RFQs Found</Text>
          <Text style={styles.emptySubtitle}>No buyer requests match your search or filter.</Text>
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedStatus('All'); }} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        rfqs.map((rfq) => (
          <MobileCard key={rfq.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
                <Text style={styles.companyName}>{rfq.companyName || 'Industrial Buyer'}</Text>
              </View>
              <MobileBadge
                label={rfq.status}
                variant={getStatusVariant(rfq.status) as any}
                size="sm"
              />
            </View>

            <Text style={styles.contactText}>
              👤 {rfq.customerName || 'Procurement Officer'} • 📞 {rfq.phone || '+91 98880 21000'}
            </Text>

            {/* Items Summary */}
            <View style={styles.itemsBox}>
              <Text style={styles.itemsHeader}>Quotation Items Breakdown:</Text>
              {rfq.items && rfq.items.length > 0 ? (
                rfq.items.slice(0, 3).map((item, idx) => (
                  <Text key={idx} style={styles.itemRow} numberOfLines={1}>
                    • {item.name || item.sku} ({item.quantity} {rfq.globalUnit || 'KGS'})
                  </Text>
                ))
              ) : (
                <Text style={styles.itemRow}>• Heavy Structural Fastener Lot</Text>
              )}
            </View>

            {/* Financial Overview */}
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.metaLabel}>Gross Catalogue Value</Text>
                <Text style={styles.grossVal}>₹{(rfq.grossAmount || 0).toLocaleString()}</Text>
              </View>

              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.metaLabel}>Approved Slab Discount</Text>
                <Text style={styles.discountVal}>{rfq.discountPct || 18}% OFF</Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.rowBetween}>
              <Text style={styles.netLabel}>Net Quotation Total</Text>
              <Text style={styles.netVal}>
                ₹{(rfq.netTotal || rfq.grossAmount * (1 - (rfq.discountPct || 18) / 100)).toLocaleString()}
              </Text>
            </View>

            {/* CRUD Action Buttons: Delete, Review Quote, and Convert to PO */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                onPress={() => handlePromptDelete(rfq)}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenQuote(rfq)}
                style={styles.reviewBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.reviewBtnText}>📝 Review &amp; Quote</Text>
              </TouchableOpacity>

              {rfq.status === 'APPROVED' ? (
                <TouchableOpacity
                  onPress={() => handleConvertToPo(rfq)}
                  style={styles.poBtn}
                  activeOpacity={0.85}
                >
                  <Text style={styles.poBtnText}>⚡ Push to ERP</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          </MobileCard>
        ))
      )}

      {/* ====================================================================== */}
      {/* MODAL 1: REVIEW & QUOTE                                                */}
      {/* ====================================================================== */}
      {activeRfq ? (
        <MobileModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          title={`Review RFQ: ${activeRfq.rfqNumber}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              Set approved commercial volume discount for {activeRfq.companyName}.
            </Text>

            <Text style={styles.inputLabel}>Gross Catalogue Value</Text>
            <Text style={styles.previewGross}>₹{activeRfq.grossAmount.toLocaleString()}</Text>

            <Text style={styles.inputLabel}>Commercial Slab Discount (%)</Text>
            <TextInput
              style={styles.textInput}
              keyboardType="numeric"
              value={String(discountPct)}
              onChangeText={(val) => setDiscountPct(parseFloat(val) || 0)}
            />

            <Text style={styles.inputLabel}>Quotation Status</Text>
            <View style={styles.statusRow}>
              {(['QUOTED', 'APPROVED', 'REJECTED'] as const).map((st) => (
                <TouchableOpacity
                  key={st}
                  style={[styles.statusBtn, quoteStatus === st && styles.statusBtnActive]}
                  onPress={() => setQuoteStatus(st)}
                >
                  <Text
                    style={[
                      styles.statusBtnText,
                      quoteStatus === st && styles.statusBtnTextActive,
                    ]}
                  >
                    {st}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.calculatedBox}>
              <Text style={styles.calculatedLabel}>Net Quotation Offered to Client:</Text>
              <Text style={styles.calculatedVal}>
                ₹{(activeRfq.grossAmount * (1 - discountPct / 100)).toLocaleString()}
              </Text>
            </View>

            <TouchableOpacity
              onPress={handleApproveQuote}
              style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Broadcast Formal Quote →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* ====================================================================== */}
      {/* MODAL 2: DELETE RFQ CONFIRMATION                                       */}
      {/* ====================================================================== */}
      {rfqToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Quotation Confirmation"
        >
          <View style={styles.modalScroll}>
            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningIcon}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deleteWarningTitle}>Quotation Record Removal</Text>
                <Text style={styles.deleteWarningText}>
                  Are you sure you want to delete RFQ <Text style={{ fontWeight: '800' }}>#{rfqToDelete.rfqNumber}</Text>?
                </Text>
              </View>
            </View>

            <Text style={styles.deleteItemMeta}>
              • Client: {rfqToDelete.companyName}{'\n'}
              • Status: {rfqToDelete.status}{'\n'}
              • Value: ₹{(rfqToDelete.grossAmount || 0).toLocaleString()}
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
  rfqNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052CC',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
  },
  itemsBox: {
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 6,
    marginVertical: 8,
  },
  itemsHeader: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  itemRow: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 16,
  },
  metaLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  grossVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  discountVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#D97706',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  netLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  netVal: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  reviewBtn: {
    flex: 1,
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  reviewBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  poBtn: {
    backgroundColor: '#059669',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  poBtnText: {
    color: '#FFFFFF',
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
  previewGross: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  statusRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  statusBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
  statusBtnActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  statusBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusBtnTextActive: {
    color: '#FFFFFF',
  },
  calculatedBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 12,
    marginTop: 14,
    alignItems: 'center',
  },
  calculatedLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#065F46',
  },
  calculatedVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#059669',
    marginTop: 2,
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

export default AdminRfqsScreen;
