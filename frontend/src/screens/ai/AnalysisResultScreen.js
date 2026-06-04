import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { Feather } from '@expo/vector-icons';
import { C, shadow } from '../../constants/theme';

const STATUS_CONFIG = {
  '반입가능':   { color: C.ok,   bg: C.okSoft,   ink: C.okInk,   label: '반입 가능', icon: '✓', border: C.ok   + '40' },
  '반입불가':   { color: C.no,   bg: C.noSoft,   ink: C.noInk,   label: '반입 불가', icon: '✕', border: C.no   + '40' },
  '제한적반입': { color: C.warn, bg: C.warnSoft, ink: C.warnInk, label: '제한 반입', icon: '!', border: C.warn + '40' },
  // 영문 키 대응
  'allowed':    { color: C.ok,   bg: C.okSoft,   ink: C.okInk,   label: '반입 가능', icon: '✓', border: C.ok   + '40' },
  'prohibited': { color: C.no,   bg: C.noSoft,   ink: C.noInk,   label: '반입 불가', icon: '✕', border: C.no   + '40' },
  'restricted': { color: C.warn, bg: C.warnSoft, ink: C.warnInk, label: '제한 반입', icon: '!', border: C.warn + '40' },
  'ok':         { color: C.ok,   bg: C.okSoft,   ink: C.okInk,   label: '반입 가능', icon: '✓', border: C.ok   + '40' },
  'no':         { color: C.no,   bg: C.noSoft,   ink: C.noInk,   label: '반입 불가', icon: '✕', border: C.no   + '40' },
  'warn':       { color: C.warn, bg: C.warnSoft, ink: C.warnInk, label: '제한 반입', icon: '!', border: C.warn + '40' },
};

const SLOT_CONFIG = {
  '가능':   { color: C.ok,   bg: C.okSoft,   icon: 'check-circle' },
  '불가':   { color: C.no,   bg: C.noSoft,   icon: 'x-circle' },
  '조건부': { color: C.warn, bg: C.warnSoft, icon: 'alert-circle' },
};

export default function AnalysisResultScreen({ route, navigation }) {
  const { result } = route.params;
  const cfg = STATUS_CONFIG[result.category] || {
    color: C.muted, bg: C.bg, ink: C.ink2,
    label: '확인 필요', icon: '?', border: C.line,
  };
  const carrySlot   = SLOT_CONFIG[result.carry_on] || SLOT_CONFIG['조건부'];
  const checkedSlot = SLOT_CONFIG[result.checked]  || SLOT_CONFIG['조건부'];

  return (
    <View style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>

        {/* Verdict card */}
        <View style={[styles.statusCard, { backgroundColor: cfg.bg, borderColor: cfg.border }]}>
          <View style={[styles.iconCircle, { backgroundColor: cfg.color }]}>
            <Text style={styles.iconText}>{cfg.icon}</Text>
          </View>
          <Text style={[styles.statusLabel, { color: cfg.color }]}>{cfg.label}</Text>
          <Text style={styles.itemName}>{result.item}</Text>
        </View>

        {/* 기내 / 위탁 상태 카드 */}
        <View style={styles.slotsRow}>
          {[
            { label: '기내 반입', slot: carrySlot,   value: result.carry_on   || '알 수 없음', icon: 'wind' },
            { label: '위탁 수하물', slot: checkedSlot, value: result.checked    || '알 수 없음', icon: 'briefcase' },
          ].map(({ label, slot, value, icon }) => (
            <View key={label} style={[styles.slotCard, { backgroundColor: slot.bg }]}>
              <Feather name={slot.icon} size={22} color={slot.color} />
              <Text style={[styles.slotValue, { color: slot.color }]}>{value}</Text>
              <Text style={styles.slotLabel}>{label}</Text>
            </View>
          ))}
        </View>

        {/* Tags */}
        {result.tags && result.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {result.tags.map((tag) => (
              <View key={tag} style={styles.tagBadge}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Explanation */}
        <View style={styles.explanationCard}>
          <Text style={styles.explanationTitle}>상세 안내</Text>
          <Text style={styles.explanation}>{result.explanation}</Text>
        </View>

        {/* AI disclaimer */}
        <View style={styles.disclaimerCard}>
          <Feather name="info" size={14} color={C.warnInk} style={{ marginTop: 1 }} />
          <Text style={styles.disclaimerText}>
            AI 분석 결과는 참고용입니다. 정확한 정보는 항공사 또는 공항 안내를 확인하세요.
          </Text>
        </View>
      </ScrollView>

      {/* Action buttons */}
      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.btnOutline}
          onPress={() => navigation.navigate('TextAnalysis')}
        >
          <Text style={styles.btnOutlineText}>다시 검색</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.btnPrimary}
          onPress={() => navigation.navigate('Camera')}
        >
          <Text style={styles.btnPrimaryText}>카메라로 확인</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  scroll: { padding: 20, paddingBottom: 40 },

  /* Verdict card */
  statusCard: {
    borderRadius: 24, padding: 32, alignItems: 'center',
    marginBottom: 16, borderWidth: 1.5, ...shadow.sm,
  },
  iconCircle: {
    width: 64, height: 64, borderRadius: 32,
    alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  iconText: { color: '#fff', fontSize: 28, fontWeight: '800' },
  statusLabel: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 1.5, marginBottom: 10 },
  itemName: { fontSize: 28, fontWeight: '800', color: C.ink, letterSpacing: -0.5 },

  /* Carry-on / Checked slots */
  slotsRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  slotCard: {
    flex: 1, borderRadius: 18, padding: 16,
    alignItems: 'center', gap: 6,
  },
  slotValue: { fontSize: 17, fontWeight: '800' },
  slotLabel: { fontSize: 12, fontWeight: '600', color: C.muted },

  /* Tags */
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 12 },
  tagBadge: {
    backgroundColor: C.brandSoft, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  tagText: { fontSize: 12, fontWeight: '600', color: C.brand },

  /* Explanation */
  explanationCard: {
    backgroundColor: C.surface, borderRadius: 16, padding: 20, marginBottom: 12, ...shadow.sm,
  },
  explanationTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 10,
  },
  explanation: { fontSize: 15, color: C.ink2, lineHeight: 24 },

  /* Info rows */
  infoCard: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', marginBottom: 12, ...shadow.sm },
  infoRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 20, paddingVertical: 14,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  infoLabel: { fontSize: 14, color: C.ink2 },
  infoValue: { fontSize: 14, fontWeight: '600', color: C.ink },

  /* Disclaimer */
  disclaimerCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 10,
    backgroundColor: C.warnSoft, borderRadius: 14, padding: 14,
    borderWidth: 1, borderColor: C.warn + '30',
  },
  disclaimerText: { flex: 1, fontSize: 13, color: C.warnInk, lineHeight: 19 },

  /* Actions */
  actions: {
    flexDirection: 'row', gap: 10, padding: 16,
    backgroundColor: C.surface, borderTopWidth: 1, borderTopColor: C.line,
  },
  btnOutline: {
    flex: 1, borderRadius: 14, paddingVertical: 16,
    alignItems: 'center', borderWidth: 1.5, borderColor: C.line,
  },
  btnOutlineText: { color: C.ink2, fontWeight: '700', fontSize: 15 },
  btnPrimary: {
    flex: 1, backgroundColor: C.brand,
    borderRadius: 14, paddingVertical: 16, alignItems: 'center',
    ...shadow.brand,
  },
  btnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
});
