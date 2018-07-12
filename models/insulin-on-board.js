"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const insulinOnBoardSchema = new mongoose.Schema({
    loggedInUsername: {
        type: String,
        required: false
    },
    insulinOnBoard: {
        amount: {type: Number,
                 required: false},
        timeLeft: {type: Number,
                   required: false}
    },
    currentInsulinStack: [{
        entryAmount: {
            type: Number
        },
        currentInsulin: {
            type: Number
        },
        timeStart: {
            type: Number
        },
        timeRemaining:{
            type: Number
        }
    }],
    iobId: {
        type: String,
    }
});

const insulinOnBoard = mongoose.model('insulinOnBoard', insulinOnBoardSchema);

module.exports = insulinOnBoard;
