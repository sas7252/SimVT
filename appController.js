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
    filterSignalToClient,
    getSimCfg
}

global.appinfo = {
    title: 'NULL'
}

    //Used for state detection.
    //DO NOT ASSIGN THE SAME IMAGE TO TWO STATES (!)
    // (this would result in a resolution conflict)
global.rvtoStates = {
    offline: 'rvto-offline.png',
    offlineAccessDenied: 'rvto-offline-access-denied.png',
    offlineAccessGranted: 'rvto-offline-access-ok.png',
    offlineRequestPending: 'rvto-offline-request-pending.png',
    offline2online: 'rvto-offline2online.png',
    online: 'rvto-online.png',
    onlineRequestPending: 'rvto-online-request-pending.png',
    onlineReleaseDenied: 'rvto-online-release-denied.png',
    onlineReleaseGranted: 'rvto-online-release-granted.png',
    onlineReleaseRequestCustomer: 'rvto-online-release-request-customer.png',
    online2offline: 'rvto-online2offline.png',
}

global.callStates = {
    nocall: 'nocall',
    incomming: 'incomming',
    active: 'active',
    emready: 'emready'
}

global.signals = {
    out: {
        reload: 'op2car_reload',

        //New Outgoing signals
        launchAlert: 'op2car_alertDriver-warning',
        launchEmergency: 'op2car_alertDriver-emergency',
        callConnected: 'op2car_call-estab',
        rvtoRequest_start: 'op2car_rvto-preq-start',
        rvtoConfirm_start: 'op2car_rvto-ack-start',
        rvtoRequest_end: 'op2car_rvto-preq-end',
        rvtoConfirm_end: 'op2car_rvto-ack-end',

        /*
        //Old Outbound Signals (soon to be removed)
        rtOffer: 'op2car_rtOFFER',
        rtOnline: 'op2car_rtONLINE',
        rtRelease: 'op2car_rtRELEASE',
        tbOffer: 'op2car_rtRELEASE',
        rtOffline: 'op2car_rtOFFLINE'
        */
    },
    in: {

        //New incomming signals
        dismissWarning: 'car2op_cancel-warning',
        dismissEmergency: 'car2op_cancel-emergency',
        callIncomming: 'car2op_call-start',
        callEnded: 'car2op_call-end',
        stopRVTO_yes: 'car2op_rvto-stop-yes',
        stopRVTO_no: 'car2op_rvto-stop-no',
        rtvoAccepted: 'car2op_rvto-start-accept',
        rtvoDeclined: 'car2op_rvto-start-decline',

        /*
        //Old Inbound Signals (soon to be removed)
        rtOfferAccept: 'car2op_rtOFFER-accept',
        rtOfferDecline: 'car2op_rtOFFER-decline',
        rtReleaseConfirmNo: 'car2op_rtRELEASE-confirm:no',
        rtReleaseConfirmYes: 'car2op_rtRELEASE-confirm:yes',
        rtReleaseReq: 'car2op_rtRELEASE-request',
        rtBooked: 'app2op_rtTripBooked'
        */
    },
    app: {
        exit: 'appCM_exit',
        hide: 'appCM_hide',
        notifyCfgUpdated: 'appCM_updateCfg'
    }, 
}

global.emStates = {
    on: 'emOn',
    off: 'emOff'
}

global.requestOrigin = {
    releaseByCustomer : true 
}

