import { createGlobalState, useStorage } from '@vueuse/core'
import type { Issue } from '~/types'
import { TABLE_NAMES, COLUMNS } from '~/constants/supabase'

interface Repository {
  id: number
  name: string
  full_name: string
  private: boolean
  html_url: string
  description?: string
  owner: {
    login: string
    avatar_url: string
  }
}

interface Project {
  id: string
  name: string
  created_at: string
  updated_at: string
  issues: Issue[]
  document_text: string
  repository?: Repository
  model: string
  user_id: string
}

export const useAppStore = createGlobalState(() => {
  // Persistent state
  const repositories = useStorage('repositories', [] as Repository[])
  const selectedModel = useStorage(
    'selected-model',
    'anthropic/claude-3.5-sonnet:beta'
  )
  const githubToken = useStorage('github-token', null as string | null)
  const itemList = ref<Issue[]>([])
  const currentProject = ref<Project | null>(null)

  // Actions
  const fetchRepositories = async () => {
    const user = useSupabaseUser()
    const {
      data: { session }
    } = await useSupabaseClient().auth.getSession()

    console.log('🔍 Fetching repos, state:', {
      exists: !!user.value,
      id: user.value?.id,
      email: user.value?.email,
      metadata: user.value?.user_metadata,
      appMetadata: user.value?.app_metadata,
      providerToken: session?.provider_token
    })

    if (!session?.provider_token) {
      console.warn('❌ No provider token found, cannot fetch repos')
      return []
    }

    try {
      console.log('📡 Fetching repos from GitHub API...')
      const response = await fetch('https://api.github.com/user/repos', {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
          Accept: 'application/vnd.github.v3+json'
        }
      })

      if (!response.ok) {
        const errorText = await response.text()
        console.error('❌ GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          response: errorText,
          headers: Object.fromEntries(response.headers.entries())
        })
        throw new Error(`GitHub API error: ${response.status}`)
      }

      const data = await response.json()
      console.log('✅ Fetched repos successfully:', {
        count: data.length,
        scopes: response.headers.get('x-oauth-scopes'),
        rateLimit: {
          limit: response.headers.get('x-ratelimit-limit'),
          remaining: response.headers.get('x-ratelimit-remaining'),
          reset: response.headers.get('x-ratelimit-reset')
        }
      })

      repositories.value = data
      return data
    } catch (error) {
      console.error('💥 Error fetching repositories:', error)
      throw error
    }
  }

  const removeItem = (issue: Issue) => {
    const index = itemList.value.findIndex((i) => i.id === issue.id)
    if (index !== -1) {
      itemList.value.splice(index, 1)
    }
  }

  // Project management
  const createProject = async (name: string, documentText: string) => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()

    if (!user.value) throw new Error('User not authenticated')

    const project: Omit<Project, 'id'> = {
      [COLUMNS.PROJECTS.NAME]: name,
      [COLUMNS.PROJECTS.CREATED_AT]: new Date().toISOString(),
      [COLUMNS.PROJECTS.UPDATED_AT]: new Date().toISOString(),
      [COLUMNS.PROJECTS.ISSUES]: itemList.value,
      [COLUMNS.PROJECTS.DOCUMENT_TEXT]: documentText,
      [COLUMNS.PROJECTS.REPOSITORY]: repositories.value.find(
        (r) => r.id === currentProject.value?.repository?.id
      ),
      [COLUMNS.PROJECTS.MODEL]: selectedModel.value,
      [COLUMNS.PROJECTS.USER_ID]: user.value.id
    }

    const { data, error } = await client
      .from(TABLE_NAMES.PROJECTS)
      .insert(project)
      .select()
      .single()

    if (error) throw error

    currentProject.value = data
    return data
  }

  const updateProject = async () => {
    if (!currentProject.value) return

    const client = useSupabaseClient()
    const update = {
      ...currentProject.value,
      [COLUMNS.PROJECTS.UPDATED_AT]: new Date().toISOString(),
      [COLUMNS.PROJECTS.ISSUES]: itemList.value
    }

    const { error } = await client
      .from(TABLE_NAMES.PROJECTS)
      .update(update)
      .eq(COLUMNS.PROJECTS.ID, currentProject.value.id)

    if (error) throw error
  }

  const loadProject = async (id: string) => {
    const client = useSupabaseClient()
    const { data, error } = await client
      .from(TABLE_NAMES.PROJECTS)
      .select()
      .eq(COLUMNS.PROJECTS.ID, id)
      .single()

    if (error) throw error

    currentProject.value = data
    itemList.value = data.issues
    selectedModel.value = data.model
    return data
  }

  const listProjects = async () => {
    const client = useSupabaseClient()
    const user = useSupabaseUser()

    if (!user.value) throw new Error('User not authenticated')

    const { data, error } = await client
      .from(TABLE_NAMES.PROJECTS)
      .select()
      .eq(COLUMNS.PROJECTS.USER_ID, user.value.id)
      .order(COLUMNS.PROJECTS.UPDATED_AT, { ascending: false })

    if (error) throw error
    return data
  }

  const deleteProject = async (id: string) => {
    const client = useSupabaseClient()
    const { error } = await client
      .from(TABLE_NAMES.PROJECTS)
      .delete()
      .eq(COLUMNS.PROJECTS.ID, id)

    if (error) throw error

    if (currentProject.value?.id === id) {
      currentProject.value = null
      itemList.value = []
    }
  }

  return {
    repositories,
    selectedModel,
    fetchRepositories,
    itemList,
    removeItem,
    githubToken,
    currentProject,
    createProject,
    updateProject,
    loadProject,
    listProjects,
    deleteProject
  }
})
