<template>
  <div class="bg-white border border-gray-200 rounded-lg p-4">
    <h4 class="text-sm font-medium text-gray-900 mb-2">Message Preview</h4>
    
    <!-- Media Preview -->
    <div v-if="media" class="mb-3">
      <img 
        v-if="media.type.startsWith('image/')"
        :src="previewMediaUrl" 
        alt="Template media" 
        class="max-w-full h-32 object-cover rounded border border-gray-200"
      />
      <video 
        v-else-if="media.type.startsWith('video/')"
        :src="previewMediaUrl" 
        controls
        class="max-w-full h-32 rounded border border-gray-200"
      />
    </div>
    
    <!-- Message Content -->
    <div class="text-sm text-gray-700 whitespace-pre-wrap">
      {{ renderedContent }}
    </div>
    
    <!-- Sample Data Info -->
    <div v-if="hasVariables" class="mt-3 pt-3 border-t border-gray-100">
      <p class="text-xs text-gray-500">
        <i class="pi pi-info-circle mr-1"></i>
        Preview shows sample data for variables
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, watchEffect } from 'vue'

interface Props {
  content: string
  media?: File | null
  mediaUrl?: string
  variables?: string[]
  templateVariables?: Array<{name: string, example: string, description?: string}>
  isLoading?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  content: '',
  media: null,
  mediaUrl: '',
  variables: () => [],
  templateVariables: () => [],
  isLoading: false
})



// Computed properties
const hasVariables = computed(() => props.variables && props.variables.length > 0)

const renderedContent = computed(() => {
  if (!props.content) return 'No content to preview'
  
  let rendered = props.content
  
  // Replace variables with example data from templateVariables
  if (hasVariables.value && props.templateVariables && props.templateVariables.length > 0) {
    props.variables.forEach(variable => {
      const varData = props.templateVariables.find(v => v.name === variable)
      const value = varData?.example || varData?.description || `[${variable}]`
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), value)
    })
  } else if (hasVariables.value && props.isLoading) {
    // If we have variables but data is still loading, show a loading indicator
    props.variables.forEach(variable => {
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), `⏳ ${variable}`)
    })
  } else if (hasVariables.value) {
    // If we have variables but no templateVariables data, show placeholder
    props.variables.forEach(variable => {
      rendered = rendered.replace(new RegExp(`{{${variable}}}`, 'g'), `[${variable}]`)
    })
  }
  
  return rendered
})

const previewMediaUrl = computed(() => {
  // If there's a new file being uploaded, show its preview
  if (props.media) {
    return URL.createObjectURL(props.media)
  }
  // Otherwise, show the existing media URL if available
  if (props.mediaUrl) {
    return props.mediaUrl
  }
  return ''
})
</script>

<style scoped>
.line-clamp-3 {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>