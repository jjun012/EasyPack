import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';
import { C, shadow } from '../../constants/theme';

const FLAG = { '일본': '🇯🇵', '미국': '🇺🇸', '베트남': '🇻🇳', '필리핀': '🇵🇭', '태국': '🇹🇭' };

export default function PostListScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
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
      <View style={styles.tabBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabScroll}>
          {COUNTRIES.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.tab, selectedCountry === c && styles.tabActive]}
              onPress={() => setSelectedCountry(c)}
            >
              <Text style={styles.tabFlag}>{FLAG[c]}</Text>
              <Text style={[styles.tabText, selectedCountry === c && styles.tabTextActive]}>{c}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color={C.primary} />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.primary} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={
            <View style={styles.emptyBox}>
              <Text style={styles.emptyIcon}>{FLAG[selectedCountry]}</Text>
              <Text style={styles.emptyTitle}>아직 후기가 없어요</Text>
              <Text style={styles.emptyDesc}>첫 번째 여행 후기를 남겨보세요!</Text>
            </View>
          }
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
              activeOpacity={0.8}
            >
              <View style={styles.cardTop}>
                <Text style={styles.rating}>{'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}</Text>
                <Text style={styles.author}>{item.authorNickname}</Text>
              </View>
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.preview} numberOfLines={2}>{item.contentSummary}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaItem}>♥ {item.likeCount}</Text>
                <Text style={styles.metaDot}>·</Text>
                <Text style={styles.metaItem}>댓글 {item.commentCount}</Text>
              </View>
            </TouchableOpacity>
          )}
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
    backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.border,
  },
  tabScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 14, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.border,
  },
  tabActive: { backgroundColor: C.primary, borderColor: C.primary },
  tabFlag: { fontSize: 15 },
  tabText: { fontSize: 13, fontWeight: '600', color: C.textSec },
  tabTextActive: { color: '#fff' },
  list: { padding: 16 },
  card: {
    backgroundColor: C.surface, borderRadius: 16, padding: 18,
    marginBottom: 12, ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  rating: { fontSize: 13, color: '#F59E0B', letterSpacing: 1 },
  author: { fontSize: 12, color: C.textMuted, fontWeight: '500' },
  title: { fontSize: 16, fontWeight: '700', color: C.text, marginBottom: 6 },
  preview: { fontSize: 14, color: C.textSec, lineHeight: 20, marginBottom: 12 },
  meta: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaItem: { fontSize: 12, color: C.textMuted },
  metaDot: { fontSize: 12, color: C.textMuted },
  emptyBox: { alignItems: 'center', marginTop: 80 },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 17, fontWeight: '700', color: C.text, marginBottom: 6 },
  emptyDesc: { fontSize: 14, color: C.textSec },
  fab: {
    position: 'absolute', right: 20, bottom: 28,
    backgroundColor: C.primary, width: 56, height: 56,
    borderRadius: 18, alignItems: 'center', justifyContent: 'center', ...shadow.md,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: '300', lineHeight: 32 },
});
