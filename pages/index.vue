<template>
  <div
    class="relative grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 max-w-6xl mx-auto p-4 md:p-6 pt-[10vh] dark:bg-gray-900">
    <div class="max-w-2xl">
      <h1 class="text-2xl font-bold mb-[8vh] dark:text-white">Document to Issues Parser</h1>

      <!-- Document Input -->
      <div class="mb-6">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-4">
          Paste your document here
        </label>
        <textarea v-model="documentText"
          class="w-full h-[30vh] p-3 border rounded-md bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-white"
          :disabled="isProcessing" placeholder="Paste your document text here..." />
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
            <input v-model="apiKey" :type="showApiKey ? 'text' : 'password'"
              class="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
              placeholder="Enter your API key" />
            <UButton @click="showApiKey = !showApiKey" icon="i-heroicons-eye" color="gray" variant="ghost"
              class="absolute right-2 top-1/2 -translate-y-1/2">
              <UIcon :name="showApiKey ? 'heroicons:eye-slash' : 'heroicons:eye'" />
            </UButton>
          </div>
        </div>

        <!-- Model Selector -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Model
          </label>
          <select v-model="selectedModel"
            class="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md"
            :disabled="isProcessing">
            <option v-for="[id, config] in Object.entries(MODEL_CONFIGS)" :key="id" :value="id">
              {{ config.name }}
            </option>
          </select>

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
        </div>
      </div>

      <!-- Process Button with Cancel -->
      <div class="w-full mb-8">
        <UButton v-if="!isProcessing" @click="processDocument" :disabled="!documentText || !apiKey" color="primary"
          size="xl" block class="flex items-center justify-center gap-2">
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
                      <div v-else class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 animate-flutter"
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
                      <div v-else class="prose prose-sm max-w-none text-gray-600 dark:text-gray-300 animate-flutter"
                        v-html="renderedBody(splitIssues[1].body)" />
                    </div>
                  </div>
                </div>
              </div>

              <!-- Normal issue card -->
              <Issue v-else :issue="issue" :index="index" :has-real-issues="hasRealIssues"
                @remove="store.removeItem(issue)" @split="handleSplit(issue, index)" />
            </template>
          </TransitionGroup>
        </div>

        <!-- Generate More UButton -->
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

        <!-- Add this after the Generate More section, but still inside the Issues Display div -->
        <div v-if="store.itemList.value.length" class="mt-[12vh] border-t border-gray-200 dark:border-gray-700 pt-8">
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

  <!-- Add this right before the closing </template> tag -->
  <div class="mt-[12vh] pb-[8vh] text-center">
    <a href="https://room302.studio" target="_blank" rel="noopener noreferrer"
      class="inline-flex items-center gap-3 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-400 transition-colors">
      <img src="https://room302.studio/room302-logo.svg" alt="Room 302 Studio"
        class="w-6 h-6 opacity-50 grayscale hover:opacity-75 hover:grayscale-0 transition-all" />
      <span class="text-sm font-medium">Built by Room 302 Studio</span>
    </a>
  </div>
</template>

<script setup lang="ts">
import type { Issue } from '~/types'

const { streamIssues, isProcessing, error, cancelGeneration } = useLLMToIssues()
const store = useAppStore()
const { docToIssuesPrompt } = usePrompts()

const documentText = useLocalStorage('document-text', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const showApiKey = ref(false)

const clickhouse = useClickHouse()

const { shift, cmd, enter } = useMagicKeys()

const toast = useToast()

watch([shift, cmd, enter], ([shift, cmd, enter]) => {
  if (shift && enter || cmd && enter) {
    processDocument()
  }
})

const showCustomPrompt = ref(false)
const customPrompt = ref('')

import { MODEL_CONFIGS } from '~/composables/useOpenRouter'

// Update the model selection
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')

// Watch and sync with store
watch(selectedModel, (newModel) => {
  store.selectedModel = newModel
})

// Ensure the selected model is valid on mount
onMounted(() => {
  // If no model is selected or the selected model is invalid, use the default
  if (!Object.keys(MODEL_CONFIGS).includes(store.selectedModel)) {
    store.selectedModel = selectedModel.value
  }
})

// Optional: Fetch model details from OpenRouter API
const modelDetails = ref<Record<string, any>>({})
const selectedModelInfo = computed(() =>
  modelDetails.value[store.selectedModel]
)

async function fetchModelDetails() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'HTTP-Referer': window.location.origin,
      }
    })
    const data = await response.json()

    // Create a lookup object by model ID
    modelDetails.value = data.data.reduce((acc: Record<string, any>, model: any) => {
      acc[model.id] = model
      return acc
    }, {})
  } catch (err) {
    console.error('Error fetching model details:', err)
  }
}

