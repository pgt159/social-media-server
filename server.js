import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { Server } from 'socket.io';
// import { createServer } from 'node:http';

process.on('uncaughtException', (err) => {
  console.log(err);
  process.exit(1);
});

dotenv.config({
  path: './.env',
});
const PORT = process.env.PORT || 8000;

const server = app.listen(PORT);

// const io = new Server(server, {
//   cors: {
//     origin: 'http://localhost:3000',
//   },
// });
const SOCKET_PORT = process.env.SOCKET_PORT || 443;

// DATABASE SETUP
const DB = process.env.DATABASE.replace(
  '<password>',
  process.env.DATABASE_PASSWORD
);

const io = new Server({
  pingTimeout: 60000,
  cors: '*',
  // transports: ['websocket'],
});

mongoose.connect(DB, {});

// server.listen(PORT, () => {});

io.on('connection', (socket) => {
  socket.on('setup', (userData) => {
    socket.join(userData?._id);
    socket.emit('connected');
  });

  socket.on('join chat', ({ chatRoom, user }) => {
    socket.join(`${user?._id}_${chatRoom?._id}`);
    socket.emit('joined chat');
  });

  socket.on('new message', (newMessage) => {
    socket.emit('message');
    if (!newMessage?.users || newMessage.users.length <= 1) {
      return console.log('Group does not have appropriate members');
    }
    newMessage?.users.forEach((user) => {
      if (user?._id === newMessage.sentBy?._id) return;

      socket
        .to(user?._id)
        .to(`${user?._id}_${newMessage.chatRoomId}`)
        .emit('message received', newMessage);
    });
  });

  socket.on('typing', ({ chatRoom, user }) => {
    chatRoom?.users.forEach((item) => {
      if (item?._id === user?._id) {
        return;
      }
      socket.to(`${item?._id}_${chatRoom?._id}`).emit('friend typing', user);
    });
  });

  socket.on('stop typing', ({ chatRoom, user }) => {
    chatRoom?.users.forEach((item) => {
      if (item?._id === user?._id) {
        return;
      }
      socket
        .to(`${item?._id}_${chatRoom?._id}`)
        .emit('friend stop typing', user);
    });
  });

  socket.on('seen', ({ chatRoom, user }) => {
    chatRoom?.users.forEach((item) => {
      if (item?._id === user?._id) {
        return;
      }
      socket.to(`${item?._id}_${chatRoom?._id}`).emit('friend seen');
    });
  });
});

io.listen(SOCKET_PORT);
process.on('unhandledRejection', (err) => {
  console.log('Error', err);
  console.log('UNHANDLED REJECTION! 💥 Shutting down...');
  server.close(() => {
    process.exit(1);
  });
});
