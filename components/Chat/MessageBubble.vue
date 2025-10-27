<template>
  <div :class="['message-bubble', { 'message-sent': isMe, 'message-received': !isMe }]">
    <div class="message-content">
      <!-- Media message -->
      <div v-if="message.media_url" class="media-container">
        <!-- Image -->
        <img
          v-if="message.message_type === 'image' || isImage(message.media_filename)"
          :src="message.media_url || ''"
          :alt="message.media_filename || ''"
          class="message-image"
          @click="openImage(message.media_url || '')"
        />
        <!-- Video -->
        <div v-else-if="message.message_type === 'video' || isVideo(message.media_filename)" class="message-video">
          <video :src="message.media_url || ''" controls class="video-player">
            Your browser does not support the video tag.
          </video>
        </div>
        <!-- Audio -->
        <div v-else-if="message.message_type === 'audio' || isAudio(message.media_filename)" class="message-audio">
          <div class="audio-container">
            <div class="audio-icon">
              <i :class="isVoiceMessage(message.media_filename) ? 'pi pi-microphone' : 'pi pi-volume-up'"></i>
            </div>
            <div class="audio-info">
              <span class="audio-filename">{{ getAudioDisplayName(message.media_filename, message.content) }}</span>
              <span v-if="message.content && !isVoiceMessage(message.media_filename)" class="audio-caption">{{ message.content }}</span>
            </div>
            <audio :src="message.media_url || ''" controls class="audio-player">
              Your browser does not support the audio tag.
            </audio>
          </div>
        </div>
        <!-- Document -->
        <div v-else class="message-file">
          <i :class="getFileIcon(message.media_filename)"></i>
          <span>{{ message.media_filename }}</span>
        </div>
        <!-- Caption -->
        <p v-if="message.content" class="message-text">{{ message.content }}</p>
      </div>
      <!-- Text message -->
      <p v-else-if="message.content" class="message-text">{{ message.content }}</p>
    </div>
    <div class="message-meta">
      <span :class="['message-timestamp', { 'failed': isFailed, 'sending': isSending }]">
        {{ message.time_ago }}
      </span>
      <div v-if="isMe" class="message-actions">
        <span v-if="isFailed" class="retry-button" @click="retryMessage">
          <i class="pi pi-refresh"></i>
        </span>
        <span v-else-if="!isFailed" class="message-read-status">
          <i :class="readStatusIcon"></i>
        </span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import type { Message } from '~/types/chat';
import { useChatStore } from '~/stores/chat';

const props = defineProps<{
  message: Message;
}>();

const chatStore = useChatStore();

const isMe = computed(() => props.message.sender_type === 'staff');
const isOptimistic = computed(() => props.message.id < 0);
const isFailed = computed(() => isOptimistic.value && props.message.time_ago === 'failed to send');
const isSending = computed(() => isOptimistic.value && props.message.time_ago === 'sending...');

const readStatusIcon = computed(() => {
  if (props.message.is_read) {
    return 'pi pi-check-double';
  }
  return 'pi pi-check';
});

const isImage = (filename: string | null): boolean => {
  if (!filename) return false;
  const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return imageExtensions.includes(extension || '');
};

const isVideo = (filename: string | null): boolean => {
  if (!filename) return false;
  const videoExtensions = ['mp4', 'avi', 'mov', 'wmv', 'flv', 'webm'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return videoExtensions.includes(extension || '');
};

const isAudio = (filename: string | null): boolean => {
  if (!filename) return false;
  const audioExtensions = ['mp3', 'wav', 'mpeg', 'ogg', 'aac', 'webm', 'm4a'];
  const extension = filename.split('.').pop()?.toLowerCase();
  return audioExtensions.includes(extension || '');
};

const isVoiceMessage = (filename: string | null): boolean => {
  if (!filename) return false;
  return filename.includes('voice-recording') || filename.includes('voice-message');
};

const getAudioDisplayName = (filename: string | null, content: string | null): string => {
  if (isVoiceMessage(filename)) {
    return content || 'Voice Message';
  }
  return filename || 'Audio file';
};

const getFileIcon = (filename: string | null): string => {
  if (!filename) return 'pi pi-file';
  
  const extension = filename.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'pdf':
      return 'pi pi-file-pdf';
    case 'doc':
    case 'docx':
      return 'pi pi-file-word';
    case 'xls':
    case 'xlsx':
      return 'pi pi-file-excel';
    case 'ppt':
    case 'pptx':
      return 'pi pi-file';
    case 'txt':
      return 'pi pi-file-text';
    case 'zip':
    case 'rar':
    case '7z':
      return 'pi pi-file-archive';
    default:
      return 'pi pi-file';
  }
};

