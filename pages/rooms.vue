<template>
    <div class="p-6 bg-gray-50 min-h-screen">
        <div class="max-w-7xl mx-auto space-y-6">
            <!-- Header -->
            <header id="rooms-top" class="flex justify-between items-start animate-fade-slide-down">
                <div>
                    <h1 class="text-3xl font-bold text-gray-900 mb-2">
                        Room Management
                    </h1>
                    <p class="text-gray-600">
                        Manage your hotel's rooms by floor layout
                    </p>
                </div>
                <Button
                    v-if="activeTab === 0"
                    label="Bulk Add Rooms"
                    icon="pi pi-th-large"
                    @click="openBulkAddDialog"
                />
            </header>

            <!-- Loading State -->
            <div
                v-if="(isRoomsLoading && !rooms.length) || isCategoriesLoading"
                class="flex justify-center items-center h-64"
            >
                <ProgressSpinner />
            </div>

            <!-- Error State -->
            <div
                v-else-if="(roomsError && !rooms.length) || categoriesError"
                class="p-4 bg-red-50 border border-red-200 rounded-lg"
            >
                <div class="flex items-start gap-3">
                    <i class="pi pi-exclamation-circle text-red-500 text-xl mt-1"></i>
                    <div>
                        <p class="font-medium text-red-900">Error loading rooms or categories</p>
                        <p class="text-red-700 text-sm">
                            {{
                                roomsError?.message ||
                                categoriesError?.message ||
                                "An unexpected error occurred"
                            }}
                        </p>
                        <Button
                            label="Retry"
                            icon="pi pi-refresh"
                            @click="refetchAll"
                            class="mt-3"
                        />
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div v-else>
                <TabView v-model:activeIndex="activeTab">
                    <TabPanel header="Rooms">
                        <RoomFilters
                            :roomSearch="roomSearch"
                            :roomStatusFilter="roomStatusFilter"
                            :selectedFloor="selectedFloor"
                            :floorOptions="floorOptions"
                            :roomStatuses="roomStatuses"
                            @update:roomSearch="roomSearch = $event"
                            @update:roomStatusFilter="roomStatusFilter = $event"
                            @jump-to-floor="jumpToFloor"
                        />

                        <div class="bg-white rounded border border-gray-200 p-4">
                            <RoomLegend />

                            <div class="mt-4">
                                <RoomGrid
                                    :rooms="rooms"
                                    :selectedRooms="selectedRooms"
                                    :categories="categories"
                                    :isLoading="isRoomsLoading"
                                    :hasMore="hasMoreRooms"
                                    @toggle-room-selection="toggleRoomSelection"
                                    @edit-room="openEditRoomDialog"
                                    @load-more="loadMoreRooms"
                                />
                            </div>
                        </div>

                        <!-- Selected Rooms Actions -->
                        <SelectedRoomsActions
                            v-if="selectedRoomCount > 0"
                            :selectedRoomCount="selectedRoomCount"
                            :patchRoomStatus="patchRoomStatus"
                            :deleteRoomStatus="deleteRoomStatus"
                            @bulk-status-change="openBulkStatusDialog"
                            @bulk-delete="openBulkDeleteConfirmation"
                            @clear-selection="clearSelection"
                        />
                    </TabPanel>

                    <TabPanel header="Room Categories">
                        <RoomCategories
                            :categories="categories"
                            :totalCategories="totalCategories"
                            :updateCategoryStatus="updateCategoryStatus"
                            :deleteCategoryStatus="deleteCategoryStatus"
                            @add-category="openAddCategoryForm"
                            @edit-category="openEditCategoryForm"
                            @delete-category="openDeleteCategoryConfirmation"
                            @category-page-change="onCategoryPageChange"
                        />
                    </TabPanel>

                    <TabPanel header="WiFi Credentials">
                        <RoomWifiCredentialManager :categories="categories" />
                    </TabPanel>
                </TabView>
            </div>

            <!-- All Dialogs -->
            <RoomDialogs
                v-model:categoryDialogVisible="categoryDialogVisible"
                v-model:bulkAddDialogVisible="bulkAddDialogVisible"
                v-model:roomDialogVisible="roomDialogVisible"
                v-model:bulkStatusDialogVisible="bulkStatusDialogVisible"
                v-model:deleteCategoryDialogVisible="deleteCategoryDialogVisible"
                v-model:bulkDeleteDialogVisible="bulkDeleteDialogVisible"
                :editingCategory="editingCategory"
                :selectedRoomForEdit="selectedRoomForEdit"
                :selectedCategory="selectedCategory"
                :selectedRoomCount="selectedRoomCount"
                :categoryForm="categoryForm"
                :bulkAddForm="bulkAddForm"
                :roomForm="roomForm"
                :bulkStatusForm="bulkStatusForm"
                :categoryErrors="categoryErrors"
                :bulkAddErrors="bulkAddErrors"
                :roomErrors="roomErrors"
                :availableAmenities="availableAmenities"
                :categories="categories"
                :roomStatuses="roomStatuses"
                :createCategoryStatus="createCategoryStatus"
                :updateCategoryStatus="updateCategoryStatus"
                :deleteCategoryStatus="deleteCategoryStatus"
                :bulkCreateRoomsStatus="bulkCreateRoomsStatus"
                :updateRoomStatus="updateRoomStatus"
                :patchRoomStatus="patchRoomStatus"
                :deleteRoomStatus="deleteRoomStatus"
                @close-category-form="closeCategoryForm"
                @save-category="saveCategory"
                @close-bulk-add-dialog="closeBulkAddDialog"
                @bulk-add-rooms="bulkAddRooms"
                @close-room-dialog="closeRoomDialog"
                @save-room="saveRoom"
                @close-bulk-status-dialog="closeBulkStatusDialog"
                @update-selected-rooms-status="updateSelectedRoomsStatus"
                @close-delete-category-confirmation="closeDeleteCategoryConfirmation"
                @delete-category="deleteCategory"
                @close-bulk-delete-confirmation="closeBulkDeleteConfirmation"
                @delete-selected-rooms="deleteSelectedRooms"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, nextTick } from "vue";
