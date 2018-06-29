// Models
const User = require('./models/user');
const Settings = require('./models/settings');
const Bolus = require('./models/bolus');
const Basal = require('./models/basal');
const bloodGlucose = require('./models/blood-glucose');
const A1c = require('./models/a1c');

const bodyParser = require('body-parser');
const config = require('./config');
const mongoose = require('mongoose');
const moment = require('moment');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const passport = require('passport');
const BasicStrategy = require('passport-http').BasicStrategy;
const express = require('express');
const app = express();
app.use(bodyParser.json());
app.use(cors());
app.use(express.static('public'));

mongoose.Promise = global.Promise;

// ---------------- RUN/CLOSE SERVER -----------------------------------------------------
let server = undefined;

function runServer(urlToUse) {
    return new Promise((resolve, reject) => {
        mongoose.connect(urlToUse, err => {
            if (err) {
                return reject(err);
            }
            server = app.listen(config.PORT, () => {
                console.log(`Listening on localhost:${config.PORT}`);
                resolve();
            }).on('error', err => {
                mongoose.disconnect();
                reject(err);
            });
        });
    });
}

if (require.main === module) {
    runServer(config.DATABASE_URL).catch(err => console.error(err));
}

function closeServer() {
    return mongoose.disconnect().then(() => new Promise((resolve, reject) => {
        console.log('Closing server');
        server.close(err => {
            if (err) {
                return reject(err);
            }
            resolve();
        });
    }));
}

// ---------------USER ENDPOINTS-------------------------------------
// POST -----------------------------------
// creating a new user
app.post('/users/create', (req, res) => {

    //take the name, username and the password from the ajax api call
    let name = req.body.name;
    let username = req.body.username;
    let password = req.body.password;

    //exclude extra spaces from the username and password
    username = username.trim();
    password = password.trim();

    User.findOne({username}, (err, items) => {
        if (items) {
            return res.status(409).json({
                message: "User with that username already exists!"
            });
        }
    })

    //create an encryption key
    bcrypt.genSalt(10, (err, salt) => {

        //if creating the key returns an error...
        if (err) {

            //display it
            return res.status(500).json({
                message: 'Internal server error'
            });
        }

        //using the encryption key above generate an encrypted pasword
        bcrypt.hash(password, salt, (err, hash) => {

            //if creating the ncrypted pasword returns an error..
            if (err) {

                //display it
                return res.status(500).json({
                    message: 'Internal server error'
                });
            }

            //using the mongoose DB schema, connect to the database and create the new user
            User.create({
                name,
                username,
                password: hash,
            }, (err, item) => {

                //if creating a new user in the DB returns an error..
                if (err) {
                    //display it
                    return res.status(500).json({
                        message: 'Internal Server Error'
                    });
                }
                //if creating a new user in the DB is succefull
                if (item) {

                    //display the new user
                    console.log(`User \`${username}\` created.`);
//                    return res.json(item);
//                    const requiredFields = ['insulinMetric', 'insulinIncrement', 'carbRatio', 'correctionFactor', 'targetBG', 'insulinOnBoard', 'loggedInUsername', 'userID'];
//                    for (let i = 0; i < requiredFields.length; i++) {
//                        const field = requiredFields[i];
//                        if (!(field in req.body)) {
//                            const message = `Missing \`${field}\` in request body`;
//                            return res.status(400).send(message);
//                        }
//                    }
                    Settings
                        .create({
                        insulinMetric: 'units',
                        insulinIncrement: 1,
                        carbRatio: 9,
                        correctionFactor: 34,
                        targetBG: 120,
                        insulinOnBoard: {amount: 0, timeLeft: 0},
                        loggedInUsername: item.username,
                        userID: item._id
                    })
                        .then(settings => res.status(201).json(settings))
                        .catch(err => {
                        console.error(err);
                        res.status(500).json({ error: 'Something went wrong' });
                    });
                }
            });
        });
    });
});

// signing in a user
app.post('/users/login', function (req, res) {

    //take the username and the password from the ajax api call
    const username = req.body.username;
    const password = req.body.password;

    //using the mongoose DB schema, connect to the database and the user with the same username as above
    User.findOne({
        username: username
    }, function (err, items) {

        //if the there is an error connecting to the DB
        if (err) {

            //display it
            return res.status(500).json({
                message: "Internal server error"
            });
        }
        // if there are no users with that username
        if (!items) {
            //display it
            return res.status(401).json({
                message: "Not found!"
            });
        }
        //if the username is found
        else {

            //try to validate the password
            items.validatePassword(password, function (err, isValid) {

                //if the connection to the DB to validate the password is not working
                if (err) {

                    //display error
                    console.log('Could not connect to the DB to validate the password.');
                }

                //if the password is not valid
                if (!isValid) {

                    //display error
                    return res.status(401).json({
                        message: "Password Invalid"
                    });
                }
                //if the password is valid
                else {
                    //return the logged in user
                    console.log(`User \`${username}\` logged in.`);
                    return res.json(items);
                }
            });
        };
    });
});

