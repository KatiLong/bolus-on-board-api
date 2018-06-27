"use strict";

const mongoose = require('mongoose');

const bloodGlucoseSchema = new mongoose.Schema({
    bloodGlucose: {
        type: Number,
        required: false
    },
    bgDate: {
        type: Date,
        required: false
    },
    bgTime: {
        type: String,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

const bloodGlucose = mongoose.model('Blood Glucose', bloodGlucoseSchema);

module.exports = bloodGlucose;
