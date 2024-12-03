<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
    <UCard>
      <div class="text-center">
        <h3 class="text-lg font-medium mb-2">
          {{ error ? 'Authentication Error' : 'Welcome back!' }}
        </h3>
        <p class="text-sm text-gray-500">
          {{ error ? error : 'Redirecting you to the dashboard...' }}
        </p>
        <div class="mt-4">
          <UProgress v-if="!error" animation="carousel" />
          <UButton v-else to="/auth/login" color="primary">
            Try Again
          </UButton>
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
const error = ref<string | null>(null)
const user = useSupabaseUser()
const client = useSupabaseClient()
const config = useRuntimeConfig()

// Get redirect path from cookies if available
const cookieName = config.public.supabase?.cookieName || 'sb'
const redirectPath = useCookie(`${cookieName}-redirect-path`).value

async function handleCallback() {
  try {
    const route = useRoute()

    if (route.hash || route.query.code) {
      const { data, error: authError } = await client.auth.getSession()
      if (authError) throw authError

      console.log('Auth callback session:', data)

      // Wait briefly to ensure auth state is updated
      await new Promise(resolve => setTimeout(resolve, 1000))

      if (data.session) {
        // Clear redirect cookie
        useCookie(`${cookieName}-redirect-path`).value = null
        // Redirect to saved path or home
        navigateTo(redirectPath || '/')
      } else {
        throw new Error('No session established')
      }
    }
  } catch (e) {
    console.error('Auth callback error:', e)
    error.value = 'Authentication failed. Please try again.'
  }
}

// Watch for user state changes
watch(user, (newUser) => {
  if (newUser) {
    // Clear redirect cookie
    useCookie(`${cookieName}-redirect-path`).value = null
    // Redirect to saved path or home
    navigateTo(redirectPath || '/')
  }
}, { immediate: true })

onMounted(() => {
  handleCallback()
})
</script>