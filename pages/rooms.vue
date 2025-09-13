<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-building text-primary-500"></i> Room Management
          </h1>
          <p class="text-gray-500">Manage your hotel's rooms by floor layout</p>
        </div>
        <div class="flex gap-2">
          <Button label="Add Room Category" icon="pi pi-plus" @click="openAddCategoryForm"  />
          <Button label="Bulk Add Rooms" icon="pi pi-th-large" @click="openBulkAddDialog"  />
        </div>
      </header>

      <!-- Loading State -->
      <div v-if="isRoomsLoading || isCategoriesLoading" class="flex justify-center items-center h-64">
        <ProgressSpinner />
      </div>

      <!-- Error State -->
      <div v-else-if="roomsError || categoriesError" class="p-6 bg-red-100 border-l-4 border-red-500 text-red-700 rounded">
        <p class="font-bold">Error loading rooms or categories</p>
        <p>{{ roomsError?.message || categoriesError?.message || 'An unexpected error occurred' }}</p>
        <Button label="Retry" icon="pi pi-refresh" @click="refetchAll" class="mt-3" />
      </div>

      <!-- Main Content -->
      <div v-else>
      <div class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex items-center justify-between mb-4 flex-wrap gap-4">
          <h2 class="text-xl font-semibold text-gray-800">Floor Plan</h2>
          <div class="flex items-center gap-4 flex-wrap">
            <InputText v-model="roomSearch" placeholder="Search rooms..." class="p-inputtext-sm" />
            <Dropdown v-model="roomStatusFilter" :options="roomStatuses" optionLabel="label" optionValue="value" placeholder="Filter by status" class="p-inputtext-sm" showClear />
            <div class="flex items-center gap-2">
              <span class="text-gray-600">Select Floor:</span>
              <SelectButton
                v-model="selectedFloor"
                :options="floorOptions"
                optionLabel="label"
                optionValue="value"
                aria-labelledby="floor-selector"
              />
              <Button icon="pi pi-plus" @click="addFloor" class="p-button-rounded p-button-text" />
            </div>
          </div>
        </div>

        <!-- Room Legend -->
        <div class="flex flex-wrap gap-4 mb-4">
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-300 bg-white"></div>
            <span class="text-sm text-gray-600">Available</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-300 bg-blue-100"></div>
            <span class="text-sm text-gray-600">Occupied</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-300 bg-yellow-100"></div>
            <span class="text-sm text-gray-600">Cleaning</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-300 bg-red-100"></div>
            <span class="text-sm text-gray-600">Maintenance</span>
          </div>
          <div class="flex items-center gap-2">
            <div class="w-4 h-4 rounded border border-gray-300 bg-gray-300"></div>
            <span class="text-sm text-gray-600">Out of Order</span>
          </div>
        </div>

        <!-- Room Grid -->
        <div class="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
          <div
            v-for="room in rooms"
            :key="room.id"
            @click="toggleRoomSelection(room)"
            class="relative p-3 rounded border cursor-pointer transition-all duration-200 flex flex-col items-center"
            :class="{
              'border-gray-300 bg-white hover:shadow-md': room.status === 'available',
              'border-blue-300 bg-blue-100 hover:shadow-md': room.status === 'occupied',
              'border-yellow-300 bg-yellow-100 hover:shadow-md': room.status === 'cleaning',
              'border-red-300 bg-red-100 hover:shadow-md': room.status === 'maintenance',
              'border-gray-400 bg-gray-300 hover:shadow-md': room.status === 'out_of_order',
              'ring-2 ring-primary-500 ring-offset-1': selectedRooms.includes(room.id)
            }"
          >
            <span class="font-semibold text-gray-800">{{ room.room_number }}</span>
            <span class="text-xs text-gray-600 mt-1">{{ getCategoryName(room.category) }}</span>
            <Tag
              :value="room.status.charAt(0).toUpperCase() + room.status.slice(1)"
              :severity="getStatusSeverity(room.status)"
              class="mt-2 text-xs"
            />
            <span class="text-xs text-gray-500 mt-1">Floor {{ room.floor }}</span>
            <Button icon="pi pi-pencil" class="p-button-rounded p-button-text p-button-sm absolute top-0 right-0" @click.stop="openEditRoomDialog(room)" />
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
          @page="onRoomPageChange"
          class="mt-4"
        />
      </div>
      </div>

      <!-- Selected Rooms Actions -->
      <div v-if="selectedRoomCount > 0" class="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div class="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 class="font-semibold text-gray-800">{{ selectedRoomCount }} room(s) selected</h3>
            <p class="text-sm text-gray-600">Perform bulk actions on selected rooms</p>
          </div>
          <div class="flex flex-wrap gap-2">
            <Button
              label="Change Status"
              icon="pi pi-sync"
              @click="openBulkStatusDialog"
              class="p-button-outlined"
              :loading="patchRoomStatus === 'loading'"

            />
            <Button
              label="Delete Rooms"
              icon="pi pi-trash"
              @click="openBulkDeleteConfirmation"
              class="p-button-danger p-button-outlined"
              :loading="deleteRoomStatus === 'loading'"
              :disabled="deleteRoomStatus === 'loading'"
            />
            <Button
              label="Clear Selection"
              icon="pi pi-times"
              @click="clearSelection"
              class="p-button-text"
            />
          </div>
        </div>
      </div>

      <!-- Room Categories -->
      <div class="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-xl font-semibold text-gray-800">Room Categories</h2>

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
                <Badge value="Active" severity="success" class="px-2 py-1 text-xs" />
              </div>
            </template>
            <template #content>
              <div class="space-y-2">
                <p class="text-gray-600 text-sm">{{ category.description }}</p>

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
                    @click="openEditCategoryForm(category)"
                    :loading="updateCategoryStatus === 'loading'"
                    :disabled="updateCategoryStatus === 'loading'"
                  />
                  <Button
                    icon="pi pi-trash"
                    class="p-button-rounded p-button-text p-button-sm p-button-danger"
                    @click="openDeleteCategoryConfirmation(category)"
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
          @page="onCategoryPageChange"
          class="mt-4"
        />
      </div>

    </div>
  </div>

  <!-- Add/Edit Category Dialog -->
  <Dialog
    v-model:visible="categoryDialogVisible"
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
            :class="{'p-invalid': categoryErrors.name}"
          />
          <label for="name">Category Name</label>
        </FloatLabel>
        <small v-if="categoryErrors.name" class="p-error">{{ categoryErrors.name }}</small>
      </div>

      <div>
        <FloatLabel>
          <Textarea
            id="description"
            v-model="categoryForm.description"
            rows="3"
            class="w-full"
            :class="{'p-invalid': categoryErrors.description}"
          />
          <label for="description">Description</label>
        </FloatLabel>
        <small v-if="categoryErrors.description" class="p-error">{{ categoryErrors.description }}</small>
      </div>

      <div class="grid grid-cols-2 gap-4">
        <div>
          <FloatLabel>
            <InputNumber
              id="base_price"
              v-model="categoryForm.base_price"
              class="w-full"
              :class="{'p-invalid': categoryErrors.base_price}"
              mode="currency"
              currency="INR"
              :min="0"
            />
            <label for="base_price">Base Price (₹)</label>
          </FloatLabel>
          <small v-if="categoryErrors.base_price" class="p-error">{{ categoryErrors.base_price }}</small>
        </div>

        <div>
          <FloatLabel>
            <InputNumber
              id="max_occupancy"
              v-model="categoryForm.max_occupancy"
              class="w-full"
              :class="{'p-invalid': categoryErrors.max_occupancy}"
              :min="1"
              :max="10"
            />
            <label for="max_occupancy">Max Occupancy</label>
          </FloatLabel>
          <small v-if="categoryErrors.max_occupancy" class="p-error">{{ categoryErrors.max_occupancy }}</small>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">Amenities</label>
        <div class="grid grid-cols-2 gap-2 max-h-40 overflow-y-auto p-2 border border-gray-200 rounded">
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
            <label :for="`amenity-${amenity}`" class="text-sm">{{ amenity }}</label>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeCategoryForm" />
      <Button
        :label="editingCategory ? 'Update' : 'Create'"
        icon="pi pi-check"
        @click="saveCategory"
        :loading="createCategoryStatus === 'loading' || updateCategoryStatus === 'loading'"
      />
    </template>
  </Dialog>

  <!-- Bulk Add Rooms Dialog -->
  <Dialog
    v-model:visible="bulkAddDialogVisible"
    header="Bulk Add Rooms"
    :modal="true"
    :style="{ width: '600px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="space-y-6">
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatLabel>
            <InputNumber
              id="start_room_number"
              v-model="bulkAddForm.startRoomNumber"
              class="w-full"
              :class="{'p-invalid': bulkAddErrors.startRoomNumber}"
              :min="1"
            />
            <label for="start_room_number">Start Room Number</label>
          </FloatLabel>
          <small v-if="bulkAddErrors.startRoomNumber" class="p-error">{{ bulkAddErrors.startRoomNumber }}</small>
        </div>

        <div>
          <FloatLabel>
            <InputNumber
              id="end_room_number"
              v-model="bulkAddForm.endRoomNumber"
              class="w-full"
              :class="{'p-invalid': bulkAddErrors.endRoomNumber}"
              :min="bulkAddForm.startRoomNumber"
            />
            <label for="end_room_number">End Room Number</label>
          </FloatLabel>
          <small v-if="bulkAddErrors.endRoomNumber" class="p-error">{{ bulkAddErrors.endRoomNumber }}</small>
        </div>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <FloatLabel>
            <InputNumber
              id="floor"
              v-model="bulkAddForm.floor"
              class="w-full"
              :class="{'p-invalid': bulkAddErrors.floor}"
              :min="1"
            />
            <label for="floor">Floor</label>
          </FloatLabel>
          <small v-if="bulkAddErrors.floor" class="p-error">{{ bulkAddErrors.floor }}</small>
        </div>

        <div>
          <FloatLabel>
            <Dropdown
              id="category_id"
              v-model="bulkAddForm.categoryId"
              :options="categories"
              optionLabel="name"
              optionValue="id"
              class="w-full"
              :class="{'p-invalid': bulkAddErrors.categoryId}"
              placeholder="Select Category"
            />
            <label for="category_id">Room Category</label>
          </FloatLabel>
          <small v-if="bulkAddErrors.categoryId" class="p-error">{{ bulkAddErrors.categoryId }}</small>
        </div>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Preview: {{ roomCount }} rooms will be created ({{ bulkAddForm.startRoomNumber }} - {{ bulkAddForm.endRoomNumber }})
        </label>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeBulkAddDialog" />
      <Button
        label="Create Rooms"
        icon="pi pi-home"
        @click="bulkAddRooms"
        :loading="bulkCreateRoomsStatus === 'loading'"
      />
    </template>
  </Dialog>

  <!-- Edit Room Dialog -->
  <Dialog
    v-model:visible="roomDialogVisible"
    header="Edit Room"
    :modal="true"
    :style="{ width: '500px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="space-y-6">
      <div class="text-center py-4 bg-gray-50 rounded-lg">
        <div class="text-2xl font-bold text-gray-800">{{ selectedRoomForEdit?.room_number }}</div>
        <div class="text-gray-600">Floor {{ selectedRoomForEdit?.floor }}</div>
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
            :class="{'p-invalid': roomErrors.category_id}"
          />
          <label for="room_category">Room Category</label>
        </FloatLabel>
        <small v-if="roomErrors.category_id" class="p-error">{{ roomErrors.category_id }}</small>
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
            :class="{'p-invalid': roomErrors.status}"
          />
          <label for="room_status">Status</label>
        </FloatLabel>
        <small v-if="roomErrors.status" class="p-error">{{ roomErrors.status }}</small>
      </div>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeRoomDialog" />
      <Button
        label="Update Room"
        icon="pi pi-check"
        @click="saveRoom"
        :loading="updateRoomStatus === 'loading'"
        :disabled="updateRoomStatus === 'loading'"
      />
    </template>
  </Dialog>

  <!-- Bulk Status Change Dialog -->
  <Dialog
    v-model:visible="bulkStatusDialogVisible"
    header="Change Status for Selected Rooms"
    :modal="true"
    :style="{ width: '400px' }"
    :draggable="false"
    :closeOnEscape="true"
    :dismissableMask="true"
  >
    <div class="space-y-4">
      <p>You're about to change the status for {{ selectedRoomCount }} room(s).</p>

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
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeBulkStatusDialog" />
      <Button
        label="Change Status"
        icon="pi pi-sync"
        @click="updateSelectedRoomsStatus"
        :loading="patchRoomStatus === 'loading'"
        :disabled="patchRoomStatus === 'loading'"
      />
    </template>
  </Dialog>

  <!-- Delete Category Confirmation Dialog -->
  <Dialog
    v-model:visible="deleteCategoryDialogVisible"
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
        Are you sure you want to delete category <b>{{ selectedCategory?.name }}</b>?
        This will also delete all rooms in this category. This action cannot be undone.
      </span>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeDeleteCategoryConfirmation" />
      <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteCategory" :loading="deleteCategoryStatus === 'loading'" :disabled="deleteCategoryStatus === 'loading'" />
    </template>
  </Dialog>

  <!-- Bulk Delete Confirmation Dialog -->
  <Dialog
    v-model:visible="bulkDeleteDialogVisible"
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
        Are you sure you want to delete <b>{{ selectedRoomCount }}</b> selected room(s)?
        This action cannot be undone.
      </span>
    </div>

    <template #footer>
      <Button label="Cancel" icon="pi pi-times" class="p-button-text" @click="closeBulkDeleteConfirmation" />
      <Button label="Delete" icon="pi pi-trash" class="p-button-danger" @click="deleteSelectedRooms" :loading="deleteRoomStatus === 'loading'" :disabled="deleteRoomStatus === 'loading'" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, watch } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Textarea from 'primevue/textarea';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import FloatLabel from 'primevue/floatlabel';
