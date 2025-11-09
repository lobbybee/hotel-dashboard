<template>
  <div class="page-container">
    <!-- Page Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="content-container">
        <div class="header-content">
          <div>
            <h1 class="page-title">Message Templates</h1>
            <p class="page-subtitle">Manage message templates for guest communications</p>
          </div>
          <div v-if="userRole !== 'receptionist'" class="mt-4 sm:mt-0">
            <button
              type="button"
              class="btn btn-primary"
              @click="showAddModal = true"
            >
              <i class="pi pi-plus mr-2"></i>
              Add Template
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="content-container">
      <div class="py-8">
        <!-- Status Cards Row -->
      <div class="stats-bar">
        <div class="icon-card icon-card-primary">
          <div class="icon-card-icon">
            <i class="pi pi-file-text"></i>
          </div>
          <div class="icon-card-content">
            <p class="icon-card-number">{{ totalCount }}</p>
            <p class="icon-card-label">Total Templates</p>
          </div>
        </div>
        <div class="icon-card icon-card-success">
          <div class="icon-card-icon">
            <i class="pi pi-check-circle"></i>
          </div>
          <div class="icon-card-content">
            <p class="icon-card-number">{{ customTemplates.filter(t=>t.is_active).length }}</p>
            <p class="icon-card-label">Active</p>
          </div>
        </div>
        <div class="icon-card icon-card-danger">
          <div class="icon-card-icon">
            <i class="pi pi-times-circle"></i>
          </div>
          <div class="icon-card-content">
            <p class="icon-card-number">{{ customTemplates.filter(t=>!t.is_active).length }}</p>
            <p class="icon-card-label">Inactive</p>
          </div>
        </div>
      </div>



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

      <!-- Templates Grid -->
      <div v-else-if="customTemplates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        <div
          v-for="template in customTemplates"
          :key="template.id"
          class="card card-hoverable"
          :class="{ 'opacity-75': !template.is_active }"
        >
          <div class="card-header">
            <div class="flex justify-between items-start">
              <div class="flex gap-2 flex-wrap">
                <span class="badge badge-info">
                  {{ template.category }}
                </span>
                <span class="badge badge-secondary">
                  {{ template.template_type }}
                </span>
              </div>
              <div class="flex gap-1" v-if="userRole !== 'receptionist'">
                <button
                  @click="viewTemplate(template)"
                  class="btn btn-ghost btn-icon"
                  :aria-label="'View ' + template.name"
                >
                  <i class="pi pi-eye"></i>
                </button>
                <button
                  @click="previewTemplateContent(template)"
                  class="btn btn-ghost btn-icon"
                  :aria-label="'Preview ' + template.name"
                >
                  <i class="pi pi-search"></i>
                </button>
                <button
                  @click="editTemplate(template)"
                  class="btn btn-ghost btn-icon"
                  :aria-label="'Edit ' + template.name"
                >
                  <i class="pi pi-pencil"></i>
                </button>
                <button
                  @click="toggleTemplateStatus(template)"
                  class="btn btn-ghost btn-icon"
                  :class="template.is_active ? 'btn-warning' : 'btn-success'"
                  :aria-label="template.is_active ? 'Deactivate ' + template.name : 'Activate ' + template.name"
                >
                  <i class="pi pi-power-off"></i>
                </button>
                <button
                  @click="deleteTemplate(template)"
                  class="btn btn-ghost btn-icon btn-danger"
                  :aria-label="'Delete ' + template.name"
                >
                  <i class="pi pi-trash"></i>
                </button>
              </div>
            </div>
          </div>

          <div class="card-body">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">{{ template.name }}</h3>

            <div class="text-sm text-gray-600 mb-4 line-clamp-3">
              {{ truncateText(template.content, 100) }}
            </div>

            <div class="flex items-center gap-2 text-xs text-gray-500 mb-4">
              <i v-if="template.variables && template.variables.length > 0" class="pi pi-code"></i>
              <span v-if="template.variables && template.variables.length > 0">
                {{ template.variables.length }} variables
              </span>
              <span v-else>
                <i class="pi pi-info-circle"></i>
                No variables
              </span>
            </div>

            <div class="pt-3 border-t border-gray-100">
              <span
                class="badge"
                :class="template.is_active ? 'badge-success' : 'badge-danger'"
              >
                <i :class="template.is_active ? 'pi pi-check-circle' : 'pi pi-times-circle'" class="mr-1"></i>
                {{ template.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="empty-state">
        <div class="empty-state-content">
          <div class="empty-state-icon">
            <i class="pi pi-file-text"></i>
          </div>
          <h3 class="empty-state-title">No Templates Found</h3>
          <p class="empty-state-description">
            {{ searchQuery || selectedType || selectedCategory || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by creating your first message template'
            }}
          </p>
          <button
            v-if="!searchQuery && selectedType === null && selectedCategory === null && selectedFilter === 'all' && userRole !== 'receptionist'"
            class="btn btn-primary"
            @click="showAddModal = true"
          >
            <i class="pi pi-plus mr-2"></i>
            Create Your First Template
          </button>
        </div>
      </div>
      </div>
    </main>

    <!-- Add/Edit Modal -->
    <Dialog
      v-model:visible="showAddModal"
      :header="isEditing ? 'Edit Template' : 'Add New Template'"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
      class="p-dialog-maximized"
    >
      <form @submit.prevent="handleSubmit" class="form-container">
        <div class="form-field">
          <label for="name">Template Name *</label>
          <input
            id="name"
            v-model="formData.name"
            type="text"
            placeholder="e.g., Welcome Message"
            required
            class="form-input"
          />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div class="form-field">
            <label for="template_type">Template Type *</label>
            <Select
              id="template_type"
              v-model="formData.template_type"
              :options="templateTypeOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
              :showClear="true"
              :filter="true"
              :filterPlaceholder="'Search types...'"
              required
              class="w-full"
              :class="{ 'p-invalid': !formData.template_type }"
              :emptyMessage="'No template types available'"
              :emptyFilterMessage="'No template types found'"
            />
          </div>

          <div class="form-field">
            <label for="category">Category *</label>
            <Select
              id="category"
              v-model="formData.category"
              :options="categoryOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select category"
              :showClear="true"
              :filter="true"
              :filterPlaceholder="'Search categories...'"
              required
              class="w-full"
              :class="{ 'p-invalid': !formData.category }"
              :emptyMessage="'No categories available'"
              :emptyFilterMessage="'No categories found'"
            />
          </div>
        </div>

        <div class="form-field">
          <label for="media_url">Media URL (Optional)</label>
          <div class="flex gap-2">
            <input
              id="media_url"
              v-model="formData.media_url"
              type="text"
              placeholder="Enter media URL or upload file"
              class="form-input flex-1"
            />
            <button
              type="button"
              class="btn btn-secondary"
              @click="showMediaUpload = true"
            >
              <i class="pi pi-upload"></i>
            </button>
          </div>
        </div>

        <div class="form-field">
          <label for="content">Template Content *</label>
          <textarea
            id="content"
            v-model="formData.content"
            placeholder="Enter your template content here. Use {{variable_name}} for variables."
            rows="4"
            required
            class="form-input resize-vertical"
          ></textarea>
          <small class="form-help">Use {'{variable_name}'} syntax for variables (e.g., {'{guest_name}'})</small>
        </div>

        <div class="form-field">
          <label>Available Variables</label>
          <div v-if="templateVariables?.variables" class="variables-help">
            <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
              <button
                v-for="variable in templateVariables.variables.slice(0, 12)"
                :key="variable.name"
                type="button"
                class="variable-chip"
                @click="insertVariable(variable.name)"
                :title="`${variable.description} - Example: ${variable.example}`"
              >
                <span class="variable-name">{{ variable.name }}</span>
                <small class="variable-model">{{ variable.model }}</small>
              </button>
            </div>
            <small class="form-help">Click on any variable to insert it into your template</small>
          </div>
          <div v-else class="text-sm text-gray-500">
            Loading variables...
          </div>
        </div>

    

        <div class="form-field">
          <div class="checkbox-group">
            <input
              id="is_active"
              v-model="formData.is_active"
              type="checkbox"
              class="checkbox"
            />
            <label for="is_active">Active (Available for use)</label>
          </div>
        </div>
      </form>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="closeModal"
        >
          <i class="pi pi-times mr-2"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleSubmit"
          :disabled="isSubmitting"
        >
          <i class="pi pi-check mr-2"></i>
          {{ isEditing ? 'Update' : 'Create' }}
        </button>
      </template>
    </Dialog>

    <!-- View Template Modal -->
    <Dialog
      v-model:visible="showViewModal"
      header="Template Details"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
    >
      <div v-if="selectedTemplate" class="space-y-6">
        <div class="flex justify-between items-start">
          <div>
            <h3 class="text-xl font-semibold text-gray-900">{{ selectedTemplate.name }}</h3>
            <div class="flex gap-2 mt-2">
              <span class="badge badge-info">{{ selectedTemplate.category }}</span>
              <span class="badge badge-secondary">{{ selectedTemplate.template_type }}</span>
              <span
                class="badge"
                :class="selectedTemplate.is_active ? 'badge-success' : 'badge-danger'"
              >
                {{ selectedTemplate.is_active ? 'Active' : 'Inactive' }}
              </span>
            </div>
          </div>
        </div>

        <div>
          <h4 class="text-sm font-medium text-gray-900 mb-2">Content</h4>
          <div class="content-display">
            <p>{{ selectedTemplate.content }}</p>
          </div>
        </div>

        <div v-if="selectedTemplate.media_url">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Media</h4>
          <img :src="selectedTemplate.media_url" alt="Template media" class="template-media" />
        </div>

        <div v-if="selectedTemplate.variables && selectedTemplate.variables.length > 0">
          <h4 class="text-sm font-medium text-gray-900 mb-2">Variables Used</h4>
          <div class="flex gap-2 flex-wrap">
            <span
              v-for="variable in selectedTemplate.variables"
              :key="variable"
              class="badge badge-info"
            >
              {{ variable }}
            </span>
          </div>
        </div>

        <div class="bg-gray-50 rounded-lg p-4">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div>
              <strong class="text-gray-900">Created:</strong>
              <span class="text-gray-600 ml-2">{{ formatDate(selectedTemplate.created_at) }}</span>
            </div>
            <div>
              <strong class="text-gray-900">Last Updated:</strong>
              <span class="text-gray-600 ml-2">{{ formatDate(selectedTemplate.updated_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Preview Modal -->
    <Dialog
      v-model:visible="showPreviewModal"
      header="Template Preview"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
    >
      <div v-if="previewData" class="space-y-4">
        <div class="flex justify-between items-center">
          <h4 class="text-lg font-medium text-gray-900">{{ previewData.template_name }}</h4>
          <span class="badge badge-info">Sample Preview</span>
        </div>
        <div class="content-display">
          <p>{{ previewData.rendered_content }}</p>
        </div>
        <div>
          <h5 class="text-sm font-medium text-gray-900 mb-3">Sample Data Used:</h5>
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div
              v-for="(value, key) in previewData.sample_data"
              :key="key"
              class="text-sm"
            >
              <strong class="text-gray-900">{{ key }}:</strong>
              <span class="text-gray-600 ml-2">{{ value }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Media Upload Modal -->
    <Dialog
      v-model:visible="showMediaUpload"
      header="Upload Media"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
    >
      <div class="space-y-4">
        <div class="file-upload-container">
          <input
            type="file"
            id="media_file"
            @change="handleMediaFileChange"
            accept="image/*"
            class="file-input"
            ref="mediaFileInput"
          />
          <label for="media_file" class="file-upload-label">
            <i class="pi pi-upload text-2xl text-gray-400 mb-2"></i>
            <p class="text-gray-900">
              {{ mediaFile ? mediaFile.name : 'Choose Media File' }}
            </p>
          </label>
        </div>
        <small class="form-help">Upload images (JPEG, PNG, GIF, WebP) up to 5MB</small>
      </div>

      <template #footer>
        <button
          type="button"
          class="btn btn-secondary"
          @click="showMediaUpload = false"
        >
          <i class="pi pi-times mr-2"></i>
          Cancel
        </button>
        <button
          type="button"
          class="btn btn-primary"
          @click="handleMediaUpload"
          :disabled="isUploadingMedia"
        >
          <i class="pi pi-check mr-2"></i>
          Upload
        </button>
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import Dialog from 'primevue/dialog';
import Select from 'primevue/select';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import type {
  CustomMessageTemplate,
  CustomTemplateCreateData,
  CustomTemplateUpdateData,
  TemplateVariable
} from '~/composables/useMessageTemplate';
import { useAuthStore } from '~/stores/auth';

// Composables
const toast = useToast();
const confirm = useConfirm();

// API Functions
const { customTemplates, totalCount, isLoading, error, refetch } = useFetchCustomTemplates();
const { createCustomTemplate } = useCreateCustomTemplate();
const { updateCustomTemplate } = useUpdateCustomTemplate();
const { partialUpdateCustomTemplate } = usePartialUpdateCustomTemplate();
const { deleteCustomTemplate } = useDeleteCustomTemplate();
const { previewTemplate } = usePreviewTemplate();
const { uploadTemplateMedia } = useUploadTemplateMedia();
const { templateTypes } = useFetchTemplateTypes();
const { templateVariables } = useFetchTemplateVariables();
const authStore = useAuthStore();
const { userRole } = storeToRefs(authStore);

// Reactive State
const searchQuery = ref('');
const selectedType = ref('');
const selectedCategory = ref('');
const selectedFilter = ref('all');
const showAddModal = ref(false);
const showViewModal = ref(false);
const showPreviewModal = ref(false);
const showMediaUpload = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const isUploadingMedia = ref(false);
const selectedTemplate = ref<CustomMessageTemplate | null>(null);
const previewData = ref<any>(null);
const mediaFile = ref<File | null>(null);
const mediaFileInput = ref<HTMLInputElement>();

// Filter Options
const filterOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active Only', value: 'active' },
  { label: 'Inactive Only', value: 'inactive' }
];

// Form Data
const formData = reactive<{
  name: string;
  template_type: string;
  category: string;
  content: string;
  variables: string[];
  is_active: boolean;
  media_url?: string;
}>({
  name: '',
  template_type: '',
  category: '',
  content: '',
  variables: [],
  is_active: true,
  media_url: ''
});

// Computed
const templateTypeOptions = computed(() => {
  // Handle API data format: [["greeting", "Greeting"], ["checkin", "Check-in"], ...]
  // Access the .value property since templateTypes is a Vue ref/computed
  const apiData = templateTypes.value?.template_types || [];
  
  if (Array.isArray(apiData) && apiData.length > 0) {
    const convertedOptions = apiData.map((item: any) => {
      if (Array.isArray(item) && item.length >= 2) {
        return { value: item[0], label: item[1] };
      }
      // Handle if it's already in correct format
      if (typeof item === 'object' && item !== null && item.value && item.label) {
        return item;
      }
      return null;
    }).filter(Boolean);
    
    return convertedOptions;
  }
  
  // Return empty array if no API data available
  return [];
});

const categoryOptions = computed(() => {
  // Handle API data format: [["greeting", "Greeting"], ["checkin", "Check-in"], ...]
  // Access the .value property since templateTypes is a Vue ref/computed
  const apiData = templateTypes.value?.categories || [];
  
  if (Array.isArray(apiData) && apiData.length > 0) {
    const convertedOptions = apiData.map((item: any) => {
      if (Array.isArray(item) && item.length >= 2) {
        return { value: item[0], label: item[1] };
      }
      // Handle if it's already in correct format
      if (typeof item === 'object' && item !== null && item.value && item.label) {
        return item;
      }
      return null;
    }).filter(Boolean);
    
    return convertedOptions;
  }
  
  // Return empty array if no API data available
  return [];
});

const currentParams = computed(() => {
  const params: any = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (selectedType.value) params.template_type = selectedType.value;
  if (selectedCategory.value) params.category = selectedCategory.value;
  if (selectedFilter.value === 'active') params.is_active = true;
  if (selectedFilter.value === 'inactive') params.is_active = false;
  return params;
});

// Methods
const refreshData = () => {
  refetch();
  showToast('success', 'Refreshed', 'Templates list has been refreshed');
};

const handleSearch = () => {
  refetch(currentParams.value);
};

const handleFilterChange = () => {
  refetch(currentParams.value);
};

const viewTemplate = (template: CustomMessageTemplate) => {
  selectedTemplate.value = template;
  showViewModal.value = true;
};

const editTemplate = (template: CustomMessageTemplate) => {
  selectedTemplate.value = template;
  formData.name = template.name;
  formData.template_type = template.template_type;
  formData.category = template.category;
  formData.content = template.content;
  formData.variables = template.variables || [];
  formData.is_active = template.is_active;
  formData.media_url = template.media_url || '';
  isEditing.value = true;
  showAddModal.value = true;
};

const previewTemplateContent = async (template: CustomMessageTemplate) => {
  try {
    const result = await previewTemplate(template.id);
    previewData.value = result;
    showPreviewModal.value = true;
  } catch (error) {
    showToast('error', 'Error', 'Failed to preview template');
  }
};

const toggleTemplateStatus = async (template: CustomMessageTemplate) => {
  const action = template.is_active ? 'deactivate' : 'activate';

  confirm.require({
    message: `Are you sure you want to ${action} this template?`,
    header: 'Confirm Action',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        const updateData: Partial<CustomTemplateUpdateData> = { is_active: !template.is_active };
        await usePartialUpdateCustomTemplate().mutateAsync({ id: template.id, data: updateData });
        refetch();
        showToast('success', 'Success', `Template ${action}d successfully`);
      } catch (error) {
        showToast('error', 'Error', `Failed to ${action} template`);
      }
    }
  });
};

const deleteTemplate = (template: CustomMessageTemplate) => {
  confirm.require({
    message: `Are you sure you want to delete "${template.name}"? This action cannot be undone.`,
    header: 'Delete Template',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deleteCustomTemplate(template.id);
        refetch();
        showToast('success', 'Deleted', 'Template deleted successfully');
      } catch (error) {
        showToast('error', 'Error', 'Failed to delete template');
      }
    }
  });
};

const insertVariable = (variableName: string) => {
  const variableSyntax = `{{${variableName}}}`;
  formData.content += (formData.content ? ' ' : '') + variableSyntax;
};

const handleMediaFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    mediaFile.value = target.files[0];
  }
};

