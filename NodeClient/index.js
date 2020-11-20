// The node program that captures local performance openDatabase
// and sends it up to the socket.io server

const os = require('os');

function performanceData() {
    return new Promise(async (resolve, reject) => {

    // What do we need to know from node about performance?
    // -CPU load (current)
        const freeMem = os.freemem();
        const totalMem = os.totalmem();
        const usedMem = totalMem - freeMem;
        const memUseage = Math.floor(usedMem / totalMem * 100) / 100;
    // - OS type
        const osType = os.type() === 'Darwin' ? 'Mac' : os.type();
    // - uptime
        const upTime = os.uptime();
    // - CPU info
        const cpus = os.cpus();
    //     - Type
        const cpuModel = cpus[0].model
    //     - Number of cores
        const numCores = cpus.length;
    //     - Clock speed
        const cpuSpeed = cpus[0].speed

    const cpuLoad = await getCpuLoad();
        // console.log(cpuLoad);


        resolve({
            freeMem,
            totalMem,
            usedMem,
            memUseage,
            osType,
            upTime,
            cpuModel,
            numCores,
            cpuSpeed,
            cpuLoad
        })
    })
}

// because the times property is time since boot, we will getCpuLoad()now times, and 100ms from now times.
// Comparing them, that will give us current load
function getCpuLoad() {
    return new Promise((resolve, reject) => {
        const start = cpuAverage();
        setTimeout(() => {
            const end = cpuAverage();
            const idleDifference = end.idle - start.idle;
            const totalDifference = end.total - start.total;

            // calc the % of used cpu
            const percentageCpu = 100 - Math.floor(100 * idleDifference / totalDifference) ;

            resolve(Number.isNaN(percentageCpu) ? 0 : percentageCpu)
    });
    }, 100)
}

performanceData().then((allPerformanceData) => {
    console.log(allPerformanceData);
})

// cpus is all cores. We need the average of all the cores which will give us the cpu average
function cpuAverage() {
    const cpus = os.cpus();
    // get ms in each mode, BUT this number is since reboot
    // so get it now, and get it in 100ms and compare
    let idleMs = 0;
    let totalMs = 0;
    cpus.forEach((aCore) => {
        // loop through each property of the current core
        for(type in aCore.times) {
            totalMs += aCore.times[type];
        }
        idleMs += aCore.times.idle;
    });
    return {
        idle: idleMs / cpus.length,
        total: totalMs / cpus.length
    }
}
