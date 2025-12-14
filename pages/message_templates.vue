<template>
  <div class="page-container">
    <!-- Page Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="content-container">
        <div class="header-content">
          <div>
            <h1 class="page-title">Template Management</h1>
            <p class="page-subtitle">
              Create custom templates from global templates for guest communications
            </p>
          </div>
          <div v-if="userRole !== 'receptionist'" class="mt-4 sm:mt-0">
            <button
              type="button"
              class="btn btn-primary"
              @click="openCreateModal"
            >
              <i class="pi pi-plus mr-2"></i>
              Create New Template
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="content-container">
      <div class="py-8">
        <!-- Loading State -->
        <div v-if="isLoading" class="loading-state">
          <div class="loading-spinner">
            <div class="spinner"></div>
          </div>
          <p class="loading-text">Loading templates...</p>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="error-state">
          <div class="error-content">
            <div class="error-icon">
              <i class="pi pi-exclamation-triangle"></i>
            </div>
            <h3 class="error-title">Error Loading Templates</h3>
            <p class="error-message">{{ error.message || 'Failed to load templates' }}</p>
            <button class="btn btn-secondary" @click="refreshData">
              <i class="pi pi-refresh mr-2"></i>
              Retry
            </button>
          </div>
        </div>

        <!-- Templates List -->
        <div v-else>
          <!-- Empty State -->
          <div v-if="customTemplates.length === 0" class="empty-state">
            <div class="empty-state-content">
              <div class="empty-state-icon">
                <i class="pi pi-file-text"></i>
              </div>
              <h3 class="empty-state-title">No Custom Templates</h3>
              <p class="empty-state-description">
                Create your first custom template from global templates
              </p>
              <button
                v-if="userRole !== 'receptionist'"
                class="btn btn-primary"
                @click="openCreateModal"
              >
                <i class="pi pi-plus mr-2"></i>
                Create Template
              </button>
            </div>
          </div>

          <!-- Templates Grid -->
          <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            <TemplateCard
              v-for="template in customTemplates"
              :key="template.id"
              :template="template"
              @edit="editTemplate"
              @toggle="toggleTemplateStatus"
              @delete="deleteTemplate"
            />
          </div>
        </div>
      </div>
    </main>

    <!-- Create/Edit Modal -->
    <TemplateFormModal
      v-model:visible="showCreateModal"
      :editing-template="editingTemplate"
      :existing-templates="customTemplates"
      @template-saved="onTemplateSaved"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useToast } from 'primevue/usetoast'
import { useConfirm } from 'primevue/useconfirm'
import { storeToRefs } from 'pinia'
import type { CustomMessageTemplate } from '~/composables/useMessageTemplate'
import { useAuthStore } from '~/stores/auth'

// Components
import { TemplateCard, TemplateFormModal } from '~/components/Template'

// PrimeVue Components
// Note: Using native buttons with custom classes for better control

// Composables
import { 
  useFetchCustomTemplates,
  usePartialUpdateCustomTemplate,
  useDeleteCustomTemplate
} from '~/composables/useMessageTemplate'

const toast = useToast()
const confirm = useConfirm()

const { 
  customTemplates, 
  totalCount, 
  isLoading, 
  error, 
  refetch 
} = useFetchCustomTemplates()

const { 
  partialUpdateCustomTemplate 
} = usePartialUpdateCustomTemplate()

const { 
  deleteTemplate: deleteTemplateAPI 
} = useDeleteCustomTemplate()

// Store
const authStore = useAuthStore()
const { userRole } = storeToRefs(authStore)

// Reactive State
const showCreateModal = ref(false)
const editingTemplate = ref<CustomMessageTemplate | null>(null)

// Methods
const refreshData = () => {
  refetch()
  showToast('success', 'Refreshed', 'Templates list has been refreshed')
}

const openCreateModal = () => {
  editingTemplate.value = null
  showCreateModal.value = true
}

const editTemplate = (template: CustomMessageTemplate) => {
  editingTemplate.value = template
  showCreateModal.value = true
}

const onTemplateSaved = () => {
  // Template saved, refetch list
  refetch()
}

