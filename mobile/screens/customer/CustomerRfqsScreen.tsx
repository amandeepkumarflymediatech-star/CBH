import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { mobileApi } from '../../config/api';
import { MobileRfq } from '../../types';

interface CustomerRfqsScreenProps {
  onNavigateToCart: () => void;
}

export const CustomerRfqsScreen: React.FC<CustomerRfqsScreenProps> = ({ onNavigateToCart }) => {
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchRfqs = async () => {
    try {
      const res = await mobileApi.rfq.getAll({ search: searchQuery || undefined });
      if (res.quotes) {
        setRfqs(res.quotes);
      }
    } catch (err) {
      console.warn('[Customer RFQs] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [searchQuery]);

  const handleAcceptQuote = (rfq: MobileRfq) => {
    setToastMsg(`Accepted quote for ${rfq.rfqNumber}! PO Issued.`);
    setRfqs((prev) =>
      prev.map((r) => (r.id === rfq.id ? { ...r, status: 'PO_ISSUED' } : r))
    );
    setTimeout(() => setToastMsg(''), 3000);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search RFQ Number..."
      />

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      <TouchableOpacity onPress={onNavigateToCart} style={styles.newRfqBtn}>
        <Text style={styles.newRfqBtnText}>📄 Create New Bulk Procurement RFQ</Text>
      </TouchableOpacity>

      {rfqs.map((rfq) => (
        <MobileCard key={rfq.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
            <MobileBadge
              label={rfq.status}
              variant={
                rfq.status === 'APPROVED' || rfq.status === 'PO_ISSUED'
                  ? 'success'
                  : rfq.status === 'QUOTED'
                  ? 'info'
                  : 'warning'
              }
              size="sm"
            />
          </View>

          <Text style={styles.tonnageText}>
            Estimated Volume: {rfq.totalWeightKg || 1200} Kg ({rfq.itemsCount || 3} Fastener Lines)
          </Text>

          <View style={styles.quoteBox}>
            <View>
              <Text style={styles.quoteBoxLabel}>Discount Margin</Text>
              <Text style={styles.quoteBoxVal}>{rfq.discountPct}% OFF List</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.quoteBoxLabel}>Quoted Amount</Text>
              <Text style={styles.quoteBoxAmount}>
                ₹{rfq.netTotal?.toLocaleString('en-IN')}
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.validUntilText}>Valid until: {rfq.validUntil}</Text>
            {rfq.status === 'QUOTED' ? (
              <TouchableOpacity
                onPress={() => handleAcceptQuote(rfq)}
                style={styles.acceptBtn}
              >
                <Text style={styles.acceptBtnText}>Accept &amp; Issue PO</Text>
              </TouchableOpacity>
            ) : (
              <Text style={styles.reviewStatus}>Under Review</Text>
            )}
          </View>
        </MobileCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
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
    fontWeight: '700',
    fontSize: 12,
  },
  newRfqBtn: {
    backgroundColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  newRfqBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rfqNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FF6B00',
  },
  tonnageText: {
    fontSize: 12,
    color: '#475569',
    marginTop: 6,
  },
  quoteBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 8,
    padding: 10,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quoteBoxLabel: {
    fontSize: 10,
    color: '#9A3412',
    textTransform: 'uppercase',
  },
  quoteBoxVal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#C2410C',
  },
  quoteBoxAmount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#9A3412',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  validUntilText: {
    fontSize: 11,
    color: '#64748B',
  },
  acceptBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  acceptBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  reviewStatus: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0052CC',
  },
});

export default CustomerRfqsScreen;
