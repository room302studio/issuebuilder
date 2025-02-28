<template>
  <div class="min-h-screen bg-zinc-50 dark:bg-zinc-900">
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