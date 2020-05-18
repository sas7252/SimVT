app._panels = {
    start: 'pid_carui_s0_start',
    home: 'pid_carui_s0_home',
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
    inb = {
        reload: 'op2car_reload',
        rtOffer: 'op2car_rtOFFER',
        rtOnline: 'op2car_rtONLINE',
        rtRelease: 'op2car_rtRELEASE',
        rtOffline: 'op2car_rtOFFLINE'
    },
    out = {
        rtOfferAccept: 'car2op_rtOFFER-accept',
        rtOfferDecline: 'car2op_rtOFFER-decline',
        rtReleaseConfirmNo: 'car2op_rtRELEASE-confirm:yes',
        rtReleaseConfirmYes: 'car2op_rtRELEASE-confirm:no',
        rtReleaseReq: 'car2op_rtRELEASE-request',
    }
}

app._sounds = {
    alert: null, //alert sound used for attention grabbing
    count: null //warning sound used for countdown
}

app.beforeShowingPanel = function(nextPanelId) {
    switch (nextPanelId) {
        //Warning sound for all of these cases:
        case this._panels.rtOfferS2:
        case this._panels.rtOfferS3:
        case this._panels.rtReleaseS2:
        case this._panels.rtReleaseS3:
            this._sounds.currentTime = 0;
            this._sounds.alert.play();
            break;
        case this._panels.count2Online:
            this.startTimer(5);
            this.showPanelAfterTimeout(5, this._panels.rtOnline);
            break;
        case this._panels.count2Offline:
            this.startTimer(5);
            this.showPanelAfterTimeout(5, this._panels.rtOffline);
            break;
        case this._panels.rtOffline:
            this._sounds.currentTime = 0;
            this._sounds.alert.play();
            this.showHomePanelAfterTimeout(3);
            break;
        default:
    }
}

app.beforeLeavingPanel = function(leavingPanelId) {
    //No need for this, so just leave it blank
}

app.initClientModule = function() {
    //Set home panel (important as this will be shown after all inits are done!)
    this.setHomePanel(this._panels.home);
    //Apply UI changes for correct sNR (scenario) and iavNr (interaction variant)
    $('.v_onlyS2').hide();
    $('.v_onlyS3').hide();
    $('.v_onlyIAV1').hide();
    $('.v_onlyIAV2').hide();
    $('.v_onlyS' + this.sNr).show();
    $('.v_onlyIAV' + this.iavNr).show();
    //Get sound objects
    this._sounds.alert = document.getElementById('sound_alert');
    this._sounds.count = document.getElementById('sound_count');
    this._sounds.alert.load();
    this._sounds.count.load();
    //Report init done
    console.info("Client module initialized");
}

app.acceptRtOffer = function(bool) {
    var signal = bool ? this._signal.out.rtOfferAccept : this._signal.out.rtOfferDecline;
    this.sendSignal(signal);
}

//SZ2-only: Request TakeBack
app.confirmUserReleaseRequest() {
    if (this.sNr != 2) {
        console.warn('Method only available in SZ2!');
        return -1;
    }
    app.showPanel('pid_carui_s2_rtrelease_confirm');
}

//SZ2-only: Actually send user request
app.requestRtRelease = function() {
    if (this.sNr != 2) {
        console.warn('Method only available in SZ2!');
        return -1;
    }
    app.sendSignal(this._signal.out.rtReleaseReq);
    app.showPanel('pid_carui_s0_rtonline');
}

app.answerSZ3ReleaseRequest = function(bool) {
    if (this.sNr != 3) {
        console.warn('Method only available in SZ3!');
        return -1
    }
    var signal = bool ? this._signal.out.rtReleaseConfirmYes : this._signal.out.rtReleaseConfirmNo;
    app.sendSignal(signal);
    app.showPanel('pid_carui_s0_rtonline');
}

app.handleServerSignal = function(signal) {
    switch (signal) {
        case this._signal.inb.reload:
            app.reload();
            break;
        case this._signal.inb.rtOffer:
            var nextPanel = '';
            nextPanel = (this.sNr == 2) ? this._panels.rtOfferS2 : '';
            nextPanel = (this.sNr == 3) ? this._panels.rtOfferS3 : '';
            if (nextPanel == '') {
                console.warn('Could not determine rtOffer panel for this szenario: ' + this.sNr);
                return -1;
            } else app.showPanel(nextPanel);
        case this._signal.inb.rtOnline:
            app.showPanel('pid_carui_s0_rtoffer_countdown2online');
            break;
        case this._signal.inb.rtRelease:
            app.showPanel('pid_carui_s3_rtrelease_request');
            break;
        case this._signal.inb.rtOffline:
            app.showPanel('pid_carui_s0_rtrelease_countdown2offline');
            break;
        default:
            console.warn('revieved invalid signal: ' + signal);
    }
}

app.startTimer = function(tInSeconds) {
    var tInSecondsLeft = tInSeconds;
    var countdown = setInterval(function() {
        if (tInSecondsLeft <= 0) {
            clearInterval(countdown);
        }
        $(".appTimer").html(tInSecondsLeft);
        this._sounds.count.currentTime = 6;
        this._sounds.count.play();
        tInSecondsLeft--;
    }, 1000);
}

app.showPanelAfterTimeout = function(tInSeconds, panelId) {
    this._panelAfterTimeout = panelId;
    setTimeout(function() {
        app.showPanel(app._panelAfterTimeout);
    }, tInSeconds * 1000);
}

app.showHomePanelAfterTimeout = function(tInSeconds) {
    this.showPanelAfterTimeout(tInSeconds, app.panels.home);
}