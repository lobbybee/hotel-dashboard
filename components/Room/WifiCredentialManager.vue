<template>
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <!-- Header -->
        <div class="flex justify-between items-center mb-6">
            <div>
                <h2 class="text-xl font-semibold text-gray-800 flex items-center gap-2">
                    <i class="pi pi-wifi text-primary-500"></i>
                    WiFi Credentials Management
                </h2>
                <p class="text-gray-500 text-sm mt-1">Manage WiFi networks for different floors and room categories</p>
            </div>
            <Button
                label="Add WiFi Network"
                icon="pi pi-plus"
                @click="openAddDialog"
                size="small"
            />
        </div>

        <!-- Filters -->
        <div v-if="filters" class="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Search</label>
                <InputText
                    v-model="filters.search"
                    placeholder="Search network name..."
                    class="w-full"
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                <Dropdown
                    v-model="filters.floor"
                    :options="floorOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="All Floors"
                    class="w-full"
                    showClear
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Room Category</label>
                <Dropdown
                    v-model="filters.room_category"
                    :options="categoryOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="All Categories"
                    class="w-full"
                    showClear
                />
            </div>
            <div>
                <label class="block text-sm font-medium text-gray-700 mb-2">Status</label>
                <Dropdown
                    v-model="filters.is_active"
                    :options="statusOptions"
                    optionLabel="label"
                    optionValue="value"
                    placeholder="All Status"
                    class="w-full"
                    showClear
                />
            </div>
        </div>

        <!-- Loading State -->
        <div v-if="isLoading" class="flex justify-center items-center h-32">
            <ProgressSpinner />
        </div>

        <!-- Error State -->
        <div
            v-else-if="error"
            class="p-4 bg-red-100 border-l-4 border-red-500 text-red-700 rounded"
        >
            <p class="font-bold">Error loading WiFi credentials</p>
            <p>{{ error?.message || "An unexpected error occurred" }}</p>
            <Button
                label="Retry"
                icon="pi pi-refresh"
                @click="() => refetch()"
                class="mt-2"
                size="small"
            />
        </div>

        <!-- Credentials List -->
        <div v-else-if="wifiCredentials">
            <div v-if="!wifiCredentials.results || !wifiCredentials.results.length" class="text-center py-8 text-gray-500">
                <i class="pi pi-wifi text-4xl mb-2"></i>
                <p>No WiFi credentials found</p>
            </div>

            <div v-else class="space-y-3">
                <div
                    v-for="credential in wifiCredentials.results"
                    :key="credential.id"
                    class="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                    <div class="flex justify-between items-start">
                        <div class="flex-1">
                            <div class="flex items-center gap-3 mb-2">
                                <h3 class="font-semibold text-gray-800">{{ credential.network_name }}</h3>
                                <Tag
                                    :value="credential.is_active ? 'Active' : 'Inactive'"
                                    :severity="credential.is_active ? 'success' : 'secondary'"
                                    size="small"
                                />
                            </div>
                            
                            <div class="flex items-center gap-4 text-sm text-gray-600 mb-2">
                                <span class="flex items-center gap-1">
                                    <i class="pi pi-key"></i>
                                    <span
                                        class="font-mono bg-gray-100 px-2 py-1 rounded cursor-pointer hover:bg-gray-200"
                                        @click="copyPassword(credential.password)"
                                        title="Click to copy"
                                    >
                                        {{ credential.password }}
                                    </span>
                                </span>
                                <span v-if="credential.floor" class="flex items-center gap-1">
                                    <i class="pi pi-building"></i>
                                    Floor {{ credential.floor }}
                                </span>
                                <span v-if="credential.room_category" class="flex items-center gap-1">
                                    <i class="pi pi-home"></i>
                                    {{ credential.room_category }}
                                </span>
                            </div>

                            <div class="text-xs text-gray-500">
                                Created: {{ formatDate(credential.created_at) }}
                                <span v-if="credential.updated_at !== credential.created_at">
                                    • Updated: {{ formatDate(credential.updated_at) }}
                                </span>
                            </div>
                        </div>

                        <div class="flex items-center gap-2">
                            <Button
                                icon="pi pi-copy"
                                @click="copyPassword(credential.password)"
                                size="small"
                                text
                                rounded
                                title="Copy password"
                            />
                            <Button
                                :icon="credential.is_active ? 'pi pi-times-circle' : 'pi pi-check-circle'"
                                @click="toggleActiveStatus(credential.id)"
                                size="small"
                                text
                                rounded
                                :title="credential.is_active ? 'Deactivate' : 'Activate'"
                                :severity="credential.is_active ? 'secondary' : 'success'"
                            />
                            <Button
                                icon="pi pi-pencil"
                                @click="openEditDialog(credential)"
                                size="small"
                                text
                                rounded
                            />
                            <Button
                                icon="pi pi-trash"
                                @click="openDeleteConfirmation(credential)"
                                size="small"
                                text
                                rounded
                                severity="danger"
                            />
                        </div>
                    </div>
                </div>
            </div>

            <!-- Pagination -->
            <div v-if="wifiCredentials && wifiCredentials.count && wifiCredentials.count > pageSize" class="mt-6">
                <Paginator
                    :rows="pageSize"
                    :totalRecords="wifiCredentials.count"
                    :first="((filters.page || 1) - 1) * pageSize"
                    @page="onPageChange"
                />
            </div>
        </div>

        <!-- Add/Edit Dialog -->
        <Dialog
            v-model:visible="dialogVisible"
            :header="editingCredential ? 'Edit WiFi Network' : 'Add WiFi Network'"
            :style="{ width: '450px' }"
            modal
        >
            <form @submit.prevent="saveCredential">
                <div class="space-y-4">
                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Network Name <span class="text-red-500">*</span>
                        </label>
                        <InputText
                            v-model="form.network_name"
                            placeholder="Enter WiFi network name"
                            class="w-full"
                            :class="{ 'p-invalid': errors.network_name }"
                        />
                        <small v-if="errors.network_name" class="p-error">{{ errors.network_name }}</small>
                    </div>

                    <div>
                        <label class="block text-sm font-medium text-gray-700 mb-2">
                            Password <span class="text-red-500">*</span>
                        </label>
                        <InputText
                            v-model="form.password"
                            type="password"
                            placeholder="Enter WiFi password"
                            class="w-full"
                            :class="{ 'p-invalid': errors.password }"
                        />
                        <small v-if="errors.password" class="p-error">{{ errors.password }}</small>
                    </div>

                    <div class="grid grid-cols-2 gap-4">
                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Floor</label>
                            <InputNumber
                                v-model="form.floor"
                                placeholder="Floor number"
                                :min="1"
                                class="w-full"
                            />
                        </div>

                        <div>
                            <label class="block text-sm font-medium text-gray-700 mb-2">Room Category</label>
                            <Dropdown
                                v-model="form.room_category"
                                :options="categoryOptions"
                                optionLabel="label"
                                optionValue="value"
                                placeholder="Select category"
                                class="w-full"
                                showClear
                            />
                        </div>
                    </div>

                    <div class="flex items-center">
                        <Checkbox
                            v-model="form.is_active"
                            binary
                            inputId="is_active"
                        />
                        <label for="is_active" class="ml-2 text-sm font-medium text-gray-700">
                            Active
                        </label>
                    </div>
                </div>

                <div class="flex justify-end gap-2 mt-6">
                    <Button
                        label="Cancel"
                        @click="closeDialog"
                        text
                    />
                    <Button
                        label="Save"
                        type="submit"
                        :loading="isSaving"
                    />
                </div>
            </form>
        </Dialog>

        <!-- Delete Confirmation Dialog -->
        <Dialog
            v-model:visible="deleteDialogVisible"
            header="Delete WiFi Network"
            :style="{ width: '400px' }"
            modal
        >
            <div class="flex items-center gap-3">
                <i class="pi pi-exclamation-triangle text-2xl text-yellow-500"></i>
                <div>
                    <p class="font-medium mb-1">Delete "{{ selectedCredential?.network_name }}"?</p>
                    <p class="text-sm text-gray-600">This action cannot be undone.</p>
                </div>
            </div>

            <div class="flex justify-end gap-2 mt-4">
                <Button
                    label="Cancel"
                    @click="closeDeleteDialog"
                    text
                />
                <Button
                    label="Delete"
                    @click="deleteCredential"
                    severity="danger"
                    :loading="isDeleting"
                />
            </div>
        </Dialog>
    </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, watch, onMounted } from 'vue';
