<template>
  <Dialog 
    :visible="visible" 
    @update:visible="emit('update:visible', $event)"
    :header="currentEditingTemplate ? 'Edit Custom Template' : 'Create Custom Template'"
    :style="{ width: '90vw', maxWidth: '80rem' }"
    :modal="true"
    :dismissableMask="true"
  >
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <!-- Left Column: Form -->
      <div class="space-y-4">
        <!-- Global Template Selector -->
        <div class="form-field">
          <label for="global-template">Choose Global Template</label>
          <Select 
            id="global-template"
            v-model="selectedGlobalTemplate" 
            :options="availableGlobalTemplates"
            optionLabel="name"
            optionValue="id"
            optionDisabled="disabled"
            placeholder="Select a template to customize"
            class="w-full"
            :class="{ 'p-invalid': !selectedGlobalTemplate }"
          />
          <small class="text-gray-500">Select a global template to customize</small>
        </div>
        
        <!-- Template Name -->
        <div class="form-field">
          <label for="template-name">Template Name</label>
          <InputText 
            id="template-name"
            v-model="formData.name" 
            placeholder="Auto-generated from selection"
            class="w-full"
          />
        </div>
        
        <!-- Template Content -->
        <div class="form-field">
          <label for="template-content">Message Content</label>
          <Textarea 
            id="template-content"
            v-model="formData.text_content"
            rows="8"
            placeholder="Edit your message content here"
            @input="extractVariables"
            class="w-full resize-vertical"
          />
          
          <!-- Variable Helper -->
          <div v-if="availableVariables.length > 0" class="mt-3">
            <p class="text-sm text-gray-600 mb-2">Click to add variables:</p>
            <div class="flex flex-wrap gap-2">
              <Chip 
                v-for="variable in availableVariables"
                :key="variable"
                :label="`{{${variable}}}`"
                class="cursor-pointer hover:bg-blue-100 text-xs"
                @click="insertVariable(variable)"
              />
            </div>
          </div>
        </div>
        
        <!-- Media Upload -->
        <div class="form-field">
          <label>Media (Optional)</label>
          
          <!-- Existing Media Preview -->
          <div v-if="currentEditingTemplate?.media_url && !formData.media_file" class="mb-3">
            <div class="relative">
              <img 
                v-if="isImage(currentEditingTemplate.media_url)"
                :src="currentEditingTemplate.media_url" 
                alt="Current media" 
                class="w-full h-32 object-cover rounded border border-gray-200"
              />
              <video 
                v-else-if="isVideo(currentEditingTemplate.media_url)"
                :src="currentEditingTemplate.media_url" 
                controls
                class="w-full h-32 rounded border border-gray-200"
              />
              <button 
                type="button"
                @click="removeExistingMedia"
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center hover:bg-red-600"
                title="Remove existing media"
              >
                <i class="pi pi-times"></i>
              </button>
            </div>
          </div>
          
          <FileUpload 
            mode="advanced"
            accept="image/*,video/*"
            :maxFileSize="5000000"
            :fileLimit="1"
            @select="handleMediaSelect"
            @remove="handleMediaRemove"
            chooseLabel="Choose Media"
            :showUploadButton="false"
            class="w-full"
          />
          <small class="text-gray-500">Images or videos up to 5MB</small>
        </div>
      </div>
      
      <!-- Right Column: Preview -->
      <div class="lg:sticky lg:top-6 h-fit">
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-sm font-semibold text-gray-900 mb-3">Preview</h3>
          <TemplatePreview 
            :content="formData.text_content || 'Select a template to see preview'"
            :media="formData.media_file"
            :media-url="currentEditingTemplate?.media_url"
            :variables="extractedTemplateVars"
            :template-variables="computedTemplateVariables"
            :is-loading="isVariablesLoading.value"
          />
        </div>
      </div>
    </div>
    
    <template #footer>
      <Button 
        label="Cancel" 
        icon="pi pi-times"
        @click="closeModal" 
        class="p-button-text"
      />
      <Button 
        :label="currentEditingTemplate ? 'Update Template' : 'Save Template'" 
        icon="pi pi-check"
        @click="saveTemplate" 
        :loading="isSaving"
        :disabled="!selectedGlobalTemplate || !formData.name || !formData.text_content"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import FileUpload from 'primevue/fileupload'
