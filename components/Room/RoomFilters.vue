<template>
    <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
        <h2 class="text-xl font-semibold text-gray-800">Floor Plan</h2>
        <div class="flex items-center gap-4 flex-wrap">
            <InputText
                v-model="localRoomSearch"
                placeholder="Search rooms..."
                class="p-inputtext-sm"
                @input="$emit('update:roomSearch', $event.target.value)"
            />
            <Dropdown
                v-model="localRoomStatusFilter"
                :options="roomStatuses"
                optionLabel="label"
                optionValue="value"
                placeholder="Filter by status"
                class="p-inputtext-sm"
                showClear
                @update:modelValue="$emit('update:roomStatusFilter', $event)"
            />
            <div class="flex items-center gap-2">
                <span class="text-gray-600">Select Floor:</span>
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