import { ref } from 'vue';

class WebSocketManager {
  private static instance: WebSocketManager;
  private ws: WebSocket | null = null;
  public isConnected = ref(false);
  private onMessageCallback: ((data: any) => void) | null = null;

  private constructor() {}

  public static getInstance(): WebSocketManager {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  connect(token: string) {
    console.log('Connecting to WebSocket...');
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      return;
    }

    // Replace with your actual WebSocket URL
        const wsUrl = `wss://backend.lobbybee.com/ws/chat/?token=${encodeURIComponent(token)}`;
        // const wsUrl = `ws://localhost:8000/ws/chat/?token=${encodeURIComponent(token)}`;
        this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.isConnected.value = true;
      console.log('WebSocket connected');
    };

    this.ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (this.onMessageCallback) {
        this.onMessageCallback(data);
      }
    };

    this.ws.onclose = () => {
      this.isConnected.value = false;
      this.ws = null;
      console.log('WebSocket disconnected');
    };

    this.ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      this.isConnected.value = false;
      this.ws = null;
    };
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }

  sendMessage(message: object) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected.');
    }
  }

  onMessage(callback: (data: any) => void) {
    this.onMessageCallback = callback;
  }
}

// Type definitions for WebSocket messages
export interface NewCheckinData {
  conversation_id: string;
  booking_id: string;
  stay_id: string;
  guest_id: string;
  guest_name: string;
  hotel_id: string;
  hotel_name: string;
  check_in_date: string;
  check_out_date: string;
  guest_whatsapp: string;
  status: string;
  created_at: string;
  message: string;
  link: string;
  link_label: string;
}

export interface WebSocketMessage {
  type: string;
  data?: any;
}

export type NewCheckinMessage = WebSocketMessage & {
  type: 'new_checkin';
  data: NewCheckinData;
};

export const useWebSocket = () => WebSocketManager.getInstance();
