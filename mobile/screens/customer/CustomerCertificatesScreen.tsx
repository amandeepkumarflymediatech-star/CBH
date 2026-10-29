import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';

export const CustomerCertificatesScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState('');

  const certificates = [
    {
      id: 'MTC-2026-901',
      orderNumber: 'CBH-ORD-8821',
      productName: 'Hex Bolt DIN 933 M10x50 Grade 8.8',
      heatNumber: 'HEAT-JSP-88291',
      issueDate: '2026-10-28',
      standard: 'EN 10204 Type 3.1',
      chem: { C: '0.38%', Mn: '0.72%', P: '0.018%', S: '0.012%' },
      mech: { tensile: '835 MPa', yield: '665 MPa', hardness: '28 HRC' },
    },
    {
      id: 'MTC-2026-884',
      orderNumber: 'CBH-ORD-8819',
      productName: 'Socket Cap Screw DIN 912 M12x40 Grade 12.9',
      heatNumber: 'HEAT-TATA-44102',
      issueDate: '2026-10-26',
      standard: 'EN 10204 Type 3.1',
      chem: { C: '0.42%', Mn: '0.68%', P: '0.014%', S: '0.009%' },
      mech: { tensile: '1240 MPa', yield: '1110 MPa', hardness: '41 HRC' },
    },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <MobileSearch
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search Heat Number, MTC ID, Order #..."
      />

      {downloadToast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {downloadToast}</Text>
        </View>
      ) : null}

      <View style={styles.complianceCard}>
        <Text style={styles.complianceTitle}>★ NABL Accredited Metallurgical Lab</Text>
        <Text style={styles.complianceDesc}>
          All certificates comply with EN 10204:2004 Type 3.1 with 100% heat traceability.
        </Text>
      </View>

      {certificates.map((cert) => (
        <MobileCard key={cert.id}>
          <View style={styles.rowBetween}>
            <Text style={styles.certId}>{cert.id}</Text>
            <MobileBadge label="VERIFIED 3.1" variant="success" size="sm" />
          </View>

          <Text style={styles.productName}>{cert.productName}</Text>
          <Text style={styles.heatNumber}>
            Heat No: {cert.heatNumber} • Order: {cert.orderNumber}
          </Text>

          <View style={styles.chemBox}>
            <Text style={styles.chemText}>
              Chemical: C: {cert.chem.C} | Mn: {cert.chem.Mn} | P: {cert.chem.P} | S: {cert.chem.S}
            </Text>
            <Text style={styles.mechText}>
              Mechanical: Tensile {cert.mech.tensile} | Yield {cert.mech.yield} | Hardness {cert.mech.hardness}
            </Text>
          </View>

          <View style={styles.divider} />

          <View style={styles.rowBetween}>
            <Text style={styles.dateText}>Issued: {cert.issueDate}</Text>
            <TouchableOpacity
              onPress={() => {
                setDownloadToast(`Downloaded verified MTC ${cert.id}!`);
                setTimeout(() => setDownloadToast(''), 3000);
              }}
              style={styles.downloadBtn}
            >
              <Text style={styles.downloadBtnText}>📄 Download MTC</Text>
            </TouchableOpacity>
          </View>
        </MobileCard>
      ))}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    gap: 12,
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#34D399',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontWeight: '700',
    fontSize: 12,
  },
  complianceCard: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1.5,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    padding: 12,
  },
  complianceTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#1E40AF',
  },
  complianceDesc: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 2,
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  certId: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052CC',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 6,
  },
  heatNumber: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  chemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 8,
    marginTop: 8,
    gap: 4,
  },
  chemText: {
    fontSize: 10,
    color: '#475569',
  },
  mechText: {
    fontSize: 10,
    color: '#0052CC',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
  },
  downloadBtn: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#BFDBFE',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 6,
  },
  downloadBtnText: {
    color: '#0052CC',
    fontSize: 11,
    fontWeight: '700',
  },
});

export default CustomerCertificatesScreen;
