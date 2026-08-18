<template>
    <div
        class="sticky top-0 z-10 bg-white p-4 rounded border border-gray-200 mb-4 shadow-sm"
    >
        <div
            class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
        >
            <h2 class="text-xl font-bold text-gray-900">Floor Plan</h2>
            <div class="flex flex-col sm:flex-row gap-3 sm:gap-4">
                <InputText
                    v-model="localRoomSearch"
                    placeholder="Search rooms..."
                    class="w-full sm:w-56"
                    @input="$emit('update:roomSearch', $event.target.value)"
                    @keydown.enter="$emit('update:roomSearch', localRoomSearch)"
                />
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

        <div
            class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 mt-4 pt-4 border-t border-gray-200"
        >
            <span class="text-sm font-medium text-gray-700 shrink-0"
                >Jump to floor</span
            >
            <!-- Scrolls sideways instead of wrapping, so a 12-floor hotel still
                 fits one row on a phone. -->
            <div class="overflow-x-auto -mx-1 px-1 pb-1">
                <SelectButton
                    v-model="localSelectedFloor"
                    :options="floorOptions"
                    optionLabel="label"
                    optionValue="value"
                    :allowEmpty="false"
                    class="flex-nowrap w-max"
                    @update:modelValue="$emit('jump-to-floor', $event)"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from "vue";
import InputText from "primevue/inputtext";
import Dropdown from "primevue/dropdown";
import SelectButton from "primevue/selectbutton";

interface FloorOption {
    label: string;
    value: number | null;
}

interface RoomStatus {
    label: string;
    value: string;
}

interface Props {
    roomSearch: string;
    roomStatusFilter: string;
    selectedFloor: number | null;
    floorOptions: FloorOption[];
    roomStatuses: RoomStatus[];
}

const props = defineProps<Props>();

const localRoomSearch = ref(props.roomSearch);
const localRoomStatusFilter = ref(props.roomStatusFilter);
const localSelectedFloor = ref(props.selectedFloor);

defineEmits<{
    "update:roomSearch": [value: string];
    "update:roomStatusFilter": [value: string];
    "jump-to-floor": [value: number | null];
}>();

// Watch for prop changes and update local refs
watch(
    () => props.roomSearch,
    (value) => {
        localRoomSearch.value = value;
    },
);

watch(
    () => props.roomStatusFilter,
    (value) => {
        localRoomStatusFilter.value = value;
    },
);

watch(
    () => props.selectedFloor,
    (value) => {
        localSelectedFloor.value = value;
    },
);
</script>
