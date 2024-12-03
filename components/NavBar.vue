<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-gray-900 dark:text-white font-semibold">
              IssueBuilder.com
            </NuxtLink>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
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
const { data: sessionData } = await client.auth.getSession()
const sessionRef = ref(sessionData?.session)

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
        redirectTo: `${window.location.origin}/auth/callback`,
        scopes: 'repo'
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
  const { data: { subscription } } = client.auth.onAuthStateChange((_event, session) => {
    sessionRef.value = session
  })

  onUnmounted(() => {
    subscription.unsubscribe()
  })
})
</script>

<style scoped>
.router-link:hover {
  @apply bg-gray-50 dark:bg-gray-800;
}
</style>
