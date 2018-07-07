"use strict";

const mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

const basalSchema = new mongoose.Schema({
    insulinType: {
        type: String,
        required: false
    },
    insulinUnits: {
        type: Number,
        required: false
    },
    basalDate: {
        type: Date,
        required: false
    },
    basalTime: {
        type: String,
        required: false
    },
    inputDateTime: {
        type: Number,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

basalSchema.plugin(timestamps);
const Basal = mongoose.model('Basal', basalSchema);

module.exports = Basal;
