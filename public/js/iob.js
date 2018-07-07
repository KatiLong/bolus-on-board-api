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
