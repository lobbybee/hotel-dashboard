<template>
    <div class="bg-white p-4 rounded border border-gray-200 mb-4">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h2 class="text-xl font-bold text-gray-900">Floor Plan</h2>
            <div class="flex flex-col sm:flex-row gap-4">
                <div class="relative">
                    <i class="pi pi-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                    <InputText
                        v-model="localRoomSearch"
                        placeholder="Search rooms..."
                        class="pl-10 w-full sm:w-56"
                        @input="$emit('update:roomSearch', $event.target.value)"
                        @keydown.enter="$emit('update:roomSearch', localRoomSearch)"
                    />
                </div>
                <Dropdown
                    v-model="localRoomStatusFilter"
                    :options="roomStatuses"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="Filter by status"
                    class="w-full sm:w-48"
                    showClear
                    @update:modelValue="$emit('update:roomStatusFilter', $event)"
                />
            </div>
        </div>

        <div class="flex flex-col sm:flex-row sm:items-center gap-4 mt-4 pt-4 border-t border-gray-200">
            <span class="text-sm font-medium text-gray-700">Floor</span>
            <div class="flex flex-wrap items-center gap-2">
                <SelectButton
                    v-model="localSelectedFloor"
                    :options="floorOptions"
                    optionLabel="label"
                    optionValue="value"
                    @update:modelValue="$emit('update:selectedFloor', $event)"
                />
                <!-- <Button
                    icon="pi pi-plus"
                    text
                    rounded
                    aria-label="Add floor"
                    @click="$emit('add-floor')"
                /> -->
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