import { useToast } from "primevue/usetoast";
import { refDebounced } from "@vueuse/core";

// Import components
import RoomCategories from "~/components/Room/RoomCategories.vue";
import RoomFilters from "~/components/Room/RoomFilters.vue";
import RoomLegend from "~/components/Room/RoomLegend.vue";
import RoomGrid from "~/components/Room/RoomGrid.vue";
import SelectedRoomsActions from "~/components/Room/SelectedRoomsActions.vue";
import RoomDialogs from "~/components/Room/RoomDialogs.vue";
import WifiCredentialManager from "~/components/Room/WifiCredentialManager.vue";

// Import PrimeVue components
import Button from "primevue/button";
import ProgressSpinner from "primevue/progressspinner";
import TabView from "primevue/tabview";
import TabPanel from "primevue/tabpanel";


const toast = useToast();
const { getErrorMessage } = useAPIHelper();

// Import schemas for validation
import { RoomCategorySchema, RoomSchema } from '~/utils/schemas/room';



// State
const activeTab = ref(0); // 0 = Rooms, 1 = Categories, 2 = WiFi
const selectedFloor = ref<number | null>(null); // jump target only, never a filter
const categoryPage = ref(1);
const categorySearch = ref("");
const debouncedCategorySearch = refDebounced(categorySearch, 500);

const roomSearch = ref("");
const roomStatusFilter = ref("");
const debouncedRoomSearch = refDebounced(roomSearch, 2000);

const roomFilters = computed(() => ({
    search:
        debouncedRoomSearch.value.length > 1 ? debouncedRoomSearch.value : "",
    status: roomStatusFilter.value,
}));

const categoryFilters = computed(() => ({
    page: categoryPage.value,
    search: debouncedCategorySearch.value,
}));

// Data Fetching
const {
    data: floorsData,
    isLoading: isFloorsLoading,
    error: floorsError,
    refetch: refetchFloors,
} = useFetchHotelRoomFloors();
const {
    rooms,
    isLoading: isRoomsLoading,
    error: roomsError,
    hasMore: hasMoreRooms,
    loadMore: loadMoreRooms,
    reload: refetchRooms,
} = useRoomsInfinite(roomFilters);
const {
    data: categoriesData,
    isLoading: isCategoriesLoading,
    error: categoriesError,
    refetch: refetchCategories,
} = useFetchRoomCategories(categoryFilters);

const { mutateAsync: createCategory, status: createCategoryStatus } =
    useCreateRoomCategory();
const { mutateAsync: updateCategory, status: updateCategoryStatus } =
    useUpdateRoomCategory();
const { mutateAsync: deleteCategoryAPI, status: deleteCategoryStatus } =
    useDeleteRoomCategory();
