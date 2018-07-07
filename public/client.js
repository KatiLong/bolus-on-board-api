'use strict';

let timeoutThread;

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
///////////////////////////////////////////////////////////
//AJAX call declarations

//UPDATE insulin stack entry
function updateStackEntry (entryId, entryObject) {
    $.ajax({
        type: 'PUT',
        url: `/insulin-stack-entry/${entryId}`,
        dataType: 'json',
        data: JSON.stringify(entryObject),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log('entry posted to insulin stack' + result);

    })
    .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });
}
//Update IOB
function updateIob (settingId, payload) {

    $.ajax({
        type: 'PUT',
        url: `/insulin-on-board/${settingId}`,
        dataType: 'json',
        data: JSON.stringify(payload),
        contentType: 'application/json'
    })
    .done(function (result) {
        console.log('IOB updated, ' + result);
    })
        .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });

}
//Update setting
function updateSettings (payload) {

    $.ajax({
        type: 'PUT',
        url: `/settings/${payload.settingId}`,
        dataType: 'json',
        data: JSON.stringify(payload),
        contentType: 'application/json'
    })
    .done(function (result) {

        $('.settings-div').hide();
        $('.setting-button').show();
    })
        .fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });

}
//GET all Logs
function getAllLogs () {
    const username = $("#signup-username").val();

    let bolusGET = $.ajax({
        type: 'GET',
        url: `/logs-bolus/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    }),
        basalGET = $.ajax({
            type: 'GET',
            url: `/logs-basal/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        }),
        bgGET = $.ajax({
            type: 'GET',
            url: `/logs-bg/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        }),
        a1cGET = $.ajax({
            type: 'GET',
            url: `/logs-a1c/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        });

    $.when(bolusGET, basalGET, bgGET, a1cGET).done(function(bolus, basal, bg, a1c) {
        //        console.log(bolus[0]);
        //        console.log(basal[0]);
        //        console.log(bg[0]);
        //        console.log(a1c[0]);

        //TDD calculations?
        //        let tddBolus = bolus[0].reduce((acc, currentVal, currentIndex) => {
        //            console.log(acc.bolusAmount, currentVal.bolusAmount);
        //            return acc.bolusAmount + currentVal.bolusAmount;
        //        })

        renderLogs({
            bolus: [...bolus[0]],
            basal: [...basal[0]],
            bg: [...bg[0]],
            a1c: [...a1c[0]]
        })

        //        renderLogsByDate([...bolus[0], ...basal[0]])

        $('#user-dashboard').hide();
        $('#logs').show();
    }).fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });
}

function iobLoginCalculator (result) {

    if (result[0].currentInsulinStack.length === 0) {
        $('#i-o-b').text(`0`);
        $('#iob-time').text(`0`);
        return;
    }

    let currentInsulinStack = [...result[0].currentInsulinStack];

    const loginTime = (new Date()).getTime();
    let bolusRate;
    let duration = ($('#duration').val())*3600000;
    let totalIOBAmount = result[0].insulinOnBoard.amount;
    let totalIOBTime = result[0].insulinOnBoard.timeLeft;

    let updatedInsulinStack = currentInsulinStack.map((el, ind) => {

        let timeElapsed = loginTime - el.timeStart;

        //If it's been longer than the User's set duration, zero out the element
        if (timeElapsed >= duration) {
            console.log('Zeroed out element', timeElapsed);
            el.timeRemaining = 0;
            el.currentInsulin = 0;
            return el;
        }

        el.timeRemaining = Math.min(Math.max((el.timeRemaining - timeElapsed), 0), duration);
        bolusRate = ((el.entryAmount)/(duration-900000))*timeElapsed
        el.currentInsulin = Math.min(Math.max(el.currentInsulin - bolusRate, 0), duration);
        totalIOBAmount = Math.min(Math.max(el.currentInsulin - bolusRate, 0), duration);

        if (totalIOBTime < el.timeRemaining) totalIOBTime = el.timeRemaining

        return el;

    }).filter((el)=> !(el.timeRemaining === 0)); //Filter out entries that have zeroed out

//    Math.min(Math.max((totalIOBTime - timeElapsed), 0), duration);

    $('#i-o-b').text(`${Math.round(totalIOBAmount * 100) / 100}`);
    $('#iob-time').text(`${Math.round((totalIOBTime/3600000) * 100) / 100}`);
    //At end calls insulinOnBoardCalculator loop
}

