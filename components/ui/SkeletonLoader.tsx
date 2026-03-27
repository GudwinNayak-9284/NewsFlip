import { Colors } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

interface SkeletonProps {
  width?: number | string;
  height?: number;
  borderRadius?: number;
  style?: any;
}

export function Skeleton({ width = '100%', height = 20, borderRadius = 4, style }: SkeletonProps) {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const animatedValue = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(animatedValue, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.timing(animatedValue, {
          toValue: 0,
          duration: 1000,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [animatedValue]);

  const opacity = animatedValue.interpolate({
    inputRange: [0, 1],
    outputRange: [0.3, 0.7],
  });

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius,
          backgroundColor: colors.border,
          opacity,
        },
        style,
      ]}
    />
  );
}

export function ArticleCardSkeleton() {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.card, { backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border }]}>
      <Skeleton width="100%" height={200} borderRadius={12} style={styles.image} />
      <View style={styles.content}>
        <Skeleton width="60%" height={12} style={styles.category} />
        <Skeleton width="100%" height={20} style={styles.title} />
        <Skeleton width="100%" height={16} style={styles.titleSecond} />
        <Skeleton width="80%" height={14} style={styles.description} />
        <View style={styles.footer}>
          <View style={styles.author}>
            <Skeleton width={32} height={32} borderRadius={16} />
            <View style={styles.authorText}>
              <Skeleton width={80} height={12} />
              <Skeleton width={60} height={10} style={{ marginTop: 4 }} />
            </View>
          </View>
          <Skeleton width={60} height={12} />
        </View>
      </View>
    </View>
  );
}

export function HeroCardSkeleton() {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.heroCard, { backgroundColor: colors.card }]}>
      <Skeleton width={280} height={180} borderRadius={12} />
      <View style={styles.heroContent}>
        <Skeleton width="70%" height={14} style={{ marginTop: 8 }} />
        <Skeleton width="90%" height={16} style={{ marginTop: 6 }} />
        <Skeleton width="60%" height={12} style={{ marginTop: 8 }} />
      </View>
    </View>
  );
}

export function CompactArticleSkeleton() {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={[styles.compactCard, { borderBottomColor: colors.divider }]}>
      <View style={styles.compactContent}>
        <Skeleton width="40%" height={10} style={{ marginBottom: 6 }} />
        <Skeleton width="100%" height={14} style={{ marginBottom: 4 }} />
        <Skeleton width="80%" height={14} style={{ marginBottom: 8 }} />
        <Skeleton width="50%" height={10} />
      </View>
      <Skeleton width={80} height={80} borderRadius={8} />
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
  },
  image: {
    marginBottom: 12,
  },
  content: {
    padding: 16,
  },
  category: {
    marginBottom: 8,
  },
  title: {
    marginBottom: 6,
  },
  titleSecond: {
    marginBottom: 12,
  },
  description: {
    marginBottom: 16,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  author: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  authorText: {
    marginLeft: 8,
  },
  heroCard: {
    width: 280,
    borderRadius: 12,
    marginRight: 16,
    overflow: 'hidden',
  },
  heroContent: {
    padding: 12,
  },
  compactCard: {
    flexDirection: 'row',
    paddingVertical: 12,
    borderBottomWidth: 1,
  },
  compactContent: {
    flex: 1,
    marginRight: 12,
  },
});
