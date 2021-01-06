app._panels = {
    start: 'pid_carui_start',
    home: 'pid_carui_home',
    loader: 'pid_carui_loader',
    driverWarning: 'pid_carui_driverWarning',
    driverEmergency: 'pid_carui_driverEmergency',
    callConnecting: 'pid_carui_callConnecting',
    callConnected: 'pid_carui_callConnected',
    rvtoConfirmStart: 'pid_carui_rvto-confirm-start',
    rvtoActive: 'pid_carui_rvto-active',
    rvtoConfirmEnd: 'pid_carui_rvto-confirm-end',
    rvtoCountdownStart: 'pid_carui_rvto-countdown-start',
    rvtoCountdownEnd: 'pid_carui_rvto-countdown-end',
    rvtoDone: 'pid_carui_rvto-done'
}

app._signal = {
    inb: {
        reload: 'op2car_reload',
        launchAlert: 'op2car_alertDriver-warning',
        launchEmergency: 'op2car_alertDriver-emergency',
        callConnected: 'op2car_call-estab',
        rvtoRequest_start: 'op2car_rvto-preq-start',
        rvtoConfirm_start: 'op2car_rvto-ack-start',
        rvtoRequest_end: 'op2car_rvto-preq-end',
        rvtoConfirm_end: 'op2car_rvto-ack-end',
    },
    out: {
        dismissWarning: 'car2op_cancel-warning',
        dismissEmergency: 'car2op_cancel-emergency',
        startCall: 'car2op_call-start',
        stopCall: 'car2op_call-end',
        stopRVTO_yes: 'car2op_rvto-stop-yes',
        stopRVTO_no: 'car2op_rvto-stop-no',
        acceptRVTO: 'car2op_rvto-start-accept',
        declineRVTO: 'car2op_rvto-start-decline'
    }
}

app._sounds = {
    alert: null, //alert sound used for attention grabbing
    count: null //warning sound used for countdown
}

app.emergencyState = false;

app.rvtoStopOriginIsLocal = false;

app.releaseRequestOriginIsLocal = false;

app.beforeShowingPanel = function(nextPanelId) {
    switch (nextPanelId) {
        case app._panels.home:
            //app.startLiveClock();
            break;
        case app._panels.start:
            //
            break;
        case app._panels.loader:
            break;
        case app._panels.driverWarning: 
            app._sounds.alert.play();
            break;
        case app._panels.driverEmergency:
            app._sounds.alert.play();
            //TODO: Start countound for autodconnect here
            break;
        case app._panels.callConnecting: break;
            //app._sounds.phoneDialing.play();
        case app._panels.callConnected: break;
            //app._sounds.phoneConnected.play();
        case app._panels.rvtoConfirmStart: break;
        case app._panels.rvtoActive: break;
        case app._panels.rvtoConfirmEnd: break;
        case app._panels.rvtoCountdownStart: 
            app.startTimer(5);
            app.showPanelAfterTimeout(5, app._panels.rvtoActive);
            break;
        case app._panels.rvtoCountdownEnd: 
            app.startTimer(5);
            app.showPanelAfterTimeout(5, app._panels.rvtoDone);
            break;
        case app._panels.rvtoDone: 
            app.showPanelAfterTimeout(2, app._panels.callConnected);
            break;
        default:
    }
}

app.beforeLeavingPanel = function(leavingPanelId) {
    //if (leavingPanelId == app._panels.home) app.stopLiveClock();
}

app.initClientModule = function() {
    //Set home panel (important as this will be shown after all inits are done!)
    app.setHomePanel(app._panels.home);
    
    //Apply UI changes for correct sNR (scenario) and iavNr (interaction variant)
    //TODO: CHANGE THESE TO REFLECT SETTINGS IN CLIENTCONFIG
    /*$('.v_onlyS2').hide();
    $('.v_onlyS3').hide();
    $('.v_onlyIAV1').hide();
    $('.v_onlyIAV2').hide();
    $('.v_onlyS' + app.sNr).show();
    $('.v_onlyIAV' + app.iavNr).show();*/
    //Get sound objects
    app._sounds.alert = document.getElementById('sound_alert');
    app._sounds.count = document.getElementById('sound_count');
    app._sounds.alert.load();
    app._sounds.count.load();
    //Connect to the signalServer
    var wsUrl = "ws://" + location.hostname + ":8081";
    ws.connect(wsUrl, app.handleServerSignal);
    //Report init done
    console.info("Client module initialized");
}

