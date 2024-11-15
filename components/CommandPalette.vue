<template>
  <div>
    <!-- Keyboard shortcut hint -->
    <div class="fixed bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
      Press
      <UKbd>⌘</UKbd>
      <UKbd>K</UKbd>
      for commands
    </div>

    <!-- Command Palette Modal -->
    <UModal v-model="isOpen">
      <UCommandPalette :groups="groups" :autoselect="false" placeholder="Type a command..."
        @update:model-value="executeCommand" />
    </UModal>
  </div>
</template>

<script setup lang="ts">
const isOpen = ref(false)

// Define available commands
const groups = [
  {
    key: 'actions',
    commands: [
      {
        id: 'generate',
        label: 'Generate Issues',
        icon: 'i-heroicons-sparkles',
        shortcuts: ['⌘', 'Enter'],
        description: 'Generate new issues from document',
        click: () => emit('generate')
      },
      {
        id: 'generate-more',
        label: 'Generate More Issues',
        icon: 'i-heroicons-plus',
        description: 'Generate additional issues',
        click: () => emit('generate-more')
      },
      {
        id: 'custom-prompt',
        label: 'Custom Generation Prompt',
        icon: 'i-heroicons-command-line',
        description: 'Generate issues with a custom prompt',
        click: () => emit('custom-prompt')
      },
      {
        id: 'clear',
        label: 'Clear All Issues',
        icon: 'i-heroicons-trash',
        description: 'Remove all generated issues',
        click: () => emit('clear')
      },
      {
        id: 'toggle-theme',
        label: 'Toggle Dark Mode',
        icon: 'i-heroicons-moon',
        shortcuts: ['⌘', 'T'],
        description: 'Switch between light and dark theme',
        click: () => emit('toggle-theme')
      },
      {
        id: 'clear-and-paste',
        label: 'Clear & Paste from Clipboard',
        icon: 'i-heroicons-clipboard',
        shortcuts: ['⌘', 'V'],
        description: 'Clear current document and paste clipboard contents',
        click: () => emit('clear-and-paste')
      },
    ]
  }
]

function executeCommand(command: any) {
  if (command?.click) {
    command.click()
    close()

    // If it's the custom prompt command, scroll to the section
    if (command.id === 'custom-prompt') {
      nextTick(() => {
        const customPromptEl = document.querySelector('#custom-prompt-section')
        if (customPromptEl) {
          customPromptEl.scrollIntoView({ behavior: 'smooth', block: 'center' })
        }
      })
    }
  }
}

// Open/Close handlers
function open() {
  isOpen.value = true
}

function close() {
  isOpen.value = false
}

// Listen for ⌘+K
onMounted(() => {
  window.addEventListener('keydown', (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
      e.preventDefault()
      open()
    }
  })
})

// Define emits
const emit = defineEmits<{
  generate: []
  'generate-more': []
  'custom-prompt': []
  clear: []
  'toggle-theme': []
  'clear-and-paste': []
}>()

// Expose open/close methods
defineExpose({ open, close })
</script>