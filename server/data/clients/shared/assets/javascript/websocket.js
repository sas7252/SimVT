/**
 * WebSocket Client Library
 */

__f = function() {
    console.error("Implementation missing");
}

let ws = {
    __connected: false,
    __delegateFunction: function () {}
}

ws.__onConnect = function(evt) {
    this.__connected = true;
    console.info('WSCLIENT: CONNECTION ESTABLISHED');
}

ws.__onClose = function(evt) {
    console.warn('WSCLIENT: LOST CONNECTION TO SIGNAL SERVICE');
    console.info('WSCLIENT: We should propably try again... (Add Implementation?)');
    alert("SignalServer is not reponding");
    this.__connected = false;
}

ws.__onMessage = function(evt) {
    ws.__delegateFunction(evt.data);
}

ws.__onError = function(evt) {
    console.error('WSClient Error: ' + evt);
}

ws.connect = function(serverAddress, delegate) {
    if (!this.__connected) {
        ws.__delegateFunction = delegate;
        console.log("WSCLIENT: Connecting to " + serverAddress);
        this.__ws = new WebSocket(serverAddress);
        this.__ws.onopen = this.__onConnect;
        this.__ws.onclose = this.__onClose;
        this.__ws.onmessage = this.__onMessage;
        this.__ws.onerror = this.__onError;
    }
}

ws.disconnect = function() {
    this.__ws.close();
}

ws.sendSignal = function(signal) {
    console.log('WSCLIENT: Sending signal [' + signal + '] to server');
    ws.__ws.send(signal);
}