import Badge from 'primevue/badge';
import Tag from 'primevue/tag';
import SelectButton from 'primevue/selectbutton';
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';
import { useToast } from 'primevue/usetoast';
import { refDebounced } from '@vueuse/core';



const toast = useToast();

// State
const selectedFloor = ref<number>(1);
const roomPage = ref(1);
const categoryPage = ref(1);
const categorySearch = ref('');
const debouncedCategorySearch = refDebounced(categorySearch, 500);


const roomSearch = ref('');
const roomStatusFilter = ref('');
const debouncedRoomSearch = refDebounced(roomSearch, 500);


const roomFilters = computed(() => ({
  floor: selectedFloor.value,
  page: roomPage.value,
  search: debouncedRoomSearch.value,
  status: roomStatusFilter.value,
}));

const categoryFilters = computed(() => ({
  page: categoryPage.value,
  search: debouncedCategorySearch.value,
}));

// Data Fetching
const { data: floorsData, isLoading: isFloorsLoading, error: floorsError, refetch: refetchFloors } = useFetchHotelRoomFloors();
const {
  data: roomsData,
  isLoading: isRoomsLoading,
  error: roomsError,
  refetch: refetchRooms
} = useFetchRooms(roomFilters);
const {
  data: categoriesData,
  isLoading: isCategoriesLoading,
  error: categoriesError,
  refetch: refetchCategories
} = useFetchRoomCategories(categoryFilters);

