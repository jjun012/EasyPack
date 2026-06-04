import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { C, shadow } from '../../constants/theme';

const STATUS_CONFIG = {
  '반입가능':  { color: C.success, bg: C.successBg, label: '반입 가능', icon: '✓', border: '#A7F3D0' },
  '반입불가':  { color: C.error,   bg: C.errorBg,   label: '반입 불가', icon: '✕', border: '#FECACA' },
  '제한적반입': { color: C.warning, bg: C.warningBg, label: '제한 반입', icon: '!', border: '#FDE68A' },
};

export default function AnalysisResultScreen({ route, navigation }) {
  const { result } = route.params;
  const cfg = STATUS_CONFIG[result.category] || { color: C.textSec, bg: C.bg, label: '확인 필요', icon: '?', border: C.border };

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.color }]}>
            <Text style={styles.iconText}>{cfg.icon}</Text>
          </View>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.itemName}>{result.item}</Text>
        </View>

        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>상세 안내</Text>
          <Text style={styles.explanation}>{result.explanation}</Text>
        </View>

        {result.country && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>여행 국가</Text>
              <Text style={styles.infoValue}>{result.country}</Text>
            </View>
            {result.airline && (
              <View style={[styles.infoRow, { borderBottomWidth: 0 }]}>
                <Text style={styles.infoLabel}>항공사</Text>
                <Text style={styles.infoValue}>{result.airline}</Text>
              </View>
            )}
          </View>
        )}
      </ScrollView>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.btnOutline} onPress={() => navigation.navigate('TextAnalysis')}>
          <Text style={styles.btnOutlineText}>다시 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.btnPrimary} onPress={() => navigation.navigate('Camera')}>
          <Text style={styles.btnPrimaryText}>카메라로 확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },
  statusCard: {
    borderRadius: 24, padding: 32, alignItems: 'center',
    marginBottom: 16, borderWidth: 1.5, ...shadow.sm,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  statusLabel: { fontSize: 14, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10 },
  itemName: { fontSize: 26, fontWeight: '800', color: C.text, letterSpacing: -0.5 },
  explanationCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 12, ...shadow.sm,
  },
  explanationTitle: { fontSize: 13, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 10 },
  explanation: { fontSize: 15, color: C.textSec, lineHeight: 24 },
  infoCard: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadow.sm },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.border,
  },
  infoLabel: { fontSize: 14, color: C.textSec },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.text },
  actions: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.border,
  },
  btnOutline: {
    flex: 1, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.border,
  },
  btnOutlineText: { color: C.textSec, fontWeight: '700', fontSize: 15 },
  btnPrimary: {
    flex: 1, backgroundColor: C.primary,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
