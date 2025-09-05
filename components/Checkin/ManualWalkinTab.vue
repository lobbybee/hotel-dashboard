<template>
  <div class="pt-4">
    <CheckinGuestSearch @guest-selected="selectGuest" />

    <Card class="shadow-sm border border-gray-200 mt-6">
      <template #content>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckinGuestForm :guest-form="manualGuestForm" @update-guest-field="onUpdateGuestField" />
          <CheckinStayForm 
            :stay-form="manualStayForm"
            :doc-form="manualDocForm"
            @file-select="onFileSelect"
            @update-stay-field="onUpdateStayField"
            @update-doc-field="onUpdateDocField"
            ref="stayFormRef"
          />
        </div>
      </template>
      <template #footer>
        <div class="flex justify-end">
          <Button label="Create & Check-in" icon="pi pi-check" @click="handleManualWalkInCheckin" :loading="isManualCheckingIn" />
        </div>
      </template>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

import { useCreateGuest, useUploadIdentityDocument, useCreateStay, useVerifyAndCheckIn } from '~/composables/useGuest';
import { useFetchRooms } from '~/composables/useHotel';

const toast = useToast();
const stayFormRef = ref();

// --- DATA & FORMS ---
const manualGuestForm = reactive<{id: string | null; full_name: string; whatsapp_number: string; email: string; date_of_birth: Date | null; nationality: string}>({ id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
const manualStayForm = reactive<{rooms: number[]; check_out_date: Date | null}>({ rooms: [], check_out_date: null });
const manualDocForm = reactive<{document_type: string | null; file: File | null}>({ document_type: null, file: null });

// --- COMPOSABLES ---
const { mutateAsync: createGuest, isLoading: isCreatingGuest } = useCreateGuest();
const { mutateAsync: uploadDocument, isLoading: isUploadingDoc } = useUploadIdentityDocument();
const { mutateAsync: createStayForManual, isLoading: isCreatingStay } = useCreateStay();
const { mutateAsync: verifyAndCheckIn, isLoading: isVerifyingAndCheckingIn } = useVerifyAndCheckIn();
const { refetch: refetchRooms, data: roomsData } = useFetchRooms(ref({ status: 'available' }));

const isManualCheckingIn = computed(() => isCreatingGuest.value || isUploadingDoc.value || isCreatingStay.value || isVerifyingAndCheckingIn.value);

// --- METHODS ---
const onUpdateGuestField = ({ field, value }: { field: keyof typeof manualGuestForm, value: any }) => {
  manualGuestForm[field] = value;
};

const selectGuest = (guest: any) => {
    manualGuestForm.id = guest.id;
    manualGuestForm.full_name = guest.full_name;
    manualGuestForm.whatsapp_number = guest.whatsapp_number;
    manualGuestForm.email = guest.email;
    manualGuestForm.date_of_birth = guest.date_of_birth ? new Date(guest.date_of_birth) : null;
    manualGuestForm.nationality = guest.nationality;
};

const onFileSelect = (event: any) => { manualDocForm.file = event.files[0]; };

const onUpdateStayField = ({ field, value }: { field: keyof typeof manualStayForm, value: any }) => {
  manualStayForm[field] = value;
};

const onUpdateDocField = ({ field, value }: { field: keyof typeof manualDocForm, value: any }) => {
  manualDocForm[field] = value;
};

const handleManualWalkInCheckin = async () => {
  if (!manualGuestForm.full_name || !manualGuestForm.whatsapp_number || !manualStayForm.rooms.length || !manualStayForm.check_out_date) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please fill all required guest and stay fields.', life: 3000 });
    return;
  }

  if (!manualDocForm.file || !manualDocForm.document_type) {
      toast.add({ severity: 'warn', summary: 'Identity Document Required', detail: 'Please upload an identity document for walk-in guests.', life: 4000 });
      return;
  }

  try {
    let guestId = manualGuestForm.id;

    if (!guestId) {
        const newGuest = await createGuest({
            full_name: manualGuestForm.full_name,
            whatsapp_number: manualGuestForm.whatsapp_number,
            email: manualGuestForm.email,
            date_of_birth: manualGuestForm.date_of_birth?.toISOString().split('T')[0],
            nationality: manualGuestForm.nationality
        });
        guestId = newGuest.id;
    }

    if (manualDocForm.file && manualDocForm.document_type) {
        await uploadDocument({
            guest: guestId,
            document_type: manualDocForm.document_type,
            document_file: manualDocForm.file
        });
    } else if (!manualGuestForm.id) { // Only require doc for new guests, existing might be verified
        toast.add({ severity: 'warn', summary: 'Identity Document Required', detail: 'Please upload an identity document for new walk-in guests.', life: 4000 });
        return;
    }

    for (const roomId of manualStayForm.rooms) {
      const newStay = await createStayForManual({
        guest: guestId,
        room: roomId,
        check_in_date: new Date().toISOString(),
        check_out_date: manualStayForm.check_out_date.toISOString(),
        status: 'pending'
      });

      await verifyAndCheckIn(newStay.id);
    }

    const selectedRoomsDisplay = manualStayForm.rooms.map(roomId => {
      const room = roomsData.value.results.find((r: any) => r.id === roomId);
      return room ? { number: room.room_number } : null;
    });
    const roomNumbers = selectedRoomsDisplay.map(room => room?.number).filter(Boolean).join(', ');
    toast.add({ severity: 'success', summary: 'Success', detail: `Guest ${manualGuestForm.full_name} checked in to rooms: ${roomNumbers}`, life: 3000 });

    // Reset forms
    Object.assign(manualGuestForm, { id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
    Object.assign(manualStayForm, { rooms: [], check_out_date: null });
    Object.assign(manualDocForm, { document_type: null, file: null });
    stayFormRef.value?.clearUploader();

    await refetchRooms();

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Manual Check-in Failed', detail: errorMessage, life: 5000 });
  }
};
</script>
