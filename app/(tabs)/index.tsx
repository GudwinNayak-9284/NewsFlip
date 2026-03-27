import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    FlatList,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    useWindowDimensions,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { CategoryChip } from '@/components/ui/CategoryChip';
import { ArticleCardSkeleton } from '@/components/ui/SkeletonLoader';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useNews } from '@/context/NewsContext';
import { Article } from '@/types/article';

export default function HomeScreen() {
  const router = useRouter();
  const { isBookmarked, toggleBookmark, colorScheme, toggleTheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const { categories, selectedCategory, setSelectedCategory, getArticlesByCategory, topStories, loading, error, retry, loadMore, hasMore, loadingMore } =
    useNews();
  const [refreshing, setRefreshing] = useState(false);
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const isTablet = width >= 600; // Lowered from 768 to support medium tablets

  // Determine number of columns based on device and orientation
  // Phone portrait: 1 column, Phone landscape: 2 columns
  // Tablet portrait: 2 columns, Tablet landscape: 3 columns
  const numColumns = isTablet ? (isLandscape ? 3 : 2) : (isLandscape ? 2 : 1);

  const filteredArticles = getArticlesByCategory(selectedCategory);
  const topHeadlines = filteredArticles.slice(0, 5);
  const recentStories = filteredArticles.slice(5, 9);
  const trendingNow = filteredArticles.slice(9, 12);
  const recommended = filteredArticles.slice(12);

  const handleArticlePress = useCallback(
    (article: Article) => {
      // Encode the ID to handle Guardian API IDs with slashes
      const encodedId = encodeURIComponent(article.id);
      router.push(`/article/${encodedId}`);
    },
    [router]
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    retry();
    setRefreshing(false);
  }, [retry]);

  const handleLoadMore = useCallback(() => {
    if (!loadingMore && hasMore && !loading) {
      loadMore();
    }
  }, [loadMore, loadingMore, hasMore, loading]);

  const renderArticleItem = useCallback(({ item }: { item: Article }) => (
    <View style={[styles.articleItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
      <ArticleCard
        article={item}
        onPress={() => handleArticlePress(item)}
        onBookmark={() => toggleBookmark(item.id)}
        isBookmarked={isBookmarked(item.id)}
      />
    </View>
  ), [numColumns, handleArticlePress, toggleBookmark, isBookmarked]);

  const renderFooter = useCallback(() => {
    if (!loadingMore) return null;
    return (
      <View style={styles.loadingGrid}>
        {[1, 2, 3].map((i) => (
          <View key={i} style={[styles.articleItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
            <ArticleCardSkeleton />
          </View>
        ))}
      </View>
    );
  }, [loadingMore, numColumns]);

  const renderEmptyComponent = useCallback(() => {
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
      <View style={styles.loadingGrid}>
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <View key={i} style={[styles.articleItem, { width: numColumns > 1 ? `${100 / numColumns}%` : '100%' }]}>
            <ArticleCardSkeleton />
          </View>
        ))}
      </View>
    );
  }, [loading, numColumns]);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={styles.logoRow}>
          <View style={[styles.logoIcon, { backgroundColor: colors.primary }]}>
            <Ionicons name="flash" size={16} color="#FFFFFF" />
          </View>
          <Text style={[styles.logoText, { color: colors.text }]}>NewsFlip</Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push('/(tabs)/search')}
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Search">
            <Ionicons name="search-outline" size={22} color={colors.icon} />
          </Pressable>
          <Pressable
            onPress={toggleTheme}
            style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Toggle theme">
            <Ionicons 
              name={colorScheme === 'dark' ? 'sunny-outline' : 'moon-outline'} 
              size={22} 
              color={colors.icon} 
            />
          </Pressable>
        </View>
      </View>

      {/* Category chips */}
      <View style={[styles.chipsWrapper, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsScroll}>
          {categories.map((cat) => (
            <CategoryChip
              key={cat}
              label={cat}
              isActive={selectedCategory === cat}
              onPress={() => setSelectedCategory(cat)}
            />
          ))}
        </ScrollView>
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

      {/* Main content with sections */}
      {!error && (
        <FlatList
          data={[{ key: 'content' }]}
          renderItem={() => (
            <>
              {/* Top Headlines Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="trending-up" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Top Headlines</Text>
                  </View>
                  <Pressable
                    onPress={() => router.push('/all-articles')}
                    style={({ pressed }) => [{ opacity: pressed ? 0.7 : 1 }]}>
                    <Text style={[styles.seeAll, { color: colors.primary }]}>See All →</Text>
                  </Pressable>
                </View>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.horizontalScroll}>
                  {topHeadlines.map((article, index) => (
                    <View key={article.id} style={styles.topHeadlineCard}>
                      <ArticleCard
                        article={article}
                        variant="compact"
                        onPress={() => handleArticlePress(article)}
                        onBookmark={() => toggleBookmark(article.id)}
                        isBookmarked={isBookmarked(article.id)}
                      />
                    </View>
                  ))}
                </ScrollView>
              </View>

              {/* Recent Stories Section */}
              <View style={styles.section}>
                <View style={styles.sectionHeader}>
                  <View style={styles.sectionTitleRow}>
                    <Ionicons name="time-outline" size={20} color={colors.primary} />
                    <Text style={[styles.sectionTitle, { color: colors.text }]}>Recent Stories</Text>
                  </View>
                </View>
                <View style={styles.gridContainer}>
                  {recentStories.map((article) => (
                    <View key={article.id} style={[styles.gridItem, { width: `${100 / (isLandscape && !isTablet ? 2 : isTablet ? (isLandscape ? 3 : 2) : 1)}%` }]}>
                      <ArticleCard
                        article={article}
                        variant="compact"
                        onPress={() => handleArticlePress(article)}
                        onBookmark={() => toggleBookmark(article.id)}
                        isBookmarked={isBookmarked(article.id)}
                      />
                    </View>
                  ))}
                </View>
              </View>

              {/* Trending Now Section */}
              {trendingNow.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="flame" size={20} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Trending Now</Text>
                    </View>
                  </View>
                  <View style={styles.gridContainer}>
                    {trendingNow.map((article) => (
                      <View key={article.id} style={[styles.gridItem, { width: `${100 / (isLandscape && !isTablet ? 2 : isTablet ? (isLandscape ? 3 : 2) : 1)}%` }]}>
                        <ArticleCard
                          article={article}
                          variant="compact"
                          onPress={() => handleArticlePress(article)}
                          onBookmark={() => toggleBookmark(article.id)}
                          isBookmarked={isBookmarked(article.id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}

              {/* Recommended Section */}
              {recommended.length > 0 && (
                <View style={styles.section}>
                  <View style={styles.sectionHeader}>
                    <View style={styles.sectionTitleRow}>
                      <Ionicons name="star-outline" size={20} color={colors.primary} />
                      <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended</Text>
                    </View>
                  </View>
                  <View style={styles.gridContainer}>
                    {recommended.map((article) => (
                      <View key={article.id} style={[styles.gridItem, { width: `${100 / (isLandscape && !isTablet ? 2 : isTablet ? (isLandscape ? 3 : 2) : 1)}%` }]}>
                        <ArticleCard
                          article={article}
                          variant="compact"
                          onPress={() => handleArticlePress(article)}
                          onBookmark={() => toggleBookmark(article.id)}
                          isBookmarked={isBookmarked(article.id)}
                        />
                      </View>
                    ))}
                  </View>
                </View>
              )}
            </>
          )}
          keyExtractor={(item) => item.key}
          style={[styles.scroll, { backgroundColor: colors.background }]}
          showsVerticalScrollIndicator={false}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
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
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  logoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  logoIcon: {
    width: 30,
    height: 30,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoText: {
    fontSize: FontSizes['2xl'],
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  headerBtn: {
    padding: 6,
  },
  chipsWrapper: {
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  chipsScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    gap: Spacing.sm,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  section: {
    marginBottom: Spacing['2xl'],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.md,
  },
  sectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    marginTop:Spacing.sm
  },
  sectionTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '700',
  },
  seeAll: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  horizontalScroll: {
    paddingLeft: Spacing.lg,
  },
  topHeadlineCard: {
    width: 280,
    marginRight: Spacing.md,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.xs,
  },
  gridItem: {
    padding: Spacing.xs,
  },
  trendingItem: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  loadMoreButton: {
    marginHorizontal: Spacing.lg,
    marginVertical: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: 12,
    alignItems: 'center',
  },
  loadMoreText: {
    color: '#FFFFFF',
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  articleItem: {
    padding: Spacing.xs,
  },
  loadingGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: Spacing.xs,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
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
  countryPicker: {
    maxHeight: 300,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  countryList: {
    maxHeight: 300,
  },
  countryItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
  },
  countryText: {
    fontSize: FontSizes.base,
    fontWeight: '500',
  },
});
