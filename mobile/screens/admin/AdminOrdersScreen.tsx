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
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Update Status Modal
  const [activeOrder, setActiveOrder] = useState<MobileOrder | null>(null);
  const [isUpdateModalOpen, setIsUpdateModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState<MobileOrder['status']>('PROCESSING');
  const [newTracking, setNewTracking] = useState('');
  const [newCarrier, setNewCarrier] = useState('');

  // Create Order Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [newClientName, setNewClientName] = useState('');
  const [newCompanyName, setNewCompanyName] = useState('');
  const [newShippingAddress, setNewShippingAddress] = useState('');
  const [newCarrierSelect, setNewCarrierSelect] = useState('Blue Dart Express');
  const [newSkuDesc, setNewSkuDesc] = useState('DIN 933 M12x50 Gr 8.8 (Hex Bolts)');
  const [newQuantityKg, setNewQuantityKg] = useState('250');
  const [newAmount, setNewAmount] = useState('32500');

  // Delete Modal
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

  // ============================================================================
  // CRUD: CREATE
  // ============================================================================
  const handleOpenCreate = () => {
    setNewClientName('Vikram Malhotra');
    setNewCompanyName('L&T Mega Structures Ltd.');
    setNewShippingAddress('Plot 18, Phase 2, Industrial Estate, Pune, MH - 411019');
    setIsCreateModalOpen(true);
  };

  const handleCreateOrder = async () => {
    if (!newCompanyName.trim() || !newShippingAddress.trim()) {
      Alert.alert('Validation Error', 'Company name and shipping address are required.');
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
      showToast(`Order #${newOrder.orderNumber} created successfully!`);
    } catch (err: any) {
      Alert.alert('Create Error', err.message || 'Failed to create order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: UPDATE
  // ============================================================================
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
            ? {
                ...o,
                status: newStatus,
                trackingNumber: newTracking.trim(),
                carrier: newCarrier.trim(),
              }
            : o
        )
      );

      setIsUpdateModalOpen(false);
      showToast(`Order #${activeOrder.orderNumber} updated to ${newStatus}!`);
    } catch (err: any) {
      Alert.alert('Update Error', err.message || 'Failed to update order status.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================================
  // CRUD: DELETE
  // ============================================================================
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
      showToast(`Order #${orderToDelete.orderNumber} deleted.`);
      setOrderToDelete(null);
    } catch (err: any) {
      Alert.alert('Delete Error', err.message || 'Failed to delete order record.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const statusFilters = ['All', 'PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'];

  const getStatusVariant = (st: string) => {
    switch (st) {
      case 'DELIVERED':
        return 'success';
      case 'IN_TRANSIT':
      case 'DISPATCHED':
        return 'primary';
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
      {/* Search Bar */}
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Order #, Client, AWB Tracking..."
      />

      {/* Status Filter Chips */}
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

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Control Action Bar */}
      <View style={styles.controlBar}>
        <View>
          <Text style={styles.resultsCount}>{orders.length} Active Consignments</Text>
          <Text style={styles.subCount}>Real-time logistics dispatch pipeline</Text>
        </View>

        <TouchableOpacity
          style={styles.addOrderBtn}
          onPress={handleOpenCreate}
          activeOpacity={0.85}
        >
          <Text style={styles.addOrderBtnText}>➕ New Dispatch</Text>
        </TouchableOpacity>
      </View>

      {/* Order List */}
      {isLoading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0052CC" />
          <Text style={styles.loadingText}>Loading factory dispatch records...</Text>
        </View>
      ) : orders.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No Orders Found</Text>
          <Text style={styles.emptySubtitle}>No consignments match your search or filter.</Text>
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedStatus('All'); }} style={styles.resetBtn}>
            <Text style={styles.resetBtnText}>Clear Filters</Text>
          </TouchableOpacity>
        </View>
      ) : (
        orders.map((order) => (
          <MobileCard key={order.id}>
            <View style={styles.rowBetween}>
              <View>
                <Text style={styles.orderNumber}>{order.orderNumber}</Text>
                <Text style={styles.companyName}>{order.companyName || 'Enterprise Buyer'}</Text>
              </View>
              <MobileBadge
                label={order.status}
                variant={getStatusVariant(order.status) as any}
                size="sm"
              />
            </View>

            {/* Address */}
            <Text style={styles.addressText} numberOfLines={2}>
              📍 {order.shippingAddress || 'Plant Dispatch Center'}
            </Text>

            {/* Logistics Info */}
            <View style={styles.logisticsBox}>
              <Text style={styles.carrierText}>
                🚚 {order.carrier || 'Express Logistics'}{' '}
                {order.trackingNumber ? `• AWB: ${order.trackingNumber}` : '• Pending AWB'}
              </Text>
              <Text style={styles.weightText}>
                Weight: {(order.totalWeightKg || 120).toLocaleString()} Kg
              </Text>
            </View>

            {/* Order Value & Items */}
            <View style={styles.rowBetween}>
              <Text style={styles.itemsCount}>
                📦 {order.items ? order.items.length : 1} Line Items
              </Text>
              <Text style={styles.amountText}>
                ₹{(order.netAmount || 0).toLocaleString()}
              </Text>
            </View>

            {/* Action Buttons: Delete & Update Status */}
            <View style={styles.cardActionsRow}>
              <TouchableOpacity
                onPress={() => handlePromptDelete(order)}
                style={styles.deleteBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.deleteBtnText}>🗑 Delete</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleOpenUpdate(order)}
                style={styles.updateBtn}
                activeOpacity={0.85}
              >
                <Text style={styles.updateBtnText}>⚡ Update Dispatch Status</Text>
              </TouchableOpacity>
            </View>
          </MobileCard>
        ))
      )}

      {/* ====================================================================== */}
      {/* MODAL 1: CREATE DISPATCH ORDER                                         */}
      {/* ====================================================================== */}
      <MobileModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Factory Dispatch Order"
      >
        <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
          <Text style={styles.modalSubtitle}>
            Initiate a plant clearance consignment directly in the ERP pipeline.
          </Text>

          <Text style={styles.inputLabel}>Enterprise Company Name *</Text>
          <TextInput
            style={styles.textInput}
            value={newCompanyName}
            onChangeText={setNewCompanyName}
            placeholder="e.g. Apex Infrastructure Pvt Ltd"
          />

          <Text style={styles.inputLabel}>Procurement Officer / Contact</Text>
          <TextInput
            style={styles.textInput}
            value={newClientName}
            onChangeText={setNewClientName}
            placeholder="e.g. Rajesh Sharma"
          />

          <Text style={styles.inputLabel}>Plant Delivery Address *</Text>
          <TextInput
            style={styles.textInput}
            value={newShippingAddress}
            onChangeText={setNewShippingAddress}
            placeholder="Complete warehouse or site address with PIN"
            multiline
          />

          <Text style={styles.inputLabel}>Freight Logistics Carrier</Text>
          <TextInput
            style={styles.textInput}
            value={newCarrierSelect}
            onChangeText={setNewCarrierSelect}
            placeholder="Blue Dart / TCI Freight / Safexpress"
          />

          <Text style={styles.inputLabel}>Fastener Manifest Description</Text>
          <TextInput
            style={styles.textInput}
            value={newSkuDesc}
            onChangeText={setNewSkuDesc}
            placeholder="e.g. DIN 933 M12x50 Grade 8.8 (Hex Bolts)"
          />

          <View style={styles.rowTwoCols}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Weight (Kg)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={newQuantityKg}
                onChangeText={setNewQuantityKg}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Invoice Value (₹)</Text>
              <TextInput
                style={styles.textInput}
                keyboardType="numeric"
                value={newAmount}
                onChangeText={setNewAmount}
              />
            </View>
          </View>

          <TouchableOpacity
            onPress={handleCreateOrder}
            style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
            disabled={isSubmitting}
            activeOpacity={0.88}
          >
            {isSubmitting ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <Text style={styles.saveBtnText}>Generate Order &amp; Dispatch →</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* ====================================================================== */}
      {/* MODAL 2: UPDATE STATUS & AWB                                           */}
      {/* ====================================================================== */}
      {activeOrder ? (
        <MobileModal
          isOpen={isUpdateModalOpen}
          onClose={() => setIsUpdateModalOpen(false)}
          title={`Update Order: ${activeOrder.orderNumber}`}
        >
          <ScrollView style={styles.modalScroll} keyboardShouldPersistTaps="handled">
            <Text style={styles.modalSubtitle}>
              Update logistics status, carrier assignment, and live AWB tracking.
            </Text>

            <Text style={styles.inputLabel}>Dispatch Status</Text>
            <View style={styles.statusButtonsRow}>
              {(['PROCESSING', 'DISPATCHED', 'IN_TRANSIT', 'DELIVERED', 'CANCELLED'] as const).map(
                (st) => (
                  <TouchableOpacity
                    key={st}
                    style={[styles.statusSelectBtn, newStatus === st && styles.statusSelectBtnActive]}
                    onPress={() => setNewStatus(st)}
                  >
                    <Text
                      style={[
                        styles.statusSelectBtnText,
                        newStatus === st && styles.statusSelectBtnTextActive,
                      ]}
                    >
                      {st}
                    </Text>
                  </TouchableOpacity>
                )
              )}
            </View>

            <Text style={styles.inputLabel}>Logistics Carrier</Text>
            <TextInput
              style={styles.textInput}
              value={newCarrier}
              onChangeText={setNewCarrier}
              placeholder="e.g. Blue Dart Express Heavy"
            />

            <Text style={styles.inputLabel}>AWB Tracking Number</Text>
            <TextInput
              style={styles.textInput}
              value={newTracking}
              onChangeText={setNewTracking}
              placeholder="e.g. BD-889921447IN"
              autoCapitalize="characters"
            />

            <TouchableOpacity
              onPress={handleSaveStatus}
              style={[styles.saveBtn, isSubmitting && styles.btnDisabled]}
              disabled={isSubmitting}
              activeOpacity={0.88}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <Text style={styles.saveBtnText}>Broadcast Logistics Update →</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </MobileModal>
      ) : null}

      {/* ====================================================================== */}
      {/* MODAL 3: DELETE CONFIRMATION                                           */}
      {/* ====================================================================== */}
      {orderToDelete ? (
        <MobileModal
          isOpen={isDeleteModalOpen}
          onClose={() => setIsDeleteModalOpen(false)}
          title="Delete Consignment"
        >
          <View style={styles.modalScroll}>
            <View style={styles.deleteWarningBox}>
              <Text style={styles.deleteWarningIcon}>⚠</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.deleteWarningTitle}>Delete Order Confirmation</Text>
                <Text style={styles.deleteWarningText}>
                  Are you sure you want to delete order <Text style={{ fontWeight: '800' }}>#{orderToDelete.orderNumber}</Text>?
                </Text>
              </View>
            </View>

            <Text style={styles.deleteItemMeta}>
              • Client: {orderToDelete.companyName || 'Enterprise Buyer'}{'\n'}
              • Status: {orderToDelete.status}{'\n'}
              • Value: ₹{(orderToDelete.netAmount || 0).toLocaleString()}
            </Text>

            <View style={styles.modalActionsRow}>
              <TouchableOpacity
                onPress={() => setIsDeleteModalOpen(false)}
                style={styles.cancelBtn}
                disabled={isSubmitting}
              >
                <Text style={styles.cancelBtnText}>Cancel</Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleConfirmDelete}
                style={[styles.confirmDeleteBtn, isSubmitting && styles.btnDisabled]}
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Confirm Delete</Text>
                )}
              </TouchableOpacity>
            </View>
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
    marginBottom: 4,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    marginRight: 8,
    borderWidth: 1,
  },
  chipActive: {
    backgroundColor: '#0F172A',
    borderColor: '#0F172A',
  },
  chipInactive: {
    backgroundColor: '#FFFFFF',
    borderColor: '#CBD5E1',
  },
  chipText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  chipTextActive: {
    color: '#FFFFFF',
  },
  controlBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  resultsCount: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  subCount: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
  },
  addOrderBtn: {
    backgroundColor: '#0052CC',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    elevation: 2,
  },
  addOrderBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderColor: '#10B981',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
    textAlign: 'center',
  },
  loadingContainer: {
    padding: 40,
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: '#64748B',
    fontSize: 13,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 4,
  },
  resetBtn: {
    marginTop: 12,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  orderNumber: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052CC',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  addressText: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 6,
    lineHeight: 17,
  },
  logisticsBox: {
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  carrierText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  weightText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 3,
  },
  itemsCount: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  cardActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  updateBtn: {
    flex: 1,
    backgroundColor: '#0F172A',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  updateBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  deleteBtnText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '700',
  },
  modalScroll: {
    paddingVertical: 6,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#0F172A',
    backgroundColor: '#FFFFFF',
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 10,
  },
  statusButtonsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 8,
  },
  statusSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  statusSelectBtnActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  statusSelectBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  statusSelectBtnTextActive: {
    color: '#FFFFFF',
  },
  saveBtn: {
    backgroundColor: '#0052CC',
    height: 46,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 18,
    marginBottom: 10,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  btnDisabled: {
    opacity: 0.6,
  },
  deleteWarningBox: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#F87171',
    borderRadius: 8,
    padding: 12,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 12,
  },
  deleteWarningIcon: {
    fontSize: 18,
    color: '#DC2626',
  },
  deleteWarningTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#991B1B',
  },
  deleteWarningText: {
    fontSize: 12,
    color: '#B91C1C',
    marginTop: 2,
    lineHeight: 17,
  },
  deleteItemMeta: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 20,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    marginBottom: 16,
  },
  modalActionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  cancelBtn: {
    flex: 1,
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#475569',
    fontWeight: '700',
    fontSize: 13,
  },
  confirmDeleteBtn: {
    flex: 1,
    backgroundColor: '#DC2626',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  confirmDeleteBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

export default AdminOrdersScreen;
