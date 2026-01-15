<template>
  <div class="manual-walkin-tab space-y-6">
    <!-- Progress Indicator -->
    <div class="flex items-center justify-center space-x-4 p-4 bg-gray-50 rounded-lg">
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex justify-center items-center" :class="step >= 1 ? 'bg-blue-600 text-white' : 'bg-gray-300'">1</div>
        <span class="ml-2">Guest Details</span>
      </div>
      <div class="w-16 h-1 bg-gray-300"></div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex justify-center items-center" :class="step >= 2 ? 'bg-blue-600 text-white' : 'bg-gray-300'">2</div>
        <span class="ml-2">Rooms & Preferences</span>
      </div>
      <div class="w-16 h-1 bg-gray-300"></div>
      <div class="flex items-center">
        <div class="w-8 h-8 rounded-full flex justify-center items-center" :class="step >= 3 ? 'bg-blue-600 text-white' : 'bg-gray-300'">3</div>
        <span class="ml-2">Documents</span>
      </div>
    </div>

    <!-- Step 1: Guest Details -->
    <div v-if="step === 1" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Primary Guest Information</h3>

      <div class="space-y-4">
        <!-- Guest Search -->
        <div>
          <label class="block text-sm font-medium mb-1">Search Existing Guest</label>
          <div class="flex gap-2">
            <AutoComplete
              v-model="searchInputValue"
              :suggestions="filteredGuests"
              @complete="searchGuests"
              @focus="onInputFocus"
              placeholder="Search by name or phone..."
              class="flex-1"
              :loading="guestsLoading"
              :minLength="0"
              @item-select="onGuestSelect"
              :optionLabel="'full_name'"
              forceSelection
            >
              <template #option="slotProps">
                <div>
                  <div class="font-medium">{{ slotProps.option.full_name }}</div>
                  <div class="text-xs text-gray-500">{{ slotProps.option.whatsapp_number }}</div>
                </div>
              </template>
            </AutoComplete>
            <Button
              v-if="selectedGuest"
              label="Clear"
              severity="secondary"
              @click="clearGuestSelection"
            />
          </div>
          <small v-if="isGuestSelected" class="text-green-600">Guest selected: {{ selectedGuest?.full_name }}</small>
        </div>

        <div class="border-t pt-4">
          <p class="text-sm text-gray-600 mb-3">
            {{ isGuestSelected ? 'Review guest details' : 'Or enter new guest details' }}
          </p>

          <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label class="block text-sm font-medium mb-1">Full Name *</label>
              <InputText
                v-model="guestData.primary_guest.full_name"
                placeholder="Enter full name"
                class="w-full"
                :disabled="isGuestSelected"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">WhatsApp Number *</label>
              <InputText
                v-model="guestData.primary_guest.whatsapp_number"
                placeholder="+1234567890"
                class="w-full"
                :disabled="isGuestSelected"
              />
            </div>
            <div>
              <label class="block text-sm font-medium mb-1">Email</label>
              <InputText
                v-model="guestData.primary_guest.email"
                placeholder="guest@example.com"
                class="w-full"
                :disabled="isGuestSelected"
              />
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Check-in Date *</label>
            <Calendar v-model="checkinDates.check_in" showTime class="w-full" />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Check-out Date *</label>
            <Calendar v-model="checkinDates.check_out" showTime class="w-full" />
          </div>
        </div>

        <div>
          <div class="flex justify-between items-center mb-2">
            <label class="block text-sm font-medium">Accompanying Guests</label>
            <Button label="Add Guest" icon="pi pi-plus" size="small" @click="addAccompanyingGuest" />
          </div>

          <div v-for="(guest, index) in guestData.accompanying_guests" :key="index" class="border rounded p-3 mb-2">
            <div class="grid grid-cols-2 gap-2">
              <InputText v-model="guest.full_name" placeholder="Guest name" />
              <Button icon="pi pi-trash" severity="danger" size="small" @click="removeAccompanyingGuest(index)" />
            </div>
          </div>
        </div>
      </div>

      <div class="flex justify-end mt-6">
        <Button label="Next" @click="step = 2" :disabled="!isGuestDetailsValid" />
      </div>
    </div>

    <!-- Step 2: Room Selection -->
    <div v-if="step === 2" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Select Rooms</h3>

      <div class="space-y-6">
        <!-- Flag Warnings - Show if guest is flagged -->
        <FlagWarningAccordion v-if="flagSummary && selectedGuest" :flagSummary="flagSummary" class="mb-4" />

        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium mb-1">Room Category Filter</label>
            <Dropdown
              v-model="selectedRoomCategory"
              :options="roomCategories"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Category to Filter"
              class="w-full"
              @change="refetchRooms"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Floor</label>
            <Dropdown
              v-model="selectedFloor"
              :options="floorOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Floor"
              class="w-full"
              @change="refetchRooms"
              :loading="floorsLoading"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Rooms</label>
            <MultiSelect
              v-model="stayForm.rooms"
              :options="availableRooms"
              optionLabel="label"
              optionValue="value"
              placeholder="Select Rooms"
              class="w-full"
              :loading="roomsLoading"
            />
          </div>
          <div>
            <label class="block text-sm font-medium mb-1">Check-out Date</label>
            <Calendar
              v-model="stayForm.check_out_date"
              class="w-full"
              showIcon
              :minDate="new Date()"
            />
          </div>
        </div>

        <div v-if="selectedRoomsDisplay.length > 0" class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 class="font-semibold text-blue-800 mb-3 text-sm">
            Selected Rooms ({{ selectedRoomsDisplay.length }})
          </h5>
          <div class="flex flex-wrap gap-2">
            <Badge
              v-for="room in selectedRoomsDisplay"
              :key="room?.value"
              :value="`${room?.number} - ${room?.category || ''}`"
              severity="info"
              class="text-xs"
            />
          </div>
        </div>

        <!-- Guest Preferences -->
        <div class="border-t pt-4">
          <h4 class="font-medium mb-3">Guest Preferences</h4>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <div class="flex items-center gap-2">
                <Checkbox
                  inputId="hours_24"
                  v-model="verifyData.hours_24"
                  binary
                />
                <label for="hours_24" class="text-sm cursor-pointer font-medium">24 hours stay</label>
              </div>
              <small class="text-xs text-gray-500 mt-1 block">Full 24-hour stay instead of 12 hours</small>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <Checkbox
                  inputId="breakfast_reminder"
                  v-model="verifyData.breakfast_reminder"
                  binary
                />
                <label for="breakfast_reminder" class="text-sm cursor-pointer font-medium">Breakfast Reminder</label>
              </div>
              <small class="text-xs text-gray-500 mt-1 block">Send breakfast reminder notification</small>
            </div>
            <div>
              <div class="flex items-center gap-2">
                <Checkbox
                  inputId="dinner_reminder"
                  v-model="verifyData.dinner_reminder"
                  binary
                />
                <label for="dinner_reminder" class="text-sm cursor-pointer font-medium">Dinner Reminder</label>
              </div>
              <small class="text-xs text-gray-500 mt-1 block">Send dinner reminder notification</small>
            </div>
          </div>

          <div class="mt-4">
            <label for="notes" class="block text-sm font-medium mb-1">Additional Notes</label>
            <Textarea
              id="notes"
              v-model="verifyData.notes"
              rows="3"
              class="w-full"
              placeholder="Any special requests or notes for the stay..."
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <Button label="Previous" severity="secondary" @click="step = 1" />
        <Button label="Next" @click="step = 3" :disabled="!isRoomSelectionValid" />
      </div>
    </div>

    <!-- Step 3: Documents -->
    <div v-if="step === 3" class="bg-white p-6 rounded-lg shadow">
      <h3 class="text-lg font-semibold mb-4">Documents</h3>

      <!-- Existing Guest - Show Document Status -->
      <div v-if="selectedGuest" class="space-y-6">
        <div class="bg-green-50 border border-green-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-check-circle text-green-600"></i>
            <span class="font-medium text-green-800">Documents Already on File</span>
          </div>
          <p class="text-sm text-green-700 mb-3">
            Guest documents are already uploaded and verified in the system.
          </p>

          <!-- Show existing documents if available -->
          <div v-if="selectedGuest.documents && selectedGuest.documents.length > 0" class="space-y-2">
            <h5 class="font-medium text-sm">Existing Documents:</h5>
            <div v-for="doc in selectedGuest.documents" :key="doc.id" class="flex items-center justify-between bg-white p-2 rounded border">
              <div class="flex items-center gap-3">
                <span class="text-sm font-medium">{{ formatDocumentType(doc.document_type) }}</span>
                <span v-if="doc.document_number" class="text-xs text-gray-500">({{ doc.document_number }})</span>
              </div>
              <div class="flex items-center gap-2">
                <Badge :value="doc.is_verified ? 'Verified' : 'Pending'" :severity="doc.is_verified ? 'success' : 'warning'" />
                <a v-if="doc.document_file_url" :href="doc.document_file_url" target="_blank" class="text-blue-500 hover:text-blue-700 text-sm">
                  <i class="pi pi-eye"></i> View
                </a>
              </div>
            </div>
          </div>
        </div>

        <!-- Accompanying Guests Documents (still needed) -->
        <div v-if="guestData.accompanying_guests?.length" class="border rounded-lg p-4">
          <h4 class="font-medium mb-3">Accompanying Guests Documents</h4>
          <p class="text-sm text-gray-600 mb-3">Documents are required for accompanying guests</p>

          <div v-for="(guest, index) in guestData.accompanying_guests" :key="index" class="mb-4 last:mb-0">
            <p class="text-sm font-medium mb-2">{{ guest.full_name || `Guest ${index + 1}` }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div>
                <label class="block text-sm font-medium mb-1">Document Type</label>
                <Dropdown
                  v-model="guest.document_type"
                  :options="documentTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Document Number</label>
                <InputText
                  v-model="guest.document_number"
                  placeholder="Document number"
                  class="w-full"
                />
              </div>
            </div>

            <FileUpload
              mode="basic"
              accept="image/*,.pdf"
              :maxFileSize="2000000"
              @select="(e) => handleAccompanyingDocumentSelect(e, index)"
              chooseLabel="Select Document"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <!-- New Guest - Document Upload Required -->
      <div v-else class="space-y-6">
        <div class="bg-amber-50 border border-amber-200 rounded-lg p-4">
          <div class="flex items-center gap-2 mb-2">
            <i class="pi pi-info-circle text-amber-600"></i>
            <span class="font-medium text-amber-800">Documents Required</span>
          </div>
          <p class="text-sm text-amber-700">
            Identity documents are required for all new guests. Please upload clear photos of valid ID.
          </p>
        </div>

        <!-- Primary Guest Documents -->
        <div class="border rounded-lg p-4">
          <h4 class="font-medium mb-3">Primary Guest: {{ guestData.primary_guest.full_name }}</h4>

          <div class="space-y-3">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label class="block text-sm font-medium mb-1">Document Type</label>
                <Dropdown
                  v-model="guestData.primary_guest.document_type"
                  :options="documentTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Document Number</label>
                <InputText
                  v-model="guestData.primary_guest.document_number"
                  placeholder="Document number"
                  class="w-full"
                />
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium mb-2">Document (Front) *</label>
              <FileUpload
                mode="basic"
                accept="image/*,.pdf"
                :maxFileSize="2000000"
                @select="handlePrimaryDocumentSelect"
                chooseLabel="Select Front Document"
                class="w-full"
              />
            </div>

            <div>
              <div class="flex items-center mb-2">
                <Checkbox v-model="uploadBackSide" :binary="true" inputId="backSide" />
                <label for="backSide" class="ml-2">Upload back side of document</label>
              </div>
              <FileUpload
                v-if="uploadBackSide"
                mode="basic"
                accept="image/*,.pdf"
                :maxFileSize="2000000"
                @select="handlePrimaryDocumentBackSelect"
                chooseLabel="Select Back Document"
                class="w-full"
              />
            </div>
          </div>
        </div>

        <!-- Accompanying Guests Documents -->
        <div v-if="guestData.accompanying_guests?.length" class="border rounded-lg p-4">
          <h4 class="font-medium mb-3">Accompanying Guests Documents</h4>

          <div v-for="(guest, index) in guestData.accompanying_guests" :key="index" class="mb-4 last:mb-0">
            <p class="text-sm font-medium mb-2">{{ guest.full_name || `Guest ${index + 1}` }}</p>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 mb-2">
              <div>
                <label class="block text-sm font-medium mb-1">Document Type</label>
                <Dropdown
                  v-model="guest.document_type"
                  :options="documentTypes"
                  optionLabel="label"
                  optionValue="value"
                  placeholder="Select document type"
                  class="w-full"
                />
              </div>
              <div>
                <label class="block text-sm font-medium mb-1">Document Number</label>
                <InputText
                  v-model="guest.document_number"
                  placeholder="Document number"
                  class="w-full"
                />
              </div>
            </div>

            <FileUpload
              mode="basic"
              accept="image/*,.pdf"
              :maxFileSize="2000000"
              @select="(e) => handleAccompanyingDocumentSelect(e, index)"
              chooseLabel="Select Document"
              class="w-full"
            />
          </div>
        </div>
      </div>

      <div class="flex justify-between mt-6">
        <Button label="Previous" severity="secondary" @click="step = 2" />
        <Button
          label="Complete Check-in"
          @click="completeCheckin"
          :loading="isProcessing"
          :disabled="!selectedGuest && !primaryDocument"
        />
      </div>
    </div>

    <!-- Error/Success Messages -->
    <Message v-if="errorMessage" severity="error" :closable="false">{{ errorMessage }}</Message>
    <Message v-if="successMessage" severity="success" :closable="false">{{ successMessage }}</Message>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useDebounceFn } from "@vueuse/core";
