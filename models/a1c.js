"use strict";

const mongoose = require('mongoose');
var timestamps = require('mongoose-timestamp');

const a1cSchema = new mongoose.Schema({
    a1cNumber: {
        type: Number,
        required: false
    },
    a1cDate: {
        type: Date,
        required: false
    },
    loggedInUsername: {
        type: String,
        required: false
    }
});

a1cSchema.plugin(timestamps);
const A1c = mongoose.model('A1c', a1cSchema);

module.exports = A1c;
