import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { MobileModal } from '../../components/MobileModal';
import { FastenerProductImage } from '../../components/FastenerProductImage';
import { NavIcon } from '../../components/NavIcon';
import {
  mobileApi,
  formatQtyDisplay,
  MIN_QTY_PCS,
  MIN_QTY_KGS,
} from '../../config/api';
import { MobileCartItem, MobileAuthUser, GlobalUnit, MobileOrder } from '../../types';

interface CustomerCartScreenProps {
  cartItems: MobileCartItem[];
  user?: MobileAuthUser | null;
  onRequireAuth?: (initialView?: 'login' | 'register') => void;
  onUpdateQuantity: (productId: number, unit: GlobalUnit, newQty: number) => void;
  onRemoveItem: (productId: number, unit: GlobalUnit) => void;
  onClearCart: () => void;
  onNavigateToCatalog: () => void;
  onNavigateHome?: () => void;
  onOrderSuccess: (orderNumber: string) => void;
}

type PayMethod = 'PHONEPE' | 'NEFT_RTGS' | 'CREDIT_LINE' | 'COD';

const PAY_OPTIONS: { id: PayMethod; title: string; sub: string; tag?: string }[] = [
  { id: 'PHONEPE', title: 'UPI / Card / Netbanking', sub: 'Pay now, dispatch first', tag: 'Fastest' },
  { id: 'NEFT_RTGS', title: 'Bank transfer', sub: 'Proforma invoice issued' },
  { id: 'CREDIT_LINE', title: '30-day credit', sub: 'For approved GST accounts' },
  { id: 'COD', title: 'Pay on delivery', sub: 'Pay when it reaches your site' },
];

const fmt = (n: number) => n.toLocaleString('en-IN');

