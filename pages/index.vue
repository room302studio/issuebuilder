<template>
  <ClientOnly>
    <div
      class="relative grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 max-w-6xl mx-auto p-4 md:p-6 pt-[10vh] dark:bg-gray-900">
      <div class="max-w-2xl">
        <h1 class="text-2xl font-bold mb-[8vh] dark:text-white">Document to Issues Parser</h1>

        <div id="intro" class="mb-[8vh] prose dark:prose-invert prose-xl">
          <p>
            I often find myself with a well-defined development plan, and I need to turn it into a bunch of issues in
            GitHub for myself or my team to execute on. This seems like a task that is perfect for the LLMs, so the team
            a
            <a class="text-orange-500 bold" href="https://room302.studio">Room 302 Studio</a> created this tool.
          </p>
        </div>

        <!-- Document Input -->
        <div class="mb-6">
          <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
            Paste your document here
          </label>
          <textarea v-model="documentText"
            class="w-full h-[30vh] p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
            :disabled="isProcessing" placeholder="Paste your document text here..." />
          <div class="mt-2 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <span>{{ characterCount }} characters</span>
            <span>Press <kbd class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">⌘/Ctrl</kbd> + <kbd
                class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">Enter</kbd> to generate</span>
          </div>
        </div>

        <!-- Configuration Section -->
        <div
          class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg space-y-4">
          <!-- API Key Input -->
          <div>
            <div class="flex justify-between items-center mb-2">
              <label class="text-sm font-medium text-gray-600 dark:text-gray-300">
                OpenRouter API Key
              </label>
              <a href="https://openrouter.ai/settings/keys" target="_blank" rel="noopener noreferrer"
                class="text-sm text-blue-500 hover:text-blue-600 dark:text-blue-400 flex items-center gap-1">
                Get your key
                <Icon name="heroicons:arrow-top-right-on-square" class="w-4 h-4" />
              </a>
            </div>
            <div class="relative">
              <UInput v-model="apiKey" :type="showApiKey ? 'text' : 'password'"
                class="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
                placeholder="Enter your API key" />
              <UButton @click="showApiKey = !showApiKey" icon="i-heroicons-eye" color="gray" variant="ghost"
                class="absolute right-2 top-1/2 -translate-y-1/2">
                <!-- <UIcon :name="showApiKey ? 'heroicons:eye-slash' : 'heroicons:eye'" /> -->
              </UButton>
            </div>
          </div>

          <!-- Model Selector -->
          <div>
            <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
              Model
            </label>
            <USelect v-model="selectedModel" :options="modelOptions" option-attribute="name" value-attribute="id"
              :disabled="isProcessing" color="white" variant="outline" size="md" class="w-full" />

            <!-- Model Info -->
            <div v-if="selectedModelInfo" class="mt-2 space-y-2">
              <div class="flex flex-wrap gap-2">
                <span v-if="selectedModelInfo.pricing?.prompt" class="text-xs text-gray-500 dark:text-gray-400">
                  Input: ${{ formatPrice(selectedModelInfo.pricing.prompt) }}/1K tokens
                </span>
                <span v-if="selectedModelInfo.pricing?.completion" class="text-xs text-gray-500 dark:text-gray-400">
                  Output: ${{ formatPrice(selectedModelInfo.pricing.completion) }}/1K tokens
                </span>
                <span v-if="selectedModelInfo.context_length" class="text-xs text-gray-500 dark:text-gray-400">
                  Context: {{ formatNumber(selectedModelInfo.context_length) }} tokens
                </span>
              </div>
              <p class="text-sm text-gray-500 dark:text-gray-400">
                {{ selectedModelInfo.description }}
              </p>
            </div>
            <div v-if="selectedModelInfo && documentText" class="text-xs text-gray-500 dark:text-gray-400 mt-1">
              Estimated cost: ${{ estimatedCost }}
            </div>
          </div>
        </div>

        <!-- Process Button with Cancel -->
        <div class="w-full mb-8">
          <UButton v-if="!isProcessing" @click="processDocument" color="primary" size="xl" block
            class="flex items-center justify-center gap-2">
            <Icon name="heroicons:sparkles" class="w-6 h-6" />
            Generate Issues
          </UButton>
          <UButton v-else @click="cancelGeneration" color="red" size="xl" block
            class="flex items-center justify-center gap-2">
            <Icon name="heroicons:x-circle" class="w-6 h-6" />
            Cancel Generation
          </UButton>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="mb-[8vh] p-6 bg-red-50 text-red-600 rounded-md">
          {{ error.message }}
        </div>

        <!-- Issues Display -->
        <div v-if="store.itemList.value.length || loadingSkeletons.length" class="space-y-[6vh]">
          <!-- Search and header section -->
          <div class="space-y-4">
            <!-- Search input -->
            <div v-if="store.itemList.value.length > 3">
              <input v-model="searchQuery" type="text" placeholder="Search issues..."
                class="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700"
                @keydown.esc="searchQuery = ''" />
            </div>

            <!-- Issues header -->
            <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
              <div>
                <h2 class="text-xl font-semibold dark:text-white">Generated Issues</h2>
                <p class="text-sm text-gray-600 dark:text-gray-400">
                  {{ store.itemList.value.length }} issues ({{ formatCompact(totalWordCount) }} words)
                </p>
              </div>
              <UButton @click="clearAllIssues" color="gray" variant="ghost" size="sm">
                Clear All
              </UButton>
            </div>
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
              <template v-for="(issue, index) in filteredIssues" :key="issue.id || `real-${index}`">
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
                    <div class="p-4 border rounded-md bg-white dark:bg-gray-800 relative overflow-hidden">
                      <div class="space-y-4">
                        <div class="flex items-center gap-2">
                          <!-- Title skeleton/streaming -->
                          <div v-if="!splitIssues[0]?.title" class="h-6 w-2/3">
                            <USkeleton class="h-full w-full" />
                          </div>
                          <h3 v-else class="font-medium text-lg dark:text-white animate-flutter">
                            {{ splitIssues[0].title }}
                          </h3>
                        </div>

                        <!-- Body skeleton/streaming -->
                        <div v-if="!splitIssues[0]?.body" class="space-y-2">
                          <USkeleton class="h-4 w-full" />
                          <USkeleton class="h-4 w-5/6" />
                          <USkeleton class="h-4 w-4/6" />
                        </div>
                        <div v-else class="prose prose-sm max-w-none text-gray-600 dark:text-gray-200 animate-flutter"
                          v-html="renderedBody(splitIssues[0].body)" />
                      </div>
                    </div>

                    <div class="p-4 border rounded-md bg-white dark:bg-gray-800 relative overflow-hidden">
                      <div class="space-y-4">
                        <div class="flex items-center gap-2">
                          <!-- Title skeleton/streaming -->
                          <div v-if="!splitIssues[1]?.title" class="h-6 w-2/3">
                            <USkeleton class="h-full w-full" />
                          </div>
                          <h3 v-else class="font-medium text-lg dark:text-white animate-flutter">
                            {{ splitIssues[1].title }}
                          </h3>
                        </div>

                        <!-- Body skeleton/streaming -->
                        <div v-if="!splitIssues[1]?.body" class="space-y-2">
                          <USkeleton class="h-4 w-full" />
                          <USkeleton class="h-4 w-3/4" />
                          <USkeleton class="h-4 w-2/3" />
                        </div>
                        <div v-else class="prose prose-sm max-w-none text-gray-600 dark:text-gray-200 animate-flutter"
                          v-html="renderedBody(splitIssues[1].body)" />
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Normal issue card -->
                <Issue v-else :issue="issue" :index="index" :has-real-issues="hasRealIssues"
                  @remove="store.removeItem(issue)" @split="handleSplit(issue, index)"
                  @update="handleIssueUpdate(index, $event)" />
              </template>
            </TransitionGroup>
          </div>

          <!-- Generate More UButton -->
          <div v-if="!isProcessing" class="space-y-[6vh] mt-[12vh]">
            <!-- Custom Prompt Input -->
            <div v-if="showCustomPrompt" id="custom-prompt-section" class="p-4 border rounded-md bg-gray-50 max-w-2xl">
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

            <!-- Action UButtons -->
            <div class="flex gap-2 max-w-lg">
              <UButton v-if="!showCustomPrompt" @click="showCustomPrompt = true" color="purple" variant="outline">
                Generate with Custom Prompt...
              </UButton>
              <UButton @click="generateMore" color="primary" variant="outline">
                Generate More Issues...
              </UButton>
            </div>
          </div>

          <!-- Add this right before the GitHub button -->
          <div v-if="store.itemList.value.length"
            class="mt-[12vh] border-t border-gray-200 dark:border-gray-700 pt-8 space-y-4">
            <!-- Export CSV Button -->
            <UButton @click="exportToCSV" color="gray" variant="soft" block
              class="flex items-center justify-center gap-3">
              <Icon name="heroicons:document-arrow-down" class="w-6 h-6" />
              <span class="text-lg font-medium">Export as CSV</span>
            </UButton>

            <!-- Existing GitHub button -->
            <UButton size="2xl" block :disabled="true" color="gray" class="relative overflow-hidden">
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
        </div>


      </div>

      <!-- Table of Contents -->
      <div v-if="store.itemList.value.length"
        class="hidden lg:block sticky top-[5vh] h-fit max-h-[90vh] overflow-y-auto rounded-lg border dark:border-gray-700 bg-white dark:bg-gray-800 p-6">
        <div class="mb-3 flex items-center justify-between">
          <h3 class="font-medium text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Issues Overview
          </h3>
          <span class="text-xs text-gray-400 dark:text-gray-500">
            {{ store.itemList.value.length }} total
          </span>
        </div>

        <ul class="space-y-2">
          <li v-for="(issue, index) in store.itemList.value" :key="index" class="group">
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
    </div>
  </ClientOnly>

  <!-- Add this right before the closing </template> tag -->
  <div class="mt-[12vh] pb-[8vh] text-center">
    <a href="https://room302.studio" target="_blank" rel="noopener noreferrer"
      class="inline-flex items-center gap-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
      <img src="https://room302.studio/room302-logo.svg" alt="Room 302 Studio"
        class="w-16 h-16 opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all" />
      <span class="text-sm font-medium">Built by Room 302 Studio</span>
    </a>
  </div>

  <!-- Add keyboard shortcuts help -->
  <UButton v-if="!showKeyboardShortcuts && store.itemList.value.length > 0" @click="showKeyboardShortcuts = true"
    color="gray" variant="ghost" size="xs" class="fixed bottom-4 right-4" icon="i-heroicons-keyboard">
    Keyboard Shortcuts
  </UButton>

  <UModal v-model="showKeyboardShortcuts">
    <div class="p-4">
      <h3 class="text-lg font-medium mb-4">Keyboard Shortcuts</h3>
      <div class="space-y-2">
        <div class="flex justify-between">
          <kbd class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">⌘/Ctrl + Enter</kbd>
          <span>Generate Issues</span>
        </div>
        <div class="flex justify-between">
          <kbd class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">Esc</kbd>
          <span>Cancel Generation</span>
        </div>
        <div class="flex justify-between">
          <kbd class="px-2 py-0.5 rounded bg-gray-100 dark:bg-gray-700">⌘/Ctrl + K</kbd>
          <span>Focus Search</span>
        </div>
      </div>
    </div>
  </UModal>

  <!-- Add search functionality to issues list -->
  <div v-if="store.itemList.value.length > 3" class="mb-4">
    <input v-model="searchQuery" type="text" placeholder="Search issues..."
      class="w-full p-2 border rounded-md dark:bg-gray-800 dark:border-gray-700" @keydown.esc="searchQuery = ''" />
  </div>

  <!-- Add this near the top of the template -->
  <CommandPalette ref="commandPalette" @generate="processDocument" @generate-more="generateMore"
    @custom-prompt="showCustomPrompt = true" @clear="clearAllIssues" @toggle-theme="toggleTheme"
    @clear-and-paste="clearAndPaste" />
