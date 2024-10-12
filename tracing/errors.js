const serviceNameProvider = require('./servicename.js');

// Metrics
const { metrics } = require('@opentelemetry/api');

// Since SDK is started... the MetriProvider exists!
const meterProvider = metrics.getMeterProvider();

// Get a meter from the meter provider 
const meter = meterProvider.getMeter(serviceNameProvider.errorsGaugeMeter);

// Create a Gauge to manually set values
//const errorsGauge = meter.createGauge(serviceNameProvider.errorsGaugeName, {
const errorsCounter = meter.createUpDownCounter(serviceNameProvider.errorsGaugeName, {
  description: 'Manually tracks erors',
});

const recordError = () => {
  errorsCounter.add(1);           // Increment for each error
  console.log('Error recorded');
};

module.exports = {
  errorsCounter,
  recordError,
};

