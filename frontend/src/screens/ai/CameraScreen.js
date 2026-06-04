import React, { useState, useRef } from 'react';
import {
  View, Text, TouchableOpacity, StyleSheet,
  Alert, ActivityIndicator, Image, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { AI_SERVER_URL } from '../../constants/config';
import { C, shadow, COUNTRY_DATA, AIRLINE_DATA } from '../../constants/theme';

export default function CameraScreen({ navigation }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [userInfo, setUserInfo] = useState(null);
  const cameraRef = useRef(null);
  const scanAnim = useRef(new Animated.Value(0)).current;

  React.useEffect(() => {
    AsyncStorage.getItem('user').then((s) => {
      if (s) setUserInfo(JSON.parse(s));
    });
    // Start scan line animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(scanAnim, { toValue: 1, duration: 1800, useNativeDriver: true }),
        Animated.timing(scanAnim, { toValue: 0, duration: 1800, useNativeDriver: true }),
      ])
    ).start();
  }, []);

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

  const dest = userInfo?.travelDestination;
  const cd = COUNTRY_DATA[dest] || {};
  const ad = AIRLINE_DATA[userInfo?.airline] || {};

  const scanY = scanAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 220],
  });

  return (
    <View style={styles.container}>
      <CameraView ref={cameraRef} style={styles.camera} facing="back">
        {/* Top info pill */}
        <View style={styles.topBar}>
          {dest && (
            <View style={styles.infoPill}>
              <View style={[styles.infoPillCode, { backgroundColor: cd.bg || C.brand }]}>
                <Text style={styles.infoPillCodeText}>{cd.code || dest?.slice(0, 2).toUpperCase()}</Text>
              </View>
              {userInfo?.airline && (
                <>
                  <Text style={styles.infoPillDivider}>·</Text>
                  <View style={[styles.infoPillCode, { backgroundColor: ad.color || C.brand }]}>
                    <Text style={styles.infoPillCodeText}>{ad.code || 'KE'}</Text>
                  </View>
                </>
              )}
              <Text style={styles.infoPillText}>{dest}</Text>
            </View>
          )}
        </View>

        {/* Scan frame overlay */}
        <View style={styles.overlay}>
          <Text style={styles.hint}>물품을 프레임 안에 맞춰주세요</Text>
          <View style={styles.frame}>
            {/* Corner brackets */}
            <View style={[styles.corner, styles.cornerTL]} />
            <View style={[styles.corner, styles.cornerTR]} />
            <View style={[styles.corner, styles.cornerBL]} />
            <View style={[styles.corner, styles.cornerBR]} />
            {/* Animated scan line */}
            <Animated.View style={[styles.scanLine, { transform: [{ translateY: scanY }] }]} />
          </View>
        </View>
      </CameraView>

      {/* Bottom controls */}
      <View style={styles.controls}>
        <TouchableOpacity style={styles.sideBtn} onPress={pickImage}>
          <View style={styles.sideBtnIcon}>
            <Text style={styles.sideBtnEmoji}>🖼️</Text>
          </View>
          <Text style={styles.sideBtnLabel}>갤러리</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.captureBtn} onPress={takePicture} activeOpacity={0.85}>
          <View style={styles.captureRing}>
            <View style={styles.captureDot} />
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.sideBtn}
          onPress={() => navigation.navigate('TextAnalysis')}
        >
          <View style={styles.sideBtnIcon}>
            <Text style={styles.sideBtnEmoji}>✏️</Text>
          </View>
          <Text style={styles.sideBtnLabel}>직접입력</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0A0E16' },
  camera: { flex: 1 },

  topBar: {
    position: 'absolute', top: 0, left: 0, right: 0,
    paddingTop: 56, paddingHorizontal: 20,
    alignItems: 'center',
  },
  infoPill: {
    flexDirection: 'row', alignItems: 'center', gap: 6,
    backgroundColor: 'rgba(0,0,0,0.55)',
    borderRadius: 999, paddingHorizontal: 10, paddingVertical: 6,
  },
  infoPillCode: {
    borderRadius: 5, paddingHorizontal: 6, paddingVertical: 2,
  },
  infoPillCodeText: { color: '#fff', fontSize: 10, fontWeight: '800' },
  infoPillDivider: { color: 'rgba(255,255,255,0.4)', fontSize: 12 },
  infoPillText: { color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '600' },

  overlay: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  hint: {
    color: 'rgba(255,255,255,0.85)', fontSize: 13, fontWeight: '500',
    marginBottom: 20, backgroundColor: 'rgba(0,0,0,0.45)',
    paddingHorizontal: 16, paddingVertical: 7, borderRadius: 999,
  },
  frame: { width: 240, height: 240, position: 'relative', overflow: 'hidden' },
  corner: { position: 'absolute', width: 28, height: 28, borderColor: C.brand, borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 4 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 4 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 4 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 4 },
  scanLine: {
    position: 'absolute', left: 0, right: 0, height: 2,
    backgroundColor: C.brand, opacity: 0.8,
  },

  controls: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-around',
    backgroundColor: '#0A0E16', paddingVertical: 28, paddingHorizontal: 20,
  },
  sideBtn: { alignItems: 'center', gap: 6 },
  sideBtnIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: 'rgba(255,255,255,0.08)',
    alignItems: 'center', justifyContent: 'center',
  },
  sideBtnEmoji: { fontSize: 22 },
  sideBtnLabel: { color: 'rgba(255,255,255,0.55)', fontSize: 11, fontWeight: '500' },

  captureBtn: { padding: 4 },
  captureRing: {
    width: 76, height: 76, borderRadius: 38,
    borderWidth: 3, borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center', justifyContent: 'center',
  },
  captureDot: { width: 60, height: 60, borderRadius: 30, backgroundColor: '#fff' },

  permBox: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32, backgroundColor: C.bg },
  permIcon: {
    width: 80, height: 80, borderRadius: 22,
    backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center', marginBottom: 20,
  },
  permIconText: { fontSize: 36 },
  permTitle: { fontSize: 20, fontWeight: '800', color: C.ink, marginBottom: 8 },
  permSub: { fontSize: 14, color: C.ink2, textAlign: 'center', lineHeight: 20, marginBottom: 32 },
  permBtn: {
    backgroundColor: C.brand, borderRadius: 14,
    paddingHorizontal: 32, paddingVertical: 15,
    ...shadow.brand,
  },
  permBtnText: { color: '#fff', fontWeight: '700', fontSize: 16 },

  loadingBox: { flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#0A0E16' },
  preview: { width: 180, height: 180, borderRadius: 16, marginBottom: 32 },
  loadingIndicator: {
    width: 64, height: 64, borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.1)', alignItems: 'center', justifyContent: 'center', marginBottom: 16,
  },
  loadingTitle: { color: '#fff', fontSize: 18, fontWeight: '700', marginBottom: 6 },
  loadingSub: { color: 'rgba(255,255,255,0.5)', fontSize: 14 },
});
