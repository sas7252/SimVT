const textviewConsole = document.getElementById('uiTextView_console');

const { ipcRenderer } = require('electron');
const { remote } = require('electron').remote;

__f = function() {
    throw "implementation missing";
}

//ViewController "Class"
vc = viewController = {

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
        sendRtOffer: 'vca_sendRtOffer',
        sendTbOffer: 'vca_sendTbOffer',
        sendRTOnline: 'vca_sendRtOnline',
        sendRtOffline: 'vca_sendRtOffline',
        publishConfiguration: 'vca_publishCfg',
        runCustomCommand: 'vca_runCmd'
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

    this._appinfo = remote.getGlobal('appInfo');
    this._signals = remote.getGlobal('signals');



    //Wire up UI Outlets
    this._outlets.console = $('#ui_consoleView');
    this._outlets.txtfCmd = $('#ui_textfield_commandInput');
    this._outlets.dropdown_sNr = $('#ui_dropdown_sNr');
    this._outlets.dropdown_iavNr = $('#ui_dropdown_sNr');
    this._outlets.dropdown_dNr = $('#ui_dropdown_sNr');
    this._outlets.btn_runCmd = $('.ui_btn_runCmd');

    //Wire up the buttons
    $('.ui_btn_exitApp').click(vc.triggerAction(vc._actions.exitApp));
    $('.ui_btn_hideApp').click(vc.triggerAction(vc._actions.hideApp));
    $('.ui_btn_sendRtOffer').click(vc.triggerAction(vc._actions.sendRtOffer));
    $('.ui_btn_sendTbOffer').click(vc.triggerAction(vc._actions.sendTbOffer));
    $('.ui_btn_sendRtOnline').click(vc.triggerAction(vc._actions.sendRTOnline));
    $('.ui_btn_sendRtOffline').click(vc.triggerAction(vc._actions.sendRtOffline));
    $('.ui_btn_resetCfg').click(vc.triggerAction(vc._actions.publishConfiguration));
    $('.ui_btn_applyCfg').click(vc.triggerAction(vc._actions.publishConfiguration));
    this._outlets.btn_runCmd.click(vc.triggerAction(vc._actions.runCustomCommand));

    //Add eevent for: enter key on textfield -> send now
    this._outlets.txtfCmd.keyup(function(event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            event.preventDefault(); // Cancel the default action, if needed
            vc._outlets.btn_runCmd.click(); // Trigger the button element with a click
        }
    });

    this.readCurrentSimCfg();
}

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
            this.executeAppCommand(this._signals.app.notifyCfgUpdated);
            break;
        case this._actions.sendRtOffer:
            this.sendClientCommand(this._signals.out.rtOffer);
            break;
        case this._actions.sendTbOffer:
            this.sendClientCommand(this._signals.out.tbOffer);
            break;
        case this._actions.sendRTOnline:
            this.sendClientCommand(this._signals.out.rtOnline);
            break;
        case this._actions.sendRtOffline:
            this.sendClientCommand(this._signals.out.rtOffline);
            break;
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

    this._outlets.dropdown_sNr.val(simCfg.sNr);
    this._outlets.dropdown_iavNr.val(simCfg.iavNr);
    this._outlets.dropdown_dNr.val(simCfg.dNr);

    //Adapt view
    var sNr = remote.getGlobal('simCfg').sNr;
    var iavNr = remote.getClobal()
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
    $(elementId).show();
    if (tInSeconds) {
        setTimeout(function() {
            $(elementId).hide();
        }, tInSeconds * 1000);
    }
}

vc.hideElement = function(elementId) {
    $(elementId).hide();
}

vc.addToConsole = function(message, color) {
    var currentDate = '[' + new Date().toLocaleString() + '] ';
    var pre = document.createElement("p");
    pre.innerHTML = currentDate + message;
    pre.style.color = color;
    this._outlets.console.append(pre);
}