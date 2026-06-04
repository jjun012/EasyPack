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

const TABS = [
  {
    key: 'prohibited',
    label: '반입금지',
    dotColor: C.no,
    items: [
      { title: '폭발물·화약류', detail: '폭죽, 화약, 신호탄 등 폭발 위험 물질은 기내·위탁 모두 완전 금지입니다. 소량이라도 적발 시 법적 처벌을 받을 수 있어요.' },
      { title: '인화성 가스·액체', detail: '부탄가스, 라이터 연료, 페인트, 시너 등 발화 위험 물질은 기내·위탁 모두 반입 불가입니다.' },
      { title: '독성·방사성 물질', detail: '독극물, 방사성 물질, 감염성 시료 등 인체·항공기에 위험을 줄 수 있는 물질은 일절 반입할 수 없습니다.' },
      { title: '호신용 스프레이', detail: '페퍼 스프레이, 최루 스프레이 등 무력화 장치는 기내·위탁 모두 금지입니다.' },
      { title: '전동킥보드·호버보드', detail: '리튬배터리 내장 전동 이동 수단은 배터리 분리가 불가해 기내·위탁 모두 금지됩니다. 대부분의 항공사가 전동휠, 세그웨이도 동일하게 취급해요.' },
      { title: '토치(제트) 라이터', detail: '고온 불꽃이 나오는 토치형 라이터는 일반 라이터와 달리 기내·위탁 모두 반입 금지입니다.' },
    ],
    accent: C.no, accentSoft: C.noSoft, accentInk: C.noInk,
  },
  {
    key: 'restricted',
    label: '제한적반입',
    dotColor: C.warn,
    items: [
      { title: '액체·젤·에어로졸 (LAGs)', detail: '용기당 100ml 이하, 1L 투명 지퍼백 1개에 담아야 기내 반입 가능합니다. 처방 의약품과 영유아 식품은 필요량 예외 허용됩니다.' },
      { title: '보조배터리 (리튬이온)', detail: '위탁 수하물에는 용량 무관 완전 금지입니다. 기내 반입은 100Wh 이하만 허용, 100~160Wh는 항공사 사전 승인 후 최대 2개, 160Wh 초과는 불가합니다.' },
      { title: '라이터 (일반 부탄)', detail: '일반 부탄 라이터는 1인 1개에 한해 기내 반입만 가능합니다. 위탁 수하물에는 절대 넣을 수 없어요.' },
      { title: '칼·가위류', detail: '날 길이 6cm 이하 가위만 기내 반입 가능합니다. 칼, 커터칼, 맥가이버칼은 기내 반입 불가이며 위탁으로만 허용됩니다.' },
      { title: '노트북·전자기기', detail: '노트북은 기내 반입이 권장됩니다. 위탁 시 파손·분실 위험이 있으며, 보안검색 시 가방에서 꺼내 별도로 제시해야 합니다.' },
      { title: '주류', detail: '알코올 24~70% 주류는 1인 5L까지 위탁 가능, 70% 초과는 금지입니다. 기내 반입은 100ml 이하 용기만 허용됩니다.' },
    ],
    accent: C.warn, accentSoft: C.warnSoft, accentInk: C.warnInk,
  },
  {
    key: 'checkedOnly',
    label: '위탁전용',
    dotColor: C.brand,
    items: [
      { title: '골프채·야구배트', detail: '둔기로 사용될 수 있어 기내 반입이 불가합니다. 위탁 수하물로만 운반 가능하며, 항공사별 스포츠 장비 추가 요금이 부과될 수 있습니다.' },
      { title: '스키·스노보드 장비', detail: '기내 반입 불가, 위탁으로만 가능합니다. 크기·무게에 따라 초과 수하물 요금이 발생할 수 있으니 사전 확인하세요.' },
      { title: '다이빙 장비', detail: '산소통은 완전히 비운 경우에만 위탁 가능합니다. 핀, 마스크, 슈트 등은 일반 위탁 수하물로 처리됩니다.' },
      { title: '자전거', detail: '페달 분리, 핸들바 회전 고정, 타이어 공기 부분 배출 후 위탁 가능합니다. 항공사별 별도 요금과 포장 규정을 반드시 확인하세요.' },
    ],
    accent: C.brand, accentSoft: C.brandSoft, accentInk: C.brandInk,
  },
];

