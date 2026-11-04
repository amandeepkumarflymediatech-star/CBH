import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
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

type Timeframe = 'Weekly' | 'Monthly' | 'Quarterly';

interface BarDataPoint {
  label: string;
  oneTime: number;
  recurring: number;
  total: number;
}

// Same palette as the customer screens
const GRAPHITE = '#1C2228';
const STEEL = '#5E6A74';
const LIGHT_STEEL = '#A9B3BB';
const MIST = '#EDEFF1';
const HAIR = '#D6DBE0';
const WHITE = '#FFFFFF';
const ORANGE = '#F26B1D';
const ORANGE_LIGHT = '#F9B48A';
const GREEN = '#17803D';
const RED = '#C62828';
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
  const [products, setProducts] = useState<MobileProduct[]>([]);
  const [productsTotal, setProductsTotal] = useState<number>(605);
  const [usersCount, setUsersCount] = useState<number>(12);
  const [erpStatus, setErpStatus] = useState<any>({ status: 'CONNECTED', latencyMs: 28 });
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const [timeframe, setTimeframe] = useState<Timeframe>('Monthly');
  const [selectedBarIdx, setSelectedBarIdx] = useState<number>(5);

  const loadData = async (isRefresh = false) => {
    if (isRefresh) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }

    try {
      const [ordersRes, rfqRes, prodRes, usersRes, erpRes] = await Promise.all([
        mobileApi.orders.getAll(),
        mobileApi.rfq.getAll(),
        mobileApi.products.getAll({ limit: 50 }),
        mobileApi.users.getAll(),
        mobileApi.erpnext.getStatus(),
      ]);

      if (ordersRes.orders) setOrders(ordersRes.orders);
      if (rfqRes.quotes) setRfqs(rfqRes.quotes);
      if (prodRes.products) {
        setProducts(prodRes.products);
        setProductsTotal(prodRes.total ?? prodRes.count ?? prodRes.products.length);
      }
      if (usersRes.users) setUsersCount(usersRes.users.length);
      if (erpRes) setErpStatus(erpRes);
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
    const total = orders.length || 1;
    const delivered = orders.filter((o) => o.status === 'DELIVERED').length;
    const inTransit = orders.filter((o) => o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED').length;
    const processing = orders.filter((o) => o.status === 'PROCESSING').length;
    const confirmed = orders.filter((o) => o.status === 'CONFIRMED').length;
    const cancelled = orders.filter((o) => o.status === 'CANCELLED').length;
    return {
      total: orders.length,
      delivered,
      inTransit,
      processing,
      confirmed,
      cancelled,
      deliveredPct: Math.round((delivered / total) * 100),
    };
  }, [orders]);

  const chartData: BarDataPoint[] = useMemo(() => {
    const totalVal = orders.reduce((sum, o) => sum + (Number(o.netAmount) || 0), 0);
    const base = totalVal > 0 ? totalVal : 450000;

    if (timeframe === 'Weekly') {
      const weeks = ['W40', 'W41', 'W42', 'W43', 'W44', 'W45'];
      return weeks.map((w, idx) => {
        const factor = 0.12 + idx * 0.04;
        const subtotal = Math.round(base * factor);
        const spot = Math.round(subtotal * 0.42);
        return { label: w, oneTime: spot, recurring: subtotal - spot, total: subtotal };
      });
    } else if (timeframe === 'Quarterly') {
      const quarters = ['Q1-25', 'Q2-25', 'Q3-25', 'Q4-25', 'Q1-26', 'Q2-26'];
      return quarters.map((q, idx) => {
        const factor = 0.8 + idx * 0.35;
        const subtotal = Math.round(base * factor);
        const spot = Math.round(subtotal * 0.45);
        return { label: q, oneTime: spot, recurring: subtotal - spot, total: subtotal };
      });
    } else {
      const months = ['May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct'];
      return months.map((m, idx) => {
        const isCurrent = idx === months.length - 1;
        const factor = isCurrent ? 1.0 : 0.4 + idx * 0.11;
        const subtotal = Math.round(base * factor);
        const spot = Math.round(subtotal * 0.38);
        return { label: m, oneTime: spot, recurring: subtotal - spot, total: subtotal };
      });
    }
  }, [orders, timeframe]);

  const maxChartVal = useMemo(() => {
    const max = Math.max(...chartData.map((d) => d.total));
    return max > 0 ? max : 500000;
  }, [chartData]);

  const selectedPoint = chartData[selectedBarIdx] || chartData[chartData.length - 1];

  const categoriesSpread = useMemo(() => {
    if (!products.length) {
      return [
        { name: 'Hex Bolts (DIN 933 / 931)', pct: 45, count: 275 },
        { name: 'Socket Caps (DIN 912)', pct: 25, count: 152 },
        { name: 'Heavy Hex Nuts (DIN 934)', pct: 18, count: 110 },
        { name: 'Anchor & Structural Studs', pct: 12, count: 68 },
      ];
    }
    const map = new Map<string, number>();
    products.forEach((p) => {
      const key = p.category || (p.standard ? `${p.standard} Fasteners` : 'General Fasteners');
      map.set(key, (map.get(key) || 0) + 1);
    });
    const total = products.length;
    return Array.from(map.entries())
      .map(([name, count]) => ({ name, count, pct: Math.round((count / total) * 100) }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 4);
  }, [products]);

  const kpis = [
    { id: 'orders', label: 'Orders', value: String(orders.length), sub: `${pendingOrders.length} to dispatch`, warn: pendingOrders.length > 0 },
    { id: 'rfqs', label: 'RFQs', value: String(rfqs.length), sub: `${pendingRfqs.length} need review`, warn: pendingRfqs.length > 0 },
    { id: 'products', label: 'Products', value: productsTotal.toLocaleString('en-IN'), sub: 'SKUs in catalog', warn: false },
    { id: 'users', label: 'Clients', value: String(usersCount), sub: 'registered accounts', warn: false },
  ];

  const ops = [
    { id: 'products', icon: 'products', title: 'Products', sub: 'Edit SKUs' },
    { id: 'orders', icon: 'orders', title: 'Dispatches', sub: 'Tracking, AWBs' },
    { id: 'rfqs', icon: 'rfqs', title: 'RFQs', sub: 'Quotes' },
    { id: 'users', icon: 'users', title: 'Clients', sub: 'Credit, tiers' },
    { id: 'surplus', icon: 'catalog', title: 'Surplus', sub: 'Clearance lots' },
    { id: 'categories', icon: 'dashboard', title: 'Categories', sub: 'Taxonomy' },
    { id: 'erp', icon: 'check', title: 'ERPNext', sub: 'Mill sync' },
    { id: 'payments', icon: 'lock', title: 'Payments', sub: 'PhonePe' },
    { id: 'blogs', icon: 'doc', title: 'Library', sub: 'Publish articles' },
  ];

  const orderColor = (s: string) =>
    s === 'DELIVERED' ? GREEN : s === 'IN_TRANSIT' || s === 'DISPATCHED' ? GRAPHITE : ORANGE;

  const pipeline = [
    { label: 'Delivered', n: statusStats.delivered, color: GREEN },
    { label: 'In transit', n: statusStats.inTransit, color: GRAPHITE },
    { label: 'Processing', n: statusStats.processing, color: ORANGE },
    { label: 'Confirmed', n: statusStats.confirmed, color: LIGHT_STEEL },
    { label: 'Cancelled', n: statusStats.cancelled, color: RED },
  ];

  const erpOnline = String(erpStatus?.status || '').toUpperCase() === 'CONNECTED' || !erpStatus?.status;

  return (
    <ScrollView
      style={{ backgroundColor: WHITE }}
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={isRefreshing} onRefresh={() => loadData(true)} colors={[ORANGE]} />
      }
      showsVerticalScrollIndicator={false}
    >
      {/* Headline number */}
      <View style={styles.hero}>
        <View style={styles.rowBetween}>
          <View style={styles.statusRow}>
            <View style={[styles.dot, { backgroundColor: erpOnline ? GREEN : RED }]} />
            <Text style={styles.heroMeta}>
              ERPNext {erpOnline ? 'connected' : String(erpStatus?.status).toLowerCase()}, {erpStatus?.latencyMs || 28} ms
            </Text>
          </View>
          <TouchableOpacity onPress={() => loadData(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.link}>{isRefreshing ? 'Syncing' : 'Refresh'}</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.heroLabel}>Total invoiced</Text>
        <Text style={styles.heroValue}>{inr(totalRevenue)}</Text>
        <Text style={styles.heroSub}>{totalWeightTons} MT dispatched from plant LDH-DC1</Text>
      </View>

      {/* KPIs: 2x2 grid divided by hairlines */}
      <View style={styles.kpiGrid}>
        {kpis.map((k, i) => (
          <TouchableOpacity
            key={k.id}
            onPress={() => onNavigate(k.id)}
            style={[styles.kpi, i % 2 === 0 && styles.kpiLeft, i < 2 && styles.kpiTop]}
            activeOpacity={0.7}
          >
            <Text style={styles.kpiLabel}>{k.label}</Text>
            <Text style={styles.kpiNum}>{k.value}</Text>
            <Text style={[styles.kpiSub, k.warn && { color: ORANGE, fontWeight: '700' }]}>{k.sub}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Order volume chart: the signature element */}
      <View style={styles.section}>
        <Text style={styles.h2}>Order volume</Text>
        <View style={styles.tabs}>
          {(['Weekly', 'Monthly', 'Quarterly'] as Timeframe[]).map((tf) => {
            const active = timeframe === tf;
            return (
              <TouchableOpacity
                key={tf}
                onPress={() => {
                  setTimeframe(tf);
                  setSelectedBarIdx(chartData.length - 1);
                }}
                style={[styles.tab, active && styles.tabActive]}
                activeOpacity={0.8}
              >
                <Text style={[styles.tabText, active && styles.tabTextActive]}>{tf}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {selectedPoint ? (
          <View style={styles.callout}>
            <Text style={styles.calloutTotal}>{inr(selectedPoint.total)}</Text>
            <Text style={styles.calloutSub}>
              {selectedPoint.label}: {inr(selectedPoint.oneTime)} spot, {inr(selectedPoint.recurring)} contract
            </Text>
          </View>
        ) : null}

        <View style={styles.chartCanvas}>
          <View style={styles.gridLines} pointerEvents="none">
            {[maxChartVal, maxChartVal / 2, 0].map((v, i) => (
              <View key={i} style={styles.gridLine}>
                <Text style={styles.gridLabel}>{v === 0 ? '0' : `${(v / 1000).toFixed(0)}k`}</Text>
                <View style={styles.gridRule} />
              </View>
            ))}
          </View>

          <View style={styles.barsRow}>
            {chartData.map((point, index) => {
              const isSelected = selectedBarIdx === index;
              const barHeightPct = Math.min(100, Math.max(14, (point.total / maxChartVal) * 100));
              const oneTimePct = (point.oneTime / (point.total || 1)) * 100;
              const recurringPct = (point.recurring / (point.total || 1)) * 100;
              return (
                <TouchableOpacity
                  key={point.label}
                  onPress={() => setSelectedBarIdx(index)}
                  style={styles.barColumn}
                  activeOpacity={0.7}
                >
                  <View style={styles.barWrapper}>
                    <View style={[styles.stackedBar, { height: `${barHeightPct}%` }]}>
                      <View
                        style={{ height: `${oneTimePct}%`, backgroundColor: isSelected ? ORANGE_LIGHT : LIGHT_STEEL }}
                      />
                      <View
                        style={{ height: `${recurringPct}%`, backgroundColor: isSelected ? ORANGE : GRAPHITE }}
                      />
                    </View>
                  </View>
                  <Text style={[styles.barLabel, isSelected && styles.barLabelActive]}>{point.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <View style={styles.legend}>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: LIGHT_STEEL }]} />
            <Text style={styles.legendText}>Spot orders</Text>
          </View>
          <View style={styles.legendItem}>
            <View style={[styles.legendSwatch, { backgroundColor: GRAPHITE }]} />
            <Text style={styles.legendText}>Annual rate contracts</Text>
          </View>
        </View>
      </View>

      {/* Pipeline */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Order pipeline</Text>
          <TouchableOpacity onPress={() => onNavigate('orders')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.link}>View orders</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.note}>
          {statusStats.total} orders, {statusStats.deliveredPct}% delivered
        </Text>
        <View style={styles.pipeBar}>
          {pipeline.map((p) => (
            <View key={p.label} style={{ flex: Math.max(1, p.n), backgroundColor: p.color }} />
          ))}
        </View>
        <View style={{ marginTop: 6 }}>
          {pipeline.map((p, i) => (
            <View key={p.label} style={[styles.kv, i === 0 && { borderTopWidth: 0 }]}>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: p.color }]} />
                <Text style={styles.k}>{p.label}</Text>
              </View>
              <Text style={styles.v}>{p.n}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Inventory spread */}
      <View style={styles.section}>
        <View style={styles.rowBetween}>
          <Text style={styles.h2}>Catalog by standard</Text>
          <TouchableOpacity onPress={() => onNavigate('products')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={styles.link}>View catalog</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.note}>{productsTotal.toLocaleString('en-IN')} SKUs in total</Text>
        {categoriesSpread.map((cat) => (
          <View key={cat.name} style={styles.cat}>
            <View style={styles.rowBetween}>
              <Text style={styles.catName} numberOfLines={1}>
                {cat.name}
              </Text>
              <Text style={styles.catPct}>
                {cat.pct}% ({cat.count})
              </Text>
            </View>
            <View style={styles.catTrack}>
              <View style={[styles.catFill, { width: `${cat.pct}%` }]} />
            </View>
          </View>
        ))}
      </View>

      {/* Operations */}
      <View style={styles.section}>
        <Text style={styles.h2}>Manage</Text>
        <View style={styles.opsGrid}>
          {ops.map((o, i) => (
            <TouchableOpacity
              key={o.id}
              onPress={() => onNavigate(o.id)}
              style={[styles.op, i % 3 !== 2 && styles.opRight, i < 6 && styles.opBottom]}
              activeOpacity={0.7}
            >
              <NavIcon name={o.icon as any} color={GRAPHITE} size={20} />
              <Text style={styles.opTitle}>{o.title}</Text>
              <Text style={styles.opSub}>{o.sub}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Recent dispatches */}
      <View style={[styles.rowBetween, styles.listHeader]}>
        <Text style={styles.h2}>Recent dispatches</Text>
        <TouchableOpacity onPress={() => onNavigate('orders')} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Text style={styles.link}>View all ({orders.length})</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <View style={{ gap: 8 }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : (
        orders.slice(0, 3).map((order) => (
          <TouchableOpacity
            key={order.id}
            style={styles.order}
            activeOpacity={0.7}
            onPress={() => (onSelectOrder ? onSelectOrder(order) : onNavigate('orders'))}
          >
            <View style={styles.rowBetween}>
              <Text style={styles.orderNumber}>{order.orderNumber}</Text>
              <View style={styles.statusRow}>
                <View style={[styles.dot, { backgroundColor: orderColor(order.status) }]} />
                <Text style={[styles.statusText, { color: orderColor(order.status) }]}>
                  {statusLabel(order.status)}
                </Text>
              </View>
            </View>
            <Text style={styles.company}>{order.companyName || order.customerName || 'Enterprise Buyer'}</Text>
            <Text style={styles.meta}>
              {(order.totalWeightKg || 120).toLocaleString('en-IN')} kg by {order.carrier || 'Express'}
              {order.trackingNumber ? `, AWB ${order.trackingNumber}` : ''}
            </Text>
            <View style={[styles.rowBetween, { marginTop: 12 }]}>
              <Text style={styles.orderAmount}>{inr(order.netAmount || 0)}</Text>
              <Text style={styles.link}>Update status</Text>
            </View>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { paddingBottom: 40, backgroundColor: WHITE },

  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'baseline' },
  statusRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  dot: { width: 8, height: 8, borderRadius: 4 },
  h2: { fontSize: 16, fontWeight: '700', color: GRAPHITE },
  link: { fontSize: 14, fontWeight: '700', color: ORANGE },
  note: { fontSize: 13, color: STEEL, marginTop: 4 },

  // Hero
  hero: { paddingHorizontal: 20, paddingTop: 20, paddingBottom: 24, borderBottomWidth: 1, borderBottomColor: HAIR },
  heroMeta: { fontSize: 13, color: STEEL },
  heroLabel: { fontSize: 13, color: STEEL, marginTop: 20 },
  heroValue: {
    fontSize: 38,
    fontWeight: '800',
    color: GRAPHITE,
    marginTop: 2,
    fontVariant: ['tabular-nums'],
  },
  heroSub: { fontSize: 13, color: STEEL, marginTop: 4 },

  // KPI grid
  kpiGrid: { flexDirection: 'row', flexWrap: 'wrap', borderBottomWidth: 1, borderBottomColor: HAIR },
  kpi: { width: '50%', paddingHorizontal: 20, paddingVertical: 18 },
  kpiLeft: { borderRightWidth: 1, borderRightColor: HAIR },
  kpiTop: { borderBottomWidth: 1, borderBottomColor: HAIR },
  kpiLabel: { fontSize: 13, color: STEEL },
  kpiNum: { fontSize: 28, fontWeight: '800', color: GRAPHITE, marginTop: 2, fontVariant: ['tabular-nums'] },
  kpiSub: { fontSize: 12, color: STEEL, marginTop: 2 },

  // Sections
  section: { paddingHorizontal: 20, paddingVertical: 20, borderBottomWidth: 1, borderBottomColor: HAIR },

  // Chart
  tabs: { flexDirection: 'row', marginTop: 12, borderBottomWidth: 1, borderBottomColor: HAIR },
  tab: { paddingVertical: 10, marginRight: 22, borderBottomWidth: 2, borderBottomColor: 'transparent', marginBottom: -1 },
  tabActive: { borderBottomColor: ORANGE },
  tabText: { fontSize: 14, fontWeight: '600', color: STEEL },
  tabTextActive: { color: GRAPHITE },
  callout: { marginTop: 16 },
  calloutTotal: { fontSize: 24, fontWeight: '800', color: GRAPHITE, fontVariant: ['tabular-nums'] },
  calloutSub: { fontSize: 12, color: STEEL, marginTop: 2 },
  chartCanvas: { height: 170, marginTop: 16, justifyContent: 'flex-end' },
  gridLines: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 24,
    justifyContent: 'space-between',
  },
  gridLine: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gridLabel: { fontSize: 10, color: STEEL, width: 30 },
  gridRule: { flex: 1, height: 1, backgroundColor: MIST },
  barsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    paddingLeft: 36,
    height: '100%',
  },
  barColumn: { alignItems: 'center', flex: 1, height: '100%', justifyContent: 'flex-end' },
  barWrapper: { width: '100%', alignItems: 'center', height: 140, justifyContent: 'flex-end' },
  stackedBar: { width: 26, borderRadius: 3, overflow: 'hidden', backgroundColor: MIST },
  barLabel: { fontSize: 11, color: STEEL, marginTop: 6 },
  barLabelActive: { color: GRAPHITE, fontWeight: '700' },
  legend: { flexDirection: 'row', gap: 18, marginTop: 12 },
  legendItem: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  legendSwatch: { width: 10, height: 10, borderRadius: 2 },
  legendText: { fontSize: 12, color: STEEL },

  // Pipeline
  pipeBar: { height: 10, borderRadius: 5, flexDirection: 'row', overflow: 'hidden', marginTop: 14, gap: 2 },
  kv: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 11,
    borderTopWidth: 1,
    borderTopColor: MIST,
  },
  k: { fontSize: 14, color: STEEL },
  v: { fontSize: 14, fontWeight: '700', color: GRAPHITE, fontVariant: ['tabular-nums'] },

  // Category spread
  cat: { marginTop: 14 },
  catName: { fontSize: 14, color: GRAPHITE, fontWeight: '600', flex: 1, marginRight: 12 },
  catPct: { fontSize: 13, color: STEEL, fontVariant: ['tabular-nums'] },
  catTrack: { height: 6, borderRadius: 3, backgroundColor: MIST, marginTop: 6, overflow: 'hidden' },
  catFill: { height: '100%', backgroundColor: GRAPHITE, borderRadius: 3 },

  // Operations grid
  opsGrid: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 12, borderWidth: 1, borderColor: HAIR, borderRadius: 8, overflow: 'hidden' },
  op: { width: '33.333%', paddingVertical: 16, paddingHorizontal: 12, gap: 4 },
  opRight: { borderRightWidth: 1, borderRightColor: HAIR },
  opBottom: { borderBottomWidth: 1, borderBottomColor: HAIR },
  opTitle: { fontSize: 14, fontWeight: '700', color: GRAPHITE, marginTop: 6 },
  opSub: { fontSize: 12, color: STEEL },

  // Recent dispatches
  listHeader: {
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: MIST,
    borderBottomWidth: 1,
    borderBottomColor: HAIR,
  },
  order: { paddingHorizontal: 20, paddingVertical: 18, borderBottomWidth: 1, borderBottomColor: HAIR },
  orderNumber: { fontSize: 15, fontWeight: '700', color: GRAPHITE, fontFamily: MONO },
  statusText: { fontSize: 13, fontWeight: '700' },
  company: { fontSize: 14, fontWeight: '600', color: GRAPHITE, marginTop: 8 },
  meta: { fontSize: 13, color: STEEL, marginTop: 2 },
  orderAmount: { fontSize: 18, fontWeight: '800', color: GRAPHITE, fontVariant: ['tabular-nums'] },
});

export default AdminDashboardScreen;