app.answerDriverAlert = function(bool_wantsAssistance) {
    if (bool_wantsAssistance) {
        app.startCall();
    } else {
        app.sendSignal(app._signal.out.dismissWarning);
        app.showHomePanel();
    }
}

app.dismissEmergency = function() {
    app.emergencyState = false;
    app.sendSignal(app._signal.out.dismissEmergency);
    app.showHomePanel();
}



app.startCall = function() {
    app.sendSignal(app._signal.out.startCall);
    app.showPanel(app._panels.callConnecting);
}

app.cancelCall = function() {
    app.sendSignal(app._signal.out.stopCall);
    app.showHomePanel();
}

app.grantRTVO = function(bool) {
    if (bool) {
        app.sendSignal(app._signal.out.acceptRVTO);
        app.showPanel(app._panels.loader)
    } else {
        app.sendSignal(app._signal.out.declineRVTO);
        app.showPanel(app._panels.callConnected);
    }
}

app.stopRVTOLocally = function() {
    app.rvtoStopOriginIsLocal = true;
    app.showPanel('pid_carui_rvto-confirm-end')
}

app.confirmStopRTVO = function(bool) {
    if (bool) {
        app.sendSignal(app._signal.out.stopRVTO_yes);
        app.showPanel(app._panels.loader)
    } else {
        if (!app.rvtoStopOriginIsLocal) app.sendSignal(app._signal.out.stopRVTO_no);
        app.showPanel(app._panels.rvtoActive);
    }
}

app.handleServerSignal = function(signal) {
    switch (signal) {
        case app._signal.inb.reload:
            app.reload();
            break;
        case app._signal.inb.launchAlert:
            app.showPanel(app._panels.driverWarning);
            break;
        case app._signal.inb.launchEmergency:
            app.emergencyState = true;
            app.showPanel(app._panels.driverEmergency);
            break;
        case app._signal.inb.callConnected:
            app.showPanel(app._panels.callConnected);
            break;
        case app._signal.inb.rvtoRequest_start:
            app.showPanel(app._panels.rvtoConfirmStart);
            break;
        case app._signal.inb.rvtoRequest_end:
            app.rvtoStopOriginIsLocal = false;
            app.showPanel(app._panels.rvtoConfirmEnd);
            break;
        case app._signal.inb.rvtoConfirm_start:
            if (app.emergencyState) {
                app.showPanel(app._panels.rvtoActive);
                app.emergencyState = false;
            } else {
                app.showPanel(app._panels.rvtoCountdownStart);
            }
            
            break;
        case app._signal.inb.rvtoConfirm_end:
            app.showPanel(app._panels.rvtoCountdownEnd);
            break;
        default:
            console.warn('revieved invalid signal: ' + signal);
    }
}

app.startTimer = function(tInSeconds, enableSound = true) {
    var tInSecondsLeft = tInSeconds;
    $(".appTimer").html(tInSecondsLeft);
    if (tInSeconds == 5 && enableSound) {
        app._sounds.count.currentTime = 6;
        app._sounds.count.play();
    } else console.log('Timer !=5 sec. Will not play countdown sound');
    var countdown = setInterval(function() {
        if (tInSecondsLeft <= 0) {
            clearInterval(countdown);
        }
        $(".appTimer").html(tInSecondsLeft - 1);
        tInSecondsLeft--;
    }, 1000);
}

app.showPanelAfterTimeout = function(tInSeconds, panelId) {
    app._panelAfterTimeout = panelId;
    setTimeout(function() {
        app.showPanel(app._panelAfterTimeout);
    }, tInSeconds * 1000);
}

app.showHomePanelAfterTimeout = function(tInSeconds) {
    app.showPanelAfterTimeout(tInSeconds, app.panels.home);
}

app.sendSignal = function(val) {
    ws.sendSignal(val);
}

app.startLiveClock = function() {
    app.stopLiveClock();
    app._liveClock = setInterval(app.updateLiveClock, 1000);
}

app.stopLiveClock = function() {
    clearInterval(app._liveClock);
}

app.updateLiveClock = function() {
    $('.ui_liveClock').html(app.getFormattedTime(0));
}