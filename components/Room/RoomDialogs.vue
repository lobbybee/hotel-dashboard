<template>
    <!-- Add/Edit Category Dialog -->
    <Dialog
        :visible="categoryDialogVisible"
        @update:visible="$emit('update:categoryDialogVisible', $event)"
        :header="editingCategory ? 'Edit Room Category' : 'Add Room Category'"
        :modal="true"
        :style="{ width: '500px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="space-y-6">
            <div>
                <FloatLabel>
                    <InputText
                        id="name"
                        v-model="categoryForm.name"
                        class="w-full"
                        :class="{ 'p-invalid': categoryErrors.name }"
                    />
                    <label for="name">Category Name</label>
                </FloatLabel>
                <small v-if="categoryErrors.name" class="p-error">{{
                    categoryErrors.name
                }}</small>
            </div>

            <div>
                <FloatLabel>
                    <Textarea
                        id="description"
                        v-model="categoryForm.description"
                        rows="3"
                        class="w-full"
                        :class="{ 'p-invalid': categoryErrors.description }"
                    />
                    <label for="description">Description</label>
                </FloatLabel>
                <small v-if="categoryErrors.description" class="p-error">{{
                    categoryErrors.description
                }}</small>
            </div>

            <div class="grid grid-cols-2 gap-4">
                <div>
                    <FloatLabel>
                        <InputNumber
                            id="base_price"
                            v-model="categoryForm.base_price"
                            class="w-full"
                            :class="{ 'p-invalid': categoryErrors.base_price }"
                            mode="currency"
                            currency="INR"
                            :min="0"
                        />
                        <label for="base_price">Base Price (₹)</label>
                    </FloatLabel>
                    <small v-if="categoryErrors.base_price" class="p-error">{{
                        categoryErrors.base_price
                    }}</small>
                </div>

                <div>
                    <FloatLabel>
                        <InputNumber
                            id="max_occupancy"
                            v-model="categoryForm.max_occupancy"
                            class="w-full"
                            :class="{
                                'p-invalid': categoryErrors.max_occupancy,
                            }"
                            :min="1"
                            :max="10"
                        />
                        <label for="max_occupancy">Max Occupancy</label>
                    </FloatLabel>
                    <small
                        v-if="categoryErrors.max_occupancy"
                        class="p-error"
                        >{{ categoryErrors.max_occupancy }}</small
                    >
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2"
                    >Amenities</label
                >
                <div
                    class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded"
                >
                    <div
                        v-for="amenity in availableAmenities"
                        :key="amenity"
                        class="flex items-center"
                    >
                        <Checkbox
                            :id="`amenity-${amenity}`"
                            v-model="categoryForm.amenities"
                            :value="amenity"
                            class="mr-2"
                        />
                        <label :for="`amenity-${amenity}`" class="text-sm">{{
                            amenity
                        }}</label>
                    </div>
                </div>
            </div>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-category-form')"
            />
            <Button
                :label="editingCategory ? 'Update' : 'Create'"
                icon="pi pi-check"
                @click="$emit('save-category')"
                :loading="
                    createCategoryStatus === 'loading' ||
                    updateCategoryStatus === 'loading'
                "
            />
        </template>
    </Dialog>

    <!-- Bulk Add Rooms Dialog -->
    <Dialog
        :visible="bulkAddDialogVisible"
        @update:visible="$emit('update:bulkAddDialogVisible', $event)"
        header="Bulk Add Rooms"
        :modal="true"
        :style="{ width: '600px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="space-y-6">
            <!-- Room Number Prefix and Suffix -->
            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="room_prefix" class="block text-sm font-medium text-gray-700 mb-2">
                        Room Number Prefix (Optional)
                    </label>
                    <InputText
                        id="room_prefix"
                        v-model="bulkAddForm.roomPrefix"
                        class="w-full"
                        placeholder="e.g., A, B, Room"
                    />
                    <small class="text-gray-500">Prefix added before room number</small>
                </div>
                
                <div>
                    <label for="room_suffix" class="block text-sm font-medium text-gray-700 mb-2">
                        Room Number Suffix (Optional)
                    </label>
                    <InputText
                        id="room_suffix"
                        v-model="bulkAddForm.roomSuffix"
                        class="w-full"
                        placeholder="e.g., A, B, Room"
                    />
                    <small class="text-gray-500">Suffix added after room number</small>
                </div>
            </div>
            
            <div class="text-center text-sm text-gray-600">
                Example format: <span class="font-medium">{{ formatRoomPreview(bulkAddForm.startRoomNumber) }}</span>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="start_room_number" class="block text-sm font-medium text-gray-700 mb-2">
                        Start Room Number
                    </label>
                    <InputNumber
                        id="start_room_number"
                        v-model="bulkAddForm.startRoomNumber"
                        class="w-full"
                        :class="{
                            'p-invalid': bulkAddErrors.startRoomNumber,
                        }"
                        :min="1"
                        :useGrouping="false"
                    />
                    <small
                        v-if="bulkAddErrors.startRoomNumber"
                        class="p-error"
                        >{{ bulkAddErrors.startRoomNumber }}</small
                    >
                </div>

                <div>
                    <label for="end_room_number" class="block text-sm font-medium text-gray-700 mb-2">
                        End Room Number
                    </label>
                    <InputNumber
                        id="end_room_number"
                        v-model="bulkAddForm.endRoomNumber"
                        class="w-full"
                        :class="{
                            'p-invalid': bulkAddErrors.endRoomNumber,
                        }"
                        :min="bulkAddForm.startRoomNumber"
                        :useGrouping="false"
                    />
                    <small v-if="bulkAddErrors.endRoomNumber" class="p-error">{{
                        bulkAddErrors.endRoomNumber
                    }}</small>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label for="floor" class="block text-sm font-medium text-gray-700 mb-2">
                        Floor
                    </label>
                    <Dropdown
                        id="floor"
                        v-model="bulkAddForm.floor"
                        :options="floorOptions"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        :class="{ 'p-invalid': bulkAddErrors.floor }"
                        placeholder="Select Floor"
                    />
                    <small v-if="bulkAddErrors.floor" class="p-error">{{
                        bulkAddErrors.floor
                    }}</small>
                </div>

                <div>
                    <label for="category_id" class="block text-sm font-medium text-gray-700 mb-2">
                        Room Category
                    </label>
                    <Dropdown
                        id="category_id"
                        v-model="bulkAddForm.categoryId"
                        :options="categoriesWithPrice"
                        optionLabel="displayName"
                        optionValue="id"
                        class="w-full"
                        :class="{ 'p-invalid': bulkAddErrors.categoryId }"
                        placeholder="Select Category"
                    />
                    <small v-if="bulkAddErrors.categoryId" class="p-error">{{
                        bulkAddErrors.categoryId
                    }}</small>
                </div>
            </div>

            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">
                    Preview: {{ roomCount }} rooms will be created
                    <span v-if="roomCount > 0">
                        ({{ formatRoomPreview(bulkAddForm.startRoomNumber) }} - {{ formatRoomPreview(bulkAddForm.endRoomNumber) }})
                    </span>
                </label>
            </div>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-bulk-add-dialog')"
            />
            <Button
                label="Create Rooms"
                icon="pi pi-home"
                @click="$emit('bulk-add-rooms')"
                :loading="bulkCreateRoomsStatus === 'loading'"
            />
        </template>
    </Dialog>

    <!-- Edit Room Dialog -->
    <Dialog
        :visible="roomDialogVisible"
        @update:visible="$emit('update:roomDialogVisible', $event)"
        header="Edit Room"
        :modal="true"
        :style="{ width: '500px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="space-y-6">
            <div class="text-center py-4 bg-gray-50 rounded-lg">
                <div class="text-2xl font-bold text-gray-800">
                    {{ selectedRoomForEdit?.room_number }}
                </div>
                <div class="text-gray-600">
                    Floor {{ selectedRoomForEdit?.floor }}
                </div>
            </div>

            <div>
                <FloatLabel>
                    <Dropdown
                        id="room_category"
                        v-model="roomForm.category_id"
                        :options="categories"
                        optionLabel="name"
                        optionValue="id"
                        class="w-full"
                        :class="{ 'p-invalid': roomErrors.category_id }"
                    />
                    <label for="room_category">Room Category</label>
                </FloatLabel>
                <small v-if="roomErrors.category_id" class="p-error">{{
                    roomErrors.category_id
                }}</small>
            </div>

            <div>
                <FloatLabel>
                    <Dropdown
                        id="room_status"
                        v-model="roomForm.status"
                        :options="roomStatuses"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                        :class="{ 'p-invalid': roomErrors.status }"
                    />
                    <label for="room_status">Status</label>
                </FloatLabel>
                <small v-if="roomErrors.status" class="p-error">{{
                    roomErrors.status
                }}</small>
            </div>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-room-dialog')"
            />
            <Button
                label="Update Room"
                icon="pi pi-check"
                @click="$emit('save-room')"
                :loading="updateRoomStatus === 'loading'"
                :disabled="updateRoomStatus === 'loading'"
            />
        </template>
    </Dialog>

    <!-- Bulk Status Change Dialog -->
    <Dialog
        :visible="bulkStatusDialogVisible"
        @update:visible="$emit('update:bulkStatusDialogVisible', $event)"
        header="Change Status for Selected Rooms"
        :modal="true"
        :style="{ width: '400px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="space-y-4">
            <p>
                You're about to change the status for
                {{ selectedRoomCount }} room(s).
            </p>

            <div>
                <FloatLabel>
                    <Dropdown
                        id="bulk_status"
                        v-model="bulkStatusForm.status"
                        :options="roomStatuses"
                        optionLabel="label"
                        optionValue="value"
                        class="w-full"
                    />
                    <label for="bulk_status">New Status</label>
                </FloatLabel>
            </div>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-bulk-status-dialog')"
            />
            <Button
                label="Change Status"
                icon="pi pi-sync"
                @click="$emit('update-selected-rooms-status')"
                :loading="patchRoomStatus === 'loading'"
                :disabled="patchRoomStatus === 'loading'"
            />
        </template>
    </Dialog>

    <!-- Delete Category Confirmation Dialog -->
    <Dialog
        :visible="deleteCategoryDialogVisible"
        @update:visible="$emit('update:deleteCategoryDialogVisible', $event)"
        header="Confirm Delete"
        :modal="true"
        :style="{ width: '450px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
            <span>
                Are you sure you want to delete category
                <b>{{ selectedCategory?.name }}</b
                >? This will also delete all rooms in this category. This action
                cannot be undone.
            </span>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-delete-category-confirmation')"
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                class="p-button-danger"
                @click="$emit('delete-category')"
                :loading="deleteCategoryStatus === 'loading'"
                :disabled="deleteCategoryStatus === 'loading'"
            />
        </template>
    </Dialog>

    <!-- Bulk Delete Confirmation Dialog -->
    <Dialog
        :visible="bulkDeleteDialogVisible"
        @update:visible="$emit('update:bulkDeleteDialogVisible', $event)"
        header="Confirm Delete"
        :modal="true"
        :style="{ width: '450px' }"
        :draggable="false"
        :closeOnEscape="true"
        :dismissableMask="true"
    >
        <div class="flex items-center gap-4">
            <i class="pi pi-exclamation-triangle text-3xl text-red-500"></i>
            <span>
                Are you sure you want to delete
                <b>{{ selectedRoomCount }}</b> selected room(s)? This action
                cannot be undone.
            </span>
        </div>

        <template #footer>
            <Button
                label="Cancel"
                icon="pi pi-times"
                class="p-button-text"
                @click="$emit('close-bulk-delete-confirmation')"
            />
            <Button
                label="Delete"
                icon="pi pi-trash"
                class="p-button-danger"
                @click="$emit('delete-selected-rooms')"
                :loading="deleteRoomStatus === 'loading'"
                :disabled="deleteRoomStatus === 'loading'"
            />
        </template>
    </Dialog>
