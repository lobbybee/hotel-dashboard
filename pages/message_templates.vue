<template>
  <div class="page-container">
    <!-- Page Header -->
    <header class="bg-white border-b border-gray-200 shadow-sm">
      <div class="content-container">
        <div class="header-content">
          <div>
            <h1 class="page-title">
              {{ activeTab === 'custom' ? 'My Templates' : 'Global Templates' }}
            </h1>
            <p class="page-subtitle">
              {{ activeTab === 'custom'
                ? 'Manage your custom message templates for guest communications'
                : 'Browse global templates and create custom versions'
              }}
            </p>
          </div>
          <div v-if="userRole !== 'receptionist' && activeTab === 'custom'" class="mt-4 sm:mt-0">
            <button
              type="button"
              class="btn btn-primary"
              @click="openAddModal"
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



      <!-- Tab Navigation -->
      <div class="mb-6">
        <div class="border-b border-gray-200">
          <nav class="-mb-px flex space-x-8">
            <button
              @click="switchTab('custom')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'custom'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              My Templates ({{ customTotalCount }})
            </button>
            <button
              @click="switchTab('global')"
              :class="[
                'py-2 px-1 border-b-2 font-medium text-sm transition-colors',
                activeTab === 'global'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              ]"
            >
              Global Templates ({{ globalTotalCount }})
            </button>
          </nav>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="loading-state">
        <div class="loading-spinner">
          <div class="spinner"></div>
        </div>
        <p class="loading-text">Loading {{ activeTab }} templates...</p>
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
      <div v-else-if="currentTemplates.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="template in currentTemplates"
          :key="template.id"
          class="card card-hoverable"
          :class="{ 'opacity-75': !template.is_active }"
        >
          <div class="card-header">
            <div class="flex justify-between items-center">
              <div class="flex gap-2 flex-wrap">
                <span class="badge badge-info" v-if="template.category">
                  {{ template.category }}
                </span>
                <span class="badge badge-secondary">
                  {{ template.template_type }}
                </span>
                <span v-if="activeTab === 'global'" class="badge badge-success">
                  Global
                </span>
              </div>
              <div class="flex gap-1">
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
                  v-if="activeTab === 'global' && userRole !== 'receptionist'"
                  @click="createFromGlobal(template)"
                  class="btn btn-ghost btn-icon btn-primary"
                  :aria-label="'Create custom from ' + template.name"
                  title="Create custom template from this global template"
                >
                  <i class="pi pi-copy"></i>
                </button>
                <template v-if="activeTab === 'custom' && userRole !== 'receptionist'">
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
                </template>
              </div>
            </div>
          </div>

          <div class="card-body">
            <h3 class="text-gray-500 mb-3 break-words">{{ template.name }}</h3>

            <div v-if="template.description" class=" mb-2 italic line-clamp-2 text-lg font-semibold text-gray-900">
              {{ template.description }}
            </div>

            <!-- Media Preview -->
            <div v-if="template.media_url || template.media_file" class="mb-3">
              <img 
                :src="template.media_url || template.media_file" 
                :alt="template.name" 
                class="w-full h-32 object-cover rounded-lg border border-gray-200"
                @error="$event.target.style.display='none'"
              />
            </div>

            <div class="text-sm text-gray-600 mb-4 line-clamp-3">
              {{ truncateText(template.text_content || template.content, 100) }}
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
          <h3 class="empty-state-title">
            {{ activeTab === 'custom' ? 'No Custom Templates' : 'No Global Templates' }}
          </h3>
          <p class="empty-state-description">
            {{ searchQuery || selectedType || selectedCategory || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : activeTab === 'custom'
                ? 'Create your first custom template or copy from global templates'
                : 'No global templates are available at the moment'
            }}
          </p>
          <div class="flex gap-3 justify-center" v-if="!searchQuery && selectedType === null && selectedCategory === null && selectedFilter === 'all' && userRole !== 'receptionist'">
            <button
              v-if="activeTab === 'custom'"
              class="btn btn-primary"
              @click="showAddModal = true"
            >
              <i class="pi pi-plus mr-2"></i>
              Create Template
            </button>
            <button
              v-if="activeTab === 'custom' && globalTotalCount > 0"
              class="btn btn-secondary"
              @click="switchTab('global')"
            >
              <i class="pi pi-copy mr-2"></i>
              Browse Global Templates
            </button>
          </div>
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
          <label for="description">Description (Optional)</label>
          <textarea
            id="description"
            v-model="formData.description"
            placeholder="Describe your template purpose and usage"
            rows="2"
            class="form-input resize-vertical"
          ></textarea>
        </div>

        <div class="form-field">
          <label for="media_file">Media File (Optional)</label>
          <FileUpload
            id="media_file"
            mode="advanced"
            :auto="false"
            accept="image/*,video/*"
            :maxFileSize="5000000"
            :fileLimit="1"
            @select="handleMediaFileSelect"
            @remove="handleMediaFileRemove"
            @clear="handleMediaFileClear"
            chooseLabel="Choose Media File"
            :showUploadButton="false"
            :multiple="false"
            :previewWidth="200"
            :previewHeight="150"
            class="w-full"
            :class="{ 'p-invalid': !formData.media_file && false }"
            :emptyMessage="'No media file selected'"
            :invalidFileSizeMessageSummary="'File size exceeds 5MB limit'"
            :invalidFileTypeMessageSummary="'Only images and videos are allowed'"
          />
          <small class="form-help">Images (JPEG, PNG, GIF, WebP) or videos up to 5MB</small>
        </div>

        <div class="form-field">
          <label for="content">Template Content *</label>
          <textarea
            id="content"
            v-model="formData.text_content"
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
              <span class="badge badge-info" v-if="selectedTemplate.category">{{ selectedTemplate.category }}</span>
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
            <p>{{ selectedTemplate.text_content || selectedTemplate.content }}</p>
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
      header="Template Preview - WhatsApp Style"
      :modal="true"
      :style="{ width: '40rem' }"
      :dismissableMask="true"
    >
      <div v-if="previewData" class="space-y-4">
        <!-- WhatsApp Preview Container -->
        <div class="whatsapp-preview">
          <div class="whatsapp-chat-container">
            <!-- WhatsApp Header -->
            <div class="whatsapp-header">
              <div class="whatsapp-header-avatar">H</div>
              <div class="whatsapp-header-info">
                <div class="whatsapp-header-name">Hotel</div>
                <div class="whatsapp-header-status">Online</div>
              </div>
            </div>

            <!-- Chat Messages -->
            <div class="whatsapp-chat-body">
              <!-- Received Message (Template Preview) -->
              <div class="whatsapp-message received">
                <div class="whatsapp-message-bubble">
                  <p>{{ previewData.rendered_content }}</p>
                  <div class="whatsapp-message-time">Just now</div>
                </div>
              </div>

              <!-- Optional: Show typing indicator for visual effect -->
              <div class="whatsapp-message received">
                <div class="whatsapp-message-bubble">
                  <div class="whatsapp-typing-indicator">
                    <div class="whatsapp-typing-dot"></div>
                    <div class="whatsapp-typing-dot"></div>
                    <div class="whatsapp-typing-dot"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Template Info -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-3">
            <h4 class="text-lg font-medium text-gray-900">{{ previewData.template_name }}</h4>
            <span class="badge badge-info">Sample Preview</span>
          </div>

          <div>
            <h5 class="text-sm font-medium text-gray-900 mb-3">Sample Data Used:</h5>
            <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div
                v-for="(value, key) in previewData.sample_data"
                :key="key"
                class="text-sm bg-white p-2 rounded border"
              >
                <strong class="text-gray-900">{{ key }}:</strong>
                <span class="text-gray-600 ml-1">{{ value }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div v-else class="text-center py-8">
        <p class="text-gray-500">No preview available</p>
      </div>
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
import FileUpload from 'primevue/fileupload';
import Tag from 'primevue/tag';
import type {
  CustomMessageTemplate,
  GlobalMessageTemplate,
  CustomTemplateCreateData,
  CustomTemplateUpdateData,
  TemplateVariable
} from '~/composables/useMessageTemplate';
import { useAuthStore } from '~/stores/auth';

// Composables
const toast = useToast();
const confirm = useConfirm();

// API Functions
const { customTemplates, totalCount: customTotalCount, isLoading: isLoadingCustom, error: errorCustom, refetch: refetchCustom } = useFetchCustomTemplates();
const { globalTemplates, totalCount: globalTotalCount, isLoading: isLoadingGlobal, error: errorGlobal, refetch: refetchGlobal } = useFetchGlobalTemplates();
const { createCustomTemplate } = useCreateCustomTemplate();
const { updateCustomTemplate } = useUpdateCustomTemplate();
const { partialUpdateCustomTemplate } = usePartialUpdateCustomTemplate();
const { deleteCustomTemplate } = useDeleteCustomTemplate();
const { previewTemplate } = usePreviewTemplate();
const { templateTypes } = useFetchTemplateTypes();
const { templateVariables } = useFetchTemplateVariables();
const authStore = useAuthStore();
const { userRole } = storeToRefs(authStore);

// Reactive State
const searchQuery = ref('');
const selectedType = ref('');
const selectedCategory = ref('');
const selectedFilter = ref('all');
const activeTab = ref('custom'); // 'custom' or 'global'
const showAddModal = ref(false);
const showViewModal = ref(false);
const showPreviewModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const selectedTemplate = ref<CustomMessageTemplate | GlobalMessageTemplate | null>(null);
const previewData = ref<any>(null);

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
  text_content: string;
  variables: string[];
  is_active: boolean;
  base_template?: number;
  description?: string;
  media_file?: File;
}>({
  name: '',
  template_type: '',
  category: '',
  text_content: '',
  variables: [],
  is_active: true,
  base_template: undefined,
  description: undefined,
  media_file: undefined
});

