import { defineStore } from 'pinia'

export const useAppStore = defineStore('app', {
  state: () => ({
    itemList: ref([])
  }),
  actions: {
    removeItem(item) {
      const index = this.itemList.value.findIndex(i => i.id === item.id)
      if (index > -1) {
        this.itemList.value.splice(index, 1)
      }
    }
  }
}) 