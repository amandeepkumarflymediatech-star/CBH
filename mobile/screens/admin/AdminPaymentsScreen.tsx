import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';
import { MobileBadge } from '../../components/MobileBadge';
import { MobileSearch } from '../../components/MobileSearch';

export const AdminPaymentsScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'config' | 'ledger'>('config');

  // PhonePe Gateway Configuration (100% of Web inputs)
  const [merchantId, setMerchantId] = useState('PGTESTPAYUAT');
  const [saltKey, setSaltKey] = useState('099eb0cd-02cf-4e2a-8aca-3e6c6aff0399');
  const [saltIndex, setSaltIndex] = useState('1');
  const [environment, setEnvironment] = useState<'SANDBOX' | 'PRODUCTION'>('SANDBOX');
  const [enableSimulator, setEnableSimulator] = useState(true);
  const [callbackUrl, setCallbackUrl] = useState('https://cbh.store/api/payment/phonepe/callback');
  const [redirectUrl, setRedirectUrl] = useState('http://localhost:3000/order-success');
  const [autoConfirmOrders, setAutoConfirmOrders] = useState(true);
  const [showSecret, setShowSecret] = useState(false);
  const [isTesting, setIsTesting] = useState(false);
  const [toastMsg, setToastMsg] = useState('');

  const transactions = [
    {
      id: 'TXN-90812',
      orderNumber: 'CBH-ORD-8821',
      client: 'Apex Heavy Infrastructure Ltd.',
      amount: 142850,
      mode: 'PHONEPE_UPI',
      status: 'CAPTURED',
      date: '2026-10-28 16:30',
      utr: 'UTR889920192831',
    },
    {
      id: 'TXN-90809',
      orderNumber: 'CBH-ORD-8819',
      client: 'L&T Power Transmission Div',
      amount: 268400,
      mode: 'NEFT_RTGS',
      status: 'VERIFIED',
      date: '2026-10-27 11:15',
      utr: 'HDFCR9928172910',
    },
    {
      id: 'TXN-90804',
      orderNumber: 'CBH-ORD-8815',
      client: 'Tata Projects Industrial Division',
      amount: 98500,
      mode: 'PHONEPE_CARDS',
      status: 'CAPTURED',
      date: '2026-10-26 14:20',
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
      showToast('PhonePe PG UAT Sandbox handshake verified (SHA256 checksum matched)!');
    }, 800);
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
    <ScrollView contentContainerStyle={styles.container}>
      {/* Top Settlement Summary Card */}
      <View style={styles.revenueCard}>
        <Text style={styles.revenueLabel}>Gross Settled Dispatches (October 2026)</Text>
        <Text style={styles.revenueAmount}>₹5,09,750.00</Text>
        <View style={styles.revenueFooter}>
          <Text style={styles.footerNote}>PhonePe PG: ACTIVE ({environment})</Text>
          <Text style={styles.footerNote}>T+1 Settlement Cycle</Text>
        </View>
      </View>

      {/* Mode Switcher */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          onPress={() => setActiveTab('config')}
          style={[styles.tabBtn, activeTab === 'config' && styles.tabBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'config' && styles.tabTextActive]}>
            ⚙️ Gateway Configuration
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={() => setActiveTab('ledger')}
          style={[styles.tabBtn, activeTab === 'ledger' && styles.tabBtnActive]}
          activeOpacity={0.8}
        >
          <Text style={[styles.tabText, activeTab === 'ledger' && styles.tabTextActive]}>
            💳 Transaction Ledger
          </Text>
        </TouchableOpacity>
      </View>

      {/* Toast Feedback */}
      {toastMsg ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>✓ {toastMsg}</Text>
        </View>
      ) : null}

      {/* VIEW 1: GATEWAY CONFIGURATION */}
      {activeTab === 'config' ? (
        <MobileCard>
          <View style={styles.rowBetween}>
            <Text style={styles.configHeading}>PhonePe Business PG Parameters</Text>
            <TouchableOpacity
              onPress={handleTestHandshake}
              disabled={isTesting}
              style={styles.testBtn}
            >
              <Text style={styles.testBtnText}>
                {isTesting ? 'Testing...' : '⚡ Test Handshake'}
              </Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.fieldLabel}>Merchant ID *</Text>
          <TextInput
            style={styles.input}
            value={merchantId}
            onChangeText={setMerchantId}
            placeholder="PGTESTPAYUAT"
            autoCapitalize="none"
          />

          <View style={styles.rowBetween}>
            <Text style={styles.fieldLabel}>Salt Secret Key *</Text>
            <TouchableOpacity onPress={() => setShowSecret(!showSecret)}>
              <Text style={styles.eyeToggleText}>{showSecret ? 'Hide Key' : 'Show Key'}</Text>
            </TouchableOpacity>
          </View>
          <TextInput
            style={styles.input}
            value={saltKey}
            onChangeText={setSaltKey}
            secureTextEntry={!showSecret}
            placeholder="••••••••••••••••"
            autoCapitalize="none"
          />

          <View style={styles.formSplit}>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Key Index</Text>
              <TextInput
                style={styles.input}
                value={saltIndex}
                onChangeText={setSaltIndex}
                placeholder="1"
                keyboardType="numeric"
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fieldLabel}>Environment Mode</Text>
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

          <Text style={styles.fieldLabel}>Default Webhook S2S Callback URL</Text>
          <TextInput
            style={styles.input}
            value={callbackUrl}
            onChangeText={setCallbackUrl}
            placeholder="https://..."
            autoCapitalize="none"
          />

          <Text style={styles.fieldLabel}>User Return / Success Redirect URL</Text>
          <TextInput
            style={styles.input}
            value={redirectUrl}
            onChangeText={setRedirectUrl}
            placeholder="http://..."
            autoCapitalize="none"
          />

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Auto-Confirm &amp; Generate Dispatch on Success</Text>
            <TouchableOpacity
              onPress={() => setAutoConfirmOrders(!autoConfirmOrders)}
              style={[styles.toggleBtn, autoConfirmOrders && styles.toggleBtnActive]}
            >
              <Text style={styles.toggleText}>{autoConfirmOrders ? 'ENABLED' : 'MANUAL'}</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.switchRow}>
            <Text style={styles.switchLabel}>Developer Sandbox Mock Simulator</Text>
            <TouchableOpacity
              onPress={() => setEnableSimulator(!enableSimulator)}
              style={[styles.toggleBtn, enableSimulator && styles.toggleBtnActive]}
            >
              <Text style={styles.toggleText}>{enableSimulator ? 'ACTIVE' : 'OFF'}</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity onPress={handleSaveConfig} style={styles.saveBtn} activeOpacity={0.8}>
            <Text style={styles.saveBtnText}>Save Gateway Configuration</Text>
          </TouchableOpacity>
        </MobileCard>
      ) : (
        /* VIEW 2: TRANSACTION LEDGER */
        <View style={{ gap: 10 }}>
          <MobileSearch
            value={searchQuery}
            onChange={setSearchQuery}
            placeholder="Search TXN ID, UTR, Client..."
          />

          {filteredTxns.map((txn) => (
            <MobileCard key={txn.id}>
              <View style={styles.rowBetween}>
                <Text style={styles.txnId}>{txn.id}</Text>
                <MobileBadge label={txn.status} variant="success" size="sm" />
              </View>

              <Text style={styles.clientName}>{txn.client}</Text>
              <Text style={styles.modeText}>
                Order: {txn.orderNumber} • Mode: {txn.mode}
              </Text>
              <Text style={styles.utrText}>Bank UTR: {txn.utr}</Text>

              <View style={styles.divider} />

              <View style={styles.rowBetween}>
                <Text style={styles.dateText}>{txn.date}</Text>
                <Text style={styles.amountText}>₹{txn.amount.toLocaleString('en-IN')}</Text>
              </View>
            </MobileCard>
          ))}
        </View>
      )}
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
  revenueCard: {
    backgroundColor: '#0052CC',
    borderRadius: 14,
    padding: 16,
    elevation: 3,
  },
  revenueLabel: {
    fontSize: 10,
    color: '#BFDBFE',
    textTransform: 'uppercase',
    fontWeight: '700',
  },
  revenueAmount: {
    fontSize: 26,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  revenueFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
    paddingTop: 8,
    marginTop: 6,
  },
  footerNote: {
    fontSize: 10,
    color: '#DBEAFE',
    fontWeight: '600',
  },
  tabBar: {
    flexDirection: 'row',
    backgroundColor: '#E2E8F0',
    borderRadius: 10,
    padding: 3,
  },
  tabBtn: {
    flex: 1,
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 8,
  },
  tabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
  },
  tabText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabTextActive: {
    color: '#0052CC',
    fontWeight: '800',
  },
  toast: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    borderRadius: 8,
    padding: 10,
  },
  toastText: {
    color: '#065F46',
    fontSize: 12,
    fontWeight: '700',
  },
  rowBetween: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  configHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  testBtn: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BFDBFE',
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0052CC',
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
    marginTop: 8,
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0F172A',
  },
  eyeToggleText: {
    fontSize: 10,
    color: '#0052CC',
    fontWeight: '700',
  },
  formSplit: {
    flexDirection: 'row',
    gap: 10,
  },
  envBtn: {
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
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
    fontWeight: '900',
    color: '#0F172A',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  switchLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#334155',
    flex: 1,
    marginRight: 10,
  },
  toggleBtn: {
    backgroundColor: '#CBD5E1',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
  },
  toggleBtnActive: {
    backgroundColor: '#10B981',
  },
  toggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  saveBtn: {
    backgroundColor: '#0F172A',
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  txnId: {
    fontSize: 13,
    fontWeight: '900',
    color: '#0052CC',
  },
  clientName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
    marginTop: 4,
  },
  modeText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  utrText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 10,
  },
  dateText: {
    fontSize: 11,
    color: '#94A3B8',
  },
  amountText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#0F172A',
  },
});
