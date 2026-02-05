import {supaBase} from './supabase.js'
console.log('Echo App: Checking Connetion')
import {initChatUi} from './initChatUI.js'
import {chatService} from './chatService.js'

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
  send: (text) => chatService.send(supaBase, text, userId,  username),
  getHistory: () => chatService.getHistory(supaBase),
  subscribe: (callback) => {
    const channel = supaBase
    .channel('live-chat')
    .on('postgres_changes', 
      {event: 'INSERT', schema: 'public', table: 'messages'},
      (payload) => {
        console.log("new live msg", payload.new)
        callback(payload.new);
      }
    )
    .subscribe();
    return channel
  }
  
}

initChatUi.setup(serviceBag, userId)
}

startApp();



