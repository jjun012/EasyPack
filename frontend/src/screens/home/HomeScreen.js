import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow, CITY_DATA, COUNTRY_DATA, AIRLINE_DATA } from '../../constants/theme';

const QUICK_MENUS = [
  { label: '물품 촬영', sub: 'AI 카메라', screen: 'Camera',    iconBg: C.brandSoft,       icon: '📸' },
  { label: '여행 후기', sub: '커뮤니티',  screen: 'Community', iconBg: '#EDE9FE',          icon: '✈️' },
  { label: '수하물',   sub: '규정·요금', screen: 'Baggage',   iconBg: C.accentSoft,       icon: '🧳' },
];

function weatherInfo(code) {
  const c = Number(code);
  if (c === 113) return { emoji: '☀️', label: '맑음' };
  if (c === 116) return { emoji: '⛅', label: '구름 조금' };
  if (c <= 122) return { emoji: '☁️', label: '흐림' };
  if (c === 143 || c === 248 || c === 260) return { emoji: '🌫️', label: '안개' };
  if (c === 200 || c >= 386) return { emoji: '⛈️', label: '천둥번개' };
  if ([179, 182, 185, 227, 230, 317, 320, 323, 326, 329, 332, 335, 338, 350, 368, 371, 374, 377].includes(c))
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
      if (cur) {
        setWeather({
          temp: cur.temp_C,
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
  const heroBg = countryInfo.bg || C.ink;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      {/* ── Hero destination card ── */}
      <View style={[styles.hero, { backgroundColor: heroBg }]}>
        <View style={styles.heroTop}>
          {/* Route badges */}
          <View style={styles.routeRow}>
            <View style={styles.routeBadge}>
              <Text style={styles.routeCode}>ICN</Text>
            </View>
            <Text style={styles.routeArrow}>→</Text>
            <View style={styles.routeBadge}>
              <Text style={styles.routeCode}>{cityInfo.countryCode || countryInfo.code || '??'}</Text>
            </View>
          </View>
          {/* Airline badge */}
          {user?.airline && (
            <View style={styles.airlinePill}>
              <View style={[styles.airlineCodeDot, { backgroundColor: airlineInfo.color || C.brand }]}>
                <Text style={styles.airlineCodeDotText}>{airlineInfo.code || 'KE'}</Text>
              </View>
              <Text style={styles.airlinePillText}>{user.airline}</Text>
            </View>
          )}
        </View>

        <Text style={styles.heroCity}>{dest || '여행지'}</Text>
        <View style={styles.heroBottom}>
          <Text style={styles.heroGreeting}>안녕하세요, {user?.nickname || '여행자'}님</Text>
          {weather && (
            <View style={styles.weatherPill}>
              <Text style={styles.weatherEmoji}>{weather.emoji}</Text>
              <Text style={styles.weatherTemp}>{weather.temp}°C</Text>
              <Text style={styles.weatherLabel}>{weather.label}</Text>
            </View>
          )}
        </View>
      </View>

      <View style={styles.body}>

        {/* ── Quick menus (3 in a row) ── */}
        <Text style={styles.sectionLabel}>바로가기</Text>
        <View style={styles.quickRow}>
          {QUICK_MENUS.map(({ label, sub, screen, iconBg, icon }) => (
            <TouchableOpacity
              key={screen}
              style={styles.quickCard}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.quickIcon, { backgroundColor: iconBg }]}>
                <Text style={styles.quickEmoji}>{icon}</Text>
              </View>
              <Text style={styles.quickLabel}>{label}</Text>
              <Text style={styles.quickSub}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* ── Airline dark banner ── */}
        {user?.airline && (
          <View style={styles.airlineBanner}>
            <View style={styles.airlineBannerLeft}>
              <View style={[styles.airlineBannerCode, { backgroundColor: airlineInfo.color || C.brand }]}>
                <Text style={styles.airlineBannerCodeText}>{airlineInfo.code || 'KE'}</Text>
              </View>
              <View>
                <Text style={styles.airlineBannerName}>{user.airline}</Text>
                <Text style={styles.airlineBannerSub}>이용 중인 항공사</Text>
              </View>
            </View>
            <TouchableOpacity
              style={styles.airlineBannerBtn}
              onPress={() => navigation.navigate('Baggage')}
            >
              <Text style={styles.airlineBannerBtnText}>수하물 확인</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* ── Popular posts ── */}
        {popularPosts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>인기 게시글</Text>
            {popularPosts.map((post) => {
              const cd = COUNTRY_DATA[post.country] || {};
              return (
                <TouchableOpacity
                  key={post.id}
                  style={styles.postCard}
                  onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.postTop}>
                    <View style={[styles.countryChip, { backgroundColor: cd.tint || C.brandSoft }]}>
                      <Text style={[styles.countryChipCode, { color: cd.ink || C.brand }]}>
                        {cd.code || post.country?.slice(0, 2).toUpperCase()}
                      </Text>
                      <Text style={[styles.countryChipName, { color: cd.ink || C.brand }]}>
                        {post.country}
                      </Text>
                    </View>
                    <Text style={styles.postRating}>{'★'.repeat(post.rating)}</Text>
                  </View>
                  <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
                  <View style={styles.postMeta}>
                    <Text style={styles.postMetaText}>♥ {post.likeCount}</Text>
                    <Text style={styles.postMetaDot}>·</Text>
                    <Text style={styles.postMetaText}>댓글 {post.commentCount}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Hero */
  hero: {
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 32,
  },
  heroTop: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginBottom: 20,
  },
  routeRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  routeBadge: {
    backgroundColor: 'rgba(255,255,255,0.18)',
    borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4,
  },
  routeCode: { color: '#fff', fontSize: 13, fontWeight: '800', letterSpacing: 1 },
  routeArrow: { color: 'rgba(255,255,255,0.6)', fontSize: 14, fontWeight: '600' },
  airlinePill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 999, paddingRight: 12, paddingVertical: 4, paddingLeft: 4,
  },
  airlineCodeDot: {
    borderRadius: 999, paddingHorizontal: 7, paddingVertical: 3,
  },
  airlineCodeDotText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  airlinePillText: { color: 'rgba(255,255,255,0.9)', fontSize: 12, fontWeight: '600' },
  heroCity: { fontSize: 36, fontWeight: '900', color: '#fff', letterSpacing: -1, marginBottom: 8 },
  heroBottom: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  heroGreeting: { fontSize: 14, color: 'rgba(255,255,255,0.65)' },
  weatherPill: {
    flexDirection: 'row', alignItems: 'center', gap: 5,
    backgroundColor: 'rgba(0,0,0,0.22)',
    borderRadius: 999, paddingHorizontal: 12, paddingVertical: 6,
  },
  weatherEmoji: { fontSize: 14 },
  weatherTemp: { fontSize: 14, fontWeight: '800', color: '#fff' },
  weatherLabel: { fontSize: 12, color: 'rgba(255,255,255,0.75)' },

  /* Body */
  body: { padding: 20 },
  sectionLabel: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1,
    marginBottom: 12, marginTop: 4,
  },

  /* Quick menus */
  quickRow: { flexDirection: 'row', gap: 10, marginBottom: 16 },
  quickCard: {
    flex: 1, backgroundColor: C.surface, borderRadius: 14,
    padding: 14, alignItems: 'center', ...shadow.sm,
  },
  quickIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 8,
  },
  quickEmoji: { fontSize: 20 },
  quickLabel: { fontSize: 13, fontWeight: '700', color: C.ink, marginBottom: 2, textAlign: 'center' },
  quickSub: { fontSize: 11, color: C.muted, textAlign: 'center' },

  /* Airline banner */
  airlineBanner: {
    backgroundColor: C.ink, borderRadius: 16, padding: 16,
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'space-between', marginBottom: 24,
  },
  airlineBannerLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  airlineBannerCode: {
    borderRadius: 8, paddingHorizontal: 10, paddingVertical: 6,
  },
  airlineBannerCodeText: { color: '#fff', fontSize: 13, fontWeight: '800' },
  airlineBannerName: { color: '#fff', fontSize: 14, fontWeight: '700' },
  airlineBannerSub: { color: 'rgba(255,255,255,0.5)', fontSize: 11 },
  airlineBannerBtn: {
    backgroundColor: C.brand, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  airlineBannerBtnText: { color: '#fff', fontSize: 12, fontWeight: '700' },

  /* Popular posts */
  postCard: {
    backgroundColor: C.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, ...shadow.sm,
  },
  postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  countryChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 4,
  },
  countryChipCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  countryChipName: { fontSize: 12, fontWeight: '600' },
  postRating: { fontSize: 12, color: C.warn, letterSpacing: 1 },
  postTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 8 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postMetaText: { fontSize: 12, color: C.muted },
  postMetaDot: { fontSize: 12, color: C.muted },
});
