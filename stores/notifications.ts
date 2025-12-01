import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export interface Notification {
  id: string;
  type: 'chat' | 'checkin' | 'checkout' | 'service_request' | 'info' | 'warning' | 'success';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any; // Additional data related to the notification
}

export const useNotificationStore = defineStore('notifications', () => {
  const notifications = ref<Notification[]>([]);

  // Computed property for unread count
  const unreadCount = computed(() => {
    return notifications.value.filter(n => !n.read).length;
  });

  // Computed property for unread chat notifications
  const unreadChatCount = computed(() => {
    return notifications.value.filter(n => !n.read && n.type === 'chat').length;
  });

  // Add a new notification
  const addNotification = (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false
    };
    
    notifications.value.unshift(newNotification);
    
    // Auto-remove notifications after 10 seconds (except chat notifications)
    if (notification.type !== 'chat') {
      setTimeout(() => {
        removeNotification(newNotification.id);
      }, 10000);
    }
    
    return newNotification.id;
  };

  // Add a chat notification
  const addChatNotification = (conversationId: number, guestName: string, message: string, roomNumber?: string) => {
    return addNotification({
      type: 'chat',
      title: `New message from ${guestName}`,
      message: message,
      data: {
        conversationId,
        guestName,
        roomNumber
      }
    });
  };

  // Mark notification as read
  const markAsRead = (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('Invalid notification ID provided for marking as read:', id);
        return;
      }
      
      const notification = notifications.value.find(n => n && n.id === id);
      if (notification) {
        notification.read = true;
      }
    } catch (error) {
      console.error('Error marking notification as read:', error, 'ID:', id);
    }
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    notifications.value.forEach(n => n.read = true);
  };

  // Remove notification
  const removeNotification = (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('Invalid notification ID provided:', id);
        return;
      }
      
      const index = notifications.value.findIndex(n => n && n.id === id);
      if (index > -1) {
        notifications.value.splice(index, 1);
      }
    } catch (error) {
      console.error('Error removing notification:', error, 'ID:', id);
    }
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    notifications.value = [];
  };

  // Clear all read notifications
  const clearReadNotifications = () => {
    notifications.value = notifications.value.filter(n => !n.read);
  };

  return {
    notifications,
    unreadCount,
    unreadChatCount,
    addNotification,
    addChatNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAllNotifications,
    clearReadNotifications
  };
});