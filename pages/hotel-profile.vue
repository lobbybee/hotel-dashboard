<template>
  <div class="min-h-screen bg-gray-50">
    <Toast />
    
    <!-- Page Header -->
    <div class="bg-white border-b border-gray-200">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div class="flex justify-between items-start">
          <div>
            <h1 class="text-3xl font-bold text-gray-900 mb-2">Hotel Profile</h1>
            <p class="text-gray-600">Manage your hotel's information and settings</p>
          </div>
        </div>
      </div>
    </div>

    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <!-- Status Cards Row -->
      <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <HotelQRCode :hotel="hotel" @verify-profile="verifyProfile" />
        <HotelStatusCard :hotel="hotel" />
        <!-- Third card space - can be used for future features -->
        <!-- <div class="bg-white rounded-lg border border-gray-200 p-6 flex items-center justify-center">
          <div class="text-center text-gray-400">
            <i class="pi pi-plus text-2xl mb-2 block"></i>
            <p class="text-sm">Future Feature</p>
          </div>
        </div> -->
      </div>

      <!-- Main Content Grid -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        <!-- Left Column - Basic Information -->
        <HotelBasicInfo
          v-model:hotel-form="hotelForm"
          :errors="errors"
        />

        <!-- Right Column - Operational Settings -->
        <HotelOperationalSettings
          v-model:hotel-form="hotelForm"
          :errors="errors"
        />
      </div>

      <!-- Documents Section - Full Width -->
      <div class="mb-8">
        <HotelDocuments
          :hotel="hotel"
          @upload-document="uploadDocument"
          @update-document="updateDocument"
          @open-document="openDocument"
        />
      </div>

      <!-- Save Button -->
      <div class="flex justify-center">
        <Button
          label="Save Changes"
          icon="pi pi-check"
          :loading="isUpdateLoading"
          @click="saveHotelProfile"
        />
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { z } from 'zod';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import { useToast } from 'primevue/usetoast';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Badge from 'primevue/badge';
import FloatLabel from 'primevue/floatlabel';
import Panel from 'primevue/panel';
import Toast from 'primevue/toast';
import HotelProfileHeader from '~/components/Hotel/HotelProfileHeader.vue';
import HotelStatusCard from '~/components/Hotel/HotelStatusCard.vue';
import HotelBasicInfo from '~/components/Hotel/HotelBasicInfo.vue';
import HotelOperationalSettings from '~/components/Hotel/HotelOperationalSettings.vue';
import HotelDocuments from '~/components/Hotel/HotelDocuments.vue';
import HotelQRCode from '~/components/Hotel/HotelQRCode.vue';

const authStore = useAuthStore();
const { hotelId } = storeToRefs(authStore);

// Initialize toast service
const toast = useToast();

const { data: hotel, isLoading: isHotelLoading, error: hotelError, refetch: refetchHotel  } = useFetchHotel(hotelId);
const { mutate: updateHotelProfile, isPending: isUpdateLoading } = usePatchHotel();
const { mutate: uploadHotelDocument, isPending: isUploadLoading } = useUploadHotelDocument();
const { mutate: updateHotelDocument, isPending: isUpdateDocumentLoading } = useUpdateHotelDocument();

const hotelFormSchema = z.object({
  name: z.string().min(3, 'Hotel name must be at least 3 characters').max(200),
  description: z.string().optional(),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required').max(100),
  state: z.string().min(2, 'State is required').max(100),
  country: z.string().min(2, 'Country is required').max(100),
  pincode: z.string().min(5, 'Valid pincode is required').max(10),
  phone: z.string().min(10, 'Valid phone number is required').max(15),
  email: z.string().email('Invalid email address'),
  check_in_time: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Invalid time format (HH:MM)'),
  time_zone: z.string().min(2, 'Time zone is required').max(50),
  wifi_password: z.string().max(100).optional(),
});

const hotelForm = ref({
  name: '',
  description: '',
  address: '',
  city: '',
  state: '',
  country: '',
  pincode: '',
  phone: '',
  email: '',
  check_in_time: '14:00',
  time_zone: 'UTC',
  wifi_password: ''
});

const errors = ref<Record<string, string>>({});

// Refs for file uploaders
const ownerIdUploader = ref();

