import React, { useEffect, useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, ActivityIndicator, ImageBackground,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';

const COUNTRY_BG = {
  '일본': '#FF6B6B',
  '미국': '#4A90E2',
  '베트남': '#27AE60',
  '필리핀': '#F39C12',
  '태국': '#8E44AD',
};

export default function HomeScreen({ navigation }) {
  const [user, setUser] = useState(null);
  const [popularPosts, setPopularPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

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

  if (loading) {
    return <ActivityIndicator style={{ flex: 1 }} size="large" color="#4A90E2" />;
  }

  const bgColor = COUNTRY_BG[user?.travelDestination] || '#4A90E2';

  return (
    <ScrollView style={styles.container}>
      <View style={[styles.header, { backgroundColor: bgColor }]}>
        <Text style={styles.greeting}>안녕하세요, {user?.nickname || '여행자'}님 👋</Text>
        <Text style={styles.destination}>✈️ {user?.travelDestination} · {user?.airline}</Text>
      </View>

      <Text style={styles.sectionTitle}>바로가기</Text>
      <View style={styles.menuGrid}>
        {[
          { icon: '📷', label: '물품 촬영', screen: 'Camera' },
          { icon: '✍️', label: '직접 입력', screen: 'TextAnalysis' },
          { icon: '🧳', label: '수하물 정보', screen: 'Baggage' },
          { icon: '💬', label: '커뮤니티', screen: 'Community' },
        ].map(({ icon, label, screen }) => (
          <TouchableOpacity
            key={screen}
            style={styles.menuItem}
            onPress={() => navigation.navigate(screen)}
          >
            <Text style={styles.menuIcon}>{icon}</Text>
            <Text style={styles.menuLabel}>{label}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.sectionTitle}>인기 게시글 🔥</Text>
      {popularPosts.length === 0 ? (
        <Text style={styles.empty}>아직 게시글이 없어요.</Text>
      ) : (
        popularPosts.map((post) => (
          <TouchableOpacity
            key={post.id}
            style={styles.postCard}
            onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
          >
            <View style={styles.postHeader}>
              <Text style={styles.postCountry}>{post.country}</Text>
              <Text style={styles.postRating}>{'⭐'.repeat(post.rating)}</Text>
            </View>
            <Text style={styles.postTitle} numberOfLines={1}>{post.title}</Text>
            <Text style={styles.postMeta}>❤️ {post.likeCount}  💬 {post.commentCount}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  header: { padding: 24, paddingTop: 48 },
  greeting: { fontSize: 22, fontWeight: 'bold', color: '#fff' },
  destination: { fontSize: 14, color: 'rgba(255,255,255,0.85)', marginTop: 6 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', margin: 16, marginBottom: 10 },
  menuGrid: { flexDirection: 'row', flexWrap: 'wrap', paddingHorizontal: 12 },
  menuItem: {
    width: '46%', margin: '2%', backgroundColor: '#fff',
    borderRadius: 12, padding: 20, alignItems: 'center',
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  menuIcon: { fontSize: 32, marginBottom: 8 },
  menuLabel: { fontSize: 14, fontWeight: '600', color: '#333' },
  postCard: {
    backgroundColor: '#fff', marginHorizontal: 16, marginBottom: 10,
    borderRadius: 12, padding: 16,
    shadowColor: '#000', shadowOpacity: 0.06, shadowRadius: 4, elevation: 2,
  },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  postCountry: { fontSize: 12, color: '#4A90E2', fontWeight: '600' },
  postRating: { fontSize: 12 },
  postTitle: { fontSize: 15, fontWeight: '600', color: '#222', marginBottom: 8 },
  postMeta: { fontSize: 12, color: '#999' },
  empty: { textAlign: 'center', color: '#aaa', margin: 20 },
});
