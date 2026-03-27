import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import React from 'react';
import { Pressable, StyleSheet, Text } from 'react-native';

interface Props {
  label: string;
  isActive: boolean;
  onPress: () => void;
  size?: 'sm' | 'md';
}

export function CategoryChip({ label, isActive, onPress, size = 'md' }: Props) {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.chip,
        size === 'sm' && styles.chipSm,
        {
          backgroundColor: isActive ? colors.chipActive : colors.chipInactive,
          opacity: pressed ? 0.8 : 1,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected: isActive }}>
      <Text
        style={[
          styles.label,
          size === 'sm' && styles.labelSm,
          { color: isActive ? colors.chipActiveText : colors.chipInactiveText },
        ]}>
        {label}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipSm: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: 3,
  },
  label: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  labelSm: {
    fontSize: FontSizes.sm,
  },
});
