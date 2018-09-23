"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const settingsSchema = new mongoose.Schema({
    lowBg: {
        type: Number,
        required: false
    },
    incrementInsulin: {
        type: Number,
        required: false
    },
    carbRatio: {
        type: Number,
        required: false
    },
    correction: {
        type: Number,
        required: false
    },
    targetBg: {
        type: Number,
        required: false
    },
    duration: {
        hours: {type: Number,
                 required: false},
        milliSec: {type: Number,
                   required: false}
    },
    loggedInUsername: {
        type: String,
        required: false
    },
    userID: {
        type: String
    },
    settingsId: {
        type: String
    }
});

const Settings = mongoose.model('Settings', settingsSchema);

module.exports = Settings;
