<template>
  <div class="max-w-3xl mx-auto py-12 px-4">
    <h1 class="text-2xl font-semibold mb-8">Settings</h1>

    <!-- GitHub Section -->
    <div class="space-y-6 mb-12">
      <h2 class="text-lg font-medium">GitHub Connection</h2>
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
        <div v-if="store.githubUser" class="flex items-center gap-4">
          <img :src="store.githubUser.avatar_url" :alt="store.githubUser.login" class="w-12 h-12 rounded-full">
          <div>
            <div class="font-medium">{{ store.githubUser.name || store.githubUser.login }}</div>
            <div class="text-sm text-gray-500">@{{ store.githubUser.login }}</div>
          </div>
          <UButton color="red" variant="soft" size="sm" class="ml-auto" @click="disconnectGithub">
            Disconnect
          </UButton>
        </div>
        <GitHubLoginButton v-else />
        <p class="text-sm text-gray-600 dark:text-gray-400">
          Connected GitHub accounts can create issues in your repositories.
        </p>
      </div>
    </div>

    <!-- API Configuration -->
    <div class="space-y-6">
      <h2 class="text-lg font-medium">API Configuration</h2>
      <div class="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
        <!-- OpenRouter API Key -->
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
            <UButton @click="showApiKey = !showApiKey" color="gray" variant="ghost"
              class="absolute right-2 top-1/2 -translate-y-1/2">
              <UIcon :name="showApiKey ? 'heroicons:eye-slash' : 'heroicons:eye'" />
            </UButton>
          </div>
        </div>

        <!-- Default Model Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-600 dark:text-gray-300 mb-2">
            Default Model
          </label>
          <select v-model="selectedModel"
            class="w-full p-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-md">
            <option v-for="[id, config] in Object.entries(MODEL_CONFIGS)" :key="id" :value="id">
              {{ config.name }}
            </option>
          </select>
        </div>
      </div>
    </div>

    <!-- Save Button -->
    <div class="mt-8">
      <UButton color="primary" @click="saveSettings" :loading="saving">
        Save Settings
      </UButton>
    </div>
  </div>
</template>

<script setup lang="ts">
const store = useAppStore()
const supabase = useSupabaseClient()
const toast = useToast()

const showApiKey = ref(false)
const saving = ref(false)

// Load saved settings
const apiKey = useLocalStorage('openrouter-api-key', '')
const selectedModel = useLocalStorage('selected-model', 'anthropic/claude-3.5-sonnet:beta')

import { MODEL_CONFIGS } from '~/composables/useOpenRouter'

async function disconnectGithub() {
  try {
    await supabase.auth.signOut()
    store.setGithubToken(null)
    store.setGithubUser(null)
    toast.add({
      title: 'Disconnected',
      description: 'Successfully disconnected from GitHub',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Error disconnecting:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to disconnect from GitHub',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  }
}

async function saveSettings() {
  saving.value = true
  try {
    // Save settings to localStorage (already handled by useLocalStorage)
    store.setSelectedModel(selectedModel.value)

    toast.add({
      title: 'Settings Saved',
      description: 'Your settings have been updated',
      icon: 'i-heroicons-check-circle'
    })
  } catch (error) {
    console.error('Error saving settings:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to save settings',
      icon: 'i-heroicons-x-circle',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}
</script>