import { useToast } from 'primevue/usetoast';
import { useCheckinWorkflow, prepareGuestFormData } from '~/composables/checkin-manager';
import { useAPI } from '~/composables/useAPI';
import {
    useFetchRooms,
    useFetchRoomCategories,
    useFetchHotelRoomFloors,
} from "~/composables/useHotel";
import FlagWarningAccordion from './FlagWarningAccordion.vue';
import Badge from 'primevue/badge';
import type { CreateGuestData, AccompanyingGuestData } from '~/composables/checkin-manager';

// Define emits
const emit = defineEmits<{
  'checkin-success': []
}>();

const toast = useToast();
const { createGuestMutation, checkinOfflineMutation, verifyCheckinMutation } = useCheckinWorkflow();

// Guest search
const searchTerm = ref('');
const searchInputValue = ref('');
const selectedGuest = ref<any>(null);
const filteredGuests = ref([]);
const guestsData = ref(null);
const guestsLoading = ref(false);
const lastSearchResults = ref([]); // Store last search results

// Debounced search function
const debouncedSearch = useDebounceFn((searchValue: string) => {
  searchAPI(searchValue);
}, 300);

// Separate function to make the API call
const searchAPI = async (searchValue: string) => {
  if (searchValue && searchValue.trim() && !selectedGuest.value) {
    guestsLoading.value = true;
    try {
      const { API } = useAPI();
      const response = await API(`/guest-management/guests/?search=${encodeURIComponent(searchValue)}`);

      // Check if response is an array directly or has results property
      let results = [];
      if (Array.isArray(response)) {
        results = response;
      } else if (response && response.results) {
        results = response.results;
      }

      filteredGuests.value = results;
      lastSearchResults.value = results; // Store the results
    } catch (error) {
      console.error('Error fetching guests:', error);
      filteredGuests.value = [];
      lastSearchResults.value = [];
    } finally {
      guestsLoading.value = false;
    }
  } else {
    filteredGuests.value = [];
  }
};

