<template>
  <div class="space-y-6">
    <component 
      :is="editorComponent" 
      v-if="store.editableTemplate"
      :key="store.editableTemplate.id"
    />
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import { useMessageFlowStore } from '~/stores/flow';

const store = useMessageFlowStore();

const editors = {
  'text': defineAsyncComponent(() => import('./TextEditor.vue')),
  'quick-reply': defineAsyncComponent(() => import('./QuickReplyEditor.vue')),
  'list-picker': defineAsyncComponent(() => import('./ListPickerEditor.vue')),
}

const editorComponent = computed(() => {
  if (!store.editableTemplate) return null;
  return editors[store.editableTemplate.message_type] || null;
});

</script>