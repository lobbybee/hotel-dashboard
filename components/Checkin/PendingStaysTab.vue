<template>
  <div class="space-y-6 pt-4">
    <div v-if="pendingStaysLoading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
    </div>
    <div v-else-if="pendingStaysError" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
      <p class="font-bold">Error loading stays</p>
      <p>{{ pendingStaysError?.message }}</p>
      <Button label="Retry" icon="pi pi-refresh" @click="pendingStaysRefetch" class="mt-3" />
    </div>
    <div v-else-if="pendingStays && pendingStays.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      <Card v-for="stay in pendingStays" :key="stay.id">
        <template #title>
          <div class="flex items-center justify-between">
            <h3 class="text-lg font-semibold">{{ stay.guest.full_name }}</h3>
            <Badge :value="stay.status" :severity="stay.identity_verified ? 'info' : 'warning'" />
          </div>
        </template>
        <template #content>
          <div class="space-y-2 text-sm text-gray-600">
            <div class="flex items-center gap-2"><i class="pi pi-bookmark"></i> Room: <strong>{{ stay.room.room_number }}</strong></div>
            <div class="flex items-center gap-2"><i class="pi pi-calendar"></i> Expected: <strong>{{ new Date(stay.expected_check_in_date).toLocaleDateString() }}</strong></div>
            <div class="flex items-center gap-2" v-if="stay.identity_verified"><i class="pi pi-check-circle text-green-500"></i> <span>Identity Verified</span></div>
            <div class="flex items-center gap-2" v-else><i class="pi pi-exclamation-triangle text-yellow-500"></i> <span>Verification Pending</span></div>
          </div>
        </template>
        <template #footer>
          <div class="flex gap-2">
            <Button label="Check-in" icon="pi pi-user-check" class="w-full" @click="handleDirectCheckin(stay)" />
            <Button label="WhatsApp" icon="pi pi-whatsapp" class="w-full p-button-secondary" @click="handleInitiateWhatsappCheckin(stay.id)" :loading="isInitiatingCheckin" />
          </div>
        </template>
      </Card>
    </div>
    <div v-else class="text-center py-12">
      <i class="pi pi-check-circle text-5xl text-gray-300 mb-4"></i>
      <h3 class="text-xl font-semibold text-gray-700 mb-2">No Pending Stays</h3>
      <p class="text-gray-500">There are no upcoming check-ins at the moment.</p>
    </div>

    <!-- Check-in Confirmation Dialog -->
    <CheckinConfirmationDialog 
      v-model:visible="isCheckinDialogVisible" 
      :stay="selectedStayForCheckin" 
      :is-confirming="isConfirmingCheckin"
      @confirmed="handleConfirmCheckin" 
      @create-stay="handleCreateStay"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import ProgressSpinner from 'primevue/progressspinner';
import Button from 'primevue/button';
import Card from 'primevue/card';
import Badge from 'primevue/badge';
import { useToast } from 'primevue/usetoast';

import { useFetchStays, useInitiateCheckIn, useVerifyAndCheckIn, usePatchStay, useCreateStay } from '~/composables/useGuest';
import { useFetchRooms } from '~/composables/useHotel';

const toast = useToast();

// --- DATA: PENDING STAYS ---
const { data: pendingStaysData, isLoading: pendingStaysLoading, error: pendingStaysError, refetch: pendingStaysRefetch } = useFetchStays(ref({ status: 'pending' }));
const pendingStays = computed(() => pendingStaysData.value?.results || []);

const { mutateAsync: initiateCheckin, isLoading: isInitiatingCheckin } = useInitiateCheckIn(ref('')); // Note: This is not ideal, see handler
const { mutateAsync: verifyAndCheckIn, isLoading: isVerifyingAndCheckingIn } = useVerifyAndCheckIn();
const { mutateAsync: patchStay, isLoading: isPatchingStay } = usePatchStay();
const { mutateAsync: createStay, isLoading: isCreatingStay } = useCreateStay();

const { refetch: refetchRooms } = useFetchRooms(ref({ status: 'available' }));

// --- DIALOG MANAGEMENT ---
const isCheckinDialogVisible = ref(false);
const selectedStayForCheckin = ref<any>(null);

const handleDirectCheckin = (stay: any) => {
  selectedStayForCheckin.value = stay;
  isCheckinDialogVisible.value = true;
};

const isConfirmingCheckin = computed(() => isVerifyingAndCheckingIn.value || isPatchingStay.value || isCreatingStay.value);

const handleConfirmCheckin = async ({ roomId }: { roomId: number | null }) => {
  if (!selectedStayForCheckin.value) return;

  try {
    if (roomId && selectedStayForCheckin.value.room.id !== roomId) {
      await patchStay({ id: selectedStayForCheckin.value.id, room: roomId });
    }

    await verifyAndCheckIn(selectedStayForCheckin.value.id);

    toast.add({ severity: 'success', summary: 'Success', detail: 'Guest checked in successfully.', life: 3000 });

    isCheckinDialogVisible.value = false;
    await pendingStaysRefetch();
    await refetchRooms();

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Check-in Failed', detail: errorMessage, life: 5000 });
  }
};

const handleCreateStay = async ({ guestId, roomId, checkOutDate }: { guestId: number, roomId: number, checkOutDate: string }) => {
    try {
        const newStay = await createStay({
            guest: guestId,
            room: roomId,
            check_in_date: new Date().toISOString(),
            check_out_date: checkOutDate,
        });

        await verifyAndCheckIn(newStay.id);

        toast.add({ severity: 'success', summary: 'Success', detail: 'Guest checked in successfully.', life: 3000 });

        isCheckinDialogVisible.value = false;
        await pendingStaysRefetch();
        await refetchRooms();

    } catch (err: any) {
        const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
        toast.add({ severity: 'error', summary: 'Check-in Failed', detail: errorMessage, life: 5000 });
    }
};

const handleInitiateWhatsappCheckin = async (stayId: number) => {
  try {
    const stayIdRef = ref(String(stayId));
    const { mutateAsync: initiate } = useInitiateCheckIn(stayIdRef);
    await initiate();
    toast.add({ severity: 'info', summary: 'Process Initiated', detail: 'WhatsApp check-in process has been started for the guest.', life: 4000 });
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Initiation Failed', detail: 'Could not start the WhatsApp check-in process.', life: 5000 });
  }
};
</script>