import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import PWAInstallButton from '@/components/navigation/PWAInstallButton';
import { useTheme } from '@/constants/theme';
import { useAuth } from '@/features/auth/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Constants from 'expo-constants';
import { getAppVersion } from '@/constants/version';
import { useRouter } from 'expo-router';
import { useRef, useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

export default function WalkthroughScreen() {
  const theme = useTheme();
  const router = useRouter();
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const scrollRef = useRef<ScrollView>(null);

  const [currentStep, setCurrentStep] = useState<1 | 2 | 3>(1);
  const [imageModalVisible, setImageModalVisible] = useState(false);
  const appVersion = getAppVersion();

  const safeBottom = Math.max(insets.bottom, 12);
  const safeTop = Math.max(insets.top, 12);

  const handleNext = () => {
    if (currentStep < 3) {
      setCurrentStep((prev) => (prev + 1) as any);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    } else {
      handleFinish();
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => (prev - 1) as any);
      scrollRef.current?.scrollTo({ y: 0, animated: true });
    }
  };

  const handleFinish = () => {
    if (!user) {
      router.replace('/(auth)/login' as any);
    } else {
      router.replace('/(family)/home' as any);
    }
  };

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
      {/* Top Header & Step Progress Bar */}
      <View
        style={[
          styles.topHeader,
          {
            backgroundColor: theme.card,
            borderBottomColor: theme.border,
            paddingTop: safeTop + 4,
          },
        ]}
      >
        <View style={styles.topHeaderRow}>
          <Image
            source={require('@/../assets/images/logo.png')}
            style={styles.headerLogo}
            resizeMode="contain"
          />
          <View style={{ flex: 1 }}>
            <Text numberOfLines={1} style={[styles.headerTitle, { color: theme.text }]}>
              અમદાવાદ ડબગર સમાજ
            </Text>
            <Text numberOfLines={1} style={[styles.headerSub, { color: theme.primary }]}>
              ડિજિટલ પરિચય પુસ્તિકા • વંશાવલી
            </Text>
          </View>
          {Platform.OS === 'web' && <PWAInstallButton />}
          <View style={[styles.stepPillBadge, { backgroundColor: theme.primaryLight }]}>
            <Text style={[styles.stepPillBadgeText, { color: theme.primary }]}>
              {currentStep} / ૩
            </Text>
          </View>
        </View>

        {/* 3 Step Indicator Tabs */}
        <View style={styles.stepsRow}>
          {[
            { step: 1, label: '૧. સમાજ પરિચય' },
            { step: 2, label: '૨. સુવિધાઓ & સંપર્ક' },
            { step: 3, label: '૩. નીતિઓ & શરૂઆત' },
          ].map((item) => {
            const isActive = currentStep === item.step;
            const isCompleted = currentStep > item.step;
            return (
              <TouchableOpacity
                key={item.step}
                activeOpacity={0.7}
                onPress={() => {
                  setCurrentStep(item.step as any);
                  scrollRef.current?.scrollTo({ y: 0, animated: true });
                }}
                style={[
                  styles.stepTabItem,
                  isActive && {
                    backgroundColor: theme.primary,
                    borderColor: theme.primary,
                  },
                  isCompleted && {
                    backgroundColor: theme.primaryLight,
                    borderColor: theme.primary,
                  },
                  !isActive && !isCompleted && {
                    backgroundColor: theme.backgroundElement,
                    borderColor: theme.border,
                  },
                ]}
              >
                <Text
                  numberOfLines={1}
                  style={[
                    styles.stepTabText,
                    {
                      color: isActive
                        ? '#FFFFFF'
                        : isCompleted
                          ? theme.primary
                          : theme.textSecondary,
                    },
                  ]}
                >
                  {item.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Main Content Area */}
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ========================================================= */}
        {/* STEP 1: Hero Banner & Samaj Introduction & Special Thanks */}
        {/* ========================================================= */}
        {currentStep === 1 && (
          <View style={styles.stepContainer}>
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
                  <Badge label="એકતા • સંસ્કાર • પ્રગતિ" variant="primary" size="sm" />
                  <Badge label="Digital Edition 2026" variant="success" size="sm" />
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
              <View
                style={[
                  styles.specialThanksSection,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
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
                  <View
                    style={[
                      styles.mandalItem,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}
                  >
                    <View style={[styles.mandalBadge, { backgroundColor: theme.primaryLight }]}>
                      <Text style={[styles.mandalBadgeText, { color: theme.primary }]}>૧</Text>
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.mandalName, { color: theme.text }]}>
                        શ્રી અમદાવાદ ડબગર જ્ઞાતિ પંચ
                      </Text>
                    </View>
                  </View>

                  <View
                    style={[
                      styles.mandalItem,
                      { backgroundColor: theme.card, borderColor: theme.border },
                    ]}
                  >
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
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 2: Application Features & Developer Card & Contact   */}
        {/* ========================================================= */}
        {currentStep === 2 && (
          <View style={styles.stepContainer}>
            {/* Application Core Features */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#ECFDF5' }]}>
                  <Ionicons name="phone-portrait" size={18} color={theme.success} />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  એપ્લિકેશનની મુખ્ય સુવિધાઓ
                </Text>
              </View>

              <View style={styles.featureGrid}>
                {/* 2:2 Matrix Row 1 */}
                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureItem,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    ]}
                  >
                    <Text style={styles.featureEmoji}>🌳</Text>
                    <Text numberOfLines={2} style={[styles.featureTitle, { color: theme.text }]}>
                      ઇન્ટરેક્ટિવ વંશાવલી
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.featureItem,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    ]}
                  >
                    <Text style={styles.featureEmoji}>📖</Text>
                    <Text numberOfLines={2} style={[styles.featureTitle, { color: theme.text }]}>
                      સ્માર્ટ ડિરેક્ટરી
                    </Text>
                  </View>
                </View>

                {/* 2:2 Matrix Row 2 */}
                <View style={styles.featureRow}>
                  <View
                    style={[
                      styles.featureItem,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    ]}
                  >
                    <Text style={styles.featureEmoji}>📄</Text>
                    <Text numberOfLines={2} style={[styles.featureTitle, { color: theme.text }]}>
                      PDF, Excel & પ્રિન્ટ
                    </Text>
                  </View>

                  <View
                    style={[
                      styles.featureItem,
                      { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                    ]}
                  >
                    <Text style={styles.featureEmoji}>🪪</Text>
                    <Text numberOfLines={2} style={[styles.featureTitle, { color: theme.text }]}>
                      ડિજિટલ સ્માર્ટ કાર્ડ
                    </Text>
                  </View>
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
              <View
                style={[
                  styles.recognitionBox,
                  { backgroundColor: theme.backgroundElement, borderColor: theme.border },
                ]}
              >
                <Text style={styles.recognitionEmoji}>🎖️</Text>
                <Text style={[styles.recognitionText, { color: theme.text }]}>
                  આ એપ્લિકેશનને માન્યતા આપવા બદલ{' '}
                  <Text style={{ fontWeight: '800', color: theme.primary }}>
                    શ્રી અમદાવાદ ડબગર જ્ઞાતિ પંચ
                  </Text>{' '}
                  અને{' '}
                  <Text style={{ fontWeight: '800', color: theme.primary }}>
                    શ્રી અમદાવાદ ડબગર જ્ઞાતિ શિક્ષણ મંડળ
                  </Text>{' '}
                  તથા{' '}
                  <Text style={{ fontWeight: '800', color: theme.primary }}>
                    સમાજનાં સર્વે જ્ઞાતિ બંધુઓનો
                  </Text>{' '}
                  ખૂબ ખૂબ આભાર 🙏
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
                    <Ionicons name="call" size={19} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Direct WhatsApp */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleWhatsApp('919773272749')}
                    style={[styles.socialIconBtn, { backgroundColor: '#25D366' }]}
                    accessibilityLabel="WhatsApp"
                  >
                    <Ionicons name="logo-whatsapp" size={20} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Portfolio */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => Linking.openURL('https://jainishdabgar.vercel.app/')}
                    style={[styles.socialIconBtn, { backgroundColor: '#0284C7' }]}
                    accessibilityLabel="Portfolio"
                  >
                    <Ionicons name="globe-outline" size={19} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* LinkedIn */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() =>
                      Linking.openURL('https://www.linkedin.com/in/jainish-dabgar-87474a320/')
                    }
                    style={[styles.socialIconBtn, { backgroundColor: '#0A66C2' }]}
                    accessibilityLabel="LinkedIn"
                  >
                    <Ionicons name="logo-linkedin" size={19} color="#FFFFFF" />
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
                    <Ionicons name="logo-github" size={19} color="#FFFFFF" />
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
                    <Ionicons name="logo-instagram" size={19} color="#FFFFFF" />
                  </TouchableOpacity>

                  {/* Email */}
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => handleEmail('jainishdabgar2901@gmail.com')}
                    style={[styles.socialIconBtn, { backgroundColor: '#EA4335' }]}
                    accessibilityLabel="Email"
                  >
                    <Ionicons name="mail" size={19} color="#FFFFFF" />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={[styles.noteBox, { backgroundColor: theme.backgroundElement }]}>
                <Text style={[styles.noteText, { color: theme.textSecondary }]}>
                  💡 એપ્લિકેશન ડેવલપમેન્ટ, ડિઝાઇન અથવા અન્ય ટેક્નિકલ પ્રોજેક્ટ્સ માટે આપ ઉપર આપેલા કોઈપણ સોશિયલ મીડિયા કે ઈમેલ મારફતે સીધો સંપર્ક કરી શકો છો.
                </Text>
              </View>
            </Card>
          </View>
        )}

        {/* ========================================================= */}
        {/* STEP 3: Legal Policies, Web Download & Get Started        */}
        {/* ========================================================= */}
        {currentStep === 3 && (
          <View style={styles.stepContainer}>
            {/* 4th: Community Motto / Inspiration */}
            <View
              style={[
                styles.mottoCard,
                { backgroundColor: theme.primaryLight, borderColor: theme.primary },
              ]}
            >
              <Text style={styles.mottoEmoji}>✨</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.mottoTitle, { color: theme.primary }]}>
                  સંગઠન એ જ આપણી સાચી શક્તિ છે
                </Text>
                <Text style={[styles.mottoSub, { color: theme.textSecondary }]}>
                  આપણો સમાજ • આપણી એકતા • આપણું ગૌરવ
                </Text>
              </View>
            </View>

            {/* 2nd: 3 Easy Steps to Get Started */}
            <Card style={styles.sectionCard}>
              <View style={styles.cardHeaderRow}>
                <View style={[styles.iconBox, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="rocket-outline" size={18} color="#D97706" />
                </View>
                <Text style={[styles.sectionTitle, { color: theme.text }]}>
                  પ્રારંભ કરવાના ૩ સરળ પગલાં
                </Text>
              </View>

              <View style={styles.stepsGuideList}>
                <View style={[styles.stepGuideItem, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.stepGuideBadge, { backgroundColor: theme.primaryLight }]}>
                    <Text style={[styles.stepGuideBadgeText, { color: theme.primary }]}>૧</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepGuideTitle, { color: theme.text }]}>
                      મોબાઈલથી લોગિન કરો
                    </Text>
                    <Text style={[styles.stepGuideDesc, { color: theme.textSecondary }]}>
                      આપના રજિસ્ટર્ડ મોબાઈલ નંબર અને પાસવર્ડ મારફતે સુરક્ષિત પ્રવેશ કરો.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepGuideItem, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.stepGuideBadge, { backgroundColor: '#ECFDF5' }]}>
                    <Text style={[styles.stepGuideBadgeText, { color: '#059669' }]}>૨</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepGuideTitle, { color: theme.text }]}>
                      પરિવારની વિગતો ચકાસો
                    </Text>
                    <Text style={[styles.stepGuideDesc, { color: theme.textSecondary }]}>
                      પોતાના કુટુંબ અને સભ્યોની માહિતી ચકાસો અથવા જરૂર મુજબ અપડેટ કરો.
                    </Text>
                  </View>
                </View>

                <View style={[styles.stepGuideItem, { backgroundColor: theme.backgroundElement }]}>
                  <View style={[styles.stepGuideBadge, { backgroundColor: '#FEF3C7' }]}>
                    <Text style={[styles.stepGuideBadgeText, { color: '#D97706' }]}>૩</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.stepGuideTitle, { color: theme.text }]}>
                      સ્માર્ટ કાર્ડ & વંશાવલી મેળવો
                    </Text>
                    <Text style={[styles.stepGuideDesc, { color: theme.textSecondary }]}>
                      ડિજિટલ સ્માર્ટ ઓળખપત્ર, સમગ્ર પુસ્તિકા અને ફેમિલી ટ્રીનો લાભ લો.
                    </Text>
                  </View>
                </View>
              </View>
            </Card>

            {/* 1st: Data Privacy & Security Guarantee Card */}
            <View
              style={[
                styles.securityCard,
                { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' },
              ]}
            >
              <View style={styles.securityHeader}>
                <Ionicons name="shield-checkmark" size={18} color="#059669" />
                <Text style={styles.securityTitle}>
                  ૧૦૦% પ્રમાણિત અને સુરક્ષિત ડેટા
                </Text>
              </View>
              <Text style={styles.securityDesc}>
                આ પરિચય પુસ્તિકામાં પરિવારનો ડેટા સંપૂર્ણ એન્ક્રિપ્ટેડ અને સુરક્ષિત છે. માત્ર અમદાવાદ ડબગર જ્ઞાતિના અધિકૃત સભ્યો જ પોતાની પ્રોફાઇલ એક્સેસ કરી શકે છે.
              </Text>
            </View>

            {/* Legal Links & Download Banner */}
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
                    <Ionicons name="cloud-download" size={22} color="#FFFFFF" />
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
                  <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
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
                    <Ionicons name="shield-checkmark" size={16} color={theme.primary} />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.legalItemTitle, { color: theme.text }]}>
                      ગોપનીયતા નીતિ
                    </Text>
                    <Text style={[styles.legalItemSub, { color: theme.textSecondary }]}>
                      Privacy Policy
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
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
                    <Ionicons name="document-text" size={16} color="#D97706" />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.legalItemTitle, { color: theme.text }]}>
                      નિયમો અને શરતો
                    </Text>
                    <Text style={[styles.legalItemSub, { color: theme.textSecondary }]}>
                      Terms & Conditions
                    </Text>
                  </View>
                  <Ionicons name="chevron-forward" size={14} color={theme.textSecondary} />
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
          </View>
        )}
      </ScrollView>

      {/* Sticky Bottom Navigation Bar (Previous, Next, Finish) */}
      <View
        style={[
          styles.bottomBar,
          {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            paddingBottom: safeBottom,
          },
        ]}
      >
        <View style={styles.bottomBarButtonsRow}>
          {/* Previous Button (Visible on Step 2 & 3) */}
          {currentStep > 1 ? (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={handlePrev}
              style={[
                styles.prevBtn,
                {
                  backgroundColor: theme.backgroundElement,
                  borderColor: theme.border,
                },
              ]}
            >
              <Ionicons name="arrow-back" size={18} color={theme.text} />
              <Text style={[styles.prevBtnText, { color: theme.text }]}>પાછળ (Previous)</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flex: 1 }} />
          )}

          {/* Next or Finish Button */}
          {currentStep < 3 ? (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={handleNext}
              style={[styles.nextBtn, { backgroundColor: theme.primary }]}
            >
              <Text style={styles.nextBtnText}>આગળ વધો (Next)</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={handleFinish}
              style={[styles.finishBtn, { backgroundColor: '#16A34A' }]}
            >
              <Text style={styles.finishBtnText}>પ્રવેશ કરો (Get Started)</Text>
              <Ionicons name="checkmark-circle" size={20} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Centered Image Lightbox Modal for Developer Photo */}
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
            style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}
          >
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topHeader: {
    borderBottomWidth: 1,
    paddingHorizontal: 14,
    paddingBottom: 8,
    elevation: 3,
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.06)',
    zIndex: 10,
  },
  topHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  headerLogo: {
    width: 32,
    height: 32,
    borderRadius: 7,
  },
  headerTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  headerSub: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  stepPillBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  stepPillBadgeText: {
    fontSize: 11,
    fontWeight: '800',
  },
  stepsRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'space-between',
  },
  stepTabItem: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 4,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepTabText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 12,
    paddingBottom: 20,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  stepContainer: {
    width: '100%',
  },
  heroCard: {
    padding: 18,
    marginBottom: 12,
    alignItems: 'center',
  },
  heroContent: {
    alignItems: 'center',
  },
  heroLogo: {
    width: 72,
    height: 72,
    marginBottom: 8,
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 3,
  },
  heroSubtitle: {
    fontSize: 12.5,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    justifyContent: 'center',
  },
  sectionCard: {
    padding: 12,
    marginBottom: 12,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  iconBox: {
    width: 30,
    height: 30,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  bodyText: {
    fontSize: 12,
    lineHeight: 18,
    marginBottom: 10,
  },
  bulletList: {
    gap: 6,
  },
  bulletItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  bulletText: {
    fontSize: 12,
    fontWeight: '600',
    flex: 1,
  },
  specialThanksSection: {
    marginTop: 12,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
  },
  specialThanksHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  thanksIconCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  specialThanksTitle: {
    fontSize: 12.5,
    fontWeight: '800',
  },
  specialThanksSub: {
    fontSize: 10,
    fontWeight: '500',
    marginTop: 1,
  },
  mandalsList: {
    gap: 6,
  },
  mandalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  mandalBadge: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mandalBadgeText: {
    fontSize: 10.5,
    fontWeight: '800',
  },
  mandalName: {
    fontSize: 12,
    fontWeight: '700',
  },
  featureGrid: {
    gap: 8,
  },
  featureRow: {
    flexDirection: 'row',
    gap: 8,
  },
  featureItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 8,
    borderWidth: 1,
    gap: 6,
  },
  featureEmoji: {
    fontSize: 18,
  },
  featureTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    flex: 1,
    lineHeight: 15.5,
  },
  devCard: {
    padding: 14,
    marginBottom: 14,
    borderWidth: 1.5,
    borderColor: '#0284C7',
  },
  devHeader: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  devAvatarContainer: {
    width: 68,
    height: 68,
    borderRadius: 34,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: '#0284C7',
    backgroundColor: '#F0F9FF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    alignSelf: 'center',
  },
  avatarZoomBadge: {
    position: 'absolute',
    bottom: 2,
    right: 2,
    backgroundColor: 'rgba(2, 132, 199, 0.95)',
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
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
    fontSize: 10,
    fontWeight: '700',
    color: '#0284C7',
    marginBottom: 2,
    textAlign: 'center',
  },
  devName: {
    fontSize: 15.5,
    fontWeight: '800',
    textAlign: 'center',
  },
  devRole: {
    fontSize: 11.5,
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  recognitionBox: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    marginTop: 10,
    gap: 8,
  },
  recognitionEmoji: {
    fontSize: 18,
  },
  recognitionText: {
    fontSize: 11.5,
    lineHeight: 16.5,
    flex: 1,
    fontWeight: '500',
  },
  divider: {
    height: 1,
    marginVertical: 12,
  },
  contactSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 8,
  },
  socialIconsContainer: {
    gap: 10,
    marginBottom: 12,
    paddingVertical: 2,
  },
  socialIconsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  socialIconBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.15)',
    elevation: 3,
  },
  noteBox: {
    padding: 8,
    borderRadius: 6,
  },
  noteText: {
    fontSize: 10,
    lineHeight: 14.5,
  },
  mottoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginBottom: 12,
    gap: 10,
  },
  mottoEmoji: {
    fontSize: 22,
  },
  mottoTitle: {
    fontSize: 13,
    fontWeight: '800',
    lineHeight: 18,
  },
  mottoSub: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 2,
  },
  stepsGuideList: {
    gap: 8,
  },
  stepGuideItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    gap: 10,
  },
  stepGuideBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepGuideBadgeText: {
    fontSize: 12,
    fontWeight: '800',
  },
  stepGuideTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 3,
  },
  stepGuideDesc: {
    fontSize: 11,
    lineHeight: 16,
  },
  securityCard: {
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 12,
  },
  securityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 6,
  },
  securityTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#065F46',
  },
  securityDesc: {
    fontSize: 11,
    color: '#047857',
    lineHeight: 16,
    fontWeight: '500',
  },
  actionLinksCard: {
    padding: 12,
    marginBottom: 14,
  },
  actionSectionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    marginBottom: 10,
  },
  downloadBannerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 10,
    marginBottom: 10,
    gap: 10,
  },
  downloadBannerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 8,
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
    marginBottom: 1,
  },
  downloadBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  livePill: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
  },
  livePillText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  downloadBannerSubtitle: {
    fontSize: 10,
    fontWeight: '500',
    color: 'rgba(255, 255, 255, 0.9)',
  },
  legalLinksGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  legalItemBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    gap: 8,
  },
  legalIconBox: {
    width: 28,
    height: 28,
    borderRadius: 6,
    alignItems: 'center',
    justifyContent: 'center',
  },
  legalItemTitle: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  legalItemSub: {
    fontSize: 9.5,
    fontWeight: '500',
    marginTop: 1,
  },
  footerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    gap: 4,
  },
  versionText: {
    fontSize: 11,
    fontWeight: '600',
  },
  footerLinksRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginVertical: 2,
  },
  footerLinkText: {
    fontSize: 11,
    fontWeight: '700',
  },
  copyrightText: {
    fontSize: 10,
    fontWeight: '500',
  },
  copyrightGujarati: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  bottomBar: {
    borderTopWidth: 1,
    paddingHorizontal: 14,
    paddingTop: 8,
    boxShadow: '0px -2px 10px rgba(0, 0, 0, 0.08)',
    elevation: 8,
  },
  bottomBarButtonsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  prevBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    borderWidth: 1,
    gap: 4,
  },
  prevBtnText: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  nextBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    gap: 4,
    elevation: 2,
  },
  nextBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  finishBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 42,
    borderRadius: 10,
    gap: 6,
    elevation: 3,
  },
  finishBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.75)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 16,
    padding: 14,
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
    marginBottom: 10,
  },
  modalHeaderLeft: {
    flex: 1,
  },
  modalTitleText: {
    fontSize: 14.5,
    fontWeight: '800',
  },
  modalSubtitleText: {
    fontSize: 10.5,
    fontWeight: '600',
    marginTop: 1,
  },
  modalCloseBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  modalImageWrapper: {
    width: '100%',
    aspectRatio: 1,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#000000',
  },
  modalImage: {
    width: '100%',
    height: '100%',
  },
});
