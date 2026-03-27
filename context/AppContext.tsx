import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { ColorSchemeName, useColorScheme as useRNColorScheme, useWindowDimensions } from 'react-native';

const STORAGE_KEYS = {
  BOOKMARKS: '@newsflip/bookmarks',
  SEARCH_HISTORY: '@newsflip/search_history',
  THEME: '@newsflip/theme',
  FONT_SCALE: '@newsflip/font_scale',
};

interface AppContextType {
  bookmarks: string[];
  isBookmarked: (id: string) => boolean;
  toggleBookmark: (id: string) => Promise<void>;
  searchHistory: string[];
  addSearch: (query: string) => Promise<void>;
  removeSearch: (query: string) => Promise<void>;
  clearAllSearches: () => Promise<void>;
  colorScheme: ColorSchemeName;
  toggleTheme: () => Promise<void>;
  fontScale: number;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useRNColorScheme();
  const { fontScale: systemFontScale } = useWindowDimensions();
  const [bookmarks, setBookmarks] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [colorScheme, setColorScheme] = useState<ColorSchemeName>(systemColorScheme);
  const [fontScale, setFontScaleState] = useState<number>(1);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedBookmarks, savedHistory, savedTheme] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEYS.BOOKMARKS),
          AsyncStorage.getItem(STORAGE_KEYS.SEARCH_HISTORY),
          AsyncStorage.getItem(STORAGE_KEYS.THEME),
        ]);
        if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
        if (savedHistory) setSearchHistory(JSON.parse(savedHistory));
        if (savedTheme) setColorScheme(savedTheme as ColorSchemeName);
      } catch (e) {
        return;
      }
    };
    loadData();
  }, []);

  // Update font scale based on system accessibility settings
  useEffect(() => {
    const scale = Math.min(Math.max(systemFontScale || 1, 0.8), 1.5);
    setFontScaleState(scale);
  }, [systemFontScale]);

  const isBookmarked = (id: string) => bookmarks.includes(id);

  const toggleBookmark = async (id: string) => {
    const newBookmarks = bookmarks.includes(id)
      ? bookmarks.filter((b) => b !== id)
      : [...bookmarks, id];
    setBookmarks(newBookmarks);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.BOOKMARKS, JSON.stringify(newBookmarks));
    } catch (e) {
      // AsyncStorage not available
    }
  };

  const addSearch = async (query: string) => {
    if (!query.trim()) return;
    const filtered = searchHistory.filter((s) => s.toLowerCase() !== query.toLowerCase());
    const newHistory = [query, ...filtered].slice(0, 10);
    setSearchHistory(newHistory);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
    } catch (e) {
      // AsyncStorage not available
    }
  };

  const removeSearch = async (query: string) => {
    const newHistory = searchHistory.filter((s) => s !== query);
    setSearchHistory(newHistory);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SEARCH_HISTORY, JSON.stringify(newHistory));
    } catch (e) {
      // AsyncStorage not available
    }
  };

  const clearAllSearches = async () => {
    setSearchHistory([]);
    try {
      await AsyncStorage.removeItem(STORAGE_KEYS.SEARCH_HISTORY);
    } catch (e) {
      // AsyncStorage not available
    }
  };

  const toggleTheme = async () => {
    const newTheme = colorScheme === 'dark' ? 'light' : 'dark';
    setColorScheme(newTheme);
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.THEME, newTheme);
    } catch (e) {
      // AsyncStorage not available
    }
  };


  return (
    <AppContext.Provider
      value={{
        bookmarks,
        isBookmarked,
        toggleBookmark,
        searchHistory,
        addSearch,
        removeSearch,
        clearAllSearches,
        colorScheme,
        toggleTheme,
        fontScale,
      }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp(): AppContextType {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}
