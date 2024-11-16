<template>
  <div class="mb-6 p-4 bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 rounded-lg space-y-4">
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
          placeholder="Enter your API key" @input="$emit('update:api-key', apiKey)" />
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
        :disabled="isProcessing" @change="$emit('update:model', selectedModel)">
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
</template>

<script setup lang="ts">
const props = defineProps<{
  isProcessing: boolean
}>()

const emit = defineEmits<{
  'update:api-key': [value: string]
  'update:model': [value: string]
}>()

const store = useAppStore()
const apiKey = useLocalStorage('openrouter-api-key', '')
const showApiKey = ref(false)

import { MODEL_CONFIGS } from '~/composables/useOpenRouter'
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')

// Model details handling
const modelDetails = ref<Record<string, any>>({})
const selectedModelInfo = computed(() => modelDetails.value[selectedModel.value])

// Watch and sync with store
watch(selectedModel, (newModel) => {
  // No need to sync with store anymore
})

async function fetchModelDetails() {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${apiKey.value}`,
        'HTTP-Referer': window.location.origin,
      }
    })
    const data = await response.json()
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

// Helper functions
function formatPrice(price: string) {
  const num = parseFloat(price)
  return num.toFixed(4)
}

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num)
}
</script>