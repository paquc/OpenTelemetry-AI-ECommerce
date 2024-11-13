  
'use strict';
const severity_info = 'INFO';
const severity_error = 'ERROR';
const severity_warning = 'WARNING';
const severity_debug = 'DEBUG';
const severity_trace = 'TRACE';
const simulation_trace = 'SIMULATION';

const DESTINATION_URL = process.env.DESTINATION_URL || 'http://goalshumanityserver:9001/pinghumanityserver';
const http = require('http');
const PORT = process.env.PORT || 9000;

// io = require('socket.io')
const cote = require('cote')

const winston = require('winston');
const { format } = winston;
const { combine, timestamp, printf, colorize, align } = winston.format;

const tracing = require('./tracing');
const errors = require('./errors.js');

require('dotenv').config();

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

async function pingserver() {
  // This logs a message to the console every time the function runs, indicating that a 'ping' is being sent
  logEventMessage('PINNING goalshumanityservice', severity_trace);
  logEventMessage(DESTINATION_URL, severity_trace);
  
  logEventMessage(`LATENCE_SIMULATOR is set to ${process.env.LATENCE_SIMULATOR}`, simulation_trace);
  if(process.env.LATENCE_SIMULATOR === 'ON')
  {
    logEventMessage('LATENCE_SIMULATOR is set to ON', simulation_trace);
    await sleep(process.env.LATENCE_SIMULATOR_DELAY);  // Simulation delay
  }

  try{
    // An HTTP GET request is made to the destination URL (DESTINATION_URL)
    http.get(DESTINATION_URL, (resp) => {
        let data = '';

        // When data is received from the HTTP response, this event handler is called.
        // The 'data' event is triggered multiple times if the response is large, and 
        // each chunk is appended to the 'data' variable.
        resp.on('data', (chunk) => {
            data += chunk;
        });

        // The 'end' event is triggered when all the data has been received (the response is complete).
        // This logs the full response content to the console once it's fully retrieved.
        resp.on('end', () => {
            console.log(`recv: ${data}`);
        });

        // The 'error' event is triggered if there is an issue during the HTTP request, such as network errors.
        // This logs the error message to the console.
        resp.on('error', (err) => {
            errors.errorsCounter.add(1);
            console.log('Error: ' + err.message);
        });
    }); 
  }
  catch (err) {
    errors.errorsCounter.add(1);
    logEventMessage('ERROR sending ping request to goalshumanityserver', severity_error);
    logEventMessage(err, severity_error);
  }
}

app.get('/', (req, res) => {
  res.send('running...');
  logEventMessage(`api gateway running ${PORT}`, severity_trace);
});

app.get('/userslist', function(req, res) {
  userRequester.send({type: 'list'}, function(err, users) {
      if(err) {
        const msg = `apigateway,/userlist,${err}`;
        logger.log('error', msg);
        res.status(500).send('Error fetching users list');
        return;
      }
      else {
        logEventMessage('Fetched users list successfully', severity_info);
        const msg = `apigateway,/userlist,Users list fetched successfully from user-service`;
        logger.log('info', msg);
        // logger.log('verbose', JSON.stringify(users, null, 2))
        // console.log(JSON.stringify(users, null, 2));
        res.status(200).send(users);
      }
  });
});

// app.get('/pingbridgeserver', async (req, res) => {
//   console.log(req.rawHeaders);
//   logEventMessage(req.rawHeaders, severity_debug);
  
//   await pingserver();
//   res.status(200).json({ message: 'goalsbridgeserver container present' }); 
// });

errors.errorsCounter.add(0);

// START listening...
app.listen(PORT);

const logFilePath = '/usr/share/logstash/ingest_data/apigateway.csv';

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
    new winston.transports.Console(),
    new winston.transports.File({
      filename: logFilePath,
    }),
    // new LogtailTransport(logtail),
  ],
});

logEventMessage(`API Gateway running... on ${PORT}`, severity_trace);
