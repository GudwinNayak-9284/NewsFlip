import { CATEGORY_COLORS } from '@/constants/news';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { Article, timeAgo } from '@/types/article';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { Image, Pressable, StyleSheet, Text, View } from 'react-native';

interface Props {
  article: Article;
  onPress: () => void;
  onBookmark?: () => void;
  isBookmarked?: boolean;
  showImage?: boolean;
  variant?: 'default' | 'compact' | 'grid';
}

export function ArticleCard({
  article,
  onPress,
  onBookmark,
  isBookmarked = false,
  showImage = true,
  variant = 'default',
}: Props) {
  const { colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const categoryColor = CATEGORY_COLORS[article.category] ?? colors.primary;

  if (variant === 'grid') {
    return (
      <Pressable
        onPress={onPress}
        style={({ pressed }) => [
          styles.gridCard,
          {
            backgroundColor: colors.card,
            opacity: pressed ? 0.92 : 1,
            borderWidth: colorScheme === 'light' ? 1 : 0,
            borderColor: colors.border,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: colorScheme === 'light' ? 0.08 : 0,
            shadowRadius: 4,
            elevation: colorScheme === 'light' ? 2 : 0,
          },
        ]}
        accessibilityRole="button"
        accessibilityLabel={article.title}>
        <Image
          source={{ uri: article.imageUrl }}
          style={styles.gridImage}
          accessibilityLabel={article.title}
        />
        <View style={styles.gridContent}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}20` }]}>
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {article.category.toUpperCase()}
            </Text>
          </View>
          <Text style={[styles.gridTitle, { color: colors.text }]} numberOfLines={2}>
            {article.title}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {timeAgo(article.publishedAt)}
          </Text>
        </View>
      </Pressable>
    );
  }

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        {
          backgroundColor: colors.card,
          opacity: pressed ? 0.92 : 1,
          borderWidth: colorScheme === 'light' ? 1 : 0,
          borderColor: colors.border,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: colorScheme === 'light' ? 0.08 : 0,
          shadowRadius: 4,
          elevation: colorScheme === 'light' ? 2 : 0,
        },
      ]}
      accessibilityRole="button"
      accessibilityLabel={article.title}>
      <View style={styles.cardContent}>
        {/* Left content */}
        <View style={styles.leftContent}>
          <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}18` }]}>
            <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
              {article.source.toUpperCase()}
            </Text>
          </View>
          <Text
            style={[styles.title, { color: colors.text }]}
            numberOfLines={variant === 'compact' ? 2 : 3}>
            {article.title}
          </Text>
          <Text style={[styles.metaText, { color: colors.textSecondary }]}>
            {article.source} · {timeAgo(article.publishedAt)}
          </Text>
        </View>

        {/* Right: image + bookmark */}
        <View style={styles.rightContent}>
          {showImage && (
            <Image
              source={{ uri: article.imageUrl }}
              style={styles.thumbnail}
              accessibilityLabel={article.title}
            />
          )}
          {onBookmark && (
            <Pressable
              onPress={onBookmark}
              style={({ pressed }) => [styles.bookmarkBtn, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}>
              <Ionicons
                name={isBookmarked ? 'bookmark' : 'bookmark-outline'}
                size={18}
                color={isBookmarked ? colors.primary : colors.textSecondary}
              />
            </Pressable>
          )}
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.sm,
    overflow: 'hidden',
  },
  cardContent: {
    flexDirection: 'row',
    padding: Spacing.md,
    gap: Spacing.md,
    alignItems: 'flex-start',
  },
  leftContent: {
    flex: 1,
    gap: Spacing.xs,
  },
  rightContent: {
    alignItems: 'flex-end',
    gap: Spacing.sm,
  },
  categoryBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    borderRadius: BorderRadius.xs,
  },
  categoryBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  title: {
    fontSize: FontSizes.base,
    fontWeight: '600',
    lineHeight: 20,
  },
  metaText: {
    fontSize: FontSizes.sm,
    marginTop: 2,
  },
  thumbnail: {
    width: 80,
    height: 80,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  bookmarkBtn: {
    padding: 4,
  },
  // Grid variant
  gridCard: {
    borderRadius: BorderRadius.lg,
    overflow: 'hidden',
    flex: 1,
  },
  gridImage: {
    width: '100%',
    height: 110,
    backgroundColor: '#E2E8F0',
  },
  gridContent: {
    padding: Spacing.sm,
    gap: Spacing.xs,
  },
  gridTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
});
