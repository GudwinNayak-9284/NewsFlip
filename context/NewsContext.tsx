import { fetchNews, guardianToArticle, NewsFilters, searchNews } from '@/services/guardianApi';
import { Article } from '@/types/article';
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

const CACHE_KEY = '@newsflip_articles_cache';
const CACHE_TIMESTAMP_KEY = '@newsflip_cache_timestamp';
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

interface NewsContextType {
  articles: Article[];
  categories: string[];
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  getArticleById: (id: string) => Article | undefined;
  getArticlesByCategory: (cat: string) => Article[];
  searchArticles: (query: string, filters?: Partial<NewsFilters>) => Promise<Article[]>;
  trendingArticles: Article[];
  topStories: Article[];
  latestFeed: Article[];
  loading: boolean;
  loadMore: () => Promise<void>;
  hasMore: boolean;
  loadingMore: boolean;
  error: string | null;
  retry: () => void;
}

const NewsContext = createContext<NewsContextType | undefined>(undefined);

const CATEGORIES = ['General', 'Technology', 'Sports', 'Business', 'Science', 'World', 'Health'];

export function NewsProvider({ children }: { children: ReactNode }) {
  const [selectedCategory, setSelectedCategory] = useState<string>('General');
  const [articles, setArticles] = useState<Article[]>([]);
  const [searchResults, setSearchResults] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [nextPage, setNextPage] = useState<number | undefined>(undefined);

  useEffect(() => {
    loadNews(selectedCategory);
  }, [selectedCategory]);

  const loadCachedArticles = async (): Promise<Article[] | null> => {
    try {
      const cachedData = await AsyncStorage.getItem(CACHE_KEY);
      const cachedTimestamp = await AsyncStorage.getItem(CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // Check if cache is still valid
        if (now - timestamp < CACHE_DURATION) {
          return JSON.parse(cachedData);
        }
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const saveCachedArticles = async (articles: Article[]) => {
    try {
      await AsyncStorage.setItem(CACHE_KEY, JSON.stringify(articles));
      await AsyncStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString());
    } catch (error) {
      // Silently fail - caching is not critical
    }
  };

  const loadNews = async (category: string) => {
    setLoading(true);
    setError(null);
    
    // Try to load from cache first
    const cachedArticles = await loadCachedArticles();
    if (cachedArticles && cachedArticles.length > 0) {
      setArticles(cachedArticles);
      setLoading(false);
    }
    
    try {
      const filters: Partial<NewsFilters> = {};
      const response = await fetchNews(category, 10, filters);
      const formattedArticles = response.posts.map((article: any, index: number) => guardianToArticle(article, index));
      
      // Deduplicate articles by ID
      const uniqueArticles = formattedArticles.filter((article, index, self) =>
        index === self.findIndex((a) => a.id === article.id)
      );
      
      setArticles(uniqueArticles);
      setPage(1);
      setNextPage(response.nextPage);
      setHasMore(!!response.nextPage);
      
      // Save to cache
      await saveCachedArticles(uniqueArticles);
    } catch (error: any) {
      // If we have cached data, don't show error
      if (cachedArticles && cachedArticles.length > 0) {
        setError(null);
      } else if (error?.message?.includes('429')) {
        setError('API rate limit reached. Showing cached articles.');
      } else if (error?.message?.includes('422')) {
        setError('Invalid request. Please try different filters.');
      } else if (error?.message?.includes('503')) {
        setError('Service temporarily unavailable. Showing cached articles.');
      } else {
        setError('Failed to load news. Showing cached articles if available.');
      }
    } finally {
      setLoading(false);
    }
  };

  const loadMore = async () => {
    if (loadingMore || !hasMore || !nextPage) return;
    
    setLoadingMore(true);
    try {
      // Use nextPage for pagination
      const filters: Partial<NewsFilters> = { page: nextPage };
      const response = await fetchNews(selectedCategory, 10, filters);
      const formattedArticles = response.posts.map((article: any, index: number) => 
        guardianToArticle(article, articles.length + index)
      );
      
      // Append new articles, filtering out duplicates
      if (formattedArticles.length > 0) {
        setArticles(prev => {
          const existingIds = new Set(prev.map(a => a.id));
          const newArticles = formattedArticles.filter(article => !existingIds.has(article.id));
          return [...prev, ...newArticles];
        });
        setNextPage(response.nextPage);
        setHasMore(!!response.nextPage);
      } else {
        setHasMore(false);
      }
    } catch (error) {
      setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  };

  const retry = () => {
    loadNews(selectedCategory);
  };

  const getArticleById = (id: string) => {
    return articles.find((a) => a.id === id) || searchResults.find((a) => a.id === id);
  };

  const getArticlesByCategory = (cat: string) => {
    if (cat === 'General') return articles;
    return articles.filter((a) => a.category === cat);
  };

  const searchArticles = async (query: string, filters: Partial<NewsFilters> = {}): Promise<Article[]> => {
    if (!query.trim()) {
      setSearchResults([]);
      return [];
    }
    try {
      const response = await searchNews(query, 10, filters);
      const formattedResults = response.posts.map((article: any, index: number) => guardianToArticle(article, index));
      setSearchResults(formattedResults);
      return formattedResults;
    } catch (error) {
      console.error('Error searching articles:', error);
      setSearchResults([]);
      return [];
    }
  };

  const trendingArticles = articles.slice(0, 5);
  const topStories = articles.slice(0, 4);
  const latestFeed = articles.slice(4, 9);

  return (
    <NewsContext.Provider
      value={{
        articles,
        categories: CATEGORIES,
        selectedCategory,
        setSelectedCategory,
        getArticleById,
        getArticlesByCategory,
        searchArticles,
        trendingArticles,
        topStories,
        latestFeed,
        loading,
        loadMore,
        hasMore,
        loadingMore,
        error,
        retry,
      }}>
      {children}
    </NewsContext.Provider>
  );
}

export function useNews(): NewsContextType {
  const ctx = useContext(NewsContext);
  if (!ctx) throw new Error('useNews must be used within NewsProvider');
  return ctx;
}
