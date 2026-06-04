import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!userId || !password) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const data = await api.post('/api/auth/login', { user_id: userId, password });
      await AsyncStorage.setItem('accessToken', data.token);
      await AsyncStorage.setItem('user', JSON.stringify(data.user));
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.brand}>
        <View style={styles.logoBox}>
          <Text style={styles.logoText}>EP</Text>
        </View>
        <Text style={styles.appName}>EasyPack</Text>
        <Text style={styles.tagline}>여행 수하물, 간편하게 확인하세요</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.field}>
          <Text style={styles.label}>아이디</Text>
          <TextInput
            style={styles.input}
            placeholder="아이디 입력"
            placeholderTextColor={C.textMuted}
            value={userId}
            onChangeText={setUserId}
            autoCapitalize="none"
          />
        </View>
        <View style={styles.field}>
          <Text style={styles.label}>비밀번호</Text>
          <TextInput
            style={styles.input}
            placeholder="비밀번호 입력"
            placeholderTextColor={C.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity style={styles.btn} onPress={handleLogin} disabled={loading}>
          {loading
            ? <ActivityIndicator color="#fff" />
            : <Text style={styles.btnText}>로그인</Text>}
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.registerRow} onPress={() => navigation.navigate('Register')}>
        <Text style={styles.registerText}>
          계정이 없으신가요?{'  '}
          <Text style={styles.registerLink}>회원가입</Text>
        </Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: C.bg,
    justifyContent: 'center', paddingHorizontal: 24,
  },
  brand: { alignItems: 'center', marginBottom: 36 },
  logoBox: {
    width: 68, height: 68, borderRadius: 18,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16, ...shadow.md,
  },
  logoText: { color: '#fff', fontSize: 26, fontWeight: '800', letterSpacing: -0.5 },
  appName: { fontSize: 28, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  tagline: { fontSize: 14, color: C.textSec },
  card: {
    backgroundColor: C.surface, borderRadius: 20, padding: 24, ...shadow.sm,
  },
  field: { marginBottom: 14 },
  label: { fontSize: 12, fontWeight: '600', color: C.textSec, marginBottom: 6, textTransform: 'uppercase', letterSpacing: 0.5 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 16, paddingVertical: 14,
    fontSize: 15, color: C.text,
    borderWidth: 1.5, borderColor: C.border,
  },
  btn: {
    backgroundColor: C.primary, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center', marginTop: 8,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
  registerRow: { marginTop: 24, alignItems: 'center' },
  registerText: { fontSize: 14, color: C.textSec },
  registerLink: { color: C.primary, fontWeight: '700' },
});
