import React, { useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, TextInput, LayoutAnimation, Platform, UIManager,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { C, shadow } from '../../constants/theme';

if (Platform.OS === 'android') {
  UIManager.setLayoutAnimationEnabledExperimental?.(true);
}

const BAGGAGE_RULES = {
  '대한항공':     { carry: 12, hold: 23, excessPerKg: 20000 },
  '아시아나항공': { carry: 10, hold: 23, excessPerKg: 15000 },
  '제주항공':     { carry: 10, hold: 15, excessPerKg: 12000 },
  '티웨이항공':   { carry: 10, hold: 15, excessPerKg: 11000 },
  '진에어항공':   { carry: 12, hold: 15, excessPerKg: 10000 },
};

const TABS = [
  {
    key: 'prohibited', label: '반입 금지 물품', verdict: 'no',
    sub: '기내·위탁 모두 불가', icon: '✕',
    note: '항공 보안법에 따라 기내 반입과 위탁 수하물 모두 금지되는 물품입니다. 적발 시 폐기되며 법적 처벌을 받을 수 있습니다.',
    accent: C.no, accentSoft: C.noSoft, accentInk: C.noInk,
    items: [
      { title: '폭발물·화약류', detail: '폭죽, 화약, 신호탄 등 폭발 위험 물질은 기내·위탁 모두 완전 금지입니다. 소량이라도 적발 시 법적 처벌을 받을 수 있어요.' },
      { title: '인화성 가스·액체', detail: '부탄가스, 라이터 연료, 페인트, 시너 등 발화 위험 물질은 기내·위탁 모두 반입 불가입니다.' },
      { title: '독성·방사성 물질', detail: '독극물, 방사성 물질, 감염성 시료 등 인체·항공기에 위험을 줄 수 있는 물질은 일절 반입할 수 없습니다.' },
      { title: '호신용 스프레이', detail: '페퍼 스프레이, 최루 스프레이 등 무력화 장치는 기내·위탁 모두 금지입니다.' },
      { title: '전동킥보드·호버보드', detail: '리튬배터리 내장 전동 이동 수단은 배터리 분리가 불가해 기내·위탁 모두 금지됩니다.' },
      { title: '토치(제트) 라이터', detail: '고온 불꽃이 나오는 토치형 라이터는 기내·위탁 모두 반입 금지입니다.' },
    ],
  },
  {
    key: 'restricted', label: '제한적 기내 반입', verdict: 'warn',
    sub: '조건부 기내 반입 가능', icon: '!',
    note: '용량·수량 조건을 충족하면 기내 반입이 가능한 물품입니다. 보안검색 시 별도 제시가 필요할 수 있습니다.',
    accent: C.warn, accentSoft: C.warnSoft, accentInk: C.warnInk,
    items: [
      { title: '액체·젤·에어로졸 (LAGs)', detail: '용기당 100ml 이하, 1L 투명 지퍼백 1개에 담아야 기내 반입 가능합니다. 처방 의약품과 영유아 식품은 예외 허용됩니다.' },
      { title: '보조배터리 (리튬이온)', detail: '위탁 수하물에는 용량 무관 완전 금지입니다. 기내 반입은 100Wh 이하만 허용, 100~160Wh는 항공사 사전 승인 후 최대 2개, 160Wh 초과는 불가합니다.' },
      { title: '라이터 (일반 부탄)', detail: '일반 부탄 라이터는 1인 1개에 한해 기내 반입만 가능합니다. 위탁 수하물에는 절대 넣을 수 없어요.' },
      { title: '칼·가위류', detail: '날 길이 6cm 이하 가위만 기내 반입 가능합니다. 칼, 커터칼, 맥가이버칼은 기내 반입 불가이며 위탁으로만 허용됩니다.' },
      { title: '노트북·전자기기', detail: '노트북은 기내 반입이 권장됩니다. 보안검색 시 가방에서 꺼내 별도로 제시해야 합니다.' },
      { title: '주류', detail: '알코올 24~70% 주류는 1인 5L까지 위탁 가능, 70% 초과는 금지입니다. 기내 반입은 100ml 이하 용기만 허용됩니다.' },
    ],
  },
  {
    key: 'checkedOnly', label: '위탁 수하물 전용', verdict: 'ok',
    sub: '위탁만 가능 / 기내 불가', icon: '✓',
    note: '기내 반입은 안 되지만 위탁 수하물로는 부칠 수 있는 물품입니다. 일부는 수량·포장 조건이 있습니다.',
    accent: C.ok, accentSoft: C.okSoft, accentInk: C.okInk,
    items: [
      { title: '골프채·야구배트', detail: '둔기로 사용될 수 있어 기내 반입이 불가합니다. 위탁 수하물로만 운반 가능하며, 항공사별 스포츠 장비 추가 요금이 부과될 수 있습니다.' },
      { title: '스키·스노보드 장비', detail: '기내 반입 불가, 위탁으로만 가능합니다. 크기·무게에 따라 초과 수하물 요금이 발생할 수 있으니 사전 확인하세요.' },
      { title: '다이빙 장비', detail: '산소통은 완전히 비운 경우에만 위탁 가능합니다. 핀, 마스크, 슈트 등은 일반 위탁 수하물로 처리됩니다.' },
      { title: '자전거', detail: '페달 분리, 핸들바 고정, 타이어 공기 부분 배출 후 위탁 가능합니다. 항공사별 별도 요금과 포장 규정을 반드시 확인하세요.' },
    ],
  },
];

export default function BaggageScreen() {
  const [airline, setAirline] = useState('대한항공');
  const [pageIndex, setPageIndex] = useState(0);
  const [openIdx, setOpenIdx] = useState(0);
  const [weight, setWeight] = useState('');
  const [fee, setFee] = useState(null);

  React.useEffect(() => {
    AsyncStorage.getItem('user').then((s) => {
      if (s) setAirline(JSON.parse(s).airline || '대한항공');
    });
  }, []);

  function goPage(n) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setPageIndex(n);
    setOpenIdx(0);
  }

  function toggleAccordion(i) {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setOpenIdx(openIdx === i ? -1 : i);
  }

  function calcFee() {
    const w = parseFloat(weight);
    if (isNaN(w) || w <= 0) return;
    const rule = BAGGAGE_RULES[airline] || BAGGAGE_RULES['대한항공'];
    const over = Math.max(0, w - rule.hold);
    setFee({ over: +over.toFixed(1), amount: Math.ceil(over) * rule.excessPerKg });
  }

  const tab = TABS[pageIndex];
  const rule = BAGGAGE_RULES[airline] || BAGGAGE_RULES['대한항공'];

  const verdictColors = {
    no:   { soft: C.noSoft,   main: C.no,   ink: C.noInk },
    warn: { soft: C.warnSoft, main: C.warn, ink: C.warnInk },
    ok:   { soft: C.okSoft,   main: C.ok,   ink: C.okInk },
  };
  const V = verdictColors[tab.verdict];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>수하물 정보</Text>
        <Text style={styles.headerSub}>항공 반입 규정 한눈에 보기</Text>
      </View>

      {/* Page tabs */}
      <ScrollView
        horizontal showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.tabScroll}
        style={styles.tabScrollWrap}
      >
        {TABS.map((t, i) => {
          const vc = verdictColors[t.verdict];
          const active = i === pageIndex;
          return (
            <TouchableOpacity
              key={t.key}
              style={[styles.tabBtn, active && styles.tabBtnActive]}
              onPress={() => goPage(i)}
              activeOpacity={0.75}
            >
              <View style={[styles.tabDot, { backgroundColor: vc.main }]} />
              <Text style={[styles.tabBtnText, active && styles.tabBtnTextActive]}>{t.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.body}>
        {/* Page header card */}
        <View style={[styles.pageHeaderCard, { overflow: 'hidden' }]}>
          <View style={[styles.pageHeaderTop, { backgroundColor: V.soft }]}>
            <View style={[styles.pageHeaderIcon, { backgroundColor: V.main }]}>
              <Text style={styles.pageHeaderIconText}>{tab.icon}</Text>
            </View>
            <View style={styles.pageHeaderTexts}>
              <Text style={styles.pageHeaderTitle}>{tab.label}</Text>
              <Text style={[styles.pageHeaderSub, { color: V.ink }]}>{tab.sub}</Text>
            </View>
          </View>
          <Text style={styles.pageHeaderNote}>{tab.note}</Text>
        </View>

        {/* Accordion items */}
        <View style={styles.accordionList}>
          {tab.items.map((item, idx) => {
            const isOpen = openIdx === idx;
            return (
              <TouchableOpacity
                key={item.title}
                style={[styles.accordionCard, { overflow: 'hidden' }]}
                onPress={() => toggleAccordion(idx)}
                activeOpacity={0.85}
              >
                <View style={styles.accordionHeader}>
                  <View style={[styles.numBadge, { backgroundColor: V.soft }]}>
                    <Text style={[styles.numBadgeText, { color: V.ink }]}>{idx + 1}</Text>
                  </View>
                  <Text style={styles.accordionTitle}>{item.title}</Text>
                  <Text style={[styles.chevron, isOpen && styles.chevronOpen]}>⌄</Text>
                </View>
                {isOpen && (
                  <Text style={[styles.accordionBody, { color: tab.accentInk || C.ink2 }]}>
                    {item.detail}
                  </Text>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Prev / Next buttons */}
        <View style={styles.navBtns}>
          <TouchableOpacity
            style={[styles.navBtn, styles.navBtnGhost, pageIndex === 0 && styles.navBtnDisabled]}
            onPress={() => pageIndex > 0 && goPage(pageIndex - 1)}
            disabled={pageIndex === 0}
            activeOpacity={0.75}
          >
            <Text style={styles.navBtnGhostText}>‹ 이전</Text>
          </TouchableOpacity>
          {pageIndex < TABS.length - 1 ? (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={() => goPage(pageIndex + 1)} activeOpacity={0.85}>
              <Text style={styles.navBtnPrimaryText}>다음 ›</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={[styles.navBtn, styles.navBtnPrimary]} onPress={() => goPage(0)} activeOpacity={0.85}>
              <Text style={styles.navBtnPrimaryText}>처음으로</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Fee calculator */}
        <View style={styles.calcCard}>
          <View style={styles.calcTitleRow}>
            <View style={styles.calcIconBox}>
              <Text style={styles.calcIcon}>⊙</Text>
            </View>
            <Text style={styles.calcTitle}>초과 요금 계산기</Text>
          </View>

          <View style={styles.ruleRow}>
            <Text style={styles.ruleAirline}>{airline}</Text>
            <Text style={styles.ruleDetail}>위탁 {rule.hold}kg · 기내 {rule.carry}kg</Text>
          </View>

          <Text style={styles.calcFieldLabel}>내 수하물 무게 (kg)</Text>
          <View style={styles.calcInputRow}>
            <TextInput
              style={styles.calcInput}
              placeholder="0"
              placeholderTextColor={C.faint}
              value={weight}
              onChangeText={(t) => { setWeight(t); setFee(null); }}
              keyboardType="decimal-pad"
            />
            <Text style={styles.calcUnit}>kg</Text>
            <TouchableOpacity style={styles.calcBtn} onPress={calcFee} activeOpacity={0.85}>
              <Text style={styles.calcBtnText}>계산</Text>
            </TouchableOpacity>
          </View>

          {fee !== null && (
            <View style={[styles.feeResult, { backgroundColor: fee.over > 0 ? C.noSoft : C.okSoft }]}>
              {fee.over > 0 ? (
                <>
                  <View style={styles.feeTopRow}>
                    <Text style={[styles.feeLabel, { color: C.noInk }]}>초과 중량</Text>
                    <Text style={[styles.feeOver, { color: C.noInk }]}>+{fee.over}kg</Text>
                  </View>
                  <View style={[styles.feeDivider, { backgroundColor: 'rgba(168,31,31,0.15)' }]} />
                  <Text style={[styles.feeSubLabel, { color: C.noInk }]}>예상 추가 요금</Text>
                  <Text style={[styles.feeAmount, { color: C.noInk }]}>
                    ₩{fee.amount.toLocaleString()}
                  </Text>
                </>
              ) : (
                <View style={styles.feeOkRow}>
                  <View style={styles.feeOkCheck}>
                    <Text style={styles.feeOkCheckText}>✓</Text>
                  </View>
                  <View>
                    <Text style={[styles.feeOkTitle, { color: C.okInk }]}>무료 허용 범위예요!</Text>
                    <Text style={[styles.feeOkSub, { color: C.okInk }]}>{rule.hold}kg까지 추가 요금 없이 부칠 수 있어요.</Text>
                  </View>
                </View>
              )}
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
    backgroundColor: C.bg, paddingTop: 56,
    paddingHorizontal: 18, paddingBottom: 12,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  headerSub: { fontSize: 13, color: C.muted, fontWeight: '500', marginTop: 2 },

  tabScrollWrap: { backgroundColor: C.bg },
  tabScroll: { paddingHorizontal: 18, paddingBottom: 14, gap: 8 },
  tabBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    height: 38, paddingHorizontal: 14, borderRadius: 999,
    backgroundColor: C.surface,
    borderWidth: 1, borderColor: C.line,
  },
  tabBtnActive: { backgroundColor: C.ink, borderColor: C.ink },
  tabDot: { width: 8, height: 8, borderRadius: 99 },
  tabBtnText: { fontSize: 13.5, fontWeight: '700', color: C.ink2 },
  tabBtnTextActive: { color: '#fff' },

  body: { paddingHorizontal: 18, paddingBottom: 40 },

  pageHeaderCard: { backgroundColor: C.surface, borderRadius: 22, marginBottom: 14, ...shadow.sm },
  pageHeaderTop: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 18 },
  pageHeaderIcon: { width: 48, height: 48, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  pageHeaderIconText: { color: '#fff', fontSize: 22, fontWeight: '800' },
  pageHeaderTexts: {},
  pageHeaderTitle: { fontSize: 19, fontWeight: '700', color: C.ink },
  pageHeaderSub: { fontSize: 13, fontWeight: '700', marginTop: 2 },
  pageHeaderNote: { fontSize: 14, color: C.ink2, lineHeight: 22, padding: '14px 18px', paddingHorizontal: 18, paddingVertical: 14 },

  accordionList: { gap: 10, marginBottom: 20 },
  accordionCard: { backgroundColor: C.surface, borderRadius: 18, ...shadow.sm },
  accordionHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 16 },
  numBadge: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  numBadgeText: { fontSize: 12, fontWeight: '700' },
  accordionTitle: { flex: 1, fontSize: 15, fontWeight: '700', color: C.ink },
  chevron: { fontSize: 20, color: C.muted, fontWeight: '300' },
  chevronOpen: { transform: [{ rotate: '180deg' }] },
  accordionBody: { fontSize: 14, lineHeight: 22, paddingHorizontal: 16, paddingBottom: 16, paddingTop: 0 },

  navBtns: { flexDirection: 'row', gap: 10, marginBottom: 28 },
  navBtn: { flex: 1, height: 54, borderRadius: 16, alignItems: 'center', justifyContent: 'center' },
  navBtnGhost: { backgroundColor: C.surface, borderWidth: 1.5, borderColor: C.line },
  navBtnGhostText: { color: C.ink, fontWeight: '700', fontSize: 15 },
  navBtnPrimary: { backgroundColor: C.brand, flex: 1.4, ...shadow.brand },
  navBtnPrimaryText: { color: '#fff', fontWeight: '700', fontSize: 15 },
  navBtnDisabled: { opacity: 0.4 },

  calcCard: { backgroundColor: C.surface, borderRadius: 16, padding: 20, ...shadow.sm },
  calcTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  calcIconBox: { width: 32, height: 32, borderRadius: 10, backgroundColor: C.accentSoft, alignItems: 'center', justifyContent: 'center' },
  calcIcon: { fontSize: 16, color: C.accentInk },
  calcTitle: { fontSize: 17, fontWeight: '700', color: C.ink },
  ruleRow: { backgroundColor: C.bg, borderRadius: 12, padding: 14, marginBottom: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  ruleAirline: { fontSize: 15, fontWeight: '700', color: C.ink },
  ruleDetail: { fontSize: 13, color: C.ink2 },
  calcFieldLabel: { fontSize: 13, fontWeight: '700', color: C.ink2, marginBottom: 8 },
  calcInputRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 0 },
  calcInput: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14,
    paddingHorizontal: 16, paddingVertical: 13,
    fontSize: 20, fontWeight: '700', color: C.ink,
    borderWidth: 1.5, borderColor: C.line,
  },
  calcUnit: { position: 'absolute', right: 90, fontSize: 15, fontWeight: '700', color: C.faint },
  calcBtn: { backgroundColor: C.ink, borderRadius: 14, paddingHorizontal: 22, height: 52, justifyContent: 'center' },
  calcBtnText: { color: '#fff', fontWeight: '700', fontSize: 15 },

  feeResult: { marginTop: 16, borderRadius: 16, padding: 18 },
  feeTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  feeLabel: { fontSize: 13.5, fontWeight: '700' },
  feeOver: { fontSize: 15, fontWeight: '800' },
  feeDivider: { height: 1, marginBottom: 12 },
  feeSubLabel: { fontSize: 13, fontWeight: '600', marginBottom: 4 },
  feeAmount: { fontSize: 32, fontWeight: '800', letterSpacing: -0.5 },
  feeOkRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  feeOkCheck: { width: 42, height: 42, borderRadius: 99, backgroundColor: C.ok, alignItems: 'center', justifyContent: 'center' },
  feeOkCheckText: { color: '#fff', fontSize: 18, fontWeight: '800' },
  feeOkTitle: { fontSize: 15.5, fontWeight: '800' },
  feeOkSub: { fontSize: 12.5, fontWeight: '600', marginTop: 2 },
});
