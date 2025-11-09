interface GithubUser {
  id: number
  login: string
  name: string
  avatar_url: string
}

export function useAuth() {
  const supabase = useSupabaseClient()
  const store = useAppStore()
  const config = useRuntimeConfig()

  const isAuthenticated = computed(() => {
    return !!store.githubToken
  })

  async function checkSession() {
    // If auth is disabled, check for manually set token
    if (config.public.disableAuth) {
      return !!store.githubToken
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session?.provider_token) {
        store.setGithubToken(session.provider_token)
        await fetchUserData()
      }
      return !!session?.provider_token
    } catch (error) {
      console.error('Error checking session (connection issue):', error)
      // Return false instead of throwing to prevent app crashes
      return false
    }
  }

  // Manual token setter for when auth is disabled
  function setManualToken(token: string) {
    store.setGithubToken(token)
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
    let providerToken = store.githubToken

    // If auth is not disabled, get token from session
    if (!config.public.disableAuth) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        providerToken = session?.provider_token || null
      } catch (error) {
        console.error('Error getting session from Supabase:', error)
        // Continue with existing token if Supabase is unavailable
      }
    }

    if (!providerToken) return

    try {
      const userData = await $fetch<GithubUser>('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${providerToken}`
        },
        // Add timeout to prevent hung connections
        timeout: 10000
      })
      store.setGithubUser(userData)
      store.setGithubToken(providerToken)
    } catch (error) {
      console.error('Error fetching user data from GitHub:', error)
      throw error
    }
  }

  // Get list of user's repositories
  async function fetchUserRepos() {
    let providerToken = store.githubToken

    // If auth is not disabled, get token from session
    if (!config.public.disableAuth) {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        providerToken = session?.provider_token || null
      } catch (error) {
        console.error('Error getting session from Supabase:', error)
        // Continue with existing token if Supabase is unavailable
      }
    }

    if (!providerToken) return []

    try {
      const repos = await $fetch<Array<any>>('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${providerToken}`
        },
        query: {
          sort: 'updated',
          per_page: 100
        },
        // Add timeout to prevent hung connections
        timeout: 10000
      })
      return repos
    } catch (error) {
      console.error('Error fetching repositories from GitHub:', error)
      return []
    }
  }

  return {
    isAuthenticated,
    handleCallback,
    fetchUserData,
    fetchUserRepos,
    setManualToken
  }
}