const { mutateAsync: createCategory, status: createCategoryStatus } = useCreateRoomCategory();
const { mutateAsync: updateCategory, status: updateCategoryStatus } = useUpdateRoomCategory();
const { mutateAsync: deleteCategoryAPI, status: deleteCategoryStatus } = useDeleteRoomCategory();
const { mutateAsync: bulkCreateRooms, status: bulkCreateRoomsStatus } = useBulkCreateRooms();
const { mutateAsync: updateRoomAPI, status: updateRoomStatus } = useUpdateRoom();
const { mutateAsync: patchRoom, status: patchRoomStatus } = usePatchRoom();
const { mutateAsync: deleteRoomAPI, status: deleteRoomStatus } = useDeleteRoom();


// Computed Data
const floors = computed(() => floorsData.value || []);
const rooms = computed(() => roomsData.value?.results || []);
const totalRooms = computed(() => roomsData.value?.count || 0);
const categories = computed(() => categoriesData.value?.results || []);
const totalCategories = computed(() => categoriesData.value?.count || 0);

const floorOptions = computed(() => {
  if (!floors.value.length) return [{ label: 'Floor 1', value: 1 }];
  return floors.value.map(floor => ({ label: `Floor ${floor}`, value: floor }));
});

const getCategoryName = (categoryId: number) => {
  return categories.value.find(c => c.id === categoryId)?.name || 'Unknown';
};

