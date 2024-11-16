<template>
  <div v-if="store.itemList.value.length || loadingSkeletons.length" class="space-y-[6vh]">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mb-4">
      <div>
        <h2 class="text-xl font-semibold dark:text-white">Generated Issues</h2>
        <p class="text-sm text-gray-600 dark:text-gray-400">Total: {{ store.itemList.value.length }}</p>
      </div>
      <UButton @click="clearAllIssues" color="gray" variant="ghost" size="sm">
        Clear All
      </UButton>
    </div>

    <!-- Issue Cards -->
    <div class="space-y-[4vh]">
      <TransitionGroup name="issue" tag="div" class="space-y-[4vh]">
        <!-- Loading skeletons - Only show if no real issues exist -->
        <div v-if="!hasRealIssues" v-for="(_, index) in loadingSkeletons" :key="`skeleton-${index}`"
          class="p-4 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700">
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <USkeleton class="h-6 w-2/3" />
              <div class="flex gap-2 opacity-50">
                <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
                <div class="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded" />
              </div>
            </div>
            <div class="space-y-2">
              <USkeleton class="h-4 w-full" />
              <USkeleton class="h-4 w-5/6" />
              <USkeleton class="h-4 w-4/6" />
            </div>
          </div>
        </div>

        <!-- Real issues -->
        <template v-for="(issue, index) in displayedIssues" :key="issue.id || `real-${index}`">
          <!-- Original issue card with splitting animation -->
          <div v-if="combiningIndices.includes(index)" class="space-y-4">
            <!-- Keep original card but add splitting effect -->
            <div class="relative">
              <Issue :issue="issue" :index="index" class="opacity-50" />
              <div class="absolute inset-0 flex items-center justify-center">
                <div class="bg-purple-50/80 dark:bg-purple-900/80 backdrop-blur-sm rounded-md px-4 py-2">
                  <Icon name="material-symbols-light:arrow-split-rounded"
                    class="w-8 h-8 text-purple-400 animate-bounce" />
                  <p class="text-purple-600 dark:text-purple-300 font-medium font-game text-center">
                    Splitting...
                  </p>
                </div>
              </div>
            </div>

            <!-- Skeleton/streaming placeholders for new issues -->
            <div class="space-y-4">
              <div v-for="(splitIssue, splitIndex) in splitIssues" :key="`split-${splitIndex}`"
                class="p-4 border rounded-md bg-white dark:bg-gray-800 relative overflow-hidden">
                <div class="space-y-4">
                  <div class="flex items-center gap-2">
                    <!-- Title skeleton/streaming -->
                    <div v-if="!splitIssue.title" class="h-6 w-2/3">
                      <USkeleton class="h-full w-full" />
                    </div>
                    <h3 v-else class="font-medium text-lg dark:text-white animate-flutter">
                      {{ splitIssue.title }}
                    </h3>
                  </div>

                  <!-- Body skeleton/streaming -->
                  <div v-if="!splitIssue.body" class="space-y-2">
                    <USkeleton class="h-4 w-full" />
                    <USkeleton class="h-4 w-5/6" />
                    <USkeleton class="h-4 w-4/6" />
                  </div>
                  <div v-else class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 animate-flutter"
                    v-html="renderedBody(splitIssue.body)" />
                </div>
              </div>
            </div>
          </div>

          <!-- Normal issue card -->
          <Issue v-else :issue="issue" :index="index" :has-real-issues="hasRealIssues" @remove="store.removeItem(issue)"
            @split="handleSplit(issue, index)" />
        </template>
      </TransitionGroup>
    </div>

    <!-- Generate More Section -->
    <div v-if="!isProcessing" class="space-y-[6vh] mt-[12vh]">
      <!-- Custom Prompt Input -->
      <div v-if="showCustomPrompt" class="p-4 border rounded-md bg-gray-50 max-w-2xl">
        <div class="flex justify-between items-center mb-2">
          <label class="text-sm font-medium text-gray-700">Custom Generation Prompt</label>
          <UButton @click="showCustomPrompt = false" color="gray" variant="ghost" icon="i-heroicons-x-mark">
            <Icon name="heroicons:x-mark" />
          </UButton>
        </div>
        <textarea v-model="customPrompt" class="w-full h-24 p-2 border rounded-md mb-2 text-sm"
          placeholder="E.g.: Focus on performance issues, or Generate issues related to accessibility..." />
        <UButton @click="generateMoreWithPrompt" :disabled="!customPrompt.trim()" color="purple">
          Generate Issues with Prompt
        </UButton>
      </div>

      <!-- Action Buttons -->
      <div class="flex gap-2 max-w-lg">
        <UButton v-if="!showCustomPrompt" @click="showCustomPrompt = true" color="purple" variant="outline">
          Generate with Custom Prompt...
        </UButton>
        <UButton @click="$emit('generate-more')" color="primary" variant="outline">
          Generate More Issues...
        </UButton>
      </div>
    </div>

    <!-- GitHub Export Button -->
    <div v-if="store.itemList.value.length" class="mt-[12vh] border-t border-gray-200 dark:border-gray-700 pt-8">
      <UButton size="lg" block :disabled="true" color="gray" class="relative overflow-hidden">
        <div class="flex items-center justify-center gap-3">
          <Icon name="simple-icons:github" class="w-8 h-8" />
          <span class="text-lg font-medium">Send to GitHub Repository</span>
        </div>
        <div class="absolute inset-0 bg-gray-900/10 dark:bg-gray-100/10 flex items-center justify-center">
          <div class="px-3 py-1 bg-gray-900/90 dark:bg-gray-100/90 rounded-full">
            <span class="text-xs font-medium text-white dark:text-gray-900">Coming Soon</span>
          </div>
        </div>
      </UButton>
    </div>

    <div v-if="store.githubToken" class="mt-8">
      <RepositorySelector />
    </div>
  </div>
</template>

<script setup lang="ts">
import { marked } from 'marked'
import DOMPurify from 'isomorphic-dompurify'
import type { Issue } from '~/types'

const store = useAppStore()
const toast = useToast()

const props = defineProps<{
  isProcessing: boolean
  loadingSkeletons: number[]
}>()

const emit = defineEmits<{
  'generate-more': []
}>()

// State
const showCustomPrompt = ref(false)
const customPrompt = ref('')
const combiningIndices = ref<number[]>([])
const splitIssues = ref<Partial<Issue>[]>([{}, {}])

// Computed
const displayedIssues = computed(() => {
  return store.itemList.value.filter((issue: Issue) => !issue.skeleton)
})

const hasRealIssues = computed(() => {
  return displayedIssues.value.length > 0
})

// Methods
function clearAllIssues() {
  store.itemList.value = []
  combiningIndices.value = []
  splitIssues.value = [{}, {}]
}

async function handleSplit(issue: Issue, index: number) {
  // Implementation remains the same as in index.vue
  // ... (copy the handleSplit implementation from index.vue)
}

function renderedBody(text: string) {
  return DOMPurify.sanitize(marked.parse(text, { async: false }))
}

async function generateMoreWithPrompt() {
  // Implementation remains the same as in index.vue
  // ... (copy the generateMoreWithPrompt implementation from index.vue)
}
</script>

<style scoped>
.animate-flutter {
  animation: flutter 0.5s ease-out;
}

@keyframes flutter {
  0% {
    opacity: 0;
    transform: translateY(10px);
  }

  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>