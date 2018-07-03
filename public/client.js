'use strict';

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

//Update setting
function updateSettings (payload) {
    console.log(payload);

    $.ajax({
        type: 'PUT',
        url: `/settings/${payload.settingId}`,
        dataType: 'json',
        data: JSON.stringify(payload),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log(result);

        $('.settings-div').hide();
        $('.setting-button').show();
    })
        .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });

}

//Insulin on Board caclulation
//setInterval(function(){ alert("Hello"); }, 300000); //5 minute intervals
//clearInterval() //When Insulin equals 0
//getTime() milliseconds since January 1, 1970
//When bolus is submitted & clock starts

//if 15 minutes from bolus time hold (displayed but not calculated)
//if Entry input, run function and API update IOB call
    //display combined totals
//Every 5 minutes function rerun and API update call
//if 0 minutes remain,

//insulinOnBoardCalculator({
//    insulinStack: [...result[0].insulinOnBoard.currentInsulinStack],
//    duration: result[0].insulinDuration,
//    iobAmount: result[0].insulinOnBoard.amount,
//    iobTime: result[0].insulinOnBoard.timeLeft,
//    initialTime,
//    newBolusAmount: bolusObject.bolusAmount,
//    userSettingsId: result[0]._id
//});
//Just updating insulinStack and Total IOB amounts (insulin & time)
function insulinOnBoardCalculator (iobObject, lastStackLength) { //should update iob via formula & PUT call

    console.log('IOB Calculator function ran');
    console.log(iobObject, lastStackLength);

    let insulinRemaining, totalIOBAmount, totalIOBTime, bolusRate, stackLength;
    let currentInsulinStack = [];

    //Rethink Time Remaining - not a parameter but calculated from timeStart

    //Initialize Entry - the first time function is invoked will not pass in lastStackLength parameter
    if (!lastStackLength) {
        console.log('New Insulin stack thread initialized');

        iobObject.insulinStack.push({
            entryAmount: iobObject.newBolusAmount,
            currentInsulin: iobObject.newBolusAmount,
            timeStart: iobObject.initialTime,
            timeRemaining: iobObject.duration.milliSec
        });
        lastStackLength = iobObject.insulinStack.length;

        updateSettings({
            insulinOnBoard: {
                amount: iobObject.iobAmount + iobObject.newBolusAmount,
                timeLeft: iobObject.iobTime + iobObject.duration.milliSec,
                currentInsulinStack: iobObject.insulinStack[0]
            },
            settingId: $('#current-user-settings').val()
        })

        $('#i-o-b').text(`${totalIOBAmount + iobObject.newBolusAmount}`);
        $('#iob-time').text(`${totalIOBTime + iobObject.duration.milliSec}`);

        console.log(iobObject.insulinStack, lastStackLength, $('#current-user-settings').val());
    }
    //In case of new Bolus Entry, end one thread - only ever one insulinOnBoard thread running at a time
//    if (lastStackLength < currentInsulinStack.length || currentInsulinStack.length === 0) {
//        console.log('Insulin Stack thread ended');
//        return;
//    }
    //Updates Each Entry on insulin stack
//    currentInsulinStack = iobObject.insulinStack.map((el, ind) => {
//        //First 15 minutes the Insulin not subtracted
//        if (timeRemaining >= (duration - 15000)) {
//            insulinRemaining = bolusAdded;
//            bolusRate = 0;
//            duration = result[0].insulinDuration;
//
//            totalIOBAmount = result[0].insulinOnBoard.amount + insulinRemaining;
//            totalIOBTime = result[0].insulinOnBoard.timeLeft + timeRemaining;
//            //Set IOB display to correct totals
//            $('#i-o-b').text(`${totalIOBAmount}`);
//            $('#iob-time').text(`${totalIOBTime}`);
//
//
//        } // x = insulinAmount/135300000
//        else if (timeRemaining >= (duration/2)) { //first half
//            bolusRate = bolus/((duration/2)-15000)
//        }//Insulin on board
//        else if (timeRemaining < (duration/2)) { //second half
//
//        }
//        //When all entries have 0 time remaining, stop recursively calling
//        else if (timeRemaining === 0) {
//                //update everything to 0
//            }
//        //No insulin remaining
//        else {//Catch errors
//            console.log('Something went wrong in IOB');
//            return false;
//        }
//
//    }).filter((el)=> el.timeRemaining === 0); //Filter out entries that have zeroed out

    //Post updates to Server

    //If no entries left on stack, end recursive call
    if (currentInsulinStack.length === 0 || totalIOBAmount === 0 || totalIOBTime === 0) {
        console.log('No entries in Insulin stack');

//        result, initialTime, (insulinRemaining - bolusRate), (timeRemaining-300000)
//        $('#i-o-b').text(`${totalIOBAmount}`);
//        $('#iob-time').text(`${totalIOBTime}`);


    } else {
        console.log('Where insulinOnBoard called again')
        //call to Update IOB Setting
//        let result = updateSettings({
//            insulinOnBoard: {
//                amount: totalIOBAmount,
//                timeLeft: totalIOBTime,
//                currentInsulinStack
//            },
//            settingId: $('#current-user-settings').val()
//        })
//        //recursively call insulinOnBoard in 5 minutes
        //        setTimeout(() => { insulinOnBoardCalculator({
//            insulinStack: currentInsulinStack,
//            duration: 4,
//            iobAmount: 4,
//            iobTime: 4,
//            initialTime: 534444
//        }, lastStackLength) }, 300000);
    }
}

