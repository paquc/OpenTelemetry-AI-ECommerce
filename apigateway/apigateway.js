  
'use strict';
const severity_info = 'INFO';
const severity_error = 'ERROR';
const severity_warning = 'WARNING';
const severity_debug = 'DEBUG';
const severity_trace = 'TRACE';
const simulation_trace = 'SIMULATION';

const SOURCE_SERVICE = 'apigateway';
const API_ENDPOINT = '/userslist';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

const http = require('http');
const PORT = 9000;

// io = require('socket.io')
const cote = require('cote')

const {createLogger, createMessage, isLogFileExists} = require('./winstonlogger');

// const winston = require('winston');
// const { format } = winston;
// const { combine, timestamp, printf, colorize, align } = winston.format;
// require('winston-daily-rotate-file');

const tracing = require('./tracing');
const errors = require('./errors.js');

require('dotenv').config();

//Wrap your application Code
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// // Define a custom format for CSV output
// const csvFormat = format.printf(({ level, message, timestamp }) => {
//   // Structure the log message as CSV, e.g., "timestamp, level, message"
//   return `${timestamp},${level},${message}`;
// });


// const fileRotateTransport = new winston.transports.DailyRotateFile({
//   filename: 'combined-%DATE%.log',
//   datePattern: 'YYYY-MM-DD',
//   maxFiles: '1d',
// });

// const logger = winston.createLogger({
//   level: 'debug',
//   //format: winston.format.json(),
//   format: format.combine(
//       timestamp({
//       format: 'YYYY-MM-DD hh:mm:ss.SSS',
//     }),
//     csvFormat           // Apply the CSV formatting
//   ),
//   transports: [
//     // new winston.transports.Console(),
//     new winston.transports.File({
//       filename: logFilePath,
//     }),
//     // fileRotateTransport,
//     // new LogtailTransport(logtail),
//   ],
// });


var userRequester = new cote.Requester({
  name: 'admin user requester',
  namespace: 'user'
});

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function logEventMessage(message, severity) {

  const logger = tracing.loggerProvider.getLogger('apigateway-service-logger');

  // emit a log message 
  logger.emit({
    severityText: severity,
    body: message,
    attributes: { 
      'log.project': 'ETS-Project',
      'log.service': 'apigateway'}
  });

  console.log(`${severity} : ${message}`); 
};


app.get('/', (req, res) => {
  res.send('running...');
  logEventMessage(`api gateway running ${PORT}`, severity_trace);
});


app.get('/userslist', function(req, res) {
  const startTime = Date.now();
  userRequester.send({type: 'list'}, function(err, users) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      const currentTimeUnix = Date.now();

      // 
      const min_value = 200;
      const max_value = 300;

      if(err) {
        const msg = `${currentTimeUnix},${ERROR_FAIL},${SOURCE_SERVICE},${API_ENDPOINT},${err},,Error fetching users list from user-service: code ${err}`;
        logger.error(msg);
        res.status(500).send('Error fetching users list');
      }
      else {
        if (duration < min_value) {
          const msg = `${currentTimeUnix},${ERROR_NONE},${SOURCE_SERVICE},${API_ENDPOINT},${duration},,Users list fetched successfully from user-service in ${duration} ms`;
          logger.info(msg);
        } else if (duration >= min_value && duration < max_value) {
          const slowMsg = `${currentTimeUnix},${ERROR_DELAY},${SOURCE_SERVICE},${API_ENDPOINT},${duration},,Fetching users list took longer than expected (max=300ms): ${duration} ms`;
          logger.warn(slowMsg);
        } else if (duration >= max_value) {
          const slowMsg = `${currentTimeUnix},${ERROR_DELAY},${SOURCE_SERVICE},${API_ENDPOINT},${duration},,Fetching users list took too much time according the customer SLA (max=500ms): ${duration} ms`;
          logger.error(slowMsg);
        }
        else {
        }
        res.status(200).send(users);
      }
  });
});

errors.errorsCounter.add(0);

// START listening...
app.listen(PORT);


// const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-APIGateway.csv';
const logFilePath = '/usr/share/logstash/ingest_data/AppServiceAPIGateway.csv';

// console.log(`logFilePath: ${__dirname}`);

logEventMessage(`API Gateway running... on ${PORT}`, severity_trace);

function checkLogFile() {
  if(isLogFileExists()==false) {
    const logger = createLogger(logFilePath);
    logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PAYMENT service started with success'));
  }
}

setInterval(checkLogFile, 1000);