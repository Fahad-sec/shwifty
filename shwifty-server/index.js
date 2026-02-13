const express = require('express');
const http = require('http');
const {Server} = require('socket.io');
const cors = require('cors');

const {createClient} = require('@supabase/supabase-js')
const supaBase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_KEY)


const app = express();
app.use(cors({
  origin: ["https://shwifty.vercel.app", 'http://127.0.0.1:5173'],
  allowedHeaders: ["Authorization", "Content-Type"]
}));


app.get('/history', async (req, res) => {

  const authHeader  = req.headers.authorization;
  if (!authHeader) return res.status(401).json({error: "No token provided"})


  const token = authHeader.split(' ')[1];
  const {data: {user}, error: authError} = await supaBase.auth.getUser(token);

  if (authError || !user) {
    console.error('Auth error', authError?.message)
    return res.status(401).json({error: "Invalid token"});
  }

  
  const {data, error} = await supaBase
   .from('messages')
   .select('*')
   .order('created_at', {ascending: true});

   if (error) return res.status(500).json(error)
    res.json(data);
   
})

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["https://shwifty.vercel.app", "http://127.0.0.1:5173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"]
  }
});

const activeUsers = new Map();
io.on('connection', (socket) => {
  console.log('A user connected: ID:', socket.id );

    socket.on('join_private_chat', (roomId) => {
      const currentRooms = Array.from(socket.rooms);
      currentRooms.forEach(room => {
        if (room !== socket.id) socket.leave(room);
      });
      socket.join(roomId);
      console.log(`User joined room: ${roomId}`);
    })

  
  
  
  socket.on('register_user', (userId) => {
     activeUsers.set(socket.id, userId);
    broadcastUniqueCount();
  })

  const broadcastUniqueCount = () => {
    const uniqueUserCount = new Set(activeUsers.values()).size;
    io.emit('user_count_update', uniqueUserCount)
  }

  socket.on('request_count', () => {
    const uniqueUserCount = new Set(activeUsers.values()).size;
    socket.emit('user_count_update', uniqueUserCount > 0 ? uniqueUserCount: 1);
  })
  
  socket.on('typing', (data) => {
    socket.broadcast.emit('user_typing', data);
  })
   
  socket.on('send_message', async(data) => {      
    const {data: savedMessage, error,} = await supaBase
    .from('messages')
    .insert([{
      content: data.content,
      user_id: data.user_id,
      username: data.username
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
    activeUsers.delete(socket.id)
    broadcastUniqueCount();
    console.log('User disconnected');
  });
});

const PORT =  process.env.PORT ||7860;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`SHWIFTY SERVER RUNNING ON PORT ${PORT}`);
})