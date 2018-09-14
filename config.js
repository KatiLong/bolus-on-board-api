'use strict';

exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL ||
    'mongodb://Admin:AdminBolus8@ds217671.mlab.com:17671/bolus-on-board';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'mongodb://Admin:AdminBolus8@ds217671.mlab.com:17671/bolus-on-board';
exports.PORT = process.env.PORT || 8080;
exports.JWT_SECRET = process.env.JWT_SECRET || 'ffff';
exports.JWT_EXPIRY = process.env.JWT_EXPIRY || '7d';
