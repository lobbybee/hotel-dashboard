<template>
  <div class="mb-6 p-4 border rounded-lg bg-white">
    <h4 class="font-semibold text-gray-700 mb-3">Find Existing Guest</h4>
    <div class="flex items-center gap-2">
      <InputText v-model="searchPhoneNumber" placeholder="Search by phone number..." class="w-full flex-grow" @keyup.enter="handleGuestSearch" />
      <Button label="Search" icon="pi pi-search" @click="handleGuestSearch" :loading="isSearchingGuests" />
    </div>
    <div v-if="isSearchingGuests" class="mt-3 text-center">
      <ProgressSpinner style="width: 30px; height: 30px" />
    </div>
    <div v-if="isSearchSuccess==='success' && searchResults && searchResults.length > 0" class="mt-4 border-t pt-4">
      <h4 class="font-semibold text-gray-700 mb-3">Select a Guest Profile</h4>
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card v-for="guest in searchResults" :key="guest.id" class="cursor-pointer hover:shadow-lg transition-shadow duration-200 border">
          <template #title>
            <div class="flex items-center justify-between">
              <h5 class="text-md font-semibold truncate">{{ guest.full_name }}</h5>
            </div>
          </template>
          <template #content>
            <div class="space-y-2 text-sm text-gray-600">
              <div class="flex items-center gap-2 truncate"><i class="pi pi-phone"></i> <span>{{ guest.whatsapp_number }}</span></div>
              <div class="flex items-center gap-2 truncate"><i class="pi pi-envelope"></i> <span>{{ guest.email }}</span></div>
            </div>
          </template>
          <template #footer>
            <Button label="Select Guest" icon="pi pi-user-check" class="w-full" @click="selectGuest(guest)" />
          </template>
        </Card>
      </div>
    </div>
    <div v-if="isSearchSuccess === 'success' && (!searchResults || searchResults.length === 0)" class="mt-3 text-gray-500">
      <p>No guest found. Please fill the form below to create a new guest profile.</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import InputText from 'primevue/inputtext';
import Button from 'primevue/button';
import ProgressSpinner from 'primevue/progressspinner';
import Card from 'primevue/card';
import { useSearchGuests } from '~/composables/useGuest';

const emit = defineEmits(['guest-selected']);

const searchPhoneNumber = ref('');
const searchQuery = ref('');
const { data: searchResults, isLoading: isSearchingGuests, status: isSearchSuccess, refetch: refetchGuests } = useSearchGuests(searchQuery);

const handleGuestSearch = () => {
  searchQuery.value = searchPhoneNumber.value.trim();
  refetchGuests();
};

const selectGuest = (guest: any) => {
  emit('guest-selected', guest);
  searchPhoneNumber.value = '';
  searchQuery.value = '';
};
</script>
