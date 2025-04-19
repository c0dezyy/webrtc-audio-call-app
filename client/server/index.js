const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

const app = express();
app.use(cors());

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
  }
});

let users = {};

io.on('connection', (socket) => {
  socket.on('join', ({ roomId, username }) => {
    socket.join(roomId);
    users[socket.id] = { username, roomId };
    io.to(roomId).emit('users', getUsersInRoom(roomId));
    socket.to(roomId).emit('user-joined', { id: socket.id, username });
  });

  socket.on('signal', ({ to, signal }) => {
    io.to(to).emit('signal', { from: socket.id, signal });
  });

  socket.on('disconnect', () => {
    const user = users[socket.id];
    if (user) {
      socket.to(user.roomId).emit('user-left', socket.id);
      delete users[socket.id];
      io.to(user.roomId).emit('users', getUsersInRoom(user.roomId));
    }
  });
});

function getUsersInRoom(roomId) {
  return Object.entries(users)
    .filter(([_, user]) => user.roomId === roomId)
    .map(([id, user]) => ({ id, username: user.username }));
}

server.listen(3001, () => {
  console.log('Signaling server running on port 3001');
});