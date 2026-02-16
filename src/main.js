import {supaBase} from './supabase.js'
import {initChatUi} from './initChatUI.js'

const socket = io(import.meta.env.VITE_SERVER_URL, {
  transports: ['polling', 'websocket']
})



async function startApp () {
  const {data: {session}} = await supaBase.auth.getSession();
  
   if (!session) {
    return
   }

  const userId = session.user.id;
  const username = session.user.user_metadata.username || session.user.user_metadata.display_name

const serviceBag = {
  getHistory: async (roomId = 'global') => {
    const {data: {session}} = await supaBase.auth.getSession();
    if (!session) {
      return [];
    }

    const token = session?.access_token;

    return  await fetch(`${import.meta.env.VITE_SERVER_URL}/history?roomId=${roomId}`, {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    }).then(response => response.json())
  }
,
   loadOnlineUsers: async (onUserClick) => {
          const {data, error} = await supaBase
         .from('profiles')
         .select('username, id')
         if (error) {
          console.log('error loading users')
          return
         }
         console.log('fetched data', data)
         const usersList = document.querySelector('.users-window')

         if (usersList && data) {
          usersList.innerHTML = '';
          
          data.forEach(user => {
            if (user.id === userId) return;
            const div = document.createElement('div');
            div.className = 'user-entry';
            div.innerText = user.username;
            div.onclick = () => onUserClick(user);
            usersList.appendChild(div)
          })
       
         }
   },


  socket,
  
}
initChatUi.setup(serviceBag, userId, username)
}

startApp();

