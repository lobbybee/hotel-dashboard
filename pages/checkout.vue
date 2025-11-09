<template>
  <div class="max-w-7xl mx-auto p-4">
    <div class="mb-8 fade-in">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Guest Check-out</h1>
      <p class="text-gray-600">Manage guest departures and room turnover</p>
    </div>

    <div class="mb-6">
      <span class="p-input-icon-left w-full">
        <i class="pi pi-search"></i>
        <InputText
          v-model="searchQuery"
          placeholder="Search by guest name or room number..."
          class="w-full"
        />
      </span>
    </div>

        <div v-if="isLoading" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <ProgressSpinner style="width: 48px; height: 48px" strokeWidth="6" />
      <p class="text-gray-500 mt-4">Loading active stays...</p>
    </div>

    <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
      <i class="pi pi-exclamation-triangle text-6xl text-red-300 mb-4"></i>
      <h3 class="text-lg font-medium text-gray-900 mb-2">Error loading active stays</h3>
      <p class="text-gray-500 mb-4">{{ error?.message }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="refetch" />
    </div>

    <div v-else-if="filteredStays && filteredStays.length === 0" class="text-center py-16 bg-white rounded-lg border border-gray-200">
      <i class="pi pi-inbox text-6xl text-gray-300 mb-4"></i>
      <p class="text-gray-500 text-lg mb-2">No active stays</p>
      <p class="text-gray-400 text-sm">All rooms are currently available</p>
    </div>

    <div v-else class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <div
        v-for="stay in filteredStays"
        :key="stay.id"
        class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-lg transition-all"
      >
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-full bg-primary-100 flex items-center justify-center">
              <i class="pi pi-user text-primary-600 text-xl"></i>
            </div>
            <div>
              <h3 class="font-semibold text-lg text-gray-900">{{ stay.guest.full_name }}</h3>
              <p class="text-sm text-gray-500">{{ stay.guest.email }}</p>
            </div>
          </div>
        </div>

        <div class="space-y-2 mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-home"></i>
              Room
            </span>
            <span class="font-semibold text-gray-900">{{ stay.room.room_number }}</span>
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-tag"></i>
              Category
            </span>
            <Tag :value="stay.room.category.name" severity="info" />
          </div>
          <div class="flex items-center justify-between text-sm">
            <span class="text-gray-600 flex items-center gap-2">
              <i class="pi pi-phone"></i>
              WhatsApp
            </span>
            <span class="font-medium text-gray-900">{{ stay.guest.whatsapp_number || 'N/A' }}</span>
          </div>
        </div>

        <div class="space-y-2 mb-4">
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-plus text-green-600"></i>
            <span>Check-in: {{ formatDate(stay.check_in_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm text-gray-600">
            <i class="pi pi-calendar-minus text-red-600"></i>
            <span>Check-out: {{ formatDate(stay.check_out_date) }}</span>
          </div>
          <div class="flex items-center gap-2 text-sm">
            <i class="pi pi-clock text-blue-600"></i>
            <span class="font-medium text-blue-600">{{ getDaysStayed(stay) }} night(s)</span>
          </div>
        </div>

        <Button
          label="Check Out"
          icon="pi pi-sign-out"
          class="w-full"
          severity="danger"
          @click="handleCheckout(stay)"
        />
      </div>
    </div>

    <!-- Check-out Confirmation Dialog -->
    <Dialog v-model:visible="isCheckoutDialogVisible" modal header="Confirm Check-out" :style="{ width: '30rem' }">
      <div v-if="selectedStayForCheckout" class="space-y-4">
        <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p class="text-sm text-blue-900 mb-2">
            <i class="pi pi-info-circle mr-2"></i>
            Guest Check-out Confirmation
          </p>
          <div class="space-y-1 text-sm">
            <p><strong>Guest:</strong> {{ selectedStayForCheckout.guest.full_name }}</p>
            <p><strong>Room:</strong> {{ selectedStayForCheckout.room.room_number }}</p>
            <p><strong>Duration:</strong> {{ getDaysStayed(selectedStayForCheckout) }} night(s)</p>
          </div>
        </div>

        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <p class="text-sm text-amber-900">
            <i class="pi pi-exclamation-triangle mr-2"></i>
            Room {{ selectedStayForCheckout.room.room_number }} will be marked as "Cleaning" after checkout.
          </p>
        </div>
      </div>
      <template #footer>
        <Button label="Cancel" text @click="isCheckoutDialogVisible = false" />
        <Button label="Confirm Check-out" severity="danger" @click="handleConfirmCheckout" :loading="isCheckingOut" />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import { useToast } from 'primevue/usetoast';

import { useFetchStays, useCheckOut } from '~/composables/useGuest';
import type { Stay } from '../types';



const toast = useToast();

// --- DATA FETCHING ---
const { data: activeStaysData, isLoading, error, refetch } = useFetchStays(ref({ status: 'active' }));
const activeStays = computed(() => activeStaysData.value?.results || []);

// --- SEARCH ---
const searchQuery = ref('');
const filteredStays = computed(() => {
  if (!searchQuery.value) {
    return activeStays.value;
  }
  const lowerCaseQuery = searchQuery.value.toLowerCase();
  return activeStays.value.filter(stay =>
    stay.guest.full_name.toLowerCase().includes(lowerCaseQuery) ||
    stay.room.room_number.toLowerCase().includes(lowerCaseQuery)
  );
});

// --- CHECKOUT LOGIC ---
const { mutateAsync: checkOutGuest, isLoading: isCheckingOut } = useCheckOut();
const isCheckoutDialogVisible = ref(false);
const selectedStayForCheckout = ref<any>(null);

const handleCheckout = (stay: any) => {
  selectedStayForCheckout.value = stay;
  isCheckoutDialogVisible.value = true;
};

const handleConfirmCheckout = async () => {
  if (!selectedStayForCheckout.value) return;

  try {
    await checkOutGuest({ stay_id: selectedStayForCheckout.value.id });

    toast.add({ severity: 'success', summary: 'Checked Out', detail: `${selectedStayForCheckout.value.guest.full_name} has been checked out. Room ${selectedStayForCheckout.value.room.room_number} is now marked for cleaning.`, life: 4000 });

    isCheckoutDialogVisible.value = false;
    await refetch(); // Refresh the list of active stays

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Check-out Failed', detail: errorMessage, life: 5000 });
  }
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  })
}

const getDaysStayed = (stay: Stay) => {
  const checkIn = new Date(stay.check_in_date)
  const checkOut = new Date(stay.check_out_date)
  const diff = checkOut.getTime() - checkIn.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
</script>

<style scoped>
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}
.animate-fade-in {
    animation: fade-in 0.5s ease forwards;
}
@keyframes fade-in {
  0% { opacity: 0; }
  100% { opacity: 1; }
}
</style>
