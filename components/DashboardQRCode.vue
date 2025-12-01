<template>
  <div class="bg-white rounded-lg border border-gray-200 hover:shadow-md transition-all duration-200 h-full flex flex-col">
    <div class="text-center p-6">
      <h3 class="text-sm font-semibold text-gray-900 mb-3">Check-in QR Code</h3>
      
      <!-- QR Code Container -->
      <div 
        ref="qrCodeContainer"
        class="flex justify-center items-center bg-gray-50 rounded-lg min-h-[180px] mb-3"
      >
        <div v-if="!isQRGenerated" class="text-gray-500 text-xs">
          Generating QR code...
        </div>
      </div>
      
      <!-- Info Text -->
      <p class="text-xs text-gray-600">
        Guests scan to check in
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, nextTick } from 'vue';
import QRCodeStyling from 'qr-code-styling';

// Props
const props = defineProps({
  hotelId: {
    type: String,
    required: true
  },
  hotelName: {
    type: String,
    required: true
  }
});

// Refs
const qrCodeContainer = ref<HTMLDivElement>(null);
const isQRGenerated = ref(false);

// Generate QR Code once when component mounts
onMounted(async () => {
  await generateQRCode();
});

const generateQRCode = async () => {
  if (!props.hotelId || !qrCodeContainer.value) return;

  try {
    // Clear any existing content
    qrCodeContainer.value.innerHTML = '';

    // Create QR code URL
    const qrUrl = `https://wa.me/919400408414?text=${encodeURIComponent(`/checkin-${props.hotelId}`)}`;

    // Create QR code instance
    const qrCode = new QRCodeStyling({
      width: 180,
      height: 180,
      type: "canvas",
      data: qrUrl,
      image: "/logo.png",
      dotsOptions: {
        color: "#2B2B2B",
        type: "rounded"
      },
      backgroundOptions: {
        color: "#FCFCFC"
      },
      imageOptions: {
        crossOrigin: "anonymous",
        margin: 10,
        imageSize: 0.5
      }
    });

    // Wait for DOM to be ready
    await nextTick();

    // Small delay to ensure container is ready
    await new Promise(resolve => setTimeout(resolve, 100));

    // Append QR code to container
    qrCode.append(qrCodeContainer.value);
    
    isQRGenerated.value = true;
    
  } catch (error) {
    console.error('Error generating QR code:', error);
    isQRGenerated.value = false;
  }
};
</script>

<style scoped>
/* Component styles */
</style>