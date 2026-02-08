import {supaBase} from './supabase.js'
console.log('Echo App: Checking Connetion')
import {initChatUi} from './initChatUI.js'

const socket = io('http://localhost:3001')



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
  getHistory: () => fetch('http://localhost:3001/history')
  .then(response => response.json())
,
  socket:socket
  
}

initChatUi.setup(serviceBag, userId)
}

startApp();

