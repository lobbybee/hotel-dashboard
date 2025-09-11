<template>
  <div class="space-y-6" id="subscription-plans">
    <div class="flex items-center justify-between">
      <h2 class="text-2xl font-bold text-gray-800">Subscription Plans</h2>
      <Button
        label="Refresh"
        icon="pi pi-refresh"
        @click="emit('refresh')"
        class="p-button-outlined p-button-sm"
      />
    </div>

    <div v-if="!plans || plans.length === 0" class="bg-white rounded-xl shadow-sm border border-gray-200 p-8 text-center">
      <div class="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
        <i class="pi pi-list text-2xl text-gray-400"></i>
      </div>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Subscription Plans Available</h3>
      <p class="text-gray-500">There are currently no subscription plans available.</p>
    </div>

    <div v-else class="">
      <transition-group name="fade-up" tag="div" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div
          v-for="plan in plans"
          :key="plan.id"
          class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
        >
          <div class="p-6">
            <div class="flex items-center justify-between mb-4">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <i class="pi pi-list" :class="getPlanTypeIcon(plan.plan_type)"></i>
                {{ plan.name }}
              </h3>
              <Badge :value="plan.is_active ? 'Active' : 'Inactive'" :severity="plan.is_active ? 'success' : 'danger'" class="px-2 py-1 text-xs" />
            </div>

            <div class="mb-6">
              <div class="text-3xl font-bold text-gray-800">
                ${{ parseFloat(plan.price).toFixed(2) }}
                <span class="text-sm font-normal text-gray-500">/ {{ plan.duration_days }} days</span>
              </div>
            </div>

            <div v-if="plan.description" class="text-gray-600 mb-6">
              {{ plan.description }}
            </div>

            <div class="flex items-center gap-2 text-gray-500 text-sm mb-6">
              <i class="pi pi-calendar-plus"></i>
              <span>Created: {{ formatDate(plan.created_at) }}</span>
            </div>

            <Button
              :label="plan.plan_type === 'trial' ? 'Start Free Trial' : 'Subscribe Now'"
              :class="plan.plan_type === 'trial' ? 'p-button-success' : 'p-button-primary'"
              class="w-full"
              @click="selectPlan(plan)"
              :loading="isSubscribing && selectedPlanId === plan.id"
            />
          </div>
        </div>
      </transition-group>
    </div>

    <!-- Subscription Confirmation Dialog -->
    <Dialog
      v-model:visible="showSubscriptionDialog"
      header="Subscription Confirmation"
      :modal="true"
      :style="{ width: '500px' }"
      :draggable="false"
    >
      <div v-if="selectedPlan" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 class="font-semibold text-lg mb-2">You've selected:</h3>
          <div class="flex items-center justify-between">
            <span class="font-medium">{{ selectedPlan.name }}</span>
            <Badge :value="selectedPlan.plan_type" :severity="selectedPlan.plan_type === 'trial' ? 'warning' : 'info'" />
          </div>
          <div class="mt-2">
            <span class="font-semibold text-xl">${{ parseFloat(selectedPlan.price).toFixed(2) }}</span>
            <span class="text-gray-600"> / {{ selectedPlan.duration_days }} days</span>
          </div>
        </div>

        <div class="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div class="flex items-start">
            <i class="pi pi-info-circle text-yellow-500 text-xl mr-2 mt-0.5"></i>
            <div>
              <h4 class="font-medium text-yellow-800">Next Steps</h4>
              <p class="text-yellow-700 text-sm mt-1">
                After confirming, you'll be redirected to complete the payment process for your subscription.
              </p>
            </div>
          </div>
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="showSubscriptionDialog = false" />
        <Button label="Pay Now" icon="pi pi-check" class="p-button-success" @click="confirmSubscription" :loading="isConfirming" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';
import type { SubscriptionPlan } from '~/composables/usePayments';
import { useSubscribeToPlan } from '~/composables/usePayments';

// Props
const props = defineProps<{
  plans: SubscriptionPlan[] | undefined;
}>();

// Emits
const emit = defineEmits<{
  (e: 'refresh'): void;
}>();

// Toast for notifications
const toast = useToast();

// Subscription functionality
const { subscribeToPlan } = useSubscribeToPlan();
const isSubscribing = ref(false);
const isConfirming = ref(false);
const selectedPlanId = ref<string | null>(null);
const selectedPlan = ref<SubscriptionPlan | null>(null);
const showSubscriptionDialog = ref(false);

// Helper functions
const getPlanTypeIcon = (type: string) => {
  return type === 'trial' ? 'text-yellow-500' : 'text-blue-500';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString();
};

const selectPlan = async (plan: SubscriptionPlan) => {
  selectedPlanId.value = plan.id;
  selectedPlan.value = plan;
  showSubscriptionDialog.value = true;
};

const confirmSubscription = async () => {
  if (!selectedPlan.value) return;

  isConfirming.value = true;
  try {
    await subscribeToPlan(selectedPlan.value.id);

    // Show success message
    toast.add({
      severity: 'success',
      summary: 'Subscription Initiated',
      detail: `Successfully initiated subscription to ${selectedPlan.value.name}.`,
      life: 5000
    });

    // Close dialog
    showSubscriptionDialog.value = false;

    // Emit refresh event to update subscription data
    emit('refresh');

    // TODO: Implement payment flow here
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    toast.add({
      severity: 'error',
      summary: 'Subscription Failed',
      detail: 'Failed to initiate subscription. Please try again.',
      life: 5000
    });
  } finally {
    isConfirming.value = false;
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
