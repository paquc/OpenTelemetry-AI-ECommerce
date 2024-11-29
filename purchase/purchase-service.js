require('dotenv').config();

const logger_name='purchase-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');


const {createLogger, createMessage} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'purchase-service';
const API_ENDPOINT = '/userslist';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

const { v4: uuidv4 } = require('uuid');

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

var userRequester = new cote.Requester({
    name: 'admin user requester',
    namespace: 'user'
  });

purchaseResponder.on('*', console.log);

purchaseResponder.on('buy', function(req, cb) {
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'buy', '', '', `Request to buy a product for ID=${req.productId}`, request_ID));

    var purchase = new models.Purchase({});

    models.Product.get(req.productId, function(err, product) {
        
        if (product.stock == 0) 
            return cb(true);

        paymentRequester.send(
            { 
                type: 'process', 
                userId: req.userId, 
                price: product.price,
                request_ID: request_ID, // Include the request ID
            },
            function(err) {
            if (err) 
                return cb(err);

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
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    const startTime = Date.now();
    
    // Execute the query to the DB
    var query = req.query || {};
    models.Purchase.find(query, cb);

    const endTime = Date.now();
    const duration = endTime - startTime;
    
    wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'list', duration, '', `Purchases list fetched successfully from postgres database in ${duration} ms`, request_ID));
});

function updatePurchases() {
    models.Purchase.find(function(err, purchases) {
        purchasePublisher.publish('update', purchases);
    });
}

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Purchase';

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PURCHASE service started with success'));

logEventMessage(logger_name, 'PURCHASE service started', severity_info, getLineNumber());
