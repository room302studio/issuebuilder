<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex items-center gap-4">
          <!-- Logo -->
          <NuxtLink to="/" class="text-gray-900 dark:text-white font-semibold">
            IssueBuilder.com
          </NuxtLink>

          <!-- Project selector (when logged in and has a current project) -->
          <div v-if="user && store.currentProject" class="hidden md:flex items-center">
            <UButton
              variant="ghost"
              class="flex items-center gap-2 max-w-[200px] truncate"
              @click="showProjectList = true"
            >
              <Icon name="heroicons:folder" class="w-5 h-5 flex-shrink-0" />
              <span class="truncate">{{ store.currentProject.value?.name }}</span>
              <Icon name="heroicons:chevron-down" class="w-4 h-4 flex-shrink-0" />
            </UButton>
          </div>
        </div>

        <!-- Center navigation -->
        <div class="hidden md:flex items-center gap-4">
          <UButton
            v-if="user"
            variant="ghost"
            @click="showProjectList = true"
            class="flex items-center gap-2"
          >
            <Icon name="heroicons:folder" class="w-5 h-5" />
            Projects
          </UButton>
          <UButton
            v-if="user"
            variant="ghost"
            :to="'/settings'"
            class="flex items-center gap-2"
          >
            <Icon name="heroicons:cog-6-tooth" class="w-5 h-5" />
            Settings
          </UButton>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Show these options when logged in -->
          <template v-if="user">
            <!-- GitHub Link Button -->
            <template v-if="!hasGitHubAccess">
              <UButton color="gray" variant="ghost" @click="linkWithGitHub">
                <template #leading>
                  <Icon name="mdi:github" />
                </template>
                Link with GitHub
              </UButton>
            </template>

            <!-- User Menu -->
            <UDropdown :items="userMenuItems" :pointerEvents="false">
              <UButton color="gray" variant="ghost">
                <div class="flex items-center gap-2">
                  <UAvatar 
                    :src="user?.user_metadata?.avatar_url" 
                    :alt="user?.user_metadata?.name || user?.email"
                    size="sm" 
                  />
                  <span class="text-sm hidden sm:inline">
                    {{ user?.user_metadata?.name || user?.email }}
                  </span>
                  <Icon name="heroicons:chevron-down" class="w-4 h-4" />
                </div>
              </UButton>
            </UDropdown>
          </template>

          <!-- Login Button -->
          <template v-else>
            <UButton color="gray" variant="ghost" to="/auth/login">
              Sign In
            </UButton>
          </template>

          <!-- Theme Toggle -->
          <UButton
            color="gray"
            variant="ghost"
            icon="i-heroicons-moon"
            :class="{ 'i-heroicons-sun': colorMode.value === 'dark' }"
            @click="toggleDark"
          />
        </div>
      </div>
    </div>
  </nav>

  <!-- Project Manager Modal -->
  <ProjectManager 
    v-if="user" 
    v-model="showProjectList" 
    @project-selected="handleProjectSelected"
  />
</template>

<script setup lang="ts">
import { useFeatureFlags } from '~/composables/useFeatureFlags'

// Core functionality
const user = useSupabaseUser()
const store = useAppStore()
const colorMode = useColorMode()
const client = useSupabaseClient()
const { data: sessionData } = await client.auth.getSession()
const sessionRef = ref(sessionData?.session)

// Feature flags
const { experimentalFeatures: experimental } = useFeatureFlags()

// State
const showProjectList = ref(false)

// User menu items with proper typing
const userMenuItems = computed(() => [
  [
    {
      label: 'Projects',
      icon: 'i-heroicons-folder',
      click: () => showProjectList.value = true,
      pointerEvents: false
    },
    {
      label: 'Account Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings',
      pointerEvents: false
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
      pointerEvents: false
    }
  ]
])

// Methods
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function linkWithGitHub() {
  try {
    const { error } = await client.auth.signInWithOAuth({
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

function handleProjectSelected() {
  showProjectList.value = false
}

// Computed
const hasGitHubAccess = computed(() => {
  return !!sessionRef.value?.provider_token
})

// Lifecycle
onMounted(() => {
  // Initialize color mode
  if (!colorMode.value) {
    colorMode.preference = 'light'
  }

  // Keep session in sync
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
