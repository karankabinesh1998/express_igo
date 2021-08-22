const socketIO = require('socket.io');



function init(server) {
  // const io = socketIO(server);
  const io = require("socket.io")(server, {
    cors: {
      origin: "*",
    },
  });
  // const io = socketIO(server);
  console.log('sockets server is listening for connections!');
  io.on('connection', socket => {
    socket.on('timestamp', event => {
      event.id = socket.id;
      event.ip = socket.handshake.address;
      io.emit(`responseTimestamp${event.cId}`, event);
    });
  });

const NEW_CHAT_MESSAGE_EVENT = "newChatMessage";

io.on("connection", (socket) => {
  
  // Join a conversation
  const { roomId } = socket.handshake.query;
  socket.join(roomId);

  // Listen for new messages
  console.log(roomId);
  socket.on(NEW_CHAT_MESSAGE_EVENT, (data) => {
    io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT, data);
  });

  // Leave the room if the user closes the socket
  socket.on("disconnect", () => {
    socket.leave(roomId);
  });
});


}

module.exports = {
  init
};