import { useToast } from 'primevue/usetoast';
import { useDebounceFn } from '@vueuse/core';

// Import types and composables
import type {
    WifiCredential,
    WifiCredentialCreateData,
    WifiCredentialUpdateData,
    WifiCredentialFilters
} from '~/composables/useWifiCredentials';

import {
    useFetchWifiCredentials,
    useCreateWifiCredential,
    useUpdateWifiCredential,
    useDeleteWifiCredential,
    useToggleWifiCredentialActive,
    useFetchAvailableFloors
} from '~/composables/useWifiCredentials';
import { useAPIHelper } from '~/composables/useAPIHelper';

// Import PrimeVue components
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Checkbox from 'primevue/checkbox';
import Tag from 'primevue/tag';
import Dialog from 'primevue/dialog';
import ProgressSpinner from 'primevue/progressspinner';
import Paginator from 'primevue/paginator';

// Props
interface Props {
    categories?: any[];
}

const props = withDefaults(defineProps<Props>(), {
    categories: () => []
});

// Toast
const toast = useToast();
const { getErrorMessage } = useAPIHelper();

// State
const pageSize = ref(10);
const dialogVisible = ref(false);
const deleteDialogVisible = ref(false);
const editingCredential = ref<WifiCredential | null>(null);
const selectedCredential = ref<WifiCredential | null>(null);
const isSaving = ref(false);
const isDeleting = ref(false);

