const ipcRenderer = require('electron').ipcRenderer;
const remote = require('electron').remote;

__f = function () {
    throw "implementation missing";
}

//ViewController "Class"
var vc = viewController = {

    //Initializers
    init: __f,

    //Variables & Objects
    _appinfo: null,
    _signals: null,
    _rtvoStates: null,
    _callStates: null,
    _emStates: null,

    _outlets: {
        console: null,
        txtfCmd: null,
        dropdown_sNr: null,
        dropdown_iavNr: null,
        dropdown_dNr: null,
        btn_runCmd: null,
        rvtoStateImg: null,
        rvtoStateLabel: null,
        rvtoStateDescrLabel: null,
        banner: null,
        bannerImg: null,
        bannerText: null,
        btn_rvtoStartReq: null,
        btn_rvtoStopReq: null,
        btn_rvtoStart: null,
        btn_rvtoStop: null,
        rvtoButtons: null,

    },

    _actions: {
        exitApp: 'vca_quit',
        hideApp: 'vca_hide',
        publishConfiguration: 'vca_publishCfg',
        runCustomCommand: 'vca_runCmd',
        sendDriverAlert: 'vca_sendDriverAlert',
        sendDriverEmergency: 'vca_sendDriverEmergency',
        sendCallAccept: 'vca_sendCallAccept',
        sendRVTOStartRequest: 'vca_sendRvtoRqStart',
        sendRVTOStopRequest: 'vca_sendRvtoRqStop',
        sendRVTOStart: 'vca_sendRvtoStart',
        sendRVTOStop: 'vca_sendRvtoStop',
        startEmergencyCall: 'vca_startEmCall'
    }, 

    releaseRequestOriginIsTO: false,

    _rvtoBannerImages: {
        lock: 'rvto-bannerimg-lock.png',
        unlock: 'rvto-bannerimg-unlock.png',
        car: 'rvto-bannerimg-car.png',
        key: 'rvto-bannerimg-key.png',
        warning: 'rvto-bannerimg-warning.png',
        ok: 'rvto-bannerimg-ok.png',
        keyboard: 'rvto-bannerimg-keyboard.png'
    },

    _rvtoBannerColors: {
        red: 'alert-danger',
        green: 'alert-success',
        yellow: 'alert-warning'
    },



    //Methods
    triggerAction: __f,
    setRVTOState: __f,
    setRVTOStateAfter: __f,
    setRVTOStateChangeTimeout: __f,
    setDriverAlertPanelVisibe: __f,
    setEmergencyState: __f,
    setCallState: __f,
    executeAppCommand: __f,
    sendClientCommand: __f,
    readCurrentSimCfg: __f,
    writeCurrentSimCfg: __f,
    showElement: __f,
    hideElement: __f,
    addToConsole: __f,

    rvtoStateChanged: false,

}

