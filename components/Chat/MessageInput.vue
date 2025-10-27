<template>
  <div class="message-input-container">
    <Card class="message-input-card">
      <template #content>
        <div class="input-wrapper">
          <!-- Attachment button -->
          <Button
            icon="pi pi-paperclip"
            text
            rounded
            class="attachment-btn"
            @click="onAttachFile"
          />

          <!-- Text input -->
          <InputText
            v-model="messageText"
            placeholder="Type a message..."
            class="message-input"
            @keyup.enter="handleSendMessage"
          />

          <!-- Voice/Send button -->
          <Button
            :icon="messageText.trim() ? 'pi pi-send' : 'pi pi-microphone'"
            :class="['send-btn', { 'has-text': messageText.trim() }]"
            rounded
            @click="messageText.trim() ? handleSendMessage() : onVoiceRecord()"
          />
        </div>
      </template>
    </Card>

    <!-- Hidden file input -->
    <input
      ref="fileInput"
      type="file"
      accept="image/*,video/*,audio/*,.pdf,.txt,.doc,.docx"
      style="display: none"
      @change="handleFileSelect"
    />

    <!-- Audio Recorder Component -->
    <AudioRecorder
      ref="audioRecorder"
      @close="onRecorderClose"
      @send="onAudioSend"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useChatStore } from '~/stores/chat';
import AudioRecorder from './AudioRecorder.vue';

const chatStore = useChatStore();
const messageText = ref('');
const fileInput = ref<HTMLInputElement>();
const audioRecorder = ref();

const handleSendMessage = () => {
  if (messageText.value.trim()) {
    chatStore.sendMessage(messageText.value.trim());
    messageText.value = '';
  }
};

const onAttachFile = () => {
  fileInput.value?.click();
};

const handleFileSelect = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];

  if (file) {
    // Check file size (10MB limit)
    if (file.size > 10 * 1024 * 1024) {
      alert('File size must be less than 10MB');
      return;
    }

    // Send the media message
    chatStore.sendMediaMessage(file);

    // Clear the file input
    if (fileInput.value) {
      fileInput.value.value = '';
    }
  }
};

const onVoiceRecord = () => {
  audioRecorder.value?.openRecorder();
};

const onRecorderClose = () => {
  // Handle recorder close if needed
};

const onAudioSend = (blob: Blob, duration: number) => {
  // Create a File object from the blob with a proper name
  const fileName = `voice-recording-${Date.now()}.webm`;
  const audioFile = new File([blob], fileName, { type: 'audio/webm' });

  // Send the audio file as a media message
  chatStore.sendMediaMessage(audioFile, `Voice message (${formatDuration(duration)})`);
};

const formatDuration = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
</script>

<style scoped>
.message-input-container {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.message-input-card {
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1) !important;
}

.input-wrapper {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0;
}

.attachment-btn {
  color: #6b7280 !important;
  flex-shrink: 0;
}

.attachment-btn:hover {
  color: #374151 !important;
}

.message-input {
  flex: 1;
  border: none !important;
  box-shadow: none !important;
  padding: 0.75rem 0 !important;
  font-size: 0.875rem;
}

.message-input:focus {
  outline: none !important;
}

.send-btn {
  flex-shrink: 0;
  transition: all 0.2s ease;
}

.send-btn:not(.has-text) {
  background: transparent !important;
  color: #6b7280 !important;
}

.send-btn:not(.has-text):hover {
  background: #f3f4f6 !important;
  color: #374151 !important;
}

.send-btn.has-text {
  background: #3b82f6 !important;
  color: white !important;
}

.send-btn.has-text:hover {
  background: #2563eb !important;
}

@media (max-width: 767px) {
  .message-input-container {
    padding: 0.75rem;
  }

  .input-wrapper {
    gap: 0.5rem;
  }
}
</style>
