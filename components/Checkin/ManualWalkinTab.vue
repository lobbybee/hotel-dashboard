<template>
  <div class="pt-4">
    <CheckinGuestSearch @guest-selected="selectGuest" />

    <Card class="shadow-sm border border-gray-200 mt-6">
      <template #content>
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <CheckinGuestForm 
        :guest-form="manualGuestForm" 
        @update-guest-field="onUpdateGuestField" 
        @accompanying-guest-doc-select="onAccompanyingGuestDocSelect"
      />
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

import { useCreateGuest, useUploadIdentityDocument, useCreateStay, useVerifyAndCheckIn, useCreateBooking } from '~/composables/useGuest';
import { useFetchRooms } from '~/composables/useHotel';

const toast = useToast();
const stayFormRef = ref();

// --- DATA & FORMS ---
const manualGuestForm = reactive<{id: string | null; full_name: string; whatsapp_number: string; email: string; date_of_birth: Date | null; nationality: string; number_of_guests: number; guest_names: string[]}>({ id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '', number_of_guests: 1, guest_names: [] });
const manualStayForm = reactive<{rooms: number[]; check_out_date: Date | null}>({ rooms: [], check_out_date: null });
const manualDocForm = reactive<{document_type: string | null; file: File | null}>({ document_type: null, file: null });
const accompanyingGuestDocs = reactive<{[key: number]: {document_type: string | null; file: File | null}}>({});

// --- COMPOSABLES ---
const { mutateAsync: createGuest, isLoading: isCreatingGuest } = useCreateGuest();
const { mutateAsync: uploadDocument, isLoading: isUploadingDoc } = useUploadIdentityDocument();
const { mutateAsync: createStayForManual, isLoading: isCreatingStay } = useCreateStay();
const { mutateAsync: createBooking, isLoading: isCreatingBooking } = useCreateBooking();
const { mutateAsync: verifyAndCheckIn, isLoading: isVerifyingAndCheckingIn } = useVerifyAndCheckIn();
const { refetch: refetchRooms, data: roomsData } = useFetchRooms(ref({ status: 'available' }));

const isManualCheckingIn = computed(() => isCreatingGuest.value || isUploadingDoc.value || isCreatingStay.value || isCreatingBooking.value || isVerifyingAndCheckingIn.value);

// --- METHODS ---
const onUpdateGuestField = ({ field, value }: { field: string, value: any }) => {
  // Handle dynamic fields like accompanying guest document types
  if (field.startsWith('accompanying_guest_')) {
    // We'll store these in a separate structure
    const parts = field.split('_');
    const index = parseInt(parts[2]);
    if (!accompanyingGuestDocs[index]) {
      accompanyingGuestDocs[index] = { document_type: null, file: null };
    }
    accompanyingGuestDocs[index].document_type = value;
  } else {
    // Handle regular fields
    (manualGuestForm as any)[field] = value;
  }
};

const selectGuest = (guest: any) => {
    manualGuestForm.id = guest.id;
    manualGuestForm.full_name = guest.full_name;
    manualGuestForm.whatsapp_number = guest.whatsapp_number;
    manualGuestForm.email = guest.email;
    manualGuestForm.date_of_birth = guest.date_of_birth ? new Date(guest.date_of_birth) : null;
    manualGuestForm.nationality = guest.nationality;
    manualGuestForm.number_of_guests = guest.number_of_guests || 1;
    manualGuestForm.guest_names = guest.guest_names || [];
    // Reset accompanying guest documents when selecting a guest
    Object.keys(accompanyingGuestDocs).forEach(key => {
      delete accompanyingGuestDocs[key];
    });
};

const onFileSelect = (event: any) => { manualDocForm.file = event.files[0]; };

const onAccompanyingGuestDocSelect = ({ index, files }: { index: number; files: File[] }) => {
  if (!accompanyingGuestDocs[index]) {
    accompanyingGuestDocs[index] = { document_type: null, file: null };
  }
  accompanyingGuestDocs[index].file = files[0];
};

const onUpdateStayField = ({ field, value }: { field: keyof typeof manualStayForm, value: any }) => {
  manualStayForm[field] = value;
};

const onUpdateDocField = ({ field, value }: { field: keyof typeof manualDocForm, value: any }) => {
  manualDocForm[field] = value;
};

const onUpdateAccompanyingGuestDocField = (index: number, field: string, value: any) => {
  if (!accompanyingGuestDocs[index]) {
    accompanyingGuestDocs[index] = { document_type: null, file: null };
  }
  accompanyingGuestDocs[index][field] = value;
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

    // Upload primary guest document
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
    
    // Upload documents for accompanying guests
    for (const index in accompanyingGuestDocs) {
      const docData = accompanyingGuestDocs[index];
      if (docData.file && docData.document_type) {
        await uploadDocument({
          guest: guestId,
          document_type: docData.document_type,
          document_file: docData.file,
          is_accompanying_guest: true
        });
      }
    }

    // Prepare guest names array with primary guest first
    const guestNames = [manualGuestForm.full_name];
    if (manualGuestForm.guest_names && manualGuestForm.guest_names.length > 0) {
        guestNames.push(...manualGuestForm.guest_names.filter((name: string) => name.trim() !== ''));
    }

    // Create booking with multiple guests
    const bookingData = {
        primary_guest: guestId,
        check_in_date: new Date().toISOString(),
        check_out_date: manualStayForm.check_out_date.toISOString(),
        guest_names: guestNames,
        number_of_guests: manualGuestForm.number_of_guests,
        room_ids: manualStayForm.rooms
    };

    // Use the booking endpoint instead of creating individual stays
    await createBooking(bookingData);

    const selectedRoomsDisplay = manualStayForm.rooms.map(roomId => {
      const room = roomsData.value.results.find((r: any) => r.id === roomId);
      return room ? { number: room.room_number } : null;
    });
    const roomNumbers = selectedRoomsDisplay.map(room => room?.number).filter(Boolean).join(', ');
    toast.add({ severity: 'success', summary: 'Success', detail: `Guest ${manualGuestForm.full_name} checked in to rooms: ${roomNumbers}`, life: 3000 });

    // Reset forms
    Object.assign(manualGuestForm, { id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '', number_of_guests: 1, guest_names: [] });
    Object.assign(manualStayForm, { rooms: [], check_out_date: null });
    Object.assign(manualDocForm, { document_type: null, file: null });
    // Reset accompanying guest documents
    Object.keys(accompanyingGuestDocs).forEach(key => {
      delete accompanyingGuestDocs[key];
    });
    stayFormRef.value?.clearUploader();

    await refetchRooms();

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Manual Check-in Failed', detail: errorMessage, life: 5000 });
  }
};
</script>
