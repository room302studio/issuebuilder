import { defineStore } from 'pinia'
import type { Issue } from '~/types'
import type { GithubUser } from '~/types'

interface AppState {
  activeItem: null | Issue
  itemList: Issue[]
  selectedModel: string
  githubToken: string | null
  githubUser: GithubUser | null
}

export const useAppStore = defineStore('app', () => {
  const itemList = ref<Issue[]>([])
  const activeItem = ref<null | Issue>(null)
  const selectedModel = ref('anthropic/claude-3.5-sonnet:beta')
  const githubToken = ref<string | null>(null)
  const githubUser = ref<GithubUser | null>(null)

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

  function setGithubToken(token: string | null) {
    githubToken.value = token
  }

  function setGithubUser(user: GithubUser | null) {
    githubUser.value = user
  }

  return {
    activeItem,
    itemList,
    selectedModel,
    setActiveItem,
    addItem,
    removeItem,
    clearItems,
    setSelectedModel,
    githubToken,
    githubUser,
    setGithubToken,
    setGithubUser
  }
}) 