const toggleTemplateStatus = async (template: CustomMessageTemplate) => {
  const action = template.is_active ? 'deactivate' : 'activate'

  confirm.require({
    message: `Are you sure you want to ${action} this template?`,
    header: 'Confirm Action',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const updateData = { is_active: !template.is_active }
        await partialUpdateCustomTemplate({ 
          id: template.id, 
          data: updateData 
        })
        refetch()
        showToast('success', 'Success', `Template ${action}d successfully`)
      } catch (error) {
        showToast('error', 'Error', `Failed to ${action} template`)
      }
    }
  })
}

const deleteTemplate = (template: CustomMessageTemplate) => {
  confirm.require({
    message: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
    header: 'Delete Template',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteTemplateAPI(template.id)
        refetch()
        showToast('success', 'Deleted', 'Template deleted successfully')
      } catch (error) {
        showToast('error', 'Error', 'Failed to delete template')
      }
    }
  })
}

const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
  toast.add({ severity, summary, detail, life: 3000 })
}
</script>

<style scoped>
/* Page Container */
.page-container {
  min-height: 100vh;
  background-color: #F9FAFB;
}

.content-container {
  max-width: 80rem;
  margin: 0 auto;
  padding: 0 1rem;
}

@media (min-width: 640px) {
  .content-container {
    padding: 0 1.5rem;
  }
}

@media (min-width: 1024px) {
  .content-container {
    padding: 0 2rem;
  }
}

/* Header */
header {
  position: relative;
  z-index: 10;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  padding: 1.5rem 0;
  gap: 1rem;
}

@media (min-width: 640px) {
  .header-content {
    align-items: center;
    gap: 0;
  }
}

.page-title {
  font-size: 1.875rem;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.page-subtitle {
  font-size: 1rem;
  line-height: 1.5;
  color: #6B7280;
  margin: 0;
}

/* Button System */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1;
  border-radius: 0.375rem;
  border: 1px solid transparent;
  cursor: pointer;
  transition: all 0.2s ease;
  text-decoration: none;
  min-height: 2.25rem;
  white-space: nowrap;
  gap: 0.5rem;
}

.btn:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Button Variants */
.btn-primary {
  background-color: #2563EB;
  color: #FFFFFF;
}

.btn-primary:hover:not(:disabled) {
  background-color: #1D4ED8;
}

.btn-secondary {
  background-color: #F9FAFB;
  color: #374151;
  border-color: #D1D5DB;
}

.btn-secondary:hover:not(:disabled) {
  background-color: #F3F4F6;
  border-color: #9CA3AF;
}

/* Loading States */
.loading-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  text-align: center;
}

.loading-spinner {
  margin-bottom: 1rem;
}

.spinner {
  width: 2.5rem;
  height: 2.5rem;
  border: 3px solid #E5E7EB;
  border-top: 3px solid #2563EB;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  color: #6B7280;
  font-size: 0.875rem;
}

/* Error States */
.error-state {
  padding: 3rem;
  text-align: center;
}

.error-content {
  max-width: 28rem;
  margin: 0 auto;
}

.error-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: #FEE2E2;
  color: #DC2626;
  border-radius: 50%;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.error-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.error-message {
  color: #6B7280;
  margin: 0 0 1.5rem 0;
}

/* Empty States */
.empty-state {
  padding: 3rem 1rem;
  text-align: center;
}

.empty-state-content {
  max-width: 28rem;
  margin: 0 auto;
}

.empty-state-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 4rem;
  height: 4rem;
  background-color: #F3F4F6;
  color: #9CA3AF;
  border-radius: 50%;
  margin: 0 auto 1rem;
  font-size: 1.5rem;
}

.empty-state-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: #111827;
  margin: 0 0 0.5rem 0;
}

.empty-state-description {
  color: #6B7280;
  margin: 0 0 2rem 0;
}

/* Grid System */
.grid {
  display: grid;
  gap: 1.5rem;
}

@media (min-width: 768px) {
  .md\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1024px) {
  .lg\:grid-cols-2 {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (min-width: 1280px) {
  .xl\:grid-cols-3 {
    grid-template-columns: repeat(3, minmax(0, 1fr));
  }
}

.gap-6 {
  gap: 1.5rem;
}

/* Focus Management for Accessibility */
.btn:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
  *,
  *::before,
  *::after {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
    scroll-behavior: auto !important;
  }
}
</style>