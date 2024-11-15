<template>
  <div id="app">
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// Force default layout
definePageMeta({
  layout: 'default'
})

useHead({
  title: 'IssueBuilder - AI-Powered GitHub Issue Generator',
  titleTemplate: '%s | IssueBuilder',
  meta: [
    { name: 'description', content: 'Transform your documentation into well-structured GitHub issues using AI. Automatically generate, refine, and manage issues with our intelligent issue parser.' },
    { name: 'keywords', content: 'GitHub issues, AI issue generator, documentation parser, project management, issue tracking, agile development, software development tools' },
    { name: 'theme-color', content: '#8B5CF6' },
    { name: 'application-name', content: 'IssueBuilder' }
  ]
})
</script>

<style>
body {
  font-family: 'Figtree', sans-serif;
}

#app {
  min-height: 100vh;
}
</style>