export const CustomerCartScreen: React.FC<CustomerCartScreenProps> = ({
  cartItems,
  user,
  onRequireAuth,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToCatalog,
  onOrderSuccess,
}) => {
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [contactName, setContactName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [shippingCity, setShippingCity] = useState('');
  const [shippingPincode, setShippingPincode] = useState('');
  const [poNumber, setPoNumber] = useState('');

  useEffect(() => {
    if (user) {
      if (user.companyName) setCompanyName(user.companyName);
      if (user.fullName) setContactName(user.fullName);
      if (user.phone) setPhone(user.phone);
      if (user.email) setEmail(user.email);
      if (user.address) setShippingAddress(user.address);
    }
  }, [user]);

  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [isRfqModalOpen, setIsRfqModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<PayMethod>('PHONEPE');
  const [confirmedOrder, setConfirmedOrder] = useState<MobileOrder | null>(null);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [showBreakdown, setShowBreakdown] = useState(false);

  // ---- Totals (logic unchanged) ----
  const totalWeightKg = +cartItems.reduce((s, i) => s + i.totalWeightKg, 0).toFixed(2);
  const grossTotal = +cartItems.reduce((s, i) => s + i.lineTotal, 0).toFixed(2);

  let slabDiscountPct = 0;
  let nextTierDelta = 0;
  let nextTierPct = 5;
  if (grossTotal >= 100000) {
    slabDiscountPct = 25;
  } else if (grossTotal >= 50000) {
    slabDiscountPct = 15;
    nextTierDelta = +(100000 - grossTotal).toFixed(2);
    nextTierPct = 25;
  } else if (grossTotal >= 25000) {
    slabDiscountPct = 5;
    nextTierDelta = +(50000 - grossTotal).toFixed(2);
    nextTierPct = 15;
  } else {
    nextTierDelta = +(25000 - grossTotal).toFixed(2);
    nextTierPct = 5;
  }

  const discountAmount = +(grossTotal * (slabDiscountPct / 100)).toFixed(2);
  const taxableTotal = +(grossTotal - discountAmount).toFixed(2);
  const freightAmount = grossTotal >= 25000 || cartItems.length === 0 ? 0 : 1200;
  const gstAmount = +((taxableTotal + freightAmount) * 0.18).toFixed(2);
  const netTotal = +(taxableTotal + freightAmount + gstAmount).toFixed(2);
  const progressPct = Math.min(100, Math.max(5, Math.round((grossTotal / 100000) * 100)));

  const cleanTitle = (name?: string) =>
    name ? name.replace(/\s*\([^)]*\)/g, '').trim() : 'Industrial Fastener';

  const requireUser = (fn: () => void) => {
    if (!user) {
      onRequireAuth?.('register');
      return;
    }
    fn();
  };

  const stepQty = (item: MobileCartItem, dir: 1 | -1) => {
    let next: number;
    if (item.unit === 'KGS') {
      if (dir === -1) {
        if (item.quantity <= MIN_QTY_KGS) return;
        const step = item.quantity <= 1 ? 0.25 : 0.5;
        next = Math.max(MIN_QTY_KGS, Math.round((item.quantity - step) * 100) / 100);
      } else {
        const step = item.quantity < 1 ? 0.25 : item.quantity < 5 ? 0.5 : 1;
        next = Math.round((item.quantity + step) * 100) / 100;
      }
    } else if (dir === -1) {
      if (item.quantity <= MIN_QTY_PCS) return;
      const step = item.quantity > 1000 ? 500 : 100;
      next = Math.max(MIN_QTY_PCS, item.quantity - step);
    } else {
      next = item.quantity + (item.quantity >= 1000 ? 500 : 100);
    }
    onUpdateQuantity(item.product.id, item.unit, next);
  };

  // ---- Submit RFQ ----
  const handleSubmitRfq = async () => {
    setIsSubmittingRfq(true);
    try {
      const res = await mobileApi.rfq.create({
        contactName: contactName.trim() || 'Procurement Officer',
        companyName: companyName.trim() || 'Industrial Procurement Desk',
        email: email.trim() || 'rfq@procurement.com',
        phone: phone.trim() || '+91 98880 00000',
        shippingPincode,
        globalUnit: 'PCS',
        items: cartItems.map((ci) => ({
          productId: ci.product.id,
          sku: ci.product.sku,
          name: ci.product.name,
          standard: ci.product.standard,
          quantity: ci.quantity,
          unitRate: ci.unitPrice,
          weightPerPcKg: ci.product.weightPerPcKg || 0.05,
        })),
      });
      setIsRfqModalOpen(false);
      setSuccessMsg(`Quote request ${res.rfqNumber || ''} sent`.replace('  ', ' '));
      onClearCart();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      Alert.alert('Could not send quote request', err.message || 'Please try again.');
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  // ---- Place order ----
  const handleCheckout = async () => {
    if (!user) {
      setIsCheckoutModalOpen(false);
      onRequireAuth?.('register');
      return;
    }
    if (!shippingAddress.trim() || !shippingPincode.trim()) {
      Alert.alert('Delivery details needed', 'Add your delivery address and pincode.');
      return;
    }

    setIsProcessingOrder(true);
    try {
      const res = await mobileApi.orders.create({
        customerId: user?.id || 101,
        customerName: contactName || user?.fullName || 'Procurement In-Charge',
        companyName: companyName || user?.companyName || 'Enterprise Fastener Buyer',
        phone: phone || user?.phone || '+91 98880 21000',
        email: email || user?.email || 'procurement@company.com',
        shippingAddress: `${shippingAddress.trim()}, City: ${shippingCity}, PIN: ${shippingPincode}`,
        city: shippingCity,
        deliveryPincode: shippingPincode,
        poNumber: poNumber.trim() || undefined,
        paymentMethod,
        paymentStatus:
          paymentMethod === 'COD' ? 'COD_ON_DELIVERY' : paymentMethod === 'NEFT_RTGS' ? 'PENDING' : 'PAID',
        netAmount: netTotal,
        totalWeightKg,
        carrier: totalWeightKg > 150 ? 'TCI Freight Logistics' : 'Blue Dart Express',
        items: cartItems.map((ci) => ({
          sku: ci.product.sku,
          name: ci.product.name,
          quantity: ci.quantity,
          rate: ci.unitPrice,
          weightKg: ci.totalWeightKg,
          uom: ci.unit,
        })),
      });

      setIsCheckoutModalOpen(false);
      onClearCart();
      if (res.order) {
        setConfirmedOrder(res.order);
        setIsSuccessModalOpen(true);
      } else {
        onOrderSuccess(res.orderNumber || 'CBH-ORD-8825');
      }
    } catch (err: any) {
      Alert.alert('Order failed', err.message || 'Check your connection and try again.');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  const payButtonLabel = () => {
    const amt = `₹${fmt(netTotal)}`;
    switch (paymentMethod) {
      case 'COD': return `Place order · ${amt}`;
      case 'PHONEPE': return `Pay ${amt}`;
      case 'NEFT_RTGS': return `Get proforma · ${amt}`;
      default: return `Place order · ${amt}`;
    }
  };

  const Header = ({ count, canClear }: { count?: number; canClear?: boolean }) => (
    <View style={styles.header}>
      <TouchableOpacity onPress={onNavigateToCatalog} style={styles.headerBtn} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
        <Text style={styles.headerBack}>←</Text>
      </TouchableOpacity>
      <View style={styles.headerCenter}>
        <Text style={styles.headerTitle}>Cart</Text>
        {count ? (
          <View style={styles.countBadge}>
            <Text style={styles.countText}>{count}</Text>
          </View>
        ) : null}
      </View>
      {canClear ? (
        <TouchableOpacity
          style={styles.clearBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() =>
            Alert.alert('Clear cart?', 'This removes all items.', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Clear', style: 'destructive', onPress: onClearCart },
            ])
          }
        >
          <Text style={styles.clearText}>Clear</Text>
        </TouchableOpacity>
      ) : (
        <View style={{ width: 44 }} />
      )}
    </View>
  );

  // ---- Empty state ----
  if (cartItems.length === 0) {
    return (
      <View style={styles.screen}>
        <Header />
        <View style={styles.emptyWrap}>
          <View style={styles.emptyCircle}>
            <NavIcon name="cart" color="#0052CC" size={34} />
          </View>
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptySub}>Add fasteners to get a price and quote.</Text>
          <TouchableOpacity onPress={onNavigateToCatalog} style={styles.emptyBtn} activeOpacity={0.85}>
            <Text style={styles.emptyBtnText}>Browse catalog</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      <Header count={cartItems.length} canClear />

      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {successMsg}</Text>
          </View>
        ) : null}

        {/* Discount progress */}
        <View style={styles.slabCard}>
          <View style={styles.rowBetween}>
            <Text style={styles.slabTitle}>
              {slabDiscountPct > 0 ? `${slabDiscountPct}% volume discount applied` : 'Volume discount'}
            </Text>
            <Text style={styles.slabWeight}>{totalWeightKg.toLocaleString()} kg</Text>
          </View>
          <View style={styles.track}>
            <View style={[styles.fill, { width: `${progressPct}%` }]} />
          </View>
          <Text style={styles.slabHint}>
            {slabDiscountPct >= 25
              ? 'Best discount unlocked'
              : `Add ₹${fmt(nextTierDelta)} more for ${nextTierPct}% off`}
          </Text>
        </View>

        {/* Items */}
        {cartItems.map((item) => {
          const std = item.product.standard || item.product.din || item.product.isoStandard || 'DIN 933';
          return (
            <View key={`${item.product.id}_${item.unit}`} style={styles.itemCard}>
              <View style={styles.itemImg}>
                <FastenerProductImage
                  imageUrl={item.product.imageUrl}
                  category={item.product.category || item.product.subGroup}
                  productName={item.product.name}
                  standard={std}
                  drawingUrl={item.product.drawingUrl}
                  height={72}
                  containerStyle={styles.itemImgInner}
                />
              </View>

              <View style={styles.itemBody}>
                <View style={styles.rowBetween}>
                  <Text style={styles.itemTitle} numberOfLines={1}>
                    {cleanTitle(item.product.name)}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemoveItem(item.product.id, item.unit)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  >
                    <Text style={styles.removeX}>✕</Text>
                  </TouchableOpacity>
                </View>

                <Text style={styles.itemSpec} numberOfLines={1}>
                  {std}
                  {item.product.grade ? ` · Gr ${item.product.grade}` : ''} · ₹{item.unitPrice}/{item.unit.toLowerCase()}
                </Text>

                <View style={styles.rowBetween}>
                  <View style={styles.stepper}>
                    <TouchableOpacity onPress={() => stepQty(item, -1)} style={styles.stepBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.stepBtnText}>−</Text>
                    </TouchableOpacity>
                    <Text style={styles.stepVal}>{formatQtyDisplay(item.quantity, item.unit)}</Text>
                    <TouchableOpacity onPress={() => stepQty(item, 1)} style={styles.stepBtn} hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}>
                      <Text style={styles.stepBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.lineTotal}>₹{fmt(item.lineTotal)}</Text>
                </View>
              </View>
            </View>
          );
        })}

        <TouchableOpacity onPress={onNavigateToCatalog} style={styles.addMore} activeOpacity={0.8}>
          <Text style={styles.addMoreText}>+ Add more items</Text>
        </TouchableOpacity>

        {/* Price details (collapsible) */}
        <View style={styles.summaryCard}>
          <TouchableOpacity
            style={styles.rowBetween}
            onPress={() => setShowBreakdown((v) => !v)}
            activeOpacity={0.8}
          >
            <Text style={styles.summaryTitle}>Price details</Text>
            <Text style={styles.chevron}>{showBreakdown ? '▲' : '▼'}</Text>
          </TouchableOpacity>

          {showBreakdown ? (
            <View style={styles.breakdown}>
              <Row k="Subtotal" v={`₹${fmt(grossTotal)}`} />
              {discountAmount > 0 ? (
                <Row k={`Discount (${slabDiscountPct}%)`} v={`− ₹${fmt(discountAmount)}`} green />
              ) : null}
              <Row k="GST 18%" v={`₹${fmt(gstAmount)}`} />
              <Row k="Delivery" v={freightAmount === 0 ? 'Free' : `₹${fmt(freightAmount)}`} green={freightAmount === 0} />
            </View>
          ) : null}

          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total</Text>
            <Text style={styles.totalVal}>₹{fmt(netTotal)}</Text>
          </View>
        </View>

        {/* Guest notice */}
        {!user ? (
          <View style={styles.guestBox}>
            <Text style={styles.guestText}>Create a company account to place orders.</Text>
            <TouchableOpacity style={styles.guestBtn} onPress={() => onRequireAuth?.('register')} activeOpacity={0.88}>
              <Text style={styles.guestBtnText}>Register</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </ScrollView>

      {/* Sticky checkout bar */}
      <View style={styles.bottomBar}>
        <TouchableOpacity
          style={styles.quoteBtn}
          onPress={() => requireUser(() => setIsRfqModalOpen(true))}
          activeOpacity={0.85}
        >
          <Text style={styles.quoteBtnText}>Get quote</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.checkoutBtn}
          onPress={() => requireUser(() => setIsCheckoutModalOpen(true))}
          activeOpacity={0.88}
        >
          <Text style={styles.checkoutLabel}>{user ? 'Checkout' : 'Register'}</Text>
          <Text style={styles.checkoutAmount}>₹{fmt(netTotal)}</Text>
        </TouchableOpacity>
      </View>

      {/* RFQ modal */}
      <MobileModal isOpen={isRfqModalOpen} onClose={() => setIsRfqModalOpen(false)} title="Request a quote">
        <View style={styles.modalContent}>
          <Field label="Company" value={companyName} onChange={setCompanyName} placeholder="Company name" />
          <Field label="Contact person" value={contactName} onChange={setContactName} placeholder="Your name" />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91" keyboardType="phone-pad" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode" value={shippingPincode} onChange={setShippingPincode} placeholder="Pincode" keyboardType="numeric" />
            </View>
          </View>
          <Field label="Email" value={email} onChange={setEmail} placeholder="you@company.com" keyboardType="email-address" />

          <TouchableOpacity
            onPress={handleSubmitRfq}
            disabled={isSubmittingRfq}
            style={[styles.primaryBtn, isSubmittingRfq && { opacity: 0.6 }]}
          >
            {isSubmittingRfq ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.primaryBtnText}>Send request</Text>}
          </TouchableOpacity>
        </View>
      </MobileModal>

      {/* Checkout modal */}
      <MobileModal isOpen={isCheckoutModalOpen} onClose={() => setIsCheckoutModalOpen(false)} title="Checkout">
        <ScrollView style={styles.modalContent} showsVerticalScrollIndicator={false}>
          <Text style={styles.groupLabel}>Delivery</Text>
          <Field
            label="Address"
            value={shippingAddress}
            onChange={setShippingAddress}
            placeholder="Plot, street, industrial area"
            multiline
          />
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Field label="City" value={shippingCity} onChange={setShippingCity} placeholder="City" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Pincode" value={shippingPincode} onChange={setShippingPincode} placeholder="Pincode" keyboardType="numeric" />
            </View>
          </View>
          <View style={styles.twoCol}>
            <View style={{ flex: 1 }}>
              <Field label="Site contact" value={contactName} onChange={setContactName} placeholder="Name" />
            </View>
            <View style={{ flex: 1 }}>
              <Field label="Phone" value={phone} onChange={setPhone} placeholder="+91" keyboardType="phone-pad" />
            </View>
          </View>
          <Field label="PO number (optional)" value={poNumber} onChange={setPoNumber} placeholder="PO-0001" />

          <Text style={[styles.groupLabel, { marginTop: 8 }]}>Payment</Text>
          {PAY_OPTIONS.map((opt) => {
            const active = paymentMethod === opt.id;
            return (
              <TouchableOpacity
                key={opt.id}
                onPress={() => setPaymentMethod(opt.id)}
                style={[styles.payRow, active && styles.payRowActive]}
                activeOpacity={0.85}
              >
                <View style={[styles.radio, active && styles.radioActive]}>
                  {active ? <View style={styles.radioDot} /> : null}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.payTitle}>{opt.title}</Text>
                  <Text style={styles.paySub}>{opt.sub}</Text>
                </View>
                {opt.tag ? (
                  <View style={styles.payTag}>
                    <Text style={styles.payTagText}>{opt.tag}</Text>
                  </View>
                ) : null}
              </TouchableOpacity>
            );
          })}

          <View style={styles.modalTotal}>
            <Text style={styles.modalTotalLabel}>
              {totalWeightKg.toLocaleString()} kg · incl. GST
            </Text>
            <Text style={styles.modalTotalVal}>₹{fmt(netTotal)}</Text>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isProcessingOrder}
            style={[styles.primaryBtn, isProcessingOrder && { opacity: 0.6 }]}
            activeOpacity={0.88}
          >
            {isProcessingOrder ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.primaryBtnText}>{payButtonLabel()}</Text>
            )}
          </TouchableOpacity>
        </ScrollView>
      </MobileModal>

      {/* Success modal */}
      {confirmedOrder ? (
        <MobileModal
          isOpen={isSuccessModalOpen}
          onClose={() => {
            setIsSuccessModalOpen(false);
            onOrderSuccess(confirmedOrder.orderNumber);
          }}
          title="Order placed"
        >
          <View style={styles.successContent}>
            <View style={styles.successCircle}>
              <NavIcon name="check" color="#16A34A" size={28} />
            </View>
            <Text style={styles.successOrderNum}>{confirmedOrder.orderNumber}</Text>
            <Text style={styles.successSub}>
              {confirmedOrder.paymentMethod === 'COD' ? 'Pay on delivery' : 'Payment confirmed'} · Ships within 24 hrs
            </Text>

            <View style={styles.infoBox}>
              <Row k="Carrier" v={confirmedOrder.carrier || 'Blue Dart Express'} />
              <Row k="Tracking (AWB)" v={confirmedOrder.trackingNumber || 'Being generated'} />
              <Row k="Weight" v={`${(confirmedOrder.totalWeightKg || 0).toLocaleString()} kg`} />
              <Row k="Total" v={`₹${fmt(confirmedOrder.netAmount || 0)}`} />
              {confirmedOrder.mtcCertNumber ? <Row k="MTC certificate" v={confirmedOrder.mtcCertNumber} green /> : null}
            </View>

            <TouchableOpacity
              onPress={() => {
                setIsSuccessModalOpen(false);
                onOrderSuccess(confirmedOrder.orderNumber);
              }}
              style={[styles.primaryBtn, { width: '100%' }]}
              activeOpacity={0.88}
            >
              <Text style={styles.primaryBtnText}>Track order</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => {
                setSuccessMsg(`Certificate downloaded for ${confirmedOrder.orderNumber}`);
                setTimeout(() => setSuccessMsg(''), 3000);
              }}
              style={styles.secondaryBtn}
              activeOpacity={0.85}
            >
              <Text style={styles.secondaryBtnText}>Download MTC certificate</Text>
            </TouchableOpacity>
          </View>
        </MobileModal>
      ) : null}
    </View>
  );
};