//Just updating insulinStack and Total IOB amounts (insulin & time)
function insulinOnBoardCalculator (iobObject, initialEntry) { //should update iob via formula & PUT call

    //CURRENT issues:
    //Either need to make function for ONE array element at a Time OR
    //Find a way to clear all but one Set-timeout at a time


    let currentInsulinStack = [...iobObject.insulinStack];
    let currentEntry, currentEntryId;

    let totalIOBAmount, totalIOBTime, bolusRate, stackLength;
    let duration = iobObject.duration.milliSec;
    let iobId =  $('#current-user-iob').val();
    let settingId = $('#current-user-settings').val();

    //Initialize Entry if it was just added from Bolus Submit
    if (initialEntry) {

        //NOT WORKING
        if (!timeoutThread) console.log('Timeout undefined');
        else {
            window.clearTimeout(timeoutThread);
            console.log('Timeout cleared?')
        }

        totalIOBAmount = iobObject.iobAmount + iobObject.newBolusAmount; //previousEntryAmounts + newEntryAmount
        totalIOBTime = Math.min(Math.max((iobObject.iobTime + duration), 0), duration); //previousEntryTimes + newEntryTime

        //Adds new entry to the insulinStack on server
        let insulinStackObject = {
            entryAmount: iobObject.newBolusAmount,
            currentInsulin: iobObject.newBolusAmount,
            timeStart: iobObject.initialTime,
            timeRemaining: iobObject.duration.milliSec
        }

        $.ajax({
            type: 'POST',
            url: `/iob/insulin-stack/${iobId}`,
            dataType: 'json',
            data: JSON.stringify(insulinStackObject),
            contentType: 'application/json'
        })
        .done(function (result) {
            console.log(result);
            //Add new entry + Id to local array
            let length = result.currentInsulinStack.length;
            currentInsulinStack.push(result.currentInsulinStack[length - 1]);
        })
        .fail(function (jqXHR, error, errorThrown) {
            console.log(jqXHR, error, errorThrown);
        });

        updateIob(iobId, {
            insulinOnBoard: {
                amount: totalIOBAmount,
                timeLeft: totalIOBTime
            }
        })
        //Updates HTML with new totals
        $('#i-o-b').text(`${totalIOBAmount}`);
        $('#iob-time').text(`${totalIOBTime/3600000}`); //Convert to Hours


    }
    //not an Initial Entry, thread running
    else {

        totalIOBAmount = iobObject.iobAmount;
        totalIOBTime = iobObject.iobTime;

        //    let insulinStackObject = {
        //        entryAmount: iobObject.newBolusAmount,
        //        currentInsulin: iobObject.newBolusAmount,
        //        timeStart: iobObject.initialTime,
        //        timeRemaining: iobObject.duration.milliSec
        //    }
    }

    //Updates Each Entry on insulin stack
//    let updatedInsulinStack = currentInsulinStack.map((el, ind) => {
//        console.log(el);
//        //For each element...Subtract 5 minutes, min = 0 and max = set duration
//        el.timeRemaining = Math.min(Math.max((el.timeRemaining - 300000), 0), duration);
//
//        //When all entries have 0 time remaining, stop recursively calling
//        if (el.timeRemaining === 0) {
//            //update everything to 0
//
//            el.currentInsulin = 0;
//            console.log('Time @ 0');
//        }
//        //First 15 minutes - time changes, insulin amount does not
//        else if (el.timeRemaining >= (duration-900000)) {
//            //Minus 5 minutes
//            console.log('First 15 minutes', el.timeRemaining);
//        }
//        //first half of entry duration
//        else if (el.timeRemaining >= (duration/2)) {
//            bolusRate = ((el.entryAmount/2)/((duration-900000)/2))*300000; //5 minute increments
//            el.currentInsulin = Math.max((el.currentInsulin - bolusRate), 0);
//            totalIOBAmount -= bolusRate;
//            console.log('First Half rate');
//        }
//        //second half of entry duration
//        else if (el.timeRemaining < (duration/2)) {
//            bolusRate = ((el.entryAmount/2)/((duration/2)))*300000; //5 minute increments
////            el.currentInsulin = Math.max((el.currentInsulin - bolusRate), 0);
//            el.currentInsulin -= bolusRate;
//            totalIOBAmount -= bolusRate;
//            console.log('Second Half rate', bolusRate);
//        }
//        //Catch errors
//        else {
//            console.log('Something went wrong in IOB');
//            return false;
//        }
//
//        return el;
//
//    }).filter((el)=> !(el.timeRemaining === 0)); //Filter out entries that have zeroed out
//    console.log(updatedInsulinStack);
//    //Post updates to Server
//
//    //If no entries left on stack, end recursive call
//    if (updatedInsulinStack.length === 0 || totalIOBAmount === 0 || totalIOBTime === 0) {
//        console.log('No entries in Insulin stack');
//
//        updateIob(iobId, {
//            insulinOnBoard: { amount: 0, timeLeft: 0},
//            currentInsulinStack: [...updatedInsulinStack] //need to delete each entry?
//        });
//
//        $('#i-o-b').text(`0`);
//        $('#iob-time').text(`0`);
//
//
//    }
//    else {
//        console.log('Where insulinOnBoard called again')
//        //call to Update IOB Setting
//        totalIOBTime = Math.min(Math.max((totalIOBTime - 300000), 0), duration);
//
//        //recursively call insulinOnBoard in 5 minutes
//        timeoutThread = setTimeout(() => {
//            console.log('Timeout over', totalIOBTime, totalIOBAmount);
//
//            $('#i-o-b').text(`${Math.round(totalIOBAmount * 100) / 100}`);
//            $('#iob-time').text(`${Math.round((totalIOBTime/3600000) * 100) / 100}`);
//
//            updateIob(iobId, {
//                insulinOnBoard: {
//                    amount: totalIOBAmount,
//                    timeLeft: totalIOBTime
//                }
//            });
////            updateSettings({
////                insulinOnBoard: {
////                    amount: totalIOBAmount,
////                    timeLeft: totalIOBTime,
////                    currentInsulinStack: updatedInsulinStack
////                },
////                settingId: $('#current-user-settings').val()
////            })
//            insulinOnBoardCalculator({
//                insulinStack: updatedInsulinStack,
//                duration: iobObject.duration,
//                iobAmount: totalIOBAmount,
//                iobTime: totalIOBTime
//            })
//        }, 5000);//300000
//
//    }
}

