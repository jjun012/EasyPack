import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator,
  KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow } from '../../constants/theme';

export default function LoginScreen({ navigation }) {
  const [userId, setUserId] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!userId.trim() || !password.trim()) {
      Alert.alert('오류', '아이디와 비밀번호를 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const res = await api.post('/api/auth/login', { user_id: userId, password });
      await AsyncStorage.setItem('accessToken', res.token);
      await AsyncStorage.setItem('user', JSON.stringify(res.user));
      navigation.replace('Main');
    } catch (e) {
      Alert.alert('로그인 실패', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        {/* Logo */}
        <View style={styles.logoArea}>
          <View style={styles.logoBox}>
            <Text style={styles.logoText}>EP</Text>
          </View>
          <Text style={styles.wordmark}>
            Easy<Text style={styles.wordmarkBold}>Pack</Text>
          </Text>
          <Text style={styles.tagline}>가볍게 떠나는 여행의 시작</Text>
        </View>

        {/* Card */}
        <View style={styles.card}>
          <View style={styles.field}>
            <Text style={styles.label}>아이디</Text>
            <TextInput
              style={styles.input}
              placeholder="영문, 숫자 조합"
              placeholderTextColor={C.faint}
              value={userId}
              onChangeText={setUserId}
              autoCapitalize="none"
              autoCorrect={false}
            />
          </View>

          <View style={styles.field}>
            <Text style={styles.label}>비밀번호</Text>
            <TextInput
              style={styles.input}
              placeholder="비밀번호 입력"
              placeholderTextColor={C.faint}
              value={password}
              onChangeText={setPassword}
              secureTextEntry
            />
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnDisabled]}
            onPress={handleLogin}
            disabled={loading}
            activeOpacity={0.85}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>로그인</Text>}
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.registerLink}
          onPress={() => navigation.navigate('Register')}
        >
          <Text style={styles.registerLinkText}>
            계정이 없으신가요? <Text style={styles.registerLinkBold}>회원가입</Text>
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.surface },
  scroll: { flexGrow: 1, justifyContent: 'center', paddingHorizontal: 28, paddingVertical: 48 },

  logoArea: { alignItems: 'center', marginBottom: 40 },
  logoBox: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
  },
  logoText: { fontSize: 24, fontWeight: '900', color: C.brand, letterSpacing: -1 },
  wordmark: { fontSize: 28, fontWeight: '400', color: C.ink, letterSpacing: -0.5, marginBottom: 6 },
  wordmarkBold: { fontWeight: '800', color: C.brand },
  tagline: { fontSize: 14, color: C.muted, fontWeight: '500' },

  card: {
    backgroundColor: C.surface,
    borderRadius: 20, padding: 24,
    ...shadow.md,
    marginBottom: 24,
    borderWidth: 1, borderColor: C.line,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: C.ink2, marginBottom: 6 },
  input: {
    backgroundColor: C.bg,
    borderRadius: 12, borderWidth: 1.5, borderColor: C.line,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink,
  },

  btn: {
    backgroundColor: C.brand,
    borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', marginTop: 6,
    ...shadow.brand,
  },
  btnDisabled: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  registerLink: { alignItems: 'center' },
  registerLinkText: { fontSize: 14, color: C.muted },
  registerLinkBold: { color: C.brand, fontWeight: '700' },
});
