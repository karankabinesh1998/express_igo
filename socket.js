const socketIO = require('socket.io');

function init(server) {
  const io = socketIO(server);
  console.log('sockets server is listening for connections!');
  io.on('connection', socket => {
    socket.on('timestamp', event => {
      event.id = socket.id;
      event.ip = socket.handshake.address;
      io.emit(`responseTimestamp${event.cId}`, event);
    });
  });
}

module.exports = {
  init
};