</template>

<script setup lang="ts">
import type { Issue } from '#imports'
import { format } from 'd3'

// Create formatters
const formatNumber = format(',')
const formatCompact = format('.2~s')
const formatPrice = (price: string) => parseFloat(price).toFixed(4)

// Initialize with empty string and make it client-only
const documentText = ref('')  // Start empty, then use onMounted
const apiKey = ref('')       // Start empty, then use onMounted
const store = useAppStore()
const selectedModel = ref('claude-3-sonnet')

// Create stable refs
const loadingSkeletons = shallowRef<number[]>([])
const isProcessing = ref(false)
const commandPalette = ref()
const showApiKey = ref(false)
const showKeyboardShortcuts = ref(false)
const error = ref(null)
const searchQuery = ref('')

// Computed properties
const characterCount = computed(() => {
  const count = documentText.value?.length || 0
  return count >= 1000 ? formatCompact(count) : formatNumber(count)
})

const estimatedCost = computed(() => {
  if (!selectedModelInfo.value?.pricing || !documentText.value) return '0.00'
  const tokenEstimate = documentText.value.length / 4
  const promptCost = (tokenEstimate / 1000) * parseFloat(selectedModelInfo.value.pricing.prompt)
  const completionCost = (tokenEstimate / 1000) * parseFloat(selectedModelInfo.value.pricing.completion)
  return (promptCost + completionCost).toFixed(3)
})

