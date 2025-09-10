<template>
  <div class="space-y-4" v-if="store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'sections' in store.editableTemplate.message_template.interactive.action">
    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Body Text</label>
      <Textarea 
        v-model="store.editableTemplate.message_template.interactive.body.text"
        rows="3"
        class="w-full"
        placeholder="Enter the main message body"
      />
    </div>

    <div class="space-y-2">
      <label class="block text-sm font-medium text-gray-700">Button Text</label>
      <InputText 
        v-model="store.editableTemplate.message_template.interactive.action.button"
        class="w-full"
        placeholder="e.g., Select an option"
      />
    </div>

    <div class="space-y-2">
      <h4 class="text-sm font-medium text-gray-700">List Items</h4>
      <div v-for="(section, sectionIndex) in store.editableTemplate.message_template.interactive.action.sections" :key="sectionIndex">
        <div v-for="(row, rowIndex) in section.rows" :key="row.id" class="flex items-start gap-2 p-2 border rounded-md mb-2">
          <div class="flex-grow space-y-2">
            <InputText 
              v-model="row.title"
              @update:model-value="updateRowTitle(row.id, $event)"
              placeholder="Item Title"
              class="w-full"
            />
            <InputText 
              v-model="row.description"
              placeholder="Item Description (optional)"
              class="w-full"
            />
            <Dropdown
              :model-value="getConditionalNextStep(row.id)"
              @update:model-value="updateConditionalNextStep(row.id, $event)"
              :options="store.stepOptions"
              optionLabel="step_name"
              optionValue="id"
              placeholder="Select Next Step"
              class="w-full"
            />
          </div>
          <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeRow(sectionIndex, rowIndex)" />
        </div>
      </div>
      <Button label="Add Item" icon="pi pi-plus" class="p-button-sm" @click="addRow" />
    </div>
  </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Button from 'primevue/button';
import { useMessageFlowStore } from '~/stores/flow';

const store = useMessageFlowStore();

const updateRowTitle = (rowId: string, title: string) => {
  if (store.editableTemplate?.options) {
    store.editableTemplate.options[rowId] = title;
  }
};

const getConditionalNextStep = (rowId: string) => {
  return store.editableTemplate?.conditional_next_steps?.[rowId] || null;
};

const updateConditionalNextStep = (rowId: string, nextStepId: number) => {
  if (store.editableTemplate) {
    if (!store.editableTemplate.conditional_next_steps) {
      store.editableTemplate.conditional_next_steps = {};
    }
    store.editableTemplate.conditional_next_steps[rowId] = nextStepId;
  }
};

const addRow = () => {
  if (store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'sections' in store.editableTemplate.message_template.interactive.action) {
    const newId = `item_${Date.now()}`;
    const sections = store.editableTemplate.message_template.interactive.action.sections;
    if (sections.length === 0) {
      sections.push({ title: 'Section 1', rows: [] });
    }
    sections[0].rows.push({
      id: newId,
      title: 'New Item',
      description: ''
    });
    if (store.editableTemplate.options) {
      store.editableTemplate.options[newId] = 'New Item';
    }
  }
};

const removeRow = (sectionIndex: number, rowIndex: number) => {
  if (store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'sections' in store.editableTemplate.message_template.interactive.action) {
    const sections = store.editableTemplate.message_template.interactive.action.sections;
    const row = sections[sectionIndex].rows[rowIndex];
    if (store.editableTemplate.options) {
      delete store.editableTemplate.options[row.id];
    }
    if (store.editableTemplate.conditional_next_steps) {
      delete store.editableTemplate.conditional_next_steps[row.id];
    }
    sections[sectionIndex].rows.splice(rowIndex, 1);
  }
};

</script>