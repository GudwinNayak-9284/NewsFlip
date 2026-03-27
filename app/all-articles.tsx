import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
  FlatList,
  Pressable,
  RefreshControl,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { ArticleCardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useNews } from '@/context/NewsContext';
import { Article } from '@/types/article';

export default function AllArticlesScreen() {
  const router = useRouter();
  const { isBookmarked, toggleBookmark, colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const { selectedCategory, getArticlesByCategory, loading, error, retry, loadMore, hasMore, loadingMore } =
    useNews();
  const [refreshing, setRefreshing] = useState(false);

  const allArticles = getArticlesByCategory(selectedCategory);

  const handleArticlePress = useCallback(
    (article: Article) => {
      const encodedId = encodeURIComponent(article.id);
      router.push(`/article/${encodedId}`);
    },
    [router]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await retry();
    setTimeout(() => setRefreshing(false), 500);
  }, [retry]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore, loading]);

  const renderArticle = useCallback(
    ({ item }: { item: Article }) => (
      <View style={styles.articleWrapper}>
        <ArticleCard
          article={item}
          onPress={() => handleArticlePress(item)}
          onBookmark={() => toggleBookmark(item.id)}
          isBookmarked={isBookmarked(item.id)}
        />
      </View>
    ),
    [handleArticlePress, toggleBookmark, isBookmarked]
  );

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingFooter}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={styles.articleWrapper}>
            <ArticleCardSkeleton />
          </View>
        ))}
      </View>
    );
  }, [loadingMore]);

  const renderEmpty = useCallback(() => {
    if (loading) return null;
    return (
      <View style={styles.emptyState}>
        <Ionicons name="newspaper-outline" size={64} color={colors.border} />
        <Text style={[styles.emptyText, { color: colors.textSecondary }]}>No articles found</Text>
      </View>
    );
  }, [loading, colors]);

  const renderLoadingState = useCallback(() => {
    if (!loading) return null;
    return (
      <View style={styles.loadingState}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={styles.articleWrapper}>
            <ArticleCardSkeleton />
          </View>
        ))}
      </View>
    );
  }, [loading]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.backButton, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={24} color={colors.text} />
        </Pressable>
        <View style={styles.headerContent}>
          <Text style={[styles.headerTitle, { color: colors.text }]}>All Articles</Text>
          <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>{selectedCategory}</Text>
        </View>
        <View style={styles.headerSpacer} />
      </View>

      {/* Error State */}
      {error && !loading && (
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Ionicons name="alert-circle-outline" size={64} color={colors.errorText || '#EF4444'} />
          <Text style={[styles.errorTitle, { color: colors.text }]}>Oops! Something went wrong</Text>
          <Text style={[styles.errorMessage, { color: colors.textSecondary }]}>{error}</Text>
          <Pressable
            onPress={retry}
            style={({ pressed }) => [
              styles.retryButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.8 : 1 }
            ]}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </Pressable>
        </View>
      )}

      {/* Articles List */}
      {!error && (
        <FlatList
          data={allArticles}
          renderItem={renderArticle}
          keyExtractor={(item) => item.id}
          style={[styles.list, { backgroundColor: colors.background }]}
          contentContainerStyle={styles.listContent}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          ListEmptyComponent={renderEmpty}
          ListHeaderComponent={loading ? renderLoadingState : null}
          ListFooterComponent={renderFooter}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={colors.primary}
              colors={[colors.primary]}
            />
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  backButton: {
    padding: 8,
    marginRight: Spacing.md,
  },
  headerContent: {
    flex: 1,
  },
  headerTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  headerSubtitle: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginTop: 2,
  },
  headerSpacer: {
    width: 40,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  articleWrapper: {
    paddingHorizontal: Spacing.xs,
    paddingVertical: Spacing.xs,
    marginBottom: Spacing.xs,
  },
  loadingState: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
  },
  loadingFooter: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    paddingBottom: Spacing.xl,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 100,
    gap: Spacing.md,
  },
  emptyText: {
    fontSize: FontSizes.lg,
    fontWeight: '500',
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
    gap: Spacing.md,
  },
  errorTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  errorMessage: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    marginBottom: Spacing.md,
  },
  retryButton: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.sm,
  },
  retryButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
});
