/**
 * AppController
 */
const { app, Notification, ipcMain } = require('electron');

const frontend = require('./frontend');
const server = require('./server');

let appProperties = null;

module.exports = {
    initWithProperties,
    getProductName,
    getProductVersionString,
    getProductIcon,
    activateWindow,
    openBrowserWindowDeveloperTools,
    quitApplication,
    handleIncommingSignal,
    addMessageToWindowConsole,
    filterSignalToServer,
    filterSignalToClient
}

//let frontend = null;

let quitNow = false;
let ready = false;

function initWithProperties(properties) {
    appProperties = properties;
    frontend.createWithDelegate(this);
    server.startWithDelegate(this);
    ready = true;
}

function getProductName() {
    return appProperties.productName;
}

function getProductVersionString() {
    return appProperties.productVersionString;
}

function getProductIcon() {
    return appProperties.productIcon;
}

function activateWindow() {
    if (ready) {
        window = frontend.getWindow();
        window.show();
        window.focus();
    }
}

function openBrowserWindowDeveloperTools() {
    if (ready) {
        window = frontend.getWindow();
        window.webContents.openDevTools({mode:'detach'});
        console.log('opened developer tools for local window');
    }
}

function quitApplication() {
    if (!quitNow) {
        quitNow = true;
        server.stop();
        frontend.destroy();
        console.log('Goodbye :)')
    }
}

function handleIncommingSignal(signal, sender) {
    if (filterSignalToServer(signal)) {
        addMessageToWindowConsole("<--IN- [" + signal + "] from client " + sender);
    } else if (signal == "CLIENT_CONNECTED") {
            addMessageToWindowConsole("<----> CONNECTED " + sender, "blue");
    } else if (signal == "CLIENT_DISCONNECTED") {
        addMessageToWindowConsole("<-X X-> DISCONNECTED " + sender, "red");
    }
}

function sendCommandSignalToRemoteClients(signal) {
    if (filterSignalToClient(signal)) server.sendSignal(signal)
}

function addMessageToWindowConsole(message, color) {
    var window = frontend.getWindow();
    window.webContents.executeJavaScript("addMessageToWindowConsole('" + message + "','" + color + "');");
}

function filterSignalToServer(signal) {
    switch (signal) {
        case "CAR_RT_ACCEPT_BY_USER":
        case "CAR_RT_CANCEL_BY_USER":
        case "CAR_RT_ONLINE":
        case "CAR_RT_OFFLINE":
        case "CAR_RT_STOP":
        case "CAR_RT_REQUEST_BY_USER":
        case "APP_RT_REQUEST_BY_USER":
            return true;
        default:
            return false;
    }
}

function filterSignalToClient(signal) {
    switch (signal) {
        case "OPERATOR_ACCEPT_APP_RT_REQUEST":
        case "OPERATOR_ACCEPT_CAR_RT_REQUEST":
        case "OPERATOR_OFFER_RT_IN_VEHICLE":
            return true;
        default:
            return false;
    }
}

ipcMain.on('asynchronous-message', (event, arg) => {
    //console.log("Recieved command from renderer: " + arg);
    if (filterSignalToClient(arg)) {
        console.log("Command signal from admin: " + arg + " Sending to clients now!");
        server.sendSignal(arg);
        addMessageToWindowConsole("-OUT-> ["+ arg + "] to Client", "green");
    } else {
        if (filterSignalToServer(arg)) {
            addMessageToWindowConsole("(!) [" + arg + "] is a client->server signal and can not be send from the server!", "orange");
        } else {
            addMessageToWindowConsole("(!) [" + arg + "] is not a valid signal", "orange");
        }
    }
})