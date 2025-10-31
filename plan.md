# Chat Implementation Plan

This document outlines the steps to implement a real-time chat feature using Nuxt 3, Pinia, and a WebSocket/REST API backend.

## 1. Project Structure

Create the following files:

-   `composables/useChat.ts`: For chat-related data fetching and actions.
-   `stores/chat.ts`: (Update existing) for state management.
-   `composables/useWebSocket.ts`: To manage the WebSocket connection.
-   `composables/useChatHandlers.ts`: To handle incoming WebSocket messages.
-   `types/chat.ts`: For chat-related type definitions.

## 2. WebSocket Management (`composables/`)

### `useWebSocket.ts`

-   Create a `WebSocketManager` class or composable.
-   It should be a singleton to ensure only one WebSocket connection.
-   **Methods:**
    -   `connect(token: string)`: Establishes the WebSocket connection.
    -   `disconnect()`: Closes the connection.
    -   `sendMessage(message: object)`: Sends a JSON message to the server.
    -   `onMessage(callback: (data: any) => void)`: Registers a callback for incoming messages.
-   **Properties:**
    -   `isConnected: Ref<boolean>`: A reactive property for the connection status.

### `useChatHandlers.ts`

-   This file will contain functions to process different types of incoming WebSocket messages (`new_message`, `new_conversation`).
-   These handlers will be called from the `onMessage` callback in `useWebSocket.ts`.
-   They will dispatch actions to the Pinia `chat` store to update the state.

## 3. Type Definitions (`types/chat.ts`)

Create TypeScript interfaces based on the API documentation for:

-   `Conversation`
-   `Message`
-   `SenderType` (enum: 'guest', 'staff', 'system')

## 4. Chat Composable (`composables/useChat.ts`)

-   This composable will provide functions to interact with the chat API.
-   It will use `useAPI` for REST calls.
-   **Functions:**
    -   `fetchConversations()`: GET `/api/message_manager/conversations/`
    -   `fetchMessages(conversationId: number)`: GET `/api/message_manager/conversations/{id}/messages/`
    -   `sendMessage(conversationId: number, text: string)`: POST `/api/message_manager/conversations/{id}/send_message/`
    -   `subscribeToConversation(stayId: number)`: Uses WebSocket manager to send `subscribe_to_conversation` command.
    -   `unsubscribeFromConversation(stayId: number)`: Uses WebSocket manager to send `unsubscribe_from_conversation` command.

## 5. Pinia Store (`stores/chat.ts`)

-   Remove all mock data.
-   **State:**
    -   `conversations: Ref<Conversation[]>`
    -   `messages: Ref<Message[]>`
    -   `selectedConversationId: Ref<number | null>`
    -   `isLoadingConversations: Ref<boolean>`
    -   `isLoadingMessages: Ref<boolean>`
-   **Getters:**
    -   `selectedConversation: ComputedRef<Conversation | undefined>`
    -   `currentMessages: ComputedRef<Message[]>`
-   **Actions:**
    -   `initChat()`:
        -   Fetch conversations.
        -   Connect to WebSocket.
        -   Setup message handlers.
    -   `selectConversation(conversationId: number)`:
        -   Set `selectedConversationId`.
        -   Fetch messages for the selected conversation.
        -   Subscribe to the conversation via WebSocket.
    -   `handleNewMessage(message: Message)`: Pushes a new message to the `messages` array for the correct conversation.
    -   `handleNewConversation(conversation: Conversation)`: Adds a new conversation to the `conversations` array.
    -   `sendMessage(text: string)`: Sends a message for the currently selected conversation.

## 6. Component Integration

-   **`pages/chat.vue` / `components/Chat/App.vue`**:
    -   On mount, call `chatStore.initChat()`.
-   **`components/Chat/ContactsList.vue`**:
    -   Display `chatStore.conversations`.
    -   On contact click, call `chatStore.selectConversation(conversation.id)`.
-   **`components/Chat/Window.vue`**:
    -   Display `chatStore.currentMessages`.
-   **`components/Chat/MessageInput.vue`**:
    -   On send, call `chatStore.sendMessage(text)`.
