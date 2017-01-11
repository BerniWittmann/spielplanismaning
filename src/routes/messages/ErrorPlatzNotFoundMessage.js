module.exports = function (err) {
    /**
     * @apiDefine ErrorPlatzNotFoundMessage
     *
     * @apiError (PlatzNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (PlatzNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (PlatzNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_PLATZ_NOT_FOUND'
     * @apiError (PlatzNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response PlatzNotFound:
     *     HTTP/1.1 404 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Platz nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_PLATZ_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Platz nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_PLATZ_NOT_FOUND',
        ERROR: err
    };
};