// Fetch model details when API key changes
watch(apiKey, () => {
  if (apiKey.value) {
    fetchModelDetails()
  }
})

function generatePrompt(includeExisting = false, customInstructions = '') {
  const messages = [
    {
      role: 'system',
      content: `You are an expert at analyzing requirements and creating detailed, well-structured GitHub issues. 
Always format your responses using XML tags for each issue:

<IssueTitle>Issue title here</IssueTitle>
<IssueText>Issue description here</IssueText>

Do not include numbers, bullet points, or any other formatting - just the XML tags.`
    },
    {
      role: 'user',
      content: `Please analyze this document and generate GitHub issues:\n\n${documentText.value}`
    }
  ]

  if (includeExisting && store.itemList.value.length) {
    // Add existing issues as assistant's previous response
    const existingIssuesText = store.itemList.value
      .map(issue => `<IssueTitle>${issue.title}</IssueTitle>\n<IssueText>${issue.body}</IssueText>`)
      .join('\n\n')

    messages.push({
      role: 'assistant',
      content: existingIssuesText
    })
  }

  if (customInstructions) {
    // Add custom prompt as a separate user message
    messages.push({
      role: 'user',
      content: `Given the document and existing issues above, please generate additional issues with this focus: ${customInstructions}`
    })
  }

  return messages
}

// Add ref for loading skeletons
const loadingSkeletons = ref<number[]>([])

// Update processDocument
async function processDocument() {
  if (!documentText.value || !apiKey.value) return

  // Track generation start
  clickhouse.insertEvent('generation-start', 1, {
    model: store.selectedModel,
    documentLength: documentText.value.length
  })

  loadingSkeletons.value = [1, 2, 3]

  try {
    store.itemList.value = []
    await streamIssues(apiKey.value, generatePrompt(false), true, store.selectedModel)

    // Track successful generation
    clickhouse.insertEvent('generation-complete', 1, {
      model: store.selectedModel,
      issuesGenerated: store.itemList.value.length
    })
  } catch (error) {
    // Track generation error
    clickhouse.insertEvent('generation-error', 1, {
      model: store.selectedModel,
      error: error.message
    })
    // ... existing error handling
  }
}

// Add these refs near the top of the script setup section
const combiningIndices = ref<number[]>([])
const splitIssues = ref<Partial<Issue>[]>([{}, {}])

// Update handleSplit function with the complete implementation
async function handleSplit(issue: Issue, index: number) {
  // Track split attempt
  clickhouse.insertEvent('issue-split-start', 1, {
    issueTitle: issue.title,
    issueLength: issue.body.length
  })

  try {
    toast.add({
      title: 'Splitting Issue',
      description: `Splitting "${issue.title}"`,
      icon: 'i-material-symbols-light:arrow-split-rounded',
      color: 'purple',
      timeout: 0,
      id: `split-${index}`
    })

    // Set the combining indices to show the splitting animation
    combiningIndices.value = [index]
    splitIssues.value = [{}, {}]

    // Store original issue and its index
    const originalIssue = { ...issue }
    const originalIndex = index

    // Generate split prompt
    const splitPrompt = [
      {
        role: 'system',
        content: `You are an expert at splitting GitHub issues into smaller, more focused issues. 
        Split the following issue into exactly 2 separate issues using XML tags:
        
        <IssueTitle>Title for first issue</IssueTitle>
        <IssueText>Description for first issue</IssueText>
        
        <IssueTitle>Title for second issue</IssueTitle>
        <IssueText>Description for second issue</IssueText>`
      },
      {
        role: 'user',
        content: `Please split this issue into two separate, focused issues:\n\nTitle: ${issue.title}\n\nDescription: ${issue.body}`
      }
    ]

    let newIssues: Issue[] = []

    // Intercept new issues
    const addItemOriginal = store.addItem
    store.addItem = (newIssue) => {
      newIssues.push({
        ...newIssue,
        history: {
          splitFrom: {
            title: originalIssue.title,
            body: originalIssue.body
          },
          splitAt: new Date().toISOString()
        }
      })

      // Update splitIssues for animation
      if (newIssues.length <= 2) {
        splitIssues.value[newIssues.length - 1] = newIssues[newIssues.length - 1]
      }

      // Only update store after we have both issues
      if (newIssues.length === 2) {
        // Remove the original issue
        store.itemList.value.splice(originalIndex, 1)

        // Add both new issues at the original position
        store.itemList.value.splice(originalIndex, 0, ...newIssues)

        // Restore original function
        store.addItem = addItemOriginal
      }
    }

    // Generate split issues
    await streamIssues(
      apiKey.value,
      splitPrompt,
      false,
      store.selectedModel
    )

    // After successful split
    toast.remove(`split-${index}`)
    toast.add({
      title: 'Issue Split',
      description: 'Successfully split into two new issues',
      icon: 'i-heroicons-check-circle',
      color: 'green'
    })

    // Track successful split
    clickhouse.insertEvent('issue-split-complete', 1, {
      originalTitle: issue.title,
      newIssuesCount: 2
    })

  } catch (err) {
    console.error('Error splitting issue:', err)
    toast.remove(`split-${index}`)
    toast.add({
      title: 'Split Failed',
      description: 'Failed to split issue. Original issue restored.',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })

    // Track split error
    clickhouse.insertEvent('issue-split-error', 1, {
      issueTitle: issue.title,
      error: err.message
    })
  } finally {
    // Clear the animation state
    combiningIndices.value = []
    splitIssues.value = [{}, {}]
  }
}

