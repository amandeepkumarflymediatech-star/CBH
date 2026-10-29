import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileModal } from '../../components/MobileModal';
import { mobileApi } from '../../config/api';
import { MobileCartItem } from '../../types';

interface CustomerCartScreenProps {
  cartItems: MobileCartItem[];
  onUpdateQuantity: (productId: number, unit: 'PCS' | 'KGS', newQty: number) => void;
  onRemoveItem: (productId: number, unit: 'PCS' | 'KGS') => void;
  onClearCart: () => void;
  onNavigateToCatalog: () => void;
  onOrderSuccess: (orderId: string) => void;
}

export const CustomerCartScreen: React.FC<CustomerCartScreenProps> = ({
  cartItems,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onNavigateToCatalog,
  onOrderSuccess,
}) => {
  const [shippingPincode, setShippingPincode] = useState('560058');
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  const [isCheckoutModalOpen, setIsCheckoutModalOpen] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'PHONEPE' | 'NEFT_RTGS' | 'CREDIT_LINE'>('PHONEPE');
  const [isProcessingOrder, setIsProcessingOrder] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  const totalWeightKg = +(
    cartItems.reduce((sum, item) => sum + item.totalWeightKg, 0)
  ).toFixed(2);

  const grossTotal = +(
    cartItems.reduce((sum, item) => sum + item.lineTotal, 0)
  ).toFixed(2);

  const slabDiscountPct = totalWeightKg >= 1000 ? 18 : totalWeightKg >= 500 ? 14 : 10;
  const discountAmount = +(grossTotal * (slabDiscountPct / 100)).toFixed(2);
  const taxableTotal = +(grossTotal - discountAmount).toFixed(2);
  const gstAmount = +(taxableTotal * 0.18).toFixed(2);
  const freightAmount = totalWeightKg > 1000 ? 0 : 2500;
  const netTotal = +(taxableTotal + gstAmount + freightAmount).toFixed(2);

  const handleSubmitRfq = async () => {
    setIsSubmittingRfq(true);
    try {
      const res = await mobileApi.rfq.create({
        contactName: 'Rajesh Sharma',
        companyName: 'Apex Heavy Infrastructure Ltd.',
        email: 'procurement@apexinfra.com',
        phone: '+91 98880 21000',
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

      setSuccessMsg(`Official RFQ ${res.rfqNumber || 'CBH-RFQ-3095'} Submitted!`);
      onClearCart();
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err: any) {
      alert(err.message || 'RFQ submission failed');
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  const handleCheckout = async () => {
    setIsProcessingOrder(true);
    try {
      const res = await mobileApi.orders.create({
        customerId: 101,
        shippingAddress: 'Plot 42, Peenya Industrial Area, Bengaluru',
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
          Add industrial fasteners to calculate tonnage discounts and generate official quotes.
        </Text>
        <TouchableOpacity onPress={onNavigateToCatalog} style={styles.browseBtn}>
          <Text style={styles.browseBtnText}>Browse Industrial Catalog</Text>
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

      {/* Slab Discount Card */}
      <View style={styles.slabCard}>
        <Text style={styles.slabTitle}>
          ✨ VOLUME SLAB DISCOUNT: {slabDiscountPct}% ACTIVE
        </Text>
        <Text style={styles.slabTonnage}>
          Total Weight: {totalWeightKg} Kg
        </Text>
      </View>

      {/* Items List */}
      {cartItems.map((item) => (
        <MobileCard key={`${item.product.id}_${item.unit}`}>
          <View style={styles.rowBetween}>
            <View style={{ flex: 1 }}>
              <Text style={styles.itemSku}>{item.product.sku}</Text>
              <Text style={styles.itemName}>{item.product.name}</Text>
              <Text style={styles.itemRate}>
                Rate: ₹{item.unitPrice}/{item.unit}
              </Text>
            </View>

            <TouchableOpacity
              onPress={() => onRemoveItem(item.product.id, item.unit)}
              style={styles.deleteBtn}
            >
              <Text style={styles.deleteIcon}>🗑</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <View style={styles.stepperWrap}>
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
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>-</Text>
              </TouchableOpacity>
              <Text style={styles.qtyText}>
                {item.quantity} {item.unit}
              </Text>
              <TouchableOpacity
                onPress={() =>
                  onUpdateQuantity(
                    item.product.id,
                    item.unit,
                    item.quantity + (item.unit === 'PCS' ? 500 : 25)
                  )
                }
                style={styles.stepBtn}
              >
                <Text style={styles.stepBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.itemTotal}>
                ₹{item.lineTotal.toLocaleString('en-IN')}
              </Text>
              <Text style={styles.itemWeight}>≈ {item.totalWeightKg} Kg</Text>
            </View>
          </View>
        </MobileCard>
      ))}

      {/* Summary Card */}
      <MobileCard>
        <Text style={styles.summaryTitle}>Commercial Summary</Text>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Gross Value:</Text>
          <Text style={styles.summaryVal}>₹{grossTotal.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={[styles.summaryKey, { color: '#EA580C' }]}>
            Slab Savings ({slabDiscountPct}%):
          </Text>
          <Text style={[styles.summaryVal, { color: '#EA580C' }]}>
            -₹{discountAmount.toLocaleString('en-IN')}
          </Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>GST @ 18%:</Text>
          <Text style={styles.summaryVal}>₹{gstAmount.toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.summaryRow}>
          <Text style={styles.summaryKey}>Freight:</Text>
          <Text style={styles.summaryVal}>
            {freightAmount === 0 ? 'FREE' : `₹${freightAmount}`}
          </Text>
        </View>

        <View style={styles.totalDivider} />

        <View style={styles.rowBetween}>
          <View>
            <Text style={styles.totalLabel}>Total Estimate</Text>
            <Text style={styles.totalWeight}>Weight: {totalWeightKg} Kg</Text>
          </View>
          <Text style={styles.totalVal}>₹{netTotal.toLocaleString('en-IN')}</Text>
        </View>
      </MobileCard>

      {/* Action Buttons */}
      <TouchableOpacity
        onPress={() => setIsCheckoutModalOpen(true)}
        style={styles.checkoutBtn}
      >
        <Text style={styles.checkoutBtnText}>
          💳 Instant Checkout (PhonePe / Credit)
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        onPress={handleSubmitRfq}
        disabled={isSubmittingRfq}
        style={styles.rfqBtn}
      >
        <Text style={styles.rfqBtnText}>
          {isSubmittingRfq ? 'Submitting...' : '📄 Request Stamped Quote (RFQ)'}
        </Text>
      </TouchableOpacity>

      {/* Checkout Modal */}
      <MobileModal
        isOpen={isCheckoutModalOpen}
        onClose={() => setIsCheckoutModalOpen(false)}
        title="Confirm Order"
        subtitle={`Total: ₹${netTotal.toLocaleString('en-IN')}`}
        footer={
          <View style={{ flex: 1, flexDirection: 'row', gap: 10 }}>
            <TouchableOpacity
              onPress={() => setIsCheckoutModalOpen(false)}
              style={styles.modalCancelBtn}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={handleCheckout}
              disabled={isProcessingOrder}
              style={styles.modalConfirmBtn}
            >
              <Text style={styles.modalConfirmText}>
                {isProcessingOrder ? 'Authorizing...' : 'Authorize'}
              </Text>
            </TouchableOpacity>
          </View>
        }
      >
        <Text style={styles.modalHeading}>Select Payment Method</Text>

        <TouchableOpacity
          onPress={() => setPaymentMethod('PHONEPE')}
          style={[
            styles.paymentOption,
            paymentMethod === 'PHONEPE' ? styles.paymentOptionActive : null,
          ]}
        >
          <Text style={styles.optionTitle}>PhonePe PG / UPI</Text>
          <Text style={styles.optionSub}>Instant digital payment clearance</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setPaymentMethod('CREDIT_LINE')}
          style={[
            styles.paymentOption,
            paymentMethod === 'CREDIT_LINE' ? styles.paymentOptionActive : null,
          ]}
        >
          <Text style={styles.optionTitle}>Corporate 30D Credit Line</Text>
          <Text style={styles.optionSub}>Available: ₹25,00,000</Text>
        </TouchableOpacity>

        <Text style={[styles.modalHeading, { marginTop: 12 }]}>
          Delivery Pincode
        </Text>
        <TextInput
          value={shippingPincode}
          onChangeText={setShippingPincode}
          style={styles.pincodeInput}
        />
      </MobileModal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
  },
  emptyIcon: {
    fontSize: 40,
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 6,
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#64748B',
    textAlign: 'center',
    marginBottom: 20,
  },
  browseBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  browseBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  successBox: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 12,
  },
  successText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  slabCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1.5,
    borderColor: '#FDBA74',
    borderRadius: 12,
    padding: 12,
  },
  slabTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#9A3412',
  },
  slabTonnage: {
    fontSize: 11,
    color: '#C2410C',
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  itemSku: {
    fontSize: 11,
    fontWeight: '800',
    color: '#0052CC',
  },
  itemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 2,
  },
  itemRate: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  deleteBtn: {
    padding: 6,
  },
  deleteIcon: {
    fontSize: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  stepperWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 2,
    gap: 6,
  },
  stepBtn: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepBtnText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#475569',
  },
  qtyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
  },
  itemTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  itemWeight: {
    fontSize: 10,
    color: '#64748B',
  },
  summaryTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginBottom: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryKey: {
    fontSize: 12,
    color: '#64748B',
  },
  summaryVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0F172A',
  },
  totalDivider: {
    height: 1,
    backgroundColor: '#CBD5E1',
    marginVertical: 8,
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  totalWeight: {
    fontSize: 11,
    color: '#64748B',
  },
  totalVal: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0052CC',
  },
  checkoutBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  checkoutBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 13,
  },
  rfqBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#FF6B00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  rfqBtnText: {
    color: '#FF6B00',
    fontWeight: '700',
    fontSize: 13,
  },
  modalHeading: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  paymentOption: {
    padding: 10,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  paymentOptionActive: {
    borderColor: '#0052CC',
    backgroundColor: '#EFF6FF',
  },
  optionTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  optionSub: {
    fontSize: 11,
    color: '#64748B',
  },
  pincodeInput: {
    height: 40,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingHorizontal: 12,
    fontSize: 13,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
  },
  modalCancelText: {
    color: '#475569',
    fontWeight: '600',
  },
  modalConfirmBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 8,
    backgroundColor: '#0052CC',
    alignItems: 'center',
  },
  modalConfirmText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
});

export default CustomerCartScreen;
