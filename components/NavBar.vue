<template>
  <nav class="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <div class="flex">
          <!-- Logo -->
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-gray-900 dark:text-white font-semibold">
              Issue Parser
            </NuxtLink>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-3">
          <!-- Theme Toggle -->
          <UButton color="gray" variant="ghost"
            :icon="colorMode.value === 'dark' ? 'i-heroicons-sun' : 'i-heroicons-moon'" @click="toggleDark()" />

          <!-- Show these options when logged in -->
          <template v-if="user">
            <UDropdown :items="userMenuItems">
              <UButton color="gray" variant="ghost">
                <div class="flex items-center gap-2">
                  <UAvatar :src="user?.user_metadata?.avatar_url" :alt="user?.user_metadata?.name || user?.email"
                    size="sm" />
                  <span class="text-sm">{{ user?.user_metadata?.name || user?.email }}</span>
                  <Icon name="heroicons:chevron-down" class="w-4 h-4" />
                </div>
              </UButton>
            </UDropdown>
          </template>

          <!-- Show login button when logged out -->
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
const user = useSupabaseUser()
const colorMode = useColorMode()
const client = useSupabaseClient()

// User menu items
const userMenuItems = computed(() => [
  [
    {
      label: 'Account Settings',
      icon: 'i-heroicons-cog-6-tooth',
      to: '/settings'
    },
    {
      label: 'My Issues',
      icon: 'i-heroicons-clipboard-document-list',
      to: '/issues'
    }
  ],
  [
    {
      label: 'Sign Out',
      icon: 'i-heroicons-arrow-right-on-rectangle',
      click: async () => {
        await client.auth.signOut()
        navigateTo('/auth/login')
      }
    }
  ]
])

// Fix the toggleDark function
function toggleDark() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}
</script>