function bolusCalculator () {
    let carbFactor = $('#carb-ratio').val();
    let corrFactor = $('#correction-factor').val();
    let targetBG = $('#target-bg').val();

    //ROUND to the increment

    $(document).on('change', '#bolus-units', (event) => {
        let units = $('#bolus-units').val();
        $('#bolus-carbs').val(units*carbFactor);
        $('#suggested-bolus').val(units) //Plus BG...
    })
    $(document).on('change', '#bolus-carbs', (event) => {
        let carbs = $('#bolus-carbs').val();
        $('#bolus-units').val(carbs/carbFactor);
        $('#suggested-bolus').val($('#bolus-units').val())
    })
    $(document).on('change', '#bolus-bg', (event) => {
        let bg = $('#bolus-bg').val();
        let units = $('#bolus-units').val();
        $('#suggested-bolus').val(units);
        //eventual low calculator from settings
//        if (bg < targetBG) {
//            $('#suggested-bolus').val(units);
//        } else {
//            console.log('bg' + bg, 'targetBG' + targetBG, 'corrFactor' +  corrFactor);
//            let corrBolus = (units + ((bg - targetBG)/corrFactor));
//            console.log(corrBolus);
//            $('#suggested-bolus').val(corrBolus);
//        }

    })

}

//Populates current Date & Time for relevant forms
function dateTimePopulate (event) {
    const currentDateTime = new Date();
    let currentDate, currentTime = '';
    let month = currentDateTime.getMonth() + 1;
    let day = currentDateTime.getDay() + 1;
    let hour = currentDateTime.getHours();
    let year = currentDateTime.getFullYear();
    let minutes = currentDateTime.getMinutes();

    if (month < 10) month = "0" + month;
    if (day < 10) day = "0" + day;
    if (hour < 10) hour = "0" + hour;
    if (minutes < 10) minutes = "0" + minutes;

    currentDate = `${year}-${month}-${day}`;
    currentTime = `${hour}:${minutes}`;

    $(event.currentTarget).next('form').find('.date-dash').val(currentDate);

    if ($(event.currentTarget).next('form').find('.time-dash')) {
        $(event.currentTarget).next('form').find('.time-dash').val(currentTime);
    }

}
//function to render HTML for Logs on GET call

function displayDate (dateString) {
    let formattedDate = dateString.substring(0, 10).split("-");
    return formattedDate[1] + "/" + formattedDate[2] + "/" + formattedDate[0];
}

function renderLogsByDate (logObject) {

}

