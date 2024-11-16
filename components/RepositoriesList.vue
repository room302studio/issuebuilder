<template>
  <div>
    <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
      Select Repository
    </label>
    <select v-model="selectedRepository" class="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md" @change="updateSelectedRepository">
      <option v-for="repo in repositories" :key="repo.id" :value="repo">
        {{ repo.name }}
      </option>
    </select>
  </div>
</template>

<script setup lang="ts">
import { useAppStore } from '~/composables/appStore'

const store = useAppStore()
const repositories = store.repositories
const selectedRepository = store.selectedRepository

function updateSelectedRepository(event: Event) {
  const selectedRepo = (event.target as HTMLSelectElement).value
  store.setSelectedRepository(selectedRepo)
}
</script>
