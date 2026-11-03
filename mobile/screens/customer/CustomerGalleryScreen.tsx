import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Image,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: any;
  location: string;
  desc: string;
  specs: string[];
}

const GALLERY_ITEMS: GalleryItem[] = [
  {
    id: 'gal-1',
    title: 'Universal Tensile & Proof Load Machine',
    category: 'Quality & Testing',
    image: { uri: 'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=800&q=80' },
    location: 'Central Metallurgy Lab, Ludhiana Works',
    desc: 'Computer-controlled 1000 kN Universal Tensile Testing machine executing ISO 898-1 proof load and ultimate tensile rupture verification on Grade 8.8, 10.9, and 12.9 fasteners.',
    specs: ['NABL Calibrated', 'Full Stress-Strain Curves', 'Proof Load Verification'],
  },
  {
    id: 'gal-2',
    title: 'High-Speed 360° Optical Laser Sorting',
    category: 'Automation & QC',
    image: { uri: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80' },
    location: 'Automated Inspection Bay #3',
    desc: 'High-speed glass disc optical sorting lines verifying thread pitch, shank straightness, head concentricity, and total length at up to 600 pcs/min with 0.01mm tolerance.',
    specs: ['600 Pieces/Min', '0.01mm Laser Precision', 'Zero-Defect PPM'],
  },
  {
    id: 'gal-3',
    title: 'Salt Spray Corrosion Testing Chambers',
    category: 'Surface Finishing',
    image: { uri: 'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80' },
    location: 'Electrochemistry Surface Lab',
    desc: 'ASTM B117 salt spray fog testing chambers running continuous 720-hour and 1000-hour exposure tests to certify Hot-Dip Galvanized and Geomet® zinc flake coatings.',
    specs: ['ASTM B117 / ISO 9227', '1000-Hr Red Rust Resistance', 'HDG & Zinc Flake'],
  },
  {
    id: 'gal-4',
    title: 'Multi-Station High-Speed Cold Headers',
    category: 'Manufacturing',
    image: { uri: 'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&q=80' },
    location: 'Cold Forging Line A',
    desc: 'Multi-station progressive cold forging headers producing precision hexagon head bolts, socket caps, and special flange bolts from alloy wire rod with zero scrap loss.',
    specs: ['M6 to M36 Range', '500 MT Monthly Capacity', 'Cold Forged Grain Flow'],
  },
  {
    id: 'gal-5',
    title: 'High-Tensile Solar Array & Wind Mounting',
    category: 'Applications',
    image: { uri: 'https://images.unsplash.com/photo-1497435334941-8c899ee9e8e9?w=800&q=80' },
    location: 'Bhadla Solar Park & Gujarat Wind Corridor',
    desc: 'Hot-Dip Galvanized Grade 8.8 foundation bolts and solar tracker mounting hardware engineered for high cyclic wind shear and desert thermal expansion.',
    specs: ['HDG Zinc Coating > 85μm', 'Anti-Vibration Lock Nuts', '25-Year Outdoor Design'],
  },
  {
    id: 'gal-6',
    title: 'International Trade Exhibition & OEM Meet',
    category: 'Global Presence',
    image: { uri: 'https://images.unsplash.com/photo-1511578314322-379afb476865?w=800&q=80' },
    location: 'Fastener Fair & Elecrama Global Pavilion',
    desc: 'CBH exhibiting its full portfolio of ISO 9001 and BIS certified industrial fasteners, meeting procurement directors from across 25+ export nations.',
    specs: ['25+ Export Nations', 'Star Export House', 'Global Supply Chain'],
  },
];

interface CustomerGalleryScreenProps {
  onBack?: () => void;
  onNavigateToCatalog?: () => void;
}

export const CustomerGalleryScreen: React.FC<CustomerGalleryScreenProps> = ({
  onBack,
  onNavigateToCatalog,
}) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const categories = ['All', 'Quality & Testing', 'Manufacturing', 'Automation & QC', 'Applications'];

  const filteredItems = GALLERY_ITEMS.filter(
    (item) => activeCategory === 'All' || item.category === activeCategory
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null}

      {/* Banner */}
      <View style={styles.banner}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>MANUFACTURING & TESTING FACILITIES</Text>
        </View>
        <Text style={styles.bannerTitle}>Manufacturing Plant & Testing Labs</Text>
        <Text style={styles.bannerSubtitle}>
          Take a visual tour inside our Ludhiana cold forging plant, optical sorting bays, tensile metallurgy lab, and major engineering installations.
        </Text>
      </View>

      {/* Category Filter Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        style={styles.catScroll}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c}
            onPress={() => setActiveCategory(c)}
            style={[styles.catPill, activeCategory === c && styles.catPillActive]}
          >
            <Text style={[styles.catPillText, activeCategory === c && styles.catPillTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gallery Cards */}
      {filteredItems.map((item) => (
        <MobileCard key={item.id}>
          <Image source={item.image} style={styles.cardImage} resizeMode="cover" />

          <View style={styles.cardContent}>
            <View style={styles.rowBetween}>
              <View style={styles.catBadge}>
                <Text style={styles.catBadgeText}>{item.category.toUpperCase()}</Text>
              </View>
              <Text style={styles.locationText}>{item.location}</Text>
            </View>

            <Text style={styles.itemTitle}>{item.title}</Text>
            <Text style={styles.itemDesc}>{item.desc}</Text>

            <View style={styles.specsRow}>
              {item.specs.map((s, idx) => (
                <View key={idx} style={styles.specPill}>
                  <Text style={styles.specPillText}>✓ {s}</Text>
                </View>
              ))}
            </View>
          </View>
        </MobileCard>
      ))}

      {onNavigateToCatalog ? (
        <TouchableOpacity onPress={onNavigateToCatalog} style={styles.catalogBtn}>
          <Text style={styles.catalogBtnText}>Explore Certified Fasteners in Catalog →</Text>
        </TouchableOpacity>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    paddingBottom: 40,
    backgroundColor: '#F8FAFC',
  },
  backBtn: {
    marginBottom: 12,
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  backBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0052CC',
  },
  banner: {
    backgroundColor: '#0A2E4E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  badge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 82, 204, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  badgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
  },
  bannerTitle: {
    fontSize: 19,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 25,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#CBD5E1',
    lineHeight: 18,
  },
  catScroll: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  catPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  catPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  catPillTextActive: {
    color: '#FFFFFF',
  },
  cardImage: {
    width: '100%',
    height: 160,
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: '#E2E8F0',
  },
  cardContent: {},
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  catBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  catBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  locationText: {
    fontSize: 11,
    color: '#64748B',
  },
  itemTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 4,
  },
  itemDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  specsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  specPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  specPillText: {
    fontSize: 11,
    color: '#047857',
    fontWeight: '700',
  },
  catalogBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  catalogBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

