module.exports = function (req, res, next) {
    const _ = require('lodash');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.setHeader('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGINS);

    return next();
};