vc.init = function () {

    vc._appinfo = remote.getGlobal('appInfo');
    vc._signals = remote.getGlobal('signals');
    vc._rvtoStates = remote.getGlobal('rvtoStates');
    vc._callStates = remote.getGlobal('callStates');
    vc._emStates = remote.getGlobal('emStates');

    //Wire up UI Outlets
    vc._outlets.console = $('#ui_consoleView');
    vc._outlets.txtfCmd = $('#ui_textfield_commandInput');
    vc._outlets.dropdown_sNr = $('#ui_dropdown_sNr');
    vc._outlets.dropdown_iavNr = $('#ui_dropdown_iavNr');
    vc._outlets.dropdown_dNr = $('#ui_dropdown_dNr');
    vc._outlets.btn_runCmd = $('#ui_btn_runCmd');

    vc._outlets.banner = $('#ui_rtvoStateBanner');
    vc._outlets.bannerImg = $('#ui_rtvoBanner_img');
    vc._outlets.bannerText = $('#ui_rtvoStateBanner_txt');

    vc._outlets.btn_rvtoStartReq = $('#ui_btn_rtvo-start-reqperm');
    vc._outlets.btn_rvtoStopReq = $('#ui_btn_rtvo-stop-reqperm');
    vc._outlets.btn_rvtoStart = $('#ui_btn_rtvo-start');
    vc._outlets.btn_rvtoStop = $('#ui_btn_rtvo-stop');

    vc._outlets.rvtoButtons = $('.ui_rvto-button');

    //Wire up the buttons
    $('#ui_btn_exitApp').click(function () { vc.triggerAction(vc._actions.exitApp) });
    $('#ui_btn_hideApp').click(function () { vc.triggerAction(vc._actions.hideApp) });
    $('#ui_btn_alertDriverDanger').click(function () { vc.triggerAction(vc._actions.sendDriverAlert) });
    $('#ui_btn_alertDriverEmergency').click(function () { vc.triggerAction(vc._actions.sendDriverEmergency) });
    $('#ui_btn_callAccept').click(function () { vc.triggerAction(vc._actions.sendCallAccept) });
    //Emergency call maps to same action as sendCall
    $('#ui_btn_startEmCall').click(function () { vc.triggerAction(vc._actions.startEmergencyCall ) });
    //$('#ui_btn_callDecline').click(function() { vc.triggerAction(vc._actions.sendRtOffline) });
    //$('#ui_btn_callExit').click(function() { vc.triggerAction(vc._actions.sendRTOnline) });
    vc._outlets.btn_rvtoStartReq.click(function () { vc.triggerAction(vc._actions.sendRVTOStartRequest) });
    vc._outlets.btn_rvtoStart.click(function () { vc.triggerAction(vc._actions.sendRVTOStart) });
    vc._outlets.btn_rvtoStopReq.click(function () { vc.triggerAction(vc._actions.sendRVTOStopRequest) });
    vc._outlets.btn_rvtoStop.click(function () { vc.triggerAction(vc._actions.sendRVTOStop) });
    $('#ui_btn_resetCfg').click(function () { vc.triggerAction(vc._actions.publishConfiguration) });
    $('#ui_btn_applyCfg').click(function () { vc.triggerAction(vc._actions.publishConfiguration) });
    vc._outlets.btn_runCmd.click(function () { vc.triggerAction(vc._actions.runCustomCommand) });

    //Add eevent for: enter key on textfield -> send now
    vc._outlets.txtfCmd.keyup(function (event) {
        // Number 13 is the "Enter" key on the keyboard
        if (event.keyCode === 13) {
            event.preventDefault(); // Cancel the default action, if needed
            vc._outlets.btn_runCmd.click(); // Trigger the button element with a click
        }
    });

    vc.readCurrentSimCfg();

    $('.ui_banner').hide();

    vc.setCallState(vc._callStates.nocall);
    vc.setRVTOState(vc._rvtoStates.offline);

}


vc.setDriverAlertPanelVisibe = function (bool) {
    var DAP = $('#ui_driveralertpanel');
    bool ? DAP.show() : DAP.hide();
}

//empty argument is used for easy call by vc.execute from appController, which does 
vc.setEmergencyState = function(emState) {
    switch (emState) {
        case vc._emStates.on:
            vc.setCallState(vc._callStates.emready);
            break;
        case vc._emStates.off:
            vc.setCallState(vc._callStates.nocall);
            vc.setRVTOState(vc._rvtoStates.offline);
            vc.showElement('ui_banner_emergencyEnd', 3);
            break;
        default:
            //do nothing, invalid state
    }

}

$().ready(vc.init);

/*
    Callmanager States:
        nocall
        incomming
        active
        emready
*/

vc.setCallState = function(callStateId) {
    console.log("Setting callState: " + callStateId);
    $('.ui_callmanager').hide();
    switch (callStateId) {
        case vc._callStates.nocall:
            $('#ui_callmanager_view-nocall').show();
            vc.setDriverAlertPanelVisibe(true);
            break;
        case vc._callStates.incomming:
            $('#ui_callmanager_view-incommingcall').show();
            vc.setDriverAlertPanelVisibe(false);
            break;
        case vc._callStates.active:
            $('#ui_callmanager_view-activecall').show();
            vc.setDriverAlertPanelVisibe(false);
            break;
        case vc._callStates.emready: 
            $('#ui_callmanager_view-startemergencycall').show();
            vc.setDriverAlertPanelVisibe(false);
            break;
        default:
            vc.setDriverAlertPanelVisibe(true);
    }
}


/*
    CAUTION: Only use this method if you DEFINITIFLY want to change the state
             after the specified amount of time. It will overwrite the state
             on timeout (after the waiting period) even if other state changes
            happened in between.

            Use setRVTOStateChangeTimeout() to only change states after the
            waiting period, if not other state changes occured.
            
*/
vc.setRVTOStateAfter = function(rvtoStateId, tInSeconds) {
    if (tInSeconds) {
        setTimeout(function () {
            vc.setRVTOState(rvtoStateId, true);
        }, tInSeconds * 1000);
    }
}

vc.setRVTOStateChangeTimeout = function(rvtoStateId, tInSeconds) {
    if (tInSeconds) {
        vc.rvtoStateChanged = false;
        setTimeout(function () {
            //If no other stateChange occured, then change into the specified state
            if (!vc.rvtoStateChanged) vc.setRVTOState(rvtoStateId);
        }, tInSeconds * 1000);
    }  
}

