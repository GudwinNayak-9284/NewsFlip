const GUARDIAN_API_KEY = '3f0e5bfc-51db-46b3-ac1f-7dc2b5e8d23a';
const BASE_URL = 'https://content.guardianapis.com';

export interface GuardianArticle {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  isHosted: boolean;
  pillarId?: string;
  pillarName?: string;
  fields?: {
    thumbnail?: string;
    trailText?: string;
    headline?: string;
    body?: string;
    byline?: string;
    standfirst?: string;
    shortUrl?: string;
  };
}

export interface GuardianResponse {
  response: {
    status: string;
    userTier: string;
    total: number;
    startIndex: number;
    pageSize: number;
    currentPage: number;
    pages: number;
    orderBy: string;
    results: GuardianArticle[];
  };
}

export interface NewsFilters {
  q?: string;
  section?: string;
  tag?: string;
  fromDate?: string;
  toDate?: string;
  orderBy?: 'newest' | 'oldest' | 'relevance';
  page?: number;
  pageSize?: number;
  showFields?: string;
  lastArticleId?: string;
}

export async function fetchNews(
  section: string = '',
  pageSize: number = 10,
  filters: Partial<NewsFilters> = {}
): Promise<{ posts: GuardianArticle[]; nextPage?: number; totalPages?: number }> {
  try {
    // Map app sections to Guardian sections
    const sectionMap: Record<string, string> = {
      'Technology': 'technology',
      'Sports': 'sport',
      'Business': 'business',
      'Science': 'science',
      'World': 'world',
      'Health': 'society',
      'General': '',
    };

    const params = new URLSearchParams({
      'api-key': GUARDIAN_API_KEY,
      'page-size': (filters.pageSize || pageSize).toString(),
      'order-by': filters.orderBy || 'newest',
      'show-fields': filters.showFields || 'thumbnail,trailText,byline,standfirst,shortUrl',
    });

    // Add section filter
    if (section && section !== 'General') {
      const guardianSection = sectionMap[section] || section.toLowerCase();
      params.append('section', guardianSection);
    }

    // Add search query if provided
    if (filters.q) {
      params.append('q', filters.q);
    }

    // Add tag filter if provided
    if (filters.tag) {
      params.append('tag', filters.tag);
    }

    // Add date filters
    if (filters.fromDate) {
      params.append('from-date', filters.fromDate);
    }
    if (filters.toDate) {
      params.append('to-date', filters.toDate);
    }

    // Add page number
    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const url = `${BASE_URL}/search?${params.toString()}`;
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GuardianResponse = await response.json();
    const currentPage = data.response.currentPage;
    const totalPages = data.response.pages;
    
    return { 
      posts: data.response.results || [], 
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined,
      totalPages
    };
  } catch (error) {
    throw error;
  }
}

export async function searchNews(
  query: string, 
  pageSize: number = 10,
  filters: Partial<NewsFilters> = {}
): Promise<{ posts: GuardianArticle[]; nextPage?: number }> {
  try {
    const params = new URLSearchParams({
      'api-key': GUARDIAN_API_KEY,
      'q': query,
      'page-size': pageSize.toString(),
      'order-by': 'relevance',
      'show-fields': 'thumbnail,trailText,byline,standfirst,shortUrl',
    });

    if (filters.page) {
      params.append('page', filters.page.toString());
    }

    const response = await fetch(`${BASE_URL}/search?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: GuardianResponse = await response.json();
    const currentPage = data.response.currentPage;
    const totalPages = data.response.pages;
    
    return { 
      posts: data.response.results || [], 
      nextPage: currentPage < totalPages ? currentPage + 1 : undefined 
    };
  } catch (error) {
    throw error;
  }
}

export function guardianToArticle(article: GuardianArticle, index?: number) {
  // Map Guardian sections to app categories
  const categoryMap: Record<string, string> = {
    'technology': 'Technology',
    'sport': 'Sports',
    'business': 'Business',
    'science': 'Science',
    'world': 'World',
    'society': 'Health',
    'politics': 'World',
    'us-news': 'World',
    'uk-news': 'World',
    'lifeandstyle': 'General',
    'culture': 'General',
    'environment': 'Science',
  };
  
  const appCategory = categoryMap[article.sectionId] || 'General';
  
  // Extract description from fields or use webTitle
  const description = article.fields?.trailText || article.fields?.standfirst || article.webTitle;
  
  // Generate content paragraphs
  const content = article.fields?.body 
    ? [article.fields.body.substring(0, 500) + '...']
    : [description];
  
  return {
    id: article.id,
    title: article.fields?.headline || article.webTitle,
    description: description,
    content: content,
    category: appCategory,
    tags: [article.sectionName, article.pillarName || 'News'].filter(Boolean),
    source: 'The Guardian',
    author: {
      name: article.fields?.byline || 'The Guardian',
      title: 'Journalist',
      avatar: `https://i.pravatar.cc/80?u=${article.fields?.byline || 'guardian'}`,
    },
    publishedAt: article.webPublicationDate,
    readTime: Math.ceil((article.fields?.body?.length || 1000) / 200),
    imageUrl: article.fields?.thumbnail || `https://picsum.photos/seed/${article.id}/800/500`,
    likes: Math.floor(Math.random() * 500) + 100,
    isPublic: true,
    webUrl: article.webUrl,
  };
}
