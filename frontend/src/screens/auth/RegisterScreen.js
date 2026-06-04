import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { AIRLINES } from '../../constants/config';
import { C, shadow, AIRLINE_DATA } from '../../constants/theme';
import CitySearchInput from '../../components/CitySearchInput';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    user_id: '', password: '', nickname: '',
    travel_destination: '', airline: AIRLINES[0],
  });
  const [loading, setLoading] = useState(false);

  function set(key, val) {
    setForm((prev) => ({ ...prev, [key]: val }));
  }

  async function handleRegister() {
    if (!form.user_id || !form.password || !form.nickname) {
      Alert.alert('오류', '모든 항목을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/auth/register', form);
      Alert.alert('가입 완료', '로그인해주세요.', [
        { text: '확인', onPress: () => navigation.goBack() },
      ]);
    } catch (e) {
      Alert.alert('회원가입 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.title}>계정 만들기</Text>
      <Text style={styles.subtitle}>여행 정보를 입력하면 맞춤 정보를 드려요</Text>

      {/* 기본 정보 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>기본 정보</Text>
        {[
          { key: 'user_id', label: '아이디', placeholder: '영문, 숫자 조합', autoCapitalize: 'none' },
          { key: 'password', label: '비밀번호', placeholder: '6자 이상', secure: true },
          { key: 'nickname', label: '닉네임', placeholder: '커뮤니티에서 사용할 이름' },
        ].map(({ key, label, placeholder, autoCapitalize, secure }) => (
          <View key={key} style={styles.field}>
            <Text style={styles.label}>{label}</Text>
            <TextInput
              style={styles.input}
              placeholder={placeholder}
              placeholderTextColor={C.faint}
              value={form[key]}
              onChangeText={(v) => set(key, v)}
              autoCapitalize={autoCapitalize || 'none'}
              secureTextEntry={secure}
            />
          </View>
        ))}
      </View>

      {/* 여행 도시 — 검색 */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>여행 도시</Text>
        <CitySearchInput
          value={form.travel_destination}
          onChange={(city) => set('travel_destination', city)}
        />
      </View>

      {/* 항공사 — vertical list */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 이용 항공사</Text>
        {AIRLINES.map((a) => {
          const d = AIRLINE_DATA[a] || {};
          const active = form.airline === a;
          return (
            <TouchableOpacity
              key={a}
              style={[styles.airlineRow, active && styles.airlineRowActive]}
              onPress={() => set('airline', a)}
              activeOpacity={0.75}
            >
              <View style={[styles.airlineCodeBadge, { backgroundColor: d.color || C.brand }]}>
                <Text style={styles.airlineCodeText}>{d.code || a.slice(0, 2)}</Text>
              </View>
              <Text style={[styles.airlineName, active && styles.airlineNameActive]}>{a}</Text>
              {active && <Text style={styles.checkmark}>✓</Text>}
            </TouchableOpacity>
          );
        })}
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>가입하기</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 24, paddingBottom: 48 },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.ink2, marginBottom: 28 },

  section: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, ...shadow.sm,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 14,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 6 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink,
    borderWidth: 1.5, borderColor: C.line,
  },

  /* Airline rows */
  airlineRow: {
    flexDirection: 'row', alignItems: 'center',
    paddingVertical: 12, paddingHorizontal: 4,
    borderRadius: 10, marginBottom: 4,
    gap: 10,
  },
  airlineRowActive: { backgroundColor: C.brandSoft },
  airlineCodeBadge: {
    borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4,
    minWidth: 36, alignItems: 'center',
  },
  airlineCodeText: { fontSize: 11, fontWeight: '800', color: '#fff', letterSpacing: 0.5 },
  airlineName: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink2 },
  airlineNameActive: { color: C.brand, fontWeight: '700' },
  checkmark: { fontSize: 14, color: C.brand, fontWeight: '700' },

  btn: {
    backgroundColor: C.brand, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
    ...shadow.brand,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
