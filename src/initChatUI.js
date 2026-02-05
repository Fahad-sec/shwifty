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

    /*usrBtn.addEventListener('click', () => {
      if (username) {
        localStorage.setItem('chat-nickname', username)
        user.value = ''
        usrBtn.innerText = "Saved!"
        usrBtn.style.backgroundColor = "#4caf50"
        setTimeout(() => {
          usrBtn.innerText = "Save"
          usrBtn.style.backgroundColor = ""

        }, 2000)        
      }
    })*/

    btn.addEventListener('click', async() => {
      const text = input.value

      if (text.trim() !== '') {
       await serviceBag.send(text);
        input.value = ""
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