const { mutateAsync: bulkCreateRooms, status: bulkCreateRoomsStatus } =
    useBulkCreateRooms();
const { mutateAsync: updateRoomAPI, status: updateRoomStatus } =
    useUpdateRoom();
const { mutateAsync: patchRoom, status: patchRoomStatus } = usePatchRoom();
const { mutateAsync: deleteRoomAPI, status: deleteRoomStatus } =
    useDeleteRoom();

// Computed Data
const floors = computed(() => floorsData.value || []);
const categories = computed(() => (categoriesData.value as any)?.results || []);
const totalCategories = computed(() => categoriesData.value?.count || 0);

const floorOptions = computed(() => [
    { label: "All", value: null },
    ...floors.value.map((floor) => ({ label: `${floor}`, value: floor })),
]);

const selectedRoomCount = computed(() => selectedRooms.value.length);

// Room statuses
const roomStatuses = [
    { label: "Available", value: "available" },
    { label: "Occupied", value: "occupied" },
    { label: "Cleaning", value: "cleaning" },
    { label: "Maintenance", value: "maintenance" },
    { label: "Out of Order", value: "out_of_order" },
];

// Available amenities
const availableAmenities = [
    "WiFi",
    "TV",
    "Smart TV",
    "Mini Fridge",
    "Mini Bar",
    "Coffee Maker",
    "Balcony",
    "Room Service",
    "Safe",
    "Hair Dryer",
    "Iron",
    "Bathrobe",
    "Jacuzzi",
    "Swimming Pool Access",
    "Gym Access",
    "Parking",
    "Breakfast Included",
];

// State variables
const selectedRoomForEdit = ref<any>(null);
const selectedCategory = ref<any>(null);
const selectedRooms = ref<number[]>([]);
const editingCategory = ref<any>(null);

// Dialog visibility
const categoryDialogVisible = ref(false);
const bulkAddDialogVisible = ref(false);
const roomDialogVisible = ref(false);
const bulkStatusDialogVisible = ref(false);
const deleteCategoryDialogVisible = ref(false);
const bulkDeleteDialogVisible = ref(false);

// Forms
const categoryForm = reactive({
    name: "",
    description: "",
    base_price: 0,
    max_occupancy: 2,
    amenities: [] as string[],
});

const bulkAddForm = reactive({
    startRoomNumber: 100,
    endRoomNumber: 110,
    floor: 1,
    categoryId: null,
    roomPrefix: '',
    roomSuffix: '',
});

const roomForm = reactive({
    category_id: null,
    status: "available",
});

const bulkStatusForm = reactive({
    status: "available",
});

// Form errors
const categoryErrors = ref<Record<string, string>>({});
const bulkAddErrors = ref<Record<string, string>>({});
const roomErrors = ref<Record<string, string>>({});

// Room selection functions
const toggleRoomSelection = (room: any) => {
    const index = selectedRooms.value.indexOf(room.id);
    if (index === -1) {
        selectedRooms.value.push(room.id);
    } else {
        selectedRooms.value.splice(index, 1);
    }
};

const openEditRoomDialog = (room: any) => {
    selectedRoomForEdit.value = room;
    roomForm.category_id = room.category.id;
    roomForm.status = room.status;
    roomDialogVisible.value = true;
};

const clearSelection = () => {
    selectedRooms.value = [];
};

// Category form actions
const openAddCategoryForm = () => {
    editingCategory.value = null;
    categoryForm.name = "";
    categoryForm.description = "";
    categoryForm.base_price = 0;
    categoryForm.max_occupancy = 2;
    categoryForm.amenities = [];
    categoryErrors.value = {};
    categoryDialogVisible.value = true;
};

const openEditCategoryForm = (category: any) => {
    editingCategory.value = category;
    categoryForm.name = category.name;
    categoryForm.description = category.description;
    categoryForm.base_price = category.base_price;
    categoryForm.max_occupancy = category.max_occupancy;
    categoryForm.amenities = [...category.amenities];
    categoryErrors.value = {};
    categoryDialogVisible.value = true;
};

const closeCategoryForm = () => {
    categoryDialogVisible.value = false;
};

