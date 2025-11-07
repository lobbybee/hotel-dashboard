<template>
    <div class="flex items-center justify-between mb-5 flex-wrap gap-6">
        <h2 class="text-xl font-semibold text-gray-800">Floor Plan</h2>
        <div class="flex items-center gap-4 md:gap-6 flex-wrap">
            <div class="flex flex-col min-w-[220px]">
                <label for="room-search" class="text-xs text-gray-500 mb-1">Search</label>
                <InputText
                    id="room-search"
                    v-model="localRoomSearch"
                    placeholder="Search rooms..."
                    class="p-inputtext-sm"
                    @input="$emit('update:roomSearch', $event.target.value)"
                    @keydown.enter="$emit('update:roomSearch', localRoomSearch)"
                />
            </div>
            <div class="flex flex-col min-w-[220px]">
                <label for="status-filter" class="text-xs text-gray-500 mb-1">Status</label>
                <Dropdown
                    id="status-filter"
                    v-model="localRoomStatusFilter"
                    :options="roomStatuses"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Filter by status"
                    class="p-inputtext-sm"
                    showClear
                    @update:modelValue="$emit('update:roomStatusFilter', $event)"
                />
            </div>
            <div class="flex items-center gap-2">
                <span id="floor-selector" class="text-xs text-gray-500">Floor</span>
                <SelectButton
                    v-model="localSelectedFloor"
                    :options="floorOptions"
                    optionLabel="label"
                    optionValue="value"
                    aria-labelledby="floor-selector"
                    @update:modelValue="$emit('update:selectedFloor', $event)"
                />
                <Button
                    icon="pi pi-plus"
                    aria-label="Add floor"
                    @click="$emit('add-floor')"
                    class="p-button-rounded p-button-text"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import Button from "primevue/button";
import SelectButton from "primevue/selectbutton";

interface FloorOption {
    label: string;
    value: number;
}

interface RoomStatus {
    label: string;
    value: string;
}

interface Props {
    roomSearch: string;
    roomStatusFilter: string;
    selectedFloor: number;
    floorOptions: FloorOption[];
    roomStatuses: RoomStatus[];
}

const props = defineProps<Props>();

const localRoomSearch = ref(props.roomSearch);
const localRoomStatusFilter = ref(props.roomStatusFilter);
const localSelectedFloor = ref(props.selectedFloor);

const emit = defineEmits<{
    'update:roomSearch': [value: string];
    'update:roomStatusFilter': [value: string];
    'update:selectedFloor': [value: number];
    'add-floor': [];
}>();

// Watch for prop changes and update local refs
watch(() => props.roomSearch, (value) => {
    localRoomSearch.value = value;
});

watch(() => props.roomStatusFilter, (value) => {
    localRoomStatusFilter.value = value;
});

watch(() => props.selectedFloor, (value) => {
    localSelectedFloor.value = value;
});
</script>