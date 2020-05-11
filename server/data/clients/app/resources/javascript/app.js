//Overwrite custom nextPanel
app.nextPanel = function() {
    switch (this.cPanel.selector) {
        case 'pid_mapp_s3_launch':
            //No default action. This is the loading panel
            break;
        case 'pid_mapp_s3_main':
            this.showPanel('pid_mapp_s3_booking_new');
            break;
        case 'pid_mapp_s3_booking_new':
            this.showPanel('pid_mapp_s3_booking_confirm');
            break;
        case 'pid_mapp_s3_booking_confirm':
            this.showPanel('pid_mapp_s3_booking_confirmation');
            break;
        case 'pid_mapp_s3_booking_confirmation':
            this.addBookedTrip();
            this.showPanel('pid_mapp_s3_main');
            break;
        case 'webui_error':
            this.reload();
        default:
            this.showPanel('webui_error');
            throw "Illegal panel id. Can not continiue (!)";
    }
}

app.addBookedTrip = function () {
    $('.ui_bookedTrip_date').html($('input#set_bookedTrip_date').value);
    $('.ui_bookedTrip_time').html($('input#set_bookedTrip_time').value);
    $('.ui_bookedTrip_cost').html("20 €*");
    $('#ui_bookedTrip').show();
}

app.applyClientCustomizations = function() {
    $('#ui_bookedTrip').hide();
}

