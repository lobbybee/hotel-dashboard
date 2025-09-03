<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <header class="animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-calendar-check text-primary-500"></i> Guest Check-in
          </h1>
          <p class="text-gray-500">Manage pending stays or manually check in new guests.</p>
        </div>
      </header>

      <TabView class="w-full">
        <TabPanel header="Pending Stays">
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
          </div>
        </TabPanel>
        <TabPanel header="Manual Walk-in">
          <div class="pt-4">
            <div class="mb-6 p-4 border rounded-lg bg-white">
                <h4 class="font-semibold text-gray-700 mb-3">Find Existing Guest</h4>
                <div class="flex items-center gap-2">
                    <InputText v-model="searchPhoneNumber" placeholder="Search by phone number..." class="w-full flex-grow" @keyup.enter="handleGuestSearch" />
                    <Button label="Search" icon="pi pi-search" @click="handleGuestSearch" :loading="isSearchingGuests" />
                </div>
                <div v-if="isSearchingGuests" class="mt-3 text-center">
                    <ProgressSpinner style="width: 30px; height: 30px" />
                </div>
                <div v-if="isSearchSuccess==='sucess' && searchResults && searchResults.length > 0" class="mt-4 border-t pt-4">
                  <h4 class="font-semibold text-gray-700 mb-3">Select a Guest Profile</h4>
                  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <Card v-for="guest in searchResults" :key="guest.id" class="cursor-pointer hover:shadow-lg transition-shadow duration-200 border">
                      <template #title>
                        <div class="flex items-center justify-between">
                          <h5 class="text-md font-semibold truncate">{{ guest.full_name }}</h5>
                        </div>
                      </template>
                      <template #content>
                        <div class="space-y-2 text-sm text-gray-600">
                          <div class="flex items-center gap-2 truncate"><i class="pi pi-phone"></i> <span>{{ guest.whatsapp_number }}</span></div>
                          <div class="flex items-center gap-2 truncate"><i class="pi pi-envelope"></i> <span>{{ guest.email }}</span></div>
                        </div>
                      </template>
                      <template #footer>
                        <Button label="Select Guest" icon="pi pi-user-check" class="w-full" @click="selectGuest(guest)" />
                      </template>
                    </Card>
                  </div>
                </div>
                <div v-if="isSearchSuccess && (!searchResults || searchResults.length === 0)" class="mt-3 text-gray-500">
                    <p>No guest found. Please fill the form below to create a new guest profile.</p>
                </div>
            </div>

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
                          <MultiSelect id="manual_room" v-model="manualStayForm.rooms" :options="availableRooms" optionLabel="label" optionValue="value" placeholder="Select Rooms" class="w-full" :loading="roomsLoading" />
                          <label>Rooms</label>
                        </FloatLabel>
                      </div>
                      <div>
                        <FloatLabel>
                          <Calendar id="manual_check_out" v-model="manualStayForm.check_out_date" class="w-full" showIcon :minDate="new Date()" />
                          <label>Check-out Date</label>
                        </FloatLabel>
                      </div>
                    </div>
                  </div>
                  <div class="space-y-6">
                    <h4 class="font-semibold text-gray-700 border-b pb-2">Identity Document (Required)</h4>
                    <Dropdown v-model="manualDocForm.document_type" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Select document type" class="w-full" />
                    <FileUpload name="document" @select="onFileSelect" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000" ref="walkinUploader">
                      <template #empty><p>Drag and drop file here to upload.</p></template>
                    </FileUpload>
                  </div>
                </div>
              </template>
              <template #footer>
                <div class="flex justify-end">
                  <Button label="Create & Check-in" icon="pi pi-check" @click="handleManualWalkInCheckin" :loading="isManualCheckingIn" />
                </div>
              </template>
            </Card>
          </div>
        </TabPanel>
      </TabView>
    </div>

    <!-- Check-in Confirmation Dialog -->
    <Dialog v-model:visible="isCheckinDialogVisible" modal header="Confirm Guest Check-in" :style="{ width: '450px' }">
        <div v-if="selectedStayForCheckin" class="space-y-4">
            <div>
                <p><strong>Guest:</strong> {{ selectedStayForCheckin.guest.full_name }}</p>
                <p><strong>Room:</strong> {{ selectedStayForCheckin.room.room_number }}</p>
            </div>

            <Message v-if="selectedStayForCheckin.identity_verified" severity="success">Identity is already verified.</Message>

            <div v-else class="space-y-4 border-t pt-4">
                <h4 class="font-semibold">Identity Verification</h4>
                <p class="text-sm text-gray-600">Upload a document to verify the guest's identity before check-in.</p>
                <Dropdown v-model="documentType" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Select document type" class="w-full" />
                <FileUpload name="identityDoc" @select="onIdFileSelect" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000" :showUpload="false" :showCancel="true" @clear="identityDocumentFile = null" @remove="identityDocumentFile = null">
                    <template #empty><p>Drag and drop file here.</p></template>
                </FileUpload>
            </div>
        </div>

        <template #footer>
            <Button label="Cancel" icon="pi pi-times" @click="isCheckinDialogVisible = false" class="p-button-text" />
            <Button label="Confirm & Check-in" icon="pi pi-check" @click="handleConfirmCheckin" :loading="isConfirmingCheckin" />
        </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted } from 'vue';
