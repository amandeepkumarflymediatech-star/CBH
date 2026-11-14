import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Platform,
} from 'react-native';
import { NavIcon } from '../../components/NavIcon';
import { OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileOrder, MobileRfq, MobileProduct } from '../../types';

interface AdminDashboardScreenProps {
  onNavigate: (tabId: string) => void;
  onSelectOrder?: (order: MobileOrder) => void;
  onSelectRfq?: (rfq: MobileRfq) => void;
}

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const ORANGE = '#D97706';
const GREEN = '#16A34A';
const RED = '#DC2626';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const inr = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 0 })}`;
const statusLabel = (s: string) => {
  const t = s.replace(/_/g, ' ').toLowerCase();
  return t.charAt(0).toUpperCase() + t.slice(1);
};

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({
  onNavigate,
  onSelectOrder,
}) => {
  const [orders, setOrders] = useState<MobileOrder[]>([]);
  const [rfqs, setRfqs] = useState<MobileRfq[]>([]);
  const [productsTotal, setProductsTotal] = useState<number>(0);
  const [usersCount, setUsersCount] = useState<number>(12);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [ordersRes, rfqRes, prodRes, usersRes] = await Promise.all([
        mobileApi.orders.getAll(),
        mobileApi.rfq.getAll(),
        mobileApi.products.getAll({ limit: 50 }),
        mobileApi.users.getAll(),
      ]);

      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (rfqRes.quotes) setRfqs(rfqRes.quotes);
      if (prodRes.products) {
        setProductsTotal(prodRes.stats?.total ?? prodRes.total ?? prodRes.count ?? prodRes.products.length);
      }
      if (usersRes.users) setUsersCount(usersRes.users.length);
    } catch (err) {
      console.warn('[Admin Dashboard] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const totalRevenue = useMemo(() => orders.reduce((sum, o) => sum + (o.netAmount || 0), 0), [orders]);

  const totalWeightTons = useMemo(() => {
    const totalKg = orders.reduce((sum, o) => sum + (o.totalWeightKg || 0), 0);
    return (totalKg / 1000).toFixed(1);
  }, [orders]);

  const pendingOrders = useMemo(
    () => orders.filter((o) => o.status === 'PROCESSING' || o.status === 'CONFIRMED'),
    [orders]
  );

  const pendingRfqs = useMemo(
    () => rfqs.filter((r) => r.status === 'PENDING' || r.status === 'IN_REVIEW'),
    [rfqs]
  );

  const statusStats = useMemo(() => {
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const inTransit = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED').length;
    const processing = orders.filter((o) => o.status === 'PROCESSING').length;
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED').length;
    return { delivered, inTransit, processing, confirmed };
  }, [orders]);

  const kpis = [
    { id: 'orders', label: 'Invoiced Revenue', value: inr(totalRevenue), sub: `${orders.length} orders total`, icon: 'orders', color: BLUE },
    { id: 'orders', label: 'Dispatches', value: String(pendingOrders.length), sub: 'Ready to ship', icon: 'orders', color: ORANGE, warn: pendingOrders.length > 0 },
    { id: 'rfqs', label: 'Pending RFQs', value: String(pendingRfqs.length), sub: `${rfqs.length} total quotes`, icon: 'rfqs', color: pendingRfqs.length > 0 ? RED : GREEN, warn: pendingRfqs.length > 0 },
    { id: 'products', label: 'Catalog SKUs', value: productsTotal.toLocaleString('en-IN'), sub: `${totalWeightTons} MT shipped`, icon: 'products', color: STEEL },
  ];

  const quickNav = [
    { id: 'products', title: 'Products', icon: 'products' },
    { id: 'orders', title: 'Orders', icon: 'orders' },
    { id: 'rfqs', title: 'RFQs', icon: 'rfqs' },
    { id: 'surplus', title: 'Surplus', icon: 'catalog' },
    { id: 'payments', title: 'Payments', icon: 'lock' },
    { id: 'users', title: 'Clients', icon: 'users' },
  ];

  const orderColor = (s: string) =>
    s === 'DELIVERED' ? GREEN : s === 'IN_TRANSIT' || s === 'DISPATCHED' ? GRAPHITE : ORANGE;

  return (
    <ScrollView
      style={{ backgroundColor: '#F8FAFC' }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} colors={[BLUE]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Top Plant Operations Header - Compact */}
      <View style={styles.topBar}>
        <View style={styles.topBarLeft}>
          <View style={styles.onlineDot} />
          <Text style={styles.plantTitle}>LDH-DC1 Central Plant Online</Text>
        </View>
        <TouchableOpacity
          onPress={() => loadData(true)}
          style={styles.syncBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.syncBtnText}>{isRefreshing ? 'Syncing...' : 'Sync Data'}</Text>
        </TouchableOpacity>
      </View>

      {/* KPI 2x2 Grid - High Density */}
      <View style={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <TouchableOpacity
            key={i}
            onPress={() => onNavigate(k.id)}
            style={[styles.kpiCard, k.warn && styles.kpiCardWarn]}
            activeOpacity={0.7}
          >
            <View style={styles.kpiRow}>
              <Text style={styles.kpiLabel}>{k.label}</Text>
              {k.warn ? <View style={styles.warnDot} /> : null}
            </View>
            <Text style={[styles.kpiNum, { color: k.color }]}>{k.value}</Text>
            <Text style={styles.kpiSub}>{k.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Quick Navigation Action Pills */}
      <View style={styles.quickNavStrip}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.quickNavScroll}>
          {quickNav.map((q) => (
            <TouchableOpacity
              key={q.id}
              onPress={() => onNavigate(q.id)}
              style={styles.navPill}
              activeOpacity={0.75}
            >
              <NavIcon name={q.icon as any} color={GRAPHITE} size={13} />
              <Text style={styles.navPillText}>{q.title}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Dispatch Pipeline Overview Strip */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Live Dispatch Pipeline</Text>
          <TouchableOpacity onPress={() => onNavigate('orders')}>
            <Text style={styles.cardLink}>View All ({orders.length}) →</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.pipelineRow}>
          <View style={styles.pipeCol}>
            <Text style={[styles.pipeVal, { color: ORANGE }]}>{statusStats.processing}</Text>
            <Text style={styles.pipeLbl}>Processing</Text>
          </View>
          <View style={styles.pipeDivider} />
          <View style={styles.pipeCol}>
            <Text style={[styles.pipeVal, { color: BLUE }]}>{statusStats.confirmed}</Text>
            <Text style={styles.pipeLbl}>Confirmed</Text>
          </View>
          <View style={styles.pipeDivider} />
          <View style={styles.pipeCol}>
            <Text style={[styles.pipeVal, { color: GRAPHITE }]}>{statusStats.inTransit}</Text>
            <Text style={styles.pipeLbl}>In Transit</Text>
          </View>
          <View style={styles.pipeDivider} />
          <View style={styles.pipeCol}>
            <Text style={[styles.pipeVal, { color: GREEN }]}>{statusStats.delivered}</Text>
            <Text style={styles.pipeLbl}>Delivered</Text>
          </View>
        </View>
      </View>

      {/* Recent Dispatches - High Density List */}
      <View style={styles.sectionCard}>
        <View style={styles.cardHeader}>
          <Text style={styles.cardTitle}>Recent Dispatches</Text>
          <TouchableOpacity onPress={() => onNavigate('orders')}>
            <Text style={styles.cardLink}>Manage</Text>
          </TouchableOpacity>
        </View>

        {isLoading ? (
          <View style={{ gap: 6 }}>
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </View>
        ) : orders.length === 0 ? (
          <Text style={styles.emptyNote}>No orders recorded yet.</Text>
        ) : (
          orders.slice(0, 3).map((order) => (
            <TouchableOpacity
              key={order.id}
              style={styles.orderRow}
              activeOpacity={0.7}
              onPress={() => (onSelectOrder ? onSelectOrder(order) : onNavigate('orders'))}
            >
              <View style={styles.orderLeft}>
                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderNum}>{order.orderNumber}</Text>
                  <View style={[styles.statusPill, { backgroundColor: orderColor(order.status) + '15' }]}>
                    <Text style={[styles.statusPillText, { color: orderColor(order.status) }]}>
                      {statusLabel(order.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderCompany} numberOfLines={1}>
                  {order.companyName || order.customerName || 'Direct B2B Buyer'}
                </Text>
              </View>

              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{inr(order.netAmount || 0)}</Text>
                <Text style={styles.orderWeight}>{order.totalWeightKg || 0} kg</Text>
              </View>
            </TouchableOpacity>
          ))
        )}
      </View>

      {/* Urgent RFQs - High Density */}
      {rfqs.length > 0 && (
        <View style={styles.sectionCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Pending RFQs ({pendingRfqs.length})</Text>
            <TouchableOpacity onPress={() => onNavigate('rfqs')}>
              <Text style={styles.cardLink}>Review Quotes →</Text>
            </TouchableOpacity>
          </View>

          {rfqs.slice(0, 2).map((rfq) => (
            <TouchableOpacity
              key={rfq.id}
              style={styles.orderRow}
              activeOpacity={0.7}
              onPress={() => onNavigate('rfqs')}
            >
              <View style={styles.orderLeft}>
                <View style={styles.orderHeaderRow}>
                  <Text style={styles.orderNum}>{rfq.rfqNumber}</Text>
                  <View style={[styles.statusPill, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.statusPillText, { color: '#B45309' }]}>
                      {statusLabel(rfq.status)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.orderCompany} numberOfLines={1}>
                  {rfq.companyName || rfq.customerName}
                </Text>
              </View>

              <View style={styles.orderRight}>
                <Text style={styles.orderAmount}>{inr(rfq.estimatedValue || 0)}</Text>
                <Text style={styles.orderWeight}>{rfq.items?.length || 1} items</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 12,
    paddingBottom: 24,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: WHITE,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  topBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  onlineDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: GREEN,
  },
  plantTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAPHITE,
  },
  syncBtn: {
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  syncBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUE,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 10,
  },
  kpiCard: {
    width: '48.5%',
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  kpiCardWarn: {
    borderColor: '#FED7AA',
    backgroundColor: '#FFFBEB',
  },
  kpiRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  kpiLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: STEEL,
    textTransform: 'uppercase',
  },
  warnDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: ORANGE,
  },
  kpiNum: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: MONO,
    marginBottom: 2,
  },
  kpiSub: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  quickNavStrip: {
    marginBottom: 10,
  },
  quickNavScroll: {
    gap: 6,
  },
  navPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: WHITE,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  navPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: GRAPHITE,
  },
  sectionCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 6,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: GRAPHITE,
  },
  cardLink: {
    fontSize: 11,
    fontWeight: '700',
    color: BLUE,
  },
  pipelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    paddingVertical: 4,
  },
  pipeCol: {
    alignItems: 'center',
  },
  pipeVal: {
    fontSize: 14,
    fontWeight: '800',
    fontFamily: MONO,
  },
  pipeLbl: {
    fontSize: 9,
    color: STEEL,
    fontWeight: '600',
    marginTop: 2,
  },
  pipeDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E2E8F0',
  },
  orderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F8FAFC',
  },
  orderLeft: {
    flex: 1,
    paddingRight: 8,
  },
  orderHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  orderNum: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
  },
  statusPill: {
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  statusPillText: {
    fontSize: 9,
    fontWeight: '700',
  },
  orderCompany: {
    fontSize: 11,
    color: STEEL,
  },
  orderRight: {
    alignItems: 'flex-end',
  },
  orderAmount: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
  },
  orderWeight: {
    fontSize: 10,
    color: LIGHT_STEEL,
    fontFamily: MONO,
  },
  emptyNote: {
    fontSize: 11,
    color: LIGHT_STEEL,
    textAlign: 'center',
    paddingVertical: 10,
  },
});
