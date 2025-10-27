<template>
  <div class="chat-window">
    <!-- Chat header -->
    <div class="chat-header">
      <div v-if="chatStore.selectedConversation" class="header-content">
        <div class="contact-info">
          <Avatar
            :label="chatStore.selectedConversation.guest_info.full_name.charAt(0)"
            size="large"
            shape="circle"
            class="header-avatar"
          />
          <div class="contact-details">
            <h2 class="contact-name">{{ chatStore.selectedConversation.guest_info.full_name }}</h2>
            <span class="contact-status">Room {{ chatStore.selectedConversation.guest_info.room_number }}</span>
          </div>
        </div>
        <div class="header-actions">
          <div :class="['connection-status', { 'connected': chatStore.isConnected, 'disconnected': !chatStore.isConnected }]">
            <i :class="['pi', chatStore.isConnected ? 'pi-check-circle' : 'pi-times-circle']"></i>
            <span>{{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <Button icon="pi pi-ellipsis-v" text rounded />
        </div>
      </div>
       <div v-else class="header-content no-contact-selected">
         <p>Select a conversation to start chatting</p>
       </div>
    </div>

    <!-- Messages area -->
    <div class="messages-container" ref="messagesContainer">
       <div v-if="chatStore.isLoadingMessages" class="p-4 text-center">Loading messages...</div>
      <div v-else class="messages-list">
        <MessageBubble
          v-for="message in chatStore.currentMessages"
          :key="message.id"
          :message="message"
        />
      </div>
    </div>

    <!-- Message input -->
    <MessageInput v-if="chatStore.selectedConversation" />
  </div>
</template>

<script setup lang="ts">
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';
import { useChatStore } from '~/stores/chat';
import { ref, watch, nextTick, onMounted } from 'vue';

const chatStore = useChatStore();
const messagesContainer = ref<HTMLElement>();

const scrollToBottom = () => {
  nextTick(() => {
    if (messagesContainer.value) {
      messagesContainer.value.scrollTop = messagesContainer.value.scrollHeight;
    }
  });
};

watch(
  () => chatStore.currentMessages,
  () => {
    scrollToBottom();
  },
  { deep: true, immediate: true }
);

onMounted(() => {
  scrollToBottom();
});
</script>

<style scoped>
.chat-window {
  display: flex;
  flex-direction: column;
  height: 100%;
  max-height: 90vh;
  background: white;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
}

.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.no-contact-selected {
  justify-content: center;
  color: #6b7280;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.header-avatar {
  width: 40px;
  height: 40px;
}

.contact-details {
  display: flex;
  flex-direction: column;
}

.contact-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.contact-status {
  font-size: 0.8125rem;
  color: #6b7280;
}

.header-actions {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.connection-status {
  display: flex;
  align-items: center;
  gap: 0.25rem;
  font-size: 0.75rem;
  padding: 0.25rem 0.5rem;
  border-radius: 0.25rem;
  background: #f3f4f6;
}

.connection-status.connected {
  background: #dcfce7;
  color: #166534;
}

.connection-status.disconnected {
  background: #fee2e2;
  color: #991b1b;
}

.connection-status i {
  font-size: 0.875rem;
}

.messages-container {
  flex: 1;
  overflow-y: auto;
  background: #f9fafb;
  padding: 0;
}

.messages-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
}

@media (max-width: 767px) {
  .chat-header {
    padding: 0.75rem 1rem;
  }

  .header-actions {
    gap: 0.25rem;
  }

  .messages-list {
    padding: 0.75rem;
  }
}
</style>
