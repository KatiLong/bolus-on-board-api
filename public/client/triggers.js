'use strict';

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
                    //call Iob on Login
                    //setTimeout(() => {
                    //    insulinOnBoardCalculator({
                    //        insulinStack,
                    //        duration,
                    //        iobAmount: result[0].insulinOnBoard.amount,
                    //        iobTime: result[0].insulinOnBoard.timeLeft,
                    //        initialTime
                    //    });
                    //}, 10000);//300000
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
                url: `/iob-stack/${username}`,
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
    let bolusDate = $('#bolus-date').val();
    let bolusTime = $('#bolus-time').val();
    let inputDateTime = bolusDate.substring(0, 11) + 'T' + bolusTime;
    let duration = $('#duration').val();

    const bolusObject = {
        insulinType: $('#insulin-type').find(":selected").text(),
        bloodGlucose: Number($('#bolus-bg').val()),
        bolusUnits: Number($('#bolus-units').val()),
        bolusCarbs: Number($('#bolus-carbs').val()),
        bolusDate,
        bolusTime,
        bolusAmount: Number($('#suggested-bolus').val()),
        inputDateTime,
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
    .done((result) => {
        $('form').hide();
        $('.dash-button').show();
        //GET user Settings and Insulin on Board info
        $.ajax({
                type: 'GET',
                url: `/iob-stack/${username}`,
                dataType: 'json',
                contentType: 'application/json'
        }).done((result) => {

            console.log(result);

            const initialTime = (new Date()).getTime();
            let insulinStack;

            if (result[0].currentInsulinStack.length === 0) insulinStack = [];
            else insulinStack = [...result[0].currentInsulinStack];

            newBolusEntry({
                insulinStack,
                duration,
                iobAmount: result[0].insulinOnBoard.amount,
                iobTime: result[0].insulinOnBoard.timeLeft,
                initialTime,
                newBolusAmount: Number($('#suggested-bolus').val())
            });

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

    let bgDate = $('#bg-date').val();
    let bgTime = $('#bg-time').val();
    let inputDateTime = bgDate.substring(0, 11) + 'T' + bgTime;

    const bgObject = {
        bloodGlucose: Number($('#bg-input').val()),
        bgDate,
        bgTime,
        inputDateTime,
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

    let basalDate = $('#basal-date').val();
    let basalTime = $('#basal-time').val();
    let inputDateTime = basalDate.substring(0, 11) + 'T' + basalTime;

    const basalObject = {
        insulinType: $('#basal-insulin-type').find(":selected").text(),
        insulinUnits: Number($('#basal-units').val()),
        basalDate,
        basalTime,
        inputDateTime,
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
        inputDateTime: $('#a1c-date').val(),
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
//////////////////////////////////////////////////////

//Phased out for current version - will reimplement in future app
//Logs sort by Type
//$(document).on('click', '#type-sort', (event) => {
//    event.preventDefault();
//    getAllLogs();
//})
//Logs sort by Date
//$(document).on('click', '#date-sort', (event) => {
//    event.preventDefault();
//
//    const username = $("#signup-username").val();
//
//    let bolusGET = $.ajax({
//        type: 'GET',
//        url: `/logs-bolus/${username}`,
//        dataType: 'json',
//        contentType: 'application/json'
//        }),
//        basalGET = $.ajax({
//            type: 'GET',
//            url: `/logs-basal/${username}`,
//            dataType: 'json',
//            contentType: 'application/json'
//        }),
//        bgGET = $.ajax({
//            type: 'GET',
//            url: `/logs-bg/${username}`,
//            dataType: 'json',
//            contentType: 'application/json'
//        }),
//        a1cGET = $.ajax({
//            type: 'GET',
//            url: `/logs-a1c/${username}`,
//            dataType: 'json',
//            contentType: 'application/json'
//        });
//
//    $.when(bolusGET, basalGET, bgGET, a1cGET).done(function(bolus, basal, bg, a1c) {
//
//        let allLogs = [...bolus[0], ...basal[0], ...bg[0], ...a1c[0]];
//        console.log(allLogs);
//        allLogs.sort((a, b) => {
//
//            if (a.inputDateTime < b.inputDateTime) {
//                console.log('a is less');
//                return -1;
//            }
//            if (a.inputDateTime > b.inputDateTime) {
//                console.log('a is less');
//                return 1;
//            }
//            // names must be equal
//            return 0;
//        });
//        console.log(allLogs);
//
////        renderLogsByDate(allLogs)
//
//
//        $('#user-dashboard').hide();
//        $('#logs').show();
//    }).fail(function (jqXHR, error, errorThrown) {
//        console.log(jqXHR, error, errorThrown);
//    });
//
//})
//////////////////////////////////////////////////////////
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
