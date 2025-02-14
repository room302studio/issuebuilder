<template>
  <div
    class="relative grid grid-cols-1 lg:grid-cols-[1fr,280px] gap-6 max-w-6xl mx-auto p-4 md:p-6 pt-[10vh] dark:bg-gray-900">
    <div class="max-w-2xl">
      <!-- Header Section -->
      <div class="mb-8 space-y-4">
        <h1 class="text-2xl font-bold flex items-center gap-2 dark:text-white">
          <Icon name="heroicons:document-text" class="w-7 h-7 text-primary-500" />
          IssueBuilder
          <span v-if="store.currentProject" class="text-sm font-normal text-gray-500">
            • {{ store.currentProject.name }}
          </span>
        </h1>
        <p class="text-gray-600 dark:text-gray-300 leading-relaxed">
          Transform your development documents, plans, and written text into atomic, actionable GitHub issues.
          IssueBuilder uses AI to analyze your text and create well-structured issues in the repository of your choice.
        </p>
      </div>

      <!-- Configuration Panel First -->
      <ConfigurationPanel :is-processing="isProcessing" @update:api-key="updateApiKey" @update:model="updateModel"
        class="mb-8" />

      <!-- Project Manager -->
      <ProjectManager 
        :model-value="showProjectManager" 
        @update:model-value="showProjectManager = $event" 
        class="mb-8" 
      />

      <!-- Text Input -->
      <div class="mb-8">
        <label class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
          <Icon name="heroicons:document-text" class="w-5 h-5" />
          Document Text
        </label>
        <UTextarea v-model="documentText" :rows="10" :disabled="isProcessing" placeholder="Paste your document text here..."
          class="font-mono text-sm" />
      </div>

      <!-- Process Button with Cancel -->
      <div class="w-full mb-8">
        <UButton v-if="!isProcessing" @click="processDocument" :disabled="!canGenerate" color="primary" size="xl" block
          class="flex items-center justify-center gap-2 relative group" :tooltip="generateButtonTooltip"
          :tooltip-placement="canGenerate ? 'top' : 'right'"
          :tooltip-class="canGenerate ? '' : 'whitespace-pre text-left'">
          <Icon name="heroicons:sparkles" class="w-6 h-6" />
          Generate Issues
          <div v-if="!canGenerate" class="absolute -right-2 top-1/2 -translate-y-1/2 translate-x-full hidden group-hover:block">
            <Icon name="heroicons:information-circle" class="w-5 h-5 text-gray-400" />
          </div>
        </UButton>
        <UButton v-else @click="cancelGeneration" color="red" size="xl" block
          class="flex items-center justify-center gap-2">
          <Icon name="heroicons:stop-circle" class="w-6 h-6" />
          Cancel Generation
        </UButton>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="mb-8 p-6 bg-red-50 text-red-600 rounded-md flex items-start gap-3">
        <Icon name="heroicons:exclamation-triangle" class="w-5 h-5 flex-shrink-0 mt-0.5" />
        <div>{{ error.message }}</div>
      </div>

      <!-- Issues Display Component -->
      <ClientOnly>
        <IssuesDisplay v-if="showIssuesDisplay" :is-processing="isProcessing" :loading-skeletons="loadingSkeletons"
          @generate-more="generateMore" />
      </ClientOnly>
    </div>

    <!-- Table of Contents -->
    <ClientOnly>
      <TableOfContents v-if="hasIssues" :issues="store.itemList?.value || []" />
    </ClientOnly>
  </div>

  <!-- Command Palette -->
  <CommandPalette ref="commandPalette" @generate="processDocument" @generate-more="generateMore"
    @custom-prompt="showCustomPrompt = true" @clear="clearAllIssues" @toggle-theme="toggleTheme"
    @clear-and-paste="handleClearAndPaste" />

  <!-- Footer -->
  <Footer />
</template>

<script setup lang="ts">
import type { Issue } from '~/types'

const store = useAppStore()
const { streamIssues, isProcessing, error, cancelGeneration } = useLLMToIssues()
const documentText = useLocalStorage('document-text', '')
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')
const clickhouse = useClickHouse()
const colorMode = useColorMode()
const commandPalette = ref()

// State
const loadingSkeletons = ref<number[]>([])
const showCustomPrompt = ref(false)
const showProjectManager = ref(false)

// Initialize store.itemList if needed
onMounted(() => {
  if (!store.itemList.value) {
    store.itemList.value = []
  }
})

