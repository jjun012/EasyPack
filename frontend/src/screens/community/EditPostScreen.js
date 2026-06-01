import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';

export default function EditPostScreen({ route, navigation }) {
  const { post } = route.params;
  const [title, setTitle] = useState(post.title);
  const [content, setContent] = useState(post.content);
  const [rating, setRating] = useState(post.rating);
  const [country, setCountry] = useState(post.country);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await api.put(`/api/community/post/${post.id}`, { title, content, rating, country });
      navigation.goBack();
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.label}>여행 국가</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={country} onValueChange={setCountry}>
          {COUNTRIES.map((c) => <Picker.Item key={c} label={c} value={c} />)}
        </Picker>
      </View>

      <Text style={styles.label}>별점</Text>
      <View style={styles.stars}>
        {[1, 2, 3, 4, 5].map((s) => (
          <TouchableOpacity key={s} onPress={() => setRating(s)}>
            <Text style={styles.star}>{s <= rating ? '⭐' : '☆'}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>제목</Text>
      <TextInput
        style={styles.input}
        value={title}
        onChangeText={setTitle}
        maxLength={200}
      />

      <Text style={styles.label}>내용</Text>
      <TextInput
        style={[styles.input, styles.textarea]}
        value={content}
        onChangeText={setContent}
        multiline
        textAlignVertical="top"
      />

      <TouchableOpacity style={styles.button} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>수정 완료</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  content: { padding: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#555', marginBottom: 6, marginTop: 12 },
  pickerWrapper: { borderWidth: 1, borderColor: '#ddd', borderRadius: 10, marginBottom: 4 },
  stars: { flexDirection: 'row', marginBottom: 8 },
  star: { fontSize: 28, marginRight: 4 },
  input: {
    borderWidth: 1, borderColor: '#ddd', borderRadius: 10,
    padding: 14, fontSize: 15, marginBottom: 4,
  },
  textarea: { height: 180 },
  button: {
    backgroundColor: '#4A90E2', borderRadius: 10,
    padding: 16, alignItems: 'center', marginTop: 20,
  },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});
