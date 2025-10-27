import { useChatStore } from '~/stores/chat';
import type { Message, Conversation } from '~/types/chat';

export const handleWebSocketMessage = (data: any) => {
  const chatStore = useChatStore();

  switch (data.type) {
    case 'message':
      console.log('Received message:', data);
      // Map incoming data to Message type
      const message: Message = {
        id: data.data.id,
        conversation: data.data.conversation_id,
        sender_type: data.data.sender_type,
        sender: data.data.sender_id,
        sender_name: data.data.sender_name,
        message_type: data.data.message_type,
        content: data.data.content,
        media_url: data.data.media_url,
        media_filename: data.data.media_filename,
        is_read: data.data.is_read,
        read_at: null,
        guest_info: {
          id: data.data.guest_info.id,
          name: data.data.guest_info.name,
          whatsapp_number: data.data.guest_info.whatsapp_number,
          room_number: data.data.guest_info.room_number,
          floor: 0, // Default floor if not provided
        },
        time_ago: '', // Will be computed in UI if needed
        created_at: data.data.created_at,
        updated_at: data.data.updated_at,
      };
      chatStore.handleNewMessage(message);
      break;
    case 'new_conversation':
      console.log('Received new conversation:', data);
      chatStore.handleNewConversation(data as Conversation);
      break;
    case 'conversation_update':
      console.log('Received conversation update:', data);
      chatStore.handleConversationUpdate(data as Conversation);
      break;
    case 'typing':
      console.log('Received typing indicator:', data);
      chatStore.handleTypingIndicator(data);
      break;
    case 'user_status':
      console.log('Received user status update:', data);
      chatStore.handleUserStatus(data);
      break;

    case 'acknowledgment':
      console.log('Received acknowledgment:', data);
      chatStore.handleAcknowledgment(data);
      break;

    case 'error':
        chatStore.handleChatError(data.message || data); // Handle both formats
        break;

    default:
      console.log('Unknown WebSocket message type:', data.type);
      console.warn('Unknown WebSocket message type:', data.type);
  }
};
