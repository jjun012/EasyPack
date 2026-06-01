import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

const CATEGORY_CONFIG = {
  '반입가능': { color: '#27AE60', bg: '#eafaf1', icon: '✅' },
  '반입불가': { color: '#e74c3c', bg: '#fdf0ef', icon: '❌' },
  '제한적반입': { color: '#F39C12', bg: '#fef9ec', icon: '⚠️' },
};

export default function AnalysisResultScreen({ route, navigation }) {
  const { result } = route.params;
  const config = CATEGORY_CONFIG[result.category] || { color: '#888', bg: '#f5f5f5', icon: '❓' };

  return (
    <View style={styles.container}>
      <View style={[styles.resultCard, { backgroundColor: config.bg }]}>
        <Text style={styles.icon}>{config.icon}</Text>
        <Text style={styles.item}>{result.item}</Text>
        <Text style={[styles.category, { color: config.color }]}>{result.category}</Text>
        <Text style={styles.explanation}>{result.explanation}</Text>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Camera')}>
        <Text style={styles.buttonText}>다른 물품 확인하기</Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.outlineButton} onPress={() => navigation.navigate('TextAnalysis')}>
        <Text style={styles.outlineButtonText}>직접 입력으로 다시 확인</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5', padding: 24, justifyContent: 'center' },
  resultCard: {
    borderRadius: 20, padding: 32, alignItems: 'center',
    marginBottom: 32, shadowColor: '#000', shadowOpacity: 0.08, shadowRadius: 10, elevation: 4,
  },
  icon: { fontSize: 60, marginBottom: 16 },
  item: { fontSize: 24, fontWeight: 'bold', color: '#222', marginBottom: 8 },
  category: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  explanation: { fontSize: 15, color: '#555', textAlign: 'center', lineHeight: 24 },
  button: {
    backgroundColor: '#4A90E2', borderRadius: 12,
    padding: 16, alignItems: 'center', marginBottom: 12,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  outlineButton: {
    borderWidth: 1.5, borderColor: '#4A90E2', borderRadius: 12,
    padding: 16, alignItems: 'center',
  },
  outlineButtonText: { color: '#4A90E2', fontSize: 16, fontWeight: 'bold' },
});
