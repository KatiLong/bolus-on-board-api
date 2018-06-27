"use strict";

const mongoose = require('mongoose');

const bolusSchema = new mongoose.Schema({
    insulinType: {
        type: String,
        required: false
    },
    bloodGlucose: {
        type: Number,
        required: false
    },
    bolusUnits: {
        type: Number,
        required: false
    },
    bolusCarbs: {
        type: Number,
        required: false
    },
    bolusDate: {
        type: Date,
        required: false
    },
    bolusTime: {
        type: String,
        required: false
    },
    bolusAmount: {
        type: Number,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

const Bolus = mongoose.model('Bolus', bolusSchema);

module.exports = Bolus;
