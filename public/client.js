const globalObject = {
    name: 'Carmen',
    username: 'CarmenSD',
    password: 'Where?2018',
    userSpecific: {
        insulinOnBoard: 0,
        iobStatusColor: 'teal',
        insulinMetric: 'units',

    },
    methods: {
        iobCalculation: (num) => setTimeout(function(){ alert("IOB Tracking"); }, 3000),
        iobAddUnits: (num) => globalObject.userSpecific.insulinOnBoard + num,
    }
}


///////////////Document Ready Function///////////

$(document).ready(function(){
    console.log( "ready!" );

    $('.datepicker').datepicker();
    $('.timepicker').timepicker();
    $('select').formSelect();
});

///////////////Triggers//////////////


