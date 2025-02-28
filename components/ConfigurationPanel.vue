<template>
  <div class="space-y-6 mb-8">
    <!-- API Key Input -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
        <Icon name="heroicons:key" class="w-5 h-5" />
        OpenRouter API Key
      </label>
      <UInput v-model="localApiKey" :type="showApiKey ? 'text' : 'password'" :disabled="isProcessing"
        placeholder="Enter your OpenRouter API key">
        <template #trailing>
          <UButton color="gray" variant="ghost" :icon="showApiKey ? 'i-heroicons-eye-slash' : 'i-heroicons-eye'"
            :loading="isProcessing" @click="toggleApiKeyVisibility" square />
        </template>
      </UInput>
      <div class="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1">
        <Icon name="heroicons:information-circle" class="w-4 h-4" />
        Get your API key from <a href="https://openrouter.ai/keys" target="_blank"
          class="text-zinc-700 dark:text-zinc-300 hover:underline">OpenRouter</a>
      </div>
    </div>

    <!-- Model Selection -->
    <div class="space-y-2">
      <label class="block text-sm font-medium text-zinc-700 dark:text-zinc-300 flex items-center gap-2">
        <Icon name="heroicons:cpu-chip" class="w-5 h-5" />
        Language Model
      </label>
      <USelect v-model="selectedModel" :options="Object.entries(MODEL_CONFIGS).map(([id, config]) => ({
        label: config.name,
        value: id
      }))" :disabled="isProcessing" @update:model-value="$emit('update:model', $event)" />
      <!-- Model Info -->
      <div v-if="selectedModelInfo" class="text-xs text-zinc-500 space-y-1">
        <div class="flex flex-wrap gap-2">
          <span v-if="selectedModelInfo.pricing?.prompt">
            Input: ${{ formatPrice(selectedModelInfo.pricing.prompt) }}/1K tokens
          </span>
          <span v-if="selectedModelInfo.pricing?.completion">
            Output: ${{ formatPrice(selectedModelInfo.pricing.completion) }}/1K tokens
          </span>
          <span v-if="selectedModelInfo.context_length">
            Context: {{ formatNumber(selectedModelInfo.context_length) }} tokens
          </span>
        </div>
        <p>{{ selectedModelInfo.description }}</p>
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

// Local state
const localApiKey = ref('')
const showApiKey = ref(false)
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')

// Toggle API key visibility
function toggleApiKeyVisibility() {
  showApiKey.value = !showApiKey.value
}

// Watch for API key changes
watch(localApiKey, (newValue) => {
  emit('update:api-key', newValue)
})

// Model details handling
const modelDetails = ref<Record<string, any>>({})
const selectedModelInfo = computed(() => modelDetails.value[selectedModel.value])

// Helper functions
function formatPrice(price: string) {
  const num = parseFloat(price)
  return num.toFixed(4)
}

function formatNumber(num: number) {
  return new Intl.NumberFormat().format(num)
}

// Initialize with stored API key if available
onMounted(() => {
  const storedKey = useLocalStorage('openrouter-api-key', '').value
  if (storedKey) {
    localApiKey.value = storedKey
  }
})
</script>