// Filters
const filters = reactive({
    search: '',
    floor: undefined,
    room_category: '',
    is_active: undefined,
    page: 1,
    page_size: pageSize.value
} as WifiCredentialFilters);

// Debounced filters
const debouncedFilters = ref<WifiCredentialFilters>({
    ...filters,
    search: ''
});

// Data fetching
const {
    wifiCredentials,
    isLoading,
    error,
    refetch
} = useFetchWifiCredentials(debouncedFilters);

const createWifiCredentialResult = useCreateWifiCredential();
const createWifiCredential = createWifiCredentialResult.createWifiCredential;
const isCreating = createWifiCredentialResult.isLoading;

const updateWifiCredentialResult = useUpdateWifiCredential();
const updateWifiCredential = updateWifiCredentialResult.updateWifiCredential;
const isUpdating = updateWifiCredentialResult.isLoading;

const deleteWifiCredentialResult = useDeleteWifiCredential();
const deleteWifiCredential = deleteWifiCredentialResult.deleteWifiCredential;
const isDeletingAPI = deleteWifiCredentialResult.isLoading;

const toggleActiveResult = useToggleWifiCredentialActive();
const toggleActive = toggleActiveResult.toggleActive;
const isToggling = toggleActiveResult.isLoading;

// Form
const form = reactive<WifiCredentialCreateData & { id?: number }>({
    network_name: '',
    password: '',
    floor: undefined,
    room_category: '',
    is_active: true
});

const errors = ref<Record<string, string>>({});

// Options
const floorOptions = computed(() => {
    const floors = Array.from({ length: 20 }, (_, i) => i + 1); // 1-20 floors
    return floors.map(floor => ({
        label: `Floor ${floor}`,
        value: floor
    }));
});

const categoryOptions = computed(() => {
    return props.categories.map(category => ({
        label: category.name,
        value: category.id
    }));
});

const statusOptions = [
    { label: 'Active', value: true },
    { label: 'Inactive', value: false }
];

// Loading states
const loadingStates = computed(() => ({
    saving: isSaving.value,
    deleting: isDeleting.value,
    creating: isCreating.value,
    updating: isUpdating.value,
    toggling: isToggling.value,
    deletingAPI: isDeletingAPI.value
}));

// Methods
const openAddDialog = () => {
    editingCredential.value = null;
    resetForm();
    errors.value = {};
    dialogVisible.value = true;
};

