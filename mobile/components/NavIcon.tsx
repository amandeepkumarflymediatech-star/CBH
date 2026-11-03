import React from 'react';
import { StyleSheet, View } from 'react-native';

interface NavIconProps {
  name: string;
  color: string;
  size?: number;
}

/**
 * Enterprise Native Geometric Icons for CBH Industrial Navigation
 * Replaces cartoon system emojis with crisp, pixel-perfect, theme-colored vector glyphs.
 */
export const NavIcon: React.FC<NavIconProps> = ({ name, color, size = 22 }) => {
  switch (name) {
    case 'dashboard':
    case 'console':
      // 4-tile quadrant grid (Console / Telemetry / Dashboard)
      return (
        <View style={[styles.box, { width: size, height: size }]}>
          <View style={styles.gridRow}>
            <View style={[styles.tile, { backgroundColor: color }]} />
            <View style={[styles.tile, { backgroundColor: color }]} />
          </View>
          <View style={styles.gridRow}>
            <View style={[styles.tile, { backgroundColor: color }]} />
            <View style={[styles.tile, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'orders':
    case 'consignments':
      // Shipping container / Dispatch package parcel
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          {/* Top Lid */}
          <View style={[styles.boxLid, { backgroundColor: color }]} />
          {/* Main Carton Body */}
          <View style={[styles.boxBody, { borderColor: color }]}>
            {/* Center Packing Tape Stripe */}
            <View style={[styles.boxTape, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'products':
    case 'inventory':
      // Precision Industrial Fastener Bolt / Hex Head & Threads
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          {/* Hex Bolt Head */}
          <View style={[styles.boltHead, { backgroundColor: color }]} />
          {/* Threaded Shaft with 3 ridges */}
          <View style={[styles.boltShaft, { borderColor: color }]}>
            <View style={[styles.threadRidge, { backgroundColor: color }]} />
            <View style={[styles.threadRidge, { backgroundColor: color }]} />
            <View style={[styles.threadRidge, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'rfqs':
    case 'quotes':
      // Official Quotation Document with text lines and check/tab
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.docBody, { borderColor: color }]}>
            <View style={[styles.docLine, { backgroundColor: color, width: 8 }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: 10 }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: 6 }]} />
          </View>
        </View>
      );

    case 'users':
    case 'clients':
      // B2B Enterprise Client Ledger (Dual Profile)
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          {/* Primary Head */}
          <View style={[styles.userHead, { backgroundColor: color, left: 2, top: 2 }]} />
          {/* Primary Torso */}
          <View style={[styles.userTorso, { borderColor: color, left: -1, top: 11 }]} />
          {/* Secondary Avatar behind */}
          <View style={[styles.userHeadMini, { backgroundColor: color, right: 3, top: 4 }]} />
          <View style={[styles.userTorsoMini, { borderColor: color, right: 0, top: 12 }]} />
        </View>
      );

    case 'home':
      // Minimalist Clean Storefront / Industrial Facility
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          {/* Roof Peak Chevron */}
          <View style={[styles.roofPeak, { borderBottomColor: color }]} />
          {/* Home Wall & Base */}
          <View style={[styles.houseBody, { borderColor: color }]}>
            <View style={[styles.houseDoor, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'catalog':
      // Fastener Catalog & Taxonomy Index
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={styles.catalogItem}>
            <View style={[styles.catalogDot, { backgroundColor: color }]} />
            <View style={[styles.catalogBar, { backgroundColor: color }]} />
          </View>
          <View style={styles.catalogItem}>
            <View style={[styles.catalogDot, { backgroundColor: color }]} />
            <View style={[styles.catalogBar, { backgroundColor: color, width: 13 }]} />
          </View>
          <View style={styles.catalogItem}>
            <View style={[styles.catalogDot, { backgroundColor: color }]} />
            <View style={[styles.catalogBar, { backgroundColor: color, width: 11 }]} />
          </View>
        </View>
      );

    case 'cart':
      // Minimalist Procurement Cart / Trolley
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          {/* Handle */}
          <View style={[styles.cartHandle, { backgroundColor: color }]} />
          {/* Basket */}
          <View style={[styles.cartBasket, { borderColor: color }]} />
          {/* Wheels */}
          <View style={styles.cartWheelsRow}>
            <View style={[styles.cartWheel, { backgroundColor: color }]} />
            <View style={[styles.cartWheel, { backgroundColor: color }]} />
          </View>
        </View>
      );

    case 'profile':
    case 'account':
      // User Profile & KYB Badge
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.accountHead, { backgroundColor: color }]} />
          <View style={[styles.accountTorso, { borderColor: color }]} />
        </View>
      );

    case 'search':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.65, height: size * 0.65, borderRadius: size * 0.35, borderWidth: 1.8, borderColor: color, position: 'absolute', top: 1, left: 1 }} />
          <View style={{ width: 1.8, height: size * 0.45, backgroundColor: color, position: 'absolute', bottom: 1, right: 3, transform: [{ rotate: '-45deg' }] }} />
        </View>
      );

    case 'filter':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center', gap: 3 }]}>
          <View style={{ width: size * 0.8, height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: size * 0.55, height: 2, backgroundColor: color, borderRadius: 1 }} />
          <View style={{ width: size * 0.3, height: 2, backgroundColor: color, borderRadius: 1 }} />
        </View>
      );

    case 'doc':
    case 'document':
    case 'file':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.docBody, { borderColor: color }]}>
            <View style={[styles.docLine, { backgroundColor: color, width: 8 }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: 10 }]} />
            <View style={[styles.docLine, { backgroundColor: color, width: 6 }]} />
          </View>
        </View>
      );

    case 'phone':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.5, height: size * 0.8, borderWidth: 1.8, borderColor: color, borderRadius: 3, alignItems: 'center', justifyContent: 'space-between', paddingVertical: 2 }}>
            <View style={{ width: size * 0.2, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.15, height: size * 0.15, borderRadius: size * 0.08, borderWidth: 1, borderColor: color }} />
          </View>
        </View>
      );

    case 'mail':
    case 'email':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.8, height: size * 0.55, borderWidth: 1.8, borderColor: color, borderRadius: 2, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.5, height: 1.5, backgroundColor: color, marginBottom: 2 }} />
            <View style={{ width: size * 0.3, height: 1.5, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'lock':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.45, height: size * 0.35, borderTopLeftRadius: size * 0.25, borderTopRightRadius: size * 0.25, borderWidth: 1.6, borderColor: color, borderBottomWidth: 0, marginBottom: -1 }} />
          <View style={{ width: size * 0.65, height: size * 0.45, backgroundColor: color, borderRadius: 2 }} />
        </View>
      );

    case 'truck':
    case 'shipping':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <View style={{ width: size * 0.5, height: size * 0.45, backgroundColor: color, borderRadius: 1 }} />
            <View style={{ width: size * 0.28, height: size * 0.32, borderWidth: 1.6, borderColor: color, borderLeftWidth: 0, borderTopRightRadius: 2 }} />
          </View>
          <View style={{ flexDirection: 'row', gap: size * 0.28, marginTop: 1 }}>
            <View style={{ width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
            <View style={{ width: size * 0.18, height: size * 0.18, borderRadius: size * 0.09, backgroundColor: color }} />
          </View>
        </View>
      );

    case 'shield':
    case 'verified':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.65, height: size * 0.75, borderWidth: 1.8, borderColor: color, borderTopLeftRadius: 3, borderTopRightRadius: 3, borderBottomLeftRadius: size * 0.35, borderBottomRightRadius: size * 0.35, alignItems: 'center', justifyContent: 'center' }}>
            <View style={{ width: size * 0.2, height: size * 0.3, borderBottomWidth: 1.8, borderRightWidth: 1.8, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
          </View>
        </View>
      );

    case 'check':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.3, height: size * 0.5, borderBottomWidth: 2, borderRightWidth: 2, borderColor: color, transform: [{ rotate: '45deg' }], marginTop: -2 }} />
        </View>
      );

    case 'plus':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.7, height: 2, backgroundColor: color, position: 'absolute' }} />
          <View style={{ width: 2, height: size * 0.7, backgroundColor: color, position: 'absolute' }} />
        </View>
      );

    case 'trash':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.65, height: 2, backgroundColor: color, marginBottom: 1 }} />
          <View style={{ width: size * 0.5, height: size * 0.55, borderWidth: 1.6, borderColor: color, borderTopWidth: 0, borderBottomLeftRadius: 2, borderBottomRightRadius: 2 }} />
        </View>
      );

    case 'whatsapp':
    case 'chat':
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={{ width: size * 0.7, height: size * 0.6, borderWidth: 1.8, borderColor: color, borderRadius: 5, justifyContent: 'center', alignItems: 'center' }}>
            <View style={{ width: size * 0.35, height: 1.5, backgroundColor: color }} />
          </View>
          <View style={{ width: 0, height: 0, borderLeftWidth: 3, borderRightWidth: 3, borderTopWidth: 4, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: color, alignSelf: 'flex-start', marginLeft: 4, marginTop: -1 }} />
        </View>
      );

    default:
      return (
        <View style={[styles.box, { width: size, height: size, justifyContent: 'center', alignItems: 'center' }]}>
          <View style={[styles.defaultDot, { backgroundColor: color }]} />
        </View>
      );
  }
};

