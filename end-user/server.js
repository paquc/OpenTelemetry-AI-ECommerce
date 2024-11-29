const logger_name='enduser-service-logger';

const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cote = require('cote'),
    { v4: uuidv4 } = require('uuid');

app.get('/', function (req, res) {
    console.log(`${req.ip} requested end-user interface`);
    res.sendFile(__dirname + '/index.html');
});

logEventMessage(logger_name, 'END-USER service starts listening on port 5001...', severity_info, getLineNumber());
server.listen(5001);
logEventMessage(logger_name, 'END-USER service is listening on port 5001', severity_info, getLineNumber());

new cote.Sockend(io, {
    name: 'end-user sockend server'
});
