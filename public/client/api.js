'use strict';
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
//DELETE insulin stack entry
function deleteStackEntry (userId, entryId) {
    $.ajax({
        type: 'DELETE',
        url: `/iob/insulin-stack/${userId}/${entryId}`,
        dataType: 'json',
        contentType: 'application/json'
    })
        .done(function (result) {
        console.log('entry deleted from insulin stack');

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
        console.log('IOB updated');
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
        console.log(bolus[0]);
        console.log(basal[0]);
        console.log(bg[0]);
        console.log(a1c[0]);

        renderLogs({
            bolus: [...bolus[0]],
            basal: [...basal[0]],
            bg: [...bg[0]],
            a1c: [...a1c[0]]
        })

        $('#user-dashboard').hide();
        $('#logs').show();

    }).fail(function (jqXHR, error, errorThrown) {
        console.log(jqXHR, error, errorThrown);
    });
}
