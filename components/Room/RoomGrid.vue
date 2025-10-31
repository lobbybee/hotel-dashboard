<template>
    <div>
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
            <div
                v-for="room in rooms"
                :key="room.id"
                @click="$emit('toggle-room-selection', room)"
                class="relative p-3 rounded border cursor-pointer transition-all duration-200 flex flex-col items-center"
                :class="{
                    'border-gray-300 bg-white hover:shadow-md':
                        room.status === 'available',
                    'border-blue-300 bg-blue-100 hover:shadow-md':
                        room.status === 'occupied',
                    'border-yellow-300 bg-yellow-100 hover:shadow-md':
                        room.status === 'cleaning',
                    'border-red-300 bg-red-100 hover:shadow-md':
                        room.status === 'maintenance',
                    'border-gray-400 bg-gray-300 hover:shadow-md':
                        room.status === 'out_of_order',
                    'ring-2 ring-primary-500 ring-offset-1':
                        selectedRooms.includes(room.id),
                }"
            >
                <span class="font-semibold text-gray-800">{{
                    room.room_number
                }}</span>
                <span class="text-xs text-gray-600 mt-1">{{
                    getCategoryName(room.category.id, categories)
                }}</span>
                <Tag
                    :value="
                        room.status.charAt(0).toUpperCase() +
                        room.status.slice(1)
                    "
                    :severity="getStatusSeverity(room.status)"
                    class="mt-2 text-xs"
                />
                <span class="text-xs text-gray-500 mt-1"
                    >Floor {{ room.floor }}</span
                >
                <Button
                    icon="pi pi-pencil"
                    class="p-button-rounded p-button-text p-button-sm absolute top-0 right-0"
                    @click.stop="$emit('edit-room', room)"
                />
            </div>

            <!-- Empty state for floor -->
            <div
                v-if="rooms.length === 0"
                class="col-span-full text-center py-8"
            >
                <i class="pi pi-home text-3xl text-gray-300 mb-2"></i>
                <p class="text-gray-500">No rooms found on this floor</p>
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
    return category?.name || "Unknown";
};

const getStatusSeverity = (status: string) => {
    const severityMap: Record<string, string> = {
        available: "success",
        occupied: "info",
        cleaning: "warning",
        maintenance: "warning",
        out_of_order: "danger",
    };
    return severityMap[status] || "secondary";
};
</script>