global.simCfg = {
    sNr: 2,
    iavNr: 1,
    dNr: 1
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

function hideWindow() {
    if (ready) {
        window = frontend.getWindow();
        window.hide();
    }
}

function openBrowserWindowDeveloperTools() {
    if (ready) {
        window = frontend.getWindow();
        window.webContents.openDevTools({ mode: 'detach' });
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

function getSimCfg() {
    return global.simCfg;
}

function handleIncommingSignal(signal, sender) {
    if (filterSignalToServer(signal)) {
        addMessageToWindowConsole("<--IN- [" + signal + "] from client " + sender);
        switch (signal) {
            case signals.in.dismissWarning:
                vc.execute('showElement', vc.banners.driverCanceledAlert, 3);
                break;
            case signals.in.dismissEmergency:
                vc.execute('setEmergencyState', emStates.off);
                break;
            case signals.in.callIncomming:
                vc.execute('setCallState', 'incomming');
                break;
            case signals.in.callEnded:
                vc.execute('setCallState', 'nocall');
                vc.execute('showElement', vc.banners.callDisconnected, 3);
                break;
            case signals.in.stopRVTO_yes:
                vc.execute('setRVTOState', rvtoStates.onlineReleaseGranted);
                /*console.log("requestOrigin.releaseByCustomer = " + requestOrigin.releaseByCustomer);
                if (requestOrigin.releaseByCustomer) {
                    console.log("IS FROM CUSTOMER -> onlineReleaseRequestCustomer");
                    vc.execute('setRVTOState', rvtoStates.onlineReleaseAccepted);
                } else {
                    console.log("IS !NOT FROM CUSTOMER -> online2offline - This is just the answer from client");
                    vc.execute('setRVTOState', rvtoStates.onlineReleaseAccepted);
                    requestOrigin.releaseByCustomer = true;
                }*/
                break;
            case signals.in.stopRVTO_no:
                vc.execute('setRVTOState', rvtoStates.onlineReleaseDenied);
                break;
            case signals.in.rtvoAccepted:
                vc.execute('setRVTOState', rvtoStates.offlineAccessGranted);
                break;
            case signals.in.rtvoDeclined:
                vc.execute('setRVTOState', rvtoStates.offlineAccessDenied);
                break;

            /*
            //Old Signal Handling
            case signals.in.rtOfferAccept:
                vc.execute('showElement', vc.banners.rtOfferAccepted);
                break;
            case signals.in.rtOfferDecline:
                vc.execute('showElement', vc.banners.driverCanceledAlert, 5);
                break;
            case signals.in.rtReleaseConfirmNo:
                vc.execute('showElement', vc.banners.rtReleaseReqDeclined, 5);
                break;
            case signals.in.rtReleaseConfirmYes:
                vc.execute('showElement', vc.banners.rtReleaseReqAccepted);
                break;
            case signals.in.rtReleaseReq:
                vc.execute('showElement', vc.banners.rtReleaseRequestByUser);
                break;
            case signals.in.rtBooked:
                if (global.simCfg.sNr == 3) {
                    vc.execute('showElement', vc.banners.rtBooked)
                } else {
                    console.log("Recieved invalid signal [" + signals.in.rtBooked + "] (only available in S3)")
                }
                break;
            */
        }
    } else if (signal == "CLIENT_CONNECTED") {
        addMessageToWindowConsole("<----> CONNECTED " + sender, "#33FF3A");
    } else if (signal == "CLIENT_DISCONNECTED") {
        addMessageToWindowConsole("<-X X-> DISCONNECTED " + sender, "#FF4206");
    }
}

function sendCmdSignalToClients(clientCommand) {
    // console.log('trying to filter clientCommand ' + clientCommand);
    if (filterSignalToClient(clientCommand)) {
        //console.log('clientCommand IS VALID');
        //console.log("Command signal from admin: " + clientCommand + " Sending to clients now!");
        server.sendSignal(clientCommand);
        addMessageToWindowConsole("-OUT-> [" + clientCommand + "] to Client", "#09C4FF");
    } else {
        //console.log("clientCommand " + clientCommand + " IS !NOT VALID. Checking if it is servercommand instean");
        if (filterSignalToServer(clientCommand)) {
            //console.log("clientCommand " + clientCommand + " is actually a SERVER COMMAND");
            addMessageToWindowConsole("(!) [" + clientCommand + "] is a client->server signal and can not be send from the server!", "#FC9400");
        } else {
            //console.log("clientCommand " + clientCommand + " is not a valid command at all");
            addMessageToWindowConsole("(!) [" + clientCommand + "] is not a valid signal", "#FC9400");
        }
    }
}

function addMessageToWindowConsole(message, color) {
    vc.execute('addToConsole', message, color);
}

function valueExistsInObject(object, value) {
    var BreakException = {};
    try {
        Object.keys(object).forEach(function (key) {
            //console.log('Is object[' + key + '] => ' + object[key] + ' === ' + value);
            if (object[key] === value) {
                //console.log('YES!');
                throw BreakException;
            }
        });
    } catch (e) {
        if (e !== BreakException) throw e;
        return true;
    }
    return false;
}

function validSignal(direction, signal) {
    if (direction === 'in') return valueExistsInObject(global.signals.in, signal);
    if (direction === 'out') return valueExistsInObject(global.signals.out, signal);
    return false;
}

function filterSignalToServer(signal) {
    var bool = validSignal('in', signal);
    //console.log('SIGNAL IN' + signal + ' VALID? : ' + bool);
    return bool;
}

function filterSignalToClient(signal) {
    var bool = validSignal('out', signal);
    //console.log('SIGNAL OUT ' + signal + ' VALID? : ' + bool);
    return bool;
}

ipcMain.on('clientCommand', (event, clientCommand) => {
    console.log("Recieved clientCommand [" + clientCommand + "] from renderer process");
    sendCmdSignalToClients(clientCommand);
})

ipcMain.on('appCommand', (event, appCommand) => {
    console.log('Recieved appCommand [' + appCommand + '] from renderer process');
    switch (appCommand) {
        case signals.app.exit:
            quitApplication();
            break;
        case signals.app.hide:
            hideWindow();
            break;
        case signals.app.notifyCfgUpdated:
            sendCmdSignalToClients(signals.out.reload);
            break;
        default:
            throw "Invalid appCommand: " + appCommand;
    }
});

var vc = {

    //Add banners for reference
    banners: {
        driverCanceledAlert: 'ui_banner_driverCanceledAlert',
        callDisconnected: 'ui_banner_callDisconnected',
        rvtoStartYes: 'ui_banner_rvto-start-yes',
        rvtoStartNo: 'ui_banner_rvto-start-no',
        rvtoStopYes: 'ui_banner_rvto-stop-yes',
        rvtoStopNo: 'ui_banner_rvto-stop-no',
    },

    //Add execute function
    execute: function (method, arg1, arg2 = false) {
        //build the actual function call
        var rfCall; // Remote function call
        rfCall = "vc." + method + "('" + arg1 + "'";
        if (arg2) {
            rfCall += ","
            if (typeof arg2 == 'number') {
                rfCall += arg2;
            } else if (typeof arg2 == 'string') {
                rfCall += ("'" + arg2 + "'");
            } else {
                rfCall += "''";
            }
        }
        rfCall = rfCall + ");";

        //get window and execute statement
        if (!quitNow) frontend.getWindow().webContents.executeJavaScript(rfCall);
    }
}