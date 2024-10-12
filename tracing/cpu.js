const os = require('os');

const serviceNameProvider = require('./servicename.js');

// Metrics
const { metrics } = require('@opentelemetry/api');

// Since SDK is started... the MetriProvider exists!
const meterProvider = metrics.getMeterProvider();

// Get a meter from the meter provider 
const meter = meterProvider.getMeter(serviceNameProvider.cpuGaugeMeter);

// Create a Gauge to manually set values
const cpuGauge = meter.createGauge(serviceNameProvider.cpuGaugeName, {
  description: 'Manually tracks the current cpu usage',
});

// Function to calculate CPU usage
function getCpuUsage() {
    const cpus = os.cpus();

    let userTime = 0;
    let niceTime = 0;
    let sysTime = 0;
    let idleTime = 0;
    let irqTime = 0;

    // Iterate over all CPU cores
    cpus.forEach((cpu) => {
        userTime += cpu.times.user;
        niceTime += cpu.times.nice;
        sysTime += cpu.times.sys;
        idleTime += cpu.times.idle;
        irqTime += cpu.times.irq;
    });

    // Total time spent by each core
    const totalTime = userTime + niceTime + sysTime + idleTime + irqTime;

    return {
        user: ((userTime / totalTime) * 100).toFixed(2),
        system: ((sysTime / totalTime) * 100).toFixed(2),
        idle: ((idleTime / totalTime) * 100).toFixed(2),
        total: totalTime
    };
}

function monitorCpuUsage() {

    const start = getCpuUsage();

    // Wait for 1 second to measure CPU usage difference
    setInterval(() => {

        const end = getCpuUsage();

        //console.log('CPU Usage:');
        //console.log(`User: ${end.user}%`);
        //console.log(`System: ${end.system}%`);
        //console.log(`Idle: ${end.idle}%`);

        cpuGauge.record(Math.ceil(100 - end.idle)); 

    }, 1000); // Check CPU usage after 1 second
}

monitorCpuUsage();