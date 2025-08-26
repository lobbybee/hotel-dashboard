<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-calendar-check text-primary-500"></i> Guest Check-in
          </h1>
          <p class="text-gray-500">Finalize pre-filled check-ins or manually check in new guests.</p>
        </div>
      </header>

      <TabView class="w-full">
        <TabPanel header="Pre-filled (QR Code)">
          <div class="space-y-6 pt-4">
            <div class="flex justify-between items-center mb-4">
              <span class="p-input-icon-left">
                <i class="pi pi-search" />
                <InputText v-model="searchQuery" placeholder="Search by name or phone" class="w-full md:w-72" />
              </span>
              <div>
                <Dropdown v-model="selectedRoomCategory" :options="roomCategories" optionLabel="label" optionValue="value" placeholder="Filter by Category" class="w-full md:w-48" showClear />
              </div>
            </div>

            <div v-if="pendingGuestsLoading" class="flex justify-center items-center h-64">
              <ProgressSpinner />
            </div>
            <div v-else-if="pendingGuestsError" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
              <p class="font-bold">Error loading guests</p>
              <p>{{ pendingGuestsError?.message }}</p>
              <Button label="Retry" icon="pi pi-refresh" @click="pendingGuestsRefetch" class="mt-3" />
            </div>
            <div v-else-if="pendingGuests && pendingGuests.length > 0" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card v-for="guest in pendingGuests" :key="guest.id">
                <template #title>
                  <div class="flex items-center justify-between">
                    <h3 class="text-lg font-semibold">{{ guest.full_name }}</h3>
                    <Badge :value="guest.status" severity="info" />
                  </div>
                </template>
                <template #content>
                  <div class="space-y-2 text-sm text-gray-600">
                    <div class="flex items-center gap-2"><i class="pi pi-phone"></i> {{ guest.whatsapp_number }}</div>
                    <div class="flex items-center gap-2"><i class="pi pi-envelope"></i> {{ guest.email }}</div>
                    <div class="flex items-center gap-2"><i class="pi pi-globe"></i> {{ guest.nationality }}</div>
                  </div>
                </template>
                <template #footer>
                  <Button label="Finalize Check-in" icon="pi pi-check" class="w-full" @click="openFinalizeDialog(guest)" />
                </template>
              </Card>
            </div>
            <div v-else class="text-center py-12">
              <i class="pi pi-users text-5xl text-gray-300 mb-4"></i>
              <h3 class="text-xl font-semibold text-gray-700 mb-2">No Pending Check-ins</h3>
              <p class="text-gray-500">There are no guests waiting to be checked in via QR code.</p>
            </div>
          </div>
        </TabPanel>
        <TabPanel header="Manual Walk-in">
          <div class="pt-4">
            <Card class="shadow-sm border border-gray-200">
              <template #content>
                <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  <div class="space-y-6">
                    <h4 class="font-semibold text-gray-700 border-b pb-2">Guest & Stay Information</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <FloatLabel><InputText id="full_name" v-model="manualGuestForm.full_name" class="w-full" /><label>Full Name</label></FloatLabel>
                      <FloatLabel><InputText id="whatsapp_number" v-model="manualGuestForm.whatsapp_number" class="w-full" /><label>WhatsApp Number</label></FloatLabel>
                      <FloatLabel><InputText id="email" v-model="manualGuestForm.email" class="w-full" /><label>Email</label></FloatLabel>
                      <FloatLabel><Calendar id="dob" v-model="manualGuestForm.date_of_birth" class="w-full" /><label>Date of Birth</label></FloatLabel>
                      <FloatLabel><InputText id="nationality" v-model="manualGuestForm.nationality" class="w-full" /><label>Nationality</label></FloatLabel>
                    </div>
                    <h4 class="font-semibold text-gray-700 border-b pb-2 pt-4">Stay Details</h4>
                    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <FloatLabel>
                          <Dropdown v-model="selectedRoomCategory" :options="roomCategories" optionLabel="label" optionValue="value" placeholder="Filter by Category" class="w-full" showClear />
                          <label>Room Category</label>
                        </FloatLabel>
                      </div>
                      <div>
                        <FloatLabel>
                          <Dropdown id="manual_room" v-model="manualStayForm.room" :options="availableRooms" optionLabel="label" optionValue="value" placeholder="Select a Room" class="w-full" :loading="roomsLoading" />
                          <label>Room</label>
                        </FloatLabel>
                      </div>
                      <div>
                        <FloatLabel>
                          <Calendar id="manual_check_out" v-model="manualStayForm.expected_check_out_date" class="w-full" showIcon :minDate="new Date()" />
                          <label>Check-out Date</label>
                        </FloatLabel>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-6">
                    <h4 class="font-semibold text-gray-700 border-b pb-2">Identity Document</h4>
                    <Dropdown v-model="manualDocForm.document_type" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Select document type" class="w-full" />
                    <FileUpload name="document" @select="onFileSelect" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000">
                      <template #empty><p>Drag and drop file here to upload.</p></template>
                    </FileUpload>
                  </div>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-end">
                  <Button label="Create & Check-in" icon="pi pi-check" @click="handleManualCheckin" :loading="manualCheckinStatus === 'pending'" />
                </div>
              </template>
            </Card>
          </div>
        </TabPanel>
      </TabView>

      <Dialog v-model:visible="finalizeDialogVisible" header="Finalize Check-in" :modal="true" :style="{ width: '500px' }">
        <div v-if="selectedGuest" class="space-y-6">
          <div>
            <p>Finalizing check-in for <strong>{{ selectedGuest.full_name }}</strong>.</p>
            <p class="text-sm text-gray-500">Please assign a room and confirm the check-out date.</p>
          </div>
          <div class="space-y-2">
            <label for="room" class="font-semibold">Room</label>
            <Dropdown id="room" v-model="finalizeForm.room" :options="availableRooms" optionLabel="label" optionValue="value" placeholder="Select an available room" class="w-full" :loading="roomsLoading" />
          </div>
          <div class="space-y-2">
            <label for="check_out_date" class="font-semibold">Check-out Date</label>
            <Calendar id="check_out_date" v-model="finalizeForm.expected_check_out_date" class="w-full" showIcon :minDate="new Date()" />
          </div>
        </div>
        <template #footer>
          <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeFinalizeDialog" />
          <Button label="Confirm & Check-in" icon="pi pi-check" @click="handleFinalizeCheckin" :loading="finalizeStatus === 'pending'" />
        </template>
      </Dialog>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import FloatLabel from 'primevue/floatlabel';
