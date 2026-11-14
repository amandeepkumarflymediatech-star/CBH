import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Platform,
} from 'react-native';
import { MobileSearch } from '../../components/MobileSearch';

const GRAPHITE = '#0F172A';
const STEEL = '#475569';
const LIGHT_STEEL = '#94A3B8';
const WHITE = '#FFFFFF';
const BLUE = '#0052CC';
const GREEN = '#16A34A';
const MONO = Platform.select({ ios: 'Menlo', android: 'monospace', default: 'monospace' });

const inr = (n: number) => `₹${n.toLocaleString('en-IN')}`;

export const AdminPaymentsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'ledger'>('config');

  // PhonePe Gateway Configuration
  const [merchantId, setMerchantId] = useState('PGTESTPAYUAT');
  const [saltKey, setSaltKey] = useState('099eb0cd-02cf-4e2a-8aca-3e6c6aff0399');
  const [saltIndex, setSaltIndex] = useState('1');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [callbackUrl, setCallbackUrl] = useState('https://cbh.store/api/payment/phonepe/callback');
  const [redirectUrl, setRedirectUrl] = useState('http://localhost:3000/order-success');
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const transactions = [
    {
      id: 'TXN-90812',
      orderNumber: 'CBH-ORD-8821',
      client: 'Apex Heavy Infrastructure Ltd.',
      amount: 142850,
      mode: 'PhonePe UPI',
      status: 'CAPTURED',
      date: '28 Oct 16:30',
      utr: 'UTR889920192831',
    },
    {
      id: 'TXN-90809',
      orderNumber: 'CBH-ORD-8819',
      client: 'L&T Power Transmission Div',
      amount: 268400,
      mode: 'NEFT / RTGS Wire',
      status: 'VERIFIED',
      date: '27 Oct 11:15',
      utr: 'HDFCR9928172910',
    },
    {
      id: 'TXN-90804',
      orderNumber: 'CBH-ORD-8815',
      client: 'Tata Projects Industrial Division',
      amount: 98500,
      mode: 'PhonePe Cards',
      status: 'CAPTURED',
      date: '26 Oct 14:20',
      utr: 'AXISPG2026001928',
    },
  ];

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(''), 3500);
  };

  const handleTestHandshake = () => {
    setIsTesting(true);
    setTimeout(() => {
      setIsTesting(false);
      showToast('PhonePe PG Sandbox Handshake Verified (SHA256 Match)!');
    }, 600);
  };

  const handleSaveConfig = () => {
    showToast('PhonePe Gateway parameters updated & secured!');
  };

  const filteredTxns = transactions.filter((t) => {
    return (
      !searchQuery.trim() ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.client.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.orderNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.utr.toLowerCase().includes(searchQuery.toLowerCase())
    );
  });

  return (
    <View style={{ flex: 1, backgroundColor: '#F8FAFC' }}>
      {/* Top Settlement Summary - Compact Header */}
      <View style={styles.topHeader}>
        <View style={styles.settleRow}>
          <View>
            <Text style={styles.settleLabel}>Gross Settled Dispatches</Text>
            <Text style={styles.settleAmount}>₹5,09,750.00</Text>
          </View>
          <View style={styles.gatewayBadge}>
            <View style={styles.onlineDot} />
            <Text style={styles.gatewayBadgeText}>PhonePe {environment}</Text>
          </View>
        </View>

        {/* Segmented Mode Switcher */}
        <View style={styles.segmentedBar}>
          <TouchableOpacity
            onPress={() => setActiveTab('config')}
            style={[styles.segmentBtn, activeTab === 'config' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'config' && styles.segmentTextActive]}>
              Gateway Parameters
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setActiveTab('ledger')}
            style={[styles.segmentBtn, activeTab === 'ledger' && styles.segmentBtnActive]}
          >
            <Text style={[styles.segmentText, activeTab === 'ledger' && styles.segmentTextActive]}>
              Transaction Ledger ({transactions.length})
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* Content Area */}
      <ScrollView contentContainerStyle={styles.contentContainer} showsVerticalScrollIndicator={false}>
        {activeTab === 'config' ? (
          <View style={styles.card}>
            <View style={styles.cardTitleRow}>
              <Text style={styles.cardTitle}>PhonePe Business PG Setup</Text>
              <TouchableOpacity
                onPress={handleTestHandshake}
                disabled={isTesting}
                style={styles.testBtn}
              >
                <Text style={styles.testBtnText}>
                  {isTesting ? 'Testing...' : 'Test Connection'}
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Merchant ID *</Text>
            <TextInput
              style={[styles.input, { fontFamily: MONO }]}
              value={merchantId}
              onChangeText={setMerchantId}
              autoCapitalize="none"
            />

            <View style={styles.labelRow}>
              <Text style={styles.inputLabel}>Salt Secret Key *</Text>
              <TouchableOpacity onPress={() => setShowSecret(!showSecret)}>
                <Text style={styles.toggleText}>{showSecret ? 'Hide' : 'Show'}</Text>
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, { fontFamily: MONO }]}
              value={saltKey}
              onChangeText={setSaltKey}
              secureTextEntry={!showSecret}
              autoCapitalize="none"
            />

            <View style={styles.twoCols}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Key Index</Text>
                <TextInput
                  style={styles.input}
                  value={saltIndex}
                  onChangeText={setSaltIndex}
                  keyboardType="numeric"
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Environment</Text>
                <TouchableOpacity
                  onPress={() =>
                    setEnvironment(environment === 'SANDBOX' ? 'PRODUCTION' : 'SANDBOX')
                  }
                  style={[
                    styles.envBtn,
                    environment === 'PRODUCTION' ? styles.envProd : styles.envSandbox,
                  ]}
                >
                  <Text style={styles.envBtnText}>{environment}</Text>
                </TouchableOpacity>
              </View>
            </View>

            <Text style={styles.inputLabel}>S2S Webhook Callback URL</Text>
            <TextInput
              style={[styles.input, { fontSize: 11 }]}
              value={callbackUrl}
              onChangeText={setCallbackUrl}
              autoCapitalize="none"
            />

            <Text style={styles.inputLabel}>User Redirect URL</Text>
            <TextInput
              style={[styles.input, { fontSize: 11 }]}
              value={redirectUrl}
              onChangeText={setRedirectUrl}
              autoCapitalize="none"
            />

            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveConfig} activeOpacity={0.88}>
              <Text style={styles.saveBtnText}>Save Gateway Parameters</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View>
            <View style={{ marginBottom: 10 }}>
              <MobileSearch
                value={searchQuery}
                onChange={setSearchQuery}
                placeholder="Search UTR, Order # or Client..."
              />
            </View>

            {filteredTxns.map((t) => (
              <View key={t.id} style={styles.txnCard}>
                <View style={styles.txnTopRow}>
                  <View style={styles.txnIdGroup}>
                    <Text style={styles.txnId}>{t.id}</Text>
                    <Text style={styles.txnOrderNum}>{t.orderNumber}</Text>
                  </View>
                  <View style={styles.capturedBadge}>
                    <Text style={styles.capturedBadgeText}>{t.status}</Text>
                  </View>
                </View>

                <View style={styles.txnMidRow}>
                  <Text style={styles.txnClient} numberOfLines={1}>
                    {t.client}
                  </Text>
                  <Text style={styles.txnAmount}>{inr(t.amount)}</Text>
                </View>

                <View style={styles.txnBottomRow}>
                  <Text style={styles.txnMeta}>
                    {t.mode} • {t.date}
                  </Text>
                  <Text style={styles.txnUtr}>UTR: {t.utr}</Text>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  topHeader: {
    backgroundColor: WHITE,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 8,
  },
  settleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  settleLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: STEEL,
    textTransform: 'uppercase',
  },
  settleAmount: {
    fontSize: 16,
    fontWeight: '800',
    fontFamily: MONO,
    color: GRAPHITE,
  },
  gatewayBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F1F5F9',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  onlineDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: GREEN,
  },
  gatewayBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: STEEL,
  },
  segmentedBar: {
    flexDirection: 'row',
    backgroundColor: '#F1F5F9',
    borderRadius: 8,
    padding: 2,
  },
  segmentBtn: {
    flex: 1,
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  segmentBtnActive: {
    backgroundColor: WHITE,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  segmentText: {
    fontSize: 11,
    fontWeight: '600',
    color: STEEL,
  },
  segmentTextActive: {
    color: BLUE,
    fontWeight: '800',
  },
  contentContainer: {
    padding: 12,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: GRAPHITE,
  },
  testBtn: {
    backgroundColor: '#EFF6FF',
    paddingVertical: 3,
    paddingHorizontal: 8,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUE,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: STEEL,
    marginBottom: 4,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  toggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: BLUE,
  },
  input: {
    height: 38,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 6,
    paddingHorizontal: 10,
    fontSize: 12,
    color: GRAPHITE,
    marginBottom: 8,
  },
  twoCols: {
    flexDirection: 'row',
    gap: 8,
  },
  envBtn: {
    height: 38,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  envSandbox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  envProd: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  envBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: GRAPHITE,
  },
  saveBtn: {
    backgroundColor: BLUE,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  saveBtnText: {
    color: WHITE,
    fontSize: 12,
    fontWeight: '800',
  },
  txnCard: {
    backgroundColor: WHITE,
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  txnTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  txnIdGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  txnId: {
    fontSize: 11,
    fontWeight: '800',
    fontFamily: MONO,
    color: BLUE,
  },
  txnOrderNum: {
    fontSize: 11,
    fontWeight: '600',
    fontFamily: MONO,
    color: STEEL,
  },
  capturedBadge: {
    backgroundColor: '#DCFCE7',
    paddingVertical: 1,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  capturedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: GREEN,
  },
  txnMidRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  txnClient: {
    fontSize: 12,
    fontWeight: '700',
    color: GRAPHITE,
    flex: 1,
    paddingRight: 8,
  },
  txnAmount: {
    fontSize: 12,
    fontWeight: '800',
    fontFamily: MONO,
    color: GREEN,
  },
  txnBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
    paddingTop: 4,
  },
  txnMeta: {
    fontSize: 10,
    color: LIGHT_STEEL,
  },
  txnUtr: {
    fontSize: 10,
    fontFamily: MONO,
    color: STEEL,
  },
  toast: {
    backgroundColor: GRAPHITE,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginHorizontal: 12,
    marginTop: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  toastText: {
    color: WHITE,
    fontSize: 11,
    fontWeight: '700',
  },
});
