export interface Article {
  id: string;
  title: string;
  description: string;
  content: string[];
  category: string;
  tags: string[];
  source: string;
  author: {
    name: string;
    title: string;
    avatar: string;
  };
  publishedAt: string;
  readTime: number;
  imageUrl: string;
  likes: number;
  isPublic: boolean;
  webUrl: string;
  pullQuote?: string;
  pullQuoteAuthor?: string;
}

export function timeAgo(dateString: string): string {
  try {
    const date = new Date(dateString);
    
    // Validate date
    if (isNaN(date.getTime())) {
      return 'Recently';
    }
    
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    
    // If date is in future or just now
    if (diffInMs < 0) {
      return 'Just now';
    }
    
    const diffInMinutes = Math.floor(diffInMs / 60000);
    const diffInHours = Math.floor(diffInMinutes / 60);
    const diffInDays = Math.floor(diffInHours / 24);

    if (diffInMinutes < 1) {
      return 'Just now';
    } else if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    } else if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays > 1 ? 's' : ''} ago`;
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  } catch (error) {
    return 'Recently';
  }
}
