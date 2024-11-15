export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Skip middleware for excluded routes
  const excludedRoutes = ['/auth/login', '/auth/confirm']
  if (excludedRoutes.includes(to.path)) {
    return
  }

  try {
    // Check if we have a session
    const { data: { session }, error } = await supabase.auth.getSession()
    
    // If there's an error or no session, and we're not on an excluded route
    if ((error || !session) && !excludedRoutes.includes(to.path)) {
      // Clear user state to prevent stale data
      user.value = null
      return navigateTo('/auth/login')
    }

    // Update user state if we have a session
    if (session?.user) {
      user.value = session.user
    }

  } catch (err) {
    console.error('Auth middleware error:', err)
    return navigateTo('/auth/login')
  }
}) 