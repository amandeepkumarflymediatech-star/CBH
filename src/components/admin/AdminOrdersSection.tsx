'use client';

import React, { useState, useMemo } from 'react';
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
  Navigation,
  ArrowRight
} from 'lucide-react';

interface AdminOrdersSectionProps {
  orders: CustomerOrder[];
  onAdd: (order: Omit<CustomerOrder, 'id'>) => Promise<void>;
  onUpdate: (order: CustomerOrder) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  showToast: (msg: string) => void;
}

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

  // Modal states
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [editOrder, setEditOrder] = useState<CustomerOrder | null>(null);
  const [deleteOrder, setDeleteOrder] = useState<CustomerOrder | null>(null);

  // Add form fields
  const [addForm, setAddForm] = useState({
    orderNumber: '',
    customerName: '',
    companyName: '',
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
          o.shippingAddress?.toLowerCase().includes(q)
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

  const handleResetFilters = () => {
    setSearch('');
    setSelectedStatus('all');
    setSelectedCarrier('all');
    setSortBy('date_desc');
  };

  const handleExportCSV = () => {
    const headers = ['Order Number', 'Date', 'Company', 'Customer', 'Items Count', 'Weight (Kg)', 'Net Amount (INR)', 'Carrier', 'Tracking Docket', 'Status', 'MTC Cert', 'Address'];
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
      `"${o.shippingAddress.replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `cbh_orders_dispatch_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(`Exported ${filteredOrders.length} orders to CSV`);
  };

  const submitAddForm = async (e: React.FormEvent) => {
    e.preventDefault();
    const orderNum = addForm.orderNumber || `CBH-ORD-2025-${Math.floor(1000 + Math.random() * 9000)}`;

    await onAdd({
      orderNumber: orderNum,
      date: new Date().toISOString().split('T')[0],
      customerName: addForm.customerName || 'Procurement Officer',
      companyName: addForm.companyName || 'Apex Heavy Infra Ltd.',
      itemsCount: parseInt(addForm.itemsCount) || 3,
      totalWeightKg: parseFloat(addForm.totalWeightKg) || 500.0,
      netAmount: parseFloat(addForm.netAmount) || 75000.0,
      status: addForm.status,
      carrier: addForm.carrier,
      trackingNumber: addForm.trackingNumber || `${addForm.carrier.substring(0, 3).toUpperCase()}-${Math.floor(100000 + Math.random() * 900000)}`,
      dispatchDate: addForm.dispatchDate,
      shippingAddress: addForm.shippingAddress || 'Plot 44, Peenya Phase 2, Industrial Area, Bengaluru, KA',
      mtcCertNumber: addForm.mtcCertNumber || `MTC-CBH-2025-${Math.floor(1000 + Math.random() * 9000)}-NABL`,
    });

    setIsAddOpen(false);
    setAddForm({
      orderNumber: '',
      customerName: '',
      companyName: '',
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
    setEditOrder(null);
  };

  const confirmDelete = async () => {
    if (!deleteOrder) return;
    await onDelete(deleteOrder.id);
    setDeleteOrder(null);
  };

  const advanceOrderStatus = async (order: CustomerOrder) => {
    let nextStatus: CustomerOrder['status'] = order.status;
    if (order.status === 'CONFIRMED') nextStatus = 'PROCESSING';
    else if (order.status === 'PROCESSING') nextStatus = 'DISPATCHED';
    else if (order.status === 'DISPATCHED') nextStatus = 'IN_TRANSIT';
    else if (order.status === 'IN_TRANSIT') nextStatus = 'DELIVERED';

    if (nextStatus !== order.status) {
      await onUpdate({
        ...order,
        status: nextStatus,
      });
      showToast(`Order ${order.orderNumber} status advanced to ${nextStatus}`);
    }
  };

  return (
    <div className="portal-main-card">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', margin: 0 }}>
            Orders & Carrier Dispatch Management ({orders.length} Shipments)
          </h3>
          <p style={{ fontSize: '12px', color: 'var(--color-text-muted)', margin: '4px 0 0 0' }}>
            Real-time multi-modal freight logistics, carrier tracking, and NABL 3.1 Mill Test Certificate dispatch
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button
            type="button"
            className="btn-outline"
            style={{ padding: '8px 14px', fontSize: '12px' }}
            onClick={handleExportCSV}
          >
            <Download size={14} />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '13px' }}
            onClick={() => setIsAddOpen(true)}
          >
            <Plus size={15} />
            <span>New Dispatch Shipment</span>
          </button>
        </div>
      </div>

      {/* Filter Bar */}
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
            <option value="all">Status: All Logistics</option>
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
          {(search || selectedStatus !== 'all' || selectedCarrier !== 'all' || sortBy !== 'date_desc') && (
            <button
              type="button"
              className="btn-outline"
              style={{ padding: '4px 8px', fontSize: '11px' }}
              onClick={handleResetFilters}
            >
              <RefreshCw size={11} />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Order # & Date</th>
              <th>Client & Destination</th>
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
                    <button type="button" className="btn-outline" onClick={handleResetFilters}>
                      Clear All Filters
                    </button>
                  </div>
                </td>
              </tr>
            ) : (
              filteredOrders.map((o) => {
                const isDelivered = o.status === 'DELIVERED';

                return (
                  <tr key={o.id}>
                    <td>
                      <strong style={{ fontFamily: 'var(--font-mono)', fontSize: '13px', color: 'var(--color-dark-900)' }}>
                        {o.orderNumber}
                      </strong>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Date: {o.date}
                      </div>
                    </td>
                    <td>
                      <div style={{ fontWeight: 700, color: 'var(--color-dark-900)' }}>
                        {o.companyName || 'Enterprise Plant'}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', maxWidth: '240px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {o.shippingAddress}
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {o.totalWeightKg ? `${o.totalWeightKg.toLocaleString()} Kg` : 'Batch Lot'}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        ({((o.totalWeightKg || 0) / 1000).toFixed(2)} MT)
                      </div>
                    </td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <Truck size={14} color="#0284C7" />
                        <span style={{ fontWeight: 600 }}>{o.carrier}</span>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        fontFamily: 'var(--font-mono)',
                        fontWeight: 700,
                        color: '#0284C7',
                        fontSize: '12px'
                      }}>
                        {o.trackingNumber}
                      </span>
                      <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', fontFamily: 'var(--font-mono)' }}>
                        Dispatched: {o.dispatchDate}
                      </div>
                    </td>
                    <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, color: '#D2051E' }}>
                      {formatINR(o.netAmount)}
                    </td>
                    <td>
                      <span className={`badge ${
                        o.status === 'DELIVERED'
                          ? 'badge-certified'
                          : o.status === 'IN_TRANSIT' || o.status === 'DISPATCHED'
                          ? 'badge-vip'
                          : o.status === 'CANCELLED'
                          ? 'badge-surplus'
                          : ''
                      }`}>
                        {o.status}
                      </span>
                    </td>
                    <td>
                      <span style={{
                        fontSize: '11px',
                        fontFamily: 'var(--font-mono)',
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '3px',
                        color: '#059669',
                        fontWeight: 700
                      }}>
                        <FileText size={11} /> {o.mtcCertNumber ? o.mtcCertNumber.substring(0, 14) + '...' : 'NABL-EN10204'}
                      </span>
                    </td>
                    <td>
                      <div className="admin-action-btn-group" style={{ justifyContent: 'flex-end' }}>
                        {!isDelivered && (
                          <button
                            type="button"
                            className="admin-btn-action admin-btn-toggle"
                            onClick={() => advanceOrderStatus(o)}
                            title="Advance to Next Logistics Stage"
                          >
                            <ArrowRight size={11} />
                            <span>Advance</span>
                          </button>
                        )}
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-edit"
                          onClick={() => setEditOrder({ ...o })}
                          title="Edit Dispatch Details"
                        >
                          <Edit size={12} />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          className="admin-btn-action admin-btn-delete"
                          onClick={() => setDeleteOrder(o)}
                          title="Cancel Order Record"
                        >
                          <Trash2 size={12} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* New Shipment Modal */}
      {isAddOpen && (
        <div className="modal-overlay active" onClick={() => setIsAddOpen(false)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                Create Dispatch Shipment Order
              </h3>
              <button type="button" onClick={() => setIsAddOpen(false)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <Truck size={15} />
                  <span>Initiate Carrier Dispatch</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Order Modal */}
      {editOrder && (
        <div className="modal-overlay active" onClick={() => setEditOrder(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '28px', maxWidth: '620px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div>
                <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '20px', fontWeight: 800, textTransform: 'uppercase', color: 'var(--color-dark-900)', margin: 0 }}>
                  Edit Order: {editOrder.orderNumber}
                </h3>
                <span style={{ fontSize: '12px', color: 'var(--color-text-muted)' }}>
                  Update tracking docket, shipment status, or carrier assignment
                </span>
              </div>
              <button type="button" onClick={() => setEditOrder(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
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
                    onChange={(e) => setEditOrder({ ...editOrder, status: e.target.value as any })}
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
                    onChange={(e) => setEditOrder({ ...editOrder, netAmount: parseFloat(e.target.value) || 0 })}
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
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                >
                  <CheckCircle2 size={15} />
                  <span>Save Order Updates</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteOrder && (
        <div className="modal-overlay active" onClick={() => setDeleteOrder(null)}>
          <div className="modal-window" onClick={(e) => e.stopPropagation()} style={{ padding: '24px', maxWidth: '440px' }}>
            <div style={{ textAlign: 'center', marginBottom: '16px' }}>
              <div style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '10px'
              }}>
                <Trash2 size={24} />
              </div>
              <h3 style={{ fontFamily: 'var(--font-headline)', fontSize: '18px', fontWeight: 800, margin: '0 0 6px', color: 'var(--color-dark-900)' }}>
                Cancel Order Record?
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--color-text-muted)', margin: 0 }}>
                Are you sure you want to cancel order <strong>{deleteOrder.orderNumber}</strong> ({deleteOrder.companyName})?
                This will mark the freight dispatch as cancelled and archive the record.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                type="button"
                className="btn-outline"
                style={{ flex: 1 }}
                onClick={() => setDeleteOrder(null)}
              >
                Go Back
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ flex: 1, background: '#DC2626' }}
                onClick={confirmDelete}
              >
                Yes, Cancel Order
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
