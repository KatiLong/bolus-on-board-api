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

    $('#feedback').hide();
    $('#footer').show();
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

});
