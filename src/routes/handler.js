var messages = require('./messages/messages.js')();
var _ = require('lodash');

function handleErrorAndResponse(err, res, data) {
    if (err) {
        return messages.Error(res, err);
    }

    return res.status(200).json(data);
}

function handleErrorAndMessage(err, res, message) {
    if (err) {
        return messages.Error(res, err);
    }

    return message(res);
}

function handleErrorAndSuccess(err, res) {
    return handleErrorAndMessage(err, res, messages.Success);
}

function handleErrorAndDeleted(err, res) {
    return handleErrorAndMessage(err, res, messages.Deleted);
}

function handleQueryResponse(err, data, res, searchById, notFoundError) {
    if(searchById && !data) {
        return notFoundError(res, err);
    }
    if (err) {
        return messages.Error(res, err);
    }

    return res.status(200).json(data);
}

module.exports = {
    handleErrorAndResponse: handleErrorAndResponse,
    handleErrorAndSuccess: handleErrorAndSuccess,
    handleErrorAndDeleted: handleErrorAndDeleted,
    handleErrorAndMessage: handleErrorAndMessage,
    handleQueryResponse: handleQueryResponse
};