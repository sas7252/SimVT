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

global.appinfo = {
    title: 'NULL'
}

global.signals = {
    out: {
        reload: 'op2car_reload',
        rtOffer: 'op2car_rtOFFER',
        rtOnline: 'op2car_rtONLINE',
        rtRelease: 'op2car_rtRELEASE',
        tbOffer: 'op2car_rtRELEASE',
        rtOffline: 'op2car_rtOFFLINE'
    },
    in: {
        rtOfferAccept: 'car2op_rtOFFER-accept',
        rtOfferDecline: 'car2op_rtOFFER-decline',
        rtReleaseConfirmNo: 'car2op_rtRELEASE-confirm:no',
        rtReleaseConfirmYes: 'car2op_rtRELEASE-confirm:yes',
        rtReleaseReq: 'car2op_rtRELEASE-request',
        rtBooked: 'app2op_rtTripBooked'
    },
    app: {
        exit: 'appCM_exit',
        hide: 'appCM_hide',
        notifyCfgUpdated: 'appCM_updateCfg'
    }
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

function handleIncommingSignal(signal, sender) {
    if (filterSignalToServer(signal)) {
        addMessageToWindowConsole("<--IN- [" + signal + "] from client " + sender);
        switch (signal) {
            case signals.in.rtOfferAccept:
                vc.showElement(vc.banners.rtOfferAccepted);
                break;
            case signals.in.rtOfferDecline:
                vc.showElement(vc.banners.rtOfferDeclined, 5);
                break;
            case singals.in.rtReleaseConfirmNo:
                vc.showElement(vc.banners.rtReleaseReqDeclined, 5);
                break;
            case signals.in.rtReleaseConfirmYes:
                vc.showElement(vc.banners.rtReleaseReqAccepted);
                break;
            case signals.in.rtReleaseReq:
                vc.showElement(vc.banners.rtReleaseRequestByUser);
                break;
            case signals.in.rtBooked:
                if (global.simCfg.sNr == 3) {
                    vc.showElement(vc.banners.rtBooked)
                } else {
                    console.log("Recieved invalid signal [" + signals.in.rtBooked + "] (only available in S3)")
                }
                break;
        }
    } else if (signal == "CLIENT_CONNECTED") {
        addMessageToWindowConsole("<----> CONNECTED " + sender, "blue");
    } else if (signal == "CLIENT_DISCONNECTED") {
        addMessageToWindowConsole("<-X X-> DISCONNECTED " + sender, "red");
    }
}

function sendCmdSignalToClients(clientCommand) {
   // console.log('trying to filter clientCommand ' + clientCommand);
    if (filterSignalToClient(clientCommand)) {
        //console.log('clientCommand IS VALID');
        //console.log("Command signal from admin: " + clientCommand + " Sending to clients now!");
        server.sendSignal(clientCommand);
        addMessageToWindowConsole("-OUT-> [" + clientCommand + "] to Client", "green");
    } else {
        //console.log("clientCommand " + clientCommand + " IS !NOT VALID. Checking if it is servercommand instean");
        if (filterSignalToServer(clientCommand)) {
            //console.log("clientCommand " + clientCommand + " is actually a SERVER COMMAND");
            addMessageToWindowConsole("(!) [" + clientCommand + "] is a client->server signal and can not be send from the server!", "orange");
        } else {
            //console.log("clientCommand " + clientCommand + " is not a valid command at all");
            addMessageToWindowConsole("(!) [" + clientCommand + "] is not a valid signal", "orange");
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
            console.log('Is object[' + key + '] => ' + object[key] + ' === ' + value);
            if (object[key] === value) {
                console.log('YES!');
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
        rtOfferDeclined: '.ui_banner_rtoffer_declined',
        rtOfferAccepted: '.ui_banner_rtoffer_accepted',
        rtReleaseRequestByUser: '.ui_banner_rtrelease_reqByUser',
        rtReleaseReqDeclined: '.ui_banner_rtrelease_reqDeclined',
        rtReleaseReqAccepted: '.ui_banner_rtrelease_reqAccepted',
        rtReleaseAction: '.ui_banner_rtrelease_actNow',
        rtBooked: '.ui_banner_rtbooked'
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
        frontend.getWindow().webContents.executeJavaScript(rfCall);
    }
}