const serviceNameProvider = require('./servicename.js');
const { metrics } = require('@opentelemetry/api');

// Meter
const meter = metrics.getMeter(serviceNameProvider.latencyHistogramMeter);

// Create a Histogram to measure request latency
const latencyHistogram = meter.createHistogram(serviceNameProvider.latencyHistogramName, {
  description: 'Add goal latency',
});

function recordLatency (startTime) {
  console.log(`Compute latency...`);
  const duration = process.hrtime(startTime);  // Get time difference
  const latency = duration[0] * 1e3 + duration[1] * 1e-6; // Convert to milliseconds
  latencyHistogram.record(latency);
  console.log(`Request latency: ${latency} ms`);
  return latency;
};

module.exports = 
{ 
  recordLatency,
};
