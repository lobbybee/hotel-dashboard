<template>
  <div class="space-y-6">
    <transition-group name="fade-up" tag="div" class="space-y-6">
      <Card 
        v-for="item in combinedList" 
        :key="item.id"
        class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        :class="{ 'border-primary-500 bg-primary-50': item.isCustomized }"
      >
        <template #title>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold flex items-center gap-2">
              <i class="pi pi-comment" :class="item.isCustomized ? 'text-primary-600' : 'text-gray-500'"></i>
              {{ item.step_name }}
            </h3>
            <Badge 
              :value="item.isCustomized ? 'Customized' : 'Default'" 
              :severity="item.isCustomized ? 'success' : 'info'" 
              class="px-3 py-1 text-sm" 
            />
          </div>
        </template>
        <template #content>
          <div class="space-y-4">
            <p class="text-gray-600 line-clamp-2">
              {{ item.message_template.text || 'No message content defined.' }}
            </p>
            
            <div class="flex flex-wrap gap-2 mt-4">
              <Button 
                v-if="!item.isCustomized"
                icon="pi pi-pencil" 
                class="p-button-sm" 
                @click="$emit('customize', item.id)"
                label="Customize"
                :loading="isCreatingId === item.id"
              />
              <Button 
                v-if="item.isCustomized"
                icon="pi pi-pencil" 
                class="p-button-sm p-button-outlined" 
                @click="$emit('edit', item)"
                label="Edit"
              />
              <Button 
                v-if="item.isCustomized"
                icon="pi pi-undo" 
                class="p-button-sm p-button-danger p-button-outlined" 
                @click="$emit('revert', item)"
                label="Revert to Default"
              />
            </div>
          </div>
        </template>
      </Card>
    </transition-group>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import type { FlowStep, FlowStepTemplate } from '~/composables/useFlow';

const props = defineProps({
  templates: {
    type: Array as () => FlowStepTemplate[],
    default: () => []
  },
  customSteps: {
    type: Array as () => FlowStep[],
    default: () => []
  },
  isCreatingId: {
    type: Number,
    default: null
  }
});

defineEmits(['customize', 'edit', 'revert']);

const combinedList = computed(() => {
  const customStepMap = new Map(props.customSteps.map(step => [step.template, step]));
  
  return props.templates.map(template => {
    const customStep = customStepMap.get(template.id);
    if (customStep) {
      return {
        ...template, // Keep original name etc.
        ...customStep, // Override with custom data
        isCustomized: true,
        id: customStep.id, // Use the custom step's ID for actions
        templateId: template.id // Keep track of original template id
      };
    }
    return {
      ...template,
      isCustomized: false
    };
  });
});
</script>

<style scoped>
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>
