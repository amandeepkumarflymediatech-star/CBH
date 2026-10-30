import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileRfq, MobileAuthUser } from '../../types';

interface CustomerRfqsScreenProps {
  user?: MobileAuthUser | null;
  onNavigateToCart: () => void;
  onNavigateToCatalog?: () => void;
}

export const CustomerRfqsScreen: React.FC<CustomerRfqsScreenProps> = ({
  user,
  onNavigateToCart,
  onNavigateToCatalog,
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
    setToastMsg(`Accepted official quote for ${rfq.rfqNumber}! PO Generated in ERPNext.`);
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfq.id ? { ...r, status: 'PO_ISSUED' } : r))
    );
    setTimeout(() => setToastMsg(''), 3500);
  };

  const getRfqBadgeVariant = (status: MobileRfq['status']) => {
    switch (status) {
      case 'APPROVED':
      case 'PO_ISSUED':
        return 'success';
      case 'QUOTED':
        return 'info';
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
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search RFQ Number (e.g. CBH-RFQ)..."
      />

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onNavigateToCart} style={styles.newRfqBtn}>
        <Text style={styles.newRfqBtnText}>📄 Create New Bulk Procurement RFQ</Text>
      </TouchableOpacity>

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Found {rfqs.length} quotation inquiries
        </Text>
        <TouchableOpacity onPress={() => fetchRfqs(true)}>
          <Text style={styles.reloadText}>↻ Refresh</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading quotation inquiries...</Text>
        </View>
      ) : rfqs.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📋</Text>
          <Text style={styles.emptyTitle}>No Quotation Inquiries</Text>
          <Text style={styles.emptySubtitle}>
            Add items to your cart and request an official RFQ to receive custom volume discounts and commercial proforma.
          </Text>
          {onNavigateToCatalog ? (
            <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn}>
              <Text style={styles.browseBtnText}>Explore Fastener Catalog</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        rfqs.map((rfq) => (
          <MobileCard key={rfq.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
              <MobileBadge
                label={rfq.status}
                variant={getRfqBadgeVariant(rfq.status)}
                size="sm"
              />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.dateText}>Inquiry Date: {rfq.date || '2026-10-30'}</Text>
              <Text style={styles.companyText}>{rfq.companyName || 'Industrial Client'}</Text>
            </View>

            <Text style={styles.tonnageText}>
              Estimated Volume: {rfq.totalWeightKg || 1200} Kg ({rfq.itemsCount || 3} Fastener Lines)
            </Text>

            <View style={styles.quoteBox}>
              <View>
                <Text style={styles.quoteBoxLabel}>Discount Margin</Text>
                <Text style={styles.quoteBoxVal}>{rfq.discountPct || 14}% OFF List</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.quoteBoxLabel}>Quoted Amount (Incl. GST)</Text>
                <Text style={styles.quoteBoxAmount}>
                  ₹{(rfq.netTotal || 0).toLocaleString('en-IN')}
                </Text>
              </View>
            </View>

            <View style={styles.cardDivider} />

            <View style={styles.actionsRow}>
              {rfq.status === 'QUOTED' ? (
                <TouchableOpacity
                  onPress={() => handleAcceptQuote(rfq)}
                  style={styles.acceptBtn}
                >
                  <Text style={styles.acceptBtnText}>✓ Accept Quote &amp; Issue PO</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.statusPill}>
                  <Text style={styles.statusPillText}>
                    {rfq.status === 'PO_ISSUED'
                      ? '✓ Purchase Order Confirmed'
                      : '⏳ Under Sales Desk Engineering Review'}
                  </Text>
                </View>
              )}
            </View>
          </MobileCard>
        ))
      )}
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
  newRfqBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  newRfqBtnText: {
    color: '#0052CC',
    fontSize: 13,
    fontWeight: '800',
  },
  resultsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
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
    fontSize: 36,
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
    lineHeight: 16,
  },
  browseBtn: {
    marginTop: 8,
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rfqNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  companyText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  tonnageText: {
    fontSize: 12,
    color: '#334155',
    marginTop: 6,
    fontWeight: '600',
  },
  quoteBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  quoteBoxLabel: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  quoteBoxVal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  quoteBoxAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0052CC',
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  actionsRow: {
    alignItems: 'center',
  },
  acceptBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  statusPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
  },
  statusPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
});

export default CustomerRfqsScreen;
