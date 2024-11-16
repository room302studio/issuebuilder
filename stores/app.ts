import { defineStore } from 'pinia'
import type { Issue } from '~/types'

interface AppState {
  activeItem: null | Issue
  itemList: Issue[]
  selectedModel: string
}

export const useAppStore = defineStore('app', () => {
  const itemList = ref<Issue[]>([])
  const activeItem = ref<null | Issue>(null)
  const selectedModel = ref('anthropic/claude-3.5-sonnet:beta')

  function setActiveItem(item: Issue) {
    activeItem.value = item
  }

  function addItem(item: Issue) {
    itemList.value.push(item)
  }

  function removeItem(item: Issue) {
    const index = itemList.value.indexOf(item)
    if (index > -1) {
      itemList.value.splice(index, 1)
    }
  }

  function clearItems() {
    itemList.value = []
  }

  function setSelectedModel(model: string) {
    selectedModel.value = model
  }

  return {
    activeItem,
    itemList,
    selectedModel,
    setActiveItem,
    addItem,
    removeItem,
    clearItems,
    setSelectedModel
  }
}) 