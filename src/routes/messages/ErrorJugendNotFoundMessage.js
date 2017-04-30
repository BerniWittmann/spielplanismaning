module.exports = function (err) {
    /**
     * @apiDefine ErrorJugendNotFoundMessage
     *
     * @apiError (JugendNotFound) {String} MESSAGE Error-Message: 'Turnier nicht gefunden'
     * @apiError (JugendNotFound) {Integer} STATUSCODE Status-Code: 404
     * @apiError (JugendNotFound) {String} MESSAGEKEY Key der Message: 'ERROR_TURNIER_NOT_FOUND'
     * @apiError (JugendNotFound) {Object} ERROR Error Object
     *
     * @apiErrorExample Error-Response JugendNotFound:
     *     HTTP/1.1 404 Not Found
     *     {
     *          "MESSAGE": "Turnier nicht gefunden",
     *          "STATUSCODE": 404,
     *          "MESSAGEKEY": "ERROR_TURNIER_NOT_FOUND",
     *          "ERROR": [ Object ]
     *     }
     */
    return {
        MESSAGE: 'Turnier nicht gefunden',
        STATUSCODE: 404,
        MESSAGEKEY: 'ERROR_TURNIER_NOT_FOUND',
        ERROR: err
    };
};