"use strict";

const mongoose = require('mongoose');
// const bcrypt = require('bcryptjs');

const a1cSchema = new mongoose.Schema({
    inputNumber: {
        type: Number,
        required: false
    },
    inputDate: {
        type: Date,
        required: false
    },
    inputTime: {
        type: Time,
        required: false
    },
});

const A1c = mongoose.model('A1c', a1cSchema);

module.exports = A1c;
