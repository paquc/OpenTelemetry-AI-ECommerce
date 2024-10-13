const serviceNameProvider = require('./servicename.js');

// Metrics
const { metrics } = require('@opentelemetry/api');

// Since SDK is started... the MetriProvider exists!
const meterProvider = metrics.getMeterProvider();

// Get a meter from the meter provider 
const meter = meterProvider.getMeter(serviceNameProvider.heartBeatGaugeMeter);

// Create a Counter to manually set values like a gauge
const serviceStatusGauge = meter.createGauge(serviceNameProvider.heartBeatGaugeName, {
  description: 'Manually tracks the current status of the service',
});

let heartBeat = 0.0;
let heartBeatInc = 0.1;

// Set the service status flag. Will be read as 0 by prometheus if the service is down!
setInterval(() => {

  if(heartBeat <= -5.0) heartBeatInc =  0.1;    // Go UP!
  if(heartBeat >=  5.0) heartBeatInc = -0.1;    // Go Down!
  
  heartBeat += heartBeatInc;

  if(heartBeat < -5.0) heartBeat = -5.0;
  if(heartBeat >  5.0) heartBeat =  5.0;

  serviceStatusGauge.record(heartBeat);
  
}, 1000);