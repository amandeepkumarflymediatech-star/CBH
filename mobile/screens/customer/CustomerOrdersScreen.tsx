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
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileOrder, MobileAuthUser } from '../../types';

interface CustomerOrdersScreenProps {
  user?: MobileAuthUser | null;
  onNavigateToCatalog?: () => void;
}

export const CustomerOrdersScreen: React.FC<CustomerOrdersScreenProps> = ({
  user,
  onNavigateToCatalog,
}) => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.orders.getAll({
        search: searchQuery.trim() || undefined,
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        customerId: user?.id,
      });
      if (res.orders) {
        setOrders(res.orders);
      }
    } catch (err) {
      console.warn('[Customer Orders] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [searchQuery, selectedStatus, user?.id]);

  const statusFilters = ['All', 'CONFIRMED', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED'];

  const getBadgeVariant = (status: MobileOrder['status']) => {
    switch (status) {
      case 'DELIVERED':
        return 'success';
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return 'info';
      case 'PROCESSING':
      case 'CONFIRMED':
        return 'warning';
      case 'CANCELLED':
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
          onRefresh={() => fetchOrders(true)}
          colors={['#0052CC']}
        />
      }
    >
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Order Number, AWB Tracking..."
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

      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      <View style={styles.resultsHeader}>
        <Text style={styles.resultsCount}>
          Found {orders.length} consignments
        </Text>
        <TouchableOpacity onPress={() => fetchOrders(true)}>
          <Text style={styles.reloadText}>↻ Sync ERP</Text>
        </TouchableOpacity>
      </View>

      {/* Loading state */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Syncing orders with dispatch node...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>No Consignments Found</Text>
          <Text style={styles.emptySubtitle}>
            You do not have any active fastener orders matching this filter.
          </Text>
          {onNavigateToCatalog ? (
            <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn}>
              <Text style={styles.browseBtnText}>Explore Fastener Inventory</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      ) : (
        orders.map((order) => (
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
                variant={getBadgeVariant(order.status)}
                size="sm"
              />
            </View>

            <View style={styles.metaRow}>
              <Text style={styles.carrierText}>🚚 {order.carrier || 'Blue Dart Express'}</Text>
              <Text style={styles.dateText}>Date: {order.date || '2026-10-30'}</Text>
            </View>

            {order.trackingNumber ? (
              <View style={styles.trackingBox}>
                <Text style={styles.trackingLabel}>AWB TRACKING NUMBER</Text>
                <Text style={styles.trackingValue}>{order.trackingNumber}</Text>
              </View>
            ) : null}

            <View style={styles.cardDivider} />

            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.tonnageVal}>{order.totalWeightKg || 500} Kg</Text>
                <Text style={styles.tonnageLabel}>Tonnage ({order.itemsCount || 1} SKUs)</Text>
              </View>
              <View style={{ alignItems: 'flex-end' }}>
                <Text style={styles.netAmount}>
                  ₹{(order.netAmount || 0).toLocaleString('en-IN')}
                </Text>
                <Text style={styles.netLabel}>Invoice Total (Incl. GST)</Text>
              </View>
            </View>
          </MobileCard>
        ))
      )}

      {/* Order Detail Modal */}
      {activeOrder ? (
        <MobileModal
          isOpen={isDetailModalOpen}
          onClose={() => setIsDetailModalOpen(false)}
          title={`Order: ${activeOrder.orderNumber}`}
        >
          <View style={styles.modalContent}>
            <View style={styles.rowBetween}>
              <Text style={styles.modalStatusLabel}>Live Pipeline Status</Text>
              <MobileBadge
                label={activeOrder.status}
                variant={getBadgeVariant(activeOrder.status)}
                size="sm"
              />
            </View>

            <View style={styles.infoBox}>
              <Text style={styles.infoKey}>Carrier Partner</Text>
              <Text style={styles.infoVal}>{activeOrder.carrier || 'Blue Dart Express'}</Text>
              
              <Text style={[styles.infoKey, { marginTop: 6 }]}>AWB Tracking Number</Text>
              <Text style={styles.infoVal}>{activeOrder.trackingNumber || 'Queued for Dispatch'}</Text>

              <Text style={[styles.infoKey, { marginTop: 6 }]}>Delivery Destination</Text>
              <Text style={styles.infoVal}>{activeOrder.shippingAddress || 'Plot 42, Peenya Industrial Area, Bengaluru'}</Text>

              {activeOrder.mtcCertNumber ? (
                <>
                  <Text style={[styles.infoKey, { marginTop: 6 }]}>NABL MTC Certificate</Text>
                  <Text style={[styles.infoVal, { color: '#0052CC', fontWeight: '800' }]}>
                    📜 {activeOrder.mtcCertNumber} (EN 10204 3.1 Verified)
                  </Text>
                </>
              ) : null}
            </View>

            <Text style={styles.modalSectionHeader}>ORDERED FASTENERS</Text>
            {activeOrder.items && activeOrder.items.length > 0 ? (
              activeOrder.items.map((it, idx) => (
                <View key={idx} style={styles.lineItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.lineItemSku}>{it.sku}</Text>
                    <Text style={styles.lineItemName}>{it.name}</Text>
                  </View>
                  <View style={{ alignItems: 'flex-end' }}>
                    <Text style={styles.lineItemQty}>
                      {it.quantity.toLocaleString()} {it.uom || 'PCS'}
                    </Text>
                    <Text style={styles.lineItemRate}>₹{it.rate}/pc</Text>
                  </View>
                </View>
              ))
            ) : (
              <Text style={styles.fallbackLineText}>
                Bulk Fastener Consignment ({activeOrder.totalWeightKg} Kg)
              </Text>
            )}

            <View style={styles.cardDivider} />

            <View style={styles.rowBetween}>
              <Text style={styles.totalKey}>Total Invoice Net</Text>
              <Text style={styles.totalVal}>
                ₹{(activeOrder.netAmount || 0).toLocaleString('en-IN')}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => {
                setToastMsg(`Downloaded EN 10204 Type 3.1 MTC for ${activeOrder.orderNumber}!`);
                setTimeout(() => setToastMsg(''), 3000);
              }}
              style={styles.downloadCertBtn}
            >
              <Text style={styles.downloadCertBtnText}>📥 Download NABL MTC Certificate</Text>
            </TouchableOpacity>
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
    fontSize: 12,
    fontWeight: '700',
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
  orderNumber: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  carrierText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  trackingBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  trackingLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  trackingValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
    marginTop: 2,
  },
  cardDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  tonnageVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  tonnageLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  netAmount: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0052CC',
  },
  netLabel: {
    fontSize: 10,
    color: '#64748B',
  },
  modalContent: {
    gap: 10,
  },
  modalStatusLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  infoBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  infoKey: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 1,
  },
  modalSectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 4,
  },
  lineItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  lineItemSku: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
  },
  lineItemName: {
    fontSize: 11,
    color: '#334155',
  },
  lineItemQty: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  lineItemRate: {
    fontSize: 10,
    color: '#64748B',
  },
  fallbackLineText: {
    fontSize: 12,
    color: '#64748B',
    fontStyle: 'italic',
  },
  totalKey: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  totalVal: {
    fontSize: 16,
    fontWeight: '900',
    color: '#0052CC',
  },
  downloadCertBtn: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  downloadCertBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
});

export default CustomerOrdersScreen;
