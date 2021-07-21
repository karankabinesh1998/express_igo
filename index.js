var express = require('express');
var app = express();
// console.log(app);
var Envreader = require('./Envreader')

// console.log(Envreader);

var Routers = require('./Routers');



app.use('/admin', Routers);

// app.use('/user', Routers);


app.listen(Envreader.PORT,()=>{console.log(`Server started at port : ${Envreader.HOST}:${Envreader.PORT}`);});