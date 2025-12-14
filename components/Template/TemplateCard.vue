<template>
  <div class="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow">
    <!-- Header -->
    <div class="flex justify-between items-start mb-3">
      <h3 class="font-semibold text-gray-900 truncate flex-1">{{ template.name }}</h3>
      <span 
        class="ml-2 inline-flex items-center px-2 py-1 rounded-full text-xs font-medium"
        :class="template.is_active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'"
      >
        {{ template.is_active ? 'Active' : 'Inactive' }}
      </span>
    </div>
    
    <!-- Content Preview -->
    <p class="text-sm text-gray-600 mb-3 line-clamp-3">
      {{ template.text_content }}
    </p>
    
    <!-- Media Preview -->
    <div v-if="template.media_url || template.media_file" class="mb-3">
      <img 
        :src="template.media_url || template.media_file" 
        :alt="template.name" 
        class="w-full h-24 object-cover rounded border border-gray-200"
        @error="$event.target.style.display='none'"
      />
    </div>
    
    <!-- Metadata -->
    <div class="flex items-center justify-between text-xs text-gray-500 mb-4">
      <span v-if="template.variables && template.variables.length > 0">
        <i class="pi pi-code mr-1"></i>
        {{ template.variables.length }} variables
      </span>
      <span v-else>
        <i class="pi pi-info-circle mr-1"></i>
        No variables
      </span>
      <span>{{ formatDate(template.updated_at) }}</span>
    </div>
    
    <!-- Actions -->
    <div class="flex gap-2">
      <Button 
        icon="pi pi-pencil" 
        label="Edit"
        size="small"
        @click="$emit('edit', template)"
        class="p-button-outlined"
      />
      <Button 
        :icon="template.is_active ? 'pi pi-pause' : 'pi pi-play'"
        :label="template.is_active ? 'Deactivate' : 'Activate'"
        size="small"
        @click="$emit('toggle', template)"
        :class="template.is_active ? 'p-button-warning' : 'p-button-success'"
      />
      <Button 
        icon="pi pi-trash"
        size="small"
        @click="$emit('delete', template)"
        class="p-button-danger p-button-outlined"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button'
import type { CustomMessageTemplate } from '~/composables/useMessageTemplate'

defineProps<{
  template: CustomMessageTemplate
}>()

defineEmits<{
  edit: [template: CustomMessageTemplate]
  toggle: [template: CustomMessageTemplate]
  delete: [template: CustomMessageTemplate]
}>()

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  })
}
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>