//Function for changing the gender
function elenor() {
    $("<span>Elenor</span>").replaceAll(".driver");
    $("<h3>Elenor Kaiser</h3>").replaceAll(".driver_full");
    $(".driver_img").attr("src", "assets/img/Elenor.png");
    $("<span class='reg'>25</span>").replaceAll(".driver_age");
    $("<span class='reg'>6 Jahre</span>").replaceAll(".driver_de");
    $("<span class='reg'>Reiten, Lesen, Reisen</span>").replaceAll(".driver_hobbies");
}
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

//Main stuff
$(document).ready(function () {

    //Change gender if necessary
    elenor();

    //Initalize audio
    var audio = document.getElementById("sound");

    //---MOBILE---
    //Show Start
    $("#m_start").addClass("active");
    //After 2s show Home
    window.setTimeout(function () {
        $("#m_start").removeClass("active")
        $("#m_home").addClass("active");
    }, 2000);
    //Call NewRide
    $("#newRide").click(function () {
        $("#m_home").removeClass("active");
        $("#m_nRide").addClass("active");
    })
    //Call Confirm
    $("#rideOn").click(function () {
        $("#m_nRide").removeClass("active");
        $("#m_confirm").addClass("active");
    })
    //Show Thanks
    $("#letsgo").click(function () {
        $("#m_confirm").removeClass("active");
        $("#m_thanks").addClass("active");
    })
    //Show Home booked
    $("#goon").click(function () {
        $("#m_thanks").removeClass("active");
        $("#m_booked").addClass("active");
    })
    //After click switch to Tablet Start
    //---TABLET---
    $("#m_booked").click(function () {
        $("#m_booked").removeClass("active")
        $("#t_start").addClass("active");
        //After 2s show S3 TOR
        window.setTimeout(function () {
            $("#t_start").removeClass("active");
            $("#t_s3_tor").addClass("active");
            audio.play();
        }, 2000);
    })
    //Accept S3 TOR - show Counter and V1
    $("#accept_s3_tor").click(function () {
        $("#t_s3_tor").removeClass("active");
        $("#t_cin").addClass("active");
        //Call counter
        counter("t_cin", "t_s3_v1");
    })
    //After click switch to V2
    $("#t_s3_v1").click(function () {
        $("#t_s3_v1").removeClass("active");
        $("#t_s3_v2").addClass("active");
    })
    //After click show TBR
    $("#t_s3_v2").click(function () {
        $("#t_s3_v2").removeClass("active");
        $("#t_s3_tbr").addClass("active");
        audio.play();
    })
    //Accept TBR - show Counter and Thanks
    $("#accept_s3_tbr").click(function () {
        $("#t_s3_tbr").removeClass("active");
        $("#t_cout").addClass("active");
        //Call counter
        counter("t_cout", "t_thanks");
    })
    //After clickswitch to S2 Start
    $("#t_thanks").click(function () {
        $("#t_thanks").removeClass("active")
        $("#t_start").addClass("active");
        //After 2s show S2 TOR
        window.setTimeout(function () {
            $("#t_start").removeClass("active");
            $("#t_s2_tor").addClass("active");
            audio.play();
        }, 2000);
    })
    //Decline S2 TOR - show start 
    $("#decline_s2_tor").click(function () {
        $("#t_s2_tor").removeClass("active")
        $("#t_start").addClass("active");
        //After 2s show TOR again
        window.setTimeout(function () {
            $("#t_start").removeClass("active");
            $("#t_s2_tor").addClass("active");
            audio.play();
        }, 2000);
    })
    //Accept TOR - show Counter and V1
    $("#accept_s2_tor").click(function () {
        $("#t_s2_tor").removeClass("active");
        $("#t_cin").addClass("active");
        counter("t_cin", "t_s2_v1");
    })
    //After click switch to V2
    $("#t_s2_v1").click(function () {
        $("#t_s2_v1").removeClass("active")
        $("#t_s2_v2").addClass("active");
    })
    //End Take-Over - Show S2 TBR in both Variants
    $("#end_to").click(function () {
        $("#t_s2_v1").removeClass("active");
        $("#t_s2_v2").removeClass("active");
        $('#t_s2_tbr').addClass("active");
        audio.play();
    })
    //Accept TBR - show Counter and Thanks
    $("#accept_s2_tbr").click(function () {
        $("#t_s2_tbr").removeClass("active");
        $("#t_cout").addClass("active");
        //Call counter
        counter("t_cout", "t_thanks");
    })
})