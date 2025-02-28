<template>
  <div id="app">
    <NuxtLayout name="default">
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
useHead({
  title: 'IssueBuilder - AI-Powered GitHub Issue Generator',
  titleTemplate: '%s | IssueBuilder',
  meta: [
    { name: 'description', content: 'Transform your documentation into well-structured GitHub issues using AI. Automatically generate, refine, and manage issues with our intelligent issue parser.' },
    { name: 'keywords', content: 'GitHub issues, AI issue generator, documentation parser, project management, issue tracking, agile development, software development tools' },
    { name: 'theme-color', content: '#8B5CF6' },
    { name: 'application-name', content: 'IssueBuilder' }
  ],
  link: [
    {
      rel: 'preload',
      href: 'https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.000/fonts/webfonts/MonaspaceRadon-Regular.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    },
    {
      rel: 'preload',
      href: 'https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.000/fonts/webfonts/MonaspaceKrypton-Regular.woff2',
      as: 'font',
      type: 'font/woff2',
      crossorigin: 'anonymous'
    }
  ]
})
</script>

<style>
@font-face {
  font-family: 'Monaspace Radon';
  src: url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.000/fonts/webfonts/MonaspaceRadon-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

@font-face {
  font-family: 'Monaspace Krypton';
  src: url('https://cdn.jsdelivr.net/gh/githubnext/monaspace@v1.000/fonts/webfonts/MonaspaceKrypton-Regular.woff2') format('woff2');
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}

body {
  font-family: 'Figtree', sans-serif;
}

#app {
  min-height: 100vh;
}

/* RADON: Headlines and code */
h1,
h2,
h3,
h4,
h5,
h6,
.text-2xl,
.text-3xl,
.text-4xl,
.text-5xl,
.text-6xl,
.text-7xl,
.font-mono,
code,
pre {
  font-family: 'Monaspace Radon', monospace !important;
}

/* KRYPTON: Small text */
.text-xs,
.text-sm,
.text-base,
.text-lg,
.text-zinc-400,
.text-zinc-500,
.font-krypton {
  font-family: 'Monaspace Krypton', monospace !important;
}
</style>