// State
const step = ref(1);
const isProcessing = ref(false);
const errorMessage = ref('');
const successMessage = ref('');
const uploadBackSide = ref(false);
const flagSummary = ref<any>(null);

// Verification data for guest preferences
const verifyData = ref({
  hours_24: false,
  breakfast_reminder: true,
  dinner_reminder: false,
  notes: ''
});

// Documents
const primaryDocument = ref<File | null>(null);
const primaryDocumentBack = ref<File | null>(null);
const accompanyingDocuments = ref<File[][]>([]);

// Guest data
const guestData = ref<CreateGuestData>({
  primary_guest: {
    full_name: '',
    whatsapp_number: '',
    email: '',
    document_type: '',
    document_number: ''
  },
  accompanying_guests: []
});

// Check-in dates
const checkinDates = ref({
  check_in: new Date(),
  check_out: new Date(Date.now() + 24 * 60 * 60 * 1000) // Tomorrow
});

// Room selection form
const stayForm = ref({
  rooms: [],
  check_out_date: checkinDates.value.check_out
});

// Room data
const selectedRoomCategory = ref(null);
const selectedFloor = ref(null);
const { data: roomCategoriesData, isLoading: categoriesLoading } = useFetchRoomCategories();
const { data: floorsData, isLoading: floorsLoading } = useFetchHotelRoomFloors();
const {
  data: roomsData,
  isLoading: roomsLoading,
  refetch: refetchRooms,
} = useFetchRooms(
  computed(() => ({
    status: "available",
    category: selectedRoomCategory.value,
    floor: selectedFloor.value,
    page_size: 30,
  })),
);

