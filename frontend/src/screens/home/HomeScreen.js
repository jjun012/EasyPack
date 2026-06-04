import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow, CITY_DATA, COUNTRY_DATA, AIRLINE_DATA } from '../../constants/theme';

/* ── Gradient map (matches design HERO object) ── */
const COUNTRY_GRAD = {
  '일본':   ['#F7B7C4', '#E26A8D', '#7B3A6E'],
  '미국':   ['#7FB0FF', '#3F6BD6', '#1B2A6B'],
  '베트남': ['#73D9C4', '#1FA98A', '#0C5C53'],
  '필리핀': ['#9AE6B4', '#2FB572', '#0B6E3D'],
  '태국':   ['#FFC98A', '#F38B3C', '#A8431A'],
};

const BAGGAGE_CARRY = { '대한항공': 12, '아시아나항공': 10, '제주항공': 10, '티웨이항공': 10, '진에어항공': 12 };
const BAGGAGE_HOLD  = { '대한항공': 23, '아시아나항공': 23, '제주항공': 15, '티웨이항공': 15, '진에어항공': 15 };

function weatherIconName(code) {
  const c = Number(code);
  if (c === 113) return 'sun';
  if (c === 116) return 'cloud';
  if (c <= 122) return 'cloud';
  if ([179,182,185,227,230,317,320,323,326,329,332,335,338,350,368,371,374,377].includes(c)) return 'cloud-snow';
  if (c === 200 || c >= 386) return 'cloud-lightning';
  return 'cloud-rain';
}

function weatherLabel(code) {
  const c = Number(code);
  if (c === 113) return '맑음';
  if (c === 116) return '구름 조금';
  if (c <= 122) return '흐림';
  if ([179,182,185,227,230].includes(c)) return '눈';
  if (c === 200 || c >= 386) return '천둥번개';
  return '비';
}

