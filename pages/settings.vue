<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <!-- Loading State -->
    <div v-if="loading" class="space-y-4">
      <UProgress animation="carousel" />
      <p class="text-sm text-center text-gray-500">Loading GitHub connection status...</p>
    </div>

    <template v-else>
      <h1 class="text-2xl font-semibold mb-8">Settings</h1>

      <!-- GitHub Section -->
      <div class="space-y-6 mb-12">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-medium">GitHub Connection</h2>
          <UBadge v-if="connectionStatus.type !== 'error'" :color="connectionStatus.color">
            {{ connectionStatus.label }}
          </UBadge>
        </div>

        <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <!-- Logged in, but GitHub not connected -->
          <div v-if="connectionStatus.type === 'needsAuth'" class="space-y-4">
            <div
              class="flex items-center gap-3 p-4 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 rounded-lg">
              <Icon name="heroicons:exclamation-triangle" class="w-5 h-5" />
              <div class="text-sm">
                <strong>GitHub access needed:</strong> To create issues, we need access to your GitHub repositories.
              </div>
            </div>
            <UButton color="github" @click="handleGitHubLink" :loading="linking">
              <template #leading>
                <Icon name="mdi:github" />
              </template>
              Link GitHub Account
            </UButton>
          </div>

          <!-- Logged in, GitHub connected but needs sync -->
          <div v-else-if="connectionStatus.type === 'needsSync'" class="space-y-4">
            <div
              class="flex items-center gap-3 p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
              <Icon name="heroicons:arrow-path" class="w-5 h-5" />
              <div class="text-sm">
                <strong>Sync needed:</strong> Click below to fetch your available repositories.
              </div>
            </div>
            <UButton color="blue" @click="fetchUserRepos" :loading="loadingRepos">
              <template #leading>
                <Icon name="heroicons:arrow-path" />
              </template>
              Sync Repositories
            </UButton>
          </div>

          <!-- Fully connected and synced -->
          <div v-else-if="connectionStatus.type === 'ready'" class="space-y-4">
            <div class="flex items-center justify-between">
              <div class="flex items-center gap-4">
                <img :src="user.user_metadata.avatar_url" :alt="user.user_metadata.name" class="w-12 h-12 rounded-full">
                <div>
                  <div class="font-medium">{{ user.user_metadata.name }}</div>
                  <div class="text-sm text-gray-500">@{{ user.user_metadata.user_name }}</div>
                </div>
              </div>
              <UButton color="red" variant="soft" size="sm" @click="handleSignOut">
                Disconnect
              </UButton>
            </div>

            <!-- Repository List -->
            <div class="space-y-2">
              <div class="flex items-center justify-between">
                <div class="text-sm font-medium text-gray-600 dark:text-gray-300">
                  Available Repositories ({{ userRepos.length }})
                </div>
                <UButton size="xs" icon="i-heroicons-arrow-path" :loading="loadingRepos" @click="fetchUserRepos">
                  Refresh
                </UButton>
              </div>

              <div class="max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg">
                <div v-if="loadingRepos" class="p-4 text-sm text-gray-500">
                  Loading repositories...
                </div>
                <div v-else-if="userRepos.length === 0" class="p-4 text-sm text-gray-500">
                  No repositories found
                </div>
                <div v-else class="divide-y divide-gray-200 dark:divide-gray-700">
                  <div v-for="repo in userRepos" :key="repo.id" class="p-4 hover:bg-gray-100 dark:hover:bg-gray-700/50">
                    <div class="flex justify-between items-start">
                      <div>
                        <div class="font-medium">{{ repo.name }}</div>
                        <div class="text-sm text-gray-500">{{ repo.full_name }}</div>
                      </div>
                      <div class="text-xs space-x-2">
                        <span v-if="repo.private" class="px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded">
                          Private
                        </span>
                        <span v-if="repo.permissions?.admin"
                          class="px-2 py-1 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 rounded">
                          Admin
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Error State -->
          <div v-else-if="connectionStatus.type === 'error'" class="space-y-4">
            <div
              class="flex items-center gap-3 p-4 bg-red-50 dark:bg-red-900/30 text-red-800 dark:text-red-200 rounded-lg">
              <Icon name="heroicons:x-circle" class="w-5 h-5" />
              <div class="text-sm">
                <strong>Connection Error:</strong> {{ connectionStatus.error }}
              </div>
            </div>
            <UButton color="red" @click="handleGitHubLink">
              <template #leading>
                <Icon name="heroicons:arrow-path" />
              </template>
              Retry Connection
            </UButton>
          </div>
        </div>
      </div>
    </template>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig()
