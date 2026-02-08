const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

require('dotenv').config();

const {createClient} = require('@supabase/supabase-js')

const supaBase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)



const app = express();
app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: "*"
  }
});

io.on('connection', (socket) => {
  console.log('A user connected: ID:', socket.id );

  socket.on('send_message', async(data) => {
    console.log('message received:', data);
      
    const {data: savedMessage, error} = await supaBase
    .from('messages')
    .insert([{
      content: data.content,
      user_id: data.user_id
    }])
    .select()
    .single()

    if (error) {
      console.error('error saving messages', error)
      return;
    }

    io.emit('receive_message', {
      ...savedMessage,
      username: data.username
    })




  });
  socket.on('disconnect', () => {
    console.log('User disconnected');
  });
});

const PORT =  process.env.PORT ||3001;
server.listen(PORT, () => {
  console.log(`SHWIFTY SERVER RUNNING ON PORT ${PORT}`);
})


app.get('history', async (req, res) => {
     
  const {data, error} = await supaBase
   .from('messages')
   .select('*')
   .order('created_at', {ascending: true});

   if (error) return res.status(500).json(error)
    res.json(data);
   
})