// Load localStorage values after mount
onMounted(() => {
  documentText.value = localStorage.getItem('document-text') || ''
  apiKey.value = localStorage.getItem('openrouter-api-key') || ''

  // Watch for changes to save to localStorage
  watch(documentText, (val) => localStorage.setItem('document-text', val))
  watch(apiKey, (val) => localStorage.setItem('openrouter-api-key', val))
})

// Model configs
const MODEL_CONFIGS = {
  'claude-3-sonnet': {
    name: 'Claude 3 Sonnet',
    description: 'Fast and efficient for most tasks',
    pricing: {
      prompt: '0.0015',
      completion: '0.0015'
    },
    context_length: 200000
  }
}

// Computed properties
const modelOptions = computed(() =>
  Object.entries(MODEL_CONFIGS).map(([id, config]) => ({
    id,
    name: config.name
  }))
)

const selectedModelInfo = computed(() => MODEL_CONFIGS[selectedModel.value])

// Functions
async function processDocument() {
  // Your existing process logic
  console.log('Processing document...')
}

function generateMore() {
  // Your generate more logic
  console.log('Generating more...')
}

function clearAllIssues() {
  store.itemList.value = []
  loadingSkeletons.value = []
}

function toggleTheme() {
  // Your theme toggle logic
  console.log('Toggling theme...')
}

