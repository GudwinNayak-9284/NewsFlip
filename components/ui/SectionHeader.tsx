import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  title: string;
  actionLabel?: string;
  onAction?: () => void;
  uppercase?: boolean;
}

export function SectionHeader({
  title,
  actionLabel = 'View All',
  onAction,
  uppercase = false,
}: Props) {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      <Text
        style={[
          styles.title,
          uppercase && styles.uppercase,
          { color: colors.text },
        ]}>
        {uppercase ? title.toUpperCase() : title}
      </Text>
      {onAction && (
        <Pressable
          onPress={onAction}
          style={({ pressed }) => ({ opacity: pressed ? 0.7 : 1 })}
          accessibilityRole="button"
          accessibilityLabel={actionLabel}>
          <Text style={[styles.action, { color: colors.primary }]}>{actionLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.sm,
  },
  title: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  uppercase: {
    fontSize: FontSizes.sm,
    fontWeight: '700',
    letterSpacing: 1,
  },
  action: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
});
