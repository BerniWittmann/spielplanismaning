module.exports = function () {
    const logger = require('winston').loggers.get('api');
    const express = require('express');
    const router = express.Router();

    const messages = require('./messages/messages.js')();

    function handleNotFound(req, res) {
        logger.warn('%s %s Not Found', req.method, req._parsedOriginalUrl.path);
        return messages.ErrorNotFound(res);
    }

    router.get('/', handleNotFound);

    router.post('/', handleNotFound);

    router.put('/', handleNotFound);

    router.delete('/', handleNotFound);

    return router;
};