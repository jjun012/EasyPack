import React, { useEffect, useState } from 'react';
import {
  View, Text, ScrollView, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { api } from '../../api/client';

export default function PostDetailScreen({ route, navigation }) {
  const { postId } = route.params;
  const [post, setPost] = useState(null);
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [liked, setLiked] = useState(false);
  const [myUserId, setMyUserId] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAll();
  }, []);

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

  if (loading) return <ActivityIndicator style={{ flex: 1 }} color="#4A90E2" />;
  if (!post) return <Text style={{ textAlign: 'center', marginTop: 40 }}>게시글을 찾을 수 없어요.</Text>;

  const isAuthor = post.authorNickname === myUserId;

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView style={styles.container}>
        <View style={styles.postBox}>
          <View style={styles.postHeader}>
            <Text style={styles.country}>{post.country}</Text>
            <Text style={styles.rating}>{'⭐'.repeat(post.rating)}</Text>
          </View>
          <Text style={styles.title}>{post.title}</Text>
          <Text style={styles.author}>{post.authorNickname}</Text>
          <Text style={styles.content}>{post.content}</Text>

          <View style={styles.actions}>
            <TouchableOpacity style={styles.likeBtn} onPress={toggleLike}>
              <Text style={styles.likeBtnText}>{liked ? '❤️' : '🤍'} {post.likeCount}</Text>
            </TouchableOpacity>
            {isAuthor && (
              <View style={styles.authorActions}>
                <TouchableOpacity onPress={() => navigation.navigate('EditPost', { post })}>
                  <Text style={styles.editText}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={deletePost}>
                  <Text style={styles.deleteText}>삭제</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        <Text style={styles.commentTitle}>댓글 {comments.length}개</Text>
        {comments.map((c) => (
          <View key={c.id} style={styles.commentBox}>
            <View style={styles.commentHeader}>
              <Text style={styles.commentAuthor}>{c.authorNickname}</Text>
              {c.userId === myUserId && (
                <TouchableOpacity onPress={() => deleteComment(c.id)}>
                  <Text style={styles.deleteText}>삭제</Text>
                </TouchableOpacity>
              )}
            </View>
            <Text style={styles.commentContent}>{c.content}</Text>
          </View>
        ))}
        <View style={{ height: 80 }} />
      </ScrollView>

      <View style={styles.commentInput}>
        <TextInput
          style={styles.input}
          placeholder="댓글을 입력하세요..."
          value={commentText}
          onChangeText={setCommentText}
        />
        <TouchableOpacity style={styles.sendBtn} onPress={submitComment}>
          <Text style={styles.sendText}>전송</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f5f5' },
  postBox: { backgroundColor: '#fff', padding: 20, marginBottom: 8 },
  postHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  country: { fontSize: 13, color: '#4A90E2', fontWeight: '600' },
  rating: { fontSize: 13 },
  title: { fontSize: 20, fontWeight: 'bold', color: '#222', marginBottom: 4 },
  author: { fontSize: 13, color: '#999', marginBottom: 16 },
  content: { fontSize: 15, color: '#444', lineHeight: 24 },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20, alignItems: 'center' },
  likeBtn: { padding: 8 },
  likeBtnText: { fontSize: 18 },
  authorActions: { flexDirection: 'row', gap: 16 },
  editText: { color: '#4A90E2', fontSize: 14 },
  deleteText: { color: '#e74c3c', fontSize: 14 },
  commentTitle: { fontSize: 16, fontWeight: 'bold', padding: 16, paddingBottom: 8 },
  commentBox: { backgroundColor: '#fff', padding: 14, marginHorizontal: 8, marginBottom: 6, borderRadius: 10 },
  commentHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 4 },
  commentAuthor: { fontSize: 13, fontWeight: '600', color: '#555' },
  commentContent: { fontSize: 14, color: '#444', lineHeight: 20 },
  commentInput: {
    flexDirection: 'row', backgroundColor: '#fff',
    padding: 12, borderTopWidth: 1, borderTopColor: '#eee',
  },
  input: {
    flex: 1, borderWidth: 1, borderColor: '#ddd',
    borderRadius: 20, paddingHorizontal: 14, paddingVertical: 8, fontSize: 14,
  },
  sendBtn: { marginLeft: 8, backgroundColor: '#4A90E2', borderRadius: 20, paddingHorizontal: 16, justifyContent: 'center' },
  sendText: { color: '#fff', fontWeight: 'bold' },
});
