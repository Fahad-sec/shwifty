import {supaBase} from './supabase'
import {initChatUi} from "./initChatUI"
import {io, Socket} from "socket.io-client"

const socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ['polling', 'websocket']
})

interface Messages {
  user_id: string;
  id: number;
  created_at: string;
  content: string;
  username: string;
  room_id:string;

}
interface ServiceBag{
  getHistory: (roomId?: string) => Promise<Messages[]>;
  loadOnlineUsers: (onUserClick: (user: ChatUser) => void) => Promise<void>;
  socket: Socket
}
interface ChatUser {
  username: string;
  id:string;
}

async function startApp () {
  const {data: {session}} = await supaBase.auth.getSession();
  
   if (!session) return

  const userId = session.user.id;
  const username = session.user.user_metadata?.['username'] || session.user.user_metadata?.['display_name'] || 'Anonymous'

const serviceBag: ServiceBag= {
  getHistory: async (roomId = 'global'): Promise<Messages[]> => {
    const {data: {session}} = await supaBase.auth.getSession();
    if (!session) return [];

    const token = session?.access_token;

    const response =   await fetch(`${import.meta.env.VITE_SERVER_URL}/history?roomId=${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    })
      if (!response.ok) return [];
      const data: Messages[]= await  response.json();
      return data;
  }
,
   loadOnlineUsers: async (onUserClick: (user: ChatUser) => void) => {
          const {data, error} = await supaBase
         .from('profiles')
         .select('username, id')
         if (error) {
          console.log('error loading users')
          return
         }
          if (!data) return;
         const usersList = document.querySelector('.users-window')
        
         if (!usersList ) return
          usersList.innerHTML = '';
          
          data.forEach(user => {
            if (user.id === userId) return;
            const div = document.createElement('div');
            div.className = 'user-entry';
            div.innerText = user.username;
            div.onclick = () => onUserClick(user);
            usersList.appendChild(div)
          })
   },
  socket,
  
}
initChatUi.setup(serviceBag, userId, username)
}

startApp();

