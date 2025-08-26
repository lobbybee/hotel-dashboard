<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">
      <!-- Header -->
      <transition name="fade-up">
        <HotelProfileHeader />
      </transition>

      <!-- Hotel Status Card -->
      <transition name="fade-up">
        <HotelStatusCard v-if="hotel" :hotel="hotel" />
      </transition>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">
          <!-- Basic Information -->
          <transition name="fade-up" appear>
            <HotelBasicInfo 
              v-model:hotel-form="hotelForm" 
              :errors="errors" 
            />
          </transition>

          <!-- Operational Settings -->
          <transition name="fade-up" appear>
            <HotelOperationalSettings 
              v-model:hotel-form="hotelForm" 
              :errors="errors" 
            />
          </transition>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Documents -->
          <transition name="fade-up" appear>
            <HotelDocuments 
              :hotel="hotel" 
              @upload-document="uploadDocument"
              @update-document="updateDocument"
              @open-document="openDocument"
            />
          </transition>

          <!-- QR Code -->
          <transition name="fade-up" appear>
            <HotelQRCode 
              :hotel="hotel" 
              @downloadQR="downloadQR"
              @verifyProfile="verifyProfile"
            />
          </transition>
          
          <!-- Save Button -->
          <div class="flex justify-end">
            <Button 
              label="Save Profile" 
              icon="pi pi-check" 
              :loading="isUpdateLoading" 
              @click="saveHotelProfile" 
              class="w-full"
            />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>


<script setup lang="ts">
import { ref, onMounted, watch, computed } from 'vue';
import { z } from 'zod';
import { storeToRefs } from 'pinia';
import { useAuthStore } from '~/stores/auth';
import Card from 'primevue/card';
import Button from 'primevue/button';
import InputText from 'primevue/inputtext';
import Textarea from 'primevue/textarea';
import FileUpload from 'primevue/fileupload';
import Badge from 'primevue/badge';
import FloatLabel from 'primevue/floatlabel';
import Panel from 'primevue/panel';
import HotelProfileHeader from '~/components/Hotel/HotelProfileHeader.vue';
import HotelStatusCard from '~/components/Hotel/HotelStatusCard.vue';
import HotelBasicInfo from '~/components/Hotel/HotelBasicInfo.vue';
import HotelOperationalSettings from '~/components/Hotel/HotelOperationalSettings.vue';
import HotelDocuments from '~/components/Hotel/HotelDocuments.vue';
import HotelQRCode from '~/components/Hotel/HotelQRCode.vue';

const authStore = useAuthStore();
const { hotelId } = storeToRefs(authStore);

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
    for (const key in fieldErrors) {
        if (fieldErrors[key]) {
            newErrors[key] = fieldErrors[key]![0];
        }
    }
    errors.value = newErrors;
    return;
  }

  try {
    await updateHotelProfile({ id: hotelId.value, ...result.data });
    // Optionally show a success message
    refetchHotel();
  } catch (error) {
    // Optionally show an error message
    console.error("Failed to update hotel profile:", error);
  }
};

const uploadDocument = async (payload: { document_type: string, document_file: File }) => {
  try {
    await uploadHotelDocument(payload);
    
    // Show success message
    console.log(`${payload.document_type} uploaded successfully`);
    
    // Small delay to ensure server processing
    await new Promise(resolve => setTimeout(resolve, 500));
    
    // Refresh hotel data to show updated documents
    await refetchHotel();
  } catch (error) {
    // Show error message
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
    
    // Show success message
    console.log(`Document updated successfully`);
    
    // Refresh hotel data to show updated documents
    refetchHotel();
  } catch (error) {
    // Show error message
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

/* Slow pulse for QR code */
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
}
.animate-pulse-slow {
  animation: pulse-slow 3s infinite;
}

/* Header animation */
.animate-fade-slide-down {
  animation: fade-slide-down 0.6s ease forwards;
}
@keyframes fade-slide-down {
  0% { opacity: 0; transform: translateY(-10px); }
  100% { opacity: 1; transform: translateY(0); }
}

/* PrimeVue Panel Customizations */
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

.p-error {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>