const roomCategories = computed(() => {
  const categories =
    roomCategoriesData.value?.results.map((category: any) => ({
      label: `${category.name}`,
      value: category.id,
    })) || [];
  return [{ label: "All Categories", value: null }, ...categories];
});

const floorOptions = computed(() => {
  if (!floorsData.value?.floors) return [];
  const floors = floorsData.value.floors.map((floor: number) => ({
    label: `Floor ${floor}`,
    value: floor,
  }));
  return [{ label: "All Floors", value: null }, ...floors];
});

const availableRooms = computed(() => {
  if (!roomsData.value?.results) return [];
  return roomsData.value.results.map((room: any) => ({
    label: selectedRoomCategory.value && selectedRoomCategory.value !== null
      ? `Room ${room.room_number}`
      : `Room ${room.room_number} - ${room.category.name}`,
    value: room.id,
    category: room.category?.name || "",
    number: room.room_number,
  }));
});

const selectedRoomsDisplay = computed(() => {
  if (!stayForm.value.rooms.length || !roomsData.value?.results) return [];
  return stayForm.value.rooms
    .map((roomId: any) => {
      const room = roomsData.value.results.find(
        (r: any) => r.id === roomId,
      );
      return room
        ? {
            value: roomId,
            number: room.room_number,
            category: room.category?.name || "N/A",
          }
        : null;
    })
    .filter(Boolean);
});

