<template>
    <div class="bg-white rounded border border-gray-200 mb-4">
        <!-- Collapsible Header -->
        <div class="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors" @click="toggleCollapse">
            <div class="flex items-center gap-3">
                <i class="pi pi-chevron-right text-gray-500 transition-transform duration-200" :class="{ 'rotate-90': !isCollapsed }"></i>
                <h2 class="text-xl font-bold text-gray-900">Room Categories</h2>
                <Badge :value="totalCategories" severity="secondary" class="ml-2" />
            </div>
            <Button
                v-if="!isCollapsed"
                label="Add Room Category"
                icon="pi pi-plus"
                text
                @click.stop="$emit('add-category')"
            />
        </div>

        <!-- Collapsible Content -->
        <div v-show="!isCollapsed" class="px-4 pb-4">
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <Card
                    v-for="category in categories"
                    :key="category.id"
                    class="border border-gray-200 rounded transition-all hover:shadow-lg hover:-translate-y-0.5"
                >
                    <template #title>
                        <div class="flex items-center justify-between">
                            <h3 class="text-lg md:text-xl font-semibold flex items-center gap-2 truncate">
                                <i class="pi pi-building text-primary-600"></i>
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
                        <div class="space-y-3">
                            <p class="text-gray-600 text-sm">
                                {{ category.description }}
                            </p>

                            <div class="flex flex-wrap gap-2">
                                <Tag icon="pi pi-users" :value="`Max ${category.max_occupancy}`" severity="secondary" class="text-xs" rounded />
                                <Tag icon="pi pi-tag" :value="`₹${category.base_price}/night`" severity="info" class="text-xs" rounded />
                                <Tag icon="pi pi-home" :value="`${getRoomCountByCategory(category)} rooms`" severity="success" class="text-xs" rounded />
                            </div>

                            <div class="pt-3 border-t border-gray-200">
                                <div class="flex flex-wrap gap-2">
                                    <Tag
                                        v-for="amenity in category.amenities.slice(0, 6)"
                                        :key="amenity"
                                        :value="amenity"
                                        severity="secondary"
                                        class="text-xs"
                                        rounded
                                    />
                                    <Tag
                                        v-if="category.amenities.length > 6"
                                        :value="`+${category.amenities.length - 6}`"
                                        severity="info"
                                        class="text-xs"
                                        rounded
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
                                    text
                                    rounded
                                    @click="$emit('edit-category', category)"
                                    :loading="updateCategoryStatus === 'loading'"
                                    :disabled="updateCategoryStatus === 'loading'"
                                />
                                <Button
                                    icon="pi pi-trash"
                                    text
                                    rounded
                                    severity="danger"
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
    </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
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

const props = defineProps<Props>();

const emit = defineEmits<{
    'add-category': [];
    'edit-category': [category: Category];
    'delete-category': [category: Category];
    'category-page-change': [event: any];
}>();

const isCollapsed = ref(true);

const getRoomCountByCategory = (category: Category) => {
    return category.room_count || 0;
};

const toggleCollapse = () => {
    isCollapsed.value = !isCollapsed.value;
};
</script>