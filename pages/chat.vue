<script setup lang="ts">
import { onMounted } from 'vue';
import { useChatStore } from '~/stores/chat';

const chatStore = useChatStore();


// Only initialize if not already connected
onMounted(() => {
  if (!chatStore.isConnected.value) {
    chatStore.initChat();
  }
});

</script>

<template>
  <ChatApp />
</template>
