export const initChatUi = {
  setup: function(serviceBag, userId)  {
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
            <small class="user-label">${isMine ? 'Me' : (msg.username || 'anonymous')}</small>
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


      if (text !== '') {
       const localMsg = {
        content: text,
        user_id: userId,
        username: undefined,
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
      messages.forEach((msg) => {
           renderMessage(msg)
      })
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



