const logger_name='payment-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const logFilePath = '/usr/share/logstash/ingest_data/AppServicePayment.csv';

const {createLogger, createMessage, isLogFileExists} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'payment-service';
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
    const startTime = Date.now();
    models.User.get(req.userId, function(err, user) {
        if (user.balance < req.price) 
            return cb(true);
        user.balance -= req.price;
        user.save(cb);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'process', duration, '', `Payment processed successfully for user ID=${req.userId} in ${duration} ms`));
    });
});



logEventMessage(logger_name, 'PAYMENT service started', severity_info, getLineNumber());

function checkLogFile() {
    if(isLogFileExists()==false) {
      const logger = createLogger(logFilePath);
      logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PAYMENT service started with success'));
    }
  }
  
  setInterval(checkLogFile, 1000);

