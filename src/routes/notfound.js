module.exports = function () {
    const express = require('express');
    const router = express.Router();

    const messages = require('./messages/messages.js')();

    function handleNotFound(req, res) {
        return messages.ErrorNotFound(res);
    }

    router.get('/', handleNotFound);

    router.post('/', handleNotFound);

    router.put('/', handleNotFound);

    router.delete('/', handleNotFound);

    return router;
};