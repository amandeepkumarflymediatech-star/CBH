import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';
import { NavIcon } from '../../components/NavIcon';
import { OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileRfq, MobileAuthUser } from '../../types';

interface CustomerRfqsScreenProps {
  user?: MobileAuthUser | null;
  onNavigateToCart: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToBulkOrder?: () => void;
}

// Same palette as the other customer screens
const GRAPHITE = '#1C2228';
const STEEL = '#5E6A74';
const MIST = '#EDEFF1';
const HAIR = '#D6DBE0';
const WHITE = '#FFFFFF';
const ORANGE = '#F26B1D';
const GREEN = '#17803D';
const RED = '#C62828';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

// An RFQ moves through these stages; the tracker fills as it progresses
const STAGES = ['Submitted', 'In review', 'Quoted', 'PO issued'];
const stageIndex = (status: MobileRfq['status']) => {
  switch (status) {
    case 'IN_REVIEW':
      return 1;
    case 'QUOTED':
      return 2;
    case 'APPROVED':
    case 'PO_ISSUED':
      return 3;
    default:
      return 0;
  }
};

const statusLabel = (status: string) => {
  const s = status.replace(/_/g, ' ').toLowerCase();
  return s === 'po issued' ? 'PO issued' : s.charAt(0).toUpperCase() + s.slice(1);
};

