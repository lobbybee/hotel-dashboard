<template>
  <div class="bg-gray-100 p-4 rounded-lg h-full">
    <p class="text-lg font-semibold mb-4">Preview</p>
    <div class="w-full max-w-sm mx-auto bg-white rounded-lg shadow-md p-4">
      <component :is="previewComponent" :template="props.template?.message_template" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineAsyncComponent } from 'vue';
import type { FlowStep, FlowStepTemplate } from '~/composables/useFlow';

const props = defineProps<{ template: FlowStep | FlowStepTemplate | null }>();

const previewComponent = computed(() => {
  if (!props.template) return null;
  switch (props.template.message_type) {
    case 'text':
      return defineAsyncComponent(() => import('./Text.vue'));
    case 'quick-reply':
      return defineAsyncComponent(() => import('./QuickReply.vue'));
    case 'list-picker':
      return defineAsyncComponent(() => import('./ListPicker.vue'));
    default:
      return null;
  }
});
</script>