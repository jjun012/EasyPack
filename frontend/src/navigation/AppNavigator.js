import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';

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
const Tab   = createBottomTabNavigator();

/* ── Tab config ──────────────────────────────── */
const TABS = [
  { name: 'Home',      icon: 'home',          label: '홈' },
  { name: 'Community', icon: 'message-square', label: '커뮤니티' },
  { name: 'Camera',    icon: 'maximize',       label: null, fab: true },
  { name: 'Baggage',   icon: 'briefcase',      label: '수하물' },
  { name: 'Profile',   icon: 'user',           label: '내 정보' },
];

function TabIcon({ name, focused }) {
  const cfg = TABS.find((t) => t.name === name) || {};

  if (cfg.fab) {
    return (
      <View style={tabStyles.fab}>
        <Feather name="maximize" size={24} color="#fff" />
      </View>
    );
  }

  return (
    <View style={tabStyles.iconWrap}>
      <Feather
        name={cfg.icon}
        size={22}
        color={focused ? C.brand : '#9AA4B8'}
        strokeWidth={focused ? 2.2 : 1.8}
      />
    </View>
  );
}

function TabLabel({ name, focused }) {
  const cfg = TABS.find((t) => t.name === name) || {};
  if (!cfg.label) return null;
  return (
    <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
      {cfg.label}
    </Text>
  );
}

/* ── Custom frosted-glass tab bar ─────────────── */
function CustomTabBar({ state, descriptors, navigation }) {
  return (
    <View style={tabStyles.barWrap} pointerEvents="box-none">
      <BlurView intensity={60} tint="light" style={tabStyles.bar}>
        {state.routes.map((route, index) => {
          const cfg     = TABS.find((t) => t.name === route.name) || {};
          const focused = state.index === index;
          const { options } = descriptors[route.key];

          const onPress = () => {
            const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
            if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          if (cfg.fab) {
            return (
              <View key={route.key} style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                <View
                  style={tabStyles.fab}
                  accessible
                  accessibilityRole="button"
                  accessibilityLabel="물품 촬영"
                  onStartShouldSetResponder={() => true}
                  onResponderGrant={onPress}
                >
                  <Feather name="maximize" size={24} color="#fff" />
                </View>
              </View>
            );
          }

          return (
            <View
              key={route.key}
              style={tabStyles.tab}
              accessible
              accessibilityRole="button"
              onStartShouldSetResponder={() => true}
              onResponderGrant={onPress}
            >
              <Feather
                name={cfg.icon}
                size={22}
                color={focused ? C.brand : '#9AA4B8'}
              />
              {cfg.label && (
                <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>
                  {cfg.label}
                </Text>
              )}
            </View>
          );
        })}
      </BlurView>
    </View>
  );
}

/* ── Main tabs ───────────────────────────────── */
function MainTabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{ headerShown: false }}
    >
      <Tab.Screen name="Home"      component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Camera"    component={CameraScreen} />
      <Tab.Screen name="Baggage"   component={BaggageScreen} />
      <Tab.Screen name="Profile"   component={ProfileScreen} />
    </Tab.Navigator>
  );
}

/* ── Community stack ─────────────────────────── */
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
      <Stack.Screen name="PostList"  component={PostListScreen}  options={{ title: '커뮤니티' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '여행 후기' }} />
      <Stack.Screen name="CreatePost" component={CreatePostScreen} options={{ title: '글 작성' }} />
      <Stack.Screen name="EditPost"   component={EditPostScreen}   options={{ title: '게시글 수정' }} />
    </Stack.Navigator>
  );
}

/* ── Root navigator ──────────────────────────── */
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

/* ── Auth stack ──────────────────────────────── */
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

/* ── Styles ──────────────────────────────────── */
const tabStyles = StyleSheet.create({
  /* floating pill container */
  barWrap: {
    position: 'absolute',
    left: 12, right: 12,
    bottom: Platform.OS === 'ios' ? 20 : 14,
    height: 64,
    borderRadius: 999,
    overflow: 'hidden',
    /* inner highlight ring */
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0E1A33',
    shadowOpacity: 0.18,
    shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  bar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.95)' : 'transparent',
  },

  /* regular tab */
  tab: {
    flex: 1,
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  iconWrap: { alignItems: 'center', justifyContent: 'center' },
  label: {
    fontSize: 10.5, fontWeight: '700', color: '#9AA4B8', letterSpacing: -0.1,
  },
  labelActive: { color: C.brand },

  /* FAB (camera) */
  fab: {
    width: 54, height: 54, borderRadius: 999,
    backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
    marginTop: -22,
    shadowColor: C.brand,
    shadowOpacity: 0.38,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
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
  logoText:    { color: C.brand, fontWeight: '900', fontSize: 26, letterSpacing: -1 },
  wordmark:    { fontSize: 24, fontWeight: '400', color: C.ink, letterSpacing: -0.5 },
  wordmarkBold:{ fontWeight: '800', color: C.brand },
});
