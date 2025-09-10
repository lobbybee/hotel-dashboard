<template>
  <Dialog 
    :visible="store.formDialogVisible"
    @update:visible="store.hideFormDialog()"
    modal 
    :header="`Edit: ${store.editableTemplate?.step_name}`"
    class="w-full max-w-4xl"
    @hide="store.hideFormDialog()"
  >
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 p-4">
      
      <div>
        <h3 class="text-lg font-medium mb-4">Editor</h3>
        <div class="p-4 border rounded-md bg-gray-50">
          <MsgEditor v-if="store.editableTemplate" />
          <div v-else class="text-center text-gray-500 py-8">
            Select a template to start editing.
          </div>
        </div>
      </div>

      <div>
        <h3 class="text-lg font-medium mb-4">Preview</h3>
        <div class="p-4 border rounded-md h-full">
          <MsgPreview :template="store.editableTemplate" />
        </div>
      </div>

    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="store.hideFormDialog()" class="p-button-text" />
      <Button label="Save" icon="pi pi-check" @click="onSave" :loading="store.isUpdating" />
    </template>

  </Dialog>
</template>

<script setup lang="ts">
import { watch, defineAsyncComponent } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import { useMessageFlowStore } from '~/stores/flow';
import { useFetchFlowStepTemplatesDropdown } from '~/composables/useFlow';

const MsgEditor = defineAsyncComponent(() => import('../MsgEditor/index.vue'));
const MsgPreview = defineAsyncComponent(() => import('../MsgPreview/index.vue'));

const store = useMessageFlowStore();
const emit = defineEmits(['save']);

// Fetch dropdown steps once and populate the store
const { data: dropdownSteps } = useFetchFlowStepTemplatesDropdown();
watch(
  () => dropdownSteps.value,
  (steps) => {
    if (steps) {
      store.setDropdownSteps(steps);
    }
  },
  { immediate: true }
);

const onSave = () => {
  if (store.editableTemplate) {
    const { id, message_template, options, conditional_next_steps } = store.editableTemplate;
    emit('save', { 
      id, 
      data: { message_template, options, conditional_next_steps } 
    });
  }
};

</script>