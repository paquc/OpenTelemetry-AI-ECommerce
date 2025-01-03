// DO THAT first !!!
//************************************************************************ */
//const { NodeTracerProvider } = require("@opentelemetry/node");
//const { registerInstrumentations } = require('@opentelemetry/instrumentation');
// const { ConsoleSpanExporter, SimpleSpanProcessor } = require("@opentelemetry/tracing");

// const provider = new NodeTracerProvider();
// registerInstrumentations({
//   tracerProvider: provider,
//   instrumentations: [new SocketIoInstrumentation()],
// });

// provider.addSpanProcessor(new SimpleSpanProcessor(new ConsoleSpanExporter()));
// provider.register();

//************************************************************************ */

// DOC Node-SDK: https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_sdk_node.html
console.log("TRACING--> Loading traing.js...");

const severity_info = 'INFO';
const severity_error = 'ERROR';
const severity_warning = 'WARNING';
const severity_debug = 'DEBUG';
const simulation_trace = 'SIMULATION';

const serviceNameProvider = require(__dirname + '/servicename.js');

// const { SemanticResourceAttributes, ATTR_SERVICE_NAME } = require('@opentelemetry/semantic-conventions');
// const { Incubating } = require('@opentelemetry/semantic-conventions/incubating');

const { Resource } = require('@opentelemetry/resources');
const opentelemetry = require("@opentelemetry/sdk-node");
const { trace, diag, DiagConsoleLogger, DiagLogLevel, metrics } = require('@opentelemetry/api');

const context = require('@opentelemetry/api').context;
const propagation = require('@opentelemetry/api').propagation;

//////////////////////////////////////////////
// Traces instrumentations
//

// const {AwsLambdaInstrumentation} = require('@opentelemetry/instrumentation-aws-lambda');
// const { getNodeAutoInstrumentations, getResourceDetectorsFromEnv } = require("@opentelemetry/auto-instrumentations-node");  // Don.t work
const { SocketIoInstrumentation } = require("@opentelemetry/instrumentation-socket.io");
const { HttpInstrumentation } = require("@opentelemetry/instrumentation-http");
const { ExpressInstrumentation } = require("@opentelemetry/instrumentation-express");
const { NestInstrumentation } = require("@opentelemetry/instrumentation-nestjs-core");
const { NetInstrumentation } = require("@opentelemetry/instrumentation-net");
const { GrpcInstrumentation } = require("@opentelemetry/instrumentation-grpc");
const { NodeTracerProvider } = require("@opentelemetry/sdk-trace-node");
//const { PgInstrumentation } = require("@opentelemetry/instrumentation-pg");
//const { MongooseInstrumentation } = require("@opentelemetry/instrumentation-mongoose");


//////////////////////////////////
// Logs
const { OTLPLogExporter } = require('@opentelemetry/exporter-logs-otlp-http');
const { LoggerProvider, ConsoleLogRecordExporter, SimpleLogRecordProcessor } = require('@opentelemetry/sdk-logs');
const { logs, SeverityNumber } = require('@opentelemetry/api-logs');

//////////////////////////////////
// Traces
const { OTLPTraceExporter } = require('@opentelemetry/exporter-trace-otlp-http');
const { ConsoleSpanExporter, SimpleSpanProcessor, BatchSpanProcessor } = require('@opentelemetry/sdk-trace-base');





//////////////////////////////////
// Metrics
const { OTLPMetricExporter } = require('@opentelemetry/exporter-metrics-otlp-http');
const { 
  ExponentialHistogramAggregation, 
  MeterProvider, 
  PeriodicExportingMetricReader,
  View,
} = require('@opentelemetry/sdk-metrics');


/////////////////
// Logs...
// configure global LoggerProvider
// For troubleshooting, set the log level to (ALL, DEBUG, ERROR, INFO, NONE, VERBOSE, WARN)
diag.setLogger(new DiagConsoleLogger(), DiagLogLevel.ERROR);

const logsResource = new Resource({
  //[ATTR_SERVICE_NAME]: serviceNameProvider.serviceName, 
  //"service.name": serviceNameProvider.serviceName, 
  serviceName: serviceNameProvider.serviceName, 
});

const loggerProvider = new LoggerProvider({
  // serviceName: serviceNameProvider.serviceName,
  resource: logsResource,
});

loggerProvider.addLogRecordProcessor(
  new SimpleLogRecordProcessor(new ConsoleLogRecordExporter())
);

logs.setGlobalLoggerProvider(loggerProvider);


