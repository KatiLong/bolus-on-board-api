"use strict";

const mongoose = require('mongoose');

const bloodGulcoseSchema = new mongoose.Schema({
    bloodGlucose: {
        type: Number,
        required: false
    },
    inputTime: {
        type: Time,
        required: false
    },
    bolusAmount: {
        type: number,
        required: false
    }
});

const bloodGlucose = mongoose.model('Blood Glucose', bloodGulcoseSchema);

module.exports = bloodGlucose;
