<template>
  <nav class="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16">
        <!-- Left side -->
        <div class="flex">
          <div class="flex-shrink-0 flex items-center">
            <NuxtLink to="/" class="text-gray-900 dark:text-white font-semibold">
              Issue Builder
            </NuxtLink>
          </div>
        </div>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Subscription Status -->
          <div v-if="loading" class="animate-pulse">
            <div class="h-6 w-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
          </div>

          <template v-else>
            <div v-if="hasActiveSubscription"
              class="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
              <Icon name="heroicons:check-badge" class="w-5 h-5" />
              <span>Lifetime Access</span>
            </div>
            <UButton to="/checkout" color="primary" size="sm" variant="soft">
              Upgrade to Pro
            </UButton>
          </template>

          <!-- User Menu -->
          <UDropdown :items="userMenuItems">
            <UButton color="gray" variant="ghost" class="gap-2">
              <Icon name="heroicons:user-circle" class="w-5 h-5" />
              {{ user?.email || 'Menu' }}
            </UButton>
          </UDropdown>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const supabase = useSupabaseClient()
const user = useSupabaseUser()

const loading = ref(true)
const hasActiveSubscription = ref(false)

// Menu items
const userMenuItems = computed(() => {
  const items = []

  if (user.value) {
    items.push(
      {
        label: 'Sign Out',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        click: () => supabase.auth.signOut()
      }
    )
  } else {
    items.push(
      {
        label: 'Sign In',
        icon: 'i-heroicons-arrow-right-on-rectangle',
        to: '/auth/login'
      }
    )
  }

  return items
})

// Check subscription status
async function checkSubscription() {
  if (!user.value) {
    loading.value = false
    return
  }

  try {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('auth_user_id', user.value.id)
      .single()

    if (userData) {
      const { data: subscription } = await supabase
        .from('subscriptions')
        .select('status')
        .eq('user_id', userData.id)
        .eq('product_id', '1e3099b8-c3f2-47aa-818c-0cef8767b25f')
        .single()

      hasActiveSubscription.value = subscription?.status === 'active'
    }
  } catch (error) {
    console.error('Error checking subscription:', error)
  } finally {
    loading.value = false
  }
}

// Watch for user changes
watch(user, () => {
  checkSubscription()
}, { immediate: true })
</script>