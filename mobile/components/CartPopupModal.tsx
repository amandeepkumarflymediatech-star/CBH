import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Dimensions,
} from 'react-native';
import { MobileProduct, GlobalUnit } from '../types';
import { FastenerProductImage } from './FastenerProductImage';

export interface CartPopupData {
  product: MobileProduct;
  unit: GlobalUnit;
  addedQty: number;
  totalQty: number;
  wasAlreadyInCart?: boolean;
  lineTotal?: number;
  cartTotalCount?: number;
  customMessage?: string;
}

interface CartPopupModalProps {
  visible: boolean;
  data: CartPopupData | null;
  onClose: () => void;
  onNavigateToCart: () => void;
}

export const CartPopupModal: React.FC<CartPopupModalProps> = ({
  visible,
  data,
  onClose,
  onNavigateToCart,
}) => {
  if (!visible || !data) return null;

  const {
    product,
    unit,
    addedQty,
    totalQty,
    wasAlreadyInCart = false,
    lineTotal,
    cartTotalCount = 1,
    customMessage,
  } = data;

  const unitLabel = unit === 'KGS' ? 'Kg' : 'Pcs';
  const formattedAddedQty = unit === 'KGS' ? `${addedQty} Kg` : `${addedQty.toLocaleString()} Pcs`;
  const formattedTotalQty = unit === 'KGS' ? `${totalQty} Kg` : `${totalQty.toLocaleString()} Pcs`;
  const standardDisplay = product.standard || product.din || product.isoStandard || 'DIN 933';

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={styles.backdrop}>
          <TouchableWithoutFeedback>
            <View style={styles.cardContainer}>
              {/* Top Accent Strip */}
              <View
                style={[
                  styles.accentBar,
                  wasAlreadyInCart ? styles.accentBarWarning : styles.accentBarSuccess,
                ]}
              />

              {/* Header with Status Badge & Close Button */}
              <View style={styles.headerRow}>
                <View
                  style={[
                    styles.statusBadge,
                    wasAlreadyInCart ? styles.statusBadgeWarning : styles.statusBadgeSuccess,
                  ]}
                >
                  <Text
                    style={[
                      styles.statusBadgeText,
                      wasAlreadyInCart ? styles.statusTextWarning : styles.statusTextSuccess,
                    ]}
                  >
                    {wasAlreadyInCart ? 'Updated in Cart' : '✓ Added to Cart'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.closeBtn}
                  onPress={onClose}
                  hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
                >
                  <Text style={styles.closeBtnText}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Title & Subtitle */}
              <Text style={styles.modalTitle}>
                {wasAlreadyInCart ? 'Cart Quantity Updated!' : 'Fastener Added to Cart!'}
              </Text>
              <Text style={styles.modalSubtitle}>
                {customMessage ||
                  (wasAlreadyInCart
                    ? `This item was already in your cart. We added ${formattedAddedQty}, bringing your total to ${formattedTotalQty}.`
                    : `Your wholesale lot has been placed into the procurement cart.`)}
              </Text>

              {/* Product Info Box */}
              <View style={styles.productBox}>
                <View style={styles.imageWrap}>
                  <FastenerProductImage
                    imageUrl={product.imageUrl}
                    subGroup={product.subGroup}
                    category={product.category || product.subGroup}
                    standard={product.standard}
                    name={product.name}
                    productName={product.name}
                    size={50}
                    height={50}
                    containerStyle={styles.popupProductImg}
                  />
                </View>

                <View style={styles.productDetails}>
                  <Text style={styles.productSku} numberOfLines={1}>
                    {product.sku}
                  </Text>
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>

                  {/* Micro Specs Tags */}
                  <View style={styles.tagRow}>
                    <View style={styles.specTag}>
                      <Text style={styles.specTagText}>{standardDisplay}</Text>
                    </View>
                    {product.grade ? (
                      <View style={styles.specTag}>
                        <Text style={styles.specTagText}>Gr {product.grade}</Text>
                      </View>
                    ) : null}
                    {product.finish ? (
                      <View style={styles.specTag}>
                        <Text style={styles.specTagText} numberOfLines={1}>
                          {product.finish}
                        </Text>
                      </View>
                    ) : null}
                  </View>
                </View>
              </View>

              {/* Quantity & Pricing Summary Matrix */}
              <View style={styles.matrixContainer}>
                <View style={styles.matrixCol}>
                  <Text style={styles.matrixLabel}>ADDED QUANTITY</Text>
                  <Text style={styles.matrixValHighlight}>+{formattedAddedQty}</Text>
                </View>

                <View style={styles.matrixDivider} />

                <View style={styles.matrixCol}>
                  <Text style={styles.matrixLabel}>TOTAL IN CART</Text>
                  <Text style={styles.matrixVal}>{formattedTotalQty}</Text>
                </View>

                {lineTotal ? (
                  <>
                    <View style={styles.matrixDivider} />
                    <View style={styles.matrixCol}>
                      <Text style={styles.matrixLabel}>EST. LOT TOTAL</Text>
                      <Text style={styles.matrixPrice}>
                        ₹{lineTotal.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                      </Text>
                    </View>
                  </>
                ) : null}
              </View>

              {/* Action Buttons */}
              <View style={styles.actionsRow}>
                <TouchableOpacity
                  style={styles.continueBtn}
                  onPress={onClose}
                  activeOpacity={0.8}
                >
                  <Text style={styles.continueBtnText}>Keep Browsing</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.viewCartBtn}
                  onPress={() => {
                    onClose();
                    onNavigateToCart();
                  }}
                  activeOpacity={0.88}
                >
                  <Text style={styles.viewCartBtnText}>
                    View Cart ({cartTotalCount}) →
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  cardContainer: {
    width: Math.min(width - 32, 400),
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 10,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    overflow: 'hidden',
  },
  accentBar: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 5,
  },
  accentBarSuccess: {
    backgroundColor: '#10B981',
  },
  accentBarWarning: {
    backgroundColor: '#F59E0B',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    marginTop: 4,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  statusBadgeSuccess: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  statusBadgeWarning: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  statusBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  statusTextSuccess: {
    color: '#059669',
  },
  statusTextWarning: {
    color: '#D97706',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeBtnText: {
    fontSize: 14,
    color: '#64748B',
    fontWeight: '700',
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  modalSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginBottom: 14,
  },
  productBox: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    marginBottom: 14,
    gap: 12,
  },
  imageWrap: {
    width: 54,
    height: 54,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  popupProductImg: {
    width: '100%',
    height: '100%',
    borderWidth: 0,
    padding: 2,
    backgroundColor: 'transparent',
  },
  productDetails: {
    flex: 1,
  },
  productSku: {
    fontSize: 11,
    fontFamily: 'monospace',
    fontWeight: '800',
    color: '#0052CC',
    marginBottom: 2,
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
    lineHeight: 17,
    marginBottom: 4,
  },
  tagRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  specTag: {
    backgroundColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  specTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
  },
  matrixContainer: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  matrixCol: {
    flex: 1,
    alignItems: 'center',
  },
  matrixDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#CBD5E1',
  },
  matrixLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  matrixVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  matrixValHighlight: {
    fontSize: 13,
    fontWeight: '900',
    color: '#059669',
  },
  matrixPrice: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0052CC',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  continueBtn: {
    flex: 1,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#CBD5E1',
  },
  continueBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#475569',
  },
  viewCartBtn: {
    flex: 1.3,
    height: 46,
    borderRadius: 12,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 3,
    shadowColor: '#0052CC',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  viewCartBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
});

export default CartPopupModal;

