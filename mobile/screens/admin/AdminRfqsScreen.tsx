import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
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
  const [activeRfq, setActiveRfq] = useState<MobileRfq | null>(null);
  const [isQuoteModalOpen, setIsQuoteModalOpen] = useState(false);
  const [discountPct, setDiscountPct] = useState<number>(18);
  const [toastMsg, setToastMsg] = useState('');

  const fetchRfqs = async () => {
    try {
      const res = await mobileApi.rfq.getAll({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchQuery || undefined,
      });
      if (res.quotes) setRfqs(res.quotes);
    } catch (err) {
      console.warn('[Admin RFQs] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchRfqs();
  }, [selectedStatus, searchQuery]);

  const handleOpenQuote = (rfq: MobileRfq) => {
    setActiveRfq(rfq);
    setDiscountPct(rfq.discountPct || 18);
    setIsQuoteModalOpen(true);
  };

  const handleApproveQuote = async () => {
    if (!activeRfq) return;
    try {
      const net = +(activeRfq.grossAmount * (1 - discountPct / 100)).toFixed(2);
      await mobileApi.rfq.updateStatus({
        id: activeRfq.id,
        status: 'QUOTED',
        discountPct,
      });
      setRfqs((prev) =>
        prev.map((r) =>
          r.id === activeRfq.id ? { ...r, status: 'QUOTED', discountPct, netTotal: net } : r
        )
      );
      setToastMsg(`Official Quote released for ${activeRfq.rfqNumber}!`);
      setTimeout(() => setToastMsg(''), 3000);
      setIsQuoteModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Quotation failed');
    }
  };

  const handleConvertToPo = async (rfq: MobileRfq) => {
    try {
      await mobileApi.rfq.convertToPo(rfq.id);
      setRfqs((prev) =>
        prev.map((r) => (r.id === rfq.id ? { ...r, status: 'CONVERTED_TO_PO' } : r))
      );
      setToastMsg(`RFQ #${rfq.rfqNumber} pushed to ERPNext Sales Order!`);
      setTimeout(() => setToastMsg(''), 3000);
    } catch (err: any) {
      alert(err.message || 'ERP conversion failed');
    }
  };

  const statusFilters = ['All', 'PENDING', 'IN_REVIEW', 'QUOTED', 'APPROVED'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search RFQ #, Enterprise Client, GSTIN..."
      />

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

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {rfqs.map((rfq) => (
        <MobileCard key={rfq.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.rfqNumber}>{rfq.rfqNumber}</Text>
            <MobileBadge
              label={rfq.status}
              variant={
                rfq.status === 'APPROVED' || rfq.status === 'CONVERTED_TO_PO'
                  ? 'success'
                  : rfq.status === 'QUOTED'
                  ? 'info'
                  : 'warning'
              }
              size="sm"
            />
          </View>

          <Text style={styles.clientName}>{rfq.companyName || rfq.customerName}</Text>
          <Text style={styles.clientDetails}>
            GSTIN: {rfq.gstin || '29AABCA1234F1Z5'} • Pin: {rfq.shippingPincode || '560058'}
          </Text>

          <View style={styles.quoteBox}>
            <View>
              <Text style={styles.quoteLabel}>Tonnage</Text>
              <Text style={styles.quoteVal}>{rfq.totalWeightKg || 1250} Kg</Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.quoteLabel}>Quotation Value</Text>
              <Text style={styles.quoteAmount}>
                ₹{rfq.netTotal?.toLocaleString('en-IN')}{' '}
                <Text style={{ fontSize: 10, color: '#EA580C' }}>(-{rfq.discountPct}%)</Text>
              </Text>
            </View>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.validText}>Valid: {rfq.validUntil}</Text>
            {rfq.status === 'QUOTED' || rfq.status === 'APPROVED' ? (
              <TouchableOpacity
                onPress={() => handleConvertToPo(rfq)}
                style={styles.erpBtn}
              >
                <Text style={styles.erpBtnText}>✓ Push to ERP SO</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity
                onPress={() => handleOpenQuote(rfq)}
                style={styles.quoteBtn}
              >
                <Text style={styles.quoteBtnText}>✎ Set Margin</Text>
              </TouchableOpacity>
            )}
          </View>
        </MobileCard>
      ))}

      <MobileModal
        isOpen={isQuoteModalOpen}
        onClose={() => setIsQuoteModalOpen(false)}
        title={`Release Quote: ${activeRfq?.rfqNumber}`}
        subtitle={activeRfq?.companyName}
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsQuoteModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleApproveQuote}
              style={styles.modalConfirmBtn}
            >
              <Text style={styles.modalConfirmText}>Release Quote</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.inputLabel}>Approved Discount Margin (%)</Text>
        <TextInput
          keyboardType="numeric"
          value={String(discountPct)}
          onChangeText={(v) => setDiscountPct(Number(v) || 0)}
          style={styles.input}
        />
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  chipsRow: {
    flexDirection: 'row',
  },
  chip: {
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1.5,
    marginRight: 6,
  },
  chipActive: {
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E8F0',
  },
  chipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  chipTextActive: {
    color: '#FFFFFF',
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
  clientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  clientDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  quoteBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 8,
    marginTop: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quoteLabel: {
    fontSize: 10,
    color: '#9A3412',
  },
  quoteVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#C2410C',
    marginTop: 2,
  },
  quoteAmount: {
    fontSize: 13,
    fontWeight: '800',
    color: '#C2410C',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  validText: {
    fontSize: 11,
    color: '#64748B',
  },
  erpBtn: {
    backgroundColor: '#059669',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  erpBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  quoteBtn: {
    backgroundColor: '#FF6B00',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  quoteBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    height: 40,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#FF6B00',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default AdminRfqsScreen;
