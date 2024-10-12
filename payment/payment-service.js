const logger_name='payment-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

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

logEventMessage(logger_name, 'PAYMENT service started', severity_info, getLineNumber());

