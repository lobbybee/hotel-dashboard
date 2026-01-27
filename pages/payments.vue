<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-credit-card text-primary-500"></i> Payment Management
          </h1>
          <p class="text-gray-500">Manage your hotel's subscription and payments.</p>
        </div>
        <Button
          label="Refresh All Data"
          icon="pi pi-refresh"
          @click="refetchAll"
          class="p-button-outlined"
        />
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
        <p class="font-bold">Error loading payment information</p>
        <p>{{ error?.message || 'An unexpected error occurred' }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="refetchAll" class="mt-3" />
      </div>

      <!-- Main Content -->
      <div v-else class="space-y-8">
        <!-- Current Subscription -->
        <MySubscription
          :subscription="mySubscription || null"
          @refresh="refetchAll"
        />

        <!-- Subscription Plans -->
        <!-- <PaymentPlans
          :plans="plans"
          @refresh="refetchAll"
        /> -->

        <!-- Recent Transactions -->
        <PaymentTransactions
          :transactions="transactionsList"
          @refresh="refetchAll"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';
import type { SubscriptionPlan, Transaction, HotelSubscription } from '~/composables/usePayments';
import { useAPIHelper } from '~/composables/useAPIHelper';

// Import composables
import {
  useFetchPlans,
  useFetchTransactions,
  useFetchMySubscription
} from '~/composables/usePayments';

// Import components
import PaymentPlans from '~/components/Payments/PaymentPlans.vue';
import MySubscription from '~/components/Payments/MySubscription.vue';
import PaymentTransactions from '~/components/Payments/PaymentTransactions.vue';

// Initialize composables
const { plans, isLoading: plansLoading, error: plansError, refetch: refetchPlans } = useFetchPlans();
const { transactions, isLoading: transactionsLoading, error: transactionsError, refetch: refetchTransactions } = useFetchTransactions();
const { subscription: mySubscription, isLoading: subscriptionLoading, error: subscriptionError, refetch: refetchSubscription } = useFetchMySubscription();

// Computed lists for components (handling pagination)
const plansList = computed(() => (plans.value as any)?.results || (Array.isArray(plans.value) ? plans.value : []));
const transactionsList = computed(() => (transactions.value as any)?.results || (Array.isArray(transactions.value) ? transactions.value : []));

// Toast for notifications
const toast = useToast();

// Loading and error states
const isLoading = computed(() => plansLoading.value || transactionsLoading.value || subscriptionLoading.value);

const error = computed(() => plansError.value || transactionsError.value || subscriptionError.value);
const { getErrorMessage } = useAPIHelper();

// Refresh all data
const refetchAll = async () => {
  try {
    await Promise.all([
      refetchPlans(),
      refetchTransactions(),
      refetchSubscription()
    ]);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Data refreshed successfully',
      life: 3000
    });
  } catch (err) {
    console.error('Error refreshing data:', err);
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: getErrorMessage(err),
      life: 5000
    });
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