import Chip from 'primevue/chip'
import TemplatePreview from './TemplatePreview.vue'
import { 
  useFetchGlobalTemplates, 
  useFetchCustomTemplates,
  useCreateCustomTemplate,
  usePartialUpdateCustomTemplate,
  useFetchTemplateVariables,
  type CustomMessageTemplate 
} from '~/composables/useMessageTemplate'
import { useAPIHelper } from '~/composables/useAPIHelper'

// Props
const props = defineProps<{
  visible: boolean
  editingTemplate?: CustomMessageTemplate | null
  existingTemplates?: CustomMessageTemplate[]
}>()

// Emits
const emit = defineEmits<{
  'update:visible': [value: boolean]
  'template-saved': []
}>()

// Toast
const toast = useToast()
const { getErrorMessage } = useAPIHelper()

// Data
const { globalTemplates } = useFetchGlobalTemplates()
const { refetch: refetchCustom } = useFetchCustomTemplates()
const { createCustomTemplate } = useCreateCustomTemplate()
const { partialUpdateCustomTemplate } = usePartialUpdateCustomTemplate()
const { templateVariables, isLoading: isVariablesLoading } = useFetchTemplateVariables()



const selectedGlobalTemplate = ref<number | null>(null)
const isSaving = ref(false)
const extractedTemplateVars = ref<string[]>([])
const skipNextAutoFillFromGlobalTemplate = ref(false)
const currentEditingTemplate = ref<CustomMessageTemplate | null>(null)

const formData = ref({
  name: '',
  text_content: '',
  media_file: null as File | null,
  is_active: true,
  base_template: null as number | null
})

// Computed
const availableGlobalTemplates = computed(() => {
  // Show customizable global templates and disable those that already have deactivated custom templates.
  return globalTemplates.value
    .filter(t => t.is_customizable)
    .map((globalTemplate) => {
      const existingCustomTemplate = (props.existingTemplates || []).find(
        (customTemplate: any) => customTemplate.base_template === globalTemplate.id
      )

      const isCurrentTemplate =
        !!currentEditingTemplate.value &&
        (currentEditingTemplate.value as any).base_template === globalTemplate.id

      return {
        ...globalTemplate,
        disabled: !!existingCustomTemplate && !existingCustomTemplate.is_active && !isCurrentTemplate
      }
    })
})

const availableVariables = computed(() => {
  // Return all available variables from templateVariables, not just from selected template
  // This allows users to use any variable they want
  return templateVariables.value?.variables?.map(v => v.name) || []
})

// Create a computed for template variables to pass to child
const computedTemplateVariables = computed(() => {
  return templateVariables.value?.variables || []
})

// Watch for editing template changes
watch(() => props.editingTemplate, (template) => {
  if (template) {
    // Prevent edit hydration from being overwritten by the global-template watcher.
    skipNextAutoFillFromGlobalTemplate.value = true
    currentEditingTemplate.value = template
    formData.value = {
      name: template.name,
      text_content: template.text_content,
      media_file: null,
      is_active: template.is_active,
      base_template: template.base_template || null
    }
    selectedGlobalTemplate.value = template.base_template || null
    extractVariables()
  }
}, { immediate: true })

// Watch for global template selection changes
watch(selectedGlobalTemplate, (templateId) => {
  if (skipNextAutoFillFromGlobalTemplate.value) {
    skipNextAutoFillFromGlobalTemplate.value = false
    return
  }
  if (templateId) {
    onGlobalTemplateSelect(templateId)
  }
})

// Watch for modal open/close
watch(() => props.visible, (newValue) => {
  if (!newValue) {
    // Reset form when modal closes
    resetForm()
  } else if (!props.editingTemplate) {
    // Fresh form for new template
    resetForm()
  }
})

// Methods
const resetForm = () => {
  currentEditingTemplate.value = null
  formData.value = {
    name: '',
    text_content: '',
    media_file: null,
    is_active: true,
    base_template: null
  }
  selectedGlobalTemplate.value = null
  extractedTemplateVars.value = []
}

