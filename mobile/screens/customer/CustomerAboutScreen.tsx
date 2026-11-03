import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';

interface CustomerAboutScreenProps {
  onBack?: () => void;
  onNavigateToCatalog?: () => void;
  onNavigateToContact?: () => void;
}

const MILESTONES = [
  {
    year: '1959',
    title: 'Foundation of CBH',
    desc: 'Established in Punjab as Capital Bolts & Hardwares to supply standard fasteners for regional machinery and rail expansion.',
  },
  {
    year: '1984',
    title: 'Industrial Cold Forging',
    desc: 'Commissioned high-speed multi-station cold headers and thread rollers to scale production into high-tensile Grade 8.8 bolts.',
  },
  {
    year: '2001',
    title: 'ISO 9001 & BIS License',
    desc: 'Awarded formal ISO 9001 Quality Management and BIS conformity licenses for Indian infrastructure and power projects.',
  },
  {
    year: '2015',
    title: 'Govt. Star Export House',
    desc: 'Recognized as an official Export House by Ministry of Commerce & Industry, dispatching fasteners to 25+ nations.',
  },
  {
    year: '2024',
    title: 'Digital B2B Matrix',
    desc: 'Digital B2B Fastener Matrix with live dual PCS/KGS pricing, ERPNext integration, and instant RFQs.',
  },
];

const PILLARS = [
  {
    icon: '',
    title: 'Integrated Cold Forging Plant',
    desc: '500 MT monthly capacity spanning M3 to M64 metric diameters, with 2,00,000+ SKUs ready for immediate dispatch.',
    tag: '500 MT/MO',
  },
  {
    icon: '',
    title: 'TÜV & BIS Accredited Quality Lab',
    desc: 'In-house optical sorting, universal tensile testing machines, metallurgical hardness verification, and 1000-hr salt spray chambers.',
    tag: 'NABL CALIBRATED',
  },
  {
    icon: '',
    title: 'Dual Unit (Pcs / Kgs) Precision',
    desc: 'Transparent pricing with weight-to-piece algorithmic conversion, empowering structural engineers to budget accurately.',
    tag: 'DUAL UNIT',
  },
  {
    icon: '',
    title: 'Premier PSU & OEM Approvals',
    desc: 'Approved supplier for IndianOil, Tata Projects, NTPC, BHEL, DMRC, L&T, BPCL, and Indian Railways.',
    tag: 'PSU APPROVED',
  },
];

const LEADERSHIP = [
  {
    name: 'Satish Nagpal',
    role: 'Chairman & Founder',
    experience: '40+ Years Fastener Metallurgy',
    quote: 'Integrity is forged into every thread. We do not just supply bolts; we anchor the nation’s bridges, rails, and energy grids.',
  },
  {
    name: 'Hitesh Nagpal',
    role: 'Managing Director',
    experience: 'Supply Chain & Manufacturing Automation',
    quote: 'Bringing modern ERP transparency, automated optical sorting, and digital instant pricing to India’s heavy engineering sector.',
  },
];

