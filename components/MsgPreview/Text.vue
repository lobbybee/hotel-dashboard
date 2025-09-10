<template>
  <div class="bg-green-100 p-3 rounded-lg">
    <p class="text-gray-800">{{ template.text }}</p>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ template: any }>();
</script>