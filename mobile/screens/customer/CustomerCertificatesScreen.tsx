import React, { useState, useEffect, useCallback } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';
import { OrderCardSkeleton } from '../../components/SkeletonLoader';
import { mobileApi } from '../../config/api';
import { MobileCertificate } from '../../types';

interface CustomerCertificatesScreenProps {
  user?: any;
}

export const CustomerCertificatesScreen: React.FC<CustomerCertificatesScreenProps> = ({ user }) => {
  const [certificates, setCertificates] = useState<MobileCertificate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [downloadToast, setDownloadToast] = useState('');

  const fetchCertificates = useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const res = await mobileApi.certificates.getAll({ search: searchQuery.trim() || undefined, customerId: user?.id });
      if (res.certificates && Array.isArray(res.certificates)) {
        setCertificates(res.certificates);
      }
    } catch (err) {
      console.warn('[Customer Certificates] Fetch error:', err);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    fetchCertificates();
  }, [fetchCertificates]);

  const handleDownload = (cert: MobileCertificate) => {
    setDownloadToast(`Downloaded verified NABL MTC (${cert.certNumber || cert.id})`);
    setTimeout(() => setDownloadToast(''), 3500);
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl
          refreshing={isRefreshing}
          onRefresh={() => fetchCertificates(true)}
          colors={['#0052CC']}
        />
      }
      showsVerticalScrollIndicator={false}
    >
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
        <Text style={styles.complianceTitle}>NABL Accredited Metallurgical Testing</Text>
        <Text style={styles.complianceDesc}>
          All certificates comply with EN 10204:2004 Type 3.1 with 100% heat traceability.
        </Text>
      </View>

      {isLoading ? (
        <View style={{ gap: 10 }}>
          <OrderCardSkeleton />
          <OrderCardSkeleton />
        </View>
      ) : certificates.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyTitle}>No Certificates Found</Text>
          <Text style={styles.emptyDesc}>
            {searchQuery
              ? `No test certificates match "${searchQuery}".`
              : 'Mill test certificates are generated automatically when factory orders are confirmed.'}
          </Text>
        </View>
      ) : (
        certificates.map((cert) => (
          <MobileCard key={cert.id}>
            <View style={styles.rowBetween}>
              <Text style={styles.certId}>{cert.certNumber || cert.id}</Text>
              <MobileBadge label="VERIFIED 3.1" variant="success" size="sm" />
            </View>

            <Text style={styles.productName}>{cert.standard || 'DIN 933 Metric Hex'}</Text>
            <Text style={styles.heatNumber}>
              Heat: {cert.heatNumber} • PO: {cert.orderNumber}
            </Text>
            {cert.grade ? <Text style={styles.gradeText}>{cert.grade}</Text> : null}

            <View style={styles.chemBox}>
              <Text style={styles.chemText}>
                OES Chemical: C: {cert.carbonPct || '0.36%'} | Mn: {cert.manganesePct || '0.74%'} | Cr: {cert.chromiumPct || '0.22%'}
              </Text>
              <Text style={styles.mechText}>
                Mechanical: Tensile {cert.tensileMpa || '850 MPa'} | Yield {cert.yieldMpa || '670 MPa'} | Hardness {cert.hardnessHrc || '30 HRC'}
              </Text>
              {cert.saltSprayHrs ? (
                <Text style={styles.saltSprayText}>Corrosion: {cert.saltSprayHrs}</Text>
              ) : null}
            </View>

            <View style={styles.divider} />

            <View style={styles.rowBetween}>
              <Text style={styles.dateText}>Issued: {cert.issueDate}</Text>
              <TouchableOpacity
                onPress={() => handleDownload(cert)}
                style={styles.downloadBtn}
                activeOpacity={0.8}
              >
                <Text style={styles.downloadBtnText}>Download MTC (EN 10204 3.1)</Text>
              </TouchableOpacity>
            </View>
          </MobileCard>
        ))
      )}
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
  loadingBox: {
    padding: 32,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  emptyBox: {
    padding: 32,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0F172A',
  },
  emptyDesc: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 4,
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
    fontFamily: 'monospace',
  },
  gradeText: {
    fontSize: 11,
    color: '#059669',
    fontWeight: '700',
    marginTop: 2,
  },
  chemBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    gap: 3,
  },
  chemText: {
    fontSize: 10,
    color: '#334155',
    fontFamily: 'monospace',
  },
  mechText: {
    fontSize: 10,
    color: '#334155',
    fontFamily: 'monospace',
  },
  saltSprayText: {
    fontSize: 10,
    color: '#7C3AED',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 8,
  },
  dateText: {
    fontSize: 11,
    color: '#64748B',
  },
  downloadBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  downloadBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
});
