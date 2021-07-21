var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const responseTime = require('response-time');
const fileUpload = require('express-fileupload');
const path = require('path');


var app = express();


// console.log(app);
var Envreader = require('./Envreader')

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

app.use('/admin',AdminRoutes);

// app.use('/user', Routers);


app.listen(Envreader.PORT,()=>{console.log(`Server started at port : ${Envreader.HOST}:${Envreader.PORT}`);});