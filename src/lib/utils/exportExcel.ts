import * as XLSX from 'xlsx';
import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';
import { supabase, isSupabaseConfigured } from '@/lib/supabase/client';
import { ExportDirectoryFamilyItem } from '@/lib/utils/exportPdf';
import { FamilyMember } from '@/types/database';

function isDummyDOB(dobString?: string | null): boolean {
  if (!dobString || typeof dobString !== 'string') return true;
  const trimmed = dobString.trim();
  return (
    trimmed === '' ||
    trimmed === '1900-01-01' ||
    trimmed === '01-01-1900' ||
    trimmed.startsWith('1900-01-01')
  );
}

function parseDate(dateString?: string | null): Date | null {
  if (!dateString || typeof dateString !== 'string') return null;
  const trimmed = dateString.trim();
  if (isDummyDOB(trimmed)) return null;

  // Match DD-MM-YYYY or DD/MM/YYYY
  const ddmmyyyyMatch = trimmed.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (ddmmyyyyMatch) {
    const day = parseInt(ddmmyyyyMatch[1], 10);
    const month = parseInt(ddmmyyyyMatch[2], 10) - 1;
    const year = parseInt(ddmmyyyyMatch[3], 10);
    const d = new Date(year, month, day);
    if (!isNaN(d.getTime())) return d;
  }

  // Match 4-digit year e.g. "1990" or "2017"
  const yyyyMatch = trimmed.match(/^(\d{4})$/);
  if (yyyyMatch) {
    const year = parseInt(yyyyMatch[1], 10);
    return new Date(year, 0, 1);
  }

  // Fallback to standard ISO / YYYY-MM-DD
  const standardDate = new Date(trimmed);
  if (!isNaN(standardDate.getTime())) {
    return standardDate;
  }

  return null;
}

// Helper to calculate age from DOB (or age at demise for deceased members)
function calculateAge(dobString?: string | null, deceasedDateString?: string | null): number | string {
  const birthDate = parseDate(dobString);
  if (!birthDate) return '';

  const endDate = deceasedDateString ? parseDate(deceasedDateString) : new Date();
  if (!endDate) return '';

  let age = endDate.getFullYear() - birthDate.getFullYear();
  const m = endDate.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && endDate.getDate() < birthDate.getDate())) {
    age--;
  }
  return age >= 0 ? age : '';
}

// Helper to format relation nicely
function formatRelation(relation?: string | null): string {
  if (!relation) return '';
  const map: Record<string, string> = {
    FAMILY_HEAD: 'પરિવારના વડા (Head)',
    WIFE: 'પત્ની (Wife)',
    HUSBAND: 'પતિ (Husband)',
    SON: 'પુત્ર (Son)',
    DAUGHTER: 'પુત્રી (Daughter)',
    SON_WIFE: 'પુત્રવધૂ (Daughter-in-law)',
    DAUGHTER_IN_LAW: 'પુત્રવધૂ (Daughter-in-law)',
    DAUGHTER_HUSBAND: 'જમાઈ (Son-in-law)',
    SON_IN_LAW: 'જમાઈ (Son-in-law)',
    FATHER: 'પિતા (Father)',
    MOTHER: 'માતા (Mother)',
    BROTHER: 'ભાઈ (Brother)',
    BROTHER_WIFE: 'ભાભી (Sister-in-law)',
    SISTER: 'બહેન (Sister)',
    SISTER_HUSBAND: 'બનેવી (Brother-in-law)',
    GRANDFATHER: 'દાદા (Grandfather)',
    GRANDMOTHER: 'દાદી (Grandmother)',
    GRANDSON: 'પૌત્ર (Grandson)',
    GRANDDAUGHTER: 'પૌત્રી (Granddaughter)',
    FATHER_BROTHER: 'કાકા (Paternal Uncle)',
    PATERNAL_UNCLE: 'કાકા (Paternal Uncle)',
    PATERNAL_AUNT: 'કાકી (Paternal Aunt)',
    MOTHER_BROTHER: 'મામા (Maternal Uncle)',
    MATERNAL_UNCLE: 'મામા (Maternal Uncle)',
    MATERNAL_AUNT: 'મામી (Maternal Aunt)',
    FATHER_S_SISTER: 'ફઈ (Paternal Aunt)',
    MOTHER_S_SISTER: 'માસી (Maternal Aunt)',
    OTHER: 'અન્ય (Other)',
  };
  return map[relation] || relation;
}

