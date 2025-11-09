<template>
    <div class="bg-white p-3 rounded border border-gray-200 mb-4">
        <div class="flex flex-wrap items-center gap-4">
            <span class="text-sm font-medium text-gray-700">Room Status:</span>
            <div class="flex flex-wrap gap-3">
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-green-500 border border-green-200"></div>
                    <span class="text-xs text-gray-600">Available</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-blue-500 border border-blue-200"></div>
                    <span class="text-xs text-gray-600">Occupied</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-amber-500 border border-amber-200"></div>
                    <span class="text-xs text-gray-600">Cleaning</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-red-500 border border-red-200"></div>
                    <span class="text-xs text-gray-600">Maintenance</span>
                </div>
                <div class="flex items-center gap-2">
                    <div class="w-3 h-3 rounded-full bg-gray-500 border border-gray-200"></div>
                    <span class="text-xs text-gray-600">Out of Order</span>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import Tag from "primevue/tag";
</script>