export default function HomeScreen({ navigation }) {
  const [user, setUser]               = useState(null);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [weather, setWeather]         = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);

  useFocusEffect(useCallback(() => { loadData(); }, []));

  async function loadData() {
    try {
      const stored = await AsyncStorage.getItem('user');
      const u = stored ? JSON.parse(stored) : null;
      if (u) setUser(u);
      const posts = await api.get('/api/community/posts/popular');
      setPopularPosts(posts);
      const d = u?.travelDestination;
      if (d) {
        const weatherCity = CITY_DATA[d] ? d : (COUNTRY_DATA[d] ? COUNTRY_DATA[d].city : null);
        if (weatherCity) { setWeatherLoading(true); fetchWeather(weatherCity); }
      }
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeather(cityName) {
    try {
      const wttrName = CITY_DATA[cityName]?.wttr || cityName;
      const res  = await fetch(`https://wttr.in/${encodeURIComponent(wttrName)}?format=j1`);
      const json = await res.json();
      const cur   = json.current_condition?.[0];
      const today = json.weather?.[0];
      if (cur) {
        setWeather({
          temp: cur.temp_C,
          hi:   today?.maxtempC  || cur.temp_C,
          lo:   today?.mintempC  || cur.temp_C,
          rain: today?.hourly?.[4]?.chanceofrain || '0',
          hum:  cur.humidity,
          wind: Math.round((Number(cur.windspeedKmph) || 0) / 3.6),
          icon: weatherIconName(cur.weatherCode),
          cond: weatherLabel(cur.weatherCode),
        });
      }
    } catch (e) {
    } finally {
      setWeatherLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={C.brand} />;

  const dest = user?.travelDestination;
  // dest가 도시명("방콕")이면 직접 조회, 국가명("태국")이면 COUNTRY_DATA 기본 도시로 폴백
  const cityInfo    = CITY_DATA[dest] || (COUNTRY_DATA[dest] ? CITY_DATA[COUNTRY_DATA[dest].city] || {} : {});
  const country     = cityInfo.country || (COUNTRY_DATA[dest] ? dest : null);
  const countryInfo = COUNTRY_DATA[country] || {};
  const airlineInfo = AIRLINE_DATA[user?.airline] || {};
  const hasCity     = !!country;
  const heroGrad    = COUNTRY_GRAD[country] || ['#2F6BFF', '#1C49C2', '#0E2A6E'];
  const nick        = user?.nickname || 'U';

  const MENUS = [
    { screen: 'Camera',    icon: 'maximize',       label: '물품 촬영',   desc: 'AI로 반입 확인',   bg: C.brandSoft,  ink: C.brandInk },
    { screen: 'Community', icon: 'message-square', label: '커뮤니티',    desc: '나라별 여행 후기', bg: C.accentSoft, ink: C.accentInk },
    { screen: 'Baggage',   icon: 'briefcase',      label: '수하물 정보', desc: '반입 규정 안내',   bg: C.okSoft,     ink: C.okInk },
  ];

  return (
    <SafeAreaView style={s.safeArea} edges={['top']}>
      <StatusBar barStyle="dark-content" />
      <ScrollView style={s.container} showsVerticalScrollIndicator={false}>

      {/* ── Header ── */}
      <View style={s.header}>
        {/* EasyPack logo */}
        <View style={s.logo}>
          <View style={s.logoMark}>
            <Text style={s.logoMarkText}>EP</Text>
          </View>
          <Text style={s.logoWord}>Easy<Text style={s.logoWordBrand}>Pack</Text></Text>
        </View>
        <View style={s.headerRight}>
          <TouchableOpacity style={s.iconBtn} activeOpacity={0.75}>
            <Feather name="bell" size={20} color={C.ink} />
          </TouchableOpacity>
          <TouchableOpacity
            style={s.iconBtn}
            onPress={() => navigation.navigate('Profile')}
            activeOpacity={0.75}
          >
            <View style={s.avatar}>
              <Text style={s.avatarText}>{nick[0].toUpperCase()}</Text>
            </View>
          </TouchableOpacity>
        </View>
      </View>

      {/* ── Hero destination card ── */}
      <View style={s.px}>
        <View style={s.heroCard}>
          {/* gradient image area */}
          <LinearGradient
            colors={heroGrad}
            start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}
            style={s.heroImg}
          >
            {/* diagonal stripe overlay */}
            <View style={s.heroStripes} />
            {/* dark vignette overlay */}
            <LinearGradient
              colors={['rgba(0,0,0,0.18)', 'transparent', 'rgba(0,0,0,0.46)']}
              style={StyleSheet.absoluteFill}
            />

            {/* top row */}
            <View style={s.heroTopRow}>
              {/* route pill */}
              <View style={s.routePill}>
                <View style={s.routeChip}><Text style={s.routeChipText}>ICN</Text></View>
                <Feather name="send" size={13} color="#fff" style={{ opacity: 0.9 }} />
                <View style={s.routeChip}>
                  <Text style={s.routeChipText}>
                    {hasCity ? (cityInfo.countryCode || countryInfo.code || '??') : '--'}
                  </Text>
                </View>
              </View>
              {/* weather pill */}
              {weather && (
                <View style={s.weatherPill}>
                  <Feather name={weather.icon} size={16} color="#fff" />
                  <Text style={s.weatherPillTemp}>{weather.temp}°</Text>
                </View>
              )}
            </View>

            {/* bottom city info */}
            <View>
              {hasCity ? (
                <>
                  <Text style={s.heroEyebrow}>
                    NEXT TRIP · {(country || '').toUpperCase()}
                  </Text>
                  <Text style={s.heroCity}>{dest}</Text>
                  <Text style={s.heroSub}>
                    {countryInfo.emoji || ''}
                    {weather ? ` · ${weather.cond} ${weather.lo}°/${weather.hi}°` : weatherLoading ? ' · 날씨 불러오는 중…' : ''}
                  </Text>
                </>
              ) : (
                <>
                  <Text style={s.heroEyebrow}>NEXT TRIP</Text>
                  <Text style={s.heroCity}>여행지 미설정</Text>
                  <TouchableOpacity
                    style={s.heroSetBtn}
                    onPress={() => navigation.navigate('Profile')}
                    activeOpacity={0.85}
                  >
                    <Text style={s.heroSetBtnText}>프로필에서 여행지 설정하기 →</Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          </LinearGradient>

          {/* weather strip */}
          {weather && (
            <View style={s.weatherStrip}>
              {[
                { icon: 'droplet',     label: '강수', value: `${weather.rain}%` },
                { icon: 'thermometer', label: '습도', value: `${weather.hum}%` },
                { icon: 'wind',        label: '바람', value: `${weather.wind}m/s` },
              ].map(({ icon, label, value }, i) => (
                <View key={label} style={[s.weatherCell, i > 0 && s.weatherCellBorder]}>
                  <Feather name={icon} size={16} color={C.muted} />
                  <Text style={s.weatherValue}>{value}</Text>
                  <Text style={s.weatherLabel}>{label}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </View>

      {/* ── Quick menus ── */}
      <View style={s.px}>
        <View style={s.sectionRow}>
          <Text style={s.sectionTitle}>무엇을 도와드릴까요?</Text>
        </View>
        <View style={s.quickRow}>
          {MENUS.map(({ screen, icon, label, desc, bg, ink }) => (
            <TouchableOpacity
              key={screen}
              style={s.quickCard}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.75}
            >
              <View style={[s.quickIcon, { backgroundColor: bg }]}>
                <Feather name={icon} size={23} color={ink} />
              </View>
              <View>
                <Text style={s.quickLabel}>{label}</Text>
                <Text style={s.quickDesc}>{desc}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── Airline banner ── */}
      {user?.airline && (
        <View style={[s.px, { marginTop: 18 }]}>
          <TouchableOpacity
            style={s.airlineBanner}
            onPress={() => navigation.navigate('Baggage')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[C.ink, '#1a2c54']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={s.airlineBannerGrad}
            >
              <View style={s.airlineBannerLeft}>
                <View style={[s.airlineMark, { backgroundColor: airlineInfo.color || C.brand }]}>
                  <Text style={s.airlineMarkText}>{airlineInfo.code || 'KE'}</Text>
                </View>
                <View style={{ gap: 3 }}>
                  <Text style={s.airlineEyebrow}>MY AIRLINE</Text>
                  <Text style={s.airlineName}>{user.airline} 수하물 규정</Text>
                  <Text style={s.airlineSub}>
                    위탁 {BAGGAGE_HOLD[user.airline] || 23}kg · 기내 {BAGGAGE_CARRY[user.airline] || 12}kg · 초과요금 계산
                  </Text>
                </View>
              </View>
              <View style={s.airlineArrow}>
                <Feather name="chevron-right" size={18} color="#fff" />
              </View>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      )}

      {/* ── Popular posts ── */}
      {popularPosts.length > 0 && (
        <View style={[s.px, { marginTop: 22 }]}>
          <View style={s.sectionRow}>
            <Text style={s.sectionTitle}>지금 뜨는 여행기</Text>
            <TouchableOpacity onPress={() => navigation.navigate('Community')} activeOpacity={0.7}>
              <Text style={s.moreBtn}>더보기</Text>
            </TouchableOpacity>
          </View>
          <View style={s.popularCard}>
            {popularPosts.slice(0, 2).map((post, i) => {
              const cd = COUNTRY_DATA[post.country] || {};
              return (
                <React.Fragment key={post.id}>
                  {i > 0 && <View style={s.divider} />}
                  <TouchableOpacity
                    style={s.popularRow}
                    onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                    activeOpacity={0.75}
                  >
                    <View style={[s.flagChip, { backgroundColor: cd.tint || C.brandSoft }]}>
                      <Text style={[s.flagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                    </View>
                    <View style={s.popularMeta}>
                      <Text style={s.popularTitle} numberOfLines={1}>{post.title}</Text>
                      <View style={s.popularBottom}>
                        <Text style={s.popularAuthor}>{post.authorNickname}</Text>
                        <View style={s.popularLikeRow}>
                          <Feather name="heart" size={11} color={C.no} />
                          <Text style={s.popularLike}>{post.likeCount}</Text>
                        </View>
                      </View>
                    </View>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
          </View>
        </View>
      )}

      <View style={{ height: 110 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: C.bg },
  container: { flex: 1, backgroundColor: C.bg },
  px:        { paddingHorizontal: 18 },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18,
    paddingTop: 16, paddingBottom: 16,
    backgroundColor: C.bg,
  },
  logo: { flexDirection: 'row', alignItems: 'center', gap: 9 },
  logoMark: {
    width: 34, height: 34, borderRadius: 10,
    backgroundColor: C.brandSoft,
    alignItems: 'center', justifyContent: 'center',
  },
  logoMarkText:   { color: C.brand, fontSize: 13, fontWeight: '900', letterSpacing: -0.5 },
  logoWord:       { fontSize: 21, fontWeight: '400', color: C.ink, letterSpacing: -0.5 },
  logoWordBrand:  { fontWeight: '800', color: C.brand },
  headerRight:    { flexDirection: 'row', gap: 8 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 13,
    backgroundColor: C.surface,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.sm,
  },
  avatar: {
    width: 28, height: 28, borderRadius: 999,
    backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 13, fontWeight: '700' },

  /* Hero */
  heroCard: {
    backgroundColor: C.surface,
    borderRadius: 26, overflow: 'hidden',
    ...shadow.md,
    marginTop: 4,
  },
  heroImg:     { height: 224, justifyContent: 'space-between', padding: 16 },
  heroStripes: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.07,
  },

  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999,
    paddingVertical: 7, paddingLeft: 8, paddingRight: 13,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  routeChip: {
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 7, paddingHorizontal: 7, paddingVertical: 3,
  },
  routeChipText: { fontSize: 12, fontWeight: '700', color: '#fff', fontVariant: ['tabular-nums'] },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
    borderWidth: 1, borderColor: 'rgba(255,255,255,0.25)',
  },
  weatherPillTemp: { fontSize: 14, fontWeight: '800', color: '#fff' },

  heroEyebrow: { fontSize: 12, fontWeight: '700', color: 'rgba(255,255,255,0.82)', letterSpacing: 1.5, marginBottom: 3 },
  heroCity:    { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 32 },
  heroSub:     { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.78)', marginTop: 5 },
  heroSetBtn:  {
    marginTop: 10, alignSelf: 'flex-start',
    backgroundColor: 'rgba(255,255,255,0.20)',
    borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6,
  },
  heroSetBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Weather strip */
  weatherStrip: { flexDirection: 'row', padding: 4, backgroundColor: C.surface },
  weatherCell: {
    flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4,
  },
  weatherCellBorder: { borderLeftWidth: 1, borderLeftColor: C.line2 },
  weatherValue: { fontSize: 14, fontWeight: '700', color: C.ink },
  weatherLabel: { fontSize: 11, fontWeight: '600', color: C.muted },

  /* Section header */
  sectionRow:  { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12, marginTop: 22 },
  sectionTitle:{ fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },
  moreBtn:     { fontSize: 13, fontWeight: '700', color: C.brand },

  /* Quick menus */
  quickRow: { flexDirection: 'row', gap: 10 },
  quickCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 22,
    padding: 16, paddingBottom: 14,
    alignItems: 'flex-start', gap: 12,
    ...shadow.sm,
  },
  quickIcon:  { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickLabel: { fontSize: 14.5, fontWeight: '700', color: C.ink },
  quickDesc:  { fontSize: 11, fontWeight: '600', color: C.muted, marginTop: 2 },

  /* Airline banner */
  airlineBanner:     { borderRadius: 22, overflow: 'hidden', ...shadow.md },
  airlineBannerGrad: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  airlineBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  airlineMark: {
    width: 46, height: 46, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  airlineMarkText:  { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  airlineEyebrow:   { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5 },
  airlineName:      { fontSize: 16, fontWeight: '700', color: '#fff' },
  airlineSub:       { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.65)' },
  airlineArrow: {
    width: 34, height: 34, borderRadius: 99,
    backgroundColor: 'rgba(255,255,255,0.14)',
    alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
  },

  /* Popular posts */
  popularCard: { backgroundColor: C.surface, borderRadius: 22, overflow: 'hidden', ...shadow.sm },
  popularRow:  { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },
  divider:     { height: 1, backgroundColor: C.line2, marginLeft: 16 },
  flagChip:    { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  flagCode:    { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  popularMeta: { flex: 1, gap: 3 },
  popularTitle: { fontSize: 14.5, fontWeight: '700', color: C.ink },
  popularBottom:{ flexDirection: 'row', alignItems: 'center', gap: 10 },
  popularAuthor:{ fontSize: 11.5, fontWeight: '600', color: C.muted },
  popularLikeRow:{ flexDirection: 'row', alignItems: 'center', gap: 3 },
  popularLike:  { fontSize: 11.5, fontWeight: '700', color: C.no },
});
