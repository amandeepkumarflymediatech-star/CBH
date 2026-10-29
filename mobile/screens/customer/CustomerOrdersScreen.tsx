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
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileOrder } from '../../types';

export const CustomerOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await mobileApi.orders.getAll({
        search: searchQuery || undefined,
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        customerId: 101,
      });
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn('[Customer Orders] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, selectedStatus]);

  const statusFilters = ['All', 'IN_TRANSIT', 'PROCESSING', 'DELIVERED'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Order Number, AWB..."
      />

      {/* Chips */}
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

      {/* Orders */}
      {orders.map((order) => (
        <MobileCard
          key={order.id}
          onPress={() => {
            setActiveOrder(order);
            setIsDetailModalOpen(true);
          }}
        >
          <View style={styles.rowBetween}>
            <Text style={styles.orderNumber}>{order.orderNumber}</Text>
            <MobileBadge
              label={order.status}
              variant={
                order.status === 'DELIVERED'
                  ? 'success'
                  : order.status === 'IN_TRANSIT'
                  ? 'info'
                  : 'warning'
              }
              size="sm"
            />
          </View>

          <View style={styles.carrierBox}>
            <Text style={styles.carrierName}>🚚 {order.carrier}</Text>
            <Text style={styles.awbText}>
              AWB: {order.trackingNumber || 'PENDING'}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.weightText}>Weight: {order.totalWeightKg} Kg</Text>
            <Text style={styles.amountText}>
              ₹{order.netAmount?.toLocaleString('en-IN')}
            </Text>
          </View>
        </MobileCard>
      ))}

      {/* Detail Modal */}
      <MobileModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        title={`Consignment ${activeOrder?.orderNumber}`}
        subtitle={`Destination: ${activeOrder?.shippingAddress}`}
        footer={
          <TouchableOpacity
            onPress={() => {
              setToastMsg(`Downloaded NABL MTC for ${activeOrder?.mtcCertNumber}!`);
              setIsDetailModalOpen(false);
              setTimeout(() => setToastMsg(''), 3000);
            }}
            style={styles.modalDownloadBtn}
          >
            <Text style={styles.modalDownloadText}>
              📄 Download NABL MTC 3.1 Cert
            </Text>
          </TouchableOpacity>
        }
      >
        <View style={styles.modalBody}>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>Carrier:</Text>
            <Text style={styles.specVal}>{activeOrder?.carrier}</Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>AWB Number:</Text>
            <Text style={[styles.specVal, { color: '#0052CC', fontWeight: '800' }]}>
              {activeOrder?.trackingNumber}
            </Text>
          </View>
          <View style={styles.specRow}>
            <Text style={styles.specKey}>MTC Test Cert:</Text>
            <Text style={styles.specVal}>{activeOrder?.mtcCertNumber}</Text>
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
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
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
  orderNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052CC',
  },
  carrierBox: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  carrierName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0F172A',
  },
  awbText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  weightText: {
    fontSize: 11,
    color: '#64748B',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  modalBody: {
    gap: 8,
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  specKey: {
    fontSize: 12,
    color: '#64748B',
  },
  specVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  modalDownloadBtn: {
    flex: 1,
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  modalDownloadText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
});

export default CustomerOrdersScreen;
