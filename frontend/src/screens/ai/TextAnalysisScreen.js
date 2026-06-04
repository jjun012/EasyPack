import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_SERVER_URL } from '../../constants/config';
import { C, shadow } from '../../constants/theme';

const QUICK_ITEMS = ['보조배터리', '라이터', '액체류', '노트북', '손톱깎이', '우산', '음식물', '의약품'];

export default function TextAnalysisScreen({ navigation }) {
  const [item, setItem] = useState('');
  const [loading, setLoading] = useState(false);

  async function analyze() {
    if (!item.trim()) {
      Alert.alert('오류', '물품명을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      const stored = await AsyncStorage.getItem('user');
      const user = stored ? JSON.parse(stored) : null;
      const res = await fetch(`${AI_SERVER_URL}/predict/text`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          item: item.trim(),
          country: user?.travelDestination || '일본',
          airline: user?.airline || '대한항공',
        }),
      });
      const raw = await res.json();
      const result = {
        item:        raw.item || raw.name || item.trim(),
        category:    raw.category || raw.verdict || '확인 필요',
        carry_on:    raw.carry_on || null,
        checked:     raw.checked  || null,
        explanation: raw.explanation || raw.description || '',
        tags:        raw.tags || [],
        country:     raw.country || '',
        airline:     raw.airline || '',
      };
      navigation.navigate('AnalysisResult', { result });
    } catch (e) {
      Alert.alert('분석 실패', '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
        {/* Hero area */}
        <View style={styles.top}>
          <Text style={styles.title}>물품 반입 확인</Text>
          <Text style={styles.subtitle}>
            확인하고 싶은 물품명을 입력하면{'\n'}반입 가능 여부를 알려드려요
          </Text>
        </View>

        {/* Search card */}
        <View style={styles.card}>
          <View style={styles.inputWrapper}>
            <Text style={styles.searchIcon}>🔍</Text>
            <TextInput
              style={styles.input}
              placeholder="물품명 입력  (예: 보조배터리)"
              placeholderTextColor={C.faint}
              value={item}
              onChangeText={setItem}
              returnKeyType="search"
              onSubmitEditing={analyze}
            />
            {item.length > 0 && (
              <TouchableOpacity onPress={() => setItem('')} style={styles.clearBtn}>
                <Text style={styles.clearBtnText}>✕</Text>
              </TouchableOpacity>
            )}
          </View>

          <TouchableOpacity
            style={[styles.btn, loading && styles.btnLoading]}
            onPress={analyze}
            disabled={loading}
          >
            {loading
              ? <ActivityIndicator color="#fff" />
              : <Text style={styles.btnText}>반입 가능 여부 확인</Text>}
          </TouchableOpacity>
        </View>

        {/* Quick chips */}
        <View style={styles.quickSection}>
          <Text style={styles.quickTitle}>자주 찾는 물품</Text>
          <View style={styles.chips}>
            {QUICK_ITEMS.map((ex) => (
              <TouchableOpacity
                key={ex}
                style={[styles.chip, item === ex && styles.chipActive]}
                onPress={() => setItem(ex)}
                activeOpacity={0.75}
              >
                <Text style={[styles.chipText, item === ex && styles.chipTextActive]}>{ex}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  top: { paddingHorizontal: 24, paddingTop: 32, paddingBottom: 24 },
  title: { fontSize: 26, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 8 },
  subtitle: { fontSize: 15, color: C.ink2, lineHeight: 22 },

  card: {
    marginHorizontal: 16, backgroundColor: C.surface,
    borderRadius: 20, padding: 20, ...shadow.md, marginBottom: 24,
  },
  inputWrapper: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: C.bg, borderRadius: 14,
    borderWidth: 1.5, borderColor: C.line,
    paddingHorizontal: 14, marginBottom: 14,
  },
  searchIcon: { fontSize: 16, marginRight: 8 },
  input: {
    flex: 1, paddingVertical: 14,
    fontSize: 16, color: C.ink,
  },
  clearBtn: { padding: 4 },
  clearBtnText: { fontSize: 14, color: C.faint, fontWeight: '600' },

  btn: {
    backgroundColor: C.brand, borderRadius: 14,
    paddingVertical: 16, alignItems: 'center',
    ...shadow.brand,
  },
  btnLoading: { opacity: 0.7 },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },

  quickSection: { paddingHorizontal: 24 },
  quickTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: C.surface,
    borderWidth: 1.5, borderColor: C.line, ...shadow.sm,
  },
  chipActive: { backgroundColor: C.brand, borderColor: C.brand },
  chipText: { fontSize: 14, color: C.ink2, fontWeight: '500' },
  chipTextActive: { color: '#fff', fontWeight: '700' },
});
