const serviceNameProvider = require('./servicename.js');
const { metrics } = require('@opentelemetry/api');

// Meter
//const meter = metrics.getMeter(serviceNameProvider.trafficCounterMeter);

// Create a Counter to track HTTP requests
//const trafficGauge = meter.createGauge(serviceNameProvider.trafficCounterName, {
//  description: 'Tracks the number of HTTP requests',
//});

////////////////////////////////////////////////////////
// Traffic Counter Class
///
class CTrafficCounter {
  
  // Members
  totalRequests;
  startTime;
  lastRPM;        // To store the last requests per minute value
  meter;          // Meter object
  trafficGauge;   // Gauge metric to track the number of requests
  
  constructor() {
    this.totalRequests = 0;
    this.startTime = Date.now();  // Start time when the object is created
    this.lastRPM = 0;  // Initialize the last requests per minute
    this.meter = metrics.getMeter(serviceNameProvider.trafficCounterMeter);
    this.trafficGauge = this.meter.createGauge(serviceNameProvider.trafficCounterName, {
      description: 'Tracks the number of HTTP requests',
    });
  }

  // Methods
  incrementTraffic(inc) {
    const now = Date.now();
    const elapsedMilliseconds = now - this.startTime;
    const elapsedMinutes = elapsedMilliseconds / (1000 * 60);  // Convert to minutes

    // If more than 1 minute has passed, save the last RPM and reset counter
    if (elapsedMinutes >= 1) {
      this.setLastRPM(this.totalRequests / elapsedMinutes);  // Save RPM before resetting
      this.resetCounter();
    }

    // Increment the totalRequests counter
    this.totalRequests += inc;
    
    // console.log(`Requests per minute: ${this.getLastRPM()}`);
  }

  // Calculate total time passed in minutes (used internally or for custom time calculations)
  getTimeElapsedInMinutes() {
    const now = Date.now();
    const elapsedMilliseconds = now - this.startTime;
    return elapsedMilliseconds / (1000 * 60);  // Convert to minutes
  }

  // Calculate requests per minute (RPM)
  getRequestsPerMinute() {
    const timeElapsed = this.getTimeElapsedInMinutes();
    if (timeElapsed === 0) {
      return 0; // Prevent division by zero
    }
    return this.totalRequests / timeElapsed;
  }

  // Reset counter and start time
  resetCounter() {
    this.totalRequests = 0;
    this.startTime = Date.now();  // Reset the start time
  }

  setLastRPM(rpm) {
    this.lastRPM = rpm;
    this.trafficGauge.record(this.lastRPM); 
  }

  // Retrieve the last saved RPM value
  getLastRPM() {
    return this.lastRPM;
  }
}

module.exports = CTrafficCounter;


/*
let totalRequests = 0;

const incrementTraffic = () => {

  // totalRequests++;

  // Compute number of requests per minute.... using a GAUGE

  // Time....
  // Total number of requests...

  let averageRequests = 0; // todo..........

  requestGauge.record(averageRequests); 

  /// requestCounter.add(1);  // Increment for each request
  console.log('Request recorded');
};
*/

// module.exports = { trafficGauge };

