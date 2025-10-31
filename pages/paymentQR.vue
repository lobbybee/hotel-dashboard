<template>
  <div class="payment-qr-dashboard">
    <!-- Header Section -->
    <div class="header-section">
      <div class="header-content">
        <div>
          <h1 class="page-title">Payment QR Codes</h1>
          <p class="page-subtitle">Manage payment QR codes for your hotel guests</p>
        </div>
        <Button
        v-if="userRole !== 'receptionist'"
          label="Add QR Code"
          icon="pi pi-plus"
          @click="showAddModal = true"
          :rounded="true" :raised="true"
        />
      </div>
      <div class="stats-bar">
        <Tag :value="`Total: ${totalCount}`" severity="info" :rounded="true" />
        <Tag :value="`Active: ${paymentQRCodes.filter(q=>q.active).length}`" severity="success" :rounded="true" />
        <Tag :value="`Inactive: ${paymentQRCodes.filter(q=>!q.active).length}`" severity="danger" :rounded="true" />
      </div>
    </div>

    <!-- Search and Filter Section -->
    <div class="flex gap-3 items-center justify-center mb-5">
      <div class="search-bar min-w-[200px]">
        <span class="p-input-icon-left w-full flex justify-center gap-3 items-center relative">
          <i class="pi pi-search absolute right-3 " />
          <InputText
            v-model="searchQuery"
            placeholder="Search by name or UPI ID..."
            class="w-full"
            @input="handleSearch"
          />
        </span>
      </div>
      <div class="filter-controls">
        <Dropdown
          v-model="selectedFilter"
          :options="filterOptions"
          optionLabel="label"
          optionValue="value"
          placeholder="All Status"
          class="filter-dropdown"
          @change="handleFilterChange"
        />
        <Button
          icon="pi pi-refresh"
          @click="refreshData"
          outlined :rounded="true"
          v-tooltip="'Refresh'"
        />
      </div>
    </div>

    <!-- Loading State -->
    <div v-if="isLoading" class="loading-container">
      <ProgressSpinner style="width: 50px; height: 50px" strokeWidth="8" />
      <p>Loading QR codes...</p>
    </div>

    <!-- Error State -->
    <Message v-else-if="error" severity="error" :closable="false" class="error-message">
      <span>{{ error.message || 'Failed to load QR codes' }}</span>
      <Button label="Retry" @click="refreshData" text size="small" />
    </Message>

    <!-- QR Codes Grid -->
    <div v-else-if="paymentQRCodes.length > 0" class="qr-cards-grid">
      <div
        v-for="qrCode in paymentQRCodes"
        :key="qrCode.id"
        class="qr-card"
        :class="{ 'inactive': !qrCode.active }"
      >
        <div class="qr-card-header">
          <div class="qr-status-badge">
            <Tag
              :value="qrCode.active ? 'Active' : 'Inactive'"
              :severity="qrCode.active ? 'success' : 'danger'"
              :icon="qrCode.active ? 'pi pi-check-circle' : 'pi pi-times-circle'"
            />
          </div>
          <div class="qr-actions" v-if="userRole !== 'receptionist'">
            <Button
              icon="pi pi-eye"
              @click="viewQRCode(qrCode)"
              :rounded="true" text size="small"
              v-tooltip="'View Details'"
            />
            <Button
              icon="pi pi-pencil"
              @click="editQRCode(qrCode)"
              :rounded="true" text size="small"
              v-tooltip="'Edit'"
            />
            <Button
              icon="pi pi-power-off"
              @click="toggleQRStatus(qrCode)"
              :rounded="true" text size="small"
              :severity="qrCode.active ? 'warning' : 'success'"
              v-tooltip="qrCode.active ? 'Deactivate' : 'Activate'"
            />
            <Button
              icon="pi pi-trash"
              @click="deleteQRCode(qrCode)"
              :rounded="true" text size="small" severity="danger"
              v-tooltip="'Delete'"
            />
          </div>
        </div>

        <div class="qr-image-container">
          <img
            :src="qrCode.image_url"
            :alt="qrCode.name"
            @error="handleImageError"
            class="qr-image"
          />
        </div>

        <div class="qr-card-content">
          <h3 class="qr-name">{{ qrCode.name }}</h3>
          <div class="qr-details">
            <div class="qr-detail-item">
              <i class="pi pi-mobile"></i>
              <span>{{ qrCode.upi_id }}</span>
            </div>
            <div class="qr-detail-item">
              <i class="pi pi-calendar"></i>
              <span>{{ formatDate(qrCode.created_at) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Empty State -->
    <div v-else class="empty-state">
      <div class="empty-state-content">
        <i class="pi pi-qrcode empty-icon"></i>
        <h3>No QR Codes Found</h3>
        <p>{{ searchQuery || selectedFilter !== 'all' ? 'Try adjusting your search or filters' : 'Start by adding your first payment QR code' }}</p>
        <Button
          label="Add Your First QR Code"
          icon="pi pi-plus"
          @click="showAddModal = true"
          :rounded="true" :raised="true"
          v-if="!searchQuery && selectedFilter === 'all'"
        />
      </div>
    </div>

    <!-- Add/Edit Modal -->
    <Dialog
      v-model:visible="showAddModal"
      :header="isEditing ? 'Edit QR Code' : 'Add New QR Code'"
      :modal="true"
      :style="{ width: '500px' }"
      :dismissableMask="true"
    >
      <form @submit.prevent="handleSubmit" class="qr-form">
        <div class="form-field">
          <label for="name">QR Code Name *</label>
          <InputText
            id="name"
            v-model="formData.name"
            placeholder="e.g., UPI Payment, PhonePe QR"
            required
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="upi_id">UPI ID *</label>
          <InputText
            id="upi_id"
            v-model="formData.upi_id"
            placeholder="e.g., hotel@upi"
            required
            class="w-full"
          />
        </div>

        <div class="form-field">
          <label for="image">QR Code Image *</label>
          <div class="file-upload-container">
            <input
              type="file"
              id="image"
              @change="handleFileChange"
              accept="image/*"
              class="file-input"
              ref="fileInput"
            />
            <div class="file-upload-label" @click="triggerFileSelect">
              <i class="pi pi-upload"></i>
              <span>{{ formData.image ? formData.image.name : 'Choose QR Code Image' }}</span>
            </div>
          </div>
          <small class="text-muted">Upload a clear image of your QR code (PNG, JPG)</small>
        </div>

        <div class="form-field">
          <div class="form-checkbox">
            <Checkbox
              id="active"
              v-model="formData.active"
              binary
            />
            <label for="active">Active (Available for payments)</label>
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
      :style="{ width: '450px' }"
      :dismissableMask="true"
    >
      <div v-if="selectedQRCode" class="qr-view-content">
        <div class="qr-view-image">
          <img :src="selectedQRCode.image_url" :alt="selectedQRCode.name" />
        </div>
        <div class="qr-view-details">
          <h3>{{ selectedQRCode.name }}</h3>
          <div class="detail-row">
            <strong>UPI ID:</strong>
            <span>{{ selectedQRCode.upi_id }}</span>
          </div>
          <div class="detail-row">
            <strong>Status:</strong>
            <Tag
              :value="selectedQRCode.active ? 'Active' : 'Inactive'"
              :severity="selectedQRCode.active ? 'success' : 'danger'"
            />
          </div>
          <div class="detail-row">
            <strong>Created:</strong>
            <span>{{ formatDate(selectedQRCode.created_at) }}</span>
          </div>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useConfirm } from 'primevue/useconfirm';
import type { PaymentQRCode, PaymentQRCodeCreateData, PaymentQRCodeUpdateData } from '~/composables/usePaymentQRCodes';
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

// Lifecycle
onMounted(() => {
  refetch();
});
</script>

<style scoped>
.payment-qr-dashboard {
  padding: 2rem;
  background: var(--surface-ground);
  min-height: 100vh;
}

.header-section {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stats-bar {
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.page-title {
  margin: 0 0 0.5rem 0;
  color: var(--text-color);
  font-size: 2rem;
  font-weight: 700;
}

.page-subtitle {
  margin: 0;
  color: var(--text-color-secondary);
  font-size: 1rem;
}

.search-filter-section {
  background: var(--surface-card);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 2rem;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  display: flex;
  gap: 1rem;
  align-items: center;
}

.search-bar {
  flex: 1;
}

.filter-controls {
  display: flex;
  gap: 1rem;
  align-items: center;
}

.filter-dropdown {
  min-width: 150px;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 4rem;
  background: var(--surface-card);
  border-radius: 12px;
  text-align: center;
}

.error-message {
  margin-bottom: 2rem;
}

.qr-cards-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 1.5rem;
  margin-bottom: 2rem;
}

.qr-card {
  background: var(--surface-card);
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  position: relative;
}

.qr-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.12);
}

