<template>
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
            <DatePicker 
              id="check_in_time" 
              v-model="timeValue" 
              time-only
              hour-format="24"
              class="w-full"
              :class="{'p-invalid': errors.check_in_time}"
              @update:model-value="onTimeChange"
            />
            <label for="check_in_time">Default Check-in Time</label>
          </FloatLabel>
          <small v-if="errors.check_in_time" class="p-error">{{ errors.check_in_time }}</small>
        </div>
        <div class="col-span-1">
          <FloatLabel>
            <Dropdown 
              id="time_zone" 
              v-model="localHotelForm.time_zone" 
              :options="timezones" 
              option-label="label" 
              option-value="value"
              class="w-full"
              :class="{'p-invalid': errors.time_zone}"
              @update:model-value="onTimezoneChange"
            />
            <label for="time_zone">Time Zone</label>
          </FloatLabel>
          <small v-if="errors.time_zone" class="p-error">{{ errors.time_zone }}</small>
        </div>
        <div class="md:col-span-2">
          <FloatLabel>
            <InputText 
              id="wifi_password" 
              v-model="localHotelForm.wifi_password" 
              class="w-full" 
              :class="{'p-invalid': errors.wifi_password}" 
              @update:model-value="onWifiPasswordChange"
            />
            <label for="wifi_password">Guest Wi-Fi Password</label>
          </FloatLabel>
          <small v-if="errors.wifi_password" class="p-error">{{ errors.wifi_password }}</small>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref, computed, watch } from 'vue';
import Panel from 'primevue/panel';
import FloatLabel from 'primevue/floatlabel';
import DatePicker from 'primevue/datepicker';
import Dropdown from 'primevue/dropdown';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';

// Define props
const props = defineProps({
  hotelForm: {
    type: Object,
    required: true
  },
  errors: {
    type: Object,
    default: () => ({})
  }
});

// Define emits
const emit = defineEmits(['update:hotelForm', 'save']);

// Create a local copy of the hotel form
const localHotelForm = ref({ ...props.hotelForm });

// Computed property to convert string time to Date object for DatePicker
const timeValue = computed({
  get: () => {
    if (!localHotelForm.value.check_in_time) return null;
    // Handle HH:MM:SS format from API and convert to HH:MM
    const timeParts = localHotelForm.value.check_in_time.split(':');
    const hours = parseInt(timeParts[0], 10);
    const minutes = parseInt(timeParts[1], 10);
    const date = new Date();
    date.setHours(hours, minutes, 0, 0);
    return date;
  },
  set: (value) => {
    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      localHotelForm.value.check_in_time = `${hours}:${minutes}`;
      emit('update:hotelForm', localHotelForm.value);
    }
  }
});

// Watch for changes in the prop and update local copy
watch(() => props.hotelForm, (newVal) => {
  if (newVal) {
    localHotelForm.value = { ...newVal };
  }
}, { deep: true, immediate: true });

// Timezone options
// Note: Etc/GMT-5 is used for IST (Indian Standard Time) which is UTC+5:30
// The Etc/GMT timezone database uses inverted signs, so GMT-5 represents UTC+5
const timezones = [
  { label: 'India Standard Time (IST)', value: 'Etc/GMT-5' },
  { label: 'UTC', value: 'UTC' },
  { label: 'GMT', value: 'GMT' },
  { label: 'EST (Eastern Standard Time)', value: 'America/New_York' },
  { label: 'CST (Central Standard Time)', value: 'America/Chicago' },
  { label: 'MST (Mountain Standard Time)', value: 'America/Denver' },
  { label: 'PST (Pacific Standard Time)', value: 'America/Los_Angeles' },
  { label: 'GMT+1', value: 'Etc/GMT-1' },
  { label: 'GMT+2', value: 'Etc/GMT-2' },
  { label: 'GMT+3', value: 'Etc/GMT-3' },
  { label: 'GMT+4', value: 'Etc/GMT-4' },
  { label: 'GMT+5', value: 'Etc/GMT-5' },
  { label: 'GMT+6', value: 'Etc/GMT-6' },
  { label: 'GMT+7', value: 'Etc/GMT-7' },
  { label: 'GMT+8', value: 'Etc/GMT-8' },
  { label: 'GMT+9', value: 'Etc/GMT-9' },
  { label: 'GMT+10', value: 'Etc/GMT-10' },
  { label: 'GMT+11', value: 'Etc/GMT-11' },
  { label: 'GMT+12', value: 'Etc/GMT-12' },
  { label: 'GMT-1', value: 'Etc/GMT+1' },
  { label: 'GMT-2', value: 'Etc/GMT+2' },
  { label: 'GMT-3', value: 'Etc/GMT+3' },
  { label: 'GMT-4', value: 'Etc/GMT+4' },
  { label: 'GMT-5', value: 'Etc/GMT+5' },
  { label: 'GMT-6', value: 'Etc/GMT+6' },
  { label: 'GMT-7', value: 'Etc/GMT+7' },
  { label: 'GMT-8', value: 'Etc/GMT+8' },
  { label: 'GMT-9', value: 'Etc/GMT+9' },
  { label: 'GMT-10', value: 'Etc/GMT+10' },
  { label: 'GMT-11', value: 'Etc/GMT+11' },
  { label: 'GMT-12', value: 'Etc/GMT+12' },
  { label: 'London', value: 'Europe/London' },
  { label: 'Paris', value: 'Europe/Paris' },
  { label: 'Tokyo', value: 'Asia/Tokyo' },
  { label: 'Sydney', value: 'Australia/Sydney' }
];

// Handle time change
const onTimeChange = (value) => {
  if (value instanceof Date) {
    const hours = value.getHours().toString().padStart(2, '0');
    const minutes = value.getMinutes().toString().padStart(2, '0');
    localHotelForm.value.check_in_time = `${hours}:${minutes}`;
    emit('update:hotelForm', localHotelForm.value);
  }
};

// Handle timezone change
const onTimezoneChange = (value) => {
  localHotelForm.value.time_zone = value;
  emit('update:hotelForm', localHotelForm.value);
};

// Handle Wi-Fi password change
const onWifiPasswordChange = (value) => {
  localHotelForm.value.wifi_password = value;
  emit('update:hotelForm', localHotelForm.value);
};

// Save settings
const saveSettings = () => {
  emit('save');
};
</script>

<style scoped>
.p-error {
  display: block;
  margin-top: 0.25rem;
  color: #ef4444;
  font-size: 0.875rem;
}
</style>