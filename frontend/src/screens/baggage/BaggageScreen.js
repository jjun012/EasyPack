import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, shadow } from '../../constants/theme';

const BAGGAGE_RULES = {
  '대한항공':    { weight: 23, fee: 100 },
  '아시아나항공': { weight: 23, fee: 100 },
  '제주항공':    { weight: 15, fee: 15 },
  '티웨이항공':  { weight: 15, fee: 15 },
  '진에어항공':  { weight: 15, fee: 15 },
};

const PROHIBITED = ['폭발물', '인화성 물질', '독성 물질', '방사성 물질', '압축가스', '산화성 물질'];
const RESTRICTED = ['액체류 (100ml 초과)', '보조배터리 (160Wh 초과)', '라이터 (위탁 불가)', '칼·가위류 (기내 반입 불가)'];
const CHECKED_ONLY = ['스포츠 장비', '자전거', '서핑보드', '골프채'];

const SECTIONS = [
  { title: '반입 금지', items: PROHIBITED, color: C.error, bg: C.errorBg, indicator: '금지' },
  { title: '제한 반입', items: RESTRICTED, color: C.warning, bg: C.warningBg, indicator: '제한' },
  { title: '위탁 전용', items: CHECKED_ONLY, color: '#6366F1', bg: '#EEF2FF', indicator: '위탁' },
];

export default function BaggageScreen() {
  const [airline, setAirline] = useState('대한항공');
  const [weight, setWeight] = useState('');
  const [fee, setFee] = useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('user').then((s) => {
      if (s) setAirline(JSON.parse(s).airline || '대한항공');
    });
  }, []);

  function calcFee() {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    const rule = BAGGAGE_RULES[airline] || BAGGAGE_RULES['대한항공'];
    const over = Math.max(0, w - rule.weight);
    setFee(over > 0 ? Math.ceil(over) * rule.fee : 0);
  }

  const rule = BAGGAGE_RULES[airline] || BAGGAGE_RULES['대한항공'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>수하물 가이드</Text>
        <Text style={styles.headerSub}>기내 반입 규정과 초과 요금을 확인하세요</Text>
      </View>

      <View style={styles.body}>
        {SECTIONS.map(({ title, items, color, bg, indicator }) => (
          <View key={title} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={[styles.indicatorBadge, { backgroundColor: bg }]}>
                <Text style={[styles.indicatorText, { color }]}>{indicator}</Text>
              </View>
              <Text style={styles.cardTitle}>{title}</Text>
            </View>
            {items.map((item) => (
              <View key={item} style={styles.itemRow}>
                <View style={[styles.dot, { backgroundColor: color }]} />
                <Text style={styles.itemText}>{item}</Text>
              </View>
            ))}
          </View>
        ))}

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={[styles.indicatorBadge, { backgroundColor: C.primaryLight }]}>
              <Text style={[styles.indicatorText, { color: C.primary }]}>계산기</Text>
            </View>
            <Text style={styles.cardTitle}>초과 요금 계산</Text>
          </View>
          <View style={styles.ruleInfo}>
            <Text style={styles.ruleAirline}>{airline}</Text>
            <Text style={styles.ruleDetail}>기본 허용 {rule.weight}kg · 초과 kg당 ${rule.fee}</Text>
          </View>
          <View style={styles.calcRow}>
            <TextInput
              style={styles.calcInput}
              placeholder="실제 무게 입력 (kg)"
              placeholderTextColor={C.textMuted}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.calcBtn} onPress={calcFee}>
              <Text style={styles.calcBtnText}>계산</Text>
            </TouchableOpacity>
          </View>
          {fee !== null && (
            <View style={[styles.feeResult, { backgroundColor: fee === 0 ? C.successBg : C.warningBg }]}>
              <Text style={[styles.feeText, { color: fee === 0 ? C.success : C.warning }]}>
                {fee === 0 ? '초과 요금 없음' : `예상 초과 요금 $${fee}`}
              </Text>
              <Text style={[styles.feeSub, { color: fee === 0 ? C.success : C.warning }]}>
                {fee === 0 ? '허용 범위 내예요' : `${parseFloat(weight) - rule.weight}kg 초과`}
              </Text>
            </View>
          )}
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: '#1A1F36', paddingTop: 56,
    paddingHorizontal: 24, paddingBottom: 28,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.6)' },
  body: { padding: 16 },
  card: { backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 12, ...shadow.sm },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  indicatorBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  indicatorText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  cardTitle: { fontSize: 16, fontWeight: '700', color: C.text },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },
  itemText: { fontSize: 14, color: C.textSec, flex: 1 },
  ruleInfo: {
    backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  ruleAirline: { fontSize: 15, fontWeight: '700', color: C.text },
  ruleDetail: { fontSize: 13, color: C.textSec },
  calcRow: { flexDirection: 'row', gap: 8 },
  calcInput: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.text, borderWidth: 1.5, borderColor: C.border,
  },
  calcBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  calcBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  feeResult: { marginTop: 12, borderRadius: 12, padding: 16, alignItems: 'center' },
  feeText: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  feeSub: { fontSize: 13 },
});
