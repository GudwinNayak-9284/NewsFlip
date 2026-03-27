import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import {
    Dimensions,
    Image,
    Linking,
    Pressable,
    ScrollView,
    Share,
    StatusBar,
    StyleSheet,
    Text,
    useWindowDimensions,
    View,
} from 'react-native';

import { ArticleCard } from '@/components/ui/ArticleCard';
import { CATEGORY_COLORS } from '@/constants/news';
import { BorderRadius, Colors, FontSizes, Spacing } from '@/constants/theme';
import { useApp } from '@/context/AppContext';
import { useNews } from '@/context/NewsContext';
import { timeAgo } from '@/types/article';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width: SCREEN_WIDTH } = Dimensions.get('window');
const HERO_HEIGHT = 260;

export default function ArticleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getArticleById, articles } = useNews();
  const { isBookmarked, toggleBookmark, colorScheme } = useApp();
  const colors = Colors[colorScheme ?? 'light'];
  const { width, height } = useWindowDimensions();
  const isLandscape = width > height;
  const [liked, setLiked] = useState(false);
  
  // Responsive hero height - increase in landscape for better visibility
  const heroHeight = isLandscape ? Math.min(height * 0.65, 320) : HERO_HEIGHT;

  // Decode the ID to get the original Guardian ID
  const decodedId = id ? decodeURIComponent(id) : '';
  const article = getArticleById(decodedId);
  const recommendedArticles = articles.filter((a) => a.id !== decodedId).slice(0, 2);
  const upNextArticle = articles.find((a) => a.id !== decodedId);

  const categoryColor = article ? CATEGORY_COLORS[article.category] ?? colors.primary : colors.primary;

  const handleShare = useCallback(async () => {
    if (!article) return;
    try {
      await Share.share({
        title: article.title,
        message: `${article.title} — ${article.source}\n\nRead on NewsFlip\n${article.webUrl}`,
        url: article.webUrl,
      });
    } catch (_) {}
  }, [article]);

  if (!article) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={styles.errorState}>
          <Ionicons name="alert-circle-outline" size={48} color={colors.border} />
          <Text style={[styles.errorText, { color: colors.textSecondary }]}>Article not found</Text>
          <Pressable onPress={() => router.back()} style={[styles.backBtn, { backgroundColor: colors.primary }]}>
            <Text style={styles.backBtnText}>Go Back</Text>
          </Pressable>
        </View>
      </SafeAreaView>
    );
  }

  const bookmarked = isBookmarked(decodedId);

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.headerBackground }]}>
      <StatusBar
        barStyle={colorScheme === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={colors.headerBackground}
      />

      {/* Header */}
      <View style={[styles.header, { backgroundColor: colors.headerBackground, borderBottomColor: colors.border }]}>
        <Pressable
          onPress={() => router.back()}
          style={({ pressed }) => [styles.headerBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Go back">
          <Ionicons name="chevron-back" size={22} color={colors.text} />
          <Text style={[styles.headerBackText, { color: colors.text }]}>Article</Text>
        </Pressable>
        <Pressable
          onPress={handleShare}
          style={({ pressed }) => [styles.headerIconBtn, { opacity: pressed ? 0.7 : 1 }]}
          accessibilityRole="button"
          accessibilityLabel="Share article">
          <Ionicons name="share-outline" size={22} color={colors.text} />
        </Pressable>
      </View>

      <ScrollView
        style={[styles.scroll, { backgroundColor: colors.surface }]}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}>

        {/* Hero Image */}
        <View style={[styles.heroContainer, { height: heroHeight }]}>
          <Image
            source={{ uri: article.imageUrl }}
            style={styles.heroImage}
            resizeMode="cover"
            accessibilityLabel={`Cover image for ${article.title}`}
          />
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.3)']}
            style={StyleSheet.absoluteFill}
            pointerEvents="none"
          />
        </View>

        {/* Article Content */}
        <View style={[styles.contentWrapper, { backgroundColor: colors.background }]}>
          {/* Category + Source */}
          <View style={styles.metaRow}>
            <View style={[styles.categoryBadge, { backgroundColor: `${categoryColor}18` }]}>
              <Text style={[styles.categoryBadgeText, { color: categoryColor }]}>
                {article.category.toUpperCase()}
              </Text>
            </View>
            <Text style={[styles.sourceTag, { color: colors.textSecondary }]}>
              {article.source}
            </Text>
          </View>

          {/* Title */}
          <Text style={[styles.title, { color: colors.text }]}>{article.title}</Text>

          {/* Author row */}
          <View style={[styles.authorRow, { borderTopColor: colors.divider, borderBottomColor: colors.divider }]}>
            <Image
              source={{ uri: article.author.avatar }}
              style={styles.authorAvatar}
              accessibilityLabel={article.author.name}
            />
            <View style={styles.authorInfo}>
              <Text style={[styles.authorName, { color: colors.text }]}>{article.author.name}</Text>
              <Text style={[styles.authorMeta, { color: colors.textSecondary }]}>
                {article.author.title} · {timeAgo(article.publishedAt)} · {article.readTime} min read
              </Text>
            </View>
            <View style={[styles.articleTypeBadge, { backgroundColor: article.isPublic ? colors.tagBackground : colors.chipInactive }]}>
              <Text style={[styles.articleTypeText, { color: article.isPublic ? colors.tagText : colors.textSecondary }]}>
                {article.isPublic ? 'Public' : 'Premium'}
              </Text>
            </View>
          </View>

          {/* Body */}
          {article.content.map((para, i) => {
            if (i === 2 && article.pullQuote) {
              return (
                <React.Fragment key={i}>
                  <Text style={[styles.bodyText, { color: colors.text }]}>{para}</Text>
                  {/* Pull quote */}
                  <View
                    style={[
                      styles.pullQuote,
                      { backgroundColor: colors.quoteBackground, borderLeftColor: colors.quoteBorder },
                    ]}>
                    <Text style={[styles.pullQuoteText, { color: colors.text }]}>
                      &ldquo;{article.pullQuote}&rdquo;
                    </Text>
                    {article.pullQuoteAuthor && (
                      <Text style={[styles.pullQuoteAuthor, { color: colors.textSecondary }]}>
                        — {article.pullQuoteAuthor}
                      </Text>
                    )}
                  </View>
                </React.Fragment>
              );
            }
            return (
              <Text key={i} style={[styles.bodyText, { color: colors.text }]}>
                {para}
              </Text>
            );
          })}

          {/* Read Full Article CTA */}
          <Pressable
            onPress={() => {
              if (article?.webUrl) {
                Linking.openURL(article.webUrl);
              }
            }}
            style={({ pressed }) => [
              styles.ctaButton,
              { backgroundColor: colors.primary, opacity: pressed ? 0.9 : 1 },
            ]}
            accessibilityRole="button"
            accessibilityLabel="Read full article">
            <Text style={styles.ctaButtonText}>Read Full Article</Text>
            <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
          </Pressable>
          {!article.isPublic && (
            <Text style={[styles.premiumNote, { color: colors.textSecondary }]}>
              Requires NewsFlip Premium subscription
            </Text>
          )}

          {/* Divider */}
          <View style={[styles.divider, { backgroundColor: colors.divider }]} />

          {/* Reactions bar */}
          <View style={styles.actionsBar}>
            <Pressable
              onPress={() => setLiked((v) => !v)}
              style={({ pressed }) => [styles.actionBtn, { opacity: pressed ? 0.7 : 1 }]}
              accessibilityRole="button"
              accessibilityLabel={liked ? 'Unlike' : 'Like'}>
              <Ionicons
                name={liked ? 'heart' : 'heart-outline'}
                size={22}
                color={liked ? '#EF4444' : colors.icon}
              />
              <Text style={[styles.actionCount, { color: liked ? '#EF4444' : colors.textSecondary }]}>
                {article.likes + (liked ? 1 : 0)}
              </Text>
            </Pressable>
            <View style={styles.actionsRight}>
              <Pressable
                onPress={handleShare}
                style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="Share">
                <Ionicons name="share-social-outline" size={22} color={colors.icon} />
              </Pressable>
              <Pressable
                onPress={() => toggleBookmark(decodedId)}
                style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel={bookmarked ? 'Remove bookmark' : 'Bookmark'}>
                <Ionicons
                  name={bookmarked ? 'bookmark' : 'bookmark-outline'}
                  size={22}
                  color={bookmarked ? colors.primary : colors.icon}
                />
              </Pressable>
              <Pressable
                style={({ pressed }) => [styles.iconBtn, { opacity: pressed ? 0.7 : 1 }]}
                accessibilityRole="button"
                accessibilityLabel="More options">
                <Ionicons name="ellipsis-horizontal" size={22} color={colors.icon} />
              </Pressable>
            </View>
          </View>
        </View>

        {/* Recommended for you */}
        <View style={[styles.section, { backgroundColor: colors.background }]}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Recommended for you</Text>
          {recommendedArticles.map((rec) => (
            <ArticleCard
              key={rec.id}
              article={rec}
              onPress={() => {
                const encodedId = encodeURIComponent(rec.id);
                router.replace(`/article/${encodedId}`);
              }}
              onBookmark={() => toggleBookmark(rec.id)}
              isBookmarked={isBookmarked(rec.id)}
            />
          ))}
        </View>

        {/* Up Next */}
        {upNextArticle && (
          <View style={[styles.section, { backgroundColor: colors.background }]}>
            <Text style={[styles.upNextLabel, { color: colors.textSecondary }]}>UP NEXT</Text>
            <Pressable
              onPress={() => {
                const encodedId = encodeURIComponent(upNextArticle.id);
                router.replace(`/article/${encodedId}`);
              }}
              style={({ pressed }) => [
                styles.upNextCard,
                { backgroundColor: colors.card, borderColor: colors.border, opacity: pressed ? 0.9 : 1 },
              ]}
              accessibilityRole="button"
              accessibilityLabel={upNextArticle.title}>
              <Image
                source={{ uri: upNextArticle.imageUrl }}
                style={styles.upNextImage}
                accessibilityLabel={upNextArticle.title}
              />
              <View style={styles.upNextContent}>
                <Text style={[styles.upNextSource, { color: colors.primary }]}>
                  {upNextArticle.source}
                </Text>
                <Text style={[styles.upNextTitle, { color: colors.text }]} numberOfLines={2}>
                  {upNextArticle.title}
                </Text>
                <Text style={[styles.upNextMeta, { color: colors.textSecondary }]}>
                  {upNextArticle.readTime} min read
                </Text>
              </View>
              <Pressable
                style={({ pressed }) => [
                  styles.followBtn,
                  { backgroundColor: colors.primary, opacity: pressed ? 0.85 : 1 },
                ]}
                accessibilityRole="button"
                accessibilityLabel="Follow source">
                <Text style={styles.followBtnText}>Follow</Text>
              </Pressable>
            </Pressable>
          </View>
        )}

        <View style={styles.bottomPad} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  headerBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    padding: 4,
  },
  headerBackText: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  headerIconBtn: {
    padding: 6,
  },
  scroll: { flex: 1 },
  scrollContent: {
    gap: Spacing.sm,
    backgroundColor: 'transparent',
  },
  heroContainer: {
    width: '100%',
    backgroundColor: '#1E1E30',
    overflow: 'hidden',
  },
  heroImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  contentWrapper: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
    gap: Spacing.md,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  categoryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  categoryBadgeText: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  sourceTag: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  title: {
    fontSize: FontSizes['4xl'],
    fontWeight: '800',
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.md,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderBottomWidth: StyleSheet.hairlineWidth,
    gap: Spacing.sm,
  },
  authorAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E2E8F0',
  },
  authorInfo: {
    flex: 1,
    gap: 2,
  },
  authorName: {
    fontSize: FontSizes.base,
    fontWeight: '700',
  },
  authorMeta: {
    fontSize: FontSizes.sm,
  },
  articleTypeBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.xs,
  },
  articleTypeText: {
    fontSize: FontSizes.xs,
    fontWeight: '600',
  },
  bodyText: {
    fontSize: FontSizes.base,
    lineHeight: 24,
    letterSpacing: 0.1,
  },
  pullQuote: {
    borderLeftWidth: 3,
    paddingLeft: Spacing.md,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
    gap: Spacing.xs,
  },
  pullQuoteText: {
    fontSize: FontSizes.lg,
    fontStyle: 'italic',
    lineHeight: 24,
    fontWeight: '500',
  },
  pullQuoteAuthor: {
    fontSize: FontSizes.sm,
    fontWeight: '500',
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.sm,
  },
  ctaButtonText: {
    color: '#FFFFFF',
    fontSize: FontSizes.xl,
    fontWeight: '700',
  },
  premiumNote: {
    fontSize: FontSizes.xs,
    textAlign: 'center',
    marginTop: -Spacing.sm,
  },
  divider: {
    height: 1,
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    padding: Spacing.xs,
  },
  actionCount: {
    fontSize: FontSizes.base,
    fontWeight: '600',
  },
  actionsRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconBtn: {
    padding: Spacing.xs + 2,
  },
  section: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.lg,
  },
  sectionTitle: {
    fontSize: FontSizes.xl,
    fontWeight: '700',
    marginBottom: Spacing.md,
  },
  upNextLabel: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: Spacing.md,
  },
  upNextCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  upNextImage: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.md,
    backgroundColor: '#E2E8F0',
  },
  upNextContent: {
    flex: 1,
    gap: 3,
  },
  upNextSource: {
    fontSize: FontSizes.xs,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  upNextTitle: {
    fontSize: FontSizes.sm,
    fontWeight: '600',
    lineHeight: 18,
  },
  upNextMeta: {
    fontSize: FontSizes.xs,
  },
  followBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
  },
  followBtnText: {
    color: '#FFFFFF',
    fontSize: FontSizes.sm,
    fontWeight: '700',
  },
  errorState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.lg,
  },
  errorText: {
    fontSize: FontSizes.xl,
    fontWeight: '600',
  },
  backBtn: {
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.lg,
  },
  backBtnText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: FontSizes.base,
  },
  bottomPad: {
    height: Spacing.xl,
  },
});
