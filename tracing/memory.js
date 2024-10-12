const memoryUsage = process.memoryUsage();

const serviceNameProvider = require('./servicename.js');

// Metrics
const { metrics } = require('@opentelemetry/api');

// Since SDK is started... the MetriProvider exists!
const meterProvider = metrics.getMeterProvider();

// Get a meter from the meter provider 
const meter = meterProvider.getMeter(serviceNameProvider.memoryGaugeMeter);

// Create a Gauge to manually set values
const serviceGauge = meter.createGauge(serviceNameProvider.memoryGaugeName, {
  description: 'Manually tracks the current memory',
});

setInterval(() => {
      
    // Calculate heap memory saturation (used heap / total heap rss)
    const heapSaturation = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
    
    // Set memory in MB
    serviceGauge.record(heapSaturation); 
  
  }, 1000);