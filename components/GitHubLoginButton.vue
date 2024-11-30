<template>
  <UButton @click="login" :loading="loading" color="gray" class="flex items-center gap-2">
    <Icon name="simple-icons:github" class="w-5 h-5" />
    {{ isAuthenticated ? 'Connected to GitHub' : 'Link with GitHub' }}
  </UButton>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const loading = ref(false)
const { isAuthenticated } = useAuth()
const supabase = useSupabaseClient()

async function login() {
  loading.value = true
  try {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        scopes: 'repo', // Request additional repo scope
        redirectTo: `${config.public.siteUrl}/auth/callback`,
        skipBrowserRedirect: false,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })

    if (error) throw error
  } catch (error) {
    console.error('GitHub login error:', error)
  } finally {
    loading.value = false
  }
}
</script>