<template>
  <div class="space-y-2" v-if="store.editableTemplate && 'text' in store.editableTemplate.message_template">
    <label for="text-message" class="block text-sm font-medium text-gray-700">Message</label>
    <Textarea 
      id="text-message"
      v-model="store.editableTemplate.message_template.text"
      rows="4"
      class="w-full"
      placeholder="Enter your message here"
    />
  </div>
</template>

<script setup lang="ts">
import Textarea from 'primevue/textarea';
import { useMessageFlowStore } from '~/stores/flow';

const store = useMessageFlowStore();
</script>