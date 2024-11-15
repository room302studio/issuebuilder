<template>
  <div class="min-h-screen bg-gray-50 dark:bg-gray-900">
    <NavBar />
    <main>
      <slot />
    </main>
  </div>
</template>

<script setup lang="ts">
defineComponent({
  name: 'DefaultLayout'
})
</script>