const styles = StyleSheet.create({
  box: {
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },
  // 1. Dashboard / Console 4-tile grid
  gridRow: {
    flexDirection: 'row',
    gap: 3,
    marginBottom: 3,
  },
  tile: {
    width: 7.5,
    height: 7.5,
    borderRadius: 2,
  },
  // 2. Orders Package
  boxLid: {
    width: 17,
    height: 3.5,
    borderRadius: 1.5,
    marginBottom: 1,
  },
  boxBody: {
    width: 15,
    height: 11,
    borderWidth: 1.5,
    borderRadius: 2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  boxTape: {
    width: 3.5,
    height: 6,
    borderBottomLeftRadius: 1,
    borderBottomRightRadius: 1,
  },
  // 3. Products Bolt
  boltHead: {
    width: 14,
    height: 3.5,
    borderRadius: 1.5,
    marginBottom: 1,
  },
  boltShaft: {
    width: 8,
    height: 12,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderRadius: 1,
    alignItems: 'center',
    justifyContent: 'space-evenly',
    paddingVertical: 1,
  },
  threadRidge: {
    width: 4.5,
    height: 1.2,
    borderRadius: 0.5,
  },
  // 4. Quotes Document
  docBody: {
    width: 14,
    height: 17,
    borderWidth: 1.5,
    borderRadius: 2,
    paddingTop: 3,
    paddingLeft: 2,
    gap: 2.5,
  },
  docLine: {
    height: 1.5,
    borderRadius: 1,
  },
  // 5. Users
  userHead: {
    position: 'absolute',
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  userTorso: {
    position: 'absolute',
    width: 11,
    height: 6,
    borderTopLeftRadius: 5.5,
    borderTopRightRadius: 5.5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  userHeadMini: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 2.5,
    opacity: 0.7,
  },
  userTorsoMini: {
    position: 'absolute',
    width: 8,
    height: 5,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderWidth: 1.2,
    borderBottomWidth: 0,
    opacity: 0.7,
  },
  // 6. Home
  roofPeak: {
    width: 0,
    height: 0,
    borderLeftWidth: 9,
    borderRightWidth: 9,
    borderBottomWidth: 7,
    borderLeftColor: 'transparent',
    borderRightColor: 'transparent',
    marginBottom: 1,
  },
  houseBody: {
    width: 14,
    height: 9,
    borderWidth: 1.5,
    borderTopWidth: 0,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  houseDoor: {
    width: 4,
    height: 5,
    borderTopLeftRadius: 1.5,
    borderTopRightRadius: 1.5,
  },
  // 7. Catalog
  catalogItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginBottom: 3,
  },
  catalogDot: {
    width: 3.5,
    height: 3.5,
    borderRadius: 2,
  },
  catalogBar: {
    width: 14,
    height: 2.5,
    borderRadius: 1.5,
  },
  // 8. Cart
  cartHandle: {
    width: 4,
    height: 1.5,
    alignSelf: 'flex-start',
    marginLeft: 1,
  },
  cartBasket: {
    width: 15,
    height: 9,
    borderWidth: 1.5,
    borderTopWidth: 0,
    borderTopRightRadius: 0,
    borderRadius: 2,
  },
  cartWheelsRow: {
    flexDirection: 'row',
    gap: 7,
    marginTop: 2,
  },
  cartWheel: {
    width: 3,
    height: 3,
    borderRadius: 1.5,
  },
  // 9. Profile
  accountHead: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginBottom: 2,
  },
  accountTorso: {
    width: 15,
    height: 7,
    borderTopLeftRadius: 7.5,
    borderTopRightRadius: 7.5,
    borderWidth: 1.5,
    borderBottomWidth: 0,
  },
  defaultDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
});

export default NavIcon;

