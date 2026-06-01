import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_SERVER_URL } from '../../constants/config';

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
      const result = await res.json();
      navigation.navigate('AnalysisResult', { result });
    } catch (e) {
      Alert.alert('분석 실패', '다시 시도해주세요.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView style={styles.container} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <Text style={styles.title}>물품 직접 입력</Text>
      <Text style={styles.subtitle}>확인하고 싶은 물품명을 입력하세요</Text>

      <TextInput
        style={styles.input}
        placeholder="예: 보조배터리, 라이터, 손톱깎이..."
        value={item}
        onChangeText={setItem}
        returnKeyType="search"
        onSubmitEditing={analyze}
      />

      <TouchableOpacity style={styles.button} onPress={analyze} disabled={loading}>
        {loading
          ? <ActivityIndicator color="#fff" />
          : <Text style={styles.buttonText}>🔍 반입 가능 여부 확인</Text>}
      </TouchableOpacity>

      <View style={styles.examples}>
        <Text style={styles.exampleTitle}>자주 묻는 물품</Text>
        {['보조배터리', '라이터', '액체류', '노트북', '손톱깎이'].map((ex) => (
          <TouchableOpacity key={ex} style={styles.chip} onPress={() => setItem(ex)}>
            <Text style={styles.chipText}>{ex}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff', padding: 24 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 20, marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#666', marginBottom: 32 },
  input: {
    borderWidth: 1.5, borderColor: '#4A90E2', borderRadius: 12,
    padding: 16, fontSize: 16, marginBottom: 16,
  },
  button: {
    backgroundColor: '#4A90E2', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  examples: { marginTop: 40 },
  exampleTitle: { fontSize: 14, color: '#999', marginBottom: 12 },
  chip: {
    backgroundColor: '#f0f6ff', paddingHorizontal: 16, paddingVertical: 10,
    borderRadius: 20, marginBottom: 8, alignSelf: 'flex-start',
  },
  chipText: { color: '#4A90E2', fontSize: 14 },
});
