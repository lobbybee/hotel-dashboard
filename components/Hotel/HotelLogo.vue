<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 flex flex-col">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Logo</h2>
    <div class="flex-1 flex flex-col items-center justify-center gap-4">
      <div class="w-28 h-28 rounded-lg border border-gray-200 bg-gray-50 flex items-center justify-center overflow-hidden">
        <img
          v-if="hotel?.logo_url"
          :src="hotel.logo_url"
          alt="Hotel logo"
          class="w-full h-full object-contain"
        />
        <i v-else class="pi pi-image text-3xl text-gray-300" aria-hidden="true"></i>
      </div>
      <div class="flex items-center gap-2">
        <FileUpload
          ref="uploader"
          mode="basic"
          name="logo"
          :customUpload="true"
          :auto="true"
          :multiple="false"
          accept="image/*"
          :maxFileSize="2000000"
          :choose-label="hotel?.logo_url ? 'Change' : 'Upload'"
          :disabled="isLoading"
          @uploader="onUpload"
        />
        <Button
          v-if="hotel?.logo_url"
          label="Remove"
          text
          severity="danger"
          size="small"
          :loading="isLoading"
          @click="onRemove"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';
import { useToast } from 'primevue/usetoast';

defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

const toast = useToast();
const { mutateAsync: patchHotelLogo, isLoading } = usePatchHotelLogo();
const uploader = ref();

const onUpload = async (event: { files: File[] }) => {
  const file = event.files?.[0];
  if (!file) return;
  try {
    await patchHotelLogo(file);
    toast.add({ severity: 'success', summary: 'Logo updated', detail: 'Hotel logo uploaded', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Upload failed', detail: 'Could not upload the logo. Please try again.', life: 5000 });
    console.error('Failed to upload logo:', e);
  } finally {
    uploader.value?.clear();
  }
};

const onRemove = async () => {
  try {
    await patchHotelLogo(null);
    toast.add({ severity: 'success', summary: 'Logo removed', detail: 'Hotel logo cleared', life: 3000 });
  } catch (e) {
    toast.add({ severity: 'error', summary: 'Remove failed', detail: 'Could not remove the logo. Please try again.', life: 5000 });
    console.error('Failed to remove logo:', e);
  }
};
</script>