function formatOccupationType(occCode?: string | null): string {
  if (!occCode) return '';
  const map: Record<string, string> = {
    STUDENT: 'વિદ્યાર્થી (Student)',
    EMPLOYEE: 'નોકરી (Employee)',
    BUSINESS_OWNER: 'વેપાર (Business Owner)',
    SHOP_OWNER: 'દુકાનદાર (Shop Owner)',
    PROFESSIONAL: 'પ્રોફેશનલ (Doctor/CA/Lawyer)',
    SELF_EMPLOYED: 'સ્વરોજગાર (Self Employed)',
    FREELANCER: 'ફ્રીલાન્સર (Freelancer)',
    FARMER: 'ખેડૂત (Farmer)',
    HOMEMAKER: 'ગૃહિણી (Homemaker)',
    RETIRED: 'નિવૃત્ત (Retired)',
    UNEMPLOYED: 'નોકરીની શોધમાં (Job Seeking)',
    OTHER: 'અન્ય (Other)',
  };
  return map[occCode] || occCode;
}

function extractOccupationInfo(m: FamilyMember, primaryOcc: any = {}) {
  const occType = formatOccupationType(primaryOcc.occupation_type || m.occupation_type || '');
  const details = m.occupation_details || primaryOcc.details || {};

  const orgName =
    primaryOcc.organization_name ||
    primaryOcc.business_name ||
    details.company_name ||
    details.workplace_or_firm ||
    details.business_name ||
    details.shop_name ||
    details.practice_name ||
    details.school_or_college ||
    details.work_description ||
    details.specialization ||
    details.previous_organization ||
    '';

  const desig =
    primaryOcc.designation ||
    details.occupation_name ||
    details.designation ||
    details.profession ||
    details.current_year_or_std ||
    '';

  const businessType =
    primaryOcc.business_type ||
    details.business_type ||
    details.shop_type ||
    details.notes ||
    details.details ||
    '';

  const workLoc =
    primaryOcc.work_location ||
    details.work_location ||
    details.business_location ||
    details.shop_location ||
    details.village_or_taluka ||
    '';

  const exp =
    primaryOcc.experience_years ||
    details.experience_years ||
    '';

  const notes = details.notes || details.details || '';

  return { occType, orgName, desig, businessType, workLoc, exp, notes };
}

function formatResidence(resType?: string | null): string {
  if (resType === 'SAME_AS_FAMILY') return 'પરિવાર સાથે (With Family)';
  if (resType === 'SEPARATE') return 'અલગ રહેઠાણ (Separate)';
  return resType || '';
}

