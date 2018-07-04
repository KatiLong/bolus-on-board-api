"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const insulinOnBoardSchema = new mongoose.Schema({
    insulinOnBoard: {
        amount: {type: Number,
                 required: false},
        timeLeft: {type: Number,
                   required: false},
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
    loggedInUsername: {
        type: String,
        required: false
    },
    iobId: {
        type: String,
    }
});

const insulinOnBoard = mongoose.model('Insulin on Board', insulinOnBoardSchema);

module.exports = insulinOnBoard;
