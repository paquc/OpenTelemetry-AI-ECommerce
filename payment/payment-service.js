const logger_name='payment-service-logger';
const {trace, context, propagation, tracer, logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const {createLogger, createMessage} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'payment-service';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

const { v4: uuidv4 } = require('uuid');

var cote = require('cote'),
    models = require('../models');

var paymentResponder = new cote.Responder({
    name: 'payment responder',
    key: 'payment'
});

var userRequester = new cote.Requester({
    name: 'admin user requester',
    namespace: 'user'
  });

paymentResponder.on('*', function(req){
    console.log('payment-service /*', req);
})



paymentResponder.on('call', function(req){
    // Extract context from request
    console.log('payment-service constext /call', JSON.stringify(context.active()));
    const parentContext = propagation.extract(context.active(), req, {
        get: (carrier, key) => carrier[key], // Define how to get keys from the request
    });
    // Start a new span with the extracted context
    const span = tracer.startSpan('paymentResponder.on', undefined, parentContext);
    console.log('payment-service /call', req);
    span.setAttribute('request.data', JSON.stringify(req));
    span.setStatus({ code: 1 }); // Mark the span as successful
    span.end(); // End the span
})



paymentResponder.on('process', function(req, cb) {
    console.log('payment-service /process', req);
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    const startTime = Date.now();
    models.User.get(req.userId, function(err, user) {
        if (user.balance < req.price) 
            return cb(true);
        user.balance -= req.price;
        user.save(cb);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'process', duration, '', `Payment processed successfully for user ID=${req.userId} in ${duration} ms`, request_ID));
    });

    userRequester.send(
        {
          type: 'list',
          request_ID: request_ID, // Include the request ID
        }, 
        function(err, users) {
            
      });

});

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Payment';

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PAYMENT service started with success'));

logEventMessage(logger_name, 'PAYMENT service started', severity_info, getLineNumber());

