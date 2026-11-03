import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  TextInput,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { mobileApi } from '../../config/api';
import { MobileCard } from '../../components/MobileCard';

export interface BlogPost {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  category: string;
  readTime: string;
  date: string;
  author: string;
  tags: string[];
}

const STATIC_BLOGS: BlogPost[] = [
  {
    id: 'din-vs-iso-vs-astm',
    slug: 'din-vs-iso-vs-astm',
    title: 'Fastener Standards Explained: Complete Guide to DIN, ISO, and ASTM Equivalencies',
    excerpt: 'Navigate standard harmonization differences between DIN 933, ISO 4017, and ASTM A193. Learn key dimensional tolerances, thread pitch variations, and material marking regulations.',
    content: `The Evolution of Industrial Fastener Standards\n\nIn modern precision engineering, specifying the correct fastener standard dictates assembly clearances, wrench fitment, tensile safety factors, and international legal compliance.\n\nKey Dimensional Differences: DIN 933 vs. ISO 4017\nWhile both DIN 933 and ISO 4017 specify fully threaded hexagon head screws, key dimensions diverge across standard metric diameters:\n\n• M10: DIN specifies s = 17mm, whereas ISO 4017 specifies s = 16mm.\n• M12: DIN specifies s = 19mm, whereas ISO 4017 specifies s = 18mm.\n• M14: DIN specifies s = 22mm, whereas ISO 4017 specifies s = 21mm.\n• M22: DIN specifies s = 32mm, whereas ISO 4017 specifies s = 34mm.\n\nCritical Procurement Risk: Supplying ISO-dimension bolts to an automated assembly line designed around legacy DIN dimensions can result in tool misalignment and robotic feeder jams.\n\nASTM A193 Grade B7: High-Temperature Pressure Applications\nGoverns chromium-molybdenum alloy steel heat-treated bolts specifically designed for high-temperature and high-pressure service in boilers, flanged piping, and pressure vessels (minimum tensile 860 MPa). Paired with ASTM A194 Grade 2H heavy hex nuts.`,
    category: 'Standards & Compliance',
    readTime: '6 min read',
    date: 'Oct 20, 2024',
    author: 'Technical Engineering Team',
    tags: ['DIN 933', 'ISO 4017', 'ASTM A193', 'Harmonization'],
  },
  {
    id: 'high-tensile-grade-8-8-10-9-12-9',
    slug: 'high-tensile-grade-8-8-10-9-12-9',
    title: 'High-Tensile Fasteners: When to Specify Grade 8.8, 10.9, or 12.9 in Structural Assemblies',
    excerpt: 'Understanding proof load, yield strength, and hydrogen embrittlement risks in electroplated high-tensile fasteners subjected to heavy cyclic loads.',
    content: `Deciphering the Metric Property Class Designation\n\nMetric high-tensile fasteners are categorized by two numbers separated by a dot (e.g., 8.8, 10.9, 12.9) per ISO 898-1:\n\n1. First Number: Represents 1/100th of the nominal tensile strength:\n• Grade 8.8: Tensile >= 800 MPa\n• Grade 10.9: Tensile >= 1000 MPa\n• Grade 12.9: Tensile >= 1200 MPa\n\n2. Second Number: Gives the yield ratio:\n• Grade 8.8: Yield strength is 80% = 640 MPa\n• Grade 10.9: Yield strength is 90% = 900 MPa\n• Grade 12.9: Yield strength is 90% = 1080 MPa\n\nHydrogen Embrittlement Mitigation:\nElectroplating high-tensile bolts (harder than 320 HV) can trap atomic hydrogen. ISO 4042 mandates de-embrittlement baking at 200°C within 4 hours of plating, or utilizing Geomet® zinc flake coating for zero-embrittlement assurance.`,
    category: 'Engineering & Design',
    readTime: '8 min read',
    date: 'Oct 02, 2024',
    author: 'Quality Testing Lab',
    tags: ['Grade 8.8', 'Grade 10.9', 'Grade 12.9', 'High Tensile'],
  },
  {
    id: 'ss304-vs-ss316-corrosion',
    slug: 'ss304-vs-ss316-corrosion',
    title: 'SS 304 vs SS 316 Fasteners: Corrosion Resistance in Marine & Chemical Infrastructure',
    excerpt: 'Why 2-3% molybdenum content in Grade A4 (SS 316) prevents pitting corrosion under severe chloride exposure and seawater mist environments.',
    content: `The Metallurgy of Austenitic Stainless Steel\n\nAustenitic stainless steels are the predominant choice for non-magnetic, corrosion-resistant fastening assemblies:\n• Grade A2 (SS 304): 18% Chromium, 8% Nickel\n• Grade A4 (SS 316): 18% Chromium, 10-12% Nickel, and 2-3% Molybdenum\n\nPitting Resistance (PREN Score):\n• SS 304 PREN: ~18.0 - 19.5\n• SS 316 PREN: ~23.0 - 25.0\n\nThe added Molybdenum in SS 316 prevents micro-crevice pitting breakdown in salt mist, coastal ports, and acidic food processing sanitizers.`,
    category: 'Material Metallurgy',
    readTime: '5 min read',
    date: 'Oct 14, 2024',
    author: 'Er. R. K. Singla',
    tags: ['SS304', 'SS316', 'Corrosion Resistance', 'A2 vs A4'],
  },
  {
    id: 'bis-mandatory-qco-fasteners',
    slug: 'bis-mandatory-qco-fasteners',
    title: 'Mandatory BIS Quality Control Orders (QCO) for Fasteners in India: What OEMs Must Verify',
    excerpt: 'A comprehensive review of the Ministry of Commerce & Industry Quality Control Order for hex bolts, screws, and structural fasteners imported or distributed in India.',
    content: `The New Regulatory Landscape for Fasteners in India\n\nThe Ministry of Commerce and Industry (DPIIT) issued the mandatory Fasteners (Quality Control) Order. Carbon and alloy steel fasteners sold in India must conform to Bureau of Indian Standards (BIS) specifications.\n\nMandatory Verification Items for Buyers:\n1. BIS License Number stamped on carton packaging\n2. Standard Mark and Manufacturer Code on bolt heads >= M5\n3. Type 3.1 NABL-Accredited MTC verifying chemical spectroscopy and proof load tests.`,
    category: 'Standards & Compliance',
    readTime: '4 min read',
    date: 'Sep 24, 2024',
    author: 'Compliance Cell',
    tags: ['BIS Certification', 'QCO', 'DPIIT', 'Make in India'],
  },
];