const saveCategory = async () => {
    // Form validation
    categoryErrors.value = {};

    if (!categoryForm.name.trim()) {
        categoryErrors.value.name = "Category name is required";
    }

    if (categoryForm.base_price <= 0) {
        categoryErrors.value.base_price = "Base price must be greater than 0";
    }

    if (categoryForm.max_occupancy <= 0) {
        categoryErrors.value.max_occupancy =
            "Max occupancy must be greater than 0";
    }

    if (Object.keys(categoryErrors.value).length > 0) {
        return;
    }

    try {
        if (editingCategory.value) {
            await updateCategory({
                id: editingCategory.value.id,
                ...categoryForm,
            });
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Category updated successfully",
                life: 3000,
            });
        } else {
            await createCategory({ ...categoryForm });
            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Category created successfully",
                life: 3000,
            });
        }

        await refetchCategories();
        closeCategoryForm();
    } catch (err: any) {
        console.error("Error saving category:", err);
        const errorMsg = getErrorMessage(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMsg,
            life: 5000,
        });
    }
};

// Bulk add actions
const openBulkAddDialog = () => {
    bulkAddForm.floor = selectedFloor.value ?? floors.value[0] ?? 1;
    bulkAddForm.categoryId =
        categories.value.length > 0 ? categories.value[0].id : null;
    bulkAddErrors.value = {};
    bulkAddDialogVisible.value = true;
};

const closeBulkAddDialog = () => {
    bulkAddDialogVisible.value = false;
};

const bulkAddRooms = async () => {
    // Form validation
    bulkAddErrors.value = {};

    if (bulkAddForm.startRoomNumber <= 0) {
        bulkAddErrors.value.startRoomNumber =
            "Start room number must be positive";
    }

    if (bulkAddForm.endRoomNumber <= 0) {
        bulkAddErrors.value.endRoomNumber = "End room number must be positive";
    }

    if (bulkAddForm.startRoomNumber > bulkAddForm.endRoomNumber) {
        bulkAddErrors.value.endRoomNumber =
            "End room number must be greater than start";
    }

    if (bulkAddForm.floor <= 0) {
        bulkAddErrors.value.floor = "Floor must be positive";
    }

    if (!bulkAddForm.categoryId) {
        bulkAddErrors.value.categoryId = "Category is required";
    }

    if (Object.keys(bulkAddErrors.value).length > 0) {
        return;
    }

    try {
        // Format room numbers with prefix and suffix if provided
        const formatRoomNumber = (number: number) => {
            const prefix = bulkAddForm.roomPrefix.trim();
            const suffix = bulkAddForm.roomSuffix.trim();
            const numberStr = number.toString();
            
            if (prefix && suffix) {
                return `${prefix}-${numberStr}-${suffix}`;
            } else if (prefix) {
                return `${prefix}-${numberStr}`;
            } else if (suffix) {
                return `${numberStr}-${suffix}`;
            }
            return numberStr;
        };

        const bulkData = {
            category: bulkAddForm.categoryId,
            floor: bulkAddForm.floor,
            start_number: formatRoomNumber(bulkAddForm.startRoomNumber),
            end_number: formatRoomNumber(bulkAddForm.endRoomNumber),
        };

        await bulkCreateRooms(bulkData);

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Rooms created successfully",
            life: 3000,
        });

        await refetchRooms();
        await refetchFloors();
        closeBulkAddDialog();
    } catch (err: any) {
        console.error("Error creating rooms:", err);
        const errorMsg = getErrorMessage(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMsg,
            life: 5000,
        });
    }
};

// Room edit actions
const closeRoomDialog = () => {
    roomDialogVisible.value = false;
};

const saveRoom = async () => {
    if (!selectedRoomForEdit.value) return;

    roomErrors.value = {};

    if (!roomForm.category_id) {
        roomErrors.value.category_id = "Category is required";
    }

    if (!roomForm.status) {
        roomErrors.value.status = "Status is required";
    }

    if (Object.keys(roomErrors.value).length > 0) {
        return;
    }

    try {
        console.log(roomForm);
        await updateRoomAPI({
            id: selectedRoomForEdit.value.id,
            category: roomForm.category_id,
            status: roomForm.status,
            room_number: selectedRoomForEdit.value.room_number,
            floor: selectedRoomForEdit.value.floor,
        });

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Room updated successfully",
            life: 3000,
        });

        await refetchRooms();
        closeRoomDialog();
    } catch (err: any) {
        console.error("Error updating room:", err);
        const errorMsg = getErrorMessage(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMsg,
            life: 5000,
        });
    }
};

