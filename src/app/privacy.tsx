import { TopBar } from '@/components/navigation/TopBar';
import { Card } from '@/components/ui/Card';
import { useTheme } from '@/constants/theme';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

export default function PrivacyPolicyScreen() {
  const router = useRouter();
  const theme = useTheme();
  const { user } = useAuth();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <TopBar
        title="ગોપનીયતા નીતિ / Privacy Policy"
        showBack={true}
        onBack={() => {
          if (router.canGoBack()) {
            router.back();
          } else {
            router.replace(user ? ('/(family)/home' as any) : ('/about' as any));
          }
        }}
      />

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <Card style={styles.headerCard}>
          <View style={[styles.iconCircle, { backgroundColor: theme.primaryLight }]}>
            <Ionicons name="shield-checkmark" size={32} color={theme.primary} />
          </View>
          <Text style={[styles.title, { color: theme.text }]}>
            ગોપનીયતા નીતિ (Privacy Policy)
          </Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            અમદાવાદ ડબગર સમાજ પરિચય પુસ્તિકા • Version 1.0.7 • છેલ્લે અપડેટ: ૧૭ સપ્ટેમ્બર ૨૦૨૬ (Last Updated: 17 September 2026)
          </Text>
        </Card>

        {/* Section 1 */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="information-circle" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૧. પ્રસ્તાવના (Introduction)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            શ્રી અમદાવાદ ડબગર સમાજ પરિચય પુસ્તિકા એપ્લિકેશન અને વેબ પોર્ટલ આપણા સમાજના પરિવારો અને સભ્યો વચ્ચે પારસ્પરિક પરિચય, સંવાદિતા અને સંપર્ક સ્થાપિત કરવા માટે બનાવવામાં આવી છે. આપના વ્યક્તિગત ડેટાની સુરક્ષા અને ગોપનીયતા જાળવવી એ અમારી સર્વોચ્ચ પ્રાથમિકતા છે.
          </Text>
        </Card>

        {/* Section 2 */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="file-tray-full" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૨. અમે કઈ માહિતી એકત્રિત કરીએ છીએ? (Data We Collect)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            સમાજ ડિરેક્ટરી, ડિજિટલ સ્માર્ટ આઈડી કાર્ડ અને ફેમિલી ટ્રી યોગ્ય રીતે બનાવવા માટે નીચે મુજબની માહિતી સભ્યો દ્વારા જાતે દાખલ કરવામાં આવે છે:
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • પર્સનલ વિગતો: પૂરું નામ, જન્મ તારીખ, ઉંમર, જાતિ, બ્લડ ગ્રૂપ, જન્મ સ્થળ/વતન અને પ્રોફાઇલ ફોટો.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • સંપર્ક વિગતો: મોબાઈલ નંબર, ઈમેઈલ સરનામું, ઘર/સોસાયટીનું સરનામું, રહેઠાણનો વિસ્તાર અને પીનકોડ.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • પારિવારિક સંબંધો: પરિવારના વડા તથા સભ્યો વચ્ચેના સીધા સંબંધો (પતિ-પત્ની, પિતા-પુત્ર, માતા-પુત્રી, પુત્રવધૂ વગેરે).
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • શિક્ષણ અને કારકિર્દી: અભ્યાસ કક્ષા, ડિગ્રી/કોર્સ (B.Sc. in IT, M.Sc. in IT સહિત), પાસિંગ વર્ષ અને શૈક્ષણિક સંસ્થા.
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • વ્યવસાયની વિગત: નોકરી (ખાનગી/સરકારી), દુકાનદાર (Shop Owner), પ્રોફેશનલ, સ્વરોજગાર, વિદ્યાર્થી કે ગૃહિણીની સુવ્યવસ્થિત વિગતો.
            </Text>
          </View>
        </Card>

        {/* Section 3 */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="lock-closed" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૩. માહિતીનો ઉપયોગ અને સુરક્ષા (Data Security & Usage)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • એકત્રિત કરવામાં આવેલી માહિતીનો ઉપયોગ માત્ર અને માત્ર સમાજના સભ્યો વચ્ચે અધિકૃત પરિચય, ઇમરજન્સી રક્ત સહાય (Blood Group Search), અને સામાજિક ગતિવિધિઓ માટે જ કરવામાં આવે છે.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • અમે કોઈપણ તૃતીય પક્ષ (Third Party), માર્કેટિંગ એજન્સી કે જાહેરાત કંપનીઓને આપનો ડેટા વેચતા કે ભાડે આપતા નથી.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • સભ્યોના લૉગિન સત્રને ઉપકરણ પર સુરક્ષિત રાખવા માટે એન્ડ્રોઇડ હાર્ડવેર સિક્યોરિટી (Encrypted SecureStore) નો ઉપયોગ થાય છે, જેથી ડેટા સુરક્ષિત રહે અને યુઝરને વારંવાર લૉગિન ન કરવું પડે.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • તમામ પાસવર્ડ્સ એન્ક્રિપ્ટેડ સ્વરૂપે સ્ટોર થાય છે અને રો-લેવલ સિક્યોરિટી (Row Level Security - RLS) દ્વારા અન્ય અનધિકૃત એક્સેસથી સુરક્ષિત રાખવામાં આવે છે.
          </Text>
        </Card>

        {/* Section 4 */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="people" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૪. સભ્યોના અધિકારો અને એકાઉન્ટ ડિલીશન (User Rights & Control)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • પરિવારના વડા અથવા અધિકૃત સભ્ય ગમે ત્યારે પોતાની તેમજ પોતાના પરિવારના સભ્યોની માહિતી સુધારી (Edit) શકે છે.
          </Text>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            • જો કોઈ સભ્ય પોતાનો ડેટા કાયમ માટે હટાવવા માંગતો હોય, તો એપની પ્રોફાઇલ સ્ક્રીનમાંથી ડેન્જર ઝોન (Danger Zone) દ્વારા ડબલ કન્ફર્મેશન સાથે પોતાનું સમગ્ર પરિવાર ખાતું અને ડેટા કાયમ માટે ડિલીટ (Delete Account) કરી શકે છે.
          </Text>
        </Card>

        {/* Section 5 */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="shield" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૫. નીતિમાં સુધારા (Policy Updates)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            શ્રી અમદાવાદ ડબગર સમાજ સમિતિ જરૂરિયાત મુજબ આ ગોપનીયતા નીતિમાં સુધારો કરવાનો અધિકાર ધરાવે છે. કોઈપણ નીતિગત ફેરફાર એપ્લિકેશન તથા અધિકૃત પોર્ટલ મારફતે જાહેર કરવામાં આવશે.
          </Text>
        </Card>

        {/* Section 6: Contact & Support */}
        <Card style={styles.sectionCard}>
          <View style={styles.sectionHeaderRow}>
            <Ionicons name="mail" size={20} color={theme.primary} />
            <Text style={[styles.sectionTitle, { color: theme.text }]}>
              ૬. સંપર્ક અને સહાય (Contact & Support)
            </Text>
          </View>
          <Text style={[styles.paragraph, { color: theme.textSecondary }]}>
            ગોપનીયતા નીતિ, ડેટા સિક્યોરિટી અથવા એકાઉન્ટ સંબંધિત કોઈપણ પ્રશ્ન કે પૂછપરછ માટે આપ શ્રી અમદાવાદ ડબગર સમાજ કમિટી અથવા સત્તાવાર હેલ્પડેસ્કનો સંપર્ક કરી શકો છો.
          </Text>
          <View style={styles.bulletList}>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • સંસ્થા: શ્રી અમદાવાદ ડબગર સમાજ
            </Text>
            <Text style={[styles.bulletItem, { color: theme.text }]}>
              • સરનામું: અમદાવાદ, ગુજરાત
            </Text>
          </View>
        </Card>

        <View style={styles.footerNote}>
          <Text style={[styles.footerText, { color: theme.textMuted }]}>
            © 2026 શ્રી અમદાવાદ ડબગર સમાજ. સર્વ અધિકાર સુરક્ષિત • Version 1.0.7
          </Text>
        </View>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
    maxWidth: 760,
    width: '100%',
    alignSelf: 'center',
  },
  headerCard: {
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    borderRadius: 16,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: '800',
    textAlign: 'center',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  sectionCard: {
    padding: 18,
    marginBottom: 12,
    borderRadius: 14,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '800',
  },
  paragraph: {
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  bulletList: {
    marginTop: 4,
    gap: 6,
  },
  bulletItem: {
    fontSize: 13,
    lineHeight: 19,
  },
  contactActionsList: {
    marginTop: 8,
    gap: 8,
  },
  contactActionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 12,
  },
  contactActionIcon: {
    width: 38,
    height: 38,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  contactActionTitle: {
    fontSize: 13,
    fontWeight: '700',
  },
  contactActionSub: {
    fontSize: 11,
    fontWeight: '500',
    marginTop: 1,
  },
  footerNote: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 11,
    fontWeight: '600',
  },
});
