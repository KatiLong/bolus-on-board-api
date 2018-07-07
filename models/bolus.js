"use strict";

const mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

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
    inputDateTime: {
        type: String,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

bolusSchema.plugin(timestamps);

const Bolus = mongoose.model('Bolus', bolusSchema);

module.exports = Bolus;