function renderLogs(logObject) {

    let htmlString = ``;

    if(logObject.bolus.length > 0) {
        logObject.bolus.forEach((el) => {
            //Add Time Formatting
            htmlString += `
                <div class="log-div type-bolus">
                    <span class="type log-col">Bolus</span>
                    <div class="readings log-col">
                        <span class="insulin-amount">Insulin: ${el.bolusUnits} units</span>
                        <span class="carbs-amount">Carbs: ${el.bolusCarbs} carbs</span>
                        <span class="bg">BG: ${el.bloodGlucose} mg/dL</span>
                    </div>
                    <div class="date-time log-col">
                        <span class="date">Date: ${displayDate(el.bolusDate)}</span>
                        <span class="time">Time: ${el.bolusTime}</span>
                    </div>
                </div>`;
        })
    }
    if(logObject.basal.length > 0) {
        logObject.basal.forEach((el) => {
            //HTML appendage
            htmlString += `
                <div class="log-div type-basal">
                    <span class="type log-col">Basal</span>
                    <span class="insulin-amount log-col readings">Insulin: ${el.insulinUnits} units</span>
                    <div class="date-time log-col">
                        <span class="date">Date: ${displayDate(el.basalDate)}</span>
                        <span class="time">Time: ${el.basalTime}</span>
                    </div>
                </div>`;
        })
    }
    if(logObject.bg.length > 0) {
        logObject.bg.forEach((el) => {
            //HTML appendage
            htmlString += `
                <div class="log-div type-bg">
                    <span class="type log-col">BG</span>
                    <span class="bg-reading log-col readings">${el.bloodGlucose} mg/dL</span>
                    <div class="date-time log-col">
                        <span class="date">Date: ${displayDate(el.bgDate)} </span>
                        <span class="time">Time: ${el.bgTime} </span>
                    </div>
                </div>`;
        })
    }
    if(logObject.a1c.length > 0) {
        logObject.a1c.forEach((el) => {
            //HTML appendage
            htmlString += `
                <div class="log-div type-a1c">
                    <span class="type log-col">A1c</span>
                    <span class="a1c-reading log-col readings">${el.a1cNumber}</span>
                    <span class="date log-col">Date: ${displayDate(el.a1cDate)}</span>
                </div>`;
        })
    }

    $('#log-entries').html(htmlString);
}


///////////////Document Ready Function///////////

