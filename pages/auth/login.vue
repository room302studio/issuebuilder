<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
          Sign in to your account
        </h2>
      </div>

      <div class="mt-8 space-y-6">
        <UButton @click="handleGitHubLogin" color="gray" variant="solid" block :loading="loading" :disabled="loading"
          class="relative">
          <template #leading>
            <Icon name="mdi:github" class="h-5 w-5" />
          </template>
          {{ loading ? 'Signing in...' : 'Sign in with GitHub' }}
        </UButton>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
// Force the default layout
definePageMeta({
  layout: 'default'
})

const supabase = useSupabaseClient()
const config = useRuntimeConfig()
const loading = ref(false)
const toast = useToast()

async function handleGitHubLogin() {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${config.public.SITE_URL}/auth/confirm`,
        scopes: 'read:user'
      }
    })
    if (error) throw error
  } catch (error) {
    toast.add({
      title: 'Error signing in with GitHub',
      description: error.message,
      color: 'red'
    })
  } finally {
    loading.value = false
  }
}

// Redirect if already logged in
const user = useSupabaseUser()
watch(user, (newUser) => {
  if (newUser) {
    navigateTo('/')
  }
}, { immediate: true })
</script>