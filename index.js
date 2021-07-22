var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const responseTime = require('response-time');
const fileUpload = require('express-fileupload');
const path = require('path');
const sockets = require('./socket');
const chalk = require('chalk')

var routes = require('./Routes')

var app = express();


const http = require('http');
const server = http.Server(app);
sockets.init(server);


// console.log(app);
var { HOST , PORT } = require('./Envreader')

// console.log(Envreader);

var AdminRoutes = require('./Admin/admin_routes');

app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.dnsPrefetchControl({ allow: true }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.hsts({ maxAge: 5184000 }));



app.use(express.static(path.resolve('./logs')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
app.use(responseTime());
app.use(fileUpload());

app.use(routes);
// app.use(notFound);
// app.use(errorHandler);

// app.use('/user', Routers);

server.listen(PORT, HOST, () => console.log(chalk.blue(`Server started @ http://${HOST}:${PORT}/`)));
// app.listen(Envreader.PORT,()=>{console.log(`Server started at port : ${Envreader.HOST}:${Envreader.PORT}`);});