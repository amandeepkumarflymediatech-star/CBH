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
import { MobileOrder } from '../../types';

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<MobileOrder['status']>('PROCESSING');
  const [newTracking, setNewTracking] = useState('');
  const [newCarrier, setNewCarrier] = useState('');
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async () => {
    try {
      const res = await mobileApi.orders.getAll({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchQuery || undefined,
      });
      if (res.orders) setOrders(res.orders);
    } catch (err) {
      console.warn('[Admin Orders] Fetch error:', err);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, searchQuery]);

  const handleOpenUpdate = (order: MobileOrder) => {
    setActiveOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setNewCarrier(order.carrier || 'Blue Dart Express');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!activeOrder) return;
    try {
      await mobileApi.orders.updateStatus({
        id: activeOrder.id,
        status: newStatus,
        trackingNumber: newTracking,
        carrier: newCarrier,
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id
            ? { ...o, status: newStatus, trackingNumber: newTracking, carrier: newCarrier }
            : o
        )
      );

      setToastMsg(`Order #${activeOrder.orderNumber} updated!`);
      setTimeout(() => setToastMsg(''), 3000);
      setIsUpdateModalOpen(false);
    } catch (err: any) {
      alert(err.message || 'Update failed');
    }
  };

  const statusFilters = ['All', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Order #, Client, AWB Tracking..."
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

      {orders.map((order) => (
        <MobileCard key={order.id}>
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

          <Text style={styles.clientName}>{order.companyName || order.customerName}</Text>
          <Text style={styles.addressText}>{order.shippingAddress || 'India Direct'}</Text>

          <View style={styles.carrierBox}>
            <Text style={styles.carrierName}>🚚 {order.carrier || 'Blue Dart'}</Text>
            <Text style={styles.awbText}>AWB: {order.trackingNumber || 'PENDING'}</Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.amountText}>
              ₹{order.netAmount?.toLocaleString('en-IN')}{' '}
              <Text style={styles.weightText}>({order.totalWeightKg} Kg)</Text>
            </Text>

            <TouchableOpacity
              onPress={() => handleOpenUpdate(order)}
              style={styles.updateBtn}
            >
              <Text style={styles.updateBtnText}>✎ Update Status</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}

      <MobileModal
        isOpen={isUpdateModalOpen}
        onClose={() => setIsUpdateModalOpen(false)}
        title={`Update Order #${activeOrder?.orderNumber}`}
        subtitle={activeOrder?.companyName}
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsUpdateModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleSaveStatus}
              style={styles.modalConfirmBtn}
            >
              <Text style={styles.modalConfirmText}>Confirm Update</Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.inputLabel}>AWB Tracking Number</Text>
        <TextInput
          value={newTracking}
          onChangeText={setNewTracking}
          placeholder="e.g. BD-889921447IN"
          placeholderTextColor="#94A3B8"
          style={styles.input}
        />

        <Text style={styles.inputLabel}>Carrier Name</Text>
        <TextInput
          value={newCarrier}
          onChangeText={setNewCarrier}
          placeholder="Blue Dart Express Heavy"
          placeholderTextColor="#94A3B8"
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
  clientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  addressText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
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
  amountText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  weightText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  updateBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  updateBtnText: {
    color: '#0052CC',
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
    fontSize: 13,
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
    backgroundColor: '#0052CC',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default AdminOrdersScreen;
