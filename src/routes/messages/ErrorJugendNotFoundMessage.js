module.exports = function (err) {
    /**
     * @apiDefine ErrorJugendNotFoundMessage
     *
     * @apiError (JugendNotFound) {String} MESSAGE Error-Message: 'Error'
     * @apiError (JugendNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (JugendNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_JUGEND_NOT_FOUND'
     * @apiError (JugendNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 404 INTERNAL SERVER ERROR
     *     {
     *          "MESSAGE": "Jugend nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_JUGEND_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Jugend nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_JUGEND_NOT_FOUND',
        ERROR: err
    };
};