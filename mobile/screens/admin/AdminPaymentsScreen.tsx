import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';

export const AdminPaymentsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');

  const transactions = [
    {
      id: 'TXN-90812',
      orderNumber: 'CBH-ORD-8821',
      client: 'Apex Heavy Infrastructure Ltd.',
      amount: 142850,
      mode: 'PHONEPE_UPI',
      status: 'CAPTURED',
      date: '2026-10-28 16:30',
      utr: 'UTR889920192831',
    },
    {
      id: 'TXN-90809',
      orderNumber: 'CBH-ORD-8819',
      client: 'L&T Power Transmission Div',
      amount: 268400,
      mode: 'NEFT_RTGS',
      status: 'VERIFIED',
      date: '2026-10-27 11:15',
      utr: 'HDFCR9928172910',
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Settled Dispatches (October 2026)</Text>
        <Text style={styles.revenueAmount}>₹4,70,150.00</Text>
        <View style={styles.revenueFooter}>
          <Text style={styles.footerNote}>PhonePe Gateway: ACTIVE</Text>
          <Text style={styles.footerNote}>T+1 Settlement</Text>
        </View>
      </View>

      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Transaction ID, UTR, Client..."
      />

      <Text style={styles.sectionHeading}>Recent Transactions</Text>

      {transactions.map((txn) => (
        <MobileCard key={txn.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.txnId}>{txn.id}</Text>
            <MobileBadge label={txn.status} variant="success" size="sm" />
          </View>

          <Text style={styles.clientName}>{txn.client}</Text>
          <Text style={styles.modeText}>
            Mode: {txn.mode} • UTR: {txn.utr}
          </Text>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.dateText}>{txn.date}</Text>
            <Text style={styles.amountText}>
              ₹{txn.amount.toLocaleString('en-IN')}
            </Text>
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
  revenueCard: {
    backgroundColor: '#0052CC',
    borderRadius: 14,
    padding: 16,
  },
  revenueLabel: {
    fontSize: 10,
    color: '#BFDBFE',
    textTransform: 'uppercase',
  },
  revenueAmount: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    marginTop: 2,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.2)',
    paddingTop: 8,
    marginTop: 10,
  },
  footerNote: {
    fontSize: 10,
    color: '#E0E7FF',
  },
  sectionHeading: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  txnId: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
  },
  clientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  modeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
  },
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default AdminPaymentsScreen;
