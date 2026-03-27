import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  label: string;
  onPress?: () => void;
  prefix?: string;
  variant?: 'default' | 'filter';
  isActive?: boolean;
}

export function TopicPill({ label, onPress, prefix, variant = 'default', isActive = false }: Props) {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  const bgColor =
    variant === 'filter' && isActive
      ? colors.primary
      : variant === 'filter'
      ? colors.chipInactive
      : colors.tagBackground;

  const textColor =
    variant === 'filter' && isActive
      ? '#FFFFFF'
      : variant === 'filter'
      ? colors.chipInactiveText
      : colors.tagText;

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.pill,
        { backgroundColor: bgColor, opacity: pressed ? 0.8 : 1 },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}>
      <Text style={[styles.label, { color: textColor }]}>
        {prefix && <Text style={styles.prefix}>{prefix}</Text>}
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pill: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 1,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
  },
  label: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
  },
  prefix: {
    fontWeight: '400',
  },
});
