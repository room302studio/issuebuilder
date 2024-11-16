interface GithubUser {
  id: number
  login: string
  name: string
  avatar_url: string
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const store = useAppStore()

  const isAuthenticated = computed(() => {
    return !!store.githubToken
  })

  async function checkSession() {
    const { data: { session } } = await supabase.auth.getSession()
    if (session?.provider_token) {
      store.setGithubToken(session.provider_token)
      await fetchUserData()
    }
    return !!session?.provider_token
  }

  // Handle the OAuth callback
  async function handleCallback(code: string) {
    try {
      // Let Supabase handle the callback
      const { data: { session }, error } = await supabase.auth.exchangeCodeForSession(code)
      
      if (error) throw error
      if (!session) throw new Error('No session returned')

      // Store the GitHub token
      store.setGithubToken(session.provider_token || null)

      // Fetch user data if we have a token
      if (session.provider_token) {
        await fetchUserData()
      }

      return session
    } catch (error) {
      console.error('Error in auth callback:', error)
      throw error
    }
  }

  async function fetchUserData() {
    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token

    if (!providerToken) return

    try {
      const userData = await $fetch<GithubUser>('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${providerToken}`
        }
      })
      store.setGithubUser(userData)
      store.setGithubToken(providerToken)
    } catch (error) {
      console.error('Error fetching user data:', error)
      throw error
    }
  }

  // Get list of user's repositories
  async function fetchUserRepos() {
    const { data: { session } } = await supabase.auth.getSession()
    const providerToken = session?.provider_token

    if (!providerToken) return []

    try {
      const repos = await $fetch<Array<any>>('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${providerToken}`
        },
        query: {
          sort: 'updated',
          per_page: 100
        }
      })
      return repos
    } catch (error) {
      console.error('Error fetching repositories:', error)
      return []
    }
  }

  return {
    isAuthenticated,
    handleCallback,
    fetchUserData,
    fetchUserRepos
  }
}
