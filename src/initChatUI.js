export const initChatUi = {
  setup: function(serviceBag, userId, username)  {
    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')

    const socket = io(import.meta.env.VITE_SERVER_URL ||"http://localhost:3001", {
     
      transport: ['websocket', 'polling']


    });


    socket.on('receive_message', (newMessage) => {
      if (newMessage.user_id !== userId) {
        renderMessage(newMessage)
      }
    })


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

      const isMine = msg.user_id === userId ;

     
  

      msgDiv.className = `message-item ${isMine ? 'sent' : 'received'} ` 
      msgDiv.innerHTML = `
          <div class="message-content">
          <div class="message-info">
            <small class="user-label">${msg.username}</small>
            <small class="timestamp">${time}</small>
            </div>
            <p class="text">${msg.content}</p>
          </div>
      `;


      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;

    }

      
     const sendMessage = async () => {
      const text = input.value.trim()
         finalUsername = username || 'guest'

      if (text !== '') {
       const localMsg = {
        content: text,
        user_id: userId,
        username: finalUsername,
        created_at: new Date().toISOString()
       }

       socket.emit('send_message', localMsg)

       renderMessage({
        ...localMsg 
       })
        input.value = ""
      }


     }
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



