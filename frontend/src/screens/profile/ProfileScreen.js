import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { COUNTRIES, AIRLINES } from '../../constants/config';
import { C, shadow } from '../../constants/theme';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => { loadUser(); }, [])
  );

  async function loadUser() {
    try {
      const data = await api.get('/api/auth/user/me');
      setUser(data);
      setForm({ nickname: data.nickname, travelDestination: data.travelDestination, airline: data.airline });
      await AsyncStorage.setItem('user', JSON.stringify(data));
    } catch (e) {}
  }

  async function handleUpdate() {
    setLoading(true);
    try {
      await api.put('/api/auth/user/update', {
        nickname: form.nickname,
        travel_destination: form.travelDestination,
        airline: form.airline,
      });
      await loadUser();
      setEditing(false);
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleLogout() {
    Alert.alert('로그아웃', '로그아웃 하시겠어요?', [
      { text: '취소' },
      {
        text: '로그아웃', style: 'destructive', onPress: async () => {
          await AsyncStorage.multiRemove(['accessToken', 'user']);
          navigation.replace('Auth');
        },
      },
    ]);
  }

  if (!user) return <ActivityIndicator style={{ flex: 1 }} color={C.primary} />;

  const initial = (user.nickname || user.userId || '?')[0].toUpperCase();

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.userId}>@{user.userId}</Text>
      </View>

      <View style={styles.body}>
        {editing ? (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>정보 수정</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              <TextInput
                style={styles.input}
                value={form.nickname}
                onChangeText={(v) => setForm((p) => ({ ...p, nickname: v }))}
                placeholderTextColor={C.textMuted}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>여행 국가</Text>
              <View style={styles.pills}>
                {COUNTRIES.map((c) => (
                  <TouchableOpacity
                    key={c}
                    style={[styles.pill, form.travelDestination === c && styles.pillActive]}
                    onPress={() => setForm((p) => ({ ...p, travelDestination: c }))}
                  >
                    <Text style={[styles.pillText, form.travelDestination === c && styles.pillTextActive]}>{c}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>항공사</Text>
              <View style={styles.pills}>
                {AIRLINES.map((a) => (
                  <TouchableOpacity
                    key={a}
                    style={[styles.pill, form.airline === a && styles.pillActive]}
                    onPress={() => setForm((p) => ({ ...p, airline: a }))}
                  >
                    <Text style={[styles.pillText, form.airline === a && styles.pillTextActive]}>{a}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" size="small" /> : <Text style={styles.saveBtnText}>저장</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.card}>
            <Text style={styles.cardTitle}>내 정보</Text>
            {[
              { label: '닉네임', value: user.nickname },
              { label: '여행 국가', value: user.travelDestination },
              { label: '항공사', value: user.airline },
            ].map(({ label, value }, i, arr) => (
              <View key={label} style={[styles.infoRow, i === arr.length - 1 && { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>정보 수정</Text>
            </TouchableOpacity>
          </View>
        )}

        <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
          <Text style={styles.logoutText}>로그아웃</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: '#1A1F36',
    paddingTop: 56, paddingBottom: 32,
    alignItems: 'center',
  },
  avatar: {
    width: 76, height: 76, borderRadius: 22,
    backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center',
    marginBottom: 14, ...shadow.md,
  },
  avatarText: { fontSize: 30, fontWeight: '800', color: '#fff' },
  nickname: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userId: { fontSize: 14, color: 'rgba(255,255,255,0.5)' },
  body: { padding: 16 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 12, ...shadow.sm },
  cardTitle: { fontSize: 13, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 16 },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoLabel: { fontSize: 15, color: C.textSec },
  infoValue: { fontSize: 15, fontWeight: '600', color: C.text },
  editBtn: {
    marginTop: 16, backgroundColor: C.primaryLight,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  editBtnText: { color: C.primary, fontWeight: '700', fontSize: 15 },
  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.textSec, marginBottom: 8 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.text, borderWidth: 1.5, borderColor: C.border,
  },
  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.border, backgroundColor: C.bg,
  },
  pillActive: { backgroundColor: C.primary, borderColor: C.primary },
  pillText: { fontSize: 13, color: C.textSec, fontWeight: '500' },
  pillTextActive: { color: '#fff', fontWeight: '700' },
  editBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  cancelBtnText: { color: C.textSec, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: C.primary, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },
  logoutBtn: {
    backgroundColor: C.surface, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', borderWidth: 1.5, borderColor: '#FECACA', ...shadow.sm,
  },
  logoutText: { color: C.error, fontWeight: '700', fontSize: 15 },
});
