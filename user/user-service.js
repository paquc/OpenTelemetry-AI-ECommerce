const logger_name='users-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-User.csv';

const {createLogger, createMessage} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'user-service';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

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

/////////////////////////////////////////
// Called to create a new user in the BD
userResponder.on('create', 
    function(req, cb) {
        logEventMessage(logger_name, 'USER service called - create - Create new user in BD', severity_info, getLineNumber());
        const startTime = Date.now();
        models.User.create({}, cb);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'create', duration, '', `New user created successfully in ${duration} ms`));
        updateUsers();
    }
);

userResponder.on('list', 
    function(req, cb) {
        logEventMessage(logger_name, 'USER service called - list - Find all users in BD', severity_info, getLineNumber());
        const startTime = Date.now();
        var query = req.query || {};
        models.User.find(query, cb);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'list', duration, '', `Query all users from database ${duration} ms`));
});

userResponder.on('get', 
    function(req, cb) {
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

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'USERS service started with success'));

logEventMessage(logger_name, 'USERS service started', severity_info, getLineNumber());