function bolusCalculator () {
    console.log('bolus calculator');
    //insulin  OR
    //carbs
    //correction factor
    //insulin remaining

}

function carbUnitCalculator () {
    console.log('Carb-unit calculator');
}

//Populates current Date & Time for relevant forms
function dateTimePopulate (event) {
    const currentDateTime = new Date();
    let currentDate, currentTime = '';

    let month = currentDateTime.getMonth()
    if (month < 10) month = "0" + month;
    let day = currentDateTime.getDay()
    if (day < 10) day = "0" + day;

    currentDate = `${currentDateTime.getFullYear()}-${month}-${day}`;
    currentTime = `${currentDateTime.getHours()}:${currentDateTime.getMinutes()}`;

    $(event.currentTarget).next('form').find('.date-dash').val(currentDate);

    if ($(event.currentTarget).next('form').find('.time-dash')) {
        $(event.currentTarget).next('form').find('.time-dash').val(currentTime);
    }

}
//function to render HTML for Logs on GET call
function renderLogs(result) {
    console.log(result);
    let htmlString = ``;
    let displayDate = results.inputDate.substring(0, 10);
    let formattedDisplayDate = displayDate.split("-");
    let formattedDisplayDateOutput = formattedDisplayDate[1] + "/" + formattedDisplayDate[2] + "/" + formattedDisplayDate[0];

    htmlString += `<div class="entries-container" id="${results._id}">`;
    //if Bolus

    //if Basal
    //if BG
    //if A1c
}


///////////////Document Ready Function///////////

$(document).ready(function(){
    console.log( "ready!" );

    $('section').hide();
    $('#login-page').show();

});