const openImage = (url: string) => {
  if (url) {
    window.open(url, '_blank');
  }
};

const retryMessage = () => {
  if (isOptimistic.value) {
    chatStore.retryMessage(props.message.id);
  }
};
</script>

<style scoped>
.message-bubble {
  display: flex;
  flex-direction: column;
  max-width: 70%;
  word-wrap: break-word;
}

.message-sent {
  align-self: flex-end;
  align-items: flex-end;
}

.message-received {
  align-self: flex-start;
  align-items: flex-start;
}

.message-content {
  padding: 0.75rem 1rem;
  border-radius: 1rem;
  margin-bottom: 0.25rem;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.message-sent .message-content {
  background: #3b82f6;
  color: white;
  border-bottom-right-radius: 0.25rem;
}

.message-received .message-content {
  background: white;
  color: #1f2937;
  border-bottom-left-radius: 0.25rem;
  border: 1px solid #e5e7eb;
}

.message-text {
  margin: 0;
  font-size: 0.875rem;
  line-height: 1.4;
}

.media-container {
  max-width: 100%;
}

.message-image {
  max-width: 200px;
  max-height: 200px;
  border-radius: 0.5rem;
  cursor: pointer;
  transition: transform 0.2s;
}

.message-image:hover {
  transform: scale(1.02);
}

.message-file {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  font-size: 0.875rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.message-file:hover {
  background: rgba(0, 0, 0, 0.1);
}

.message-video {
  max-width: 100%;
}

.video-player {
  max-width: 300px;
  max-height: 200px;
  border-radius: 0.5rem;
}

.message-audio {
  width: 100%;
  max-width: 350px;
}

.audio-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 0.5rem;
  cursor: pointer;
  transition: background-color 0.2s;
}

.audio-container:hover {
  background: rgba(0, 0, 0, 0.1);
}

.audio-icon {
  font-size: 1.5rem;
  color: #6b7280;
  flex-shrink: 0;
}

.audio-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
  min-width: 0;
}

.audio-filename {
  font-size: 0.875rem;
  font-weight: 500;
  color: inherit;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-caption {
  font-size: 0.75rem;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.audio-player {
  width: 100%;
  height: 32px;
  margin-top: 0.5rem;
}

.message-sent .audio-icon {
  color: rgba(255, 255, 255, 0.8);
}

.message-sent .audio-container {
  background: rgba(255, 255, 255, 0.1);
}

.message-sent .audio-container:hover {
  background: rgba(255, 255, 255, 0.2);
}

.message-sent .audio-caption {
  color: rgba(255, 255, 255, 0.7);
}

.message-meta {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  justify-content: flex-end;
}

.message-timestamp {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-timestamp.failed {
  color: #ef4444;
}

.message-timestamp.sending {
  color: #f59e0b;
  font-style: italic;
}

.message-actions {
  display: flex;
  align-items: center;
  gap: 0.25rem;
}

.retry-button {
  font-size: 0.75rem;
  color: #ef4444;
  cursor: pointer;
  transition: color 0.2s;
}

.retry-button:hover {
  color: #dc2626;
}

.message-read-status {
  font-size: 0.75rem;
  color: #9ca3af;
}

.message-sent .message-read-status {
  color: #3b82f6;
}

@media (max-width: 767px) {
  .message-bubble {
    max-width: 85%;
  }
}
</style>