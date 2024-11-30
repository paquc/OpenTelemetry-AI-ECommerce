  
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

const DESTINATION_URL = process.env.DESTINATION_URL || 'http://goalshumanityserver:9001/pinghumanityserver';
const http = require('http');
const PORT = process.env.PORT || 9000;

// io = require('socket.io')
const cote = require('cote')

const {createMessage} = require('./winstonlogger.js');

const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, align } = winston.format;
require('winston-daily-rotate-file');

const tracing = require('./tracing');
const {trace, context, propagation, tracer, getLineNumber} = require('./tracing.js');

const errors = require('./errors.js');

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');

//Wrap your application Code
const express = require('express');
const fs = require('fs');
const app = express();
app.use(express.json());

// Define a custom format for CSV output
const csvFormat = format.printf(({ level, message, timestamp }) => {
  // Structure the log message as CSV, e.g., "timestamp, level, message"
  return `${timestamp},${level},${message}`;
});

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
  const request_ID = uuidv4();
  console.log(`Request ID: ${request_ID} - API Gateway service running...`);
  res.send('running...');
  logEventMessage(`api gateway running ${PORT}`, severity_trace);
  logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'API Gateway service running', request_ID));
});


app.get('/userslist', function(req, res) {
  const request_ID = uuidv4();
  const startTime = Date.now();
  // Create a root span
  const rootSpan = tracer.startSpan('APIGateway::GET::userslist');
  // Attach the root span to a new context
  const rootContext = trace.setSpan(context.active(), rootSpan);
  list_req = {
    type: 'list',
    request_ID: request_ID, // Include the request ID
  };
  propagation.inject(rootContext, list_req, {
    set: (carrier, key, value) => {
        carrier[key] = value; // Define how to set keys in the request
    },
  });
  userRequester.send(list_req, function(err, users) {
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      const min_value = 100;
      const max_value = 400;

      if(err) {
        logger.error(createMessage( Date.now(), ERROR_FAIL, SOURCE_SERVICE, API_ENDPOINT, err, '', `Error fetching users list from user-service: code ${err}`, request_ID));
        res.status(500).send('Error fetching users list');
      }
      else {
        if (duration < min_value) {
          logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, API_ENDPOINT, duration, '', `Users list fetched successfully from user-service in ${duration} ms`, request_ID));
        } else if (duration >= min_value && duration < max_value) {
          logger.info(createMessage( Date.now(), ERROR_DELAY, SOURCE_SERVICE, API_ENDPOINT, duration, '', `Fetching users list took longer than expected (max=${min_value}ms): ${duration} ms`, request_ID));
        } else if (duration >= max_value) {
          logger.info(createMessage( Date.now(), ERROR_DELAY, SOURCE_SERVICE, API_ENDPOINT, duration, '', `Fetching users list took too much time according the customer SLO (max=${max_value}ms): ${duration} ms`, request_ID));
        }
        else {
        }
        res.status(200).send(users);
      }
  });
  
});

errors.errorsCounter.add(0);


// const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-APIGateway.csv';
const logFilePath = 'AI-ECommerce-APIGateway.csv';

const fileRotateTransport = new winston.transports.DailyRotateFile({
  filename: 'combined-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxFiles: '1d',
});

const logger = winston.createLogger({
  level: 'debug',
  //format: winston.format.json(),
  format: format.combine(
      timestamp({
      format: 'YYYY-MM-DD hh:mm:ss.SSS',
    }),
    csvFormat           // Apply the CSV formatting
  ),
  transports: [
    // new winston.transports.Console(),
    new winston.transports.File({
      filename: logFilePath,
    }),
    fileRotateTransport,
    // new LogtailTransport(logtail),
  ],
});

logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'API Gateway service started with success', ''));

// START listening...
app.listen(PORT);
logEventMessage(`API Gateway running... on ${PORT}`, severity_trace);