vc.setRVTOState = function(rvtoStateId) {
    
    vc.rvtoStateChanged = true;

    var stateText = "ERR";
    var stateDescr = "ERR";
    var bannerImg = "";
    var bannerText = "";
    var bannerColor = this._rvtoBannerColors.yellow;

    //Hide all buttons, manually enable them afterwards
    this._outlets.rvtoButtons.hide();

    switch(rvtoStateId) {
        case vc._rvtoStates.offline:
            stateText = "OFFLINE / LOCAL";
            stateDescr = "Driver is operating their car";
            vc._outlets.btn_rvtoStartReq.show(); //Show Request-TakeOver-Button
            break;
        case vc._rvtoStates.offlineAccessDenied:
            stateText = "OFFLINE / LOCAL";
            stateDescr = "Driver is operating their car";
            bannerImg = vc._rvtoBannerImages.lock
            bannerText = "Permissin (to take over) <b>DENIED</b>";
            bannerColor = vc._rvtoBannerColors.red;
            vc.setRVTOStateChangeTimeout(vc._rvtoStates.offline, 5);
            break;
        case vc._rvtoStates.offlineAccessGranted:
            stateText = "OFFLINE / LOCAL <br><h4 class='text-success'>READY FOR TAKE OVER</4>";
            stateDescr = "<b class='text-warning'>Driver is ready for take over.<b><br>Make sure the car is <b>PARKET/STOPPED</b><br> in a safe location before taking over control";
            bannerImg = vc._rvtoBannerImages.unlock
            bannerText = "<b>Permission GRANTED</b>";
            bannerColor = vc._rvtoBannerColors.green;
            vc._outlets.btn_rvtoStart.show(); //Show Release-Button
            break;
        case this._rvtoStates.offlineRequestPending:
            stateText = "OFFLINE / LOCAL";
            stateDescr = "Driver is operating their car";
            bannerText = "Sent Request (for permission to take over)";
            break;
        case vc._rvtoStates.offline2online:
            stateText = "TRANISTIONING<br><h6 class='text-warning'>ONLINE / TELEOPERATION</h6>";
            stateDescr = "You will now take over!<br> <h2><img src='../images/rvto-miniicons/rvto-bannerimg-keyboard.png' width='20'> Press F4</h2><br> to switch Simulator to Keyboard Mode";
            vc.setRVTOStateChangeTimeout(vc._rvtoStates.online, 5);
            break;
        case vc._rvtoStates.online:
            stateText = "<span class='text-success'>ONLINE / TELEOPERATION</span>";
            stateDescr = "YOU operate the car. You may use the button below to request control release AFTER stopping/paring the car in a safe location";
            vc._outlets.btn_rvtoStopReq.show(); //Show Request-Release-Button
            break;
        case vc._rvtoStates.onlineRequestPending:
            stateText = "<span class='text-success'>ONLINE / TELEOPERATION</span>";
            stateDescr = "YOU operate the car";
            bannerImg = vc._rvtoBannerImages.key, 
            bannerText = "Request (for release) sent";
            break;
        case vc._rvtoStates.onlineReleaseDenied:
            stateText = "<span class='text-success'>ONLINE / TELEOPERATION</span>";
            stateDescr = "YOU operate the car";
            bannerImg = vc._rvtoBannerImages.lock;
            bannerText =  "Driver CAN NOT take back controll right now. YOU CONTINIUE DRIVING";
            bannerColor = vc._rvtoBannerColors.red;
            vc.setRVTOStateChangeTimeout(vc._rvtoStates.online, 5);
            break;
        case vc._rvtoStates.onlineReleaseGranted:
            stateText = "<span class='text-success'>ONLINE / TELEOPERATION</span><br> <h6 class='text-warning'>READY TO RELEASE RVTO</h6>";
            stateDescr = "<b>YOU</b> (still) operate the car<br> Please STOP/PARK the car in a safe location.<br> Then press the RELEASE Button";
            bannerImg = vc._rvtoBannerImages.green;
            bannerText = "Driver is ready to Take over";
            vc.setRVTOStateChangeTimeout(vc._rvtoStates.online, 20);
            vc._outlets.btn_rvtoStop.show(); //Show Release-Button
            break;
        case vc._rvtoStates.online2offline:
            stateText = "TRANSITIONING<br><h6 class='text-warning'>OFFLINE /LOCAL</h6>";
            stateDescr = "Driver will now take over!<br> <h2><img src='../images/rvto-miniicons/rvto-bannerimg-keyboard.png' width='20'> Press F2</h2><br> to switch Simulator to Steering Wheel Mode";
            vc.setRVTOStateChangeTimeout(vc._rvtoStates.offline, 5);
            break;
            default:
                //do nothing
    }

    //Update state image, text & description
    $('#ui_rvtoStatusImg').attr("src", '../images/rvto-icons/' + rvtoStateId);
    $('#ui_rtvoStatusLabel').html(stateText);
    $('#ui_rtvoStatusDescrLabel').html(stateDescr);

    //Update banner
    if (bannerText != "") {
        
        //Update image
        if (bannerImg != "") {
            vc._outlets.bannerImg.attr("src", '../images/rvto-miniicons/' + bannerImg);
            vc._outlets.bannerImg.show();
        } else {
            vc._outlets.bannerImg.hide();
        }
        $('#ui_rtvoBanner_txt').html(bannerText);
        
        //Update colors
        vc._outlets.banner.removeClass(vc._rvtoBannerColors.yellow);
        vc._outlets.banner.removeClass(vc._rvtoBannerColors.green);
        vc._outlets.banner.removeClass(vc._rvtoBannerColors.red);
        vc._outlets.banner.addClass(bannerColor);

        //actually show banner
        vc._outlets.banner.show();
    } else {
        //actually hide banner
        vc._outlets.banner.hide();
    }
}

