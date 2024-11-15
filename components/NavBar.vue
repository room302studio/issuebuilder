<template>
  <nav class="border-b border-gray-200 dark:border-gray-800">
    <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between h-16 items-center">
        <!-- Logo -->
        <NuxtLink to="/" class="font-semibold">
          Issue Builder
        </NuxtLink>

        <!-- Right side -->
        <div class="flex items-center gap-4">
          <!-- Subscription Status -->
          <USkeleton v-if="loading" class="h-6 w-24" />

          <template v-else>
            <div v-if="hasActiveSubscription" class="text-sm text-green-500">
              <span>Lifetime Access</span>
            </div>
            <UButton v-else to="/checkout" color="primary" variant="soft" size="sm">
              Upgrade
            </UButton>
          </template>

          <!-- User Menu -->
          <UDropdown v-if="user" :items="menuItems" :popper="{ placement: 'bottom-end' }">
            <UButton color="white" trailing-icon="i-heroicons-chevron-down-20-solid">
              {{ user.email }}
            </UButton>
          </UDropdown>

          <UButton v-else to="/auth/login" color="gray" variant="ghost">
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
    avatar: user.value?.user_metadata?.avatar_url ? {
      src: user.value.user_metadata.avatar_url
    } : undefined
  }],
  [{
    label: 'Sign Out',
    icon: 'i-heroicons-arrow-right-on-rectangle-20-solid',
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