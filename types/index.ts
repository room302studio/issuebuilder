export interface Issue {
  id: string;
  title: string;
  body: string;
  history?: {
    splitFrom?: string;
    combinedFrom?: string[];
  }
} 