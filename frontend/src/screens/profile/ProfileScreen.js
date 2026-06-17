import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView, TextInput,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { AIRLINES } from '../../constants/config';
import { C, shadow, CITY_DATA, COUNTRY_DATA, AIRLINE_DATA } from '../../constants/theme';
import CitySearchInput from '../../components/CitySearchInput';

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
    } catch (e) {
      const cached = await AsyncStorage.getItem('user');
      if (cached) {
        const data = JSON.parse(cached);
        setUser(data);
        setForm({ nickname: data.nickname, travelDestination: data.travelDestination, airline: data.airline });
      }
    }
  }

  async function handleUpdate() {
    setLoading(true);
    try {
      await api.put('/api/auth/user/update', {
        nickname: form.nickname,
        travelDestination: form.travelDestination,
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

  if (!user) return <ActivityIndicator style={{ flex: 1 }} color={C.brand} />;

  const initial = (user.nickname || user.userId || '?')[0].toUpperCase();
  const cityInfo = CITY_DATA[user.travelDestination] || {};
  const cd = COUNTRY_DATA[cityInfo.country] || {};
  const ad = AIRLINE_DATA[user.airline] || {};

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header — gradient avatar */}
      <View style={styles.header}>
        <View style={styles.avatarGradient}>
          <Text style={styles.avatarText}>{initial}</Text>
        </View>
        <Text style={styles.nickname}>{user.nickname}</Text>
        <Text style={styles.userId}>@{user.userId}</Text>

        {/* Country + airline badges */}
        <View style={styles.badgesRow}>
          {user.travelDestination && (
            <View style={[styles.headerBadge, { backgroundColor: cd.tint || C.brandSoft }]}>
              <Text style={[styles.headerBadgeText, { color: cd.ink || C.brand }]}>
                {cityInfo.countryCode || user.travelDestination?.slice(0, 2).toUpperCase()}
              </Text>
              <Text style={[styles.headerBadgeLabel, { color: cd.ink || C.brand }]}>
                {user.travelDestination}
              </Text>
            </View>
          )}
          {user.airline && (
            <View style={[styles.headerBadge, { backgroundColor: (ad.color || C.brand) + '22' }]}>
              <Text style={[styles.headerBadgeText, { color: ad.color || C.brand }]}>
                {ad.code || user.airline?.slice(0, 2)}
              </Text>
              <Text style={[styles.headerBadgeLabel, { color: ad.color || C.brand }]}>
                {user.airline}
              </Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>
        {editing ? (
          /* Edit form */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>정보 수정</Text>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>닉네임</Text>
              <TextInput
                style={styles.input}
                value={form.nickname}
                onChangeText={(v) => setForm((p) => ({ ...p, nickname: v }))}
                placeholderTextColor={C.faint}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>여행 도시</Text>
              <CitySearchInput
                value={form.travelDestination}
                onChange={(city) => setForm((p) => ({ ...p, travelDestination: city }))}
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.fieldLabel}>항공사</Text>
              <View style={styles.pills}>
                {AIRLINES.map((a) => {
                  const d = AIRLINE_DATA[a] || {};
                  const active = form.airline === a;
                  return (
                    <TouchableOpacity
                      key={a}
                      style={[styles.pill, active && styles.pillActive]}
                      onPress={() => setForm((p) => ({ ...p, airline: a }))}
                      activeOpacity={0.75}
                    >
                      {active && (
                        <View style={[styles.pillCode, { backgroundColor: d.color || C.brand }]}>
                          <Text style={[styles.pillCodeText, { color: '#fff' }]}>{d.code || a.slice(0, 2)}</Text>
                        </View>
                      )}
                      <Text style={[styles.pillText, active && styles.pillTextActive]}>{a}</Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            <View style={styles.editBtns}>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading
                  ? <ActivityIndicator color="#fff" size="small" />
                  : <Text style={styles.saveBtnText}>저장</Text>}
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          /* Info display */
          <View style={styles.card}>
            <Text style={styles.cardTitle}>내 정보</Text>
            {[
              { label: '닉네임', value: user.nickname },
              { label: '여행 도시', value: user.travelDestination },
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
    backgroundColor: C.ink,
    paddingTop: 56, paddingBottom: 32,
    alignItems: 'center',
  },
  avatarGradient: {
    width: 84, height: 84, borderRadius: 42,
    backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 14,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.2)',
    ...shadow.brand,
  },
  avatarText: { fontSize: 32, fontWeight: '900', color: '#fff' },
  nickname: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  userId: { fontSize: 14, color: 'rgba(255,255,255,0.45)', marginBottom: 16 },

  badgesRow: { flexDirection: 'row', gap: 8 },
  headerBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 5,
  },
  headerBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  headerBadgeLabel: { fontSize: 12, fontWeight: '600' },

  body: { padding: 16 },

  card: { backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 12, ...shadow.sm },
  cardTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: C.line,
  },
  infoLabel: { fontSize: 15, color: C.ink2 },
  infoValue: { fontSize: 15, fontWeight: '600', color: C.ink },

  editBtn: {
    marginTop: 16, backgroundColor: C.brandSoft,
    borderRadius: 12, paddingVertical: 14, alignItems: 'center',
  },
  editBtnText: { color: C.brand, fontWeight: '700', fontSize: 15 },

  field: { marginBottom: 18 },
  fieldLabel: { fontSize: 13, fontWeight: '600', color: C.ink2, marginBottom: 8 },
  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink, borderWidth: 1.5, borderColor: C.line,
  },

  pills: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  pill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.line, backgroundColor: C.bg,
  },
  pillActive: { backgroundColor: C.brandSoft, borderColor: C.brand },
  pillCode: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  pillCodeText: { fontSize: 9, fontWeight: '800' },
  pillText: { fontSize: 13, color: C.ink2, fontWeight: '500' },
  pillTextActive: { color: C.brand, fontWeight: '700' },

  editBtns: { flexDirection: 'row', gap: 8, marginTop: 4 },
  cancelBtn: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center', borderWidth: 1.5, borderColor: C.line,
  },
  cancelBtnText: { color: C.ink2, fontWeight: '600' },
  saveBtn: { flex: 1, backgroundColor: C.brand, borderRadius: 12, paddingVertical: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: '700' },

  logoutBtn: {
    backgroundColor: C.surface, borderRadius: 16, paddingVertical: 17,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.noSoft, ...shadow.sm,
  },
  logoutText: { color: C.no, fontWeight: '700', fontSize: 15 },
});
