import { defineStore } from 'pinia'
import type { Issue } from '~/types'

interface AppState {
  activeItem: null | Issue
  itemList: Issue[]
  selectedModel: string
}

export const useAppStore = defineStore('app', {
  state: (): AppState => ({
    activeItem: null,
    itemList: [],
    selectedModel: 'anthropic/claude-3.5-sonnet:beta'
  }),

  actions: {
    setActiveItem(item: Issue) {
      this.activeItem = item
    },
    addItem(item: Issue) {
      this.itemList.push(item)
    },
    removeItem(item: Issue) {
      const index = this.itemList.indexOf(item)
      if (index > -1) {
        this.itemList.splice(index, 1)
      }
    },
    clearItems() {
      this.itemList = []
    },
    setSelectedModel(model: string) {
      this.selectedModel = model
    }
  }
}) 