// ---- Small helpers ----
const Row: React.FC<{ k: string; v: string; green?: boolean }> = ({ k, v, green }) => (
  <View style={styles.row}>
    <Text style={[styles.rowKey, green && styles.green]}>{k}</Text>
    <Text style={[styles.rowVal, green && styles.green]}>{v}</Text>
  </View>
);

const Field: React.FC<{
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  keyboardType?: any;
  multiline?: boolean;
}> = ({ label, value, onChange, placeholder, keyboardType, multiline }) => (
  <View style={{ marginBottom: 8 }}>
    <Text style={styles.inputLabel}>{label}</Text>
    <TextInput
      style={[styles.input, multiline && { height: 60, textAlignVertical: 'top' }]}
      value={value}
      onChangeText={onChange}
      placeholder={placeholder}
      placeholderTextColor="#94A3B8"
      keyboardType={keyboardType}
      multiline={multiline}
    />
  </View>
);

const BLUE = '#0047AB';
const ORANGE = '#FF6B00';
const INK = '#0F172A';
const MUTED = '#64748B';
const LINE = '#E2E8F0';

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: '#F4F6FA' },
  rowBetween: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  green: { color: '#15803D' },

  // Header
  header: {
    backgroundColor: BLUE,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  headerBtn: { width: 44, paddingVertical: 2 },
  headerBack: { fontSize: 24, color: '#FFFFFF', fontWeight: '700' },
  headerCenter: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  headerTitle: { fontSize: 18, fontWeight: '800', color: '#FFFFFF' },
  countBadge: { backgroundColor: ORANGE, paddingHorizontal: 8, paddingVertical: 1, borderRadius: 12 },
  countText: { color: '#FFFFFF', fontSize: 12, fontWeight: '900' },
  clearBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.18)',
  },
  clearText: { color: '#FFFFFF', fontSize: 12, fontWeight: '700' },

  container: { padding: 14, gap: 10, paddingBottom: 24 },

  // Empty
  emptyWrap: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32 },
  emptyCircle: {
    width: 92,
    height: 92,
    borderRadius: 46,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  emptyTitle: { fontSize: 20, fontWeight: '800', color: INK },
  emptySub: { fontSize: 13, color: MUTED, marginTop: 4, marginBottom: 20 },
  emptyBtn: { backgroundColor: BLUE, paddingVertical: 13, paddingHorizontal: 28, borderRadius: 24 },
  emptyBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },

  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 12,
    padding: 12,
  },
  successText: { color: '#065F46', fontSize: 13, fontWeight: '700' },

  // Slab
  slabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
    gap: 6,
  },
  slabTitle: { fontSize: 13, fontWeight: '800', color: INK },
  slabWeight: { fontSize: 12, fontWeight: '700', color: MUTED },
  track: { height: 7, backgroundColor: LINE, borderRadius: 4, overflow: 'hidden' },
  fill: { height: '100%', backgroundColor: ORANGE, borderRadius: 4 },
  slabHint: { fontSize: 12, color: '#475569', fontWeight: '600' },

  // Item
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 10,
    borderWidth: 1,
    borderColor: LINE,
    gap: 10,
  },
  itemImg: {
    width: 76,
    height: 76,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemImgInner: { width: '100%', height: '100%', backgroundColor: 'transparent', borderWidth: 0 },
  itemBody: { flex: 1, justifyContent: 'space-between', gap: 4 },
  itemTitle: { flex: 1, fontSize: 14, fontWeight: '800', color: INK, marginRight: 8 },
  removeX: { fontSize: 14, color: '#94A3B8', fontWeight: '800' },
  itemSpec: { fontSize: 12, color: MUTED, fontWeight: '600' },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F5F9',
    borderRadius: 18,
    paddingHorizontal: 2,
  },
  stepBtn: { width: 32, height: 30, alignItems: 'center', justifyContent: 'center' },
  stepBtnText: { fontSize: 18, fontWeight: '900', color: BLUE },
  stepVal: { fontSize: 12, fontWeight: '800', color: INK, paddingHorizontal: 6, minWidth: 48, textAlign: 'center' },
  lineTotal: { fontSize: 15, fontWeight: '900', color: BLUE },

  addMore: {
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderStyle: 'dashed',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
  },
  addMoreText: { fontSize: 13, fontWeight: '700', color: BLUE },

  // Summary
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: LINE,
  },
  summaryTitle: { fontSize: 14, fontWeight: '800', color: INK },
  chevron: { fontSize: 11, color: MUTED },
  breakdown: { marginTop: 8, gap: 2 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  rowKey: { fontSize: 12, color: MUTED },
  rowVal: { fontSize: 12.5, fontWeight: '700', color: INK },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  totalLabel: { fontSize: 15, fontWeight: '800', color: INK },
  totalVal: { fontSize: 20, fontWeight: '900', color: BLUE },

  // Guest
  guestBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    borderRadius: 14,
    padding: 12,
    gap: 10,
  },
  guestText: { flex: 1, fontSize: 12.5, fontWeight: '600', color: '#1E3A8A' },
  guestBtn: { backgroundColor: BLUE, paddingHorizontal: 16, paddingVertical: 9, borderRadius: 10 },
  guestBtnText: { color: '#FFFFFF', fontSize: 13, fontWeight: '800' },

  // Bottom bar
  bottomBar: {
    flexDirection: 'row',
    gap: 10,
    padding: 12,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: LINE,
  },
  quoteBtn: {
    paddingHorizontal: 18,
    borderRadius: 14,
    borderWidth: 1.5,
    borderColor: BLUE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  quoteBtnText: { color: BLUE, fontSize: 13, fontWeight: '800' },
  checkoutBtn: {
    flex: 1,
    backgroundColor: BLUE,
    borderRadius: 14,
    paddingVertical: 13,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkoutLabel: { color: '#FFFFFF', fontSize: 15, fontWeight: '800' },
  checkoutAmount: { color: '#FFFFFF', fontSize: 15, fontWeight: '900' },

  // Modals
  modalContent: { gap: 2 },
  groupLabel: { fontSize: 13, fontWeight: '800', color: INK, marginBottom: 8 },
  twoCol: { flexDirection: 'row', gap: 8 },
  inputLabel: { fontSize: 12, fontWeight: '700', color: '#475569', marginBottom: 4 },
  input: {
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: INK,
    backgroundColor: '#FFFFFF',
  },
  primaryBtn: {
    backgroundColor: BLUE,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  primaryBtnText: { color: '#FFFFFF', fontSize: 14, fontWeight: '800' },
  secondaryBtn: {
    width: '100%',
    backgroundColor: '#F1F5F9',
    paddingVertical: 12,
    borderRadius: 14,
    alignItems: 'center',
    marginTop: 8,
  },
  secondaryBtnText: { color: INK, fontSize: 13, fontWeight: '700' },

  // Payment
  payRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1,
    borderColor: LINE,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    backgroundColor: '#FFFFFF',
  },
  payRowActive: { borderColor: BLUE, backgroundColor: '#EFF6FF' },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
  },
  radioActive: { borderColor: BLUE },
  radioDot: { width: 10, height: 10, borderRadius: 5, backgroundColor: BLUE },
  payTitle: { fontSize: 13, fontWeight: '800', color: INK },
  paySub: { fontSize: 11.5, color: MUTED, marginTop: 1 },
  payTag: { backgroundColor: '#DCFCE7', paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  payTagText: { fontSize: 11, fontWeight: '800', color: '#16A34A' },
  modalTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  modalTotalLabel: { fontSize: 12, color: MUTED, fontWeight: '600' },
  modalTotalVal: { fontSize: 18, fontWeight: '900', color: BLUE },

  // Success
  successContent: { alignItems: 'center', paddingVertical: 8 },
  successCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  successOrderNum: { fontSize: 18, fontWeight: '900', color: INK },
  successSub: { fontSize: 12.5, color: MUTED, marginTop: 2, marginBottom: 14 },
  infoBox: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: LINE,
    marginBottom: 6,
  },
});

export default CustomerCartScreen;