</template>

<script setup lang="ts">
import { computed } from "vue";
import Dialog from "primevue/dialog";
import Button from "primevue/button";
import InputText from "primevue/inputtext";
import InputNumber from "primevue/inputnumber";
import Textarea from "primevue/textarea";
import Dropdown from "primevue/dropdown";
import Checkbox from "primevue/checkbox";

// Import shared types
import type { RoomCategory, Room as RoomType } from "~/types/room";
import { RoomCategorySchema } from "~/utils/schemas/room";

// Use shared types - RoomCategory imported above
// Local alias for component interface compatibility
type Category = RoomCategory;
type Room = RoomType;


interface RoomStatus {
    label: string;
    value: string;
}


interface Props {
    categoryDialogVisible: boolean;
    bulkAddDialogVisible: boolean;
    roomDialogVisible: boolean;
    bulkStatusDialogVisible: boolean;
    deleteCategoryDialogVisible: boolean;
    bulkDeleteDialogVisible: boolean;
    editingCategory: Category | null;
    selectedRoomForEdit: Room | null;
    selectedCategory: Category | null;
    selectedRoomCount: number;
    categoryForm: {
        name: string;
        description: string;
        base_price: number;
        max_occupancy: number;
        amenities: string[];
    };
    bulkAddForm: {
        startRoomNumber: number;
        endRoomNumber: number;
        floor: number;
        categoryId: number | null;
        roomPrefix: string;
        roomSuffix: string;
    };
    roomForm: {
        category_id: number | null;
        status: string;
    };
    bulkStatusForm: {
        status: string;
    };
    categoryErrors: Record<string, string>;
    bulkAddErrors: Record<string, string>;
    roomErrors: Record<string, string>;
    availableAmenities: string[];
    categories: Category[];
    roomStatuses: RoomStatus[];
    createCategoryStatus: string;
    updateCategoryStatus: string;
    deleteCategoryStatus: string;
    bulkCreateRoomsStatus: string;
    updateRoomStatus: string;
    patchRoomStatus: string;
    deleteRoomStatus: string;
}

