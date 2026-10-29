'use client';

import React, { useState, useMemo, useEffect } from 'react';
import TablePagination from '@/components/common/TablePagination';
import { CustomerOrder } from '@/lib/types';
import { formatINR } from '@/lib/rfq-calculator';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  RefreshCw,
  Download,
  Truck,
  CheckCircle2,
  AlertTriangle,
  X,
  FileText,
  Eye,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  Phone,
  Mail,
  Building,
  MapPin,
  Package,
  Clock,
  Loader2,
  ExternalLink,
} from 'lucide-react';

interface AdminOrdersSectionProps {
  orders: CustomerOrder[];
  onAdd: (order: Omit<CustomerOrder, 'id'>) => Promise<void>;
  onUpdate: (order: CustomerOrder) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

const ORDER_STATUS_CONFIG: Record<
  CustomerOrder['status'],
  { label: string; bg: string; text: string; border: string; icon: string }
> = {
  CONFIRMED: {
    label: 'CONFIRMED',
    bg: '#EFF6FF',
    text: '#1D4ED8',
    border: '#BFDBFE',
    icon: '📋',
  },
  PROCESSING: {
    label: 'PROCESSING',
    bg: '#FEF3C7',
    text: '#B45309',
    border: '#FDE68A',
    icon: '⚙️',
  },
  DISPATCHED: {
    label: 'DISPATCHED',
    bg: '#EEF2FF',
    text: '#4338CA',
    border: '#C7D2FE',
    icon: '📦',
  },
  IN_TRANSIT: {
    label: 'IN TRANSIT',
    bg: '#FAF5FF',
    text: '#7E22CE',
    border: '#E9D5FF',
    icon: '🚚',
  },
  DELIVERED: {
    label: 'DELIVERED',
    bg: '#ECFDF5',
    text: '#047857',
    border: '#A7F3D0',
    icon: '✓',
  },
  CANCELLED: {
    label: 'CANCELLED',
    bg: '#FEF2F2',
    text: '#B91C1C',
    border: '#FECACA',
    icon: '✕',
  },
};

export default function AdminOrdersSection({
  orders,
  onAdd,
  onUpdate,
  onDelete,
  showToast,
}: AdminOrdersSectionProps) {
  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedCarrier, setSelectedCarrier] = useState('all');
  const [sortBy, setSortBy] = useState('date_desc');

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  // Modals state
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [viewOrder, setViewOrder] = useState<CustomerOrder | null>(null);
  const [editOrder, setEditOrder] = useState<CustomerOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<CustomerOrder | null>(null);

