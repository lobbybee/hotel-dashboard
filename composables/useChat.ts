import { useAPI } from './useAPI';
import { useWebSocket } from './useWebSocket';
import { useAPIHelper } from './useAPIHelper';
import type { Conversation, Message, ConversationDetailsResponse } from '~/types/chat';

interface MediaUploadResponse {
  file_url: string;
  filename: string;
  file_type: string;
  file_size: number;
  caption?: string;
  conversation_id: number;
}

export const useChat = () => {
  const { API } = useAPI();
  const { getResults, getData } = useAPIHelper();
  const ws = useWebSocket();

  const fetchConversations = async () => {
    const response = await API('/chat/conversations/');
    console.log(response);
    return getResults<Conversation>(response);
  };

  const fetchMessages = async (conversationId: number) => {
    const response = await API(`/chat/conversations/${conversationId}`);
    return getData<ConversationDetailsResponse>(response);
  };


  const subscribeToConversation = (conversationId: number) => {
    ws.sendMessage({
      type: 'subscribe_conversation',
      conversation_id: conversationId,
    });
  };

  const unsubscribeFromConversation = (conversationId: number) => {
    ws.sendMessage({
      type: 'unsubscribe_conversation',
      conversation_id: conversationId,
    });
  };

  const sendWebSocketMessage = (conversationId: number, content: string) => {
    ws.sendMessage({
      type: 'text',
      conversation_id: conversationId,
      content,
    });
  };

  const markAsRead = (conversationId: number) => {
    ws.sendMessage({
      type: 'mark_read',
      conversation_id: conversationId,
    });
  };

  const sendTypingIndicator = (conversationId: number, isTyping: boolean) => {
    ws.sendMessage({
      type: 'typing',
      conversation_id: conversationId,
      is_typing: isTyping,
    });
  };

  const closeConversation = (conversationId: number) => {
    ws.sendMessage({
      type: 'close_conversation',
      conversation_id: conversationId,
    });
  };

  const reopenTemporaryConversation = (conversationId: number) => {
    ws.sendMessage({
      type: 'reopen-temporary',
      conversation_id: conversationId,
    });
  };

  const uploadMedia = async (conversationId: number, file: File, caption?: string): Promise<MediaUploadResponse> => {
    const formData = new FormData();
    formData.append('conversation_id', conversationId.toString());
    formData.append('file', file);
    if (caption) {
      formData.append('caption', caption);
    }

    const response = await API('/chat/upload-media/', {
      method: 'POST',
      body: formData,
    });

    return getData<MediaUploadResponse>(response);
  };

  const sendMediaMessage = (conversationId: number, fileUrl: string, filename: string, fileType: string, caption?: string) => {
    ws.sendMessage({
      type: 'media',
      conversation_id: conversationId,
      file_url: fileUrl,
      filename,
      file_type: fileType,
      caption: caption || '',
    });
  };

  return {
    fetchConversations,
    fetchMessages,
    subscribeToConversation,
    unsubscribeFromConversation,
    sendWebSocketMessage,
    markAsRead,
    sendTypingIndicator,
    closeConversation,
    reopenTemporaryConversation,
    uploadMedia,
    sendMediaMessage,
  };
};
