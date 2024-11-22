require('dotenv').config();

const logger_name='purchase-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Purchase.csv';

const {createLogger} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'purchase-service';
const API_ENDPOINT = '/userslist';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

var cote = require('cote'),
    models = require('../models');

var purchaseResponder = new cote.Responder({
    name: 'purchase responder',
    namespace: 'purchase',
    respondsTo: ['buy']
});

var purchasePublisher = new cote.Publisher({
    name: 'purchase publisher',
    namespace: 'purchase',
    broadcasts: ['update']
});

var paymentRequester = new cote.Requester({
    name: 'payment requester',
    key: 'payment'
});

purchaseResponder.on('*', console.log);

purchaseResponder.on('buy', function(req, cb) {
    var purchase = new models.Purchase({});

    models.Product.get(req.productId, function(err, product) {
        if (product.stock == 0) return cb(true);

        paymentRequester.send({ type: 'process', userId: req.userId, price: product.price }, function(err) {
            if (err) return cb(err);

            product.stock--;

            models.User.get(req.userId, function(err, user) {
                product.save(function() {
                    purchase.setOwner(user, function() {
                        purchase.setProduct(product, function() {
                            purchase.save(function(err, purchase) {
                                cb(err, {
                                    user: user,
                                    purchase: purchase
                                });
                                updatePurchases();
                            });
                        });
                    });
                });
            });
        });
    });
});

purchaseResponder.on('list', function(req, cb) {
    const startTime = Date.now();
    var query = req.query || {};
    models.Purchase.find(query, cb);
    const endTime = Date.now();
    const duration = endTime - startTime;
    const currentTimeUnix = Date.now();
    const msg = `${currentTimeUnix},${ERROR_NONE},${SOURCE_SERVICE},'list',${duration},,Purchases list fetched successfully from postgres database in ${duration} ms`;
    wlogger.info(msg);
});

function updatePurchases() {
    models.Purchase.find(function(err, purchases) {
        purchasePublisher.publish('update', purchases);
    });
}

wlogger = createLogger(logFilePath);

const msg = Date.now() + `,${ERROR_NONE},${SOURCE_SERVICE},,,,PURCHASE service started with success`;
wlogger.info(msg);

logEventMessage(logger_name, 'PURCHASE service started', severity_info, getLineNumber());
