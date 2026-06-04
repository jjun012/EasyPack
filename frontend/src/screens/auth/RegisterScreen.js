import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES, AIRLINES } from '../../constants/config';
import { C, shadow } from '../../constants/theme';

export default function RegisterScreen({ navigation }) {
  const [form, setForm] = useState({
    user_id: '', password: '', nickname: '',
    travel_destination: COUNTRIES[0], airline: AIRLINES[0],
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
    <ScrollView style={styles.container} contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
      <Text style={styles.title}>계정 만들기</Text>
      <Text style={styles.subtitle}>여행 정보를 입력하면 맞춤 정보를 드려요</Text>

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
              placeholderTextColor={C.textMuted}
              value={form[key]}
              onChangeText={(v) => set(key, v)}
              autoCapitalize={autoCapitalize || 'none'}
              secureTextEntry={secure}
            />
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>여행 국가</Text>
        <View style={styles.pills}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.pill, form.travel_destination === c && styles.pillActive]}
              onPress={() => set('travel_destination', c)}
            >
              <Text style={[styles.pillText, form.travel_destination === c && styles.pillTextActive]}>
                {c}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>주요 이용 항공사</Text>
        <View style={styles.pills}>
          {AIRLINES.map((a) => (
            <TouchableOpacity
              key={a}
              style={[styles.pill, form.airline === a && styles.pillActive]}
              onPress={() => set('airline', a)}
            >
              <Text style={[styles.pillText, form.airline === a && styles.pillTextActive]}>
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
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
  title: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  subtitle: { fontSize: 14, color: C.textSec, marginBottom: 28 },
  section: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20,
    marginBottom: 16, ...shadow.sm,
  },
  sectionTitle: { fontSize: 13, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14 },
  field: { marginBottom: 14 },
  label: { fontSize: 13, fontWeight: '600', color: C.text, marginBottom: 6 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.text,
    borderWidth: 1.5, borderColor: C.border,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.border,
    backgroundColor: C.bg,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 14, color: C.textSec, fontWeight: '500' },
  pillTextActive: { color: '#fff', fontWeight: '700' },
  btn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
