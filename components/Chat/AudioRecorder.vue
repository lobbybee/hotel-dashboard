<template>
  <div v-if="isVisible" class="audio-recorder-overlay">
    <div class="audio-recorder-modal">
      <div class="recorder-header">
        <h3>{{ isRecording ? 'Recording...' : isRecorded ? 'Review Recording' : 'Voice Message' }}</h3>
        <Button icon="pi pi-times" text @click="closeRecorder" />
      </div>

      <div class="recorder-content">
        <!-- Recording State -->
        <div v-if="isRecording" class="recording-state">
          <div class="recording-indicator">
            <div class="pulse-dot"></div>
            <span>Recording... {{ formatTime(recordingTime) }}</span>
          </div>
          <Button
            icon="pi pi-stop"
            severity="danger"
            rounded
            @click="stopRecording"
            class="stop-btn"
          />
        </div>

        <!-- Review State -->
        <div v-else-if="isRecorded" class="review-state">
          <div class="audio-preview">
            <audio
              ref="audioPlayer"
              :src="audioBlobUrl"
              controls
              class="audio-player"
            />
          </div>
          <div class="recording-info">
            <span>Duration: {{ formatTime(recordingDuration) }}</span>
          </div>
        </div>

        <!-- Initial State -->
        <div v-else class="initial-state">
          <div class="microphone-icon">
            <i class="pi pi-microphone"></i>
          </div>
          <p>Click to start recording</p>
        </div>
      </div>

      <div class="recorder-actions">
        <!-- Initial State Actions -->
        <div v-if="!isRecording && !isRecorded" class="initial-actions">
          <Button
            icon="pi pi-microphone"
            label="Start Recording"
            @click="startRecording"
            class="record-btn"
          />
          <Button
            label="Cancel"
            severity="secondary"
            @click="closeRecorder"
          />
        </div>

        <!-- Recording State Actions -->
        <div v-else-if="isRecording" class="recording-actions">
          <Button
            label="Cancel"
            severity="secondary"
            @click="cancelRecording"
          />
        </div>

        <!-- Review State Actions -->
        <div v-else class="review-actions">
          <Button
            icon="pi pi-trash"
            label="Delete"
            severity="danger"
            @click="deleteRecording"
          />
          <Button
            icon="pi pi-check"
            label="Send"
            @click="confirmSend"
            class="send-btn"
          />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';

const emit = defineEmits<{
  close: [];
  send: [blob: Blob, duration: number];
}>();

const isVisible = ref(false);
const isRecording = ref(false);
const isRecorded = ref(false);
const audioBlob = ref<Blob | null>(null);
const audioBlobUrl = ref<string>('');
const mediaRecorder = ref<MediaRecorder | null>(null);
const audioPlayer = ref<HTMLAudioElement>();
const recordingTime = ref(0);
const recordingDuration = ref(0);
let recordingInterval: NodeJS.Timeout | null = null;
let audioChunks: Blob[] = [];

const openRecorder = () => {
  isVisible.value = true;
  resetRecorder();
};

const closeRecorder = () => {
  if (isRecording.value) {
    stopRecording();
  }
  isVisible.value = false;
  resetRecorder();
};

const resetRecorder = () => {
  isRecording.value = false;
  isRecorded.value = false;
  audioBlob.value = null;
  audioBlobUrl.value = '';
  recordingTime.value = 0;
  recordingDuration.value = 0;
  audioChunks = [];

  if (recordingInterval) {
    clearInterval(recordingInterval);
    recordingInterval = null;
  }
};

const startRecording = async () => {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

    audioChunks = [];
    mediaRecorder.value = new MediaRecorder(stream);

    mediaRecorder.value.ondataavailable = (event) => {
      if (event.data.size > 0) {
        audioChunks.push(event.data);
      }
    };

    mediaRecorder.value.onstop = () => {
      const blob = new Blob(audioChunks, { type: 'audio/webm' });

      audioBlob.value = blob;
      audioBlobUrl.value = URL.createObjectURL(blob);
      recordingDuration.value = recordingTime.value;
      isRecorded.value = true;
      isRecording.value = false;

      // Stop all tracks to release the microphone
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.value.start();
    isRecording.value = true;
    recordingTime.value = 0;

    // Start recording timer
    recordingInterval = setInterval(() => {
      recordingTime.value++;
    }, 1000);

  } catch (error) {
    console.error('Error accessing microphone:', error);
    alert('Could not access microphone. Please check your permissions.');
  }
};

const stopRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();

    if (recordingInterval) {
      clearInterval(recordingInterval);
      recordingInterval = null;
    }
  }
};

const cancelRecording = () => {
  if (mediaRecorder.value && isRecording.value) {
    mediaRecorder.value.stop();
  }
  closeRecorder();
};

const deleteRecording = () => {
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value);
  }
  resetRecorder();
};

const confirmSend = () => {
  if (audioBlob.value) {
    emit('send', audioBlob.value, recordingDuration.value);
    closeRecorder();
  }
};

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
};



// Cleanup on unmount
onUnmounted(() => {
  if (audioBlobUrl.value) {
    URL.revokeObjectURL(audioBlobUrl.value);
  }
  if (recordingInterval) {
    clearInterval(recordingInterval);
  }
});

// Expose methods to parent
defineExpose({
  openRecorder,
  closeRecorder,
});
</script>

<style scoped>
.audio-recorder-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.audio-recorder-modal {
  background: white;
  border-radius: 1rem;
  padding: 1.5rem;
  width: 90%;
  max-width: 400px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
}

.recorder-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.recorder-header h3 {
  margin: 0;
  font-size: 1.125rem;
  font-weight: 600;
}

.recorder-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 1.5rem;
  min-height: 120px;
}

.recording-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.recording-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: #ef4444;
  font-weight: 500;
}

.pulse-dot {
  width: 12px;
  height: 12px;
  background: #ef4444;
  border-radius: 50%;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.7);
  }
  70% {
    box-shadow: 0 0 0 10px rgba(239, 68, 68, 0);
  }
  100% {
    box-shadow: 0 0 0 0 rgba(239, 68, 68, 0);
  }
}

.stop-btn {
  width: 60px;
  height: 60px;
  font-size: 1.5rem;
}

.review-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
}

.audio-preview {
  width: 100%;
}

.audio-player {
  width: 100%;
  height: 40px;
}

.recording-info {
  color: #6b7280;
  font-size: 0.875rem;
}

.initial-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  color: #6b7280;
}

.microphone-icon {
  font-size: 3rem;
  color: #9ca3af;
}

.initial-state p {
  margin: 0;
  font-size: 0.875rem;
}

.recorder-actions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}

.initial-actions,
.recording-actions,
.review-actions {
  display: flex;
  gap: 0.75rem;
  width: 100%;
  justify-content: center;
}

.record-btn {
  background: #ef4444 !important;
  color: white !important;
  border: none !important;
}

.record-btn:hover {
  background: #dc2626 !important;
}

.send-btn {
  background: #3b82f6 !important;
  color: white !important;
  border: none !important;
}

.send-btn:hover {
  background: #2563eb !important;
}

@media (max-width: 767px) {
  .audio-recorder-modal {
    width: 95%;
    padding: 1rem;
  }

  .recorder-actions {
    flex-direction: column;
  }

  .initial-actions,
  .recording-actions,
  .review-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
