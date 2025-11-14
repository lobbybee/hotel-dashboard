<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Payment QR Codes</h1>
            <p class="text-gray-600">Manage payment QR codes for your hotel guests</p>
          </div>
          <div v-if="userRole !== 'receptionist'">
            <Button
              label="Add QR Code"
              icon="pi pi-plus"
              @click="showAddModal = true"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Main Content -->
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Summary Cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
              <i class="pi pi-qrcode text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ totalCount }}</p>
              <p class="text-sm font-medium text-gray-600">Total QR Codes</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-green-50 rounded-lg flex items-center justify-center text-green-600">
              <i class="pi pi-check-circle text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ paymentQRCodes.filter(q=>q.active).length }}</p>
              <p class="text-sm font-medium text-gray-600">Active</p>
            </div>
          </div>
        </div>
        <div class="bg-white rounded-lg border border-gray-200 p-6">
          <div class="flex items-center gap-4">
            <div class="w-12 h-12 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
              <i class="pi pi-times-circle text-xl"></i>
            </div>
            <div>
              <p class="text-2xl font-bold text-gray-900">{{ paymentQRCodes.filter(q=>!q.active).length }}</p>
              <p class="text-sm font-medium text-gray-600">Inactive</p>
            </div>
          </div>
        </div>
      </div>

      <!-- Search & Filter Bar -->
      <div class="bg-white rounded-lg border border-gray-200 p-4 mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1">
            <div class="relative">
              <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <InputText
                v-model="searchQuery"
                placeholder="Search by name or UPI ID..."
                class="w-full pl-10"
                @input="handleSearch"
              />
            </div>
          </div>
          <div class="flex gap-3">
            <Dropdown
              v-model="selectedFilter"
              :options="filterOptions"
              optionLabel="label"
              optionValue="value"
              placeholder="All Status"
              class="w-full sm:w-48"
              @change="handleFilterChange"
            />
            <Button
              icon="pi pi-refresh"
              @click="refreshData"
              text
              rounded
              v-tooltip="'Refresh'"
            />
          </div>
        </div>
      </div>

      <!-- Loading State -->
      <div v-if="isLoading" class="flex flex-col items-center justify-center py-12">
        <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
        <p class="mt-4 text-gray-600">Loading QR codes...</p>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-exclamation-triangle text-red-600 text-2xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">Error Loading QR Codes</h3>
          <p class="text-gray-600 mb-4">{{ error.message || 'Failed to load QR codes' }}</p>
          <Button label="Retry" @click="refreshData" text />
        </div>
      </div>

      <!-- QR Codes Grid -->
      <div v-else-if="paymentQRCodes.length > 0" class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div
          v-for="qrCode in paymentQRCodes"
          :key="qrCode.id"
          class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200"
          :class="{ 'opacity-75': !qrCode.active }"
        >
          <div class="flex justify-between items-start mb-4 flex-wrap">
            <div>
              <Tag
                :value="qrCode.active ? 'Active' : 'Inactive'"
                :severity="qrCode.active ? 'success' : 'danger'"
                :icon="qrCode.active ? 'pi pi-check-circle' : 'pi pi-times-circle'"
                rounded
              />
            </div>
            <div class="flex gap-2">
              <!-- WhatsApp button - available for all user roles -->
              <Button
                icon="pi pi-whatsapp"
                @click="openWhatsAppDialog(qrCode)"
                text
                rounded
                size="small"
                severity="success"
                v-tooltip="'Send to WhatsApp'"
                :disabled="!qrCode.active"
              />
              <template v-if="userRole !== 'receptionist'">
                <Button
                  icon="pi pi-eye"
                  @click="viewQRCode(qrCode)"
                  text
                  rounded
                  size="small"
                  v-tooltip="'View Details'"
                />
                <Button
                  icon="pi pi-pencil"
                  @click="editQRCode(qrCode)"
                  text
                  rounded
                  size="small"
                  v-tooltip="'Edit'"
                />
                <Button
                  icon="pi pi-power-off"
                  @click="toggleQRStatus(qrCode)"
                  text
                  rounded
                  size="small"
                  :severity="qrCode.active ? 'warning' : 'success'"
                  v-tooltip="qrCode.active ? 'Deactivate' : 'Activate'"
                />
                <Button
                  icon="pi pi-trash"
                  @click="deleteQRCode(qrCode)"
                  text
                  rounded
                  size="small"
                  severity="danger"
                  v-tooltip="'Delete'"
                />
              </template>
            </div>
          </div>

          <div class="flex flex-col items-center mb-4">
            <img
              :src="qrCode.image_url"
              :alt="qrCode.name"
              @error="handleImageError"
              class="w-32 h-32 object-contain border border-gray-200 rounded-lg"
            />
          </div>

          <div class="text-center">
            <h3 class="font-semibold text-gray-900 mb-2">{{ qrCode.name }}</h3>
            <div class="space-y-1 text-sm">
              <div class="flex items-center justify-center gap-2 text-gray-600">
                <i class="pi pi-mobile"></i>
                <span>{{ qrCode.upi_id }}</span>
              </div>
              <div class="flex items-center justify-center gap-2 text-gray-600">
                <i class="pi pi-calendar"></i>
                <span>{{ formatDate(qrCode.created_at) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Empty State -->
      <div v-else class="bg-white rounded-lg border border-gray-200 p-8 text-center">
        <div class="max-w-md mx-auto">
          <div class="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
            <i class="pi pi-qrcode text-gray-400 text-2xl"></i>
          </div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">No QR Codes Found</h3>
          <p class="text-gray-600 mb-4">
            {{ searchQuery || selectedFilter !== 'all'
              ? 'Try adjusting your search or filters'
              : 'Start by adding your first payment QR code' }}
          </p>
          <Button
            v-if="!searchQuery && selectedFilter === 'all'"
            label="Add Your First QR Code"
            icon="pi pi-plus"
            @click="showAddModal = true"
          />
        </div>
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Dialog
      v-model:visible="showAddModal"
      :header="isEditing ? 'Edit QR Code' : 'Add New QR Code'"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
    >
      <form @submit.prevent="handleSubmit" class="space-y-4">
        <div>
          <label for="name" class="block text-sm font-medium text-gray-700 mb-2">QR Code Name *</label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="e.g., UPI Payment, PhonePe QR"
            required
            class="w-full"
          />
        </div>

        <div>
          <label for="upi_id" class="block text-sm font-medium text-gray-700 mb-2">UPI ID *</label>
          <InputText
            id="upi_id"
            v-model="formData.upi_id"
            placeholder="e.g., hotel@upi"
            required
            class="w-full"
          />
        </div>

        <div>
          <label for="image" class="block text-sm font-medium text-gray-700 mb-2">QR Code Image *</label>
          <div class="relative">
            <input
              type="file"
              id="image"
              @change="handleFileChange"
              accept="image/*"
              class="hidden"
              ref="fileInput"
            />
            <div
              @click="triggerFileSelect"
              class="border border-gray-300 rounded-lg p-4 cursor-pointer hover:bg-gray-50 transition-colors text-center"
            >
              <i class="pi pi-upload text-gray-400 text-2xl mb-2"></i>
              <p class="text-sm text-gray-600">
                {{ formData.image ? formData.image.name : 'Choose QR Code Image' }}
              </p>
            </div>
          </div>
          <p class="text-xs text-gray-500 mt-2">Upload a clear image of your QR code (PNG, JPG)</p>
        </div>

        <div>
          <div class="flex items-center gap-2">
            <Checkbox
              id="active"
              v-model="formData.active"
              binary
            />
            <label for="active" class="text-sm font-medium text-gray-700">Active (Available for payments)</label>
          </div>
        </div>
      </form>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeModal"
          text
        />
        <Button
          :label="isEditing ? 'Update' : 'Create'"
          icon="pi pi-check"
          @click="handleSubmit"
          :loading="isSubmitting"
        />
      </template>
    </Dialog>

    <!-- View QR Code Modal -->
    <Dialog
      v-model:visible="showViewModal"
      header="QR Code Details"
      :modal="true"
      :style="{ width: '35rem' }"
      :dismissableMask="true"
    >
      <div v-if="selectedQRCode" class="space-y-6">
        <div class="flex justify-center">
          <div class="w-48 h-48 bg-white border border-gray-200 rounded-lg p-4">
            <img
              :src="selectedQRCode.image_url"
              :alt="selectedQRCode.name"
              class="w-full h-full object-contain"
            />
          </div>
        </div>

        <div class="space-y-4">
          <h3 class="text-lg font-semibold text-gray-900">{{ selectedQRCode.name }}</h3>

          <div class="space-y-3">
            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm font-medium text-gray-600">UPI ID:</span>
              <span class="text-sm text-gray-900">{{ selectedQRCode.upi_id }}</span>
            </div>

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm font-medium text-gray-600">Status:</span>
              <Tag
                :value="selectedQRCode.active ? 'Active' : 'Inactive'"
                :severity="selectedQRCode.active ? 'success' : 'danger'"
                rounded
              />
            </div>

            <div class="flex justify-between items-center py-2 border-b border-gray-100">
              <span class="text-sm font-medium text-gray-600">Created:</span>
              <span class="text-sm text-gray-900">{{ formatDate(selectedQRCode.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </Dialog>

    <!-- Send to WhatsApp Dialog -->
    <Dialog
      v-model:visible="showWhatsAppDialog"
      header="Send QR Code to WhatsApp"
      :modal="true"
      :style="{ width: '40rem' }"
      :dismissableMask="true"
    >
      <div v-if="selectedQRForWhatsApp" class="space-y-6">
        <!-- QR Code Preview -->
        <div class="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
          <img
            :src="selectedQRForWhatsApp.image_url"
            :alt="selectedQRForWhatsApp.name"
            class="w-16 h-16 object-contain border border-gray-200 rounded"
          />
          <div>
            <h4 class="font-semibold text-gray-900">{{ selectedQRForWhatsApp.name }}</h4>
            <p class="text-sm text-gray-600">UPI: {{ selectedQRForWhatsApp.upi_id }}</p>
          </div>
        </div>

        <!-- Guest Search -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">Search Guest</label>
          <div class="relative">
            <i class="pi pi-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <InputText
              v-model="guestSearchQuery"
              placeholder="Search guest by name, email, or phone..."
              class="w-full pl-10"
              @input="searchGuests"
            />
          </div>
        </div>

        <!-- Guest Selection -->
        <div v-if="guestSearchQuery && guests?.length > 0" class="space-y-2 max-h-48 overflow-y-auto">
          <div
            v-for="guest in guests"
            :key="guest.id"
            @click="selectGuest(guest)"
            class="p-3 border border-gray-200 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
            :class="{ 'ring-2 ring-blue-500 bg-blue-50': selectedGuest?.id === guest.id }"
          >
            <div class="flex justify-between items-start">
              <div>
                <p class="font-medium text-gray-900">{{ guest.full_name }}</p>
                <p class="text-sm text-gray-600">{{ guest.email || 'No email' }}</p>
                <p class="text-sm text-gray-600">{{ guest.whatsapp_number || 'No WhatsApp number' }}</p>
                <div class="flex items-center gap-2 mt-1">
                  <Tag
                    :value="guest.status"
                    :severity="guest.status === 'demo_active' ? 'success' : 'secondary'"
                    size="small"
                  />
                  <Tag
                    v-if="guest.is_primary_guest"
                    value="Primary Guest"
                    severity="info"
                    size="small"
                  />
                  <Tag
                    v-if="guest.is_whatsapp_active"
                    icon="pi pi-whatsapp"
                    severity="success"
                    size="small"
                  />
                </div>
              </div>
              <i v-if="selectedGuest?.id === guest.id" class="pi pi-check-circle text-blue-500"></i>
            </div>
          </div>
        </div>

        <!-- Selected Guest Info -->
        <div v-if="selectedGuest" class="p-4 bg-green-50 border border-green-200 rounded-lg">
          <div class="flex items-center gap-2 text-green-800 mb-2">
            <i class="pi pi-check-circle"></i>
            <span class="font-medium">Selected Guest</span>
          </div>
          <p class="text-sm text-green-700">{{ selectedGuest.full_name }} - {{ selectedGuest.whatsapp_number }}</p>
          <div class="flex items-center gap-2 mt-1">
            <Tag
              :value="selectedGuest.status"
              :severity="selectedGuest.status === 'demo_active' ? 'success' : 'secondary'"
              size="small"
            />
            <Tag
              v-if="selectedGuest.is_whatsapp_active"
              icon="pi pi-whatsapp"
              severity="success"
              size="small"
            />
          </div>
        </div>

        <!-- No Results -->
        <div v-else-if="guestSearchQuery && !guestsLoading && (!guests || guests.length === 0)" class="text-center py-4">
          <i class="pi pi-search text-gray-400 text-2xl mb-2"></i>
          <p class="text-gray-500">No guests found matching your search</p>
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="closeWhatsAppDialog"
          text
        />
        <Button
          label="Send to WhatsApp"
          icon="pi pi-whatsapp"
          @click="sendToWhatsApp"
          :loading="isSendingWhatsApp"
          :disabled="!selectedGuest"
          severity="success"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { PaymentQRCode, PaymentQRCodeCreateData, PaymentQRCodeUpdateData } from '~/composables/usePaymentQRCodes';
import { useSendPaymentQRCodeToWhatsApp } from '~/composables/usePaymentQRCodes';
import { useListGuests } from '~/composables/checkin-manager';
import { useAuthStore } from '~/stores/auth';

// Composables
const toast = useToast();
const confirm = useConfirm();

// API Functions
const { paymentQRCodes, totalCount, isLoading, error, refetch } = useFetchPaymentQRCodes();
const { createPaymentQRCode } = useCreatePaymentQRCode();
const { updatePaymentQRCode } = useUpdatePaymentQRCode();
const { deletePaymentQRCode } = useDeletePaymentQRCode();
const { togglePaymentQRCodeActive } = useTogglePaymentQRCodeActive();
const { sendPaymentQRCodeToWhatsApp } = useSendPaymentQRCodeToWhatsApp();
const { guests, isLoading: guestsLoading, refetch: refetchGuests } = useListGuests();
const authStore = useAuthStore();
const { userRole } = storeToRefs(authStore);

// Reactive State
const searchQuery = ref('');
const selectedFilter = ref('all');
const showAddModal = ref(false);
const showViewModal = ref(false);
const isEditing = ref(false);
const isSubmitting = ref(false);
const selectedQRCode = ref<PaymentQRCode | null>(null);
const fileInput = ref<HTMLInputElement>();

// WhatsApp Dialog State
const showWhatsAppDialog = ref(false);
const guestSearchQuery = ref('');
const selectedGuest = ref<any>(null);
const selectedQRForWhatsApp = ref<PaymentQRCode | null>(null);
const isSendingWhatsApp = ref(false);

// Filter Options
const filterOptions = [
  { label: 'All Status', value: 'all' },
  { label: 'Active Only', value: 'active' },
  { label: 'Inactive Only', value: 'inactive' }
];

// Form Data
const formData = reactive<{
  name: string;
  upi_id: string;
  image: File | null;
  active: boolean;
}>({
  name: '',
  upi_id: '',
  image: null,
  active: true
});

// Computed
const currentParams = computed(() => {
  const params: any = {};
  if (searchQuery.value) params.search = searchQuery.value;
  if (selectedFilter.value === 'active') params.active = true;
  if (selectedFilter.value === 'inactive') params.active = false;
  return params;
});

// Methods
const refreshData = () => {
  refetch();
  showToast('success', 'Refreshed', 'QR codes list has been refreshed');
};

const handleSearch = () => {
  refetch(currentParams.value);
};

const handleFilterChange = () => {
  refetch(currentParams.value);
};

const viewQRCode = (qrCode: PaymentQRCode) => {
  selectedQRCode.value = qrCode;
  showViewModal.value = true;
};

const editQRCode = (qrCode: PaymentQRCode) => {
  selectedQRCode.value = qrCode;
  formData.name = qrCode.name;
  formData.upi_id = qrCode.upi_id;
  formData.active = qrCode.active;
  formData.image = null;
  isEditing.value = true;
  showAddModal.value = true;
};

const toggleQRStatus = async (qrCode: PaymentQRCode) => {
  const action = qrCode.active ? 'deactivate' : 'activate';

  confirm.require({
    message: `Are you sure you want to ${action} this QR code?`,
    header: 'Confirm Action',
    icon: 'pi pi-exclamation-triangle',
    accept: async () => {
      try {
        await togglePaymentQRCodeActive(qrCode.id);
        refetch();
        showToast('success', 'Success', `QR code ${action}d successfully`);
      } catch (error) {
        showToast('error', 'Error', `Failed to ${action} QR code`);
      }
    }
  });
};

const deleteQRCode = (qrCode: PaymentQRCode) => {
  confirm.require({
    message: `Are you sure you want to delete "${qrCode.name}"? This action cannot be undone.`,
    header: 'Delete QR Code',
    icon: 'pi pi-exclamation-triangle',
    acceptClass: 'p-button-danger',
    accept: async () => {
      try {
        await deletePaymentQRCode(qrCode.id);
        refetch();
        showToast('success', 'Deleted', 'QR code deleted successfully');
      } catch (error) {
        showToast('error', 'Error', 'Failed to delete QR code');
      }
    }
  });
};

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  if (target.files && target.files[0]) {
    formData.image = target.files[0];
  }
};

const triggerFileSelect = () => {
  fileInput.value?.click();
};

const handleSubmit = async () => {
  if (!formData.image && !isEditing.value) {
    showToast('error', 'Error', 'Please select a QR code image');
    return;
  }

  isSubmitting.value = true;

  try {
    if (isEditing.value && selectedQRCode.value) {
      const updateData: PaymentQRCodeUpdateData = {
        name: formData.name,
        upi_id: formData.upi_id,
        active: formData.active
      };

      if (formData.image) {
        updateData.image = formData.image;
      }

      await updatePaymentQRCode({ id: selectedQRCode.value.id, data: updateData });
      showToast('success', 'Updated', 'QR code updated successfully');
    } else {
      const createData: PaymentQRCodeCreateData = {
        name: formData.name,
        upi_id: formData.upi_id,
        image: formData.image!,
        active: formData.active
      };

      await createPaymentQRCode(createData);
      showToast('success', 'Created', 'QR code created successfully');
    }

    refetch();
    closeModal();
  } catch (error) {
    showToast('error', 'Error', isEditing.value ? 'Failed to update QR code' : 'Failed to create QR code');
  } finally {
    isSubmitting.value = false;
  }
};

const closeModal = () => {
  showAddModal.value = false;
  isEditing.value = false;
  selectedQRCode.value = null;
  formData.name = '';
  formData.upi_id = '';
  formData.image = null;
  formData.active = true;
  if (fileInput.value) {
    fileInput.value.value = '';
  }
};

const handleImageError = (event: Event) => {
  const target = event.target as HTMLImageElement;
  target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2Y0ZjRmNCIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBmb250LXNpemU9IjE0IiBmaWxsPSIjOTk5IiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBkeT0iLjNlbSI+SW1hZ2UgRXJyb3I8L3RleHQ+PC9zdmc+';
};

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const showToast = (severity: 'success' | 'error' | 'info' | 'warn', summary: string, detail: string) => {
  toast.add({ severity, summary, detail, life: 3000 });
};

// Debounce utility
const debounce = (func: Function, delay: number) => {
  let timeoutId: number;
  return (...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};

// WhatsApp Methods
const openWhatsAppDialog = (qrCode: PaymentQRCode) => {
  selectedQRForWhatsApp.value = qrCode;
  showWhatsAppDialog.value = true;
};

const closeWhatsAppDialog = () => {
  showWhatsAppDialog.value = false;
  selectedQRForWhatsApp.value = null;
  selectedGuest.value = null;
  guestSearchQuery.value = '';
};

// Debounced search function
const debouncedSearchGuests = debounce(() => {
  if (guestSearchQuery.value.trim()) {
    refetchGuests(guestSearchQuery.value.trim());
  } else {
    // Clear guests when search is empty
    selectedGuest.value = null;
  }
}, 3000); // 3000ms debounce

const searchGuests = debouncedSearchGuests;

const selectGuest = (guest: any) => {
  selectedGuest.value = guest;
};

const sendToWhatsApp = async () => {
  if (!selectedQRForWhatsApp.value || !selectedGuest.value) {
    showToast('error', 'Error', 'Please select a QR code and guest');
    return;
  }

  isSendingWhatsApp.value = true;

  try {
    await sendPaymentQRCodeToWhatsApp({
      qr_code_id: selectedQRForWhatsApp.value.id,
      guest_id: selectedGuest.value.id
    });

    showToast('success', 'Sent to WhatsApp', `QR code sent to ${selectedGuest.value.full_name} via WhatsApp`);
    closeWhatsAppDialog();
  } catch (error: any) {
    showToast('error', 'Error', error.message || 'Failed to send QR code to WhatsApp');
  } finally {
    isSendingWhatsApp.value = false;
  }
};

// Lifecycle
onMounted(() => {
  refetch();
});
</script>

<style scoped>
/* Modern design following the design system */
/* No custom styles needed - using Tailwind classes for consistency */
</style>
