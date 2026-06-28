import React, { useEffect, useRef, useState } from 'react';
import { NavigationContainer, DarkTheme, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import * as Notifications from 'expo-notifications';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text, View, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';
import { useAuthStore } from '../store/authStore';
import { useFeedbackStore } from '../store/feedbackStore';
import { authApi } from '../api/auth';
import { registerForPushNotifications } from '../utils/notifications';
import { useBiometrics } from '../hooks/useBiometrics';
import { BiometricsProvider } from '../hooks/BiometricsContext';
import LockScreen from '../components/LockScreen';

import SignInScreen from '../screens/auth/SignInScreen';
import OnboardingScreen from '../screens/auth/OnboardingScreen';
import MarketScreen from '../screens/market/MarketScreen';
import BottleDetailScreen from '../screens/market/BottleDetailScreen';
import FilterScreen from '../screens/market/FilterScreen';
import TastingsScreen from '../screens/tastings/TastingsScreen';
import AddTastingScreen from '../screens/tastings/AddTastingScreen';
import EditTastingScreen from '../screens/tastings/EditTastingScreen';
import CollectionScreen from '../screens/collection/CollectionScreen';
import AddCollectionScreen from '../screens/collection/AddCollectionScreen';
import EditCollectionScreen from '../screens/collection/EditCollectionScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import EditProfileScreen from '../screens/profile/EditProfileScreen';
import RequestBottleScreen from '../screens/market/RequestBottleScreen';
import GiftForFriendScreen from '../screens/market/GiftForFriendScreen';
import WhiskProsScreen from '../screens/collection/WhiskProsScreen';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import AdminUsersScreen from '../screens/admin/AdminUsersScreen';
import AdminWhiskiesScreen from '../screens/admin/AdminWhiskiesScreen';
import AdminEditWhiskeyScreen from '../screens/admin/AdminEditWhiskeyScreen';
import AdminRequestsScreen from '../screens/admin/AdminRequestsScreen';
import AdminCategoriesScreen from '../screens/admin/AdminCategoriesScreen';
import LoadingScreen from '../components/LoadingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

const defaultFontFamily = Platform.select({ ios: 'System', android: 'sans-serif', default: 'System' });

const navigationTheme = {
  dark: true,
  colors: {
    ...DarkTheme.colors,
    primary: colors.accent,
    background: colors.background,
    card: colors.surface,
    text: colors.text,
    border: colors.border,
    notification: colors.primary,
  },
  fonts: DarkTheme.fonts || {
    regular: { fontFamily: defaultFontFamily, fontWeight: '400' },
    medium: { fontFamily: defaultFontFamily, fontWeight: '500' },
    bold: { fontFamily: defaultFontFamily, fontWeight: '700' },
    heavy: { fontFamily: defaultFontFamily, fontWeight: '900' },
  },
};

const screenOptions = {
  headerStyle: { backgroundColor: colors.surface },
  headerTintColor: colors.text,
  headerTitleStyle: { fontWeight: '600' },
  contentStyle: { backgroundColor: colors.background },
};

function TabIcon({ label, focused }) {
  const icons = { Market: '\u{1F943}', Tastings: '\u{1F4DD}', Collection: '\u{1F4E6}' };
  return (
    <View style={{ alignItems: 'center', width: 70 }}>
      <Text style={{ fontSize: 22 }}>{icons[label] || '\u{2B50}'}</Text>
      <Text numberOfLines={1} style={{ fontSize: 10, color: focused ? colors.accent : colors.textMuted, marginTop: 2, textAlign: 'center' }}>
        {label}
      </Text>
    </View>
  );
}

function ProfileButton() {
  const navigation = useNavigation();
  return (
    <Text onPress={() => navigation.navigate('Profile')} style={{ fontSize: 26, marginRight: 16 }}>
      {'\u{1F464}'}
    </Text>
  );
}

function CrownButton() {
  const navigation = useNavigation();
  return (
    <Text onPress={() => navigation.navigate('WhiskPros')} style={{ fontSize: 22, marginLeft: 16 }}>
      {'\u{1F451}'}
    </Text>
  );
}

function MainTabs() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = 65 + insets.bottom;

  return (
    <Tab.Navigator
      screenOptions={{
        headerStyle: { backgroundColor: colors.surface },
        headerTintColor: colors.text,
        tabBarStyle: { backgroundColor: colors.surface, borderTopColor: colors.border, height: tabBarHeight, justifyContent: 'center', paddingTop: 6, paddingBottom: 6 + insets.bottom },
        tabBarShowLabel: false,
        tabBarActiveTintColor: colors.accent,
      }}
    >
      <Tab.Screen
        name="Market"
        component={MarketScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Market" focused={focused} />,
          headerRight: () => <ProfileButton />,
        }}
      />
      <Tab.Screen
        name="Tastings"
        component={TastingsScreen}
        options={{ tabBarIcon: ({ focused }) => <TabIcon label="Tastings" focused={focused} /> }}
      />
      <Tab.Screen
        name="Collection"
        component={CollectionScreen}
        options={{
          tabBarIcon: ({ focused }) => <TabIcon label="Collection" focused={focused} />,
          headerLeft: () => <CrownButton />,
        }}
      />
    </Tab.Navigator>
  );
}

