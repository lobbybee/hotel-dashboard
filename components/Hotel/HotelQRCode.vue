<template>
  <div class="bg-white rounded-lg border border-gray-200 p-6 hover:shadow-md transition-all duration-200">
    <div class="text-center">
      <div class="w-12 h-12 bg-blue-50 rounded-lg flex items-center justify-center mx-auto mb-4">
        <i class="pi pi-qrcode text-xl text-blue-600"></i>
      </div>
      <h3 class="text-lg font-semibold text-gray-900 mb-4">Hotel QR Code</h3>
      <div v-if="hotel && hotel.status === 'verified'" class="space-y-4">
        <div
          ref="qrCodeContainer"
          :key="hotel.id"
          class="flex justify-center items-center bg-gray-50 rounded-lg min-h-[180px]"
        >
          <div v-if="!isQRGenerated && isGenerating" class="text-gray-500 text-sm">
            Generating QR code...
          </div>
        </div>

        <Button
          label="Download QR"
          icon="pi pi-download"
          @click="downloadHighQualityQR"
          :loading="isGenerating"
          :disabled="!isQRGenerated"
        />
      </div>

      <div v-else class="py-4">
        <p class="text-sm text-gray-500 mb-4">QR Code available after verification</p>
        <Button
          label="Verify Profile"
          icon="pi pi-check-circle"
          class="w-full"
          @click="verifyProfile"
        />
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, nextTick, onMounted } from 'vue';
import Card from 'primevue/card';
import Button from 'primevue/button';
import QRCodeStyling from 'qr-code-styling';

// Define props
const props = defineProps({
  hotel: {
    type: Object,
    default: () => ({})
  }
});

// Define emits
const emit = defineEmits(['downloadQR', 'verifyProfile']);

// Refs
const qrCodeContainer = ref(null);
const qrCodeInstance = ref(null);
const isGenerating = ref(false);
const isQRGenerated = ref(false);

// Create QR code when hotel is verified
watch(() => props.hotel, (newHotel) => {
  if (newHotel && newHotel.status === 'verified') {
    // Use setTimeout to ensure DOM is fully ready
    setTimeout(() => {
      generateQRCode();
    }, 100);
  }
}, { immediate: true });

// Also try to generate QR code when component is mounted
onMounted(() => {
  if (props.hotel && props.hotel.status === 'verified') {
    setTimeout(() => {
      generateQRCode();
    }, 100);
  }
});

const generateQRCode = async () => {
  // Check if hotel exists and is verified
  if (!props.hotel || !props.hotel.id || props.hotel.status !== 'verified' || !qrCodeContainer.value) return;

  isGenerating.value = true;

  try {
    // Clear previous content
    qrCodeContainer.value.innerHTML = '';

    // Create QR code URL with hotel ID
    const qrUrl = `https://wa.me/919400408414?text=${encodeURIComponent(`/checkin-${props.hotel.id}`)}`;


    // Create QR code instance with standard size for display
    const qrCodeStyling = new QRCodeStyling({
      width: 200,
      height: 200,
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

    // Store instance for later use
    qrCodeInstance.value = qrCodeStyling;
    isQRGenerated.value = true;

    // Wait for next tick to ensure DOM is ready
    await nextTick();

    // Small delay to ensure container is properly rendered
    await new Promise(resolve => setTimeout(resolve, 50));

    // Append to container
    if (qrCodeContainer.value) {
      qrCodeStyling.append(qrCodeContainer.value);
    }
  } catch (error) {
    console.error('Error generating QR code:', error);
  } finally {
    isGenerating.value = false;
  }
};

const downloadHighQualityQR = async () => {
  if (!props.hotel || !props.hotel.id) return;

  try {
    // Create a high-quality QR code (1080px)
    const qrUrl = `https://wa.me/919400408414?text=${encodeURIComponent('/checkin-' + props.hotel.id)}`;

    // Create a temporary container for the QR code
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    document.body.appendChild(tempContainer);

    // Create QR code
    const qrCode = new QRCodeStyling({
      width: 1080,
      height: 1080,
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

    // Append QR code to temporary container
    qrCode.append(tempContainer);

    // Wait for render
    await new Promise(resolve => setTimeout(resolve, 300));

    // Get the canvas element
    const qrCanvas = tempContainer.querySelector('canvas');

    if (qrCanvas) {
      // Create a new canvas for our composite image with increased padding
      const compositeCanvas = document.createElement('canvas');
      const ctx = compositeCanvas.getContext('2d');

      // Set dimensions (QR code + increased padding + text space)
      const padding = 200; // Double the padding (200px on all sides)
      const qrSize = 1080;
      const totalWidth = qrSize + (2 * padding);
      const totalHeight = qrSize + (2 * padding) + 200; // Extra space for text

      compositeCanvas.width = totalWidth;
      compositeCanvas.height = totalHeight;

      // Fill background
      ctx.fillStyle = "#FCFCFC";
      ctx.fillRect(0, 0, compositeCanvas.width, compositeCanvas.height);

      // Draw QR code with padding
      ctx.drawImage(qrCanvas, padding, padding, qrSize, qrSize);

      // Draw dotted guidelines for cutting along the image border
      ctx.strokeStyle = "#CCCCCC";
      ctx.lineWidth = 2;
      ctx.setLineDash([5, 5]); // Dotted line

      // Outer border guidelines (along the image border)
      ctx.beginPath();
      ctx.rect(20, 20, totalWidth-40, totalHeight-40);
      ctx.stroke();

      // Inner border guidelines (around the QR code)
      // ctx.beginPath();
      // ctx.rect(padding, padding, qrSize, qrSize);
      // ctx.stroke();

      // Reset line dash for text
      ctx.setLineDash([]);

      // Draw hotel name
      ctx.font = "bold 56px Arial, sans-serif";
      ctx.fillStyle = "#2B2B2B";
      ctx.textAlign = "center";
      ctx.fillText(props.hotel.name, totalWidth / 2, totalHeight - 180);

      // Draw powered by text
      ctx.font = "32px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      ctx.fillText("POWERED BY LOBBYBEE.COM", totalWidth / 2, totalHeight - 120);

      // Draw cutting instructions
      ctx.font = "16px Arial, sans-serif";
      ctx.fillStyle = "#999999";
      ctx.fillText("Cut along outer dotted lines", totalWidth / 2, totalHeight - 30);

      // Convert to blob and download
      compositeCanvas.toBlob((blob) => {
        if (blob) {
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `hotel-qr-code-${props.hotel.id}.png`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        } else {
          // Fallback to basic QR code download
          qrCode.download({
            name: `hotel-qr-code-${props.hotel.id}`,
            extension: "png"
          });
        }
      }, 'image/png');
    } else {
      // Fallback to basic QR code download
      qrCode.download({
        name: `hotel-qr-code-${props.hotel.id}`,
        extension: "png"
      });
    }

    // Clean up
    document.body.removeChild(tempContainer);
  } catch (error) {
    console.error('Error downloading high-quality QR code:', error);
    alert('Error generating high-quality QR code. Please try again.');
  }
};

const verifyProfile = () => {
  emit('verifyProfile');
};
</script>

<style scoped>
/* Slow pulse for QR code */
@keyframes pulse-slow {
  0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(59, 130, 246, 0.4); }
  50% { transform: scale(1.02); box-shadow: 0 0 15px rgba(59, 130, 246, 0.3); }
}
</style>
