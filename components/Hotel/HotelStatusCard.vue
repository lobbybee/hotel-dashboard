<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
    <div class="text-center flex flex-col justify-center items-center h-full">
      <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-check-circle text-xl text-green-600"></i>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-2">Hotel Status</h3>
      <p class="text-sm text-gray-600 mb-4">Current verification status</p>
      <div class="flex justify-center">
        <Badge
          :value="hotel?.status || 'active'"
          :severity="getStatusSeverity(hotel?.status || 'active')"
          rounded
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
