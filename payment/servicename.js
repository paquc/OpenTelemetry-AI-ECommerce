const serviceName = 'paymentService';
const heartBeatGaugeName = 'payment-heartbeat-gauge';
const heartBeatGaugeMeter = 'payment-status-meter';
const memoryGaugeName = 'payment-memory-gauge';
const memoryGaugeMeter = 'payment-memory-meter';
const errorsGaugeName = 'payment-errors-gauge';
const errorsGaugeMeter = 'payment-errors-meter';
const latencyHistogramMeter = 'payment-latency-histogram-meter';
const latencyHistogramName = 'payment-latency-histogram-name';
const trafficCounterMeter = 'payment-traffic-counter-meter';
const trafficCounterName = 'payment-traffic-counter-name';
const cpuGaugeName = 'payment-cpu-gauge';
const cpuGaugeMeter = 'payment-cpu-meter';

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