import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_SERVER_URL } from '../../constants/config';
import { C } from '../../constants/theme';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const cameraRef = useRef(null);

  async function getUser() {
    const stored = await AsyncStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  }

  async function analyze(base64) {
    setLoading(true);
    try {
      const user = await getUser();
      const res = await fetch(`${AI_SERVER_URL}/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: base64,
          country: user?.travelDestination || '일본',
          airline: user?.airline || '대한항공',
        }),
      });
      const result = await res.json();
      navigation.navigate('AnalysisResult', { result });
    } catch (e) {
      Alert.alert('분석 실패', '다시 시도해주세요.');
    } finally {
      setLoading(false);
      setPreview(null);
    }
  }

  async function takePicture() {
    if (!cameraRef.current) return;
    const photo = await cameraRef.current.takePictureAsync({ base64: true, quality: 0.7 });
    setPreview(photo.uri);
    await analyze(photo.base64);
  }

  async function pickImage() {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      base64: true,
      quality: 0.7,
    });
    if (!result.canceled) {
      setPreview(result.assets[0].uri);
      await analyze(result.assets[0].base64);
    }
  }

  if (!permission) return <View style={styles.container} />;

  if (!permission.granted) {
    return (
      <View style={styles.permBox}>
        <View style={styles.permIcon}>
          <Text style={styles.permIconText}>📷</Text>
        </View>
        <Text style={styles.permTitle}>카메라 접근 권한 필요</Text>
        <Text style={styles.permSub}>물품 촬영을 위해 카메라 권한이 필요해요</Text>
        <TouchableOpacity style={styles.permBtn} onPress={requestPermission}>
          <Text style={styles.permBtnText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingBox}>
        {preview && <Image source={{ uri: preview }} style={styles.preview} />}
        <View style={styles.loadingIndicator}>
          <ActivityIndicator size="large" color="#fff" />
        </View>
        <Text style={styles.loadingTitle}>분석 중</Text>
        <Text style={styles.loadingSub}>AI가 물품을 확인하고 있어요...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        <View style={styles.overlay}>
          <Text style={styles.hint}>물품을 프레임 안에 맞춰주세요</Text>
          <View style={styles.frame}>
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
          </View>
        </View>
      </CameraView>

      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
          <Text style={styles.sideBtnIcon}>🖼️</Text>
          <Text style={styles.sideBtnLabel}>갤러리</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.85}>
          <View style={styles.captureRing}>
            <View style={styles.captureDot} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity style={styles.sideBtn} onPress={() => navigation.navigate('TextAnalysis')}>
          <Text style={styles.sideBtnIcon}>✏️</Text>
          <Text style={styles.sideBtnLabel}>직접입력</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: {
    color: 'rgba(255,255,255,0.8)', fontSize: 13, fontWeight: '500',
    marginBottom: 24, backgroundColor: 'rgba(0,0,0,0.35)',
    paddingHorizontal: 16, paddingVertical: 8, borderRadius: 999,
  },
  frame: { width: 240, height: 240, position: 'relative' },
  corner: { position: 'absolute', width: 24, height: 24, borderColor: '#fff', borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#0A0A0A', paddingVertical: 28, paddingHorizontal: 20,
  },
  sideBtn: { alignItems: 'center', gap: 4 },
  sideBtnIcon: { fontSize: 22 },
  sideBtnLabel: { color: 'rgba(255,255,255,0.6)', fontSize: 11, fontWeight: '500' },
  captureBtn: { padding: 4 },
  captureRing: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.7)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureDot: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#fff' },
  permBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: C.bg },
  permIcon: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: C.primaryLight, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  permIconText: { fontSize: 36 },
  permTitle: { fontSize: 20, fontWeight: '800', color: C.text, marginBottom: 8 },
  permSub: { fontSize: 14, color: C.textSec, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  permBtn: { backgroundColor: C.primary, borderRadius: 14, paddingHorizontal: 32, paddingVertical: 15 },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0A0A' },
  preview: { width: 180, height: 180, borderRadius: 16, marginBottom: 32 },
  loadingIndicator: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  loadingTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  loadingSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
