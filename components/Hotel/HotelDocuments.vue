<template>
  <div class="bg-white rounded-2xl shadow-2xl p-8">
    <div class="mb-6">
      <h2 class="text-xl font-bold text-gray-900 mb-2">Verification Documents</h2>
      <p class="text-sm text-gray-600">Upload required documents for hotel verification</p>
    </div>

    <div class="flex flex-col gap-3">
      <!-- Business License Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full flex items-center justify-center">
            <i class="pi pi-file-check text-blue-500"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Business License</h3>
            <p class="text-sm text-gray-600">Upload valid business license</p>
          </div>
        </div>

        <!-- Preview uploaded license documents -->
        <div v-if="getDocumentsByType('license').length > 0" class="space-y-2">
          <div
            v-for="(doc, index) in getDocumentsByType('license')"
            :key="doc.id"
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center gap-2 cursor-pointer" @click="openDocument(doc)">
              <i class="pi pi-check-circle text-green-500"></i>
              <span class="text-sm text-green-700">License {{ index + 1 }}</span>
            </div>
             <FileUpload
              @click.stop
              mode="basic"
              name="license_update"
              :customUpload="true"
              :multiple="false"
              accept="image/*,application/pdf"
              :maxFileSize="2000000"
              @uploader="updateDocument(doc.id, $event.files[0])"
              class="p-0"
            >
              <template #empty>
                <Button
                  icon="pi pi-upload"
                  size="small"
                  text
                  class="text-xs"
                />
              </template>
            </FileUpload>
          </div>
        </div>

        <FileUpload
          v-if="getDocumentsByType('license').length === 0"
          ref="businessLicenseUploader"
          name="business_license"
          @uploader="uploadBusinessLicense"
          :customUpload="true"
          :multiple="false"
          accept="image/*,application/pdf"
          :maxFileSize="2000000"
          class="border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 transition-colors duration-200"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-8 px-4">
              <i class="pi pi-cloud-upload text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-500 mb-1">Drag and drop file here</p>
              <p class="text-xs text-gray-400">PDF, PNG, JPG up to 2MB</p>
            </div>
          </template>
        </FileUpload>
      </div>

      <!-- Additional Documents Section -->
      <div class="space-y-4">
        <div class="flex items-center gap-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-br from-yellow-50 to-orange-100 rounded-full flex items-center justify-center">
            <i class="pi pi-files text-blue-500"></i>
          </div>
          <div>
            <h3 class="font-semibold text-gray-900">Additional Documents</h3>
            <p class="text-sm text-gray-600">Upload supporting documents</p>
          </div>
        </div>

        <!-- Preview uploaded additional documents -->
        <div v-if="getDocumentsByType('other').length > 0" class="space-y-2">
          <div
            v-for="(doc, index) in getDocumentsByType('other')"
            :key="doc.id"
            class="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between p-3 bg-green-50 border border-green-200 rounded-lg"
          >
            <div class="flex items-center gap-2 cursor-pointer" @click="openDocument(doc)">
              <i class="pi pi-check-circle text-green-500"></i>
              <span class="text-sm text-green-700">Document {{ index + 1 }}</span>
            </div>
            <FileUpload
              @click.stop
              mode="basic"
              name="additional_update"
              :customUpload="true"
              :multiple="false"
              accept="image/*,application/pdf"
              :maxFileSize="2000000"
              @uploader="updateDocument(doc.id, $event.files[0])"
              class="p-0"
            >
              <template #empty>
                <Button
                  icon="pi pi-upload"
                  size="small"
                  text
                  class="text-xs"
                />
              </template>
            </FileUpload>
          </div>
        </div>

        <FileUpload
          v-if="getDocumentsByType('other').length === 0"
          name="additional"
          @uploader="uploadAdditionalDocuments"
          :customUpload="true"
          :multiple="true"
          accept="image/*,application/pdf"
          :maxFileSize="2000000"
          class="border-2 border-dashed border-gray-200 rounded-lg hover:border-blue-500 transition-colors duration-200"
        >
          <template #empty>
            <div class="flex flex-col items-center justify-center py-8 px-4">
              <i class="pi pi-cloud-upload text-3xl text-gray-400 mb-2"></i>
              <p class="text-sm text-gray-500 mb-1">Drag and drop files here</p>
              <p class="text-xs text-gray-400">Multiple files allowed, PDF, PNG, JPG up to 2MB each</p>
            </div>
          </template>
        </FileUpload>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import FileUpload from 'primevue/fileupload';
import Button from 'primevue/button';

const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

const emit = defineEmits(['uploadDocument', 'updateDocument', 'openDocument']);

const businessLicenseUploader = ref();

const getDocumentsByType = (documentType: string) => {
  if (!props.hotel || !props.hotel.documents) return [];

  if (documentType === 'license') {
    return props.hotel.documents.filter((doc: any) => doc.document_type === 'license' && doc.document_file_url);
  }

  if (documentType === 'other') {
    return props.hotel.documents.filter((doc: any) => doc.document_type !== 'license' && doc.document_file_url);
  }

  return [];
};

const uploadBusinessLicense = async (event: { files: File[] }) => {
  const files = event.files;
  if (files.length === 0) return;

  const file = files[0];

  try {
    await emit('uploadDocument', {
      document_type: 'license',
      document_file: file
    });

    if (businessLicenseUploader.value) {
      businessLicenseUploader.value.clear();
    }
  } catch (error) {
    console.error('Failed to upload business license:', error);
  }
};

const uploadAdditionalDocuments = async (event: { files: File[] }) => {
  const files = event.files;
  if (files.length === 0) return;

  if (files.length > 1) {
    for (const file of files) {
      try {
        await emit('uploadDocument', {
          document_type: 'other',
          document_file: file
        });
      } catch (error) {
        console.error(`Failed to upload document:`, error);
      }
    }
  } else {
    const file = files[0];

    try {
      await emit('uploadDocument', {
        document_type: 'other',
        document_file: file
      });
    } catch (error) {
      console.error(`Failed to upload document:`, error);
    }
  }
};

const updateDocument = async (documentId: string, file: File) => {
  try {
    await emit('updateDocument', {
      id: documentId,
      document_file: file
    });
  } catch (error) {
    console.error(`Failed to update document:`, error);
  }
};

const openDocument = (document: any) => {
  emit('openDocument', document);
};
</script>