// Add tracking to generateMore
async function generateMore() {
  if (!documentText.value || !apiKey.value) {
    return
  }

  clickhouse.insertEvent('generate-more-start', 1, {
    model: store.selectedModel,
    existingIssues: store.itemList.value.length
  })

  try {
    await streamIssues(apiKey.value, generatePrompt(true), false, store.selectedModel)

    clickhouse.insertEvent('generate-more-complete', 1, {
      model: store.selectedModel,
      newIssuesCount: store.itemList.value.length
    })
  } catch (error) {
    clickhouse.insertEvent('generate-more-error', 1, {
      model: store.selectedModel,
      error: error.message
    })
  }
}

// Track issue removal
function removeIssue(issue: Issue) {
  clickhouse.insertEvent('issue-removed', 1, {
    issueTitle: issue.title,
    issueLength: issue.body.length
  })
  store.removeItem(issue)
}

// Track custom prompt generation
async function generateMoreWithPrompt() {
  if (!customPrompt.value.trim()) return

  clickhouse.insertEvent('custom-prompt-generation', 1, {
    model: store.selectedModel,
    promptLength: customPrompt.value.length,
    existingIssues: store.itemList.value.length
  })

  try {
    await streamIssues(
      apiKey.value,
      generatePrompt(true, customPrompt.value),
      false,
      store.selectedModel
    )

    clickhouse.insertEvent('custom-prompt-complete', 1, {
      model: store.selectedModel,
      newIssuesCount: store.itemList.value.length
    })
  } catch (error) {
    clickhouse.insertEvent('custom-prompt-error', 1, {
      model: store.selectedModel,
      error: error.message
    })
  }
}

// Track model changes
watch(selectedModel, (newModel, oldModel) => {
  if (oldModel) { // Don't track initial setting
    clickhouse.insertEvent('model-changed', 1, {
      from: oldModel,
      to: newModel
    })
  }
})

// Helper function to format prices
function formatPrice(price: string) {
  const num = parseFloat(price)
  return num.toFixed(4)
}

// Helper function to format large numbers with commas
function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num)
}

// Helper function to render markdown
function renderedBody(text: string) {
  return DOMPurify.sanitize(marked(text))
}

const isSplitting = ref(false)

// Update the displayedIssues computed to only show real issues
const displayedIssues = computed(() => {
  return store.itemList.value.filter(issue => !issue.skeleton)
})

// Update hasRealIssues computed
const hasRealIssues = computed(() => {
  return displayedIssues.value.length > 0
})

// Add this function to the script section
function clearAllIssues() {
  // Clear the store items
  store.itemList.value = []
  // Clear loading skeletons
  loadingSkeletons.value = []
  // Reset any splitting state
  combiningIndices.value = []
  splitIssues.value = [{}, {}]
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
</style>