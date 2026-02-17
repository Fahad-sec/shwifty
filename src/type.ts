import {Socket} from "socket.io-client"

export interface Messages {
  user_id: string;
  id: number;
  content: string;
  username: string;
  room_id: string;
  created_at: string;
}

export interface ChatUser {
  username: string;
  id: string;
}

export interface ServiceBag {
  getHistory: (roomId?: string) => Promise<Messages[]>;
  loadOnlineUsers: (onUserClick: (user: ChatUser) => void) => Promise<void>;
  socket: Socket;
}