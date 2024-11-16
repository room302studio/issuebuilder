<template>
  <div v-if="issues.length"
    class="hidden lg:block sticky top-[5vh] h-fit max-h-[90vh] overflow-y-auto rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
    <div class="mb-3 flex items-center justify-between">
      <h3 class="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
        Issues Overview
      </h3>
      <span class="text-xs text-gray-400 dark:text-gray-500">
        {{ issues.length }} total
      </span>
    </div>

    <ul class="space-y-2">
      <li v-for="(issue, index) in issues" :key="index" class="group">
        <a :href="`#issue-${index}`"
          class="block text-sm py-1.5 px-2 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700/50 text-gray-700 dark:text-gray-300"
          :class="{
            'bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300':
              issue.history?.splitFrom || issue.history?.combinedFrom
          }">
          {{ issue.title }}
        </a>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import type { Issue } from '~/types'

defineProps<{
  issues: Issue[]
}>()
</script>