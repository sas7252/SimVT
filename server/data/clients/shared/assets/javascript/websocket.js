/**
 * WebSocket Client Library
 */

__f = function() {
    console.error("Implementation missing");
}

let ws = {
    init: null,
    connect: null,
    disconnect: null,
    sendMessage: null,
    ping: null,

    enableFilter: false,

    __delegate: null,
    __filter: null,
    __ws: null,

    __onConnect: __f,
    __onClose: __f,
    __onMessage: __f,
    __onError: __f
}

ws.__onConnect = function(evt) {
    console.info('Sucessfully connected to ' + this.__serverAddress);
}

ws.__onClose = function(evt) {

}

ws.__onMessage = function(evt) {
    var shouldDelegate = true
    if (this.enableFilter) shouldDelegate = this.filter(evt.data);
    if (shouldDelegate) this.__delegate(evt.data);
}

ws.__onError = function(evt) {

}

ws.connect = function(serverAddress) {
    this.__serverAddress = serverAddress;
    this.__ws = new WebSocket(serverAddress);
    this.__ws.onopen = this.__onConnect;
    this.__ws.onclose = this.__onClose;
    this.__ws.onmessage = this.__onMessage;
    this.__ws.onerror = this.__onError;
}

ws.enableFilter = function(bool) {
    this.__filter = bool
}

ws.setMessageDelegate = function(messageDelegate) {
    this.__delegate = messageDelegate;
}

ws.setMessageFilter = function(filter) {
    this.__filter = filter;
}

ws.disconnect = function() {
    this.__ws.close();
}

ws.sendMessage = function(message) {
    var shouldSend = true;
    if (this.enableFilterMsgOut) {
        shouldSend = this.filterOutgoingMessage(message) //websocket.send(message);
    } else {
        console.warn()
    }
    if (shouldSend) {
        websocket.send(message);
    } else {
        console.warn("Could not send message. (Not on outgoing whitelist)")
    }
}

//Overwrite / Connect App functions
app.connectToSignalServer = function = {
    ws.connect(this.__signalServerURL);
}

app.sendSignal = ws.sendMessage;