.qr-card.inactive {
  opacity: 0.7;
  background: var(--surface-ground);
}

.qr-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background: var(--surface-ground);
  border-bottom: 1px solid var(--surface-border);
}

.qr-actions {
  display: flex;
  gap: 0.25rem;
}

.qr-image-container {
  padding: 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--surface-card);
}

.qr-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-card-content {
  padding: 1.5rem;
}

.qr-name {
  margin: 0 0 1rem 0;
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--text-color);
}

.qr-details {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.qr-detail-item {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  color: var(--text-color-secondary);
  font-size: 0.9rem;
}

.qr-detail-item i {
  color: var(--primary-color);
  width: 16px;
}

.empty-state {
  background: var(--surface-card);
  border-radius: 16px;
  padding: 4rem 2rem;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

.empty-state-content h3 {
  color: var(--text-color);
  margin: 1rem 0;
}

.empty-state-content p {
  color: var(--text-color-secondary);
  margin-bottom: 2rem;
}

.empty-icon {
  font-size: 4rem;
  color: #cbd5e0;
  margin-bottom: 1rem;
}

.qr-form {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.form-field label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 600;
  color: var(--text-color);
}

.file-upload-container {
  position: relative;
}

.file-input {
  display: none;
}

.file-upload-label {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  border: 2px dashed var(--surface-border);
  border-radius: 8px;
  background: var(--surface-ground);
  cursor: pointer;
  transition: all 0.3s ease;
}

.file-upload-label:hover {
  border-color: var(--primary-color);
  background: var(--surface-hover);
}

.text-muted {
  color: var(--text-color-secondary);
  font-size: 0.875rem;
}

.form-checkbox {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.qr-view-content {
  text-align: center;
}

.qr-view-image {
  margin-bottom: 1.5rem;
}

.qr-view-image img {
  max-width: 250px;
  max-height: 250px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.qr-view-details h3 {
  color: var(--text-color);
  margin-bottom: 1.5rem;
}

.detail-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 0;
  border-bottom: 1px solid var(--surface-border);
}

.detail-row:last-child {
  border-bottom: none;
}

.detail-row strong {
  color: var(--text-color);
}

@media (max-width: 768px) {
  .payment-qr-dashboard {
    padding: 1rem;
  }

  .header-content {
    flex-direction: column;
    gap: 1rem;
    text-align: center;
  }

  .search-filter-section {
    flex-direction: column;
  }

  .filter-controls {
    width: 100%;
    justify-content: space-between;
  }

  .qr-cards-grid {
    grid-template-columns: 1fr;
  }
}
</style>
