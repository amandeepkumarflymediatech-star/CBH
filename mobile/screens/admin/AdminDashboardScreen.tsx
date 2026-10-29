import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { mobileApi } from '../../config/api';
import { MobileOrder, MobileRfq, MobileProduct } from '../../types';

interface AdminDashboardScreenProps {
  onNavigate: (tabId: string) => void;
  onSelectOrder?: (order: MobileOrder) => void;
  onSelectRfq?: (rfq: MobileRfq) => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigate,
  onSelectOrder,
  onSelectRfq,
}) => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [erpStatus, setErpStatus] = useState<any>({ status: 'CONNECTED', latencyMs: 42 });
  const [isRefreshing, setIsRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const [ordersRes, rfqRes, prodRes, erpRes] = await Promise.all([
        mobileApi.orders.getAll(),
        mobileApi.rfq.getAll(),
        mobileApi.products.getAll({ limit: 10 }),
        mobileApi.erpnext.getStatus(),
      ]);

      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (rfqRes.quotes) setRfqs(rfqRes.quotes);
      if (prodRes.products) setProducts(prodRes.products);
      if (erpRes) setErpStatus(erpRes);
    } catch (err) {
      console.warn('[Admin Dashboard] Fetch error:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
  const pendingOrders = orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED');
  const pendingRfqs = rfqs.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW');

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Telemetry Node Header Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={styles.nodeStatus}>
            <View style={styles.greenDot} />
            <Text style={styles.nodeText}>NODE: LUDHIANA-HQ-DC1</Text>
          </View>

          <TouchableOpacity
            onPress={() => {
              setIsRefreshing(true);
              loadData();
            }}
            style={styles.syncBtn}
          >
            <Text style={styles.syncBtnText}>
              {isRefreshing ? 'Syncing...' : '↻ Sync'}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.revenueWrap}>
          <Text style={styles.bannerLabel}>Total Dispatched Volume (30D)</Text>
          <Text style={styles.bannerValue}>₹{totalRevenue.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.bannerFooter}>
          <Text style={styles.footerText}>ERPNext: {erpStatus?.status || 'ONLINE'}</Text>
          <Text style={styles.footerText}>PING: {erpStatus?.latencyMs || 42}ms</Text>
        </View>
      </View>

      {/* KPI 2x2 Grid */}
      <View style={styles.kpiGrid}>
        <MobileCard onPress={() => onNavigate('orders')} style={styles.kpiCard}>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiTitle}>Active Orders</Text>
            <Text style={styles.kpiIcon}>📦</Text>
          </View>
          <Text style={styles.kpiNum}>{orders.length}</Text>
          <Text style={styles.kpiSub}>{pendingOrders.length} pending dispatch</Text>
        </MobileCard>

        <MobileCard onPress={() => onNavigate('rfqs')} style={styles.kpiCard}>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiTitle}>Open RFQs</Text>
            <Text style={styles.kpiIcon}>📄</Text>
          </View>
          <Text style={styles.kpiNum}>{rfqs.length}</Text>
          <Text style={[styles.kpiSub, { color: '#D97706' }]}>
            {pendingRfqs.length} require review
          </Text>
        </MobileCard>

        <MobileCard onPress={() => onNavigate('products')} style={styles.kpiCard}>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiTitle}>Inventory SKUs</Text>
            <Text style={styles.kpiIcon}>🔩</Text>
          </View>
          <Text style={styles.kpiNum}>{products.length ? `${products.length}+` : '150+'}</Text>
          <Text style={styles.kpiSub}>DIN 933 / 912 / ISO</Text>
        </MobileCard>

        <MobileCard onPress={() => onNavigate('users')} style={styles.kpiCard}>
          <View style={styles.kpiRow}>
            <Text style={styles.kpiTitle}>B2B Accounts</Text>
            <Text style={styles.kpiIcon}>👥</Text>
          </View>
          <Text style={styles.kpiNum}>48</Text>
          <Text style={[styles.kpiSub, { color: '#6366F1' }]}>94% KYC Verified</Text>
        </MobileCard>
      </View>

      {/* Quick Actions */}
      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>⚡ Quick Dispatch Actions</Text>
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.actionsScroll}>
        <TouchableOpacity
          onPress={() => onNavigate('orders')}
          style={styles.actionChip}
        >
          <Text style={styles.actionIcon}>📦</Text>
          <Text style={styles.actionText}>Process Dispatches</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('rfqs')}
          style={styles.actionChip}
        >
          <Text style={styles.actionIcon}>📄</Text>
          <Text style={styles.actionText}>Approve RFQ Margins</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => onNavigate('products')}
          style={styles.actionChip}
        >
          <Text style={styles.actionIcon}>🔩</Text>
          <Text style={styles.actionText}>Adjust Stock Levels</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Recent Orders Pipeline */}
      <View style={[styles.sectionHeader, { marginTop: 14 }]}>
        <Text style={styles.sectionTitle}>Recent Orders Pipeline</Text>
        <TouchableOpacity onPress={() => onNavigate('orders')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      {orders.slice(0, 3).map((order) => (
        <MobileCard
          key={order.id}
          onPress={() => (onSelectOrder ? onSelectOrder(order) : onNavigate('orders'))}
        >
          <View style={styles.orderTop}>
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

          <Text style={styles.companyName}>
            {order.companyName || order.customerName}
          </Text>
          <Text style={styles.orderDetails}>
            {order.totalWeightKg} Kg • {order.carrier || 'Express'}
          </Text>

          <View style={styles.orderDivider} />

          <View style={styles.orderBottom}>
            <Text style={styles.orderValueLabel}>Order Value:</Text>
            <Text style={styles.orderValue}>
              ₹{order.netAmount?.toLocaleString('en-IN')}
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
  banner: {
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 16,
    gap: 12,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  nodeStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  greenDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  nodeText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '700',
  },
  syncBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  syncBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },
  revenueWrap: {
    marginTop: 2,
  },
  bannerLabel: {
    fontSize: 11,
    color: '#94A3B8',
    textTransform: 'uppercase',
  },
  bannerValue: {
    fontSize: 24,
    fontWeight: '800',
    color: '#38BDF8',
    marginTop: 2,
  },
  bannerFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingTop: 8,
  },
  footerText: {
    fontSize: 11,
    color: '#CBD5E1',
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  kpiCard: {
    width: '48%',
    marginBottom: 0,
  },
  kpiRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  kpiTitle: {
    fontSize: 12,
    fontWeight: '600',
    color: '#64748B',
  },
  kpiIcon: {
    fontSize: 14,
  },
  kpiNum: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 4,
  },
  kpiSub: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '600',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  sectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  viewAllText: {
    fontSize: 12,
    color: '#0052CC',
    fontWeight: '600',
  },
  actionsScroll: {
    flexDirection: 'row',
    marginBottom: 4,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    marginRight: 8,
  },
  actionIcon: {
    fontSize: 13,
  },
  actionText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderNumber: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
  },
  companyName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  orderDetails: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  orderDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderValueLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  orderValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
});

export default AdminDashboardScreen;