const props = defineProps<Props>();

const emit = defineEmits<{
    'update:categoryDialogVisible': [value: boolean];
    'update:bulkAddDialogVisible': [value: boolean];
    'update:roomDialogVisible': [value: boolean];
    'update:bulkStatusDialogVisible': [value: boolean];
    'update:deleteCategoryDialogVisible': [value: boolean];
    'update:bulkDeleteDialogVisible': [value: boolean];
    'close-category-form': [];
    'save-category': [];
    'close-bulk-add-dialog': [];
    'bulk-add-rooms': [];
    'close-room-dialog': [];
    'save-room': [];
    'close-bulk-status-dialog': [];
    'update-selected-rooms-status': [];
    'close-delete-category-confirmation': [];
    'delete-category': [];
    'close-bulk-delete-confirmation': [];
    'delete-selected-rooms': [];
}>();

// Generate floor options (Floor 1 to Floor 100 with values 1 to 100)
const floorOptions = computed(() => {
    return Array.from({ length: 100 }, (_, i) => ({
        label: `Floor ${i + 1}`,
        value: i + 1
    }));
});

// Categories with price for dropdown display
const categoriesWithPrice = computed(() => {
    return props.categories.map(category => ({
        ...category,
        displayName: `${category.name} - ₹${category.base_price.toLocaleString('en-IN')}`
    }));
});

const roomCount = computed(() => {
    if (props.bulkAddForm.startRoomNumber > props.bulkAddForm.endRoomNumber) return 0;
    return props.bulkAddForm.endRoomNumber - props.bulkAddForm.startRoomNumber + 1;
});

// Format room number preview with prefix and suffix
const formatRoomPreview = (roomNumber: number) => {
    const prefix = props.bulkAddForm.roomPrefix.trim();
    const suffix = props.bulkAddForm.roomSuffix.trim();
    const number = roomNumber.toString();
    
    if (prefix && suffix) {
        return `${prefix}-${number}-${suffix}`;
    } else if (prefix) {
        return `${prefix}-${number}`;
    } else if (suffix) {
        return `${number}-${suffix}`;
    }
    return number;
};
</script>