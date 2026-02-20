<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">My Subscription</h2>
      <Button 
        label="Refresh" 
        icon="pi pi-refresh" 
        @click="emit('refresh')"
        class="p-button-outlined p-button-sm"
      />
    </div>
    
    <div v-if="!subscription" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center mb-4">
        <i class="pi pi-calendar text-2xl text-blue-500"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Active Subscription</h3>
      <p class="text-gray-500 mb-6">You don't have an active subscription at the moment.</p>
      <Button label="View Plans" icon="pi pi-list" @click="scrollToPlans" class="p-button-rounded" />
    </div>
    
    <div v-else class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      <div class="bg-gradient-to-r from-blue-500 to-indigo-600 p-6 text-white">
        <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 class="text-xl font-bold flex items-center gap-2">
              <i class="pi pi-calendar"></i>
              {{ subscription.plan?.name }}
            </h3>
            <p class="opacity-90 mt-1">{{ subscription.plan?.description }}</p>
          </div>
          <Badge :value="subscription.is_active ? 'Active' : 'Inactive'" :severity="subscription.is_active ? 'success' : 'danger'" class="px-3 py-2 text-sm font-medium" />
        </div>
      </div>
      
      <div class="p-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="text-gray-500 text-sm mb-1">Price</div>
            <div class="font-semibold text-lg">{{ parseFloat(subscription.plan?.price).toFixed(2) }}</div>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="text-gray-500 text-sm mb-1">Duration</div>
            <div class="font-semibold text-lg">{{ subscription.plan?.duration_days }} days</div>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="text-gray-500 text-sm mb-1">Start Date</div>
            <div class="font-semibold text-lg">{{ formatDate(subscription.start_date) }}</div>
          </div>
          
          <div class="border border-gray-200 rounded-lg p-4">
            <div class="text-gray-500 text-sm mb-1">End Date</div>
            <div class="font-semibold text-lg">{{ formatDate(subscription.end_date) }}</div>
          </div>
        </div>
        
        <div v-if="subscription.days_until_expiry !== undefined" class="bg-yellow-50 border border-yellow-200 rounded-lg p-4 flex items-center">
          <i class="pi pi-clock text-yellow-500 text-xl mr-3"></i>
          <div>
            <div class="font-medium text-yellow-800">Subscription Expiry</div>
            <div class="text-yellow-700">
              <span :class="subscription.days_until_expiry < 7 ? 'font-bold' : ''">
                {{ subscription.days_until_expiry }} days
              </span>
              remaining
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import type { HotelSubscription } from '~/composables/usePayments';

// Props
const props = defineProps<{
  subscription: HotelSubscription | null;
}>();

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// Helper functions
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const scrollToPlans = () => {
  const plansElement = document.getElementById('subscription-plans');
  if (plansElement) {
    plansElement.scrollIntoView({ behavior: 'smooth' });
  }
};
</script>

<style scoped>
/* Fade up transition */
.fade-up-enter-active,
.fade-up-leave-active {
  transition: all 0.4s ease;
}
.fade-up-enter-from {
  opacity: 0;
  transform: translateY(15px);
}
.fade-up-enter-to {
  opacity: 1;
  transform: translateY(0);
}
</style>