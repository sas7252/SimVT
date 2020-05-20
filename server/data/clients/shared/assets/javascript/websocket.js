/**
 * WebSocket Client Library
 */

__f = function() {
    console.error("Implementation missing");
}

let ws = {
    __connected: false
}

ws.__onConnect = function(evt) {
    this.__connected = true;
    console.info('Sucessfully connected to ' + this.__serverAddress);
}

ws.__onClose = function(evt) {
    console.warn('LOST CONNECTION TO SERVER');
    alert("Server is not reponding");
    this.__connected = false;
}

ws.__onMessage = function(evt) {
    this.__delegateFunction(evt.data);
}

ws.__onError = function(evt) {
    console.error('WSClient Error: ' + evt);
}

ws.connect = function(serverAddress, delegateFunction) {
    if (!this.__connected) {
        this.__serverAddress = serverAddress;
        this.__delegate = delegateFunction;
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
    console.log('Sending signal [' + signal + '] to server');
    this._ws.send(signal);
}