<script setup lang="ts">
import { onMounted } from 'vue';
import { useChatStore } from '~/stores/chat';

const chatStore = useChatStore();

onMounted(() => {
  chatStore.initChat();
});
</script>

<template>
  <ChatApp />
</template>