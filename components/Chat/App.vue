<template>
  <div class="chat-app">
    <!-- Mobile header -->
    <div class="mobile-header">
      <Button
        icon="pi pi-bars"
        text
        @click="chatStore.toggleSidebar"
        class="sidebar-toggle"
      />
      <h1 class="app-title">Chat</h1>
    </div>

    <!-- Sidebar overlay for mobile -->
    <div
      v-if="chatStore.sidebarVisible"
      class="sidebar-overlay"
      @click="chatStore.closeSidebar"
    ></div>

    <!-- Main content -->
    <div class="chat-container">
      <!-- Contacts sidebar -->
      <div :class="['contacts-sidebar', { 'sidebar-open': chatStore.sidebarVisible }]">
        <ContactsList />
      </div>

      <!-- Chat area -->
      <div class="chat-area">
        <ChatWindow />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import ContactsList from './ContactsList.vue'
import ChatWindow from './Window.vue'
import { useChatStore } from '~/stores/chat'

const chatStore = useChatStore()

onMounted(() => {
  // Close sidebar when resizing to desktop
  const handleResize = () => {
    if (window.innerWidth >= 768) {
      chatStore.closeSidebar()
    }
  }
  window.addEventListener('resize', handleResize)
})
</script>

<style scoped>
.chat-app {
  height: 90vh;
  display: flex;
  flex-direction: column;
  background-color: #f8f9fa;
}

.mobile-header {
  display: none;
  align-items: center;
  padding: 1rem;
  background: white;
  border-bottom: 1px solid #e5e7eb;
  gap: 1rem;
}

.app-title {
  font-size: 1.25rem;
  font-weight: 600;
  margin: 0;
  color: #1f2937;
}

.sidebar-toggle {
  padding: 0.5rem !important;
}

.sidebar-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 998;
  display: none;
}

.chat-container {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.contacts-sidebar {
  width: 30%;
  min-width: 320px;
  background: white;
  border-right: 1px solid #e5e7eb;
}

.chat-area {
  flex: 1;
  display: flex;
  flex-direction: column;
}

/* Mobile styles */
@media (max-width: 767px) {
  .mobile-header {
    display: flex;
  }

  .contacts-sidebar {
    position: fixed;
    top: 0;
    left: -100%;
    width: 80%;
    height: 100vh;
    z-index: 999;
    transition: left 0.3s ease;
    box-shadow: 2px 0 8px rgba(0, 0, 0, 0.1);
  }

  .sidebar-open {
    left: 0;
  }

  .sidebar-overlay {
    display: block;
  }

  .chat-area {
    width: 100%;
  }
}
</style>
