exports.DATABASE_URL = process.env.DATABASE_URL || global.DATABASE_URL || 'mongodb://admin:admin@ds251849.mlab.com:51849/shakespeare-passport';
exports.TEST_DATABASE_URL = process.env.TEST_DATABASE_URL ||
    'mongodb://admin:admin@ds251849.mlab.com:51849/shakespeare-passport';
exports.PORT = process.env.PORT || 8080;
