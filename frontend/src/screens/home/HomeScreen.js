import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, StatusBar,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow } from '../../constants/theme';

const COUNTRY_FLAG = { '일본': '🇯🇵', '미국': '🇺🇸', '베트남': '🇻🇳', '필리핀': '🇵🇭', '태국': '🇹🇭' };

const MENUS = [
  { label: '물품 촬영', sub: 'AI 카메라 분석', screen: 'Camera', accent: '#6366F1', emoji: '📸' },
  { label: '직접 입력', sub: '텍스트로 검색', screen: 'TextAnalysis', accent: '#F59E0B', emoji: '🔍' },
  { label: '수하물 규정', sub: '허용 무게 · 초과 요금', screen: 'Baggage', accent: '#10B981', emoji: '🧳' },
  { label: '여행 후기', sub: '여행자 커뮤니티', screen: 'Community', accent: '#EC4899', emoji: '✈️' },
];

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadData(); }, []);

  async function loadData() {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setUser(JSON.parse(stored));
      const posts = await api.get('/api/community/posts/popular');
      setPopularPosts(posts);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} size="large" color={C.primary} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="light-content" />

      <View style={styles.header}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.greeting}>안녕하세요 👋</Text>
            <Text style={styles.nickname}>{user?.nickname || '여행자'}님</Text>
          </View>
          <View style={styles.destBadge}>
            <Text style={styles.destFlag}>{COUNTRY_FLAG[user?.travelDestination] || '✈️'}</Text>
            <Text style={styles.destText}>{user?.travelDestination || '미설정'}</Text>
          </View>
        </View>
        <View style={styles.airlineBadge}>
          <Text style={styles.airlineText}>{user?.airline || '항공사 미설정'}</Text>
        </View>
      </View>

      <View style={styles.body}>
        <Text style={styles.sectionLabel}>무엇을 확인할까요?</Text>
        <View style={styles.grid}>
          {MENUS.map(({ label, sub, screen, accent, emoji }) => (
            <TouchableOpacity
              key={screen}
              style={styles.menuCard}
              onPress={() => navigation.navigate(screen)}
              activeOpacity={0.75}
            >
              <View style={[styles.menuIcon, { backgroundColor: accent + '18' }]}>
                <Text style={styles.menuEmoji}>{emoji}</Text>
              </View>
              <Text style={styles.menuLabel}>{label}</Text>
              <Text style={styles.menuSub}>{sub}</Text>
            </TouchableOpacity>
          ))}
        </View>

        {popularPosts.length > 0 && (
          <>
            <Text style={styles.sectionLabel}>인기 게시글</Text>
            {popularPosts.map((post) => (
              <TouchableOpacity
                key={post.id}
                style={styles.postCard}
                onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
                activeOpacity={0.8}
              >
                <View style={styles.postTop}>
                  <View style={styles.countryBadge}>
                    <Text style={styles.countryBadgeText}>
                      {COUNTRY_FLAG[post.country]} {post.country}
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
            ))}
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  header: {
    backgroundColor: '#1A1F36',
    paddingTop: 56, paddingHorizontal: 24, paddingBottom: 28,
  },
  headerTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 },
  greeting: { fontSize: 14, color: 'rgba(255,255,255,0.6)', marginBottom: 4 },
  nickname: { fontSize: 24, fontWeight: '800', color: '#fff', letterSpacing: -0.5 },
  destBadge: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(255,255,255,0.12)',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8,
  },
  destFlag: { fontSize: 18 },
  destText: { color: '#fff', fontSize: 14, fontWeight: '600' },
  airlineBadge: {
    alignSelf: 'flex-start',
    backgroundColor: C.primary + 'CC',
    borderRadius: 999, paddingHorizontal: 14, paddingVertical: 6,
  },
  airlineText: { color: '#fff', fontSize: 12, fontWeight: '600' },
  body: { padding: 20 },
  sectionLabel: { fontSize: 13, fontWeight: '700', color: C.textSec, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 14, marginTop: 8 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 24 },
  menuCard: {
    width: '47.5%', backgroundColor: C.surface,
    borderRadius: 16, padding: 18, ...shadow.sm,
  },
  menuIcon: {
    width: 44, height: 44, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center', marginBottom: 12,
  },
  menuEmoji: { fontSize: 22 },
  menuLabel: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 3 },
  menuSub: { fontSize: 12, color: C.textMuted },
  postCard: {
    backgroundColor: C.surface, borderRadius: 14,
    padding: 16, marginBottom: 10, ...shadow.sm,
  },
  postTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  countryBadge: {
    backgroundColor: C.primaryLight, borderRadius: 999,
    paddingHorizontal: 10, paddingVertical: 4,
  },
  countryBadgeText: { fontSize: 12, color: C.primary, fontWeight: '600' },
  postRating: { fontSize: 12, color: '#F59E0B', letterSpacing: 1 },
  postTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 8 },
  postMeta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  postMetaText: { fontSize: 12, color: C.textMuted },
  postMetaDot: { fontSize: 12, color: C.textMuted },
});
