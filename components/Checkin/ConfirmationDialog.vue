<template>
  <Dialog :visible="visible" @update:visible="emit('update:visible', $event)" modal header="Confirm Guest Check-in" :style="{ width: '550px' }">
    <div v-if="stay" class="space-y-4">
      
      <!-- Guest Details -->
      <div class="border-b pb-4">
        <h4 class="font-semibold text-lg mb-2">Guest Details</h4>
        <div class="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
            <p><strong>Name:</strong> {{ stay.guest.full_name }}</p>
            <p><strong>Email:</strong> {{ stay.guest.email }}</p>
            <p><strong>Phone:</strong> {{ stay.guest.whatsapp_number }}</p>
            <p><strong>Nationality:</strong> {{ stay.guest.nationality }}</p>
        </div>
      </div>

      <!-- Identity Documents -->
      <div class="border-b pb-4">
        <h4 class="font-semibold text-lg mb-2">Identity Documents</h4>
        <div v-if="stay.guest.identity_documents && stay.guest.identity_documents.length > 0">
            <div v-for="doc in stay.guest.identity_documents" :key="doc.id" class="flex items-center justify-between p-2 rounded-lg bg-gray-50 mb-2">
                <div>
                    <p class="font-semibold">{{ formatDocumentType(doc.document_type) }}</p>
                    <a :href="doc.document_file_url" target="_blank" class="text-sm text-blue-500 hover:underline">View Document</a>
                </div>
                <Badge :value="doc.is_verified ? 'Verified' : 'Not Verified'" :severity="doc.is_verified ? 'success' : 'warning'" />
            </div>
        </div>
        <div v-else>
            <p class="text-sm text-gray-500">No identity documents uploaded.</p>
        </div>
      </div>

      <!-- Stay Selection -->
      <div>
        <h4 class="font-semibold text-lg mb-2">Stay Details</h4>
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
                <label for="room" class="block text-sm font-medium text-gray-700 mb-1">Room</label>
                <Dropdown id="room" v-model="selectedRoom" :options="rooms" optionLabel="room_number" optionValue="id" placeholder="Select a Room" class="w-full" :loading="isRoomsLoading" />
            </div>

            <div v-if="!stay.room">
                <label for="checkout" class="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
                <Calendar id="checkout" v-model="checkOutDate" class="w-full" showIcon />
            </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" @click="emit('update:visible', false)" class="p-button-text" />
      <Button v-if="stay && stay.room" label="Confirm & Check-in" icon="pi pi-check" @click="confirmCheckin" :loading="isConfirming" :disabled="!selectedRoom" />
      <Button v-else label="Create Stay & Check-in" icon="pi pi-check" @click="createStayAndCheckin" :loading="isConfirming" :disabled="!selectedRoom || !checkOutDate" />
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
import { useFetchRooms, useFetchRoomCategories, useFetchHotelRoomFloors } from '~/composables/useHotel';

const props = defineProps({
  visible: Boolean,
  stay: Object as () => any,
  isConfirming: Boolean,
});

const emit = defineEmits(['update:visible', 'confirmed', 'create-stay']);

const selectedCategory = ref<number | null>(null);
const selectedFloor = ref<number | null>(null);
const selectedRoom = ref<number | null>(null);
const checkOutDate = ref<Date | null>(null);

const { data: categoriesData } = useFetchRoomCategories();
const categories = computed(() => categoriesData.value?.results || []);

const { data: floorsData } = useFetchHotelRoomFloors();
const floors = computed(() => floorsData.value?.floors || []);

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

const formatDocumentType = (type: string) => {
    if (!type) return '';
    return type.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
};

const confirmCheckin = () => {
  emit('confirmed', { roomId: selectedRoom.value });
};

const createStayAndCheckin = () => {
  if (selectedRoom.value && checkOutDate.value) {
    emit('create-stay', { 
        guestId: props.stay.guest.id, 
        roomId: selectedRoom.value, 
        checkOutDate: checkOutDate.value.toISOString() 
    });
  }
};

watch(() => props.visible, async (newValue) => {
  if (newValue) {
    selectedCategory.value = props.stay?.room?.category || null;
    selectedFloor.value = props.stay?.room?.floor || null;
    checkOutDate.value = null;
    await refetchRooms();
    selectedRoom.value = props.stay?.room?.id || null;
  }
});

watch([selectedCategory, selectedFloor], () => {
    if(props.visible) {
        refetchRooms();
    }
});
</script>
