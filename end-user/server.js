const logger_name='enduser-service-logger';
const {PrometheusSocketIo} = require('socket.io-prometheus-v3')

//const {logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');

var app = require('express')(),
    server = require('http').Server(app),
    io = require('socket.io')(server),
    cote = require('cote'),
    { v4: uuidv4 } = require('uuid'),
    {trace, context, propagation, tracer, logEventMessage, severity_info, getLineNumber} = require(__dirname + '/tracing.js');


// interface PrometheusSocketIoConfig {
//     io: io.Server;
//     collectDefaultMetrics?: boolean;
// }
// export declare class PrometheusSocketIo {
//     config: PrometheusSocketIoConfig;
//     static init(options: PrometheusSocketIoConfig): PrometheusSocketIo;
//     constructor(options: PrometheusSocketIoConfig);
//     collectDefaultMetrics(): void;
//     collectSocketIoMetrics(): void;
//     getMetrics(): Promise<string>;
// }

// const promSocketIOV3 = new PrometheusSocketIo({
//     io: io, // Pass the Socket.IO server instance
//     collectDefaultMetrics: true // Optional: Enable default metrics collection
// });

const prometheusV3 = PrometheusSocketIo.init({ 
    io: io, // Pass the Socket.IO server instance
    collectDefaultMetrics: true // Optional: Enable default metrics collection
})

// Serve your metrics with express or whatever http server
app.get('/metrics', async (req, res) => {
    res.send(await prometheusV3.getMetrics())
}) 

app.get('/', function (req, res) {
    console.log(`${req.ip} requested end-user interface`);
    res.sendFile(__dirname + '/index.html');
});

logEventMessage(logger_name, 'END-USER service starts listening on port 5001...', severity_info, getLineNumber());
server.listen(5001);
logEventMessage(logger_name, 'END-USER service is listening on port 5001', severity_info, getLineNumber());

new cote.Sockend(io, {
    name: 'end-user sockend server'
});

