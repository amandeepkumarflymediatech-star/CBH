import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Linking,
  Alert,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';

interface CustomerContactScreenProps {
  onBack?: () => void;
  onNavigateToRfqs?: () => void;
}

export const CustomerContactScreen: React.FC<CustomerContactScreenProps> = ({
  onBack,
  onNavigateToRfqs,
}) => {
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [inquiryType, setInquiryType] = useState('Bulk Procurement');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const handleCall = () => {
    Linking.openURL('tel:+919888021000');
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent('Hello CBH Team, I am reaching out regarding industrial fastener procurement.');
    Linking.openURL(`https://wa.me/919888021000?text=${text}`);
  };

  const handleEmail = (target: string) => {
    Linking.openURL(`mailto:${target}`);
  };

  const handleSubmit = () => {
    if (!name.trim() || !phone.trim()) {
      Alert.alert('Incomplete Form', 'Please provide at least your Contact Name and Phone Number.');
      return;
    }
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      Alert.alert(
        'Inquiry Transmitted',
        `Thank you ${name}! Your inquiry has been routed to our Ludhiana Sales Desk. An engineer will contact you shortly.`
      );
    }, 600);
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null}

      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.slaBadge}>
          <Text style={styles.slaText}>RAPID PROCUREMENT DESK · &lt; 15 MIN SLA</Text>
        </View>
        <Text style={styles.bannerTitle}>Contact Capital Bolts & Hardwares</Text>
        <Text style={styles.bannerSubtitle}>
          Direct factory support, technical engineering calculations, pan-India express freight dispatch, and bulk tender pricing.
        </Text>

        <View style={styles.quickActionRow}>
          <TouchableOpacity onPress={handleCall} style={styles.callBtn}>
            <Text style={styles.callBtnText}>Call: +91 98880 21000</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleWhatsApp} style={styles.waBtn}>
            <Text style={styles.waBtnText}>WhatsApp Sales Desk</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Factory & Depot Addresses */}
      <Text style={styles.sectionTitle}>Central Plant & Operations</Text>
      <MobileCard>
        <View style={styles.infoRow}>
          
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoLabel}>Central Headquarters & Manufacturing Hub</Text>
            <Text style={styles.infoVal}>
              Capital Towers, Gill Rd, opp. SBI,{'\n'}
              Miller Ganj, Ludhiana, Punjab - 141003, India
            </Text>
            <Text style={styles.hoursText}>Mon - Sat: 9:30 AM - 6:30 PM IST</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.infoRow}>
          
          <View style={{ flex: 1, marginLeft: 10 }}>
            <Text style={styles.infoLabel}>National Capital Regional Depot</Text>
            <Text style={styles.infoVal}>
              Plot 18, Okhla Industrial Area Phase-III,{'\n'}
              New Delhi - 110020, India
            </Text>
          </View>
        </View>
      </MobileCard>

      {/* Email Desks */}
      <Text style={styles.sectionTitle}>Departmental Email Desks</Text>
      <MobileCard>
        <TouchableOpacity onPress={() => handleEmail('sales@capitalbolts.co')} style={styles.deptRow}>
          <View>
            <Text style={styles.deptName}>Bulk Sales & Commercial RFQs</Text>
            <Text style={styles.deptEmail}>sales@capitalbolts.co</Text>
          </View>
          <Text style={styles.arrowText}>→</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => handleEmail('support@cbh.store')} style={styles.deptRow}>
          <View>
            <Text style={styles.deptName}>Technical Lab & Quality MTC Inquiries</Text>
            <Text style={styles.deptEmail}>support@cbh.store</Text>
          </View>
          <Text style={styles.arrowText}>✉</Text>
        </TouchableOpacity>

        <View style={styles.divider} />

        <TouchableOpacity onPress={() => handleEmail('accounts@capitalbolts.co')} style={styles.deptRow}>
          <View>
            <Text style={styles.deptName}>Billing & Credit Facilities</Text>
            <Text style={styles.deptEmail}>accounts@capitalbolts.co</Text>
          </View>
          <Text style={styles.arrowText}>✉</Text>
        </TouchableOpacity>
      </MobileCard>

      {/* Official RTGS / NEFT Banking Details */}
      <Text style={styles.sectionTitle}>Commercial Banking (RTGS / NEFT)</Text>
      <MobileCard>
        <View style={styles.bankNotice}>
          <Text style={styles.bankNoticeText}>Official B2B Remittance Account</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>Beneficiary Name:</Text>
          <Text style={styles.bankVal}>CAPITAL BOLTS & HARDWARES</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>Bank Name:</Text>
          <Text style={styles.bankVal}>HDFC BANK LTD</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>Current Account No:</Text>
          <Text style={[styles.bankVal, styles.monoVal]}>50200028941032</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>IFSC Code:</Text>
          <Text style={[styles.bankVal, styles.monoVal]}>HDFC0000249</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>Branch:</Text>
          <Text style={styles.bankVal}>Miller Ganj, Ludhiana</Text>
        </View>
        <View style={styles.bankDetailRow}>
          <Text style={styles.bankKey}>GSTIN / Tax ID:</Text>
          <Text style={[styles.bankVal, styles.monoVal]}>03AABCC1234F1Z8</Text>
        </View>
      </MobileCard>

      {/* Fast Contact Form */}
      <Text style={styles.sectionTitle}>Send Direct Inquiry to Factory</Text>
      <MobileCard>
        {submitted ? (
          <View style={styles.successBox}>
            <Text style={styles.successIcon}>✓</Text>
            <Text style={styles.successTitle}>Inquiry Successfully Sent!</Text>
            <Text style={styles.successDesc}>
              Our engineering team has received your inquiry. We will contact you at {phone} within 15 minutes.
            </Text>
            <TouchableOpacity onPress={() => setSubmitted(false)} style={styles.sendAnotherBtn}>
              <Text style={styles.sendAnotherBtnText}>Send Another Message</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.formContainer}>
            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="e.g. Vikram Sharma"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Company / Organization</Text>
            <TextInput
              style={styles.input}
              value={company}
              onChangeText={setCompany}
              placeholder="e.g. Apex Infra Projects Ltd"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="+91 98765 43210"
              keyboardType="phone-pad"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Corporate Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="purchase@company.com"
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#94A3B8"
            />

            <Text style={styles.inputLabel}>Inquiry Type</Text>
            <View style={styles.inquiryTypesRow}>
              {['Bulk Procurement', 'Custom Drawing', 'Dealership', 'Other'].map((t) => (
                <TouchableOpacity
                  key={t}
                  onPress={() => setInquiryType(t)}
                  style={[styles.typePill, inquiryType === t && styles.typePillActive]}
                >
                  <Text style={[styles.typePillText, inquiryType === t && styles.typePillTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Message / Fastener Requirements</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Specify standard, sizes, quantities, and delivery destination..."
              placeholderTextColor="#94A3B8"
              multiline
              numberOfLines={4}
            />

            <TouchableOpacity
              onPress={handleSubmit}
              disabled={isSubmitting}
              style={[styles.submitBtn, isSubmitting && { opacity: 0.6 }]}
            >
              <Text style={styles.submitBtnText}>
                {isSubmitting ? 'Routing to Sales Desk...' : 'Transmit Inquiry to Factory →'}
              </Text>
            </TouchableOpacity>
          </View>
        )}
      </MobileCard>
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
    backgroundColor: '#0052CC',
    borderRadius: 14,
    padding: 18,
    marginBottom: 18,
  },
  slaBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 107, 0, 0.25)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    marginBottom: 8,
  },
  slaText: {
    color: '#FFD8A8',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  bannerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 26,
    marginBottom: 6,
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#E0E7FF',
    lineHeight: 18,
    marginBottom: 14,
  },
  quickActionRow: {
    flexDirection: 'row',
    gap: 8,
  },
  callBtn: {
    flex: 1,
    backgroundColor: '#FF6B00',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  callBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  waBtn: {
    flex: 1,
    backgroundColor: '#059669',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  waBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 12,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    marginTop: 8,
    marginBottom: 10,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  infoIcon: {
    fontSize: 24,
  },
  infoLabel: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  infoVal: {
    fontSize: 12,
    color: '#475569',
    lineHeight: 18,
    marginTop: 2,
  },
  hoursText: {
    fontSize: 11,
    color: '#0052CC',
    fontWeight: '700',
    marginTop: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  deptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deptName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0F172A',
  },
  deptEmail: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
    marginTop: 2,
  },
  arrowText: {
    fontSize: 18,
    color: '#94A3B8',
  },
  bankNotice: {
    backgroundColor: '#ECFDF5',
    padding: 8,
    borderRadius: 6,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bankNoticeText: {
    color: '#065F46',
    fontWeight: '800',
    fontSize: 11,
  },
  bankDetailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  bankKey: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  bankVal: {
    fontSize: 12,
    color: '#0F172A',
    fontWeight: '700',
    textAlign: 'right',
  },
  monoVal: {
    fontFamily: 'monospace',
    color: '#0052CC',
  },
  formContainer: {},
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#334155',
    marginBottom: 4,
    marginTop: 8,
  },
  input: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  inquiryTypesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 4,
  },
  typePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    backgroundColor: '#FFFFFF',
  },
  typePillActive: {
    backgroundColor: '#EFF6FF',
    borderColor: '#0052CC',
  },
  typePillText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  typePillTextActive: {
    color: '#0052CC',
    fontWeight: '800',
  },
  submitBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 13,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
  successBox: {
    alignItems: 'center',
    padding: 16,
  },
  successIcon: {
    fontSize: 32,
    color: '#059669',
    marginBottom: 6,
  },
  successTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#059669',
    marginBottom: 4,
  },
  successDesc: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 16,
  },
  sendAnotherBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
  },
  sendAnotherBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0F172A',
  },
});

