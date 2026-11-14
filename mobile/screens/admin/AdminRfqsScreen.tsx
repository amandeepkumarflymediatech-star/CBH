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
import { MobileRfq } from '../../types';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const ORANGE = '#D97706';
const GREEN = '#16A34A';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;
const statusLabel = (s: string) => {
  if (s === 'All') return 'All';
  if (s === 'CONVERTED_TO_PO') return 'PO Issued';
  const t = s.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

const RFQ_STATUSES = ['All', 'PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED'];

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

  // REVIEW QUOTE
  const handleOpenReview = (rfq: MobileRfq) => {
    setActiveRfq(rfq);
    setDiscountPct(rfq.status === 'QUOTED' ? 22 : 18);
    setQuoteStatus(rfq.status === 'PENDING' ? 'IN_REVIEW' : rfq.status);
    setIsQuoteModalOpen(true);
  };

  const handleSaveQuote = async () => {
    if (!activeRfq) return;
    setIsSubmitting(true);
    try {
      const calculatedTotal = (activeRfq.estimatedValue || 45000) * (1 - discountPct / 100);

      await mobileApi.rfq.update({
        id: activeRfq.id,
        status: quoteStatus,
        discountPct,
        quotedAmount: Math.round(calculatedTotal),
      });

      setRfqs((prev) =>
        prev.map((r) =>
          r.id === activeRfq.id
            ? {
                ...r,
                status: quoteStatus,
                quotedAmount: Math.round(calculatedTotal),
              }
            : r
        )
      );

      setIsQuoteModalOpen(false);
      showToast(`${activeRfq.rfqNumber} updated to ${statusLabel(quoteStatus)}`);
    } catch (err: any) {
      Alert.alert('Could not update quote', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
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

  const rfqColor = (s: string) => {
    switch (s) {
      case 'APPROVED':
      case 'CONVERTED_TO_PO':
        return GREEN;
      case 'QUOTED':
        return BLUE;
      case 'IN_REVIEW':
        return STEEL;
      default:
        return ORANGE;
    }
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Header & Search Bar */}
      <View style={styles.topHeader}>
        <View style={styles.searchRow}>
          <View style={{ flex: 1 }}>
            <MobileSearch
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search RFQ # or Client..."
            />
          </View>
        </View>

        {/* Status Filter Horizontal Strip */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.statusScroll}
          style={styles.statusBar}
        >
          {RFQ_STATUSES.map((st) => {
            const active = selectedStatus === st;
            return (
              <TouchableOpacity
                key={st}
                onPress={() => setSelectedStatus(st)}
                style={[styles.statusPill, active && styles.statusPillActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.statusPillText, active && styles.statusPillTextActive]}>
                  {statusLabel(st)}
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

      {/* High Density RFQ List */}
      <ScrollView
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchRfqs(true)} colors={[BLUE]} />
        }
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.countRow}>
          <Text style={styles.countText}>{rfqs.length} Quotes on record</Text>
        </View>

        {isLoading ? (
          <View style={{ gap: 8 }}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : rfqs.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyTitle}>No matching RFQs</Text>
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSelectedStatus('All');
              }}
              style={styles.resetBtn}
            >
              <Text style={styles.resetBtnText}>Clear Filters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          rfqs.map((rfq) => (
            <View key={rfq.id} style={styles.rfqCard}>
              {/* Row 1: RFQ Code, Date, Status */}
              <View style={styles.cardHeaderRow}>
                <View style={styles.rfqIdGroup}>
                  <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
                  <Text style={styles.rfqDate}>{rfq.date || rfq.createdAt?.split('T')[0]}</Text>
                </View>

                <View style={[styles.badgePill, { backgroundColor: rfqColor(rfq.status) + '15' }]}>
                  <Text style={[styles.badgePillText, { color: rfqColor(rfq.status) }]}>
                    {statusLabel(rfq.status)}
                  </Text>
                </View>
              </View>

              {/* Row 2: Client & Estimated Value */}
              <View style={styles.cardBodyRow}>
                <Text style={styles.companyName} numberOfLines={1}>
                  {rfq.companyName || rfq.customerName || 'Industrial Client'}
                </Text>
                <Text style={styles.estimatedVal}>
                  {inr(rfq.quotedAmount || rfq.estimatedValue || 0)}
                </Text>
              </View>

              {/* Row 3: Spec Summary & Quick Action */}
              <View style={styles.cardFooterRow}>
                <Text style={styles.itemSummary} numberOfLines={1}>
                  {rfq.items?.[0]?.name || `${rfq.items?.length || 1} Fastener SKU(s) requested`}
                </Text>

                <View style={styles.actionGroup}>
                  <TouchableOpacity
                    onPress={() => handlePromptDelete(rfq)}
                    style={styles.deleteBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.deleteBtnText}>Delete</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => handleOpenReview(rfq)}
                    style={styles.reviewBtn}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.reviewBtnText}>Review &amp; Quote</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          ))
        )}
      </ScrollView>

      {/* Review Quote Modal */}
      <MobileModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={`Quote: ${activeRfq?.rfqNumber || 'RFQ'}`}
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.inputLabel}>Quote Status</Text>
          <View style={styles.stageGrid}>
            {(['IN_REVIEW', 'QUOTED', 'APPROVED'] as MobileRfq['status'][]).map((st) => {
              const active = quoteStatus === st;
              return (
                <TouchableOpacity
                  key={st}
                  onPress={() => setQuoteStatus(st)}
                  style={[styles.stagePill, active && styles.stagePillActive]}
                >
                  <Text style={[styles.stagePillText, active && styles.stagePillTextActive]}>
                    {statusLabel(st)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <Text style={styles.inputLabel}>Corporate Discount (% applied)</Text>
          <TextInput
            style={styles.input}
            value={String(discountPct)}
            onChangeText={(v) => setDiscountPct(parseInt(v) || 0)}
            keyboardType="numeric"
          />

          <View style={styles.calcBox}>
            <Text style={styles.calcLabel}>Estimated Final Quotation:</Text>
            <Text style={styles.calcAmount}>
              {inr(Math.round((activeRfq?.estimatedValue || 45000) * (1 - discountPct / 100)))}
            </Text>
          </View>

          <TouchableOpacity
            style={styles.saveBtn}
            onPress={handleSaveQuote}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            <Text style={styles.saveBtnText}>{isSubmitting ? 'Transmitting...' : 'Dispatch Quote'}</Text>
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Delete Confirmation Modal */}
      <MobileModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title="Delete Quote Request"
      >
        <View style={{ paddingVertical: 8 }}>
          <Text style={{ fontSize: 13, color: STEEL, marginBottom: 14 }}>
            Delete RFQ <Text style={{ fontWeight: '800', color: GRAPHITE }}>{rfqToDelete?.rfqNumber}</Text>?
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
  statusBar: {
    marginTop: 2,
  },
  statusScroll: {
    gap: 6,
    paddingBottom: 4,
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  statusPillActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  statusPillTextActive: {
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
  rfqCard: {
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
  rfqIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  rfqNumber: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
  },
  rfqDate: {
    fontSize: 10,
    color: LIGHT_STEEL,
    fontFamily: MONO,
  },
  badgePill: {
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  badgePillText: {
    fontSize: 9,
    fontWeight: '800',
  },
  cardBodyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  companyName: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAPHITE,
    flex: 1,
    paddingRight: 8,
  },
  estimatedVal: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: BLUE,
  },
  cardFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 6,
  },
  itemSummary: {
    fontSize: 10,
    color: STEEL,
    flex: 1,
    paddingRight: 6,
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
  reviewBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  reviewBtnText: {
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
  stageGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 10,
  },
  stagePill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  stagePillActive: {
    backgroundColor: BLUE,
    borderColor: BLUE,
  },
  stagePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  stagePillTextActive: {
    color: WHITE,
    fontWeight: '800',
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
  calcBox: {
    backgroundColor: '#EFF6FF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#DBEAFE',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  calcLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  calcAmount: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: MONO,
    color: BLUE,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
});
