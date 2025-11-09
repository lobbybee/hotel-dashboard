<template>
  <header class="mb-8">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold font-sans text-gray-900 mb-2">
          Hotel Profile
        </h1>
        <p class="text-gray-600 font-medium">{{ hotel?.name || 'LobbyBee Grand Hotel' }}</p>
      </div>
      <Button
        label="Save Changes"
        icon="pi pi-check"
        :loading="loading"
        @click="$emit('save')"
        class="bg-blue-600 hover:bg-blue-700 text-white h-12 px-8 rounded-lg font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 border-0"
      />
    </div>
  </header>
</template>

<script setup lang="ts">
const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  },
  loading: {
    type: Boolean,
    default: false
  }
});
const emit = defineEmits(['save']);
</script>