///////////////Triggers//////////////
//Signup submit
$(document).on('submit', '#signup-form', (event) => {
    event.preventDefault();
    //user must accept medical disclaimer before creating an account
    $('#medical-disclaimer').show();

    $(document).on('click', '#disclaimer-accept', (event) => {
        event.preventDefault();

        //take the input from the user
        const name = $("#signup-name").val();
        const username = $("#signup-username").val();
        const password = $("#signup-password").val();

        //Set displayed Insulin on Board to zero
        $("#i-o-b").text("0");
        $("#iob-time").text("0:00");
        $("#current-user").text(`${name}`);

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
            console.log(newUserObject);
            //API call to create User
            $.ajax({
                type: 'POST',
                url: '/users/create',
                dataType: 'json',
                data: JSON.stringify(newUserObject),
                contentType: 'application/json'
            })
            //if call is succefull
            .done(function (result) {
                console.log(result);
                $('#current-username-id').val(`${result.userID}`);
                $('#current-username').val(`${result.loggedInUsername}`);
                $('#current-user-settings').val(`${result._id}`);

                $('#medical-disclaimer').hide();
                $('#signup-page').hide();
                $('form').hide();
                $('#user-dashboard').show();
                $('#iob-display').show();

            })
            //if the call is failing
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                if (errorThrown === 'Conflict') alert('User with that username already exists');
                console.log(errorThrown);
            })
        }
    })

    $(document).on('click', '#cancel-disclaimer', (event) => {
        event.preventDefault();

        $('#medical-disclaimer').hide();
    })

});
//User Login
$(document).on('submit', '#login-form', (event) => {
    event.preventDefault();
    console.log($('#units').val(), $('#carbs').val())
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
            username,
            password
        };

        //User Login Call
        $.ajax({
            type: 'POST',
            url: '/users/login',
            dataType: 'json',
            data: JSON.stringify(loginUserObject),
            contentType: 'application/json'
        })
        .done(function (result) {
            console.log(result);
            //Set User's id in an accessible input
            $('#current-username-id').val(`${result._id}`);
            $('#current-username').val(username);

            $('#current-user').text(`${result.name}`);

            $('#login-page').hide();
            $('form').hide();
            $('#user-dashboard').show();
            $('#iob-display').show();

            //Get User's Settings
            $.ajax({
                type: 'GET',
                url: `/settings/${username}`,
                dataType: 'json',
                data: JSON.stringify(loginUserObject),
                contentType: 'application/json'
            })
            .done((result) => {

                $('#current-user-settings').val(`${result[0]._id}`);
                //Set the HTML text to User's setting
                $('#i-o-b').text(`${result[0].insulinOnBoard.amount}`);
                $('#iob-time').text(`${result[0].insulinOnBoard.timeLeft}`);
                $('#increment').val(`${result[0].insulinIncrement}`);
                $('#carb-ratio').val(`${result[0].carbRatio}`);
                $('#correction-factor').val(`${result[0].correctionFactor}`);
                $('#duration').val(`${result[0].insulinDuration.hours}`);

                //Carbs or Units Select
                if (result[0].insulinMetric === 'carbs') {
                    $('#carbs').prop('checked', true);
                } else if (result[0].insulinMetric === 'units') {
                    $('#units').prop('checked', true);
                }
            })
            .fail(function (jqXHR, error, errorThrown) {
                console.log(jqXHR);
                console.log(error);
                console.log(errorThrown);
            });
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
$(document).on('click', '#change-form-signup', (event) => {
    event.preventDefault();

    $('#login-page').hide();
    $('#signup-page').show();
});
//Feedback Form
$(document).on('click', '#feedback-trigger', (event) => {
    event.preventDefault();

    $('footer').hide();
    $('#feedback').show();
    $('#feedback-form').show();
});
//Cancel button Feedback form
$(document).on('click', '.cancel-button', (event) => {
    event.preventDefault();

    $('footer').show();
    $('#feedback').hide();
});

//Feedback submit
$(document).on('submit', '#feedback-form', (event) => {
    event.preventDefault();
    alert("Thanks for the Feedback!");
    $('#feedback').hide();
    $('footer').show();
});
//User Signup switch form -> Login
$(document).on('click', '#change-form-login', (event) => {
    event.preventDefault();

    $('#signup-page').hide();
    $('#medical-disclaimer').hide();
    $('#login-page').show();

});


////USER DASHBOARD Triggers/////////
//Reusable Dashboard Back button
$(document).on('click', '.dash-back', (event) => {
    event.preventDefault();

    $('form').hide();
    $('.dash-button').show();
});

//Bolus show
$(document).on('click', '#bolus-trigger', (event) => {
    event.preventDefault();

    dateTimePopulate(event);
    $('.dash-button').hide();
    $('#bolus-form').show();
});

//Bolus submit
$(document).on('submit', '#bolus-form', (event) => {
    event.preventDefault();
    // POST Bolus entry to Server
    const bolusObject = {
        insulinType: $('#insulin-type').find(":selected").text(),
        bloodGlucose: Number($('#bolus-bg').val()),
        bolusUnits: Number($('#bolus-units').val()),
        bolusCarbs: Number($('#bolus-carbs').val()),
        bolusDate: $('#bolus-date').val(),
        bolusTime: $('#bolus-time').val(),
        bolusAmount: Number($('#suggested-bolus').val()),
        loggedInUsername: $('#current-username').val()
    }

    $.ajax({
        type: 'POST',
        url: '/bolus',
        dataType: 'json',
        data: JSON.stringify(bolusObject),
        contentType: 'application/json'
    })
    .done(function (result) {
        $('form').hide();
        $('.dash-button').show();

        const initialTime = (new Date()).getTime();

        //GET current Insulin on Board when new Bolus added & add new IOB
        $.ajax({
            type: 'GET',
            url: `/settings/${bolusObject.loggedInUsername}`,
            dataType: 'json',
            contentType: 'application/json'
        })
        .done(function (result) {
            console.log(result);

            const initialTime = (new Date()).getTime();
            console.log({
                insulinStack: [...result[0].insulinOnBoard.currentInsulinStack],
                duration: result[0].insulinDuration,
                iobAmount: result[0].insulinOnBoard.amount,
                iobTime: result[0].insulinOnBoard.timeLeft,
                initialTime,
                newBolusAmount: bolusObject.bolusAmount
            });
            insulinOnBoardCalculator({
                insulinStack: [...result[0].insulinOnBoard.currentInsulinStack],
                duration: result[0].insulinDuration,
                iobAmount: result[0].insulinOnBoard.amount,
                iobTime: result[0].insulinOnBoard.timeLeft,
                initialTime,
                newBolusAmount: bolusObject.bolusAmount
            });

        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR, error, errorThrown);
        });


    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });


});

//BG show
$(document).on('click', '#bg-trigger', (event) => {
    event.preventDefault();

    dateTimePopulate(event);
    $('.dash-button').hide();
    $('#blood-glucose-form').show();
});

//BG submit
$(document).on('submit', '#blood-glucose-form',  (event) => {
    event.preventDefault();

    const bgObject = {
        bloodGlucose: Number($('#bg-input').val()),
        bgDate: $('#bg-date').val(),
        bgTime: $('#bg-time').val(),
        loggedInUsername: $('#current-username').val()
    }

    $.ajax({
        type: 'POST',
        url: '/blood-glucose',
        dataType: 'json',
        data: JSON.stringify(bgObject),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log(result);
        $('form').hide();
        $('.dash-button').show();

    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });

});

//Basal show
$(document).on('click', '#basal-trigger', (event) => {
    event.preventDefault();

    dateTimePopulate(event);
    $('.dash-button').hide();
    $('#basal-form').show();
});

//Basal submit
$(document).on('submit', '#basal-form', (event) => {
    event.preventDefault();

    const basalObject = {
        insulinType: $('#basal-insulin-type').find(":selected").text(),
        insulinUnits: Number($('#basal-units').val()),
        basalDate: $('#basal-date').val(),
        basalTime: $('#basal-time').val(),
        loggedInUsername: $('#current-username').val()
    }
    console.log(basalObject);
    $.ajax({
        type: 'POST',
        url: '/basal',
        dataType: 'json',
        data: JSON.stringify(basalObject),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log(result);
        $('form').hide();
        $('.dash-button').show();
    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });

});

//A1c show
$(document).on('click', '#a1c-trigger', (event) => {
    event.preventDefault();

    dateTimePopulate(event);
    $('.dash-button').hide();
    $('#a1c-form').show();
});

//A1c submit
$(document).on('submit', '#a1c-form', (event) => {
    event.preventDefault();

    const a1cObject = {
        a1cNumber: Number($('#a1c-entry').val()),
        a1cDate: $('#a1c-date').val(),
        loggedInUsername: $('#current-username').val()
    }
    console.log(a1cObject);
    $.ajax({
        type: 'POST',
        url: '/a1c',
        dataType: 'json',
        data: JSON.stringify(a1cObject),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log(result);

        $('form').hide();
        $('.dash-button').show();
    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });

});
////////////////////////////////////////
//Logs Section show
$(document).on('click', '#logs-trigger', (event) => {
    event.preventDefault();

    const username = $("#signup-username").val();
    console.log('Logs Trigger working');
    //Get call for Bolus, Basal, BG & A1c logs
    $.ajax({
        type: 'GET',
        url: `/logs/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log(result);

        $('#user-dashboard').hide();
        $('#logs').show();
    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR);
        console.log(error);
        console.log(errorThrown);
    });

});

////////////////////////////////////////
//Settings Section show
$(document).on('click', '#settings-trigger', (event) => {
    event.preventDefault();

    $('#user-dashboard').hide();
    $('.settings-forms').show();
    $('.settings-div').hide();

    $('#settings').show();
    $('#settings-menu').show();
    $('.setting-button').show();
});

//Settings Show Section Trigger
$(document).on('click', '.setting-button', (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').hide();

    $(event.currentTarget).siblings('div').show();
});

//Settings Back Button
$(document).on('click', '.back-button', (event) => {
    event.preventDefault();

    $('.settings-div').hide();
    $('.setting-button').show();
});

$(document).on('click', '.home-button', (event) => {
    event.preventDefault();

    $('#settings').hide();
    $('#logs').hide();
    $('#user-dashboard').show();
});

//Units or Carbs Submit
$(document).on('submit', '#units-carbs-form', (event) => {
    event.preventDefault();
    let selected = $('input[name=group1]:checked').attr('id');

    updateSettings({
        insulinMetric: selected,
        settingId: $('#current-user-settings').val()
    });

});
//Insulin Increment Submit
$(document).on('submit', '#increment-form', (event) => {
    event.preventDefault();

    updateSettings({
        insulinIncrement: $('#increment').val(),
        settingId: $('#current-user-settings').val()
    });
});
//Units or Carbs Submit
$(document).on('submit', '#carb-ratio-form', (event) => {
    event.preventDefault();

    updateSettings({
        carbRatio: $('#carb-ratio').val(),
        settingId: $('#current-user-settings').val()
    });
});
//Correction Factor Form Submit
$(document).on('submit', '#correction-factor-form', (event) => {
    event.preventDefault();

    updateSettings({
        correctionFactor: $('#correction-factor').val(),
        settingId: $('#current-user-settings').val()
    });
});
//Target BG submit
$(document).on('submit', '#target-bg-form', (event) => {
    event.preventDefault();

    updateSettings({
        targetBG: $('#target-bg').val(),
        settingId: $('#current-user-settings').val()
    });
});
//Duration submit
$(document).on('submit', '#duration-form', (event) => {
    event.preventDefault();
    let duration = $('#duration').val();

    updateSettings({
        insulinDuration: {
            hours: duration,
            milliSec: duration*3600000
        },
        settingId: $('#current-user-settings').val()
    });
});

///////////////////////////////////////////////////////////
//Bonus Features: To Be Implemented
//BG Measurement Unit Submit
$(document).on('submit', '#bg-measurement-form', (event) => {
    event.preventDefault();

});