$(document).ready(function(){

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
                $('#current-username-id').val(`${result.userID}`);
                $('#current-username').val(`${result.loggedInUsername}`);
                $('#current-user-settings').val(`${result._id}`);

                $('#medical-disclaimer').hide();
                $('#signup-page').hide();
                $('form').hide();
                $('#user-dashboard').show();
                $('#iob-display').show();

                //Create IOB storage
                $.ajax({
                    type: 'POST',
                    url: `iob/create`,
                    dataType: 'json',
                    data: JSON.stringify(newUserObject),
                    contentType: 'application/json'
                })
                //if call is succefull
                .done(function (result) {
                    $('#current-user-iob').val(result._id);
                })
                //if the call is failing
                .fail(function (jqXHR, error, errorThrown) {
                    console.log(jqXHR, error, errorThrown);
                })

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
                $('#increment').val(`${result[0].insulinIncrement}`);
                //Set Bolus Form insulin increment
                $( "#bolus-units" ).attr( "step", `${result[0].insulinIncrement}` );
                $( "#suggested-bolus" ).attr( "step", `${result[0].insulinIncrement}` );

                $('#target-bg').val(result[0].targetBG);
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

            // Get IOB settings
            $.ajax({
                type: 'GET',
                url: `/insulin-stack/${username}`,
                dataType: 'json',
                data: JSON.stringify(loginUserObject),
                contentType: 'application/json'
            })
            .done((result) => {
                console.log(result);
                $('#current-user-iob').val(result[0]._id);
                iobLoginCalculator(result);
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

    bolusCalculator()
    dateTimePopulate(event);
    $('.dash-button').hide();
    $('#bolus-form').show();
});

//Bolus submit
$(document).on('submit', '#bolus-form', (event) => {
    event.preventDefault();
    // POST Bolus entry to Server
    let username = $('#current-username').val();
    const bolusObject = {
        insulinType: $('#insulin-type').find(":selected").text(),
        bloodGlucose: Number($('#bolus-bg').val()),
        bolusUnits: Number($('#bolus-units').val()),
        bolusCarbs: Number($('#bolus-carbs').val()),
        bolusDate: $('#bolus-date').val(),
        bolusTime: $('#bolus-time').val(),
        bolusAmount: Number($('#suggested-bolus').val()),
        loggedInUsername: username
    }
    //POST Bolus Entry
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
        //GET user Settings and Insulin on Board info
        let settingsGET = $.ajax({
            type: 'GET',
            url: `/settings/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        }),
            iobGET = $.ajax({
                type: 'GET',
                url: `/insulin-stack/${username}`,
                dataType: 'json',
                contentType: 'application/json'
            });

        $.when(settingsGET, iobGET).done(function(r1, r2) {
            const initialTime = (new Date()).getTime();
            let insulinStack;

            if (r2[0][0].currentInsulinStack.length === 0) insulinStack = []
            else insulinStack = [...r2[0][0].currentInsulinStack]

//            insulinOnBoardCalculator({
//                insulinStack,
//                duration: r1[0][0].insulinDuration,
//                iobAmount: r2[0][0].insulinOnBoard.amount,
//                iobTime: r2[0][0].insulinOnBoard.timeLeft,
//                initialTime,
//                newBolusAmount: bolusObject.bolusAmount
//            }, true);

        }).fail(function (jqXHR, error, errorThrown) {
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
///////////////////////////////////////

//Logs Section show
$(document).on('click', '#logs-trigger', (event) => {
    event.preventDefault();
    getAllLogs();

});
//Logs sort by Type
$(document).on('click', '#type-sort', (event) => {
    event.preventDefault();
    getAllLogs();
})
//Logs sort by Date
$(document).on('click', '#date-sort', (event) => {
    event.preventDefault();

    const username = $("#signup-username").val();

    let bolusGET = $.ajax({
        type: 'GET',
        url: `/logs-bolus/${username}`,
        dataType: 'json',
        contentType: 'application/json'
        }),
        basalGET = $.ajax({
            type: 'GET',
            url: `/logs-basal/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        }),
        bgGET = $.ajax({
            type: 'GET',
            url: `/logs-bg/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        }),
        a1cGET = $.ajax({
            type: 'GET',
            url: `/logs-a1c/${username}`,
            dataType: 'json',
            contentType: 'application/json'
        });

    $.when(bolusGET, basalGET, bgGET, a1cGET).done(function(bolus, basal, bg, a1c) {
        //        console.log(bolus[0]);
        //        console.log(basal[0]);
        //        console.log(bg[0]);
        //        console.log(a1c[0]);

        let allLogs = [...bolus[0], ...basal[0], ...bg[0], ...a1c[0]];
        console.log(allLogs)

        allLogs.sort((a, b) => {
            console.log(a.createdAt, b.createdAt);

            if (a.createdAt < b.createdAt) {
                return -1;
            }
            if (a.createdAt > b.createdAt) {
                return 1;
            }
            // names must be equal
            return 0;
        });
        console.log(allLogs);

//        renderLogsByDate(allLogs)


        $('#user-dashboard').hide();
        $('#logs').show();
    }).fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });

})

//Bolus only
$(document).on('click', '#bolus-logs', (event) => {
    event.preventDefault();
    const username = $("#signup-username").val();
    $.ajax({
        type: 'GET',
        url: `/logs-bolus/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    }).done((results) => {
        console.log(results);
        renderLogs({
            bolus: [...results]
        })
    }).fail((jqXHR, error, errorThrown) => {
        console.log(jqXHR, error, errorThrown)
    })

});
//Basal only
$(document).on('click', '#basal-logs', (event) => {
    event.preventDefault();
    const username = $("#signup-username").val();
    $.ajax({
        type: 'GET',
        url: `/logs-basal/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    }).done((results) => {
        console.log(results);
        renderLogs({
            basal: [...results]
        })
    }).fail((jqXHR, error, errorThrown) => {
        console.log(jqXHR, error, errorThrown)
    })

});
//BG only
$(document).on('click', '#bg-logs', (event) => {
    event.preventDefault();
    const username = $("#signup-username").val();
    $.ajax({
        type: 'GET',
        url: `/logs-bg/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    }).done((results) => {
        console.log(results);
        renderLogs({
            bg: [...results]
        })
    }).fail((jqXHR, error, errorThrown) => {
        console.log(jqXHR, error, errorThrown)
    })

});
//A1c only
$(document).on('click', '#a1c-logs', (event) => {
    event.preventDefault();
    const username = $("#signup-username").val();
    $.ajax({
        type: 'GET',
        url: `/logs-a1c/${username}`,
        dataType: 'json',
        contentType: 'application/json'
    }).done((results) => {
        console.log(results);
        renderLogs({
            a1c: [...results]
        })
    }).fail((jqXHR, error, errorThrown) => {
        console.log(jqXHR, error, errorThrown)
    })

});

//TDD get

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
