import {supaBase} from './supabase.js'
import {initChatUi} from './initChatUI.js'

const socket = io(import.meta.env.VITE_SERVER_URL ||"http://localhost:3001", {
  transports: ['websocket', 'polling']
})



async function startApp () {
  const {data: {session}} = await supaBase.auth.getSession();
  
   if (!session) {
    console.log('no session found, redirecting');
    window.location.href = './index.html';
    return
   }

  console.log('authenticated as', session.user.user_metadata.display_name)


  const userId = session.user.id;
  const username = session.user.user_metadata.display_name || 'new member'


const serviceBag = {
  getHistory: () => fetch('https://solvek-88-shwifty-server.hf.space/history')
  .then(response => response.json())
,
  socket:socket
  
}

initChatUi.setup(serviceBag, userId)
}

startApp();

