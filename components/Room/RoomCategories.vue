<template>
    <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200 mb-5">
        <div class="flex justify-between items-center mb-4">
            <h2 class="text-xl font-semibold text-gray-800">Room Categories</h2>
            <Button
                label="Add Room Category"
                icon="pi pi-plus"
                @click="$emit('add-category')"
            />
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <Card
                v-for="category in categories"
                :key="category.id"
                class="shadow-sm border border-gray-200"
            >
                <template #title>
                    <div class="flex items-center justify-between">
                        <h3 class="text-lg font-semibold flex items-center gap-2">
                            <i class="pi pi-building text-blue-500"></i>
                            {{ category.name }}
                        </h3>
                        <Badge
                            value="Active"
                            severity="success"
                            class="px-2 py-1 text-xs"
                        />
                    </div>
                </template>
                <template #content>
                    <div class="space-y-2">
                        <p class="text-gray-600 text-sm">
                            {{ category.description }}
                        </p>

                        <div class="flex items-center gap-2 text-gray-600 text-sm">
                            <i class="pi pi-users"></i>
                            <span>Max {{ category.max_occupancy }} guests</span>
                        </div>

                        <div class="flex items-center gap-2 text-gray-600 text-sm">
                            <i class="pi pi-dollar"></i>
                            <span>₹{{ category.base_price }}/night</span>
                        </div>

                        <div class="mt-3 pt-3 border-t border-gray-100">
                            <div class="flex flex-wrap gap-1">
                                <Tag
                                    v-for="amenity in category.amenities.slice(0, 4)"
                                    :key="amenity"
                                    :value="amenity"
                                    class="text-xs"
                                />
                                <Tag
                                    v-if="category.amenities.length > 4"
                                    :value="`+${category.amenities.length - 4}`"
                                    severity="info"
                                    class="text-xs"
                                />
                            </div>
                        </div>
                    </div>
                </template>
                <template #footer>
                    <div class="flex justify-between items-center">
                        <span class="text-sm text-gray-600">
                            {{ getRoomCountByCategory(category) }} rooms
                        </span>
                        <div class="flex gap-2">
                            <Button
                                icon="pi pi-pencil"
                                class="p-button-rounded p-button-text p-button-sm"
                                @click="$emit('edit-category', category)"
                                :loading="updateCategoryStatus === 'loading'"
                                :disabled="updateCategoryStatus === 'loading'"
                            />
                            <Button
                                icon="pi pi-trash"
                                class="p-button-rounded p-button-text p-button-sm p-button-danger"
                                @click="$emit('delete-category', category)"
                                :loading="deleteCategoryStatus === 'loading'"
                                :disabled="deleteCategoryStatus === 'loading'"
                            />
                        </div>
                    </div>
                </template>
            </Card>
        </div>

        <!-- Category Pagination -->
        <Paginator
            v-if="totalCategories > 6"
            :rows="6"
            :totalRecords="totalCategories"
            @page="$emit('category-page-change', $event)"
            class="mt-4"
        />
    </div>
</template>

<script setup lang="ts">
import Card from "primevue/card";
import Button from "primevue/button";
import Badge from "primevue/badge";
import Tag from "primevue/tag";
import Paginator from "primevue/paginator";

interface Category {
    id: number;
    name: string;
    description: string;
    base_price: number;
    max_occupancy: number;
    amenities: string[];
    room_count?: number;
}

interface Props {
    categories: Category[];
    totalCategories: number;
    updateCategoryStatus: string;
    deleteCategoryStatus: string;
}

defineProps<Props>();

const emit = defineEmits<{
    'add-category': [];
    'edit-category': [category: Category];
    'delete-category': [category: Category];
    'category-page-change': [event: any];
}>();

const getRoomCountByCategory = (category: Category) => {
    return category.room_count || 0;
};
</script>