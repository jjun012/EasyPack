import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, ActivityIndicator, View } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import LoginScreen from '../screens/auth/LoginScreen';
import RegisterScreen from '../screens/auth/RegisterScreen';
import HomeScreen from '../screens/home/HomeScreen';
import PostListScreen from '../screens/community/PostListScreen';
import PostDetailScreen from '../screens/community/PostDetailScreen';
import CreatePostScreen from '../screens/community/CreatePostScreen';
import EditPostScreen from '../screens/community/EditPostScreen';
import CameraScreen from '../screens/ai/CameraScreen';
import TextAnalysisScreen from '../screens/ai/TextAnalysisScreen';
import AnalysisResultScreen from '../screens/ai/AnalysisResultScreen';
import BaggageScreen from '../screens/baggage/BaggageScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import { C } from '../constants/theme';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const TAB_ICONS = {
  Home:      { active: '⬛', inactive: '⬜', label: '홈' },
  Community: { active: '💬', inactive: '💬', label: '커뮤니티' },
  Camera:    { active: '📷', inactive: '📷', label: '물품분석' },
  Baggage:   { active: '🧳', inactive: '🧳', label: '수하물' },
  Profile:   { active: '👤', inactive: '👤', label: '내정보' },
};

function TabIcon({ name, focused }) {
  const labels = {
    Home: '홈', Community: '커뮤니티', Camera: '분석', Baggage: '수하물', Profile: '내정보',
  };
  const emojis = { Home: '🏠', Community: '💬', Camera: '🔍', Baggage: '🧳', Profile: '👤' };
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={{ fontSize: 20, opacity: focused ? 1 : 0.45 }}>{emojis[name]}</Text>
    </View>
  );
}

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
        tabBarLabel: ({ focused }) => {
          const labels = { Home: '홈', Community: '커뮤니티', Camera: '분석', Baggage: '수하물', Profile: '내정보' };
          return (
            <Text style={{
              fontSize: 10, fontWeight: focused ? '700' : '500',
              color: focused ? C.primary : '#9CA3AF',
              marginTop: 2,
            }}>
              {labels[route.name]}
            </Text>
          );
        },
        headerShown: false,
        tabBarStyle: {
          height: 64, paddingTop: 6, paddingBottom: 8,
          borderTopWidth: 1, borderTopColor: '#E8EAF2',
          backgroundColor: '#fff',
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Community" component={CommunityStack} />
      <Tab.Screen name="Camera" component={CameraScreen} />
      <Tab.Screen name="Baggage" component={BaggageScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

function CommunityStack() {
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: '#fff' },
        headerShadowVisible: false,
        headerTitleStyle: { fontWeight: '700', fontSize: 17, color: '#1A1F36' },
        headerTintColor: C.primary,
      }}
    >
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
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F5F9' }}>
        <View style={{ width: 48, height: 48, borderRadius: 13, backgroundColor: C.primary, alignItems: 'center', justifyContent: 'center', marginBottom: 16 }}>
          <Text style={{ color: '#fff', fontWeight: '800', fontSize: 18 }}>EP</Text>
        </View>
        <ActivityIndicator size="large" color={C.primary} />
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
            headerShown: true, title: '물품 직접 검색',
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', color: '#1A1F36' },
            headerTintColor: C.primary,
          }}
        />
        <Stack.Screen
          name="AnalysisResult"
          component={AnalysisResultScreen}
          options={{
            headerShown: true, title: '분석 결과',
            headerStyle: { backgroundColor: '#fff' },
            headerShadowVisible: false,
            headerTitleStyle: { fontWeight: '700', color: '#1A1F36' },
            headerTintColor: C.primary,
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
          headerShown: true, title: '회원가입',
          headerStyle: { backgroundColor: '#F4F5F9' },
          headerShadowVisible: false,
          headerTitleStyle: { fontWeight: '700', color: '#1A1F36' },
          headerTintColor: C.primary,
        }}
      />
    </Stack.Navigator>
  );
}
