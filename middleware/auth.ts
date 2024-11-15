export default defineNuxtRouteMiddleware(async (to) => {
  const user = useSupabaseUser()
  const supabase = useSupabaseClient()

  // Skip middleware for excluded routes
  const excludedRoutes = ['/auth/login', '/auth/confirm']
  if (excludedRoutes.includes(to.path)) {
    return
  }

  // Check if we have a session
  const { data: { session } } = await supabase.auth.getSession()

  // If no session and not on an excluded route, redirect to login
  if (!session && !excludedRoutes.includes(to.path)) {
    return navigateTo('/auth/login')
  }
}) 