import TabView from 'primevue/tabview';
import TabPanel from 'primevue/tabpanel';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Badge from 'primevue/badge';
import ProgressSpinner from 'primevue/progressspinner';
import InputText from 'primevue/inputtext';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import FloatLabel from 'primevue/floatlabel';
import FileUpload from 'primevue/fileupload';
import Dialog from 'primevue/dialog';
import MultiSelect from 'primevue/multiselect';
import { useToast } from 'primevue/usetoast';

import { useFetchStays, useCreateGuest, useUploadIdentityDocument, useCreateStay, useCheckIn, useInitiateCheckIn, useSearchGuests, usePatchStay } from '~/composables/useGuest';
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

const documentTypes = [{ label: 'Passport', value: 'passport' }, { label: 'Driving License', value: 'driving_license' }, { label: 'National ID', value: 'national_id' }, { label: 'Voter ID', value: 'voter_id' }, { label: 'Other', value: 'other' }];

// --- TAB 1: PENDING STAYS ---
const { data: pendingStaysData, isLoading: pendingStaysLoading, error: pendingStaysError, refetch: pendingStaysRefetch } = useFetchStays(ref({ status: 'pending' }));
const pendingStays = computed(() => pendingStaysData.value?.results || []);

const { mutateAsync: checkInGuest, isLoading: isCheckingIn } = useCheckIn();
const { mutateAsync: initiateCheckin, isLoading: isInitiatingCheckin } = useInitiateCheckIn(ref('')); // Note: This is not ideal, see handler
const { mutateAsync: patchStay, isLoading: isPatchingStay } = usePatchStay();
const { mutateAsync: uploadDocument, isLoading: isUploadingDoc } = useUploadIdentityDocument();

// Check-in Dialog for Pending Stays
const isCheckinDialogVisible = ref(false);
const selectedStayForCheckin = ref<any>(null);
const identityDocumentFile = ref<File | null>(null);
const documentType = ref<string | null>(null);

const handleDirectCheckin = (stay: any) => {
  selectedStayForCheckin.value = stay;
  identityDocumentFile.value = null;
  documentType.value = null;
  isCheckinDialogVisible.value = true;
};

const onIdFileSelect = (event: any) => {
  identityDocumentFile.value = event.files[0];
};

const isConfirmingCheckin = computed(() => isUploadingDoc.value || isPatchingStay.value || isCheckingIn.value);

