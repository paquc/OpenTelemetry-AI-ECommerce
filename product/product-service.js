const logger_name='products-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');


const {createLogger, createMessage} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'product-service';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

const { v4: uuidv4 } = require('uuid');

var cote = require('cote'),
    models = require('../models');

var productResponder = new cote.Responder({
    name: 'product responder',
    namespace: 'product',
    respondsTo: ['list']
});

var productPublisher = new cote.Publisher({
    name: 'product publisher',
    namespace: 'product',
    broadcasts: ['update']
});

productResponder.on('*', console.log);

productResponder.on('list', function(req, cb) {
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    const startTime = Date.now();
    var query = req.query || {};
    models.Product.find(query, cb);
    const endTime = Date.now();
    const duration = endTime - startTime;
    wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'list', duration, '', `Products fetched with success in ${duration} ms`, request_ID));
});

productResponder.on('create', function(req, cb) {
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    const startTime = Date.now();
    models.Product.create(req.product, function(err, products) {
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'create', duration, '', `Product created successfully in ${duration} ms`, request_ID));
        cb(err, products);
        updateProducts();
    });
});

productResponder.on('delete', function(req, cb) {
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    const startTime = Date.now();
    models.Product.get(req.id, function(err, product) {
        product.remove(function(err, product) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'delete', duration, '', `Product deleted successfully for product ID=${req.id} in ${duration} ms`, request_ID));
            cb(err, product);
            updateProducts();
        });
    });
});

function updateProducts() {
    models.Product.find(function(err, products) {
        productPublisher.publish('update', products);
    });
}

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Product';

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PRODUCTS service started with success'));

logEventMessage(logger_name, 'PRODUCTS service started', severity_info, getLineNumber());
