export const initChatUi = {
  setup: function(serviceBag)  {
    const input = document.getElementById('messageInput')
    const btn = document.getElementById('send-btn')
    const chatWindow = document.getElementById('chat-window')
    
    const renderMessage = (msg) => {
      const msgDiv = document.createElement('div');
      msgDiv.className = 'message-item'; 
      msgDiv.innerHTML = `<strong>User:</strong> ${msg.content}`;
      chatWindow.appendChild(msgDiv);
      chatWindow.scrollTop = chatWindow.scrollHeight;
    }

    btn.addEventListener('click', () => {
      const text = input.value
      if (text.trim() !== '') {
        serviceBag.send(text);
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


