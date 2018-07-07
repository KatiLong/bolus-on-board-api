"use strict";

const mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

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
    inputDateTime: {
        type: Number,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

bloodGlucoseSchema.plugin(timestamps);
const bloodGlucose = mongoose.model('Blood Glucose', bloodGlucoseSchema);

module.exports = bloodGlucose;
