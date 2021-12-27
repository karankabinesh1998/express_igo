var express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet')
const responseTime = require('response-time');
const fileUpload = require('express-fileupload');
const path = require('path');
const morgan = require('morgan');
var routes = require('./routes');


var app = express();
const winston = require('./winston');

const { errorHandler, notFound } = require('./Middleware');



app.use(helmet());
app.use(helmet.frameguard({ action: 'deny' }));
app.use(helmet.dnsPrefetchControl({ allow: true }));
app.use(helmet.hidePoweredBy({ setTo: 'PHP 4.2.0' }));
app.use(helmet.hsts({ maxAge: 5184000 }));



app.use(express.static(path.resolve('./logs')));

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());
// console.log(app.use(cors()));
app.use(responseTime());
app.use(fileUpload());


app.use(morgan('combined', { stream: winston.stream }));



const facts = [];

const clients = [];



function eventsHandler(request, response, next) {
    const headers = {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    response.writeHead(200, headers);

    console.log("hello request");
  
    const data = `data: ${JSON.stringify(facts)}\n\n`;
  
    response.write(data);
  
    const clientId = Date.now();
  
    const newClient = {
      id: clientId,
      response
    };
  
    clients.push(newClient);

    // console.log(clients,"clients");

    clients.map((ival,i)=>{
        console.log(ival.id)
    })
  
    request.on('close', () => {
      console.log(`${clientId} Connection closed`);
      clients = clients.filter(client => client.id !== clientId);
    });
  }

app.get('/events',eventsHandler);


function sendEventsToAll(newFact) {
    clients.forEach(client => client.response.write(`data: ${JSON.stringify(facts)}\n\n`))
  }
  
  async function addFact(request, respsonse, next) {
      console.log(request.body,"haskfh");
    const newFact = request.body;
    facts.push(newFact);
    respsonse.json(newFact)
    return sendEventsToAll(newFact);
  }
  
  app.post('/fact', addFact);

app.use(routes);
app.use(notFound);
app.use(errorHandler);



module.exports = app;