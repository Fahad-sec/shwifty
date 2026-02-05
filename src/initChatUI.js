export const initChatUi = {
  setup: function(serviceBag)  {
    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')
    const user = document.getElementById('usernameInput')
    const usrBtn = document.getElementById('username-btn')


    const renderMessage = (msg) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message-item'; 
      msgDiv.innerHTML = `<strong>${msg.username}:</strong> ${msg.content}`;
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    usrBtn.addEventListener('click', () => {
      const username = user.value || 'anonymous'
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
    })

    btn.addEventListener('click', () => {
      const text = input.value
      const username = localStorage.getItem('chat-nickname') || "Anonymous"
      if (text.trim() !== '') {
        serviceBag.send(text, username);
        input.value = ""
      }
    })

    serviceBag.getHistory().then((messages) => {
      messages.forEach((msg) => {
           renderMessage(msg)
      })
    })

    serviceBag.subscribe((newMessage) => {
        renderMessage(newMessage)
    })
  }
}


