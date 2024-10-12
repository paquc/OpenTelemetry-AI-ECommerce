const logger_name='products-service-logger';
const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

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
    models.Product.get(req.id, function(err, product) {
        product.remove(function(err, product) {
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
