<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6">
    <div class="mb-6">
      <h2 class="text-xl font-semibold text-gray-900 mb-2">Operational Settings</h2>
    </div>

    <div class="space-y-6">
      <!-- Check-in Time - Full Width -->
      <div>
        <label for="check_in_time" class="block text-sm font-medium text-gray-700 mb-2">Check-in Time</label>
        <DatePicker
          id="check_in_time"
          v-model="timeValue"
          time-only
          hour-format="24"
          class="w-full"
          :class="{'p-invalid': errors.check_in_time}"
          @update:model-value="onTimeChange"
        />
        <small v-if="errors.check_in_time" class="text-red-500 text-sm mt-1 block">{{ errors.check_in_time }}</small>
      </div>

      <!-- Timezone -->
      <div>
        <label for="time_zone" class="block text-sm font-medium text-gray-700 mb-2">Timezone</label>
        <Dropdown
          id="time_zone"
          v-model="hotelForm.time_zone"
          :options="timezones"
          option-label="label"
          option-value="value"
          class="w-full"
          :class="{'p-invalid': errors.time_zone}"
          @update:model-value="onTimezoneChange"
        />
        <small v-if="errors.time_zone" class="text-red-500 text-sm mt-2 block">{{ errors.time_zone }}</small>
      </div>

  
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Dropdown from 'primevue/dropdown';

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

// Computed property to convert string time to Date object for DatePicker
const timeValue = computed({
  get: () => {
    if (!props.hotelForm.check_in_time) return null;
    // Handle HH:MM:SS format from API and convert to HH:MM
    const timeParts = props.hotelForm.check_in_time.split(':');
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
      const updatedForm = {
        ...props.hotelForm,
        check_in_time: `${hours}:${minutes}`
      };
      emit('update:hotelForm', updatedForm);
    }
  }
});

// Timezone options
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
    const updatedForm = {
      ...props.hotelForm,
      check_in_time: `${hours}:${minutes}`
    };
    emit('update:hotelForm', updatedForm);
  }
};

// Handle timezone change
const onTimezoneChange = (value) => {
  const updatedForm = {
    ...props.hotelForm,
    time_zone: value
  };
  emit('update:hotelForm', updatedForm);
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
