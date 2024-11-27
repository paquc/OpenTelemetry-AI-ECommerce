const logger_name='admin-service-logger';

const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

const {createLogger, createMessage} = require('../winstonlogger.js');

require('dotenv').config();

const { v4: uuidv4 } = require('uuid');
const os = require('os');

const SOURCE_SERVICE = 'admin-service';
const ERROR_NONE = 'OK';
const ERROR_CPU_WARN = 'ADMIN_SERVICE_CPU_WARN';

const http = require('http')

var app = require('express')(),
    bodyParser = require('body-parser'),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cote = require('cote');
    // {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

app.use(bodyParser.json());

const fs = require('fs');

let globalCPU = 0;

function logCPU(){

    const cpu = globalCPU;

    const min_value = 2.0;
    const max_value = 4.0;

    if (cpu < min_value) {
        wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'cpu-usage', cpu, '', `ADMIN API cpu usage running normally at ${cpu}%`, uuidv4()));
    } else if (cpu >= min_value && cpu < max_value) {
        wlogger.info(createMessage( Date.now(), ERROR_CPU_WARN, SOURCE_SERVICE, 'cpu-usage', cpu, '', `ADMIN API cpu usage running high at (TH=${min_value}%) ${cpu}%`, uuidv4()));
    } else if (cpu >= max_value) {
        wlogger.info(createMessage( Date.now(), ERROR_CPU_WARN, SOURCE_SERVICE, 'cpu-usage', cpu, '', `ADMIN API cpu usage running OVER the SLO (max=${max_value}%) at ${cpu}%`, uuidv4()));
    }
    else {
    }
}

function getCpuUsage() {

    fs.readFile('/proc/stat', 'utf8', (err, data) => {
        if (err) {
            wlogger.error(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'cpu-usage', '', '', `Error reading /proc/stat: ${err}`, uuidv4()));
            return;
        }
        const lines = data.split('\n');
        const cpuLine = lines.find(line => line.startsWith('cpu '));
        if (!cpuLine) {
            wlogger.error(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'cpu-usage', '', '', `Could not find CPU stats in /proc/stat`, uuidv4()));
            return;
        }

        const times = cpuLine.split(' ').slice(1).map(Number); // Remove 'cpu' label
        const idle = times[3]; // Idle time is the 4th value
        const total = times.reduce((acc, time) => acc + time, 0);

        if (this.lastTotal && this.lastIdle) {
            const totalDiff = total - this.lastTotal;
            const idleDiff = idle - this.lastIdle;
            const usage = ((totalDiff - idleDiff) / totalDiff) * 100;
            let remaincpu = 100 - usage;
            globalCPU = remaincpu.toFixed(2);
        }

        this.lastTotal = total;
        this.lastIdle = idle;
    });
}


app.all('*', function(req, res, next) {
    console.log(req.method, req.url);
    next();
});

app.get('/', function(req, res) {
    res.sendFile(__dirname + '/index.html');
});

app.get('/product', function(req, res) {
    logCPU()
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

// curl -X POST 'http://127.0.0.1:5000/product' -H "Content-Type: application/json" -d '{"product": {"name": "Sample Product","price": 25.99,"quantity": 100}}'

app.post('/product', function(req, res) {
    logCPU()
    productRequester.send({type: 'create', product: req.body.product}, function(err, product) {
        res.send(product);
    });
});

app.delete('/product/:id', function(req, res) {
    logCPU()
    productRequester.send({type: 'delete', id: req.params.id}, function(err, product) {
        res.send(product);
    });
});

app.get('/user', function(req, res) {
    logCPU()
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
    logCPU()
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
wlogger.info(createMessage( Date.now(), ERROR_NONE, SOURCE_SERVICE, 'Startup', '', '', 'ADMIN API service started with success'));

new cote.Sockend(io, {
    name: 'admin sockend server'
});

setInterval(() => {
    getCpuUsage();
    // logCPU();
}, 100);




