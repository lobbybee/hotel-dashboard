<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Loading State -->
    <div v-if="pendingStaysLoading" class="flex items-center justify-center min-h-96">
      <div class="flex flex-col items-center gap-4">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        <p class="text-sm text-gray-500">Loading pending stays...</p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="pendingStaysError" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="bg-red-50 border border-red-200 rounded-lg p-6">
        <div class="flex">
          <div class="flex-shrink-0">
            <i class="pi pi-exclamation-triangle text-red-400 text-xl"></i>
          </div>
          <div class="ml-4">
            <h3 class="text-sm font-medium text-red-800">Error Loading Stays</h3>
            <div class="mt-2 text-sm text-red-700">
              <p>{{ pendingStaysError?.message }}</p>
            </div>
            <button class="mt-4 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center gap-2" @click="pendingStaysRefetch">
              <i class="pi pi-refresh"></i>
              Retry
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Stays Grid -->
    <div v-else-if="pendingStays && pendingStays.length > 0" class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
        <div v-for="stay in pendingStays" :key="stay.id" class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
          <!-- Card Header -->
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">{{ stay.guest.full_name }}</h3>
            <span
              class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
              :class="stay.identity_verified ? 'bg-blue-50 text-blue-600' : 'bg-amber-50 text-amber-600'"
            >
              {{ stay.status }}
            </span>
          </div>

          <!-- Card Content -->
          <div class="space-y-3">
            <div class="flex items-center gap-2 text-sm">
              <i class="pi pi-bookmark text-gray-400"></i>
              <span class="text-gray-600">Room:</span>
              <strong class="text-gray-900">{{ stay.room_details?.room_number || stay.room }}</strong>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <i class="pi pi-calendar text-gray-400"></i>
              <span class="text-gray-600">Check-in:</span>
              <strong class="text-gray-900">{{ new Date(stay.check_in_date).toLocaleDateString() }}</strong>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <i class="pi pi-calendar-times text-gray-400"></i>
              <span class="text-gray-600">Check-out:</span>
              <strong class="text-gray-900">{{ new Date(stay.check_out_date).toLocaleDateString() }}</strong>
            </div>

            <div class="flex items-center gap-2 text-sm">
              <i
                class="pi"
                :class="stay.identity_verified ? 'pi-check-circle text-green-500' : 'pi-exclamation-triangle text-amber-500'"
              ></i>
              <span class="text-gray-600">
                {{ stay.identity_verified ? 'Identity Verified' : 'Verification Pending' }}
              </span>
            </div>

            <!-- Documents Section -->
            <div v-if="stay.guest?.documents && stay.guest.documents.length > 0" class="mt-4 pt-4 border-t border-gray-100">
              <div class="flex items-center gap-2 text-sm mb-3">
                <i class="pi pi-id-card text-gray-400"></i>
                <span class="text-gray-600 font-medium">Identity Documents</span>
              </div>
              <div class="space-y-2">
                <div
                  v-for="document in stay.guest.documents"
                  :key="document.id"
                  class="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-200"
                >
                  <div class="flex items-center gap-3">
                    <div class="flex items-center gap-2">
                      <i
                        class="pi"
                        :class="document.is_verified ? 'pi-check-circle text-green-500' : 'pi-times-circle text-red-500'"
                      ></i>
                      <span class="text-sm font-medium text-gray-900">
                        {{ formatDocumentType(document.document_type) }}
                      </span>
                    </div>
                    <span v-if="document.document_number" class="text-xs text-gray-500">
                      {{ document.document_number }}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Card Footer -->
          <div class="flex flex-col gap-3 mt-6">
            <button
              class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleDirectCheckin(stay)"
              :disabled="isConfirmingCheckin"
            >
              <i class="pi pi-user-check"></i>
              Check-in
            </button>

            <button
              class="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              @click="handleRejectCheckin(stay)"
              :disabled="isConfirmingCheckin"
            >
              <i class="pi pi-times-circle"></i>
              Decline
            </button>

          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div class="text-center py-12">
        <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <i class="pi pi-check-circle text-gray-400 text-2xl"></i>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No Pending Stays</h3>
        <p class="text-gray-500">There are no upcoming check-ins at the moment.</p>
      </div>
    </div>

    <!-- Check-in Confirmation Dialog -->
    <CheckinConfirmationDialog
      v-model:visible="isCheckinDialogVisible"
      :stay="selectedStayForCheckin"
      :is-confirming="isConfirmingCheckin"
      @confirmed="handleConfirmCheckin"
    />

    <!-- Reject Check-in Confirmation Dialog -->
    <Dialog
      v-model:visible="isRejectDialogVisible"
      modal
      header="Reject Check-in Request"
      :style="{ width: '450px' }"
      :breakpoints="{ '1199px': '75vw', '575px': '90vw' }"
    >
      <div class="flex items-center gap-4 mb-4">
        <div class="flex-shrink-0">
          <i class="pi pi-exclamation-triangle text-red-500 text-2xl"></i>
        </div>
        <div>
          <p class="font-medium text-gray-900">Reject {{ selectedStayForReject?.guest?.full_name }}'s check-in?</p>
          <p class="text-sm text-gray-600 mt-1">
            This will cancel the guest's check-in request and send them a notification.
            The guest's pending records will be cleaned up.
          </p>
        </div>
      </div>

      <div v-if="selectedStayForReject" class="bg-gray-50 rounded-lg p-3 mb-4">
        <div class="space-y-2 text-sm">
          <div class="flex items-center gap-2">
            <i class="pi pi-bookmark text-gray-400"></i>
            <span class="text-gray-600">Room:</span>
            <strong class="text-gray-900">{{ selectedStayForReject.room_details?.room_number || selectedStayForReject.room }}</strong>
          </div>
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar text-gray-400"></i>
            <span class="text-gray-600">Check-in:</span>
            <strong class="text-gray-900">{{ new Date(selectedStayForReject.check_in_date).toLocaleDateString() }}</strong>
          </div>
          <div class="flex items-center gap-2">
            <i class="pi pi-calendar-times text-gray-400"></i>
            <span class="text-gray-600">Check-out:</span>
            <strong class="text-gray-900">{{ new Date(selectedStayForReject.check_out_date).toLocaleDateString() }}</strong>
          </div>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          text
          @click="isRejectDialogVisible = false"
          :disabled="isRejectingCheckin"
        />
        <Button
          label="Reject Check-in"
          icon="pi pi-times-circle"
          severity="danger"
          @click="handleConfirmReject"
          :loading="isRejectingCheckin"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useToast } from 'primevue/usetoast';