const handleConfirmCheckin = async () => {
  if (!selectedStayForCheckin.value) return;

  try {
    let isVerified = selectedStayForCheckin.value.identity_verified;

    // Step 1: Upload document and verify identity (if not already verified)
    if (!isVerified) {
      if (identityDocumentFile.value && documentType.value) {
        await uploadDocument({
          guest: selectedStayForCheckin.value.guest.id,
          document_type: documentType.value,
          document_file: identityDocumentFile.value,
        });
        await patchStay({ id: selectedStayForCheckin.value.id, identity_verified: true });
        toast.add({ severity: 'success', summary: 'Verified', detail: 'Guest identity verified.', life: 3000 });
        isVerified = true;
      } else {
        toast.add({ severity: 'warn', summary: 'Verification Required', detail: 'Please upload an identity document to proceed.', life: 4000 });
        return;
      }
    }

    // Step 2: Finalize Check-in
    await checkInGuest({ stay_id: selectedStayForCheckin.value.id });

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


// --- TAB 2: MANUAL WALK-IN ---
const { mutateAsync: createGuest, isLoading: isCreatingGuest } = useCreateGuest();
const { mutateAsync: createStayForManual, isLoading: isCreatingStay } = useCreateStay();
const walkinUploader = ref();

// Guest Search
const searchPhoneNumber = ref('');
const searchQuery = ref('');
const { data: searchResults, isLoading: isSearchingGuests, status: isSearchSuccess, refetch: refetchGuests } = useSearchGuests(searchQuery);

const handleGuestSearch = () => {
  searchQuery.value = searchPhoneNumber.value.trim();
  refetchGuests();
};

const selectGuest = (guest: any) => {
    manualGuestForm.id = guest.id; // Keep track of existing guest ID
    manualGuestForm.full_name = guest.full_name;
    manualGuestForm.whatsapp_number = guest.whatsapp_number;
    manualGuestForm.email = guest.email;
    manualGuestForm.date_of_birth = guest.date_of_birth ? new Date(guest.date_of_birth) : null;
    manualGuestForm.nationality = guest.nationality;

    searchPhoneNumber.value = '';
    searchQuery.value = '';
}

const manualGuestForm = reactive<{id: string | null; full_name: string; whatsapp_number: string; email: string; date_of_birth: Date | null; nationality: string}>({ id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
const manualStayForm = reactive<{rooms: number[]; check_out_date: Date | null}>({ rooms: [], check_out_date: null });
const manualDocForm = reactive<{document_type: string | null; file: File | null}>({ document_type: null, file: null });

const onFileSelect = (event: any) => { manualDocForm.file = event.files[0]; };

const isManualCheckingIn = computed(() => {
  return isCreatingGuest.value || isUploadingDoc.value || isCreatingStay.value || isCheckingIn.value || isPatchingStay.value;
});

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

    // Step 1: Create Guest if not an existing one
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

    // Step 2: Create Stay records for each room
    for (const roomId of manualStayForm.rooms) {
      const newStay = await createStayForManual({
        guest: guestId,
        room: roomId,
        check_in_date: new Date().toISOString(),
        check_out_date: manualStayForm.check_out_date.toISOString(),
        status: 'pending'
      });

      // Step 3: Upload Document and Verify Identity (can be done once per guest)
      // We will do it for the first stay, and assume it covers all
      if (manualStayForm.rooms.indexOf(roomId) === 0) {
          await uploadDocument({
              guest: guestId,
              document_type: manualDocForm.document_type,
              document_file: manualDocForm.file
          });
      }

      await patchStay({ id: newStay.id, identity_verified: true });

      // Step 4: Finalize Check-in for each stay
      await checkInGuest({ stay_id: newStay.id });
    }

    toast.add({ severity: 'success', summary: 'Success', detail: 'Guest created and checked in.', life: 3000 });

    // Reset forms
    Object.assign(manualGuestForm, { id: null, full_name: '', whatsapp_number: '', email: '', date_of_birth: null, nationality: '' });
    Object.assign(manualStayForm, { rooms: [], check_out_date: null });
    Object.assign(manualDocForm, { document_type: null, file: null });
    if (walkinUploader.value) {
        walkinUploader.value.clear();
    }

    await refetchRooms();
    await pendingStaysRefetch();

  } catch (err: any) {
    const errorMessage = err.response?._data?.detail || 'An unexpected error occurred.';
    toast.add({ severity: 'error', summary: 'Manual Check-in Failed', detail: errorMessage, life: 5000 });
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