export const CustomerRfqsScreen: React.FC<CustomerRfqsScreenProps> = ({
  user,
  onNavigateToCart,
  onNavigateToCatalog,
  onNavigateToBulkOrder,
}) => {
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchRfqs = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.rfq.getAll({ search: searchQuery.trim() || undefined });
      if (res.quotes) {
        setRfqs(res.quotes);
      }
    } catch (err) {
      console.warn('[Customer RFQs] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [searchQuery, user?.id]);

  const handleAcceptQuote = (rfq: MobileRfq) => {
    setToastMsg(`Quote accepted. Purchase order issued for ${rfq.rfqNumber}.`);
    setRfqs((prev) => prev.map((r) => (r.id === rfq.id ? { ...r, status: 'PO_ISSUED' } : r)));
    setTimeout(() => setToastMsg(''), 3500);
  };

  const statusColor = (status: MobileRfq['status']) => {
    switch (status) {
      case 'APPROVED':
      case 'PO_ISSUED':
        return GREEN;
      case 'QUOTED':
        return ORANGE;
      case 'REJECTED':
        return RED;
      default:
        return STEEL;
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchRfqs(true)} colors={[ORANGE]} />
      }
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchWrap}>
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by RFQ number, e.g. CBH-RFQ"
        />
      </View>

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toastMsg}</Text>
        </View>
      ) : null}

      {/* Start a new RFQ */}
      <View style={styles.startBlock}>
        <TouchableOpacity onPress={onNavigateToCart} style={styles.primaryBtn} activeOpacity={0.88}>
          <Text style={styles.primaryBtnText}>Request quote for cart items</Text>
        </TouchableOpacity>
        {onNavigateToBulkOrder ? (
          <TouchableOpacity onPress={onNavigateToBulkOrder} style={styles.secondaryBtn} activeOpacity={0.85}>
            <Text style={styles.secondaryBtnText}>Upload a BOM or drawing</Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View style={styles.resultsHeader}>
        <Text style={styles.h2}>
          Your quotes{!isLoading ? ` (${rfqs.length})` : ''}
        </Text>
        <TouchableOpacity onPress={() => fetchRfqs(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>Refresh</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ gap: 10 }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : rfqs.length === 0 ? (
        <View style={styles.centerBlock}>
          <NavIcon name="rfqs" color={STEEL} size={32} />
          <Text style={styles.emptyTitle}>No quotes yet</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your cart and request a quote to get volume pricing and a proforma invoice.
          </Text>
          {onNavigateToCatalog ? (
            <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn} activeOpacity={0.88}>
              <Text style={styles.browseBtnText}>Browse the catalog</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        rfqs.map((rfq) => {
          const idx = stageIndex(rfq.status);
          const rejected = rfq.status === 'REJECTED';
          const color = statusColor(rfq.status);
          return (
            <View key={rfq.id} style={styles.rfq}>
              {/* Number + status */}
              <View style={styles.rowBetween}>
                <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.statusDot, { backgroundColor: color }]} />
                  <Text style={[styles.statusText, { color }]}>{statusLabel(rfq.status)}</Text>
                </View>
              </View>

              {/* Progress tracker */}
              <View style={styles.tracker}>
                {STAGES.map((s, i) => (
                  <View
                    key={s}
                    style={[
                      styles.seg,
                      i <= idx && { backgroundColor: rejected ? RED : i === idx && idx === 2 ? ORANGE : GRAPHITE },
                    ]}
                  />
                ))}
              </View>
              <View style={styles.stageLabels}>
                {STAGES.map((s, i) => (
                  <Text key={s} style={[styles.stageLabel, i === idx && !rejected && styles.stageLabelOn]}>
                    {s}
                  </Text>
                ))}
              </View>

              <Text style={styles.meta}>
                {rfq.companyName || 'Industrial Client'}, sent {rfq.date || '2026-10-30'}
              </Text>
              <Text style={styles.meta}>
                {rfq.itemsCount || 3} fastener lines, about {(rfq.totalWeightKg || 1200).toLocaleString('en-IN')} kg
              </Text>

              {/* Quote amount */}
              <View style={styles.quoteRow}>
                <View>
                  <Text style={styles.quoteLabel}>Discount</Text>
                  <Text style={styles.quoteDiscount}>{rfq.discountPct || 14}% off list</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={styles.quoteLabel}>Quoted total incl. GST</Text>
                  <Text style={styles.quoteAmount}>₹{(rfq.netTotal || 0).toLocaleString('en-IN')}</Text>
                </View>
              </View>

              {/* Action or state */}
              {rfq.status === 'QUOTED' ? (
                <TouchableOpacity onPress={() => handleAcceptQuote(rfq)} style={styles.acceptBtn} activeOpacity={0.88}>
                  <Text style={styles.acceptBtnText}>Accept quote and issue PO</Text>
                </TouchableOpacity>
              ) : (
                <Text style={[styles.stateNote, rfq.status === 'PO_ISSUED' && { color: GREEN }, rejected && { color: RED }]}>
                  {rfq.status === 'PO_ISSUED'
                    ? 'Purchase order confirmed'
                    : rejected
                    ? 'This request was declined'
                    : 'Our sales team is preparing your quote'}
                </Text>
              )}
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: WHITE },

  searchWrap: { paddingHorizontal: 16, paddingTop: 16 },

  toast: {
    marginHorizontal: 20,
    marginTop: 12,
    backgroundColor: GRAPHITE,
    borderRadius: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
  },
  toastText: { color: WHITE, fontSize: 14, fontWeight: '600' },

  startBlock: { paddingHorizontal: 20, paddingTop: 16, paddingBottom: 20, gap: 10 },
  primaryBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  primaryBtnText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  secondaryBtn: {
    height: 50,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryBtnText: { color: GRAPHITE, fontSize: 15, fontWeight: '700' },

  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
    borderTopColor: HAIR,
    backgroundColor: MIST,
  },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  link: { fontSize: 14, fontWeight: '700', color: ORANGE },

  centerBlock: { paddingHorizontal: 32, paddingVertical: 48, alignItems: 'center', gap: 10 },
  loadingText: { fontSize: 14, color: STEEL },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: GRAPHITE, marginTop: 4 },
  emptySubtitle: { fontSize: 14, color: STEEL, textAlign: 'center', lineHeight: 21 },
  browseBtn: {
    marginTop: 8,
    height: 46,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  browseBtnText: { color: GRAPHITE, fontSize: 14, fontWeight: '700' },

  // One RFQ: a hairline-separated block, not a card
  rfq: {
    paddingHorizontal: 20,
    paddingVertical: 20,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  rfqNumber: { fontSize: 15, fontWeight: '700', color: GRAPHITE, fontFamily: MONO },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statusDot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },

  tracker: { flexDirection: 'row', gap: 4, marginTop: 14 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: MIST },
  stageLabels: { flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 14 },
  stageLabel: { flex: 1, fontSize: 11, color: STEEL },
  stageLabelOn: { color: GRAPHITE, fontWeight: '700' },

  meta: { fontSize: 13, color: STEEL, marginTop: 2 },

  quoteRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginTop: 16,
    paddingTop: 14,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  quoteLabel: { fontSize: 12, color: STEEL },
  quoteDiscount: { fontSize: 15, fontWeight: '700', color: GREEN, marginTop: 2 },
  quoteAmount: { fontSize: 22, fontWeight: '800', color: GRAPHITE, marginTop: 2, fontVariant: ['tabular-nums'] },

  acceptBtn: {
    marginTop: 16,
    height: 48,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  acceptBtnText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  stateNote: { marginTop: 16, fontSize: 13, fontWeight: '600', color: STEEL },
});

export default CustomerRfqsScreen;