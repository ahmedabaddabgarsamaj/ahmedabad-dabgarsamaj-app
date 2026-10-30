import React, { useEffect, useRef, useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/features/auth/AuthContext';
import { useTheme } from '@/constants/theme';
import { familyService } from '@/features/family/familyService';
import { calculateAge, formatDate, isValidDOB } from '@/lib/utils/date';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { OCCUPATIONS, getOccupationDisplay } from '@/constants/occupations';
import {
  COLLEGE_YEARS,
  EDUCATION_LEVELS,
  EDUCATION_STATUSES,
  getCoursesForLevel,
} from '@/constants/education';
import { TopBar } from '@/components/navigation/TopBar';
import { PhotoUploadField } from '@/components/ui/PhotoUploadField';
import { imageService } from '@/lib/storage/imageService';
import { Ionicons } from '@expo/vector-icons';

export default function SetupFamilyScreen() {
  const router = useRouter();
  const { user, profile } = useAuth();
  const theme = useTheme();

  const [currentStep, setCurrentStep] = useState<number>(1);
  const totalSteps = 5;

  // Step 1: Personal Details
  const [name, setName] = useState('');
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);
  const [photoBase64, setPhotoBase64] = useState<string | null>(null);
  const [gender, setGender] = useState<'Male' | 'Female'>('Male');
  const [dob, setDob] = useState(''); // DD-MM-YYYY
  const [mobile, setMobile] = useState('');
  const [email, setEmail] = useState('');
  const [bloodGroup, setBloodGroup] = useState<string>('');
  const [birthPlace, setBirthPlace] = useState<string>('');

  // Step 2: Education Details
  const [educationLevel, setEducationLevel] = useState('Undergraduate');
  const [courseOrStd, setCourseOrStd] = useState('BCA');
  const [customCourse, setCustomCourse] = useState('');
  const [currentYear, setCurrentYear] = useState('');
  const [eduStatus, setEduStatus] = useState<'Studying' | 'Completed' | 'Discontinued'>('Completed');
  const [passingYear, setPassingYear] = useState('');
  const [institution, setInstitution] = useState('');

  // Step 3: Occupation Details
  const [occupationType, setOccupationType] = useState('EMPLOYEE');
  const [occupationDetails, setOccupationDetails] = useState<Record<string, string>>({});

  // Step 4: Residence Details
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('Ahmedabad');
  const [state, setState] = useState('Gujarat');
  const [pincode, setPincode] = useState('');

  const [loading, setLoading] = useState(false);
  const isSubmittingRef = useRef(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    // Auto-fill mobile number & email from signup / user profile
    const userPhone = profile?.phone || user?.phone || (user?.user_metadata?.phone as string) || '';
    if (userPhone && !mobile) {
      setMobile(userPhone);
    }
    const userEmail = profile?.email || user?.email || '';
    if (userEmail && !email) {
      setEmail(userEmail);
    }
  }, [profile, user]);

  const availableCourses = getCoursesForLevel(educationLevel);
  const selectedOcc = OCCUPATIONS.find((o) => o.code === occupationType);

  const getStepTitle = (step: number): string => {
    switch (step) {
      case 1:
        return 'વ્યક્તિગત વિગત (Personal Details)';
      case 2:
        return 'શિક્ષણની વિગત (Education Details)';
      case 3:
        return occupationType === 'STUDENT'
          ? 'વિદ્યાર્થીની વિગત (Student Details)'
          : 'વ્યવસાયની વિગત (Occupation Details)';
      case 4:
        return 'પરિવારનું સરનામું (Residence Address)';
      case 5:
        return 'સમીક્ષા અને ખાતરી (Review & Confirm)';
      default:
        return '';
    }
  };

  const handleNext = () => {
    setErrorMessage('');

    if (currentStep === 1) {
      if (!name.trim()) {
        setErrorMessage('કૃપા કરીને પરિવારના વડાનું પૂરું નામ દાખલ કરો.');
        return;
      }
      if (!dob.trim() || !isValidDOB(dob.trim())) {
        setErrorMessage('કૃપા કરીને માન્ય જન્મ તારીખ DD-MM-YYYY ફોર્મેટમાં દાખલ કરો (દા.ત. 15-08-1985).');
        return;
      }
      if (!mobile.trim()) {
        setErrorMessage('કૃપા કરીને ૧૦ અંકનો મોબાઈલ નંબર દાખલ કરો.');
        return;
      }
      const cleanPhone = mobile.replace(/[^0-9]/g, '');
      if (cleanPhone.length < 10) {
        setErrorMessage('મોબાઈલ નંબર ઓછામાં ઓછો ૧૦ અંકનો હોવો જોઈએ.');
        return;
      }
    }

    if (currentStep === 2) {
      if (courseOrStd.includes('Other') && !customCourse.trim()) {
        setErrorMessage('કૃપા કરીને કોર્સ અથવા ડિગ્રીનું નામ દાખલ કરો.');
        return;
      }
    }

    if (currentStep === 3) {
      if (selectedOcc && selectedOcc.fields) {
        for (const field of selectedOcc.fields) {
          if (field.required && !occupationDetails[field.key]?.trim()) {
            setErrorMessage(`કૃપા કરીને ${field.label} દાખલ કરો.`);
            return;
          }
        }
      }
    }

    if (currentStep === 4) {
      if (!address.trim()) {
        setErrorMessage('કૃપા કરીને ઘર/ફ્લેટ/સોસાયટીનું સરનામું દાખલ કરો.');
        return;
      }
      if (!city.trim()) {
        setErrorMessage('કૃપા કરીને શહેર દાખલ કરો.');
        return;
      }
      if (!pincode.trim() || pincode.trim().length !== 6) {
        setErrorMessage('કૃપા કરીને ૬ અંકનો માન્ય પીનકોડ દાખલ કરો.');
        return;
      }
    }

    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
  };

  const handleBack = () => {
    setErrorMessage('');
    setCurrentStep((prev) => Math.max(prev - 1, 1));
  };

  const handleCreateFamily = async () => {
    setErrorMessage('');
    if (!name.trim() || !dob.trim() || !mobile.trim() || !address.trim() || !pincode.trim()) {
      setErrorMessage('કૃપા કરીને તમામ ફરજિયાત વિગતો ભરો.');
      return;
    }

    if (!isValidDOB(dob.trim())) {
      setErrorMessage('કૃપા કરીને માન્ય જન્મ તારીખ DD-MM-YYYY ફોર્મેટમાં દાખલ કરો.');
      return;
    }

    if (isSubmittingRef.current || loading) {
      return;
    }
    isSubmittingRef.current = true;
    setLoading(true);

    let finalPhotoUrl = photoUrl;
    if (photoUrl && !photoUrl.startsWith('http://') && !photoUrl.startsWith('https://')) {
      const uploadRes = await imageService.uploadMemberPhoto({
        uri: photoUrl,
        base64: photoBase64,
        headName: name,
        memberName: name,
      });
      if (uploadRes.error) {
        isSubmittingRef.current = false;
        setLoading(false);
        Alert.alert('Photo Upload Notice / ફોટો અપલોડ', uploadRes.error);
        return;
      }
      finalPhotoUrl = uploadRes.url;
    }

    const finalCourse = courseOrStd.includes('Other') && customCourse.trim() ? customCourse.trim() : courseOrStd;

    const res = await familyService.createFamilyWithHead({
      head_user_id: user?.id,
      name: name.trim(),
      gender,
      photo_url: finalPhotoUrl,
      dob: formatDate(dob.trim()),
      mobile: mobile.trim(),
      email: email.trim() || null,
      address: address.trim(),
      area_id: null,
      city: city.trim(),
      state: state.trim(),
      pincode: pincode.trim(),
      education_level: educationLevel,
      course_or_standard: finalCourse,
      current_year: currentYear || undefined,
      passing_year: passingYear.trim() || undefined,
      institution: institution.trim() || undefined,
      education_status: eduStatus,
      occupation_type: occupationType,
      occupation_details: occupationDetails,
      blood_group: bloodGroup.trim() || null,
      birth_place: birthPlace.trim() || null,
    });

    setLoading(false);

    if (res.error) {
      isSubmittingRef.current = false;
      setErrorMessage(res.error);
    } else {
      Alert.alert(
        'Family Created! / પરિવાર નોંધણી સફળ!',
        `તમારો ફેમિલી કોડ ${res.family?.family_code} છે. આપ હવે પરિવારના અન્ય સભ્યોને ઉમેરી શકો છો.`,
        [{ text: 'Continue / આગળ વધો', onPress: () => router.replace('/(family)/home' as any) }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: theme.background }]}
    >
      <TopBar title="Family Setup / પરિવાર નોંધણી" />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header with Stepper Progress */}
        <View style={styles.header}>
          <Text style={[styles.title, { color: theme.text }]}>
            Family Setup / પરિવાર નોંધણી
          </Text>
          <Text style={[styles.stepSubtitle, { color: theme.primary }]}>
            પગલું {currentStep} / {totalSteps}: {getStepTitle(currentStep)}
          </Text>

          {/* Stepper Dots */}
          <View style={styles.stepDotsRow}>
            {[1, 2, 3, 4, 5].map((s) => (
              <View
                key={s}
                style={[
                  styles.stepDot,
                  {
                    backgroundColor: s <= currentStep ? theme.primary : theme.border,
                  },
                ]}
              />
            ))}
          </View>
        </View>

        {errorMessage ? (
          <View style={[styles.errorBanner, { backgroundColor: theme.errorLight, borderColor: theme.error }]}>
            <Ionicons name="alert-circle" size={18} color={theme.error} style={{ marginRight: 8 }} />
            <Text style={[styles.errorBannerText, { color: theme.error }]}>
              {errorMessage}
            </Text>
          </View>
        ) : null}

        {/* STEP 1: Personal Details */}
        {currentStep === 1 && (
          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              Step 1: Family Head Details / વડાની વિગત
            </Text>

            {/* Head Profile Photo */}
            <PhotoUploadField
              label="Family Head Photo / વડાનો ફોટો"
              name={name}
              gender={gender}
              photoUrl={photoUrl}
              onPhotoSelected={(uri, base64) => {
                setPhotoUrl(uri);
                if (base64) setPhotoBase64(base64);
              }}
              onPhotoRemoved={() => {
                setPhotoUrl(null);
                setPhotoBase64(null);
              }}
            />

            <Input
              label="Full Name / પૂરું નામ *"
              placeholder="e.g. મહેશભાઈ કે. ડબગર"
              value={name}
              onChangeText={setName}
            />

            {/* Gender Selection */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Gender / જાતિ *
              </Text>
              <View style={styles.pillRow}>
                {(['Male', 'Female'] as const).map((g) => (
                  <TouchableOpacity
                    key={g}
                    activeOpacity={0.7}
                    onPress={() => setGender(g)}
                    style={[
                      styles.pillButton,
                      {
                        backgroundColor:
                          gender === g ? theme.primary : theme.backgroundElement,
                        borderColor:
                          gender === g ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.pillText,
                        { color: gender === g ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {g === 'Male' ? '👨 Male / પુરુષ' : '👩 Female / સ્ત્રી'}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Date of Birth / જન્મ તારીખ (DD-MM-YYYY) *"
              placeholder="e.g. 15-08-1985"
              value={dob}
              onChangeText={setDob}
              helperText="જન્મ તારીખથી ઉંમર આપમેળે ગણાશે."
            />

            {isValidDOB(dob.trim()) ? (
              <View
                style={[
                  styles.ageBadge,
                  { backgroundColor: theme.primaryLight, borderColor: theme.primary },
                ]}
              >
                <Ionicons name="sparkles" size={15} color={theme.primary} />
                <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
                  ઉંમર (Current Age): {calculateAge(dob.trim())} વર્ષ ({calculateAge(dob.trim())} yrs)
                </Text>
              </View>
            ) : null}

            <Input
              label="Mobile Number / મોબાઈલ નંબર *"
              placeholder="e.g. 9876543210"
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
            />

            <Input
              label="Email ID / ઈમેઈલ (મરજિયાત / Optional)"
              placeholder="e.g. mahesh@gmail.com"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              helperText="સૂચનાઓ મેળવવા માટે ઈમેઈલ આઈડી"
            />

            {/* Blood Group */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Blood Group / બ્લડ ગ્રૂપ
              </Text>
              <View style={styles.bloodGrid}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => (
                  <TouchableOpacity
                    key={bg}
                    activeOpacity={0.7}
                    onPress={() => setBloodGroup(bloodGroup === bg ? '' : bg)}
                    style={[
                      styles.bloodChip,
                      {
                        backgroundColor: bloodGroup === bg ? '#DC2626' : theme.backgroundElement,
                        borderColor: bloodGroup === bg ? '#DC2626' : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.bloodChipText,
                        { color: bloodGroup === bg ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {bg}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Birth Place */}
            <Input
              label="Birth Place / જન્મ સ્થળ (ગામ / શહેર)"
              placeholder="e.g. અમદાવાદ, પાટણ, વિસનગર, મહેસાણા..."
              value={birthPlace}
              onChangeText={setBirthPlace}
              helperText="પરિવારના વડાનું મૂળ ગામ અથવા જન્મ સ્થળ"
            />
          </View>
        )}

        {/* STEP 2: Education Details */}
        {currentStep === 2 && (
          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              Step 2: Education Details / શિક્ષણની વિગત
            </Text>

            {/* Education Level Selection */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Education Level / સ્તર
              </Text>
              <View style={styles.gridWrap}>
                {EDUCATION_LEVELS.map((lvl) => (
                  <TouchableOpacity
                    key={lvl.value}
                    activeOpacity={0.7}
                    onPress={() => {
                      setEducationLevel(lvl.value);
                      const courses = getCoursesForLevel(lvl.value);
                      setCourseOrStd(courses[0] || 'Other');
                      if (lvl.value === 'School' || lvl.value === 'NotSchoolAge') {
                        setCurrentYear('');
                      }
                    }}
                    style={[
                      styles.gridChoiceItem,
                      {
                        backgroundColor:
                          educationLevel === lvl.value ? theme.primary : theme.backgroundElement,
                        borderColor:
                          educationLevel === lvl.value ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridChoiceText,
                        { color: educationLevel === lvl.value ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {lvl.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Courses / Standard Grid */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                Course / Degree / Standard ({educationLevel})
              </Text>
              <View style={styles.gridWrap}>
                {availableCourses.map((c) => (
                  <TouchableOpacity
                    key={c}
                    activeOpacity={0.7}
                    onPress={() => setCourseOrStd(c)}
                    style={[
                      styles.gridChoiceItem,
                      {
                        backgroundColor: courseOrStd === c ? theme.primary : theme.backgroundElement,
                        borderColor: courseOrStd === c ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridChoiceText,
                        { color: courseOrStd === c ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {c}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Manual Course Input if Other */}
            {courseOrStd.includes('Other') ? (
              <Input
                label="Enter Custom Course / Degree Name *"
                placeholder="e.g. Master in Data Science / BCA Honours"
                value={customCourse}
                onChangeText={setCustomCourse}
              />
            ) : null}

            {/* Current Year Selection for College */}
            {educationLevel !== 'School' && educationLevel !== 'NotSchoolAge' && (
              <View style={styles.fieldGroup}>
                <Text style={[styles.fieldLabel, { color: theme.text }]}>
                  Year / વર્ષ (1st, 2nd, 3rd, 4th Year)
                </Text>
                <View style={styles.gridWrap}>
                  {COLLEGE_YEARS.map((yr) => (
                    <TouchableOpacity
                      key={yr}
                      activeOpacity={0.7}
                      onPress={() => setCurrentYear(currentYear === yr ? '' : yr)}
                      style={[
                        styles.gridChoiceItem,
                        {
                          backgroundColor: currentYear === yr ? theme.primary : theme.backgroundElement,
                          borderColor: currentYear === yr ? theme.primary : theme.border,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.gridChoiceText,
                          { color: currentYear === yr ? '#FFFFFF' : theme.text },
                        ]}
                      >
                        {yr}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* Status Selection */}
            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>Status / સ્થિતિ</Text>
              <View style={styles.choiceRow}>
                {EDUCATION_STATUSES.map((st) => (
                  <TouchableOpacity
                    key={st.value}
                    activeOpacity={0.7}
                    onPress={() => setEduStatus(st.value as any)}
                    style={[
                      styles.choiceButton,
                      {
                        backgroundColor: eduStatus === st.value ? theme.primary : theme.backgroundElement,
                        borderColor: eduStatus === st.value ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.choiceText,
                        { color: eduStatus === st.value ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {st.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <Input
              label="Passing Year / પાસિંગ વર્ષ (Optional)"
              placeholder="e.g. 2024"
              value={passingYear}
              onChangeText={setPassingYear}
              keyboardType="number-pad"
              maxLength={4}
            />

            <Input
              label="School / College / University Name"
              placeholder="e.g. Gujarat University"
              value={institution}
              onChangeText={setInstitution}
            />
          </View>
        )}

        {/* STEP 3: Occupation Details with Dynamic Fields */}
        {currentStep === 3 && (
          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              {occupationType === 'STUDENT'
                ? 'Step 3: Student Details / વિદ્યાર્થી'
                : 'Step 3: Occupation / વ્યવસાય'}
            </Text>

            <View style={styles.fieldGroup}>
              <Text style={[styles.fieldLabel, { color: theme.text }]}>
                {occupationType === 'STUDENT'
                  ? 'Category / સ્થિતિ (વિદ્યાર્થી)'
                  : 'Select Category / વ્યવસાય કેટેગરી'}
              </Text>
              <View style={styles.gridWrap}>
                {OCCUPATIONS.map((occ) => (
                  <TouchableOpacity
                    key={occ.code}
                    activeOpacity={0.7}
                    onPress={() => {
                      setOccupationType(occ.code);
                      setOccupationDetails({});
                    }}
                    style={[
                      styles.gridChoiceItem,
                      {
                        backgroundColor: occupationType === occ.code ? theme.primary : theme.backgroundElement,
                        borderColor: occupationType === occ.code ? theme.primary : theme.border,
                      },
                    ]}
                  >
                    <Text
                      style={[
                        styles.gridChoiceText,
                        { color: occupationType === occ.code ? '#FFFFFF' : theme.text },
                      ]}
                    >
                      {occ.displayLabel}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Dynamic Occupation Inputs */}
            {selectedOcc && selectedOcc.fields.length > 0 ? (
              <View style={styles.dynamicFieldsSection}>
                <Text style={[styles.dynamicHeading, { color: theme.primary }]}>
                  {selectedOcc.code === 'STUDENT'
                    ? 'વિદ્યાર્થીની વિગત / Student Details:'
                    : `${selectedOcc.label} Details:`}
                </Text>
                {selectedOcc.fields.map((f) => (
                  <Input
                    key={f.key}
                    label={`${f.label}${f.required ? ' *' : ''}`}
                    placeholder={f.placeholder}
                    value={occupationDetails[f.key] || ''}
                    onChangeText={(val) =>
                      setOccupationDetails((prev) => ({ ...prev, [f.key]: val }))
                    }
                    keyboardType={f.type === 'number' ? 'number-pad' : 'default'}
                  />
                ))}
              </View>
            ) : null}
          </View>
        )}

        {/* STEP 4: Family Residence Address */}
        {currentStep === 4 && (
          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              Step 4: Family Residence Address / સરનામું
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              આ સરનામું સમગ્ર પરિવારનું મુખ્ય સરનામું રહેશે.
            </Text>

            <Input
              label="House / Flat / Society Address *"
              placeholder="e.g. ૧૨, શ્રી રામ સોસાયટી, મેઈન સર્કલ પાસે"
              value={address}
              onChangeText={setAddress}
              multiline
              numberOfLines={2}
            />

            <View style={styles.rowTwo}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Input
                  label="City / શહેર *"
                  placeholder="Ahmedabad"
                  value={city}
                  onChangeText={setCity}
                />
              </View>
              <View style={{ flex: 1, marginLeft: 8 }}>
                <Input
                  label="Pincode / પીનકોડ *"
                  placeholder="382350"
                  value={pincode}
                  onChangeText={setPincode}
                  keyboardType="number-pad"
                  maxLength={6}
                />
              </View>
            </View>

            <Input
              label="State / રાજ્ય"
              placeholder="Gujarat"
              value={state}
              onChangeText={setState}
            />
          </View>
        )}

        {/* STEP 5: Review & Confirmation */}
        {currentStep === 5 && (
          <View style={[styles.formCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.cardTitle, { color: theme.primary }]}>
              Step 5: Review & Confirm / સમીક્ષા
            </Text>
            <Text style={[styles.cardSubtitle, { color: theme.textSecondary }]}>
              કૃપા કરીને તમામ વિગતો તપાસી લો અને નોંધણી પૂર્ણ કરો.
            </Text>

            {/* Section 1: Head Details Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="person" size={18} color={theme.primary} />
                <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                  પરિવારના વડાની વિગત (Head Details)
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>પૂરું નામ:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{name || '-'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>જાતિ / Gender:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{gender === 'Male' ? 'પુરુષ (Male)' : 'સ્ત્રી (Female)'}</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>જન્મ તારીખ:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{dob} (ઉંમર: {calculateAge(dob)} વર્ષ)</Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>મોબાઈલ નંબર:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{mobile || '-'}</Text>
              </View>
              {email ? (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>ઈમેઈલ:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>{email}</Text>
                </View>
              ) : null}
              {bloodGroup ? (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>બ્લડ ગ્રૂપ:</Text>
                  <Text style={[styles.summaryValue, { color: '#DC2626', fontWeight: '700' }]}>{bloodGroup}</Text>
                </View>
              ) : null}
              {birthPlace ? (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>જન્મ સ્થળ / ગામ:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>{birthPlace}</Text>
                </View>
              ) : null}
            </View>

            {/* Section 2: Education Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="school" size={18} color={theme.primary} />
                <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                  શિક્ષણની વિગત (Education)
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>ડિગ્રી / કોર્સ:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {courseOrStd.includes('Other') && customCourse ? customCourse : courseOrStd} ({educationLevel})
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>સ્થિતિ / Status:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>{eduStatus}</Text>
              </View>
              {institution ? (
                <View style={styles.summaryItem}>
                  <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>સ્કૂલ / કોલેજ:</Text>
                  <Text style={[styles.summaryValue, { color: theme.text }]}>{institution}</Text>
                </View>
              ) : null}
            </View>

            {/* Section 3: Occupation Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="briefcase" size={18} color={theme.primary} />
                <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                  {occupationType === 'STUDENT' ? 'વિદ્યાર્થીની વિગત' : 'વ્યવસાયની વિગત (Occupation)'}
                </Text>
              </View>
              <View style={styles.summaryItem}>
                <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>કેટેગરી:</Text>
                <Text style={[styles.summaryValue, { color: theme.text }]}>
                  {getOccupationDisplay(occupationType)}
                </Text>
              </View>
              {selectedOcc?.fields.map((f) => {
                const val = occupationDetails[f.key];
                if (!val) return null;
                return (
                  <View key={f.key} style={styles.summaryItem}>
                    <Text style={[styles.summaryLabel, { color: theme.textSecondary }]}>{f.label}:</Text>
                    <Text style={[styles.summaryValue, { color: theme.text }]}>{val}</Text>
                  </View>
                );
              })}
            </View>

            {/* Section 4: Address Summary */}
            <View style={[styles.summaryCard, { backgroundColor: theme.backgroundElement, borderColor: theme.border }]}>
              <View style={styles.summaryHeader}>
                <Ionicons name="home" size={18} color={theme.primary} />
                <Text style={[styles.summaryTitle, { color: theme.primary }]}>
                  પરિવારનું રહેઠાણ સરનામું (Address)
                </Text>
              </View>
              <Text style={[styles.summaryAddressText, { color: theme.text }]}>
                {address}, {city}, {state} - {pincode}
              </Text>
            </View>
          </View>
        )}

        {/* Navigation Buttons Row */}
        <View style={styles.navRow}>
          {currentStep > 1 ? (
            <Button
              title="← પાછળ (Back)"
              variant="outline"
              onPress={handleBack}
              disabled={loading}
              style={{ flex: 1, marginRight: 8 }}
            />
          ) : null}

          {currentStep < totalSteps ? (
            <Button
              title="આગળ (Next) →"
              onPress={handleNext}
              disabled={loading}
              style={{ flex: 1, marginLeft: currentStep > 1 ? 8 : 0 }}
            />
          ) : (
            <Button
              title="પરિવાર નોંધણી પૂર્ણ કરો"
              onPress={handleCreateFamily}
              loading={loading}
              style={{ flex: 2, marginLeft: 8 }}
            />
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    maxWidth: 680,
    width: '100%',
    alignSelf: 'center',
    paddingBottom: 40,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
  },
  stepSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 4,
  },
  stepDotsRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 12,
  },
  stepDot: {
    height: 6,
    borderRadius: 3,
    flex: 1,
  },
  formCard: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 20,
    elevation: 3,
    boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.05)',
    marginBottom: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  cardSubtitle: {
    fontSize: 13,
    marginBottom: 16,
  },
  fieldGroup: {
    marginBottom: 16,
  },
  fieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 8,
  },
  pillRow: {
    flexDirection: 'row',
    gap: 10,
  },
  pillButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  pillText: {
    fontSize: 13,
    fontWeight: '700',
  },
  rowTwo: {
    flexDirection: 'row',
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorBannerText: {
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
  },
  ageBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    marginBottom: 14,
    marginTop: -6,
    borderWidth: 1,
    gap: 6,
  },
  bloodGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 4,
  },
  bloodChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 48,
    alignItems: 'center',
    justifyContent: 'center',
  },
  bloodChipText: {
    fontSize: 13,
    fontWeight: '700',
  },
  gridWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridChoiceItem: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
  },
  gridChoiceText: {
    fontSize: 12,
    fontWeight: '700',
  },
  choiceRow: {
    flexDirection: 'row',
    gap: 10,
  },
  choiceButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
  },
  choiceText: {
    fontSize: 13,
    fontWeight: '700',
  },
  dynamicFieldsSection: {
    marginTop: 10,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0,0,0,0.08)',
  },
  dynamicHeading: {
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 12,
  },
  summaryCard: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  summaryHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0,0,0,0.06)',
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: '800',
  },
  summaryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  summaryLabel: {
    fontSize: 13,
    fontWeight: '500',
  },
  summaryValue: {
    fontSize: 13,
    fontWeight: '700',
  },
  summaryAddressText: {
    fontSize: 13,
    fontWeight: '600',
    lineHeight: 18,
  },
  navRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    marginBottom: 20,
  },
});
