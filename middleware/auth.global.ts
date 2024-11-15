export default defineNuxtRouteMiddleware((to) => {
  // Skip auth check for login and confirm pages
  if (to.path === '/auth/login' || to.path === '/auth/confirm') {
    return
  }

  const user = useSupabaseUser()

  if (!user.value) {
    return navigateTo('/auth/login')
  }
}) 