import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';
import { C, shadow, COUNTRY_DATA } from '../../constants/theme';

function avatarHue(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 37) % 360;
  return h;
}

export default function CommunityScreen({ navigation }) {
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadPopular(); }, []);

  async function loadPopular() {
    try {
      const data = await api.get('/api/community/posts/popular');
      setPopularPosts(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={C.brand} />;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>커뮤니티</Text>
          <Text style={styles.headerSub}>여행자들의 생생한 수하물 후기</Text>
        </View>
        <TouchableOpacity
          style={styles.writeBtn}
          onPress={() => navigation.navigate('CreatePost', {})}
          activeOpacity={0.85}
        >
          <Text style={styles.writeBtnText}>✏</Text>
        </TouchableOpacity>
      </View>

      {/* 인기글 horizontal scroll */}
      {popularPosts.length > 0 && (
        <View style={{ marginTop: 8 }}>
          <View style={styles.sectionRow}>
            <Text style={styles.fireEmoji}>🔥</Text>
            <Text style={styles.sectionTitle}>인기글</Text>
          </View>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.popularScroll}
          >
            {popularPosts.map((p, i) => {
              const cd = COUNTRY_DATA[p.country] || {};
              return (
                <TouchableOpacity
                  key={p.id}
                  style={styles.popularCard}
                  onPress={() => navigation.navigate('PostDetail', { postId: p.id })}
                  activeOpacity={0.8}
                >
                  <View style={styles.popularCardTop}>
                    <View style={styles.popularRankRow}>
                      <View style={[styles.rankBadge, i < 3 && styles.rankBadgeTop]}>
                        <Text style={[styles.rankText, i < 3 && styles.rankTextTop]}>{i + 1}</Text>
                      </View>
                      <View style={[styles.flagChip, { backgroundColor: cd.tint || C.brandSoft }]}>
                        <Text style={[styles.flagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                      </View>
                    </View>
                    <View style={styles.popularLikeRow}>
                      <Text style={styles.popularLikeIcon}>♥</Text>
                      <Text style={styles.popularLikeCount}>{p.likeCount}</Text>
                    </View>
                  </View>
                  <Text style={styles.popularTitle} numberOfLines={2}>{p.title}</Text>
                  <Text style={styles.popularPreview} numberOfLines={2}>{p.contentSummary}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 나라별 게시판 */}
      <View style={styles.boardsSection}>
        <Text style={styles.sectionTitle}>나라별 게시판</Text>
        <View style={styles.boardsCard}>
          {COUNTRIES.map((country, i) => {
            const cd = COUNTRY_DATA[country] || {};
            const countryPosts = popularPosts.filter((p) => p.country === country);
            const latest = countryPosts[0];
            return (
              <React.Fragment key={country}>
                {i > 0 && <View style={styles.divider} />}
                <TouchableOpacity
                  style={styles.boardRow}
                  onPress={() => navigation.navigate('PostList', { country })}
                  activeOpacity={0.75}
                >
                  <View style={[styles.boardFlag, { backgroundColor: cd.tint || C.brandSoft }]}>
                    <Text style={[styles.boardFlagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                  </View>
                  <View style={styles.boardMeta}>
                    <View style={styles.boardTitleRow}>
                      <Text style={styles.boardName}>{country} 게시판</Text>
                    </View>
                    <Text style={styles.boardLatest} numberOfLines={1}>
                      {latest ? latest.title : '아직 게시글이 없어요'}
                    </Text>
                  </View>
                  <Text style={styles.boardArrow}>›</Text>
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>

      <View style={{ height: 100 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 56, paddingBottom: 14,
    backgroundColor: C.bg,
  },
  headerLeft: {},
  headerTitle: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  headerSub: { fontSize: 13, color: C.muted, fontWeight: '500', marginTop: 2 },
  writeBtn: {
    width: 44, height: 44, borderRadius: 14,
    backgroundColor: C.brand, alignItems: 'center', justifyContent: 'center',
    ...shadow.brand,
  },
  writeBtnText: { color: '#fff', fontSize: 18 },

  sectionRow: { flexDirection: 'row', alignItems: 'center', gap: 6, paddingHorizontal: 18, marginBottom: 12 },
  fireEmoji: { fontSize: 18 },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },

  popularScroll: { paddingHorizontal: 18, gap: 12, paddingBottom: 4 },
  popularCard: {
    width: 220, backgroundColor: C.surface, borderRadius: 16,
    padding: 14, ...shadow.sm,
  },
  popularCardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  popularRankRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  rankBadge: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: C.line, alignItems: 'center', justifyContent: 'center',
  },
  rankBadgeTop: { backgroundColor: C.accent },
  rankText: { fontSize: 12, fontWeight: '700', color: C.muted },
  rankTextTop: { color: '#fff' },
  flagChip: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  flagCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  popularLikeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  popularLikeIcon: { fontSize: 12, color: C.no },
  popularLikeCount: { fontSize: 12, fontWeight: '700', color: C.no },
  popularTitle: { fontSize: 15, fontWeight: '700', color: C.ink, lineHeight: 20, marginBottom: 5 },
  popularPreview: { fontSize: 12.5, color: C.muted, lineHeight: 18 },

  boardsSection: { paddingHorizontal: 18, marginTop: 24 },
  boardsCard: { backgroundColor: C.surface, borderRadius: 16, overflow: 'hidden', ...shadow.sm },
  divider: { height: 1, backgroundColor: C.line2, marginLeft: 16 },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 12, padding: 14 },
  boardFlag: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  boardFlagCode: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },
  boardMeta: { flex: 1 },
  boardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 3 },
  boardName: { fontSize: 15.5, fontWeight: '700', color: C.ink },
  boardLatest: { fontSize: 12.5, color: C.muted },
  boardArrow: { fontSize: 20, color: C.faint, fontWeight: '300' },
});
