"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const settingsSchema = new mongoose.Schema({
    insulinMetric: {
        type: String,
        required: false
    },
    insulinIncrement: {
        type: Number,
        required: false
    },
    carbRatio: {
        type: Number,
        required: false
    },
    correctionFactor: {
        type: Number,
        required: false
    },
    targetBG: {
        type: Number,
        required: false
    },
    insulinDuration: {
        hours: {type: Number,
                 required: false},
        milliSec: {type: Number,
                   required: false}
    },
    insulinOnBoard: {
        amount: {type: Number,
                 required: false},
        timeLeft: {type: Number,
                   required: false},
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
        }]
    },
    loggedInUsername: {
        type: String,
        required: false
    },
    userID: {
        type: String
    },
    settingId: {
        type: String,
    }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
