import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { useChat } from '~/composables/useChat';
import { useWebSocket } from '~/composables/useWebSocket';
import { useAuthStore } from './auth';
import { handleWebSocketMessage } from '~/composables/useChatHandlers';
import type { Conversation, Message, ConversationDetailsResponse } from '~/types/chat';

interface MediaUploadResponse {
  success: boolean;
  file_url: string;
  filename: string;
  file_type: string;
  file_size: number;
  caption?: string;
  conversation_id: number;
}

export const useChatStore = defineStore('chat', () => {
  const conversations = ref<Conversation[]>([]);
  const messages = ref<Message[]>([]);
  const selectedConversationId = ref<number | null>(null);
  const isLoadingConversations = ref(false);
  const isLoadingMessages = ref(false);
  const sidebarVisible = ref(false);

  const chatComposable = useChat();
  const ws = useWebSocket();
  const authStore = useAuthStore();

  // Get auth token from cookie (same as useAPI)
  const authToken = useCookie<string | null>('auth_token');

  // WebSocket connection status
  const isConnected = computed(() => ws.isConnected.value);

  const selectedConversation = computed(() => {
    return conversations.value.find(c => c.id === selectedConversationId.value);
  });

  const currentMessages = computed(() => {
    if (!selectedConversationId.value) return [];
    return messages.value.filter(m => m.conversation === selectedConversationId.value);
  });

  const toggleSidebar = () => {
    sidebarVisible.value = !sidebarVisible.value;
  };

  const closeSidebar = () => {
    sidebarVisible.value = false;
  };

  const initChat = async () => {
    isLoadingConversations.value = true;
    try {
      // const test = await chatComposable.testFetch();
      conversations.value = await chatComposable.fetchConversations();
      console.log('Conversations fetched:', conversations.value);
      if (authToken.value) {
        console.log('Connecting to WebSocket with token...');
        ws.connect(authToken.value);
        ws.onMessage(handleWebSocketMessage);
      } else {
        console.log('No auth token available for WebSocket connection');
      }
    } catch (error) {
      console.error('Error initializing chat:', error);
    } finally {
      isLoadingConversations.value = false;
    }
  };

  const selectConversation = async (conversationId: number) => {
    if (selectedConversationId.value) {
      const previousConversation = conversations.value.find(c => c.id === selectedConversationId.value);
      if (previousConversation) {
        chatComposable.unsubscribeFromConversation(previousConversation.id);
      }
    }

    selectedConversationId.value = conversationId;
    isLoadingMessages.value = true;
    try {
      const response = await chatComposable.fetchMessages(conversationId);

      // Update the conversation in the list with the fetched data
      const index = conversations.value.findIndex(c => c.id === conversationId);
      if (index !== -1) {
        conversations.value[index] = response.conversation;
      }

      // Store the messages
      messages.value = response.messages;

      // Subscribe to the conversation
      chatComposable.subscribeToConversation(conversationId);

      // Mark conversation as read
      chatComposable.markAsRead(conversationId);

      // Refresh conversations to update unread indicators
      try {
        const updatedConversations = await chatComposable.fetchConversations();
        conversations.value = updatedConversations;
      } catch (refreshError) {
        console.error('Error refreshing conversations:', refreshError);
      }
    } catch (error) {
      console.error(`Error fetching conversation ${conversationId}:`, error);
    } finally {
      isLoadingMessages.value = false;
    }
  };

  const handleNewMessage = (message: Message) => {
    const conversation = conversations.value.find(c => c.id === message.conversation);
    if (conversation) {
      // Add message to messages array using spread to ensure reactivity
      messages.value = [...messages.value, message];

      // Update conversation's last message
      conversation.last_message = message;
      conversation.last_message_preview = message.content;
      conversation.last_message_at = message.created_at;

      // Increment unread count if message is from guest
      if (message.sender_type === 'guest') {
        conversation.unread_count = (conversation.unread_count || 0) + 1;
      }
    }
  };

  const handleNewConversation = (conversation: Conversation) => {
    conversations.value.unshift(conversation);
  };

  const handleConversationUpdate = (conversation: Conversation) => {
    const index = conversations.value.findIndex(c => c.id === conversation.id);
    if (index !== -1) {
      conversations.value[index] = conversation;
    }
  };

  const handleTypingIndicator = (data: any) => {
    // Handle typing indicators - could be added to UI state
    console.log('Typing indicator:', data);
  };

  const handleUserStatus = (data: any) => {
    // Handle user status changes - could be added to UI state
    console.log('User status change:', data);
  };

  const handleChatError = (data: any) => {
    console.error('Chat error:', data);
    // Could show error notification to user
  };

  const handleAcknowledgment = (data: any) => {
    console.log('Processing acknowledgment:', data);
    
    switch (data.status) {
      case 'received':
        // Message was sent successfully - update optimistic message
        if (data.message_id) {
          // Find the optimistic message (negative ID) that matches the conversation
          const optimisticMessage = messages.value.find(m => m.id < 0 && m.conversation === data.conversation_id);
          if (optimisticMessage) {
            optimisticMessage.id = data.message_id;
            optimisticMessage.time_ago = 'sent';
            // For media messages, update the content with the actual caption if provided
            if (data.message_type && data.message_type !== 'text' && data.caption !== undefined) {
              optimisticMessage.content = data.caption;
            }
          }
        }
        break;
        
      case 'marked_read':
        // Conversation marked as read - update conversation unread count
        if (data.conversation_id) {
          const conversation = conversations.value.find(c => c.id === data.conversation_id);
          if (conversation) {
            conversation.unread_count = 0;
          }
        }
        break;
        
      case 'subscribed':
        // Successfully subscribed to conversation
        console.log('Subscribed to conversation:', data.conversation_id);
        break;
        
      case 'unsubscribed':
        // Successfully unsubscribed from conversation
        console.log('Unsubscribed from conversation:', data.conversation_id);
        break;
        
      case 'conversation_closed':
        // Conversation was closed - update conversation status
        if (data.conversation_id) {
          const conversation = conversations.value.find(c => c.id === data.conversation_id);
          if (conversation) {
            conversation.status = 'closed';
          }
        }
        break;
        
      default:
        console.log('Unknown acknowledgment status:', data.status);
    }
  };

  const sendMessage = async (text: string) => {
    if (!selectedConversationId.value) return;

    // Create optimistic message for immediate display
    const optimisticMessage: Message = {
      id: -Date.now(), // Negative ID to identify optimistic messages
      conversation: selectedConversationId.value,
      sender_type: 'staff',
      sender: null,
      sender_name: 'You',
      message_type: 'text',
      content: text,
      media_url: null,
      media_filename: null,
      is_read: false,
      read_at: null,
      guest_info: {
        id: 0,
        name: '',
        whatsapp_number: '',
        room_number: '',
        floor: 0,
      },
      time_ago: 'sending...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Add optimistic message immediately
      messages.value = [...messages.value, optimisticMessage];
      
      // Send via WebSocket - acknowledgment will handle success/failure
      chatComposable.sendWebSocketMessage(selectedConversationId.value, text);
      
      // Set a fallback timeout to mark as failed if no acknowledgment comes back
      setTimeout(() => {
        const messageIndex = messages.value.findIndex(m => m.id === optimisticMessage.id);
        if (messageIndex !== -1) {
          const message = messages.value[messageIndex];
          if (message && message.time_ago === 'sending...') {
            message.time_ago = 'failed to send';
          }
        }
      }, 15000); // 15 seconds timeout
    } catch (error) {
      console.error('Error sending message:', error);
      // Mark optimistic message as failed
      const messageIndex = messages.value.findIndex(m => m.id === optimisticMessage.id);
      if (messageIndex !== -1) {
        const message = messages.value[messageIndex];
        if (message) {
          message.time_ago = 'failed to send';
        }
      }
    }
  };

  const retryMessage = async (messageId: number) => {
    const message = messages.value.find(m => m.id === messageId);
    if (message && message.id < 0) { // Only retry optimistic messages
      message.time_ago = 'sending...';
      try {
        if (message.message_type === 'text') {
          chatComposable.sendWebSocketMessage(message.conversation, message.content);
        } else if (message.message_type === 'media' && message.media_url) {
          // For media messages, we need to extract the file info and resend
          const fileType = message.content; // Store file type in content field for optimistic messages
          chatComposable.sendMediaMessage(message.conversation, message.media_url, message.media_filename || '', fileType);
        }
        
        // Set a fallback timeout for retry as well
        setTimeout(() => {
          const msgIndex = messages.value.findIndex(m => m.id === messageId);
          if (msgIndex !== -1) {
            const message = messages.value[msgIndex];
            if (message && message.time_ago === 'sending...') {
              message.time_ago = 'failed to send';
            }
          }
        }, 15000);
      } catch (error) {
        console.error('Error retrying message:', error);
        message.time_ago = 'failed to send';
      }
    }
  };

  const sendMediaMessage = async (file: File, caption?: string) => {
    if (!selectedConversationId.value) return;

    // Determine file type based on MIME type
    let fileType = 'document';
    if (file.type.startsWith('image/')) {
      fileType = 'image';
    } else if (file.type.startsWith('video/')) {
      fileType = 'video';
    } else if (file.type.startsWith('audio/')) {
      fileType = 'audio';
    }

    // Create optimistic message for immediate display
    const optimisticMessage: Message = {
      id: -Date.now(), // Negative ID to identify optimistic messages
      conversation: selectedConversationId.value,
      sender_type: 'staff',
      sender: null,
      sender_name: 'You',
      message_type: 'media',
      content: fileType, // Store file type in content for optimistic messages
      media_url: null, // Will be set after upload
      media_filename: file.name,
      is_read: false,
      read_at: null,
      guest_info: {
        id: 0,
        name: '',
        whatsapp_number: '',
        room_number: '',
        floor: 0,
      },
      time_ago: 'uploading...',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };

    try {
      // Add optimistic message immediately
      messages.value = [...messages.value, optimisticMessage];
      
      // Upload the file first
      const uploadResponse: MediaUploadResponse = await chatComposable.uploadMedia(
        selectedConversationId.value, 
        file, 
        caption
      );
      
      // Update optimistic message with upload response data
      const messageIndex = messages.value.findIndex(m => m.id === optimisticMessage.id);
      if (messageIndex !== -1) {
        const message = messages.value[messageIndex];
        if (message) {
          message.media_url = uploadResponse.file_url;
          message.content = caption || '';
          message.time_ago = 'sending...';
        }
      }
      
      // Send via WebSocket - acknowledgment will handle success/failure
      chatComposable.sendMediaMessage(
        selectedConversationId.value,
        uploadResponse.file_url,
        uploadResponse.filename,
        uploadResponse.file_type,
        uploadResponse.caption
      );
      
      // Set a fallback timeout to mark as failed if no acknowledgment comes back
      setTimeout(() => {
        const msgIndex = messages.value.findIndex(m => m.id === optimisticMessage.id);
        if (msgIndex !== -1) {
          const message = messages.value[msgIndex];
          if (message && message.time_ago === 'sending...') {
            message.time_ago = 'failed to send';
          }
        }
      }, 15000); // 15 seconds timeout
    } catch (error) {
      console.error('Error sending media message:', error);
      // Mark optimistic message as failed
      const messageIndex = messages.value.findIndex(m => m.id === optimisticMessage.id);
      if (messageIndex !== -1) {
        const message = messages.value[messageIndex];
        if (message) {
          message.time_ago = 'failed to upload';
        }
      }
    }
  };

  return {
    conversations,
    messages,
    selectedConversationId,
    isLoadingConversations,
    isLoadingMessages,
    selectedConversation,
    currentMessages,
    isConnected,
    initChat,
    selectConversation,
    handleNewMessage,
    handleNewConversation,
    handleConversationUpdate,
    handleTypingIndicator,
    handleUserStatus,
    handleChatError,
    handleAcknowledgment,
    sendMessage,
    retryMessage,
    sendMediaMessage,
    sidebarVisible,
    toggleSidebar,
    closeSidebar,
  };
});
