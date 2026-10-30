import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileCartItem, MobileAuthUser, GlobalUnit } from '../../types';

interface CustomerCartScreenProps {
  cartItems: MobileCartItem[];
  user?: MobileAuthUser | null;
  onRequireAuth?: () => void;
  onUpdateQuantity: (productId: number, unit: GlobalUnit, newQty: number) => void;
  onRemoveItem: (productId: number, unit: GlobalUnit) => void;
  onClearCart: () => void;
  onNavigateToCatalog: () => void;
  onOrderSuccess: (orderNumber: string) => void;
}

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
  // Buyer form details (dynamically bound to user or guest input)
  const [companyName, setCompanyName] = useState(user?.companyName || '');
  const [contactName, setContactName] = useState(user?.fullName || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [email, setEmail] = useState(user?.email || '');
  const [shippingAddress, setShippingAddress] = useState(user?.address || 'Plot 42, Peenya Industrial Area, Phase 2, Bengaluru, Karnataka');
  const [shippingPincode, setShippingPincode] = useState('560058');

  // Sync state if user changes
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
  const [paymentMethod, setPaymentMethod] = useState<'PHONEPE' | 'NEFT_RTGS' | 'CREDIT_LINE'>('PHONEPE');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Computations
  const totalWeightKg = +(
    cartItems.reduce((sum, item) => sum + item.totalWeightKg, 0)
  ).toFixed(2);

  const grossTotal = +(
    cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  ).toFixed(2);

  // Dynamic Slab Discount
  const slabDiscountPct =
    totalWeightKg >= 2000 ? 18 : totalWeightKg >= 1000 ? 14 : totalWeightKg >= 500 ? 10 : totalWeightKg >= 250 ? 5 : 0;

  const discountAmount = +(grossTotal * (slabDiscountPct / 100)).toFixed(2);
  const taxableTotal = +(grossTotal - discountAmount).toFixed(2);
  const gstAmount = +(taxableTotal * 0.18).toFixed(2);
  const freightAmount = totalWeightKg >= 1000 ? 0 : cartItems.length > 0 ? 2500 : 0;
  const netTotal = +(taxableTotal + gstAmount + freightAmount).toFixed(2);

  // Submit Official RFQ
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
      setSuccessMsg(`Official RFQ ${res.rfqNumber || 'CBH-RFQ-3095'} Created & Pushed to Quoting Desk!`);
      onClearCart();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'RFQ submission failed');
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  // Submit Direct Order & Dispatch
  const handleCheckout = async () => {
    setIsProcessingOrder(true);
    try {
      const res = await mobileApi.orders.create({
        customerId: user?.id || 101,
        shippingAddress: `${shippingAddress}, PIN: ${shippingPincode}`,
        paymentMethod,
        items: cartItems.map((ci) => ({
          sku: ci.product.sku,
          name: ci.product.name,
          quantity: ci.quantity,
          rate: ci.unitPrice,
          weightKg: ci.totalWeightKg,
        })),
      });

      setIsCheckoutModalOpen(false);
      onClearCart();
      onOrderSuccess(res.orderNumber || 'CBH-ORD-8825');
    } catch (err: any) {
      alert(err.message || 'Checkout failed');
    } finally {
      setIsProcessingOrder(false);
    }
  };

  if (cartItems.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text style={styles.emptyIcon}>🛒</Text>
        <Text style={styles.emptyTitle}>Your RFQ Cart is Empty</Text>
        <Text style={styles.emptySubtitle}>
          Select industrial fasteners from the catalog to calculate volume tonnage discounts, generate official RFQs, or place immediate factory orders.
        </Text>
        <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn}>
          <Text style={styles.browseBtnText}>Browse Fastener Catalog</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {successMsg ? (
        <View style={styles.successBox}>
          <Text style={styles.successText}>✓ {successMsg}</Text>
        </View>
      ) : null}

      {/* Dynamic Slab Discount Status */}
      <View style={styles.slabCard}>
        <View style={styles.slabHeaderRow}>
          <Text style={styles.slabTitle}>
            {slabDiscountPct > 0
              ? `✨ VOLUME SLAB DISCOUNT: ${slabDiscountPct}% ACTIVE`
              : '⚡ VOLUME SLAB DISCOUNT'}
          </Text>
          <Text style={styles.slabTonnage}>{totalWeightKg.toLocaleString()} Kg</Text>
        </View>
        <Text style={styles.slabSubtitle}>
          {slabDiscountPct >= 18
            ? 'Maximum 18% container volume discount unlocked!'
            : totalWeightKg >= 1000
            ? '14% discount active. Add more to unlock 18% discount at 2,000 Kg.'
            : totalWeightKg >= 500
            ? '10% discount active. Add more to reach 1,000 Kg for 14% discount and Free Freight!'
            : 'Reach 250 Kg for 5% discount, 500 Kg for 10% discount, and 1,000 Kg for Free Freight!'}
        </Text>
      </View>

      {/* Cart Items List */}
      <Text style={styles.sectionHeader}>SELECTED FASTENER LINES ({cartItems.length})</Text>

      {cartItems.map((item) => (
        <MobileCard key={`${item.product.id}_${item.unit}`}>
          <View style={styles.itemTopRow}>
            <View style={{ flex: 1 }}>
              <View style={styles.skuRow}>
                <Text style={styles.itemSku}>{item.product.sku}</Text>
                {item.product.standard ? (
                  <Text style={styles.itemStd}>{item.product.standard}</Text>
                ) : null}
              </View>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemRate}>
                Rate: ₹{item.unitPrice} / {item.unit}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onRemoveItem(item.product.id, item.unit)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.itemDivider} />

          <View style={styles.itemBottomRow}>
            {/* Quantity Stepper */}
            <View style={styles.qtyControlRow}>
              <TouchableOpacity
                onPress={() =>
                  onUpdateQuantity(
                    item.product.id,
                    item.unit,
                    Math.max(
                      item.unit === 'PCS' ? 100 : 10,
                      item.quantity - (item.unit === 'PCS' ? 500 : 25)
                    )
                  )
                }
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>-</Text>
              </TouchableOpacity>

              <Text style={styles.qtyValue}>
                {item.quantity.toLocaleString()} {item.unit}
              </Text>

              <TouchableOpacity
                onPress={() =>
                  onUpdateQuantity(
                    item.product.id,
                    item.unit,
                    item.quantity + (item.unit === 'PCS' ? 500 : 25)
                  )
                }
                style={styles.qtyBtn}
              >
                <Text style={styles.qtyBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Line Total & Weight */}
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.lineTotal}>₹{item.lineTotal.toLocaleString('en-IN')}</Text>
              <Text style={styles.lineWeight}>{item.totalWeightKg} Kg</Text>
            </View>
          </View>
        </MobileCard>
      ))}

      {/* Commercial Summary Card */}
      <MobileCard>
        <Text style={styles.summaryTitle}>COMMERCIAL BREAKDOWN (INR)</Text>
        
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Gross Fastener Subtotal</Text>
          <Text style={styles.summaryVal}>₹{grossTotal.toLocaleString('en-IN')}</Text>
        </View>

        {discountAmount > 0 ? (
          <View style={styles.summaryRow}>
            <Text style={[styles.summaryKey, { color: '#059669', fontWeight: '700' }]}>
              Volume Slab Discount ({slabDiscountPct}%)
            </Text>
            <Text style={[styles.summaryVal, { color: '#059669', fontWeight: '700' }]}>
              - ₹{discountAmount.toLocaleString('en-IN')}
            </Text>
          </View>
        ) : null}

        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Taxable Base</Text>
          <Text style={styles.summaryVal}>₹{taxableTotal.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>GST @ 18% (HSN 7318)</Text>
          <Text style={styles.summaryVal}>₹{gstAmount.toLocaleString('en-IN')}</Text>
        </View>

        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Freight &amp; Handling</Text>
          <Text style={[styles.summaryVal, freightAmount === 0 ? { color: '#059669' } : null]}>
            {freightAmount === 0 ? 'FREE (Tonnage > 1 Ton)' : `₹${freightAmount.toLocaleString('en-IN')}`}
          </Text>
        </View>

        <View style={styles.totalDivider} />

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.totalLabel}>Total Payable Amount</Text>
            <Text style={styles.totalSub}>Incl. GST &amp; Transit Insurance</Text>
          </View>
          <Text style={styles.totalVal}>₹{netTotal.toLocaleString('en-IN')}</Text>
        </View>
      </MobileCard>

      {/* Action Buttons: 1. Official RFQ, 2. Place Order */}
      <View style={styles.actionsContainer}>
        <TouchableOpacity
          onPress={() => setIsRfqModalOpen(true)}
          style={styles.rfqActionBtn}
        >
          <Text style={styles.rfqActionBtnText}>📄 Request Official RFQ Quote</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setIsCheckoutModalOpen(true)}
          style={styles.checkoutActionBtn}
        >
          <Text style={styles.checkoutActionBtnText}>⚡ Instant Factory Order (₹{netTotal.toLocaleString('en-IN')})</Text>
        </TouchableOpacity>
      </View>

      {/* Modal: RFQ Details Confirmation */}
      <MobileModal
        isOpen={isRfqModalOpen}
        onClose={() => setIsRfqModalOpen(false)}
        title="Submit Commercial RFQ"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Our Sales Engineers will review this enquiry and return an ERPNext-verified official PDF quotation with test certificates.
          </Text>

          <Text style={styles.inputLabel}>Company Name *</Text>
          <TextInput
            style={styles.textInput}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="e.g. Apex Heavy Infrastructure Ltd."
          />

          <Text style={styles.inputLabel}>Contact Person *</Text>
          <TextInput
            style={styles.textInput}
            value={contactName}
            onChangeText={setContactName}
            placeholder="e.g. Rajesh Sharma"
          />

          <View style={styles.inputsRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Phone *</Text>
              <TextInput
                style={styles.textInput}
                value={phone}
                onChangeText={setPhone}
                placeholder="+91 98880..."
                keyboardType="phone-pad"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.inputLabel}>Pincode *</Text>
              <TextInput
                style={styles.textInput}
                value={shippingPincode}
                onChangeText={setShippingPincode}
                placeholder="560058"
                keyboardType="numeric"
              />
            </View>
          </View>

          <Text style={styles.inputLabel}>Official Email *</Text>
          <TextInput
            style={styles.textInput}
            value={email}
            onChangeText={setEmail}
            placeholder="procurement@company.com"
            keyboardType="email-address"
          />

          <TouchableOpacity
            onPress={handleSubmitRfq}
            disabled={isSubmittingRfq}
            style={[styles.modalSubmitBtn, isSubmittingRfq ? { opacity: 0.6 } : null]}
          >
            {isSubmittingRfq ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.modalSubmitBtnText}>Submit RFQ Inquiry →</Text>
            )}
          </TouchableOpacity>
        </View>
      </MobileModal>

      {/* Modal: Checkout / Immediate Order */}
      <MobileModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Fastener Order"
      >
        <View style={styles.modalContent}>
          <Text style={styles.modalSubtitle}>
            Consignment will be reserved in ERPNext and queued for factory packaging.
          </Text>

          <Text style={styles.inputLabel}>Delivery Address *</Text>
          <TextInput
            style={[styles.textInput, { height: 60 }]}
            multiline
            value={shippingAddress}
            onChangeText={setShippingAddress}
            placeholder="Warehouse / Site Address"
          />

          <Text style={styles.inputLabel}>Payment Mode</Text>
          <View style={styles.paymentMethodsWrap}>
            <TouchableOpacity
              onPress={() => setPaymentMethod('PHONEPE')}
              style={[
                styles.paymentOption,
                paymentMethod === 'PHONEPE' ? styles.paymentOptionActive : null,
              ]}
            >
              <Text style={styles.paymentOptionTitle}>📱 PhonePe UPI / Card</Text>
              <Text style={styles.paymentOptionSub}>Instant 100% confirmation</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('NEFT_RTGS')}
              style={[
                styles.paymentOption,
                paymentMethod === 'NEFT_RTGS' ? styles.paymentOptionActive : null,
              ]}
            >
              <Text style={styles.paymentOptionTitle}>🏦 RTGS / NEFT Wire</Text>
              <Text style={styles.paymentOptionSub}>HDFC Bank Current A/C Proforma</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setPaymentMethod('CREDIT_LINE')}
              style={[
                styles.paymentOption,
                paymentMethod === 'CREDIT_LINE' ? styles.paymentOptionActive : null,
              ]}
            >
              <Text style={styles.paymentOptionTitle}>🏢 30-Day B2B Credit Line</Text>
              <Text style={styles.paymentOptionSub}>Subject to credit verification</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity
            onPress={handleCheckout}
            disabled={isProcessingOrder}
            style={[styles.modalSubmitBtn, isProcessingOrder ? { opacity: 0.6 } : null]}
          >
            {isProcessingOrder ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.modalSubmitBtnText}>
                Confirm &amp; Place Order (₹{netTotal.toLocaleString('en-IN')})
              </Text>
            )}
          </TouchableOpacity>
        </View>
      </MobileModal>
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
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
    gap: 12,
  },
  emptyIcon: {
    fontSize: 50,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  browseBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 10,
    marginTop: 8,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 10,
    padding: 12,
  },
  successText: {
    color: '#065F46',
    fontSize: 13,
    fontWeight: '700',
  },
  slabCard: {
    backgroundColor: '#EFF6FF',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  slabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  slabTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1D4ED8',
  },
  slabTonnage: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  slabSubtitle: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  itemTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  skuRow: {
    flexDirection: 'row',
    gap: 6,
    alignItems: 'center',
  },
  itemSku: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemStd: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  itemRate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 4,
  },
  deleteBtnText: {
    fontSize: 14,
    color: '#94A3B8',
    fontWeight: '700',
  },
  itemDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  itemBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  qtyBtn: {
    width: 32,
    height: 32,
    borderRadius: 6,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyBtnText: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0052CC',
  },
  qtyValue: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0052CC',
  },
  lineWeight: {
    fontSize: 11,
    color: '#64748B',
  },
  summaryTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 8,
    letterSpacing: 0.5,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  summaryKey: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalSub: {
    fontSize: 10,
    color: '#94A3B8',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0052CC',
  },
  actionsContainer: {
    gap: 8,
    marginTop: 4,
  },
  rfqActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rfqActionBtnText: {
    color: '#0052CC',
    fontSize: 13,
    fontWeight: '800',
  },
  checkoutActionBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  checkoutActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  modalContent: {
    gap: 10,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 16,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginTop: 2,
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
  inputsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  paymentMethodsWrap: {
    gap: 8,
    marginTop: 4,
  },
  paymentOption: {
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#F8FAFC',
  },
  paymentOptionActive: {
    borderColor: '#0052CC',
    backgroundColor: '#EFF6FF',
  },
  paymentOptionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
  },
  paymentOptionSub: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  modalSubmitBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  modalSubmitBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
});

export default CustomerCartScreen;
