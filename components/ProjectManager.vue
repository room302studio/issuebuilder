<template>
  <div class="space-y-4">
    <!-- Current Project Info -->
    <div v-if="store.currentProject" class="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div class="flex items-center gap-3">
        <Icon name="heroicons:document-text" class="w-5 h-5 text-primary-500" />
        <div>
          <h3 class="font-medium dark:text-white">{{ store.currentProject.value?.name }}</h3>
          <p class="text-sm text-gray-500 dark:text-gray-400">
            Last updated {{ formatDate(store.currentProject.value?.updated_at) }}
          </p>
        </div>
      </div>
      <UButton color="primary" @click="saveProject" :loading="saving">
        Save Project
      </UButton>
    </div>

    <!-- Project List -->
    <UModal 
      :modelValue="modelValue"
      @update:modelValue="$emit('update:modelValue', $event)"
    >
      <UCard>
        <template #header>
          <div class="flex items-center justify-between">
            <h3 class="text-base font-semibold leading-6 text-gray-900 dark:text-white">
              Your Projects
            </h3>
            <UButton
              color="primary"
              variant="ghost"
              icon="i-heroicons-plus-circle"
              @click="handleCreateProject"
            />
          </div>
        </template>

        <div class="space-y-2">
          <div v-if="projects.length === 0" class="text-center py-4 text-gray-500">
            No projects yet. Create one to get started!
          </div>
          
          <div
            v-for="project in projects"
            :key="project.id"
            class="flex items-center justify-between p-3 hover:bg-gray-50 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2">
                <h4 class="font-medium truncate dark:text-white">
                  {{ project.name }}
                </h4>
                <span v-if="project.repository" class="text-xs text-gray-500">
                  {{ project.repository.full_name }}
                </span>
              </div>
              <p class="text-sm text-gray-500">
                {{ formatDate(project.updated_at) }} • {{ project.issues.length }} issues
              </p>
            </div>
            
            <div class="flex items-center gap-2">
              <UButton
                color="primary"
                variant="ghost"
                icon="i-heroicons-arrow-path"
                :loading="loadingProject === project.id"
                @click="loadProject(project.id)"
              />
              <UButton
                color="red"
                variant="ghost"
                icon="i-heroicons-trash"
                @click="handleDeleteProject(project)"
              />
            </div>
          </div>
        </div>
      </UCard>
    </UModal>

    <!-- Experimental Modals -->
    <template v-if="experimental">
      <!-- Create Project Modal -->
      <UModal 
        :modelValue="isCreateProjectModalOpen"
        @update:modelValue="isCreateProjectModalOpen = $event"
      >
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Create New Project</h3>
          </template>
          <div class="p-4">
            <input
              v-model="newProjectName"
              placeholder="Enter project name"
              class="w-full p-2 border rounded focus:outline-none focus:ring"
            />
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="primary" @click="confirmCreateProject">Create</UButton>
              <UButton variant="ghost" @click="isCreateProjectModalOpen = false">Cancel</UButton>
            </div>
          </template>
        </UCard>
      </UModal>

      <!-- Delete Confirmation Modal -->
      <UModal 
        :modelValue="isDeleteConfirmModalOpen"
        @update:modelValue="isDeleteConfirmModalOpen = $event"
      >
        <UCard>
          <template #header>
            <h3 class="text-lg font-medium">Confirm Deletion</h3>
          </template>
          <div class="p-4">
            <p>
              Are you sure you want to delete project "
              <span class="font-semibold">{{ projectToDelete?.name }}</span>"?
            </p>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <UButton color="red" @click="confirmDeleteProject">Delete</UButton>
              <UButton variant="ghost" @click="isDeleteConfirmModalOpen = false">Cancel</UButton>
            </div>
          </template>
        </UCard>
      </UModal>
    </template>
  </div>
</template>

<script setup lang="ts">
import type { Project } from '~/types'
import { useFeatureFlags } from '~/composables/useFeatureFlags'

const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
}>()

const store = useAppStore()
const toast = useToast()
const nuxtApp = useNuxtApp() as any

// Feature flag setup
const { experimentalFeatures: experimental } = useFeatureFlags()

