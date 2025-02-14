export interface Issue {
  id?: string
  title: string
  body: string
  createdAt?: string
  skeleton?: boolean
  history?: {
    splitFrom?: {
      title: string
      body: string
    }
    splitAt?: string
    combinedFrom?: Array<{
      title: string
      body: string
    }>
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

export interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description?: string
  owner: {
    login: string
    avatar_url: string
  }
}

export interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
  issues: Issue[]
  document_text: string
  repository?: Repository
  model: string
  user_id: string
}
