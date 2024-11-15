<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
</template>

<script setup>
useHead({
  title: 'IssueBuilder - AI-Powered GitHub Issue Generator',
  titleTemplate: '%s | IssueBuilder',
  meta: [
    { name: 'description', content: 'Transform your documentation into well-structured GitHub issues using AI. Automatically generate, refine, and manage issues with our intelligent issue parser.' },
    // Keywords
    { name: 'keywords', content: 'GitHub issues, AI issue generator, documentation parser, project management, issue tracking, agile development, software development tools' },
    // Theme color for browsers
    { name: 'theme-color', content: '#8B5CF6' },
    { name: 'application-name', content: 'IssueBuilder' }
  ]
})
</script>

<style>
/* use Figtree font for everything */
body {
  font-family: 'Figtree', sans-serif;
}
</style>
