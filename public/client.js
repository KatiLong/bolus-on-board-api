const globalObject = {
    name: 'Carmen',
    username: 'CarmenSD',
    password: 'Where?2018',
    userSettings: {
        IOB: {
            units: 0,
            timeRemaining: 0
        },
        iobStatusColor: 'teal',
        insulinMetric: 'units',
        insulinIncrement: 1,
        bgMeasurementType: 'mg/dl',
        carbRatio: 9,
        correctionFactor: 35,
        targetBG: 110
    },
    methods: {
        iobCalculation: (num) => setTimeout(function(){ alert("IOB Tracking"); }, 3000),
        iobAddUnits: (num) => globalObject.userSpecific.insulinOnBoard + num,
        iobTimeRemainFormat: () => console.log('Display hours and minutes')
    }
}


///////////////Document Ready Function///////////

$(document).ready(function(){
    console.log( "ready!" );

    $('.datepicker').datepicker();
    $('.timepicker').timepicker();
    $('select').formSelect();

    $('section').hide();
    $('#login-page').show();

});

///////////////Triggers//////////////
//User Login
$('#login-form').submit( (event) => {
    event.preventDefault();

    $('#login-page').hide();
    $('#user-dashboard').show();
    $('form').hide();
});
//Switch User Forms -> Signup
$('#change-form-signup').click((event) => {
    event.preventDefault();

    $('#login-page').hide();
    $('#signup-page').show();
});
//Feedback Form
$('#feedback-trigger').click((event) => {
    event.preventDefault();

    $('footer').hide();
    $('#feedback').show();
    $('#feedback-form').show();
});
//Cancel button Feedback form
$('.cancel-button').click((event) => {
    event.preventDefault();

    $('footer').show();
    $('#feedback').hide();
});
//Feedback submit
$('#feedback-form').submit( (event) => {
    event.preventDefault();
    alert("Thanks for the Feedback!");
    $('#feedback').hide();
    $('footer').show();
});
//User Signup switch form -> Login
$('#change-form-login').click((event) => {
    event.preventDefault();

    $('#signup-page').hide();
    $('#login-page').show();
});
//Signup submit
$('#signup-form').submit( (event) => {
    event.preventDefault();

    $('#signup-page').hide();
    $('#user-dashboard').show();
    $('form').hide();

});

////USER DASHBOARD Triggers/////////
//Reusable Dashboard Back button
$('.dash-back').click((event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
});

//Bolus show
$('#bolus-trigger').click((event) => {
    event.preventDefault();

    $('.dash-button').hide();
    $('#bolus-form').show();
});

//Bolus submit
$('#bolus-form').submit( (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
    alert('Form submitted');
});

//BG show
$('#bg-trigger').click((event) => {
    event.preventDefault();

    $('.dash-button').hide();
    $('#blood-glucose-form').show();
});

//BG submit
$('#blood-glucose-form').submit( (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
    alert('Form submitted');
});

//Basal show
$('#basal-trigger').click((event) => {
    event.preventDefault();

    $('.dash-button').hide();
    $('#basal-form').show();
});

//Basal submit
$('#basal-form').submit( (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
    alert('Form submitted');
});

//A1c show
$('#a1c-trigger').click((event) => {
    event.preventDefault();

    $('.dash-button').hide();
    $('#a1c-form').show();
});

//A1c submit
$('#a1c-form').submit( (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
    alert('Form submitted');
});
////////////////////////////////////////
//Settings Section show
$('#settings-trigger').click((event) => {
    event.preventDefault();

    $('#user-dashboard').hide();
    $('.settings-forms').show();
    $('.settings-div').hide();

    $('#settings').show();
    $('#settings-menu').show();
    $('.setting-button').show();
});

//Settings Show Section Trigger
$('.setting-button').click(function(event) {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').hide();

    $(this).siblings('div').show();
});

//Settings Back Button
$('.back-button').click(function(event) {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();
});

$('.home-button').click(function(event) {
    event.preventDefault();

    $('#settings').hide();
    $('#user-dashboard').show();
});

//
$('#units-carbs-form').submit( (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
    alert('Form submitted');
});