export default function BaggageScreen() {
  const [airline, setAirline] = useState('대한항공');
  const [weight, setWeight] = useState('');
  const [fee, setFee] = useState(null);
  const [activeTab, setActiveTab] = useState('prohibited');
  const [openAccordion, setOpenAccordion] = useState(null);

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
  const currentTab = TABS.find((t) => t.key === activeTab) || TABS[0];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>수하물 가이드</Text>
        <Text style={styles.headerSub}>기내 반입 규정과 초과 요금을 확인하세요</Text>
      </View>

      <View style={styles.body}>
        {/* Page tabs */}
        <View style={styles.tabRow}>
          {TABS.map((t) => (
            <TouchableOpacity
              key={t.key}
              style={[styles.pageTab, activeTab === t.key && styles.pageTabActive]}
              onPress={() => { setActiveTab(t.key); setOpenAccordion(null); }}
              activeOpacity={0.75}
            >
              <View style={[styles.tabDot, { backgroundColor: t.dotColor }]} />
              <Text style={[styles.pageTabText, activeTab === t.key && styles.pageTabTextActive]}>
                {t.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Accordion items for the active tab */}
        <View style={styles.accordionCard}>
          {currentTab.items.map((item, idx) => {
            const isOpen = openAccordion === idx;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.accordionRow, idx < currentTab.items.length - 1 && styles.accordionBorder]}
                onPress={() => setOpenAccordion(isOpen ? null : idx)}
                activeOpacity={0.75}
              >
                <View style={styles.accordionMain}>
                  <View style={[styles.accordionDot, { backgroundColor: currentTab.accent }]} />
                  <Text style={styles.accordionLabel}>{item.title}</Text>
                  <Text style={[styles.accordionChevron, isOpen && styles.accordionChevronOpen]}>›</Text>
                </View>
                {isOpen && (
                  <View style={[styles.accordionDetail, { backgroundColor: currentTab.accentSoft }]}>
                    <Text style={[styles.accordionDetailText, { color: currentTab.accentInk }]}>
                      {item.detail}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Fee calculator */}
        <View style={styles.calcCard}>
          <View style={styles.calcHeader}>
            <View style={[styles.calcBadge, { backgroundColor: C.brandSoft }]}>
              <Text style={[styles.calcBadgeText, { color: C.brand }]}>계산기</Text>
            </View>
            <Text style={styles.calcTitle}>초과 요금 계산</Text>
          </View>

          <View style={styles.ruleInfo}>
            <Text style={styles.ruleAirline}>{airline}</Text>
            <Text style={styles.ruleDetail}>기본 허용 {rule.weight}kg · 초과 kg당 ${rule.fee}</Text>
          </View>

          <View style={styles.calcRow}>
            <TextInput
              style={styles.calcInput}
              placeholder="실제 무게 입력 (kg)"
              placeholderTextColor={C.faint}
              value={weight}
              onChangeText={setWeight}
              keyboardType="decimal-pad"
            />
            <TouchableOpacity style={styles.calcBtn} onPress={calcFee}>
              <Text style={styles.calcBtnText}>계산</Text>
            </TouchableOpacity>
          </View>

          {fee !== null && (
            <View style={[
              styles.feeResult,
              { backgroundColor: fee === 0 ? C.okSoft : C.warnSoft },
            ]}>
              <Text style={[styles.feeText, { color: fee === 0 ? C.okInk : C.warnInk }]}>
                {fee === 0 ? '초과 요금 없음' : `예상 초과 요금 $${fee}`}
              </Text>
              <Text style={[styles.feeSub, { color: fee === 0 ? C.ok : C.warn }]}>
                {fee === 0
                  ? '허용 범위 내예요'
                  : `${(parseFloat(weight) - rule.weight).toFixed(1)}kg 초과`}
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
    backgroundColor: C.ink, paddingTop: 56,
    paddingHorizontal: 24, paddingBottom: 28,
  },
  headerTitle: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5, marginBottom: 4 },
  headerSub: { fontSize: 14, color: 'rgba(255,255,255,0.55)' },

  body: { padding: 16 },

  /* Page tabs */
  tabRow: {
    flexDirection: 'row', gap: 8, marginBottom: 12,
  },
  pageTab: {
    flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 5,
    paddingVertical: 10, borderRadius: 10,
    borderWidth: 1.5, borderColor: C.line, backgroundColor: C.surface,
  },
  pageTabActive: { backgroundColor: C.ink, borderColor: C.ink },
  tabDot: { width: 7, height: 7, borderRadius: 4 },
  pageTabText: { fontSize: 12, fontWeight: '600', color: C.muted },
  pageTabTextActive: { color: '#fff' },

  /* Accordion */
  accordionCard: {
    backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden',
    marginBottom: 12, ...shadow.sm,
  },
  accordionRow: { paddingVertical: 0 },
  accordionBorder: { borderBottomWidth: 1, borderBottomColor: C.line2 },
  accordionMain: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    paddingHorizontal: 18, paddingVertical: 14,
  },
  accordionDot: { width: 8, height: 8, borderRadius: 4 },
  accordionLabel: { flex: 1, fontSize: 14, fontWeight: '500', color: C.ink2 },
  accordionChevron: { fontSize: 18, color: C.faint, fontWeight: '300' },
  accordionChevronOpen: { transform: [{ rotate: '90deg' }] },
  accordionDetail: {
    marginHorizontal: 18, marginBottom: 14,
    borderRadius: 10, padding: 12,
  },
  accordionDetailText: { fontSize: 13, lineHeight: 20 },

  /* Calculator */
  calcCard: { backgroundColor: C.surface, borderRadius: 16, padding: 18, ...shadow.sm },
  calcHeader: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 14 },
  calcBadge: { borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4 },
  calcBadgeText: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },
  calcTitle: { fontSize: 16, fontWeight: '700', color: C.ink },
  ruleInfo: {
    backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 14,
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  ruleAirline: { fontSize: 15, fontWeight: '700', color: C.ink },
  ruleDetail: { fontSize: 13, color: C.ink2 },
  calcRow: { flexDirection: 'row', gap: 8 },
  calcInput: {
    flex: 1, backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink, borderWidth: 1.5, borderColor: C.line,
  },
  calcBtn: {
    backgroundColor: C.brand, borderRadius: 12,
    paddingHorizontal: 20, justifyContent: 'center',
    ...shadow.brand,
  },
  calcBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  feeResult: { marginTop: 12, borderRadius: 12, padding: 16, alignItems: 'center' },
  feeText: { fontSize: 17, fontWeight: '800', marginBottom: 2 },
  feeSub: { fontSize: 13 },
});
