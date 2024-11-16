<template>
  <div class="min-h-screen flex items-center justify-center">
    <div class="text-center">
      <template v-if="error">
        <div class="text-red-500 mb-4">
          <Icon name="heroicons:exclamation-circle" class="w-12 h-12 mx-auto mb-2" />
          <p>{{ error }}</p>
        </div>
        <UButton to="/" color="gray">Return Home</UButton>
      </template>
      <template v-else>
        <ULoadingIcon size="lg" />
        <p class="mt-4 text-gray-600">Authenticating with GitHub...</p>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
const router = useRouter()
const supabase = useSupabaseClient()
const error = ref('')

// Handle the OAuth callback
onMounted(async () => {
  try {
    const { data: { session }, error: authError } = await supabase.auth.getSession()

    if (authError) throw authError
    if (!session) throw new Error('No session found')

    // Redirect to home page after successful auth
    router.push('/')
  } catch (err: any) {
    console.error('Auth callback error:', err)
    error.value = err.message || 'Failed to authenticate with GitHub'
  }
})
</script>