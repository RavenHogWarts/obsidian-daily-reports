export interface AIAnalysis {
  ai_summary?: string;
  ai_pain_point?: string;
  ai_highlights?: string[];
  ai_comment?: string;
  ai_tags?: string[];
  ai_score?: number;
}

export interface ForumPost extends AIAnalysis {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  content_html?: string;
  content_text?: string;
}

export interface PullRequest extends AIAnalysis {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  merged_at?: string;
  body?: string;
  state: string; // 'open' | 'closed' | 'merged'
}

export interface RedditPost extends AIAnalysis {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  content_text: string;
}

export interface AIOverview {
  overview: string;
  model: string;
}

export interface DailyAIOverview extends AIOverview {
  processed_count: number;
}

export interface WeeklyAIOverview extends AIOverview {
  total_items: number;
  selected_count: number;
  high_score_items: number;
  average_score: number;
  top_tags: { tag: string; count: number }[];
}


export interface DailyReportData {
  date: string;
  generated_at: string;
  ai?: DailyAIOverview;
  chinese_forum: ForumPost[];
  english_forum: ForumPost[];
  github_opened: PullRequest[];
  github_merged: PullRequest[];
  reddit: RedditPost[];
}

export interface WeeklyReportData {
  iso_week: string;
  date_range: {
    start: string;
    end: string;
  };
  actual_dates: string[];
  generated_at: string;
  ai?: WeeklyAIOverview;
  chinese_forum: ForumPost[];
  english_forum: ForumPost[];
  github_opened: PullRequest[];
  github_merged?: PullRequest[];
  reddit?: RedditPost[];
}

export interface IndexData {
  daily: string[]; // List of YYYY-MM-DD
  weekly: string[]; // List of YYYY-Www
  latest: {
    daily: string;
    weekly: string;
  };
}