const getRoomCountByCategory = (category: any) => {
  return category.room_count || 0;
};

const getStatusSeverity = (status: string) => {
  const severityMap: Record<string, string> = {
    'available': 'success',
    'occupied': 'info',
    'cleaning': 'warning',
    'maintenance': 'warning',
    'out_of_order': 'danger'
  };
  return severityMap[status] || 'secondary';
};

const selectedRoomCount = computed(() => selectedRooms.value.length);

const roomCount = computed(() => {
  if (bulkAddForm.startRoomNumber > bulkAddForm.endRoomNumber) return 0;
  return bulkAddForm.endRoomNumber - bulkAddForm.startRoomNumber + 1;
});


// Room statuses
const roomStatuses = [
  { label: 'Available', value: 'available' },
  { label: 'Occupied', value: 'occupied' },
  { label: 'Cleaning', value: 'cleaning' },
  { label: 'Maintenance', value: 'maintenance' },
  { label: 'Out of Order', value: 'out_of_order' }
];

// Available amenities
const availableAmenities = [
  'WiFi', 'TV', 'Smart TV', 'Mini Fridge', 'Mini Bar', 'Coffee Maker',
  'Balcony', 'Room Service', 'Safe', 'Hair Dryer', 'Iron', 'Bathrobe',
  'Jacuzzi', 'Swimming Pool Access', 'Gym Access', 'Parking', 'Breakfast Included'
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
  name: '',
  description: '',
  base_price: 0,
  max_occupancy: 2,
  amenities: [] as string[]
});

