const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

__f = function() {
    throw "implementation missing";
}



//ViewController "Class"
var vc = viewController = {

    //Initializers
    init: __f,

    //Variables & Objects
    _appinfo: null,
    _signals: null,

    _outlets: {
        console: null,
        txtfCmd: null,
        dropdown_sNr: null,
        dropdown_iavNr: null,
        dropdown_dNr: null,
        btn_runCmd: null
    },

    _actions: {
        exitApp: 'vca_quit',
        hideApp: 'vca_hide',
        publishConfiguration: 'vca_publishCfg',
        runCustomCommand: 'vca_runCmd',

        //New Actions
        sendDriverAlert: 'vca_sendDriverAlert',
        sendDriverEmergency: 'vca_sendDriverEmergency',
        sendCallAccept: 'vca_sendCallAccept',
        sendRVTOStartRequest: 'vca_sendRvtoRqStart',
        sendRVTOStopRequest: 'vca_sendRvtoRqStop',
        sendRVTOStart: 'vca_sendRvtoStart',
        sendRVTOStop: 'vca_sendRvtoStop',

        /*
        //Old Actions
        sendRtOffer: 'vca_sendRtOffer',
        sendTbOffer: 'vca_sendTbOffer',
        sendRTOnline: 'vca_sendRtOnline',
        sendRtOffline: 'vca_sendRtOffline'
        */

    },

    //Methods
    triggerAction: __f,
    executeAppCommand: __f,
    sendClientCommand: __f,
    readCurrentSimCfg: __f,
    writeCurrentSimCfg: __f,
    showElement: __f,
    hideElement: __f,
    addToConsole: __f,

}

vc.init = function() {

    vc._appinfo = remote.getGlobal('appInfo');
    vc._signals = remote.getGlobal('signals');

    //Wire up UI Outlets
    vc._outlets.console = $('#ui_consoleView');
    vc._outlets.txtfCmd = $('#ui_textfield_commandInput');
    vc._outlets.dropdown_sNr = $('#ui_dropdown_sNr');
    vc._outlets.dropdown_iavNr = $('#ui_dropdown_iavNr');
    vc._outlets.dropdown_dNr = $('#ui_dropdown_dNr');
    vc._outlets.btn_runCmd = $('#ui_btn_runCmd');

    //Wire up the buttons
    $('#ui_btn_exitApp').click(function() { vc.triggerAction(vc._actions.exitApp) });
    $('#ui_btn_hideApp').click(function() { vc.triggerAction(vc._actions.hideApp) });
    $('#ui_btn_sendRtOffer').click(function() { vc.triggerAction(vc._actions.sendRtOffer) });
    $('#ui_btn_sendTbOffer').click(function() { vc.triggerAction(vc._actions.sendTbOffer) });
    $('#ui_btn_sendRtOnline').click(function() { vc.triggerAction(vc._actions.sendRTOnline) });
    $('#ui_btn_sendRtOffline').click(function() { vc.triggerAction(vc._actions.sendRtOffline) });
    $('#ui_btn_resetCfg').click(function() { vc.triggerAction(vc._actions.publishConfiguration) });
    $('#ui_btn_applyCfg').click(function() { vc.triggerAction(vc._actions.publishConfiguration) });
    vc._outlets.btn_runCmd.click(function() { vc.triggerAction(vc._actions.runCustomCommand) });

    //Add eevent for: enter key on textfield -> send now
    vc._outlets.txtfCmd.keyup(function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            event.preventDefault(); // Cancel the default action, if needed
            vc._outlets.btn_runCmd.click(); // Trigger the button element with a click
        }
    });

    vc.readCurrentSimCfg();

    $('.ui_banner').hide();
}

$().ready(vc.init);

vc.executeAppCommand = function(appCommand) {
    console.log('Calling main process to (executeAppCommand: [' + appCommand + '])');
    ipcRenderer.send('appCommand', appCommand);
}

vc.sendClientCommand = function(clientCommand) {
    console.log('Calling main process to (sendClientCommand: [' + clientCommand + '])');
    ipcRenderer.send('clientCommand', clientCommand);
}

