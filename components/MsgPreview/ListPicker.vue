<template>
  <div>
    <div class="bg-green-100 p-3 rounded-lg">
      <p class="text-gray-800">{{ template.interactive.body.text }}</p>
    </div>
    <div class="bg-white rounded-b-lg border-t border-gray-200 p-2">
        <div class="text-center py-2 border-b last:border-b-0">
            <span class="text-blue-500 font-medium cursor-pointer">{{ template.interactive.action.button }}</span>
        </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const props = defineProps<{ template: any }>();
</script>