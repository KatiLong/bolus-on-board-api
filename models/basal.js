"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const basalSchema = new mongoose.Schema({
    insulinType: {
        type: String,
        required: false
    },
    insulinUnits: {
        type: Number,
        required: false
    },
    inputDate: {
        type: Date,
        required: false
    },
    inputTime: {
        type: String,
        required: false
    }
});

const Basal = mongoose.model('Basal', basalSchema);

module.exports = Basal;
