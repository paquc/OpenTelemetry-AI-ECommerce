const serviceName = 'apigateway';
const heartBeatGaugeName = 'apigateway-heartbeat-gauge';
const heartBeatGaugeMeter = 'apigateway-status-meter';
const memoryGaugeName = 'apigateway-memory-gauge';
const memoryGaugeMeter = 'apigateway-memory-meter';
const errorsGaugeName = 'apigateway-errors-gauge';
const errorsGaugeMeter = 'apigateway-errors-meter';
const latencyHistogramMeter = 'apigateway-latency-histogram-meter';
const latencyHistogramName = 'apigateway-latency-histogram-name';
const trafficCounterMeter = 'apigateway-traffic-counter-meter';
const trafficCounterName = 'apigateway-traffic-counter-name';
const cpuGaugeName = 'apigateway-cpu-gauge';
const cpuGaugeMeter = 'apigateway-cpu-meter';

module.exports = {
    serviceName, 
    heartBeatGaugeName, 
    heartBeatGaugeMeter,
    memoryGaugeName,
    memoryGaugeMeter,
    errorsGaugeName,
    errorsGaugeMeter,
    latencyHistogramMeter,
    latencyHistogramName,
    trafficCounterMeter,
    trafficCounterName,
    cpuGaugeName,
    cpuGaugeMeter,
};