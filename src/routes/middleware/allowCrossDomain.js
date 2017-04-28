module.exports = function (req, res, next) {
    const _ = require('lodash');

    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    if (process.env.ALLOWED_ORIGINS === '*') {
        res.setHeader('Access-Control-Allow-Origin', '*');
        return next();
    }
    const allowedOrigins = process.env.ALLOWED_ORIGINS.split(',').map(function (single) {
        single = single.trim();
        return single.replace(/(^\w+:|^)\/\//, '');
    });

    if (_.includes(allowedOrigins, req.get('Host'))) {
        const origin = req.get('Origin') || (req.secure ? 'https://' : 'http://') + req.get('Host');
        res.setHeader('Access-Control-Allow-Origin', origin);
    }

    next();
};