const client = useSupabaseClient()
const user = useSupabaseUser()
const store = useAppStore()
const toast = useToast()

const showApiKey = ref(false)
const saving = ref(false)

// Load saved settings
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')

import { MODEL_CONFIGS } from '~/composables/useOpenRouter'

// First, let's add proper types for GitHub data
interface GitHubUser {
  login: string
  name?: string
  avatar_url: string
  html_url: string
}

interface GitHubRepo {
  id: number
  name: string
  full_name: string
  html_url: string
  private: boolean
  permissions?: {
    admin: boolean
    push: boolean
    pull: boolean
  }
}

// Add these to the script setup
const { data: sessionData } = await client.auth.getSession()
const sessionRef = ref(sessionData?.session)

const debugInfo = ref({
  token: null as string | null,
  error: null as any,
  repoCount: 0,
  scopes: [] as string[],
  tokenPreview: computed(() => {
    const token = sessionRef.value?.provider_token
    return token ? `${token.substring(0, 10)}...` : 'No token'
  })
})

const loadingRepos = ref(false)
const userRepos = ref<GitHubRepo[]>([])

// Add loading state
const loading = ref(true)

// Clean up the mounted hook
onMounted(async () => {
  try {
    if (user.value && sessionRef.value?.provider_token) {
      await fetchUserRepos()
    }
  } catch (error) {
    debugInfo.value.error = error
    toast.add({
      title: 'Error',
      description: 'Failed to fetch repositories. Please try reconnecting your GitHub account.',
      color: 'red'
    })
  } finally {
    loading.value = false
  }
})

// Update auth state change handler
onMounted(() => {
  const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
    sessionRef.value = session

    if (session?.provider_token) {
      loading.value = true
      try {
        await fetchUserRepos()
      } finally {
        loading.value = false
      }
    }
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })
})

// Update fetchUserRepos to be quieter
async function fetchUserRepos() {
  loadingRepos.value = true
  debugInfo.value.error = null

  try {
    if (!sessionRef.value?.provider_token) {
      throw new Error('No GitHub token found')
    }

    const response = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${sessionRef.value.provider_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    const scopeHeader = response.headers.get('x-oauth-scopes')
    debugInfo.value.scopes = scopeHeader ? scopeHeader.split(', ') : []

    if (!response.ok) {
      throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
    }

    const reposResponse = await fetch('https://api.github.com/user/repos?per_page=100', {
      headers: {
        'Authorization': `Bearer ${sessionRef.value.provider_token}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    })

    if (!reposResponse.ok) {
      throw new Error(`GitHub Repos API error: ${reposResponse.status} ${reposResponse.statusText}`)
    }

    const repos = await reposResponse.json()
    userRepos.value = repos
    debugInfo.value.repoCount = repos.length

  } catch (error) {
    debugInfo.value.error = error
    throw error
  } finally {
    loadingRepos.value = false
  }
}

// Update sign out handler to be quieter
async function handleSignOut() {
  try {
    await client.auth.signOut()
    navigateTo('/auth/login')
  } catch (error) {
    toast.add({
      title: 'Error',
      description: 'Failed to sign out properly',
      color: 'red'
    })
  }
}

async function saveSettings() {
  saving.value = true
  try {
    // Save settings to localStorage (already handled by useLocalStorage)
    store.setSelectedModel(selectedModel.value)

    toast.add({
      title: 'Settings Saved',
      description: 'Your settings have been updated',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to save settings',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

// Add to script section
const linking = ref(false)
const hasGitHubAccess = computed(() => {
  return !!sessionRef.value?.provider_token
})

async function handleGitHubLink() {
  linking.value = true
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${config.public.siteUrl}/auth/callback`,
        scopes: 'repo read:user user:email',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('GitHub link error:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to link GitHub. Please try again.',
      color: 'red'
    })
  } finally {
    linking.value = false
  }
}

// Add connection status computed
const connectionStatus = computed(() => {
  // Error state
  if (debugInfo.value.error) {
    return {
      type: 'error',
      label: 'Error',
      color: 'red',
      error: debugInfo.value.error.message
    }
  }

  // Not authenticated with GitHub
  if (!sessionRef.value?.provider_token) {
    return {
      type: 'needsAuth',
      label: 'Not Connected',
      color: 'yellow'
    }
  }

  // Authenticated but no repos loaded
  if (userRepos.value.length === 0 && !loadingRepos.value) {
    return {
      type: 'needsSync',
      label: 'Needs Sync',
      color: 'blue'
    }
  }

  // Everything ready
  return {
    type: 'ready',
    label: 'Connected',
    color: 'green'
  }
})
</script>