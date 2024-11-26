const logger_name='admin-service-logger';

const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const {createLogger, createMessage} = require('../winstonlogger.js');

const { v4: uuidv4 } = require('uuid');

const SOURCE_SERVICE = 'admin-service';
const ERROR_NONE = 'OK';
const ERROR_DELAY = 'SVC_USER_REQ_DELAY';
const ERROR_FAIL = 'SVC_USER_REQ_FAIL';

var app = require('express')(),
    bodyParser = require('body-parser'),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cote = require('cote');
    // {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

app.use(bodyParser.json());

app.all('*', function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/product', function(req, res) {
    const startTime = Date.now();
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    productRequester.send({type: 'list'}, function(err, products) {
        res.send(products);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '/product', duration, '', `Products listed successfully from product-service in ${duration} ms`, request_ID));
    });
});

app.post('/product', function(req, res) {
    productRequester.send({type: 'create', product: req.body.product}, function(err, product) {
        res.send(product);
    });
});

app.delete('/product/:id', function(req, res) {
    productRequester.send({type: 'delete', id: req.params.id}, function(err, product) {
        res.send(product);
    });
});

app.get('/user', function(req, res) {
    const startTime = Date.now();
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    userRequester.send({type: 'list'}, function(err, users) {
        res.send(users);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '/user', duration, '', `Users listed successfully from user-service in ${duration} ms`, request_ID));
    });
});

app.get('/purchase', function(req, res) {
    const startTime = Date.now();
    let {request_ID}  = req; // Extract the request ID from the incoming request
    if (!request_ID) {
        request_ID = uuidv4();
    }
    purchaseRequester.send({type: 'list'}, function(err, purchases) {
        res.send(purchases);
        const endTime = Date.now();
        const duration = endTime - startTime;
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '/purchase', duration, '', `Purchases listed successfully from purchase-service in ${duration} ms`, request_ID));
    });
});

var productRequester = new cote.Requester({
    name: 'admin product requester',
    namespace: 'product'
});

var userRequester = new cote.Requester({
    name: 'admin user requester',
    namespace: 'user'
});

var purchaseRequester = new cote.Requester({
    name: 'admin purchase requester',
    namespace: 'purchase'
});

logEventMessage(logger_name, 'ADMIN service starts listening on port 5000...', severity_info, getLineNumber());
server.listen(5000);
logEventMessage(logger_name, 'ADMIN service is listening on port 5000 *****', severity_info, getLineNumber());

const logFilePath = '/usr/share/logstash/ingest_data/AI-ECommerce-Admin';

wlogger = createLogger(logFilePath);
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, '', '', '', 'ADMIN API service started with success'));

new cote.Sockend(io, {
    name: 'admin sockend server'
});
