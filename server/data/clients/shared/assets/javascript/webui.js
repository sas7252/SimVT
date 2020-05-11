// WebUI

__null = function() {
    throw "not implemented";
}
__f = function() {
    throw "internal function that has not been yet overwritten/customized";
}

__cm = function() {
    throw "function not defined. should have been defined/overwritten by client module (app.js)";
}

var clientConfig;
var noticiationSound;

// Application Class
var application = app = {
    //Fields
    cPanel: null, //Object
    config: null, //Object
    pPanel: null, //Object
    hPanel: null, //Object
    nSound: null, //Notification Sound (Needs to be set by client customization!)

    //Initializers
    initWithSharedCode: __f,

    //Promissed methods
    reload: __f,
    setTitle: __f,
    applyRTDriverProfile: __f,
    showPanel: __f,
    showPanelWithoutNotifications: __f,
    showHomePanel: __f,
    hidePanel: __f,
    nextPanel: __f,
    previousPanel: __f,
    playNotificationSound: __f,

    //Overwrite these in client module:
    beforeShowingPanel: __cm,
    beforeLeavingPanel: __cm,
    initClientModule: __cm,

    //Rewire default action
    performDefaultAction: this.__defaultAction,

    //Configuration
    __defaultAction: this.nextPanel,
    __configUrl: '/clientConfig.json',
    panels: {
        launch: $('panel.panel').first().attr('id'),
        home: ''
    },

    //Internal Stuff
    __initialized: false,
}


/**
 * Implementation of AppCore
 */

app.initWithSharedCode = function(clientConfig) {
    if (!(this.__initialized)) {
        if (clientConfig) {
            this.config = clientConfig;
            this.setTitle(clientConfig.appTitle);
            this.applyRTDriverProfile(clientConfig.rtDriverProfile);
            this.initClientModule();
            console.info("INIT COMPLETE");
            window.setTimeout(function() {
                app.showHomePanel();
            }, 1000);
        } else {
            console.error('could not load client configuration!')
            this.showPanelWithoutNotifications('webui_error');
            alert('Could not retrieve clientConfig form backend simulation');
        }
        this.__initialized = true;
    } else console.warn('second inizialization attempt blocked');
}

app.reload = function() {
    document.reload();
}

app.setTitle = function(title) {
    document.title = title;
}

app.setHomePanel = function(panelId) {
    this.panels.home = panelId;
}

app.applyRTDriverProfile = function(driver) {
    console.info('Applying the following driver profile:');
    console.table(driver);
    $(".ui_driverShortname").html(driver.shortname);
    $(".ui_driverFullname").html(driver.fullname);
    $(".ui_driverPicture").attr('src', driver.pictureUrl);
    $(".ui_driverAge").html(driver.age);
    $(".ui_driverExperience").html(driver.experience);
    $(".ui_driverHobbies").html(driver.hobbies);
}

app.showPanel = function(panelId, notify = true) {
    this.pPanel = this.cPanel;
    if (notify) {
        this.beforeLeavingPanel(this.pPanel.attr('id'));
        console.log('PM: HIDE [' + this.pPanel.attr('id') + ']');
    }
    $('.panel').hide().removeClass('active');
    if (notify) this.beforeShowingPanel(panelId);
    console.log('PM: SHOW [' + panelId + ']');
    $('#' + panelId).show().addClass('active');
    this.cPanel = $('#' + panelId);
}

app.showPanelWithoutNotifications = function(panelId) {
    this.showPanel(panelId, false);
}


app.showHomePanel = function() {
    this.showPanel(this.panels.home);
}


app.nextPanel = function() {
    this.showPanel(this.cPanel.attr('nextPanel'));
}


app.previousPanel = function() {
    if (this.cPanel != null) {
        showPanel(this.cPanel.attr('id'));
    }
}

app.playNotificationSound = function() {
    nSound.play();
}

app.getFormattedDate = function() {
    date = new Date();
    return date.toLocaleDateString([], { day: '2-digit', month: '2-digit', year: '2-digit' });
}

app.getFormattedTime = function(diffInMinutes = 0) {
    time = new Date();
    time.setMinutes(time.getMinutes() + diffInMinutes);
    return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

// Startup
$(document).ready(function() {
    app.setTitle('DriveMe');
    app.showPanel($('panel.panel').first().attr('id'), false);
    $.get('/clientConfig.json')
        .done(function(clientConfig) {
            app.initWithSharedCode(clientConfig);
        })
        .fail(function() {
            app.initWithSharedCode(false);
        });
});