interface CustomerBlogScreenProps {
  onBack?: () => void;
  onNavigateToCatalog?: () => void;
}

export const CustomerBlogScreen: React.FC<CustomerBlogScreenProps> = ({
  onBack,
  onNavigateToCatalog,
}) => {
  const [posts, setPosts] = useState<BlogPost[]>(STATIC_BLOGS);
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('All');
  const [isRefreshing, setIsRefreshing] = useState(false);

  const fetchLiveBlogs = React.useCallback(async (isRefresh = false) => {
    if (isRefresh) setIsRefreshing(true);
    try {
      const res = await mobileApi.blogs.getAll();
      if (res.blogs && Array.isArray(res.blogs) && res.blogs.length > 0) {
        setPosts(res.blogs);
      }
    } catch (err) {
      console.warn('[Customer Blog] Fetch error, using fallback:', err);
    } finally {
      setIsRefreshing(false);
    }
  }, []);

  React.useEffect(() => {
    fetchLiveBlogs();
  }, [fetchLiveBlogs]);

  const categories = ['All', 'Standards & Compliance', 'Engineering & Design', 'Material Metallurgy'];

  const filteredPosts = posts.filter((post) => {
    const matchesCat = activeCategory === 'All' || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchQuery.toLowerCase()) ||
      post.tags.some((t) => t.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesSearch;
  });

  if (selectedPost) {
    return (
      <ScrollView
        contentContainerStyle={styles.container}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={() => fetchLiveBlogs(true)}
            colors={['#0052CC']}
          />
        }
      >
        <TouchableOpacity onPress={() => setSelectedPost(null)} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back to All Articles</Text>
        </TouchableOpacity>

        <View style={styles.readerCard}>
          <View style={styles.categoryPill}>
            <Text style={styles.categoryPillText}>{selectedPost.category.toUpperCase()}</Text>
          </View>
          <Text style={styles.readerTitle}>{selectedPost.title}</Text>

          <View style={styles.readerMetaRow}>
            <Text style={styles.readerMeta}>Author: {selectedPost.author}</Text>
            <Text style={styles.readerMeta}>Date: {selectedPost.date}</Text>
            <Text style={styles.readerMeta}>Read Time: {selectedPost.readTime}</Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.readerExcerpt}>{selectedPost.excerpt}</Text>

          <View style={styles.readerBody}>
            {selectedPost.content.split('\n\n').map((paragraph, idx) => (
              <Text key={idx} style={styles.readerParagraph}>
                {paragraph}
              </Text>
            ))}
          </View>

          <View style={styles.tagsRow}>
            {selectedPost.tags.map((tag) => (
              <View key={tag} style={styles.tagPill}>
                <Text style={styles.tagPillText}>#{tag}</Text>
              </View>
            ))}
          </View>

          {onNavigateToCatalog ? (
            <TouchableOpacity onPress={onNavigateToCatalog} style={styles.exploreCatalogBtn}>
              <Text style={styles.exploreCatalogBtnText}>Browse Related Fasteners in Catalog →</Text>
            </TouchableOpacity>
          ) : null}
        </View>
      </ScrollView>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {onBack ? (
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
      ) : null}

      {/* Header Banner */}
      <View style={styles.banner}>
        <View style={styles.techBadge}>
          <Text style={styles.techBadgeText}>TECHNICAL SPECIFICATIONS & STANDARDS</Text>
        </View>
        <Text style={styles.bannerTitle}>Fastener Engineering & Standards</Text>
        <Text style={styles.bannerSubtitle}>
          Expert engineering insights on DIN/ISO equivalencies, tensile grades, hydrogen embrittlement, and marine corrosion.
        </Text>
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <TextInput
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholder="Search technical guides (e.g. DIN 933, Grade 10.9, SS 316)..."
          placeholderTextColor="#94A3B8"
        />
      </View>

      {/* Category Pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingRight: 16 }}
        style={styles.catScroll}
      >
        {categories.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setActiveCategory(cat)}
            style={[styles.catPill, activeCategory === cat && styles.catPillActive]}
          >
            <Text style={[styles.catPillText, activeCategory === cat && styles.catPillTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Articles List */}
      <Text style={styles.listHeading}>
        Showing {filteredPosts.length} Technical {filteredPosts.length === 1 ? 'Article' : 'Articles'}
      </Text>

      {filteredPosts.map((post) => (
        <TouchableOpacity
          key={post.id}
          onPress={() => setSelectedPost(post)}
          activeOpacity={0.85}
        >
          <MobileCard>
            <View style={styles.postMetaRow}>
              <View style={styles.postCategoryPill}>
                <Text style={styles.postCategoryText}>{post.category}</Text>
              </View>
              <Text style={styles.postReadTime}>{post.readTime}</Text>
            </View>

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postExcerpt} numberOfLines={3}>
              {post.excerpt}
            </Text>

            <View style={styles.postFooter}>
              <Text style={styles.postAuthor}>By {post.author} · {post.date}</Text>
              <Text style={styles.readMoreText}>Read Article →</Text>
            </View>
          </MobileCard>
        </TouchableOpacity>
      ))}
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
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 18,
    marginBottom: 14,
  },
  techBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(0, 82, 204, 0.4)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  techBadgeText: {
    color: '#93C5FD',
    fontSize: 10,
    fontWeight: '800',
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
    color: '#94A3B8',
    lineHeight: 18,
  },
  searchBox: {
    marginBottom: 10,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0F172A',
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
  listHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#475569',
    marginBottom: 10,
  },
  postMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  postCategoryPill: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  postCategoryText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  postReadTime: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  postTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0F172A',
    lineHeight: 21,
    marginBottom: 6,
  },
  postExcerpt: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginBottom: 10,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
  },
  postAuthor: {
    fontSize: 11,
    color: '#94A3B8',
  },
  readMoreText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0052CC',
  },
  readerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  categoryPill: {
    alignSelf: 'flex-start',
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#0052CC',
  },
  readerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#0F172A',
    lineHeight: 25,
    marginBottom: 8,
  },
  readerMetaRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 12,
  },
  readerMeta: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  divider: {
    height: 1,
    backgroundColor: '#E2E8F0',
    marginVertical: 12,
  },
  readerExcerpt: {
    fontSize: 13,
    fontWeight: '600',
    fontStyle: 'italic',
    color: '#334155',
    lineHeight: 20,
    marginBottom: 14,
    backgroundColor: '#F8FAFC',
    padding: 10,
    borderRadius: 8,
    borderLeftWidth: 3,
    borderLeftColor: '#0052CC',
  },
  readerBody: {
    marginBottom: 16,
  },
  readerParagraph: {
    fontSize: 13,
    color: '#1E293B',
    lineHeight: 21,
    marginBottom: 12,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 16,
  },
  tagPill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  tagPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  exploreCatalogBtn: {
    backgroundColor: '#0052CC',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  exploreCatalogBtnText: {
    color: '#FFFFFF',
    fontWeight: '800',
    fontSize: 13,
  },
});

