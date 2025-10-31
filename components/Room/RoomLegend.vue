<template>
    <div class="flex flex-wrap gap-4 mb-4">
        <div class="flex items-center gap-2">
            <div
                class="w-4 h-4 rounded border border-gray-300 bg-white"
            ></div>
            <span class="text-sm text-gray-600">Available</span>
        </div>
        <div class="flex items-center gap-2">
            <div
                class="w-4 h-4 rounded border border-gray-300 bg-blue-100"
            ></div>
            <span class="text-sm text-gray-600">Occupied</span>
        </div>
        <div class="flex items-center gap-2">
            <div
                class="w-4 h-4 rounded border border-gray-300 bg-yellow-100"
            ></div>
            <span class="text-sm text-gray-600">Cleaning</span>
        </div>
        <div class="flex items-center gap-2">
            <div
                class="w-4 h-4 rounded border border-gray-300 bg-red-100"
            ></div>
            <span class="text-sm text-gray-600">Maintenance</span>
        </div>
        <div class="flex items-center gap-2">
            <div
                class="w-4 h-4 rounded border border-gray-300 bg-gray-300"
            ></div>
            <span class="text-sm text-gray-600">Out of Order</span>
        </div>
    </div>
</template>

<script setup lang="ts">
// Component for displaying room status legend
// No props needed - this is a static legend
</script>