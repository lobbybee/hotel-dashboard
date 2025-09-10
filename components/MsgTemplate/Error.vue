<template>
  <div class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
    <p class="font-bold">{{ title }}</p>
    <p>{{ message }}</p>
    <Button label="Retry" icon="pi pi-refresh" @click="$emit('retry')" class="mt-3" />
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';

defineProps({
  title: {
    type: String,
    default: 'Error Loading Templates'
  },
  message: {
    type: String,
    default: 'An unexpected error occurred'
  }
});

defineEmits(['retry']);
</script>
