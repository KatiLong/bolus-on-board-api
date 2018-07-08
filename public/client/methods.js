'use strict';

function iobLoginCalculator (result) {
    console.log(result);

    const loginTime = (new Date()).getTime();
    let currentInsulinStack = [...result[0].currentInsulinStack];
    let bolusRate;
    let duration = ($('#duration').val())*3600000;
    let totalIOBAmount = result[0].insulinOnBoard.amount;
    let totalIOBTime = result[0].insulinOnBoard.timeLeft;
    let iobId =  $('#current-user-iob').val();
    let username = $('#current-username').val();

    //If no entries, update TotalIob Displays and return
    if (result[0].currentInsulinStack.length === 0) {
        $('#i-o-b').text(`0`);
        $('#iob-time').text(`0`);
        console.log(totalIOBTime);
        updateIob(iobId, {
            insulinOnBoard: {
                amount: 0,
                timeLeft: 0
            }
        })
    } else {
        let updatedInsulinStack = currentInsulinStack.map((el, ind) => {
            let timeElapsed = loginTime - el.timeStart;

            //If it's been longer than the User's set duration, zero out the element
            if (timeElapsed >= duration) {
                console.log('Element Zeroed Out', timeElapsed);

                totalIOBAmount = Math.min(Math.max((totalIOBAmount - el.currentInsulin), 0), duration);
                totalIOBTime = Math.min(Math.max((totalIOBTime - el.timeRemaining), 0), duration);
                el.timeRemaining = 0;
                el.currentInsulin = 0;

                return el;
            }
            //Updating totals for Element and Global Totals
            bolusRate = ((el.entryAmount)/(duration-900000))*timeElapsed

            el.timeRemaining = Math.min(Math.max((el.timeRemaining - timeElapsed), 0), duration);
            el.currentInsulin = Math.min(Math.max(el.currentInsulin - bolusRate, 0), duration);

            totalIOBAmount = Math.min(Math.max(totalIOBAmount - bolusRate, 0), duration);

            //Setting Total IOB Time to highest Time Remaining of an Entry
            if (totalIOBTime < el.timeRemaining) totalIOBTime = el.timeRemaining

            //Update the Entry on the server
            updateStackEntry(el._id, el);
            //Updating local Entry
            return el;

        }).filter((el)=> {
            console.log(el);
            if (el.timeRemaining === 0) deleteStackEntry(iobId, el._id);
            return !(el.timeRemaining === 0);
        }); //Filter out entries that have zeroed out

        //    Math.min(Math.max((totalIOBTime - timeElapsed), 0), duration);

        updateIob(iobId, {
            insulinOnBoard: {
                amount: totalIOBAmount,
                timeLeft: totalIOBTime
            }
        });

        $('#i-o-b').text(`${Math.round(totalIOBAmount * 100) / 100}`);
        $('#iob-time').text(`${Math.round((totalIOBTime/3600000) * 100) / 100}`);
    }

    //At end calls insulinOnBoardCalculator loop
    //GET user Settings and Insulin on Board info

        console.log(result);
        const initialTime = (new Date()).getTime();
        let insulinStack;

        if (result[0].currentInsulinStack.length === 0) insulinStack = [];
        else insulinStack = [...result[0].currentInsulinStack];

        setTimeout(() => {
            insulinOnBoardCalculator({
                insulinStack,
                duration,
                iobAmount: result[0].insulinOnBoard.amount,
                iobTime: result[0].insulinOnBoard.timeLeft,
                initialTime
            });
        }, 5000);//300000


}