  // Interactive Action Feedback State
  const [updatingOrderId, setUpdatingOrderId] = useState<string | null>(null);
  const [copiedTrackingId, setCopiedTrackingId] = useState<string | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    orderNumber: '',
    customerName: '',
    companyName: '',
    email: '',
    phone: '',
    itemsCount: '4',
    totalWeightKg: '650.0',
    netAmount: '98500.00',
    status: 'CONFIRMED' as CustomerOrder['status'],
    carrier: 'TCI Freight Express',
    trackingNumber: '',
    dispatchDate: new Date().toISOString().split('T')[0],
    shippingAddress: '',
    mtcCertNumber: '',
  });

  // Calculate High-Level Metrics
  const metrics = useMemo(() => {
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (o.netAmount || 0), 0);
    const activeDispatches = orders.filter(
      (o) => o.status === 'DISPATCHED' || o.status === 'IN_TRANSIT'
    ).length;
    const deliveredCount = orders.filter((o) => o.status === 'DELIVERED').length;
    const pendingCount = orders.filter(
      (o) => o.status === 'CONFIRMED' || o.status === 'PROCESSING'
    ).length;

    return {
      totalOrders,
      totalRevenue,
      activeDispatches,
      deliveredCount,
      pendingCount,
    };
  }, [orders]);

  // Filtered & Sorted orders
  const filteredOrders = useMemo(() => {
    let list = [...orders];

    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (o) =>
          o.orderNumber.toLowerCase().includes(q) ||
          o.trackingNumber?.toLowerCase().includes(q) ||
          o.companyName?.toLowerCase().includes(q) ||
          o.customerName?.toLowerCase().includes(q) ||
          o.shippingAddress?.toLowerCase().includes(q) ||
          (o.erpnextSalesOrderId && o.erpnextSalesOrderId.toLowerCase().includes(q))
      );
    }

    if (selectedStatus !== 'all') {
      list = list.filter((o) => o.status.toLowerCase() === selectedStatus.toLowerCase());
    }

    if (selectedCarrier !== 'all') {
      list = list.filter((o) => o.carrier.toLowerCase().includes(selectedCarrier.toLowerCase()));
    }

    if (sortBy === 'date_desc') {
      list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (sortBy === 'date_asc') {
      list.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    } else if (sortBy === 'amount_desc') {
      list.sort((a, b) => b.netAmount - a.netAmount);
    } else if (sortBy === 'weight_desc') {
      list.sort((a, b) => b.totalWeightKg - a.totalWeightKg);
    }

    return list;
  }, [orders, search, selectedStatus, selectedCarrier, sortBy]);

  // Reset page on filter changes
  useEffect(() => {
    setCurrentPage(1);
  }, [search, selectedStatus, selectedCarrier, sortBy]);

  // Paginated orders
  const paginatedOrders = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredOrders.slice(start, start + itemsPerPage);
  }, [filteredOrders, currentPage, itemsPerPage]);

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCarrier('all');
    setSortBy('date_desc');
    setCurrentPage(1);
  };

  const handleCopyTracking = (tracking: string, id: string) => {
    if (!tracking) return;
    navigator.clipboard.writeText(tracking);
    setCopiedTrackingId(id);
    showToast(`✓ Copied docket "${tracking}" to clipboard`);
    setTimeout(() => setCopiedTrackingId(null), 2200);
  };

  // Direct Status Change with Transparent Feedback
  const handleDirectStatusChange = async (
    order: CustomerOrder,
    newStatus: CustomerOrder['status']
  ) => {
    if (order.status === newStatus) return;
    setUpdatingOrderId(order.id);
    try {
      const updated: CustomerOrder = {
        ...order,
        status: newStatus,
      };
      await onUpdate(updated);
      showToast(`✓ Order ${order.orderNumber} status updated to ${newStatus}`);
      if (viewOrder && viewOrder.id === order.id) {
        setViewOrder(updated);
      }
    } catch {
      showToast(`✕ Failed to update status for ${order.orderNumber}`);
    } finally {
      setUpdatingOrderId(null);
    }
  };

  const handleExportCSV = () => {
    const headers = [
      'Order Number',
      'Date',
      'Company',
      'Customer',
      'Items Count',
      'Weight (Kg)',
      'Net Amount (INR)',
      'Carrier',
      'Tracking Docket',
      'Status',
      'MTC Cert',
      'ERPNext SO',
      'Address',
    ];
    const rows = filteredOrders.map((o) => [
      `"${o.orderNumber}"`,
      `"${o.date}"`,
      `"${o.companyName || 'Enterprise Client'}"`,
      `"${o.customerName || 'Procurement'}"`,
      o.itemsCount,
      o.totalWeightKg,
      o.netAmount,
      `"${o.carrier}"`,
      `"${o.trackingNumber}"`,
      `"${o.status}"`,
      `"${o.mtcCertNumber}"`,
      `"${o.erpnextSalesOrderId || ''}"`,
      `"${(o.shippingAddress || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent =
      'data:text/csv;charset=utf-8,' +
      [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_orders_dispatch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`✓ Exported ${filteredOrders.length} orders to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum =
      addForm.orderNumber || `CBH-ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    await onAdd({
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      customerName: addForm.customerName || 'Procurement Officer',
      companyName: addForm.companyName || 'Apex Heavy Infra Ltd.',
      email: addForm.email,
      phone: addForm.phone,
      itemsCount: parseInt(addForm.itemsCount) || 3,
      totalWeightKg: parseFloat(addForm.totalWeightKg) || 500.0,
      netAmount: parseFloat(addForm.netAmount) || 75000.0,
      status: addForm.status,
      carrier: addForm.carrier,
      trackingNumber:
        addForm.trackingNumber ||
        `${addForm.carrier.substring(0, 3).toUpperCase()}-${Math.floor(
          100000 + Math.random() * 900000
        )}`,
      dispatchDate: addForm.dispatchDate,
      shippingAddress:
        addForm.shippingAddress || 'Plot 44, Peenya Phase 2, Industrial Area, Bengaluru, KA - 560058',
      mtcCertNumber:
        addForm.mtcCertNumber ||
        `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`,
    });

    setIsAddOpen(false);
    showToast(`✓ Created dispatch shipment ${orderNum}`);
    setAddForm({
      orderNumber: '',
      customerName: '',
      companyName: '',
      email: '',
      phone: '',
      itemsCount: '4',
      totalWeightKg: '650.0',
      netAmount: '98500.00',
      status: 'CONFIRMED',
      carrier: 'TCI Freight Express',
      trackingNumber: '',
      dispatchDate: new Date().toISOString().split('T')[0],
      shippingAddress: '',
      mtcCertNumber: '',
    });
  };

  const submitEditForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editOrder) return;
    await onUpdate(editOrder);
    showToast(`✓ Order ${editOrder.orderNumber} details saved`);
    setEditOrder(null);
  };

  const confirmDelete = async () => {
    if (!deleteOrder) return;
    await onDelete(deleteOrder.id);
    showToast(`✓ Order ${deleteOrder.orderNumber} deleted successfully`);
    setDeleteOrder(null);
  };

  return (
    <div className="portal-main-card">
      {/* 1. TOP SUMMARY METRIC CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '14px',
          marginBottom: '24px',
        }}
      >
        {/* Total Orders & Value */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#EFF6FF',
              color: '#0052CC',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Package size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Total Orders
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#0F172A', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.totalOrders}{' '}
              <span style={{ fontSize: '13px', fontWeight: 600, color: '#0052CC' }}>
                ({formatINR(metrics.totalRevenue)})
              </span>
            </div>
          </div>
        </div>

        {/* Active Dispatches */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#FAF5FF',
              color: '#7E22CE',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Truck size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              In-Transit / Dispatched
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#7E22CE', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.activeDispatches}{' '}
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>Active Cargo</span>
            </div>
          </div>
        </div>

        {/* Delivered / POD Verified */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#ECFDF5',
              color: '#059669',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <CheckCircle2 size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Delivered Shipments
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#059669', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.deliveredCount}{' '}
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>POD Verified</span>
            </div>
          </div>
        </div>

        {/* Pending Packaging / Confirmation */}
        <div
          style={{
            background: '#F8FAFC',
            border: '1px solid #E2E8F0',
            borderRadius: '12px',
            padding: '16px 18px',
            display: 'flex',
            alignItems: 'center',
            gap: '14px',
          }}
        >
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '10px',
              background: '#FEF3C7',
              color: '#B45309',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <Clock size={22} />
          </div>
          <div>
            <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              Pending / Packaging
            </span>
            <div style={{ fontSize: '20px', fontWeight: 800, color: '#B45309', marginTop: '2px', fontFamily: 'var(--font-mono)' }}>
              {metrics.pendingCount}{' '}
              <span style={{ fontSize: '12px', fontWeight: 500, color: '#64748B' }}>To Dispatch</span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SECTION HEADER & ACTION BUTTONS */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>
          <h3
            style={{
              fontFamily: 'var(--font-headline)',
              fontSize: '20px',
              fontWeight: 800,
              textTransform: 'uppercase',
              margin: 0,
              color: '#0F172A',
            }}
          >
            Orders &amp; Carrier Dispatch Management ({orders.length} Shipments)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Multi-modal freight tracking, instant status adjustment, and NABL 3.1 Mill Test Certificate dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '12px', background: '#FFFFFF' }}
            onClick={handleExportCSV}
            title="Download CSV report of filtered orders"
          >
            <Download size={14} color="#0052CC" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setIsAddOpen(true)}
            title="Create and dispatch a new shipment"
          >
            <Plus size={15} />
            <span>New Dispatch Shipment</span>
          </button>
        </div>
      </div>

      {/* 3. FILTER & SEARCH BAR */}
      <div className="admin-filter-bar">
        <div className="admin-filter-group">
          <div className="admin-search-wrap">
            <Search size={15} className="admin-search-icon" />
            <input
              type="text"
              className="admin-search-input"
              placeholder="Search Order #, docket, client, destination..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <select
            className="admin-select"
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
          >
            <option value="all">Status: All Statuses</option>
            <option value="CONFIRMED">CONFIRMED (Order Placed)</option>
            <option value="PROCESSING">PROCESSING (Packaging)</option>
            <option value="DISPATCHED">DISPATCHED (Hub Picked)</option>
            <option value="IN_TRANSIT">IN_TRANSIT (Line Haul)</option>
            <option value="DELIVERED">DELIVERED (POD Verified)</option>
            <option value="CANCELLED">CANCELLED</option>
          </select>

          <select
            className="admin-select"
            value={selectedCarrier}
            onChange={(e) => setSelectedCarrier(e.target.value)}
          >
            <option value="all">Carrier: All Carriers</option>
            <option value="TCI">TCI Freight Express</option>
            <option value="Blue Dart">Blue Dart Logistics</option>
            <option value="Safechem">Safechem Express</option>
            <option value="V-Trans">V-Trans India</option>
            <option value="Delhivery">Delhivery Freight</option>
          </select>

          <select
            className="admin-select"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="date_desc">Date: Newest First</option>
            <option value="date_asc">Date: Oldest First</option>
            <option value="amount_desc">Amount: High to Low</option>
            <option value="weight_desc">Weight: High to Low</option>
          </select>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span className="admin-filter-count">
            Showing {filteredOrders.length} of {orders.length} Orders
          </span>
          {(search ||
            selectedStatus !== 'all' ||
            selectedCarrier !== 'all' ||
            sortBy !== 'date_desc') && (
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '4px 8px', fontSize: '11px', background: '#FFFFFF' }}
              onClick={handleResetFilters}
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 4. ORDERS DATA TABLE */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order # &amp; Date</th>
              <th>Client &amp; Destination</th>
              <th>Cargo Weight</th>
              <th>Logistics Carrier</th>
              <th>Tracking Docket</th>
              <th>Order Total</th>
              <th>Shipment Status</th>
              <th>NABL 3.1 MTC</th>
              <th style={{ textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9}>
                  <div className="admin-empty-state">
                    <AlertTriangle size={32} color="#D97706" style={{ margin: '0 auto' }} />
                    <h4>No Dispatch Shipments Matched</h4>
                    <p>No customer orders match your current filter parameters.</p>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={handleResetFilters}
                      style={{ background: '#FFFFFF' }}
                    >
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedOrders.map((o) => {
                const statusCfg =
                  ORDER_STATUS_CONFIG[o.status] || ORDER_STATUS_CONFIG.PROCESSING;
                const isUpdating = updatingOrderId === o.id;
                const isCopied = copiedTrackingId === o.id;

                return (
                  <tr key={o.id}>
                    {/* Column 1: Order # & Date */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <strong
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontSize: '13px',
                            color: '#0F172A',
                          }}
                        >
                          {o.orderNumber}
                        </strong>
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '2px',
                        }}
                      >
                        Date: {o.date}
                      </div>
                      {o.erpnextSalesOrderId && (
                        <div style={{ marginTop: '4px' }}>
                          <span
                            style={{
                              fontSize: '10px',
                              color: '#065F46',
                              backgroundColor: '#D1FAE5',
                              border: '1px solid #A7F3D0',
                              padding: '2px 6px',
                              borderRadius: '4px',
                              fontWeight: 800,
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '3px',
                            }}
                            title="Synchronized with ERPNext Sales Order"
                          >
                            ERPNext: {o.erpnextSalesOrderId}
                          </span>
                        </div>
                      )}
                    </td>

                    {/* Column 2: Client & Destination */}
                    <td>
                      <div style={{ fontWeight: 700, color: '#0F172A', fontSize: '13px' }}>
                        {o.companyName || 'Enterprise Plant'}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          maxWidth: '240px',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          marginTop: '2px',
                        }}
                        title={o.shippingAddress}
                      >
                        {o.shippingAddress || 'Pan-India Commercial Dispatch'}
                      </div>
                    </td>

                    {/* Column 3: Cargo Weight */}
                    <td>
                      <span
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 700,
                          color: '#0F172A',
                        }}
                      >
                        {o.totalWeightKg ? `${o.totalWeightKg.toLocaleString()} Kg` : 'Batch Lot'}
                      </span>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          fontFamily: 'var(--font-mono)',
                        }}
                      >
                        ({((o.totalWeightKg || 0) / 1000).toFixed(2)} MT)
                      </div>
                    </td>

                    {/* Column 4: Logistics Carrier */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Truck size={14} color="#0284C7" />
                        <span style={{ fontWeight: 600, color: '#334155', fontSize: '13px' }}>
                          {o.carrier}
                        </span>
                      </div>
                    </td>

                    {/* Column 5: Tracking Docket */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <span
                          style={{
                            fontFamily: 'var(--font-mono)',
                            fontWeight: 700,
                            color: '#0284C7',
                            fontSize: '12px',
                          }}
                        >
                          {o.trackingNumber || 'Pending Allocation'}
                        </span>
                        {o.trackingNumber && (
                          <button
                            type="button"
                            onClick={() => handleCopyTracking(o.trackingNumber, o.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              padding: '2px',
                              cursor: 'pointer',
                              color: isCopied ? '#059669' : '#94A3B8',
                              display: 'inline-flex',
                              alignItems: 'center',
                            }}
                            title="Copy Tracking Docket"
                          >
                            {isCopied ? <Check size={12} /> : <Copy size={12} />}
                          </button>
                        )}
                      </div>
                      <div
                        style={{
                          fontSize: '11px',
                          color: '#64748B',
                          fontFamily: 'var(--font-mono)',
                          marginTop: '2px',
                        }}
                      >
                        Dispatched: {o.dispatchDate || o.date}
                      </div>
                    </td>

                    {/* Column 6: Order Total */}
                    <td>
                      <div
                        style={{
                          fontFamily: 'var(--font-mono)',
                          fontWeight: 800,
                          color: '#0052CC',
                          fontSize: '14px',
                        }}
                      >
                        {formatINR(o.netAmount)}
                      </div>
                      <span
                        style={{
                          fontSize: '10px',
                          color: '#059669',
                          fontWeight: 700,
                          textTransform: 'uppercase',
                        }}
                      >
                        {o.paymentStatus || 'PAID'}
                      </span>
                    </td>

                    {/* Column 7: Direct Status Selector Badge */}
                    <td>
                      <div style={{ position: 'relative', display: 'inline-block' }}>
                        <select
                          value={o.status}
                          disabled={isUpdating}
                          onChange={(e) =>
                            handleDirectStatusChange(o, e.target.value as CustomerOrder['status'])
                          }
                          style={{
                            appearance: 'none',
                            WebkitAppearance: 'none',
                            backgroundColor: statusCfg.bg,
                            color: statusCfg.text,
                            borderColor: statusCfg.border,
                            borderWidth: '1px',
                            borderStyle: 'solid',
                            borderRadius: '999px',
                            padding: '4px 24px 4px 10px',
                            fontSize: '11px',
                            fontWeight: 800,
                            cursor: isUpdating ? 'wait' : 'pointer',
                            outline: 'none',
                            transition: 'all 0.2s ease',
                            fontFamily: 'var(--font-mono)',
                            boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
                          }}
                          title="Click to directly adjust order status"
                        >
                          <option value="CONFIRMED">📋 CONFIRMED</option>
                          <option value="PROCESSING">⚙️ PROCESSING</option>
                          <option value="DISPATCHED">📦 DISPATCHED</option>
                          <option value="IN_TRANSIT">🚚 IN TRANSIT</option>
                          <option value="DELIVERED">✓ DELIVERED</option>
                          <option value="CANCELLED">✕ CANCELLED</option>
                        </select>

                        {/* Dropdown Indicator or Inline Spinner */}
                        <div
                          style={{
                            position: 'absolute',
                            right: '8px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            pointerEvents: 'none',
                            display: 'flex',
                            alignItems: 'center',
                          }}
                        >
                          {isUpdating ? (
                            <Loader2 size={12} className="animate-spin" color={statusCfg.text} />
                          ) : (
                            <span style={{ fontSize: '9px', color: statusCfg.text }}>▼</span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Column 8: NABL 3.1 MTC */}
                    <td>
                      <span
                        style={{
                          fontSize: '11px',
                          fontFamily: 'var(--font-mono)',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '4px',
                          color: '#059669',
                          fontWeight: 700,
                          background: '#ECFDF5',
                          padding: '2px 8px',
                          borderRadius: '6px',
                          border: '1px solid #A7F3D0',
                        }}
                        title={o.mtcCertNumber}
                      >
                        <FileText size={11} />{' '}
                        {o.mtcCertNumber
                          ? o.mtcCertNumber.length > 14
                            ? o.mtcCertNumber.substring(0, 14) + '...'
                            : o.mtcCertNumber
                          : 'NABL-3.1'}
                      </span>
                    </td>

                    {/* Column 9: Clear Explicit Action Buttons */}
                    <td>
                      <div
                        className="admin-action-btn-group"
                        style={{ justifyContent: 'flex-end', gap: '6px' }}
                      >
                        {/* View Details Modal Button */}
                        <button
                          type="button"
                          onClick={() => setViewOrder(o)}
                          style={{
                            background: '#EFF6FF',
                            color: '#0052CC',
                            border: '1px solid #BFDBFE',
                            borderRadius: '6px',
                            padding: '5px 9px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="View complete order details & invoice"
                        >
                          <Eye size={13} />
                          <span>View</span>
                        </button>

                        {/* Edit Button */}
                        <button
                          type="button"
                          onClick={() => setEditOrder({ ...o })}
                          style={{
                            background: '#F1F5F9',
                            color: '#334155',
                            border: '1px solid #CBD5E1',
                            borderRadius: '6px',
                            padding: '5px 9px',
                            fontSize: '11px',
                            fontWeight: 700,
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: '4px',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Edit carrier, docket, or delivery notes"
                        >
                          <Edit size={13} />
                          <span>Edit</span>
                        </button>

                        {/* Delete Button */}
                        <button
                          type="button"
                          onClick={() => setDeleteOrder(o)}
                          style={{
                            background: '#FEF2F2',
                            color: '#DC2626',
                            border: '1px solid #FECACA',
                            borderRadius: '6px',
                            padding: '5px 8px',
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease',
                          }}
                          title="Delete order record from database"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>

        <TablePagination
          currentPage={currentPage}
          totalItems={filteredOrders.length}
          itemsPerPage={itemsPerPage}
          onPageChange={setCurrentPage}
          onItemsPerPageChange={setItemsPerPage}
          itemLabel="shipment orders"
          pageSizeOptions={[5, 10, 20, 50]}
        />
      </div>

      {/* 5. VIEW ORDER DETAILS & TAX INVOICE MODAL */}
      {viewOrder && (
        <div className="modal-overlay active" onClick={() => setViewOrder(null)}>
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '28px',
              maxWidth: '820px',
              width: '100%',
              maxHeight: '90vh',
              overflowY: 'auto',
              borderRadius: '16px',
              background: '#FFFFFF',
            }}
          >
            {/* Modal Header */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '16px',
                marginBottom: '20px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                  <h3
                    style={{
                      fontFamily: 'var(--font-headline)',
                      fontSize: '22px',
                      fontWeight: 800,
                      color: '#0F172A',
                      margin: 0,
                    }}
                  >
                    Order #{viewOrder.orderNumber}
                  </h3>
                  <span
                    style={{
                      backgroundColor: ORDER_STATUS_CONFIG[viewOrder.status]?.bg || '#F1F5F9',
                      color: ORDER_STATUS_CONFIG[viewOrder.status]?.text || '#334155',
                      border: `1px solid ${ORDER_STATUS_CONFIG[viewOrder.status]?.border || '#CBD5E1'}`,
                      padding: '3px 10px',
                      borderRadius: '999px',
                      fontSize: '11px',
                      fontWeight: 800,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {ORDER_STATUS_CONFIG[viewOrder.status]?.icon} {viewOrder.status}
                  </span>
                  {viewOrder.erpnextSalesOrderId && (
                    <span
                      style={{
                        backgroundColor: '#ECFDF5',
                        color: '#059669',
                        border: '1px solid #A7F3D0',
                        padding: '3px 10px',
                        borderRadius: '999px',
                        fontSize: '11px',
                        fontWeight: 800,
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                      }}
                    >
                      <CheckCircle2 size={12} /> ERPNext: {viewOrder.erpnextSalesOrderId}
                    </span>
                  )}
                </div>
                <p style={{ margin: '4px 0 0', fontSize: '12px', color: '#64748B' }}>
                  Booked on {viewOrder.date} • Pan-India Commercial Freight Logistics
                </p>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="btn-outline"
                  style={{
                    padding: '6px 12px',
                    fontSize: '12px',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    background: '#FFFFFF',
                  }}
                  title="Print official tax invoice"
                >
                  <Printer size={14} color="#0052CC" />
                  <span>Print Invoice</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewOrder(null)}
                  style={{
                    background: '#F1F5F9',
                    border: 'none',
                    borderRadius: '50%',
                    width: '32px',
                    height: '32px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    color: '#64748B',
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            </div>

            {/* Modal Body: 2-Column Info Cards */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '16px',
                marginBottom: '20px',
              }}
            >
              {/* Card 1: Enterprise Profile & Coordinates */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#0F172A',
                    marginBottom: '12px',
                  }}
                >
                  <Building size={16} color="#0052CC" />
                  <span>Enterprise &amp; Customer Information</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Company Name:</span>
                    <strong style={{ color: '#0F172A' }}>
                      {viewOrder.companyName || 'Enterprise Fastener Buyer'}
                    </strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Contact Officer:</span>
                    <strong style={{ color: '#0F172A' }}>
                      {viewOrder.customerName || 'Procurement In-Charge'}
                    </strong>
                  </div>
                  {viewOrder.email && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Email:</span>
                      <span style={{ color: '#0052CC', fontFamily: 'var(--font-mono)' }}>
                        {viewOrder.email}
                      </span>
                    </div>
                  )}
                  {viewOrder.phone && (
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748B' }}>Phone:</span>
                      <span style={{ fontFamily: 'var(--font-mono)' }}>{viewOrder.phone}</span>
                    </div>
                  )}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>GSTIN:</span>
                    <span
                      style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        background: '#ECFDF5',
                        color: '#059669',
                        padding: '2px 6px',
                        borderRadius: '4px',
                        border: '1px solid #A7F3D0',
                      }}
                    >
                      {viewOrder.gstin || '27AAACB2024L1Z1 (Verified)'}
                    </span>
                  </div>
                  <div style={{ borderTop: '1px dashed #CBD5E1', paddingTop: '8px', marginTop: '2px' }}>
                    <span style={{ color: '#64748B', display: 'block', marginBottom: '3px' }}>
                      Delivery Destination Address:
                    </span>
                    <div style={{ color: '#1E293B', fontWeight: 600, lineHeight: '1.4' }}>
                      {viewOrder.shippingAddress || 'Factory Gate, Industrial Zone'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Card 2: Logistics & Dispatch Partner */}
              <div
                style={{
                  background: '#F8FAFC',
                  border: '1px solid #E2E8F0',
                  borderRadius: '12px',
                  padding: '16px',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    fontWeight: 800,
                    fontSize: '13px',
                    color: '#0F172A',
                    marginBottom: '12px',
                  }}
                >
                  <Truck size={16} color="#7E22CE" />
                  <span>Freight Carrier &amp; Logistics Tracking</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Carrier Partner:</span>
                    <strong style={{ color: '#0F172A' }}>{viewOrder.carrier}</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ color: '#64748B' }}>Tracking Docket:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <strong style={{ color: '#0284C7', fontFamily: 'var(--font-mono)' }}>
                        {viewOrder.trackingNumber || 'Pending'}
                      </strong>
                      {viewOrder.trackingNumber && (
                        <button
                          type="button"
                          onClick={() => handleCopyTracking(viewOrder.trackingNumber, viewOrder.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            padding: 0,
                            cursor: 'pointer',
                            color: '#0284C7',
                          }}
                          title="Copy Docket"
                        >
                          <Copy size={12} />
                        </button>
                      )}
                    </div>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Dispatch Date:</span>
                    <span style={{ fontFamily: 'var(--font-mono)' }}>
                      {viewOrder.dispatchDate || viewOrder.date}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>NABL Mill Certificate:</span>
                    <span
                      style={{
                        color: '#059669',
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                      }}
                    >
                      {viewOrder.mtcCertNumber || 'MTC-CBH-2025-NABL'}
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#64748B' }}>Settlement Method:</span>
                    <span
                      style={{
                        color: '#5f259f',
                        fontWeight: 700,
                        background: '#FAF5FF',
                        padding: '1px 8px',
                        borderRadius: '4px',
                        border: '1px solid #E9D5FF',
                      }}
                    >
                      PhonePe Payment Gateway (PAID)
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Line Items Breakdown Table */}
            <div style={{ marginBottom: '20px' }}>
              <div
                style={{
                  fontSize: '13px',
                  fontWeight: 800,
                  color: '#0F172A',
                  marginBottom: '8px',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                }}
              >
                Ordered Fasteners Line Items ({viewOrder.items?.length || viewOrder.itemsCount || 1}{' '}
                Items)
              </div>

              <div
                style={{
                  border: '1px solid #E2E8F0',
                  borderRadius: '10px',
                  overflow: 'hidden',
                }}
              >
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '12px' }}>
                  <thead>
                    <tr style={{ background: '#F8FAFC', borderBottom: '1px solid #E2E8F0', textAlign: 'left' }}>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Fastener SKU &amp; Spec</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569' }}>Standard</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Quantity</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Unit Rate</th>
                      <th style={{ padding: '10px 14px', fontWeight: 700, color: '#475569', textAlign: 'right' }}>Row Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewOrder.items && viewOrder.items.length > 0 ? (
                      viewOrder.items.map((item, idx) => (
                        <tr
                          key={idx}
                          style={{
                            borderBottom: '1px solid #F1F5F9',
                            background: idx % 2 === 0 ? '#FFFFFF' : '#FAFAFA',
                          }}
                        >
                          <td style={{ padding: '10px 14px' }}>
                            <strong style={{ color: '#0F172A', display: 'block' }}>{item.name}</strong>
                            <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                              SKU: {item.sku}
                            </span>
                          </td>
                          <td style={{ padding: '10px 14px' }}>
                            <span className="badge badge-din">{item.standard || 'DIN'}</span>
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                            {item.quantity.toLocaleString()} {item.unit || 'PCS'}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                            ₹{item.rate.toFixed(2)}
                          </td>
                          <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>
                            {formatINR(item.rowTotal || item.quantity * item.rate)}
                          </td>
                        </tr>
                      ))
                    ) : (
                      // Single item fallback based on order totals
                      <tr style={{ background: '#FFFFFF' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <strong style={{ color: '#0F172A', display: 'block' }}>
                            High Tensile Precision Fasteners Lot (HSN 7318)
                          </strong>
                          <span style={{ fontSize: '11px', color: '#64748B', fontFamily: 'var(--font-mono)' }}>
                            SKU: CBH-HT-FASTENER-LOT
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span className="badge badge-din">DIN / ISO</span>
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                          {viewOrder.totalWeightKg ? `${viewOrder.totalWeightKg.toLocaleString()} KG` : '1 Lot'}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)' }}>
                          ₹{(viewOrder.netAmount / (viewOrder.totalWeightKg || 1)).toFixed(2)}
                        </td>
                        <td style={{ padding: '10px 14px', textAlign: 'right', fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#0052CC' }}>
                          {formatINR(viewOrder.netAmount)}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Financial Summary Breakdown */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #CBD5E1',
                borderRadius: '12px',
                padding: '16px 20px',
                marginBottom: '24px',
              }}
            >
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                  gap: '12px',
                  fontSize: '12px',
                }}
              >
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Gross Cargo Value:</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {formatINR(viewOrder.grossAmount || +(viewOrder.netAmount / 1.18).toFixed(2))}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Applicable GST (18%):</span>
                  <strong style={{ fontSize: '14px', color: '#0F172A', fontFamily: 'var(--font-mono)' }}>
                    {formatINR(
                      viewOrder.gstAmount ||
                        +(viewOrder.netAmount - (viewOrder.grossAmount || viewOrder.netAmount / 1.18)).toFixed(2)
                    )}
                  </strong>
                </div>
                <div>
                  <span style={{ color: '#64748B', display: 'block' }}>Freight / Transit:</span>
                  <strong style={{ fontSize: '14px', color: '#059669', fontWeight: 800 }}>
                    FREE (Pan-India)
                  </strong>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <span style={{ color: '#64748B', display: 'block' }}>Net Settlement:</span>
                  <strong
                    style={{
                      fontSize: '18px',
                      color: '#0052CC',
                      fontWeight: 900,
                      fontFamily: 'var(--font-mono)',
                    }}
                  >
                    {formatINR(viewOrder.netAmount)}
                  </strong>
                </div>
              </div>
            </div>

            {/* Modal Actions Footer */}
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                flexWrap: 'wrap',
                gap: '12px',
                borderTop: '1px solid #E2E8F0',
                paddingTop: '16px',
              }}
            >
              {/* Quick Status Adjuster inside Modal */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ fontSize: '12px', fontWeight: 700, color: '#334155' }}>
                  Update Status:
                </span>
                <select
                  value={viewOrder.status}
                  onChange={(e) =>
                    handleDirectStatusChange(viewOrder, e.target.value as CustomerOrder['status'])
                  }
                  style={{
                    padding: '6px 12px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    fontSize: '12px',
                    fontWeight: 700,
                    background: '#FFFFFF',
                  }}
                >
                  <option value="CONFIRMED">📋 CONFIRMED</option>
                  <option value="PROCESSING">⚙️ PROCESSING</option>
                  <option value="DISPATCHED">📦 DISPATCHED</option>
                  <option value="IN_TRANSIT">🚚 IN TRANSIT</option>
                  <option value="DELIVERED">✓ DELIVERED</option>
                  <option value="CANCELLED">✕ CANCELLED</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => {
                    setEditOrder({ ...viewOrder });
                    setViewOrder(null);
                  }}
                  style={{ padding: '8px 16px', fontSize: '12px', background: '#FFFFFF' }}
                >
                  <Edit size={14} />
                  <span>Edit Dispatch</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setViewOrder(null)}
                  style={{ padding: '8px 20px', fontSize: '12px' }}
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 6. CREATE SHIPMENT MODAL */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '28px', maxWidth: '620px', borderRadius: '16px', background: '#FFFFFF' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '20px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#0F172A',
                    margin: 0,
                  }}
                >
                  Create Dispatch Shipment Order
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Register a customer order into the active freight dispatch pipeline
                </span>
              </div>
              <button
                type="button"
                onClick={() => setIsAddOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitAddForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Order Number</label>
                  <input
                    type="text"
                    placeholder="e.g. CBH-ORD-2025-9921"
                    value={addForm.orderNumber}
                    onChange={(e) => setAddForm({ ...addForm, orderNumber: e.target.value })}
                  />
                  <span className="hint">Auto-generated if left blank</span>
                </div>

                <div className="admin-form-group">
                  <label>Client Company Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHEL Heavy Machinery Division"
                    value={addForm.companyName}
                    onChange={(e) => setAddForm({ ...addForm, companyName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Contact Person</label>
                  <input
                    type="text"
                    placeholder="e.g. Sunil Nair"
                    value={addForm.customerName}
                    onChange={(e) => setAddForm({ ...addForm, customerName: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Phone / WhatsApp</label>
                  <input
                    type="text"
                    placeholder="e.g. 9888021000"
                    value={addForm.phone}
                    onChange={(e) => setAddForm({ ...addForm, phone: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Logistics Carrier</label>
                  <select
                    value={addForm.carrier}
                    onChange={(e) => setAddForm({ ...addForm, carrier: e.target.value })}
                  >
                    <option value="TCI Freight Express">TCI Freight Express</option>
                    <option value="Blue Dart Logistics">Blue Dart Logistics</option>
                    <option value="Safechem Express">Safechem Express</option>
                    <option value="V-Trans India">V-Trans India</option>
                    <option value="Delhivery Freight">Delhivery Freight</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Tracking Docket #</label>
                  <input
                    type="text"
                    placeholder="e.g. TCI-BLR-99210"
                    value={addForm.trackingNumber}
                    onChange={(e) => setAddForm({ ...addForm, trackingNumber: e.target.value })}
                  />
                  <span className="hint">Auto-generated if left blank</span>
                </div>

                <div className="admin-form-group">
                  <label>Cargo Total Weight (Kg)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={addForm.totalWeightKg}
                    onChange={(e) => setAddForm({ ...addForm, totalWeightKg: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Invoice Net Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    required
                    value={addForm.netAmount}
                    onChange={(e) => setAddForm({ ...addForm, netAmount: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Shipment Status</label>
                  <select
                    value={addForm.status}
                    onChange={(e) => setAddForm({ ...addForm, status: e.target.value as any })}
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                  </select>
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Delivery Destination Address</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. BHEL Foundry Plant, BHEL Township, Bhopal, MP - 462022"
                    value={addForm.shippingAddress}
                    onChange={(e) => setAddForm({ ...addForm, shippingAddress: e.target.value })}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>NABL 3.1 MTC Certificate Number</label>
                  <input
                    type="text"
                    placeholder="e.g. MTC-CBH-2025-9412-NABL"
                    value={addForm.mtcCertNumber}
                    onChange={(e) => setAddForm({ ...addForm, mtcCertNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setIsAddOpen(false)}
                  style={{ background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <Truck size={15} />
                  <span>Initiate Carrier Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 7. EDIT ORDER MODAL */}
      {editOrder && (
        <div className="modal-overlay active" onClick={() => setEditOrder(null)}>
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '28px', maxWidth: '620px', borderRadius: '16px', background: '#FFFFFF' }}
          >
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '16px',
                borderBottom: '1px solid #E2E8F0',
                paddingBottom: '12px',
              }}
            >
              <div>
                <h3
                  style={{
                    fontFamily: 'var(--font-headline)',
                    fontSize: '20px',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#0F172A',
                    margin: 0,
                  }}
                >
                  Edit Order: {editOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '12px', color: '#64748B' }}>
                  Update tracking docket, shipment status, or carrier assignment
                </span>
              </div>
              <button
                type="button"
                onClick={() => setEditOrder(null)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748B' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={submitEditForm}>
              <div className="admin-modal-grid">
                <div className="admin-form-group">
                  <label>Logistics Carrier</label>
                  <input
                    type="text"
                    value={editOrder.carrier}
                    onChange={(e) => setEditOrder({ ...editOrder, carrier: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Tracking Docket #</label>
                  <input
                    type="text"
                    value={editOrder.trackingNumber}
                    onChange={(e) => setEditOrder({ ...editOrder, trackingNumber: e.target.value })}
                  />
                </div>

                <div className="admin-form-group">
                  <label>Shipment Status</label>
                  <select
                    value={editOrder.status}
                    onChange={(e) =>
                      setEditOrder({ ...editOrder, status: e.target.value as CustomerOrder['status'] })
                    }
                  >
                    <option value="CONFIRMED">CONFIRMED</option>
                    <option value="PROCESSING">PROCESSING</option>
                    <option value="DISPATCHED">DISPATCHED</option>
                    <option value="IN_TRANSIT">IN_TRANSIT</option>
                    <option value="DELIVERED">DELIVERED</option>
                    <option value="CANCELLED">CANCELLED</option>
                  </select>
                </div>

                <div className="admin-form-group">
                  <label>Invoice Net Amount (₹)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={editOrder.netAmount}
                    onChange={(e) =>
                      setEditOrder({ ...editOrder, netAmount: parseFloat(e.target.value) || 0 })
                    }
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>Delivery Address</label>
                  <input
                    type="text"
                    value={editOrder.shippingAddress}
                    onChange={(e) => setEditOrder({ ...editOrder, shippingAddress: e.target.value })}
                  />
                </div>

                <div className="admin-form-group" style={{ gridColumn: 'span 2' }}>
                  <label>NABL 3.1 MTC Number</label>
                  <input
                    type="text"
                    value={editOrder.mtcCertNumber}
                    onChange={(e) => setEditOrder({ ...editOrder, mtcCertNumber: e.target.value })}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '24px' }}>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setEditOrder(null)}
                  style={{ background: '#FFFFFF' }}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  <CheckCircle2 size={15} />
                  <span>Save Order Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 8. DELETE CONFIRMATION MODAL */}
      {deleteOrder && (
        <div className="modal-overlay active" onClick={() => setDeleteOrder(null)}>
          <div
            className="modal-window"
            onClick={(e) => e.stopPropagation()}
            style={{ padding: '24px', maxWidth: '440px', borderRadius: '16px', background: '#FFFFFF' }}
          >
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: '12px',
                }}
              >
                <Trash2 size={24} />
              </div>
              <h3
                style={{
                  fontFamily: 'var(--font-headline)',
                  fontSize: '18px',
                  fontWeight: 800,
                  margin: '0 0 6px',
                  color: '#0F172A',
                }}
              >
                Delete Order Record?
              </h3>
              <p style={{ fontSize: '13px', color: '#64748B', margin: 0, lineHeight: '1.5' }}>
                Are you sure you want to delete order{' '}
                <strong style={{ color: '#0F172A' }}>{deleteOrder.orderNumber}</strong> (
                {deleteOrder.companyName})? This will permanently remove the shipment and its line items
                from the database.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1, background: '#FFFFFF' }}
                onClick={() => setDeleteOrder(null)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626', borderColor: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Delete Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
