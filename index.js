const chalk = require('chalk');
var { HOST , PORT } = require('./Envreader')
const app = require('./app');

const webSocket = require('./Admin/webSocket');

// webSocket(server);

// webSocket(app.listen(app.get("port")))

// app.set("wss",)



const sockets = require('./socket');
const http = require('http');
const server = http.Server(app);




sockets.init(server);   

server.listen(PORT, HOST, () => console.log(chalk.blue(`Server started @ http://${HOST}:${PORT}/`)));
