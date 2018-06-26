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

const a1c = mongoose.model('A1c', a1cSchema);

module.exports = Entry;