function makeHyperlink(url?: string | null, label?: string) {
  if (!url || typeof url !== 'string' || !url.trim()) return '';
  const cleanUrl = url.trim();
  if (!cleanUrl.startsWith('http://') && !cleanUrl.startsWith('https://')) {
    return '';
  }
  const safeLabel = label || 'લિંક ખોલો (Open Link)';
  const escapedUrl = cleanUrl.replace(/"/g, '""');
  const escapedLabel = safeLabel.replace(/"/g, '""');
  return {
    t: 's',
    v: safeLabel,
    f: `HYPERLINK("${escapedUrl}", "${escapedLabel}")`,
    l: { Target: cleanUrl, Tooltip: safeLabel },
  };
}

async function saveAndShareWorkbook(wb: XLSX.WorkBook, filename: string): Promise<void> {
  if (Platform.OS === 'web') {
    XLSX.writeFile(wb, filename);
    return;
  }

  const base64 = XLSX.write(wb, { type: 'base64', bookType: 'xlsx' });
  const baseDir = FileSystem.cacheDirectory || FileSystem.documentDirectory;
  const targetUri = `${baseDir}${filename}`;

  await FileSystem.writeAsStringAsync(targetUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const isSharingAvailable = await Sharing.isAvailableAsync();
  if (isSharingAvailable) {
    await Sharing.shareAsync(targetUri, {
      mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      dialogTitle: filename,
      UTI: 'com.microsoft.excel.xlsx',
    });
  } else {
    Alert.alert('Excel Exported', `Excel file saved successfully at:\n${targetUri}`);
  }
}

/**
 * Export Full Community Master Directory to Excel (.xlsx) with 5 Formatted Sheets
 * Exactly matching the automated backup workbook structure.
 */
export async function exportCommunityDirectoryAsExcel(
  _fallbackFamilies?: ExportDirectoryFamilyItem[]
): Promise<void> {
  try {
    let families: any[] = [];
    let members: any[] = [];
    let educations: any[] = [];
    let occupations: any[] = [];
    let areas: any[] = [];
    let profiles: any[] = [];

    if (isSupabaseConfigured) {
      const [famRes, memRes, eduRes, occRes, areaRes, profRes] = await Promise.all([
        supabase.from('families').select('*').order('family_code', { ascending: true }),
        supabase.from('family_members').select('*').order('created_at', { ascending: true }),
        supabase.from('education_records').select('*'),
        supabase.from('occupation_records').select('*'),
        supabase.from('areas').select('*'),
        supabase.from('profiles').select('*'),
      ]);

      families = famRes.data || [];
      members = memRes.data || [];
      educations = eduRes.data || [];
      occupations = occRes.data || [];
      areas = areaRes.data || [];
      profiles = profRes.data || [];
    } else if (_fallbackFamilies && _fallbackFamilies.length > 0) {
      families = _fallbackFamilies;
      members = _fallbackFamilies.flatMap((f) => f.members || []);
    }

    const areaMap = new Map(areas.map((a) => [a.id, a.name]));
    const profileMap = new Map(profiles.map((p) => [p.auth_user_id, p]));

    const eduMap = new Map<string, any[]>();
    educations.forEach((e) => {
      if (!eduMap.has(e.family_member_id)) eduMap.set(e.family_member_id, []);
      eduMap.get(e.family_member_id)!.push(e);
    });

    const occMap = new Map<string, any[]>();
    occupations.forEach((o) => {
      if (!occMap.has(o.family_member_id)) occMap.set(o.family_member_id, []);
      occMap.get(o.family_member_id)!.push(o);
    });

    const membersByFamily = new Map<string, any[]>();
    members.forEach((m) => {
      if (!membersByFamily.has(m.family_id)) membersByFamily.set(m.family_id, []);
      membersByFamily.get(m.family_id)!.push(m);
    });

    function getMemberEmail(m: any, fam: any): string {
      if (m?.email && m.email.trim()) return m.email.trim();
      if (m?.occupation_details?.email && m.occupation_details.email.trim())
        return m.occupation_details.email.trim();
      if (fam?.head_user_id && (m?.relation === 'FAMILY_HEAD' || !m)) {
        const prof = profileMap.get(fam.head_user_id);
        if (prof?.email) return prof.email.trim();
      }
      return '';
    }

    // SHEET 1: સમાજ પુસ્તિકા (Booklet - Family-wise)
    const bookletRows: any[][] = [[
      'પરિવાર કોડ', 'સંબંધ / હોદ્દો', 'સભ્યનું પૂરું નામ', 'જાતિ (Gender)', 'જન્મ તારીખ (DOB)', 'ઉંમર (Age)',
      'બ્લડ ગ્રુપ', 'મૂળ વતન / જન્મસ્થળ', 'મોબાઈલ નંબર', 'ઈમેલ એડ્રેસ', 'શિક્ષણ ડિગ્રી / ધોરણ', 'શાળા / કોલેજનું નામ',
      'અભ્યાસ સ્થિતિ', 'વ્યવસાય પ્રકાર', 'કંપની / પેઢીનું નામ', 'હોદ્દો / પદ', 'કામકાજનું સ્થળ', 'અનુભવ (વર્ષ)',
      'રહેઠાણ પ્રકાર', 'ઘરનું સરનામું', 'શહેર', 'પીનકોડ', 'અલગ સરનામું (જો હોય તો)', 'હયાત / સ્વર્ગસ્થ',
      'સ્વર્ગસ્થ તારીખ', 'એડિટ પરવાનગી', 'સભ્યનો ફોટો (Member Photo)', 'ડિજિટલ કાર્ડ (Digital Card)'
    ]];

    families.forEach((fam) => {
      const famMembers = membersByFamily.get(fam.id) || [];
      famMembers.sort((a, b) => {
        if (a.relation === 'FAMILY_HEAD') return -1;
        if (b.relation === 'FAMILY_HEAD') return 1;
        if (a.relation === 'WIFE' || a.relation === 'HUSBAND') return -1;
        if (b.relation === 'WIFE' || b.relation === 'HUSBAND') return 1;
        return 0;
      });

      const cardUrl = fam.family_code ? `https://ahmedabaddabgarsamaj.vercel.app/family-card?code=${fam.family_code}` : '';

      famMembers.forEach((m) => {
        const edus = eduMap.get(m.id) || [];
        const occs = occMap.get(m.id) || [];
        const primaryEdu = edus[0] || {};
        const primaryOcc = occs[0] || {};
        const { occType, orgName, desig, workLoc, exp } = extractOccupationInfo(m, primaryOcc);
        const rawCourse = primaryEdu.course_or_standard || (primaryEdu.education_level ? `${primaryEdu.education_level} - ${primaryEdu.course_or_standard || ''}` : '') || '';
        const course = primaryEdu.current_year && rawCourse ? `${rawCourse} (${primaryEdu.current_year})` : rawCourse;
        const inst = primaryEdu.institution || m.occupation_details?.school_or_college || '';
        const eduStat = primaryEdu.education_status || m.education_status || '';
        const memberEmail = getMemberEmail(m, fam);

        const sepAddr = m.residence_type === 'SEPARATE'
          ? [m.separate_address, m.separate_city, m.separate_pincode].filter(Boolean).join(', ')
          : '';

        const isMemDeceased = m.is_deceased === true || m.status === 'DECEASED' || m.occupation_details?.is_deceased === true;
        const memberDemiseDate = isMemDeceased ? (m.deceased_date || m.occupation_details?.deceased_date) : null;
        const cardLink = (!isMemDeceased && cardUrl) ? makeHyperlink(cardUrl, 'કાર્ડ જુઓ (View Card)') : '';
        const photoLink = makeHyperlink(m.photo_url, 'ફોટો જુઓ (View Photo)');

        bookletRows.push([
          fam.family_code, formatRelation(m.relation), m.name, m.gender || '', m.dob || '', calculateAge(m.dob, memberDemiseDate),
          m.blood_group || '', m.birth_place || '', m.mobile || '', memberEmail, course, inst, eduStat,
          occType, orgName, desig, workLoc, exp,
          formatResidence(m.residence_type), fam.address, fam.city, fam.pincode, sepAddr,
          isMemDeceased ? 'સ્વર્ગસ્થ' : 'હયાત', memberDemiseDate || '', m.can_edit_family ? 'હા (Yes)' : 'ના (No)',
          photoLink,
          cardLink
        ]);
      });

      bookletRows.push(new Array(28).fill(''));
    });

    const isDeceased = (m: any) => m.is_deceased === true || m.status === 'DECEASED' || m.occupation_details?.is_deceased === true;
    const livingMembers = members.filter((m) => !isDeceased(m));
    const lateMembers = members.filter((m) => isDeceased(m));

    // SHEET 2: પરિવારોની યાદી (Families Master)
    const familyRows: any[][] = [[
      'ક્રમ (No.)', 'પરિવાર કોડ (Family Code)', 'મુખ્ય વડીલનું નામ (Head Name)', 'વડાનો મોબાઈલ (Head Mobile)',
      'વડાનું ઈમેલ (Head Email)', 'હયાત સભ્યો (Living)', 'સ્વર્ગસ્થ સભ્યો (Late)', 'કુલ સભ્યો (Total)', 'ઘરનું સરનામું (Address)', 'વિસ્તાર (Area)',
      'શહેર (City)', 'રાજ્ય (State)', 'પીનકોડ (Pincode)', 'સ્ટેટસ (Status)', 'નોંધણી તારીખ (Registered At)',
      'વડાનો ફોટો (Head Photo)', 'ડિજિટલ કાર્ડ (Digital Card)'
    ]];

    families.forEach((fam, idx) => {
      const famMembers = membersByFamily.get(fam.id) || [];
      const famLiving = famMembers.filter((m) => !isDeceased(m));
      const famLate = famMembers.filter((m) => isDeceased(m));
      const head = famLiving.find((m) => m.relation === 'FAMILY_HEAD') || famMembers.find((m) => m.relation === 'FAMILY_HEAD') || famMembers[0] || {};
      const areaName = fam.area_id ? (areaMap.get(fam.area_id) || '') : '';
      const regDate = fam.created_at ? new Date(fam.created_at).toLocaleDateString('en-IN') : '';
      const headEmail = getMemberEmail(head, fam);
      const cardUrl = fam.family_code ? `https://ahmedabaddabgarsamaj.vercel.app/family-card?code=${fam.family_code}` : '';

      familyRows.push([
        idx + 1, fam.family_code, head.name || 'N/A', head.mobile || '', headEmail,
        famLiving.length, famLate.length, famMembers.length, fam.address, areaName, fam.city, fam.state, fam.pincode, fam.status, regDate,
        makeHyperlink(head.photo_url, 'ફોટો જુઓ (View Photo)'),
        makeHyperlink(cardUrl, 'કાર્ડ જુઓ (View Card)')
      ]);
    });

    // SHEET 3: હયાત સભ્યો માસ્ટર (Living Members Master - Without Late Members)
    const livingMemberRows: any[][] = [[
      'ક્રમ', 'પરિવાર કોડ', 'સભ્યનું નામ', 'વડીલ સાથે સંબંધ', 'જાતિ', 'જન્મ તારીખ', 'ઉંમર', 'બ્લડ ગ્રુપ',
      'મૂળ વતન', 'મોબાઈલ નંબર', 'ઈમેલ', 'શિક્ષણ સ્તર', 'કોર્સ / ધોરણ', 'સંસ્થા / કોલેજ', 'અભ્યાસ સ્થિતિ',
      'પાસિંગ વર્ષ', 'વ્યવસાય પ્રકાર', 'પેઢી / કંપની / સંસ્થા', 'હોદ્દો / પદ', 'ધંધાનો પ્રકાર', 'કામનું સ્થળ',
      'અનુભવ (વર્ષ)', 'પરિવારનું સરનામું', 'શહેર', 'પીનકોડ', 'રહેઠાણ પ્રકાર', 'અલગ સરનામું', 'નોંધણી તારીખ',
      'સભ્યનો ફોટો (Member Photo)', 'ડિજિટલ કાર્ડ (Digital Card)'
    ]];

    livingMembers.forEach((m, idx) => {
      const fam = families.find((f) => f.id === m.family_id) || {};
      const edus = eduMap.get(m.id) || [];
      const occs = occMap.get(m.id) || [];
      const primaryEdu = edus[0] || {};
      const primaryOcc = occs[0] || {};

      const { occType, orgName, desig, businessType, workLoc, exp } = extractOccupationInfo(m, primaryOcc);
      const regDate = m.created_at ? new Date(m.created_at).toLocaleDateString('en-IN') : '';
      const memberEmail = getMemberEmail(m, fam);
      const cardUrl = fam.family_code ? `https://ahmedabaddabgarsamaj.vercel.app/family-card?code=${fam.family_code}` : '';

      livingMemberRows.push([
        idx + 1, fam.family_code || '', m.name, formatRelation(m.relation), m.gender || '', m.dob || '',
        calculateAge(m.dob, null), m.blood_group || '', m.birth_place || '', m.mobile || '', memberEmail,
        primaryEdu.education_level || '',
        primaryEdu.course_or_standard ? (primaryEdu.current_year ? `${primaryEdu.course_or_standard} (${primaryEdu.current_year})` : primaryEdu.course_or_standard) : '',
        primaryEdu.institution || m.occupation_details?.school_or_college || '',
        primaryEdu.education_status || m.education_status || '', primaryEdu.passing_year || '',
        occType, orgName, desig,
        businessType, workLoc, exp,
        fam.address || '', fam.city || '', fam.pincode || '', formatResidence(m.residence_type),
        m.separate_address || '', regDate,
        makeHyperlink(m.photo_url, 'ફોટો જુઓ (View Photo)'),
        makeHyperlink(cardUrl, 'કાર્ડ જુઓ (View Card)')
      ]);
    });

    // SHEET 4: સ્વર્ગસ્થ સભ્યો (Late Members - Memorial Directory)
    const lateMemberRows: any[][] = [[
      'ક્રમ (No.)', 'પરિવાર કોડ (Family Code)', 'સ્વર્ગસ્થ સભ્યનું નામ (Late Member Name)',
      'સંબંધ (Relation)', 'જાતિ (Gender)', 'જન્મ તારીખ (DOB)', 'સ્વર્ગવાસ તારીખ / વર્ષ (Demise Date / Year)',
      'અવસાન સમયે ઉંમર (Age at Demise)',
      'પરિવારના વડાનું નામ (Family Head)', 'વડાનો મોબાઈલ (Head Contact)',
      'પરિવારનું સરનામું (Address)', 'શહેર (City)',
      'સ્વર્ગસ્થનો ફોટો (Late Photo)'
    ]];

    lateMembers.forEach((m, idx) => {
      const fam = families.find((f) => f.id === m.family_id) || {};
      const famMembers = membersByFamily.get(fam.id) || [];
      const head = famMembers.find((fm) => fm.relation === 'FAMILY_HEAD' && !isDeceased(fm)) || famMembers.find((fm) => fm.relation === 'FAMILY_HEAD') || famMembers[0] || {};
      const demiseDate = m.deceased_date || m.occupation_details?.deceased_date || '';

      lateMemberRows.push([
        idx + 1, fam.family_code || '', m.name, formatRelation(m.relation), m.gender || '', m.dob || '',
        demiseDate, calculateAge(m.dob, demiseDate),
        head.name || 'N/A', head.mobile || '', fam.address || '', fam.city || '',
        makeHyperlink(m.photo_url, 'ફોટો જુઓ (View Photo)')
      ]);
    });

    // SHEET 5: શિક્ષણ અને રોજગાર (Active Living Members Career Directory)
    const careerRows: any[][] = [[
      'પરિવાર કોડ', 'સભ્યનું નામ', 'ઉંમર', 'જાતિ', 'મોબાઈલ', 'ઈમેલ', 'શિક્ષણ ડિગ્રી / ધોરણ',
      'સંસ્થા / યુનિવર્સિટી', 'શિક્ષણ સ્થિતિ', 'પાસિંગ વર્ષ', 'વ્યવસાય વર્ગ', 'પેઢી / કંપનીનું નામ',
      'હોદ્દો / ડેઝિગ્નેશન', 'કામકાજનું સ્થળ', 'અનુભવ (વર્ષ)',
      'સભ્યનો ફોટો (Member Photo)', 'ડિજિટલ કાર્ડ (Digital Card)'
    ]];

    livingMembers.forEach((m) => {
      const fam = families.find((f) => f.id === m.family_id) || {};
      const edus = eduMap.get(m.id) || [];
      const occs = occMap.get(m.id) || [];
      const primaryEdu = edus[0] || {};
      const primaryOcc = occs[0] || {};

      const { occType, orgName, desig, workLoc, exp } = extractOccupationInfo(m, primaryOcc);
      const memberEmail = getMemberEmail(m, fam);
      const cardUrl = fam.family_code ? `https://ahmedabaddabgarsamaj.vercel.app/family-card?code=${fam.family_code}` : '';

      careerRows.push([
        fam.family_code || '', m.name, calculateAge(m.dob, null), m.gender || '', m.mobile || '', memberEmail,
        primaryEdu.course_or_standard || primaryEdu.education_level || '',
        primaryEdu.institution || m.occupation_details?.school_or_college || '',
        primaryEdu.education_status || m.education_status || '', primaryEdu.passing_year || '',
        occType, orgName, desig, workLoc, exp,
        makeHyperlink(m.photo_url, 'ફોટો જુઓ (View Photo)'),
        makeHyperlink(cardUrl, 'કાર્ડ જુઓ (View Card)')
      ]);
    });

    // Create Workbook
    const wb = XLSX.utils.book_new();
    const wsBooklet = XLSX.utils.aoa_to_sheet(bookletRows);
    const wsFamilies = XLSX.utils.aoa_to_sheet(familyRows);
    const wsLiving = XLSX.utils.aoa_to_sheet(livingMemberRows);
    const wsLate = XLSX.utils.aoa_to_sheet(lateMemberRows);
    const wsCareer = XLSX.utils.aoa_to_sheet(careerRows);

    wsBooklet['!cols'] = [
      { wch: 14 }, { wch: 22 }, { wch: 28 }, { wch: 10 }, { wch: 14 }, { wch: 8 },
      { wch: 10 }, { wch: 16 }, { wch: 15 }, { wch: 28 }, { wch: 22 }, { wch: 28 },
      { wch: 14 }, { wch: 18 }, { wch: 30 }, { wch: 18 }, { wch: 22 }, { wch: 10 },
      { wch: 18 }, { wch: 35 }, { wch: 14 }, { wch: 10 }, { wch: 25 }, { wch: 12 },
      { wch: 14 }, { wch: 14 }, { wch: 22 }, { wch: 22 },
    ];

    wsFamilies['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 16 }, { wch: 28 },
      { wch: 12 }, { wch: 12 }, { wch: 12 }, { wch: 35 }, { wch: 18 },
      { wch: 15 }, { wch: 12 }, { wch: 10 }, { wch: 12 }, { wch: 15 },
      { wch: 22 }, { wch: 22 },
    ];

    wsLiving['!cols'] = [
      { wch: 8 }, { wch: 14 }, { wch: 28 }, { wch: 18 }, { wch: 10 }, { wch: 12 },
      { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 15 }, { wch: 28 }, { wch: 16 },
      { wch: 22 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 28 },
      { wch: 18 }, { wch: 18 }, { wch: 20 }, { wch: 10 }, { wch: 35 }, { wch: 14 },
      { wch: 10 }, { wch: 16 }, { wch: 25 }, { wch: 14 },
      { wch: 22 }, { wch: 22 },
    ];

    wsLate['!cols'] = [
      { wch: 10 }, { wch: 15 }, { wch: 30 }, { wch: 20 }, { wch: 10 }, { wch: 14 },
      { wch: 22 }, { wch: 16 }, { wch: 25 }, { wch: 16 }, { wch: 35 }, { wch: 15 },
      { wch: 22 },
    ];

    wsCareer['!cols'] = [
      { wch: 14 }, { wch: 28 }, { wch: 8 }, { wch: 10 }, { wch: 16 }, { wch: 28 },
      { wch: 24 }, { wch: 28 }, { wch: 14 }, { wch: 12 }, { wch: 16 }, { wch: 28 },
      { wch: 20 }, { wch: 20 }, { wch: 12 },
      { wch: 22 }, { wch: 22 },
    ];

    XLSX.utils.book_append_sheet(wb, wsBooklet, 'સમાજ પુસ્તિકા (Booklet)');
    XLSX.utils.book_append_sheet(wb, wsFamilies, 'પરિવારોની યાદી (Families)');
    XLSX.utils.book_append_sheet(wb, wsLiving, 'હયાત સભ્યો (Living Members)');
    XLSX.utils.book_append_sheet(wb, wsLate, 'સ્વર્ગસ્થ સભ્યો (Late Members)');
    XLSX.utils.book_append_sheet(wb, wsCareer, 'શિક્ષણ અને રોજગાર (Directory)');

    const todayStr = new Date().toISOString().split('T')[0];
    const filename = `Ahmedabad_Dabgar_Samaj_Master_Directory_${todayStr}.xlsx`;

    await saveAndShareWorkbook(wb, filename);
  } catch (err: any) {
    console.error('Export directory Excel error:', err);
    Alert.alert('Export Error', err?.message || 'Failed to generate Directory Excel file.');
  }
}
