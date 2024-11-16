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