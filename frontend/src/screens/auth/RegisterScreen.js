import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { AIRLINES } from '../../constants/config';
import { C, shadow, AIRLINE_DATA } from '../../constants/theme';
import CitySearchInput from '../../components/CitySearchInput';

const TERMS = [
  { key: 'terms',     label: '이용약관 동의',           required: true  },
  { key: 'privacy',   label: '개인정보처리방침 동의',   required: true  },
  { key: 'marketing', label: '마케팅 수신 동의',        required: false },
];

const STEP_LABELS = ['약관 동의', '계정 정보', '여행 정보'];

export default function RegisterScreen({ navigation }) {
  const [step, setStep]   = useState(0);
  const [agreed, setAgreed] = useState({ terms: false, privacy: false, marketing: false });
  const [form, setForm]   = useState({
    user_id: '', password: '', password_confirm: '', nickname: '',
    travel_destination: '', airline: AIRLINES[0],
  });
  const [loading, setLoading] = useState(false);

  function setF(key, val) { setForm(prev => ({ ...prev, [key]: val })); }

  const allRequired = TERMS.filter(t => t.required).every(t => agreed[t.key]);
  const allAgreed   = TERMS.every(t => agreed[t.key]);

  function toggleAll() {
    const next = !allAgreed;
    const updated = {};
    TERMS.forEach(t => { updated[t.key] = next; });
    setAgreed(updated);
  }

  function goNext() {
    if (step === 0) {
      if (!allRequired) return Alert.alert('필수 항목', '필수 약관에 동의해주세요.');
      setStep(1);
    } else if (step === 1) {
      if (!form.user_id || !form.nickname || !form.password)
        return Alert.alert('오류', '모든 항목을 입력해주세요.');
      if (form.password !== form.password_confirm)
        return Alert.alert('오류', '비밀번호가 일치하지 않습니다.');
      setStep(2);
    }
  }

  async function handleRegister() {
    setLoading(true);
    try {
      await api.post('/api/auth/register', {
        user_id: form.user_id,
        password: form.password,
        nickname: form.nickname,
        travel_destination: form.travel_destination,
        airline: form.airline,
      });
      Alert.alert('가입 완료', '로그인해주세요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('회원가입 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  const pwMismatch =
    form.password_confirm.length > 0 && form.password !== form.password_confirm;

  return (
    <View style={styles.container}>
      {/* ── Step progress ── */}
      <View style={styles.progressRow}>
        {STEP_LABELS.map((label, i) => (
          <React.Fragment key={i}>
            <View style={styles.progressItem}>
              <View style={[styles.dot, i <= step && styles.dotActive]}>
                <Text style={[styles.dotText, i <= step && styles.dotTextActive]}>{i + 1}</Text>
              </View>
              <Text style={[styles.dotLabel, i === step && styles.dotLabelActive]}>{label}</Text>
            </View>
            {i < STEP_LABELS.length - 1 && (
              <View style={[styles.line, i < step && styles.lineActive]} />
            )}
          </React.Fragment>
        ))}
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* ── Step 0: 약관 동의 ── */}
        {step === 0 && (
          <View>
            <Text style={styles.stepTitle}>서비스 이용약관</Text>
            <Text style={styles.stepSub}>아래 약관을 확인하고 동의해주세요</Text>

            <TouchableOpacity style={styles.allAgreeRow} onPress={toggleAll} activeOpacity={0.8}>
              <View style={[styles.checkbox, allAgreed && styles.checkboxOn]}>
                {allAgreed && <Text style={styles.checkmarkText}>✓</Text>}
              </View>
              <Text style={styles.allAgreeText}>전체 동의</Text>
            </TouchableOpacity>

            <View style={styles.separator} />

            {TERMS.map(({ key, label, required }) => (
              <TouchableOpacity
                key={key}
                style={styles.termRow}
                onPress={() => setAgreed(prev => ({ ...prev, [key]: !prev[key] }))}
                activeOpacity={0.8}
              >
                <View style={[styles.checkbox, agreed[key] && styles.checkboxOn]}>
                  {agreed[key] && <Text style={styles.checkmarkText}>✓</Text>}
                </View>
                <Text style={styles.termLabel}>{label}</Text>
                <View style={[styles.badge, required ? styles.badgeRequired : styles.badgeOptional]}>
                  <Text style={[styles.badgeText, required ? styles.badgeTextReq : styles.badgeTextOpt]}>
                    {required ? '필수' : '선택'}
                  </Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* ── Step 1: 계정 정보 ── */}
        {step === 1 && (
          <View>
            <Text style={styles.stepTitle}>계정 정보 입력</Text>
            <Text style={styles.stepSub}>로그인에 사용할 정보를 입력해주세요</Text>

            {([
              { key: 'user_id',          label: '아이디',        placeholder: '영문, 숫자 조합' },
              { key: 'nickname',         label: '닉네임',        placeholder: '커뮤니티에서 사용할 이름' },
              { key: 'password',         label: '비밀번호',      placeholder: '6자 이상', secure: true },
              { key: 'password_confirm', label: '비밀번호 확인', placeholder: '비밀번호 재입력', secure: true },
            ]).map(({ key, label, placeholder, secure }) => (
              <View key={key} style={styles.field}>
                <Text style={styles.fieldLabel}>{label}</Text>
                <TextInput
                  style={[
                    styles.input,
                    key === 'password_confirm' && pwMismatch && styles.inputError,
                  ]}
                  placeholder={placeholder}
                  placeholderTextColor={C.faint}
                  value={form[key]}
                  onChangeText={(v) => setF(key, v)}
                  autoCapitalize="none"
                  secureTextEntry={!!secure}
                />
                {key === 'password_confirm' && pwMismatch && (
                  <Text style={styles.errorText}>비밀번호가 일치하지 않습니다</Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* ── Step 2: 여행 정보 ── */}
        {step === 2 && (
          <View>
            <Text style={styles.stepTitle}>여행 정보</Text>
            <Text style={styles.stepSub}>맞춤 수하물 정보를 제공해드릴게요</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>여행 도시</Text>
              <CitySearchInput
                value={form.travel_destination}
                onChange={(city) => setF('travel_destination', city)}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>주요 이용 항공사</Text>
              {AIRLINES.map((a) => {
                const d = AIRLINE_DATA[a] || {};
                const active = form.airline === a;
                return (
                  <TouchableOpacity
                    key={a}
                    style={[styles.airlineRow, active && styles.airlineRowActive]}
                    onPress={() => setF('airline', a)}
                    activeOpacity={0.75}
                  >
                    <View style={[styles.airlineCode, { backgroundColor: d.color || C.brand }]}>
                      <Text style={styles.airlineCodeText}>{d.code || a.slice(0, 2)}</Text>
                    </View>
                    <Text style={[styles.airlineName, active && styles.airlineNameActive]}>{a}</Text>
                    {active && <Text style={styles.checkBlue}>✓</Text>}
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>
        )}

        <View style={{ height: 120 }} />
      </ScrollView>

      {/* ── Footer button ── */}
      <View style={styles.footer}>
        {step === 2 ? (
          <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>가입 완료</Text>}
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[styles.btn, step === 0 && !allRequired && styles.btnDisabled]}
            onPress={goNext}
          >
            <Text style={styles.btnText}>다음</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Progress */
  progressRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 24, paddingTop: 20, paddingBottom: 16,
    backgroundColor: C.bg,
  },
  progressItem:  { alignItems: 'center', gap: 4 },
  dot: {
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: C.line, alignItems: 'center', justifyContent: 'center',
  },
  dotActive:      { backgroundColor: C.brand },
  dotText:        { fontSize: 12, fontWeight: '700', color: C.muted },
  dotTextActive:  { color: '#fff' },
  dotLabel:       { fontSize: 10, fontWeight: '600', color: C.faint },
  dotLabelActive: { color: C.brand, fontWeight: '700' },
  line:           { flex: 1, height: 2, backgroundColor: C.line, marginBottom: 14 },
  lineActive:     { backgroundColor: C.brand },

  /* Content */
  scroll:   { flex: 1 },
  content:  { paddingHorizontal: 24, paddingTop: 8 },
  stepTitle: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 6 },
  stepSub:   { fontSize: 13, color: C.ink2, marginBottom: 24 },

  /* Terms */
  allAgreeRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 4, ...shadow.sm,
  },
  allAgreeText: { fontSize: 15, fontWeight: '700', color: C.ink },
  separator:   { height: 1, backgroundColor: C.line2, marginVertical: 8 },
  termRow: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 14,
    marginBottom: 6, ...shadow.sm,
  },
  termLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink2 },
  checkbox: {
    width: 22, height: 22, borderRadius: 7,
    borderWidth: 2, borderColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  checkboxOn:    { backgroundColor: C.brand, borderColor: C.brand },
  checkmarkText: { color: '#fff', fontSize: 12, fontWeight: '800' },
  badge: {
    borderRadius: 6, paddingHorizontal: 7, paddingVertical: 3,
  },
  badgeRequired:   { backgroundColor: C.noSoft },
  badgeOptional:   { backgroundColor: C.line2 },
  badgeText:       { fontSize: 10, fontWeight: '700' },
  badgeTextReq:    { color: C.no },
  badgeTextOpt:    { color: C.muted },

  /* Fields */
  field:      { marginBottom: 16 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 6 },
  input: {
    backgroundColor: C.surface, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink,
    borderWidth: 1.5, borderColor: C.line,
  },
  inputError: { borderColor: C.no },
  errorText:  { fontSize: 12, color: C.no, marginTop: 4, marginLeft: 4 },

  /* Airline */
  airlineRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 10, marginBottom: 4, gap: 10,
  },
  airlineRowActive: { backgroundColor: C.brandSoft },
  airlineCode: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    minWidth: 36, alignItems: 'center',
  },
  airlineCodeText:   { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  airlineName:       { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink2 },
  airlineNameActive: { color: C.brand, fontWeight: '700' },
  checkBlue:         { fontSize: 14, color: C.brand, fontWeight: '700' },

  /* Footer */
  footer: {
    paddingHorizontal: 24, paddingBottom: 36, paddingTop: 12,
    backgroundColor: C.bg,
  },
  btn: {
    backgroundColor: C.brand, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
    ...shadow.brand,
  },
  btnDisabled: { backgroundColor: C.faint },
  btnText:     { color: '#fff', fontSize: 16, fontWeight: '700' },
});