// Computed
const isLoading = computed(() => isLoadingCustom.value || isLoadingGlobal.value);
const error = computed(() => errorCustom.value || errorGlobal.value);
const totalCount = computed(() => {
  if (activeTab.value === 'custom') {
    return customTotalCount.value;
  } else {
    // Count only customizable global templates
    return globalTemplates.value.filter(template => template.is_customizable).length;
  }
});
const currentTemplates = computed(() => {
  if (activeTab.value === 'custom') {
    return customTemplates.value;
  } else {
    // Only show global templates that are customizable
    return globalTemplates.value.filter(template => template.is_customizable);
  }
});

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
  if (activeTab.value === 'custom') {
    refetchCustom();
  } else {
    refetchGlobal();
  }
  showToast('success', 'Refreshed', 'Templates list has been refreshed');
};

const handleSearch = () => {
  if (activeTab.value === 'custom') {
    refetchCustom(currentParams.value);
  } else {
    refetchGlobal(currentParams.value);
  }
};

const handleFilterChange = () => {
  if (activeTab.value === 'custom') {
    refetchCustom(currentParams.value);
  } else {
    refetchGlobal(currentParams.value);
  }
};

const switchTab = (tab: 'custom' | 'global') => {
  activeTab.value = tab;
  // Reset filters when switching tabs
  searchQuery.value = '';
  selectedType.value = '';
  selectedCategory.value = '';
  selectedFilter.value = 'all';
  // Load data for the new tab
  refreshData();
};