const bulkAddForm = reactive({
  startRoomNumber: 100,
  endRoomNumber: 110,
  floor: 1,
  categoryId: null
});

const roomForm = reactive({
  category_id: null,
  status: 'available'
});

const bulkStatusForm = reactive({
  status: 'available'
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
  roomForm.category_id = room.category;
  roomForm.status = room.status;
  roomDialogVisible.value = true;
}


const clearSelection = () => {
  selectedRooms.value = [];
};

// Category form actions
const openAddCategoryForm = () => {
  editingCategory.value = null;
  categoryForm.name = '';
  categoryForm.description = '';
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
    categoryErrors.value.name = 'Category name is required';
  }

  if (categoryForm.base_price <= 0) {
    categoryErrors.value.base_price = 'Base price must be greater than 0';
  }

  if (categoryForm.max_occupancy <= 0) {
    categoryErrors.value.max_occupancy = 'Max occupancy must be greater than 0';
  }

  if (Object.keys(categoryErrors.value).length > 0) {
    return;
  }

  try {
    if (editingCategory.value) {
      await updateCategory({
        id: editingCategory.value.id,
        ...categoryForm
      });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Category updated successfully',
        life: 3000
      });
    } else {
      await createCategory({ ...categoryForm });
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Category created successfully',
        life: 3000
      });
    }

    await refetchCategories();
    closeCategoryForm();
  } catch (err: any) {
    console.error('Error saving category:', err);
    const errorMsg = err.response?._data?.detail || 'Failed to save category';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000
    });
  }
};