import { useListPendingStays, useVerifyCheckin, useRejectCheckin } from '~/composables/checkin-manager';
import { useFetchRooms } from '~/composables/useHotel';

import CheckinConfirmationDialog from './ConfirmationDialog.vue';

const toast = useToast();

// --- DATA: PENDING STAYS ---
const { pendingStays, isLoading: pendingStaysLoading, error: pendingStaysError, refetch: pendingStaysRefetch } = useListPendingStays();

const {  verifyCheckin, isLoading: isVerifyingCheckin } = useVerifyCheckin();

const { rejectCheckin, isLoading: isRejectingCheckin } = useRejectCheckin();

const { refetch: refetchRooms } = useFetchRooms(ref({ status: 'available' }));

// --- DIALOG MANAGEMENT ---
const isCheckinDialogVisible = ref(false);
const selectedStayForCheckin = ref<any>(null);

const isRejectDialogVisible = ref(false);
const selectedStayForReject = ref<any>(null);

const handleDirectCheckin = (stay: any) => {
  selectedStayForCheckin.value = stay;
  isCheckinDialogVisible.value = true;
};

const handleRejectCheckin = (stay: any) => {
  selectedStayForReject.value = stay;
  isRejectDialogVisible.value = true;
};

const isConfirmingCheckin = computed(() => isVerifyingCheckin.value);

const handleConfirmCheckin = async (verifyData: any) => {
  console.log('handleConfirmCheckin called with:', verifyData);
  console.log('selectedStayForCheckin.value:', selectedStayForCheckin.value);

  if (!selectedStayForCheckin.value) {
    console.log('No selected stay, returning early');
    return;
  }

  try {
    console.log('About to call verifyCheckin...');
    await verifyCheckin({
      stayId: selectedStayForCheckin.value.id,
      data: verifyData
    });
    console.log('verifyCheckin completed successfully');

    toast.add({ severity: 'success', summary: 'Success', detail: 'Guest checked in successfully.', life: 3000 });

    isCheckinDialogVisible.value = false;
    await pendingStaysRefetch();
    await refetchRooms();

  } catch (err: any) {
    console.error('verifyCheckin error:', err);
    const errorMessage = err.response?._data?.detail || err.response?._data?.error || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Check-in Failed', detail: errorMessage, life: 5000 });
  }
};

const handleConfirmReject = async () => {
  console.log('handleConfirmReject called for:', selectedStayForReject.value);

  if (!selectedStayForReject.value) {
    console.log('No selected stay for rejection, returning early');
    return;
  }

  try {
    console.log('About to call rejectCheckin...');
    await rejectCheckin(selectedStayForReject.value.id);
    console.log('rejectCheckin completed successfully');

    toast.add({
      severity: 'success',
      summary: 'Check-in Rejected',
      detail: `Guest ${selectedStayForReject.value.guest?.full_name}'s check-in request has been rejected and they have been notified.`,
      life: 3000
    });

    isRejectDialogVisible.value = false;
    await pendingStaysRefetch();
    await refetchRooms();

  } catch (err: any) {
    console.error('rejectCheckin error:', err);
    const errorMessage = err.response?._data?.error || err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({
      severity: 'error',
      summary: 'Rejection Failed',
      detail: errorMessage,
      life: 5000
    });
  }
};

// handleCreateStay functionality is now handled by the offline check-in flow
// This function is removed as it's replaced by the new checkin-manager workflow

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

// Helper function to format document type
const formatDocumentType = (documentType: string): string => {
  const typeMap: Record<string, string> = {
    'aadhar_id': 'Aadhar Card',
    'pan_id': 'PAN Card',
    'passport': 'Passport',
    'voter_id': 'Voter ID',
    'driving_license': 'Driving License'
  };
  return typeMap[documentType] || documentType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};
</script>