const onGlobalTemplateSelect = (templateId: number) => {
  const existingCustomTemplate = (props.existingTemplates || []).find(
    (template: any) => template.base_template === templateId
  ) as CustomMessageTemplate | undefined

  // If a custom template already exists for this base template, always load it.
  // This keeps create/edit in the same flow and avoids duplicate custom templates.
  if (existingCustomTemplate) {
    currentEditingTemplate.value = existingCustomTemplate
    formData.value = {
      name: existingCustomTemplate.name,
      text_content: existingCustomTemplate.text_content,
      media_file: null,
      is_active: existingCustomTemplate.is_active,
      base_template: (existingCustomTemplate as any).base_template || templateId
    }
    extractVariables()
    return
  }

  currentEditingTemplate.value = null
  const template = globalTemplates.value.find(t => t.id === templateId)
  if (template) {
    // Auto-generate name with conflict resolution
    let baseName = `${template.name}-customized`
    let counter = 2
    
    // Check if name already exists
    const existingNames = props.existingTemplates?.map(t => t.name) || []
    
    while (existingNames.includes(baseName)) {
      baseName = `${template.name}-customized-${counter}`
      counter++
    }
    
    formData.value.name = baseName
    formData.value.text_content = template.text_content
    formData.value.base_template = templateId
    
    // Also copy media if exists
    if (template.media_url) {
      // Note: We can't directly copy the media file, but we can store the URL reference
      // The actual media file would need to be re-uploaded or handled separately
      console.log('Global template has media:', template.media_url)
    }
    
    extractVariables()
  }
}

const insertVariable = (varName: string) => {
  const variableSyntax = `{{${varName}}}`
  const textarea = document.querySelector('#template-content') as HTMLTextAreaElement
  if (textarea) {
    const start = textarea.selectionStart
    const end = textarea.selectionEnd
    const text = formData.value.text_content
    
    formData.value.text_content = 
      text.substring(0, start) + 
      variableSyntax + 
      text.substring(end)
    
    // Set cursor position after inserted variable
    setTimeout(() => {
      textarea.focus()
      textarea.setSelectionRange(start + variableSyntax.length, start + variableSyntax.length)
    }, 0)
  } else {
    // Fallback if textarea not found
    formData.value.text_content += ` ${variableSyntax}`
  }
  
  extractVariables()
}

const extractVariables = () => {
  const regex = /\{\{(\w+)\}\}/g
  const matches = formData.value.text_content.match(regex) || []
  extractedTemplateVars.value = matches.map(m => m.replace(/[{}]/g, ''))
}

const handleMediaSelect = (event: any) => {
  if (event.files && event.files.length > 0) {
    formData.value.media_file = event.files[0]
  }
}

const handleMediaRemove = () => {
  formData.value.media_file = null
}

const isImage = (url: string) => {
  return /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(url)
}

const isVideo = (url: string) => {
  return /\.(mp4|webm|ogg|avi|mov)$/i.test(url)
}

const removeExistingMedia = () => {
  if (currentEditingTemplate.value) {
    currentEditingTemplate.value.media_url = undefined
  }
}

const closeModal = () => {
  emit('update:visible', false)
}

const saveTemplate = async () => {
  if (!selectedGlobalTemplate.value || !formData.value.name || !formData.value.text_content) {
    toast.add({
      severity: 'warn',
      summary: 'Validation Error',
      detail: 'Please fill in all required fields',
      life: 3000
    })
    return
  }

  isSaving.value = true
  
  try {
    // Get the global template to inherit type and category
    const globalTemplate = globalTemplates.value.find(t => t.id === selectedGlobalTemplate.value)
    
    const templateData = {
      name: formData.value.name,
      template_type: globalTemplate?.template_type || 'custom',
      category: globalTemplate?.category || 'custom',
      text_content: formData.value.text_content,
      variables: extractedTemplateVars.value,
      is_active: formData.value.is_active,
      base_template: formData.value.base_template!,
      description: `Custom template based on ${globalTemplate?.name || 'global template'}`,
      media_file: formData.value.media_file
    }

    if (currentEditingTemplate.value) {
      await partialUpdateCustomTemplate({
        id: currentEditingTemplate.value.id,
        data: templateData
      })
    } else {
      await createCustomTemplate(templateData)
    }
    
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: currentEditingTemplate.value ? 'Template updated successfully' : 'Template created successfully',
      life: 3000
    })
    
    // Refetch templates
    refetchCustom()
    
    emit('template-saved')
    closeModal()
  } catch (error: any) {
    console.error('Error saving template:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(error),
      life: 3000
    })
  } finally {
    isSaving.value = false
  }
}
</script>

<style scoped>
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

.resize-vertical {
  resize: vertical;
  min-height: 6rem;
}
</style>
