<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4">
    <UCard>
      <div class="text-center">
        <h3 class="text-lg font-medium mb-2">
          Welcome back!
        </h3>
        <p class="text-sm text-gray-500">
          Redirecting you to the dashboard...
        </p>
        <div class="mt-4">
          <UProgress animation="carousel" />
        </div>
      </div>
    </UCard>
  </div>
</template>

<script setup lang="ts">
// Simple timeout to allow auth state to settle, then redirect
onMounted(() => {
  setTimeout(() => {
    navigateTo('/')
  }, 1500)
})
</script>