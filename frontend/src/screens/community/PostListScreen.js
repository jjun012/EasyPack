import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';

export default function PostListScreen({ navigation }) {
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [selectedCountry]);

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
      <View style={styles.tabs}>
        {COUNTRIES.map((c) => (
          <TouchableOpacity
            key={c}
            style={[styles.tab, selectedCountry === c && styles.tabActive]}
            onPress={() => setSelectedCountry(c)}
          >
            <Text style={[styles.tabText, selectedCountry === c && styles.tabTextActive]}>
              {c}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {loading ? (
        <ActivityIndicator style={{ flex: 1 }} color="#4A90E2" />
      ) : (
        <FlatList
          data={posts}
          keyExtractor={(item) => String(item.id)}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
          contentContainerStyle={styles.list}
          ListEmptyComponent={<Text style={styles.empty}>게시글이 없어요. 첫 글을 작성해보세요!</Text>}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.card}
              onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
            >
              <Text style={styles.title} numberOfLines={1}>{item.title}</Text>
              <Text style={styles.content} numberOfLines={2}>{item.contentSummary}</Text>
              <View style={styles.meta}>
                <Text style={styles.metaText}>{'⭐'.repeat(item.rating)}</Text>
                <Text style={styles.metaText}>{item.authorNickname}</Text>
                <Text style={styles.metaText}>❤️ {item.likeCount}  💬 {item.commentCount}</Text>
              </View>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity
        style={styles.fab}
        onPress={() => navigation.navigate('CreatePost', { country: selectedCountry })}
      >
        <Text style={styles.fabText}>+</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  tabs: { flexDirection: 'row', backgroundColor: '#fff', paddingVertical: 8, paddingHorizontal: 4 },
  tab: { flex: 1, alignItems: 'center', paddingVertical: 8, borderRadius: 8 },
  tabActive: { backgroundColor: '#4A90E2' },
  tabText: { fontSize: 12, color: '#666' },
  tabTextActive: { color: '#fff', fontWeight: 'bold' },
  list: { padding: 12 },
  card: {
    backgroundColor: '#fff', borderRadius: 12, padding: 16,
    marginBottom: 10, shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  title: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 6 },
  content: { fontSize: 14, color: '#666', marginBottom: 10, lineHeight: 20 },
  meta: { flexDirection: 'row', justifyContent: 'space-between' },
  metaText: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', color: '#aaa', marginTop: 60 },
  fab: {
    position: 'absolute', right: 20, bottom: 24,
    backgroundColor: '#4A90E2', width: 56, height: 56,
    borderRadius: 28, alignItems: 'center', justifyContent: 'center',
    shadowColor: '#000', shadowOpacity: 0.2, shadowRadius: 6, elevation: 5,
  },
  fabText: { color: '#fff', fontSize: 28, fontWeight: 'bold' },
});
