import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    <ScrollView style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🚫 반입 금지 물품</Text>
        {PROHIBITED.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚠️ 제한적 반입 물품</Text>
        {RESTRICTED.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>🧳 위탁 수하물만 가능</Text>
        {CHECKED_ONLY.map((item) => (
          <View key={item} style={styles.row}>
            <Text style={styles.dot}>•</Text>
            <Text style={styles.rowText}>{item}</Text>
          </View>
        ))}
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>💰 초과 요금 계산기</Text>
        <Text style={styles.info}>{airline} · 기본 허용 {rule.weight}kg · 초과 시 kg당 ${rule.fee}</Text>
        <View style={styles.calcRow}>
          <TextInput
            style={styles.calcInput}
            placeholder="실제 무게 (kg)"
            value={weight}
            onChangeText={setWeight}
            keyboardType="decimal-pad"
          />
          <TouchableOpacity style={styles.calcButton} onPress={calcFee}>
            <Text style={styles.calcButtonText}>계산</Text>
          </TouchableOpacity>
        </View>
        {fee !== null && (
          <View style={[styles.feeResult, { backgroundColor: fee === 0 ? '#eafaf1' : '#fef9ec' }]}>
            <Text style={[styles.feeText, { color: fee === 0 ? '#27AE60' : '#e67e22' }]}>
              {fee === 0 ? '✅ 초과 요금 없음' : `⚠️ 예상 초과 요금: $${fee}`}
            </Text>
          </View>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  section: {
    backgroundColor: '#fff', margin: 12, marginBottom: 0,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.05, shadowRadius: 4, elevation: 2,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 12 },
  row: { flexDirection: 'row', marginBottom: 8 },
  dot: { color: '#4A90E2', marginRight: 8, fontSize: 16 },
  rowText: { fontSize: 14, color: '#444', flex: 1, lineHeight: 20 },
  info: { fontSize: 13, color: '#888', marginBottom: 12 },
  calcRow: { flexDirection: 'row', gap: 8 },
  calcInput: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 8, padding: 12, fontSize: 15,
  },
  calcButton: {
    backgroundColor: '#4A90E2', borderRadius: 8,
    paddingHorizontal: 20, justifyContent: 'center',
  },
  calcButtonText: { color: '#fff', fontWeight: 'bold' },
  feeResult: { marginTop: 12, borderRadius: 8, padding: 14 },
  feeText: { fontSize: 15, fontWeight: 'bold', textAlign: 'center' },
});
