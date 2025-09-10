<template>
  <div class="space-y-4" v-if="store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'buttons' in store.editableTemplate.message_template.interactive.action">
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
      <h4 class="text-sm font-medium text-gray-700">Buttons</h4>
      <div v-for="(button, index) in store.editableTemplate.message_template.interactive.action.buttons" :key="index" class="flex items-center gap-2 p-2 border rounded-md">
        <div class="flex-grow space-y-2">
          <InputText 
            v-model="button.reply.title"
            @update:model-value="updateButtonTitle(button.reply.id, $event)"
            placeholder="Button Title"
            class="w-full"
          />
          <Dropdown
            :model-value="getConditionalNextStep(button.reply.id)"
            @update:model-value="updateConditionalNextStep(button.reply.id, $event)"
            :options="store.stepOptions"
            optionLabel="step_name"
            optionValue="id"
            placeholder="Select Next Step"
            class="w-full"
          />
        </div>
        <Button icon="pi pi-trash" class="p-button-danger p-button-text" @click="removeButton(index)" />
      </div>
      <Button label="Add Button" icon="pi pi-plus" class="p-button-sm" @click="addButton" />
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

const updateButtonTitle = (buttonId: string, title: string) => {
  if (store.editableTemplate?.options) {
    store.editableTemplate.options[buttonId] = title;
  }
};

const getConditionalNextStep = (buttonId: string) => {
  return store.editableTemplate?.conditional_next_steps?.[buttonId] || null;
};

const updateConditionalNextStep = (buttonId: string, nextStepId: number) => {
  if (store.editableTemplate) {
    if (!store.editableTemplate.conditional_next_steps) {
      store.editableTemplate.conditional_next_steps = {};
    }
    store.editableTemplate.conditional_next_steps[buttonId] = nextStepId;
  }
};

const addButton = () => {
  if (store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'buttons' in store.editableTemplate.message_template.interactive.action) {
    const newId = `option_${Date.now()}`;
    store.editableTemplate.message_template.interactive.action.buttons.push({
      type: 'reply',
      reply: { id: newId, title: 'New Button' }
    });
    if (store.editableTemplate.options) {
        store.editableTemplate.options[newId] = 'New Button';
    }
  }
};

const removeButton = (index: number) => {
  if (store.editableTemplate && 'interactive' in store.editableTemplate.message_template && 'buttons' in store.editableTemplate.message_template.interactive.action) {
    const button = store.editableTemplate.message_template.interactive.action.buttons[index];
    if (store.editableTemplate.options) {
        delete store.editableTemplate.options[button.reply.id];
    }
    if (store.editableTemplate.conditional_next_steps) {
        delete store.editableTemplate.conditional_next_steps[button.reply.id];
    }
    store.editableTemplate.message_template.interactive.action.buttons.splice(index, 1);
  }
};

</script>