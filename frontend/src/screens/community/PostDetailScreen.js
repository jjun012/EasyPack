import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow, COUNTRY_DATA } from '../../constants/theme';

function avatarHue(name) {
  let h = 0;
  for (let i = 0; i < (name || '').length; i++) h = (h + name.charCodeAt(i) * 37) % 360;
  return h;
}

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [myNickname, setMyNickname] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setMyNickname(JSON.parse(stored).nickname);
      const [postData, commentsData, likeData] = await Promise.all([
        api.get(`/api/community/post/${postId}`),
        api.get(`/api/community/post/${postId}/comments`),
        api.get(`/api/community/post/${postId}/like`),
      ]);
      setPost(postData);
      setComments(commentsData);
      setLiked(likeData.liked);
    } catch (e) {
    } finally {
      setLoading(false);
    }
  }

  async function toggleLike() {
    try {
      const res = await api.post(`/api/community/post/${postId}/like`);
      setLiked(res.liked);
      setPost((p) => ({ ...p, likeCount: p.likeCount + (res.liked ? 1 : -1) }));
    } catch (e) {
      Alert.alert('오류', e.message);
    }
  }

  async function submitComment() {
    if (!commentText.trim()) return;
    try {
      const newComment = await api.post(`/api/community/post/${postId}/comment`, { content: commentText });
      setComments((prev) => [...prev, newComment]);
      setCommentText('');
    } catch (e) {
      Alert.alert('오류', e.message);
    }
  }

  async function deleteComment(commentId) {
    Alert.alert('댓글 삭제', '삭제하시겠어요?', [
      { text: '취소' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/community/comment/${commentId}`);
            setComments((prev) => prev.filter((c) => c.id !== commentId));
          } catch (e) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  }

  async function deletePost() {
    Alert.alert('게시글 삭제', '삭제하시겠어요?', [
      { text: '취소' },
      {
        text: '삭제', style: 'destructive', onPress: async () => {
          try {
            await api.delete(`/api/community/post/${postId}`);
            navigation.goBack();
          } catch (e) {
            Alert.alert('오류', e.message);
          }
        },
      },
    ]);
  }

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={C.brand} />;
  if (!post) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: C.ink2 }}>게시글을 찾을 수 없어요.</Text>
    </View>
  );

  const isAuthor = post.authorNickname === myNickname;
  const authorHue = avatarHue(post.authorNickname);
  const cd = COUNTRY_DATA[post.country] || {};

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.postBox}>
          {/* Author + badges row */}
          <View style={styles.authorRow}>
            <View style={[styles.authorAvatar, { backgroundColor: `hsl(${authorHue}, 60%, 55%)` }]}>
              <Text style={styles.authorAvatarText}>
                {(post.authorNickname || '?')[0].toUpperCase()}
              </Text>
            </View>
            <View style={styles.authorInfo}>
              <Text style={styles.authorName}>{post.authorNickname}</Text>
              <Text style={styles.ratingRow}>
                {'★'.repeat(post.rating)}{'☆'.repeat(5 - post.rating)}
              </Text>
            </View>
            {/* Country code badge */}
            <View style={[styles.countryBadge, { backgroundColor: cd.tint || C.brandSoft }]}>
              <Text style={[styles.countryBadgeText, { color: cd.ink || C.brand }]}>
                {cd.code || post.country?.slice(0, 2).toUpperCase()}
              </Text>
            </View>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>{post.content}</Text>

          {/* Actions */}
          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.likeBtn, liked && styles.likeBtnActive]}
              onPress={toggleLike}
              activeOpacity={0.8}
            >
              <Text style={[styles.likeBtnText, liked && styles.likeBtnTextActive]}>
                {liked ? '♥' : '♡'} {post.likeCount}
              </Text>
            </TouchableOpacity>
            {isAuthor && (
              <View style={styles.authorBtns}>
                <TouchableOpacity
                  style={styles.editBtn}
                  onPress={() => navigation.navigate('EditPost', { post })}
                >
                  <Text style={styles.editBtnText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.deleteBtn} onPress={deletePost}>
                  <Text style={styles.deleteBtnText}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Comments */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentTitle}>댓글 {comments.length}</Text>
          {comments.map((c) => {
            const cHue = avatarHue(c.authorNickname);
            return (
              <View key={c.id} style={styles.commentCard}>
                <View style={styles.commentHeader}>
                  <View style={[styles.commentAvatar, { backgroundColor: `hsl(${cHue}, 60%, 55%)` }]}>
                    <Text style={styles.commentAvatarText}>{(c.authorNickname || '?')[0].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.commentAuthor}>{c.authorNickname}</Text>
                  {c.authorNickname === myNickname && (
                    <TouchableOpacity onPress={() => deleteComment(c.id)} style={styles.commentDelete}>
                      <Text style={styles.commentDeleteText}>삭제</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.commentContent}>{c.content}</Text>
              </View>
            );
          })}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      {/* Comment input bar */}
      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={C.faint}
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity
          style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
          onPress={submitComment}
        >
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },

  postBox: { backgroundColor: C.surface, padding: 24, marginBottom: 8 },

  authorRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 16 },
  authorAvatar: {
    width: 44, height: 44, borderRadius: 22,
    alignItems: 'center', justifyContent: 'center',
  },
  authorAvatarText: { color: '#fff', fontSize: 16, fontWeight: '800' },
  authorInfo: { flex: 1 },
  authorName: { fontSize: 14, fontWeight: '700', color: C.ink, marginBottom: 2 },
  ratingRow: { fontSize: 13, color: C.warn, letterSpacing: 1 },
  countryBadge: {
    borderRadius: 8, paddingHorizontal: 8, paddingVertical: 5,
  },
  countryBadgeText: { fontSize: 11, fontWeight: '800', letterSpacing: 0.5 },

  title: { fontSize: 22, fontWeight: '800', color: C.ink, letterSpacing: -0.5, marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.line, marginBottom: 16 },
  content: { fontSize: 15, color: C.ink2, lineHeight: 26 },

  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  likeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.line,
  },
  likeBtnActive: { backgroundColor: C.noSoft, borderColor: C.no },
  likeBtnText: { fontSize: 15, color: C.ink2, fontWeight: '600' },
  likeBtnTextActive: { color: C.no },
  authorBtns: { flexDirection: 'row', gap: 8 },
  editBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: C.brandSoft,
  },
  editBtnText: { color: C.brand, fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: C.noSoft,
  },
  deleteBtnText: { color: C.no, fontSize: 13, fontWeight: '600' },

  commentsSection: { paddingHorizontal: 16, paddingTop: 8 },
  commentTitle: { fontSize: 15, fontWeight: '700', color: C.ink, marginBottom: 12 },
  commentCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, ...shadow.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  commentAvatar: {
    width: 28, height: 28, borderRadius: 14,
    alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 11, fontWeight: '800', color: '#fff' },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: C.ink, flex: 1 },
  commentDelete: { marginLeft: 'auto' },
  commentDeleteText: { fontSize: 12, color: C.no },
  commentContent: { fontSize: 14, color: C.ink2, lineHeight: 20 },

  inputBar: {
    flexDirection: 'row', backgroundColor: C.surface,
    padding: 12, borderTopWidth: 1, borderTopColor: C.line, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: C.bg,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: C.ink, borderWidth: 1, borderColor: C.line,
  },
  sendBtn: {
    backgroundColor: C.brand, borderRadius: 12,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.line },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
