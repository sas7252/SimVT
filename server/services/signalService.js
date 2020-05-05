/**
 * Signal Service (WebSockets)
 * 
 */

module.exports = {
    start,
    stop,
    broadcastSignal,
    useInboundFilter
}

const WebSocket = require('ws');

var wss;

clients = [];

let running = false;
let ready = true;
let filter = null;

function start(usePort, publishToDelegate) {
    if (!running && ready) {
        ready = false;
        wss = new WebSocket.Server({ port: usePort });

        wss.on('connection', function connection(ws, req) {
            const sender = req.socket.remoteAddress;
            ws.on('message', function incomming(signal) {
                if (filter != null) {
                    if (filter(signal)) {
                        console.log('SignalService recieved VALID signal [' + signal + '] from ' + sender);
                        publishToDelegate(signal, sender);
                    } else {
                        console.log('SignalService recieved "' + signal + '" from ' + sender + ' (invalid signal)');
                    }
                } else {
                    console.log('SignalService recieved VALID signal [' + signal + '] from ' + sender);
                    publishToDelegate(signal, sender);
                }
            });
            ws.on('close', function close() {
                publishToDelegate("CLIENT_DISCONNECTED", sender);
              });
            ws.send('_WELCOME');
            publishToDelegate("CLIENT_CONNECTED", sender);

        });
        running = true;
        console.log("SignalService running on ws://localhost:" + usePort);
        ready = true;
    }
}

function stop() {
    if (running && ready) {
        ready = false;
        for (client of wss.clients) {
            client.close();
        }
        wss = null;
        running = false
        console.log("SignalService stopped");
        ready = true;
    }
}

function broadcastSignal(message) {
    if (running) {
        wss.clients.forEach(function each(client) {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    }
}

function useInboundFilter(newFilter) {
    filter = newFilter;
}
