import { createGlobalState, useStorage } from '@vueuse/core'
import type { Issue } from '~/types'

interface Repository {
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

export const useAppStore = createGlobalState(() => {
  // Persistent state
  const repositories = useStorage('repositories', [] as Repository[])
  const selectedModel = useStorage(
    'selected-model',
    'anthropic/claude-3.5-sonnet:beta'
  )
  const selectedRepository = useStorage(
    'selected-repository',
    null as Repository | null
  )
  const itemList = ref<Issue[]>([])
  const githubToken = useStorage('github-token', null as string | null)
  const githubUser = useStorage('github-user', null as any)

  // Helper methods
  const setGithubToken = (token: string | null) => {
    githubToken.value = token
  }

  const setGithubUser = (user: any) => {
    githubUser.value = user
  }

  // Actions
  const fetchRepositories = async () => {
    const config = useRuntimeConfig()

    // Get token from either manual auth or OAuth
    let providerToken: string | null = null

    if (config.public.disableAuth) {
      // Use manually set token when auth is disabled
      providerToken = githubToken.value || null
    } else {
      // Get token from Supabase session when auth is enabled
      try {
        const user = useSupabaseUser()
        const {
          data: { session }
        } = await useSupabaseClient().auth.getSession()

        console.log('🔍 Fetching repos, state:', {
          exists: !!user.value,
          id: user.value?.id,
          email: user.value?.email,
          metadata: user.value?.user_metadata,
          appMetadata: user.value?.app_metadata,
          providerToken: session?.provider_token
        })

        providerToken = session?.provider_token || null
      } catch (error) {
        console.error('Error getting Supabase session:', error)
        return []
      }
    }

    if (!providerToken) {
      console.warn('❌ No provider token found, cannot fetch repos')
      return []
    }

    try {
      console.log('📡 Fetching repos from GitHub API...')
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${providerToken}`,
          Accept: 'application/vnd.github.v3+json'
        },
        signal: AbortSignal.timeout(10000) // 10 second timeout
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Fetched repos successfully:', {
        count: data.length,
        scopes: response.headers.get('x-oauth-scopes'),
        rateLimit: {
          limit: response.headers.get('x-ratelimit-limit'),
          remaining: response.headers.get('x-ratelimit-remaining'),
          reset: response.headers.get('x-ratelimit-reset')
        }
      })

      repositories.value = data
      return data
    } catch (error) {
      console.error('💥 Error fetching repositories:', error)
      throw error
    }
  }

  // Add repository selection
  const selectRepository = async (repo: Repository | null) => {
    selectedRepository.value = repo
  }

  // Remove item from list
  const removeItem = (id: string) => {
    itemList.value = itemList.value.filter(item => item.id !== id)
  }

  return {
    repositories,
    selectedModel,
    selectedRepository,
    fetchRepositories,
    selectRepository,
    itemList,
    githubToken,
    githubUser,
    setGithubToken,
    setGithubUser,
    removeItem
  }
})
