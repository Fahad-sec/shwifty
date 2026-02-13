export const initChatUi = {
  
  setup: function(serviceBag, userId, username)  {
      let currentActiveRoom = 'global'

    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')
    const notifyBtn = document.querySelector('.notification-btn')
    const notifyHeader = document.querySelector('.notify-header');
    const onlineBtn = document.getElementById('online-btn');
    const chatTitle = document.getElementById('chat-title')
    const displayName = () => {
      const nameElement = document.getElementById('username')
       nameElement.innerText = `Hey! ${username}`
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

  const renderMessage = async (msg) => {
        // time
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
        socket.emit('typing', {username: username, isTyping: true})
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
          countDisplay.innerText = count;
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
         
      const fetchRoomHistory = async (roomId) => {
         const messages = await serviceBag.getHistory(roomId)
         chatWindow.innerHTML = ''

         if (Array.isArray(messages)) {
          messages.forEach(msg => renderMessage(msg))
         }
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
      chatTitle.addEventListener('click', () => {
        if (currentActiveRoom !== 'global') {
          currentActiveRoom = 'global';
          chatTitle.innerText ='Global Lobby';
          socket.emit('join_private_chat', 'global');
          fetchRoomHistory('global')
        }
      })
     }


    const switchPrivateChat = (clickedUser) => {
      const roomId = [userId, clickedUser.id].sort().join('_');
      currentActiveRoom = `private_${roomId}`
      toggleUserList()
        
       if (chatTitle) {
       chatTitle.innerText = `chatting with ${clickedUser.username}`
        
       }

      socket.emit('join_private_chat', currentActiveRoom);
      fetchRoomHistory(currentActiveRoom);
      
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

    serviceBag.getHistory().then((messages) => {
      if (Array.isArray(messages)) {
      messages.forEach((msg) => {
           renderMessage(msg)
      
      })
    } else {console.error('expected msgs but got:', messages)}
    })
    pageReload()

  }
}

const pageReload = () => {
  const shwifty = document.querySelector('.shwifty');

  shwifty.addEventListener('click', () => {
    window.location.reload();
  })
}

