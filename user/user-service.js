const logger_name='users-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

var cote = require('cote'),
    models = require('../models');

var userResponder = new cote.Responder({
    name: 'user responder',
    namespace: 'user',
    respondsTo: ['create']
});

var userPublisher = new cote.Publisher({
    name: 'user publisher',
    namespace: 'user',
    broadcasts: ['update']
});

userResponder.on('*', console.log);

userResponder.on('create', function(req, cb) {
    logEventMessage(logger_name, 'USER service called - create - Create new user in BD', severity_info, getLineNumber());
    models.User.create({}, cb);
    updateUsers();
});

userResponder.on('list', function(req, cb) {
    logEventMessage(logger_name, 'USER service called - list - Find all users in BD', severity_info, getLineNumber());
    var query = req.query || {};
    models.User.find(query, cb);
});

userResponder.on('get', function(req, cb) {
    logEventMessage(logger_name, 'USER service called - get - Find user with ID in BD', severity_info, getLineNumber());
    models.User.get(req.id, cb);
});

function updateUsers() {
    logEventMessage(logger_name, 'USER service called - updateUsers(): finds all users from the BD', severity_info, getLineNumber());
    models.User.find(function(err, users) {
        logEventMessage(logger_name, 'USER service called - updateUsers(): publishes to observers an update for all users', severity_info, getLineNumber());
        userPublisher.publish('update', users);
    });
}

logEventMessage(logger_name, 'USERS service started', severity_info, getLineNumber());