vc.setCallmanager = function (state) {
    console.warn("function setCallmanager() replaced by setCallState()");
}

vc.setRVTOControlls = function (state) {
    console.warn("function setRVTOControlls() replaced by setRVTOState()");
}

vc.executeAppCommand = function (appCommand) {
    console.log('Calling main process to (executeAppCommand: [' + appCommand + '])');
    ipcRenderer.send('appCommand', appCommand);
}

vc.sendClientCommand = function (clientCommand) {
    console.log('Calling main process to (sendClientCommand: [' + clientCommand + '])');
    ipcRenderer.send('clientCommand', clientCommand);
}

vc.triggerAction = function (actionId) {
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
            this.setEmergencyState(this._emStates.on);
            this.sendClientCommand(this._signals.out.launchEmergency);
            break;
        case this._actions.startEmergencyCall: 
            this.setCallState(this._callStates.active);
            this.setRVTOState(this._rvtoStates.online);
            this.sendClientCommand(this._signals.out.rvtoConfirm_start);
            break;
        case this._actions.sendCallAccept:
            //this.showElement('ui_banner_online_actNow');
            //this.setCallmanager('active');
            this.setCallState(this._callStates.active);
            this.setRVTOState(this._rvtoStates.offline);
            this.sendClientCommand(this._signals.out.callConnected);
            break;
        case this._actions.sendRVTOStartRequest:
            this.setRVTOState(this._rvtoStates.offlineRequestPending);
            this.sendClientCommand(this._signals.out.rvtoRequest_start);
            break;
        case this._actions.sendRVTOStopRequest:
            remote.getGlobal('requestOrigin').releaseByCustomer = false;
            console.log("SHOULD SET releaseByCustomer to FALSE")
            this.setRVTOState(this._rvtoStates.onlineRequestPending);
            this.sendClientCommand(this._signals.out.rvtoRequest_end);
            break;
        case this._actions.sendRVTOStart:
            this.setRVTOState(this._rvtoStates.offline2online);
            this.sendClientCommand(this._signals.out.rvtoConfirm_start);
            break;
        case this._actions.sendRVTOStop:
            this.sendClientCommand(this._signals.out.rvtoConfirm_end);
            this.setRVTOState(this._rvtoStates.online2offline);
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

vc.readCurrentSimCfg = function () {
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

vc.writeCurrentSimCfg = function () {
    remote.getGlobal('simCfg').sNr = this._outlets.dropdown_sNr.val();
    remote.getGlobal('simCfg').iavNr = this._outlets.dropdown_iavNr.val();
    remote.getGlobal('simCfg').dNr = this._outlets.dropdown_dNr.val();
}

//Shows an element (tag) with the specified id (for a limited time))
vc.showElement = function (elementId, tInSeconds = false) {
    $('#' + elementId).show();
    if (tInSeconds) {
        setTimeout(function () {
            $('#' + elementId).hide();
        }, tInSeconds * 1000);
    }
}

vc.hideElement = function (elementId) {
    $('#' + elementId).hide();
}

vc.addToConsole = function (message, color) {
    //var currentDate = '[' + new Date().toLocaleString() + '] ';
    var date = new Date();
    var pre = document.createElement("p");
    pre.innerHTML = date.getHours() + ":" + date.getMinutes() + " " + message;
    pre.style.color = color;
    this._outlets.console.append(pre);
}