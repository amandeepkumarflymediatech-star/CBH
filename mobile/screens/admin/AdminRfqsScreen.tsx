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
import { mobileApi } from '../../config/api';
import { MobileRfq } from '../../types';

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

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const statusLabel = (s: string) => {
  if (s === 'All') return 'All';
  if (s === 'CONVERTED_TO_PO') return 'In ERP as PO';
  const t = s.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// An RFQ moves through these stages; the tracker fills as it progresses
const STAGES = ['Pending', 'In review', 'Quoted', 'Approved', 'In ERP'];
const stageIndex = (status: string) => {
  switch (status) {
    case 'IN_REVIEW':
      return 1;
    case 'QUOTED':
      return 2;
    case 'APPROVED':
      return 3;
    case 'CONVERTED_TO_PO':
      return 4;
    default:
      return 0;
  }
};

export const AdminRfqsScreen: React.FC = () => {
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Quote review modal
  const [activeRfq, setActiveRfq] = useState<MobileRfq | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [discountPct, setDiscountPct] = useState<number>(18);
  const [quoteStatus, setQuoteStatus] = useState<MobileRfq['status']>('QUOTED');

  // Delete modal
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

  // UPDATE QUOTE
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
          r.id === activeRfq.id ? { ...r, status: quoteStatus, discountPct, netTotal: net } : r
        )
      );

      setIsQuoteModalOpen(false);
      showToast(`${activeRfq.rfqNumber} is now ${statusLabel(quoteStatus).toLowerCase()}`);
    } catch (err: any) {
      Alert.alert('Could not update quote', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleConvertToPo = async (rfq: MobileRfq) => {
    try {
      await mobileApi.rfq.convertToPo(rfq.id);
      setRfqs((prev) => prev.map((r) => (r.id === rfq.id ? { ...r, status: 'CONVERTED_TO_PO' } : r)));
      showToast(`${rfq.rfqNumber} pushed to ERPNext as a sales order`);
    } catch (err: any) {
      Alert.alert('Could not push to ERP', err.message || 'Try again.');
    }
  };

  // DELETE
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
      showToast(`${rfqToDelete.rfqNumber} deleted`);
      setRfqToDelete(null);
    } catch (err: any) {
      Alert.alert('Could not delete RFQ', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFilters = ['All', 'PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED'];

  const statusColor = (st: string) => {
    switch (st) {
      case 'APPROVED':
      case 'CONVERTED_TO_PO':
        return GREEN;
      case 'QUOTED':
        return ORANGE;
      case 'REJECTED':
        return RED;
      default:
        return STEEL;
    }
  };

  const modalGross = activeRfq ? activeRfq.grossAmount || 0 : 0;
  const modalNet = modalGross * (1 - discountPct / 100);

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchRfqs(true)} colors={[ORANGE]} />
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchWrap}>
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by RFQ number, client or GSTIN"
        />
      </View>

      {/* Status tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabsContent}
        style={styles.tabs}
      >
        {statusFilters.map((st) => {
          const active = selectedStatus === st;
          return (
            <TouchableOpacity
              key={st}
              onPress={() => setSelectedStatus(st)}
              style={[styles.tab, active && styles.tabActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.tabText, active && styles.tabTextActive]}>{statusLabel(st)}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Count */}
      <View style={styles.controlBar}>
        <Text style={styles.h2}>
          {isLoading ? 'Quotes' : `${rfqs.length} ${rfqs.length === 1 ? 'quote' : 'quotes'}`}
        </Text>
        <Text style={styles.subCount}>Pricing approval queue</Text>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={styles.centerBlock}>
          <ActivityIndicator size="large" color={ORANGE} />
          <Text style={styles.loadingText}>Loading quotes</Text>
        </View>
      ) : rfqs.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyTitle}>No RFQs found</Text>
          <Text style={styles.emptySubtitle}>No buyer requests match this search or filter.</Text>
          <TouchableOpacity
            onPress={() => {
              setSearchQuery('');
              setSelectedStatus('All');
            }}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Clear filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        rfqs.map((rfq) => {
          const idx = stageIndex(rfq.status);
          const rejected = rfq.status === 'REJECTED';
          const color = statusColor(rfq.status);
          const items = rfq.items || [];
          const net = rfq.netTotal || (rfq.grossAmount || 0) * (1 - (rfq.discountPct || 18) / 100);
          return (
            <View key={rfq.id} style={styles.rfq}>
              <View style={styles.rowBetween}>
                <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.statusText, { color }]}>{statusLabel(rfq.status)}</Text>
                </View>
              </View>
              <Text style={styles.company}>{rfq.companyName || 'Industrial Buyer'}</Text>
              <Text style={styles.meta}>
                {rfq.customerName || 'Procurement Officer'}, {rfq.phone || '+91 98880 21000'}
              </Text>

              {/* Stage tracker */}
              <View style={styles.tracker}>
                {STAGES.map((s, i) => (
                  <View
                    key={s}
                    style={[
                      styles.seg,
                      i <= idx && { backgroundColor: rejected ? RED : i === 2 && idx === 2 ? ORANGE : i === 4 ? GREEN : GRAPHITE },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.stageLabels}>
                {STAGES.map((s, i) => (
                  <Text key={s} style={[styles.stageLabel, i === idx && !rejected && styles.stageLabelOn]} numberOfLines={1}>
                    {s}
                  </Text>
                ))}
              </View>

              {/* Items */}
              <View style={styles.items}>
                {items.length > 0 ? (
                  items.slice(0, 3).map((item, i) => (
                    <View key={i} style={styles.itemRow}>
                      <Text style={styles.itemName} numberOfLines={1}>
                        {item.name || item.sku}
                      </Text>
                      <Text style={styles.itemQty}>
                        {item.quantity} {rfq.globalUnit || 'KGS'}
                      </Text>
                    </View>
                  ))
                ) : (
                  <Text style={styles.itemName}>Heavy structural fastener lot</Text>
                )}
                {items.length > 3 ? <Text style={styles.moreItems}>+ {items.length - 3} more</Text> : null}
              </View>

              {/* Money */}
              <View style={styles.moneyRow}>
                <View>
                  <Text style={styles.moneyLabel}>List value</Text>
                  <Text style={styles.moneyGross}>{inr(rfq.grossAmount || 0)}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.moneyLabel}>Discount</Text>
                  <Text style={styles.moneyDiscount}>{rfq.discountPct || 18}% off</Text>
                </View>
              </View>
              <View style={styles.netRow}>
                <Text style={styles.netLabel}>Quoted total</Text>
                <Text style={styles.netVal}>{inr(net)}</Text>
              </View>

              {/* Actions */}
              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handlePromptDelete(rfq)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
                <View style={styles.actionBtns}>
                  <TouchableOpacity onPress={() => handleOpenQuote(rfq)} style={styles.reviewBtn} activeOpacity={0.85}>
                    <Text style={styles.reviewBtnText}>Review and quote</Text>
                  </TouchableOpacity>
                  {rfq.status === 'APPROVED' ? (
                    <TouchableOpacity onPress={() => handleConvertToPo(rfq)} style={styles.poBtn} activeOpacity={0.88}>
                      <Text style={styles.poBtnText}>Push to ERP</Text>
                    </TouchableOpacity>
                  ) : null}
                </View>
              </View>
            </View>
          );
        })
      )}

      {/* Review and quote modal */}
      {activeRfq ? (
        <MobileModal
          isOpen={isQuoteModalOpen}
          onClose={() => setIsQuoteModalOpen(false)}
          title={`Review ${activeRfq.rfqNumber}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              Set the volume discount and status for {activeRfq.companyName}.
            </Text>

            <Text style={styles.inputLabel}>Discount (%)</Text>
            <TextInput
              style={styles.input}
              keyboardType="numeric"
              value={String(discountPct)}
              onChangeText={(val) => setDiscountPct(parseFloat(val) || 0)}
            />

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.chipRow}>
              {(['QUOTED', 'APPROVED', 'REJECTED'] as const).map((st) => {
                const active = quoteStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.chip, active && styles.chipActive]}
                    onPress={() => setQuoteStatus(st)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.chipText, active && styles.chipTextActive]}>{statusLabel(st)}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Live price breakdown */}
            <View style={styles.breakdown}>
              <View style={styles.kv}>
                <Text style={styles.k}>List value</Text>
                <Text style={styles.v}>{inr(modalGross)}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Discount ({discountPct}%)</Text>
                <Text style={[styles.v, { color: GREEN }]}>− {inr(modalGross - modalNet)}</Text>
              </View>
              <View style={[styles.kv, styles.kvTotal]}>
                <Text style={styles.totalK}>Offered to client</Text>
                <Text style={styles.totalV}>{inr(modalNet)}</Text>
              </View>
            </View>

            <TouchableOpacity
              onPress={handleApproveQuote}
              style={[styles.saveBtn, isSubmitting && styles.disabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Send quote</Text>}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* Delete modal */}
      {rfqToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete this RFQ?"
        >
          <View style={styles.modalScroll}>
            <Text style={styles.deleteLead}>
              {rfqToDelete.rfqNumber} will be permanently removed. This can’t be undone.
            </Text>

            <View style={styles.deleteTable}>
              <View style={[styles.kv, { borderTopWidth: 0 }]}>
                <Text style={styles.k}>Client</Text>
                <Text style={styles.v}>{rfqToDelete.companyName}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Status</Text>
                <Text style={styles.v}>{statusLabel(rfqToDelete.status)}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>List value</Text>
                <Text style={styles.v}>{inr(rfqToDelete.grossAmount || 0)}</Text>
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
                {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Delete RFQ</Text>}
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
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: MIST,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIR,
  },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  subCount: { fontSize: 12, color: STEEL },

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

  // One RFQ: a hairline-separated block, not a card
  rfq: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: HAIR },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rfqNumber: { fontSize: 15, fontWeight: '700', color: GRAPHITE, fontFamily: MONO },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  company: { fontSize: 15, fontWeight: '600', color: GRAPHITE, marginTop: 6 },
  meta: { fontSize: 13, color: STEEL, marginTop: 2 },

  tracker: { flexDirection: 'row', gap: 4, marginTop: 14 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: MIST },
  stageLabels: { flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 14 },
  stageLabel: { flex: 1, fontSize: 11, color: STEEL },
  stageLabelOn: { color: GRAPHITE, fontWeight: '700' },

  items: { paddingVertical: 12, borderTopWidth: 1, borderTopColor: MIST },
  itemRow: { flexDirection: 'row', justifyContent: 'space-between', gap: 12, paddingVertical: 3 },
  itemName: { flex: 1, fontSize: 13, color: GRAPHITE },
  itemQty: { fontSize: 13, color: STEEL, fontVariant: ['tabular-nums'] },
  moreItems: { fontSize: 12, color: STEEL, marginTop: 4 },

  moneyRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  moneyLabel: { fontSize: 12, color: STEEL },
  moneyGross: { fontSize: 15, fontWeight: '600', color: GRAPHITE, marginTop: 2, fontVariant: ['tabular-nums'] },
  moneyDiscount: { fontSize: 15, fontWeight: '700', color: ORANGE, marginTop: 2 },
  netRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline', marginTop: 12 },
  netLabel: { fontSize: 14, fontWeight: '700', color: GRAPHITE },
  netVal: { fontSize: 22, fontWeight: '800', color: GRAPHITE, fontVariant: ['tabular-nums'] },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  deleteLink: { fontSize: 14, fontWeight: '600', color: RED },
  actionBtns: { flexDirection: 'row', gap: 8 },
  reviewBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reviewBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },
  poBtn: {
    height: 44,
    paddingHorizontal: 18,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  poBtnText: { fontSize: 14, fontWeight: '700', color: WHITE },

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
  chipRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: WHITE,
  },
  chipActive: { backgroundColor: GRAPHITE, borderColor: GRAPHITE },
  chipText: { fontSize: 13, fontWeight: '600', color: GRAPHITE },
  chipTextActive: { color: WHITE },
  breakdown: { marginTop: 20 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  kvTotal: { borderTopColor: HAIR },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '600', color: GRAPHITE, flexShrink: 1, textAlign: 'right', marginLeft: 16, fontVariant: ['tabular-nums'] },
  totalK: { fontSize: 15, fontWeight: '700', color: GRAPHITE },
  totalV: { fontSize: 22, fontWeight: '800', color: GRAPHITE, fontVariant: ['tabular-nums'] },
  saveBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 10,
  },
  saveText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },

  // Delete
  deleteLead: { fontSize: 15, color: GRAPHITE, lineHeight: 22 },
  deleteTable: { marginTop: 12, marginBottom: 20 },
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

export default AdminRfqsScreen;