export default function AppNavigator() {
  const { isAuthenticated, isLoading, initialize, token, setUser, logout } = useAuthStore();
  const [checkingProfile, setCheckingProfile] = useState(false);
  const [isOnboarded, setIsOnboarded] = useState(null);
  const navigationRef = useRef(null);
  const notificationResponseListener = useRef(null);
  const biometrics = useBiometrics(isAuthenticated);

  useEffect(() => {
    initialize();
    useFeedbackStore.getState().initialize();
  }, []);

  useEffect(() => {
    notificationResponseListener.current = Notifications.addNotificationResponseReceivedListener(response => {
      const data = response.notification.request.content.data;
      if (data?.type === 'whisky_request_approved' && data?.whiskeyId && navigationRef.current) {
        navigationRef.current.navigate('BottleDetail', { id: data.whiskeyId });
      }
    });
    return () => {
      if (notificationResponseListener.current) {
        Notifications.removeNotificationSubscription(notificationResponseListener.current);
      }
    };
  }, []);

  useEffect(() => {
    if (isAuthenticated && token) {
      registerForPushNotifications();
    }
  }, [isAuthenticated, token]);

  useEffect(() => {
    if (isAuthenticated && token) {
      setCheckingProfile(true);
      authApi.getMe()
        .then(res => {
          setUser(res.data);
          setIsOnboarded(res.data.isOnboardingComplete);
        })
        .catch(() => {
          logout();
        })
        .finally(() => setCheckingProfile(false));
    }
  }, [isAuthenticated, token]);

  if (isLoading || checkingProfile || biometrics.loading) return <LoadingScreen message="Loading Whisk..." />;

  if (isAuthenticated && biometrics.isLocked) {
    return <LockScreen onUnlock={biometrics.unlock} />;
  }

  const biometricsCtx = { isEnabled: biometrics.isEnabled, label: biometrics.label, toggle: biometrics.toggle, suppressLock: biometrics.suppressLock, resumeLock: biometrics.resumeLock };

  return (
    <BiometricsProvider value={biometricsCtx}>
      <NavigationContainer theme={navigationTheme} ref={navigationRef}>
        <Stack.Navigator screenOptions={screenOptions}>
          {!isAuthenticated ? (
            <Stack.Screen name="SignIn" component={SignInScreen} options={{ headerShown: false }} />
          ) : isOnboarded === false ? (
            <Stack.Screen name="Onboarding" component={OnboardingScreen} options={{ headerShown: false }} />
          ) : (
            <>
              <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />
              <Stack.Screen name="BottleDetail" component={BottleDetailScreen} options={{ title: 'Bottle Details' }} />
              <Stack.Screen name="Filters" component={FilterScreen} options={{ title: 'Filters', presentation: 'modal' }} />
              <Stack.Screen name="AddTasting" component={AddTastingScreen} options={{ title: 'Add Tasting' }} />
              <Stack.Screen name="EditTasting" component={EditTastingScreen} options={{ title: 'Edit Tasting' }} />
              <Stack.Screen name="AddCollection" component={AddCollectionScreen} options={{ title: 'Add to Collection' }} />
              <Stack.Screen name="EditCollection" component={EditCollectionScreen} options={{ title: 'Edit Item' }} />
              <Stack.Screen name="Profile" component={ProfileScreen} options={{ title: 'Profile' }} />
              <Stack.Screen name="EditProfile" component={EditProfileScreen} options={{ title: 'Edit Profile' }} />
              <Stack.Screen name="RequestBottle" component={RequestBottleScreen} options={{ title: 'Request Bottle' }} />
              <Stack.Screen name="GiftForFriend" component={GiftForFriendScreen} options={{ title: 'Gift for a Friend' }} />
              <Stack.Screen name="WhiskPros" component={WhiskProsScreen} options={{ title: 'Whisk Pros' }} />
              <Stack.Screen name="AdminDashboard" component={AdminDashboardScreen} options={{ title: 'Admin Dashboard' }} />
              <Stack.Screen name="AdminUsers" component={AdminUsersScreen} options={{ title: 'Manage Users' }} />
              <Stack.Screen name="AdminWhiskies" component={AdminWhiskiesScreen} options={{ title: 'Manage Whiskies' }} />
              <Stack.Screen name="AdminEditWhiskey" component={AdminEditWhiskeyScreen} options={{ title: 'Edit Whiskey' }} />
              <Stack.Screen name="AdminRequests" component={AdminRequestsScreen} options={{ title: 'Bottle Requests' }} />
              <Stack.Screen name="AdminCategories" component={AdminCategoriesScreen} options={{ title: 'Categories' }} />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </BiometricsProvider>
  );
}