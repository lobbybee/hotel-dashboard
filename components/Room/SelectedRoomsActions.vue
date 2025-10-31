<template>
    <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
                <h3 class="font-semibold text-gray-800">
                    {{ selectedRoomCount }} room(s) selected
                </h3>
                <p class="text-sm text-gray-600">
                    Perform bulk actions on selected rooms
                </p>
            </div>
            <div class="flex flex-wrap gap-2">
                <Button
                    label="Change Status"
                    icon="pi pi-sync"
                    @click="$emit('bulk-status-change')"
                    class="p-button-outlined"
                    :loading="patchRoomStatus === 'loading'"
                />
                <Button
                    label="Delete Rooms"
                    icon="pi pi-trash"
                    @click="$emit('bulk-delete')"
                    class="p-button-danger p-button-outlined"
                    :loading="deleteRoomStatus === 'loading'"
                    :disabled="deleteRoomStatus === 'loading'"
                />
                <Button
                    label="Clear Selection"
                    icon="pi pi-times"
                    @click="$emit('clear-selection')"
                    class="p-button-text"
                />
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Button from "primevue/button";

interface Props {
    selectedRoomCount: number;
    patchRoomStatus: string;
    deleteRoomStatus: string;
}

defineProps<Props>();

const emit = defineEmits<{
    'bulk-status-change': [];
    'bulk-delete': [];
    'clear-selection': [];
}>();
</script>