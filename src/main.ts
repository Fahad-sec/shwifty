import {supaBase} from './supabase'
import {initChatUi} from "./initChatUI"
import {io} from "socket.io-client"
import type { Messages, ChatUser, ServiceBag } from './type';

const socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ['websocket'],
  upgrade: false,
  secure: true,
  rememberUpgrade: true,
  reconnection: true,
  reconnectionAttempts: Infinity,
  rejectUnauthorized: false,
  timeout: 10000,
})
socket.on('connect', () => {
  const loader = document.getElementById('loading-screen');
  if (loader ) loader.style.display = 'none'
})

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
  socket: socket,
  
}
initChatUi.setup(serviceBag, userId, username)
}

startApp();