function newBolusEntry(iobObject) {
    console.log(iobObject);

    let iobId =  $('#current-user-iob').val();
    let username = $('#current-username').val();
    let totalIOBAmount = iobObject.iobAmount + iobObject.newBolusAmount; //previousEntryAmounts + newEntryAmount
    let totalIOBTime = iobObject.duration*360000; //previousEntryTimes + newEntryTime

    //Adds new entry to the insulinStack on server
    let insulinStackObject = {
        entryAmount: iobObject.newBolusAmount,
        currentInsulin: iobObject.newBolusAmount,
        timeStart: iobObject.initialTime,
        timeRemaining: iobObject.duration
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

//Just updating insulinStack and Total IOB amounts (insulin & time)
function insulinOnBoardCalculator (iobObject) { //should update iob via formula & PUT call
    console.log(iobObject);
    //CURRENT issues:
    //Either need to make function for ONE array element at a Time OR
    //Find a way to clear all but one Set-timeout at a time

    let currentInsulinStack = [...iobObject.insulinStack];
    let updatedInsulinStack, bolusRate, stackLength;
    let duration = iobObject.duration;
    let iobId =  $('#current-user-iob').val();
    let settingId = $('#current-user-settings').val();

    let totalIOBAmount = iobObject.iobAmount;
    let totalIOBTime = iobObject.iobTime;

    //Update Entries if there are any
    if (currentInsulinStack.length > 0) {

        //Updates Each Entry on insulin stack
        updatedInsulinStack = currentInsulinStack.map((el, ind) => {
            console.log(el);
            //For each element...Subtract 5 minutes, min = 0 and max = set duration
            el.timeRemaining = Math.min(Math.max((el.timeRemaining - 300000), 0), duration);

            //When all entries have 0 time remaining, stop recursively calling
            if (el.timeRemaining === 0) {
                //update everything to 0

                el.currentInsulin = 0;
                console.log('Time @ 0');
            }
            //First 15 minutes - time changes, insulin amount does not
            else if (el.timeRemaining >= (duration-900000)) {
                //Minus 5 minutes
                console.log('First 15 minutes', el.timeRemaining);
            }
            //first half of entry duration
            else if (el.timeRemaining >= (duration/2)) {
                bolusRate = ((el.entryAmount/2)/((duration-900000)/2))*300000; //5 minute increments
                el.currentInsulin = Math.max((el.currentInsulin - bolusRate), 0);
                totalIOBAmount -= bolusRate;
                console.log('First Half rate');
            }
            //second half of entry duration
            else if (el.timeRemaining < (duration/2)) {
                bolusRate = ((el.entryAmount/2)/((duration/2)))*300000; //5 minute increments
                //            el.currentInsulin = Math.max((el.currentInsulin - bolusRate), 0);
                el.currentInsulin -= bolusRate;
                totalIOBAmount -= bolusRate;
                console.log('Second Half rate', bolusRate);
            }
            //Catch errors
            else {
                console.log('Something went wrong in IOB');
                return false;
            }

            return el;
        //Filter out entries that have zeroed out Locally and on Server
        }).filter((el)=> {
            console.log(el);
            if (el.timeRemaining === 0) deleteStackEntry(iobId, el._id);
            return !(el.timeRemaining === 0);
        });
        console.log(updatedInsulinStack);
    } else {
        updatedInsulinStack = [];
    }
    //Updating 5 minute time passage

    totalIOBTime = Math.min(Math.max((totalIOBTime - 300000), 0), duration);
    console.log('total Time' + totalIOBTime);
    //Set displayed IOB Totals
    $('#i-o-b').text(`${Math.round(totalIOBAmount * 100) / 100}`);
    $('#iob-time').text(`${Math.round((totalIOBTime/3600000) * 100) / 100}`);

    if (updatedInsulinStack.length === 0 || !updatedInsulinStack) {
        //Update each entry on insulin Stack
        updatedInsulinStack.map((el) => {
            updateStackEntry(el._id, el);
        })
    }
    //Update IOB Totals
    updateIob(iobId, {
        insulinOnBoard: {
            amount: totalIOBAmount,
            timeLeft: totalIOBTime
        }
    });
    //recursively call insulinOnBoard in 5 minutes
    setTimeout(() => {
        console.log('Timeout over', totalIOBTime, totalIOBAmount);

        insulinOnBoardCalculator({
            insulinStack: updatedInsulinStack,
            duration: iobObject.duration,
            iobAmount: totalIOBAmount,
            iobTime: totalIOBTime
        })
    }, 5000);//300000

    //If no entries left on stack, end recursive call
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
//    }
    //    else {
    //        console.log('Where insulinOnBoard called again')
    //        //call to Update IOB Setting
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

//To be Implemented Fully in future version
function tddCalculator () {
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
        })

    $.when(bolusGET, basalGET).done(function(bolus, basal) {
        console.log(bolus[0]);
        console.log(basal[0]);

        //Update average TDD per 24hrs on screen

        $('#user-dashboard').hide();
        $('#logs').show();
    }).fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });
    //TDD calculations?
            let tddBolus = bolus[0].reduce((acc, currentVal, currentIndex) => {
                console.log(acc, currentVal.bolusAmount);
                return acc + currentVal.bolusAmount;
            }, 0)
            console.log(tddBolus);
            let tddBasal = basal[0].reduce((acc, currentVal, currentIndex) => {
                console.log(acc, currentVal.insulinUnits);
                return acc + currentVal.insulinUnits;
            }, 0)
            console.log(tddBasal);
}

let timeoutThread;

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

function renderLogs(logObject) {
    console.log(logObject);

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

