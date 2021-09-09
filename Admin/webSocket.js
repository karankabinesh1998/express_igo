const WebSocket = require("ws")



const webSocket =(server)=>{

console.log("server");

const wss = new WebSocket.Server({ server });

wss.on("connection", (ws) => {
  // Executed when server receives message from the app
  ws.on("message", async (message) => {
    const received = JSON.parse(message)
    console.log(received,"recived");

    if (received && received.userId) {
      verifyUserAndAddUserIdToSocket(ws, received.userId)
      removeOtherUserLocationSockets(wss, received.userId)
    }
  })
})

}



module.exports={
  webSocket
}

// Sets "wss" so Express routes can access the socket instance later - important!
// app.set("wss", wss)