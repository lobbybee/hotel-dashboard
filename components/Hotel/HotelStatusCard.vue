<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8">
    <div class="text-center flex flex-col justify-center items-center h-full">
      <div class="w-16 h-16 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-check-circle text-2xl text-green-500"></i>
      </div>
      <h3 class="text-lg font-bold text-gray-900 mb-2">Verified Hotel</h3>
      <p class="text-sm text-gray-600">All documents approved</p>
      <div class="mt-4">
        <Badge
          :value="hotel?.status || 'active'"
          :severity="getStatusSeverity(hotel?.status || 'active')"
          class="px-4 py-2 text-sm font-semibold rounded-lg"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Badge from 'primevue/badge';

const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'active':
    case 'verified':
      return 'success';
    case 'pending':
      return 'warning';
    case 'suspended':
    case 'rejected':
      return 'danger';
    default:
      return 'info';
  }
};
</script>
