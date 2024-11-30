import { createGlobalState, useLocalStorage } from '@vueuse/core'

export const useAppStore = createGlobalState(() => {
  const activeItem = useLocalStorage('activeItem', null)
  const itemList = useLocalStorage('itemList', [])
  const githubToken = useLocalStorage('github-token', '')
  const repositories = useLocalStorage('repositories', [])
  const selectedRepository = useLocalStorage('selectedRepository', null)

  const setActiveItem = (item) => {
    activeItem.value = item
  }

  const addItem = (item) => {
    itemList.value.push(item)
  }

  const removeItem = (item) => {
    const index = itemList.value.indexOf(item)
    if (index !== -1) {
      itemList.value.splice(index, 1)
    }
  }

  const fetchRepositories = async () => {
    if (!githubToken.value) return

    try {
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${githubToken.value}`
        }
      })
      const data = await response.json()
      repositories.value = data
    } catch (error) {
      console.error('Error fetching repositories:', error)
    }
  }

  const setSelectedRepository = (repository) => {
    selectedRepository.value = repository
  }

  return {
    activeItem,
    itemList,
    githubToken,
    repositories,
    selectedRepository,
    setActiveItem,
    addItem,
    removeItem,
    fetchRepositories,
    setSelectedRepository,
  }
})
