<template>
  <div class="p-6 bg-gray-50 min-h-screen">
    <div class="max-w-7xl mx-auto space-y-8">

      <!-- Header -->
      <header class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 animate-fade-slide-down">
        <div>
          <h1 class="text-3xl font-bold text-gray-800 flex items-center gap-2">
            <i class="pi pi-building text-primary-500"></i> Hotel Profile
          </h1>
          <p class="text-gray-500">Manage your hotel’s details, documents, and verification status.</p>
        </div>
      </header>

      <!-- Hotel Status Card -->
      <transition name="fade-up">
        <Card v-if="hotel" class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
          <template #title>
            <div class="flex items-center justify-between">
              <h3 class="text-lg font-semibold flex items-center gap-2">
                <i class="pi pi-info-circle text-blue-500"></i> Hotel Status
              </h3>
              <Badge :value="hotel.status" :severity="getStatusSeverity(hotel.status)" class="px-3 py-1 text-sm" />
            </div>
          </template>
          <template #content>
            <p class="text-gray-600 leading-relaxed">
              Your hotel profile is currently <span class="font-semibold">{{ hotel.status }}</span>.
              <span v-if="hotel.status === 'pending'"> Complete your profile and upload documents for verification.</span>
              <span v-if="hotel.status === 'verified'"> Your hotel is verified and visible to customers.</span>
              <span v-if="hotel.status === 'rejected'"> Verification was rejected. Please review and resubmit.</span>
            </p>
          </template>
        </Card>
      </transition>

      <!-- Main Layout -->
      <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

        <!-- Left Column -->
        <div class="lg:col-span-2 space-y-8">

          <!-- Basic Information -->
          <transition name="fade-up" appear>
            <Panel toggleable class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <template #header>
                <div class="flex items-center gap-2 text-lg font-semibold w-full">
                  <i class="pi pi-id-card text-primary-500"></i>
                  <span>Basic Information</span>
                </div>
              </template>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div class="md:col-span-2">
                    <FloatLabel>
                      <InputText id="name" v-model="hotelForm.name" class="w-full" :class="{'p-invalid': errors.name}" />
                      <label for="name">Hotel Name</label>
                    </FloatLabel>
                    <small v-if="errors.name" class="p-error">{{ errors.name }}</small>
                  </div>
                  <div class="md:col-span-2">
                    <FloatLabel>
                      <Textarea id="description" v-model="hotelForm.description" rows="4" class="w-full" autoResize :class="{'p-invalid': errors.description}" />
                      <label for="description">Description</label>
                    </FloatLabel>
                     <small v-if="errors.description" class="p-error">{{ errors.description }}</small>
                  </div>
                  <div class="md:col-span-2">
                    <FloatLabel>
                      <InputText id="address" v-model="hotelForm.address" class="w-full" :class="{'p-invalid': errors.address}" />
                      <label for="address">Address</label>
                    </FloatLabel>
                     <small v-if="errors.address" class="p-error">{{ errors.address }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="city" v-model="hotelForm.city" class="w-full" :class="{'p-invalid': errors.city}" />
                      <label for="city">City</label>
                    </FloatLabel>
                     <small v-if="errors.city" class="p-error">{{ errors.city }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="state" v-model="hotelForm.state" class="w-full" :class="{'p-invalid': errors.state}" />
                      <label for="state">State</label>
                    </FloatLabel>
                     <small v-if="errors.state" class="p-error">{{ errors.state }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="pincode" v-model="hotelForm.pincode" class="w-full" :class="{'p-invalid': errors.pincode}" />
                      <label for="pincode">Pincode</label>
                    </FloatLabel>
                     <small v-if="errors.pincode" class="p-error">{{ errors.pincode }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="country" v-model="hotelForm.country" class="w-full" :class="{'p-invalid': errors.country}" />
                      <label for="country">Country</label>
                    </FloatLabel>
                     <small v-if="errors.country" class="p-error">{{ errors.country }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="phone" v-model="hotelForm.phone" class="w-full" :class="{'p-invalid': errors.phone}" />
                      <label for="phone">Phone</label>
                    </FloatLabel>
                     <small v-if="errors.phone" class="p-error">{{ errors.phone }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="email" v-model="hotelForm.email" type="email" class="w-full" :class="{'p-invalid': errors.email}" />
                      <label for="email">Email</label>
                    </FloatLabel>
                     <small v-if="errors.email" class="p-error">{{ errors.email }}</small>
                  </div>
                </div>
                <div class="flex justify-end mt-6">
                  <Button label="Save Basic Info" icon="pi pi-check" :loading="isUpdateLoading" @click="saveHotelProfile" />
                </div>
              </div>
            </Panel>
          </transition>

          <!-- Operational Settings -->
          <transition name="fade-up" appear>
            <Panel toggleable class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <template #header>
                 <div class="flex items-center gap-2 text-lg font-semibold w-full">
                  <i class="pi pi-cog text-primary-500"></i>
                  <span>Operational Settings</span>
                </div>
              </template>
              <div class="p-6">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-8">
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="check_in_time" v-model="hotelForm.check_in_time" class="w-full" :class="{'p-invalid': errors.check_in_time}" />
                      <label for="check_in_time">Default Check-in Time</label>
                    </FloatLabel>
                    <small v-if="errors.check_in_time" class="p-error">{{ errors.check_in_time }}</small>
                  </div>
                  <div class="col-span-1">
                    <FloatLabel>
                      <InputText id="time_zone" v-model="hotelForm.time_zone" class="w-full" :class="{'p-invalid': errors.time_zone}" />
                      <label for="time_zone">Time Zone</label>
                    </FloatLabel>
                    <small v-if="errors.time_zone" class="p-error">{{ errors.time_zone }}</small>
                  </div>
                  <div class="md:col-span-2">
                    <FloatLabel>
                      <InputText id="wifi_password" v-model="hotelForm.wifi_password" class="w-full" :class="{'p-invalid': errors.wifi_password}" />
                      <label for="wifi_password">Guest Wi-Fi Password</label>
                    </FloatLabel>
                    <small v-if="errors.wifi_password" class="p-error">{{ errors.wifi_password }}</small>
                  </div>
                </div>
                 <div class="flex justify-end mt-6">
                  <Button label="Save Settings" icon="pi pi-check" :loading="isUpdateLoading" @click="saveHotelProfile" />
                </div>
              </div>
            </Panel>
          </transition>
        </div>

        <!-- Right Column -->
        <div class="space-y-8">
          <!-- Documents -->
          <transition name="fade-up" appear>
            <Panel toggleable class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <template #header>
                <div class="flex items-center gap-2 text-lg font-semibold w-full">
                  <i class="pi pi-file text-primary-500"></i>
                  <span>Verification Documents</span>
                </div>
              </template>
              <div class="p-6">
                <div class="space-y-6">
                  <div>
                    <label class="font-semibold text-gray-700 block mb-2">Business License</label>
                    <p class="text-sm text-gray-500 mb-2">Upload a valid business license document.</p>
                    <FileUpload ref="businessLicenseUploader" name="business_license" @uploader="uploadDocument('business_license', $event, businessLicenseUploader)" :customUpload="true" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000">
                        <template #empty>
                            <p class="p-4 text-center text-gray-500">Drag and drop file to upload.</p>
                        </template>
                    </FileUpload>
                  </div>
                  <div>
                    <label class="font-semibold text-gray-700 block mb-2">Owner's ID</label>
                    <p class="text-sm text-gray-500 mb-2">Upload a government-issued ID of the hotel owner.</p>
                    <FileUpload ref="ownerIdUploader" name="owner_id" @uploader="uploadDocument('owner_id', $event, ownerIdUploader)" :customUpload="true" :multiple="false" accept="image/*,application/pdf" :maxFileSize="2000000">
                        <template #empty>
                            <p class="p-4 text-center text-gray-500">Drag and drop file to upload.</p>
                        </template>
                    </FileUpload>
                  </div>
                </div>
              </div>
            </Panel>
          </transition>

          <!-- QR Code -->
          <transition name="fade-up" appear>
            <Card class="shadow-sm border border-gray-200 hover:shadow-lg transition-all duration-300 transform hover:-translate-y-1">
              <template #title>
                <h3 class="flex items-center gap-2 text-lg font-semibold">
                  <i class="pi pi-qrcode text-primary-500"></i> QR Code
                </h3>
              </template>
              <template #content>
                <div v-if="hotel?.qr_code_url" class="text-center animate-pulse-slow">
                  <img :src="hotel.qr_code_url" alt="Hotel QR Code" class="w-48 h-48 object-contain mx-auto rounded-xl shadow-md p-2 bg-white" />
                  <p class="text-sm text-gray-600 mt-2">Scan for guest check-in</p>
                  <Button label="Download" icon="pi pi-download" class="p-button-sm mt-3 hover:scale-105 transition-transform duration-200" @click="downloadQR" />
                </div>
                 <div v-else class="text-center text-gray-500 py-4">
                  QR Code will be generated upon profile verification.
                </div>
              </template>
            </Card>
          </transition>
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

const authStore = useAuthStore();
const { hotelId } = storeToRefs(authStore);

const { data: hotel, isLoading: isHotelLoading, error: hotelError, refetch: refetchHotel  } = useFetchHotel(hotelId);
const { updateHotelProfile, isUpdateLoading } = usePatchHotel();

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
const businessLicenseUploader = ref();
const ownerIdUploader = ref();

watch(hotel, (newHotelData) => {
  if (newHotelData) {
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
      check_in_time: newHotelData.check_in_time || '14:00',
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

const uploadDocument = async (docType: string, event: { files: File[] }, uploaderRef: any) => {
  const files = event.files;
  // This is a placeholder for the actual upload logic.
  // You would typically use another composable or service to upload the file to your server,
  // get the URL back, and then update the hotel profile with the new document URL.
  console.log(`Uploading ${docType} document(s):`, files);

  // After handling upload, clear the file list
  if (uploaderRef) {
    uploaderRef.clear();
  }
};

const downloadQR = () => {
  if (hotel.value && hotel.value.qr_code_url) {
    const link = document.createElement('a');
    link.href = hotel.value.qr_code_url;
    link.setAttribute('download', `hotel-qr-code.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

const getStatusSeverity = (status: string) => {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'verified':
      return 'success';
    case 'suspended':
      return 'danger';
    case 'rejected':
      return 'danger';
    default:
      return 'info';
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
