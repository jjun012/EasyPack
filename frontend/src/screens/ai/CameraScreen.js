import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_SERVER_URL } from '../../constants/config';

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

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.permissionBox}>
        <Text style={styles.permissionText}>카메라 권한이 필요해요</Text>
        <TouchableOpacity style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>권한 허용</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.loadingBox}>
          {preview && <Image source={{ uri: preview }} style={styles.preview} />}
          <ActivityIndicator size="large" color="#4A90E2" style={{ marginTop: 20 }} />
          <Text style={styles.loadingText}>AI가 물품을 분석 중이에요...</Text>
        </View>
      ) : (
        <>
          <CameraView ref={cameraRef} style={styles.camera} facing="back">
            <View style={styles.overlay}>
              <View style={styles.scanFrame} />
              <Text style={styles.hint}>물품을 프레임 안에 맞춰주세요</Text>
            </View>
          </CameraView>
          <View style={styles.controls}>
            <TouchableOpacity style={styles.galleryBtn} onPress={pickImage}>
              <Text style={styles.galleryText}>🖼️ 갤러리</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.captureBtn} onPress={takePicture}>
              <View style={styles.captureInner} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.textBtn}
              onPress={() => navigation.navigate('TextAnalysis')}
            >
              <Text style={styles.galleryText}>✍️ 직접입력</Text>
            </TouchableOpacity>
          </View>
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#000' },
  camera: { flex: 1 },
  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  scanFrame: {
    width: 240, height: 240, borderWidth: 2,
    borderColor: '#fff', borderRadius: 12,
  },
  hint: { color: '#fff', marginTop: 16, fontSize: 14 },
  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#000', paddingVertical: 24,
  },
  galleryBtn: { padding: 12 },
  textBtn: { padding: 12 },
  galleryText: { color: '#fff', fontSize: 14 },
  captureBtn: {
    width: 70, height: 70, borderRadius: 35,
    borderWidth: 4, borderColor: '#fff', alignItems: 'center', justifyContent: 'center',
  },
  captureInner: { width: 54, height: 54, borderRadius: 27, backgroundColor: '#fff' },
  permissionBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 24 },
  permissionText: { fontSize: 16, marginBottom: 20, textAlign: 'center' },
  button: { backgroundColor: '#4A90E2', padding: 14, borderRadius: 10 },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#111' },
  preview: { width: 200, height: 200, borderRadius: 12 },
  loadingText: { color: '#fff', marginTop: 16, fontSize: 15 },
});
