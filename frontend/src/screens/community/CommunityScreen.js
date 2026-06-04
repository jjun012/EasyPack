import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TouchableOpacity,
  StyleSheet, ActivityIndicator,
} from 'react-native';
import { Feather, Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';
import { C, shadow, COUNTRY_DATA } from '../../constants/theme';

function avatarHue(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 47) % 360;
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
    <ScrollView
      style={s.container}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={{ paddingBottom: 110 }}
    >
      {/* ── Header ── */}
      <View style={s.header}>
        <View style={{ gap: 2 }}>
          <Text style={s.headerTitle}>커뮤니티</Text>
          <Text style={s.headerSub}>여행자들의 생생한 수하물 후기</Text>
        </View>
        <TouchableOpacity
          style={s.writeBtn}
          onPress={() => navigation.navigate('CreatePost', {})}
          activeOpacity={0.85}
        >
          <Feather name="edit-2" size={19} color="#fff" />
        </TouchableOpacity>
      </View>

      {/* ── 인기글 ── */}
      <View style={s.sectionHeader}>
        <Ionicons name="flame" size={18} color={C.accent} />
        <Text style={s.sectionTitle}>인기글</Text>
      </View>

      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={s.popularScroll}
      >
        {popularPosts.map((p, i) => {
          const cd = COUNTRY_DATA[p.country] || {};
          return (
            <TouchableOpacity
              key={p.id}
              style={s.popularCard}
              onPress={() => navigation.navigate('PostDetail', { postId: p.id })}
              activeOpacity={0.8}
            >
              {/* top row: rank + flag / likes */}
              <View style={s.popularCardTop}>
                <View style={s.popularCardTopLeft}>
                  {/* rank badge */}
                  <View style={[s.rankBadge, i < 3 && s.rankBadgeTop]}>
                    <Text style={[s.rankText, i < 3 && s.rankTextTop]}>{i + 1}</Text>
                  </View>
                  {/* flag chip */}
                  <View style={[s.flagChip, { backgroundColor: cd.tint || C.brandSoft }]}>
                    <Text style={[s.flagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                  </View>
                </View>
                {/* likes */}
                <View style={s.likeRow}>
                  <Ionicons name="heart" size={12} color={C.no} />
                  <Text style={s.likeCount}>{p.likeCount}</Text>
                </View>
              </View>

              <Text style={s.popularTitle} numberOfLines={2}>{p.title}</Text>
              <Text style={s.popularPreview} numberOfLines={2}>{p.contentSummary}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* ── 나라별 게시판 ── */}
      <View style={s.boardsSection}>
        <Text style={s.sectionTitle}>나라별 게시판</Text>
        <View style={s.boardsCard}>
          {COUNTRIES.map((country, i) => {
            const cd          = COUNTRY_DATA[country] || {};
            const latestPost  = popularPosts.find((p) => p.country === country);
            const countryPost = popularPosts.filter((p) => p.country === country);

            return (
              <React.Fragment key={country}>
                {i > 0 && <View style={s.divider} />}
                <TouchableOpacity
                  style={s.boardRow}
                  onPress={() => navigation.navigate('PostList', { country })}
                  activeOpacity={0.75}
                >
                  {/* flag */}
                  <View style={[s.boardFlag, { backgroundColor: cd.tint || C.brandSoft }]}>
                    <Text style={[s.boardFlagCode, { color: cd.ink || C.brand }]}>{cd.code || '?'}</Text>
                  </View>

                  <View style={s.boardMeta}>
                    <View style={s.boardTitleRow}>
                      <Text style={s.boardName}>{country} 게시판</Text>
                      {countryPost.length > 0 && (
                        <View style={s.cntBadge}>
                          <Text style={s.cntBadgeText}>{countryPost.length}</Text>
                        </View>
                      )}
                    </View>
                    <Text style={s.boardLatest} numberOfLines={1}>
                      {latestPost ? latestPost.title : '아직 게시글이 없어요'}
                    </Text>
                  </View>

                  <Feather name="chevron-right" size={18} color={C.faint} />
                </TouchableOpacity>
              </React.Fragment>
            );
          })}
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Header */
  header: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingHorizontal: 18, paddingTop: 56, paddingBottom: 14,
  },
  headerTitle: { fontSize: 30, fontWeight: '800', color: C.ink, letterSpacing: -0.6 },
  headerSub:   { fontSize: 13, color: C.muted, fontWeight: '500' },
  writeBtn: {
    width: 44, height: 44, borderRadius: 13,
    backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
    ...shadow.brand,
  },

  /* Section header */
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', gap: 7,
    paddingHorizontal: 18, marginBottom: 12,
  },
  sectionTitle: { fontSize: 19, fontWeight: '700', color: C.ink, letterSpacing: -0.4 },

  /* Popular horizontal scroll */
  popularScroll: { paddingHorizontal: 18, gap: 12, paddingBottom: 4 },
  popularCard: {
    width: 234, backgroundColor: C.surface, borderRadius: 22,
    padding: 15, flexShrink: 0,
    ...shadow.sm,
  },
  popularCardTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    marginBottom: 10,
  },
  popularCardTopLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },

  /* rank badge */
  rankBadge: {
    width: 22, height: 22, borderRadius: 7,
    backgroundColor: C.line,
    alignItems: 'center', justifyContent: 'center',
  },
  rankBadgeTop: { backgroundColor: C.accent },
  rankText:     { fontSize: 12, fontWeight: '700', color: C.muted },
  rankTextTop:  { color: '#fff' },

  /* flag chip (small) */
  flagChip: { width: 26, height: 26, borderRadius: 8, alignItems: 'center', justifyContent: 'center' },
  flagCode: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },

  /* likes */
  likeRow:   { flexDirection: 'row', alignItems: 'center', gap: 3 },
  likeCount: { fontSize: 12, fontWeight: '700', color: C.no },

  popularTitle:   { fontSize: 15, fontWeight: '700', color: C.ink, lineHeight: 20, marginBottom: 6, minHeight: 40 },
  popularPreview: { fontSize: 12.5, color: C.muted, lineHeight: 18 },

  /* Boards */
  boardsSection: { paddingHorizontal: 18, marginTop: 24 },
  boardsCard: {
    backgroundColor: C.surface, borderRadius: 22,
    overflow: 'hidden', marginTop: 12,
    ...shadow.sm,
  },
  divider: { height: 1, backgroundColor: C.line2, marginLeft: 16 },
  boardRow: { flexDirection: 'row', alignItems: 'center', gap: 13, padding: 14 },

  /* flag (large) */
  boardFlag: { width: 42, height: 42, borderRadius: 12, alignItems: 'center', justifyContent: 'center', flexShrink: 0 },
  boardFlagCode: { fontSize: 13, fontWeight: '800', letterSpacing: 0.5 },

  boardMeta:     { flex: 1, gap: 3 },
  boardTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 7 },
  boardName:     { fontSize: 15.5, fontWeight: '700', color: C.ink },

  cntBadge: {
    backgroundColor: C.surface2,
    borderRadius: 6, paddingHorizontal: 6, paddingVertical: 1,
  },
  cntBadgeText: { fontSize: 11, fontWeight: '700', color: C.muted },

  boardLatest: { fontSize: 12.5, color: C.muted },
});
