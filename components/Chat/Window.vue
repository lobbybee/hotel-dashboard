<template>
  <div class="chat-window" :class="{ 'connected': chatStore.isConnected }">
    <!-- Connection Alert Banner -->
    <div v-if="!chatStore.isConnected" class="connection-alert">
      <div class="alert-content">
        <i class="pi pi-exclamation-triangle alert-icon"></i>
        <span class="alert-text">Connection lost. Messages may not be delivered.</span>
        <Button 
          label="Reconnect" 
          size="small" 
          @click="handleReconnect"
          class="reconnect-btn"
        />
      </div>
    </div>

    <!-- Disconnection Overlay -->
    <div v-if="!chatStore.isConnected" class="disconnection-overlay"></div>

    <!-- Chat header -->
    <div class="chat-header" :class="{ 'disconnected': !chatStore.isConnected }">
      <div v-if="chatStore.selectedConversation" class="header-content">
        <div class="header-left">
          <!-- Mobile sidebar toggle -->
          <Button
            icon="pi pi-bars"
            text
            @click="chatStore.toggleSidebar"
            class="sidebar-toggle mobile-only"
          />
          
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
        </div>
        
        <div class="header-actions">
          <div :class="['connection-status', { 'connected': chatStore.isConnected, 'disconnected': !chatStore.isConnected }]">
            <i :class="['pi', chatStore.isConnected ? 'pi-check-circle' : 'pi-times-circle']"></i>
            <span>{{ chatStore.isConnected ? 'Connected' : 'Disconnected' }}</span>
          </div>
          <Button 
            icon="pi pi-ellipsis-v" 
            text 
            rounded 
            @click="toggleMenu"
          />
          <Menu ref="menu" :model="menuItems" popup />
        </div>
      </div>
       <div v-else class="header-content no-contact-selected">
         <!-- Mobile sidebar toggle when no conversation selected -->
         <Button
           icon="pi pi-bars"
           text
           @click="chatStore.toggleSidebar"
           class="sidebar-toggle mobile-only"
         />
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
    <MessageInput v-if="chatStore.selectedConversation && chatStore.selectedConversation.status !== 'closed'" />
    
    <!-- Conversation closed message -->
    <div v-else-if="chatStore.selectedConversation && chatStore.selectedConversation.status === 'closed'" class="conversation-closed">
      <Card>
        <template #content>
          <div class="closed-content">
            <i class="pi pi-lock closed-icon"></i>
            <span>This conversation has been closed</span>
          </div>
        </template>
      </Card>
    </div>
  </div>
</template>

<script setup lang="ts">
import MessageBubble from './MessageBubble.vue';
import MessageInput from './MessageInput.vue';
import { useChatStore } from '~/stores/chat';
import { useChat } from '~/composables/useChat';
import { ref, watch, nextTick, onMounted } from 'vue';

const chatStore = useChatStore();
const chatComposable = useChat();
const messagesContainer = ref<HTMLElement>();
const menu = ref();

const menuItems = [
  {
    label: 'Close Conversation',
    icon: 'pi pi-times',
    command: () => handleCloseConversation()
  }
];

const toggleMenu = (event: Event) => {
  menu.value.toggle(event);
};

const handleCloseConversation = () => {
  if (chatStore.selectedConversationId) {
    chatComposable.closeConversation(chatStore.selectedConversationId);
  }
};

const handleReconnect = () => {
  chatStore.reconnectWebSocket();
};

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
  position: relative;
}

.connection-alert {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  z-index: 1000;
  background: #fef2f2;
  border-bottom: 1px solid #fecaca;
}

.alert-content {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: #fee2e2;
}

.alert-icon {
  color: #dc2626;
  font-size: 1rem;
}

.alert-text {
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
  flex: 1;
}

.reconnect-btn {
  background: #dc2626 !important;
  color: white !important;
  border: none !important;
  padding: 0.25rem 0.75rem !important;
  font-size: 0.75rem !important;
}

.reconnect-btn:hover {
  background: #b91c1c !important;
}

.disconnection-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.1);
  z-index: 999;
  pointer-events: none;
}

.chat-header {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
  flex-shrink: 0;
  transition: opacity 0.3s ease;
}

.chat-header.disconnected {
  opacity: 0.6;
  pointer-events: none;
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

.header-left {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.contact-info {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.sidebar-toggle {
  padding: 0.5rem !important;
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
  transition: opacity 0.3s ease;
}

.chat-window:not(.connected) .messages-container {
  opacity: 0.6;
  pointer-events: none;
}

.messages-list {
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  min-height: 100%;
}

.conversation-closed {
  padding: 1rem;
  background: #f9fafb;
  border-top: 1px solid #e5e7eb;
}

.closed-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 0;
  color: #6b7280;
  font-style: italic;
}

.closed-icon {
  font-size: 1.5rem;
  color: #9ca3af;
}

.mobile-only {
  display: none;
}

@media (max-width: 767px) {
  .mobile-only {
    display: flex;
  }

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
