const appRoot = require('app-root-path');
const winston = require('winston');
const moment = require('moment');
const date = moment().format('YYYY-MM-DD');
// define the custom settings for each transport (file, console)
const options = {
  file: {
    level: 'info',
    filename: `${appRoot}/logs/app_${date}.log`,
    handleExceptions: true,
    json: true,
    maxsize: 9999999, // 5MB
    maxFiles: 5,
    colorize: false
  }
};

// instantiate a new Winston Logger with the settings defined above
const logger = new winston.createLogger({
  transports: [new winston.transports.File(options.file)],
  exitOnError: false // do not exit on handled exceptions
});

// create a stream object with a 'write' function that will be used by `morgan`
logger.stream = {
  write: function(message, encoding) {
    // use the 'info' log level so the output will be picked up by both transports (file and console)
    logger.info(message);
  }
};

module.exports = logger;