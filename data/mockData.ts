export interface Contact {
  id: number
  name: string
  avatar: string
  online: boolean
  lastMessage: string
  unreadCount: number
  lastSeen: string
}

export interface Message {
  id: number
  contactId: number
  text?: string
  type: 'text' | 'image' | 'audio' | 'file'
  mediaUrl?: string
  fileName?: string
  timestamp: string
  isMe: boolean
}

export const mockContacts: Contact[] = [
  {
    id: 1,
    name: "Sarah Johnson",
    avatar: "https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150",
    online: true,
    lastMessage: "Thanks for the update! 👍",
    unreadCount: 2,
    lastSeen: "2 minutes ago"
  },
  {
    id: 2,
    name: "Mike Chen",
    avatar: "https://images.pexels.com/photos/1040880/pexels-photo-1040880.jpeg?auto=compress&cs=tinysrgb&w=150",
    online: true,
    lastMessage: "Let's schedule the meeting",
    unreadCount: 0,
    lastSeen: "5 minutes ago"
  },
  {
    id: 3,
    name: "Emily Davis",
    avatar: "https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150",
    online: false,
    lastMessage: "See you tomorrow!",
    unreadCount: 1,
    lastSeen: "1 hour ago"
  },
  {
    id: 4,
    name: "Alex Rodriguez",
    avatar: "https://images.pexels.com/photos/1043471/pexels-photo-1043471.jpeg?auto=compress&cs=tinysrgb&w=150",
    online: false,
    lastMessage: "Great work on the project",
    unreadCount: 0,
    lastSeen: "3 hours ago"
  },
  {
    id: 5,
    name: "Lisa Wong",
    avatar: "https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=150",
    online: true,
    lastMessage: "Can you review the document?",
    unreadCount: 0,
    lastSeen: "online"
  }
]

export const mockMessages: Message[] = [
  {
    id: 1,
    contactId: 1,
    text: "Hey! How's the project coming along?",
    type: 'text',
    timestamp: "10:30 AM",
    isMe: false
  },
  {
    id: 2,
    contactId: 1,
    text: "Making good progress! Just finished the UI components.",
    type: 'text',
    timestamp: "10:32 AM",
    isMe: true
  },
  {
    id: 3,
    contactId: 1,
    type: 'image',
    mediaUrl: "https://images.pexels.com/photos/196644/pexels-photo-196644.jpeg?auto=compress&cs=tinysrgb&w=300",
    text: "Here's a screenshot of the current progress",
    timestamp: "10:35 AM",
    isMe: true
  },
  {
    id: 4,
    contactId: 1,
    text: "Looks fantastic! The design is really clean.",
    type: 'text',
    timestamp: "10:37 AM",
    isMe: false
  },
  {
    id: 5,
    contactId: 1,
    type: 'file',
    fileName: "requirements.pdf",
    text: "Here are the updated requirements",
    timestamp: "10:40 AM",
    isMe: false
  },
  {
    id: 6,
    contactId: 1,
    type: 'audio',
    text: "Voice message",
    timestamp: "10:42 AM",
    isMe: true
  },
  {
    id: 7,
    contactId: 1,
    text: "Thanks for the update! 👍",
    type: 'text',
    timestamp: "10:45 AM",
    isMe: false
  }
]