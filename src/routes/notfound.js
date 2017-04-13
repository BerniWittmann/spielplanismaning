module.exports = function () {
    const logger = require('winston').loggers.get('api');
    const express = require('express');
    const router = express.Router();

    const messages = require('./messages/messages.js')();

    function getPath(req) {
        if (req.originalUrl) {
            return req.originalUrl;
        }
        if (req.baseUrl) {
            return req.baseUrl;
        }
        if (req._parsedOriginalUrl) {
            return req._parsedOriginalUrl.path;
        }
        return '/';
    }

    function handleNotFound(req, res) {
        logger.warn('%s %s Not Found', req.method, getPath(req));
        return messages.ErrorNotFound(res);
    }

    router.get('/', handleNotFound);

    router.post('/', handleNotFound);

    router.put('/', handleNotFound);

    router.delete('/', handleNotFound);

    return router;
};