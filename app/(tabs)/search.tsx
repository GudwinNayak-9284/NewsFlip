import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
    Platform,
    Pressable,
    RefreshControl,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TextInput,
    View
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { SectionHeader } from '@/components/ui/SectionHeader';
import { ArticleCardSkeleton } from '@/components/ui/SkeletonLoader';
import { TopicPill } from '@/components/ui/TopicPill';
import { POPULAR_TOPICS, SEARCH_FILTERS } from '@/constants/news';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useNews } from '@/context/NewsContext';
import { Article } from '@/types/article';

type SearchState = 'idle' | 'searching' | 'results' | 'no-results' | 'error';

export default function SearchScreen() {
  const router = useRouter();
  const { searchHistory, addSearch, removeSearch, clearAllSearches, isBookmarked, toggleBookmark, colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const { searchArticles } = useNews();

  const [query, setQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [searchState, setSearchState] = useState<SearchState>('idle');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState<Article[]>([]);

  // Debounce effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    if (!query.trim()) {
      setDebouncedQuery('');
      setSearchState('idle');
      return;
    }

    setSearchState('searching');

    debounceTimer.current = setTimeout(() => {
      setDebouncedQuery(query);
    }, 400);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [query]);

  // Search effect
  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setSearchState('idle');
      setSearchResults([]);
      return;
    }

    const performSearch = async () => {
      try {
        const found = await searchArticles(debouncedQuery);
        setSearchResults(found);
        setSearchState(found.length > 0 ? 'results' : 'no-results');
      } catch (error) {
        console.error('Search error:', error);
        setSearchState('error');
      }
    };

    performSearch();
  }, [debouncedQuery, searchArticles]);

  const results = useMemo(() => {
    if (!debouncedQuery.trim()) return [];
    let found = searchResults;
    if (activeFilter) {
      found = found.filter(
        (a: Article) =>
          a.tags.some((t: string) => t.toLowerCase() === activeFilter.toLowerCase()) ||
          a.category.toLowerCase() === activeFilter.toLowerCase()
      );
    }
    return found;
  }, [debouncedQuery, activeFilter, searchResults]);

  const handleSearch = useCallback(
    (text: string) => {
      setQuery(text);
      setActiveFilter(null);
    },
    []
  );

  const handleSubmit = useCallback(() => {
    if (debouncedQuery.trim()) addSearch(debouncedQuery.trim());
  }, [debouncedQuery, addSearch]);

  const handleHistoryPress = useCallback(
    (term: string) => {
      setQuery(term);
      setDebouncedQuery(term);
    },
    []
  );

  const handleArticlePress = useCallback(
    (article: Article) => {
      if (debouncedQuery.trim()) addSearch(debouncedQuery.trim());
      // Encode the ID to handle Guardian API IDs with slashes
      const encodedId = encodeURIComponent(article.id);
      router.push(`/article/${encodedId}`);
    },
    [router, debouncedQuery, addSearch]
  );

  const onRefresh = useCallback(async () => {
    if (debouncedQuery.trim()) {
      setRefreshing(true);
      try {
        const found = await searchArticles(debouncedQuery);
        setSearchResults(found);
        setSearchState(found.length > 0 ? 'results' : 'no-results');
      } catch (error) {
        console.error('Refresh error:', error);
      }
      setRefreshing(false);
    }
  }, [debouncedQuery, searchArticles]);

  const displayResults = results;

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Search News</Text>
      </View>

      {/* Search bar */}
      <View style={[styles.searchBarWrapper, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <View style={[styles.searchBar, { backgroundColor: colors.searchBackground }]}>
          <Ionicons name="search-outline" size={18} color={colors.textSecondary} />
          <TextInput
            style={[styles.input, { color: colors.text }]}
            placeholder="Search articles, topics..."
            placeholderTextColor={colors.textSecondary}
            value={query}
            onChangeText={handleSearch}
            onSubmitEditing={handleSubmit}
            returnKeyType="search"
            autoCorrect={false}
            accessibilityLabel="Search input"
          />
          {query.length > 0 && (
            <Pressable
              onPress={() => {
                setQuery('');
                setSearchState('idle');
                setActiveFilter(null);
              }}
              accessibilityLabel="Clear search">
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </Pressable>
          )}
        </View>
        {query.length > 0 && (
          <Pressable
            onPress={() => {
              setQuery('');
              setSearchState('idle');
              setActiveFilter(null);
            }}
            style={({ pressed }) => [styles.cancelBtn, { opacity: pressed ? 0.7 : 1 }]}
            accessibilityRole="button"
            accessibilityLabel="Cancel search">
            <Text style={[styles.cancelText, { color: colors.primary }]}>Cancel</Text>
          </Pressable>
        )}
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
          />
        }>

        {/* Idle state: recent searches + popular topics */}
        {searchState === 'idle' && (
          <>
            {searchHistory.length > 0 && (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <SectionHeader
                  title="Recent Searches"
                  actionLabel="Clear All"
                  onAction={clearAllSearches}
                  uppercase
                />
                <View style={styles.pillsRow}>
                  {searchHistory.map((term) => (
                    <View key={term} style={styles.historyPill}>
                      <Pressable
                        onPress={() => handleHistoryPress(term)}
                        style={({ pressed }) => [
                          styles.historyPillInner,
                          { backgroundColor: colors.chipInactive, opacity: pressed ? 0.8 : 1 },
                        ]}>
                        <Ionicons name="time-outline" size={13} color={colors.textSecondary} />
                        <Text style={[styles.historyTerm, { color: colors.chipInactiveText }]}>
                          {term}
                        </Text>
                      </Pressable>
                      <Pressable
                        onPress={() => removeSearch(term)}
                        style={styles.historyRemove}
                        accessibilityLabel={`Remove ${term} from history`}>
                        <Ionicons name="close" size={13} color={colors.textTertiary} />
                      </Pressable>
                    </View>
                  ))}
                </View>
              </View>
            )}

            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <SectionHeader title="Popular Topics" uppercase />
              <View style={styles.pillsRow}>
                {POPULAR_TOPICS.map((topic) => (
                  <TopicPill
                    key={topic}
                    label={topic}
                    onPress={() => handleHistoryPress(topic)}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        {/* Searching state */}
        {searchState === 'searching' && (
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <Text style={[styles.resultsLabel, { color: colors.textSecondary }]}>
              Searching for &quot;{query}&quot;
            </Text>
            {[1, 2, 3].map((i) => (
              <ArticleCardSkeleton key={i} />
            ))}
          </View>
        )}

        {/* Results state */}
        {(searchState === 'results' || searchState === 'no-results') && (
          <>
            {/* Filter chips */}
            <View style={[styles.filterSection, { backgroundColor: colors.background }]}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterScroll}>
                {SEARCH_FILTERS.map((filter) => (
                  <TopicPill
                    key={filter}
                    label={filter}
                    variant="filter"
                    isActive={activeFilter === filter}
                    onPress={() =>
                      setActiveFilter((prev) => (prev === filter ? null : filter))
                    }
                  />
                ))}
              </ScrollView>
            </View>

            {displayResults.length > 0 ? (
              <View style={[styles.section, { backgroundColor: colors.background }]}>
                <Text style={[styles.resultsLabel, { color: colors.textSecondary }]}>
                  Results for &quot;{debouncedQuery}&quot;
                </Text>
                {displayResults.map((article) => (
                  <ArticleCard
                    key={article.id}
                    article={article}
                    onPress={() => handleArticlePress(article)}
                    onBookmark={() => toggleBookmark(article.id)}
                    isBookmarked={isBookmarked(article.id)}
                  />
                ))}
              </View>
            ) : (
              <View style={[styles.emptyState, { backgroundColor: colors.background }]}>
                <Ionicons name="search" size={52} color={colors.border} />
                <Text style={[styles.emptyTitle, { color: colors.text }]}>No Results Found</Text>
                <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
                  Try different keywords or adjust your filters.
                </Text>
              </View>
            )}

            {/* Popular Topics (always shown in results view) */}
            <View style={[styles.section, { backgroundColor: colors.background }]}>
              <SectionHeader title="Popular Topics" uppercase />
              <View style={styles.pillsRow}>
                {POPULAR_TOPICS.map((topic) => (
                  <TopicPill
                    key={topic}
                    label={topic}
                    onPress={() => handleHistoryPress(topic)}
                  />
                ))}
              </View>
            </View>
          </>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
  },
  searchBarWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    gap: Spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.lg,
  },
  input: {
    flex: 1,
    fontSize: FontSizes.base,
    padding: 0,
    margin: 0,
  },
  cancelBtn: {
    paddingVertical: 4,
  },
  cancelText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    gap: Spacing.sm,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  filterSection: {
    paddingVertical: Spacing.md,
  },
  filterScroll: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    gap: Spacing.sm,
  },
  pillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginTop: Spacing.xs,
  },
  historyPill: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: BorderRadius.full,
    overflow: 'hidden',
  },
  historyPillInner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingVertical: Spacing.xs + 1,
    paddingLeft: Spacing.md,
    paddingRight: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  historyTerm: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  historyRemove: {
    padding: 6,
  },
  resultsLabel: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
    marginBottom: Spacing.md,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: Spacing['3xl'] + Spacing.xl,
    gap: Spacing.md,
  },
  emptyTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
  },
  emptySubtext: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    paddingHorizontal: Spacing['3xl'],
    lineHeight: 22,
  },
  bottomPad: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
