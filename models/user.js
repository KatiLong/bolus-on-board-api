"use strict";

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: false
    },
    username: {
        type: String,
        required: false
    },
    password: {
        type: String,
        required: false
    },
    settings: {
        lowBg: {
            type: Number,
            required: false
        },
        incrementInsulin: {
            type: Number,
            required: false
        },
        carbRatio: {
            type: Number,
            required: false
        },
        correction: {
            type: Number,
            required: false
        },
        targetBg: {
            type: Number,
            required: false
        },
        duration: {
            type: Number,
            required: false
        }
    },
    iob: {
        currentInsulinStack: [{
            entryAmount: {
                type: Number
            },
            currentInsulin: {
                type: Number
            },
            timeStart: {
                type: Number
            },
            timeRemaining:{
                type: Number
            }
        }]
    }
});

userSchema.methods.validatePassword = function (password, callback) {
    bcrypt.compare(password, this.password, (err, isValid) => {
        if (err) {
            callback(err);
            return;
        }
        callback(null, isValid);
    });
};

const User = mongoose.model('User', userSchema);

module.exports = User;