const viewTemplate = (template: CustomMessageTemplate | GlobalMessageTemplate) => {
  selectedTemplate.value = template;
  showViewModal.value = true;
};

const createFromGlobal = (template: any) => {
  // Populate form with global template data
  formData.name = `${template.name} (Custom)`;
  formData.template_type = template.template_type;
  formData.category = template.category || 'general'; // Default category if not provided
  formData.text_content = template.text_content || template.content || '';
  formData.variables = template.variables || [];
  formData.is_active = true;
  formData.description = template.description;
  formData.base_template = template.id; // Set the base_template to the global template ID
  isEditing.value = false;
  selectedTemplate.value = null;
  showAddModal.value = true;
};

const editTemplate = (template: CustomMessageTemplate) => {
  selectedTemplate.value = template;
  formData.name = template.name;
  formData.template_type = template.template_type;
  formData.category = template.category;
  formData.text_content = template.text_content;
  formData.variables = template.variables || [];
  formData.is_active = template.is_active;
  formData.description = template.description;
  formData.base_template = template.base_template || undefined;
  isEditing.value = true;
  showAddModal.value = true;
};

const openAddModal = () => {
  // Reset form to default values
  formData.name = '';
  formData.template_type = '';
  formData.category = '';
  formData.text_content = '';
  formData.variables = [];
  formData.is_active = true;
  formData.base_template = undefined;
  formData.description = undefined;
  formData.media_file = undefined;
  isEditing.value = false;
  selectedTemplate.value = null;
  showAddModal.value = true;
};

