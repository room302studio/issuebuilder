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

// Add debug logging
function logAuthState() {
  console.log('🔍 Auth Callback State:', {
    user: {
      exists: !!user.value,
      id: user.value?.id,
      email: user.value?.email,
      metadata: user.value?.user_metadata,
      appMetadata: user.value?.app_metadata
    },
    route: useRoute().fullPath,
    query: useRoute().query
  })
}

// Watch for user state changes
watch(user, async (newUser) => {
  console.log('👤 User state changed:', newUser ? 'Logged in' : 'Logged out')
  logAuthState()

  if (newUser) {
    // Get the session to access provider token
    const { data: { session } } = await useSupabaseClient().auth.getSession()
    console.log('Session data:', {
      providerToken: session?.provider_token,
      providerId: session?.provider_refresh_token,
      user: session?.user
    })

    console.log('✅ User authenticated, redirecting to home')
    navigateTo('/')
  }
}, { immediate: true })

onMounted(() => {
  console.log('🏁 Auth callback mounted')
  logAuthState()
})
</script>