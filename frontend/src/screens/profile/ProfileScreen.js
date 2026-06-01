import React, { useState, useCallback } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFocusEffect } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { COUNTRIES, AIRLINES } from '../../constants/config';

export default function ProfileScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadUser();
    }, [])
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

  if (!user) return <ActivityIndicator style={{ flex: 1 }} color="#4A90E2" />;

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.avatar}>👤</Text>
        <Text style={styles.userId}>{user.userId}</Text>
      </View>

      <View style={styles.card}>
        {editing ? (
          <>
            <Text style={styles.label}>닉네임</Text>
            <TextInput
              style={styles.input}
              value={form.nickname}
              onChangeText={(v) => setForm((p) => ({ ...p, nickname: v }))}
            />

            <Text style={styles.label}>여행 국가</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.travelDestination}
                onValueChange={(v) => setForm((p) => ({ ...p, travelDestination: v }))}
              >
                {COUNTRIES.map((c) => <Picker.Item key={c} label={c} value={c} />)}
              </Picker>
            </View>

            <Text style={styles.label}>항공사</Text>
            <View style={styles.pickerWrapper}>
              <Picker
                selectedValue={form.airline}
                onValueChange={(v) => setForm((p) => ({ ...p, airline: v }))}
              >
                {AIRLINES.map((a) => <Picker.Item key={a} label={a} value={a} />)}
              </Picker>
            </View>

            <View style={styles.buttonRow}>
              <TouchableOpacity style={styles.saveBtn} onPress={handleUpdate} disabled={loading}>
                {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>저장</Text>}
              </TouchableOpacity>
              <TouchableOpacity style={styles.cancelBtn} onPress={() => setEditing(false)}>
                <Text style={styles.cancelBtnText}>취소</Text>
              </TouchableOpacity>
            </View>
          </>
        ) : (
          <>
            {[
              { label: '닉네임', value: user.nickname },
              { label: '여행 국가', value: user.travelDestination },
              { label: '항공사', value: user.airline },
            ].map(({ label, value }) => (
              <View key={label} style={styles.infoRow}>
                <Text style={styles.infoLabel}>{label}</Text>
                <Text style={styles.infoValue}>{value}</Text>
              </View>
            ))}
            <TouchableOpacity style={styles.editBtn} onPress={() => setEditing(true)}>
              <Text style={styles.editBtnText}>정보 수정</Text>
            </TouchableOpacity>
          </>
        )}
      </View>

      <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout}>
        <Text style={styles.logoutText}>로그아웃</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { backgroundColor: '#4A90E2', alignItems: 'center', paddingVertical: 36 },
  avatar: { fontSize: 60, marginBottom: 8 },
  userId: { fontSize: 18, fontWeight: 'bold', color: '#fff' },
  card: {
    backgroundColor: '#fff', margin: 16, borderRadius: 12,
    padding: 20, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  label: { fontSize: 13, color: '#999', marginBottom: 4, marginTop: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 8, marginBottom: 4 },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 14, borderBottomWidth: 1, borderBottomColor: '#f0f0f0' },
  infoLabel: { fontSize: 15, color: '#555' },
  infoValue: { fontSize: 15, fontWeight: '600', color: '#222' },
  editBtn: {
    marginTop: 16, backgroundColor: '#f0f6ff',
    borderRadius: 8, padding: 14, alignItems: 'center',
  },
  editBtnText: { color: '#4A90E2', fontWeight: 'bold' },
  buttonRow: { flexDirection: 'row', gap: 8, marginTop: 16 },
  saveBtn: { flex: 1, backgroundColor: '#4A90E2', borderRadius: 8, padding: 14, alignItems: 'center' },
  saveBtnText: { color: '#fff', fontWeight: 'bold' },
  cancelBtn: { flex: 1, backgroundColor: '#f0f0f0', borderRadius: 8, padding: 14, alignItems: 'center' },
  cancelBtnText: { color: '#555', fontWeight: 'bold' },
  logoutBtn: {
    margin: 16, backgroundColor: '#fff', borderRadius: 12,
    padding: 16, alignItems: 'center', borderWidth: 1, borderColor: '#e74c3c',
  },
  logoutText: { color: '#e74c3c', fontWeight: 'bold', fontSize: 15 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 8,
    padding: 12, fontSize: 15, marginBottom: 4,
  },
});
