// WebUI

__null =  function() {
    throw "not implemented";
}
__f = function() {
    throw "internal function that has not been yet overwritten/customized";
}

var clientConfig;
var noticiationSound;

// Application Class
var application = app = {
    //Fields
    cPanel: null, //Object
    pPanel: null, //Object
    nSound: null, //Notification Sound (Needs to be set by client customization!)

    //Initializers
    initWithSharedCode: __f,

    //Methods
    reload: __f,
    setTitle: __f,
    applyRTDriverProfile: __f,
    showPanel: __f,
    hidePanel: __f,
    nextPanel: __f,
    previousPanel: __f,
    playNotificationSound: __f,

    //Additional Configuration
    defaultAction: this.nextPanel,

    //Internal Stuff
    __initialized: false,
}


/**
 * Implementation of AppCore
 */

app.initWithSharedCode = function(clientConfig) {
    if (!(this.__initialized)) {
        if (clientConfig) {
            app.setTitle(clientConfig.appTitle);    
            app.applyRTDriverProfile(clientConfig.rtDriverProfile);
            app.applyClientCustomizations();
            window.setTimeout(function() {
                app.showPanel('pid_mapp_s3_main');
            }, 1000);
        } else {
            app.showPanel('webui_error');
            alert('Could not retrieve clientConfig form backend simulation');
        }
        this.__initialized = true;
    }
}

app.reload = function() {
    document.reload();
}

app.setTitle = function(title) {
    document.title = title;
}

app.applyRTDriverProfile = function(driver) {
    $(".ui_driverShortname").html(driver.shortname);
    $(".ui_driverFullname").html(driver.fullname);
    $(".ui_driverPicture").attr('src', driver.pictureUrl);
    $(".ui_driverAge").html(driver.age);
    $(".ui_driverExperience").html(driver.experience);
    $(".ui_driverHobbies").html(driver.hobbies);
}

app.showPanel = function(panelId) {
    console.log('Showing panel: ' + panelId);
    this.pPanel = this.cPanel;
    $('.panel').hide().removeClass('active');
    $('#' + panelId).show().addClass('active');
    this.cPanel = $(panelId);
}

app.previousPanel = function() {
    if (this.cPanel != null) {
        showPanel(this.cPanel.selector);
    }
}

app.playNotificationSound = function() {
    nSound.play();
}

// Startup
$(document).ready(function() {
    app.setTitle('DriveMe');
    app.showPanel('pid_mapp_s3_launch');
    $.get('/clientConfig.json')
        .done(function(clientConfig) {
            app.initWithSharedCode(clientConfig);
        })
        .fail(function() {
            app.initWithSharedCode(false);
        });
});

/*
//Counter function for TORs and TBR
function counter(gofrom, goto) {
    var from = ($(".active .counter-me").attr("from"));
    var to = parseInt($(".active .counter-me").attr("to")) + 1;
    var intervall = $(".active .counter-me").attr("intervall");
    //Countdown sound
    var countdown = document.getElementById("countdown");
    countdown.currentTime = 6;
    countdown.play();
    function decrement() {
        if (from > to) {
            from -= intervall;
            $(".active .counter-me").html(from);
        } else {
            clearInterval(timer);
            $("#" + gofrom).removeClass("active");
            $("#" + goto).addClass("active");
            //Reset all counters to from (some are used multiple times)
            $(".counter-me").each(function () {
                $(this).html($(this).attr("from"))
            });
            countdown.pause();
        }
    }
    var timer = setInterval(decrement, 1000);
}

*/


