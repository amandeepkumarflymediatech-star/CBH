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
import { MobileCard } from '../../components/MobileCard';
import { MobileModal } from '../../components/MobileModal';
import { FastenerProductImage } from '../../components/FastenerProductImage';
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
  onNavigateHome?: () => void;
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
  onNavigateHome,
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

  const nextTargetKg =
    totalWeightKg >= 2000
      ? null
      : totalWeightKg >= 1000
      ? 2000
      : totalWeightKg >= 500
      ? 1000
      : totalWeightKg >= 250
      ? 500
      : 250;
  const progressPct = nextTargetKg
    ? Math.min(100, Math.max(10, Math.round((totalWeightKg / nextTargetKg) * 100)))
    : 100;
  const kgNeeded = nextTargetKg ? +(nextTargetKg - totalWeightKg).toFixed(1) : 0;

  const discountAmount = +(grossTotal * (slabDiscountPct / 100)).toFixed(2);
  const taxableTotal = +(grossTotal - discountAmount).toFixed(2);
  const gstAmount = +(taxableTotal * 0.18).toFixed(2);
  const freightAmount = totalWeightKg >= 1000 ? 0 : cartItems.length > 0 ? 2500 : 0;
  const netTotal = +(taxableTotal + gstAmount + freightAmount).toFixed(2);

  const getCleanCartTitle = (name?: string) => {
    if (!name) return 'Industrial Fastener';
    return name.replace(/\s*\([^)]*\)/g, '').trim();
  };

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
      <View style={styles.screen}>
        {/* Top Blue Header */}
        <View style={styles.topBlueHeader}>
          <TouchableOpacity
            onPress={onNavigateToCatalog}
            style={styles.headerMenuBtn}
            activeOpacity={0.8}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Text style={styles.headerMenuIcon}>←</Text>
          </TouchableOpacity>

          <View style={styles.brandRow}>
            <Text style={styles.brandTitle}>Procurement Cart</Text>
          </View>

          <View style={{ width: 44 }} />
        </View>

        <View style={styles.emptyContainer}>
          <View style={styles.emptyIconCircle}>
            <Text style={styles.emptyIcon}>🛒</Text>
          </View>
          <Text style={styles.emptyTitle}>Your RFQ Cart is Empty</Text>
          <Text style={styles.emptySubtitle}>
            Browse over 5,000+ DIN &amp; ISO industrial fasteners with live factory stock, volume slab discounts, and instant quoting.
          </Text>
          <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn} activeOpacity={0.85}>
            <Text style={styles.browseBtnText}>Explore Fastener Catalog →</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.screen}>
      {/* 1. TOP BRAND HEADER */}
      <View style={styles.topBlueHeader}>
        <TouchableOpacity
          onPress={onNavigateToCatalog}
          style={styles.headerMenuBtn}
          activeOpacity={0.8}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.headerMenuIcon}>←</Text>
        </TouchableOpacity>

        <View style={styles.brandRow}>
          <Text style={styles.brandTitle}>Procurement Cart</Text>
          <View style={styles.cartCountBadge}>
            <Text style={styles.cartCountBadgeText}>{cartItems.length}</Text>
          </View>
        </View>

        <TouchableOpacity
          onPress={() => {
            Alert.alert(
              'Clear Cart',
              'Are you sure you want to remove all items from your cart?',
              [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Clear All', style: 'destructive', onPress: onClearCart },
              ]
            );
          }}
          style={styles.clearHeaderBtn}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.clearHeaderText}>Clear</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {successMsg ? (
          <View style={styles.successBox}>
            <Text style={styles.successText}>✓ {successMsg}</Text>
          </View>
        ) : null}

        {/* Dynamic Slab Discount Status */}
        <View style={styles.slabCard}>
          <View style={styles.slabHeaderRow}>
            <View style={styles.slabTitleGroup}>
              <Text style={styles.slabIcon}>⚡</Text>
              <Text style={styles.slabTitle}>
                {slabDiscountPct > 0
                  ? `VOLUME DISCOUNT: ${slabDiscountPct}% ACTIVE`
                  : 'VOLUME SLAB DISCOUNT'}
              </Text>
            </View>
            <View style={styles.tonnageBadge}>
              <Text style={styles.tonnageBadgeText}>{totalWeightKg.toLocaleString()} Kg Total</Text>
            </View>
          </View>

          {/* Visual Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View
              style={[
                styles.progressBarFill,
                { width: `${progressPct}%` },
              ]}
            />
          </View>

          <Text style={styles.slabSubtitle}>
            {slabDiscountPct >= 18
              ? '🔥 Maximum 18% container volume discount unlocked!'
              : totalWeightKg >= 1000
              ? `14% active with FREE FREIGHT! Add ${kgNeeded} Kg more for 18% MAX discount.`
              : totalWeightKg >= 500
              ? `10% discount active. Add ${kgNeeded} Kg to reach 1,000 Kg for 14% & Free Freight!`
              : totalWeightKg >= 250
              ? `5% discount active. Add ${kgNeeded} Kg to unlock 10% discount at 500 Kg!`
              : `Add ${kgNeeded} Kg more to unlock 5% Volume Slab Discount (at 250 Kg)!`}
          </Text>
        </View>

        {/* Cart Items List */}
        <View style={styles.listHeaderRow}>
          <Text style={styles.sectionHeader}>SELECTED FASTENER LINES ({cartItems.length})</Text>
          <TouchableOpacity onPress={onNavigateToCatalog}>
            <Text style={styles.addMoreLink}>+ Add Fasteners</Text>
          </TouchableOpacity>
        </View>

        {cartItems.map((item) => {
          const standardDisplay = item.product.standard || item.product.din || item.product.isoStandard || 'DIN 933';
          const cleanTitle = getCleanCartTitle(item.product.name);

          return (
            <View key={`${item.product.id}_${item.unit}`} style={styles.itemCard}>
              {/* Left 3D Image Thumbnail Container */}
              <View style={styles.itemImgBox}>
                <FastenerProductImage
                  imageUrl={item.product.imageUrl}
                  category={item.product.category || item.product.subGroup}
                  productName={item.product.name}
                  standard={standardDisplay}
                  drawingUrl={item.product.drawingUrl}
                  height={78}
                  containerStyle={styles.fastenerImgStyle}
                />
                <View style={styles.unitBadge}>
                  <Text style={styles.unitBadgeText}>{item.unit}</Text>
                </View>
              </View>

              {/* Right Info Section */}
              <View style={styles.itemDetails}>
                {/* Row 1: Title & Delete */}
                <View style={styles.itemTitleRow}>
                  <Text style={styles.itemTitle} numberOfLines={2}>
                    {cleanTitle}
                  </Text>
                  <TouchableOpacity
                    onPress={() => onRemoveItem(item.product.id, item.unit)}
                    style={styles.trashBtn}
                    hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                  >
                    <Text style={styles.trashIcon}>✕</Text>
                  </TouchableOpacity>
                </View>

                {/* Row 2: Standard, Grade & Rate */}
                <View style={styles.itemSpecsRow}>
                  <View style={styles.stdBadge}>
                    <Text style={styles.stdBadgeText}>{standardDisplay}</Text>
                  </View>
                  {item.product.grade ? (
                    <View style={styles.gradeBadge}>
                      <Text style={styles.gradeBadgeText}>Gr. {item.product.grade}</Text>
                    </View>
                  ) : null}
                  <Text style={styles.itemRateText}>
                    ₹{item.unitPrice}/{item.unit.toLowerCase()}
                  </Text>
                </View>

                {/* Row 3: Stepper + Line Total */}
                <View style={styles.itemActionRow}>
                  <View style={styles.stepperContainer}>
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
                      style={styles.stepperBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.stepperBtnText}>−</Text>
                    </TouchableOpacity>

                    <Text style={styles.stepperValue}>
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
                      style={styles.stepperBtn}
                      hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                    >
                      <Text style={styles.stepperBtnText}>+</Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.priceCol}>
                    <Text style={styles.lineTotal}>₹{item.lineTotal.toLocaleString('en-IN')}</Text>
                    <Text style={styles.lineWeight}>{item.totalWeightKg} Kg</Text>
                  </View>
                </View>
              </View>
            </View>
          );
        })}

        {/* Commercial Summary Card */}
        <View style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryTitle}>COMMERCIAL BREAKDOWN (INR)</Text>
            <Text style={styles.summarySubtitle}>NABL Lab MTC &amp; Factory B2B Direct</Text>
          </View>

          <View style={styles.summaryDivider} />

          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Gross Fastener Subtotal</Text>
            <Text style={styles.summaryVal}>₹{grossTotal.toLocaleString('en-IN')}</Text>
          </View>

          {discountAmount > 0 ? (
            <View style={styles.summaryRow}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                <Text style={styles.discountBadge}>SAVE {slabDiscountPct}%</Text>
                <Text style={styles.discountLabel}>Volume Slab Discount</Text>
              </View>
              <Text style={styles.discountVal}>- ₹{discountAmount.toLocaleString('en-IN')}</Text>
            </View>
          ) : null}

          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Taxable Base Amount</Text>
            <Text style={styles.summaryVal}>₹{taxableTotal.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>GST @ 18% (HSN 7318)</Text>
            <Text style={styles.summaryVal}>₹{gstAmount.toLocaleString('en-IN')}</Text>
          </View>

          <View style={styles.summaryRow}>
            <Text style={styles.summaryKey}>Freight &amp; Handling</Text>
            <Text style={[styles.summaryVal, freightAmount === 0 ? styles.freeFreightText : null]}>
              {freightAmount === 0 ? 'FREE (Tonnage > 1 Ton)' : `₹${freightAmount.toLocaleString('en-IN')}`}
            </Text>
          </View>

          <View style={styles.totalDivider} />

          <View style={styles.totalRow}>
            <View>
              <Text style={styles.totalLabel}>Total Payable Amount</Text>
              <Text style={styles.totalSub}>Incl. GST &amp; Transit Insurance</Text>
            </View>
            <Text style={styles.totalVal}>₹{netTotal.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Dispatch Assurance Banner */}
        <View style={styles.assuranceBox}>
          <Text style={styles.assuranceIcon}>🚚</Text>
          <Text style={styles.assuranceText}>
            Direct logistics dispatch from Bangalore Depot via Blue Dart Express / TCI Freight with live transit tracking.
          </Text>
        </View>

        {/* Action Buttons: 1. Official RFQ, 2. Place Order */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            onPress={() => setIsRfqModalOpen(true)}
            style={styles.rfqActionBtn}
            activeOpacity={0.85}
          >
            <Text style={styles.rfqActionBtnText}>📄 Request Official RFQ Quote</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setIsCheckoutModalOpen(true)}
            style={styles.checkoutActionBtn}
            activeOpacity={0.88}
          >
            <Text style={styles.checkoutActionBtnText}>
              ⚡ Instant Factory Order (₹{netTotal.toLocaleString('en-IN')})
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

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
    </View>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },

  // 1. Top Brand Header
  topBlueHeader: {
    backgroundColor: '#0047AB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 10,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  headerMenuBtn: {
    padding: 6,
    borderRadius: 8,
  },
  headerMenuIcon: {
    fontSize: 22,
    color: '#FFFFFF',
    fontWeight: '700',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.3,
  },
  cartCountBadge: {
    backgroundColor: '#FF6B00',
    paddingHorizontal: 7,
    paddingVertical: 1,
    borderRadius: 12,
  },
  cartCountBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  clearHeaderBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  clearHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },

  container: {
    padding: 14,
    gap: 12,
    paddingBottom: 40,
  },

  // Empty State
  emptyContainer: {
    flex: 1,
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F8FAFC',
  },
  emptyIconCircle: {
    width: 90,
    height: 90,
    borderRadius: 45,
    backgroundColor: '#EFF6FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  emptyIcon: {
    fontSize: 42,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
    paddingHorizontal: 16,
  },
  browseBtn: {
    backgroundColor: '#0047AB',
    paddingVertical: 13,
    paddingHorizontal: 26,
    borderRadius: 24,
    elevation: 2,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
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

  // Dynamic Slab Card
  slabCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    elevation: 2,
    shadowColor: '#002B6B',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  slabHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  slabTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  slabIcon: {
    fontSize: 14,
  },
  slabTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1D4ED8',
    letterSpacing: 0.3,
  },
  tonnageBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  tonnageBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#1E40AF',
  },
  progressBarTrack: {
    height: 7,
    backgroundColor: '#E2E8F0',
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#FF6B00',
    borderRadius: 4,
  },
  slabSubtitle: {
    fontSize: 11,
    color: '#475569',
    marginTop: 6,
    fontWeight: '500',
    lineHeight: 16,
  },

  // Section Header Row
  listHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  sectionHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  addMoreLink: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0047AB',
  },

  // Fastener Item Card
  itemCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    borderWidth: 1,
    borderColor: '#E8EFF7',
    elevation: 2,
    shadowColor: '#002B6B',
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  itemImgBox: {
    width: 84,
    height: 84,
    borderRadius: 12,
    backgroundColor: '#EEF4FF',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E0EEFB',
    position: 'relative',
    flexShrink: 0,
  },
  fastenerImgStyle: {
    width: '100%',
    height: '100%',
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  unitBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    backgroundColor: '#0047AB',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  unitBadgeText: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900',
  },
  itemDetails: {
    flex: 1,
    marginLeft: 12,
    justifyContent: 'space-between',
  },
  itemTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  itemTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
    marginRight: 6,
  },
  trashBtn: {
    padding: 3,
    borderRadius: 4,
  },
  trashIcon: {
    fontSize: 13,
    color: '#94A3B8',
    fontWeight: '800',
  },
  itemSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  stdBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  stdBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  gradeBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 5,
    paddingVertical: 1.5,
    borderRadius: 4,
  },
  gradeBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  itemRateText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  itemActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 4,
  },
  stepperContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 2,
  },
  stepperBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperBtnText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0047AB',
  },
  stepperValue: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#0F172A',
    paddingHorizontal: 6,
  },
  priceCol: {
    alignItems: 'flex-end',
  },
  lineTotal: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0047AB',
  },
  lineWeight: {
    fontSize: 10.5,
    color: '#64748B',
    fontWeight: '500',
  },

  // Commercial Summary Card
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
  },
  summaryHeader: {
    marginBottom: 6,
  },
  summaryTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0F172A',
    letterSpacing: 0.5,
  },
  summarySubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  summaryDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4.5,
  },
  summaryKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },
  summaryVal: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#0F172A',
  },
  discountBadge: {
    backgroundColor: '#DCFCE7',
    color: '#15803D',
    fontSize: 9,
    fontWeight: '900',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
  },
  discountLabel: {
    fontSize: 12,
    color: '#15803D',
    fontWeight: '700',
  },
  discountVal: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#15803D',
  },
  freeFreightText: {
    color: '#15803D',
    fontWeight: '800',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 2,
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalSub: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 1,
  },
  totalVal: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0047AB',
  },

  // Assurance Banner
  assuranceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 10,
    padding: 10,
    gap: 8,
  },
  assuranceIcon: {
    fontSize: 16,
  },
  assuranceText: {
    fontSize: 11,
    color: '#166534',
    flex: 1,
    lineHeight: 15,
    fontWeight: '500',
  },

  // Actions
  actionsContainer: {
    gap: 8,
    marginTop: 2,
  },
  rfqActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#0047AB',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  rfqActionBtnText: {
    color: '#0047AB',
    fontSize: 13,
    fontWeight: '800',
  },
  checkoutActionBtn: {
    backgroundColor: '#0047AB',
    paddingVertical: 13,
    borderRadius: 10,
    alignItems: 'center',
    elevation: 3,
    shadowColor: '#0047AB',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  checkoutActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },

  // Modal styles
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
    borderColor: '#0047AB',
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
    backgroundColor: '#0047AB',
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
