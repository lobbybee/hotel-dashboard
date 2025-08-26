<template>
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
          <!-- Preview uploaded license documents -->
          <div v-if="getDocumentsByType('license').length > 0" class="mb-3">
            <div 
              v-for="(doc, index) in getDocumentsByType('license')" 
              :key="doc.id"
              class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100 mb-2" 
              @click="openDocument(doc)"
            >
              <i class="pi pi-check-circle text-green-500"></i>
              <span class="text-sm text-green-700">License {{ index + 1 }} - Click to view</span>
              <!-- Update button for license documents -->
              <FileUpload 
                mode="basic" 
                name="license_update" 
                :customUpload="true" 
                :multiple="false" 
                accept="image/*,application/pdf" 
                :maxFileSize="2000000"
                @uploader="updateDocument(doc.id, $event.files[0])"
                class="ml-auto"
              />
            </div>
          </div>
          <FileUpload 
            ref="businessLicenseUploader" 
            name="business_license" 
            @uploader="uploadBusinessLicense" 
            :customUpload="true" 
            :multiple="false" 
            accept="image/*,application/pdf" 
            :maxFileSize="2000000"
          >
            <template #empty>
              <p class="p-4 text-center text-gray-500">Drag and drop file to upload.</p>
            </template>
          </FileUpload>
        </div>
        <div>
          <label class="font-semibold text-gray-700 block mb-2">Additional Documents</label>
          <p class="text-sm text-gray-500 mb-2">Upload any additional supporting documents.</p>
          <!-- Preview uploaded additional documents -->
          <div v-if="getDocumentsByType('other').length > 0" class="mb-3">
            <div 
              v-for="(doc, index) in getDocumentsByType('other')" 
              :key="doc.id"
              class="flex items-center gap-2 p-2 bg-green-50 border border-green-200 rounded cursor-pointer hover:bg-green-100 mb-2" 
              @click="openDocument(doc)"
            >
              <i class="pi pi-check-circle text-green-500"></i>
              <span class="text-sm text-green-700">Document {{ index + 1 }} - Click to view</span>
              <!-- Update button for additional documents -->
              <FileUpload 
                mode="basic" 
                name="additional_update" 
                :customUpload="true" 
                :multiple="false" 
                accept="image/*,application/pdf" 
                :maxFileSize="2000000"
                @uploader="updateDocument(doc.id, $event.files[0])"
                class="ml-auto"
              />
            </div>
          </div>
          <FileUpload 
            name="additional" 
            @uploader="uploadAdditionalDocuments" 
            :customUpload="true" 
            :multiple="true" 
            accept="image/*,application/pdf" 
            :maxFileSize="2000000"
          >
            <template #empty>
              <p class="p-4 text-center text-gray-500">Drag and drop files to upload.</p>
            </template>
          </FileUpload>
        </div>
      </div>
    </div>
  </Panel>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Panel from 'primevue/panel';
import FileUpload from 'primevue/fileupload';

// Define props
const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

// Define emits
const emit = defineEmits(['uploadDocument', 'updateDocument', 'openDocument']);

// Refs for file uploaders
const businessLicenseUploader = ref();

// Helper function to filter documents by type
const getDocumentsByType = (documentType: string) => {
  // Check if hotel and documents exist
  if (!props.hotel || !props.hotel.documents) return [];
  
  // Filter documents by type
  if (documentType === 'license') {
    return props.hotel.documents.filter((doc: any) => doc.document_type === 'license' && doc.document_file_url);
  }
  
  // For other documents
  if (documentType === 'other') {
    return props.hotel.documents.filter((doc: any) => doc.document_type !== 'license' && doc.document_file_url);
  }
  
  return [];
};

// Document handlers
const uploadBusinessLicense = async (event: { files: File[] }) => {
  const files = event.files;
  if (files.length === 0) return;

  const file = files[0];
  
  try {
    await emit('uploadDocument', {
      document_type: 'license',
      document_file: file
    });
    
    // Clear the file list
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

  // For multiple file uploads (additional documents)
  if (files.length > 1) {
    // Handle multiple files
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
    // For single file uploads
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