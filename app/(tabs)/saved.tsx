import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import {
    Platform,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useNews } from '@/context/NewsContext';

export default function SavedScreen() {
  const router = useRouter();
  const { bookmarks, isBookmarked, toggleBookmark, colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const { getArticleById } = useNews();

  const savedArticles = bookmarks
    .map((id) => getArticleById(id))
    .filter(Boolean) as NonNullable<ReturnType<typeof getArticleById>>[];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]} edges={['top']}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Saved</Text>
        {savedArticles.length > 0 && (
          <Text style={[styles.headerCount, { color: colors.textSecondary }]}>
            {savedArticles.length} article{savedArticles.length !== 1 ? 's' : ''}
          </Text>
        )}
      </View>

      {savedArticles.length === 0 ? (
        <View style={[styles.emptyState, { backgroundColor: colors.surface }]}>
          <View style={[styles.emptyIconWrapper, { backgroundColor: colors.chipInactive }]}>
            <Ionicons name="bookmark-outline" size={36} color={colors.textSecondary} />
          </View>
          <Text style={[styles.emptyTitle, { color: colors.text }]}>No Saved Articles</Text>
          <Text style={[styles.emptySubtext, { color: colors.textSecondary }]}>
            Tap the bookmark icon on any article to save it here for later.
          </Text>
        </View>
      ) : (
        <ScrollView
          style={[styles.scroll, { backgroundColor: colors.surface }]}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}>
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            {savedArticles.map((article) => (
              <ArticleCard
                key={article.id}
                article={article}
                onPress={() => {
                  const encodedId = encodeURIComponent(article.id);
                  router.push(`/article/${encodedId}`);
                }}
                onBookmark={() => toggleBookmark(article.id)}
                isBookmarked={isBookmarked(article.id)}
              />
            ))}
          </View>
          <View style={styles.bottomPad} />
        </ScrollView>
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
  headerTitle: {
    fontSize: FontSizes['3xl'],
    fontWeight: '800',
  },
  headerCount: {
    fontSize: FontSizes.base,
    fontWeight: '500',
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
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing['3xl'],
    gap: Spacing.lg,
  },
  emptyIconWrapper: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: FontSizes['2xl'],
    fontWeight: '700',
    textAlign: 'center',
  },
  emptySubtext: {
    fontSize: FontSizes.base,
    textAlign: 'center',
    lineHeight: 22,
  },
  bottomPad: {
    height: Platform.OS === 'ios' ? 100 : 80,
  },
});
