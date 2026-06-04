import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';
import { C, shadow } from '../../constants/theme';

const FLAG = { '일본': '🇯🇵', '미국': '🇺🇸', '베트남': '🇻🇳', '필리핀': '🇵🇭', '태국': '🇹🇭' };

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadAll(); }, []);

  async function loadAll() {
    try {
      const stored = await AsyncStorage.getItem('user');
      if (stored) setMyUserId(JSON.parse(stored).userId);
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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color={C.primary} />;
  if (!post) return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text style={{ color: C.textSec }}>게시글을 찾을 수 없어요.</Text>
    </View>
  );

  const isAuthor = post.authorNickname === myUserId;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.postBox}>
          <View style={styles.badges}>
            <View style={styles.countryBadge}>
              <Text style={styles.countryBadgeText}>
                {FLAG[post.country]} {post.country}
              </Text>
            </View>
            <Text style={styles.rating}>{'★'.repeat(post.rating)}</Text>
          </View>

          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.author}>by {post.authorNickname}</Text>
          <View style={styles.divider} />
          <Text style={styles.content}>{post.content}</Text>

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

        <View style={styles.commentsSection}>
          <Text style={styles.commentTitle}>댓글 {comments.length}</Text>
          {comments.map((c) => (
            <View key={c.id} style={styles.commentCard}>
              <View style={styles.commentHeader}>
                <View style={styles.commentAvatarBox}>
                  <Text style={styles.commentAvatarText}>{c.authorNickname?.[0] || '?'}</Text>
                </View>
                <Text style={styles.commentAuthor}>{c.authorNickname}</Text>
                {c.userId === myUserId && (
                  <TouchableOpacity onPress={() => deleteComment(c.id)} style={styles.commentDelete}>
                    <Text style={styles.commentDeleteText}>삭제</Text>
                  </TouchableOpacity>
                )}
              </View>
              <Text style={styles.commentContent}>{c.content}</Text>
            </View>
          ))}
          <View style={{ height: 90 }} />
        </View>
      </ScrollView>

      <View style={styles.inputBar}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          placeholderTextColor={C.textMuted}
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
  badges: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 },
  countryBadge: {
    backgroundColor: C.primaryLight, borderRadius: 999,
    paddingHorizontal: 12, paddingVertical: 5,
  },
  countryBadgeText: { fontSize: 13, color: C.primary, fontWeight: '600' },
  rating: { fontSize: 14, color: '#F59E0B', letterSpacing: 2 },
  title: { fontSize: 22, fontWeight: '800', color: C.text, letterSpacing: -0.5, marginBottom: 6 },
  author: { fontSize: 13, color: C.textMuted, marginBottom: 16 },
  divider: { height: 1, backgroundColor: C.border, marginBottom: 16 },
  content: { fontSize: 15, color: C.textSec, lineHeight: 26 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 24 },
  likeBtn: {
    flexDirection: 'row', alignItems: 'center',
    paddingHorizontal: 18, paddingVertical: 10,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.border,
  },
  likeBtnActive: { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
  likeBtnText: { fontSize: 15, color: C.textSec, fontWeight: '600' },
  likeBtnTextActive: { color: '#EF4444' },
  authorBtns: { flexDirection: 'row', gap: 8 },
  editBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: C.primaryLight,
  },
  editBtnText: { color: C.primary, fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    paddingHorizontal: 16, paddingVertical: 9,
    borderRadius: 999, backgroundColor: '#FEE2E2',
  },
  deleteBtnText: { color: C.error, fontSize: 13, fontWeight: '600' },
  commentsSection: { paddingHorizontal: 16, paddingTop: 8 },
  commentTitle: { fontSize: 15, fontWeight: '700', color: C.text, marginBottom: 12 },
  commentCard: { backgroundColor: C.surface, borderRadius: 14, padding: 14, marginBottom: 8, ...shadow.sm },
  commentHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 8, gap: 8 },
  commentAvatarBox: {
    width: 28, height: 28, borderRadius: 8,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center',
  },
  commentAvatarText: { fontSize: 12, fontWeight: '700', color: C.primary },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: C.text, flex: 1 },
  commentDelete: { marginLeft: 'auto' },
  commentDeleteText: { fontSize: 12, color: C.error },
  commentContent: { fontSize: 14, color: C.textSec, lineHeight: 20 },
  inputBar: {
    flexDirection: 'row', backgroundColor: C.surface,
    padding: 12, borderTopWidth: 1, borderTopColor: C.border, gap: 8,
  },
  input: {
    flex: 1, backgroundColor: C.bg,
    borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10,
    fontSize: 14, color: C.text, borderWidth: 1, borderColor: C.border,
  },
  sendBtn: {
    backgroundColor: C.primary, borderRadius: 12,
    paddingHorizontal: 18, justifyContent: 'center',
  },
  sendBtnDisabled: { backgroundColor: C.border },
  sendText: { color: '#fff', fontWeight: '700', fontSize: 14 },
});
