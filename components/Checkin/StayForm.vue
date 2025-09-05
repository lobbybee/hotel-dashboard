<template>
  <div class="space-y-6">
    <h4 class="font-semibold text-gray-700 border-b pb-2">Stay Details</h4>
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <div>
        <label for="room_category_filter" class="block text-sm font-medium text-gray-700 mb-1">Room Category Filter</label>
        <Dropdown id="room_category_filter" v-model="selectedRoomCategory" :options="roomCategories" optionLabel="label" optionValue="value" placeholder="Select Category to Filter" class="w-full" @change="refetchRooms" />
      </div>
      <div>
        <label for="floor_filter" class="block text-sm font-medium text-gray-700 mb-1">Floor</label>
        <Dropdown id="floor_filter" v-model="selectedFloor" :options="floorOptions" optionLabel="label" optionValue="value" placeholder="Select Floor" class="w-full" @change="refetchRooms" :loading="floorsLoading" />
      </div>
      <div>
        <label for="manual_room" class="block text-sm font-medium text-gray-700 mb-1">Rooms</label>
        <MultiSelect id="manual_room" :modelValue="stayForm.rooms" @update:modelValue="updateStay('rooms', $event)" :options="availableRooms" optionLabel="label" optionValue="value" placeholder="Select Rooms" class="w-full" :loading="roomsLoading" />
      </div>
      <div>
        <label for="manual_check_out" class="block text-sm font-medium text-gray-700 mb-1">Check-out Date</label>
        <Calendar id="manual_check_out" :modelValue="stayForm.check_out_date" @update:modelValue="updateStay('check_out_date', $event)" class="w-full" showIcon :minDate="new Date()" />
      </div>
      
      <div v-if="selectedRoomsDisplay.length > 0" class="col-span-2">
        <div class="p-3 bg-blue-50 border border-blue-200 rounded-lg">
          <h5 class="font-semibold text-blue-800 mb-3 text-sm">Selected Rooms ({{ selectedRoomsDisplay.length }})</h5>
          <div v-if="roomsByCategory && Object.keys(roomsByCategory).length > 1" class="mb-3">
            <div v-for="(rooms, category) in roomsByCategory" :key="category" class="mb-2 last:mb-0">
              <div class="text-xs font-medium text-gray-700 mb-1">{{ category }} ({{ rooms.length }})</div>
              <div class="flex flex-wrap gap-1">
                <Badge v-for="room in rooms" :key="room?.value" :value="room?.number" severity="info" class="text-xs" />
              </div>
            </div>
          </div>
          <div v-else class="flex flex-wrap gap-2">
            <Badge v-for="room in selectedRoomsDisplay" :key="room?.value" :value="`${room?.number} - ${room?.category}`" severity="info" class="text-xs" />
          </div>
        </div>
      </div>
    </div>

    <h4 class="font-semibold text-gray-700 border-b pb-2 pt-4">Identity Document (Required)</h4>
    <Dropdown :modelValue="docForm.document_type" @update:modelValue="updateDoc('document_type', $event)" :options="documentTypes" optionLabel="label" optionValue="value" placeholder="Select document type" class="w-full" />
    <FileUpload name="document" @select="$emit('file-select', $event)" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000" ref="walkinUploader">
      <template #empty><p>Drag and drop file here to upload.</p></template>
    </FileUpload>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Dropdown from 'primevue/dropdown';
import Calendar from 'primevue/calendar';
import MultiSelect from 'primevue/multiselect';
import FileUpload from 'primevue/fileupload';
import Badge from 'primevue/badge';
import { useFetchRooms, useFetchRoomCategories, useFetchHotelRoomFloors } from '~/composables/useHotel';

const props = defineProps(['stayForm', 'docForm']);
const emit = defineEmits(['file-select', 'update-stay-field', 'update-doc-field']);

const walkinUploader = ref();

const updateStay = (field: string, value: any) => {
  emit('update-stay-field', { field, value });
};

const updateDoc = (field: string, value: any) => {
  emit('update-doc-field', { field, value });
};

const { data: roomCategoriesData, isLoading: categoriesLoading } = useFetchRoomCategories();
const selectedRoomCategory = ref(null);
const selectedFloor = ref(null);

const { data: floorsData, isLoading: floorsLoading } = useFetchHotelRoomFloors();
const { data: roomsData, isLoading: roomsLoading, refetch: refetchRooms } = useFetchRooms(computed(() => ({
  status: 'available',
  category: selectedRoomCategory.value,
  floor: selectedFloor.value
})));

onMounted(refetchRooms);

const roomCategories = computed(() => {
  const categories = roomCategoriesData.value?.results.map((category:any) => ({
    label: `${category.name}`,
    value: category.id
  })) || [];
  return [{ label: 'All Categories', value: null }, ...categories];
});

const floorOptions = computed(() => {
  if (!floorsData.value?.floors) return [];
  const floors = floorsData.value.floors.map((floor: number) => ({
    label: `Floor ${floor}`,
    value: floor,
  }));
  return [{ label: 'All Floors', value: null }, ...floors];
});

const availableRooms = computed(() => {
  if (!roomsData.value?.results) return [];
  return roomsData.value.results.map((room: any) => ({
    label: selectedRoomCategory.value && selectedRoomCategory.value !== null
      ? `Room ${room.room_number}` 
      : `Room ${room.room_number} - ${room.category_details?.name || 'N/A'}`,
    value: room.id,
    category: room.category_details?.name || 'N/A'
  }));
});

const selectedRoomsDisplay = computed(() => {
  if (!props.stayForm.rooms.length || !roomsData.value?.results) return [];
  return props.stayForm.rooms.map((roomId:any) => {
    const room = roomsData.value.results.find((r: any) => r.id === roomId);
    return room ? { value: roomId, number: room.room_number, category: room.category_details?.name || 'N/A' } : null;
  }).filter(Boolean);
});

const roomsByCategory = computed(() => {
  if (!selectedRoomsDisplay.value.length) return {};
  return selectedRoomsDisplay.value.reduce((acc: any, room: any) => {
    if (!room) return acc;
    const category = room.category;
    if (!acc[category]) acc[category] = [];
    acc[category].push(room);
    return acc;
  }, {});
});

const documentTypes = [{ label: 'Passport', value: 'passport' }, { label: 'Driving License', value: 'driving_license' }, { label: 'National ID', value: 'national_id' }, { label: 'Voter ID', value: 'voter_id' }, { label: 'Other', value: 'other' }];

const clearUploader = () => {
  if (walkinUploader.value) {
    walkinUploader.value.clear();
  }
};

defineExpose({ clearUploader });
</script>
