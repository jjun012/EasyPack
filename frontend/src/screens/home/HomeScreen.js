import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow, CITY_DATA, COUNTRY_DATA, AIRLINE_DATA } from '../../constants/theme';

const QUICK_MENUS = [
  { label: '물품 촬영', desc: 'AI로 반입 확인',   screen: 'Camera',    bg: C.brandSoft,  ink: C.brandInk,  icon: '⬡' },
  { label: '커뮤니티', desc: '나라별 여행 후기',  screen: 'Community', bg: C.accentSoft, ink: C.accentInk, icon: '✈' },
  { label: '수하물 정보', desc: '반입 규정 안내', screen: 'Baggage',   bg: C.okSoft,     ink: C.okInk,     icon: '🧳' },
];

const BAGGAGE_CARRY = { '대한항공': 12, '아시아나항공': 10, '제주항공': 10, '티웨이항공': 10, '진에어항공': 12 };
const BAGGAGE_HOLD  = { '대한항공': 23, '아시아나항공': 23, '제주항공': 15, '티웨이항공': 15, '진에어항공': 15 };

function weatherInfo(code) {
  const c = Number(code);
  if (c === 113) return { emoji: '☀️', label: '맑음' };
  if (c === 116) return { emoji: '⛅', label: '구름 조금' };
  if (c <= 122) return { emoji: '☁️', label: '흐림' };
  if (c === 143 || c === 248 || c === 260) return { emoji: '🌫️', label: '안개' };
  if (c === 200 || c >= 386) return { emoji: '⛈️', label: '천둥번개' };
  if ([179,182,185,227,230,317,320,323,326,329,332,335,338,350,368,371,374,377].includes(c))
    return { emoji: '🌨️', label: '눈' };
  return { emoji: '🌧️', label: '비' };
}

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [weather, setWeather] = useState(null);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const stored = await AsyncStorage.getItem('user');
      const parsedUser = stored ? JSON.parse(stored) : null;
      if (parsedUser) setUser(parsedUser);
      const posts = await api.get('/api/community/posts/popular');
      setPopularPosts(posts);
      if (parsedUser?.travelDestination) fetchWeather(parsedUser.travelDestination);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function fetchWeather(cityName) {
    try {
      const wttrName = CITY_DATA[cityName]?.wttr || cityName;
      const res = await fetch(`https://wttr.in/${encodeURIComponent(wttrName)}?format=j1`);
      const json = await res.json();
      const cur = json.current_condition?.[0];
      const today = json.weather?.[0];
      if (cur) {
        setWeather({
          temp: cur.temp_C,
          hi: today?.maxtempC || cur.temp_C,
          lo: today?.mintempC || cur.temp_C,
          rain: today?.hourly?.[4]?.chanceofrain || '0',
          hum: cur.humidity,
          wind: Math.round((Number(cur.windspeedKmph) || 0) / 3.6),
          ...weatherInfo(cur.weatherCode),
        });
      }
    } catch (e) {}
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={C.brand} />;

  const dest = user?.travelDestination;
  const cityInfo = CITY_DATA[dest] || {};
  const countryInfo = COUNTRY_DATA[cityInfo.country] || {};
  const airlineInfo = AIRLINE_DATA[user?.airline] || {};
  const heroGrad = countryInfo.grad || [C.ink, '#1a2c54'];

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero destination card ── */}
      <View style={styles.heroCard}>
        <LinearGradient colors={heroGrad} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.heroImg}>
          {/* dark overlay */}
          <LinearGradient
            colors={['rgba(0,0,0,0.18)', 'transparent', 'rgba(0,0,0,0.50)']}
            style={StyleSheet.absoluteFill}
          />

          {/* top row: route badge + weather */}
          <View style={styles.heroTopRow}>
            <View style={styles.routePill}>
              <Text style={styles.routeCode}>ICN</Text>
              <Text style={styles.routePlane}>✈</Text>
              <Text style={styles.routeCode}>{cityInfo.countryCode || countryInfo.code || '??'}</Text>
            </View>
            {weather && (
              <View style={styles.weatherPill}>
                <Text style={styles.weatherPillEmoji}>{weather.emoji}</Text>
                <Text style={styles.weatherPillTemp}>{weather.temp}°</Text>
              </View>
            )}
          </View>

          {/* bottom: city info */}
          <View style={styles.heroBottom}>
            <Text style={styles.heroNextTrip}>
              NEXT TRIP · {(cityInfo.country || '').toUpperCase()}
            </Text>
            <Text style={styles.heroCity}>{dest || '여행지'}</Text>
            {weather && (
              <Text style={styles.heroSub}>
                {countryInfo.emoji || ''} · {weather.label} {weather.lo}°/{weather.hi}°
              </Text>
            )}
          </View>
        </LinearGradient>

        {/* weather strip */}
        {weather && (
          <View style={styles.weatherStrip}>
            {[
              { label: '강수', value: `${weather.rain}%` },
              { label: '습도', value: `${weather.hum}%` },
              { label: '바람', value: `${weather.wind}m/s` },
            ].map(({ label, value }, i) => (
              <View key={label} style={[styles.weatherCell, i > 0 && styles.weatherCellBorder]}>
                <Text style={styles.weatherValue}>{value}</Text>
                <Text style={styles.weatherLabel}>{label}</Text>
              </View>
            ))}
          </View>
        )}
      </View>

      <View style={styles.body}>
        {/* ── Quick menus ── */}
        <Text style={styles.sectionLabel}>무엇을 도와드릴까요?</Text>
        <View style={styles.quickRow}>
          {QUICK_MENUS.map(({ label, desc, screen, bg, ink, icon }) => (
            <TouchableOpacity
              key={screen}
              style={styles.quickCard}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: bg }]}>
                <Text style={[styles.quickEmoji, { color: ink }]}>{icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
              <Text style={styles.quickDesc}>{desc}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Airline banner ── */}
        {user?.airline && (
          <TouchableOpacity
            style={styles.airlineBanner}
            onPress={() => navigation.navigate('Baggage')}
            activeOpacity={0.85}
          >
            <LinearGradient
              colors={[C.ink, '#1a2c54']}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
              style={styles.airlineBannerGrad}
            >
              <View style={styles.airlineBannerLeft}>
                <View style={[styles.airlineMark, { backgroundColor: airlineInfo.color || C.brand }]}>
                  <Text style={styles.airlineMarkText}>{airlineInfo.code || 'KE'}</Text>
                </View>
                <View>
                  <Text style={styles.airlineBannerEyebrow}>MY AIRLINE</Text>
                  <Text style={styles.airlineBannerName}>{user.airline} 수하물 규정</Text>
                  <Text style={styles.airlineBannerSub}>
                    위탁 {BAGGAGE_HOLD[user.airline] || 23}kg · 기내 {BAGGAGE_CARRY[user.airline] || 12}kg · 초과요금 계산
                  </Text>
                </View>
              </View>
              <View style={styles.airlineBannerArrow}>
                <Text style={styles.airlineBannerArrowText}>›</Text>
              </View>
            </LinearGradient>
          </TouchableOpacity>
        )}

        {/* ── Popular posts ── */}
        {popularPosts.length > 0 && (
          <>
            <Text style={[styles.sectionLabel, { marginTop: 22 }]}>지금 뜨는 여행기</Text>
            <View style={styles.popularCard}>
              {popularPosts.slice(0, 3).map((post, i) => {
                const cd = COUNTRY_DATA[post.country] || {};
                return (
                  <React.Fragment key={post.id}>
                    {i > 0 && <View style={styles.divider} />}
                    <TouchableOpacity
                      style={styles.popularRow}
                      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                      activeOpacity={0.75}
                    >
                      <View style={[styles.flagChip, { backgroundColor: cd.tint || C.brandSoft }]}>
                        <Text style={[styles.flagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                      </View>
                      <View style={styles.popularMeta}>
                        <Text style={styles.popularTitle} numberOfLines={1}>{post.title}</Text>
                        <View style={styles.popularBottom}>
                          <Text style={styles.popularAuthor}>{post.authorNickname}</Text>
                          <Text style={styles.popularLike}>♥ {post.likeCount}</Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  </React.Fragment>
                );
              })}
            </View>
          </>
        )}

        <View style={{ height: 100 }} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Hero */
  heroCard: { backgroundColor: C.surface, ...shadow.md, marginBottom: 0 },
  heroImg: { height: 224, justifyContent: 'space-between', padding: 18 },

  heroTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  routePill: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 13, paddingVertical: 7,
  },
  routeCode: { color: '#fff', fontSize: 12, fontWeight: '800', letterSpacing: 1 },
  routePlane: { color: '#fff', fontSize: 13 },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.22)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  weatherPillEmoji: { fontSize: 15 },
  weatherPillTemp: { color: '#fff', fontSize: 14, fontWeight: '800' },

  heroBottom: {},
  heroNextTrip: { fontSize: 11, fontWeight: '700', color: 'rgba(255,255,255,0.82)', letterSpacing: 2, marginBottom: 3 },
  heroCity: { fontSize: 30, fontWeight: '800', color: '#fff', letterSpacing: -0.5, lineHeight: 34 },
  heroSub: { fontSize: 12.5, fontWeight: '600', color: 'rgba(255,255,255,0.78)', marginTop: 5 },

  weatherStrip: { flexDirection: 'row', paddingVertical: 4 },
  weatherCell: { flex: 1, alignItems: 'center', paddingVertical: 12, gap: 4 },
  weatherCellBorder: { borderLeftWidth: 1, borderLeftColor: C.line2 },
  weatherValue: { fontSize: 14, fontWeight: '700', color: C.ink },
  weatherLabel: { fontSize: 11, fontWeight: '600', color: C.muted },

  /* Body */
  body: { paddingHorizontal: 18, paddingTop: 22 },
  sectionLabel: { fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -0.4, marginBottom: 12 },

  /* Quick menus */
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 16,
    padding: 14, alignItems: 'flex-start', gap: 10, ...shadow.sm,
  },
  quickIcon: { width: 44, height: 44, borderRadius: 14, alignItems: 'center', justifyContent: 'center' },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: 14, fontWeight: '700', color: C.ink },
  quickDesc: { fontSize: 11, color: C.muted, fontWeight: '600' },

  /* Airline banner */
  airlineBanner: { borderRadius: 16, overflow: 'hidden', marginBottom: 8, ...shadow.md },
  airlineBannerGrad: { padding: 16, flexDirection: 'row', alignItems: 'center' },
  airlineBannerLeft: { flex: 1, flexDirection: 'row', alignItems: 'center', gap: 12 },
  airlineMark: { width: 46, height: 46, borderRadius: 13, alignItems: 'center', justifyContent: 'center' },
  airlineMarkText: { color: '#fff', fontSize: 14, fontWeight: '800', letterSpacing: 0.5 },
  airlineBannerEyebrow: { fontSize: 10, fontWeight: '700', color: 'rgba(255,255,255,0.55)', letterSpacing: 1.5, marginBottom: 2 },
  airlineBannerName: { fontSize: 15, fontWeight: '700', color: '#fff' },
  airlineBannerSub: { fontSize: 12, fontWeight: '600', color: 'rgba(255,255,255,0.6)', marginTop: 2 },
  airlineBannerArrow: { width: 34, height: 34, borderRadius: 99, backgroundColor: 'rgba(255,255,255,0.14)', alignItems: 'center', justifyContent: 'center' },
  airlineBannerArrowText: { color: '#fff', fontSize: 22, fontWeight: '300', lineHeight: 26 },

  /* Popular posts */
  popularCard: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadow.sm },
  popularRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  divider: { height: 1, backgroundColor: C.line2, marginLeft: 16 },
  flagChip: { width: 38, height: 38, borderRadius: 11, alignItems: 'center', justifyContent: 'center' },
  flagCode: { fontSize: 12, fontWeight: '800', letterSpacing: 0.5 },
  popularMeta: { flex: 1 },
  popularTitle: { fontSize: 14.5, fontWeight: '700', color: C.ink, marginBottom: 4 },
  popularBottom: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  popularAuthor: { fontSize: 12, fontWeight: '600', color: C.muted },
  popularLike: { fontSize: 12, fontWeight: '700', color: C.no },
});
