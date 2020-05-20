/**
 * Server
 */
const contentSvc = require('./services/contentService');
const signalSvc = require('./services/signalService');

module.exports = {
    isRunning,
    startWithDelegate,
    stop,
    sendSignal
}

let running = false;

function isRunning() {
    return running;
}

function startWithDelegate(delegate) {
    if (!running) {
        contentSvc.start(8080, './server/data/clients', delegate.getSimCfg);
        signalSvc.start(8081, delegate.handleIncommingSignal);
        signalSvc.useInboundFilter(delegate.filterSignalToServer);
        running = true;
    }
}

function stop() {
    if (running) {
        console.log("Stopping server");
        contentSvc.stop();
        signalSvc.stop();
        running = false;
    }
}

function sendSignal(signal) {
    if (running) {
        signalSvc.broadcastSignal(signal);
    }
}