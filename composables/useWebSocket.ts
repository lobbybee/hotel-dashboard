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

export const useWebSocket = () => WebSocketManager.getInstance();
