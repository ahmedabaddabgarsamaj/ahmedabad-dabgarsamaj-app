import { BottomTabBar } from '@/components/navigation/BottomTabBar';
import { TopBar } from '@/components/navigation/TopBar';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/constants/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { getAppVersion } from '@/constants/version';
import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function AboutScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const appVersion = getAppVersion();
  const [imageModalVisible, setImageModalVisible] = useState(false);

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`).catch(() => { });
  };

  const handleWhatsApp = (phoneNumber: string) => {
    const cleanNumber = phoneNumber.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanNumber}?text=${encodeURIComponent(
      'નમસ્તે જૈનિષભાઈ, અમદાવાદ ડબગર સમાજ પરિચય પુસ્તિકા એપ બાબતે સંપર્ક કર્યો છે.'
    )}`;
    Linking.openURL(url).catch(() => { });
  };

  const handleEmail = (email: string) => {
    Linking.openURL(
      `mailto:${email}?subject=${encodeURIComponent(
        'અમદાવાદ ડબગર સમાજ એપ ફીડબેક / પૂછપરછ'
      )}`
    ).catch(() => { });
  };

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title="અમદાવાદ ડબગર સમાજ"
        showBack={true}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(user ? ('/(family)/home' as any) : ('/(auth)/login' as any));
          }
        }}
      />

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Samaj Hero Banner */}
        <Card style={styles.heroCard}>
          <View style={styles.heroContent}>
            <Image
              source={require('@/../assets/images/logo.png')}
              style={styles.heroLogo}
              resizeMode="contain"
            />
            <Text style={[styles.heroTitle, { color: theme.text }]}>
              અમદાવાદ ડબગર સમાજ
            </Text>
            <Text style={[styles.heroSubtitle, { color: theme.primary }]}>
              ડિજિટલ પરિચય પુસ્તિકા અને વંશાવલી
            </Text>
            <View style={styles.badgeRow}>
              <Badge label="એકતા • સંસ્કાર • પ્રગતિ" variant="primary" size="md" />
              <Badge label="Digital Edition 2026" variant="success" size="md" />
            </View>
          </View>
        </Card>

        {/* Samaj Introduction & Vision */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: theme.primaryLight }]}>
              <Ionicons name="people" size={20} color={theme.primary} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              સમાજ પરિચય અને ઉદ્દેશ
            </Text>
          </View>

          <Text style={[styles.bodyText, { color: theme.textSecondary }]}>
            શ્રી અમદાવાદ ડબગર સમાજ એ સંસ્કાર, પરંપરા, એકતા અને પારસ્પરિક સહયોગનું પવિત્ર પ્રતીક છે. આ ડિજિટલ પરિચય પુસ્તિકાનો મુખ્ય ઉદ્દેશ અમદાવાદ ડબગર સમાજના દરેક પરિવારને એક ડિજિટલ મંચ પર જોડવાનો, સંબંધોને વધુ મજબૂત બનાવવાનો અને આપણી નવી પેઢીને પોતાના મૂળ અને વંશાવલીથી પરિચિત કરાવવાનો છે.
          </Text>

          <View style={styles.bulletList}>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              <Text style={[styles.bulletText, { color: theme.text }]}>
                તમામ પરિવારો અને સભ્યોની એકત્રિત ડિજિટલ માહિતી
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              <Text style={[styles.bulletText, { color: theme.text }]}>
                શિક્ષણ, વ્યવસાય અને કારકિર્દીમાં પરસ્પર માર્ગદર્શન
              </Text>
            </View>
            <View style={styles.bulletItem}>
              <Ionicons name="checkmark-circle" size={16} color={theme.primary} />
              <Text style={[styles.bulletText, { color: theme.text }]}>
                આવનારી પેઢીઓ માટે સાચવેલી પારિવારિક વંશાવલી (Family Tree)
              </Text>
            </View>
          </View>

          {/* Special Thanks / આભાર વિશેષ */}
          <View style={[styles.specialThanksSection, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <View style={styles.specialThanksHeader}>
              <View style={[styles.thanksIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="heart" size={16} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.specialThanksTitle, { color: theme.text }]}>
                  આભાર વિશેષ • Special Thanks
                </Text>
                <Text style={[styles.specialThanksSub, { color: theme.textSecondary }]}>
                  સહયોગ અને આશીર્વાદ આપનાર આદરણીય મંડળો
                </Text>
              </View>
            </View>

            <View style={styles.mandalsList}>
              <View style={[styles.mandalItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.mandalBadge, { backgroundColor: theme.primaryLight }]}>
                  <Text style={[styles.mandalBadgeText, { color: theme.primary }]}>૧</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.mandalName, { color: theme.text }]}>
                    શ્રી અમદાવાદ ડબગર જ્ઞાતિ પંચ
                  </Text>
                </View>
              </View>

              <View style={[styles.mandalItem, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={[styles.mandalBadge, { backgroundColor: '#ECFDF5' }]}>
                  <Text style={[styles.mandalBadgeText, { color: '#059669' }]}>૨</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.mandalName, { color: theme.text }]}>
                    શ્રી અમદાવાદ ડબગર જ્ઞાતિ શિક્ષણ મંડળ
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </Card>

        {/* Application Core Features */}
        <Card style={styles.sectionCard}>
          <View style={styles.cardHeaderRow}>
            <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="phone-portrait" size={20} color={theme.success} />
            </View>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              એપ્લિકેશનની મુખ્ય સુવિધાઓ
            </Text>
          </View>

          <View style={styles.featureGrid}>
            <View style={[styles.featureItem, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.featureEmoji}>🌳</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>ઇન્ટરેક્ટિવ વંશાવલી</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                પરિવારના દરેક સંબંધ અને પેઢીઓનું સચિત્ર ફેમિલી ટ્રી.
              </Text>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.featureEmoji}>📖</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>સ્માર્ટ ડિરેક્ટરી</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                નામ, વિસ્તાર, શિક્ષણ કે વ્યવસાય અનુસાર સ્માર્ટ સર્ચ.
              </Text>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.featureEmoji}>📄</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>PDF, Excel & પ્રિન્ટ</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                પરિવાર કે સમગ્ર પુસ્તિકાનું સિંગલ ક્લિક PDF, Excel અને A4 પ્રિન્ટ.
              </Text>
            </View>

            <View style={[styles.featureItem, { backgroundColor: theme.backgroundElement }]}>
              <Text style={styles.featureEmoji}>🪪</Text>
              <Text style={[styles.featureTitle, { color: theme.text }]}>ડિજિટલ સ્માર્ટ કાર્ડ</Text>
              <Text style={[styles.featureDesc, { color: theme.textSecondary }]}>
                QR કોડ અને લેફ્ટ/રાઇટ સ્વાઇપ ફ્લિપ સાથેનું સત્તાવાર ઓળખપત્ર.
              </Text>
            </View>
          </View>
        </Card>

        {/* Developer & Contact Information Card */}
        <Card style={styles.devCard}>
          <View style={styles.devHeader}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setImageModalVisible(true)}
              style={styles.devAvatarContainer}
            >
              <Image
                source={require('@/../assets/images/developer.jpg')}
                style={styles.devAvatar}
                resizeMode="cover"
              />
              <View style={styles.avatarZoomBadge}>
                <Ionicons name="expand" size={11} color="#FFFFFF" />
              </View>
            </TouchableOpacity>

            <View style={styles.devDetails}>
              <Text style={styles.devBadge}>✨ Designed & Crafted by</Text>
              <Text style={[styles.devName, { color: theme.text }]}>
                Jainish Dabgar
              </Text>
              <Text style={[styles.devRole, { color: theme.primary }]}>
                Full-Stack Developer & UI/UX Designer
              </Text>
            </View>
          </View>

          {/* Acknowledgement & Recognition */}
          <View style={[styles.recognitionBox, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
            <Text style={styles.recognitionEmoji}>🎖️</Text>
            <Text style={[styles.recognitionText, { color: theme.text }]}>
              આ એપ્લિકેશનને માન્યતા આપવા બદલ <Text style={{ fontWeight: '800', color: theme.primary }}>શ્રી અમદાવાદ ડબગર જ્ઞાતિ પંચ</Text> અને <Text style={{ fontWeight: '800', color: theme.primary }}>શ્રી અમદાવાદ ડબગર જ્ઞાતિ શિક્ષણ મંડળ</Text> તથા <Text style={{ fontWeight: '800', color: theme.primary }}>સમાજનાં સર્વે જ્ઞાતિ બંધુઓનો</Text> ખૂબ ખૂબ આભાર 🙏
            </Text>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <Text style={[styles.contactSectionTitle, { color: theme.text }]}>
            Connect & Contact (સંપર્ક):
          </Text>

          <View style={styles.socialIconsContainer}>
            {/* 1st Row: 4 Icons */}
            <View style={styles.socialIconsRow}>
              {/* Direct Call */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleCall('+919773272749')}
                style={[styles.socialIconBtn, { backgroundColor: '#10B981' }]}
                accessibilityLabel="Direct Call"
              >
                <Ionicons name="call" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Direct WhatsApp */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleWhatsApp('919773272749')}
                style={[styles.socialIconBtn, { backgroundColor: '#25D366' }]}
                accessibilityLabel="WhatsApp"
              >
                <Ionicons name="logo-whatsapp" size={24} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Portfolio */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL('https://jainishdabgar.vercel.app/')}
                style={[styles.socialIconBtn, { backgroundColor: '#0284C7' }]}
                accessibilityLabel="Portfolio"
              >
                <Ionicons name="globe-outline" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* LinkedIn */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL(
                    'https://www.linkedin.com/in/jainish-dabgar-87474a320/'
                  )
                }
                style={[styles.socialIconBtn, { backgroundColor: '#0A66C2' }]}
                accessibilityLabel="LinkedIn"
              >
                <Ionicons name="logo-linkedin" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* 2nd Row: 3 Icons */}
            <View style={styles.socialIconsRow}>
              {/* GitHub */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => Linking.openURL('https://github.com/Jainish-2901')}
                style={[styles.socialIconBtn, { backgroundColor: '#24292F' }]}
                accessibilityLabel="GitHub"
              >
                <Ionicons name="logo-github" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Instagram */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() =>
                  Linking.openURL('https://www.instagram.com/dabgar_jainish_2901/')
                }
                style={[styles.socialIconBtn, { backgroundColor: '#E1306C' }]}
                accessibilityLabel="Instagram"
              >
                <Ionicons name="logo-instagram" size={22} color="#FFFFFF" />
              </TouchableOpacity>

              {/* Email */}
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={() => handleEmail('jainishdabgar2901@gmail.com')}
                style={[styles.socialIconBtn, { backgroundColor: '#EA4335' }]}
                accessibilityLabel="Email"
              >
                <Ionicons name="mail" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.noteBox, { backgroundColor: theme.backgroundElement }]}>
            <Text style={[styles.noteText, { color: theme.textSecondary }]}>
              💡 એપ્લિકેશન ડેવલપમેન્ટ, ડિઝાઇન અથવા અન્ય ટેક્નિકલ પ્રોજેક્ટ્સ માટે આપ ઉપર આપેલા કોઈપણ સોશિયલ મીડિયા કે ઈમેલ મારફતે સીધો સંપર્ક કરી શકો છો.
            </Text>
          </View>
        </Card>

        {/* Mobile App Download & Legal Links Card */}
        <Card style={styles.actionLinksCard}>
          <Text style={[styles.actionSectionTitle, { color: theme.text }]}>
            {Platform.OS === 'web'
              ? '📲 ઍપ્લિકેશન અને નીતિઓ (Downloads & Legal)'
              : '📜 નીતિઓ અને શરતો (Policies & Legal)'}
          </Text>

          {/* Download Official App Banner - Only on Web */}
          {Platform.OS === 'web' && (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => router.push('/download' as any)}
              style={[styles.downloadBannerBtn, { backgroundColor: '#059669' }]}
            >
              <View style={styles.downloadBannerIconBox}>
                <Ionicons name="cloud-download" size={24} color="#FFFFFF" />
              </View>
              <View style={styles.downloadBannerInfo}>
                <View style={styles.downloadBannerBadgeRow}>
                  <Text style={styles.downloadBannerTitle}>ઓફિશિયલ એપ ડાઉનલોડ કરો</Text>
                  <View style={styles.livePill}>
                    <Text style={styles.livePillText}>APK & iOS</Text>
                  </View>
                </View>
                <Text style={styles.downloadBannerSubtitle}>
                  Android APK અને iPhone PWA ડાયરેક્ટ ઇન્સ્ટોલ
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}

          {/* Legal Links (Privacy & Terms) */}
          <View style={styles.legalLinksGrid}>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/privacy' as any)}
              style={[
                styles.legalItemBtn,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <View style={[styles.legalIconBox, { backgroundColor: theme.primaryLight }]}>
                <Ionicons name="shield-checkmark" size={18} color={theme.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.legalItemTitle, { color: theme.text }]}>ગોપનીયતા નીતિ</Text>
                <Text style={[styles.legalItemSub, { color: theme.textSecondary }]}>
                  Privacy Policy
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => router.push('/terms' as any)}
              style={[
                styles.legalItemBtn,
                { backgroundColor: theme.backgroundElement, borderColor: theme.border },
              ]}
            >
              <View style={[styles.legalIconBox, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="document-text" size={18} color="#D97706" />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.legalItemTitle, { color: theme.text }]}>નિયમો અને શરતો</Text>
                <Text style={[styles.legalItemSub, { color: theme.textSecondary }]}>
                  Terms & Conditions
                </Text>
              </View>
              <Ionicons name="chevron-forward" size={16} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </Card>

        {/* Footer & All Rights Reserved */}
        <View style={styles.footerContainer}>
          <Text style={[styles.versionText, { color: theme.textSecondary }]}>
            અમદાવાદ ડબગર સમાજ પરિચય પુસ્તિકા • Version {appVersion}
          </Text>
          <View style={styles.footerLinksRow}>
            <TouchableOpacity onPress={() => router.push('/privacy' as any)}>
              <Text style={[styles.footerLinkText, { color: theme.primary }]}>
                Privacy Policy
              </Text>
            </TouchableOpacity>
            <Text style={{ color: theme.textSecondary }}>•</Text>
            <TouchableOpacity onPress={() => router.push('/terms' as any)}>
              <Text style={[styles.footerLinkText, { color: theme.primary }]}>
                Terms & Conditions
              </Text>
            </TouchableOpacity>
            {Platform.OS === 'web' && (
              <>
                <Text style={{ color: theme.textSecondary }}>•</Text>
                <TouchableOpacity onPress={() => router.push('/download' as any)}>
                  <Text style={[styles.footerLinkText, { color: theme.primary }]}>
                    Download App
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </View>
          <Text style={[styles.copyrightText, { color: theme.textSecondary }]}>
            © 2026 શ્રી અમદાવાદ ડબગર સમાજ. All Rights Reserved.
          </Text>
          <Text style={[styles.copyrightGujarati, { color: theme.primary }]}>
            સર્વ અધિકાર સુરક્ષિત • Made with ❤️ for the Community
          </Text>
        </View>
      </ScrollView>

      {/* Centered Image Lightbox Modal */}
      <Modal
        visible={imageModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setImageModalVisible(false)}
      >
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => setImageModalVisible(false)}
          style={styles.modalOverlay}
        >
          <TouchableOpacity
            activeOpacity={1}
            onPress={(e) => e.stopPropagation()}
            style={[
              styles.modalCard,
              { backgroundColor: theme.card, borderColor: theme.border },
            ]}
          >
            {/* Modal Header with Title & Close Button */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderLeft}>
                <Text style={[styles.modalTitleText, { color: theme.text }]}>
                  Jainish Dabgar
                </Text>
                <Text style={[styles.modalSubtitleText, { color: theme.primary }]}>
                  Full-Stack Developer & UI/UX Designer
                </Text>
              </View>

              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setImageModalVisible(false)}
                style={[styles.modalCloseBtn, { backgroundColor: theme.backgroundElement }]}
              >
                <Ionicons name="close" size={20} color={theme.text} />
              </TouchableOpacity>
            </View>

            {/* Centered Image Frame */}
            <View style={styles.modalImageWrapper}>
              <Image
                source={require('@/../assets/images/developer.jpg')}
                style={styles.modalImage}
                resizeMode="cover"
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>

      {user && <BottomTabBar activeTab="home" />}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 100,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  heroCard: {
    padding: 24,
    marginBottom: 16,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogo: {
    width: 90,
    height: 90,
    marginBottom: 12,
  },
  heroTitle: {
    fontSize: 22,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  heroSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
  },
  sectionCard: {
    padding: 16,
    marginBottom: 16,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  iconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 12,
  },
  bulletList: {
    gap: 8,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  bulletText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  specialThanksSection: {
    marginTop: 16,
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
  },
  specialThanksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  thanksIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialThanksTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  specialThanksSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  mandalsList: {
    gap: 8,
  },
  mandalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    gap: 10,
  },
  mandalBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  mandalName: {
    fontSize: 13.5,
    fontWeight: '700',
  },
  mandalRole: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  featureGrid: {
    gap: 10,
  },
  featureItem: {
    padding: 12,
    borderRadius: 12,
  },
  featureEmoji: {
    fontSize: 22,
    marginBottom: 4,
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 2,
  },
  featureDesc: {
    fontSize: 12,
    lineHeight: 16,
  },
  devCard: {
    padding: 18,
    marginBottom: 20,
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  devHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  devAvatarContainer: {
    width: 80,
    height: 80,
    borderRadius: 40,
    overflow: 'hidden',
    borderWidth: 2.5,
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  avatarZoomBadge: {
    position: 'absolute',
    bottom: 3,
    right: 3,
    backgroundColor: 'rgba(2, 132, 199, 0.95)',
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  devAvatar: {
    width: '100%',
    height: '100%',
  },
  devDetails: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  devBadge: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 4,
    textAlign: 'center',
  },
  devName: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  devRole: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  devLocation: {
    fontSize: 12,
    marginTop: 2,
    textAlign: 'center',
  },
  recognitionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginTop: 14,
    gap: 10,
  },
  recognitionEmoji: {
    fontSize: 20,
  },
  recognitionText: {
    fontSize: 12.5,
    lineHeight: 18,
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 14,
  },
  contactSectionTitle: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 10,
  },
  socialIconsContainer: {
    gap: 12,
    marginBottom: 16,
    paddingVertical: 4,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 14,
  },
  socialIconBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  noteBox: {
    padding: 10,
    borderRadius: 8,
  },
  noteText: {
    fontSize: 11,
    lineHeight: 16,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    gap: 6,
  },
  actionLinksCard: {
    padding: 16,
    marginBottom: 20,
  },
  actionSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    marginBottom: 12,
  },
  downloadBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 14,
    borderRadius: 14,
    marginBottom: 12,
    gap: 12,
  },
  downloadBannerIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  downloadBannerInfo: {
    flex: 1,
  },
  downloadBannerBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  downloadBannerTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  livePillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  downloadBannerSubtitle: {
    fontSize: 11,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  legalLinksGrid: {
    flexDirection: 'row',
    gap: 10,
  },
  legalItemBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
  },
  legalIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalItemTitle: {
    fontSize: 12,
    fontWeight: '700',
  },
  legalItemSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  versionText: {
    fontSize: 12,
    fontWeight: '600',
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 4,
  },
  footerLinkText: {
    fontSize: 12,
    fontWeight: '700',
  },
  copyrightText: {
    fontSize: 11,
    fontWeight: '500',
  },
  copyrightGujarati: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 380,
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    alignItems: 'center',
    boxShadow: '0px 10px 25px rgba(0, 0, 0, 0.3)',
    elevation: 10,
  },
  modalHeader: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 14,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitleText: {
    fontSize: 16,
    fontWeight: '800',
  },
  modalSubtitleText: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  modalImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
