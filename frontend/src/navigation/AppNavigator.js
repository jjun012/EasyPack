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

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused }) => {
          const icons = { Home: '🏠', Community: '💬', Camera: '📷', Baggage: '🧳', Profile: '👤' };
          return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[route.name]}</Text>;
        },
        tabBarLabel: ({ focused }) => {
          const labels = { Home: '홈', Community: '커뮤니티', Camera: '물품분석', Baggage: '수하물', Profile: '내정보' };
          return (
            <Text style={{ fontSize: 10, color: focused ? '#4A90E2' : '#999' }}>
              {labels[route.name]}
            </Text>
          );
        },
        headerShown: false,
        tabBarStyle: { paddingBottom: 4, height: 60 },
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
    <Stack.Navigator>
      <Stack.Screen name="PostList" component={PostListScreen} options={{ title: '커뮤니티' }} />
      <Stack.Screen name="PostDetail" component={PostDetailScreen} options={{ title: '게시글' }} />
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
      <View style={{ flex: 1, justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#4A90E2" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={initialRoute} screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={AuthStack} />
        <Stack.Screen name="Main" component={MainTabs} />
        <Stack.Screen name="TextAnalysis" component={TextAnalysisScreen} options={{ headerShown: true, title: '직접 입력' }} />
        <Stack.Screen name="AnalysisResult" component={AnalysisResultScreen} options={{ headerShown: true, title: '분석 결과' }} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: true, title: '회원가입' }} />
    </Stack.Navigator>
  );
}
