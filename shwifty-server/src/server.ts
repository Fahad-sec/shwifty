import express from 'express';
import http from 'http';
import {Server} from 'socket.io'
import cors from 'cors';
import 'dotenv/config';

import {createClient} from '@supabase/supabase-js'
const SUPABASE_KEY = process.env.SUPABASE_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  throw new Error ('missing environment variables')
}

const supaBase = createClient(SUPABASE_URL, SUPABASE_KEY)


const app = express();
app.use(cors({
origin: ['https://shwifty.vercel.app', 'http://localhost:3000', 'http://localhost:4173', 'http://localhost:5173'],
  allowedHeaders: ["Authorization", "Content-Type"],
  credentials: true
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
   .eq('room_id', req.query.roomId || 'global')
   .order('created_at', {ascending: true});

   if (error) return res.status(500).json(error);

   return res.json(data || []);
   
})

const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: [ "http://localhost:4173"],
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true
  },
    transports: ['polling', 'websocket'],
    allowEIO3: true
});

const activeUsers = new Map();
io.on('connection', (socket) => {
  console.log('A user connected: ID:', socket.id );

    socket.on('join_private_chat', (newRoomId) => {

      const roomsToLeave = Array.from(socket.rooms).filter(room => 
        room!== socket.id &&
        room!== 'global' &&
        !room.startsWith('user_')
      )
      roomsToLeave.forEach(room => socket.leave(room))
      socket.join(newRoomId)
      console.log(`User${socket.id} joined room: ${newRoomId}`);
    })

  
  socket.on('register_user', (userId) => {
     activeUsers.set(socket.id, userId);
     const personalRoom = `user_${userId}`
     socket.join(personalRoom);
     console.log(`User ${userId} registered and joined maailbox: ${personalRoom}`)
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
    socket.to(data.room_id || 'global').emit('user_typing', data);
  })
   
  socket.on('send_message', async(data) => {      
    const targetRoom = data.room_id || 'global';
    const {data: savedMessage, error,} = await supaBase
    .from('messages')
    .insert([{
      content: data.content,
      user_id: data.user_id,
      username: data.username,
      room_id: targetRoom
    }])
    .select()
    .single()

    if (error) {
      console.error('error saving messages', error)
      return;
    }

    const messagePayload = {... savedMessage, username: data.username};

    /*io.to(data.room_id ||'global').emit('receive_message', messagePayload)*/

    if (typeof targetRoom === 'string' && targetRoom.startsWith('private_')) {
      const ids = data.room_id.replace('private_', '').split('_');
      const recipientId = ids.find((id: string) => id !== data.user_id);

      if (recipientId) {
        io.to(`user_${recipientId}`).emit('receive_message', messagePayload)
      }
    }

  });
  socket.on('disconnect', () => {
    activeUsers.delete(socket.id)
    broadcastUniqueCount();
    console.log('User disconnected');
  });
});

const PORT =  Number(process.env.PORT) ||7860;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`SHWIFTY SERVER RUNNING ON PORT ${PORT}`);
})