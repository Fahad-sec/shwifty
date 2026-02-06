export const initChatUi = {
  setup: function(serviceBag, userId)  {
    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')


    const renderMessage = (msg) => {
      const msgDiv = document.createElement('div');
      const isMine = msg.user_id === userId;

      msgDiv.className = `message-item ${isMine ? 'sent' : 'received'} ` 

      msgDiv.innerHTML = `
      <div class="message-content">
      <small class="user-label">${isMine ? 'Me' : (msg.username || 'anonymous')}</small>
      <p class="text">${msg.content}</p>
      </div>
      `;
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }


     const sendMessage = async () => {
      const text = input.value

      if (text.trim() !== '') {
       await serviceBag.send(text);
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
      console.log(messages || messages.content)
      messages.forEach((msg) => {
           renderMessage(msg)
      })
    })

    serviceBag.subscribe((newMessage) => {
        renderMessage(newMessage)
    })
  }
}