const openEditDialog = (credential: WifiCredential) => {
    editingCredential.value = credential;
    form.id = credential.id;
    form.network_name = credential.network_name;
    form.password = credential.password;
    form.floor = credential.floor;
    form.room_category = credential.room_category || '';
    form.is_active = credential.is_active;
    errors.value = {};
    dialogVisible.value = true;
};

const closeDialog = () => {
    dialogVisible.value = false;
    resetForm();
    errors.value = {};
};

const resetForm = () => {
    form.network_name = '';
    form.password = '';
    form.floor = undefined;
    form.room_category = undefined;
    form.is_active = true;
    form.id = undefined;
};

const validateForm = (): boolean => {
    errors.value = {};

    if (!form.network_name.trim()) {
        errors.value.network_name = 'Network name is required';
    }

    if (!form.password.trim()) {
        errors.value.password = 'Password is required';
    } else if (form.password.length < 8) {
        errors.value.password = 'Password must be at least 8 characters';
    }

    return Object.keys(errors.value).length === 0;
};

const saveCredential = async () => {
    if (!validateForm()) {
        return;
    }

    isSaving.value = true;

    try {
        if (editingCredential.value && form.id) {
            await updateWifiCredential({
                id: form.id,
                data: {
                    network_name: form.network_name,
                    password: form.password,
                    floor: form.floor,
                    room_category: form.room_category,
                    is_active: form.is_active
                }
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'WiFi network updated successfully',
                life: 3000
            });
        } else {
            await createWifiCredential({
                network_name: form.network_name,
                password: form.password,
                floor: form.floor,
                room_category: form.room_category,
                is_active: form.is_active
            });
            toast.add({
                severity: 'success',
                summary: 'Success',
                detail: 'WiFi network created successfully',
                life: 3000
            });
        }

        await refetch();
        closeDialog();
    } catch (err: any) {
        console.error('Error saving WiFi credential:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err),
            life: 5000
        });
    } finally {
        isSaving.value = false;
    }
};

const openDeleteConfirmation = (credential: WifiCredential) => {
    selectedCredential.value = credential;
    deleteDialogVisible.value = true;
};

const closeDeleteDialog = () => {
    deleteDialogVisible.value = false;
    selectedCredential.value = null;
};

const deleteCredential = async () => {
    if (!selectedCredential.value) return;

    isDeleting.value = true;

    try {
        await deleteWifiCredential(selectedCredential.value.id);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'WiFi network deleted successfully',
            life: 3000
        });

        await refetch();
        closeDeleteDialog();
    } catch (err: any) {
        console.error('Error deleting WiFi credential:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err),
            life: 5000
        });
    } finally {
        isDeleting.value = false;
    }
};

const copyPassword = async (password: string) => {
    try {
        await navigator.clipboard.writeText(password);
        toast.add({
            severity: 'success',
            summary: 'Copied',
            detail: 'Password copied to clipboard',
            life: 2000
        });
    } catch (err) {
        console.error('Failed to copy password:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: 'Failed to copy password',
            life: 3000
        });
    }
};

const toggleActiveStatus = async (credentialId: number) => {
    try {
        await toggleActive(credentialId);
        toast.add({
            severity: 'success',
            summary: 'Success',
            detail: 'WiFi network status updated',
            life: 3000
        });
        await refetch();
    } catch (err: any) {
        console.error('Error toggling WiFi status:', err);
        toast.add({
            severity: 'error',
            summary: 'Error',
            detail: getErrorMessage(err),
            life: 5000
        });
    }
};

const onPageChange = (event: any) => {
    filters.page = event.page + 1;
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

// Watch for filter changes
watch(
    () => ({
        search: filters.search,
        floor: filters.floor,
        room_category: filters.room_category,
        is_active: filters.is_active
    }),
    useDebounceFn((newFilters) => {
        filters.page = 1;
        debouncedFilters.value = {
            ...filters,
            search: (newFilters.search || '').trim()
        };
    }, 300),
    { deep: true }
);
</script>

<style scoped>
.p-error {
    display: block;
    margin-top: 0.25rem;
    color: #ef4444;
    font-size: 0.875rem;
}

.cursor-pointer {
    cursor: pointer;
}

.transition-colors {
    transition: background-color 0.2s ease;
}
</style>