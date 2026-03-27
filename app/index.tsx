import React, { useEffect } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { FontSizes, Spacing } from '@/constants/theme';

export default function SplashScreen() {
  const router = useRouter();
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.85);

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 700,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 80,
        useNativeDriver: true,
      }),
    ]).start();

    const timer = setTimeout(() => {
      router.replace('/(tabs)');
    }, 2800);

    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['#1E1B4B', '#3730A3', '#4F46E5', '#7C3AED']}
      style={styles.container}
      start={{ x: 0.1, y: 0 }}
      end={{ x: 0.9, y: 1 }}>
      <StatusBar style="auto" />

      <Animated.View
        style={[
          styles.content,
          { opacity: fadeAnim, transform: [{ scale: scaleAnim }] },
        ]}>
        {/* Logo box */}
        <View style={styles.logoBox}>
          <Ionicons name="flash" size={44} color="#4F46E5" />
        </View>
        <Text style={styles.appName}>NewsFlip</Text>
        <Text style={styles.tagline}>PRECISION READING</Text>
      </Animated.View>

      {/* Bottom loading indicator */}
      <Animated.View style={[styles.bottom, { opacity: fadeAnim }]}>
        <View style={styles.loadingRow}>
          <Ionicons name="sync-outline" size={13} color="rgba(255,255,255,0.65)" />
          <Text style={styles.loadingLabel}>SYNCING FEED</Text>
        </View>
        <Text style={styles.loadingSubtext}>Curating your feed...</Text>
      </Animated.View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    gap: Spacing.md,
  },
  logoBox: {
    width: 90,
    height: 90,
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  appName: {
    fontSize: FontSizes['5xl'],
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
    marginTop: Spacing.sm,
  },
  tagline: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 3.5,
  },
  bottom: {
    position: 'absolute',
    bottom: 64,
    alignItems: 'center',
    gap: 6,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  loadingLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.65)',
    letterSpacing: 2,
  },
  loadingSubtext: {
    fontSize: FontSizes.sm,
    color: 'rgba(255,255,255,0.45)',
  },
});
