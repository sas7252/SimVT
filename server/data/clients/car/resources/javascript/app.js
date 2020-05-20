app._panels = {
    start: 'pid_carui_s0_start',
    home: 'pid_carui_s0_home',
    loader: 'pid_carui_s0_loader',
    rtOfferS2: 'pid_carui_s2_rtoffer_disctracted',
    rtOfferS3: 'pid_carui_s3_rtoffer_bookedtrip',
    count2Online: 'pid_carui_s0_rtoffer_countdown2online',
    rtOnline: 'pid_carui_s0_rtonline',
    rtReleaseS2: 'pid_carui_s2_rtrelease_confirm',
    rtReleaseS3: 'pid_carui_s3_rtrelease_request',
    count2Offline: 'pid_carui_s0_rtrelease_countdown2offline',
    rtOffline: 'pid_carui_s0_rtoffline',
}

app._signal = {
    inb: {
        reload: 'op2car_reload',
        rtOffer: 'op2car_rtOFFER',
        rtOnline: 'op2car_rtONLINE',
        rtRelease: 'op2car_rtRELEASE',
        rtOffline: 'op2car_rtOFFLINE'
    },
    out: {
        rtOfferAccept: 'car2op_rtOFFER-accept',
        rtOfferDecline: 'car2op_rtOFFER-decline',
        rtReleaseConfirmNo: 'car2op_rtRELEASE-confirm:no',
        rtReleaseConfirmYes: 'car2op_rtRELEASE-confirm:yes',
        rtReleaseReq: 'car2op_rtRELEASE-request',
    }
}

app._sounds = {
    alert: null, //alert sound used for attention grabbing
    count: null //warning sound used for countdown
}

app.beforeShowingPanel = function(nextPanelId) {
    switch (nextPanelId) {
        case app._panels.home:
            app.startLiveClock();
            //Warning sound for all of these cases:
        case app._panels.rtOfferS2:
        case app._panels.rtOfferS3:
        case app._panels.rtReleaseS2:
        case app._panels.rtReleaseS3:
            app._sounds.alert.currentTime = 0;
            app._sounds.alert.play();
            break;
        case app._panels.count2Online:
            app.startTimer(5);
            app.showPanelAfterTimeout(5, app._panels.rtOnline);
            break;
        case app._panels.count2Offline:
            app.startTimer(5);
            app.showPanelAfterTimeout(5, app._panels.rtOffline);
            break;
        case app._panels.rtOffline:
            app.showHomePanelAfterTimeout(5);
            break;
        default:
    }
}

app.beforeLeavingPanel = function(leavingPanelId) {
    if (leavingPanelId == app._panels.home) app.stopLiveClock();
}

app.initClientModule = function() {
    //Set home panel (important as this will be shown after all inits are done!)
    app.setHomePanel(app._panels.home);
    //Apply UI changes for correct sNR (scenario) and iavNr (interaction variant)
    $('.v_onlyS2').hide();
    $('.v_onlyS3').hide();
    $('.v_onlyIAV1').hide();
    $('.v_onlyIAV2').hide();
    $('.v_onlyS' + app.sNr).show();
    $('.v_onlyIAV' + app.iavNr).show();
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

app.acceptRtOffer = function(bool) {
    var signal = bool ? app._signal.out.rtOfferAccept : app._signal.out.rtOfferDecline;
    app.sendSignal(signal);
    bool ? app.showPanel(app._panels.loader) : app.showHomePanel();
}

//SZ2-only: Request TakeBack
app.confirmUserReleaseRequest = function() {
    if (app.sNr != 2) {
        console.warn('Method only available in SZ2!');
        return -1;
    }
    app.showPanel('pid_carui_s2_rtrelease_confirm');
}

//SZ2-only: Actually send user request
app.requestRtRelease = function() {
    if (app.sNr != 2) {
        console.warn('Method only available in SZ2!');
        return -1;
    }
    app.sendSignal(app._signal.out.rtReleaseReq);
    app.showPanel(app._panels.loader);
}

app.answerSZ3ReleaseRequest = function(bool) {
    if (app.sNr != 3) {
        console.warn('Method only available in SZ3!');
        return -1
    }
    var signal = bool ? app._signal.out.rtReleaseConfirmYes : app._signal.out.rtReleaseConfirmNo;
    app.sendSignal(signal);
    bool ? app.showPanel(app._panels.loader) : app.showPanel(app._panels.rtOnline);
}

app.handleServerSignal = function(signal) {
    switch (signal) {
        case app._signal.inb.reload:
            app.reload();
            break;
        case app._signal.inb.rtOffer:
            var nextPanel = '';
            console.log(this);
            nextPanel = (app.sNr == 2) ? app._panels.rtOfferS2 : ((app.sNr == 3) ? app._panels.rtOfferS3 : '');
            if (nextPanel == '') {
                console.warn('Could not determine rtOffer panel for this szenario: ' + app.sNr);
                return -1;
            } else app.showPanel(nextPanel);
            break;
        case app._signal.inb.rtOnline:
            app.showPanel('pid_carui_s0_rtoffer_countdown2online');
            break;
        case app._signal.inb.rtRelease:
            app.showPanel('pid_carui_s3_rtrelease_request');
            break;
        case app._signal.inb.rtOffline:
            app.showPanel('pid_carui_s0_rtrelease_countdown2offline');
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