const documentTypes = [
  { label: 'AADHAR ID', value: 'aadhar_id' },
  { label: 'Driving License', value: 'driving_license' },
  { label: 'National ID', value: 'national_id' },
  { label: 'Voter ID', value: 'voter_id' },
  { label: 'Passport', value: 'passport' },
  { label: 'Other', value: 'other' }
];

const formatDocumentType = (type: string) => {
  if (!type) return '';
  return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

// Validation
const isGuestDetailsValid = computed(() => {
  return guestData.value.primary_guest.full_name &&
         guestData.value.primary_guest.whatsapp_number &&
         checkinDates.value.check_in &&
         checkinDates.value.check_out;
});

const isRoomSelectionValid = computed(() => {
  return stayForm.value.rooms.length > 0;
});

// Computed
const isGuestSelected = computed(() => !!selectedGuest.value);

// Methods
const searchGuests = (event: any) => {
  // Clear selected guest if user is typing something different
  if (selectedGuest.value && event.query !== selectedGuest.value.full_name) {
    selectedGuest.value = null;
  }

  // Handle different event structures
  let query;
  if (event && event.query) {
    query = event.query;
  } else if (event && typeof event === 'string') {
    query = event;
  } else {
    return;
  }

  searchTerm.value = query;
  debouncedSearch(query);
};

const onGuestSelect = (event: any) => {
  const guest = event.value;
  selectedGuest.value = guest;
  searchInputValue.value = guest.full_name; // Set the input to show selected guest's name
  filteredGuests.value = [guest]; // Keep selected guest in filtered results for display
  guestData.value.primary_guest = {
    full_name: guest.full_name,
    whatsapp_number: guest.whatsapp_number,
    email: guest.email || '',
    document_type: guest.documents?.[0]?.document_type || '',
    document_number: guest.documents?.[0]?.document_number || ''
  };

  // Fetch flag summary for the selected guest
  fetchGuestFlags(guest.id);
};

const onInputFocus = () => {
  // If we have a selected guest, show it in the dropdown
  if (selectedGuest.value) {
    filteredGuests.value = [selectedGuest.value];
  }
  // If we have last search results but no current results, show them
  else if (filteredGuests.value.length === 0 && lastSearchResults.value.length > 0) {
    filteredGuests.value = lastSearchResults.value;
  }
};

const fetchGuestFlags = async (guestId: number) => {
  try {
    const { API } = useAPI();
    const response = await API(`/guest-management/guests/${guestId}/flags/`);
    flagSummary.value = response;
  } catch (error) {
    console.error('Error fetching guest flags:', error);
    flagSummary.value = null;
  }
};

const clearGuestSelection = () => {
  selectedGuest.value = null;
  searchInputValue.value = '';
  guestData.value.primary_guest = {
    full_name: '',
    whatsapp_number: '',
    email: '',
    document_type: '',
    document_number: ''
  };
  searchTerm.value = '';
  filteredGuests.value = lastSearchResults.value; // Restore last search results
  flagSummary.value = null; // Clear flag summary
};



const addAccompanyingGuest = () => {
  if (!guestData.value.accompanying_guests) {
    guestData.value.accompanying_guests = [];
  }
  guestData.value.accompanying_guests.push({
    full_name: '',
    document_type: '',
    document_number: ''
  });
  accompanyingDocuments.value.push([]);
};

const removeAccompanyingGuest = (index: number) => {
  guestData.value.accompanying_guests?.splice(index, 1);
  accompanyingDocuments.value.splice(index, 1);
};

const updateStayField = ({ field, value }: any) => {
  stayForm.value[field] = value;
  if (field === 'check_out_date') {
    checkinDates.value.check_out = value;
  }
};

const handlePrimaryDocumentSelect = (event: any) => {
  primaryDocument.value = event.files[0];
};

const handlePrimaryDocumentBackSelect = (event: any) => {
  primaryDocumentBack.value = event.files[0];
};

const handleAccompanyingDocumentSelect = (event: any, guestIndex: number) => {
  accompanyingDocuments.value[guestIndex] = event.files;
};

const completeCheckin = async () => {
  try {
    isProcessing.value = true;
    errorMessage.value = '';
    successMessage.value = '';

    let guestId: number;

    // 1. Check if it's an existing guest or new guest
    if (selectedGuest.value) {
      // Existing guest - use existing guest ID
      guestId = selectedGuest.value.id;

      // If documents are uploaded for existing guest, handle document updates if needed
      if (primaryDocument.value) {
        // TODO: Handle document updates for existing guests if needed
        // This might be a separate API call to update guest documents
      }
    } else {
      // New guest - create guest with documents
      const formData = prepareGuestFormData(guestData.value, {
        primaryDocuments: primaryDocument.value ? [primaryDocument.value] : [],
        primaryDocumentsBack: primaryDocumentBack.value ? [primaryDocumentBack.value] : [],
        accompanyingDocuments: accompanyingDocuments.value
      });

      const guestResult = await createGuestMutation.createGuest(formData);
      guestId = guestResult.primary_guest_id;
    }

    // 2. Check-in offline with guest ID using the workflow mutation
    const checkinData = {
      primary_guest_id: guestId,
      room_ids: stayForm.value.rooms,
      check_in_date: checkinDates.value.check_in.toISOString(),
      check_out_date: checkinDates.value.check_out.toISOString(),
      guest_names: guestData.value.accompanying_guests?.map(g => g.full_name).filter(Boolean)
    };

    const checkinResult = await checkinOfflineMutation.checkinOffline(checkinData);

    // 3. Verify check-in for each stay with any modifications using the workflow mutation
    for (const stayId of checkinResult.stay_ids) {
      const verifyRequestData: any = {
        guest_updates: {
          hours_24: verifyData.value.hours_24 || false,
          breakfast_reminder: verifyData.value.breakfast_reminder !== undefined ? verifyData.value.breakfast_reminder : true,
          dinner_reminder: verifyData.value.dinner_reminder || false,
          notes: verifyData.value.notes || ''
        }
      };

      await verifyCheckinMutation.verifyCheckin({
        stayId: stayId,
        data: verifyRequestData
      });
    }

    successMessage.value = 'Check-in completed successfully!';
    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: `Guest checked in successfully! ${selectedGuest.value ? '(Existing Guest)' : '(New Guest)'}`
    });

    // Emit event to switch tab to pending stays
    emit('checkin-success');

    // Reset form after delay
    setTimeout(() => {
      resetForm();
    }, 2000);

  } catch (error: any) {
    errorMessage.value = error.message || 'Failed to complete check-in';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMessage.value
    });
  } finally {
    isProcessing.value = false;
  }
};

const resetForm = () => {
  step.value = 1;
  guestData.value = {
    primary_guest: {
      full_name: '',
      whatsapp_number: '',
      email: '',
      document_type: '',
      document_number: ''
    },
    accompanying_guests: []
  };
  stayForm.value = {
    rooms: [],
    check_out_date: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  checkinDates.value = {
    check_in: new Date(),
    check_out: new Date(Date.now() + 24 * 60 * 60 * 1000)
  };
  primaryDocument.value = null;
  primaryDocumentBack.value = null;
  accompanyingDocuments.value = [];
  uploadBackSide.value = false;
  verifyData.value = {
    hours_24: false,
    breakfast_reminder: true,
    dinner_reminder: false,
    notes: ''
  };
  flagSummary.value = null;
  errorMessage.value = '';
  successMessage.value = '';
};

onMounted(() => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);

  checkinDates.value = {
    check_in: now,
    check_out: tomorrow
  };

  refetchRooms();
});
</script>