const previewTemplateContent = async (template: CustomMessageTemplate | GlobalMessageTemplate) => {
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
        refetchCustom();
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
        refetchCustom();
        showToast('success', 'Deleted', 'Template deleted successfully');
      } catch (error) {
        showToast('error', 'Error', 'Failed to delete template');
      }
    }
  });
};

const insertVariable = (variableName: string) => {
  const variableSyntax = `{{${variableName}}}`;
  formData.text_content += (formData.text_content ? ' ' : '') + variableSyntax;
};

const handleMediaFileSelect = (event: any) => {
  if (event.files && event.files.length > 0) {
    formData.media_file = event.files[0];
  }
};

const handleMediaFileRemove = () => {
  formData.media_file = undefined;
};

const handleMediaFileClear = () => {
  formData.media_file = undefined;
};

const handleSubmit = async () => {
  if (!formData.text_content.trim()) {
    showToast('error', 'Error', 'Template content cannot be empty');
    return;
  }

  // Extract variables from content
  const variableRegex = /\{\{(\w+)\}\}/g;
  const extractedVariables = [];
  let match;
  while ((match = variableRegex.exec(formData.text_content)) !== null) {
    extractedVariables.push(match[1]);
  }

  isSubmitting.value = true;

  try {
    if (isEditing.value && selectedTemplate.value) {
      const updateData: CustomTemplateUpdateData = {
        name: formData.name,
        template_type: formData.template_type,
        category: formData.category,
        text_content: formData.text_content,
        variables: extractedVariables,
        is_active: formData.is_active,
        base_template: formData.base_template,
        description: formData.description,
        media_file: formData.media_file
      };

      await updateCustomTemplate({ id: selectedTemplate.value.id, data: updateData });
      showToast('success', 'Updated', 'Template updated successfully');
    } else {
      const createData: CustomTemplateCreateData = {
        name: formData.name,
        template_type: formData.template_type,
        category: formData.category,
        text_content: formData.text_content,
        variables: extractedVariables,
        is_active: formData.is_active,
        base_template: formData.base_template,
        description: formData.description,
        media_file: formData.media_file
      };

      console.log('Starting template creation...');
      const result = await createCustomTemplate(createData);
      console.log('Template creation completed:', result);
      showToast('success', 'Created', 'Template created successfully');
    }

    refetchCustom();
    console.log('About to close modal...');
    closeModal();
    console.log('Modal close called');
  } catch (error) {
    showToast('error', 'Error', isEditing.value ? 'Failed to update template' : 'Failed to create template');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  console.log('closeModal called, showAddModal before:', showAddModal.value);
  showAddModal.value = false;
  console.log('closeModal called, showAddModal after:', showAddModal.value);
  isEditing.value = false;
  selectedTemplate.value = null;
  formData.name = '';
  formData.template_type = '';
  formData.category = '';
  formData.text_content = '';
  formData.variables = [];
  formData.is_active = true;
  formData.base_template = undefined;
  formData.description = undefined;
  formData.media_file = undefined;
};

const truncateText = (text: string | undefined | null, maxLength: number) => {
  if (!text) return '';
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
  // Load both custom and global templates initially
  refetchCustom();
  refetchGlobal();
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

/* WhatsApp Message Styles */
.whatsapp-preview {
  background: #e5ddd5;
  background-image: url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICA8ZGVmcz4KICAgIDxwYXR0ZXJuIGlkPSJwYXR0ZXJuIiB4PSIwIiB5PSIwIiB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+CiAgICAgIDxyZWN0IHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiBmaWxsPSIjZTVkZGQ1Ii8+CiAgICAgIDxjaXJjbGUgY3g9IjUwIiBjeT0iNTAiIHI9IjQwIiBmaWxsPSIjZTljOGM5IiBmaWxsLW9wYWNpdHk9IjAuMSIvPgogICAgPC9wYXR0ZXJuPgogIDwvZGVmcz4KICA8cmVjdCB3aWR0aD0iMTAwIiBoZWlnaHQ9IjEwMCIgZmlsbD0idXJsKCNwYXR0ZXJuKSIvPgo8L3N2Zz4=');
  background-size: cover;
  border-radius: 12px;
  padding: 20px;
  max-height: 500px;
  overflow-y: auto;
  position: relative;
}

.whatsapp-chat-container {
  background: rgba(255, 255, 255, 0.95);
  border-radius: 8px;
  padding: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
}

.whatsapp-header {
  background: #075e54;
  color: white;
  padding: 12px 16px;
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 14px;
  font-weight: 600;
  margin-bottom: 0;
}

.whatsapp-header-avatar {
  width: 32px;
  height: 32px;
  background: #128c7e;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 12px;
}

.whatsapp-header-info {
  flex: 1;
}

.whatsapp-header-name {
  font-weight: 600;
  margin-bottom: 2px;
}

.whatsapp-header-status {
  font-size: 11px;
  opacity: 0.8;
}

.whatsapp-chat-body {
  padding: 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  flex: 1;
}

.whatsapp-message {
  display: flex;
  max-width: 80%;
  margin-bottom: 8px;
}

.whatsapp-message.received {
  align-self: flex-start;
}

.whatsapp-message.sent {
  align-self: flex-end;
  flex-direction: row-reverse;
}

.whatsapp-message-bubble {
  background: white;
  border-radius: 12px;
  padding: 12px 16px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  position: relative;
  word-wrap: break-word;
  max-width: 100%;
}

.whatsapp-message.received .whatsapp-message-bubble {
  background: white;
  border-bottom-left-radius: 4px;
}

.whatsapp-message.sent .whatsapp-message-bubble {
  background: #dcf8c6;
  border-bottom-right-radius: 4px;
}

.whatsapp-message-bubble p {
  margin: 0;
  font-size: 14px;
  line-height: 1.4;
  color: #333;
  white-space: pre-wrap;
}

.whatsapp-message-time {
  font-size: 11px;
  color: #667781;
  margin-top: 4px;
  text-align: right;
}

.whatsapp-message.sent .whatsapp-message-time {
  text-align: left;
  color: #4fc3f7;
}

.whatsapp-typing-indicator {
  display: flex;
  gap: 4px;
  padding: 8px 12px;
}

.whatsapp-typing-dot {
  width: 8px;
  height: 8px;
  background: #ccc;
  border-radius: 50%;
  animation: typing 1.4s infinite ease-in-out;
}

.whatsapp-typing-dot:nth-child(1) {
  animation-delay: -0.32s;
}

.whatsapp-typing-dot:nth-child(2) {
  animation-delay: -0.16s;
}

@keyframes typing {
  0%, 80%, 100% {
    transform: scale(0.8);
    opacity: 0.5;
  }
  40% {
    transform: scale(1);
    opacity: 1;
  }
}

.whatsapp-message-media {
  margin-top: 8px;
  border-radius: 8px;
  overflow: hidden;
}

.whatsapp-message-media img,
.whatsapp-message-media video {
  max-width: 100%;
  height: auto;
  display: block;
  border-radius: 8px;
}

/* Responsive adjustments */
@media (max-width: 640px) {
  .whatsapp-preview {
    padding: 12px;
    border-radius: 8px;
  }

  .whatsapp-header {
    padding: 10px 12px;
  }

  .whatsapp-message {
    max-width: 90%;
  }

  .whatsapp-message-bubble {
    padding: 10px 12px;
  }

  .whatsapp-message-bubble p {
    font-size: 13px;
  }
}
</style>