vc.triggerAction = function(actionId) {
    switch (actionId) {
        case this._actions.exitApp:
            this.executeAppCommand(this._signals.app.exit);
            break;
        case this._actions.hideApp:
            this.executeAppCommand(this._signals.app.hide);
            break;
        case this._actions.publishConfiguration:
            this.writeCurrentSimCfg();
            this.readCurrentSimCfg();
            this.executeAppCommand(this._signals.app.notifyCfgUpdated);
            break;

            //New actions handlerss
        case this._actions.sendDriverAlert:
            //this.showElement('ui_banner_online_actNow',6);
            this.sendClientCommand(this._signals.out.launchAlert);
            break;
        case this._actions.sendDriverEmergency:
            //this.showElement('ui_banner_online_actNow',6);
            this.sendClientCommand(this._signals.out.launchEmergency);
            break;
        case this._actions.sendCallAccept:
            //this.showElement('ui_banner_online_actNow');
            this.sendClientCommand(this._signals.out.callConnected);
            break;
        case this._actions.sendRVTOStartRequest:
            this.sendClientCommand(this._signals.out.rvtoRequest_start);
            break;
        case this._actions.sendRVTOStopRequest:
            this.sendClientCommand(this._signals.out.rvtoRequest_end);
            break;
        case this._actions.sendRVTOStart:
            this.sendClientCommand(this._signals.out.rvtoConfirm_start);
            break;
        case this._actions.sendRVTOStop:
            this.sendClientCommand(this._signals.out.rvtoConfirm_end);
            break;

            /*    
            //Old (soon to be removed) action handlers
            case this._actions.sendRtOffer:
                this.hideElement('ui_banner_rtbooked');
                this.sendClientCommand(this._signals.out.rtOffer);
                break;
            case this._actions.sendTbOffer:
                this.sendClientCommand(this._signals.out.tbOffer);
                break;
            case this._actions.sendRTOnline:
                this.hideElement('ui_banner_rtoffer_accepted');
                this.showElement('ui_banner_online_actNow',6);
                this.sendClientCommand(this._signals.out.rtOnline);
                break;
            case this._actions.sendRtOffline:
                this.hideElement('ui_banner_rtrelease_reqByUser');
                this.hideElement('ui_banner_rtrelease_reqAccepted');
                this.showElement('ui_banner_rtrelease_actNow',6);
                this.sendClientCommand(this._signals.out.rtOffline);
                break;
            */
        case this._actions.runCustomCommand:
            //SUGGESTION: Should maybe add something like disable the button until this action is complete?
            var customCommand = vc._outlets.txtfCmd.val();
            vc._outlets.txtfCmd.val('');
            this.sendClientCommand(customCommand);
            break;
        default:
            console.error('Unkown actionId: ' + actionId);
    }
}

vc.readCurrentSimCfg = function() {
    var simCfg = remote.getGlobal('simCfg');

    //console.log(simCfg.sNr);

    vc._outlets.dropdown_sNr.val(simCfg.sNr);
    vc._outlets.dropdown_iavNr.val(simCfg.iavNr);
    vc._outlets.dropdown_dNr.val(simCfg.dNr);

    //Adapt view
    var sNr = remote.getGlobal('simCfg').sNr;
    //var iavNr = remote.getClobal()
    $('.ui_onlyS2').hide();
    $('.ui_onlyS3').hide();
    $('.ui_onlyS' + sNr).show();
}

vc.writeCurrentSimCfg = function() {
    remote.getGlobal('simCfg').sNr = this._outlets.dropdown_sNr.val();
    remote.getGlobal('simCfg').iavNr = this._outlets.dropdown_iavNr.val();
    remote.getGlobal('simCfg').dNr = this._outlets.dropdown_dNr.val();
}

//Shows an element (tag) with the specified id (for a limited time))
vc.showElement = function(elementId, tInSeconds = false) {
    $('#' + elementId).show();
    if (tInSeconds) {
        setTimeout(function() {
            $('#' + elementId).hide();
        }, tInSeconds * 1000);
    }
}

vc.hideElement = function(elementId) {
    $('#' + elementId).hide();
}

vc.addToConsole = function(message, color) {
    var currentDate = '[' + new Date().toLocaleString() + '] ';
    var pre = document.createElement("p");
    pre.innerHTML = currentDate + message;
    pre.style.color = color;
    this._outlets.console.append(pre);
}