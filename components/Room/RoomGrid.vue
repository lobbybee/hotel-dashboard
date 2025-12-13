<template>
    <div>
        <div class="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-3">
            <div
                v-for="room in rooms"
                :key="room.id"
                @click="$emit('toggle-room-selection', room)"
                @keydown.enter.prevent="$emit('toggle-room-selection', room)"
                @keydown.space.prevent="$emit('toggle-room-selection', room)"
                role="checkbox"
                :aria-checked="selectedRooms.includes(room.id)"
                tabindex="0"
                :aria-label="`Room ${room.room_number}, ${room.status}, Floor ${room.floor}, ${getCategoryName(room.category.id, categories)}`"
                class="relative p-3 rounded border-2 cursor-pointer transition-all duration-200 flex flex-col items-center hover:shadow-lg aspect-square"
                :class="{
                    'border-green-200 bg-green-50 text-green-900 hover:border-green-300':
                        room.status === 'available',
                    'border-blue-200 bg-blue-50 text-blue-900 hover:border-blue-300':
                        room.status === 'occupied',
                    'border-amber-200 bg-amber-50 text-amber-900 hover:border-amber-300':
                        room.status === 'cleaning',
                    'border-red-200 bg-red-50 text-red-900 hover:border-red-300':
                        room.status === 'maintenance',
                    'border-gray-200 bg-gray-50 text-gray-900 hover:border-gray-300':
                        room.status === 'out_of_order',
                    'ring-4 ring-primary-500 ring-offset-1':
                        selectedRooms.includes(room.id),
                }"
            >
                <span class="font-bold text-lg">{{
                    room.room_number
                }}</span>
                <span class="text-xs text-gray-600 truncate">{{
                    getCategoryName(room.category.id, categories)[0]
                }}</span>
                <span class="text-xs text-gray-600 truncate"> ₹ {{
                                   getCategoryName(room.category.id, categories)[1]
                               }}</span>
                <Tag
                    :value="
                        room.status.charAt(0).toUpperCase() +
                        room.status.slice(1)
                    "
                    :severity="getStatusSeverity(room.status)"
                    :aria-label="`Status: ${room.status}`"
                    class="mt-auto text-xs"
                />
                <span class="text-xs text-gray-500"
                    >Floor {{ room.floor }}</span
                >
                <Button
                    icon="pi pi-pencil"
                    text
                    rounded
                    :aria-label="`Edit room ${room.room_number}`"
                    class="absolute top-1 right-1 p-1"
                    @click.stop="$emit('edit-room', room)"
                />
            </div>

            <!-- Empty state for floor -->
            <div
                v-if="rooms.length === 0"
                class="col-span-full text-center py-12"
            >
                <i class="pi pi-home text-6xl text-gray-300 opacity-50 mb-4"></i>
                <p class="text-gray-500 text-lg font-medium">No rooms found on this floor</p>
                <p class="text-gray-400 text-sm">Try selecting a different floor or adjusting filters</p>
            </div>
        </div>

        <!-- Room Pagination -->
        <Paginator
            v-if="totalRooms > 10"
            :rows="10"
            :totalRecords="totalRooms"
            @page="$emit('room-page-change', $event)"
            class="mt-4"
        />
    </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";

interface Room {
    id: number;
    room_number: string;
    floor: number;
    category: {
        id: number;
        name: string;
    };
    status: string;
}

interface Category {
    id: number;
    name: string;
}

interface Props {
    rooms: Room[];
    selectedRooms: number[];
    totalRooms: number;
    categories: Category[];
}

defineProps<Props>();

const emit = defineEmits<{
    'toggle-room-selection': [room: Room];
    'edit-room': [room: Room];
    'room-page-change': [event: any];
}>();

const getCategoryName = (categoryId: number, categories: Category[]) => {
    const category = categories.find((c) => c.id === categoryId);
    return [category?.name,category?.base_price] || ["Unknown","Unknown"];
};

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, string> = {
        available: "success",
        occupied: "info",
        cleaning: "warning",
        maintenance: "danger",
        out_of_order: "secondary",
    };
    return severityMap[status] || "secondary";
};
</script>
