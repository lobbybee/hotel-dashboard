<template>
  <Dialog 
    :visible="visible" 
    header="Confirm Revert to Default"
    :modal="true"
    :style="{ width: '450px' }"
    :draggable="false"
    @update:visible="$emit('update:visible', $event)"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle text-3xl text-yellow-500"></i>
      <span>
        Are you sure you want to revert <b>{{ templateName }}</b> to its default settings? Your customizations will be lost.
      </span>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="$emit('close')" />
      <Button label="Revert" icon="pi pi-undo" class="p-button-danger" @click="$emit('confirm')" :loading="loading" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';

defineProps({
  visible: {
    type: Boolean,
    default: false
  },
  loading: {
    type: Boolean,
    default: false
  },
  templateName: {
    type: String,
    default: ''
  }
});

defineEmits(['update:visible', 'close', 'confirm']);
</script>
