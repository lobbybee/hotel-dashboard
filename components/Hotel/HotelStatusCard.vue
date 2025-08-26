<template>
  <Card v-if="hotel" class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
    <template #title>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-semibold flex items-center gap-2">
          <i class="pi pi-info-circle text-blue-500"></i> Hotel Status
        </h3>
        <Badge :value="hotel.status" :severity="getStatusSeverity(hotel.status)" class="px-3 py-1 text-sm" />
      </div>
    </template>
    <template #content>
      <p class="text-gray-600 leading-relaxed">
        Your hotel profile is currently <span class="font-semibold">{{ hotel.status }}</span>.
        <span v-if="hotel.status === 'pending'"> Complete your profile and upload documents for verification.</span>
        <span v-if="hotel.status === 'verified'"> Your hotel is verified and visible to customers.</span>
        <span v-if="hotel.status === 'rejected'"> Verification was rejected. Please review and resubmit.</span>
      </p>
    </template>
  </Card>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import Card from 'primevue/card';
import Badge from 'primevue/badge';

// Define props
const props = defineProps({
  hotel: {
    type: Object,
    required: true
  }
});

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'verified':
      return 'success';
    case 'suspended':
      return 'danger';
    case 'rejected':
      return 'danger';
    default:
      return 'info';
  }
};
</script>