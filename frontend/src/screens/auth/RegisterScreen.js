import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../../api/client';
import { COUNTRIES, AIRLINES } from '../../constants/config';

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
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>회원가입</Text>

      {[
        { key: 'user_id', placeholder: '아이디', autoCapitalize: 'none' },
        { key: 'password', placeholder: '비밀번호', secure: true },
        { key: 'nickname', placeholder: '닉네임' },
      ].map(({ key, placeholder, autoCapitalize, secure }) => (
        <TextInput
          key={key}
          style={styles.input}
          placeholder={placeholder}
          value={form[key]}
          onChangeText={(v) => set(key, v)}
          autoCapitalize={autoCapitalize || 'none'}
          secureTextEntry={secure}
        />
      ))}

      <Text style={styles.label}>여행 국가</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={form.travel_destination} onValueChange={(v) => set('travel_destination', v)}>
          {COUNTRIES.map((c) => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>항공사</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={form.airline} onValueChange={(v) => set('airline', v)}>
          {AIRLINES.map((a) => <Picker.Item key={a} label={a} value={a} />)}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={handleRegister} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>가입하기</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 24, marginTop: 20 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, marginBottom: 12, fontSize: 16,
  },
  label: { fontSize: 14, color: '#555', marginBottom: 4, marginTop: 8 },
  pickerWrapper: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 12,
  },
  button: {
    backgroundColor: '#4A90E2', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 16,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
