import {supaBase} from './supabase.js'
import {initChatUi} from './initChatUI.js'

const socket = io(import.meta.env.VITE_SERVER_URL ||"http://localhost:3001", {
  transports: ['websocket', 'polling']
})



async function startApp () {
  const {data: {session}} = await supaBase.auth.getSession();
  
   if (!session) {
    return
   }

  const userId = session.user.id;
  const username = session.user.user_metadata.display_name || 'new member'

const serviceBag = {
  getHistory: async () => {
    const {data: {session}} = await supaBase.auth.getSession();
    if (!session) {
      return [];
    }

    const token = session?.access_token;

    return  await fetch(`${import.meta.env.VITE_SERVER_URL}/history`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => response.json())
  }
,
  socket,
  
}
initChatUi.setup(serviceBag, userId, username)
}

startApp();

