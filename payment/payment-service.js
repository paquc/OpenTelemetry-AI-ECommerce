const logger_name='payment-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Payment.csv';

const {createLogger, createMessage} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'payment-service';
const API_ENDPOINT = '/userslist';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

var cote = require('cote'),
    models = require('../models');

var paymentResponder = new cote.Responder({
    name: 'payment responder',
    key: 'payment'
});

paymentResponder.on('*', console.log);

paymentResponder.on('process', function(req, cb) {
    models.User.get(req.userId, function(err, user) {
        if (user.balance < req.price) return cb(true);

        user.balance -= req.price;

        user.save(cb);
    });
});

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PAYMENT service started with success'));

logEventMessage(logger_name, 'PAYMENT service started', severity_info, getLineNumber());

