import React, { useState } from 'react';
import {
  View, Text, TextInput, TouchableOpacity,
  StyleSheet, Alert, ActivityIndicator, ScrollView,
} from 'react-native';
import { api } from '../../api/client';
import { COUNTRIES } from '../../constants/config';
import { C, shadow, COUNTRY_DATA } from '../../constants/theme';

export default function CreatePostScreen({ route, navigation }) {
  const initialCountry = route.params?.country || COUNTRIES[0];
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [rating, setRating] = useState(5);
  const [country, setCountry] = useState(initialCountry);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!title.trim() || !content.trim()) {
      Alert.alert('오류', '제목과 내용을 입력해주세요.');
      return;
    }
    setLoading(true);
    try {
      await api.post('/api/community/post', { title, content, rating, country });
      navigation.goBack();
    } catch (e) {
      Alert.alert('오류', e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      {/* Country selection — pill grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>여행 국가</Text>
        <View style={styles.countryGrid}>
          {COUNTRIES.map((c) => {
            const d = COUNTRY_DATA[c] || {};
            const active = country === c;
            return (
              <TouchableOpacity
                key={c}
                style={[styles.countryPill, active && styles.countryPillActive]}
                onPress={() => setCountry(c)}
                activeOpacity={0.75}
              >
                <View style={[styles.codeBadge, { backgroundColor: active ? C.brand : C.line }]}>
                  <Text style={[styles.codeBadgeText, { color: active ? '#fff' : C.muted }]}>
                    {d.code || c.slice(0, 2).toUpperCase()}
                  </Text>
                </View>
                <Text style={[styles.pillLabel, active && styles.pillLabelActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Star rating */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>별점</Text>
        <View style={styles.stars}>
          {[1, 2, 3, 4, 5].map((s) => (
            <TouchableOpacity key={s} onPress={() => setRating(s)} style={styles.starBtn}>
              <Text style={[styles.star, s <= rating && styles.starActive]}>
                {s <= rating ? '★' : '☆'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Title */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>제목</Text>
        <TextInput
          style={styles.input}
          placeholder="제목을 입력하세요"
          placeholderTextColor={C.faint}
          value={title}
          onChangeText={setTitle}
          maxLength={200}
        />
      </View>

      {/* Content */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>내용</Text>
        <TextInput
          style={[styles.input, styles.textarea]}
          placeholder="여행 후기를 자유롭게 작성해보세요"
          placeholderTextColor={C.faint}
          value={content}
          onChangeText={setContent}
          multiline
          textAlignVertical="top"
        />
      </View>

      <TouchableOpacity style={styles.btn} onPress={handleSubmit} disabled={loading}>
        {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnText}>게시글 작성</Text>}
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: C.bg },
  content: { padding: 20, paddingBottom: 48 },

  section: { backgroundColor: C.surface, borderRadius: 16, padding: 18, marginBottom: 12, ...shadow.sm },
  sectionTitle: {
    fontSize: 11, fontWeight: '700', color: C.muted,
    textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12,
  },

  countryGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  countryPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    paddingHorizontal: 12, paddingVertical: 8,
    borderRadius: 999, borderWidth: 1.5, borderColor: C.line,
    backgroundColor: C.bg,
  },
  countryPillActive: { backgroundColor: C.brandSoft, borderColor: C.brand },
  codeBadge: { borderRadius: 4, paddingHorizontal: 5, paddingVertical: 2 },
  codeBadgeText: { fontSize: 10, fontWeight: '800', letterSpacing: 0.5 },
  pillLabel: { fontSize: 13, fontWeight: '500', color: C.ink2 },
  pillLabelActive: { color: C.brand, fontWeight: '700' },

  stars: { flexDirection: 'row', gap: 6 },
  starBtn: { padding: 4 },
  star: { fontSize: 30, color: C.line },
  starActive: { color: C.warn },

  input: {
    backgroundColor: C.bg, borderRadius: 12,
    paddingHorizontal: 14, paddingVertical: 13,
    fontSize: 15, color: C.ink, borderWidth: 1.5, borderColor: C.line,
  },
  textarea: { height: 180, paddingTop: 13 },

  btn: {
    backgroundColor: C.brand, borderRadius: 14,
    paddingVertical: 17, alignItems: 'center',
    ...shadow.brand,
  },
  btnText: { color: '#fff', fontSize: 16, fontWeight: '700' },
});
