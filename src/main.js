import {supaBase} from './supabase.js'
console.log('Echo App: Checking Connetion')
import {initChatUi} from './initChatUI.js'
import {chatService} from './chatService.js'





const serviceBag = {
  send: (text, username) => chatService.send(supaBase, text, username),
  getHistory: () => chatService.getHistory(supaBase),
  subscribe: (callback) => {
    return supaBase
    .channel('live-chat')
    .on('postgres_changes', 
      {event: 'INSERT', schema: 'public', table: 'messages'},
      (payload) => callback(payload.new)
    )
    .subscribe();
  }
}

initChatUi.setup(serviceBag)