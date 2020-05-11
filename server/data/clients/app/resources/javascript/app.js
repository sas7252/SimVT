app.bookedTrip = {
    toa: null,
    tos: null,
    price: '20 €',
    available: false
}

app.beforeShowingPanel = function(nextPanelId) {
    switch (nextPanelId) {
        case 'pid_mapp_s3_launch':
            break;
        case 'pid_mapp_s3_main':
            if (this.bookedTrip.available) this.addBookedTripToMainPanel();
            break;
        case 'pid_mapp_s3_booking_new':
            $('input#set_bookedTrip_time').attr('value', this.getFormattedTime());
            break;
        case 'pid_mapp_s3_booking_confirm':
            this.startBookingEstimationsUpdater();
            break;
        case 'pid_mapp_s3_booking_confirmation':
            $('.ui_bookedTrip_time').html(this.bookedTrip.tos); //Update takeover time from confirm screen into this confirmation
            break;
        default:
            this.showPanelWithoutNotifications('webui_error');
            throw "Illegal panel id. Can not continiue (!)";
    }
}

app.beforeLeavingPanel = function(leavingPanelId) {
    switch (leavingPanelId) {
        case 'pid_mapp_s3_launch':
        case 'pid_mapp_s3_main':
        case 'pid_mapp_s3_booking_new':
            break;
        case 'pid_mapp_s3_booking_confirm':
            this.stopBookingEstimationsUpdater();
            break;
        case 'pid_mapp_s3_booking_confirmation':
            this.bookedTrip.available = true;
            //$('.ui_bookedTrip_time').html(this.bookedTrip_tos); //Update takeover time from confirm screen into this confirmation
            break;
        default:
            this.showPanelWithoutNotifications('webui_error');
            throw "Illegal panel id. Can not continiue (!)";
    }
}

app.startBookingEstimationsUpdater = function() {
    if (!this.bookingEstimationsUpdater) {
        console.log("Starting bookingEstimationsUpdater");
        this.updateBookingEstimations();
        this.bookingEstimationsUpdater = setInterval(function() {
            app.updateBookingEstimations();
        }, 5000);
    }
}

app.updateBookingEstimations = function() {
    bt = this.bookedTrip;
    bt.tos = this.getFormattedTime(0); //Time of Start
    bt.toa = this.getFormattedTime(+20); //Time of Arrival (= TOS+20 Minuten)
    console.log('Updating booking estimations: TOS@' + bt.tos + " --> TOA@" + bt.toa);
    $('.ui_bookingEstimation_tos').html(bt.tos);
    $('.ui_bookingEstimation_toa').html(bt.toa);
    app.bookedTrip_tos = this.getFormattedTime(+1); //This will be shown in confirmation screen as takeover time
}

app.stopBookingEstimationsUpdater = function() {
    if (this.bookingEstimationsUpdater) {
        console.log("Stopping bookingEstimationsUpdater");
        clearInterval(this.bookingEstimationsUpdater);
        this.bookingEstimationsUpdater = false;
    }
}

app.addBookedTripToMainPanel = function() {
    $('#ui_bookedTrip_date').html(this.getFormattedDate());
    $('#ui_bookedTrip_time').html(this.bookedTrip.tos);
    $('#ui_bookedTrip_cost').html("20 €*");
    $('#ui_bookedTrip').show();
    console.info("Added booked trip to main panel")
}

app.initClientModule = function() {
    $('#ui_bookedTrip').hide();
    this.bookingEstimationsUpdater = false;
    this.setHomePanel('pid_mapp_s3_main');
    console.info("Client module initialized");
}