import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useMemo } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { HapticTab } from '@/components/haptic-tab';
import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';

type IoniconsName = React.ComponentProps<typeof Ionicons>['name'];

function TabIcon({
  name,
  outlineName,
  focused,
  color,
  size,
}: {
  name: IoniconsName;
  outlineName: IoniconsName;
  focused: boolean;
  color: string;
  size: number;
}) {
  return <Ionicons name={focused ? name : outlineName} size={size} color={color} />;
}

export default function TabLayout() {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const insets = useSafeAreaInsets();

  const screenOptions = useMemo(() => ({
    tabBarActiveTintColor: colors.tabIconSelected,
    tabBarInactiveTintColor: colors.tabIconDefault,
    headerShown: false,
    tabBarButton: HapticTab,
    tabBarStyle: {
      backgroundColor: colors.tabBar,
      borderTopColor: colors.border,
      borderTopWidth: StyleSheet.hairlineWidth,
      height: (Platform.OS === 'ios' ? 82 : 64) + insets.bottom,
      paddingBottom: insets.bottom > 0 ? insets.bottom : (Platform.OS === 'ios' ? 26 : 8),
      paddingTop: 8,
    },
    tabBarLabelStyle: {
      fontSize: 11,
      fontWeight: '600' as const,
      marginTop: 2,
    },
  }), [colors, insets.bottom]);

  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="home" outlineName="home-outline" focused={focused} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="search" outlineName="search-outline" focused={focused} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="saved"
        options={{
          title: 'Saved',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="bookmark" outlineName="bookmark-outline" focused={focused} color={color} size={24} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ color, focused }) => (
            <TabIcon name="person" outlineName="person-outline" focused={focused} color={color} size={24} />
          ),
        }}
      />
    </Tabs>
  );
}
