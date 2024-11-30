export interface Issue {
  id?: string;
  title: string;
  body: string;
  skeleton?: boolean;
  history?: {
    splitFrom?: {
      title: string;
      body: string;
    };
    splitAt?: string;
    combinedFrom?: Array<{
      title: string;
      body: string;
    }>;
  }
}

export interface GithubUser {
  id: number
  login: string
  name: string | null
  avatar_url: string
  html_url: string
  // Add other GitHub user fields you need
} 