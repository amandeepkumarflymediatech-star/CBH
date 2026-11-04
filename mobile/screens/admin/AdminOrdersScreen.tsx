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
import { OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileOrder } from '../../types';

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
  const t = s.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

// Dispatch stages; the tracker fills as an order moves along
const STAGES = ['Processing', 'Dispatched', 'In transit', 'Delivered'];
const stageIndex = (status: string) => {
  switch (status) {
    case 'DISPATCHED':
      return 1;
    case 'IN_TRANSIT':
      return 2;
    case 'DELIVERED':
      return 3;
    default:
      return 0;
  }
};

const payLabel = (m?: string) =>
  m === 'COD' ? 'Cash on delivery' : m === 'PHONEPE' ? 'Prepaid UPI' : m === 'NEFT_RTGS' ? 'RTGS wire' : m ? '30-day credit' : '';

export const AdminOrdersScreen: React.FC = () => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update status modal
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<MobileOrder['status']>('PROCESSING');
  const [newTracking, setNewTracking] = useState('');
  const [newCarrier, setNewCarrier] = useState('');

  // Create order modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [newCarrierSelect, setNewCarrierSelect] = useState('Blue Dart Express');
  const [newSkuDesc, setNewSkuDesc] = useState('DIN 933 M12x50 Gr 8.8 (Hex Bolts)');
  const [newQuantityKg, setNewQuantityKg] = useState('250');
  const [newAmount, setNewAmount] = useState('32500');

  // Delete modal
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<MobileOrder | null>(null);

  const [toastMsg, setToastMsg] = useState('');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const fetchOrders = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const res = await mobileApi.orders.getAll({
        status: selectedStatus === 'All' ? undefined : selectedStatus,
        search: searchQuery.trim() || undefined,
      });
      if (res.orders) setOrders(res.orders);
    } catch (err) {
      console.warn('[Admin Orders] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [selectedStatus, searchQuery]);

  // CREATE
  const handleOpenCreate = () => {
    setNewClientName('Vikram Malhotra');
    setNewCompanyName('L&T Mega Structures Ltd.');
    setNewShippingAddress('Plot 18, Phase 2, Industrial Estate, Pune, MH - 411019');
    setIsCreateModalOpen(true);
  };

  const handleCreateOrder = async () => {
    if (!newCompanyName.trim() || !newShippingAddress.trim()) {
      Alert.alert('Missing details', 'Enter a company name and a shipping address.');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        customerName: newClientName.trim() || 'Procurement Officer',
        companyName: newCompanyName.trim(),
        shippingAddress: newShippingAddress.trim(),
        carrier: newCarrierSelect,
        paymentMethod: 'CREDIT_LINE' as const,
        netAmount: parseFloat(newAmount) || 25000,
        totalWeightKg: parseFloat(newQuantityKg) || 100,
        items: [
          {
            sku: 'CBH-MANUAL-DISPATCH',
            name: newSkuDesc,
            quantity: parseFloat(newQuantityKg) || 100,
            rate: 95.0,
            weightKg: parseFloat(newQuantityKg) || 100,
          },
        ],
      };

      const res = await mobileApi.orders.create(payload);
      const newOrder: MobileOrder = res.order || ({
        id: String(res.id || `ORD-${Date.now()}`),
        orderNumber: res.orderNumber || `CBH-ORD-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().split('T')[0],
        status: 'CONFIRMED' as const,
        companyName: payload.companyName,
        customerName: payload.customerName,
        shippingAddress: payload.shippingAddress,
        carrier: payload.carrier,
        trackingNumber: 'PENDING',
        dispatchDate: new Date().toISOString().split('T')[0],
        mtcCertNumber: `NABL-MTC-${Math.floor(10000 + Math.random() * 90000)}`,
        itemsCount: payload.items.length,
        netAmount: payload.netAmount,
        totalWeightKg: payload.totalWeightKg,
        createdAt: new Date().toISOString(),
        items: payload.items,
      } as unknown as MobileOrder);

      setOrders((prev) => [newOrder, ...prev]);
      setIsCreateModalOpen(false);
      showToast(`Order ${newOrder.orderNumber} created`);
    } catch (err: any) {
      Alert.alert('Could not create order', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // UPDATE
  const handleOpenUpdate = (order: MobileOrder) => {
    setActiveOrder(order);
    setNewStatus(order.status);
    setNewTracking(order.trackingNumber || '');
    setNewCarrier(order.carrier || 'Blue Dart Express');
    setIsUpdateModalOpen(true);
  };

  const handleSaveStatus = async () => {
    if (!activeOrder) return;
    setIsSubmitting(true);
    try {
      await mobileApi.orders.updateStatus({
        id: activeOrder.id,
        status: newStatus,
        trackingNumber: newTracking.trim(),
        carrier: newCarrier.trim(),
      });

      setOrders((prev) =>
        prev.map((o) =>
          o.id === activeOrder.id
            ? { ...o, status: newStatus, trackingNumber: newTracking.trim(), carrier: newCarrier.trim() }
            : o
        )
      );

      setIsUpdateModalOpen(false);
      showToast(`${activeOrder.orderNumber} is now ${statusLabel(newStatus).toLowerCase()}`);
    } catch (err: any) {
      Alert.alert('Could not update order', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // DELETE
  const handlePromptDelete = (order: MobileOrder) => {
    setOrderToDelete(order);
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!orderToDelete) return;
    setIsSubmitting(true);
    try {
      await mobileApi.orders.delete(orderToDelete.id);
      setOrders((prev) => prev.filter((o) => o.id !== orderToDelete.id));
      setIsDeleteModalOpen(false);
      showToast(`${orderToDelete.orderNumber} deleted`);
      setOrderToDelete(null);
    } catch (err: any) {
      Alert.alert('Could not delete order', err.message || 'Try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFilters = ['All', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  const statusColor = (st: string) => {
    switch (st) {
      case 'DELIVERED':
        return GREEN;
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return GRAPHITE;
      case 'CANCELLED':
        return RED;
      default:
        return ORANGE;
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => fetchOrders(true)} colors={[ORANGE]} />
      }
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.searchWrap}>
        <MobileSearch
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search by order number, client or AWB"
        />
      </View>

      {/* Status filter tabs */}
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

      {/* Count + create */}
      <View style={styles.controlBar}>
        <Text style={styles.h2}>{isLoading ? 'Orders' : `${orders.length} ${orders.length === 1 ? 'order' : 'orders'}`}</Text>
        <TouchableOpacity style={styles.addBtn} onPress={handleOpenCreate} activeOpacity={0.88}>
          <Text style={styles.addBtnText}>New dispatch</Text>
        </TouchableOpacity>
      </View>

      {/* List */}
      {isLoading ? (
        <View style={{ gap: 10 }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.centerBlock}>
          <Text style={styles.emptyTitle}>No orders found</Text>
          <Text style={styles.emptySubtitle}>Nothing matches this search or filter.</Text>
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
        orders.map((order) => {
          const idx = stageIndex(order.status);
          const cancelled = order.status === 'CANCELLED';
          const color = statusColor(order.status);
          const pay = payLabel(order.paymentMethod);
          return (
            <View key={order.id} style={styles.order}>
              <View style={styles.rowBetween}>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <View style={styles.statusRow}>
                  <View style={[styles.dot, { backgroundColor: color }]} />
                  <Text style={[styles.statusText, { color }]}>{statusLabel(order.status)}</Text>
                </View>
              </View>
              <Text style={styles.company}>{order.companyName || 'Enterprise Buyer'}</Text>

              {/* Stage tracker */}
              <View style={styles.tracker}>
                {STAGES.map((s, i) => (
                  <View
                    key={s}
                    style={[styles.seg, i <= idx && { backgroundColor: cancelled ? RED : i === idx && idx < 3 ? ORANGE : i === 3 ? GREEN : GRAPHITE }]}
                  />
                ))}
              </View>
              <View style={styles.stageLabels}>
                {STAGES.map((s, i) => (
                  <Text key={s} style={[styles.stageLabel, i === idx && !cancelled && styles.stageLabelOn]}>
                    {s}
                  </Text>
                ))}
              </View>

              <Text style={styles.meta} numberOfLines={2}>
                Ship to {order.shippingAddress || 'Plant Dispatch Center'}
              </Text>
              <Text style={styles.meta}>
                {order.carrier || 'Express Logistics'},{' '}
                {order.trackingNumber ? `AWB ${order.trackingNumber}` : 'AWB pending'}
              </Text>

              <View style={styles.amountRow}>
                <View>
                  <Text style={styles.amount}>{inr(order.netAmount || 0)}</Text>
                  <Text style={styles.amountSub}>
                    {order.items ? order.items.length : 1} {(order.items ? order.items.length : 1) === 1 ? 'line' : 'lines'},{' '}
                    {(order.totalWeightKg || 120).toLocaleString('en-IN')} kg{pay ? `, ${pay}` : ''}
                  </Text>
                </View>
              </View>

              <View style={styles.actions}>
                <TouchableOpacity
                  onPress={() => handlePromptDelete(order)}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.deleteLink}>Delete</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleOpenUpdate(order)} style={styles.updateBtn} activeOpacity={0.85}>
                  <Text style={styles.updateBtnText}>Update status</Text>
                </TouchableOpacity>
              </View>
            </View>
          );
        })
      )}

      {/* Create order modal */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="New dispatch order"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>Create a plant consignment directly in the ERP pipeline.</Text>

          <Text style={styles.inputLabel}>Company name</Text>
          <TextInput
            style={styles.input}
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            placeholder="Apex Infrastructure Pvt Ltd"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Contact person</Text>
          <TextInput
            style={styles.input}
            value={newClientName}
            onChangeText={setNewClientName}
            placeholder="Rajesh Sharma"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Delivery address</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={newShippingAddress}
            onChangeText={setNewShippingAddress}
            placeholder="Warehouse or site address with PIN"
            placeholderTextColor="#8D98A1"
            multiline
          />

          <Text style={styles.inputLabel}>Carrier</Text>
          <TextInput
            style={styles.input}
            value={newCarrierSelect}
            onChangeText={setNewCarrierSelect}
            placeholder="Blue Dart, TCI Freight, Safexpress"
            placeholderTextColor="#8D98A1"
          />

          <Text style={styles.inputLabel}>Items</Text>
          <TextInput
            style={styles.input}
            value={newSkuDesc}
            onChangeText={setNewSkuDesc}
            placeholder="DIN 933 M12x50 Grade 8.8 (Hex Bolts)"
            placeholderTextColor="#8D98A1"
          />

          <View style={styles.twoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={newQuantityKg} onChangeText={setNewQuantityKg} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Invoice value (₹)</Text>
              <TextInput style={styles.input} keyboardType="numeric" value={newAmount} onChangeText={setNewAmount} />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreateOrder}
            style={[styles.saveBtn, isSubmitting && styles.disabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Create order</Text>}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Update status modal */}
      {activeOrder ? (
        <MobileModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update ${activeOrder.orderNumber}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>Set the dispatch status, carrier and AWB tracking number.</Text>

            <Text style={styles.inputLabel}>Status</Text>
            <View style={styles.statusSelectRow}>
              {(['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const).map((st) => {
                const active = newStatus === st;
                return (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusSelect, active && styles.statusSelectActive]}
                    onPress={() => setNewStatus(st)}
                    activeOpacity={0.8}
                  >
                    <Text style={[styles.statusSelectText, active && styles.statusSelectTextActive]}>
                      {statusLabel(st)}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            <Text style={styles.inputLabel}>Carrier</Text>
            <TextInput
              style={styles.input}
              value={newCarrier}
              onChangeText={setNewCarrier}
              placeholder="Blue Dart Express Heavy"
              placeholderTextColor="#8D98A1"
            />

            <Text style={styles.inputLabel}>AWB tracking number</Text>
            <TextInput
              style={[styles.input, { fontFamily: MONO }]}
              value={newTracking}
              onChangeText={setNewTracking}
              placeholder="BD-889921447IN"
              placeholderTextColor="#8D98A1"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              onPress={handleSaveStatus}
              style={[styles.saveBtn, isSubmitting && styles.disabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Save update</Text>}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* Delete modal */}
      {orderToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete this order?"
        >
          <View style={styles.modalScroll}>
            <Text style={styles.deleteLead}>
              {orderToDelete.orderNumber} will be permanently removed. This can’t be undone.
            </Text>

            <View style={styles.deleteTable}>
              <View style={[styles.kv, { borderTopWidth: 0 }]}>
                <Text style={styles.k}>Client</Text>
                <Text style={styles.v}>{orderToDelete.companyName || 'Enterprise Buyer'}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Status</Text>
                <Text style={styles.v}>{statusLabel(orderToDelete.status)}</Text>
              </View>
              <View style={styles.kv}>
                <Text style={styles.k}>Value</Text>
                <Text style={styles.v}>{inr(orderToDelete.netAmount || 0)}</Text>
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
                {isSubmitting ? <ActivityIndicator color={WHITE} size="small" /> : <Text style={styles.saveText}>Delete order</Text>}
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
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 14,
    marginTop: 12,
    backgroundColor: MIST,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: HAIR,
  },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  addBtn: { height: 38, paddingHorizontal: 16, borderRadius: 8, backgroundColor: ORANGE, alignItems: 'center', justifyContent: 'center' },
  addBtnText: { color: WHITE, fontSize: 14, fontWeight: '700' },

  centerBlock: { paddingHorizontal: 32, paddingVertical: 48, alignItems: 'center', gap: 8 },
  loadingText: { fontSize: 14, color: STEEL, marginTop: 6 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: GRAPHITE },
  emptySubtitle: { fontSize: 14, color: STEEL },
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

  // One order: a hairline-separated block, not a card
  order: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: HAIR },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  orderNumber: { fontSize: 15, fontWeight: '700', color: GRAPHITE, fontFamily: MONO },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  statusText: { fontSize: 13, fontWeight: '700' },
  company: { fontSize: 15, fontWeight: '600', color: GRAPHITE, marginTop: 6 },

  tracker: { flexDirection: 'row', gap: 4, marginTop: 14 },
  seg: { flex: 1, height: 4, borderRadius: 2, backgroundColor: MIST },
  stageLabels: { flexDirection: 'row', gap: 4, marginTop: 6, marginBottom: 14 },
  stageLabel: { flex: 1, fontSize: 11, color: STEEL },
  stageLabelOn: { color: GRAPHITE, fontWeight: '700' },

  meta: { fontSize: 13, color: STEEL, marginTop: 2, lineHeight: 19 },

  amountRow: { marginTop: 14, paddingTop: 14, borderTopWidth: 1, borderTopColor: MIST },
  amount: { fontSize: 22, fontWeight: '800', color: GRAPHITE, fontVariant: ['tabular-nums'] },
  amountSub: { fontSize: 12, color: STEEL, marginTop: 2 },

  actions: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 16 },
  deleteLink: { fontSize: 14, fontWeight: '600', color: RED },
  updateBtn: {
    height: 44,
    paddingHorizontal: 22,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: GRAPHITE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  updateBtnText: { fontSize: 14, fontWeight: '700', color: GRAPHITE },

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
  textArea: { height: 84, paddingTop: 12, textAlignVertical: 'top' },
  twoCols: { flexDirection: 'row', gap: 10 },
  statusSelectRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  statusSelect: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: HAIR,
    backgroundColor: WHITE,
  },
  statusSelectActive: { backgroundColor: GRAPHITE, borderColor: GRAPHITE },
  statusSelectText: { fontSize: 13, fontWeight: '600', color: GRAPHITE },
  statusSelectTextActive: { color: WHITE },
  saveBtn: {
    height: 50,
    borderRadius: 8,
    backgroundColor: ORANGE,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 22,
    marginBottom: 10,
  },
  saveText: { color: WHITE, fontSize: 15, fontWeight: '700' },
  disabled: { opacity: 0.6 },

  // Delete
  deleteLead: { fontSize: 15, color: GRAPHITE, lineHeight: 22 },
  deleteTable: { marginTop: 12, marginBottom: 20 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '600', color: GRAPHITE, flexShrink: 1, textAlign: 'right', marginLeft: 16 },
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

export default AdminOrdersScreen;