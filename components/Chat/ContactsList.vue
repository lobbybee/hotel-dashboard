<template>
  <div class="contacts-list">
    <!-- Search bar -->
    <div class="search-section flex">
      <div class="p-input-icon-left w-full flex gap-3 items-center">
        <i class="pi pi-search" />
        <InputText
          v-model="searchQuery"
          placeholder="Search conversations..."
          class="w-full"
        />
      </div>
    </div>

    <!-- Contacts -->
    <div class="contacts-scroll">
      <div v-if="chatStore.isLoadingConversations" class="p-4 text-center">Loading...</div>
      <div
        v-for="conversation in filteredConversations"
        :key="conversation.id"
        :class="[
          'contact-item',
          { 'contact-active': conversation.id === chatStore.selectedConversationId }
        ]"
        @click="selectConversation(conversation)"
      >
        <div class="contact-avatar-wrapper">
          <Avatar
            :label="conversation.guest_info.room_number"
            size="large"
            class="contact-avatar"
          />
        </div>

        <div class="contact-info">
          <div class="contact-header">
            <h3 class="contact-name">{{ conversation.guest_info.room_number }} - Floor {{ conversation.guest_info.floor }}</h3>
            <div class="header-badges">
              <Badge
                v-if="isConversationExpired(conversation)"
                value="Expired"
                severity="warning"
                class="expired-badge"
              />
              <Badge
                v-if="conversation.unread_count > 0"
                :value="conversation.unread_count"
                severity="danger"
                class="unread-badge"
              />
            </div>
          </div>
          <p class="guest-name">{{ conversation.guest_info.full_name }}</p>
          <p class="last-message">{{ conversation.last_message_preview }}</p>
          <span class="last-seen">{{ conversation.last_message.time_ago }}</span>
        </div>
      </div>

      <div v-if="!chatStore.isLoadingConversations&&filteredConversations && filteredConversations.length === 0" class="no-contacts">
        <i class="pi pi-inbox"></i>
        <p>No conversations found</p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useChatStore } from '~/stores/chat';
import type { Conversation } from '~/types/chat';

const chatStore = useChatStore();
const searchQuery = ref('');

// Check if a conversation is expired (last message more than 2 minutes ago)
const isConversationExpired = (conversation: Conversation) => {
  if (!conversation.last_message_at) return false;
  
  const lastMessageTime = new Date(conversation.last_message_at).getTime();
  const currentTime = new Date().getTime();
  const twoMinutesInMs = 2 * 60 * 1000;
  
  return (currentTime - lastMessageTime) > twoMinutesInMs;
};

const filteredConversations = computed(() => {
  console.log('Filtering conversations...',chatStore.conversations);
  if (!searchQuery.value) return chatStore.conversations;
  return chatStore.conversations.filter(conversation =>
    conversation.guest_info.full_name.toLowerCase().includes(searchQuery.value.toLowerCase()) ||
    conversation.guest_info.room_number.toLowerCase().includes(searchQuery.value.toLowerCase())
  );
});

const selectConversation = (conversation: Conversation) => {
  chatStore.selectConversation(conversation.id);
  if (window.innerWidth < 768) {
    chatStore.closeSidebar(); // Assuming this function exists in the new store
  }
};
</script>

<style scoped>
.contacts-list {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.search-section {
  padding: 1rem;
  border-bottom: 1px solid #e5e7eb;
  background: white;
}

.contacts-scroll {
  flex: 1;
  overflow-y: auto;
}

.contact-item {
  display: flex;
  align-items: center;
  padding: 1rem;
  cursor: pointer;
  border-bottom: 1px solid #f3f4f6;
  transition: background-color 0.2s ease;
  gap: 0.75rem;
}

.contact-item:hover {
  background-color: #f9fafb;
}

.contact-active {
  background-color: #dbeafe !important;
  border-right: 3px solid #3b82f6;
}

.contact-avatar-wrapper {
  position: relative;
  flex-shrink: 0;
}

.contact-avatar {
  width: 48px;
  height: 48px;
  font-size: 14px;
  border-radius: 4px;
}

.contact-info {
  flex: 1;
  min-width: 0;
}

.contact-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.25rem;
}

.contact-name {
  font-size: 0.875rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  flex: 1;
}

.header-badges {
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.expired-badge {
  font-size: 0.625rem;
  padding: 0.125rem 0.375rem;
  background: #fef3c7 !important;
  color: #92400e !important;
  border: 1px solid #f59e0b !important;
}

.unread-badge {
  font-size: 0.75rem;
  min-width: 18px;
  height: 18px;
}

.guest-name {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0 0 0.25rem 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.3;
}

.last-message {
  font-size: 0.8125rem;
  color: #6b7280;
  margin: 0;
  text-overflow: ellipsis;
  overflow: hidden;
  white-space: nowrap;
  line-height: 1.3;
}

.last-seen {
  font-size: 0.75rem;
  color: #9ca3af;
  margin-top: 0.25rem;
}

.no-contacts {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  color: #6b7280;
  text-align: center;
}

.no-contacts i {
  font-size: 2rem;
  margin-bottom: 0.5rem;
}

.no-contacts p {
  margin: 0;
  font-size: 0.875rem;
}
</style>
