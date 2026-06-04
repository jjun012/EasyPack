import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import CommunityScreen from '../screens/community/CommunityScreen';
import PostListScreen from '../screens/community/PostListScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import EditPostScreen from '../screens/community/EditPostScreen';
import CameraScreen from '../screens/ai/CameraScreen';
import TextAnalysisScreen from '../screens/ai/TextAnalysisScreen';
import AnalysisResultScreen from '../screens/ai/AnalysisResultScreen';
import BaggageScreen from '../screens/baggage/BaggageScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { C, shadow } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_CONFIG = {
  Home:      { emoji: '🏠', label: '홈' },
  Community: { emoji: '💬', label: '커뮤니티' },
  Camera:    { emoji: '◎',  label: '분석', center: true },
  Baggage:   { emoji: '🧳', label: '수하물' },
  Profile:   { emoji: '👤', label: '내정보' },
};

function TabIcon({ name, focused }) {
  const cfg = TAB_CONFIG[name] || {};

  if (cfg.center) {
    return (
      <View style={tabStyles.centerIcon}>
        <Text style={tabStyles.centerEmoji}>{cfg.emoji}</Text>
      </View>
    );
  }

  return (
    <View style={tabStyles.iconWrap}>
      <Text style={[tabStyles.emoji, { opacity: focused ? 1 : 0.45 }]}>{cfg.emoji}</Text>
    </View>
  );
}

function TabLabel({ name, focused }) {
  const cfg = TAB_CONFIG[name] || {};
  if (cfg.center) return null;
  return (
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
      {cfg.label}
    </Text>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => <TabLabel name={route.name} focused={focused} />,
        headerShown: false,
        tabBarStyle: tabStyles.bar,
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen
        name="Camera"
        component={CameraScreen}
        options={{ tabBarStyle: { display: 'none' } }}
      />
      <Tab.Screen name="Baggage" component={BaggageScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: C.surface },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: C.ink },
        headerTintColor: C.brand,
      }}
    >
      <Stack.Screen name="Community" component={CommunityScreen} options={{ headerShown: false }} />
      <Stack.Screen name="PostList" component={PostListScreen} options={{ title: '커뮤니티' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '여행 후기' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '글 작성' }} />
      <Stack.Screen name="EditPost" component={EditPostScreen} options={{ title: '게시글 수정' }} />
    </Stack.Navigator>
  );
}

export default function AppNavigator() {
  const [initialRoute, setInitialRoute] = useState(null);

  useEffect(() => {
    AsyncStorage.getItem('accessToken').then((token) => {
      setInitialRoute(token ? 'Main' : 'Auth');
    });
  }, []);

  if (!initialRoute) {
    return (
      <View style={splashStyles.container}>
        <View style={splashStyles.logoBox}>
          <Text style={splashStyles.logoText}>EP</Text>
        </View>
        <Text style={splashStyles.wordmark}>
          Easy<Text style={splashStyles.wordmarkBold}>Pack</Text>
        </Text>
        <ActivityIndicator size="small" color={C.brand} style={{ marginTop: 32 }} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen
          name="TextAnalysis"
          component={TextAnalysisScreen}
          options={{
            headerShown: true,
            title: '물품 직접 검색',
            headerStyle: { backgroundColor: C.surface },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', color: C.ink },
            headerTintColor: C.brand,
          }}
        />
        <Stack.Screen
          name="AnalysisResult"
          component={AnalysisResultScreen}
          options={{
            headerShown: true,
            title: '분석 결과',
            headerStyle: { backgroundColor: C.surface },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', color: C.ink },
            headerTintColor: C.brand,
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen
        name="Register"
        component={RegisterScreen}
        options={{
          headerShown: true,
          title: '회원가입',
          headerStyle: { backgroundColor: C.bg },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', color: C.ink },
          headerTintColor: C.brand,
          headerBackTitle: '',
        }}
      />
    </Stack.Navigator>
  );
}

const tabStyles = StyleSheet.create({
  bar: {
    backgroundColor: C.surface,
    borderTopWidth: 1,
    borderTopColor: C.line2,
    paddingTop: 8,
    paddingBottom: Platform.OS === 'ios' ? 22 : 8,
    height: Platform.OS === 'ios' ? 82 : 60,
    shadowColor: '#0E1A33',
    shadowOpacity: 0.06,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: -3 },
    elevation: 8,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  emoji: { fontSize: 22 },
  label: { fontSize: 10, fontWeight: '500', color: C.faint, marginTop: 2 },
  labelActive: { color: C.brand, fontWeight: '700' },

  /* Center (Camera) */
  centerIcon: {
    width: 48, height: 48, borderRadius: 14,
    backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -10,
    shadowColor: C.brand,
    shadowOpacity: 0.35,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 6,
  },
  centerEmoji: { fontSize: 21, color: '#fff' },
});

const splashStyles = StyleSheet.create({
  container: {
    flex: 1, justifyContent: 'center', alignItems: 'center',
    backgroundColor: C.surface,
  },
  logoBox: {
    width: 72, height: 72, borderRadius: 20,
    backgroundColor: C.brandSoft, alignItems: 'center', justifyContent: 'center',
    marginBottom: 16,
  },
  logoText: { color: C.brand, fontWeight: '900', fontSize: 26, letterSpacing: -1 },
  wordmark: { fontSize: 24, fontWeight: '400', color: C.ink, letterSpacing: -0.5 },
  wordmarkBold: { fontWeight: '800', color: C.brand },
});