// creating User settings
app.post('/settings', (req, res) => {


})
// GET loggedIn User's settings
// accessing all of a user's entries
app.get('/settings/:user', (req, res) => {

    Settings
        .find()
        .then(function (settings) {
            let settingsOutput = settings.find( (setting) =>(setting.loggedInUsername == req.params.user));

            res.json({
                settingsOutput
            });
        })
        .catch(function (err) {
            console.error(err);
            res.status(500).json({
                message: 'Internal server error'
            });
    });
});
// POST Bolus Entry
app.post('/bolus', (req, res) => {
    const requiredFields = ['bolusCarbs', 'bolusUnits', 'insulinType', 'bolusTime', 'bolusDate', 'bolusAmount', 'loggedInUsername'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing required field - please fill out \`${field}\` in request body`;
            return res.status(400).send(message);
        }
    }
    Bolus
        .create({
            insulinType: req.body.insulinType,
            bloodGlucose: req.body.bloodGlucose,
            bolusUnits: req.body.bolusUnits,
            bolusCarbs: req.body.bolusCarbs,
            bolusDate: req.body.bolusDate,
            bolusTime: req.body.bolusTime,
            bolusAmount: req.body.bolusAmount,
            loggedInUsername: req.body.loggedInUsername
        })
        .then(settings => {
            res.status(201).json(settings)
        })
        .catch(err => {
        console.error(err);
        res.status(500).json({ error: 'Something went wrong' });
        });
})
// POST blood sugar
app.post('/blood-glucose', (req, res) => {
    const requiredFields = ['bloodGlucose', 'bgDate', 'bgTime', 'loggedInUsername'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing required field - please fill out \`${field}\` in request body`;
            return res.status(400).send(message);
        }
    }
    bloodGlucose
        .create({
            bloodGlucose: req.body.bloodGlucose,
            bgDate: req.body.bgDate,
            bgTime: req.body.bgTime,
            loggedInUsername: req.body.loggedInUsername
        })
        .then(settings => {
            res.status(201).json(settings)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
})
// POST Basal Entry
app.post('/basal', (req, res) => {
    console.log(req.body);
    const requiredFields = ['insulinType', 'insulinUnits', 'basalDate', 'basalTime', 'loggedInUsername'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing required field - please fill out \`${field}\` in request body`;
            return res.status(400).send(message);
        }
    }
    Basal
        .create({
            insulinType: req.body.insulinType,
            insulinUnits: req.body.insulinUnits,
            basalDate: req.body.basalDate,
            basalTime: req.body.basalTime,
            loggedInUsername: req.body.loggedInUsername
        })
        .then(settings => {
            res.status(201).json(settings)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
})
// POST A1c Entry
app.post('/a1c', (req, res) => {
    console.log(req.body);
    const requiredFields = ['a1cNumber', 'a1cDate', 'loggedInUsername'];
    for (let i = 0; i < requiredFields.length; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing required field - please fill out \`${field}\` in request body`;
            return res.status(400).send(message);
        }
    }
    A1c
        .create({
            a1cNumber: req.body.a1cNumber,
            a1cDate: req.body.a1cDate,
            loggedInUsername: req.body.loggedInUsername
        })
        .then(settings => {
            res.status(201).json(settings)
        })
        .catch(err => {
            console.error(err);
            res.status(500).json({ error: 'Something went wrong' });
        });
})

// PUT --------------------------------------
app.put('/settings/:id', (req, res) => {
    let toUpdate = {};

    let updateableFields = ['insulinMetric', 'insulinIncrement', 'carbRatio', 'correctionFactor', 'targetBG', 'insulinOnBoard'];
    updateableFields.forEach(function (field) {
        if (field in req.body) {
            toUpdate[field] = req.body[field];
        }
    });
    console.log(toUpdate);
    console.log(req.params);
    Settings
        .findByIdAndUpdate(req.params.id, {
            $set: toUpdate
        }).then(function (achievement) {
            return res.status(204).end();
        }).catch(function (err) {
            return res.status(500).json({
                message: 'Internal Server Error'
            });
        });
});

// MISC ------------------------------------------
// catch-all endpoint if client makes request to non-existent endpoint
app.use('*', (req, res) => {
    res.status(404).json({
        message: 'Not Found'
    });
});

exports.app = app;
exports.runServer = runServer;
exports.closeServer = closeServer;