import FileUpload from 'primevue/fileupload';
import { useToast } from 'primevue/usetoast';

import { useFetchGuests, useCreateGuest, useUploadIdentityDocument, useCreateStay, useCheckIn } from '~/composables/useGuest';
import { useFetchRooms, useFetchRoomCategories } from '~/composables/useHotel';

const toast = useToast();

// --- COMMON DATA ---
const { data: roomCategoriesData, isLoading: categoriesLoading, error: categoriesError } = useFetchRoomCategories();
const roomCategories = computed(() => {
  return roomCategoriesData.value?.results.map(category => ({
    label: category.name,
    value: category.id
  })) || [];
});

const selectedRoomCategory = ref(null);

const { data: roomsData, isLoading: roomsLoading, refetch: refetchRooms } = useFetchRooms(computed(() => ({
  status: 'available',
  category: selectedRoomCategory.value
})));

const availableRooms = computed(() => {
  return roomsData.value?.results.map(room => ({
    label: `${room.room_number} (${room.category_details?.name || 'N/A'}) - ${room.status}`,
    value: room.id
  })) || [];
});

onMounted(refetchRooms);

// --- TAB 1: PRE-FILLED (QR) ---
const { data: pendingGuestsRawData, isLoading: pendingGuestsLoading, error: pendingGuestsError, refetch: pendingGuestsRefetch } = useFetchGuests(ref({ status: 'pending_checkin' }));
const pendingGuests = computed(() => pendingGuestsRawData.value?.results || []);

const { mutateAsync: createStayForGuest } = useCreateStay();
const { mutateAsync: checkInGuest, asyncStatus: checkInStatus } = useCheckIn();

