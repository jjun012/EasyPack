import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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


/* ── Custom frosted-glass tab bar ─────────────── */
function CustomTabBar({ state, descriptors, navigation }) {
  const { bottom: bottomInset } = useSafeAreaInsets();
  const press = (route, focused) => {
    const event = navigation.emit({ type: 'tabPress', target: route.key, canPreventDefault: true });
    if (!focused && !event.defaultPrevented) navigation.navigate(route.name);
  };

  const leftRoutes  = state.routes.slice(0, 2);
  const fabRoute    = state.routes[2];
  const rightRoutes = state.routes.slice(3, 5);
  const fabFocused  = state.index === 2;

  return (
    /* Outer wrap — NO overflow:hidden so FAB isn't clipped */
    <View style={[tabStyles.outerWrap, { bottom: (bottomInset || 0) + (Platform.OS === 'ios' ? 20 : 14) }]} pointerEvents="box-none">

      {/* Pill bar (blur + border) — overflow:hidden only here */}
      <View style={tabStyles.pillShell}>
        <BlurView intensity={55} tint="light" style={tabStyles.pillInner}>
          {/* Left 2 tabs */}
          {leftRoutes.map((route, i) => {
            const cfg     = TABS.find((t) => t.name === route.name) || {};
            const focused = state.index === i;
            return (
              <View
                key={route.key}
                style={tabStyles.tab}
                accessible accessibilityRole="button"
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => press(route, focused)}
              >
                <Feather name={cfg.icon} size={22} color={focused ? C.brand : '#9AA4B8'} />
                <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{cfg.label}</Text>
              </View>
            );
          })}

          {/* Centre spacer for FAB */}
          <View style={{ flex: 1 }} />

          {/* Right 2 tabs */}
          {rightRoutes.map((route, i) => {
            const idx     = i + 3;
            const cfg     = TABS.find((t) => t.name === route.name) || {};
            const focused = state.index === idx;
            return (
              <View
                key={route.key}
                style={tabStyles.tab}
                accessible accessibilityRole="button"
                onStartShouldSetResponder={() => true}
                onResponderGrant={() => press(route, focused)}
              >
                <Feather name={cfg.icon} size={22} color={focused ? C.brand : '#9AA4B8'} />
                <Text style={[tabStyles.label, focused && tabStyles.labelActive]}>{cfg.label}</Text>
              </View>
            );
          })}
        </BlurView>
      </View>

      {/* FAB — lives OUTSIDE pillShell so it's never clipped.
          pointerEvents="box-none" makes the wrapper transparent to touches;
          only the inner circle captures taps. */}
      <View style={tabStyles.fabWrap} pointerEvents="box-none">
        <View
          style={tabStyles.fab}
          accessible accessibilityRole="button" accessibilityLabel="물품 촬영"
          onStartShouldSetResponder={() => true}
          onResponderGrant={() => press(fabRoute, fabFocused)}
        >
          <Feather name="maximize" size={24} color="#fff" />
        </View>
      </View>

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
      if (!token) { setInitialRoute('Auth'); return; }
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        const valid = payload.exp && payload.exp * 1000 > Date.now();
        if (!valid) AsyncStorage.removeItem('accessToken');
        setInitialRoute(valid ? 'Main' : 'Auth');
      } catch {
        AsyncStorage.removeItem('accessToken');
        setInitialRoute('Auth');
      }
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
const BAR_HEIGHT  = 64;
const FAB_SIZE    = 54;
const FAB_OVERHANG = 22;   // how far FAB pops above the bar
const OUTER_H     = BAR_HEIGHT + FAB_OVERHANG;

const tabStyles = StyleSheet.create({
  /* Outer wrapper — no overflow so FAB is never clipped */
  outerWrap: {
    position: 'absolute',
    left: 12, right: 12,
    height: OUTER_H,
  },

  /* Pill background + border — overflow hidden only here */
  pillShell: {
    position: 'absolute',
    bottom: 0, left: 0, right: 0,
    height: BAR_HEIGHT,
    borderRadius: 999,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.65)',
    shadowColor: '#0E1A33',
    shadowOpacity: 0.18,
    shadowRadius: 22,
    shadowOffset: { width: 0, height: 8 },
    elevation: 10,
  },
  pillInner: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    backgroundColor: Platform.OS === 'android' ? 'rgba(255,255,255,0.96)' : 'transparent',
  },

  /* Regular tab */
  tab: {
    flex: 1,
    height: BAR_HEIGHT,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 3,
  },
  label: {
    fontSize: 10.5, fontWeight: '700', color: '#9AA4B8', letterSpacing: -0.1,
  },
  labelActive: { color: C.brand },

  /* FAB wrapper — sits at top-centre of outerWrap, outside pillShell */
  fabWrap: {
    position: 'absolute',
    top: 0,
    left: 0, right: 0,
    alignItems: 'center',
  },
  fab: {
    width: FAB_SIZE, height: FAB_SIZE, borderRadius: 999,
    backgroundColor: C.brand,
    alignItems: 'center', justifyContent: 'center',
    shadowColor: C.brand,
    shadowOpacity: 0.40,
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
