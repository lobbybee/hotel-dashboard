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
          hour-format="12"
          stepMinute="15"
          class="w-full"
          :class="{'p-invalid': errors.check_in_time}"
        />
        <small v-if="errors.check_in_time" class="text-red-500 text-sm mt-1 block">{{ errors.check_in_time }}</small>
      </div>

      <!-- Breakfast Time -->
      <div>
        <label for="breakfast_time" class="block text-sm font-medium text-gray-700 mb-2">Breakfast Time</label>
        <DatePicker
          id="breakfast_time"
          v-model="breakfastTimeValue"
          time-only
          hour-format="12"
          stepMinute="15"
          class="w-full"
          :class="{'p-invalid': errors.breakfast_time}"
        />
        <small v-if="errors.breakfast_time" class="text-red-500 text-sm mt-1 block">{{ errors.breakfast_time }}</small>
      </div>

      <!-- Lunch Time -->
      <div>
        <label for="lunch_time" class="block text-sm font-medium text-gray-700 mb-2">Lunch Time</label>
        <DatePicker
          id="lunch_time"
          v-model="lunchTimeValue"
          time-only
          hour-format="12"
          stepMinute="15"
          class="w-full"
          :class="{'p-invalid': errors.lunch_time}"
        />
        <small v-if="errors.lunch_time" class="text-red-500 text-sm mt-1 block">{{ errors.lunch_time }}</small>
      </div>

      <!-- Dinner Time -->
      <div>
        <label for="dinner_time" class="block text-sm font-medium text-gray-700 mb-2">Dinner Time</label>
        <DatePicker
          id="dinner_time"
          v-model="dinnerTimeValue"
          time-only
          hour-format="12"
          stepMinute="15"
          class="w-full"
          :class="{'p-invalid': errors.dinner_time}"
        />
        <small v-if="errors.dinner_time" class="text-red-500 text-sm mt-1 block">{{ errors.dinner_time }}</small>
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

      <!-- Breakfast Reminder Toggle -->
      <div>
        <label for="breakfast_reminder" class="block text-sm font-medium text-gray-700 mb-2">Breakfast Reminder</label>
        <div class="flex items-center">
          <ToggleSwitch
            id="breakfast_reminder"
            v-model="hotelForm.breakfast_reminder"
            @update:model-value="onBreakfastReminderChange"
          />
          <span class="ml-3 text-sm text-gray-600">Enable breakfast reminders</span>
        </div>
      </div>

      <!-- Dinner Reminder Toggle -->
      <div>
        <label for="dinner_reminder" class="block text-sm font-medium text-gray-700 mb-2">Dinner Reminder</label>
        <div class="flex items-center">
          <ToggleSwitch
            id="dinner_reminder"
            v-model="hotelForm.dinner_reminder"
            @update:model-value="onDinnerReminderChange"
          />
          <span class="ml-3 text-sm text-gray-600">Enable dinner reminders</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import DatePicker from 'primevue/datepicker';
import Dropdown from 'primevue/dropdown';
import ToggleSwitch from 'primevue/toggleswitch';

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

// Helper function to convert string time to Date object
const stringToDate = (timeStr: string | undefined): Date | null => {
  if (!timeStr) return null;
  // Type assertion: after the null check, timeStr is guaranteed to be a string
  const timeStrTyped = timeStr as string;
  const timeParts = timeStrTyped.split(':');
  const hours = parseInt((timeParts[0] as string), 10);
  const minutes = parseInt((timeParts[1] as string), 10);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);
  return date;
};

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
        check_in_time: `${hours}:${minutes}:00`
      };
      emit('update:hotelForm', updatedForm);
    }
  }
});

// Computed property for breakfast time
const breakfastTimeValue = computed({
  get: () => stringToDate(props.hotelForm.breakfast_time),
  set: (value) => {
    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      const updatedForm = {
        ...props.hotelForm,
        breakfast_time: `${hours}:${minutes}:00`
      };
      emit('update:hotelForm', updatedForm);
    }
  }
});

// Computed property for lunch time
const lunchTimeValue = computed({
  get: () => stringToDate(props.hotelForm.lunch_time),
  set: (value) => {
    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      const updatedForm = {
        ...props.hotelForm,
        lunch_time: `${hours}:${minutes}:00`
      };
      emit('update:hotelForm', updatedForm);
    }
  }
});

// Computed property for dinner time
const dinnerTimeValue = computed({
  get: () => stringToDate(props.hotelForm.dinner_time),
  set: (value) => {
    if (value instanceof Date) {
      const hours = value.getHours().toString().padStart(2, '0');
      const minutes = value.getMinutes().toString().padStart(2, '0');
      const updatedForm = {
        ...props.hotelForm,
        dinner_time: `${hours}:${minutes}:00`
      };
      emit('update:hotelForm', updatedForm);
    }
  }
});

// Timezone options
const timezones = [
  { label: 'UTC', value: 'UTC' },
  { label: 'Asia/Kolkata (IST India)', value: 'Asia/Kolkata' },
  { label: 'Asia/Dubai', value: 'Asia/Dubai' },
  { label: 'Asia/Singapore', value: 'Asia/Singapore' },
  { label: 'Asia/Bangkok', value: 'Asia/Bangkok' },
  { label: 'Asia/Tokyo', value: 'Asia/Tokyo' },
  { label: 'Asia/Shanghai', value: 'Asia/Shanghai' },
  { label: 'Asia/Hong_Kong', value: 'Asia/Hong_Kong' },
  { label: 'Europe/London', value: 'Europe/London' },
  { label: 'Europe/Paris', value: 'Europe/Paris' },
  { label: 'Europe/Berlin', value: 'Europe/Berlin' },
  { label: 'Europe/Moscow', value: 'Europe/Moscow' },
  { label: 'America/New_York (ET)', value: 'America/New_York' },
  { label: 'America/Chicago (CT)', value: 'America/Chicago' },
  { label: 'America/Denver (MT)', value: 'America/Denver' },
  { label: 'America/Los_Angeles (PT)', value: 'America/Los_Angeles' },
  { label: 'America/Phoenix (no DST)', value: 'America/Phoenix' },
  { label: 'America/Toronto', value: 'America/Toronto' },
  { label: 'America/Vancouver', value: 'America/Vancouver' },
  { label: 'Australia/Sydney', value: 'Australia/Sydney' },
  { label: 'Australia/Melbourne', value: 'Australia/Melbourne' },
  { label: 'Australia/Perth', value: 'Australia/Perth' },
  { label: 'Pacific/Auckland', value: 'Pacific/Auckland' }
];



// Handle timezone change
const onTimezoneChange = (value: string) => {
  const updatedForm = {
    ...props.hotelForm,
    time_zone: value
  };
  emit('update:hotelForm', updatedForm);
};



// Handle breakfast reminder change
const onBreakfastReminderChange = (value: boolean) => {
  const updatedForm = {
    ...props.hotelForm,
    breakfast_reminder: value
  };
  emit('update:hotelForm', updatedForm);
};

// Handle dinner reminder change
const onDinnerReminderChange = (value: boolean) => {
  const updatedForm = {
    ...props.hotelForm,
    dinner_reminder: value
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
