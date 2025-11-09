<template>
    <div class="bg-gray-50 p-4 rounded-lg border border-gray-200 sticky bottom-4 z-20">
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
                <h3 class="font-medium text-gray-900">
                    {{ selectedRoomCount }} room(s) selected
                </h3>
                <p class="text-sm text-gray-600">
                    Perform bulk actions on selected rooms
                </p>
            </div>
            <div class="flex gap-2">
                <Button
                    label="Change Status"
                    icon="pi pi-sync"
                    text
                    @click="$emit('bulk-status-change')"
                    :loading="patchRoomStatus === 'loading'"
                />
                <Button
                    label="Delete Rooms"
                    icon="pi pi-trash"
                    text
                    severity="danger"
                    @click="$emit('bulk-delete')"
                    :loading="deleteRoomStatus === 'loading'"
                    :disabled="deleteRoomStatus === 'loading'"
                />
                <Button
                    label="Clear Selection"
                    icon="pi pi-times"
                    text
                    @click="$emit('clear-selection')"
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