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

// Handle the auth callback
onMounted(async () => {
  console.log('🔄 Auth callback mounted, checking session...')
  try {
    const route = useRoute()
    console.log('📍 Route state:', {
      hash: route.hash,
      code: route.query.code,
      error: route.query.error
    })

    if (!route.query.code && !route.hash) {
      throw new Error('No authentication code received')
    }

    if (route.query.error) {
      throw new Error(route.query.error_description as string || 'Authentication was rejected')
    }

    if (route.query.code) {
      console.log('🔑 Exchanging code for session...')
      const { data, error: authError } = await client.auth.exchangeCodeForSession(String(route.query.code))
      if (authError) throw authError

      console.log('✅ Session exchange result:', {
        success: !!data?.session,
        user: data?.session?.user?.email
      })
    }
  } catch (e: any) {
    console.error('❌ Auth callback error:', e)
    error.value = e?.message || 'Authentication failed. Please try again.'
  }
})

// Watch for user state changes and redirect when authenticated
watch(user, (newUser) => {
  console.log('👤 User state changed:', newUser ? `Logged in as ${newUser.email}` : 'Not logged in')
  if (newUser) {
    console.log('🏠 Redirecting to home...')
    navigateTo('/')
  }
}, { immediate: true })
</script>