const mysql = require('mysql');

const { DB_HOST, DB_NAME, DB_USERNAME, DB_PASSWORD, DB_TIMEZONE } = require('./Envreader');

let db_config = {
    connectionLimit: 200,
    host: DB_HOST,
    database: DB_NAME,
    user: DB_USERNAME,
    password: DB_PASSWORD,
    timezone: DB_TIMEZONE,
    timeout: 1000
  };

  let connection = mysql.createConnection(db_config); 

  

  module.exports.startConnection = function () {
   
    
    connection.query(function (err) {
      if (err) {
        //console.error('error connecting MYSQL : ' + err.stack);
        console.error('fullError : ' + err);
      } else {
        console.log('MYSQL connected as id : ' + connection.threadId);
        console.log('status : ' + connection.state);
      }
    });

    connection.on('error', function (err) {
      // console.error('error  : ' + err.stack);
      console.error('OnError  : ');
      console.error(err);
    });
    return connection;
  };



  module.exports.endConnection = function () {
    
    connection.end(function (err) {
      if (err) {
        console.log('CloseError');
        console.log(err);
      }
      console.log("closed");
    });
    return true;
  };