// Computed
const generateButtonTooltip = computed(() => {
  if (canGenerate.value) return 'Press Generate Issues or use Cmd+Enter to start'
  
  const reasons = []
  if (!documentText.value?.trim()) {
    reasons.push('📝 No text to analyze - paste your document in the text area')
  }
  if (!apiKey.value?.trim()) {
    reasons.push('🔑 Missing API key - add your OpenRouter API key in the configuration panel')
  }
  if (!selectedModel.value) {
    reasons.push('🤖 No model selected - choose a language model in the configuration panel')
  }
  if (isProcessing.value) {
    reasons.push('⏳ Currently processing - please wait')
  }

  if (reasons.length === 0) {
    reasons.push('🤔 Button disabled but all conditions seem met - please check console for debug info')
  }
  
  return `Can't generate issues yet:\n${reasons.join('\n')}`
})

const canGenerate = computed(() => {
  const hasText = Boolean(documentText.value?.trim())
  const hasApiKey = Boolean(apiKey.value?.trim())
  const hasModel = Boolean(selectedModel.value)
  const notProcessing = !isProcessing.value

  console.log('Generate button state:', {
    hasText,
    hasApiKey,
    hasModel,
    notProcessing,
    textLength: documentText.value?.length,
    apiKeyLength: apiKey.value?.length,
    selectedModel: selectedModel.value
  })
  
  return hasText && hasApiKey && hasModel && notProcessing
})

const hasIssues = computed(() => {
  return store.itemList.value?.length > 0
})

const showIssuesDisplay = computed(() => {
  return hasIssues.value || loadingSkeletons.value.length > 0
})

// Methods
async function processDocument() {
  if (!canGenerate.value) return

  clickhouse.insertEvent('generation-start', 1, {
    model: selectedModel.value,
    documentLength: documentText.value.length
  })

  try {
    store.itemList.value = []
    await streamIssues(apiKey.value, generatePrompt(false), true, selectedModel.value)

    // Create a new project after successful generation
    const { $prompt } = useNuxtApp()
    const projectName = await $prompt('Enter a name for this project')
    if (projectName) {
      await store.createProject(projectName, documentText.value)
    }

    clickhouse.insertEvent('generation-complete', 1, {
      model: selectedModel.value,
      issuesGenerated: store.itemList.value.length
    })
  } catch (err: any) {
    clickhouse.insertEvent('generation-error', 1, {
      model: selectedModel.value,
      error: err?.message || 'Unknown error'
    })
  }
}

function generatePrompt(includeExisting = false, customInstructions = '') {
  const messages = [
    {
      role: 'system',
      content: `You are an expert at analyzing requirements and creating detailed, well-structured GitHub issues. 
Always format your responses using XML tags for each issue:

<IssueTitle>Issue title here</IssueTitle>
<IssueText>Issue description here</IssueText>

Do not include numbers, bullet points, or any other formatting - just the XML tags.
Each issue should be complete and atomic.`
    },
    {
      role: 'user',
      content: `Please analyze this document and generate GitHub issues:\n\n${documentText.value}`
    }
  ]

  if (includeExisting && store.itemList.value?.length) {
    const existingIssuesText = store.itemList.value
      .map((issue: Issue) => `<IssueTitle>${issue.title}</IssueTitle>\n<IssueText>${issue.body}</IssueText>`)
      .join('\n\n')

    messages.push({
      role: 'assistant',
      content: existingIssuesText
    })
  }

  if (customInstructions) {
    messages.push({
      role: 'user',
      content: `Given the document and existing issues above, please generate additional issues with this focus: ${customInstructions}`
    })
  }

  return messages
}

async function generateMore() {
  if (!canGenerate.value) return

  clickhouse.insertEvent('generate-more-start', 1, {
    model: selectedModel.value,
    existingIssues: store.itemList.value.length
  })

  try {
    await streamIssues(apiKey.value, generatePrompt(true), false, selectedModel.value)
  } catch (error) {
    console.error('Error generating more issues:', error)
  }
}

function clearAllIssues() {
  store.itemList.value = []
  loadingSkeletons.value = []
}

function toggleTheme() {
  colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

async function handleClearAndPaste() {
  try {
    const text = await navigator.clipboard.readText()
    documentText.value = text
    clearAllIssues()
  } catch (err) {
    console.error('Failed to read clipboard:', err)
  }
}

// Keyboard shortcuts
const { shift, cmd, enter } = useMagicKeys()

watch([shift, cmd, enter], ([shift, cmd, enter]) => {
  if ((shift && enter) || (cmd && enter)) {
    processDocument()
  }
})

function updateApiKey(value: string) {
  apiKey.value = value
}

function updateModel(value: string) {
  selectedModel.value = value
}
</script>

<style>
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