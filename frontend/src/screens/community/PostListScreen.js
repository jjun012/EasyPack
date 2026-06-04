import React, { useEffect, useState } from 'react';
import {
  View, Text, FlatList, TouchableOpacity,
  StyleSheet, ActivityIndicator, RefreshControl, ScrollView,
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

export default function PostListScreen({ navigation, route }) {
  const paramCountry = route?.params?.country;
  const [selectedCountry, setSelectedCountry] = useState(paramCountry || COUNTRIES[0]);
  const [posts, setPosts]         = useState([]);
  const [loading, setLoading]     = useState(true);
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
    <View style={s.container}>
      {/* Country pill tabs — only when no country param */}
      {!paramCountry && (
        <View style={s.tabBar}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={s.tabScroll}
          >
            {COUNTRIES.map((c) => {
              const cd     = COUNTRY_DATA[c] || {};
              const active = selectedCountry === c;
              return (
                <TouchableOpacity
                  key={c}
                  style={[s.tab, active && s.tabActive]}
                  onPress={() => setSelectedCountry(c)}
                  activeOpacity={0.75}
                >
                  <View style={[s.tabCode, { backgroundColor: active ? '#fff' : cd.tint || C.brandSoft }]}>
                    <Text style={[s.tabCodeText, { color: active ? C.brand : (cd.ink || C.muted) }]}>
                      {cd.code || c.slice(0, 2).toUpperCase()}
                    </Text>
                  </View>
                  <Text style={[s.tabText, active && s.tabTextActive]}>{c}</Text>
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
          contentContainerStyle={s.list}
          ListEmptyComponent={
            <View style={s.emptyBox}>
              <View style={s.emptyIconBox}>
                <Feather name="message-square" size={30} color={C.faint} />
              </View>
              <Text style={s.emptyTitle}>아직 후기가 없어요</Text>
              <Text style={s.emptyDesc}>첫 번째 여행 후기를 남겨보세요!</Text>
              <TouchableOpacity
                style={s.emptyBtn}
                onPress={() => navigation.navigate('CreatePost', { country: selectedCountry })}
                activeOpacity={0.85}
              >
                <Text style={s.emptyBtnText}>글쓰기</Text>
              </TouchableOpacity>
            </View>
          }
          renderItem={({ item, index }) => {
            const hue = avatarHue(item.authorNickname);
            return (
              <TouchableOpacity
                style={s.card}
                onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
                activeOpacity={0.8}
              >
                {/* author row */}
                <View style={s.cardTop}>
                  <View style={[s.avatar, { backgroundColor: `hsl(${hue}, 55%, 55%)` }]}>
                    <Text style={s.avatarText}>
                      {(item.authorNickname || '?')[0].toUpperCase()}
                    </Text>
                  </View>
                  <View style={s.cardMeta}>
                    <Text style={s.author}>{item.authorNickname}</Text>
                    <Text style={s.rating}>
                      {'★'.repeat(item.rating)}{'☆'.repeat(5 - item.rating)}
                    </Text>
                  </View>
                </View>

                <Text style={s.title} numberOfLines={1}>{item.title}</Text>
                <Text style={s.preview} numberOfLines={2}>{item.contentSummary}</Text>

                {/* footer */}
                <View style={s.footer}>
                  <View style={s.footerItem}>
                    <Feather name="heart" size={15} color={C.muted} />
                    <Text style={s.footerText}>{item.likeCount}</Text>
                  </View>
                  <View style={s.footerItem}>
                    <Feather name="message-square" size={15} color={C.muted} />
                    <Text style={s.footerText}>{item.commentCount}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            );
          }}
        />
      )}

      <TouchableOpacity
        style={s.fab}
        onPress={() => navigation.navigate('CreatePost', { country: selectedCountry })}
        activeOpacity={0.85}
      >
        <Feather name="edit-2" size={22} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  /* Country tabs */
  tabBar: { backgroundColor: C.surface, borderBottomWidth: 1, borderBottomColor: C.line },
  tabScroll: { paddingHorizontal: 16, paddingVertical: 10, gap: 8 },
  tab: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: C.bg,
  },
  tabActive:    { backgroundColor: C.brand, borderColor: C.brand },
  tabCode:      { borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2 },
  tabCodeText:  { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  tabText:      { fontSize: 13, fontWeight: '600', color: C.ink2 },
  tabTextActive:{ color: '#fff' },

  list: { padding: 16, paddingBottom: 100 },

  /* Post card — matches design PostCard */
  card: {
    backgroundColor: C.surface, borderRadius: 22, padding: 16,
    marginBottom: 12, ...shadow.sm,
  },
  cardTop: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 11 },
  avatar: {
    width: 36, height: 36, borderRadius: 999,
    alignItems: 'center', justifyContent: 'center',
  },
  avatarText: { color: '#fff', fontSize: 14, fontWeight: '800' },
  cardMeta:   { flex: 1, gap: 1 },
  author:     { fontSize: 14, fontWeight: '700', color: C.ink },
  rating:     { fontSize: 12, color: C.accent, letterSpacing: 1 },
  title:      { fontSize: 16, fontWeight: '700', color: C.ink, marginBottom: 5 },
  preview:    { fontSize: 14, color: C.ink2, lineHeight: 22, marginBottom: 12 },

  footer:     { flexDirection: 'row', gap: 16, alignItems: 'center' },
  footerItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  footerText: { fontSize: 13, fontWeight: '600', color: C.muted },

  /* Empty state */
  emptyBox:     { alignItems: 'center', marginTop: 80, gap: 10 },
  emptyIconBox: {
    width: 64, height: 64, borderRadius: 20,
    backgroundColor: C.surface2, alignItems: 'center', justifyContent: 'center',
    marginBottom: 6,
  },
  emptyTitle:   { fontSize: 17, fontWeight: '700', color: C.ink },
  emptyDesc:    { fontSize: 14, color: C.ink2 },
  emptyBtn: {
    marginTop: 6,
    backgroundColor: C.brandSoft, borderRadius: 999,
    paddingHorizontal: 22, paddingVertical: 10,
  },
  emptyBtnText: { fontSize: 14, fontWeight: '700', color: C.brandInk },

  /* FAB */
  fab: {
    position: 'absolute', right: 20, bottom: 100,
    backgroundColor: C.brand, width: 52, height: 52,
    borderRadius: 16, alignItems: 'center', justifyContent: 'center',
    ...shadow.brand,
  },
});
