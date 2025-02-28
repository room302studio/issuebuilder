<template>
  <UModal v-model="isOpen" :ui="{ width: 'md' }">
    <UCard>
      <template #header>
        <div class="flex items-center gap-2">
          <Icon name="heroicons:repository" class="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          <h3 class="text-lg font-medium">Select Repository</h3>
        </div>
      </template>

      <div class="max-h-[60vh] overflow-y-auto space-y-4 py-2">
        <!-- Search input -->
        <div class="relative">
          <UInput v-model="searchQuery" placeholder="Search repositories..." icon="i-heroicons-magnifying-glass">
            <template #trailing>
              <UBadge v-if="filteredRepositories.length" color="gray" size="xs">
                {{ filteredRepositories.length }}
              </UBadge>
            </template>
          </UInput>
        </div>

        <!-- Organization filter -->
        <div v-if="organizations.length > 1" class="flex flex-wrap gap-2">
          <UBadge v-for="org in organizations" :key="org" :color="selectedOrg === org ? 'primary' : 'gray'"
            variant="soft" class="cursor-pointer" @click="selectedOrg = selectedOrg === org ? null : org">
            {{ org }}
          </UBadge>
          <UBadge color="gray" variant="soft" class="cursor-pointer" @click="selectedOrg = null">
            All
          </UBadge>
        </div>

        <p class="text-sm text-zinc-600 dark:text-zinc-400 mb-2">Choose a repository to create issues in:</p>

        <div v-if="filteredRepositories.length === 0" class="p-4 text-center text-zinc-500">
          No repositories found
        </div>

        <button v-for="repo in filteredRepositories" :key="repo.id"
          class="w-full p-3 text-left rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 flex items-center gap-3"
          @click="selectRepo(repo)">
          <Icon name="heroicons:repository" class="w-5 h-5 text-zinc-500" />
          <div class="flex-1">
            <div class="font-medium">{{ repo.full_name }}</div>
            <div v-if="repo.description" class="text-sm text-zinc-500">{{ repo.description }}</div>
          </div>
          <UBadge v-if="repo.private" color="gray" size="xs">Private</UBadge>
        </button>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <UButton color="gray" variant="soft" @click="isOpen = false">
            Cancel
          </UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>

<script setup lang="ts">
const store = useAppStore()
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'select', repo: any): void
}>()

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit('update:modelValue', value)
})

const searchQuery = ref('')
const selectedOrg = ref<string | null>(null)

// Compute list of unique organizations from repositories
const organizations = computed(() => {
  const orgs = new Set<string>()
  store.repositories.value.forEach(repo => {
    const orgName = repo.full_name.split('/')[0]
    orgs.add(orgName)
  })
  return Array.from(orgs)
})

// Filter repositories based on search query and selected organization
const filteredRepositories = computed(() => {
  let repos = store.repositories.value

  // Filter by organization if selected
  if (selectedOrg.value) {
    repos = repos.filter(repo => repo.full_name.startsWith(`${selectedOrg.value}/`))
  }

  // Filter by search query if provided
  if (searchQuery.value.trim()) {
    const query = searchQuery.value.toLowerCase()
    repos = repos.filter(repo => {
      // Search in repo name
      if (repo.full_name.toLowerCase().includes(query)) return true
      // Search in description
      if (repo.description && repo.description.toLowerCase().includes(query)) return true
      return false
    })
  }

  return repos
})

function selectRepo(repo: any) {
  store.selectRepository(repo)
  emit('select', repo)
  isOpen.value = false
}

// Reset search and filters when modal opens
watch(() => props.modelValue, (newValue) => {
  if (newValue) {
    searchQuery.value = ''
    selectedOrg.value = null
  }
})
</script>