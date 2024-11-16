<template>
  <div class="space-y-4">
    <h3 class="text-lg font-medium">Export Issues To Repository</h3>

    <!-- Search box -->
    <div v-if="repositories.length > 5" class="relative">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Icon name="heroicons:magnifying-glass" class="h-5 w-5 text-gray-400" />
      </div>
      <UInput v-model="searchQuery" placeholder="Search repositories..." class="pl-10" size="sm" />
    </div>

    <div v-if="loading" class="animate-pulse space-y-3">
      <div v-for="i in 3" :key="i" class="h-12 bg-gray-100 dark:bg-gray-800 rounded-md"></div>
    </div>

    <div v-else-if="error" class="text-red-500">
      {{ error }}
    </div>

    <div v-else-if="filteredRepositories.length" class="space-y-2 max-h-[50vh] overflow-y-auto">
      <URadio v-for="repo in filteredRepositories" :key="repo.id" v-model="selectedRepo" :value="repo"
        :label="repo.full_name" name="repository"
        class="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
        <template #description>
          <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <span>{{ repo.visibility }}</span>
            <span>•</span>
            <span>{{ repo.default_branch }}</span>
            <span>•</span>
            <span>{{ repo.open_issues_count }} issues</span>
          </div>
        </template>
      </URadio>
    </div>

    <div v-else class="text-gray-500 dark:text-gray-400 text-center py-4">
      {{ repositories.length ? 'No matching repositories' : 'No repositories found' }}
    </div>

    <UButton :disabled="!selectedRepo" color="gray" class="w-full relative overflow-hidden">
      <div class="flex items-center justify-center gap-2">
        <Icon name="simple-icons:github" class="w-5 h-5" />
        <span>Export to {{ selectedRepo?.full_name || 'Repository' }}</span>
      </div>
      <!-- Coming soon overlay -->
      <div class="absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 flex items-center justify-center">
        <div class="px-3 py-1 bg-gray-900/90 dark:bg-gray-100/90 rounded-full">
          <span class="text-xs font-medium text-white dark:text-gray-900">Coming Soon</span>
        </div>
      </div>
    </UButton>
  </div>
</template>

<script setup lang="ts">
interface Repository {
  id: number
  full_name: string
  visibility: string
  default_branch: string
  open_issues_count: number
}

const { fetchUserRepos } = useAuth()
const loading = ref(true)
const error = ref('')
const repositories = ref<Repository[]>([])
const selectedRepo = ref<Repository | null>(null)
const searchQuery = ref('')

// Fuzzy search repositories
const filteredRepositories = computed(() => {
  if (!searchQuery.value) return repositories.value

  const query = searchQuery.value.toLowerCase()
  return repositories.value.filter(repo => {
    const fullName = repo.full_name.toLowerCase()
    // Simple fuzzy search - checks if characters appear in order
    let searchIndex = 0
    for (const char of query) {
      searchIndex = fullName.indexOf(char, searchIndex)
      if (searchIndex === -1) return false
      searchIndex += 1
    }
    return true
  })
})

onMounted(async () => {
  try {
    loading.value = true
    repositories.value = await fetchUserRepos()
    // Sort repositories by last updated
    repositories.value.sort((a, b) =>
      new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
    )
  } catch (err: any) {
    error.value = err.message || 'Failed to load repositories'
  } finally {
    loading.value = false
  }
})
</script>