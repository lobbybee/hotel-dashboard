<template>
    <div class="bg-white/80 supports-[backdrop-filter]:bg-white/60 backdrop-blur p-3 md:p-4 rounded-xl shadow-md border border-gray-200 sticky bottom-4 z-20">
        <div class="flex flex-wrap items-center justify-between gap-3 md:gap-4 w-full">
            <div>
                <h3 class="font-semibold text-gray-800">
                    {{ selectedRoomCount }} room(s) selected
                </h3>
                <p class="text-sm text-gray-600">
                    Perform bulk actions on selected rooms
                </p>
            </div>
            <div class="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                    label="Change Status"
                    icon="pi pi-sync"
                    outlined
                    @click="$emit('bulk-status-change')"
                    class="w-full sm:w-auto min-w-[140px]"
                    :loading="patchRoomStatus === 'loading'"
                />
                <Button
                    label="Delete Rooms"
                    icon="pi pi-trash"
                    severity="danger"
                    outlined
                    @click="$emit('bulk-delete')"
                    class="w-full sm:w-auto min-w-[140px]"
                    :loading="deleteRoomStatus === 'loading'"
                    :disabled="deleteRoomStatus === 'loading'"
                />
                <Button
                    label="Clear Selection"
                    icon="pi pi-times"
                    text
                    @click="$emit('clear-selection')"
                    class="w-full sm:w-auto min-w-[140px]"
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