function clearAndPaste() {
  // Your clear and paste logic
  console.log('Clearing and pasting...')
}
</script>

<style>
/* Clean, simple transitions */
.issue-enter-active,
.issue-leave-active {
  transition: all 0.3s ease;
}

.issue-enter-from,
.issue-leave-to {
  opacity: 0;
  transform: translateY(30px);
}

.issue-move {
  transition: transform 0.5s ease;
}

/* Ensure proper stacking during transitions */
.issue-leave-active {
  position: absolute;
  width: 100%;
}

/* Add a pixel-art style font for the game-like text */
@font-face {
  font-family: 'Press Start 2P';
  src: url('https://fonts.googleapis.com/css2?family=Press+Start+2P&display=swap');
}

.font-game {
  font-family: 'Press Start 2P', system-ui, -apple-system, sans-serif;
  font-size: 0.8em;
  letter-spacing: 0.1em;
}

/* Update transitions for more game-like feel */
.issue-enter-active {
  animation: issue-pop-in 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.issue-leave-active {
  animation: issue-pop-out 0.3s cubic-bezier(0.47, 0, 0.745, 0.715);
}

@keyframes issue-pop-in {
  0% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }

  50% {
    transform: scale(1.05) translateY(-5px);
  }

  100% {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

@keyframes issue-pop-out {
  0% {
    opacity: 1;
    transform: scale(1);
  }

  100% {
    opacity: 0;
    transform: scale(0.8) translateY(20px);
  }
}

/* Add staggered fade-in animation for skeletons */
@keyframes skeleton-fade-in {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

[key^="skeleton-"] {
  animation: skeleton-fade-in 0.6s cubic-bezier(0.23, 1, 0.32, 1) backwards;
}

[key="skeleton-0"] {
  animation-delay: 0s;
}

[key="skeleton-1"] {
  animation-delay: 0.1s;
}

[key="skeleton-2"] {
  animation-delay: 0.2s;
}

/* Ensure the page has a min-height and the footer stays at bottom */
#app {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.page-wrapper {
  flex: 1;
  padding-bottom: env(safe-area-inset-bottom);
}

/* Add these prose overrides */
.prose {
  @apply text-gray-600 dark:text-gray-200;
}

.prose ul {
  @apply text-gray-600 dark:text-gray-200;
}

.prose ul li {
  @apply text-gray-600 dark:text-gray-200;
}

.prose ul li::marker {
  @apply text-gray-400 dark:text-gray-400;
}

.prose p {
  @apply text-gray-600 dark:text-gray-200;
}

.prose code {
  @apply bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200;
}
</style>