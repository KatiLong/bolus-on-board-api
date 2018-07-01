"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

// discrimators

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
    loggedInUsername: {
        type: String,
        required: false
    }
});

const Basal = mongoose.model('Basal', basalSchema);

module.exports = Basal;
