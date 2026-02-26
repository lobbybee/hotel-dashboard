<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal header="Confirm Guest Check-in" :style="{ width: '550px' }">
    <div v-if="stay" class="space-y-4">



      <!-- Guest Details -->
      <div class="border-b pb-4">
        <div class="flex items-center justify-between mb-2">
          <h4 class="font-semibold text-lg">Guest Details</h4>
          <div class="flex items-center gap-2">
            <Checkbox inputId="editGuest" v-model="editGuestMode" binary />
            <label for="editGuest" class="text-sm cursor-pointer">Edit Guest Info</label>
          </div>
        </div>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Name</label>
            <InputText v-if="editGuestMode" v-model="guestEdits.full_name" class="w-full text-sm" />
            <p v-else><strong>{{ stay.guest.full_name }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Email</label>
            <InputText v-if="editGuestMode" v-model="guestEdits.email" class="w-full text-sm" />
            <p v-else><strong>{{ stay.guest.email || 'Not provided' }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Phone</label>
            <p><strong>{{ stay.guest.whatsapp_number }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Nationality</label>
            <InputText v-if="editGuestMode" v-model="guestEdits.nationality" class="w-full text-sm" />
            <p v-else><strong>{{ stay.guest.nationality }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Date of Birth</label>
            <Calendar v-if="editGuestMode" v-model="guestEdits.date_of_birth" class="w-full text-sm" showIcon dateFormat="yy-mm-dd" />
            <p v-else><strong>{{ stay.guest.date_of_birth || 'Not provided' }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Preferred Language</label>
            <Dropdown v-if="editGuestMode" v-model="guestEdits.preferred_language" :options="languageOptions" optionLabel="name" optionValue="code" class="w-full text-sm" />
            <p v-else><strong>{{ getLanguageName(stay.guest.preferred_language) || 'Not specified' }}</strong></p>
          </div>

          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Status</label>
            <Badge :value="stay.guest.status" :severity="getStatusSeverity(stay.guest.status)" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">WhatsApp Active</label>
            <Badge :value="stay.guest.is_whatsapp_active ? 'Active' : 'Inactive'" :severity="stay.guest.is_whatsapp_active ? 'success' : 'warning'" />
          </div>
        </div>
        <div v-if="editGuestMode || stay.guest.notes" class="mt-3">
          <label class="block text-xs font-medium text-gray-500 mb-1">Notes</label>
          <Textarea v-if="editGuestMode" v-model="guestEdits.notes" rows="2" class="w-full text-sm" />
          <p v-else class="text-sm">{{ stay.guest.notes || 'No notes' }}</p>
        </div>
      </div>

      <!-- Identity Documents -->
      <div class="border-b pb-4">
        <h4 class="font-semibold text-lg mb-2">Identity Documents</h4>
        <div v-if="stay.guest?.documents && stay.guest.documents.length > 0">
            <div v-for="doc in stay.guest.documents" :key="doc.id" class="mb-3">
                <div class="flex items-center justify-between p-3 rounded-lg bg-gray-50 border border-gray-200">
                    <div class="flex-1">
                        <div class="flex items-center gap-2 mb-2">
                            <p class="font-semibold text-gray-900">{{ formatDocumentType(doc.document_type) }}</p>
                            <span v-if="doc.document_number" class="text-sm text-gray-500">({{ doc.document_number }})</span>
                        </div>
                        <div class="flex gap-3">
                            <a v-if="doc.document_file_url" :href="doc.document_file_url" target="_blank" class="text-sm text-blue-500 hover:underline flex items-center gap-1">
                                <i class="pi pi-eye"></i>
                                View Front
                            </a>
                            <a v-if="doc.document_file_back_url" :href="doc.document_file_back_url" target="_blank" class="text-sm text-blue-500 hover:underline flex items-center gap-1">
                                <i class="pi pi-eye"></i>
                                View Back
                            </a>
                        </div>
                    </div>
                    <Badge :value="doc.is_verified ? 'Verified' : 'Not Verified'" :severity="doc.is_verified ? 'success' : 'warning'" />
                </div>
            </div>
        </div>
        <div v-else>
            <p class="text-sm text-gray-500">No identity documents uploaded.</p>
        </div>
      </div>

      <!-- Booking Details -->
      <div class="border-b pb-4">
        <h4 class="font-semibold text-lg mb-2">Booking Details</h4>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Booking ID</label>
            <p><strong>#{{ stay.booking_details?.id }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Booking Status</label>
            <Badge :value="stay.booking_details?.status" :severity="getBookingStatusSeverity(stay.booking_details?.status)" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Booking Date</label>
            <p><strong>{{ formatDateTime(stay.booking_details?.booking_date) }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Total Amount</label>
            <p><strong>₹{{ stay.booking_details?.total_amount || 0 }}</strong></p>
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Via WhatsApp</label>
            <Badge :value="stay.booking_details?.is_via_whatsapp ? 'Yes' : 'No'" :severity="stay.booking_details?.is_via_whatsapp ? 'info' : 'secondary'" />
          </div>
          <div>
            <label class="block text-xs font-medium text-gray-500 mb-1">Guest Names</label>
            <p><strong>{{ stay.booking_details?.guest_names?.join(', ') || 'N/A' }}</strong></p>
          </div>
        </div>
      </div>

      <!-- Stay Selection -->
      <div>
        <h4 class="font-semibold text-lg mb-2">Stay Details</h4>
        <!-- Flag Warnings - Top Priority -->
            <FlagWarningAccordion v-if="flagSummary" :flagSummary="flagSummary" class="mb-4" />
        <div class="pt-4 space-y-4">
            <div class="grid grid-cols-2 gap-4">
                <div>
                    <label for="category" class="block text-sm font-medium text-gray-700 mb-1">Category</label>
                    <Dropdown id="category" v-model="selectedCategory" :options="categories" optionLabel="name" optionValue="id" placeholder="All" class="w-full" showClear />
                </div>
                <div>
                    <label for="floor" class="block text-sm font-medium text-gray-700 mb-1">Floor</label>
                    <Dropdown id="floor" v-model="selectedFloor" :options="floors" placeholder="All" class="w-full" showClear />
                </div>
            </div>

            <div>
                <label for="room" class="block text-sm font-medium text-gray-700 mb-1">
                    {{ stay.room ? 'Room' : 'Assign Room' }}
                    <span v-if="stay.room && selectedRoom !== stay.room.id" class="text-amber-500 text-xs ml-2">(Change Room)</span>
                </label>
                <Dropdown
                    id="room"
                    v-model="selectedRoom"
                    :options="rooms"
                    optionLabel="room_number"
                    optionValue="id"
                    :placeholder="
                      stay.room
                        ? (stay.room.room_number ? `${stay.room.room_number} (Current)` : 'Current room (assigned)')
                        : 'Select a Room'
                    "
                    class="w-full"
                    :loading="isRoomsLoading"
                />
            </div>

            <div v-if="!stay.room">
                <label for="checkout" class="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <Calendar id="checkout" v-model="checkOutDate" class="w-full" showIcon showTime />
            </div>

            <div>
                <label for="register_number" class="block text-sm font-medium text-gray-700 mb-1">Register Number</label>
                <InputText id="register_number" v-model="registerNumber" class="w-full" />
            </div>
            <div>
                     <label class="block text-xs font-medium text-gray-500 mb-1">12hrs or 24 hrs</label>
                     <div class="flex items-center gap-2">
                       <Checkbox inputId="hours_24" v-model="guestEdits.hours_24" binary />
                       <label for="hours_24" class="text-sm cursor-pointer font-bold">24 hours</label>
                     </div>
                   </div>
            <div class="grid grid-cols-2 gap-4 mt-4">
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Breakfast Reminder</label>
                    <div class="flex items-center gap-2">
                        <Checkbox inputId="breakfast_reminder" v-model="guestEdits.breakfast_reminder" binary />
                        <label for="breakfast_reminder" class="text-sm cursor-pointer">Enable</label>
                    </div>
                </div>
                <div>
                    <label class="block text-xs font-medium text-gray-500 mb-1">Dinner Reminder</label>
                    <div class="flex items-center gap-2">
                        <Checkbox inputId="dinner_reminder" v-model="guestEdits.dinner_reminder" binary />
                        <label for="dinner_reminder" class="text-sm cursor-pointer">Enable</label>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="emit('update:visible', false)" class="p-button-text" />
      <Button label="Confirm & Check-in" icon="pi pi-check" @click="confirmAndCheckin" :loading="isConfirming" :disabled="!selectedRoom || (!stay.room && !checkOutDate)" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Dialog from 'primevue/dialog';
import Button from 'primevue/button';
import Dropdown from 'primevue/dropdown';
import Badge from 'primevue/badge';
import Calendar from 'primevue/calendar';
import Checkbox from 'primevue/checkbox';
import Textarea from 'primevue/textarea';
import { useToast } from 'primevue/usetoast';
import { useFetchRooms, useFetchRoomCategories, useFetchHotelRoomFloors } from '~/composables/useHotel';

import InputText from 'primevue/inputtext';
import FlagWarningAccordion from './FlagWarningAccordion.vue';

const props = defineProps({
  visible: Boolean,
  stay: Object as () => any,
  isConfirming: Boolean,
  flagSummary: Object as () => any,
});

const emit = defineEmits(['update:visible', 'confirmed']);

const toast = useToast();

const registerNumber = ref<string>('');
const selectedCategory = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);
const selectedRoom = ref<number | null>(null);
const checkOutDate = ref<Date | null>(null);

// Guest editing mode
const editGuestMode = ref<boolean>(false);
const guestEdits = ref({
  full_name: '',
  email: '',
  nationality: '',
  date_of_birth: null as Date | null,
  preferred_language: '',
  notes: '',
  hours_24: false,
  breakfast_reminder: false,
  dinner_reminder: false
});

// Language options
const languageOptions = [
  { name: 'English', code: 'en' },
  { name: 'Spanish', code: 'es' },
  { name: 'French', code: 'fr' },
  { name: 'German', code: 'de' },
  { name: 'Italian', code: 'it' },
  { name: 'Portuguese', code: 'pt' },
  { name: 'Russian', code: 'ru' },
  { name: 'Chinese', code: 'zh' },
  { name: 'Japanese', code: 'ja' },
  { name: 'Arabic', code: 'ar' },
  { name: 'Hindi', code: 'hi' }
];

const { data: categoriesData } = useFetchRoomCategories();
const categories = computed(() => categoriesData.value?.results || []);

const { data: floorsData } = useFetchHotelRoomFloors();
const floors = computed(() => {
  const value = floorsData.value;
  if (!value) return [];
  if (Array.isArray(value)) return value;
  // Fallback if API returns { floors: [...] }
  return (value as any).floors || [];
});

const roomFilters = computed(() => ({
    status: 'available',
    category: selectedCategory.value,
    floor: selectedFloor.value,
}));

const { data: roomsData, refetch: refetchRooms, isLoading: isRoomsLoading } = useFetchRooms(roomFilters);
const rooms = computed(() => {
    const availableRooms = roomsData.value?.results || [];
    if (props.stay?.room && !availableRooms.find(r => r.id === props.stay.room.id)) {
        return [props.stay.room, ...availableRooms];
    }
    return availableRooms;
});

const formatDateTime = (dateString: string) => {
  if (!dateString) return 'N/A';
  const d = new Date(dateString);
  const day = d.getDate();
  const month = d.toLocaleString('en-US', { month: 'short' });
  const year = d.getFullYear();
  const time = d.toLocaleString('en-US', { hour: 'numeric', hour12: true });
  return `${day} ${month} ${year} ${time}`;
};

const formatDocumentType = (type: string) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const getLanguageName = (code: string) => {
    const language = languageOptions.find(lang => lang.code === code);
    return language ? language.name : '';
};

const getStatusSeverity = (status: string) => {
    switch (status) {
        case 'pending_verification': return 'warning';
        case 'verified': return 'success';
        case 'rejected': return 'danger';
        default: return 'info';
    }
};

const getBookingStatusSeverity = (status: string) => {
    switch (status) {
        case 'pending': return 'warning';
        case 'confirmed': return 'success';
        case 'cancelled': return 'danger';
        default: return 'info';
    }
};

const confirmAndCheckin = () => {
  console.log('confirmAndCheckin called', {
    selectedRoom: selectedRoom.value,
    stayRoom: props.stay?.room?.id,
    hasRoom: !!props.stay?.room,
    checkOutDate: checkOutDate.value,
    editGuestMode: editGuestMode.value,
    guestEdits: guestEdits.value
  });

  if (editGuestMode.value && guestEdits.value.email) {
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(guestEdits.value.email)) {
      toast.add({ severity: 'error', summary: 'Invalid Email', detail: 'Enter a valid email address or leave it blank.', life: 4000 });
      return;
    }
  }

  const verifyData: any = {
    register_number: registerNumber.value
  };

  // Always include room_id for the verify-checkin endpoint
  if (selectedRoom.value) {
    verifyData.room_id = selectedRoom.value;
  }

  // For stays without existing room assignments, include check_out_date
  if (!props.stay?.room && checkOutDate.value) {
    verifyData.check_out_date = checkOutDate.value.toISOString();
  }

  // Include guest updates if edit mode is enabled and there are changes
  if (editGuestMode.value) {
    const guestUpdates: any = {};

    // Only include fields that have changed
    if (guestEdits.value.full_name && guestEdits.value.full_name !== props.stay?.guest?.full_name) {
      guestUpdates.full_name = guestEdits.value.full_name;
    }
    if (guestEdits.value.email && guestEdits.value.email !== props.stay?.guest?.email) {
      guestUpdates.email = guestEdits.value.email;
    }
    if (guestEdits.value.nationality && guestEdits.value.nationality !== props.stay?.guest?.nationality) {
      guestUpdates.nationality = guestEdits.value.nationality;
    }
    if (guestEdits.value.date_of_birth && guestEdits.value.date_of_birth !== props.stay?.guest?.date_of_birth) {
      guestUpdates.date_of_birth = guestEdits.value.date_of_birth.toISOString().split('T')[0];
    }
    if (guestEdits.value.preferred_language && guestEdits.value.preferred_language !== props.stay?.guest?.preferred_language) {
      guestUpdates.preferred_language = guestEdits.value.preferred_language;
    }
    if (guestEdits.value.notes !== props.stay?.guest?.notes) {
      guestUpdates.notes = guestEdits.value.notes;
    }
    // Always check these fields since they're always editable
    if (guestEdits.value.hours_24 !== props.stay?.guest?.hours_24) {
      guestUpdates.hours_24 = guestEdits.value.hours_24;
    }
    if (guestEdits.value.breakfast_reminder !== props.stay?.guest?.breakfast_reminder) {
      guestUpdates.breakfast_reminder = guestEdits.value.breakfast_reminder;
    }
    if (guestEdits.value.dinner_reminder !== props.stay?.guest?.dinner_reminder) {
      guestUpdates.dinner_reminder = guestEdits.value.dinner_reminder;
    }

    if (Object.keys(guestUpdates).length > 0) {
      verifyData.guest_updates = guestUpdates;
    }
  }

  console.log('Emitting confirmed with unified data:', verifyData);
  emit('confirmed', verifyData);
};

watch(() => props.visible, async (newValue) => {
  if (newValue) {
    // Initialize room selection
    if (props.stay?.room?.id) {
      // Stay already has a room assigned
      selectedRoom.value = props.stay.room.id;
      selectedCategory.value = props.stay.room.category || null;
      selectedFloor.value = props.stay.room.floor || null;
    } else {
      // Stay needs room assignment
      selectedRoom.value = null;
      selectedCategory.value = null;
      selectedFloor.value = null;
    }

    // Initialize check-out date for stays without rooms
    if (!props.stay?.room && props.stay?.check_out_date) {
      checkOutDate.value = new Date(props.stay.check_out_date);
    } else {
      checkOutDate.value = null;
    }

    // Initialize register number
    registerNumber.value = props.stay?.register_number || '';

    // Initialize guest edits with current guest data
    if (props.stay?.guest) {
      guestEdits.value = {
        full_name: props.stay.guest.full_name || '',
        email: props.stay.guest.email || '',
        nationality: props.stay.guest.nationality || '',
        date_of_birth: props.stay.guest.date_of_birth ? new Date(props.stay.guest.date_of_birth) : null,
        preferred_language: props.stay.guest.preferred_language || '',
        notes: props.stay.guest.notes || '',
        hours_24: props.stay.guest.hours_24 || false,
        breakfast_reminder: props.stay.guest.breakfast_reminder || false,
        dinner_reminder: props.stay.guest.dinner_reminder || false
      };
    }

    // Reset edit mode
    editGuestMode.value = false;

    await refetchRooms();
  }
});

watch([selectedCategory, selectedFloor], () => {
    if(props.visible) {
        refetchRooms();
    }
});
</script>
