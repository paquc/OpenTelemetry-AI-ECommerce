const severity_info = 'INFO';
const severity_error = 'ERROR';
const severity_warning = 'WARNING';
const severity_debug = 'DEBUG';
const simulation_trace = 'SIMULATION';

const {loggerProvider, getLineNumber} = require(__dirname + '/tracing.js');

var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cote = require('cote');


app.get('/', function (req, res) {
    console.log(`${req.ip} requested end-user interface`);

    res.sendFile(__dirname + '/index.html');
});

function logEventMessage(message, severity, line) {

    const logger = loggerProvider.getLogger('enduser-service-logger');
  
    // emit a log message 
    logger.emit({
      severityText: severity,
      body: message,
      attributes: { 
        'log.project': 'ETS-AI-Project',
        'log.service': 'endUserService',
        'log.line': line,}
    });
  
    console.log(`${severity} : ${message}`); 
};

logEventMessage('END-USER service starts listening on port 5001...', severity_info, getLineNumber());
server.listen(5001);
logEventMessage('END-USER service is listening on port 5001', severity_info, getLineNumber());

new cote.Sockend(io, {
    name: 'end-user sockend server'
});