// Bulk add actions
const openBulkAddDialog = () => {
  bulkAddForm.floor = selectedFloor.value;
  bulkAddForm.categoryId = categories.value.length > 0 ? categories.value[0].id : null;
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
    bulkAddErrors.value.startRoomNumber = 'Start room number must be positive';
  }

  if (bulkAddForm.endRoomNumber <= 0) {
    bulkAddErrors.value.endRoomNumber = 'End room number must be positive';
  }

  if (bulkAddForm.startRoomNumber > bulkAddForm.endRoomNumber) {
    bulkAddErrors.value.endRoomNumber = 'End room number must be greater than start';
  }

  if (bulkAddForm.floor <= 0) {
    bulkAddErrors.value.floor = 'Floor must be positive';
  }

  if (!bulkAddForm.categoryId) {
    bulkAddErrors.value.categoryId = 'Category is required';
  }

  if (Object.keys(bulkAddErrors.value).length > 0) {
    return;
  }

  try {
    const bulkData = {
      category: bulkAddForm.categoryId,
      floor: bulkAddForm.floor,
      start_number: bulkAddForm.startRoomNumber.toString(),
      end_number: bulkAddForm.endRoomNumber.toString()
    };

    await bulkCreateRooms(bulkData);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Rooms created successfully',
      life: 3000
    });

    await refetchRooms();
    await refetchFloors();
    closeBulkAddDialog();
  } catch (err: any) {
    console.error('Error creating rooms:', err);
    const errorMsg = err.response?._data?.detail || 'Failed to create rooms';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000
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
    roomErrors.value.category_id = 'Category is required';
  }

  if (!roomForm.status) {
    roomErrors.value.status = 'Status is required';
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
      floor: selectedRoomForEdit.value.floor
    });

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Room updated successfully',
      life: 3000
    });

    await refetchRooms();
    closeRoomDialog();
  } catch (err: any) {
    console.error('Error updating room:', err);
    const errorMsg = err.response?._data?.detail || 'Failed to update room';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000
    });
  }
};

// Bulk status actions
const openBulkStatusDialog = () => {
  bulkStatusForm.status = 'available';
  bulkStatusDialogVisible.value = true;
};

const closeBulkStatusDialog = () => {
  bulkStatusDialogVisible.value = false;
};

const updateSelectedRoomsStatus = async () => {
  try {
    const updatePromises = selectedRooms.value.map(roomId =>
      patchRoom({
        id: roomId,
        status: bulkStatusForm.status
      })
    );

    await Promise.all(updatePromises);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Room statuses updated successfully',
      life: 3000
    });

    await refetchRooms();
    clearSelection();
    closeBulkStatusDialog();
  } catch (err: any) {
    console.error('Error updating room statuses:', err);
    const errorMsg = err.response?._data?.detail || 'Failed to update room statuses';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000
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
        severity: 'success',
        summary: 'Success',
        detail: 'Category deleted successfully',
        life: 3000
      });

      await refetchAll();
      closeDeleteCategoryConfirmation();
    } catch (err: any) {
      console.error('Error deleting category:', err);
      const errorMsg = err.response?._data?.detail || 'Failed to delete category';
      toast.add({
        severity: 'error',
        summary: 'Error',
        detail: errorMsg,
        life: 5000
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
    const deletePromises = selectedRooms.value.map(roomId =>
      deleteRoomAPI(roomId)
    );

    await Promise.all(deletePromises);

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Rooms deleted successfully',
      life: 3000
    });

    await refetchRooms();
    clearSelection();
    closeBulkDeleteConfirmation();
  } catch (err: any) {
    console.error('Error deleting rooms:', err);
    const errorMsg = err.response?._data?.detail || 'Failed to delete rooms';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: errorMsg,
      life: 5000
    });
  }
};

// Floor actions
const addFloor = () => {
  const maxFloor = floors.value.length > 0
    ? Math.max(...floors.value)
    : 0;
  selectedFloor.value = maxFloor + 1;
};

// Pagination
const onRoomPageChange = (event: any) => {
  roomPage.value = event.page + 1;
};

const onCategoryPageChange = (event: any) => {
  categoryPage.value = event.page + 1;
};

watch(roomStatusFilter, () => {
  refetchRooms();
});


// Helper functions
const refetchAll = async () => {
  await Promise.all([
    refetchFloors(),
    refetchRooms(),
    refetchCategories()
  ]);
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
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

.p-error {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
