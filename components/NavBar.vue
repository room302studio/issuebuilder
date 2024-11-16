<template>
  <nav class="border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="font-semibold flex items-center gap-2 group">
          <UIcon name="i-heroicons-code-bracket-square-20-solid"
            class="w-6 h-6 text-purple-500 group-hover:text-purple-600 transition-colors" />
          Issue Builder
        </NuxtLink>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Subscription Status -->
          <USkeleton v-if="loading" class="h-6 w-24" />

          <template v-else>
            <div v-if="hasActiveSubscription" class="text-sm text-green-500 flex items-center gap-2">
              <UIcon name="i-heroicons-star-20-solid" class="w-5 h-5" />
              <span>Lifetime Access</span>
            </div>
            <UButton v-else to="/checkout" color="primary" variant="soft" size="sm">
              <template #leading>
                <UIcon name="i-heroicons-sparkles-20-solid" />
              </template>
              Upgrade
            </UButton>
          </template>

          <!-- User Menu -->
          <UDropdown v-if="user" :items="menuItems" :popper="{ placement: 'bottom-end' }">
            <UButton color="white" class="flex items-center gap-2">
              <template #leading>
                <UAvatar v-if="user.user_metadata?.avatar_url" :src="user.user_metadata.avatar_url" :alt="user.email"
                  size="sm" />
                <UIcon v-else name="i-heroicons-user-circle-20-solid" class="w-5 h-5" />
              </template>
              {{ user.email }}
              <template #trailing>
                <UIcon name="i-heroicons-chevron-down-20-solid" class="w-4 h-4" />
              </template>
            </UButton>
          </UDropdown>

          <UButton v-else to="/auth/login" color="gray" variant="ghost">
            <template #leading>
              <UIcon name="i-heroicons-arrow-right-on-rectangle-20-solid" />
            </template>
            Sign In
          </UButton>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
const user = useSupabaseUser()
const supabase = useSupabaseClient()

const loading = ref(true)
const hasActiveSubscription = ref(false)

// Menu items grouped as per Nuxt UI docs
const menuItems = computed(() => [
  [{
    label: user.value?.email,
    icon: 'i-heroicons-user-20-solid',
    avatar: user.value?.user_metadata?.avatar_url ? {
      src: user.value.user_metadata.avatar_url
    } : undefined
  }],
  [{
    label: 'Account Settings',
    icon: 'i-heroicons-cog-6-tooth-20-solid',
    disabled: true
  }],
  [{
    label: 'Documentation',
    icon: 'i-heroicons-book-open-20-solid',
    disabled: true
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-left-on-rectangle-20-solid',
    class: 'text-red-500 dark:text-red-400',
    click: async () => {
      await supabase.auth.signOut()
      navigateTo('/auth/login')
    }
  }]
])

// Check subscription status
const checkSubscription = async () => {
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

watch(user, checkSubscription, { immediate: true })
</script>