const finalizeDialogVisible = ref(false);
const selectedGuest = ref(null);
const finalizeForm = reactive({ room: null, expected_check_out_date: null });
const finalizeStatus = ref('idle');

const openFinalizeDialog = (guest) => {
  selectedGuest.value = guest;
  finalizeDialogVisible.value = true;
};
const closeFinalizeDialog = () => {
  finalizeDialogVisible.value = false;
  selectedGuest.value = null;
  Object.assign(finalizeForm, { room: null, expected_check_out_date: null });
};

const handleFinalizeCheckin = async () => {
  if (!finalizeForm.room || !finalizeForm.expected_check_out_date) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please select a room and check-out date.', life: 3000 });
    return;
  }
  finalizeStatus.value = 'pending';
  try {
    const newStay = await createStayForGuest({
      guest: selectedGuest.value.id,
      room: finalizeForm.room,
      check_in_date: new Date().toISOString(),
      check_out_date: finalizeForm.expected_check_out_date.toISOString(),
      status: 'pending'
    });
    await checkInGuest({ stay_id: newStay.id });
    toast.add({ severity: 'success', summary: 'Success', detail: `${selectedGuest.value.full_name} checked in successfully.`, life: 3000 });
    await pendingGuestsRefetch();
    await refetchRooms();
    closeFinalizeDialog();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Finalize Failed', detail: 'Could not check in the guest.', life: 5000 });
  } finally {
    finalizeStatus.value = 'idle';
  }
};

// --- TAB 2: MANUAL WALK-IN ---
const { mutateAsync: createGuest, asyncStatus: createGuestStatus } = useCreateGuest();
const { mutateAsync: uploadDocument, asyncStatus: uploadDocStatus } = useUploadIdentityDocument();
const { mutateAsync: createStayForManual, asyncStatus: createStayStatus } = useCreateStay();

const manualGuestForm = reactive({ full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
const manualStayForm = reactive({ room: null, expected_check_out_date: null });
const manualDocForm = reactive({ document_type: null, file: null });

const documentTypes = [{ label: 'Passport', value: 'passport' }, { label: 'Driving License', value: 'driving_license' }, { label: 'National ID', value: 'national_id' }, { label: 'Voter ID', value: 'voter_id' }, { label: 'Other', value: 'other' }];

const onFileSelect = (event) => { manualDocForm.file = event.files[0]; };

const manualCheckinStatus = computed(() => {
  return createGuestStatus.value === 'pending' || uploadDocStatus.value === 'pending' || createStayStatus.value === 'pending' || checkInStatus.value === 'pending' ? 'pending' : 'idle';
});

const handleManualCheckin = async () => {
  if (!manualGuestForm.full_name || !manualGuestForm.whatsapp_number || !manualStayForm.room || !manualStayForm.expected_check_out_date) {
    toast.add({ severity: 'warn', summary: 'Missing Information', detail: 'Please fill all required fields.', life: 3000 });
    return;
  }

  try {
    const newGuest = await createGuest({ ...manualGuestForm, date_of_birth: manualGuestForm.date_of_birth?.toISOString().split('T')[0] });
    
    if (manualDocForm.file && manualDocForm.document_type) {
      await uploadDocument({ guest: newGuest.id, document_type: manualDocForm.document_type, document_file: manualDocForm.file });
    }

    const newStay = await createStayForManual({
      guest: newGuest.id,
      room: manualStayForm.room,
      check_in_date: new Date().toISOString(),
      check_out_date: manualStayForm.expected_check_out_date.toISOString(),
      status: 'pending'
    });

    await checkInGuest({ stay_id: newStay.id });

    toast.add({ severity: 'success', summary: 'Success', detail: 'Guest created and checked in.', life: 3000 });
    
    Object.assign(manualGuestForm, { full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
    Object.assign(manualStayForm, { room: null, expected_check_out_date: null });
    Object.assign(manualDocForm, { document_type: null, file: null });
    
    await refetchRooms();
  } catch (err) {
    toast.add({ severity: 'error', summary: 'Manual Check-in Failed', detail: 'An unexpected error occurred.', life: 5000 });
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
</style>