// Bulk status actions
const openBulkStatusDialog = () => {
    bulkStatusForm.status = "available";
    bulkStatusDialogVisible.value = true;
};

const closeBulkStatusDialog = () => {
    bulkStatusDialogVisible.value = false;
};

const updateSelectedRoomsStatus = async () => {
    try {
        const updatePromises = selectedRooms.value.map((roomId) =>
            patchRoom({
                id: roomId,
                status: bulkStatusForm.status,
            }),
        );

        await Promise.all(updatePromises);

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Room statuses updated successfully",
            life: 3000,
        });

        await refetchRooms();
        clearSelection();
        closeBulkStatusDialog();
    } catch (err: any) {
        console.error("Error updating room statuses:", err);
        const errorMsg = getErrorMessage(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMsg,
            life: 5000,
        });
    }
};

// Category delete actions
const openDeleteCategoryConfirmation = (category: any) => {
    selectedCategory.value = category;
    deleteCategoryDialogVisible.value = true;
};

const closeDeleteCategoryConfirmation = () => {
    deleteCategoryDialogVisible.value = false;
    selectedCategory.value = null;
};

const deleteCategory = async () => {
    if (selectedCategory.value) {
        try {
            await deleteCategoryAPI(selectedCategory.value.id);

            toast.add({
                severity: "success",
                summary: "Success",
                detail: "Category deleted successfully",
                life: 3000,
            });

            await refetchAll();
            closeDeleteCategoryConfirmation();
        } catch (err: any) {
            console.error("Error deleting category:", err);
            const errorMsg = getErrorMessage(err);
            toast.add({
                severity: "error",
                summary: "Error",
                detail: errorMsg,
                life: 5000,
            });
        }
    }
};

// Bulk delete actions
const openBulkDeleteConfirmation = () => {
    bulkDeleteDialogVisible.value = true;
};

const closeBulkDeleteConfirmation = () => {
    bulkDeleteDialogVisible.value = false;
};

const deleteSelectedRooms = async () => {
    try {
        const deletePromises = selectedRooms.value.map((roomId) =>
            deleteRoomAPI(roomId),
        );

        await Promise.all(deletePromises);

        toast.add({
            severity: "success",
            summary: "Success",
            detail: "Rooms deleted successfully",
            life: 3000,
        });

        await refetchRooms();
        clearSelection();
        closeBulkDeleteConfirmation();
    } catch (err: any) {
        console.error("Error deleting rooms:", err);
        const errorMsg = getErrorMessage(err);
        toast.add({
            severity: "error",
            summary: "Error",
            detail: errorMsg,
            life: 5000,
        });
    }
};

// Floor jump: the floor buttons scroll, they never filter. Pull pages until the
// floor is on screen, then let the browser scroll to it.
const jumpToFloor = async (floor: number | null) => {
    selectedFloor.value = floor;
    if (floor === null) {
        document.getElementById("rooms-top")?.scrollIntoView({ behavior: "smooth" });
        return;
    }

    // Bail if a pass adds nothing (e.g. loadMore no-ops because a scroll-triggered
    // page is already in flight) so this can never spin.
    while (hasMoreRooms.value && !rooms.value.some((r: any) => r.floor === floor)) {
        const before = rooms.value.length;
        await loadMoreRooms();
        if (rooms.value.length === before) break;
    }
    await nextTick();

    const target = document.getElementById(`floor-${floor}`);
    if (target) {
        target.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
        toast.add({
            severity: "info",
            summary: `Floor ${floor}`,
            detail: "No rooms on this floor match the current filters",
            life: 3000,
        });
    }
};

const onCategoryPageChange = (event: any) => {
    categoryPage.value = event.page + 1;
};

// Helper functions
const refetchAll = async () => {
    await Promise.all([refetchFloors(), refetchRooms(), refetchCategories()]);
};

onMounted(() => {
    if (!floors.value.length) {
        refetchFloors();
    }
});
</script>

<style scoped>
/* Fade up transition */
.fade-up-enter-active,
.fade-up-leave-active {
    transition: all 0.4s ease;
}
.fade-up-enter-from {
    opacity: 0;
    transform: translateY(15px);
}
.fade-up-enter-to {
    opacity: 1;
    transform: translateY(0);
}

/* Header animation */
.animate-fade-slide-down {
    animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
    0% {
        opacity: 0;
        transform: translateY(-10px);
    }
    100% {
        opacity: 1;
        transform: translateY(0);
    }
}

.p-error {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
}
</style>
