const dataToTrackList = {
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
//Signup submit
$('#signup-form').submit( (event) => {
    event.preventDefault();

    //take the input from the user
    const name = $("#signup-name").val();
    const username = $("#signup-username").val();
    const password = $("#signup-password").val();

    //validate the input
    if (name == "") {
        alert('Please add a name');
    } else if (username == "") {
        alert('Please add an user name');
    } else if (password == "") {
        alert('Please add a password');
    }
    //if the input is valid
    else {
        //create the payload object (what data we send to the api call)
        const newUserObject = {
            name: name,
            username: username,
            password: password
        };

        //make the api call using the payload above
        $.ajax({
            type: 'POST',
            url: '/users/create',
            dataType: 'json',
            data: JSON.stringify(newUserObject),
            contentType: 'application/json'
        })
        //if call is succefull
            .done(function (result) {
            $('#signup-page').hide();
            $('form').hide();
            $('#user-dashboard').show();
            $('#iob-display').show();


            //Function for populating User's info - current IOB

        })
        //if the call is failing
            .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
        });
    }
});
//User Login
$('#login-form').submit( (event) => {
    event.preventDefault();

    //take the input from the user
    const username = $("#login-username").val();
    const password = $("#login-password").val();

    //validate the input
    if (username == "") {
        alert('Please input user name');
    } else if (password == "") {
        alert('Please input password');
    }
    //if the input is valid
    else {
        //create the payload object (what data we send to the api call)
        const loginUserObject = {
            username: username,
            password: password
        };
        console.log(loginUserObject);

        //make the api call using the payload above
        $.ajax({
            type: 'POST',
            url: '/users/login',
            dataType: 'json',
            data: JSON.stringify(loginUserObject),
            contentType: 'application/json'
        })
        //if call is succefull
        .done(function (result) {
            console.log(result);

            $('#login-page').hide();
            $('form').hide();
            $('#user-dashboard').show();
            $('#iob-display').show();

        })
        //if the call is failing
            .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR);
            console.log(error);
            console.log(errorThrown);
            alert('Incorrect Username or Password');
        });
    };
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

//Units or Carbs Submit
$('#units-carbs-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
//Insulin Increment Submit
$('#increment-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
//BG Measurement Unit Submit
$('#bg-measurement-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
//Units or Carbs Submit
$('#carb-ratio-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
//Correction Factor Form Submit
$('#correction-factor-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
//Target BG submit
$('#target-bg-form').submit( (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();

    alert('Form submitted');
});
