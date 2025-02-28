<template>
  <nav class="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 md:px-12">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-zinc-900 dark:text-white font-semibold">
              IssueBuilder.com
            </NuxtLink>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Selected Repository - styled indicator -->
          <div v-if="store.selectedRepository?.value"
            class="flex items-center gap-2 text-sm bg-primary-50 dark:bg-primary-900/30 text-primary-700 dark:text-primary-300 px-3 py-1.5 rounded-md border border-primary-100 dark:border-primary-800">
            <Icon name="heroicons:repository" class="w-4 h-4 text-primary-500" />
            <span class="font-medium">{{ store.selectedRepository.value.full_name }}</span>
          </div>

          <!-- Show these options when logged in -->
          <template v-if="user">
            <UDropdown :items="userMenuItems" :pointerEvents="false">
              <UButton color="gray" variant="ghost">
                <div class="flex items-center gap-2">
                  <UAvatar :src="user?.user_metadata?.avatar_url" :alt="user?.user_metadata?.name || user?.email"
                    size="sm" />
                  <span class="text-sm">{{ user?.user_metadata?.name || user?.email }}</span>
                  <Icon name="heroicons:chevron-down" class="w-4 h-4" />
                </div>
              </UButton>
            </UDropdown>

            <!-- GitHub Link Button -->
            <template v-if="!hasGitHubAccess">
              <UButton color="gray" variant="ghost" to="/auth/login" :pointerEvents="false">
                <template #leading>
                  <Icon name="mdi:github" />
                </template>
                Link with GitHub
              </UButton>
            </template>
          </template>

          <!-- Login Button -->
          <template v-else>
            <UButton color="gray" variant="ghost" to="/auth/login">
              Sign In
            </UButton>
          </template>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
defineEmits(['pointerenter', 'focus'])

const user = useSupabaseUser()
const colorMode = useColorMode()
const client = useSupabaseClient()
const config = useRuntimeConfig()
const { data: sessionData } = await client.auth.getSession()
const sessionRef = ref(sessionData?.session)
const store = useAppStore()

// Use runtime URL detection
const getURL = () => {
  // In production, use the configured site URL
  if (process.env.NODE_ENV === 'production') {
    return config.public.siteUrl
  }
  // In development, use the current window location
  if (process.client) {
    const url = window.location.origin
    return url.endsWith('/') ? url : `${url}/`
  }
  // Fallback for SSR
  return 'http://localhost:3000/'
}

// Add a watch effect to ensure user state is in sync
watchEffect(() => {
  if (user.value && !sessionRef.value) {
    client.auth.getSession().then(({ data: { session } }) => {
      sessionRef.value = session
    })
  }
})

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: 'Account Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings',
      pointerEvents: false,
    }
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: async () => {
        await client.auth.signOut()
        navigateTo('/auth/login')
      },
      pointerEvents: false,
    }
  ]
])

// Ensure colorMode is initialized
onMounted(() => {
  if (!colorMode.value) {
    colorMode.preference = 'light'
  }
})

function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function linkWithGitHub() {
  try {
    const { data, error } = await client.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${getURL()}auth/callback`,
        scopes: 'repo',
        queryParams: {
          access_type: 'offline',
          prompt: 'consent'
        }
      }
    })
    if (error) throw error
  } catch (error) {
    console.error('Error linking with GitHub:', error)
  }
}

// Add computed for GitHub access
const hasGitHubAccess = computed(() => {
  return !!sessionRef.value?.provider_token
})

// Keep session in sync
onMounted(() => {
  const { data: { subscription } } = client.auth.onAuthStateChange(async (_event, session) => {
    console.log('Auth state changed:', { event: _event, hasSession: !!session })
    sessionRef.value = session

    // If we have a session but no user, refresh the session
    if (session && !user.value) {
      const { data } = await client.auth.getSession()
      sessionRef.value = data.session
    }
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })
})
</script>

<style scoped>
.router-link:hover {
  @apply bg-zinc-50 dark:bg-zinc-800;
}
</style>
