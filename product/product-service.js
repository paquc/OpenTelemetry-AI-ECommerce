const logger_name='products-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const logFilePath = '/usr/share/logstash/ingest_data/AppServiceProduct.csv';

const {createLogger, createMessage, isLogFileExists} = require('../winstonlogger.js');

const SOURCE_SERVICE = 'product-service';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

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
    var query = req.query || {};
    models.Product.find(query, cb);
});

productResponder.on('create', function(req, cb) {
    models.Product.create(req.product, function(err, products) {
        cb(err, products);

        updateProducts();
    });
});

productResponder.on('delete', function(req, cb) {
    const startTime = Date.now();
    models.Product.get(req.id, function(err, product) {
        product.remove(function(err, product) {
            const endTime = Date.now();
            const duration = endTime - startTime;
            wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'delete', duration, '', `Product deleted successfully for product ID=${req.id} in ${duration} ms`));

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


logEventMessage(logger_name, 'PRODUCTS service started', severity_info, getLineNumber());

function checkLogFile() {
    if(isLogFileExists()==false) {
      const logger = createLogger(logFilePath);
      logger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'PRODUCTS service started with success'));
    }
  }
  
  setInterval(checkLogFile, 1000);