const triggerMediaFileSelect = () => {
  mediaFileInput.value?.click();
};

const handleMediaUpload = async () => {
  if (!mediaFile.value) {
    showToast('error', 'Error', 'Please select a media file');
    return;
  }

  isUploadingMedia.value = true;

  try {
    const result = await uploadTemplateMedia(mediaFile.value);
    formData.media_url = result.file_url;
    showMediaUpload.value = false;
    mediaFile.value = null;
    if (mediaFileInput.value) {
      mediaFileInput.value.value = '';
    }
    showToast('success', 'Uploaded', 'Media uploaded successfully');
  } catch (error) {
    showToast('error', 'Error', 'Failed to upload media');
  } finally {
    isUploadingMedia.value = false;
  }
};

const handleSubmit = async () => {
  if (!formData.content.trim()) {
    showToast('error', 'Error', 'Template content cannot be empty');
    return;
  }

  // Extract variables from content
  const variableRegex = /\{\{(\w+)\}\}/g;
  const extractedVariables = [];
  let match;
  while ((match = variableRegex.exec(formData.content)) !== null) {
    extractedVariables.push(match[1]);
  }

  isSubmitting.value = true;

  try {
    if (isEditing.value && selectedTemplate.value) {
      const updateData: CustomTemplateUpdateData = {
        name: formData.name,
        template_type: formData.template_type,
        category: formData.category,
        content: formData.content,
        variables: extractedVariables,
        is_active: formData.is_active,
        media_url: formData.media_url || undefined
      };

      await updateCustomTemplate({ id: selectedTemplate.value.id, data: updateData });
      showToast('success', 'Updated', 'Template updated successfully');
    } else {
      const createData: CustomTemplateCreateData = {
        name: formData.name,
        template_type: formData.template_type,
        category: formData.category,
        content: formData.content,
        variables: extractedVariables,
        is_active: formData.is_active,
        media_url: formData.media_url || undefined
      };

      await createCustomTemplate(createData);
      showToast('success', 'Created', 'Template created successfully');
    }

    refetch();
    closeModal();
  } catch (error) {
    showToast('error', 'Error', isEditing.value ? 'Failed to update template' : 'Failed to create template');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  isEditing.value = false;
  selectedTemplate.value = null;
  formData.name = '';
  formData.template_type = '';
  formData.category = '';
  formData.content = '';
  formData.variables = [];
  formData.is_active = true;
  formData.media_url = '';
};

const truncateText = (text: string, maxLength: number) => {
  return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
};

const formatDate = (dateString: string) => {
  const date = new Date(dateString);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
  toast.add({ severity, summary, detail, life: 3000 });
};

// Lifecycle
onMounted(() => {
  refetch();
});
</script>

<style scoped>
/* Design System Compliant Styles */

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

/* Stats Bar */
.stats-bar {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 1rem;
  margin-bottom: 2rem;
}

@media (min-width: 640px) {
  .stats-bar {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .stats-bar {
    grid-template-columns: repeat(3, 1fr);
  }
}

/* Icon Card Pattern */
.icon-card {
  display: flex;
  align-items: center;
  gap: 1rem;
  background-color: #FFFFFF;
  padding: 1.5rem;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.icon-card:hover {
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.icon-card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 3rem;
  height: 3rem;
  border-radius: 0.5rem;
  font-size: 1.25rem;
  flex-shrink: 0;
}

.icon-card-primary .icon-card-icon {
  background-color: #DBEAFE;
  color: #1E40AF;
}

.icon-card-success .icon-card-icon {
  background-color: #D1FAE5;
  color: #059669;
}

.icon-card-danger .icon-card-icon {
  background-color: #FEE2E2;
  color: #DC2626;
}

.icon-card-number {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1.2;
  color: #111827;
  margin: 0 0 0.25rem 0;
}

.icon-card-label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #6B7280;
  margin: 0;
}

/* Card Pattern */
.card {
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 1.5rem;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06);
  transition: all 0.2s ease;
}

.card-hoverable:hover {
  border-color: #D1D5DB;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
}

.card-body {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
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

.btn-ghost {
  background-color: transparent;
  color: #6B7280;
  border-color: transparent;
}

.btn-ghost:hover:not(:disabled) {
  background-color: #F3F4F6;
  color: #374151;
}

.btn-icon {
  padding: 0.5rem;
  aspect-ratio: 1;
}

.btn-icon.btn-sm {
  padding: 0.375rem;
  aspect-ratio: 1;
}

/* Button Sizes */
.btn-sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
  min-height: 1.875rem;
}

/* Button Colors */
.btn-success {
  background-color: #059669;
  color: #FFFFFF;
}

.btn-success:hover:not(:disabled) {
  background-color: #047857;
}

.btn-warning {
  background-color: #D97706;
  color: #FFFFFF;
}

.btn-warning:hover:not(:disabled) {
  background-color: #B45309;
}

.btn-danger {
  background-color: #DC2626;
  color: #FFFFFF;
}

.btn-danger:hover:not(:disabled) {
  background-color: #B91C1C;
}

/* Badge System */
.badge {
  display: inline-flex;
  align-items: center;
  padding: 0.25rem 0.5rem;
  font-size: 0.75rem;
  font-weight: 500;
  line-height: 1;
  border-radius: 9999px;
  border: 1px solid transparent;
}

.badge-info {
  background-color: #DBEAFE;
  color: #1E40AF;
  border-color: #BFDBFE;
}

.badge-secondary {
  background-color: #F3F4F6;
  color: #374151;
  border-color: #E5E7EB;
}

.badge-success {
  background-color: #D1FAE5;
  color: #059669;
  border-color: #A7F3D0;
}

.badge-danger {
  background-color: #FEE2E2;
  color: #DC2626;
  border-color: #FECACA;
}

/* Form System */
.form-input {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.25rem;
  color: #111827;
  background-color: #FFFFFF;
  border: 1px solid #D1D5DB;
  border-radius: 0.375rem;
  transition: all 0.2s ease;
}

.form-input:focus {
  outline: 2px solid #2563EB;
  outline-offset: 0;
  border-color: #2563EB;
}

.form-input:disabled {
  background-color: #F9FAFB;
  color: #6B7280;
  cursor: not-allowed;
}

.form-input::placeholder {
  color: #9CA3AF;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-field label {
  font-size: 0.875rem;
  font-weight: 500;
  color: #374151;
}

.form-help {
  font-size: 0.75rem;
  color: #6B7280;
  margin-top: 0.25rem;
}

.input-with-icon {
  position: relative;
}

.input-icon {
  position: absolute;
  left: 0.75rem;
  top: 50%;
  transform: translateY(-50%);
  color: #9CA3AF;
  font-size: 0.875rem;
}

.form-input.pl-10 {
  padding-left: 2.5rem;
}

/* Checkbox System */
.checkbox-group {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.checkbox {
  width: 1rem;
  height: 1rem;
  accent-color: #2563EB;
  border: 1px solid #D1D5DB;
  border-radius: 0.25rem;
  cursor: pointer;
}

.checkbox:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
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

/* Content Display */
.content-display {
  background-color: #F9FAFB;
  border-left: 4px solid #2563EB;
  padding: 1rem;
  border-radius: 0.375rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #374151;
}

.template-media {
  max-width: 100%;
  max-height: 18rem;
  border-radius: 0.5rem;
  border: 1px solid #E5E7EB;
}

/* Variables Grid */
.variables-help {
  background-color: #F9FAFB;
  border: 1px solid #E5E7EB;
  border-radius: 0.5rem;
  padding: 1rem;
}

.variable-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background-color: #FFFFFF;
  border: 1px solid #E5E7EB;
  border-radius: 0.375rem;
  cursor: pointer;
  transition: all 0.2s ease;
  gap: 0.5rem;
}

.variable-chip:hover {
  border-color: #2563EB;
  background-color: #F3F4F6;
}

.variable-name {
  font-family: ui-monospace, SFMono-Regular, 'SF Mono', Consolas, 'Liberation Mono', Menlo, monospace;
  font-weight: 500;
  color: #2563EB;
  font-size: 0.75rem;
}

.variable-model {
  color: #6B7280;
  font-size: 0.625rem;
}

/* File Upload */
.file-upload-container {
  position: relative;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  border: 2px dashed #D1D5DB;
  border-radius: 0.5rem;
  background-color: #F9FAFB;
  cursor: pointer;
  transition: all 0.3s ease;
  gap: 0.5rem;
}

.file-upload-label:hover {
  border-color: #2563EB;
  background-color: #F3F4F6;
}

/* Utilities */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

.resize-vertical {
  resize: vertical;
  min-height: 6rem;
}

.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.space-y-4 > * + * {
  margin-top: 1rem;
}

.space-y-6 > * + * {
  margin-top: 1.5rem;
}

.mr-2 {
  margin-right: 0.5rem;
}

.ml-2 {
  margin-left: 0.5rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-3 {
  margin-bottom: 0.75rem;
}

.mb-4 {
  margin-bottom: 1rem;
}

.gap-1 {
  gap: 0.25rem;
}

.gap-2 {
  gap: 0.5rem;
}

.gap-3 {
  gap: 0.75rem;
}

.gap-4 {
  gap: 1rem;
}

.gap-6 {
  gap: 1.5rem;
}

.flex-1 {
  flex: 1;
}

.grid {
  display: grid;
}

/* Mobile-First Responsive Design */
@media (max-width: 639px) {
  .stats-bar {
    grid-template-columns: 1fr;
  }

  .header-content {
    flex-direction: column;
    align-items: flex-start;
    gap: 1rem;
  }

  .icon-card {
    padding: 1rem;
  }

  .card {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 0.75rem;
    align-items: flex-start;
  }

  .form-grid {
    grid-template-columns: 1fr !important;
  }
}

@media (max-width: 767px) {
  .content-container {
    padding: 0 1rem;
  }

  .p-dialog-maximized {
    width: 95vw !important;
    max-width: 95vw !important;
  }
}

/* Focus Management for Accessibility */
.btn:focus-visible,
.form-input:focus-visible,
.checkbox:focus-visible,
.variable-chip:focus-visible {
  outline: 2px solid #2563EB;
  outline-offset: 2px;
}

/* High Contrast Mode Support */
@media (prefers-contrast: high) {
  .btn {
    border-width: 2px;
  }

  .form-input {
    border-width: 2px;
  }

  .card {
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
