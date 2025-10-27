<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-calendar-times text-primary-500"></i> Guest Check-out
          </h1>
          <p class="text-gray-500">Finalize a guest's stay and process their departure.</p>
        </div>
      </header>

      <div class="space-y-6 pt-4">
        <Card class="shadow-sm border border-gray-200">
          <template #content>
            <div class="flex justify-between items-center">
              <h2 class="text-xl font-semibold text-gray-700">Active Stays</h2>
              <div class="flex items-center gap-2">
                <InputText v-model="searchQuery" placeholder="Search by guest or room..." class="w-full" />
                <Button icon="pi pi-search" disabled />
              </div>
            </div>
          </template>
        </Card>

        <div v-if="isLoading" class="flex justify-center items-center h-64">
          <ProgressSpinner />
        </div>
        <div v-else-if="error" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
          <p class="font-bold">Error loading active stays</p>
          <p>{{ error?.message }}</p>
          <Button label="Retry" icon="pi pi-refresh" @click="refetch" class="mt-3" />
        </div>
        <div v-else-if="filteredStays && filteredStays.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card v-for="stay in filteredStays" :key="stay.id" class="animate-fade-in">
            <template #title>
              <div class="flex items-center justify-between">
                <h3 class="text-lg font-semibold">{{ stay.guest.full_name }}</h3>

                <Badge :value="`Room ${stay.room.room_number}`" severity="info" />
              </div>
            </template>
            <template #content>
              <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center gap-2"><i class="pi pi-phone"></i>Phone: <strong>{{ stay.guest.whatsapp_number ?? 'None' }}</strong></div>
                <div class="flex items-center gap-2"><i class="pi pi-calendar-check"></i>Checked In: <strong>{{ new Date(stay.check_in_date).toLocaleString() }}</strong></div>
                <div class="flex items-center gap-2"><i class="pi pi-calendar"></i> Expected Out: <strong>{{ new Date(stay.check_out_date).toLocaleDateString() }}</strong></div>
              </div>
            </template>
            <template #footer>
              <Button label="Check-out" icon="pi pi-user-minus" class="w-full" @click="handleCheckout(stay)" />
            </template>
          </Card>
        </div>
        <div v-else class="text-center py-12 animate-fade-in">
          <i class="pi pi-moon text-5xl text-gray-300 mb-4"></i>
          <h3 class="text-xl font-semibold text-gray-700 mb-2">No Active Stays</h3>
          <p class="text-gray-500">There are no guests currently checked in.</p>
        </div>
      </div>
    </div>

    <!-- Check-out Confirmation Dialog -->
    <Dialog v-model:visible="isCheckoutDialogVisible" modal header="Confirm Guest Check-out" :style="{ width: '450px' }">
        <div v-if="selectedStayForCheckout" class="space-y-4">
            <p>Are you sure you want to check out the following guest?</p>
            <div>
                <p><strong>Guest:</strong> {{ selectedStayForCheckout.guest.full_name }}</p>
                <p><strong>Room:</strong> {{ selectedStayForCheckout.room.room_number }}</p>
            </div>
            <Message severity="warn">This action will mark the stay as completed and set the room status to 'Cleaning'.</Message>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="isCheckoutDialogVisible = false" class="p-button-text" />
            <Button label="Confirm & Check-out" icon="pi pi-check" @click="handleConfirmCheckout" :loading="isCheckingOut" />
        </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dialog from 'primevue/dialog';
import Message from 'primevue/message';
import { useToast } from 'primevue/usetoast';

import { useFetchStays, useCheckOut } from '~/composables/useGuest';



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

    toast.add({ severity: 'success', summary: 'Success', detail: 'Guest checked out successfully.', life: 3000 });

    isCheckoutDialogVisible.value = false;
    await refetch(); // Refresh the list of active stays

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Check-out Failed', detail: errorMessage, life: 5000 });
  }
};
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
