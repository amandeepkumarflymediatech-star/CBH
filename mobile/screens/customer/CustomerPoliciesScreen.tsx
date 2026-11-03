import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { MobileCard } from '../../components/MobileCard';

interface CustomerPoliciesScreenProps {
  initialTab?: 'terms' | 'privacy' | 'shipping' | 'cancellation';
  onBack?: () => void;
}

export const CustomerPoliciesScreen: React.FC<CustomerPoliciesScreenProps> = ({
  initialTab = 'terms',
  onBack,
}) => {
  const [activeTab, setActiveTab] = useState<'terms' | 'privacy' | 'shipping' | 'cancellation'>(
    initialTab
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null}

      <View style={styles.headerBox}>
        <Text style={styles.headerTitle}>Legal & Commercial Policies</Text>
        <Text style={styles.headerSubtitle}>
          Official procurement governance, data privacy, freight dispatch SLAs, and returns policy for Capital Bolts & Hardwares.
        </Text>
      </View>

      {/* Tabs */}
      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('terms')}
          style={[styles.tabBtn, activeTab === 'terms' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'terms' && styles.tabBtnTextActive]}>
            Terms & Conditions
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('privacy')}
          style={[styles.tabBtn, activeTab === 'privacy' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'privacy' && styles.tabBtnTextActive]}>
            Privacy Policy
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.tabsRow}>
        <TouchableOpacity
          onPress={() => setActiveTab('shipping')}
          style={[styles.tabBtn, activeTab === 'shipping' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'shipping' && styles.tabBtnTextActive]}>
            Shipping & Dispatch
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setActiveTab('cancellation')}
          style={[styles.tabBtn, activeTab === 'cancellation' && styles.tabBtnActive]}
        >
          <Text style={[styles.tabBtnText, activeTab === 'cancellation' && styles.tabBtnTextActive]}>
            Refund & Cancellation
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content based on Active Tab */}
      <MobileCard>
        {activeTab === 'terms' && (
          <View style={styles.contentWrap}>
            <Text style={styles.policyTitle}>B2B Wholesale Commercial Terms</Text>
            <Text style={styles.lastUpdated}>Effective Date: October 2024</Text>

            <Text style={styles.h3}>1. Applicability & Quotations</Text>
            <Text style={styles.p}>
              All industrial quotations issued by Capital Bolts & Hardwares (CBH) via the platform or sales desk remain valid for seven (7) calendar days from generation, subject to raw material steel wire rod price fluctuations.
            </Text>

            <Text style={styles.h3}>2. Minimum Order Quantity (MOQ) & Packaging</Text>
            <Text style={styles.p}>
              Standard metric fasteners are packed in standardized small cartons and export master corrugated boxes. Standard wholesale MOQ is 25 KGS or 500 Pcs per diameter-length line item unless custom ordered.
            </Text>

            <Text style={styles.h3}>3. Material Test Certificates (MTC)</Text>
            <Text style={styles.p}>
              EN 10204 Type 3.1 NABL-accredited inspection certificates verifying chemical spectroscopy, yield strength, tensile elongation, and hardness are provided with every batch at zero surcharge.
            </Text>

            <Text style={styles.h3}>4. Corporate Credit & Payment Terms</Text>
            <Text style={styles.p}>
              Approved enterprise clients with verified GSTIN and credit appraisal are eligible for Net 30-Day billing terms. Default in payment incurs commercial interest at 18% per annum under MSMED Act provisions.
            </Text>
          </View>
        )}

        {activeTab === 'privacy' && (
          <View style={styles.contentWrap}>
            <Text style={styles.policyTitle}>Enterprise Data Privacy Policy</Text>
            <Text style={styles.lastUpdated}>Effective Date: October 2024</Text>

            <Text style={styles.h3}>1. Information We Collect</Text>
            <Text style={styles.p}>
              CBH collects corporate entity details including company name, registered GSTIN, authorized buyer name, delivery godown addresses, email, and phone contact solely to fulfill procurement orders, generate legal e-Way bills, and provide tax invoices.
            </Text>

            <Text style={styles.h3}>2. Confidentiality of Technical Blueprints</Text>
            <Text style={styles.p}>
              Any proprietary 2D CAD engineering blueprints, BOM schedules, or custom fastener specifications uploaded to our RFQ system are protected under strict non-disclosure. We never disclose technical drawings to third-party manufacturers.
            </Text>

            <Text style={styles.h3}>3. Security & Payments</Text>
            <Text style={styles.p}>
              All commercial card and UPI transactions are tokenized through RBI-authorized payment gateways (PhonePe Business). CBH never stores raw CVVs or bank credentials on its servers.
            </Text>
          </View>
        )}

        {activeTab === 'shipping' && (
          <View style={styles.contentWrap}>
            <Text style={styles.policyTitle}>Pan-India Shipping & Freight Policy</Text>
            <Text style={styles.lastUpdated}>Effective Date: October 2024</Text>

            <Text style={styles.h3}>1. Dispatch Timelines & SLA</Text>
            <Text style={styles.p}>
              In-stock inventory orders confirmed before 2:00 PM IST are packaged and dispatched from our Ludhiana or Delhi mother godown within 24 to 48 hours. Custom manufacturing runs adhere to committed production lead times (typically 7–14 business days).
            </Text>

            <Text style={styles.h3}>2. Logistics Partners & Palletized Freight</Text>
            <Text style={styles.p}>
              Heavy tonnage fastener consignments (&gt; 250 KG) are shrink-wrapped on ISPM-15 treated wooden pallets and shipped via trusted full-truckload (FTL) and part-truckload (PTL) carriers (V-Trans, TCI Freight, Safexpress). Real-time AWB tracking numbers are updated on the app upon dispatch.
            </Text>

            <Text style={styles.h3}>3. Transit Insurance</Text>
            <Text style={styles.p}>
              All consignments are covered under transit insurance up to final delivery godown gate.
            </Text>
          </View>
        )}

        {activeTab === 'cancellation' && (
          <View style={styles.contentWrap}>
            <Text style={styles.policyTitle}>Cancellation & Quality Guarantee Policy</Text>
            <Text style={styles.lastUpdated}>Effective Date: October 2024</Text>

            <Text style={styles.h3}>1. Order Cancellation</Text>
            <Text style={styles.p}>
              Standard catalog orders may be cancelled prior to pallet dispatch by notifying our procurement desk. Once an e-Way bill and AWB have been generated, in-transit cancellation fees equal to outward freight apply.
            </Text>

            <Text style={styles.h3}>2. Quality Claims & Rejection SLA</Text>
            <Text style={styles.p}>
              In the rare event that received fasteners fail GO/NO-GO gauge fitment, thread pitch tolerance, or tensile hardness as certified in the MTC, buyers must submit an inspection report within ten (10) days of receipt. CBH will arrange zero-cost reverse logistics and full immediate replacement or credit note.
            </Text>
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
  headerBox: {
    marginBottom: 14,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#0F172A',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  tabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  tabBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    paddingVertical: 9,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tabBtnActive: {
    backgroundColor: '#0052CC',
    borderColor: '#0052CC',
  },
  tabBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  contentWrap: {},
  policyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
    marginBottom: 2,
  },
  lastUpdated: {
    fontSize: 11,
    color: '#94A3B8',
    marginBottom: 14,
  },
  h3: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0052CC',
    marginTop: 10,
    marginBottom: 4,
  },
  p: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 19,
    marginBottom: 8,
  },
});

