import type { Messages, ChatUser, ServiceBag } from './type';
import { sanitize} from './utils/security'

export const initChatUi = {
  
  setup: function(serviceBag: ServiceBag, userId: string, username: string)  {
      let currentActiveRoom = 'global'
    const shwifty = document.querySelector('.shwifty');
    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')
    const notifyBtn = document.querySelector('.notification-btn')
    const notifyHeader = document.querySelector('.notify-header');
    const onlineBtn = document.getElementById('online-btn');
    const chatTitle = document.getElementById('chat-title')
    const loader  = document.getElementById('loading-screen')
    const loadingMsg = document.querySelector('.loading-msg')
    const logoutBtn = document.getElementById('logout-btn')
    const nameElement = document.getElementById('username')


    
    const toggleLoader = (show: boolean, msg?: string) => {
      if (!loader) return ;
      if (!(loadingMsg instanceof HTMLElement)) return
      if (show) {
        loadingMsg.innerText = msg || '';
        loader.style.display = 'flex';
        loader.classList.remove( 'loader-hidden')
      } else {
        loader.classList.add('loader-hidden')
        setTimeout(() => loader.style.display = 'none', 500)
      }
    }


    const displayName = () => {

      if (
        !(nameElement instanceof HTMLElement) ||
        !(notifyHeader instanceof HTMLElement)
      ) return
       nameElement.innerText = `${username}`
      notifyHeader.appendChild(nameElement)
    
    }
    displayName()
    
    const initNotifications = async () => {
       if (!(notifyBtn instanceof HTMLButtonElement)) return;
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          notifyBtn.innerText = 'Notify On'
          notifyBtn.style.backgroundColor = 'green'
          notifyBtn.disabled = true
          new Notification('Shwifty', {body: "Notifications enabled"})
        } 
    }    
    if (!(notifyBtn instanceof HTMLButtonElement)) return;
       notifyBtn.addEventListener('click', initNotifications)
      
      
      const checkNotifications = () => {
        const permission = Notification.permission
        if (permission === 'granted') {
          
          notifyBtn.innerText = 'Notify On'
          notifyBtn.style.backgroundColor = 'green'
          notifyBtn.disabled = true
        } else {
          notifyBtn.innerText = 'Notify-OFF'
          notifyBtn.style.backgroundColor = ''
          notifyBtn.disabled = false
        }
      }
      checkNotifications()


     
    const socket = serviceBag.socket;

        const showEmptyState = (partnerName?: string) => {
        const emptyDiv  = document.createElement('div');
        emptyDiv.className = 'empty-chat-placeholder'

        emptyDiv.innerHTML = `

            <div class="placeholder-icon">🔒</div>
            <p>Start a conversation with <b>${partnerName}</b></p>
            <small>Messages are secure and private.</small>
        `
        chatWindow?.appendChild(emptyDiv)

      }
    let lastRenderDate: string | null = null;
  const renderMessage = async (msg: Omit<Messages, 'id'>) => {

    const placeHolder = document.querySelector('.empty-chat-placeholder')
    if (placeHolder) placeHolder.remove();
        // time
       const msgDate = new Date(msg.created_at).toDateString();

       if (msgDate !== lastRenderDate) {
          const divider = document.createElement('div')
          divider.className = 'date-seperator'
          divider.innerText = msgDate === new Date().toDateString() ? 'Today' : msgDate;
          chatWindow?.appendChild(divider);
          lastRenderDate = msgDate
       }


       let rawTime = msg.created_at;
      let dateObj
      if (rawTime) {
      const utcString = rawTime.endsWith('Z') || rawTime.includes('+')
      ? rawTime
      : `${rawTime}Z`;
        dateObj = new Date(utcString);
      } else {
        dateObj = new Date()
      }

      const time = dateObj.toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
        hour12: true
      })

      //NEW chat: 

      
      const msgDiv = document.createElement('div');
      const isMine = msg.user_id === userId;
      const finalUsername = isMine? 'Me' : `${msg.username}`;

      msgDiv.className = `message-item ${isMine ? 'sent' : 'received'} ` 
      msgDiv.innerHTML = `
          <div class="message-content">
          <div class="message-info">
            <small class="user-label">${finalUsername}</small>
            <small class="timestamp">${time}</small>
            </div>
            <p class="text">${msg.content}</p>
          </div>
      `;

      if (chatWindow instanceof HTMLElement) { 
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow?.scrollHeight;
      }
    }

      
     const sendMessage =  () => {
      if (!(input instanceof HTMLInputElement)) return
      const text = sanitize(input.value.trim())
        const  finalUsername = username || 'guest'

      if (text !== '') {
       const localMsg: Omit<Messages, 'id'> = {
        content: text,
        user_id: userId,
        username: finalUsername,
        room_id: currentActiveRoom,
        created_at: new Date().toISOString()
       }

       socket.emit('send_message', localMsg)

       renderMessage({
        ...localMsg 
       })
        input.value = ""
      }
     }

     // typing indicator: 
    
      const typingIndicator = document.querySelector('.typing-indicator');
      if (!(typingIndicator instanceof HTMLElement)||
          !(input instanceof HTMLInputElement)
      ) return;
      let typingTimeout: ReturnType<typeof setTimeout> | undefined ;
      input.addEventListener('input', () => {
        socket.emit('typing', {username: username, isTyping: true, room_id: currentActiveRoom})
        clearTimeout(typingTimeout);

        typingTimeout = setTimeout(() => {
          socket.emit('typing', {username: username, isTyping: false})
        }, 2000);
      });

      socket.on('user_typing', (data) => {
        if (data.isTyping) {
          typingIndicator.innerText = `${data.username} is typing...`;
        } else {
          typingIndicator.innerText ='';
        }
      }) 
      
      // ------------------------------------------------------------
         // online count 

      socket.on('user_count_update', (count) => {
        const countDisplay = document.getElementById('online-count');

        if (countDisplay && count !==null) {
          countDisplay.innerText = count ;
        }
      })
        
       const register = () => {
        socket.emit('register_user', userId)
        socket.emit('request_count');
       }

       if (socket.connected) {
        register()
       } else {
        socket.on('connect', register)
       }
       
      
      // rendermsg socket
         
      const fetchRoomHistory = async (roomId: string, partnerName?: string) => {
        toggleLoader(true, 'Finding Your Messages...')
        if (!(chatWindow instanceof HTMLElement)) return;
        chatWindow.innerHTML = ''

        lastRenderDate = null;
         const messages = await serviceBag.getHistory(roomId)
         toggleLoader(false)

         if (Array.isArray(messages) && messages.length > 0) {
          messages.forEach(msg => renderMessage(msg))
         } else {
          showEmptyState(partnerName)
         }
         return true;
      }
            
         socket.on('receive_message', (newMessage) => {
          if (newMessage.user_id === userId) {
            return
          }

          if (newMessage.room_id === currentActiveRoom) {
        renderMessage(newMessage)
          
        if (!document.hasFocus() && Notification.permission === 'granted') {
          
           new Notification(`New Message from ${newMessage.username}`,{
            body: newMessage.content,
            icon: './images/page-logo.png',
            tag: newMessage.room_id
        });
        }
      } 
        else {
          if (onlineBtn instanceof HTMLButtonElement) {
            onlineBtn.classList.add('unread-notify');
          } 


          /*const notifyDot = document.getElementById('notify-dot');
          if (notifyDot) notifyDot.classList.add('unread-notify')*/

            if (Notification.permission === 'granted') {
              const isPrivate = newMessage.room_id.startsWith('private_');
              const title = isPrivate ? `Dm: ${newMessage.username}`: `Global: ${newMessage.username}`

              new Notification(`New ${title}`, {
                body: newMessage.content,
                icon: './images/page-logo.png',
                tag: newMessage.room_id
              })
            }
        }
    }); 
      

    const toggleUserList = () => {
        const usersWindow =   document.querySelector('.users-window')
       // const notifyDot = document.getElementById('notify-dot');
        if (
          !(usersWindow instanceof HTMLElement) ||
          !(onlineBtn instanceof HTMLElement)
        ) return
        usersWindow.classList.toggle('users-show');

         if (onlineBtn.innerText === '︽') {

        onlineBtn.innerHTML = '︾'
      } else {
        onlineBtn.innerHTML = '︽'
      }
             
     if (usersWindow.classList.contains('users-show')) {
      /*  if (notifyDot) {
            notifyDot.classList.remove('unread-notify')
      }*/
      serviceBag.loadOnlineUsers((clickedUser) => {
        switchPrivateChat(clickedUser);

      })
     }
     }

      const switchPrivateChat = async (clickedUser: ChatUser) => {
      showEmptyState(clickedUser.username)
      const msg = `Chatting with ${clickedUser.username}`
      toggleLoader(true, msg);
      const roomId = [userId, clickedUser.id].sort().join('_');
      currentActiveRoom = `private_${roomId}`
      toggleUserList()

      socket.emit('join_private_chat', currentActiveRoom);
      const partnerName = clickedUser.username;
      await fetchRoomHistory(currentActiveRoom, partnerName);
      if (chatTitle) {
       chatTitle.innerText = `chatting with ${clickedUser.username}`
       }
       
       toggleLoader(false)
       
       
    } 
           const initUserList = () => {
            serviceBag.loadOnlineUsers((clickedUser) => {
              switchPrivateChat(clickedUser)
              toggleUserList()
            });
           };
            
            initUserList();
    
     if (chatTitle) {
      chatTitle.addEventListener('click', async () => {
        if (currentActiveRoom !== 'global') {
          
          toggleLoader(true, 'Back To Lobby')
          currentActiveRoom = 'global';
          chatTitle.innerText ='Global Lobby';
          socket.emit('join_private_chat', 'global');
          await fetchRoomHistory('global');
          toggleLoader(false)
        }
      })
     }




    if (
      !(onlineBtn instanceof HTMLButtonElement) ||
      !(btn instanceof HTMLButtonElement) ||
      !(input instanceof HTMLInputElement)
    ) return
     
    onlineBtn.addEventListener('click', () => {
        toggleUserList()
    });

    btn.addEventListener('click', sendMessage);
    input.addEventListener('keydown', (event) => {
     if (event.key === 'Enter') {
      sendMessage()
     }
    })


    const initApp = async() => {
      toggleLoader(true, 'Finding Your Messages...');

      const timeoutLimit = 10000;
      const timeoutPromise = new Promise((_, reject)=>          setTimeout(() => reject(new Error('Portal Timeout')), timeoutLimit)
     );   



      try {
        if (!socket.connected) {
          await new Promise<void>((res) => socket.once('connect', res))
        }
        await Promise.race([fetchRoomHistory('global'),
          timeoutPromise]);
        toggleLoader(false)
        
      } catch (err) {
        if (
          !(shwifty instanceof HTMLElement)||
          !(logoutBtn instanceof HTMLButtonElement) ||
          !(loader instanceof HTMLElement)
        )return
        shwifty.classList.add('shwifty-err')
        logoutBtn.classList.add('logout-err')
        loader.prepend(shwifty)
        loader.append(logoutBtn)
        shwifty.onclick = () => {
        window.location.reload();
        
     }
      
      const defaultErr = 'Your session is out of sync. Please try logging out and back in to stabilize the portal.'
      const timeoutErr = 'Connection timed out. Tap the logo to try again or try logging back in.'
      if (err instanceof Error) {
      const errMsg = err.message === 'Portal Timeout'? timeoutErr: defaultErr
      
        toggleLoader(true, errMsg )
      }
      }
    }
    initApp()
     if (!(shwifty instanceof HTMLElement)) return
     shwifty.onclick = () => {
      window.location.reload();
     }
  }
}