export const CustomerAboutScreen: React.FC<CustomerAboutScreenProps> = ({
  onBack,
  onNavigateToCatalog,
  onNavigateToContact,
}) => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Bar with Back Button */}
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null}

      {/* Hero Banner */}
      <View style={styles.heroBanner}>
        <View style={styles.legacyPill}>
          <Text style={styles.legacyPillText}>ESTABLISHED 1959 · INDUSTRIAL FASTENER MANUFACTURER</Text>
        </View>
        <Text style={styles.heroTitle}>Industrial Fastener Manufacturing & Bulk Supply</Text>
        <Text style={styles.heroSubtitle}>
          Capital Bolts & Hardwares (CBH) is India’s benchmark industrial fastener manufacturer and digital distributor.
          Supplying certified DIN, ISO, and ASTM precision fasteners to government defense, thermal power grids, metro rail,
          and heavy automotive OEMs.
        </Text>

        <View style={styles.statsRow}>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>65+</Text>
            <Text style={styles.statLbl}>Years Legacy</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>2L+</Text>
            <Text style={styles.statLbl}>Fastener SKUs</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>500 MT</Text>
            <Text style={styles.statLbl}>Monthly Capacity</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statVal}>25+</Text>
            <Text style={styles.statLbl}>Export Nations</Text>
          </View>
        </View>
      </View>

      {/* 4 Core Pillars */}
      <Text style={styles.sectionHeader}>Core Capabilities & Quality</Text>
      {PILLARS.map((p, idx) => (
        <MobileCard key={idx}>
          <View style={styles.pillarHeader}>
            
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={styles.rowBetween}>
                <Text style={styles.pillarTitle}>{p.title}</Text>
                <View style={styles.tagPill}>
                  <Text style={styles.tagText}>{p.tag}</Text>
                </View>
              </View>
              <Text style={styles.pillarDesc}>{p.desc}</Text>
            </View>
          </View>
        </MobileCard>
      ))}

      {/* Leadership Section */}
      <Text style={styles.sectionHeader}>Executive Leadership</Text>
      {LEADERSHIP.map((leader, i) => (
        <MobileCard key={i}>
          <View style={styles.leaderRow}>
            <View style={styles.leaderAvatar}>
              <Text style={styles.leaderAvatarText}>
                {leader.name.split(' ').map((n) => n[0]).join('')}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 12 }}>
              <Text style={styles.leaderName}>{leader.name}</Text>
              <Text style={styles.leaderRole}>{leader.role}</Text>
              <Text style={styles.leaderExp}>{leader.experience}</Text>
            </View>
          </View>
          <View style={styles.quoteBox}>
            <Text style={styles.quoteText}>"{leader.quote}"</Text>
          </View>
        </MobileCard>
      ))}

      {/* Timeline Milestones */}
      <Text style={styles.sectionHeader}>Historical Milestones</Text>
      <MobileCard>
        {MILESTONES.map((m, idx) => (
          <View key={idx} style={styles.timelineRow}>
            <View style={styles.yearCol}>
              <View style={styles.yearDot} />
              <Text style={styles.yearText}>{m.year}</Text>
            </View>
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>{m.title}</Text>
              <Text style={styles.timelineDesc}>{m.desc}</Text>
              {idx < MILESTONES.length - 1 ? <View style={styles.timelineDivider} /> : null}
            </View>
          </View>
        ))}
      </MobileCard>

      {/* Call to Actions */}
      <View style={styles.actionsBox}>
        {onNavigateToCatalog ? (
          <TouchableOpacity onPress={onNavigateToCatalog} style={styles.primaryActionBtn}>
            <Text style={styles.primaryActionBtnText}>View Fastener Catalog →</Text>
          </TouchableOpacity>
        ) : null}

        {onNavigateToContact ? (
          <TouchableOpacity onPress={onNavigateToContact} style={styles.secondaryActionBtn}>
            <Text style={styles.secondaryActionBtnText}>Contact Plant & Sales Desk</Text>
          </TouchableOpacity>
        ) : null}
      </View>
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
  heroBanner: {
    backgroundColor: '#0A2E4E',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  legacyPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 0, 0.2)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 107, 0, 0.4)',
  },
  legacyPillText: {
    color: '#FFB066',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 8,
  },
  heroSubtitle: {
    fontSize: 13,
    color: '#CBD5E1',
    lineHeight: 19,
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: 12,
  },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    padding: 10,
  },
  statVal: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FF6B00',
  },
  statLbl: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 10,
  },
  pillarHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  pillarIcon: {
    fontSize: 26,
  },
  pillarTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
    flex: 1,
  },
  pillarDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  tagPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
    marginLeft: 6,
  },
  tagText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  leaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  leaderAvatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#0052CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leaderAvatarText: {
    color: '#FFFFFF',
    fontWeight: '900',
    fontSize: 18,
  },
  leaderName: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
  },
  leaderRole: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0052CC',
  },
  leaderExp: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  quoteBox: {
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#0052CC',
  },
  quoteText: {
    fontSize: 12,
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 18,
  },
  timelineRow: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  yearCol: {
    width: 60,
    alignItems: 'flex-start',
  },
  yearDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B00',
    marginBottom: 4,
  },
  yearText: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0F172A',
  },
  timelineContent: {
    flex: 1,
    paddingLeft: 6,
  },
  timelineTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052CC',
  },
  timelineDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  timelineDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginTop: 10,
  },
  actionsBox: {
    marginTop: 14,
    gap: 10,
  },
  primaryActionBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 14,
  },
  secondaryActionBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: 'center',
  },
  secondaryActionBtnText: {
    color: '#0F172A',
    fontWeight: '700',
    fontSize: 14,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
});

