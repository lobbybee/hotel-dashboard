export type SenderType = 'guest' | 'staff' | 'system';
export type MessageType = 'text' | 'media' | 'image' | 'document' | 'video' | 'audio' | 'system';

export interface GuestInfo {
  id: number;
  full_name: string;
  email: string;
  whatsapp_number: string;
  date_of_birth: string;
  nationality: string;
  status: string;
  room_number: string;
  floor: number;
}

export interface MessageGuestInfo {
  id: number;
  name: string;
  whatsapp_number: string;
  room_number: string;
  floor: number;
}

export interface Message {
  id: number;
  conversation: number;
  sender_type: SenderType;
  sender: number | null;
  sender_name: string;
  message_type: MessageType;
  content: string;
  media_url: string | null;
  media_filename: string | null;
  is_read: boolean;
  read_at: string | null;
  guest_info: MessageGuestInfo;
  time_ago: string;
  created_at: string;
  updated_at: string;
  conversationId?: number; // For client-side mapping
}

export interface Conversation {
  id: number;
  guest: number;
  hotel: string;
  department: string;
  status: 'active' | 'closed';
  guest_info: GuestInfo;
  hotel_name: string;
  last_message_at: string;
  last_message_preview: string;
  unread_count: number;
  last_message: Message | null;
  created_at: string;
  updated_at: string;
}

export interface ConversationDetailsResponse {
  conversation: Conversation;
  messages: Message[];
}
