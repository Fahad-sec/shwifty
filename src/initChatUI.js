export const initChatUi = {
  
  setup: function(serviceBag, userId, username)  {
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

    
    const toggleLoader = (show, msg) => {
      if (!loader) return ;
      if (show) {
        console.log(msg)
        loadingMsg.innerText = msg
        loader.style.display = 'flex';
        loader.classList.remove( 'loader-hidden')
      } else {
        loader.classList.add('loader-hidden')
        setTimeout(() => loader.style.display = 'none', 500)
      }
    }


    const displayName = () => {
      const nameElement = document.getElementById('username')
       nameElement.innerText = `${username}`
      notifyHeader.appendChild(nameElement)
    
    }
    displayName()
    
    const initNotifications = async () => {
        const permission = await Notification.requestPermission();
        if (permission === 'granted') {
          notifyBtn.innerText = 'Notify On'
          notifyBtn.style.backgroundColor = 'green'
          notifyBtn.disabled = true
          new Notification('Shwifty', {body: "Notifications enabled"})
        } 
    }    
    if (notifyBtn) {
       notifyBtn.addEventListener('click', initNotifications)
      }
      
      const checkNotifications = () => {
        const permission = Notification.permission
        if (permission === 'granted') {
          
          notifyBtn.innerText = 'Notify On'
          notifyBtn.style.backgroundColor = 'green'
          notifyBtn.disabled = true
        } else {
          notifyBtn.innerText = 'Notify-OFF'
          notifyBtn.backgroundColor = ''
          notifyBtn.disabled = false
        }
      }
      checkNotifications()


     
    const socket = io(import.meta.env.VITE_SERVER_URL ||"http://localhost:3001", {
     
      transports: ['websocket', 'polling']
    });
           const showEmptyState = (partnerName) => {
        const emptyDiv  = document.createElement('div');
        emptyDiv.className = 'empty-chat-placeholder'

        emptyDiv.innerHTML = `

            <div class="placeholder-icon">🔒</div>
            <p>Start a conversation with <b>${partnerName}</b>
            <small>Messages are secure and private.</small>
        `
        chatWindow.appendChild(emptyDiv)

      }
    let lastRenderDate = null;
  const renderMessage = async (msg) => {

    const placeHolder = document.querySelector('.empty-chat-placeholder')
    if (placeHolder) placeHolder.remove();
        // time
       const msgDate = new Date(msg.created_at).toDateString();

       if (msgDate !== lastRenderDate) {
          const divider = document.createElement('div')
          divider.className = 'date-seperator'
          divider.innerText = msgDate === new Date().toDateString() ? 'Today' : msgDate;
          chatWindow.appendChild(divider);
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


      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;

    }

      
     const sendMessage =  () => {
      const text = input.value.trim()
        const  finalUsername = username || 'guest'

      if (text !== '') {
       const localMsg = {
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
      let typingTimeout;
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
      }) // ------------------------------------------------------------
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
         
      const fetchRoomHistory = async (roomId, partnerName) => {

        chatWindow.innerHTML = ''

        lastRenderDate = null;
         const messages = await serviceBag.getHistory(roomId)

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

        if ( !document.hasFocus() && Notification.permission === 'granted') {

          new Notification(`New message from ${newMessage.username}`, {
            body: newMessage.content,
            icon: './images/page-logo.png' ,
            tag: Date.now()
          })
        }
      }
    }); 
           
           const initUserList = () => {
            serviceBag.loadOnlineUsers((clickedUser) => {
              switchPrivateChat(clickedUser)
              toggleUserList()
            });
           };
            
            initUserList();


        const toggleUserList = () => {
        const usersWindow =   document.querySelector('.users-window')
        usersWindow.classList.toggle('users-show');
        
         if (onlineBtn.innerText === '︽') {

        onlineBtn.innerHTML = '︾'
      } else {
        onlineBtn.innerHTML = '︽'
      }
             
     if (usersWindow.classList.contains('users-show')) {
      serviceBag.loadOnlineUsers((clickedUser) => {
        switchPrivateChat(clickedUser);

      })
     }
     }

    
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


    const switchPrivateChat = async (clickedUser) => {
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

      const timeoutLimit = 7000;
      const timeoutPromise = new Promise((_, reject)=>          setTimeout(() => reject(new Error('Portal Timeout')), timeoutLimit)
     );   



      try {
        await Promise.race([fetchRoomHistory('global'),
          timeoutPromise]);
        toggleLoader(false)
        
      } catch (err) {
            if (shwifty && loader ) {
        shwifty.classList.add('shwifty-err')
        logoutBtn.classList.add('logout-err')
        loader.prepend(shwifty)
        loader.append(logoutBtn)
        shwifty.onclick = () => {
        window.location.reload();
        
     }
      }
      const defaultErr = 'Your session is out of sync. Please try logging out and back in to stabilize the portal.'
      const timeoutErr = 'Connection timed out. Tap the logo to try again or try logging back in.'
      const errMsg = err.message === 'Portal Timeout'? timeoutErr: defaultErr
      
        toggleLoader(true, errMsg )
      }
    }
    initApp()
 
     shwifty.onclick = () => {
      window.location.reload();
     }
  }
}


