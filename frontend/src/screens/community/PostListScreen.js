import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';
import { C, shadow, COUNTRY_DATA } from '../../constants/theme';

function avatarHue(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 37) % 360;
  return h;
}

export default function PostListScreen({ navigation, route }) {
  const paramCountry = route?.params?.country;
  const [selectedCountry, setSelectedCountry] = useState(paramCountry || COUNTRIES[0]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => { fetchPosts(); }, [selectedCountry]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const data = await api.get(`/api/community/posts/country/${encodeURIComponent(selectedCountry)}`);
      setPosts(data);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function onRefresh() {
    setRefreshing(true);
    await fetchPosts();
    setRefreshing(false);
  }

  return (
    <View style={styles.container}>
      {/* Country pill tabs — only show when no country param */}
      {!paramCountry && (
        <View style={styles.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabScroll}
          >
            {COUNTRIES.map((c) => {
              const d = COUNTRY_DATA[c] || {};
              const active = selectedCountry === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[styles.tab, active && styles.tabActive]}
                  onPress={() => setSelectedCountry(c)}
                  activeOpacity={0.75}
                >
                  <View style={[
                    styles.tabCode,
                    { backgroundColor: active ? '#fff' : d.tint || C.brandSoft },
                  ]}>
                    <Text style={[
                      styles.tabCodeText,
                      { color: active ? C.brand : (d.ink || C.muted) },
                    ]}>
                      {d.code || c.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[styles.tabText, active && styles.tabTextActive]}>{c}</Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={C.brand} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.brand} />
          }
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <View style={styles.emptyIconBox}>
                <Text style={styles.emptyIconText}>
                  {COUNTRY_DATA[selectedCountry]?.code || '??'}
                </Text>
              </View>
              <Text style={styles.emptyTitle}>아직 후기가 없어요</Text>
              <Text style={styles.emptyDesc}>첫 번째 여행 후기를 남겨보세요!</Text>
            </View>
          }
          renderItem={({ item }) => {
            const hue = avatarHue(item.authorNickname);
            return (
              <TouchableOpacity
                style={styles.card}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                activeOpacity={0.8}
              >
                <View style={styles.cardTop}>
                  {/* Author avatar */}
                  <View style={[styles.avatar, { backgroundColor: `hsl(${hue}, 60%, 55%)` }]}>
                    <Text style={styles.avatarText}>
                      {(item.authorNickname || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={styles.cardMeta}>
                    <Text style={styles.author}>{item.authorNickname}</Text>
                    <Text style={styles.rating}>
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </Text>
                  </View>
                </View>
                <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
                <Text style={styles.preview} numberOfLines={2}>{item.contentSummary}</Text>
                <View style={styles.meta}>
                  <Text style={styles.metaItem}>♥ {item.likeCount}</Text>
                  <Text style={styles.metaDot}>·</Text>
                  <Text style={styles.metaItem}>댓글 {item.commentCount}</Text>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost', { country: selectedCountry })}
        activeOpacity={0.85}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  tabBar: {
    backgroundColor: C.surface,
    borderBottomWidth: 1, borderBottomColor: C.line,
  },
  tabScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: C.bg,
  },
  tabActive: { backgroundColor: C.brand, borderColor: C.brand },
  tabCode: {
    borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2,
  },
  tabCodeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tabText: { fontSize: 13, fontWeight: '600', color: C.ink2 },
  tabTextActive: { color: '#fff' },

  list: { padding: 16, paddingBottom: 100 },

  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 16,
    marginBottom: 12, ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 10 },
  avatar: {
    width: 36, height: 36, borderRadius: 18,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardMeta: { flex: 1 },
  author: { fontSize: 13, fontWeight: '600', color: C.ink, marginBottom: 2 },
  rating: { fontSize: 12, color: C.warn, letterSpacing: 1 },
  title: { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 6 },
  preview: { fontSize: 14, color: C.ink2, lineHeight: 20, marginBottom: 10 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontSize: 12, color: C.muted },
  metaDot: { fontSize: 12, color: C.muted },

  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIconBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  emptyIconText: { fontSize: 22, fontWeight: '900', color: C.brand },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.ink, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: C.ink2 },

  fab: {
    position: 'absolute', right: 20, bottom: 28,
    backgroundColor: C.brand, width: 56, height: 56,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center',
    ...shadow.brand,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
