export interface ForumPost {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  content_html?: string;
  content_text?: string;
}

export interface PullRequest {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  merged_at?: string;
  body?: string;
  state: string; // 'open' | 'closed' | 'merged'
}

export interface RedditPost {
  source: string;
  title: string;
  url: string;
  author: string;
  created_at: string;
  content_text: string;
}

export interface DailyReportData {
  date: string;
  generated_at: string;
  chinese_forum: ForumPost[];
  english_forum: ForumPost[];
  github_opened: PullRequest[];
  github_merged: PullRequest[];
  reddit: RedditPost[];
}

export interface WeeklyReportData {
  week: string;
  start_date: string;
  end_date: string;
  summary: string;
  // TODO: Update structure based on actual weekly data
}

export interface IndexData {
  daily: string[]; // List of YYYY-MM-DD
  weekly: string[]; // List of YYYY-Www
  latest: {
    daily: string;
    weekly: string;
  };
}
