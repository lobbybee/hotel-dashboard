<template>
  <div>
    <div class="bg-green-100 p-3 rounded-t-lg">
      <p class="text-gray-800">{{ template.interactive.body.text }}</p>
    </div>
    <div class="bg-white rounded-b-lg border-t border-gray-200">
      <div v-for="(button, index) in template.interactive.action.buttons" :key="index" class="text-center py-2 border-b last:border-b-0">
        <span class="text-blue-500 font-medium cursor-pointer">{{ button.reply.title }}</span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ template: any }>();
</script>