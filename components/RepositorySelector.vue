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
      <!-- Recently Updated Section -->
      <template v-if="recentlyUpdatedRepos.length">
        <div class="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2 py-1">
          Recently Updated
        </div>
        <URadio v-for="repo in recentlyUpdatedRepos" :key="repo.id" v-model="selectedRepo" :value="repo"
          :label="repo.full_name" name="repository"
          class="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer bg-purple-50/50 dark:bg-purple-900/20 border-purple-100 dark:border-purple-800">
          <template #description>
            <div class="flex items-center gap-2 text-sm">
              <span class="text-purple-600 dark:text-purple-400">Updated {{ formatDate(repo.updated_at) }}</span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-500 dark:text-gray-400">{{ repo.visibility }}</span>
              <span class="text-gray-400">•</span>
              <span class="text-gray-500 dark:text-gray-400">{{ repo.open_issues_count }} issues</span>
            </div>
          </template>
        </URadio>
      </template>

      <!-- Other Repositories Section -->
      <template v-if="otherRepos.length">
        <div class="text-xs uppercase text-gray-500 dark:text-gray-400 font-medium px-2 py-1 mt-4">
          Other Repositories
        </div>
        <URadio v-for="repo in otherRepos" :key="repo.id" v-model="selectedRepo" :value="repo" :label="repo.full_name"
          name="repository" class="p-3 border rounded-md hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer">
          <template #description>
            <div class="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <span>{{ formatDate(repo.updated_at) }}</span>
              <span>•</span>
              <span>{{ repo.visibility }}</span>
              <span>•</span>
              <span>{{ repo.open_issues_count }} issues</span>
            </div>
          </template>
        </URadio>
      </template>
    </div>

    <div v-else class="text-gray-500 dark:text-gray-400 text-center py-4">
      {{ repositories.length ? 'No matching repositories' : 'No repositories found' }}
    </div>

    <!-- Export Button -->
    <UButton v-if="!isExporting" :disabled="!selectedRepo" color="primary" class="w-full" @click="confirmExport">
      <div class="flex items-center justify-center gap-2">
        <Icon name="simple-icons:github" class="w-5 h-5" />
        <span>Export {{ store.itemList.value.length }} Issues to {{ selectedRepo?.full_name || 'Repository' }}</span>
      </div>
    </UButton>

    <!-- Export Progress -->
    <div v-else class="space-y-4">
      <div class="flex items-center justify-between text-sm">
        <span>Exporting issues...</span>
        <span>{{ exportedCount }} / {{ store.itemList.value.length }}</span>
      </div>
      <UProgress :value="(exportedCount / store.itemList.value.length) * 100" color="gray" />
    </div>

    <!-- Confirmation Modal -->
    <UModal v-model="showConfirmation">
      <div class="p-4 space-y-4">
        <h3 class="text-lg font-medium">Confirm Export</h3>
        <p>This will create {{ store.itemList.value.length }} new issues in:</p>
        <div class="p-3 bg-gray-50 dark:bg-gray-800 rounded-md">
          <div class="font-medium">{{ selectedRepo?.full_name }}</div>
          <div class="text-sm text-gray-500">{{ selectedRepo?.visibility }} repository</div>
        </div>
        <div class="flex justify-end gap-2 mt-4">
          <UButton color="gray" variant="ghost" @click="showConfirmation = false">
            Cancel
          </UButton>
          <UButton color="primary" @click="exportIssues">
            Create Issues
          </UButton>
        </div>
      </div>
    </UModal>
  </div>
</template>

<script setup lang="ts">
interface Repository {
  id: number
  full_name: string
  visibility: string
  default_branch: string
  open_issues_count: number
  updated_at: string
  owner: {
    login: string
  }
}

const store = useAppStore()
const supabase = useSupabaseClient()
const { fetchUserRepos } = useAuth()
const loading = ref(true)
const error = ref('')
const repositories = ref<Repository[]>([])
const selectedRepo = ref<Repository | null>(null)
const searchQuery = ref('')
const showConfirmation = ref(false)
const isExporting = ref(false)
const exportedCount = ref(0)

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

// Computed properties for repository sections
const recentlyUpdatedRepos = computed(() => {
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  return filteredRepositories.value.filter(repo =>
    new Date(repo.updated_at) > oneDayAgo
  )
})

const otherRepos = computed(() => {
  const oneDayAgo = new Date()
  oneDayAgo.setDate(oneDayAgo.getDate() - 1)

  return filteredRepositories.value.filter(repo =>
    new Date(repo.updated_at) <= oneDayAgo
  )
})

// Format date helper
function formatDate(dateString: string) {
  const date = new Date(dateString)
  const now = new Date()
  const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

  if (diffInHours < 1) {
    const minutes = Math.floor(diffInHours * 60)
    return `${minutes}m ago`
  } else if (diffInHours < 24) {
    const hours = Math.floor(diffInHours)
    return `${hours}h ago`
  } else if (diffInHours < 48) {
    return 'yesterday'
  } else {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date)
  }
}

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

async function confirmExport() {
  showConfirmation.value = true
}

async function exportIssues() {
  if (!selectedRepo.value || !store.itemList.value.length) return

  showConfirmation.value = false
  isExporting.value = true
  exportedCount.value = 0

  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.provider_token

  if (!token) {
    error.value = 'Authentication required'
    return
  }

  const [owner, repo] = selectedRepo.value.full_name.split('/')

  for (const issue of store.itemList.value) {
    try {
      await $fetch(`https://api.github.com/repos/${owner}/${repo}/issues`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/vnd.github.v3+json',
        },
        body: {
          title: issue.title,
          body: `${issue.body}\n\n---\n*Created with [IssueBuilder](https://issuebuilder.com)*`
        }
      })
      exportedCount.value++
    } catch (err) {
      console.error('Error creating issue:', err)
      // Continue with other issues even if one fails
    }
  }

  // Show success message
  const toast = useToast()
  toast.add({
    title: 'Export Complete',
    description: `Successfully created ${exportedCount.value} issues in ${selectedRepo.value.full_name}`,
    icon: 'i-heroicons-check-circle',
  })

  isExporting.value = false
}
</script>

<style scoped>
.max-h-[50vh] {
  scrollbar-width: thin;
  scrollbar-color: theme('colors.gray.300') theme('colors.gray.100');
}

.max-h-[50vh]::-webkit-scrollbar {
  width: 8px;
}

.max-h-[50vh]::-webkit-scrollbar-track {
  background: theme('colors.gray.100');
  border-radius: 4px;
}

.max-h-[50vh]::-webkit-scrollbar-thumb {
  background-color: theme('colors.gray.300');
  border-radius: 4px;
}

.dark .max-h-[50vh] {
  scrollbar-color: theme('colors.gray.600') theme('colors.gray.800');
}

.dark .max-h-[50vh]::-webkit-scrollbar-track {
  background: theme('colors.gray.800');
}

.dark .max-h-[50vh]::-webkit-scrollbar-thumb {
  background-color: theme('colors.gray.600');
}
</style>