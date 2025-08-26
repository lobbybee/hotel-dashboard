<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-calendar-times text-primary-500"></i> Guest Check-out
          </h1>
          <p class="text-gray-500">Manage check-outs for active stays.</p>
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
        <p class="font-bold">Error loading stays</p>
        <p>{{ error?.message || 'An unexpected error occurred' }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="refetch" class="mt-3" />
      </div>

      <!-- Stays List -->
      <div v-else class="space-y-6">
        <transition-group name="fade-up" tag="div" class="space-y-6">
          <Card 
            v-for="stay in activeStays || []" 
            :key="stay.id"
            class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1"
          >
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold flex items-center gap-2">
                  <i class="pi pi-user"></i>
                  {{ stay.guest.full_name }}
                </h3>
                <Badge :value="stay.status" severity="success" class="px-3 py-1 text-sm" />
              </div>
            </template>
            <template #content>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div class="space-y-3">
                  <div class="flex items-center gap-2 text-gray-600">
                    <i class="pi pi-bookmark"></i>
                    <span>Room: <b>{{ stay.room.number }} ({{ stay.room.room_type }})</b></span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <i class="pi pi-calendar-plus"></i>
                    <span>Checked-in: <b>{{ new Date(stay.actual_check_in_date).toLocaleString() }}</b></span>
                  </div>
                  <div class="flex items-center gap-2 text-gray-600">
                    <i class="pi pi-calendar-minus"></i>
                    <span>Expected Check-out: <b>{{ new Date(stay.expected_check_out_date).toLocaleDateString() }}</b></span>
                  </div>
                </div>
                <div class="flex items-center justify-end">
                  <Button 
                    label="Check-out" 
                    icon="pi pi-sign-out" 
                    @click="openCheckoutConfirmation(stay)"
                    class="p-button-danger"
                  />
                </div>
              </div>
            </template>
          </Card>
        </transition-group>
      </div>

      <!-- Empty State -->
      <div v-if="!isLoading && !error && (!activeStays || activeStays.length === 0)" class="text-center py-12">
        <i class="pi pi-moon text-5xl text-gray-300 mb-4"></i>
        <h3 class="text-xl font-semibold text-gray-700 mb-2">No Active Stays</h3>
        <p class="text-gray-500">There are no guests currently checked in.</p>
      </div>

    </div>
  </div>

  <!-- Check-out Confirmation Dialog -->
  <Dialog 
    v-model:visible="checkoutDialogVisible" 
    header="Confirm Check-out"
    :modal="true"
    :style="{ width: '450px' }"
    :draggable="false"
  >
    <div class="flex items-center gap-4">
      <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
      <span v-if="selectedStay">
        Are you sure you want to check out <b>{{ selectedStay.guest.full_name }}</b> from room <b>{{ selectedStay.room.number }}</b>?
      </span>
    </div>
    
    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeCheckoutConfirmation" />
      <Button 
        label="Confirm Check-out" 
        icon="pi pi-check" 
        @click="confirmCheckout" 
        :loading="checkoutAsyncStatus === 'pending'"
        class="p-button-danger"
      />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import { useToast } from 'primevue/usetoast';

// Import composables
import { useFetchStays, useCheckOut } from '~/composables/useGuest';

// Initialize composables
const { stays: activeStays, isLoading, error, refetch } = useFetchStays(ref({ status: 'active' }));
const { mutateAsync: checkOut, asyncStatus: checkoutAsyncStatus } = useCheckOut();

// Toast for notifications
const toast = useToast();

// Dialog handling
const checkoutDialogVisible = ref(false);
const selectedStay = ref<any>(null);

const openCheckoutConfirmation = (stay: any) => {
  selectedStay.value = stay;
  checkoutDialogVisible.value = true;
};

const closeCheckoutConfirmation = () => {
  checkoutDialogVisible.value = false;
  selectedStay.value = null;
};

const confirmCheckout = async () => {
  if (!selectedStay.value) return;

  try {
    await checkOut({ stay_id: selectedStay.value.id });
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Guest checked out successfully',
      life: 3000
    });
    await refetch();
    closeCheckoutConfirmation();
  } catch (err: any) {
    console.error('Error checking out:', err);
    toast.add({
      severity: 'error',
      summary: 'Check-out Failed',
      detail: err.data?.detail || 'An unexpected error occurred.',
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

/* Header animation */
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
</style>
