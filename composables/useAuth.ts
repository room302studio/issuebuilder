export const useAuth = () => {
  const supabase = useSupabaseClient()
  const user = useSupabaseUser()
  const toast = useToast()
  const githubToken = useLocalStorage('github-token', '')

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error
      navigateTo('/auth/login')
    } catch (error: any) {
      toast.add({
        title: 'Error signing out',
        description: error?.message || 'An error occurred while signing out',
        color: 'red'
      })
    }
  }

  const handleGitHubOAuth = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'github',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          scopes: 'repo'
        }
      })
      if (error) throw error
    } catch (error) {
      console.error('Error during GitHub OAuth:', error)
    }
  }

  const exchangeCodeForToken = async (code: string) => {
    try {
      const response = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code
        })
      })
      const data = await response.json()
      if (data.error) throw new Error(data.error)
      githubToken.value = data.access_token
    } catch (error) {
      console.error('Error exchanging code for token:', error)
    }
  }

  const refreshToken = async () => {
    // GitHub tokens typically do not expire, but if needed, implement refresh logic here
  }

  return {
    user,
    signOut,
    handleGitHubOAuth,
    exchangeCodeForToken,
    refreshToken
  }
}
