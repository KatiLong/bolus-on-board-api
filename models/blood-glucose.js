"use strict";

const mongoose = require('mongoose');

const bloodGulcoseSchema = new mongoose.Schema({
    bloodGlucose: {
        type: Number,
        required: false
    },
    inputTime: {
        type: String,
        required: false
    },
    bolusAmount: {
        type: Number,
        required: false
    }
});

const bloodGlucose = mongoose.model('Blood Glucose', bloodGulcoseSchema);

module.exports = bloodGlucose;
