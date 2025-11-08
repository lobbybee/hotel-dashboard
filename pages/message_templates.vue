<template>
  <div class="message-templates-dashboard">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">Message Templates</h1>
          <p class="page-subtitle">Manage message templates for guest communications</p>
        </div>
        <Button
          v-if="userRole !== 'receptionist'"
          label="Add Template"
          icon="pi pi-plus"
          @click="showAddModal = true"
          :rounded="true" :raised="true"
        />
      </div>
      <div class="stats-bar">
        <Tag :value="`Total: ${totalCount}`" severity="info" :rounded="true" />
        <Tag :value="`Active: ${customTemplates.filter(t=>t.is_active).length}`" severity="success" :rounded="true" />
        <Tag :value="`Inactive: ${customTemplates.filter(t=>!t.is_active).length}`" severity="danger" :rounded="true" />
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="flex gap-3 items-center justify-center mb-5 flex-wrap">
      <div class="search-bar min-w-[200px]">
        <span class="p-input-icon-left w-full flex justify-center gap-3 items-center relative">
          <i class="pi pi-search absolute right-3 " />
          <InputText
            v-model="searchQuery"
            placeholder="Search templates..."
            class="w-full"
            @input="handleSearch"
          />
        </span>
      </div>

    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      <p>Loading templates...</p>
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" :closable="false" class="error-message">
      <span>{{ error.message || 'Failed to load templates' }}</span>
      <Button label="Retry" @click="refreshData" text size="small" />
    </Message>

    <!-- Templates Grid -->
    <div v-else-if="customTemplates.length > 0" class="template-cards-grid">
      <div
        v-for="template in customTemplates"
        :key="template.id"
        class="template-card"
        :class="{ 'inactive': !template.is_active }"
      >
        <div class="template-card-header">
          <div class="template-status-badge">
            <Tag
              :value="template.is_active ? 'Active' : 'Inactive'"
              :severity="template.is_active ? 'success' : 'danger'"
              :icon="template.is_active ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            />
          </div>
          <div class="template-actions" v-if="userRole !== 'receptionist'">
            <Button
              icon="pi pi-eye"
              @click="viewTemplate(template)"
              :rounded="true" text size="small"
              v-tooltip="'View Details'"
            />
            <Button
              icon="pi pi-search"
              @click="previewTemplateContent(template)"
              :rounded="true" text size="small"
              v-tooltip="'Preview'"
            />
            <Button
              icon="pi pi-pencil"
              @click="editTemplate(template)"
              :rounded="true" text size="small"
              v-tooltip="'Edit'"
            />
            <Button
              icon="pi pi-power-off"
              @click="toggleTemplateStatus(template)"
              :rounded="true" text size="small"
              :severity="template.is_active ? 'warning' : 'success'"
              v-tooltip="template.is_active ? 'Deactivate' : 'Activate'"
            />
            <Button
              icon="pi pi-trash"
              @click="deleteTemplate(template)"
              :rounded="true" text size="small" severity="danger"
              v-tooltip="'Delete'"
            />
          </div>
        </div>

        <div class="template-card-content">
          <div class="template-category-type">
            <Tag :value="template.category" severity="info" size="small" />
            <Tag :value="template.template_type" severity="secondary" size="small" />
          </div>
          <h3 class="template-name">{{ template.name }}</h3>
          <div class="template-content">
            <p>{{ truncateText(template.content, 100) }}</p>
          </div>
          <div class="template-variables">
            <div v-if="template.variables && template.variables.length > 0" class="variables-list">
              <i class="pi pi-code"></i>
              <span>{{ template.variables.join(', ') }}</span>
            </div>
            <div v-else class="no-variables">
              <i class="pi pi-info-circle"></i>
              <span>No variables</span>
            </div>
          </div>
          <div class="template-meta">
            <div class="template-detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatDate(template.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-content">
        <i class="pi pi-file-edit empty-icon"></i>
        <h3>No Templates Found</h3>
        <p>{{ searchQuery || selectedFilter !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first message template' }}</p>
        <Button
          label="Add Your First Template"
          icon="pi pi-plus"
          @click="showAddModal = true"
          :rounded="true" :raised="true"
          v-if="!searchQuery && selectedFilter === 'all'"
        />
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Dialog
      v-model:visible="showAddModal"
      :header="isEditing ? 'Edit Template' : 'Add New Template'"
      :modal="true"
      :style="{ width: '650px' }"
      :dismissableMask="true"
    >
      <form @submit.prevent="handleSubmit" class="template-form">
        <div class="form-grid">
          <div class="form-field">
            <label for="name">Template Name *</label>
            <InputText
              id="name"
              v-model="formData.name"
              placeholder="e.g., Welcome Message"
              required
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="template_type">Template Type *</label>
            <Dropdown
              id="template_type"
              v-model="formData.template_type"
              :options="templateTypes?.template_types || []"
              optionLabel="label"
              optionValue="value"
              placeholder="Select type"
              required
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="category">Category *</label>
            <Dropdown
              id="category"
              v-model="formData.category"
              :options="templateTypes?.categories || []"
              optionLabel="label"
              optionValue="value"
              placeholder="Select category"
              required
              class="w-full"
            />
          </div>

          <div class="form-field">
            <label for="media_url">Media URL (Optional)</label>
            <div class="media-upload-container">
              <InputText
                id="media_url"
                v-model="formData.media_url"
                placeholder="Enter media URL or upload file"
                class="w-full"
              />
              <Button
                icon="pi pi-upload"
                @click="showMediaUpload = true"
                outlined
                size="small"
                v-tooltip="'Upload Media'"
              />
            </div>
          </div>
        </div>

        <div class="form-field">
          <label for="content">Template Content *</label>
          <Textarea
            id="content"
            v-model="formData.content"
            placeholder="Enter your template content here. Use {{variable_name}} for variables."
            rows="6"
            required
            class="w-full"
          />
          <small class="text-muted">Use {{variable_name}} syntax for variables (e.g., {{guest_name}})</small>
        </div>

        <div class="form-field">
          <label>Available Variables</label>
          <div v-if="templateVariables?.variables" class="variables-help">
            <div class="variables-grid">
              <div
                v-for="variable in templateVariables.variables.slice(0, 12)"
                :key="variable.name"
                class="variable-chip"
                @click="insertVariable(variable.name)"
                v-tooltip="`${variable.description} - Example: ${variable.example}`"
              >
                <span class="variable-name">{{ variable.name }}</span>
                <small class="variable-model">{{ variable.model }}</small>
              </div>
            </div>
            <small class="text-muted">Click on any variable to insert it into your template</small>
          </div>
        </div>

        <div class="form-field">
          <div class="form-checkbox">
            <Checkbox
              id="is_active"
              v-model="formData.is_active"
              binary
            />
            <label for="is_active">Active (Available for use)</label>
          </div>
        </div>
      </form>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeModal"
          text
        />
        <Button
          :label="isEditing ? 'Update' : 'Create'"
          icon="pi pi-check"
          @click="handleSubmit"
          :loading="isSubmitting"
        />
      </template>
    </Dialog>

    <!-- View Template Modal -->
    <Dialog
      v-model:visible="showViewModal"
      header="Template Details"
      :modal="true"
      :style="{ width: '600px' }"
      :dismissableMask="true"
    >
      <div v-if="selectedTemplate" class="template-view-content">
        <div class="template-view-header">
          <h3>{{ selectedTemplate.name }}</h3>
          <div class="template-view-badges">
            <Tag :value="selectedTemplate.category" severity="info" />
            <Tag :value="selectedTemplate.template_type" severity="secondary" />
            <Tag
              :value="selectedTemplate.is_active ? 'Active' : 'Inactive'"
              :severity="selectedTemplate.is_active ? 'success' : 'danger'"
            />
          </div>
        </div>

        <div class="template-view-content-section">
          <h4>Content</h4>
          <div class="content-display">
            <p>{{ selectedTemplate.content }}</p>
          </div>
        </div>

        <div v-if="selectedTemplate.media_url" class="template-view-media">
          <h4>Media</h4>
          <img :src="selectedTemplate.media_url" alt="Template media" class="template-media" />
        </div>

        <div v-if="selectedTemplate.variables && selectedTemplate.variables.length > 0" class="template-view-variables">
          <h4>Variables Used</h4>
          <div class="variables-list-display">
            <Tag
              v-for="variable in selectedTemplate.variables"
              :key="variable"
              :value="variable"
              severity="info"
              size="small"
            />
          </div>
        </div>

        <div class="template-view-meta">
          <div class="detail-row">
            <strong>Created:</strong>
            <span>{{ formatDate(selectedTemplate.created_at) }}</span>
          </div>
          <div class="detail-row">
            <strong>Last Updated:</strong>
            <span>{{ formatDate(selectedTemplate.updated_at) }}</span>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Preview Modal -->
    <Dialog
      v-model:visible="showPreviewModal"
      header="Template Preview"
      :modal="true"
      :style="{ width: '500px' }"
      :dismissableMask="true"
    >
      <div v-if="previewData" class="preview-content">
        <div class="preview-header">
          <h4>{{ previewData.template_name }}</h4>
          <Tag value="Sample Preview" severity="info" size="small" />
        </div>
        <div class="preview-body">
          <p>{{ previewData.rendered_content }}</p>
        </div>
        <div class="preview-sample-data">
          <h5>Sample Data Used:</h5>
          <div class="sample-data-grid">
            <div v-for="(value, key) in previewData.sample_data" :key="key" class="sample-data-item">
              <strong>{{ key }}:</strong> {{ value }}
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
      :style="{ width: '400px' }"
      :dismissableMask="true"
    >
      <div class="media-upload-content">
        <div class="file-upload-container">
          <input
            type="file"
            id="media_file"
            @change="handleMediaFileChange"
            accept="image/*"
            class="file-input"
            ref="mediaFileInput"
          />
          <div class="file-upload-label" @click="triggerMediaFileSelect">
            <i class="pi pi-upload"></i>
            <span>{{ mediaFile ? mediaFile.name : 'Choose Media File' }}</span>
          </div>
        </div>
        <small class="text-muted">Upload images (JPEG, PNG, GIF, WebP) up to 5MB</small>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showMediaUpload = false"
          text
        />
        <Button
          label="Upload"
          icon="pi pi-check"
          @click="handleMediaUpload"
          :loading="isUploadingMedia"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
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
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
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
.message-templates-dashboard {
  padding: 2rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.header-section {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1rem;
}

.search-filter-section {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-dropdown {
  min-width: 150px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: var(--surface-card);
  border-radius: 12px;
  text-align: center;
}

.error-message {
  margin-bottom: 2rem;
}

.template-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.template-card {
  background: var(--surface-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.template-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.template-card.inactive {
  opacity: 0.7;
  background: var(--surface-ground);
}

.template-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
}

.template-actions {
  display: flex;
  gap: 0.25rem;
}

.template-card-content {
  padding: 1.5rem;
}

.template-category-type {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.template-name {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.template-content {
  margin-bottom: 1rem;
}

.template-content p {
  color: var(--text-color-secondary);
  line-height: 1.6;
  margin: 0;
}

.template-variables {
  margin-bottom: 1rem;
}

.variables-list {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--primary-color);
  font-size: 0.9rem;
}

.no-variables {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.template-meta {
  padding-top: 1rem;
  border-top: 1px solid var(--surface-border);
}

.template-detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.template-detail-item i {
  color: var(--primary-color);
  width: 16px;
}

.empty-state {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state-content h3 {
  color: var(--text-color);
  margin: 1rem 0;
}

.empty-state-content p {
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.template-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.media-upload-container {
  display: flex;
  gap: 0.5rem;
}

.variables-help {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
}

.variables-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.variable-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0.75rem;
  background: var(--surface-card);
  border: 1px solid var(--surface-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.variable-chip:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

.variable-name {
  font-family: monospace;
  font-weight: 600;
  color: var(--primary-color);
}

.variable-model {
  color: var(--text-color-secondary);
  font-size: 0.75rem;
}

.text-muted {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.template-view-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.template-view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.template-view-badges {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.template-view-content-section h4,
.template-view-media h4,
.template-view-variables h4 {
  margin: 0 0 0.75rem 0;
  color: var(--text-color);
  font-weight: 600;
}

.content-display {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
  border-left: 4px solid var(--primary-color);
}

.template-media {
  max-width: 100%;
  max-height: 300px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.variables-list-display {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
}

.template-view-meta {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  color: var(--text-color);
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.preview-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.preview-body {
  background: var(--surface-ground);
  border-radius: 8px;
  padding: 1.5rem;
  border-left: 4px solid var(--primary-color);
}

.preview-body p {
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.sample-data-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 0.75rem;
}

.sample-data-item {
  font-size: 0.875rem;
}

.media-upload-content {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.file-upload-container {
  position: relative;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  padding: 2rem;
  border: 2px dashed var(--surface-border);
  border-radius: 8px;
  background: var(--surface-ground);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

@media (max-width: 768px) {
  .message-templates-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .search-filter-section {
    flex-direction: column;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .template-cards-grid {
    grid-template-columns: 1fr;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .variables-grid {
    grid-template-columns: 1fr;
  }

  .template-view-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .preview-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .sample-data-grid {
    grid-template-columns: 1fr;
  }
}
</style>
