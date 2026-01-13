export interface ForumPost {
  title: string;
  url: string;
  author: string;
  author_url: string;
  date: string;
  views?: number;
  comments?: number;
  summary: string;
  tags?: string[];
  source: "obsidian_forum_en" | "obsidian_forum_zh" | "unknown";
}

export interface PullRequest {
  title: string;
  url: string;
  author: string;
  author_url: string;
  date: string;
  status: "open" | "merged" | "closed";
  repository: string;
  summary: string;
  tags?: string[];
}

export interface DailyReportData {
  date: string;
  stats: {
    total_posts: number;
    total_prs: number;
    sources: Record<string, number>;
  };
  posts: ForumPost[];
  pull_requests: PullRequest[];
}

export interface WeeklyReportData {
  week: string; // YYYY-Www
  date_range: [string, string];
  stats: {
    days_covered: number;
    total_posts: number;
    total_prs: number;
  };
  daily_summaries: {
    date: string;
    summary: string;
    link: string;
  }[];
}