watch(hotel, (newHotelData) => {
  if (newHotelData) {
    // Format check_in_time to HH:MM format if it's in HH:MM:SS format
    let checkInTime = newHotelData.check_in_time || '14:00';
    if (checkInTime && checkInTime.includes(':')) {
      const timeParts = checkInTime.split(':');
      if (timeParts.length >= 2) {
        checkInTime = `${timeParts[0]}:${timeParts[1]}`;
      }
    }

    hotelForm.value = {
      name: newHotelData.name || '',
      description: newHotelData.description || '',
      address: newHotelData.address || '',
      city: newHotelData.city || '',
      state: newHotelData.state || '',
      country: newHotelData.country || '',
      pincode: newHotelData.pincode || '',
      phone: newHotelData.phone || '',
      email: newHotelData.email || '',
      check_in_time: checkInTime,
      time_zone: newHotelData.time_zone || 'UTC',
      wifi_password: newHotelData.wifi_password || ''
    };
  }
}, { immediate: true, deep: true });

const saveHotelProfile = async () => {
  errors.value = {};
  const result = hotelFormSchema.safeParse(hotelForm.value);

  if (!result.success) {
    const fieldErrors = result.error.flatten().fieldErrors;
    const newErrors: Record<string, string> = {};
    const errorMessages: string[] = [];
    
    for (const key in fieldErrors) {
        if (fieldErrors[key]) {
            newErrors[key] = fieldErrors[key]![0];
            errorMessages.push(`${key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' ')}: ${fieldErrors[key]![0]}`);
        }
    }
    
    errors.value = newErrors;
    
    // Show validation error toast
    toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: 'Please fix the errors in the form',
        life: 5000
    });
    
    return;
  }

  try {
    await updateHotelProfile({ id: hotelId.value, ...result.data });
    
    // Show success toast
    toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Hotel profile updated successfully',
        life: 3000
    });
    
    // Refresh hotel data
    refetchHotel();
  } catch (error) {
    // Show error toast
    toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update hotel profile. Please try again.',
        life: 5000
    });
    
    console.error("Failed to update hotel profile:", error);
  }
};

const uploadDocument = async (payload: { document_type: string, document_file: File }) => {
  try {
    await uploadHotelDocument(payload);

    // Show success toast
    toast.add({
        severity: 'success',
        summary: 'Document Uploaded',
        detail: `${payload.document_type.charAt(0).toUpperCase() + payload.document_type.slice(1)} uploaded successfully`,
        life: 3000
    });

    // Small delay to ensure server processing
    await new Promise(resolve => setTimeout(resolve, 500));

    // Refresh hotel data to show updated documents
    await refetchHotel();
  } catch (error) {
    // Show error toast
    toast.add({
        severity: 'error',
        summary: 'Upload Failed',
        detail: `Failed to upload ${payload.document_type}. Please try again.`,
        life: 5000
    });
    
    console.error(`Failed to upload ${payload.document_type}:`, error);
  }
};

const downloadQR = () => {
  // This function is now handled by the HotelQRCode component
  // The component will generate and download a high-quality QR code
  console.log('Download QR requested - handled by HotelQRCode component');
};

const verifyProfile = () => {
  // This function would typically trigger a verification process
  console.log('Verify profile requested');
  // For now, we'll just show an alert, but in a real app this would trigger the verification flow
  alert('Profile verification would be initiated here. Please contact support to verify your hotel.');
};

const updateDocument = async (payload: { id: string, document_file: File }) => {
  try {
    await updateHotelDocument(payload);

    // Show success toast
    toast.add({
        severity: 'success',
        summary: 'Document Updated',
        detail: 'Document updated successfully',
        life: 3000
    });

    // Refresh hotel data to show updated documents
    refetchHotel();
  } catch (error) {
    // Show error toast
    toast.add({
        severity: 'error',
        summary: 'Update Failed',
        detail: 'Failed to update document. Please try again.',
        life: 5000
    });
    
    console.error(`Failed to update document:`, error);
  }
};

const openDocument = (document: any) => {
  if (document && document.document_file_url) {
    window.open(document.document_file_url, '_blank');
  }
};

onMounted(() => {
  refetchHotel();
});
</script>

<style scoped>
/* Modern design following the design system */
/* No custom styles needed - using Tailwind classes for consistency */

/* PrimeVue error styling override */
:deep(.p-error) {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}

/* PrimeVue Panel customizations */
:deep(.p-panel-header) {
  padding: 1rem 1.5rem;
  border-bottom: 1px solid #e5e7eb;
}
:deep(.p-panel-content) {
  padding: 0;
}
:deep(.p-panel-toggler) {
  margin-left: auto;
}
</style>