// State
const projects = ref<Project[]>([])
const saving = ref(false)
const loadingProject = ref<string | null>(null)
const deletingProject = ref<string | null>(null)

// Experimental modal state
const isCreateProjectModalOpen = ref(false)
const newProjectName = ref('')
const isDeleteConfirmModalOpen = ref(false)
const projectToDelete = ref<Project | null>(null)

// Load projects on mount
onMounted(async () => {
  try {
    projects.value = await store.listProjects()
  } catch (error) {
    console.error('Error loading projects:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load projects',
      color: 'red'
    })
  }
})

// Methods
async function saveProject() {
  saving.value = true
  try {
    await store.updateProject()
    toast.add({
      title: 'Success',
      description: 'Project saved successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error saving project:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to save project',
      color: 'red'
    })
  } finally {
    saving.value = false
  }
}

async function loadProject(id: string) {
  loadingProject.value = id
  try {
    await store.loadProject(id)
    emit('update:modelValue', false)
  } catch (error) {
    console.error('Error loading project:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to load project',
      color: 'red'
    })
  } finally {
    loadingProject.value = null
  }
}

async function deleteProject(id: string) {
  // Changed to use nuxtApp.$confirm instead of destructuring
  if (!await nuxtApp.$confirm('Are you sure you want to delete this project?')) return

  deletingProject.value = id
  try {
    await store.deleteProject(id)
    projects.value = await store.listProjects()
    toast.add({
      title: 'Success',
      description: 'Project deleted successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete project',
      color: 'red'
    })
  } finally {
    deletingProject.value = null
  }
}

// Experimental modal methods
function openCreateProjectModal() {
  newProjectName.value = ''
  isCreateProjectModalOpen.value = true
}

async function confirmCreateProject() {
  if (!newProjectName.value) return
  try {
    const documentText = useLocalStorage('document-text', '').value
    await store.createProject(newProjectName.value, documentText)
    projects.value = await store.listProjects()
    emit('update:modelValue', false)
    toast.add({
      title: 'Success',
      description: 'Project created successfully',
      color: 'green'
    })
    isCreateProjectModalOpen.value = false
  } catch (error) {
    console.error('Error creating project:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to create project',
      color: 'red'
    })
  }
}

function openDeleteModal(project: Project) {
  projectToDelete.value = project
  isDeleteConfirmModalOpen.value = true
}

async function confirmDeleteProject() {
  if (!projectToDelete.value) return
  try {
    await store.deleteProject(projectToDelete.value.id)
    projects.value = await store.listProjects()
    toast.add({
      title: 'Success',
      description: 'Project deleted successfully',
      color: 'green'
    })
  } catch (error) {
    console.error('Error deleting project:', error)
    toast.add({
      title: 'Error',
      description: 'Failed to delete project',
      color: 'red'
    })
  } finally {
    isDeleteConfirmModalOpen.value = false
    projectToDelete.value = null
  }
}

// Feature-flagged handlers
async function handleCreateProject() {
  if (experimental) {
    openCreateProjectModal()
  } else {
    const name = await nuxtApp.$prompt('Enter project name')
    if (!name) return
    try {
      const documentText = useLocalStorage('document-text', '').value
      await store.createProject(name, documentText)
      projects.value = await store.listProjects()
      emit('update:modelValue', false)
      toast.add({
        title: 'Success',
        description: 'Project created successfully',
        color: 'green'
      })
    } catch (error) {
      console.error('Error creating project:', error)
      toast.add({
        title: 'Error',
        description: 'Failed to create project',
        color: 'red'
      })
    }
  }
}

async function handleDeleteProject(project: Project) {
  if (experimental) {
    openDeleteModal(project)
  } else {
    if (!await nuxtApp.$confirm('Are you sure you want to delete this project?')) return
    try {
      await store.deleteProject(project.id)
      projects.value = await store.listProjects()
      toast.add({
        title: 'Success',
        description: 'Project deleted successfully',
        color: 'green'
      })
    } catch (error) {
      console.error('Error deleting project:', error)
      toast.add({
        title: 'Error',
        description: 'Failed to delete project',
        color: 'red'
      })
    }
  }
}

// Utilities
function formatDate(date?: string) {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });
}
</script> 