const OTLPLogsDataExporter = new OTLPLogExporter({
  url: 'http://collector-gateway:4318/v1/logs', // url points to the local gRPC collector gateway configured in docker-compose
  headers: {},    // optional - collection of custom headers to be sent with each request, empty by default
});
const simpleLogsProcessor = new SimpleLogRecordProcessor(OTLPLogsDataExporter);
loggerProvider.addLogRecordProcessor(simpleLogsProcessor);


//////////////
// Traces...
const OTLPTracesExporter = new OTLPTraceExporter({
    url: 'http://collector-gateway:4318/v1/traces', // url points to the local OTLP collector gateway configured in docker-compose
    headers: {},    // optional - collection of custom headers to be sent with each request, empty by default
});


// Configure the BatchSpanProcessor with maxQueueSize
const batchSpanProcessor = new BatchSpanProcessor(OTLPTracesExporter, {
  maxQueueSize: 10420,          // Maximum queue size before spans are dropped
  maxExportBatchSize: 512,      // Maximum number of spans sent in a single batch
  scheduledDelayMillis: 5000,   // Delay interval between two consecutive exports
  exportTimeoutMillis: 30000,   // Maximum allowed time to send a batch
});


// Get a tracer instance
const tracer = trace.getTracer('cote-instrumentation-tracer');

/////////////////
// Metrics...
const OTLPMetricsExporter = new OTLPMetricExporter({
  url: 'http://collector-gateway:4318/v1/metrics',  // url points to the local OTLP collector gateway configured in docker-compose
  headers: {},                                      // optional - collection of custom headers to be sent with each request, empty by default
  concurrencyLimit: 1,                              // an optional limit on pending requests
});

const periodicMeterExporterReader = new PeriodicExportingMetricReader({
  exporter: OTLPMetricsExporter,
  exportIntervalMillis: 2000      
});

// DOC Node-SDK: https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_sdk_node.html

const sdk = new opentelemetry.NodeSDK({
    serviceName: serviceNameProvider.serviceName,
    instrumentations: [
      new SocketIoInstrumentation(),
      new HttpInstrumentation(), 
      new ExpressInstrumentation(),
      new NestInstrumentation(),  
      new NetInstrumentation(),
      new GrpcInstrumentation(),
    ],          
    spanProcessors: [batchSpanProcessor, ],                   // Optional - you can add more span processors
    traceExporter: OTLPTracesExporter,                        // Optional - if omitted, the tracing SDK will be initialized from environment variables
    metricReader: periodicMeterExporterReader,                // Optional - If omitted, the metrics SDK will not be initialized
    autoDetectResources: true,                                // Optional - if omitted, the SDK will not automatically detect resources
    logRecordProcessors: [simpleLogsProcessor],               // Optional - LogRecordProcessor array
});

function logEventMessage(logger_name, message, severity, line) {

  const logger = loggerProvider.getLogger(logger_name);

  // emit a log message 
  logger.emit({
    severityText: severity,
    body: message,
    attributes: { 
      'log.project': 'ETS-AI-Project',
      'log.service': logger_name,
      'log.line': line,
    }
  });

  console.log(`${severity} : ${message}`); 
};

function getLineNumber() {
  const error = new Error();
  const stackLines = error.stack.split("\n");
  // The third line of the stack usually contains the line number info
  const lineInfo = stackLines[2].trim();
  return lineInfo;
}

// START the SDK in a node and start instrumenting
sdk.start();

// DOC Node-SDK: https://open-telemetry.github.io/opentelemetry-js/modules/_opentelemetry_sdk_node.html


////////////////////////////////////
// Monitor service status 
//  AFTER  SDK is tarted!
const heartbeat = require(__dirname + '/heartbeat.js');
const processMemory = require(__dirname + '/memory.js');
const cpu = require(__dirname + '/cpu.js');

// You can also use the shutdown method to gracefully shut down the SDK before process shutdown
// or on some operating system signal.
const process = require("process");
process.on("SIGTERM", () => {
  sdk
    .shutdown()
    .then(
      () => console.log("SDK shut down successfully"),
      (err) => console.log("Error shutting down SDK", err)
    )
    .finally(() => process.exit(0));
});


module.exports = 
{
  loggerProvider, 
  getLineNumber,
  severity_info,
  severity_error,
  severity_warning,
  severity_debug,
  simulation_trace,
  logEventMessage,
  tracer,
  context,
  propagation,
  trace,
};

// https://www.npmjs.com/package/@opentelemetry/sdk-node
// https://open-telemetry.github.io/opentelemetry-js/classes/_opentelemetry_sdk_trace_base.BasicTracerProvider.html#addSpanProcessor
